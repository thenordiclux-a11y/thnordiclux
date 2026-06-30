import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import type { Category, Invoice, Customer, SEO, User } from '../contexts/DataContext';

// ---------- Categories ----------
export async function fetchCategoriesFromSupabase(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
  if (error) {
    console.warn('[dashboard-db] fetchCategories error:', error.message);
    return [];
  }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    count: r.count ?? 0,
    image: r.image,
    description: r.description ?? undefined,
    slug: r.slug,
    createdAt: r.created_at,
  }));
}

export async function insertCategory(cat: Omit<Category, 'id' | 'createdAt'>): Promise<Category | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('categories')
    .insert({ name: cat.name, count: cat.count ?? 0, image: cat.image, description: cat.description ?? null, slug: cat.slug })
    .select('*')
    .single();
  if (error) {
    console.warn('[dashboard-db] insertCategory error:', error.message);
    return null;
  }
  return { id: data.id, name: data.name, count: data.count ?? 0, image: data.image, description: data.description ?? undefined, slug: data.slug, createdAt: data.created_at };
}

export async function updateCategoryInSupabase(id: string, updates: Partial<Category>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const row: any = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.count !== undefined) row.count = updates.count;
  if (updates.image !== undefined) row.image = updates.image;
  if (updates.description !== undefined) row.description = updates.description ?? null;
  if (updates.slug !== undefined) row.slug = updates.slug;
  const { error } = await supabase.from('categories').update(row).eq('id', id);
  if (error) {
    console.warn('[dashboard-db] updateCategory error:', error.message);
    return false;
  }
  return true;
}

export async function deleteCategoryFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    console.warn('[dashboard-db] deleteCategory error:', error.message);
    return false;
  }
  return true;
}

// ---------- Invoices ----------
export async function fetchInvoicesFromSupabase(): Promise<Invoice[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (error) {
    console.warn('[dashboard-db] fetchInvoices error:', error.message);
    return [];
  }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    orderNumber: r.order_number,
    customerId: r.customer_id ?? '',
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone ?? undefined,
    shippingAddress: r.shipping_address ?? undefined,
    items: r.items ?? [],
    subtotal: Number(r.subtotal),
    tax: Number(r.tax),
    shipping: Number(r.shipping),
    total: Number(r.total),
    status: r.status,
    paymentStatus: r.payment_status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function insertInvoice(inv: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      order_number: inv.orderNumber,
      customer_id: inv.customerId || null,
      customer_name: inv.customerName,
      customer_email: inv.customerEmail,
      customer_phone: inv.customerPhone ?? null,
      shipping_address: inv.shippingAddress ?? null,
      items: inv.items,
      subtotal: inv.subtotal,
      tax: inv.tax,
      shipping: inv.shipping,
      total: inv.total,
      status: inv.status,
      payment_status: inv.paymentStatus,
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[dashboard-db] insertInvoice error:', error.message);
    return null;
  }
  return {
    id: data.id,
    orderNumber: data.order_number,
    customerId: data.customer_id ?? '',
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    customerPhone: data.customer_phone ?? undefined,
    shippingAddress: data.shipping_address ?? undefined,
    items: data.items ?? [],
    subtotal: Number(data.subtotal),
    tax: Number(data.tax),
    shipping: Number(data.shipping),
    total: Number(data.total),
    status: data.status,
    paymentStatus: data.payment_status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateInvoiceInSupabase(id: string, updates: Partial<Invoice>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const row: any = {};
  if (updates.orderNumber !== undefined) row.order_number = updates.orderNumber;
  if (updates.customerId !== undefined) row.customer_id = updates.customerId ?? null;
  if (updates.customerName !== undefined) row.customer_name = updates.customerName;
  if (updates.customerEmail !== undefined) row.customer_email = updates.customerEmail;
  if (updates.customerPhone !== undefined) row.customer_phone = updates.customerPhone ?? null;
  if (updates.shippingAddress !== undefined) row.shipping_address = updates.shippingAddress ?? null;
  if (updates.items !== undefined) row.items = updates.items;
  if (updates.subtotal !== undefined) row.subtotal = updates.subtotal;
  if (updates.tax !== undefined) row.tax = updates.tax;
  if (updates.shipping !== undefined) row.shipping = updates.shipping;
  if (updates.total !== undefined) row.total = updates.total;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.paymentStatus !== undefined) row.payment_status = updates.paymentStatus;
  const { error } = await supabase.from('invoices').update(row).eq('id', id);
  if (error) {
    console.warn('[dashboard-db] updateInvoice error:', error.message);
    return false;
  }
  return true;
}

// ---------- Customers ----------
export async function fetchCustomersFromSupabase(): Promise<Customer[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (error) {
    console.warn('[dashboard-db] fetchCustomers error:', error.message);
    return [];
  }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    email: r.email,
    name: r.name ?? '',
    phone: r.phone ?? undefined,
    address: r.address ?? undefined,
    city: r.city ?? undefined,
    country: r.country ?? undefined,
    orders: r.orders ?? 0,
    totalSpent: Number(r.total_spent ?? 0),
    createdAt: r.created_at,
    lastOrderAt: r.last_order_at ?? undefined,
  }));
}

