"""
StrokeSense - CNN Model Training Script
========================================
Trains a Convolutional Neural Network (CNN) to classify brain MRI/CT scans
as either "Stroke" or "Normal".

Dataset Structure Required:
    dataset/
    ├── Stroke/
    │   ├── img001.jpg
    │   ├── img002.jpg
    │   └── ...
    └── Normal/
        ├── img001.jpg
        ├── img002.jpg
        └── ...

Architecture:
    - Conv2D (32 filters, 3x3, relu) + MaxPooling + Dropout(0.25)
    - Flatten
    - Dense (256, relu) + Dropout(0.5)
    - Dense (1, sigmoid)

Usage:
    python train_model.py --dataset_path ./dataset --epochs 25 --batch_size 32

Output:
    - backend/model/model.h5   (trained model)
    - model_training/plots/     (accuracy & loss charts)
"""

import os
import sys
import argparse
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for saving plots
import matplotlib.pyplot as plt

# ─── Argument Parser ──────────────────────────────────────────────────────────
def parse_args():
    parser = argparse.ArgumentParser(description='Train StrokeSense CNN Model')
    parser.add_argument(
        '--dataset_path',
        type=str,
        default='./dataset',
        help='Path to dataset directory with Stroke/ and Normal/ subdirectories'
    )
    parser.add_argument('--epochs', type=int, default=25, help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=32, help='Training batch size')
    parser.add_argument('--img_size', type=int, default=256, help='Image resize dimension')
    parser.add_argument(
        '--output_model',
        type=str,
        default=os.path.join('..', 'backend', 'model', 'model.h5'),
        help='Output path for the trained model'
    )
    return parser.parse_args()


