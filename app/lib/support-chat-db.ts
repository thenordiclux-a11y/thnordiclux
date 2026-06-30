import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface SupportConversationRow {
  id: string;
  visitor_session_id: string;
  product_id: string | null;
  product_name: string | null;
  status: 'bot' | 'awaiting_agent' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface SupportMessageRow {
  id: string;
  conversation_id: string;
  role: 'bot' | 'user' | 'agent';
  body: string;
  created_at: string;
  sender_name?: string | null;
}

export async function fetchSupportConversationsFromSupabase(): Promise<SupportConversationRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('support_conversations')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) {
    console.warn('[support-chat-db] fetch conversations:', error.message);
    return [];
  }
  return (data ?? []) as SupportConversationRow[];
}

export async function fetchAllSupportMessagesFromSupabase(): Promise<SupportMessageRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('[support-chat-db] fetch all messages:', error.message);
    return [];
  }
  return (data ?? []) as SupportMessageRow[];
}

export async function fetchSupportMessagesFromSupabase(conversationId: string): Promise<SupportMessageRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('[support-chat-db] fetch messages:', error.message);
    return [];
  }
  return (data ?? []) as SupportMessageRow[];
}

export async function insertSupportConversationDb(
  row: Omit<SupportConversationRow, 'id' | 'created_at' | 'updated_at'>
): Promise<SupportConversationRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('support_conversations')
    .insert({
      visitor_session_id: row.visitor_session_id,
      product_id: row.product_id,
      product_name: row.product_name,
      status: row.status,
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[support-chat-db] insert conversation:', error.message);
    return null;
  }
  return data as SupportConversationRow;
}

export async function insertSupportMessageDb(
  conversationId: string,
  role: 'bot' | 'user' | 'agent',
  body: string,
  senderName?: string | null
): Promise<SupportMessageRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const payload: Record<string, unknown> = {
    conversation_id: conversationId,
    role,
    body,
  };
  if (role === 'agent' && senderName?.trim()) {
    payload.sender_name = senderName.trim();
  }
  const { data, error } = await supabase
    .from('support_messages')
    .insert(payload)
    .select('*')
    .single();
  if (error) {
    console.warn('[support-chat-db] insert message:', error.message);
    return null;
  }
  return data as SupportMessageRow;
}

export async function updateSupportConversationStatusDb(
  id: string,
  status: SupportConversationRow['status']
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('support_conversations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.warn('[support-chat-db] update status:', error.message);
    return false;
  }
  return true;
}

export async function touchSupportConversationDb(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('support_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}
