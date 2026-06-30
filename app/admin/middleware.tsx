'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export function AdminMiddleware({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
      if (!isAuthenticated || !isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [isAuthenticated, isAdmin, pathname, router]);

  if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated || !isAdmin) {
      return null;
    }
  }

  return <>{children}</>;
}