def main():
    args = parse_args()
    
    # Import TensorFlow here to show helpful error early
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import (
            Conv2D, MaxPooling2D, Flatten, Dense, Dropout
        )
        from tensorflow.keras.preprocessing.image import ImageDataGenerator
        from tensorflow.keras.callbacks import (
            EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
        )
        print(f"✅ TensorFlow version: {tf.__version__}")
    except ImportError:
        print("❌ TensorFlow is not installed. Install it with:")
        print("   pip install tensorflow")
        sys.exit(1)
    
    # ─── Configuration ────────────────────────────────────────────────────────
    IMG_SIZE = (args.img_size, args.img_size)
    BATCH_SIZE = args.batch_size
    EPOCHS = args.epochs
    DATASET_PATH = args.dataset_path
    OUTPUT_MODEL = args.output_model
    PLOTS_DIR = os.path.join(os.path.dirname(__file__), 'plots')
    
    print(f"\n{'='*60}")
    print(f"🧠 StrokeSense Model Training")
    print(f"{'='*60}")
    print(f"📂 Dataset:      {DATASET_PATH}")
    print(f"📐 Image Size:   {IMG_SIZE}")
    print(f"📦 Batch Size:   {BATCH_SIZE}")
    print(f"🔄 Epochs:       {EPOCHS}")
    print(f"💾 Output Model: {OUTPUT_MODEL}")
    print(f"{'='*60}\n")
    
    # ─── Validate Dataset ─────────────────────────────────────────────────────
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Dataset directory not found: {DATASET_PATH}")
        print("\nExpected directory structure:")
        print("  dataset/")
        print("  ├── Stroke/")
        print("  │   ├── img001.jpg")
        print("  │   └── ...")
        print("  └── Normal/")
        print("      ├── img001.jpg")
        print("      └── ...")
        print("\n📥 You can download brain MRI/CT datasets from:")
        print("   - Kaggle: https://www.kaggle.com/datasets")
        print("   - Search: 'brain stroke MRI dataset'")
        sys.exit(1)
    
    # Count images
    classes = sorted(os.listdir(DATASET_PATH))
    print(f"📊 Classes found: {classes}")
    for cls in classes:
        cls_path = os.path.join(DATASET_PATH, cls)
        if os.path.isdir(cls_path):
            count = len([f for f in os.listdir(cls_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.webp'))])
            print(f"   {cls}: {count} images")
    
    # ─── Data Augmentation & Loading ──────────────────────────────────────────
    print("\n📦 Setting up data generators...")
    
    # Training data generator with augmentation
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,           # Normalize to [0, 1]
        rotation_range=20,              # Random rotation (±20°)
        width_shift_range=0.1,          # Random horizontal shift
        height_shift_range=0.1,         # Random vertical shift
        shear_range=0.1,                # Shear transformation
        zoom_range=0.15,                # Random zoom
        horizontal_flip=True,           # Random horizontal flip
        fill_mode='nearest',            # Fill mode for augmentation
        validation_split=0.2857         # ~20% of 70% for validation (20% of total)
    )
    
    # Test data generator (no augmentation, only rescale)
    test_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0
    )
    
    # We'll split as: 70% train, 20% validation, 10% test
    # Using validation_split in ImageDataGenerator for train/val split
    # For test, we'll separate manually or use a portion of validation
    
    print("\n📂 Loading training data...")
    train_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',            # Binary: Stroke vs Normal
        subset='training',              # Training portion (70% of data)
        shuffle=True,
        seed=42
    )
    
    print("\n📂 Loading validation data...")
    val_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        subset='validation',            # Validation portion (20% + 10% of data)
        shuffle=False,
        seed=42
    )
    
    # Print class mapping
    print(f"\n🏷️  Class mapping: {train_generator.class_indices}")
    print(f"   Training samples:   {train_generator.samples}")
    print(f"   Validation samples: {val_generator.samples}")
    
    # ─── Build CNN Model ──────────────────────────────────────────────────────
    print("\n🏗️  Building CNN model...")
    
    model = Sequential([
        # Convolutional Layer: 32 filters, 3x3 kernel, ReLU activation
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)),
        
        # Max Pooling: Reduce spatial dimensions by 2x
        MaxPooling2D(pool_size=(2, 2)),
        
        # Dropout: Prevent overfitting (25%)
        Dropout(0.25),
        
        # Flatten: Convert 2D feature maps to 1D vector
        Flatten(),
        
        # Dense Layer: 256 neurons with ReLU
        Dense(256, activation='relu'),
        
        # Dropout: Stronger regularization (50%)
        Dropout(0.5),
        
        # Output Layer: 1 neuron with sigmoid (binary classification)
        Dense(1, activation='sigmoid')
    ])
    
    # ─── Compile Model ────────────────────────────────────────────────────────
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    # Print model summary
    print("\n📋 Model Summary:")
    model.summary()
    
    # ─── Callbacks ────────────────────────────────────────────────────────────
    # Create output directory for model
    os.makedirs(os.path.dirname(OUTPUT_MODEL), exist_ok=True)
    os.makedirs(PLOTS_DIR, exist_ok=True)
    
    callbacks = [
        # Save best model based on validation accuracy
        ModelCheckpoint(
            OUTPUT_MODEL,
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        
        # Stop training if no improvement for 5 epochs
        EarlyStopping(
            monitor='val_accuracy',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate when validation loss plateaus
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    # ─── Train Model ─────────────────────────────────────────────────────────
    print(f"\n🚀 Training for {EPOCHS} epochs...\n")
    
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=val_generator,
        callbacks=callbacks,
        verbose=1
    )
    
    # ─── Evaluate Model ───────────────────────────────────────────────────────
    print("\n📊 Evaluating model on validation set...")
    val_loss, val_accuracy = model.evaluate(val_generator, verbose=0)
    print(f"   Validation Loss:     {val_loss:.4f}")
    print(f"   Validation Accuracy: {val_accuracy:.4f} ({val_accuracy*100:.2f}%)")
    
    # ─── Save Training Plots ──────────────────────────────────────────────────
    print(f"\n📈 Saving training plots to {PLOTS_DIR}/...")
    
    # Accuracy Plot
    plt.figure(figsize=(10, 5))
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Training Accuracy', linewidth=2)
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy', linewidth=2)
    plt.title('Model Accuracy', fontsize=14, fontweight='bold')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend(loc='lower right')
    plt.grid(True, alpha=0.3)
    
    # Loss Plot
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Training Loss', linewidth=2)
    plt.plot(history.history['val_loss'], label='Validation Loss', linewidth=2)
    plt.title('Model Loss', fontsize=14, fontweight='bold')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend(loc='upper right')
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, 'training_history.png'), dpi=150)
    plt.close()
    
    print(f"\n✅ Training complete!")
    print(f"💾 Model saved to: {OUTPUT_MODEL}")
    print(f"📈 Plots saved to: {PLOTS_DIR}/training_history.png")
    print(f"\n{'='*60}")
    print(f"🎉 You can now start the backend server:")
    print(f"   cd backend && python app.py")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
