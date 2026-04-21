"""
StrokeSense Flask Backend
=========================
REST API for brain stroke detection using a trained CNN model.

Endpoints:
    POST /predict - Accept an MRI/CT image file and return stroke prediction

Usage:
    python app.py
"""
import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import io

import requests



# ─── Configuration ────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=["https://deeplearning-project.vercel.app"]) # Enable CORS for React frontend

# Maximum upload size: 10MB
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}

# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'model.h5')

# Image preprocessing dimensions (must match training)
IMG_SIZE = (224, 224)

# ─── Lazy Model Loading ──────────────────────────────────────────────────────
_model = None

def download_model():
    url = "https://drive.google.com/file/d/1JL3sDJOqVCFqU7dL5whyunB4xil0vGs1/view?usp=sharing"
    if not os.path.exists(MODEL_PATH):
        print("Downloading model...")
        r = requests.get(url)
        with open(MODEL_PATH, "wb") as f:
            f.write(r.content)
            
def get_model():
    """
    Lazy-load the Keras model. This avoids loading the model at import time
    and ensures it's only loaded once.
    """
    download_model()
    global _model
    if _model is None:
        try:
            from tensorflow.keras.models import load_model
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(
                    f"Model file not found at {MODEL_PATH}. "
                    "Please train the model first using the training script."
                )
            _model = load_model(MODEL_PATH)
            print(f"✅ Model loaded successfully from {MODEL_PATH}")
        except ImportError:
            raise ImportError(
                "TensorFlow is not installed. Install it with: pip install tensorflow"
            )
    return _model



def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def preprocess_image(image_bytes):
    """
    Preprocess the uploaded image for model prediction:
    1. Open image from bytes
    2. Convert to RGB (in case of grayscale or RGBA)
    3. Resize to IMG_SIZE (256x256)
    4. Normalize pixel values to [0, 1]
    5. Add batch dimension
    
    Returns:
        numpy array of shape (1, 256, 256, 3) ready for prediction
    """
    # Open image from bytes
    image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB
    image = image.convert('RGB')
    
    # Resize to expected input size
    image = image.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    
    # Convert to numpy array and normalize
    img_array = np.array(image, dtype=np.float32) / 255.0
    
    # Add batch dimension: (256, 256, 3) -> (1, 256, 256, 3)
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array


# ─── API Routes ───────────────────────────────────────────────────────────────

@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    
    Accepts a multipart/form-data request with an image file.
    Returns JSON with prediction and confidence score.
    
    Request:
        - file: Image file (JPG, PNG, WebP, BMP)
    
    Response:
        {
            "prediction": "Stroke" or "Normal",
            "confidence": 0.95
        }
    
    Error Response:
        {
            "error": "Error message"
        }
    """
    # Validate that a file was sent
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded. Please select an image.'}), 400
    
    file = request.files['file']
    
    # Validate filename
    if file.filename == '':
        return jsonify({'error': 'No file selected. Please choose an image.'}), 400
    
    # Validate file type
    if not allowed_file(file.filename):
        return jsonify({
            'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400
    
    try:
        # Read and preprocess the image
        image_bytes = file.read()
        
        if len(image_bytes) == 0:
            return jsonify({'error': 'Empty file uploaded.'}), 400
        
        processed_image = preprocess_image(image_bytes)
        
        # Get model and make prediction
        model = get_model()
        prediction_prob = model.predict(processed_image, verbose=0)
        
        # Sigmoid output: > 0.5 = Stroke, <= 0.5 = Normal
        confidence = float(prediction_prob[0][0])
        
        if confidence > 0.5:
            label = 'Stroke'
            confidence_score = confidence
        else:
            label = 'Normal'
            confidence_score = 1.0 - confidence
        
        return jsonify({
            'prediction': label,
            'confidence': round(confidence_score, 4)
        })
    
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 500
    
    except ImportError as e:
        return jsonify({'error': str(e)}), 500
    
    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'error': 'An error occurred during prediction. Please try again with a valid brain scan image.'
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    model_exists = os.path.exists(MODEL_PATH)
    return jsonify({
        'status': 'healthy',
        'model_loaded': _model is not None,
        'model_file_exists': model_exists,
    })


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("🧠 StrokeSense Backend Starting...")
    print(f"📁 Model path: {MODEL_PATH}")
    print(f"📡 Server running at http://localhost:5000")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
