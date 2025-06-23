import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset', 'magic_link', 'phone_otp'],
    required: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  },
  attempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ token: 1, type: 1 });
tokenSchema.index({ createdAt: -1 });

// Instance methods
tokenSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

tokenSchema.methods.isValid = function() {
  return !this.used && !this.isExpired() && this.attempts < 3;
};

tokenSchema.methods.markAsUsed = function() {
  this.used = true;
  this.usedAt = new Date();
  return this.save();
};

tokenSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Static methods
tokenSchema.statics.findValidToken = function(token, type) {
  return this.findOne({
    token,
    type,
    used: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 3 }
  }).populate('userId');
};

tokenSchema.statics.createToken = function(userId, type, tokenValue, expiryMinutes, data = {}) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
  
  return this.create({
    userId,
    type,
    token: tokenValue,
    data,
    expiresAt
  });
};

tokenSchema.statics.cleanupExpiredTokens = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

export default mongoose.model('Token', tokenSchema);