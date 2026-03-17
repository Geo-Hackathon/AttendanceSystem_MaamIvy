import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { createAttendance } from '../firebase/firestore';
import { uploadFile } from '../firebase/firestore';

const CameraModal = ({ isOpen, onClose, onCapture, facultyId, scheduleId }) => {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'environment' // Use back camera on mobile
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!capturedImage) return;

    setUploading(true);
    setError('');

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create file
      const file = new File([blob], 'attendance.jpg', { type: 'image/jpeg' });
      
      // Upload to Firebase Storage
      const timestamp = Date.now();
      const path = `attendance/${facultyId}/${timestamp}.jpg`;
      const uploadResult = await uploadFile(file, path);
      
      if (uploadResult.success) {
        // Create attendance record
        const attendanceResult = await createAttendance(
          facultyId,
          uploadResult.url,
          scheduleId
        );
        
        if (attendanceResult.success) {
          onCapture(uploadResult.url);
          onClose();
          setCapturedImage(null);
        } else {
          setError('Failed to create attendance record');
        }
      } else {
        setError('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Error uploading photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mark Attendance - Take Photo
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={uploading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!capturedImage ? (
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full rounded-lg"
                />
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={capture}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Capture Photo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-lg"
                />
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={retake}
                    disabled={uploading}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    Retake
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Submit Attendance</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600 text-center">
            Please ensure your face is clearly visible and well-lit.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
