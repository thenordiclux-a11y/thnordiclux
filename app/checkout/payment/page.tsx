'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '../../contexts/CartContext';
import { useData } from '../../contexts/DataContext';
import { useAffiliate } from '../../contexts/AffiliateContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: string;
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { addInvoice, addCustomer, updateCustomer, customers } = useData();
  const { recordConversion } = useAffiliate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank_transfer'>('card');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  // Card payment form
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    // Load order data from sessionStorage
    const stored = sessionStorage.getItem('orderData');
    if (stored) {
      setOrderData(JSON.parse(stored));
    } else {
      // Redirect to checkout if no order data
      router.push('/checkout');
    }
  }, [router]);

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    }
    // Format CVV
    else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handlePayment = async () => {
    if (paymentMethod === 'card') {
      if (!cardData.cardNumber || !cardData.cardName || !cardData.expiryDate || !cardData.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
      if (cardData.cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return;
      }
    }

    if (!orderData) return;
    setLoading(true);
    setPaymentFailed(false);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
      const customerName = `${orderData.firstName} ${orderData.lastName}`.trim() || 'Customer';
      const existingCustomer = customers.find((c) => c.email.toLowerCase() === orderData.email.toLowerCase());
      const customerId = existingCustomer
        ? existingCustomer.id
        : await addCustomer({
            name: customerName,
            email: orderData.email,
            phone: orderData.phone || undefined,
            address: orderData.address || undefined,
            city: orderData.city || undefined,
            country: orderData.country || undefined,
          });

      if (existingCustomer) {
        await updateCustomer(customerId, {
          orders: existingCustomer.orders + 1,
          totalSpent: existingCustomer.totalSpent + orderData.total,
          lastOrderAt: new Date().toISOString(),
        });
      }

      await addInvoice({
        orderNumber,
        customerId,
        customerName,
        customerEmail: orderData.email,
        customerPhone: orderData.phone || undefined,
        shippingAddress: orderData.address
          ? {
              address: orderData.address,
              city: orderData.city,
              state: orderData.state,
              zipCode: orderData.zipCode,
              country: orderData.country,
            }
          : undefined,
        items: orderData.items.map((item: any) => ({
          productId: String(item.productId),
          productName: item.product?.name || 'Product',
          quantity: item.quantity,
          price: item.product?.price ?? 0,
        })),
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        status: 'pending',
        paymentStatus: 'paid',
      });

      recordConversion(orderNumber, orderNumber, orderData.total);

      const emailRes = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          customerName,
          customerEmail: orderData.email,
          total: orderData.total,
          items: orderData.items.map((item: any) => ({
            productName: item.product?.name || 'Product',
            quantity: item.quantity,
            price: item.product?.price ?? 0,
          })),
        }),
      });
      if (!emailRes.ok) {
        console.warn('Order email request failed');
      }

      sessionStorage.setItem('lastOrderNumber', orderNumber);
      clearCart();
      setPaymentSuccess(true);
      toast.success('Order placed successfully! Confirmation email sent.');
      setTimeout(() => router.push('/checkout/success'), 3000);
    } catch (err) {
      setPaymentFailed(true);
      toast.error('Payment failed. Please try again or use another method.');
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">No order found</h1>
          <p className="text-muted-foreground mb-6">Redirecting to checkout...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 max-w-md">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to order confirmation...</p>
        </div>
      </div>
    );
  }

  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t process your payment. Please check your details and try again, or choose another payment method.
          </p>
          <Button onClick={() => setPaymentFailed(false)} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                    className="w-4 h-4"
                  />
                  <CreditCard className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-semibold">Credit/Debit Card</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, Amex</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'paypal')}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">PayPal</div>
                    <div className="text-sm text-muted-foreground">Pay with your PayPal account</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'bank_transfer')}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">Bank Transfer</div>
                    <div className="text-sm text-muted-foreground">Direct bank transfer</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h3 className="font-semibold">Card Details</h3>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={handleCardInputChange}
                    maxLength={19}
                  />
                </div>
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    name="cardName"
                    placeholder="John Doe"
                    value={cardData.cardName}
                    onChange={handleCardInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardData.expiryDate}
                      onChange={handleCardInputChange}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={handleCardInputChange}
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            )}

            {/* PayPal Payment */}
            {paymentMethod === 'paypal' && (
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  You will be redirected to PayPal to complete your payment
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Pay with PayPal'}
                </Button>
              </div>
            )}

            {/* Bank Transfer */}
            {paymentMethod === 'bank_transfer' && (
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h3 className="font-semibold">Bank Transfer Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p><span className="font-medium">Bank Name:</span> Nordic Lux Bank</p>
                  <p><span className="font-medium">Account Number:</span> 1234567890</p>
                  <p><span className="font-medium">Routing Number:</span> 987654321</p>
                  <p><span className="font-medium">SWIFT Code:</span> NORDLUX</p>
                  <p className="pt-2 text-muted-foreground">
                    Please include your order number in the transfer reference. 
                    Your order will be processed once payment is confirmed.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Bank Transfer'}
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {orderData.items.map((item: any) => (
                  <div key={item.productId} className="flex gap-3 text-sm">
                    <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 border flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">{item.product.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${orderData.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${orderData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">${orderData.total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-foreground hover:bg-primary text-white"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Processing Payment...' : `Pay $${orderData.total.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

