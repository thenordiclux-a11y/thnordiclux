import type { SupportMessage } from '../contexts/DataContext';

function titleCaseWords(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function sanitizeNameCandidate(raw: string): string | null {
  let n = raw
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
  if (n.length > 48) n = n.slice(0, 48).trim();
  if (n.length < 2) return null;
  const lower = n.toLowerCase();
  if (/^(the|a|an|your|our|from|here|glad|happy|sorry|just|not)\b/.test(lower)) return null;
  return titleCaseWords(n);
}

export function extractAgentNameFromText(text: string): string | null {
  const t = text.trim();
  if (!t) return null;

  const highConfidence: RegExp[] = [
    /\bmy name is\s+([^,\n.!?]{1,48})/i,
    /\b(?:you can )?call me\s+([^,\n.!?]{1,48})/i,
    /\b(?:it's|it is)\s+([A-Za-z][^,\n.!?]{0,40})/i,
  ];
  for (const re of highConfidence) {
    const m = t.match(re);
    if (m?.[1]) {
      const name = sanitizeNameCandidate(m[1]);
      if (name) return name;
    }
  }

  const thisIs = t.match(/\bthis is\s+([A-Z][^\n,.!?]{0,40})/);
  if (thisIs?.[1]) {
    const name = sanitizeNameCandidate(thisIs[1]);
    if (name) return name;
  }

  const im = t.match(
    /\bi(?:'m|\s+am)\s+([A-Z][a-z]{1,24}(?:\s+[A-Z][a-z]+){0,2})\b/
  );
  if (im?.[1]) {
    const name = sanitizeNameCandidate(im[1]);
    if (name) return name;
  }

  return null;
}

/**
 * Latest name mentioned in any agent message (chronological order; later messages win).
 */
export function getLatestAgentNameFromThread(messages: SupportMessage[]): string | null {
  const agentBodies = messages
    .filter((m) => m.role === 'agent')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  let last: string | null = null;
  for (const m of agentBodies) {
    const found = extractAgentNameFromText(m.body);
    if (found) last = found;
  }
  return last;
}

/**
 * Prefer admin-stored name on agent messages (latest in thread), else parsed intro from text.
 */
export function resolveAgentDisplayName(messages: SupportMessage[]): string | null {
  const agentSorted = messages
    .filter((m) => m.role === 'agent')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (let i = agentSorted.length - 1; i >= 0; i--) {
    const n = agentSorted[i].senderName?.trim();
    if (n) return n;
  }
  return getLatestAgentNameFromThread(messages);
}

/** Visitor chat: label for one agent bubble (per-message sender, then intro text, then prior agent names). */
export function visitorAgentLabel(m: SupportMessage, thread: SupportMessage[]): string {
  if (m.role !== 'agent') return '';
  const own = m.senderName?.trim() || extractAgentNameFromText(m.body);
  if (own) return own;
  const priorAgent = thread
    .filter((x) => x.role === 'agent' && x.createdAt <= m.createdAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const x of priorAgent) {
    if (x.senderName?.trim()) return x.senderName.trim();
  }
  return (
    getLatestAgentNameFromThread(
      thread.filter((x) => x.createdAt <= m.createdAt)
    ) ?? 'Team member'
  );
}

export function adminAgentMessageLabel(m: SupportMessage): string {
  if (m.role !== 'agent') return '';
  const sn = m.senderName?.trim();
  if (sn) return `You · ${sn}`;
  const parsed = extractAgentNameFromText(m.body);
  if (parsed) return `You · ${parsed}`;
  return 'You (team)';
}

/** Short replies that should not be treated as a bare name (single-line messages). */
const BARE_NAME_BLOCKLIST = new Set([
  'a',
  'i',
  'no',
  'yes',
  'ok',
  'okay',
  'hi',
  'hey',
  'hello',
  'thanks',
  'thank',
  'you',
  'pls',
  'please',
  'help',
  'sure',
  'maybe',
  'fine',
  'good',
  'great',
  'wow',
  'lol',
  'haha',
  'yep',
  'nope',
  'bye',
  'what',
  'when',
  'where',
  'why',
  'how',
  'who',
  'want',
  'need',
  'like',
  'love',
  'hate',
  'think',
  'know',
  'see',
  'look',
  'here',
  'there',
  'today',
  'tomorrow',
  'now',
  'soon',
  'interested',
  'wondering',
  'looking',
  'trying',
  'waiting',
  'here',
  'glad',
  'ready',
  'back',
  'done',
  'still',
  'sorry',
  'busy',
  'free',
  'available',
  'writing',
  'sending',
  'checking',
]);

function extractBareNameMessage(text: string): string | null {
  const t = text.trim();
  if (!t || t.includes('\n')) return null;
  if (t.length > 48) return null;
  if (/\d/.test(t)) return null;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 2) return null;
  const wordOk = (w: string) => /^[a-zA-ZÀ-ÿ]+(?:['-][a-zA-ZÀ-ÿ]+)?$/.test(w);
  if (words.length === 1) {
    const w = words[0];
    if (w.length < 2 || w.length > 24) return null;
    if (BARE_NAME_BLOCKLIST.has(w.toLowerCase())) return null;
    if (!wordOk(w)) return null;
    return titleCaseWords(w);
  }
  if (!wordOk(words[0]) || !wordOk(words[1])) return null;
  if (
    BARE_NAME_BLOCKLIST.has(words[0].toLowerCase()) ||
    BARE_NAME_BLOCKLIST.has(words[1].toLowerCase())
  ) {
    return null;
  }
  return titleCaseWords(`${words[0]} ${words[1]}`);
}

/**
 * Visitor self-intro: same phrase patterns as agent ("my name is …", "I'm …") plus a short bare name ("Dilhani").
 */
export function extractVisitorNameFromText(text: string): string | null {
  const fromPhrases = extractAgentNameFromText(text);
  if (fromPhrases) return fromPhrases;
  const t = text.trim();
  const imLoose = t.match(
    /\bi(?:'m|\s+am)\s+([a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ]{1,23}(?:\s+[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ]+){0,2})\b/i
  );
  if (imLoose?.[1]) {
    const parts = imLoose[1].trim().split(/\s+/);
    if (!parts.some((w) => BARE_NAME_BLOCKLIST.has(w.toLowerCase()))) {
      const name = sanitizeNameCandidate(imLoose[1]);
      if (name) return name;
    }
  }
  return extractBareNameMessage(text);
}

/** Latest visitor name from user messages (later messages override). */
export function resolveVisitorDisplayName(messages: SupportMessage[]): string | null {
  const userMsgs = messages
    .filter((m) => m.role === 'user')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  let last: string | null = null;
  for (const m of userMsgs) {
    const n = extractVisitorNameFromText(m.body);
    if (n) last = n;
  }
  return last;
}

/** Label above a visitor bubble on the storefront (name once known, else "You"). */
export function visitorSelfLabel(m: SupportMessage, thread: SupportMessage[]): string {
  if (m.role !== 'user') return '';
  return (
    resolveVisitorDisplayName(thread.filter((x) => x.createdAt <= m.createdAt)) ?? 'You'
  );
}

/** Admin inbox: label for a visitor message. */
export function adminVisitorMessageLabel(m: SupportMessage, thread: SupportMessage[]): string {
  if (m.role !== 'user') return '';
  const name = resolveVisitorDisplayName(
    thread.filter((x) => x.createdAt <= m.createdAt)
  );
  return name ? `Visitor · ${name}` : 'Visitor';
}
