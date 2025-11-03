'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LibraryTemplate } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export default function EditLibraryItemPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<LibraryTemplate>({
    templateName: '',
    productCategory: 'storm',
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      wallThickness: 0,
    },
    loadRequirements: {
      designLoad: '',
      soilCover: '',
      waterTable: '',
    },
    rebarSchedule: '',
    notes: '',
    images: [],
    isActive: true,
    usageCount: 0,
    createdBy: '',
  });

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/library/${id}`);
      const data = await res.json();

      if (data.success) {
        setFormData(data.data);
      } else {
        addToast({
          title: 'Error',
          message: 'Failed to load item',
          type: 'error',
        });
        router.push('/dashboard/admin/library');
      }
    } catch (error) {
      console.error('Failed to fetch item:', error);
      addToast({
        title: 'Error',
        message: 'An error occurred',
        type: 'error',
      });
      router.push('/dashboard/admin/library');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/library/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: formData.templateName,
          productCategory: formData.productCategory,
          dimensions: formData.dimensions,
          loadRequirements: formData.loadRequirements,
          rebarSchedule: formData.rebarSchedule,
          notes: formData.notes,
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        addToast({
          title: 'Success',
          message: 'Library item updated successfully',
          type: 'success',
        });
        router.push('/dashboard/admin/library');
      } else {
        const data = await res.json();
        addToast({
          title: 'Error',
          message: data.message || 'Failed to update item',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      addToast({
        title: 'Error',
        message: 'An error occurred while saving',
        type: 'error',
      });
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button
          variant="default"
          onClick={() => router.push('/dashboard/admin/library')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Library Item</h1>
        <p className="text-gray-600 mt-1">{formData.templateName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  value={formData.templateName}
                  onChange={(e) =>
                    setFormData({ ...formData, templateName: e.target.value })
                  }
                  placeholder="Enter template name"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="productCategory">Product Category *</Label>
                <Select
                  value={formData.productCategory}
                  onValueChange={(value: any) =>
                    setFormData({
                      ...formData,
                      productCategory: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="storm">Storm</SelectItem>
                    <SelectItem value="sanitary">Sanitary</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                    <SelectItem value="rebar">Rebar</SelectItem>
                    <SelectItem value="cad">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dimensions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Dimensions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="length">Length (feet) *</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    value={formData.dimensions.length}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          length: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="width">Width (feet) *</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    value={formData.dimensions.width}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          width: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="height">Height (feet) *</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={formData.dimensions.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          height: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="wallThickness">Wall Thickness (feet)</Label>
                  <Input
                    id="wallThickness"
                    type="number"
                    step="0.1"
                    value={formData.dimensions.wallThickness || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          wallThickness: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Load Requirements */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Load Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="designLoad">Design Load</Label>
                  <Input
                    id="designLoad"
                    value={formData.loadRequirements?.designLoad || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loadRequirements: {
                          ...formData.loadRequirements,
                          designLoad: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., H-20"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="soilCover">Soil Cover</Label>
                  <Input
                    id="soilCover"
                    value={formData.loadRequirements?.soilCover || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loadRequirements: {
                          ...formData.loadRequirements,
                          soilCover: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., 2 ft"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="waterTable">Water Table</Label>
                  <Input
                    id="waterTable"
                    value={formData.loadRequirements?.waterTable || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loadRequirements: {
                          ...formData.loadRequirements,
                          waterTable: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., Below grade"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-4">
              <div>
                <Label htmlFor="rebarSchedule">Rebar Schedule</Label>
                <Textarea
                  id="rebarSchedule"
                  value={formData.rebarSchedule || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, rebarSchedule: e.target.value })
                  }
                  placeholder="Enter rebar schedule details..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Enter additional notes..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer mb-0">
                  Active (Available for use)
                </Label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/admin/library')}
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
  );
}
