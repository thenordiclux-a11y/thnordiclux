import { NextResponse } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client is unavailable.' }, { status: 500 });
  }

  const { error: deleteError } = await supabase.from('invoices').delete();
  if (deleteError) {
    return NextResponse.json({ error: `Failed to delete invoices: ${deleteError.message}` }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from('customers')
    .update({ orders: 0, total_spent: 0, last_order_at: null });

  if (updateError) {
    return NextResponse.json({ error: `Failed to reset customers: ${updateError.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
