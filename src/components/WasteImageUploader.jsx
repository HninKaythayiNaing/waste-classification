import { useState, useCallback, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2 } from 'lucide-react';

export default function WasteImageUploader({ onImageUploaded, uploading, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      onImageUploaded(null, 'Please upload a JPG or PNG image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onImageUploaded(null, 'Image must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    onImageUploaded(file);
  }, [onImageUploaded]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile, disabled, uploading]);

  const handleChange = useCallback((e) => {
    const file = e.target.files[0];
    handleFile(file);
  }, [handleFile]);

  const clearImage = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    onImageUploaded(null);
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group">
          <img src={preview} alt="Waste preview" className="w-full max-h-80 object-contain" />
          {!uploading && !disabled && (
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <div className="flex items-center gap-2 text-stone-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Analyzing image…</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-stone-300 bg-stone-50 hover:border-emerald-300 hover:bg-emerald-50/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleChange}
            className="hidden"
            disabled={disabled || uploading}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <UploadCloud className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700">
                Drop a waste image here, or <span className="text-emerald-600">browse</span>
              </p>
              <p className="text-xs text-stone-400 mt-1">JPG or PNG · Max 10MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}