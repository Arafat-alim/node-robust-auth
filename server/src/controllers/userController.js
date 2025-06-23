import User from '../models/User.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { firstName, lastName, phoneNumber } = req.body;

    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber;
      // Reset phone verification if phone number changed
      if (user.phoneNumber !== phoneNumber) {
        user.isPhoneVerified = false;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const user = req.user;

    // Soft delete - deactivate account
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

// Get user sessions
export const getUserSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const sessions = user.refreshTokens
      .filter(token => token.expiresAt > new Date())
      .map(token => ({
        id: token._id,
        deviceInfo: token.deviceInfo,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt
      }));

    res.status(200).json({
      success: true,
      message: 'Sessions retrieved successfully',
      data: {
        sessions
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sessions'
    });
  }
};

// Revoke specific session
export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    await User.updateOne(
      { _id: user._id },
      { $pull: { refreshTokens: { _id: sessionId } } }
    );

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke session'
    });
  }
};

// Revoke all sessions except current
export const revokeAllSessions = async (req, res) => {
  try {
    const user = req.user;
    const currentRefreshToken = req.body.currentRefreshToken;

    if (currentRefreshToken) {
      // Keep only the current session
      const currentSession = user.refreshTokens.find(
        token => token.token === currentRefreshToken
      );
      
      user.refreshTokens = currentSession ? [currentSession] : [];
    } else {
      // Revoke all sessions
      user.refreshTokens = [];
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'All sessions revoked successfully'
    });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke sessions'
    });
  }
};