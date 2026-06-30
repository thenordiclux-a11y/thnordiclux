'use client'

import { useCart } from '../contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Button } from './ui/button';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function CartDrawer() {
  const router = useRouter();
  const { cartItems, cartCount, isOpen, setIsOpen, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();

  const whatsappNumber = '94770130299';

  const openWhatsApp = () => {
    let message = 'Hello! I would like to order the following items:\n\n';
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}*`;
      if (item.product.brand) {
        message += ` by ${item.product.brand}`;
      }
      message += `\n   Quantity: ${item.quantity}\n   Price: $${item.product.price.toFixed(2)} each\n   Subtotal: $${(item.product.price * item.quantity).toFixed(2)}\n\n`;
    });

    const total = getTotal();
    message += `*Total: $${total.toFixed(2)}*\n\n`;
    message += 'Please confirm availability and proceed with the order.';

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-full sm:w-[400px] lg:w-[500px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between w-full">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2 flex-shrink-0">
              <ShoppingCart className="w-6 h-6" aria-hidden />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="text-base font-normal text-muted-foreground">
                  ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                </span>
              )}
            </SheetTitle>
            <div className="w-10 flex-shrink-0" aria-hidden />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Start adding products to your cart
              </p>
              <Button onClick={() => setIsOpen(false)} asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-6 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.productId}`}
                    onClick={() => setIsOpen(false)}
                    className="flex-shrink-0"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 border">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Product Info - extra margin from image */}
                  <div className="flex-1 min-w-0 ml-1">
                    <Link
                      href={`/product/${item.productId}`}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <h4 className="font-semibold text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors">
                        {item.product.name}
                      </h4>
                    </Link>
                    {item.product.brand && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {item.product.brand}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-foreground mt-2">
                      ${item.product.price.toFixed(2)}
                    </p>

                    {/* Out of stock notice */}
                    {typeof item.product.stock === 'number' && item.product.stock === 0 && (
                      <p className="text-xs text-red-600 font-medium mt-1">Out of stock</p>
                    )}

                    {/* Quantity Controls - capped at product stock */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          disabled={typeof item.product.stock === 'number' && item.quantity >= item.product.stock}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Subtotal - more gap above */}
                    <p className="text-sm font-semibold text-foreground mt-4">
                      Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="px-6 py-4 border-t bg-gray-50 flex-col gap-4">
            <div className="w-full space-y-3">
              {/* Summary */}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-2xl text-primary">
                  ${getTotal().toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-foreground hover:bg-primary text-white h-12"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/checkout');
                  }}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200 h-12"
                  onClick={openWhatsApp}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Checkout via WhatsApp
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsOpen(false)}
                    asChild
                  >
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

