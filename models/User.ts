import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['designer', 'manager', 'production', 'admin', 'other'],
    required: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    productionNotifications: {
      type: Boolean,
      default: true,
    },
    weeklyReports: {
      type: Boolean,
      default: false,
    },
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: 1 });

const User = models.User || model('User', UserSchema);

export default User;

