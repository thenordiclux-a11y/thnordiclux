'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { CartProvider } from './contexts/CartContext'
import { AffiliateProvider } from './contexts/AffiliateContext'
import { AffiliateReferralCapture } from './components/AffiliateReferralCapture'

const SupportChatWidget = dynamic(
  () => import('./components/SupportChatWidget').then((m) => m.SupportChatWidget),
  { ssr: false, loading: () => null }
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <AffiliateProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <AffiliateReferralCapture />
            </Suspense>
            {children}
            <SupportChatWidget />
            <Toaster position="top-center" richColors closeButton />
          </CartProvider>
        </AffiliateProvider>
      </DataProvider>
    </AuthProvider>
  )
}

