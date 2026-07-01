import type { Metadata } from 'next'
import { Providers } from './providers'
import { AdminMiddleware } from './admin/middleware'
import { AffiliateMiddleware } from './affiliate/middleware'
import WhatsAppButton from './components/WhatsAppButton'
import AIChatWidget from './components/AIChatWidget'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nordic Lux - Premium Beauty Products',
  description: 'Shop authentic skincare and beauty products from trusted US and Canadian brands.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <AffiliateMiddleware>
            <AdminMiddleware>{children}</AdminMiddleware>
          </AffiliateMiddleware>
          <WhatsAppButton />
          <AIChatWidget />
        </Providers>
      </body>
    </html>
  )
}

