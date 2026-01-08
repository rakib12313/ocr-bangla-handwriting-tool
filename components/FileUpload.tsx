import React, { useCallback, useState } from 'react';
import { Upload, FileImage, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  if (selectedFile) {
    const previewUrl = URL.createObjectURL(selectedFile);
    
    return (
      <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="w-full h-full object-contain"
        />
        <button 
          onClick={onClear}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all text-slate-700"
          aria-label="Remove image"
        >
          <X size={20} />
        </button>
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-900 truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
        isDragging 
          ? 'border-brand-500 bg-brand-50' 
          : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="p-6 text-center space-y-4">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
          <Upload size={32} />
        </div>
        <div>
          <p className="text-lg font-medium text-slate-900">
            Click or drag image to upload
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Supports PNG, JPG, WEBP (Max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};
