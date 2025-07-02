'use client';

import { useState, useEffect } from 'react';
import { validateTextInput, VALIDATION_RULES } from '@/lib/validation';
import { FontOption, FONT_OPTIONS } from '@/types/dice';

interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

export default function TextInput({
  value,
  onChange,
  onValidationChange,
  className = '',
}: TextInputProps) {
  const [font, setFont] = useState<FontOption>('Arial');
  const [fontSize, setFontSize] = useState(48);
  const [validation, setValidation] = useState(validateTextInput(value));

  useEffect(() => {
    const newValidation = validateTextInput(value);
    setValidation(newValidation);
    onValidationChange?.(newValidation.isValid);
  }, [value, onValidationChange]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value.toUpperCase();
    if (newText.length <= VALIDATION_RULES.TEXT_MAX_LENGTH) {
      onChange(newText);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text (max {VALIDATION_RULES.TEXT_MAX_LENGTH} characters)
        </label>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleTextChange}
            maxLength={VALIDATION_RULES.TEXT_MAX_LENGTH}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validation.isValid
                ? 'border-gray-300 focus:border-blue-500'
                : 'border-red-300 focus:border-red-500'
            }`}
            placeholder="Enter text..."
          />
          <div className="absolute right-2 top-2 text-xs text-gray-500">
            {value.length}/{VALIDATION_RULES.TEXT_MAX_LENGTH}
          </div>
        </div>
        {!validation.isValid && (
          <div className="mt-1 text-sm text-red-600">
            {validation.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font
        </label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value as FontOption)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        >
          {FONT_OPTIONS.map((fontOption) => (
            <option key={fontOption} value={fontOption}>
              {fontOption}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="24"
          max="72"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {value && (
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
          <div
            className="text-center p-4 bg-white border rounded"
            style={{
              fontFamily: font,
              fontSize: `${fontSize}px`,
            }}
          >
            {value || 'Preview Text'}
          </div>
        </div>
      )}
    </div>
  );
} 