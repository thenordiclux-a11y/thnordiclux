'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { CheckCircle2, Package, Mail, Home } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string>('');
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('lastOrderNumber') : null;
    setOrderNumber(stored || `ORD-${Date.now().toString().slice(-8)}`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-2">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Order Number</p>
          <p className="text-xl font-bold text-primary">{orderNumber}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-left bg-gray-50 rounded-lg p-4">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold">Confirmation Email</p>
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your email address with order details.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-left bg-gray-50 rounded-lg p-4">
            <Package className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold">Shipping Updates</p>
              <p className="text-sm text-muted-foreground">
                You will receive shipping updates via email as your order is processed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/shop">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <Button className="flex-1 bg-foreground hover:bg-primary text-white" asChild>
            <Link href="/admin/orders">
              View Order Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

