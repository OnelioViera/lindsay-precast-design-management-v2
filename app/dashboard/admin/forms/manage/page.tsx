'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Eye } from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { DynamicFormRenderer, FormField } from '@/components/forms/dynamic-form-renderer';

interface FormTemplate {
  _id: string;
  name: string;
  description: string;
  formType: 'customer' | 'project' | 'library';
  fields: FormField[];
  isActive: boolean;
  updatedAt: string;
}

const FORM_TYPES = [
  { value: 'customer', label: 'Customer Form', icon: '👥' },
  { value: 'project', label: 'Project Form', icon: '📋' },
  { value: 'library', label: 'Library Form', icon: '📚' },
];

export default function ManageFormsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [activeForms, setActiveForms] = useState<Record<string, FormTemplate>>({});
  const [loading, setLoading] = useState(true);
  const [previewForm, setPreviewForm] = useState<string | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchActiveForms();
  }, []);

  const fetchActiveForms = async () => {
    try {
      const res = await fetch('/api/admin/form-templates?formType=customer');
      const customerData = await res.json();

      const resProject = await fetch('/api/admin/form-templates?formType=project');
      const projectData = await resProject.json();

      const resLibrary = await fetch('/api/admin/form-templates?formType=library');
      const libraryData = await resLibrary.json();

      const forms: Record<string, FormTemplate> = {};

      // Find active forms for each type
      if (customerData.success) {
        const active = customerData.data.find((f: FormTemplate) => f.isActive);
        if (active) forms.customer = active;
      }
      if (projectData.success) {
        const active = projectData.data.find((f: FormTemplate) => f.isActive);
        if (active) forms.project = active;
      }
      if (libraryData.success) {
        const active = libraryData.data.find((f: FormTemplate) => f.isActive);
        if (active) forms.library = active;
      }

      setActiveForms(forms);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
      addToast({
        title: 'Error',
        message: 'Failed to load forms',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (formType: string) => {
    const form = activeForms[formType];
    if (form) {
      setPreviewForm(formType);
      const initialValues: Record<string, any> = {};
      form.fields.forEach((field) => {
        initialValues[field.name] = '';
      });
      setPreviewValues(initialValues);
    }
  };

  const handleClosePreview = () => {
    setPreviewForm(null);
    setPreviewValues({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="default"
          onClick={() => router.push('/dashboard/admin')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Manage Current Forms</h1>
        <p className="text-gray-600 mt-1">
          Edit the active forms used by your users. Changes are applied immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FORM_TYPES.map((formType) => {
          const form = activeForms[formType.value as keyof typeof activeForms];

          return (
            <Card
              key={formType.value}
              className={`border-2 ${
                form ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{formType.icon}</span>
                  {formType.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Active Form</p>
                      <p className="text-gray-900 font-medium mt-1">{form.name}</p>
                      {form.description && (
                        <p className="text-xs text-gray-600 mt-2">{form.description}</p>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold mb-2">FIELDS ({form.fields.length})</p>
                      <div className="space-y-1">
                        {form.fields.slice(0, 3).map((field) => (
                          <div key={field.fieldId} className="text-xs text-gray-700">
                            • {field.label} {field.required && <span className="text-red-500">*</span>}
                          </div>
                        ))}
                        {form.fields.length > 3 && (
                          <div className="text-xs text-gray-500 italic">
                            +{form.fields.length - 3} more fields
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Updated {new Date(form.updatedAt).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => handlePreview(formType.value)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => router.push(`/dashboard/admin/forms/${form._id}`)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-3">No active form configured</p>
                    <Button
                      variant="primary"
                      onClick={() => router.push('/dashboard/admin/forms/new')}
                      className="w-full"
                    >
                      Create Form
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewForm && activeForms[previewForm as keyof typeof activeForms] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeForms[previewForm as keyof typeof activeForms]?.name} - Preview
                </h2>
                <button
                  onClick={handleClosePreview}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                This is how the form appears to users:
              </p>

              <Card>
                <CardContent className="pt-6">
                  <DynamicFormRenderer
                    fields={
                      activeForms[previewForm as keyof typeof activeForms]?.fields || []
                    }
                    values={previewValues}
                    onChange={(fieldName, value) => {
                      setPreviewValues({
                        ...previewValues,
                        [fieldName]: value,
                      });
                    }}
                    disabled={true}
                  />
                </CardContent>
              </Card>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    router.push(
                      `/dashboard/admin/forms/${
                        activeForms[previewForm as keyof typeof activeForms]?._id
                      }`
                    );
                    handleClosePreview();
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit This Form
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleClosePreview}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
