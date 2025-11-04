
import React, { useCallback } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onUpload: (files: FileList) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onUpload(event.target.files);
    }
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-cyan-400', 'bg-white/20');
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onUpload(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  }, [onUpload]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-cyan-400', 'bg-white/20');
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-cyan-400', 'bg-white/20');
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center p-8">
      <div 
        className="border-2 border-dashed border-white/30 rounded-2xl p-10 cursor-pointer transition-all duration-300"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <UploadIcon className="mx-auto h-16 w-16 text-white/50" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Upload or Drop Photos</h2>
        <p className="mt-2 text-white/60">Drag and drop your images here or click to select files.</p>
        <p className="mt-1 text-xs text-white/40">Supports JPG, PNG, WEBP</p>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageUploader;
