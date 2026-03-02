const CHAT_SESSION_KEY = "chat_session_id";
const CHAT_MESSAGES_KEY = "chat_messages";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CHAT_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CHAT_SESSION_KEY, id);
  }
  return id;
}

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CHAT_SESSION_KEY);
}

export function saveMessagesToLocalStorage(
  sessionId: string,
  messages: ChatMessage[]
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${CHAT_MESSAGES_KEY}:${sessionId}`,
      JSON.stringify(messages)
    );
  } catch (e) {
    console.error("[lib/chat] saveMessagesToLocalStorage:", e);
  }
}

export function loadMessagesFromLocalStorage(
  sessionId: string
): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${CHAT_MESSAGES_KEY}:${sessionId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export async function fetchChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sessionId)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.messages) ? data.messages : [];
}

export async function sendChatMessage(
  sessionId: string,
  message: string
): Promise<{ reply: string; messages: ChatMessage[] }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message: message.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to send message");
  }
  const data = await res.json();
  return {
    reply: data.reply ?? "",
    messages: Array.isArray(data.messages) ? data.messages : [],
  };
}

export async function fetchChatHistoryByThreadId(
  threadId: string
): Promise<ChatMessage[]> {
  const res = await fetch(
    `/api/chat?threadId=${encodeURIComponent(threadId)}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.messages) ? data.messages : [];
}

export async function sendChatMessageToThread(
  threadId: string,
  message: string
): Promise<{ reply: string; messages: ChatMessage[] }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threadId, message: message.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to send message");
  }
  const data = await res.json();
  return {
    reply: data.reply ?? "",
    messages: Array.isArray(data.messages) ? data.messages : [],
  };
}
