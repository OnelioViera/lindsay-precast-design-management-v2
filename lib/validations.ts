import { z } from 'zod';

// User validation
export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['designer', 'engineer', 'manager', 'production', 'admin']),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Project validation
export const projectSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  projectNumber: z.string().optional(),
  projectName: z.string().optional(),
  startDate: z.string().optional(),
  productType: z.enum(['storm', 'sanitary', 'electrical', 'meter']),
  specifications: z.object({
    length: z.number().positive('Length must be positive'),
    width: z.number().positive('Width must be positive'),
    height: z.number().positive('Height must be positive'),
    wallThickness: z.number().positive().optional(),
    customNotes: z.string().optional(),
  }),
  structures: z.array(z.object({
    type: z.string().min(1, 'Structure type is required'),
    customName: z.string().optional(),
  })).optional(),
});

// Customer validation
export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contactInfo: z.object({
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format (xxx) xxx-xxxx').optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().length(2, 'State must be 2 characters').optional(),
      zipCode: z.string().regex(/^\d{5}$/, 'Invalid zip code').optional(),
    }).optional(),
  }),
  preferences: z.object({
    customSpecs: z.array(z.string()).optional(),
    notes: z.string().optional(),
    preferredProducts: z.array(z.string()).optional(),
    requiresStampedDrawings: z.boolean().optional(),
    expeditedTurnaround: z.boolean().optional(),
  }).optional(),
});

// Library template validation
export const libraryTemplateSchema = z.object({
  templateName: z.string().min(2, 'Template name is required'),
  productCategory: z.enum(['storm', 'sanitary', 'electrical', 'meter', 'rebar', 'cad']),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    wallThickness: z.number().positive().optional(),
  }),
  loadRequirements: z.object({
    designLoad: z.string().optional(),
    soilCover: z.string().optional(),
    waterTable: z.string().optional(),
  }).optional(),
  rebarSchedule: z.string().optional(),
  notes: z.string().optional(),
});

// Time entry validation
export const timeEntrySchema = z.object({
  action: z.enum(['start', 'stop']),
  notes: z.string().optional(),
});

