import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import type { Product } from '../contexts/DataContext';

function mergeSpecificationTagArrays(a: unknown, b: unknown): string[] | undefined {
  const parse = (x: unknown): string[] =>
    Array.isArray(x) ? x.filter((t): t is string => typeof t === 'string') : [];
  const raw = [...parse(a), ...parse(b)]
    .map((t) => t.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out.length > 0 ? out : undefined;
}

type ProductRow = {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  price: number;
  original_price: number | null;
  image: string;
  images: string | null; // JSON array of image URLs
  badge: string | null;
  rating: number;
  country: string;
  reviews: number;
  description: string | null;
  stock: number;
  sku: string;
  type: string | null;
  overview: string | null;
  ingredients: Product['ingredients'] | null;
  benefits: string[] | null;
  how_to_use: string[] | null;
  tips: string[] | null;
  skin_concerns?: string[] | null;
  specification_tags?: string[] | null;
  created_at: string;
  updated_at: string;
};

/** Columns for shop/home cards — excludes heavy detail fields (ingredients, overview, etc.). */
const PRODUCT_CATALOG_COLUMNS =
  'id,name,brand,category,price,original_price,image,images,badge,rating,country,reviews,description,stock,sku,type,specification_tags,skin_concerns,created_at,updated_at';

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? undefined,
    category: row.category,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    image: row.image,
    images:
      row.images != null && row.images !== ''
        ? (() => {
            try {
              return (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) as string[];
            } catch {
              return undefined;
            }
          })()
        : undefined,
    badge: row.badge ?? undefined,
    rating: row.rating ?? 5,
    country: row.country ?? 'USA',
    reviews: row.reviews ?? 0,
    description: row.description ?? undefined,
    stock: row.stock,
    sku: row.sku,
    type: row.type ?? undefined,
    overview: row.overview ?? undefined,
    ingredients: row.ingredients ?? undefined,
    benefits: row.benefits ?? undefined,
    howToUse: row.how_to_use ?? undefined,
    tips: row.tips ?? undefined,
    specificationTags: mergeSpecificationTagArrays(row.specification_tags, row.skin_concerns),
    skinConcerns: undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function productToRow(p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> | Partial<Product>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.brand !== undefined) row.brand = p.brand ?? null;
  if (p.category !== undefined) row.category = p.category;
  if (p.price !== undefined) row.price = p.price;
  if (p.originalPrice !== undefined) row.original_price = p.originalPrice ?? null;
  if (p.image !== undefined) row.image = p.image;
  if (p.images !== undefined) row.images = p.images?.length ? JSON.stringify(p.images) : null;
  if (p.badge !== undefined) row.badge = p.badge ?? null;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.country !== undefined) row.country = p.country;
  if (p.reviews !== undefined) row.reviews = p.reviews;
  if (p.description !== undefined) row.description = p.description ?? null;
  if (p.stock !== undefined) row.stock = p.stock;
  if (p.sku !== undefined) row.sku = p.sku;
  if (p.type !== undefined) row.type = p.type ?? null;
  if (p.overview !== undefined) row.overview = p.overview ?? null;
  if (p.ingredients !== undefined) row.ingredients = p.ingredients ?? null;
  if (p.benefits !== undefined) row.benefits = p.benefits ?? null;
  if (p.howToUse !== undefined) row.how_to_use = p.howToUse ?? null;
  if (p.tips !== undefined) row.tips = p.tips ?? null;
  if (p.specificationTags !== undefined) {
    row.specification_tags = p.specificationTags?.length ? p.specificationTags : null;
    row.skin_concerns = null;
  }
  if (p.skinConcerns !== undefined) {
    row.skin_concerns = p.skinConcerns?.length ? p.skinConcerns : null;
  }
  return row;
}

export async function fetchProductsFromSupabase(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
  if (error) {
    console.warn('[products-db] fetchProducts error:', error.message);
    return [];
  }
  const rows = (data ?? []) as ProductRow[];
  return rows.map(rowToProduct);
}

/** Lighter query for storefront — skips heavy jsonb detail columns. */
export async function fetchProductsCatalogFromSupabase(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_CATALOG_COLUMNS)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('[products-db] fetchProductsCatalog error:', error.message);
    return fetchProductsFromSupabase();
  }
  const rows = (data ?? []) as ProductRow[];
  return rows.map(rowToProduct);
}

export async function fetchProductByIdFromSupabase(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error || !data) {
    console.warn('[products-db] fetchProductById error:', error?.message);
    return null;
  }
  return rowToProduct(data as ProductRow);
}

export async function insertProduct(p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const row = productToRow(p);
  const { data, error } = await supabase.from('products').insert(row).select('*').single();
  if (error) {
    console.warn('[products-db] insertProduct error:', error.message);
    return null;
  }
  return rowToProduct(data as ProductRow);
}

export async function insertProducts(
  items: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Product[]> {
  if (!isSupabaseConfigured() || items.length === 0) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const rows = items.map((p) => productToRow(p));
  const { data, error } = await supabase.from('products').insert(rows).select('*');
  if (error) {
    console.warn('[products-db] insertProducts error:', error.message);
    return [];
  }
  const products = (data ?? []) as ProductRow[];
  return products.map(rowToProduct);
}

export async function updateProductInSupabase(id: string, updates: Partial<Product>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const row = productToRow(updates);
  const { error } = await supabase.from('products').update(row).eq('id', id);
  if (error) {
    console.warn('[products-db] updateProduct error:', error.message);
    return false;
  }
  return true;
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.warn('[products-db] deleteProduct error:', error.message);
    return false;
  }
  return true;
}

export { isSupabaseConfigured };
