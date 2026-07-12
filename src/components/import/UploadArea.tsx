import React, { useState, useRef } from 'react';

interface UploadAreaProps {
  onFileSelect?: (file: File) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`w-full max-w-4xl aspect-video bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl canvas-shadow flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer ${
        isDragActive ? 'drag-active' : ''
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="video/*,audio/*"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center text-center max-w-sm p-gutter pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-primary-container/10 text-primary flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
          <span className="material-symbols-outlined text-4xl">video_file</span>
        </div>
        <h2 className="text-headline-lg font-headline-lg mb-2 text-on-surface">
          Ready to start?
        </h2>
        <p className="text-body-md font-body-md text-on-surface-variant">
          Drag and drop your video or audio file here, or click to browse.
        </p>
      </div>
    </div>
  );
};
