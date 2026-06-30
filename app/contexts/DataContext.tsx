import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  isSupabaseConfigured,
  fetchProductsFromSupabase,
  fetchProductsCatalogFromSupabase,
  fetchProductByIdFromSupabase,
  insertProduct as insertProductDb,
  insertProducts as insertProductsDb,
  updateProductInSupabase,
  deleteProductFromSupabase,
} from '../lib/products-db';
import {
  fetchCategoriesFromSupabase,
  insertCategory as insertCategoryDb,
  updateCategoryInSupabase,
  deleteCategoryFromSupabase,
  fetchInvoicesFromSupabase,
  insertInvoice as insertInvoiceDb,
  updateInvoiceInSupabase,
  fetchCustomersFromSupabase,
  insertCustomer as insertCustomerDb,
  updateCustomerInSupabase,
  fetchSeoFromSupabase,
  upsertSeoInSupabase,
  fetchUsersFromSupabase,
  insertUser as insertUserDb,
  updateUserInSupabase,
  deleteUserFromSupabase,
} from '../lib/dashboard-db';
import {
  fetchSupportConversationsFromSupabase,
  fetchAllSupportMessagesFromSupabase,
  insertSupportConversationDb,
  insertSupportMessageDb,
  updateSupportConversationStatusDb,
  touchSupportConversationDb,
} from '../lib/support-chat-db';
import { getProductSpecificationTags } from '../lib/product-specification-tags';
import { inferAutoSpecificationTags } from '../lib/infer-auto-specification-tags';
import { getDataLoadScope } from '../lib/data-load-scope';
import { setStoredDebounced } from '../lib/debounce-storage';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Additional images for gallery (main image can be first or separate)
  badge?: string;
  rating: number;
  country: string;
  reviews: number;
  description?: string;
  stock: number;
  sku: string;
  type?: string; // Product type/variant (e.g., "20g", "50g", "100ml")
  createdAt: string;
  updatedAt: string;
  // Detailed product information
  overview?: string;
  ingredients?: Array<{ name: string; percentage?: string; description: string }>;
  benefits?: string[];
  howToUse?: string[];
  tips?: string[];
  /** @deprecated Prefer specificationTags; still merged in shop for older data. */
  skinConcerns?: string[];
  /** Custom specification / filter tags (any product type). */
  specificationTags?: string[];
}

export interface Category {
  id: string;
  name: string;
  count: number;
  image: string;
  description?: string;
  slug: string;
  createdAt: string;
}

