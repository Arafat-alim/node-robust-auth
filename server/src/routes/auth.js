import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  requestMagicLink,
  verifyMagicLink,
  requestEmailVerification,
  verifyEmail,
  requestPhoneOTP,
  verifyPhoneOTP,
  setup2FA,
  verify2FA,
  disable2FA,
  generateBackupCodes
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateMagicLinkRequest,
  validatePhoneNumber,
  validateOTP,
  validate2FA
} from '../middleware/validation.js';
import {
  strictRateLimiter,
  loginRateLimiter,
  otpRateLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', loginRateLimiter, validateLogin, login);
router.post('/refresh-token', refreshToken);

// Password reset
router.post('/password-reset/request', strictRateLimiter, validatePasswordResetRequest, requestPasswordReset);
router.post('/password-reset/verify', strictRateLimiter, validatePasswordReset, resetPassword);

// Magic link authentication
router.post('/magic-link/request', strictRateLimiter, validateMagicLinkRequest, requestMagicLink);
router.post('/magic-link/verify', verifyMagicLink);

// Email verification
router.post('/email/request-verification', authenticateToken, strictRateLimiter, requestEmailVerification);
router.post('/email/verify', verifyEmail);

// Phone verification
router.post('/phone/request-otp', authenticateToken, otpRateLimiter, validatePhoneNumber, requestPhoneOTP);
router.post('/phone/verify-otp', authenticateToken, validateOTP, verifyPhoneOTP);

// Two-factor authentication
router.post('/2fa/setup', authenticateToken, setup2FA);
router.post('/2fa/verify', authenticateToken, validate2FA, verify2FA);
router.post('/2fa/disable', authenticateToken, validate2FA, disable2FA);
router.post('/2fa/backup-codes', authenticateToken, generateBackupCodes);

// Protected routes
router.post('/logout', authenticateToken, logout);

export default router;