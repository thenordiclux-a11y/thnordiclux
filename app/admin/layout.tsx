'use client'

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Users,
  BarChart3,
  Search,
  LogOut,
  Menu,
  X,
  UserCog,
  LayoutTemplate,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../assets/4cb21529e27325b99c96e06426397bce92267e6c.png';
import { LiveChatNavLink } from './components/LiveChatNavLink';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/orders', icon: FileText },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'SEO', href: '/admin/seo', icon: Search },
  { name: 'CMS overview', href: '/admin/cms', icon: LayoutTemplate },
  { name: 'Users', href: '/admin/users', icon: UserCog },
  { name: 'Affiliate Program', href: '/admin/affiliate', icon: Share2 },
];

function sidebarLinkActive(pathname: string, href: string): boolean {
  if (href === '/admin/cms') {
    return pathname === '/admin/cms' || pathname.startsWith('/admin/cms/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // If on login page, render without layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not authenticated, don't render the layout (middleware will handle redirect)
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600/75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          aria-hidden="true"
          role="presentation"
        />
      )}

      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Image src={logo} alt="Nordic Lux" width={40} height={40} className="h-10 w-10" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = sidebarLinkActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <LiveChatNavLink
                isActive={pathname === '/admin/support'}
                onNavigate={() => setSidebarOpen(false)}
              />
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xs font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center space-x-3">
              <Image src={logo} alt="Nordic Lux" width={32} height={32} className="h-8 w-8" />
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-gray-900">Nordic Lux</div>
                <div className="text-xs text-gray-500">Admin Panel</div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 capitalize hidden sm:inline">
              {user?.name || 'Admin'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

