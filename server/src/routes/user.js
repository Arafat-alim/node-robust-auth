import express from 'express';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getUserSessions,
  revokeSession,
  revokeAllSessions
} from '../controllers/userController.js';
import { authenticateToken, requireEmailVerification } from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validation.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Profile management
router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);
router.delete('/account', requireEmailVerification, deleteAccount);

// Session management
router.get('/sessions', getUserSessions);
router.delete('/sessions/:sessionId', revokeSession);
router.delete('/sessions', revokeAllSessions);

export default router;