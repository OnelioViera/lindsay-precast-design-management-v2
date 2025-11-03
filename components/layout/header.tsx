'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, User, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProfileModal } from '@/components/layout/profile-modal';
import { useSidebar } from '@/lib/sidebar-context';
import { useNotifications } from '@/lib/notification-context';
import { useToast } from '@/lib/toast-context';

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

export function Header() {
  const { data: session } = useSession();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isCollapsed } = useSidebar();
  const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead } =
    useNotifications();
  const { addToast } = useToast();

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    await markAsRead(notification._id);

    // Show toast
    addToast({
      title: notification.title,
      message: notification.message,
      type: 'info',
    });
  };

  return (
    <>
      <header
        className={cn(
          'bg-gray-100 shadow-sm border-b border-gray-400 px-8 py-4 fixed top-0 z-30 transition-all duration-300',
          isCollapsed ? 'right-0 left-20' : 'right-0 left-64'
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {session?.user?.name || 'User'}!
            </h1>
            <p className="text-sm text-gray-600">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notifications Bell */}
            <div className="relative">
              <Button
                variant="default"
                className="relative px-3 py-2 text-sm"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-xs text-white flex items-center justify-center border border-red-900 font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-300 z-50 max-h-96 overflow-y-auto">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-300 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={cn(
                            'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                            !notification.read && 'bg-blue-50'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className="flex-1 min-w-0"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <p className="font-semibold text-gray-900 text-sm">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(notification.createdAt).toLocaleDateString()}{' '}
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification._id);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification._id);
                                }}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Section */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 pl-4 border-l border-gray-400 hover:bg-gray-200 px-3 py-2 transition cursor-pointer"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{session?.user?.name}</p>
                <p className="text-xs text-gray-600">{formatRole((session?.user as any)?.role || '')}</p>
              </div>
              <div className="h-10 w-10 bg-gray-700 flex items-center justify-center text-white font-bold border border-gray-900">
                <User className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}


