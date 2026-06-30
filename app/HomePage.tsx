'use client'

import { useState, useEffect, useMemo } from 'react';
import { FilterSidebar, FilterState } from './components/FilterSidebar';
import { Sheet, SheetContent, SheetTitle } from './components/ui/sheet';
import { MarketingSiteChrome } from './components/MarketingSiteChrome';
import { useData } from './contexts/DataContext';
import { collectShopSpecificationTags } from './lib/product-specification-tags';
import {
  buildShopSkinConcernHref,
  buildSweetTreatsChocolateShopHref,
  countProductsForSkinConcern,
  filterSweetTreatsChocolateProducts,
  resolveChocolateCategoryFromCatalog,
  resolveSkincareCategoryFromCatalog,
} from './lib/shop-skin-concern-links';
import type { BlogPost } from './lib/blog-posts';
import type { CmsHomeData } from './lib/cms-types';
import { isCustomSection, mergeHomeSectionRows } from './lib/home-sections';
import { HomeCustomSection, HomeSectionFragment } from './components/HomePageSections';
import acneBlemishesImage from './assets/Acne&Blemishes.jpg';
import antiAgingImage from './assets/againg.jpg';
import darkSpotsImage from './assets/darkspots.jpg';
import oilySkinImage from './assets/oilyskin.jpg';
import drySkinImage from './assets/dryskin.jpg';
import sensitiveSkinImage from './assets/sensitiveskin.jpg';
export type HomePageProps = {
  cmsHome: CmsHomeData;
  blogPosts: BlogPost[];
};

export default function HomePage({ cmsHome, blogPosts }: HomePageProps) {
  const heroVideo = cmsHome.hero?.heroVideoUrl || '/assets/hero-video.mp4';
  const { products: catalogProducts, categories: shopCategories } = useData();
  const availableSpecificationTags = useMemo(
    () => collectShopSpecificationTags(catalogProducts),
    [catalogProducts]
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200],
    selectedBrands: [],
    selectedCategories: [],
    selectedSpecificationTags: [],
  });

  useEffect(() => {
    setFilterOpen(false);
  }, []);

  const whatsappNumber = '94770130299'; // +94 770 130 299

  const handleProductSelect = (product: { name: string; brand?: string; price: number }) => {
    openWhatsApp(product);
  };

  const openWhatsApp = (product?: { name: string; brand?: string; price: number }) => {
    const productToUse = product;
    let message = 'Hello! I\'m interested in ';
    
    if (productToUse) {
      message += `*${productToUse.name}*`;
      if (productToUse.brand) {
        message += ` by ${productToUse.brand}`;
      }
      message += ` ($${productToUse.price.toFixed(2)})`;
      message += '. Can you provide more information about this product?';
    } else {
      message += 'your products. Can you help me?';
    }
    
    const encodedMessage = encodeURIComponent(message);
    // Using the WhatsApp API format: https://api.whatsapp.com/send/?phone=...&text=...
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };

  const skincareCategoryName = useMemo(
    () => resolveSkincareCategoryFromCatalog(catalogProducts),
    [catalogProducts]
  );

  const skinConcerns = useMemo(() => {
    const base = [
      {
        title: 'Acne & Blemishes',
        description: 'Clear breakouts and prevent future blemishes with targeted treatments',
        image: typeof acneBlemishesImage === 'string' ? acneBlemishesImage : acneBlemishesImage.src,
      },
      {
        title: 'Anti-Aging',
        description: 'Reduce wrinkles and boost collagen for youthful, radiant skin',
        image: typeof antiAgingImage === 'string' ? antiAgingImage : antiAgingImage.src,
      },
      {
        title: 'Dark Spots',
        description: 'Even out skin tone and fade discoloration with brightening solutions',
        image: typeof darkSpotsImage === 'string' ? darkSpotsImage : darkSpotsImage.src,
      },
      {
        title: 'Oily Skin',
        description: 'Balance oil production and minimize shine throughout the day',
        image: typeof oilySkinImage === 'string' ? oilySkinImage : oilySkinImage.src,
      },
      {
        title: 'Dry Skin',
        description: 'Restore moisture and nourish dehydrated skin with hydrating solutions',
        image: typeof drySkinImage === 'string' ? drySkinImage : drySkinImage.src,
      },
      {
        title: 'Sensitive Skin',
        description: 'Soothe irritation and calm reactive skin with gentle formulas',
        image: typeof sensitiveSkinImage === 'string' ? sensitiveSkinImage : sensitiveSkinImage.src,
      },
    ];
    return base.map((c) => ({
      ...c,
      productCount: countProductsForSkinConcern(catalogProducts, c.title, skincareCategoryName),
      shopHref: buildShopSkinConcernHref(c.title, skincareCategoryName),
    }));
  }, [catalogProducts, skincareCategoryName]);

  const bestSellerProducts = useMemo(() => catalogProducts.slice(0, 8), [catalogProducts]);

  const chocolateCategoryName = useMemo(
    () => resolveChocolateCategoryFromCatalog(catalogProducts),
    [catalogProducts]
  );
  const allSweetTreatsChocolateProducts = useMemo(
    () => filterSweetTreatsChocolateProducts(catalogProducts),
    [catalogProducts]
  );
  const sweetTreatsChocolateProducts = useMemo(
    () => allSweetTreatsChocolateProducts.slice(0, 8),
    [allSweetTreatsChocolateProducts]
  );
  const sweetTreatsChocolateShopHref = useMemo(
    () => buildSweetTreatsChocolateShopHref(chocolateCategoryName),
    [chocolateCategoryName]
  );
  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const p of catalogProducts) {
      if (p.brand?.trim()) set.add(p.brand.trim());
    }
    return [...set].sort();
  }, [catalogProducts]);

  const sections = useMemo(() => mergeHomeSectionRows(cmsHome.homeSections), [cmsHome.homeSections]);

  return (
    <MarketingSiteChrome
      announcement={cmsHome.announcement}
      headerNavLinks={cmsHome.headerNavLinks}
      headerNavTrackLink={cmsHome.headerNavTrackLink}
      siteMarketingHeader={cmsHome.siteMarketingHeader}
      siteFooterChrome={cmsHome.siteFooterChrome}
    >

      {sections
        .filter((s) => {
          if (!s.enabled) return false;
          if (isCustomSection(s)) return s.published;
          return true;
        })
        .map((row) =>
          isCustomSection(row) ? (
            <HomeCustomSection key={row.id} section={row} />
          ) : (
            <HomeSectionFragment
              key={row.id}
              sectionKey={row.key}
              cmsHome={cmsHome}
              blogPosts={blogPosts}
              heroVideo={heroVideo}
              shopCategories={shopCategories}
              skinConcerns={skinConcerns}
              bestSellerProducts={bestSellerProducts}
              brands={brands}
              allSweetTreatsChocolateProducts={allSweetTreatsChocolateProducts}
              sweetTreatsChocolateProducts={sweetTreatsChocolateProducts}
              sweetTreatsChocolateShopHref={sweetTreatsChocolateShopHref}
              handleProductSelect={handleProductSelect}
            />
          )
        )}

      {/* Mobile Filter Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="left" className="w-full sm:w-96 p-0">
          <SheetTitle className="sr-only">Shop filters</SheetTitle>
          <FilterSidebar 
            onClose={() => setFilterOpen(false)} 
            isMobile 
            filters={filters}
            onFiltersChange={setFilters}
            maxPrice={200}
            availableSpecificationTags={availableSpecificationTags}
          />
        </SheetContent>
      </Sheet>

    </MarketingSiteChrome>
  );
}
