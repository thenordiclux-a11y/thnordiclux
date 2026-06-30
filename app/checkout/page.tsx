'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, ShoppingCart, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Customer Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Shipping Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Shipping Method
    shippingMethod: 'standard', // standard, express
    
    // Payment Method
    paymentMethod: 'card', // card, paypal, bank_transfer
  });

  const subtotal = getTotal();
  const shippingCost = formData.shippingMethod === 'express' ? 15.00 : 5.00;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate customer info
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        alert('Please fill in all customer information fields');
        return;
      }
    } else if (step === 2) {
      // Validate shipping address
      if (!formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
        alert('Please fill in all shipping address fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navigate to payment page
    const orderData = {
      ...formData,
      items: cartItems,
      subtotal,
      shipping: shippingCost,
      tax,
      total,
    };
    
    // Store order data in sessionStorage for payment page
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    
    router.push('/checkout/payment');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add items to your cart to proceed with checkout</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex flex-col items-center flex-1`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        step >= s 
                          ? 'bg-primary border-primary text-white' 
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        {step > s ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <span>{s}</span>
                        )}
                      </div>
                      <span className={`text-xs mt-2 ${step >= s ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                        {s === 1 ? 'Customer Info' : s === 2 ? 'Shipping' : 'Review'}
                      </span>
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-gray-300'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Customer Information */}
            {step === 1 && (
              <div className="bg-white rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Customer Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {step === 2 && (
              <div className="bg-white rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Shipping Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={formData.shippingMethod === 'standard'}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">Standard Shipping</div>
                        <div className="text-sm text-muted-foreground">5-7 business days</div>
                      </div>
                      <div className="font-semibold">$5.00</div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={formData.shippingMethod === 'express'}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">Express Shipping</div>
                        <div className="text-sm text-muted-foreground">2-3 business days</div>
                      </div>
                      <div className="font-semibold">$15.00</div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="bg-white rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold">Review Your Order</h2>
                
                {/* Customer Info Summary */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                    <p><span className="font-medium">Email:</span> {formData.email}</p>
                    <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                  </div>
                </div>

                {/* Shipping Address Summary */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="text-sm">
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                    <p>{formData.country}</p>
                    <p className="mt-2">
                      <span className="font-medium">Method:</span> {
                        formData.shippingMethod === 'express' ? 'Express (2-3 days)' : 'Standard (5-7 days)'
                      }
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.product.name}</h4>
                          {item.product.brand && (
                            <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                          )}
                          <p className="text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={handleNext} className="flex-1">
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handlePlaceOrder} 
                  className="flex-1 bg-foreground hover:bg-primary text-white"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
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
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

