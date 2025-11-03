'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ArrowLeft, Copy } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

interface FormField {
  fieldId: string;
  name: string;
  label: string;
  type: string;
  order: number;
}

interface FormTemplate {
  _id: string;
  name: string;
  description: string;
  formType: 'customer' | 'project' | 'library';
  fields: FormField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const FORM_TYPES = [
  { value: 'customer', label: 'Customer Form', color: 'bg-blue-50 border-blue-200' },
  { value: 'project', label: 'Project Form', color: 'bg-green-50 border-green-200' },
  { value: 'library', label: 'Library Form', color: 'bg-purple-50 border-purple-200' },
];

export default function FormsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/form-templates');
      const data = await res.json();

      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      addToast({
        title: 'Error',
        message: 'Failed to load form templates',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/form-templates/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTemplates(templates.filter(t => t._id !== id));
        addToast({
          title: 'Success',
          message: `"${name}" has been deleted`,
          type: 'success',
        });
      } else {
        addToast({
          title: 'Error',
          message: 'Failed to delete form',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      addToast({
        title: 'Error',
        message: 'An error occurred while deleting',
        type: 'error',
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading forms...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="default"
            onClick={() => router.push('/dashboard/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-600 mt-1">Manage dynamic forms for your users</p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push('/dashboard/admin/forms/new')}
        >
          <Plus className="h-5 w-5 mr-2" />
          New Form
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">No form templates created yet</p>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/admin/forms/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {FORM_TYPES.map((type) => {
            const typeForms = templates.filter(t => t.formType === type.value);
            if (typeForms.length === 0) return null;

            return (
              <div key={type.value}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{type.label}</h2>
                <div className="grid grid-cols-1 gap-4">
                  {typeForms.map((template) => (
                    <Card key={template._id} className={`border-2 ${type.color}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {template.name}
                            </h3>
                            {template.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {template.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-sm text-gray-500">
                                {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                template.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {template.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="secondary"
                              onClick={() => router.push(`/dashboard/admin/forms/${template._id}`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() =>
                                handleDelete(template._id, template.name)
                              }
                              disabled={deleting === template._id}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deleting === template._id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