export async function insertCustomer(
  c: Omit<Customer, 'id' | 'createdAt' | 'orders' | 'totalSpent'>
): Promise<Customer | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('customers')
    .insert({
      email: c.email,
      name: c.name ?? null,
      phone: c.phone ?? null,
      address: c.address ?? null,
      city: c.city ?? null,
      country: c.country ?? null,
      orders: 0,
      total_spent: 0,
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[dashboard-db] insertCustomer error:', error.message);
    return null;
  }
  return {
    id: data.id,
    email: data.email,
    name: data.name ?? '',
    phone: data.phone ?? undefined,
    address: data.address ?? undefined,
    city: data.city ?? undefined,
    country: data.country ?? undefined,
    orders: data.orders ?? 0,
    totalSpent: Number(data.total_spent ?? 0),
    createdAt: data.created_at,
    lastOrderAt: data.last_order_at ?? undefined,
  };
}

export async function updateCustomerInSupabase(id: string, updates: Partial<Customer>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const row: any = {};
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.name !== undefined) row.name = updates.name ?? null;
  if (updates.phone !== undefined) row.phone = updates.phone ?? null;
  if (updates.address !== undefined) row.address = updates.address ?? null;
  if (updates.city !== undefined) row.city = updates.city ?? null;
  if (updates.country !== undefined) row.country = updates.country ?? null;
  if (updates.orders !== undefined) row.orders = updates.orders;
  if (updates.totalSpent !== undefined) row.total_spent = updates.totalSpent;
  if (updates.lastOrderAt !== undefined) row.last_order_at = updates.lastOrderAt ?? null;
  const { error } = await supabase.from('customers').update(row).eq('id', id);
  if (error) {
    console.warn('[dashboard-db] updateCustomer error:', error.message);
    return false;
  }
  return true;
}

// ---------- SEO ----------
export async function fetchSeoFromSupabase(): Promise<SEO[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('seo').select('*').order('page');
  if (error) {
    console.warn('[dashboard-db] fetchSeo error:', error.message);
    return [];
  }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    page: r.page,
    title: r.title ?? '',
    description: r.description ?? '',
    keywords: r.keywords ?? '',
    ogImage: r.og_image ?? undefined,
    updatedAt: r.updated_at,
  }));
}

export async function upsertSeoInSupabase(page: string, seo: Partial<SEO>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const row: any = { page, updated_at: new Date().toISOString() };
  if (seo.title !== undefined) row.title = seo.title;
  if (seo.description !== undefined) row.description = seo.description;
  if (seo.keywords !== undefined) row.keywords = seo.keywords;
  if (seo.ogImage !== undefined) row.og_image = seo.ogImage ?? null;
  const { error } = await supabase.from('seo').upsert(row, { onConflict: 'page' });
  if (error) {
    console.warn('[dashboard-db] upsertSeo error:', error.message);
    return false;
  }
  return true;
}

// ---------- Users ----------
export async function fetchUsersFromSupabase(): Promise<User[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) {
    console.warn('[dashboard-db] fetchUsers error:', error.message);
    return [];
  }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    email: r.email,
    name: r.name ?? '',
    role: r.role,
    phone: r.phone ?? undefined,
    password: r.password ?? undefined,
    isActive: r.is_active ?? true,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function insertUser(
  u: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>
): Promise<{ user: User } | { error: string }> {
  if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase not configured' };
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: u.email,
      name: u.name ?? null,
      role: u.role ?? 'staff',
      phone: u.phone ?? null,
      password: u.password ?? null,
      is_active: true,
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[dashboard-db] insertUser error:', error.message);
    return { error: error.message };
  }
  return {
    user: {
      id: data.id,
      email: data.email,
      name: data.name ?? '',
      role: data.role,
      phone: data.phone ?? undefined,
      password: data.password ?? undefined,
      isActive: data.is_active ?? true,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function updateUserInSupabase(id: string, updates: Partial<User>): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const row: any = {};
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.name !== undefined) row.name = updates.name ?? null;
  if (updates.role !== undefined) row.role = updates.role;
  if (updates.phone !== undefined) row.phone = updates.phone ?? null;
  if (updates.password !== undefined) row.password = updates.password ?? null;
  if (updates.isActive !== undefined) row.is_active = updates.isActive;
  const { error } = await supabase.from('users').update(row).eq('id', id);
  if (error) {
    console.warn('[dashboard-db] updateUser error:', error.message);
    return false;
  }
  return true;
}

export async function deleteUserFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) {
    console.warn('[dashboard-db] deleteUser error:', error.message);
    return false;
  }
  return true;
}