export interface InvoiceShippingAddress {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Invoice {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: InvoiceShippingAddress;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  orders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt?: string;
}

export interface SEO {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'customer';
  phone?: string;
  password?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportConversation {
  id: string;
  visitorSessionId: string;
  productId?: string;
  productName?: string;
  status: 'bot' | 'awaiting_agent' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  role: 'bot' | 'user' | 'agent';
  body: string;
  createdAt: string;
  /** Set when an admin sends a reply (account display name at send time). */
  senderName?: string;
}

interface DataContextType {
  products: Product[];
  productsLoading: boolean;
  categories: Category[];
  invoices: Invoice[];
  customers: Customer[];
  seo: SEO[];
  users: User[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addProducts: (products: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  /** One-time sync: push products from localStorage to Supabase, then refetch. Returns { synced, skipped, error? }. */
  syncLocalProductsToSupabase: () => Promise<{ synced: number; skipped: number; error?: string }>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'orders' | 'totalSpent'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  updateSEO: (page: string, seo: Partial<SEO>) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  /** Push users from localStorage to Supabase (skips existing by email), then refetch. */
  syncLocalUsersToSupabase: () => Promise<{ synced: number; skipped: number; error?: string }>;
  supportConversations: SupportConversation[];
  supportMessages: SupportMessage[];
  reloadSupportChats: () => Promise<void>;
  createSupportConversation: (input: {
    visitorSessionId: string;
    productId?: string;
    productName?: string;
  }) => Promise<SupportConversation | null>;
  addSupportMessage: (
    conversationId: string,
    role: SupportMessage['role'],
    body: string,
    senderName?: string
  ) => Promise<SupportMessage | null>;
  setSupportConversationStatus: (
    conversationId: string,
    status: SupportConversation['status']
  ) => Promise<void>;
  /** Fetch full product detail (ingredients, overview, etc.) when catalog row is lean. */
  ensureProductDetails: (productId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Fill missing specification tags: seed catalog match → inferred from name/category/description.
 * Keeps shop skin-concern filters and admin Tags column useful without manual entry.
 */
function applyInferredTagsIfMissing(
  p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
  const asProduct = p as Product;
  if (getProductSpecificationTags(asProduct).length > 0) return p;
  const inferred = inferAutoSpecificationTags(asProduct);
  if (!inferred.length) return p;
  return { ...p, specificationTags: inferred };
}

function enrichProductsWithSeedSpecificationTags(catalog: Product[], seed: Product[]): Product[] {
  const seedById = new Map(seed.map((p) => [p.id, p]));
  const seedBySku = new Map(
    seed.filter((p) => p.sku?.trim()).map((p) => [p.sku.trim().toLowerCase(), p])
  );
  return catalog.map((p) => {
    if (getProductSpecificationTags(p).length > 0) return p;
    const match =
      seedById.get(p.id) ??
      (p.sku?.trim() ? seedBySku.get(p.sku.trim().toLowerCase()) : undefined);
    const seedTags = match?.specificationTags;
    if (seedTags?.length) return { ...p, specificationTags: seedTags };
    const inferred = inferAutoSpecificationTags(p);
    if (inferred.length) return { ...p, specificationTags: inferred };
    return p;
  });
}

function countProductsInCategory(productsList: Product[], categoryName: string): number {
  const n = categoryName.trim().toLowerCase();
  if (!n) return 0;
  return productsList.filter((p) => (p.category ?? '').trim().toLowerCase() === n).length;
}

function productHasFullDetails(p: Product): boolean {
  return !!(
    p.overview ||
    p.ingredients?.length ||
    p.benefits?.length ||
    p.howToUse?.length ||
    p.tips?.length
  );
}

// Safe read from localStorage (client-only, with parse error handling)
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// Safe write to localStorage (handles quota exceeded for large data e.g. many products)
function setStored(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
      console.warn(`[DataContext] localStorage quota exceeded for "${key}". Consider reducing product data (e.g. shorter image URLs) or using a backend.`);
    } else {
      console.warn('[DataContext] Failed to save to localStorage:', e);
    }
  }
}

const defaultSeo: SEO[] = [
  {
    id: '1',
    page: 'home',
    title: 'Nordic Lux - Premium Beauty Products',
    description: 'Shop authentic skincare and beauty products from trusted US and Canadian brands.',
    keywords: 'beauty, skincare, cosmetics, nordic lux',
    updatedAt: new Date().toISOString(),
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const loadScope = getDataLoadScope(pathname);

  // Initialize from localStorage on client so the first render has stored data when not using Supabase.
  const [products, setProducts] = useState<Product[]>(() =>
    enrichProductsWithSeedSpecificationTags(getStored('admin_products', []), [])
  );
  const [productsLoading, setProductsLoading] = useState<boolean>(() => isSupabaseConfigured());
  const [categories, setCategories] = useState<Category[]>(() => getStored('admin_categories', []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStored('admin_invoices', []));
  const [customers, setCustomers] = useState<Customer[]>(() => getStored('admin_customers', []));
  const [seo, setSeo] = useState<SEO[]>(() => getStored('admin_seo', defaultSeo));
  const [users, setUsers] = useState<User[]>(() => getStored('admin_users', []));
  const [supportConversations, setSupportConversations] = useState<SupportConversation[]>(() =>
    getStored('support_conversations', [])
  );
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() =>
    getStored('support_messages', [])
  );

  const rowToSupportConversation = (r: Record<string, unknown>): SupportConversation => ({
    id: String(r.id),
    visitorSessionId: String(r.visitor_session_id),
    productId: r.product_id != null ? String(r.product_id) : undefined,
    productName: r.product_name != null ? String(r.product_name) : undefined,
    status: r.status as SupportConversation['status'],
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  });

  const rowToSupportMessage = (r: Record<string, unknown>): SupportMessage => {
    const sn = r.sender_name;
    const senderName =
      sn != null && String(sn).trim() ? String(sn).trim() : undefined;
    return {
      id: String(r.id),
      conversationId: String(r.conversation_id),
      role: r.role as SupportMessage['role'],
      body: String(r.body),
      createdAt: String(r.created_at),
      ...(senderName ? { senderName } : {}),
    };
  };

  const persistSupport = (convs: SupportConversation[], msgs: SupportMessage[]) => {
    setStored('support_conversations', convs);
    setStored('support_messages', msgs);
  };

  const reloadSupportChats = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSupportConversations(getStored('support_conversations', []));
      setSupportMessages(getStored('support_messages', []));
      return;
    }
    const [rows, messageRows] = await Promise.all([
      fetchSupportConversationsFromSupabase(),
      fetchAllSupportMessagesFromSupabase(),
    ]);
    const convMaps = rows.map((r) => rowToSupportConversation(r as unknown as Record<string, unknown>));
    const allMessages = messageRows.map((m) =>
      rowToSupportMessage(m as unknown as Record<string, unknown>)
    );
    setSupportConversations(convMaps);
    setSupportMessages(allMessages);
    persistSupport(convMaps, allMessages);
  }, []);

