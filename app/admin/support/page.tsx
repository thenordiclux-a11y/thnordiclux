'use client';

import { useEffect, useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  adminAgentMessageLabel,
  adminVisitorMessageLabel,
} from '../../lib/support-chat-agent-name';

/** One-tap opening lines for agents (fills the reply box; edit before send if needed). */
const AGENT_OPENING_SNIPPETS: { label: string; text: string }[] = [
  {
    label: 'Ask name',
    text: 'For further assistance, may I know your good name, please?',
  },
  {
    label: 'How can I help?',
    text: 'How can I help you today?',
  },
  {
    label: 'Thanks for waiting',
    text: 'Thank you for waiting — I will be happy to assist you.',
  },
];

export default function AdminSupportPage() {
  const { user } = useAuth();
  const {
    supportConversations,
    supportMessages,
    reloadSupportChats,
    addSupportMessage,
    setSupportConversationStatus,
  } = useData();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const t = setInterval(() => {
      reloadSupportChats();
    }, 4000);
    return () => clearInterval(t);
  }, [reloadSupportChats]);

  const sorted = useMemo(
    () =>
      [...supportConversations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [supportConversations]
  );

  const thread = useMemo(() => {
    if (!selectedId) return [];
    return supportMessages
      .filter((m) => m.conversationId === selectedId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [supportMessages, selectedId]);

  const selected = sorted.find((c) => c.id === selectedId);

  const sendAgentReply = async () => {
    const text = reply.trim();
    if (!text || !selectedId) return;
    setSending(true);
    const senderName = user?.name?.trim() || undefined;
    await addSupportMessage(selectedId, 'agent', text, senderName);
    await setSupportConversationStatus(selectedId, 'awaiting_agent');
    setReply('');
    await reloadSupportChats();
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-green-600" />
            Live chat
          </h1>
          <p className="text-gray-600 mt-1">
            Reply to visitors who requested a team member. Bot handles greetings and product summaries first.
          </p>
        </div>
        <Button variant="outline" onClick={() => reloadSupportChats()} className="shrink-0">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[480px]">
        <div className="lg:col-span-1 border rounded-lg bg-white overflow-hidden flex flex-col max-h-[70vh]">
          <div className="p-3 border-b font-medium text-sm text-gray-700">Conversations</div>
          <div className="overflow-y-auto flex-1">
            {sorted.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No chats yet.</p>
            ) : (
              sorted.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selectedId === c.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium line-clamp-1">
                      {c.productName || 'General'}
                    </span>
                    {c.status === 'awaiting_agent' && (
                      <Badge className="shrink-0 bg-amber-500 text-white text-[10px]">Agent</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(c.updatedAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 border rounded-lg bg-white flex flex-col max-h-[70vh]">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-8">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="p-3 border-b flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{selected?.productName || 'Chat'}</p>
                  <p className="text-xs text-gray-500">Session: {selected?.visitorSessionId.slice(0, 8)}…</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => selectedId && setSupportConversationStatus(selectedId, 'closed')}
                >
                  Mark closed
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {thread.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        m.role === 'user'
                          ? 'bg-white border text-gray-900'
                          : m.role === 'agent'
                            ? 'bg-amber-100 text-amber-950 border border-amber-200'
                            : 'bg-green-100 text-gray-900 border border-green-200'
                      }`}
                    >
                      <p className="text-[10px] opacity-70 mb-1 font-semibold">
                        {m.role === 'bot'
                          ? 'Bot'
                          : m.role === 'agent'
                            ? adminAgentMessageLabel(m)
                            : adminVisitorMessageLabel(m, thread)}
                      </p>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t space-y-3 bg-white">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-600">Quick openers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {AGENT_OPENING_SNIPPETS.map((s) => (
                      <Button
                        key={s.label}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-xs h-8 font-normal"
                        title={s.text}
                        onClick={() => setReply(s.text)}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply as the team…"
                  rows={3}
                  className="resize-none"
                />
                <Button
                  type="button"
                  onClick={sendAgentReply}
                  disabled={sending || !reply.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Sending…' : 'Send reply'}
                </Button>
                {!isSupabaseConfigured() && (
                  <p className="text-xs text-amber-700">
                    Supabase is not configured: chats are stored only in this browser (local). Add Supabase and run
                    migration <code className="bg-amber-50 px-1">001_schema.sql</code> for shared inbox.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
