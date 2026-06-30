'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ProductCard } from './ProductCard';
import { CategoryCard } from './CategoryCard';
import { SkinConcernCard } from './SkinConcernCard';
import { BlogSummaryCarousel } from './BlogSummaryCarousel';
import { PromoBanner } from './PromoBanner';
import { BrandLogo } from './BrandLogo';
import type { BlogPost } from '../lib/blog-posts';
import type { CmsHomeBrandItem, CmsHomeData } from '../lib/cms-types';
import type { HomeCustomSectionRow, HomeSectionKey } from '../lib/home-sections';
import type { Category, Product } from '../contexts/DataContext';
import { CmsBlocksView, homeCustomLayoutToPageLayout, sectionOuterWidthClass } from './CmsBlocksView';
import { HeroScrollBottleAccent } from './HeroScrollBottleAccent';

export type HomePageSkinConcern = {
  title: string;
  description: string;
  image: string;
  productCount: number;
  shopHref: string;
};

export type HomeSectionsRenderProps = {
  sectionKey: HomeSectionKey;
  cmsHome: CmsHomeData;
  blogPosts: BlogPost[];
  heroVideo: string;
  shopCategories: Category[];
  skinConcerns: HomePageSkinConcern[];
  bestSellerProducts: Product[];
  brands: string[];
  allSweetTreatsChocolateProducts: Product[];
  sweetTreatsChocolateProducts: Product[];
  sweetTreatsChocolateShopHref: string;
  handleProductSelect: (product: { name: string; brand?: string; price: number }) => void;
};

