'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, BookOpen, FileText } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage forms, templates, and library items</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Current Forms */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Manage Current Forms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600 text-sm">
              Edit the active forms used by your users. Changes apply immediately.
            </p>
            <Link href="/dashboard/admin/forms/manage">
              <Button variant="primary" className="w-full">
                View & Edit Forms
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Form Builder */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Form Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600 text-sm">
              Create and customize forms for projects, libraries, and customers.
            </p>
            <Link href="/dashboard/admin/forms">
              <Button variant="primary" className="w-full">
                Manage Forms
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Library Manager */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Library Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600 text-sm">
              Edit library items, descriptions, and properties.
            </p>
            <Link href="/dashboard/admin/library">
              <Button variant="primary" className="w-full">
                Manage Library
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
