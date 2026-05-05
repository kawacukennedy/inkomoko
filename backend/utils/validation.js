'use strict';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/\s+/g, '');
}

function validateEmail(email) {
  if (!email) return 'Email is required';
  const clean = sanitize(email);
  if (!EMAIL_REGEX.test(clean)) return 'Invalid email format';
  if (clean.length > 255) return 'Email is too long';
  return null;
}

function validatePhone(phone) {
  if (!phone) return 'Phone is required';
  const clean = sanitize(phone);
  if (!PHONE_REGEX.test(clean)) return 'Invalid phone format';
  return null;
}

function validateIdentifier(identifier) {
  if (!identifier) return 'Email or phone is required';
  const clean = sanitize(identifier);
  if (clean.includes('@')) {
    return validateEmail(clean);
  }
  return validatePhone(clean);
}

function validateName(name) {
  if (!name) return 'Name is required';
  const clean = sanitize(name);
  if (clean.length < NAME_MIN_LENGTH) return `Name must be at least ${NAME_MIN_LENGTH} characters`;
  if (clean.length > NAME_MAX_LENGTH) return `Name must be under ${NAME_MAX_LENGTH} characters`;
  return null;
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (password.length > PASSWORD_MAX_LENGTH) return `Password must be under ${PASSWORD_MAX_LENGTH} characters`;
  return null;
}

function validateOtpCode(code) {
  if (!code) return 'Verification code is required';
  const clean = sanitize(code);
  if (!/^\d{6}$/.test(clean)) return 'Code must be 6 digits';
  return null;
}

function validateRole(role) {
  if (!role) return 'Role is required';
  if (!['elder', 'youth'].includes(role)) return 'Role must be elder or youth';
  return null;
}

function getIdentifierType(identifier) {
  return identifier.includes('@') ? 'email' : 'phone';
}

module.exports = {
  sanitize,
  validateEmail,
  validatePhone,
  validateIdentifier,
  validateName,
  validatePassword,
  validateOtpCode,
  validateRole,
  getIdentifierType,
};
