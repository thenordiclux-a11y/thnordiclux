import { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { X, ChevronDown, Tags, DollarSign, Tag, LayoutGrid } from 'lucide-react';
import { cn } from './ui/utils';

export interface FilterState {
  priceRange: [number, number];
  selectedBrands: string[];
  selectedCategories: string[];
  /** Specification tags (from products); OR match if product has any selected tag. */
  selectedSpecificationTags: string[];
}

interface FilterSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply?: () => void;
  onClear?: () => void;
  maxPrice?: number;
  availableBrands?: string[];
  availableCategories?: string[];
  /** Distinct tags from your catalog (admin-defined per product). */
  availableSpecificationTags?: string[];
}

const DEFAULT_BRANDS = [
  'The Ordinary',
  'CeraVe',
  'La Roche-Posay',
  'Neutrogena',
  'Cetaphil',
  "Paula's Choice",
  'First Aid Beauty',
  'Drunk Elephant',
];

const DEFAULT_CATEGORIES = [
  'Cleanser',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Toner',
  'Mask',
  'Eye Care',
  'Treatment',
];

function FilterSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
  badgeCount,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badgeCount?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0 mb-4 last:mb-0">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-1 text-left rounded-md hover:bg-gray-50 -mx-1 px-1 transition-colors">
        <span className="flex items-center gap-2 font-semibold text-sm text-gray-900">
          <Icon className="w-4 h-4 text-primary shrink-0" />
          {title}
          {badgeCount != null && badgeCount > 0 && (
            <span className="text-[10px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full tabular-nums">
              {badgeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function FilterSidebar({
  onClose,
  isMobile,
  filters,
  onFiltersChange,
  onApply,
  onClear,
  maxPrice = 200,
  availableBrands,
  availableCategories,
  availableSpecificationTags = [],
}: FilterSidebarProps) {
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);
  const brands =
    availableBrands && availableBrands.length > 0 ? availableBrands : DEFAULT_BRANDS;
  const categories =
    availableCategories && availableCategories.length > 0
      ? availableCategories
      : DEFAULT_CATEGORIES;

  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
  }, [filters.priceRange]);

  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]] as [number, number],
    });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.selectedBrands.includes(brand)
      ? filters.selectedBrands.filter((b) => b !== brand)
      : [...filters.selectedBrands, brand];
    onFiltersChange({ ...filters, selectedBrands: newBrands });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.selectedCategories.includes(category)
      ? filters.selectedCategories.filter((c) => c !== category)
      : [...filters.selectedCategories, category];
    onFiltersChange({ ...filters, selectedCategories: newCategories });
  };

  const toggleSpecificationTag = (tag: string) => {
    const lower = tag.toLowerCase();
    const idx = filters.selectedSpecificationTags.findIndex((t) => t.toLowerCase() === lower);
    const next =
      idx >= 0
        ? filters.selectedSpecificationTags.filter((_, i) => i !== idx)
        : [...filters.selectedSpecificationTags, tag];
    onFiltersChange({ ...filters, selectedSpecificationTags: next });
  };

  const handleClear = () => {
    const clearedFilters: FilterState = {
      priceRange: [0, maxPrice],
      selectedBrands: [],
      selectedCategories: [],
      selectedSpecificationTags: [],
    };
    onFiltersChange(clearedFilters);
    setLocalPriceRange([0, maxPrice]);
    onClear?.();
  };

  const activeCount =
    filters.selectedBrands.length +
    filters.selectedCategories.length +
    filters.selectedSpecificationTags.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div
      className={cn(
        'bg-gradient-to-b from-gray-50/80 to-white',
        isMobile ? 'h-full overflow-y-auto' : 'rounded-2xl border border-gray-200/80 shadow-sm ring-1 ring-black/[0.02]'
      )}
    >
      <div className={cn('p-5', !isMobile && 'p-6')}>
        {(activeCount > 0 || isMobile) && (
          <div className="flex items-center justify-end gap-1 shrink-0 mb-4">
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-primary" onClick={handleClear}>
                Clear all
              </Button>
            )}
            {isMobile && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close filters">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        <FilterSection
          title="Category"
          icon={LayoutGrid}
          badgeCount={filters.selectedCategories.length}
        >
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center gap-2.5">
                <Checkbox
                  id={`sc-${cat}`}
                  checked={filters.selectedCategories.includes(cat)}
                  onCheckedChange={() => handleCategoryToggle(cat)}
                />
                <Label htmlFor={`sc-${cat}`} className="text-sm cursor-pointer leading-tight font-normal">
                  {cat}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Brand" icon={Tag} badgeCount={filters.selectedBrands.length}>
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center gap-2.5">
                <Checkbox
                  id={`sb-${brand}`}
                  checked={filters.selectedBrands.includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <Label htmlFor={`sb-${brand}`} className="text-sm cursor-pointer leading-tight font-normal">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Product tags" icon={Tags} badgeCount={filters.selectedSpecificationTags.length}>
          {availableSpecificationTags.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No tags in your catalog yet. Add tags in Admin → Products.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {availableSpecificationTags.map((tag) => {
                const on = filters.selectedSpecificationTags.some(
                  (t) => t.toLowerCase() === tag.toLowerCase()
                );
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleSpecificationTag(tag)}
                    className={cn(
                      'text-left text-xs px-3 py-2 rounded-full border transition-all',
                      on
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary/5'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </FilterSection>

        <FilterSection
          title="Price"
          icon={DollarSign}
          badgeCount={
            filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : undefined
          }
        >
          <Slider
            value={localPriceRange}
            onValueChange={handlePriceChange}
            max={maxPrice}
            step={5}
            className="mb-3"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="rounded-md bg-white border px-2 py-1 tabular-nums">${localPriceRange[0]}</span>
            <span className="text-[10px] uppercase tracking-wider">to</span>
            <span className="rounded-md bg-white border px-2 py-1 tabular-nums">${localPriceRange[1]}</span>
          </div>
        </FilterSection>

        <div className="space-y-2 pt-2">
          {onApply && (
            <Button onClick={onApply} className="w-full bg-foreground hover:bg-foreground/90 text-white">
              Apply filters
            </Button>
          )}
          <Button variant="outline" className="w-full border-dashed" onClick={handleClear}>
            Reset everything
          </Button>
        </div>
      </div>
    </div>
  );
}
