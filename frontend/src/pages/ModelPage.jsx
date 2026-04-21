import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaImage, FaTimes, FaBrain } from 'react-icons/fa';
import axios from 'axios';
import PageTransition from '../components/PageTransition';

/**
 * ModelPage - Upload an MRI/CT image and get a stroke prediction.
 * Uses react-dropzone for drag & drop and Axios to call the Flask API.
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ModelPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle file drop / selection.
   * Validates file type and size before accepting.
   */
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');

    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (err.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a JPG, PNG, or WebP image.');
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] },
    maxSize: MAX_SIZE,
    multiple: false,
  });

  /** Remove selected image */
  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setError('');
  };

  /**
   * Send image to Flask backend for prediction.
   * On success, navigates to the Report page with results.
   */
  const handlePredict = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 second timeout
      });

      const { prediction, confidence } = response.data;

      // Navigate to report page with prediction data
      navigate('/report', {
        state: {
          prediction,
          confidence,
          imageUrl: preview,
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          timestamp: new Date().toLocaleString(),
        },
      });
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Server error. Please try again.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check if the backend server is running.');
      } else {
        setError('Unable to connect to the server. Make sure the backend is running on port 5000.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <section className="section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 800,
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}
            >
              <span className="gradient-text">Stroke Detection</span> Analysis
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
              Upload your brain MRI or CT scan below. Our AI model will analyze the image and provide
              a prediction in seconds.
            </p>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card"
            style={{ padding: '40px 32px' }}
          >
            <AnimatePresence mode="wait">
              {!preview ? (
                /* Dropzone */
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    {...getRootProps()}
                    id="image-dropzone"
                    className={`dropzone ${isDragActive ? 'active' : ''}`}
                    style={{
                      minHeight: '250px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                    }}
                  >
                    <input {...getInputProps()} />
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '20px',
                        background: 'rgba(108, 99, 255, 0.1)',
                        border: '1px solid rgba(108, 99, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FaCloudUploadAlt size={30} style={{ color: 'var(--color-primary-light)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>
                        {isDragActive ? 'Drop your image here...' : 'Drag & drop your brain scan'}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        or click to browse • JPG, PNG, WebP • Max 10MB
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Image Preview */
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
                    <img
                      src={preview}
                      alt="Brain scan preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '320px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        objectFit: 'contain',
                      }}
                    />
                    <button
                      onClick={removeImage}
                      id="remove-image-btn"
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--color-danger)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                      onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                      title="Remove image"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginBottom: '8px',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <FaImage size={14} />
                    <span>{file.name}</span>
                    <span>•</span>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  id="error-message"
                  style={{
                    marginTop: '20px',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 77, 106, 0.1)',
                    border: '1px solid rgba(255, 77, 106, 0.2)',
                    color: 'var(--color-danger)',
                    fontSize: '0.95rem',
                    textAlign: 'center',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Predict Button */}
            <div style={{ marginTop: '28px', textAlign: 'center' }}>
              <button
                id="predict-btn"
                className="btn-primary"
                onClick={handlePredict}
                disabled={!file || loading}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '16px 32px',
                  fontSize: '1.05rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  opacity: !file || loading ? 0.5 : 1,
                  cursor: !file || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FaBrain size={18} />
                    Analyze Scan
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              marginTop: '32px',
              padding: '20px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(108, 99, 255, 0.04)',
              border: '1px solid rgba(108, 99, 255, 0.1)',
            }}
          >
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.7, textAlign: 'center' }}>
              💡 <strong style={{ color: 'var(--color-text)' }}>Tip:</strong> For best results, upload
              high-quality MRI or CT brain scans. The model works best with standard axial view images.
              This tool is for educational purposes and should not replace professional medical diagnosis.
            </p>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default ModelPage;
