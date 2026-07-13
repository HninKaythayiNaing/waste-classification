import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

export default function CameraCapture({ onCapture, disabled }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActive(true);
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopStream();
      setActive(false);
      onCapture(file);
    }, 'image/jpeg', 0.92);
  };

  const cancelCamera = () => {
    stopStream();
    setActive(false);
  };

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  if (!active) {
    return (
      <div>
        <button
          onClick={startCamera}
          disabled={disabled}
          className="w-full flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:border-emerald-300 hover:bg-emerald-50/50 p-10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Camera className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-stone-700">Tap to open camera</p>
        </button>
        {error && (
          <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-80 object-contain" />
      <button
        onClick={cancelCamera}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="absolute bottom-3 inset-x-0 flex justify-center">
        <button
          onClick={capturePhoto}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-emerald-500 hover:scale-105 transition-transform"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-500" />
        </button>
      </div>
    </div>
  );
}