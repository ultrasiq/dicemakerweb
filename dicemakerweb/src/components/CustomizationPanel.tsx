'use client';

import { useState } from 'react';
import { DiceType, DICE_CONFIGS } from '@/types/dice';
import TextInput from './TextInput';
import FileUpload from './FileUpload';

interface CustomizationPanelProps {
  diceType: DiceType;
  selectedFace: number;
  onFaceChange: (faceIndex: number) => void;
  onTextChange: (text: string) => void;
  onImageChange: (file: File | null) => void;
  onApply: () => void;
  onTest: () => void;
  customizationType: 'text' | 'image';
  setCustomizationType: (type: 'text' | 'image') => void;
  textValue: string;
  selectedImage: File | null;
  className?: string;
}

export default function CustomizationPanel({
  diceType,
  selectedFace,
  onFaceChange,
  onTextChange,
  onImageChange,
  onApply,
  onTest,
  customizationType,
  setCustomizationType,
  textValue,
  selectedImage,
  className = '',
}: CustomizationPanelProps) {
  const [textValidation, setTextValidation] = useState(true);
  const [imageValidation, setImageValidation] = useState(true);

  const diceConfig = DICE_CONFIGS[diceType];
  const faces = Array.from({ length: diceConfig.faces }, (_, i) => i);

  const handleTextChange = (text: string) => {
    onTextChange(text);
  };

  const handleImageChange = (file: File) => {
    onImageChange(file);
  };

  const handleImageValidationChange = (isValid: boolean) => {
    setImageValidation(isValid);
    if (!isValid) {
      onImageChange(null);
    }
  };

  const handleTextValidationChange = (isValid: boolean) => {
    setTextValidation(isValid);
    if (!isValid) {
      onTextChange('');
    }
  };

  const isApplyDisabled = () => {
    if (customizationType === 'text') {
      return !textValidation || !textValue.trim();
    } else {
      return !imageValidation || !selectedImage;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Face Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Face to Customize
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {faces.map((faceIndex) => (
            <button
              key={faceIndex}
              onClick={() => onFaceChange(faceIndex)}
              className={`p-3 text-sm font-medium rounded-md border transition-colors ${
                selectedFace === faceIndex
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Face {faceIndex + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Customization Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Customization Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="text"
              checked={customizationType === 'text'}
              onChange={(e) => setCustomizationType(e.target.value as 'text' | 'image')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Text</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="image"
              checked={customizationType === 'image'}
              onChange={(e) => setCustomizationType(e.target.value as 'text' | 'image')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Image</span>
          </label>
        </div>
      </div>

      {/* Customization Input */}
      <div>
        {customizationType === 'text' ? (
          <TextInput
            value={textValue}
            onChange={handleTextChange}
            onValidationChange={handleTextValidationChange}
          />
        ) : (
          <FileUpload
            onFileSelect={handleImageChange}
            onValidationChange={handleImageValidationChange}
          />
        )}
      </div>

      {/* Apply Button */}
      <div className="space-y-2">
        <button
          onClick={onApply}
          disabled={isApplyDisabled()}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isApplyDisabled()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Apply to Face {selectedFace + 1}
        </button>
        
        {/* Test Button for debugging */}
        {diceType === 'D6' && (
          <button
            onClick={onTest}
            className="w-full py-2 px-4 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Test Displacement (Debug)
          </button>
        )}
      </div>

      {/* Current Selection Summary */}
      {selectedFace >= 0 && (
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Current Selection:
          </div>
          <div className="text-sm text-gray-600">
            <div>Dice: {diceType} ({diceConfig.name})</div>
            <div>Face: {selectedFace + 1}</div>
            <div>Type: {customizationType}</div>
            {customizationType === 'text' && textValue && (
              <div>Text: &ldquo;{textValue}&rdquo;</div>
            )}
            {customizationType === 'image' && selectedImage && (
              <div>Image: {selectedImage.name}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 