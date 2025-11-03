import mongoose, { Schema, model, models } from 'mongoose';

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },
  },
  preferences: {
    customSpecs: [{ type: String }],
    notes: { type: String },
    preferredProducts: [{ type: String }],
    requiresStampedDrawings: { type: Boolean, default: false },
    expeditedTurnaround: { type: Boolean, default: false },
  },
  projectHistory: {
    totalProjects: { type: Number, default: 0 },
    activeProjects: { type: Number, default: 0 },
    completedThisYear: { type: Number, default: 0 },
    recentProjectIds: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  // Store dynamic form data for reference and custom fields
  dynamicFormData: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ 'contactInfo.email': 1 });
CustomerSchema.index({ createdAt: -1 });

const Customer = models.Customer || model('Customer', CustomerSchema);

export default Customer;

