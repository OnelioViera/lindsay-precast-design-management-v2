import mongoose, { Schema, model, models } from 'mongoose';

const FormFieldSchema = new Schema({
  fieldId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'email', 'tel', 'number', 'textarea', 'select', 'checkbox', 'date'],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: String,
  order: {
    type: Number,
    required: true,
  },
  options: [String], // For select fields
  validation: {
    pattern: String,
    min: Number,
    max: Number,
    minLength: Number,
    maxLength: Number,
  },
}, { _id: false });

const FormTemplateSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Form name is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  formType: {
    type: String,
    enum: ['customer', 'project', 'library'],
    required: true,
  },
  fields: [FormFieldSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index
FormTemplateSchema.index({ formType: 1 });
FormTemplateSchema.index({ isActive: 1 });
FormTemplateSchema.index({ formType: 1, isActive: 1 });

const FormTemplate = models.FormTemplate || model('FormTemplate', FormTemplateSchema);

export default FormTemplate;
