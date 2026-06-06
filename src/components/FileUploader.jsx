import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileArchive, FileUp, LoaderCircle, UploadCloud } from 'lucide-react';

export default function FileUploader({ onFileSelect, isLoading }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    const [file] = files ?? [];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleChange = (event) => {
    handleFiles(event.target.files);
  };

  return (
    <>
      <motion.div
        className={`dropzone ${isDragging ? 'is-dragging' : ''} ${isLoading ? 'is-loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="dropzone-visual">
          {isLoading ? <LoaderCircle className="spin" size={32} /> : <UploadCloud size={32} />}
        </div>
        <div>
          <h3>{isLoading ? 'Analyzing APK...' : 'Drop your APK here'}</h3>
          <p>Supports Android APK files up to 50MB. No upload leaves your device.</p>
        </div>

        <div className="dropzone-actions">
          <button type="button" className="primary-button" onClick={() => inputRef.current?.click()} disabled={isLoading}>
            <FileUp size={18} />
            Choose APK
          </button>
          <span className="file-hint">
            <FileArchive size={16} />
            `.apk` only
          </span>
        </div>
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept=".apk,application/vnd.android.package-archive"
        hidden
        onChange={handleChange}
      />
    </>
  );
}