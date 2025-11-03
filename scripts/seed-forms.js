const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const FormTemplate = require('../models/FormTemplate.ts');

const DEFAULT_FORMS = {
  customer: {
    name: 'Customer Form',
    description: 'Default customer registration form',
    formType: 'customer',
    fields: [
      {
        fieldId: 'customer_name',
        name: 'name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'Enter company name',
        order: 0,
      },
      {
        fieldId: 'customer_email',
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'Enter email address',
        order: 1,
      },
      {
        fieldId: 'customer_phone',
        name: 'phone',
        label: 'Phone',
        type: 'tel',
        required: true,
        placeholder: 'Enter phone number',
        order: 2,
      },
      {
        fieldId: 'customer_address',
        name: 'street',
        label: 'Street Address',
        type: 'text',
        required: false,
        placeholder: 'Enter street address',
        order: 3,
      },
      {
        fieldId: 'customer_city',
        name: 'city',
        label: 'City',
        type: 'text',
        required: false,
        placeholder: 'City',
        order: 4,
      },
      {
        fieldId: 'customer_state',
        name: 'state',
        label: 'State',
        type: 'text',
        required: false,
        placeholder: 'State',
        order: 5,
      },
      {
        fieldId: 'customer_zip',
        name: 'zipCode',
        label: 'Zip Code',
        type: 'text',
        required: false,
        placeholder: 'Zip code',
        order: 6,
      },
    ],
    isActive: true,
  },
  project: {
    name: 'Project Form',
    description: 'Default project creation form',
    formType: 'project',
    fields: [
      {
        fieldId: 'project_customer',
        name: 'customerId',
        label: 'Customer',
        type: 'select',
        required: true,
        placeholder: 'Select customer',
        order: 0,
        options: [],
      },
      {
        fieldId: 'project_name',
        name: 'projectName',
        label: 'Project Name',
        type: 'text',
        required: true,
        placeholder: 'Enter project name',
        order: 1,
      },
      {
        fieldId: 'project_number',
        name: 'projectNumber',
        label: 'Project Number',
        type: 'text',
        required: true,
        placeholder: 'Enter project number',
        order: 2,
      },
      {
        fieldId: 'project_type',
        name: 'productType',
        label: 'Product Type',
        type: 'select',
        required: true,
        placeholder: 'Select product type',
        order: 3,
        options: ['storm', 'sanitary', 'electrical', 'meter'],
      },
      {
        fieldId: 'project_start_date',
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: false,
        order: 4,
      },
    ],
    isActive: true,
  },
  library: {
    name: 'Library Template Form',
    description: 'Default library item form',
    formType: 'library',
    fields: [
      {
        fieldId: 'library_name',
        name: 'templateName',
        label: 'Template Name',
        type: 'text',
        required: true,
        placeholder: 'Enter template name',
        order: 0,
      },
      {
        fieldId: 'library_category',
        name: 'productCategory',
        label: 'Product Category',
        type: 'select',
        required: true,
        placeholder: 'Select category',
        order: 1,
        options: ['storm', 'sanitary', 'electrical', 'meter', 'rebar', 'cad'],
      },
      {
        fieldId: 'library_length',
        name: 'dimensionLength',
        label: 'Length (feet)',
        type: 'number',
        required: true,
        placeholder: '0.0',
        order: 2,
      },
      {
        fieldId: 'library_width',
        name: 'dimensionWidth',
        label: 'Width (feet)',
        type: 'number',
        required: true,
        placeholder: '0.0',
        order: 3,
      },
      {
        fieldId: 'library_height',
        name: 'dimensionHeight',
        label: 'Height (feet)',
        type: 'number',
        required: true,
        placeholder: '0.0',
        order: 4,
      },
      {
        fieldId: 'library_notes',
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        required: false,
        placeholder: 'Enter additional notes',
        order: 5,
      },
    ],
    isActive: true,
  },
};

async function seedForms() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI environment variable not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get admin user (or use a default ID)
    const User = mongoose.model('User');
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      // Try to find any user
      adminUser = await User.findOne();
    }

    if (!adminUser) {
      console.error('No users found in database. Please create a user first.');
      process.exit(1);
    }

    console.log(`Using user: ${adminUser.name}`);

    // Check and create default forms
    for (const [key, formData] of Object.entries(DEFAULT_FORMS)) {
      const existingForm = await FormTemplate.findOne({ 
        formType: formData.formType,
        isActive: true 
      });

      if (existingForm) {
        console.log(`✓ Active ${key} form already exists`);
      } else {
        const form = await FormTemplate.create({
          ...formData,
          createdBy: adminUser._id,
        });
        console.log(`✓ Created default ${key} form template`);
      }
    }

    console.log('\n✅ Form templates seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding forms:', error);
    process.exit(1);
  }
}

seedForms();
