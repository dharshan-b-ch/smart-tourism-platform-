import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Link, RefreshCw, X, Check, Image as ImageIcon } from 'lucide-react';

const ImageCaptureUpload = ({ onImageReady, initialValue = '' }) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'file' | 'url'
  const [imagePreview, setImagePreview] = useState(initialValue);
  const [urlInput, setUrlInput] = useState(initialValue);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or camera unavailable. Please allow camera access or use File Upload.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to compressed jpeg base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImagePreview(dataUrl);
    stopCamera();
    onImageReady(dataUrl);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("File size exceeds 8MB. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setImagePreview(dataUrl);
      onImageReady(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (val) => {
    setUrlInput(val);
    setImagePreview(val);
    onImageReady(val);
  };

  const clearImage = () => {
    setImagePreview('');
    setUrlInput('');
    onImageReady('');
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Input Mode Selector Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl font-bold text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab('camera');
            if (!imagePreview) startCamera();
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'camera' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Camera className="w-4 h-4" /> Live Camera
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab('file');
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'file' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4" /> Local File Pick
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab('url');
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'url' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link className="w-4 h-4" /> Image URL
        </button>
      </div>

      {/* Captured / Selected Image Preview Box */}
      {imagePreview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-purple-300 shadow-md bg-black max-h-72 flex items-center justify-center group">
          <img src={imagePreview} alt="Selected Preview" className="max-h-72 w-full object-contain" />
          
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={clearImage}
              className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition"
              title="Discard & Retake Photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-green-400" /> Photo Selected & Ready
          </div>
        </div>
      ) : (
        <div>
          {/* TAB 1: LIVE CAMERA VIEW */}
          {activeTab === 'camera' && (
            <div className="bg-gray-900 text-white rounded-2xl overflow-hidden border border-gray-800 p-4 text-center space-y-3">
              {cameraError ? (
                <div className="p-6 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-xs">
                  <p className="font-bold mb-2">⚠️ {cameraError}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
                  </button>
                </div>
              ) : (
                <div className="relative bg-black rounded-xl overflow-hidden min-h-[220px] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-64 object-cover rounded-xl"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {!isCameraActive && (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="absolute bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl"
                    >
                      <Camera className="w-4 h-4" /> Start Device Camera
                    </button>
                  )}
                </div>
              )}

              {isCameraActive && (
                <button
                  type="button"
                  onClick={captureSnap}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg text-sm"
                >
                  <Camera className="w-5 h-5 animate-pulse" /> Snap Photo Now
                </button>
              )}
            </div>
          )}

          {/* TAB 2: LOCAL FILE PICK */}
          {activeTab === 'file' && (
            <div className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/50 p-6 rounded-2xl text-center space-y-3 transition">
              <ImageIcon className="w-10 h-10 text-purple-600 mx-auto" />
              <div>
                <p className="font-bold text-gray-800 text-sm">Click to select photo from your device</p>
                <p className="text-xs text-gray-500">Supports JPG, PNG, WEBP up to 8MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              />
            </div>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">Image Web Link (URL)</label>
              <input
                type="url"
                className="w-full p-3 border rounded-xl outline-none text-sm focus:ring-2 ring-purple-500"
                placeholder="https://images.unsplash.com/..."
                value={urlInput}
                onChange={(e) => handleUrlSubmit(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ImageCaptureUpload;
