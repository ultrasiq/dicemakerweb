export const VALIDATION_RULES = {
  TEXT_MAX_LENGTH: 2,
  FILE_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/svg+xml', 'image/png'],
} as const;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateTextInput(text: string): ValidationResult {
  const errors: string[] = [];

  if (text.length > VALIDATION_RULES.TEXT_MAX_LENGTH) {
    errors.push(`Text must be ${VALIDATION_RULES.TEXT_MAX_LENGTH} characters or less`);
  }

  if (text.length === 0) {
    errors.push('Text cannot be empty');
  }

  // Check for alphanumeric characters only
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(text)) {
    errors.push('Text can only contain letters and numbers');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateImageFile(file: File): ValidationResult {
  const errors: string[] = [];

  // Check file type
  const allowedTypes = VALIDATION_RULES.ALLOWED_IMAGE_TYPES as readonly string[];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only SVG and PNG files are allowed');
  }

  // Check file size
  if (file.size > VALIDATION_RULES.FILE_MAX_SIZE) {
    errors.push(`File size must be ${VALIDATION_RULES.FILE_MAX_SIZE / (1024 * 1024)}MB or less`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateDiceType(diceType: string): ValidationResult {
  const validTypes = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20'];
  
  return {
    isValid: validTypes.includes(diceType),
    errors: validTypes.includes(diceType) ? [] : ['Invalid dice type'],
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 