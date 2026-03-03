// User.js — Base authentication model (polymorphic pattern)
// One User document per account. Role-specific data lives in
// College / Student / Admin / ProvincialAdmin collections via userId ref.

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type:     String,
      required: true,
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  true,
      minlength: 6,
      select:    false,   // never returned by default — must explicitly .select('+password')
    },
    userType: {
      type:     String,
      enum:     ['admin', 'provincial_admin', 'college', 'student'],
      required: true,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    emailVerified: {
      type:    Boolean,
      default: false,
    },
    emailVerificationToken: String,
    lastLogin:              Date,
    refreshTokens: [
      {
        token:     String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
userSchema.index({ email:    1 });
userSchema.index({ userType: 1 });
userSchema.index({ isActive: 1 });

// ─────────────────────────────────────────
// Pre-save hook — hash password before saving
// ─────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified('password')) return next();
  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─────────────────────────────────────────
// Instance method — compare password
// ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);