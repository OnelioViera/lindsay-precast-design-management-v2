'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LibraryTemplate } from '@/types';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export default function AdminLibraryPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<LibraryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/library?active=false');
      const data = await res.json();

      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      addToast({
        title: 'Error',
        message: 'Failed to load library items',
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
      const res = await fetch(`/api/library/${id}`, {
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
          message: 'Failed to delete item',
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
        <div className="text-gray-600">Loading library items...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Library Manager</h1>
          <p className="text-gray-600 mt-1">Manage all library items and their properties</p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push('/dashboard/library')}
        >
          <Plus className="h-5 w-5 mr-2" />
          View as User
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No library items found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => (
            <Card
              key={template._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.templateName}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize mt-1">
                      Category: {template.productCategory}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Dimensions: {template.dimensions.length}' × {template.dimensions.width}' × {template.dimensions.height}'
                      {template.dimensions.wallThickness && ` (Wall: ${template.dimensions.wallThickness}')`}
                    </p>
                    {template.notes && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        {template.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Used {template.usageCount} times
                      {template.lastUsed && ` | Last used: ${new Date(template.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/dashboard/admin/library/${template._id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleDelete(template._id!, template.templateName)
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
      )}
    </div>
  );
}
