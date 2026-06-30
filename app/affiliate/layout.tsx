'use client';

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Share2,
  Package,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { useAffiliate } from '../contexts/AffiliateContext';
import logo from '../assets/4cb21529e27325b99c96e06426397bce92267e6c.png';

const navigation = [
  { name: 'Dashboard', href: '/affiliate/dashboard', icon: LayoutDashboard },
  { name: 'Promote Products', href: '/affiliate/dashboard#products', icon: Package },
  { name: 'Recommendations', href: '/affiliate/dashboard#recommendations', icon: TrendingUp },
  { name: 'Earnings', href: '/affiliate/dashboard#earnings', icon: DollarSign },
];

export default function AffiliateLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { member, logout, isAffiliateAuthenticated } = useAffiliate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === '/affiliate/login' || pathname === '/affiliate') {
    return <>{children}</>;
  }

  if (!isAffiliateAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/affiliate/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600/75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Image src={logo} alt="Nordic Lux" width={40} height={40} className="h-10 w-10" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Affiliate</h2>
                <p className="text-xs text-blue-600 font-medium">Partner Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href.split('#')[0];
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
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-1">
                <Share2 className="w-4 h-4" />
                Your code
              </div>
              <code className="text-xs bg-white px-2 py-1 rounded border block truncate">
                {member?.affiliateCode}
              </code>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 text-xs font-semibold">
                  {member?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{member?.name}</p>
                <p className="text-xs text-gray-500 truncate">{member?.email}</p>
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

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm font-semibold text-gray-900 hidden sm:inline">
              Nordic Lux Affiliate Program
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {member?.commissionRate}% commission per sale
          </span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
