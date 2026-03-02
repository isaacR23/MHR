import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

const CHAT_KEY_PREFIX = "chat:";
const REPLIES = [
  "Understood. I have completed the final verification of the security patches. High-severity issues H-01 and H-02 are now mitigated. Delivery package uploaded to the contract panel.",
  "Automated verification running on IPFS CID: QmXoyp...76Xz. Hash matches. Final code review shows zero critical vulnerabilities remaining. Awaiting human confirmation for fund release.",
  "System requirement: Please provide the final audit report for the ERC-20 staking logic. Ensure all medium-to-high severity findings are addressed in the re-test summary.",
  "Thank you for your message. The audit deliverables have been updated. Please review the contract panel for the latest attachments.",
  "All requested revisions have been applied. The staking logic audit is complete and ready for your approval.",
];

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL = "mistral-small-latest";
const MISTRAL_MAX_TOKENS = 512;

async function getMistralReply(
  existing: ChatMessage[],
  userContent: string
): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey?.trim()) return null;

  const mistralMessages: { role: "user" | "assistant"; content: string }[] = [
    ...existing.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: userContent },
  ];

  try {
    const res = await fetch(MISTRAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: mistralMessages,
        max_tokens: MISTRAL_MAX_TOKENS,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? null;
    return reply || null;
  } catch {
    return null;
  }
}

function getChatKey(request: NextRequest, body?: { sessionId?: string; threadId?: string }): string | null {
  const threadId = body?.threadId ?? request.nextUrl.searchParams.get("threadId");
  if (threadId?.trim()) return `${CHAT_KEY_PREFIX}${threadId.trim()}`;
  const sessionId = body?.sessionId ?? request.nextUrl.searchParams.get("sessionId");
  if (sessionId?.trim()) return `${CHAT_KEY_PREFIX}${sessionId.trim()}`;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const key = getChatKey(request);
    if (!key) {
      return NextResponse.json(
        { error: "sessionId or threadId is required" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        { messages: [] as ChatMessage[] },
        { status: 200 }
      );
    }

    const raw = await redis.get<string>(key);
    const messages: ChatMessage[] = (() => {
      if (raw == null) return [];
      if (Array.isArray(raw)) return raw as ChatMessage[];
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw) as unknown;
          return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
        } catch {
          return [];
        }
      }
      return [];
    })();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[api/chat] GET error:", error);
    return NextResponse.json(
      { messages: [] as ChatMessage[] },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      threadId?: string;
      message?: string;
    };
    const message = body?.message;
    const key = getChatKey(request, body);

    if (!key || typeof message !== "string") {
      return NextResponse.json(
        { error: "sessionId or threadId, and message are required" },
        { status: 400 }
      );
    }

    const redis = getRedis();

    const userMessage: ChatMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    let existing: ChatMessage[] = [];
    if (redis) {
      const raw = await redis.get<string>(key);
      existing = (() => {
        if (raw == null) return [];
        if (Array.isArray(raw)) return raw as ChatMessage[];
        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw) as unknown;
            return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
          } catch {
            return [];
          }
        }
        return [];
      })();
    }

    const assistantCount = existing.filter((m) => m.role === "assistant").length;
    let reply: string | null = await getMistralReply(existing, message.trim());
    if (reply == null || reply === "") {
      reply = REPLIES[assistantCount % REPLIES.length];
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: reply,
      timestamp: new Date().toISOString(),
    };

    const updated = [...existing, userMessage, assistantMessage];
    if (redis) {
      await redis.set(key, JSON.stringify(updated));
    }

    return NextResponse.json({
      reply,
      messages: updated,
    });
  } catch (error) {
    console.error("[api/chat] POST error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 503 }
    );
  }
}