  const applyLocalStorageFallback = useCallback(() => {
    setProducts(enrichProductsWithSeedSpecificationTags(getStored('admin_products', []), []));
    setCategories(getStored('admin_categories', []));
    setInvoices(getStored('admin_invoices', []));
    setCustomers(getStored('admin_customers', []));
    setSeo(getStored('admin_seo', defaultSeo));
    setUsers(getStored('admin_users', []));
  }, []);

  // Scope-aware Supabase loading — storefront only fetches catalog data.
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setProductsLoading(false);
      return;
    }
    let cancelled = false;
    setProductsLoading(true);

    const finish = () => {
      if (!cancelled) setProductsLoading(false);
    };

    const loadCatalog = async () => {
      const [productList, categoryList] = await Promise.all([
        loadScope === 'admin'
          ? fetchProductsFromSupabase()
          : fetchProductsCatalogFromSupabase(),
        fetchCategoriesFromSupabase(),
      ]);
      if (cancelled) return;
      setProducts(enrichProductsWithSeedSpecificationTags(productList, []));
      setCategories(categoryList);
    };

    (async () => {
      try {
        await loadCatalog();
        if (cancelled) return;

        if (loadScope === 'checkout') {
          const customerList = await fetchCustomersFromSupabase();
          if (!cancelled) setCustomers(customerList);
        } else if (loadScope === 'admin') {
          const [invoiceList, customerList, seoList, userList] = await Promise.all([
            fetchInvoicesFromSupabase(),
            fetchCustomersFromSupabase(),
            fetchSeoFromSupabase(),
            fetchUsersFromSupabase(),
          ]);
          if (cancelled) return;
          setInvoices(invoiceList);
          setCustomers(customerList);
          setSeo(seoList.length > 0 ? seoList : defaultSeo);
          setUsers(userList);
        }
      } catch {
        if (!cancelled) applyLocalStorageFallback();
      } finally {
        finish();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadScope, applyLocalStorageFallback]);

  // Support inbox: load only on the admin support page (not every admin route).
  useEffect(() => {
    if (loadScope !== 'admin' || !pathname?.startsWith('/admin/support')) return;
    void reloadSupportChats();
  }, [loadScope, pathname, reloadSupportChats]);

  const ensureProductDetails = useCallback(async (productId: string) => {
    const existing = products.find((p) => p.id === productId);
    if (existing && productHasFullDetails(existing)) return;
    if (!isSupabaseConfigured()) return;
    const full = await fetchProductByIdFromSupabase(productId);
    if (!full) return;
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === productId);
      if (idx === -1) return [...prev, full];
      return prev.map((p) => (p.id === productId ? { ...p, ...full } : p));
    });
  }, [products]);

  // Sync to localStorage as cache (debounced to avoid main-thread jank)
  useEffect(() => {
    setStoredDebounced('admin_products', products);
  }, [products]);

  useEffect(() => {
    setStoredDebounced('admin_categories', categories);
  }, [categories]);

  useEffect(() => {
    setStoredDebounced('admin_invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    setStoredDebounced('admin_customers', customers);
  }, [customers]);

  useEffect(() => {
    setStoredDebounced('admin_seo', seo);
  }, [seo]);

  useEffect(() => {
    setStoredDebounced('admin_users', users);
  }, [users]);

  useEffect(() => {
    setStoredDebounced('support_conversations', supportConversations);
  }, [supportConversations]);

  useEffect(() => {
    setStoredDebounced('support_messages', supportMessages);
  }, [supportMessages]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload = applyInferredTagsIfMissing(product);
    if (isSupabaseConfigured()) {
      const inserted = await insertProductDb(payload);
      if (inserted) {
        setProducts((prev) => [...prev, inserted]);
        return;
      }
    }
    const newProduct: Product = {
      ...payload,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const addProducts = async (productsToAdd: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const payloads = productsToAdd.map((p) => applyInferredTagsIfMissing(p));
    if (isSupabaseConfigured() && payloads.length > 0) {
      const inserted = await insertProductsDb(payloads);
      if (inserted.length > 0) {
        setProducts((prev) => [...prev, ...inserted]);
        return;
      }
    }
    const timestamp = Date.now();
    const newProducts: Product[] = payloads.map((product, index) => ({
      ...product,
      id: `${timestamp}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setProducts((prev) => [...prev, ...newProducts]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (isSupabaseConfigured()) {
      const ok = await updateProductInSupabase(id, updates);
      if (ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          )
        );
        return;
      }
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProduct = async (id: string) => {
    if (isSupabaseConfigured()) {
      const ok = await deleteProductFromSupabase(id);
      if (ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return;
      }
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const syncLocalProductsToSupabase = async (): Promise<{
    synced: number;
    skipped: number;
    error?: string;
  }> => {
    if (!isSupabaseConfigured()) {
      return { synced: 0, skipped: 0, error: 'Supabase is not configured' };
    }
    if (typeof window === 'undefined') {
      return { synced: 0, skipped: 0, error: 'Must run in browser' };
    }
    try {
      const raw = localStorage.getItem('admin_products');
      if (!raw) return { synced: 0, skipped: 0, error: 'No local products found' };
      const localProducts: Product[] = JSON.parse(raw);
      if (!Array.isArray(localProducts) || localProducts.length === 0) {
        return { synced: 0, skipped: 0, error: 'No local products to sync' };
      }
      const existing = await fetchProductsFromSupabase();
      const existingSkus = new Set(existing.map((p) => p.sku.toLowerCase()));
      const toSync = localProducts.filter((p) => p.sku && !existingSkus.has(p.sku.toLowerCase()));
      const skipped = localProducts.length - toSync.length;
      if (toSync.length === 0) {
        setProducts(enrichProductsWithSeedSpecificationTags(existing, []));
        return { synced: 0, skipped };
      }
      const payload: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> = toSync.map((p) => ({
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
        images: p.images,
        badge: p.badge,
        rating: p.rating ?? 5,
        country: p.country ?? 'USA',
        reviews: p.reviews ?? 0,
        description: p.description,
        stock: p.stock,
        sku: p.sku,
        type: p.type,
        overview: p.overview,
        ingredients: p.ingredients,
        benefits: p.benefits,
        howToUse: p.howToUse,
        tips: p.tips,
        specificationTags: getProductSpecificationTags(p),
      }));
      const BATCH = 50;
      let synced = 0;
      for (let i = 0; i < payload.length; i += BATCH) {
        const batch = payload.slice(i, i + BATCH);
        const inserted = await insertProductsDb(batch);
        synced += inserted.length;
      }
      const updated = await fetchProductsFromSupabase();
      setProducts(enrichProductsWithSeedSpecificationTags(updated, []));
      return { synced, skipped };
    } catch (e: any) {
      return {
        synced: 0,
        skipped: 0,
        error: e?.message ?? String(e),
      };
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt'>) => {
    if (isSupabaseConfigured()) {
      const inserted = await insertCategoryDb(category);
      if (inserted) {
        setCategories((prev) => [...prev, inserted]);
        return;
      }
      toast.warning('Category could not be saved to the database. It was added locally only.');
    }
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (isSupabaseConfigured()) {
      const ok = await updateCategoryInSupabase(id, updates);
      if (ok) {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
        return;
      }
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = async (id: string) => {
    if (isSupabaseConfigured()) {
      const ok = await deleteCategoryFromSupabase(id);
      if (ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        return;
      }
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isSupabaseConfigured()) {
      const inserted = await insertInvoiceDb(invoice);
      if (inserted) {
        setInvoices((prev) => [inserted, ...prev]);
        return;
      }
    }
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    if (isSupabaseConfigured()) {
      const ok = await updateInvoiceInSupabase(id, updates);
      if (ok) {
        setInvoices((prev) =>
          prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i))
        );
        return;
      }
    }
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i))
    );
  };

  const addCustomer = async (
    customer: Omit<Customer, 'id' | 'createdAt' | 'orders' | 'totalSpent'>
  ): Promise<string> => {
    if (isSupabaseConfigured()) {
      const inserted = await insertCustomerDb(customer);
      if (inserted) {
        setCustomers((prev) => [...prev, inserted]);
        return inserted.id;
      }
    }
    const newId = Date.now().toString();
    const newCustomer: Customer = {
      ...customer,
      id: newId,
      orders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newId;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    if (isSupabaseConfigured()) {
      const ok = await updateCustomerInSupabase(id, updates);
      if (ok) {
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
        return;
      }
    }
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const updateSEO = async (page: string, updates: Partial<SEO>) => {
    if (isSupabaseConfigured()) {
      const ok = await upsertSeoInSupabase(page, updates);
      if (ok) {
        const list = await fetchSeoFromSupabase();
        if (list.length > 0) {
          setSeo(list);
          return;
        }
      }
    }
    const existing = seo.find((s) => s.page === page);
    if (existing) {
      setSeo((prev) =>
        prev.map((s) =>
          s.page === page ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        )
      );
    } else {
      const newSEO: SEO = {
        id: Date.now().toString(),
        page,
        title: '',
        description: '',
        keywords: '',
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setSeo((prev) => [...prev, newSEO]);
    }
  };

  const addUser = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    if (isSupabaseConfigured()) {
      const result = await insertUserDb(user);
      if ('user' in result) {
        setUsers((prev) => [...prev, result.user]);
        return;
      }
      toast.error(`User not saved to Supabase: ${result.error}. Saved locally only. Use "Sync local to Supabase" or fix .env (use anon key from Supabase → Settings → API).`);
      // Fall through to save locally so the user still appears in the list
    }
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (isSupabaseConfigured()) {
      const ok = await updateUserInSupabase(id, updates);
      if (ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u))
        );
        return;
      }
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u))
    );
  };

  const deleteUser = async (id: string) => {
    if (isSupabaseConfigured()) {
      const ok = await deleteUserFromSupabase(id);
      if (ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        return;
      }
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const syncLocalUsersToSupabase = async (): Promise<{
    synced: number;
    skipped: number;
    error?: string;
  }> => {
    if (!isSupabaseConfigured()) {
      return { synced: 0, skipped: 0, error: 'Supabase is not configured' };
    }
    if (typeof window === 'undefined') {
      return { synced: 0, skipped: 0, error: 'Must run in browser' };
    }
    try {
      const raw = localStorage.getItem('admin_users');
      if (!raw) return { synced: 0, skipped: 0, error: 'No local users found' };
      const localUsers: User[] = JSON.parse(raw);
      if (!Array.isArray(localUsers) || localUsers.length === 0) {
        return { synced: 0, skipped: 0, error: 'No local users to sync' };
      }
      const existing = await fetchUsersFromSupabase();
      const existingEmails = new Set(existing.map((u) => u.email.toLowerCase()));
      const toSync = localUsers.filter((u) => u.email && !existingEmails.has(u.email.toLowerCase()));
      const skipped = localUsers.length - toSync.length;
      if (toSync.length === 0) {
        setUsers(existing);
        return { synced: 0, skipped };
      }
      let synced = 0;
      for (const u of toSync) {
        const result = await insertUserDb({
          email: u.email,
          name: u.name,
          role: u.role,
          phone: u.phone,
          password: u.password,
        });
        if ('user' in result) synced += 1;
      }
      const updated = await fetchUsersFromSupabase();
      setUsers(updated);
      return { synced, skipped };
    } catch (e: any) {
      return { synced: 0, skipped: 0, error: e?.message ?? String(e) };
    }
  };

  const createSupportConversation = async (input: {
    visitorSessionId: string;
    productId?: string;
    productName?: string;
  }): Promise<SupportConversation | null> => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured()) {
      const row = await insertSupportConversationDb({
        visitor_session_id: input.visitorSessionId,
        product_id: input.productId ?? null,
        product_name: input.productName ?? null,
        status: 'bot',
      });
      if (row) {
        const c = rowToSupportConversation(row as unknown as Record<string, unknown>);
        setSupportConversations((prev) => [c, ...prev.filter((x) => x.id !== c.id)]);
        return c;
      }
    }
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `local-${Date.now()}`;
    const c: SupportConversation = {
      id,
      visitorSessionId: input.visitorSessionId,
      productId: input.productId,
      productName: input.productName,
      status: 'bot',
      createdAt: now,
      updatedAt: now,
    };
    setSupportConversations((prev) => [c, ...prev]);
    return c;
  };

  const addSupportMessage = async (
    conversationId: string,
    role: SupportMessage['role'],
    body: string,
    senderName?: string
  ): Promise<SupportMessage | null> => {
    const now = new Date().toISOString();
    const agentName =
      role === 'agent' && senderName?.trim() ? senderName.trim() : undefined;
    if (isSupabaseConfigured()) {
      const row = await insertSupportMessageDb(
        conversationId,
        role,
        body,
        agentName
      );
      if (row) {
        const m = rowToSupportMessage(row as unknown as Record<string, unknown>);
        setSupportMessages((prev) => [...prev, m]);
        await touchSupportConversationDb(conversationId);
        setSupportConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, updatedAt: now } : c
          )
        );
        return m;
      }
    }
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `msg-${Date.now()}`;
    const m: SupportMessage = {
      id,
      conversationId,
      role,
      body,
      createdAt: now,
      ...(agentName ? { senderName: agentName } : {}),
    };
    setSupportMessages((prev) => [...prev, m]);
    setSupportConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, updatedAt: now } : c))
    );
    return m;
  };

  const setSupportConversationStatus = async (
    conversationId: string,
    status: SupportConversation['status']
  ) => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured()) {
      await updateSupportConversationStatusDb(conversationId, status);
    }
    setSupportConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, status, updatedAt: now } : c))
    );
  };

  const categoriesWithProductCounts = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        count: countProductsInCategory(products, c.name),
      })),
    [categories, products]
  );

  return (
    <DataContext.Provider
      value={{
        products,
        productsLoading,
        categories: categoriesWithProductCounts,
        invoices,
        customers,
        seo,
        users,
        addProduct,
        addProducts,
        updateProduct,
        deleteProduct,
        syncLocalProductsToSupabase,
        addCategory,
        updateCategory,
        deleteCategory,
        addInvoice,
        updateInvoice,
        addCustomer,
        updateCustomer,
        updateSEO,
        addUser,
        updateUser,
        deleteUser,
        syncLocalUsersToSupabase,
        supportConversations,
        supportMessages,
        reloadSupportChats,
        createSupportConversation,
        addSupportMessage,
        setSupportConversationStatus,
        ensureProductDetails,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