export function HomeSectionFragment({
  sectionKey,
  cmsHome,
  blogPosts,
  heroVideo,
  shopCategories,
  skinConcerns,
  bestSellerProducts,
  brands,
  allSweetTreatsChocolateProducts,
  sweetTreatsChocolateProducts,
  sweetTreatsChocolateShopHref,
  handleProductSelect,
}: HomeSectionsRenderProps) {
  const h = cmsHome.hero;
  const promos = cmsHome.promoBanners ?? [];
  const blogSec = cmsHome.blogSection;
  const news = cmsHome.newsletter;

  switch (sectionKey) {
    case 'hero':
      return (
        <>
      {/* Hero Section */}
      <HeroScrollBottleAccent>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-github
              gflex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                <span className="text-xs uppercase tracking-widest text-primary">{h?.badge}</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl text-foreground tracking-tight">
                  {h?.titleLine1}
                  <br />
                  <span className="text-primary">{h?.titleAccent}</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  {h?.subtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={h?.primaryCtaHref || '/shop'}>
                  <Button className="bg-foreground hover:bg-primary text-white rounded-lg px-8 h-12 shadow-lg hover:shadow-xl transition-all">
                    {h?.primaryCtaLabel}
                  </Button>
                </Link>
                <Button variant="outline" className="rounded-lg px-8 h-12 border-gray-300 hover:border-primary hover:bg-gray-50">
                  {h?.secondaryCtaLabel}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">✓</span>
                  </div>
                  <div className="text-sm">
                    <div className="text-foreground">100% Authentic</div>
                    <div className="text-muted-foreground text-xs">Guaranteed</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🚚</span>
                  </div>
                  <div className="text-sm">
                    <div className="text-foreground">Free Shipping</div>
                    <div className="text-muted-foreground text-xs">Orders over $50</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Video */}
            <div className="relative">
              {/* Floating Stats Card - Top */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 z-10">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-3xl text-foreground">{h?.statValue}</div>
                    <div className="text-sm text-muted-foreground">{h?.statLabel}</div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-white" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center">
                <video
                  className="w-full h-full object-cover object-center"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                >
                  <source src={heroVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </HeroScrollBottleAccent>
        </>
      );
    case 'promo_banners':
      return (
        <>
      {/* Promo Banners */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {promos.map((banner, i) => (
              <PromoBanner
                key={`${banner.title}-${i}`}
                title={banner.title}
                subtitle={banner.subtitle}
                buttonText={banner.buttonText}
                image={banner.image}
                theme={banner.theme === 'secondary' ? 'secondary' : 'primary'}
              />
            ))}
          </div>
        </div>
      </section>
        </>
      );
    case 'skin_concerns':
      return (
        <>
      {/* Skin Concerns Section */}
      <section id="concerns" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Targeted Solutions</p>
            <h2 className="text-4xl mb-4">Shop by Skin Concern</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect products for your unique skincare needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skinConcerns.map((concern) => (
              <SkinConcernCard
                key={concern.title}
                title={concern.title}
                description={concern.description}
                image={concern.image}
                productCount={concern.productCount}
                href={concern.shopHref}
              />
            ))}
          </div>
        </div>
      </section>
        </>
      );
    case 'categories':
      return (
        <>
      {/* Categories */}
      <section id="categories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Browse Collections</p>
            <h2 className="text-4xl mb-4">Shop by Category</h2>
          </div>

          {shopCategories.length === 0 ? (
            <p className="text-center text-muted-foreground max-w-lg mx-auto">
              No categories yet. Add categories in the admin to show them here with live product counts.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shopCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  count={category.count}
                  image={category.image}
                />
              ))}
            </div>
          )}
        </div>
      </section>
        </>
      );
    case 'best_sellers':
      return (
        <>
      {/* Best Sellers */}
      <section id="shop" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary mb-3">Top Rated</p>
              <h2 className="text-4xl mb-2">Best Sellers</h2>
              <p className="text-muted-foreground">
                Customer favorites from top brands
              </p>
            </div>
            <Button variant="outline" className="hidden sm:flex rounded-lg border-gray-300 hover:border-primary" asChild>
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>

          {bestSellerProducts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No products in the catalog yet. Add products in the admin to show them here.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {bestSellerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={String(product.id)}
                  name={product.name}
                  brand={product.brand}
                  category={product.category}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  badge={product.badge}
                  rating={product.rating}
                  productType={product.type}
                  reviews={product.reviews}
                  stock={product.stock ?? 0}
                  onWhatsAppClick={handleProductSelect}
                />
              ))}
            </div>
          )}
        </div>
      </section>
        </>
      );
    case 'brands': {
      const sb = cmsHome.shopByBrandSection;
      const cmsItems: CmsHomeBrandItem[] = (sb?.items ?? []).filter(
        (row) => row.enabled !== false && (row.name?.trim() || row.logoUrl?.trim())
      );
      const useCmsLogos = cmsItems.length > 0;
      const eyebrow = sb?.eyebrow?.trim() || 'Trusted Partners';
      const title = sb?.title?.trim() || 'Shop by Brand';
      const description =
        sb?.description?.trim() || 'Authentic products from the most trusted names in beauty';

      return (
        <>
      {/* Brands Section — logos + copy from CMS when items exist; else catalog brand names */}
      <section id="brands" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">{eyebrow}</p>
            <h2 className="text-4xl mb-4">{title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
          </div>

          {useCmsLogos ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cmsItems.map((row) => (
                <BrandLogo
                  key={row.id}
                  name={row.name?.trim() || 'Brand'}
                  logoUrl={row.logoUrl?.trim() || undefined}
                  href={row.href?.trim() || undefined}
                />
              ))}
            </div>
          ) : brands.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Add brand logos in Admin → CMS → Home (Shop by brand), or add products with brands to your catalog.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {brands.map((brand) => (
                <BrandLogo key={brand} name={brand} href="/shop" />
              ))}
            </div>
          )}
        </div>
      </section>
        </>
      );
    }
    case 'skincare_brands':
      return (
        <>
      {/* Skin Care Brands Section */}
      <section id="skincare-brands" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Premium Skincare</p>
            <h2 className="text-4xl mb-4">Skin Care Items</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover authentic skincare from trusted brands
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[
              { name: 'SKIN 1004 Madagascar Centella', image: 'https://images.unsplash.com/photo-1620917669809-1af0497965de?w=400&h=400&fit=crop&q=80' },
              { name: 'CeraVe', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=80' },
              { name: 'The Ordinary', image: 'https://images.unsplash.com/photo-1723951174326-2a97221d3b7f?w=400&h=400&fit=crop&q=80' },
              { name: 'La Roche Posay', image: 'https://images.unsplash.com/photo-1762840192336-575fba31d28c?w=400&h=400&fit=crop&q=80' },
              { name: 'COSRX', image: 'https://images.unsplash.com/photo-1620917669809-1af0497965de?w=400&h=400&fit=crop&q=80' },
              { name: 'Cetaphil', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=80' },
              { name: 'Kerasistie', image: 'https://images.unsplash.com/photo-1762840192336-575fba31d28c?w=400&h=400&fit=crop&q=80' },
              { name: 'Garnier', image: 'https://images.unsplash.com/photo-1620917669809-1af0497965de?w=400&h=400&fit=crop&q=80' },
              { name: 'Mielle', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&q=80' },
              { name: 'Aveeno', image: 'https://images.unsplash.com/photo-1762840192336-575fba31d28c?w=400&h=400&fit=crop&q=80' },
              { name: 'Purito', image: 'https://images.unsplash.com/photo-1620917669809-1af0497965de?w=400&h=400&fit=crop&q=80' },
            ].map((brand) => (
              <Link key={brand.name} href="/shop" className="group">
                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <img src={brand.image} alt={brand.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="text-center text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {brand.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
        </>
      );
    case 'makeup_perfumes':
      return (
        <>
      {/* Makeup & Perfumes Section */}
      <section id="makeup-perfumes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Luxury Beauty</p>
            <h2 className="text-4xl mb-4">Makeup & Perfumes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Premium cosmetics and fragrances from world-renowned brands
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'YSL', image: 'https://images.unsplash.com/photo-1765852549902-bd9c79d01afb?w=400&h=400&fit=crop&q=80' },
              { name: 'NYX', image: 'https://images.unsplash.com/photo-1765852549902-bd9c79d01afb?w=400&h=400&fit=crop&q=80' },
              { name: 'MAC', image: 'https://images.unsplash.com/photo-1765852549902-bd9c79d01afb?w=400&h=400&fit=crop&q=80' },
              { name: 'L\'Oreal Paris', image: 'https://images.unsplash.com/photo-1765852549902-bd9c79d01afb?w=400&h=400&fit=crop&q=80' },
              { name: 'Dior', image: 'https://images.unsplash.com/photo-1765852549902-bd9c79d01afb?w=400&h=400&fit=crop&q=80' },
              { name: 'Chanel', image: 'https://images.unsplash.com/photo-1765852549902-bd9c79d01afb?w=400&h=400&fit=crop&q=80' },
            ].map((brand) => (
              <Link key={brand.name} href="/shop" className="group">
                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <img src={brand.image} alt={brand.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="text-center text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {brand.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
        </>
      );
    case 'vitamins_minerals':
      return (
        <>
      {/* Vitamins & Minerals Section */}
      <section id="vitamins-minerals" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Health & Wellness</p>
            <h2 className="text-4xl mb-4">Vitamins & Minerals</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Essential nutrients for your daily health
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Fish Oil', image: 'https://images.unsplash.com/photo-1723951174326-2a97221d3b7f?w=400&h=400&fit=crop&q=80' },
              { name: 'Vitamin C', image: 'https://images.unsplash.com/photo-1723951174326-2a97221d3b7f?w=400&h=400&fit=crop&q=80' },
              { name: 'Multi Vitamin', image: 'https://images.unsplash.com/photo-1723951174326-2a97221d3b7f?w=400&h=400&fit=crop&q=80' },
              { name: 'Collagen', image: 'https://images.unsplash.com/photo-1723951174326-2a97221d3b7f?w=400&h=400&fit=crop&q=80' },
              { name: 'Vitamin D', image: 'https://images.unsplash.com/photo-1723951174326-2a97221d3b7f?w=400&h=400&fit=crop&q=80' },
            ].map((item) => (
              <Link key={item.name} href="/shop" className="group">
                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="text-center text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
        </>
      );
    case 'healthy_eating':
      return (
        <>
      {/* Healthy Eating Section */}
      <section id="healthy-eating" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Nutrition</p>
            <h2 className="text-4xl mb-4">Healthy Eating</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Natural and nutritious foods for a healthy lifestyle
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Almonds', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Walnuts', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Pistachio', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Protein Bars', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Chia Seeds', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Flax Seeds', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Pumpkin Seeds', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Dried Fruits', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Sunflower Seeds', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Quinoa', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Oats', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Muesli', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Bee Honey', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
              { name: 'Olive', image: 'https://images.unsplash.com/photo-1606312619070-d48b4e6e5c8e?w=400&h=400&fit=crop&q=80' },
            ].map((item) => (
              <Link key={item.name} href="/shop" className="group">
                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="text-center text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
        </>
      );
    case 'supplements':
      return (
        <>
      {/* Supplements Section */}
      <section id="supplements" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Health Supplements</p>
            <h2 className="text-4xl mb-4">Supplements</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Premium supplements for enhanced wellness
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Protein Powder', image: 'https://images.unsplash.com/photo-1723951174326-2a97221d3b7f?w=400&h=400&fit=crop&q=80' },
              { name: 'Blueberry & Flax Seed Powder', image: 'https://images.unsplash.com/photo-1723951174326-2a97221d3b7f?w=400&h=400&fit=crop&q=80' },
            ].map((item) => (
              <Link key={item.name} href="/shop" className="group">
                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="text-center text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
        </>
      );
    case 'chocolate':
      return (
        <>
      {/* Chocolate Section — products with category Chocolate/Chocolates + product tag Sweet Treats */}
      <section id="chocolate" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 text-center sm:text-left">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary mb-3">Sweet Treats</p>
              <h2 className="text-4xl mb-2">Chocolate</h2>
              <p className="text-muted-foreground max-w-2xl">
                Category Chocolate with the Sweet Treats product tag
                {allSweetTreatsChocolateProducts.length > 0 && (
                  <span className="text-foreground font-medium">
                    {' '}
                    · {allSweetTreatsChocolateProducts.length} product
                    {allSweetTreatsChocolateProducts.length === 1 ? '' : 's'}
                    {allSweetTreatsChocolateProducts.length > 8 ? ' (8 on this page)' : ''}
                  </span>
                )}
              </p>
            </div>
            <Button variant="outline" className="shrink-0 rounded-lg border-gray-300 hover:border-primary self-center sm:self-auto" asChild>
              <Link href={sweetTreatsChocolateShopHref}>View all in shop</Link>
            </Button>
          </div>

          {sweetTreatsChocolateProducts.length === 0 ? (
            <p className="text-center text-muted-foreground max-w-xl mx-auto">
              No products match yet. In Admin → Products, set{' '}
              <span className="font-medium text-foreground">category</span> to Chocolate (or Chocolates) and add the product tag{' '}
              <span className="font-medium text-foreground">Sweet Treats</span>.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {sweetTreatsChocolateProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={String(product.id)}
                  name={product.name}
                  brand={product.brand}
                  category={product.category}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  badge={product.badge}
                  rating={product.rating}
                  productType={product.type}
                  reviews={product.reviews}
                  stock={product.stock ?? 0}
                  onWhatsAppClick={handleProductSelect}
                />
              ))}
            </div>
          )}
        </div>
      </section>
        </>
      );
    case 'blog':
      return (
        <>
      {/* Blog — summary carousel */}
      <section id="blog" className="py-20 bg-gradient-to-br from-rose-50/40 via-white to-violet-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 text-center sm:text-left">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary mb-3">{blogSec?.label}</p>
              <h2 className="text-4xl mb-2">{blogSec?.title}</h2>
              <p className="text-muted-foreground max-w-xl">
                {blogSec?.description}
              </p>
            </div>
            <Button variant="outline" className="shrink-0 rounded-lg border-gray-300 hover:border-primary self-center sm:self-auto" asChild>
              <Link href="/blog">{blogSec?.ctaLabel}</Link>
            </Button>
          </div>
          <BlogSummaryCarousel posts={blogPosts} />
        </div>
      </section>
        </>
      );
    case 'why_choose_us':
      return (
        <>
      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Why Shop With Us?</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '✓', title: '100% Authentic', desc: 'Only genuine products from authorized distributors' },
              { icon: '🚚', title: 'Free Shipping', desc: 'On all orders over $50 within USA & Canada' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free return policy' },
              { icon: '💬', title: '24/7 Support', desc: 'Expert beauty advisors ready to help' }
            ].map((item, i) => (
              <div key={i} className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
        </>
      );
    case 'newsletter':
      return (
        <>
      {/* Newsletter / contact anchor for site chrome footer & mobile nav */}
      <section id="contact" className="py-20 bg-white scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-3xl">💌</span>
            </div>
            <h2 className="text-4xl">{news?.heading}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {news?.subheading}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="rounded-lg bg-gray-50 border-gray-200 h-12 flex-1"
              />
              <Button className="bg-foreground hover:bg-primary text-white rounded-lg px-8 h-12 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
        </>
      );
    default:
      return null;
  }
}

export function HomeCustomSection({ section }: { section: HomeCustomSectionRow }) {
  const pageLayout = homeCustomLayoutToPageLayout(section.layout);
  const outer = sectionOuterWidthClass(pageLayout);

  return (
    <section className="py-16 lg:py-20 bg-white border-t border-gray-100/80">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${outer}`}>
        {section.sectionTitle?.trim() ? (
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center sm:text-left mb-10">
            {section.sectionTitle.trim()}
          </h2>
        ) : null}
        <CmsBlocksView blocks={section.blocks} layout={pageLayout} />
      </div>
    </section>
  );
}
