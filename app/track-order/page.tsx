'use client'

import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Package, Search, CheckCircle2, Circle, Truck, MapPin, XCircle } from 'lucide-react';
import Link from 'next/link';
const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: MapPin },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
] as const;

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

export default function TrackOrderPage() {
  const { invoices } = useData();
  const [orderId, setOrderId] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<typeof invoices[0] | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return;
    setSearched(true);
    const order = invoices.find(
      (inv) => inv.orderNumber.toLowerCase() === id.toLowerCase()
    );
    setFoundOrder(order ?? null);
  };

  const currentStepIndex = foundOrder
    ? STATUS_INDEX[foundOrder.status] ?? 0
    : 0;
  const isCancelled = foundOrder?.status === 'cancelled';

  return (
    <div className="bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Track your order</h1>
        <p className="text-gray-600 mb-8">
          Enter your order number (e.g. ORD-12345678) from your confirmation email.
        </p>

        <form onSubmit={handleTrack} className="flex gap-2 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Order number"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button type="submit" className="h-12 px-6">Track</Button>
        </form>

        {searched && (
          <>
            {foundOrder ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Order</p>
                  <p className="text-xl font-bold text-gray-900">#{foundOrder.orderNumber}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on {new Date(foundOrder.createdAt).toLocaleDateString()}
                  </p>
                  {isCancelled && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Order cancelled
                    </div>
                  )}
                </div>

                {!isCancelled && (
                  <div className="p-6">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-6">
                      Order status
                    </h2>
                    <div className="relative pl-1">
                      {/* Background track */}
                      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full" />
                      {/* Completed segment */}
                      <div
                        className="absolute left-5 top-0 w-0.5 bg-primary rounded-full transition-all duration-300"
                        style={{
                          height:
                            currentStepIndex >= 0 && currentStepIndex < STEPS.length
                              ? `${(currentStepIndex / (STEPS.length - 1)) * 100}%`
                              : '0%',
                        }}
                      />
                      <ul className="space-y-0">
                        {STEPS.map((step, index) => {
                          const isCompleted = currentStepIndex > index;
                          const isCurrent = currentStepIndex === index;
                          const Icon = step.icon;
                          return (
                            <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                              <div
                                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                                  isCompleted
                                    ? 'border-primary bg-primary text-white'
                                    : isCurrent
                                    ? 'border-primary bg-white text-primary'
                                    : 'border-gray-200 bg-white text-gray-400'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  <Icon className="h-5 w-5" />
                                )}
                              </div>
                              <div className="pt-1">
                                <p
                                  className={`font-medium ${
                                    isCurrent ? 'text-primary' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                                  }`}
                                >
                                  {step.label}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {isCurrent && 'Current status'}
                                  {isCompleted && 'Completed'}
                                  {!isCurrent && !isCompleted && 'Pending'}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Items</span>
                    <p className="font-medium">{foundOrder.items.length} item(s)</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total</span>
                    <p className="font-medium">${foundOrder.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment</span>
                    <p className="font-medium capitalize">{foundOrder.paymentStatus}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-gray-50 rounded-xl border border-gray-200">
                <Package className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order not found</h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  We couldn&apos;t find an order with that number. Please check the order number from your confirmation email or contact support.
                </p>
                <Button variant="outline" onClick={() => setSearched(false)}>
                  Try another number
                </Button>
              </div>
            )}
          </>
        )}

        <div className="mt-10 text-center">
          <Link href="/shop" className="text-primary hover:underline font-medium">
            ← Back to shop
          </Link>
        </div>
      </main>
    </div>
  );
}
