'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  BookOpen, 
  Factory,
  LogOut,
  ChevronLeft,
  Settings
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useSidebar } from '@/lib/sidebar-context';

const baseMenuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/dashboard/customers', icon: Users, label: 'Customers' },
  { href: '/dashboard/library', icon: BookOpen, label: 'Library' },
  { href: '/dashboard/production', icon: Factory, label: 'Production' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { data: session } = useSession();
  
  const isAdmin = (session?.user as any)?.role === 'admin';
  
  const menuItems = isAdmin 
    ? [...baseMenuItems, { href: '/dashboard/admin', icon: Settings, label: 'Admin' }]
    : baseMenuItems;

  return (
    <div className={cn(
      'bg-gray-200 shadow-lg h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-40 border-r border-gray-400',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      <div className={cn(
        'border-b border-gray-400',
        isCollapsed ? 'p-3' : 'p-6'
      )}>
        {!isCollapsed && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Lindsay Precast
            </h2>
            <p className="text-sm text-gray-700 mt-1">Design Management</p>
          </div>
        )}
      </div>

      {/* Collapse button on the right edge */}
      <button
        onClick={toggleCollapse}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-200 border-2 border-gray-400 p-2 text-gray-600 hover:text-gray-900 hover:border-gray-600 transition-colors shadow-lg z-50"
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        <ChevronLeft className={cn(
          'h-4 w-4 transition-transform duration-300',
          isCollapsed && 'rotate-180'
        )} />
      </button>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-all duration-200 relative group border',
                    isActive
                      ? 'bg-gray-700 text-white border-gray-900 shadow-md'
                      : 'text-gray-700 hover:bg-gray-300 border-gray-400',
                    isCollapsed && 'justify-center px-3'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  
                  {/* Tooltip for collapsed sidebar */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 font-medium border border-gray-800">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-400">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            'flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-red-200 hover:text-red-800 transition-all duration-200 relative group border border-gray-400 hover:border-red-400',
            isCollapsed && 'justify-center px-3'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
          
          {/* Tooltip for collapsed sidebar */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 font-medium border border-gray-800">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
}


