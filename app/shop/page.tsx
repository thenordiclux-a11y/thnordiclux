'use client'

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useData, Product } from '../contexts/DataContext';
import { ProductCard } from '../components/ProductCard';
import { FilterSidebar, FilterState } from '../components/FilterSidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Filter, Grid, List, Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import {
  getProductSpecificationTags,
  collectShopSpecificationTags,
  productMatchesSelectedSpecificationTags,
} from '../lib/product-specification-tags';
import { resolveCategoryParamForCatalog } from '../lib/shop-skin-concern-links';
import Link from 'next/link';
import Image from 'next/image';

const SHOP_PAGE_SIZE = 20;

function ShopPageContent() {
  const searchParams = useSearchParams();
  const { products } = useData();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [shopPage, setShopPage] = useState(1);

  // Ensure sheets are closed on mount
  useEffect(() => {
    setMobileFilterOpen(false);
  }, []);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 200;
    return Math.max(10, Math.ceil(Math.max(...products.map(p => p.price)) / 10) * 10);
  }, [products]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.brand?.trim()) set.add(p.brand.trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.category?.trim()) set.add(p.category.trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const availableSpecificationTags = useMemo(
    () => collectShopSpecificationTags(products),
    [products]
  );

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200],
    selectedBrands: [],
    selectedCategories: [],
    selectedSpecificationTags: [],
  });

  // Sync price range when products load (so max price matches your catalog)
  useEffect(() => {
    setFilters((prev) => {
      const currentMax = prev.priceRange[1];
      if (currentMax > maxPrice || (prev.priceRange[0] === 0 && prev.priceRange[1] === 200)) {
        return { ...prev, priceRange: [0, maxPrice] as [number, number] };
      }
      return prev;
    });
  }, [maxPrice]);

  const urlTag = searchParams.get('tag')?.trim() ?? '';
  const urlCategory = searchParams.get('category')?.trim() ?? '';

  /** Stable fingerprint so we re-resolve category names when the catalog’s category set changes, without re-running on every products[] identity change. */
  const catalogCategoriesKey = useMemo(() => {
    return [...new Set(products.map((p) => (p.category ?? '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .join('\u0000');
  }, [products]);

  useEffect(() => {
    if (!urlTag && !urlCategory) return;
    const uniqueCats = catalogCategoriesKey
      ? catalogCategoriesKey.split('\u0000')
      : [];
    setFilters((prev) => {
      const next = { ...prev };
      if (urlCategory) {
        const resolved = resolveCategoryParamForCatalog(urlCategory, uniqueCats);
        next.selectedCategories = resolved ? [resolved] : [];
      } else {
        next.selectedCategories = [];
      }
      if (urlTag) {
        next.selectedSpecificationTags = [urlTag];
      }
      return next;
    });
    setShopPage(1);
  }, [urlTag, urlCategory, catalogCategoriesKey]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product: Product) => {
      // Search filter
      const tagBlob = getProductSpecificationTags(product).join(' ').toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        product.name.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        tagBlob.includes(q);

      // Price filter
      const matchesPrice = product.price >= filters.priceRange[0] && 
                          product.price <= filters.priceRange[1];

      // Brand filter (case-insensitive, trimmed)
      const matchesBrand =
        filters.selectedBrands.length === 0 ||
        (product.brand &&
          filters.selectedBrands.some(
            (b) => b.trim().toLowerCase() === product.brand!.trim().toLowerCase()
          ));

      // Category filter (case-insensitive, trimmed)
      const matchesCategory =
        filters.selectedCategories.length === 0 ||
        filters.selectedCategories.some(
          (c) => c.trim().toLowerCase() === product.category.trim().toLowerCase()
        );

      const matchesSpecificationTags = productMatchesSelectedSpecificationTags(
        product,
        filters.selectedSpecificationTags
      );

      return (
        matchesSearch &&
        matchesPrice &&
        matchesBrand &&
        matchesCategory &&
        matchesSpecificationTags
      );
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [products, searchQuery, filters, sortBy]);

  const totalFiltered = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / SHOP_PAGE_SIZE));
  const currentPage = Math.min(shopPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * SHOP_PAGE_SIZE;
    return filteredAndSortedProducts.slice(start, start + SHOP_PAGE_SIZE);
  }, [filteredAndSortedProducts, currentPage]);

  useEffect(() => {
    setShopPage(1);
  }, [searchQuery, sortBy, filters]);

  useEffect(() => {
    setShopPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const whatsappNumber = '94770130299';

  const handleWhatsAppClick = (product: { name: string; brand?: string; price: number }) => {
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
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${encodedMessage}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };

  const activeFilterCount = filters.selectedBrands.length + 
                           filters.selectedCategories.length + 
                           filters.selectedSpecificationTags.length +
                           (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const removeFilterBrand = (b: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedBrands: prev.selectedBrands.filter((x) => x !== b),
    }));
  };
  const removeFilterCategory = (c: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.filter((x) => x !== c),
    }));
  };
  const removeFilterTag = (t: string) => {
    const tl = t.toLowerCase();
    setFilters((prev) => ({
      ...prev,
      selectedSpecificationTags: prev.selectedSpecificationTags.filter((x) => x.toLowerCase() !== tl),
    }));
  };

  const scrollToSidebar = () => {
    document.getElementById('shop-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="bg-background">
        {/* Shop toolbar — inline heading + controls (scrolls with page) */}
        <div className="bg-white border-b border-gray-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight shrink-0">
                Shop all products
              </h1>
              <span className="text-sm text-muted-foreground shrink-0">
                {totalFiltered}{' '}
                {totalFiltered === 1 ? 'product' : 'products'} match your filters
                {totalFiltered > 0 && (
                  <>
                    {' '}
                    ·{' '}
                    {totalFiltered <= SHOP_PAGE_SIZE
                      ? `showing all ${totalFiltered}`
                      : `showing ${(currentPage - 1) * SHOP_PAGE_SIZE + 1}–${Math.min(currentPage * SHOP_PAGE_SIZE, totalFiltered)} of ${totalFiltered}`}
                  </>
                )}
              </span>

              <div className="flex min-h-9 flex-wrap items-center justify-end gap-2 grow min-w-[min(100%,16rem)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="hidden lg:inline-flex h-9 gap-1.5 text-xs"
                  onClick={scrollToSidebar}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Sidebar filters
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[min(100%,180px)] h-9 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md h-9 overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-none shrink-0"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-none shrink-0"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden h-9 gap-1.5 relative text-xs">
                      <Filter className="w-3.5 h-3.5" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full min-w-[1.125rem] h-[1.125rem] px-0.5 flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                      <SheetHeader className="p-6 border-b">
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
                        <FilterSidebar
                          isMobile={true}
                          onClose={() => setMobileFilterOpen(false)}
                          filters={filters}
                          onFiltersChange={setFilters}
                          maxPrice={maxPrice}
                          availableBrands={availableBrands}
                          availableCategories={availableCategories}
                          availableSpecificationTags={availableSpecificationTags}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
              </div>
            </div>

            <div className="w-full max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products, brands, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 h-10 rounded-lg border border-input bg-background"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Active filter summary */}
            {(filters.selectedBrands.length > 0 ||
              filters.selectedCategories.length > 0 ||
              filters.selectedSpecificationTags.length > 0 ||
              filters.priceRange[0] > 0 ||
              filters.priceRange[1] < maxPrice) && (
              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide shrink-0">
                  Active
                </span>
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
                  <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 font-normal text-xs">
                    ${filters.priceRange[0]} – ${filters.priceRange[1]}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-muted"
                      aria-label="Reset price filter"
                      onClick={() =>
                        setFilters((f) => ({ ...f, priceRange: [0, maxPrice] as [number, number] }))
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.selectedSpecificationTags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 font-normal text-xs">
                    {t}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-muted"
                      aria-label={`Remove ${t}`}
                      onClick={() => removeFilterTag(t)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {filters.selectedBrands.map((b) => (
                  <Badge key={b} variant="outline" className="gap-1 pl-2 pr-1 py-0.5 font-normal text-xs">
                    {b}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-muted"
                      aria-label={`Remove ${b}`}
                      onClick={() => removeFilterBrand(b)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {filters.selectedCategories.map((c) => (
                  <Badge key={c} variant="outline" className="gap-1 pl-2 pr-1 py-0.5 font-normal text-xs">
                    {c}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-muted"
                      aria-label={`Remove ${c}`}
                      onClick={() => removeFilterCategory(c)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      priceRange: [0, maxPrice],
                      selectedBrands: [],
                      selectedCategories: [],
                      selectedSpecificationTags: [],
                    });
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            <aside id="shop-filters" className="hidden lg:block w-72 flex-shrink-0 scroll-mt-28">
              <div className="sticky top-[200px] lg:top-[180px]">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  maxPrice={maxPrice}
                  availableBrands={availableBrands}
                  availableCategories={availableCategories}
                  availableSpecificationTags={availableSpecificationTags}
                />
              </div>
            </aside>

            {/* Products Grid */}
            <main id="shop-products-main" className="flex-1">
              {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">No products found</p>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        priceRange: [0, maxPrice],
                        selectedBrands: [],
                        selectedCategories: [],
                        selectedSpecificationTags: []
                      });
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'flex flex-col gap-4'
                    }
                  >
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        category={product.category}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        image={product.image}
                        badge={product.badge}
                        rating={product.rating}
                        brand={product.brand}
                        productType={product.type}
                        reviews={product.reviews}
                        stock={product.stock}
                        onWhatsAppClick={handleWhatsAppClick}
                      />
                    ))}
                  </div>

                  {totalFiltered > 0 && totalPages > 1 && (
                    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between border-t border-border/60 pt-8">
                      <p className="text-sm text-muted-foreground tabular-nums">
                        Page {currentPage} of {totalPages} · {SHOP_PAGE_SIZE} per page
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={currentPage <= 1}
                          onClick={() => {
                            setShopPage((p) => Math.max(1, p - 1));
                            document.getElementById('shop-products-main')?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            });
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={currentPage >= totalPages}
                          onClick={() => {
                            setShopPage((p) => Math.min(totalPages, p + 1));
                            document.getElementById('shop-products-main')?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            });
                          }}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen w-full bg-background" aria-busy="true" aria-label="Loading shop" />}
    >
      <ShopPageContent />
    </Suspense>
  );
}
