'use client'

import { useParams, useRouter } from 'next/navigation';
import { useData, Product } from '../../contexts/DataContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ShoppingCart, Heart, ArrowLeft, Star, CheckCircle2, AlertCircle, Sparkles, Droplets, Shield, MessageCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '../../components/ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/ui/carousel';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, ensureProductDetails } = useData();
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const productId = params?.id ? String(params.id) : '';

  useEffect(() => {
    if (productId) void ensureProductDetails(productId);
  }, [productId, ensureProductDetails]);

  const product = products.find(p => p.id === productId);

  // Get similar products (same category or brand, excluding current product)
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => 
        p.id !== product.id && 
        (p.category === product.category || p.brand === product.brand)
      )
      .slice(0, 8);
  }, [products, product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const whatsappNumber = '94770130299';

  const openWhatsApp = () => {
    let message = `Hello! I'm interested in *${product.name}*`;
    if (product.brand) {
      message += ` by ${product.brand}`;
    }
    message += ` ($${product.price.toFixed(2)})`;
    message += '. Can you provide more information about this product?';
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };

  const images =
    product.images && product.images.length > 0
      ? [product.image, ...product.images]
      : [product.image];

  // Format description with proper line breaks
  const formatDescription = (text?: string) => {
    if (!text) return null;
    // Split by newlines and create paragraphs
    const paragraphs = text.split(/\n\n|\n/).filter(p => p.trim());
    return paragraphs.map((para, idx) => (
      <p key={idx} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
        {para.trim()}
      </p>
    ));
  };

  const handleProductSelect = (product: { name: string; brand?: string; price: number }) => {
    openWhatsApp();
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images - main image + thumbnail strip */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
              className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </button>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Badge */}
            <div className="flex items-start justify-between">
              <div>
                {product.brand && (
                  <div className="text-sm uppercase tracking-widest text-primary mb-2">
                    {product.brand}
                  </div>
                )}
                <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < product.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                  {product.type && (
                    <span className="text-sm text-muted-foreground">• {product.type}</span>
                  )}
                </div>
              </div>
              {product.badge && (
                <Badge className="bg-primary text-white">{product.badge}</Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-foreground">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-2xl text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white">-{discount}%</Badge>
                  )}
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600">In Stock ({product.stock} available)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Overview */}
            {product.overview && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Product Overview
                </h3>
                <p className="text-muted-foreground leading-relaxed">{product.overview}</p>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Description
                </h3>
                <div className="space-y-2">
                  {formatDescription(product.description)}
                </div>
              </div>
            )}

            {/* Key Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  Key Ingredients
                </h3>
                <div className="space-y-3">
                  {product.ingredients.map((ingredient, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-semibold text-foreground">
                          {ingredient.name}
                        </span>
                        {ingredient.percentage && (
                          <Badge variant="outline">{ingredient.percentage}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{ingredient.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Main Benefits
                </h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* How to Use */}
            {product.howToUse && product.howToUse.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  How to Use
                </h3>
                <ol className="space-y-2 list-decimal list-inside">
                  {product.howToUse.map((step, idx) => (
                    <li key={idx} className="text-muted-foreground">{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tips & Precautions */}
            {product.tips && product.tips.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Tips & Precautions
                </h3>
                <ul className="space-y-2">
                  {product.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-6 border-t">
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-foreground hover:bg-primary text-white h-12"
                  disabled={product.stock === 0}
                  onClick={() => {
                    if (product.stock > 0) {
                      addToCart(product, 1);
                    }
                  }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200 h-12"
                disabled={product.stock === 0}
                onClick={openWhatsApp}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Check with WhatsApp
              </Button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div>
                <span className="text-sm text-muted-foreground">SKU</span>
                <p className="font-medium">{product.sku}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Category</span>
                <p className="font-medium">{product.category}</p>
              </div>
              {product.type && (
                <div>
                  <span className="text-sm text-muted-foreground">Product type</span>
                  <p className="font-medium">{product.type}</p>
                </div>
              )}
              {product.country && (
                <div>
                  <span className="text-sm text-muted-foreground">Country</span>
                  <p className="font-medium">{product.country}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products Carousel */}
        {similarProducts.length > 0 && (
          <div className="mt-20 py-12 border-t">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Similar Products</h2>
              <p className="text-muted-foreground">You might also like these products</p>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {similarProducts.map((similarProduct) => (
                  <CarouselItem key={similarProduct.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <ProductCard
                      id={similarProduct.id}
                      name={similarProduct.name}
                      brand={similarProduct.brand}
                      category={similarProduct.category}
                      price={similarProduct.price}
                      originalPrice={similarProduct.originalPrice}
                      image={similarProduct.image}
                      badge={similarProduct.badge}
                      rating={similarProduct.rating}
                      productType={similarProduct.type}
                      reviews={similarProduct.reviews}
                      stock={similarProduct.stock}
                      onWhatsAppClick={handleProductSelect}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex -left-12" />
              <CarouselNext className="hidden lg:flex -right-12" />
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
}

