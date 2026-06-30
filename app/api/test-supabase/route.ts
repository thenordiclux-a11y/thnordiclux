import { NextResponse } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Supabase not configured', hint: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local' },
      { status: 503 }
    );
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: 'Supabase not configured', hint: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local' },
        { status: 503 }
      );
    }

    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('id').limit(1),
      supabase.from('categories').select('id').limit(1),
    ]);

    const errors: string[] = [];
    if (productsRes.error) errors.push(`products: ${productsRes.error.message}`);
    if (categoriesRes.error) errors.push(`categories: ${categoriesRes.error.message}`);

    if (errors.length > 0) {
      return NextResponse.json({
        ok: false,
        error: 'Table access failed',
        details: errors,
        hint: 'Run supabase/migrations/001_schema.sql in Supabase SQL Editor if you have not.',
      }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Supabase connected',
      tables: { products: 'ok', categories: 'ok' },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: 'Connection failed', details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
