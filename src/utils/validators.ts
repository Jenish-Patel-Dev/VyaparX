/**
 * Centralized Form Validation Helpers for VyaparX
 */

export const validateRequired = (value: string | undefined | null, fieldLabel: string): string => {
  if (!value || !value.trim()) {
    return `${fieldLabel} is required`;
  }
  return '';
};

export const validatePhone = (phone: string | undefined | null, fieldLabel = 'Contact number', required = true): string => {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return required ? `${fieldLabel} is required` : '';
  }
  // Strip common prefixes or separators for digit check
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 10) {
    return `${fieldLabel} must be exactly 10 digits`;
  }
  return '';
};

export const validateEmail = (email: string | undefined | null, required = false): string => {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return required ? 'Email is required' : '';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address (e.g. name@example.com)';
  }
  return '';
};

export const validatePincode = (pincode: string | undefined | null, required = true): string => {
  const trimmed = (pincode || '').trim();
  if (!trimmed) {
    return required ? 'Pin Code is required' : '';
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 6) {
    return 'Pin Code must be exactly 6 digits';
  }
  return '';
};

export const validatePan = (pan: string | undefined | null, required = false): string => {
  const trimmed = (pan || '').trim().toUpperCase();
  if (!trimmed) {
    return required ? 'PAN Number is required' : '';
  }
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(trimmed)) {
    return 'PAN must be 10 characters (e.g. ABCDE1234F)';
  }
  return '';
};

export const validateGst = (gst: string | undefined | null, required = false): string => {
  const trimmed = (gst || '').trim().toUpperCase();
  if (!trimmed) {
    return required ? 'GSTIN is required' : '';
  }
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(trimmed)) {
    return 'GSTIN must be a valid 15-character format (e.g. 24ABCDE1234F1Z5)';
  }
  return '';
};

export const validateIfsc = (ifsc: string | undefined | null, required = false): string => {
  const trimmed = (ifsc || '').trim().toUpperCase();
  if (!trimmed) {
    return required ? 'IFSC Code is required' : '';
  }
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(trimmed)) {
    return 'IFSC code must be 11 characters (e.g. SBIN0001234)';
  }
  return '';
};

export const validatePositiveNumber = (
  value: string | number | undefined | null,
  fieldLabel: string,
  allowZero = false
): string => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldLabel} is required`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldLabel} must be a valid number`;
  }
  if (allowZero ? num < 0 : num <= 0) {
    return allowZero ? `${fieldLabel} cannot be negative` : `${fieldLabel} must be greater than 0`;
  }
  return '';
};

export const validatePin = (newPin: string, confirmPin?: string): string => {
  const trimmed = (newPin || '').trim();
  if (!trimmed) {
    return 'PIN is required';
  }
  if (!/^\d{4}$/.test(trimmed)) {
    return 'PIN must be exactly 4 digits';
  }
  if (confirmPin !== undefined && confirmPin !== trimmed) {
    return 'Confirm PIN does not match';
  }
  return '';
};

/**
 * Prevents non-numeric keystrokes on numeric inputs.
 * Allows digits, Backspace, Tab, Enter, Delete, Arrow keys, Ctrl/Cmd shortcuts, and optionally single decimal dot.
 */
export const preventNonNumericInput = (
  e: React.KeyboardEvent<HTMLInputElement>,
  allowDecimal = true
): void => {
  if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
    return;
  }
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
    return;
  }
  if (allowDecimal && e.key === '.' && !e.currentTarget.value.includes('.')) {
    return;
  }
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

/**
 * Sanitizes input string to contain only digits and optional decimal point.
 */
export const sanitizeNumeric = (value: string, allowDecimal = true): string => {
  if (!allowDecimal) {
    return value.replace(/\D/g, '');
  }
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return cleaned;
};
