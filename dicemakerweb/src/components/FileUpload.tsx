'use client';

import { useState, useRef, useCallback } from 'react';
import { validateImageFile, VALIDATION_RULES } from '@/lib/validation';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  onValidationChange,
  className = '',
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: [],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = useCallback((file: File) => {
    const result = validateImageFile(file);
    setValidation(result);
    onValidationChange?.(result.isValid);

    if (result.isValid) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelect(file);
    }
  }, [onFileSelect, onValidationChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const allowedTypes = VALIDATION_RULES.ALLOWED_IMAGE_TYPES as readonly string[];
    const imageFile = files.find(file => 
      allowedTypes.includes(file.type)
    );

    if (imageFile) {
      handleFileValidation(imageFile);
    } else {
      setValidation({
        isValid: false,
        errors: ['Please select a valid SVG or PNG file'],
      });
      onValidationChange?.(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setPreviewUrl(null);
    setValidation({ isValid: true, errors: [] });
    onValidationChange?.(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Image (SVG or PNG, max {VALIDATION_RULES.FILE_MAX_SIZE / (1024 * 1024)}MB)
        </label>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : validation.isValid
              ? 'border-gray-300 hover:border-gray-400'
              : 'border-red-300 bg-red-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,.png,image/svg+xml,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!previewUrl ? (
            <div className="space-y-2">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </div>
              <div className="text-xs text-gray-500">
                SVG or PNG files only
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto max-h-32 max-w-full object-contain"
              />
              <div className="text-sm text-gray-600">
                Image uploaded successfully
              </div>
            </div>
          )}
        </div>

        {!validation.isValid && (
          <div className="mt-2 text-sm text-red-600">
            {validation.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        {previewUrl && (
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={clearFile}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove file
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 