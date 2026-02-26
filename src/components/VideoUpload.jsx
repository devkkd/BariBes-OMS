'use client';

import { useState } from 'react';
import { Upload, X, Video, Loader2, Play } from 'lucide-react';

export default function VideoUpload({ 
  onUploadComplete, 
  label = 'Upload Video Review',
  existingVideo = ''
}) {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(existingVideo);
  const [error, setError] = useState('');
  const [inputKey, setInputKey] = useState(Date.now());

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only MP4, WebM, OGG, and MOV videos are allowed');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('Video size must be less than 50MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('files', file);

      // Upload to API
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const uploadedUrl = data.urls[0];
        setVideoUrl(uploadedUrl);
        onUploadComplete(uploadedUrl);
        setInputKey(Date.now()); // Reset input
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      setError('Failed to upload video');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoUrl('');
    onUploadComplete('');
    setInputKey(Date.now());
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {!videoUrl ? (
        // Upload Button
        <div className="relative">
          <input
            key={inputKey}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className={`flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer transition-all ${
              uploading 
                ? 'bg-gray-50 cursor-not-allowed' 
                : 'hover:border-[#975a20] hover:bg-[#975a20]/5'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-[#975a20] animate-spin" />
                <span className="text-sm text-gray-600">Uploading video...</span>
              </>
            ) : (
              <>
                <Video className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <span className="text-sm text-gray-600 block">Click to upload video review</span>
                  <span className="text-xs text-gray-500">MP4, WebM, OGG, MOV (max 50MB)</span>
                </div>
              </>
            )}
          </label>
        </div>
      ) : (
        // Video Preview
        <div className="relative group">
          <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-black">
            <video
              src={videoUrl}
              controls
              className="w-full max-h-64 object-contain"
              onError={(e) => {
                console.error('Video load error:', e);
                setError('Failed to load video preview');
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <button
            type="button"
            onClick={removeVideo}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Optional: Upload customer video review (max 50MB)
      </p>
    </div>
  );
}
