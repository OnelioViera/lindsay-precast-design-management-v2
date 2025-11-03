'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleDisplayNames: { [key: string]: string } = {
  designer: 'CAD Designer',
  manager: 'Project Manager',
  production: 'Production Specialist',
  admin: 'Administrator',
  other: 'Other',
};

function formatRole(role: string): string {
  return roleDisplayNames[role] || role;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'designer',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Update form data when modal opens or session changes
  useEffect(() => {
    if (isOpen && session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user as any).role || 'designer',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setMessage('');
    }
  }, [isOpen, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate password change if fields are filled
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setMessage('Current password is required to change password');
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage('New passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setMessage('New password must be at least 6 characters');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => {
          // Refresh the page to reload session data
          window.location.reload();
        }, 1000);
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-400 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-400">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-900">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-900">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              placeholder="Enter your email"
              disabled
              className="mt-1 bg-gray-200 cursor-not-allowed text-gray-700"
            />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="role" className="text-sm font-medium text-gray-900">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue>{formatRole(formData.role)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="designer">CAD Designer</SelectItem>
                <SelectItem value="manager">Project Manager</SelectItem>
                <SelectItem value="production">Production Specialist</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-300 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Change Password (Optional)</h3>
            
            <div>
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-900">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-3">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-900">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-3">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="mt-1"
              />
            </div>

            <p className="text-xs text-gray-600 mt-2">Leave blank if you don't want to change your password</p>
          </div>

          {message && (
            <div className={`p-3 text-sm flex items-center gap-2 border ${
              message.includes('successfully')
                ? 'bg-gray-100 text-gray-800 border-gray-400'
                : 'bg-red-100 text-red-800 border-red-400'
            }`}>
              {message.includes('successfully') && <CheckCircle className="h-4 w-4" />}
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 text-gray-900"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gray-700 text-white hover:bg-gray-800 border-gray-900"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

