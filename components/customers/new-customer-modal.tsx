'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { DynamicFormRenderer, FormField } from '@/components/forms/dynamic-form-renderer';
import { useToast } from '@/lib/toast-context';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewCustomerModal({ isOpen, onClose, onSuccess }: NewCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { addToast } = useToast();

  const [formTemplate, setFormTemplate] = useState<{
    fields: FormField[];
    name: string;
  } | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load the active customer form template
  useEffect(() => {
    if (isOpen) {
      fetchFormTemplate();
    }
  }, [isOpen]);

  const fetchFormTemplate = async () => {
    setFormLoading(true);
    try {
      const res = await fetch('/api/form-templates/active?type=customer');
      const data = await res.json();

      if (data.success) {
        setFormTemplate(data.data);
        // Initialize form data with empty values for all fields
        const initialData: Record<string, any> = {};
        data.data.fields.forEach((field: FormField) => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
      } else {
        addToast({
          title: 'Error',
          message: 'Failed to load customer form',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to fetch form template:', error);
      addToast({
        title: 'Error',
        message: 'Failed to load customer form',
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
    if (fieldErrors[fieldName]) {
      setFieldErrors({ ...fieldErrors, [fieldName]: '' });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formTemplate) {
      formTemplate.fields.forEach((field) => {
        if (field.required && !formData[field.name]) {
          errors[field.name] = `${field.label} is required`;
        }

        // Email validation
        if (field.type === 'email' && formData[field.name]) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData[field.name])) {
            errors[field.name] = 'Invalid email address';
          }
        }

        // Phone validation
        if (field.type === 'tel' && formData[field.name]) {
          const phoneDigits = formData[field.name].replace(/\D/g, '');
          if (phoneDigits.length !== 10) {
            errors[field.name] = 'Phone number must be 10 digits';
          }
        }
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast({
        title: 'Validation Error',
        message: 'Please fix the errors above',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Format phone number if present
      const submitData = { ...formData };
      if (submitData.phone) {
        const digits = submitData.phone.replace(/\D/g, '');
        submitData.phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }

      // Map dynamic form data to customer model structure
      const customerPayload = {
        name: submitData.name,
        contactInfo: {
          email: submitData.email,
          phone: submitData.phone,
          address: {
            street: submitData.street || undefined,
            city: submitData.city || undefined,
            state: submitData.state ? submitData.state.toUpperCase().slice(0, 2) : undefined,
            zipCode: submitData.zipCode || undefined,
          },
        },
        // Store all dynamic form data for future reference
        dynamicFormData: submitData,
      };

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerPayload),
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({});
        setFieldErrors({});
        onSuccess();
        onClose();
        addToast({
          title: 'Success',
          message: 'Customer created successfully',
          type: 'success',
        });
      } else {
        setError(data.message || 'Failed to create customer');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    setShowClearConfirm(true);
  };

  const confirmClearData = () => {
    setFormData({});
    setFieldErrors({});
    setError('');
    setShowClearConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {formTemplate?.name || 'Create New Customer'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Add a new customer to your system</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {formLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading form...</p>
            </div>
          ) : !formTemplate ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Unable to load customer form</p>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dynamic Form Fields */}
                  <DynamicFormRenderer
                    fields={formTemplate.fields}
                    values={formData}
                    onChange={handleFieldChange}
                    errors={fieldErrors}
                    disabled={loading}
                  />

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                      className="flex-1"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClearData}
                      className="flex-1"
                      disabled={loading}
                    >
                      Clear Data
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all duration-200 font-semibold"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Customer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Clear</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to clear all customer information? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmClearData}>
                Clear Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

