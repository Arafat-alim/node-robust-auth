import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import Token from '../models/Token.js';
import { sendEmail } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

// Generate secure random token
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshTokenExpiry,
      deviceInfo: req.headers['user-agent'] || 'Unknown'
    });
    await user.save();

    // Send email verification
    const emailToken = generateSecureToken();
    await Token.createToken(
      user._id,
      'email_verification',
      emailToken,
      24 * 60 // 24 hours
    );

    await sendEmail(
      user.email,
      'Verify Your Email',
      `Please verify your email by clicking this link: ${process.env.CLIENT_URL}/verify-email?token=${emailToken}`
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        { userId: user._id, type: 'temp_2fa' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '10m' }
      );

      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication required',
        requiresTwoFactor: true,
        tempToken
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshTokenExpiry,
      deviceInfo: req.headers['user-agent'] || 'Unknown'
    });

    user.lastLoginAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const refreshToken = req.body.refreshToken;

    if (refreshToken) {
      // Remove specific refresh token
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const tokenIndex = user.refreshTokens.findIndex(
      token => token.token === refreshToken && token.expiresAt > new Date()
    );

    if (tokenIndex === -1) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Replace old refresh token with new one
    const newRefreshTokenExpiry = new Date();
    newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 7);

    user.refreshTokens[tokenIndex] = {
      token: newRefreshToken,
      expiresAt: newRefreshTokenExpiry,
      deviceInfo: req.headers['user-agent'] || 'Unknown'
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    await Token.createToken(
      user._id,
      'password_reset',
      resetToken,
      parseInt(process.env.MAGIC_LINK_EXPIRY_MINUTES) || 30
    );

    // Send reset email
    await sendEmail(
      user.email,
      'Password Reset Request',
      `Reset your password by clicking this link: ${process.env.CLIENT_URL}/reset-password?token=${resetToken}. This link will expire in 30 minutes.`
    );

    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find and validate token
    const tokenDoc = await Token.findValidToken(token, 'password_reset');
    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update user password
    tokenDoc.userId.password = password;
    await tokenDoc.userId.save();

    // Mark token as used
    await tokenDoc.markAsUsed();

    // Revoke all refresh tokens for security
    tokenDoc.userId.refreshTokens = [];
    await tokenDoc.userId.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// Request magic link
export const requestMagicLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a magic link has been sent.'
      });
    }

    // Generate magic link token
    const magicToken = generateSecureToken();
    await Token.createToken(
      user._id,
      'magic_link',
      magicToken,
      parseInt(process.env.MAGIC_LINK_EXPIRY_MINUTES) || 30
    );

    // Send magic link
    await sendEmail(
      user.email,
      'Magic Link Login',
      `Click this link to sign in: ${process.env.CLIENT_URL}/magic-link?token=${magicToken}. This link will expire in 30 minutes.`
    );

    res.status(200).json({
      success: true,
      message: 'If the email exists, a magic link has been sent.'
    });
  } catch (error) {
    console.error('Magic link request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send magic link'
    });
  }
};

// Verify magic link
export const verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.body;

    // Find and validate token
    const tokenDoc = await Token.findValidToken(token, 'magic_link');
    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired magic link'
      });
    }

    const user = tokenDoc.userId;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshTokenExpiry,
      deviceInfo: req.headers['user-agent'] || 'Unknown'
    });

    user.lastLoginAt = new Date();
    await user.save();

    // Mark token as used
    await tokenDoc.markAsUsed();

    res.status(200).json({
      success: true,
      message: 'Magic link verification successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Magic link verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Magic link verification failed'
    });
  }
};

// Request email verification
export const requestEmailVerification = async (req, res) => {
  try {
    const user = req.user;

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate verification token
    const verificationToken = generateSecureToken();
    await Token.createToken(
      user._id,
      'email_verification',
      verificationToken,
      24 * 60 // 24 hours
    );

    // Send verification email
    await sendEmail(
      user.email,
      'Verify Your Email',
      `Please verify your email by clicking this link: ${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`
    );

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Email verification request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Find and validate token
    const tokenDoc = await Token.findValidToken(token, 'email_verification');
    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    tokenDoc.userId.isEmailVerified = true;
    await tokenDoc.userId.save();

    // Mark token as used
    await tokenDoc.markAsUsed();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// Request phone OTP
export const requestPhoneOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const user = req.user;

    // Generate OTP
    const otp = generateOTP();
    await Token.createToken(
      user._id,
      'phone_otp',
      otp,
      parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
      { phoneNumber }
    );

    // Send OTP via SMS
    await sendSMS(
      phoneNumber,
      `Your verification code is: ${otp}. This code will expire in 10 minutes.`
    );

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Phone OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Verify phone OTP
export const verifyPhoneOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;

    // Find and validate token
    const tokenDoc = await Token.findValidToken(otp, 'phone_otp');
    if (!tokenDoc || tokenDoc.userId._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update user
    user.phoneNumber = tokenDoc.data.phoneNumber;
    user.isPhoneVerified = true;
    await user.save();

    // Mark token as used
    await tokenDoc.markAsUsed();

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    console.error('Phone OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Phone verification failed'
    });
  }
};

// Setup 2FA
export const setup2FA = async (req, res) => {
  try {
    const user = req.user;

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${user.getFullName()} (${user.email})`,
      issuer: 'Node-Robust-Auth'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA setup initiated',
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      }
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: '2FA setup failed'
    });
  }
};

// Verify and enable 2FA
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA setup not initiated'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push({
        code: crypto.randomBytes(4).toString('hex').toUpperCase(),
        used: false
      });
    }

    user.backupCodes = backupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
      data: {
        backupCodes: backupCodes.map(bc => bc.code)
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: '2FA verification failed'
    });
  }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.backupCodes = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
};

// Generate new backup codes
export const generateBackupCodes = async (req, res) => {
  try {
    const user = req.user;

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Generate new backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push({
        code: crypto.randomBytes(4).toString('hex').toUpperCase(),
        used: false
      });
    }

    user.backupCodes = backupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'New backup codes generated',
      data: {
        backupCodes: backupCodes.map(bc => bc.code)
      }
    });
  } catch (error) {
    console.error('Backup codes generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate backup codes'
    });
  }
};