'use client';

import { ShoppingCart, Heart, Eye, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useCart } from '../contexts/CartContext';
import { useData, Product } from '../contexts/DataContext';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating?: number;
  brand?: string;
  productType?: string;
  reviews?: number;
  stock?: number;
  onWhatsAppClick?: (product: { name: string; brand?: string; price: number }) => void;
}

function buildFallbackCartProduct(props: ProductCardProps): Product {
  const now = new Date().toISOString();
  return {
    id: props.id,
    name: props.name,
    brand: props.brand,
    category: props.category,
    price: props.price,
    originalPrice: props.originalPrice,
    image: props.image,
    badge: props.badge,
    rating: props.rating ?? 5,
    country: 'USA',
    reviews: props.reviews ?? 0,
    stock: typeof props.stock === 'number' ? props.stock : 99,
    sku: props.id,
    type: props.productType,
    createdAt: now,
    updatedAt: now,
  };
}

export function ProductCard({
  id,
  name,
  category,
  price,
  originalPrice,
  image,
  badge,
  rating = 5,
  brand,
  productType,
  reviews = 0,
  stock,
  onWhatsAppClick,
}: ProductCardProps) {
  const { products } = useData();
  const { addToCart, setIsOpen } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const cartProduct = useMemo((): Product => {
    const found = products.find((p) => p.id === id);
    return found ?? buildFallbackCartProduct({
      id,
      name,
      category,
      price,
      originalPrice,
      image,
      badge,
      rating,
      brand,
      productType,
      reviews,
      stock,
    });
  }, [products, id, name, category, price, originalPrice, image, badge, rating, brand, productType, reviews, stock]);

  const outOfStock = cartProduct.stock <= 0;

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (outOfStock) return;
    addToCart(cartProduct, 1);
  };

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <Link
          href={`/product/${id}`}
          className="absolute inset-0 z-[1]"
          aria-label={`View ${name}`}
        />
        <img
          src={image}
          alt={name}
          className="relative z-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
        />

        {/* Overlay Actions */}
        <div
          className={`absolute inset-0 z-[5] bg-black/0 group-hover:bg-black/5 transition-all duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute bottom-4 left-0 right-0 px-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
            <Button
              type="button"
              className="w-full bg-white hover:bg-primary text-foreground hover:text-white border-0 shadow-lg h-11"
              disabled={outOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        {/* Badge */}
        {outOfStock && (
          <Badge className="absolute top-3 left-3 z-[15] bg-red-500 text-white border-0 shadow-md pointer-events-none">
            Out of Stock
          </Badge>
        )}
        {!outOfStock && badge && (
          <Badge className="absolute top-3 left-3 z-[15] bg-primary text-white border-0 shadow-md pointer-events-none">
            {badge}
          </Badge>
        )}
        {!outOfStock && discount > 0 && (
          <Badge className="absolute top-3 left-3 z-[15] bg-red-500 text-white border-0 shadow-md pointer-events-none">
            -{discount}%
          </Badge>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-md hover:scale-110"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
              }`}
            />
          </button>
          {onWhatsAppClick && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWhatsAppClick({ name, brand, price });
              }}
              className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-all shadow-md hover:scale-110 opacity-0 group-hover:opacity-100"
              title="Chat about this product"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-md hover:scale-110"
            title="Quick view"
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content — whole block links to product */}
      <Link href={`/product/${id}`} className="block p-4 text-inherit no-underline hover:bg-gray-50/50 transition-colors">
        {brand && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-primary">{brand}</span>
            {productType && (
              <span className="text-xs text-muted-foreground">{productType}</span>
            )}
          </div>
        )}

        <h3 className="text-sm text-foreground line-clamp-2 mb-1 min-h-[2.5rem] group-hover:text-primary transition-colors cursor-pointer">
          {name}
        </h3>

        <p className="text-xs text-muted-foreground mb-2">{category}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {reviews > 0 && (
            <span className="text-xs text-muted-foreground">({reviews})</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-foreground">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </Link>

      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="line-clamp-2 text-left pr-8">{name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 border">
              <img src={image} alt="" className="w-full h-full object-contain" />
            </div>
            {productType && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Type: </span>
                {productType}
              </p>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">${price.toFixed(2)}</span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                className="flex-1 bg-foreground hover:bg-primary text-white"
                disabled={outOfStock}
                onClick={() => {
                  handleAddToCart();
                  setQuickViewOpen(false);
                  setIsOpen(true);
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/product/${id}`} onClick={() => setQuickViewOpen(false)}>
                  Full details
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
