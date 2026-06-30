'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  useData,
  type Product,
  type SupportMessage,
} from '../contexts/DataContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, X, Send, ShoppingCart } from 'lucide-react';
import logo from '../assets/4cb21529e27325b99c96e06426397bce92267e6c.png';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  resolveAgentDisplayName,
  resolveVisitorDisplayName,
  visitorAgentLabel,
  visitorSelfLabel,
} from '../lib/support-chat-agent-name';

const WHATSAPP_NUMBER = '94770130299';

function getVisitorSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('support_visitor_session_id');
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `v-${Date.now()}`;
    localStorage.setItem('support_visitor_session_id', id);
  }
  return id;
}

function buildProductIntro(p: Product): string {
  const parts: string[] = [];
  parts.push(
    `**${p.name}**${p.brand ? ` by ${p.brand}` : ''}${p.type ? ` · ${p.type}` : ''}`
  );
  parts.push(`Price: **$${p.price.toFixed(2)}**`);
  const snippet =
    (p.overview || p.description || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 280);
  if (snippet) parts.push(snippet + (snippet.length >= 280 ? '…' : ''));
  return parts.join('\n\n');
}

export function SupportChatWidget() {
  const pathname = usePathname();
  const {
    products,
    supportMessages,
    supportConversations,
    createSupportConversation,
    addSupportMessage,
    setSupportConversationStatus,
    reloadSupportChats,
  } = useData();
  const { addToCart, setIsOpen: openCart } = useCart();

  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = pathname?.startsWith('/admin');
  const productFromPath = useMemo(() => {
    if (!pathname?.startsWith('/product/')) return null;
    const id = pathname.replace('/product/', '').split('/')[0];
    return products.find((p) => p.id === id) ?? null;
  }, [pathname, products]);

  const messages = useMemo(() => {
    if (!conversationId) return [];
    return supportMessages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [supportMessages, conversationId]);

  const activeConversation = useMemo(
    () => supportConversations.find((c) => c.id === conversationId),
    [supportConversations, conversationId]
  );

  const agentDisplayName = useMemo(
    () => resolveAgentDisplayName(messages),
    [messages]
  );

  const visitorDisplayName = useMemo(
    () => resolveVisitorDisplayName(messages),
    [messages]
  );

  const chatHeaderSubtitle = useMemo(() => {
    const v = visitorDisplayName;
    const awaiting = activeConversation?.status === 'awaiting_agent';
    const a = agentDisplayName;
    if (v && awaiting) {
      return a ? `${v} · ${a} · team` : `${v} · Team will reply soon`;
    }
    if (v && !awaiting) {
      return `${v} · Chat assistant`;
    }
    if (awaiting) {
      return a ? `${a} · team` : 'Team will reply soon';
    }
    return 'Chat assistant';
  }, [visitorDisplayName, activeConversation?.status, agentDisplayName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, open]);

  useEffect(() => {
    if (!open || !isSupabaseConfigured()) return;
    const t = setInterval(() => {
      reloadSupportChats();
    }, 5000);
    return () => clearInterval(t);
  }, [open, reloadSupportChats]);

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    const stored = sessionStorage.getItem('support_active_conversation_id');
    if (stored && supportConversations.some((c) => c.id === stored)) {
      setConversationId(stored);
      return stored;
    }
    const visitorSessionId = getVisitorSessionId();
    const p = productFromPath;
    const conv = await createSupportConversation({
      visitorSessionId,
      productId: p?.id,
      productName: p?.name,
    });
    if (conv) {
      sessionStorage.setItem('support_active_conversation_id', conv.id);
      setConversationId(conv.id);
      return conv.id;
    }
    return null;
  }, [conversationId, createSupportConversation, productFromPath, supportConversations]);

  useEffect(() => {
    if (!open) return;
    ensureConversation();
  }, [open, ensureConversation]);

  useEffect(() => {
    if (!open || !conversationId) return;
    const introKey = `support_intro_done_${conversationId}`;
    if (sessionStorage.getItem(introKey)) return;
    // Skip intro only when this conversation already has history (e.g. restored / Supabase).
    // Do not depend on message count updating mid-intro — that was cancelling the async and
    // leaving `busy` true forever ("Assistant is typing…").
    const alreadyHasMessages = supportMessages.some(
      (m) => m.conversationId === conversationId
    );
    if (alreadyHasMessages) {
      sessionStorage.setItem(introKey, '1');
      return;
    }

    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        await addSupportMessage(
          conversationId,
          'bot',
          "Hi! 👋 Welcome to Nordic Lux — we're glad you're here."
        );
        if (cancelled) return;
        const p = productFromPath;
        if (p) {
          await addSupportMessage(
            conversationId,
            'bot',
            `Here's a quick look at the product you're viewing:\n\n${buildProductIntro(p)}`
          );
        } else {
          await addSupportMessage(
            conversationId,
            'bot',
            'Browse our shop for skincare and beauty favorites, or tell us what you are looking for.'
          );
        }
        if (cancelled) return;
        await addSupportMessage(
          conversationId,
          'bot',
          'Would you like **more details** or to speak with a team member? Tap a button below or type your question.'
        );
        if (cancelled) return;
        sessionStorage.setItem(introKey, '1');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
      setBusy(false);
    };
    // Intentionally omit supportMessages / messages.length: updates mid-intro were re-running
    // this effect, cancelling the async and leaving `busy` stuck true.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run intro when conv/session context changes
  }, [open, conversationId, productFromPath, addSupportMessage]);

  const sendUserMessage = async (text: string) => {
    const t = text.trim();
    if (!t || !conversationId) return;
    setInput('');
    await addSupportMessage(conversationId, 'user', t);
  };

  const handoffToAgent = async () => {
    if (!conversationId) return;
    await addSupportMessage(
      conversationId,
      'user',
      'Yes, I would like to speak with a team member for more details.'
    );
    await addSupportMessage(
      conversationId,
      'bot',
      "Thanks! A team member will reply here as soon as they're available. You can still type below or open WhatsApp for a faster reply."
    );
    await setSupportConversationStatus(conversationId, 'awaiting_agent');
    await reloadSupportChats();
  };

  const openWhatsApp = () => {
    const p = productFromPath;
    let msg = "Hello! I'm chatting from the Nordic Lux website — ";
    if (p) {
      msg += `I'm interested in ${p.name} ($${p.price.toFixed(2)}). `;
    }
    msg += 'Can you help?';
    window.open(
      `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}&type=phone_number&app_absent=0`,
      '_blank'
    );
  };

  const startNewChat = async () => {
    sessionStorage.removeItem('support_active_conversation_id');
    setConversationId(null);
    const visitorSessionId = getVisitorSessionId();
    const p = productFromPath;
    const conv = await createSupportConversation({
      visitorSessionId,
      productId: p?.id,
      productName: p?.name,
    });
    if (conv) {
      sessionStorage.setItem('support_active_conversation_id', conv.id);
      setConversationId(conv.id);
    }
  };

  const handleAddToCartFromChat = () => {
    const p = productFromPath;
    if (!p || p.stock <= 0) return;
    addToCart(p, 1);
    openCart(true);
  };

  if (isAdmin) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[100000] flex flex-col items-end gap-3"
      style={{ fontFamily: 'inherit' }}
    >
      {open && (
        <div className="w-[min(100vw-2rem,380px)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[min(70vh,520px)]">
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden p-1">
                <img src={logo.src} alt="" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <p className="font-semibold">Nordic Lux</p>
                <p className="text-xs opacity-90 leading-snug">{chatHeaderSubtitle}</p>
              </div>
            </div>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#e5ddd5] bg-gray-50">
            {messages.map((m: SupportMessage) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'bg-[#dcf8c6] text-gray-900 rounded-br-sm'
                      : m.role === 'agent'
                        ? 'bg-white text-gray-900 border border-amber-100 rounded-bl-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm'
                  }`}
                >
                  {m.role === 'user' && (
                    <p className="text-[10px] font-semibold mb-1 text-green-900/85 text-right">
                      {visitorSelfLabel(m, messages)}
                    </p>
                  )}
                  {m.role === 'agent' && (
                    <p className="text-[10px] tracking-wide text-amber-700 font-semibold mb-1">
                      {visitorAgentLabel(m, messages)}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
              </div>
            ))}
            {busy && (
              <p className="text-xs text-muted-foreground px-2">Assistant is typing…</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {productFromPath && productFromPath.stock > 0 && (
            <div className="px-3 pt-2 border-t bg-white">
              <Button
                type="button"
                size="sm"
                className="w-full bg-foreground text-white mb-2"
                onClick={handleAddToCartFromChat}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add &quot;{productFromPath.name.slice(0, 24)}
                {productFromPath.name.length > 24 ? '…' : ''}&quot; to cart
              </Button>
            </div>
          )}

          <div className="p-2 border-t bg-white space-y-2 shrink-0">
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="text-xs h-8 bg-[#25D366]/15 text-green-800 hover:bg-[#25D366]/25"
                onClick={handoffToAgent}
                disabled={!conversationId || busy || activeConversation?.status === 'awaiting_agent'}
              >
                Connect me to the team
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={openWhatsApp}
              >
                Open WhatsApp
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs h-8"
                onClick={startNewChat}
              >
                New chat
              </Button>
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendUserMessage(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 h-10 text-sm"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-[#25D366] hover:bg-[#20BA5A]">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 border-0"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
      </button>
    </div>
  );
}
