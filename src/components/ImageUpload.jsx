'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ImageUpload({ 
  onUploadComplete, 
  multiple = false, 
  label = 'Upload Images',
  existingImages = []
}) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState(existingImages);
  const [error, setError] = useState('');
  const [inputKey, setInputKey] = useState(Date.now());

  useEffect(() => {
    setPreviews(existingImages);
  }, [existingImages]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (!files.length) return;

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // Upload to API
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const newUrls = data.urls;
        const updatedPreviews = multiple ? [...previews, ...newUrls] : newUrls;
        setPreviews(updatedPreviews);
        onUploadComplete(multiple ? updatedPreviews : newUrls[0]);
        setInputKey(Date.now()); // Reset input
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      setError('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onUploadComplete(multiple ? newPreviews : '');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Upload Button */}
      <div className="relative">
        <input
          key={inputKey}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id={`image-upload-${label.replace(/\s+/g, '-')}`}
        />
        <label
          htmlFor={`image-upload-${label.replace(/\s+/g, '-')}`}
          className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all ${
            uploading 
              ? 'bg-gray-50 cursor-not-allowed' 
              : 'hover:border-[#975a20] hover:bg-[#975a20]/5'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-[#975a20] animate-spin" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload {multiple ? 'images' : 'image'}
              </span>
            </>
          )}
        </label>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className={`grid ${multiple ? 'grid-cols-3' : 'grid-cols-1'} gap-3`}>
          {previews.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, WebP
      </p>
    </div>
  );
}
