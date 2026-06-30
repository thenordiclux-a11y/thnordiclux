'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const SEEN_CONV_IDS_KEY = 'admin_support_seen_conv_ids';

function readSeenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(SEEN_CONV_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

function writeSeenIds(ids: Set<string>) {
  sessionStorage.setItem(SEEN_CONV_IDS_KEY, JSON.stringify([...ids]));
}

/** Short soft beep — may be blocked until the user has interacted with the page (browser policy). */
function playChatAlertBeep() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 784;
    osc.type = 'sine';
    const t0 = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
    osc.start(t0);
    osc.stop(t0 + 0.2);
    ctx.resume?.().catch(() => {});
  } catch {
    /* ignore */
  }
}

type LiveChatNavLinkProps = {
  isActive: boolean;
  onNavigate: () => void;
};

export function LiveChatNavLink({ isActive, onNavigate }: LiveChatNavLinkProps) {
  const { supportConversations, reloadSupportChats } = useData();
  const primedRef = useRef(false);
  const lastAwaitingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    reloadSupportChats();
  }, [reloadSupportChats]);

  useEffect(() => {
    const t = setInterval(() => {
      reloadSupportChats();
    }, 5000);
    return () => clearInterval(t);
  }, [reloadSupportChats]);

  useEffect(() => {
    const awaitingIds = new Set(
      supportConversations.filter((c) => c.status === 'awaiting_agent').map((c) => c.id)
    );
    const allIds = supportConversations.map((c) => c.id);
    const seen = readSeenIds();

    if (!primedRef.current) {
      allIds.forEach((id) => seen.add(id));
      writeSeenIds(seen);
      lastAwaitingRef.current = awaitingIds;
      primedRef.current = true;
      return;
    }

    let shouldBeep = false;

    const newConversationIds = allIds.filter((id) => !seen.has(id));
    if (newConversationIds.length > 0) {
      const bulkFirstLoad =
        seen.size === 0 && newConversationIds.length === allIds.length && allIds.length > 0;
      if (!bulkFirstLoad) shouldBeep = true;
      newConversationIds.forEach((id) => seen.add(id));
      writeSeenIds(seen);
    }

    for (const id of awaitingIds) {
      if (!lastAwaitingRef.current.has(id)) {
        shouldBeep = true;
        break;
      }
    }
    lastAwaitingRef.current = awaitingIds;

    if (shouldBeep) playChatAlertBeep();
  }, [supportConversations]);

  const awaitingCount = supportConversations.filter((c) => c.status === 'awaiting_agent').length;

  return (
    <Link
      href="/admin/support"
      onClick={onNavigate}
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors ${
        isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="flex items-center space-x-3 min-w-0">
        <MessageSquare className="w-5 h-5 shrink-0" />
        <span className="truncate">Live chat</span>
      </span>
      {awaitingCount > 0 && (
        <span
          className="shrink-0 min-w-[1.25rem] h-6 px-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold flex items-center justify-center tabular-nums"
          title={`${awaitingCount} chat${awaitingCount === 1 ? '' : 's'} waiting for the team`}
        >
          {awaitingCount > 99 ? '99+' : awaitingCount}
        </span>
      )}
    </Link>
  );
}
