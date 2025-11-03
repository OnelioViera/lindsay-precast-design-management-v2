'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2, Copy, Eye, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

interface FormField {
  fieldId: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  required: boolean;
  placeholder?: string;
  order: number;
  options?: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

interface FormTemplate {
  _id: string;
  name: string;
  description: string;
  formType: 'customer' | 'project' | 'library';
  fields: FormField[];
  isActive: boolean;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
];

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<FormTemplate>({
    _id: '',
    name: '',
    description: '',
    formType: 'customer',
    fields: [],
    isActive: true,
  });

  const [editingField, setEditingField] = useState<FormField | null>(null);

  useEffect(() => {
    if (id !== 'new') {
      fetchForm();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchForm = async () => {
    try {
      const res = await fetch(`/api/admin/form-templates/${id}`);
      const data = await res.json();

      if (data.success) {
        setFormData(data.data);
      } else {
        addToast({ title: 'Error', message: 'Failed to load form', type: 'error' });
        router.push('/dashboard/admin/forms');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      addToast({ title: 'Error', message: 'An error occurred', type: 'error' });
      router.push('/dashboard/admin/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    const newField: FormField = {
      fieldId: Date.now().toString(),
      name: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      order: formData.fields.length,
    };
    setEditingField(newField);
  };

  const handleSaveField = () => {
    if (!editingField) return;

    if (!editingField.label) {
      addToast({ title: 'Error', message: 'Field label is required', type: 'error' });
      return;
    }

    const existingIndex = formData.fields.findIndex(f => f.fieldId === editingField.fieldId);
    if (existingIndex >= 0) {
      const updated = [...formData.fields];
      updated[existingIndex] = editingField;
      setFormData({ ...formData, fields: updated });
    } else {
      setFormData({ ...formData, fields: [...formData.fields, editingField] });
    }

    setEditingField(null);
    addToast({ title: 'Success', message: 'Field saved', type: 'success' });
  };

  const handleDeleteField = (fieldId: string) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(f => f.fieldId !== fieldId),
    });
    addToast({ title: 'Success', message: 'Field deleted', type: 'success' });
  };

  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = formData.fields.findIndex(f => f.fieldId === fieldId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formData.fields.length - 1)) {
      return;
    }

    const newFields = [...formData.fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];

    // Update order
    const updated = newFields.map((f, i) => ({ ...f, order: i }));
    setFormData({ ...formData, fields: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.name) {
      addToast({ title: 'Error', message: 'Form name is required', type: 'error' });
      setSaving(false);
      return;
    }

    if (formData.fields.length === 0) {
      addToast({ title: 'Error', message: 'Add at least one field', type: 'error' });
      setSaving(false);
      return;
    }

    try {
      const isNew = id === 'new';
      const url = isNew ? '/api/admin/form-templates' : `/api/admin/form-templates/${id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          formType: formData.formType,
          fields: formData.fields.map((f, i) => ({ ...f, order: i })),
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        addToast({
          title: 'Success',
          message: isNew ? 'Form created' : 'Form updated',
          type: 'success',
        });
        router.push('/dashboard/admin/forms');
      } else {
        addToast({ title: 'Error', message: 'Failed to save form', type: 'error' });
      }
    } catch (error) {
      console.error('Save error:', error);
      addToast({ title: 'Error', message: 'An error occurred', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Button
          variant="default"
          onClick={() => router.push('/dashboard/admin/forms')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {id === 'new' ? 'Create New Form' : 'Edit Form'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Form Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Customer Registration Form"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this form's purpose..."
                      rows={2}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="formType">Form Type *</Label>
                    <Select
                      value={formData.formType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, formType: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer Form</SelectItem>
                        <SelectItem value="project">Project Form</SelectItem>
                        <SelectItem value="library">Library Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer mb-0">
                      Active (Available for users)
                    </Label>
                  </div>
                </div>

                {/* Fields */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Form Fields</h3>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddField}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {formData.fields.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No fields added. Click "Add Field" to get started.
                      </div>
                    ) : (
                      formData.fields.map((field, index) => (
                        <div
                          key={field.fieldId}
                          className="flex items-center gap-2 p-3 border border-gray-300 hover:border-gray-400 bg-white rounded group"
                        >
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{field.label}</p>
                            <p className="text-xs text-gray-500">{field.type}{field.required ? ' • Required' : ''}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => setEditingField(field)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleMoveField(field.fieldId, 'up')}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleMoveField(field.fieldId, 'down')}
                              disabled={index === formData.fields.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleDeleteField(field.fieldId)}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" variant="primary" disabled={saving} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Form'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/dashboard/admin/forms')}
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Field Editor Sidebar */}
        <div>
          {editingField ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Field</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    value={editingField.label}
                    onChange={(e) =>
                      setEditingField({ ...editingField, label: e.target.value })
                    }
                    placeholder="Field label"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fieldName">Field Name *</Label>
                  <Input
                    id="fieldName"
                    value={editingField.name}
                    onChange={(e) =>
                      setEditingField({ ...editingField, name: e.target.value })
                    }
                    placeholder="field_name"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fieldType">Type *</Label>
                  <Select
                    value={editingField.type}
                    onValueChange={(value: any) =>
                      setEditingField({ ...editingField, type: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="placeholder">Placeholder</Label>
                  <Input
                    id="placeholder"
                    value={editingField.placeholder || ''}
                    onChange={(e) =>
                      setEditingField({ ...editingField, placeholder: e.target.value })
                    }
                    placeholder="Helper text..."
                    className="mt-2"
                  />
                </div>

                {editingField.type === 'select' && (
                  <div>
                    <Label htmlFor="options">Options (one per line)</Label>
                    <Textarea
                      id="options"
                      value={(editingField.options || []).join('\n')}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          options: e.target.value.split('\n').filter(o => o.trim()),
                        })
                      }
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="required"
                    type="checkbox"
                    checked={editingField.required}
                    onChange={(e) =>
                      setEditingField({ ...editingField, required: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="required" className="cursor-pointer mb-0">
                    Required field
                  </Label>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveField}
                    className="flex-1"
                  >
                    Save Field
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditingField(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Select a field to edit its properties, or add a new field using the button above.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>

                {showPreview && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {formData.fields.map((field) => (
                      <div key={field.fieldId}>
                        <label className="text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm" disabled>
                            <option>{field.placeholder || 'Select...'}</option>
                            {field.options?.map((opt) => (
                              <option key={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder={field.placeholder}
                            rows={2}
                            disabled
                          />
                        ) : (
                          <input
                            type={field.type}
                            className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder={field.placeholder}
                            disabled
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
