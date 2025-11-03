import mongoose, { Schema, model, models } from 'mongoose';

const DrawingSchema = new Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  version: { type: Number, default: 1 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
  mimeType: { type: String, required: true },
});

const TimeEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // minutes
  notes: { type: String },
  isRunning: { type: Boolean, default: false },
});

const RevisionSchema = new Schema({
  revisionNumber: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  requestedBy: { type: String, required: true },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

const RFISchema = new Schema({
  question: { type: String, required: true },
  askedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  askedAt: { type: Date, default: Date.now },
  answer: { type: String },
  answeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  answeredAt: { type: Date },
  status: { type: String, enum: ['open', 'answered'], default: 'open' },
});

const StructureSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  customName: {
    type: String,
  },
}, { _id: false });

const ProjectSchema = new Schema({
  projectNumber: {
    type: String,
    required: true,
    unique: true,
  },
  projectName: {
    type: String,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
  },
  structures: [StructureSchema],
  productType: {
    type: String,
    enum: ['storm', 'sanitary', 'electrical', 'meter'],
    required: true,
  },
  status: {
    type: String,
    enum: ['requested', 'inprogress', 'review', 'approved', 'production'],
    default: 'requested',
  },
  specifications: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    wallThickness: { type: Number },
    customNotes: { type: String },
  },
  drawings: [DrawingSchema],
  timeTracking: {
    totalHours: { type: Number, default: 0 },
    entries: [TimeEntrySchema],
  },
  revisions: [RevisionSchema],
  productionHandoff: {
    sentToProduction: { type: Boolean, default: false },
    handoffDate: { type: Date },
    checklist: {
      drawingsFinalized: { type: Boolean, default: false },
      specificationsVerified: { type: Boolean, default: false },
      customerApprovalReceived: { type: Boolean, default: false },
      materialListConfirmed: { type: Boolean, default: false },
      productionNotesAdded: { type: Boolean, default: false },
    },
    rfis: [RFISchema],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes (note: projectNumber is already indexed by unique: true)
ProjectSchema.index({ customerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ customerId: 1, status: 1 });
ProjectSchema.index({ status: 1, createdAt: -1 });

const Project = models.Project || model('Project', ProjectSchema);

export default Project;

