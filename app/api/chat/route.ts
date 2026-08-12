import {
  GoogleGenerativeAI,
  type Content,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import type { ChatMessage } from "@/lib/types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// 2.0-flash often has zero free-tier quota; 2.5-flash is the current free-tier default.
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

// Bounds on request shape, independent of rate limiting — caps the token
// cost of any single request regardless of how often it's sent.
const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_TOTAL_LENGTH = 12000;

function getGeminiModelId() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function getApiErrorMessage(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;

  const status = "status" in error ? error.status : undefined;
  const message = "message" in error ? String(error.message) : "";

  if (status === 429 || message.includes("429") || message.includes("quota")) {
    return (
      "Gemini API rate limit or quota reached. Wait a minute and try again, " +
      "or set GEMINI_MODEL in .env.local (e.g. gemini-2.5-flash-lite). " +
      "Check usage at https://aistudio.google.com/"
    );
  }

  if (status === 403 || message.includes("API key")) {
    return "Invalid or unauthorized Gemini API key. Check GEMINI_API_KEY in .env.local.";
  }

  return null;
}

function getGeminiClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

function isValidMessage(message: unknown): message is ChatMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "role" in message &&
    "content" in message &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

/** Gemini chat history must start with a user turn; skip UI-only welcome messages. */
function prepareMessages(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length > 0 && messages[0].role === "assistant") {
    return messages.slice(1);
  }
  return messages;
}

function toGeminiContents(messages: ChatMessage[]): Content[] {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const clientIp = getClientIp(request);
    const { limited, retryAfterSeconds } = checkRateLimit(clientIp);
    if (limited) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a bit before trying again." },
        {
          status: 429,
          headers: retryAfterSeconds
            ? { "Retry-After": String(retryAfterSeconds) }
            : undefined,
        }
      );
    }

    const body = await request.json();
    const { messages } = body as { messages?: unknown };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages must be a non-empty array." },
        { status: 400 }
      );
    }

    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Too many messages in one request (max ${MAX_MESSAGES}).` },
        { status: 400 }
      );
    }

    for (const m of messages) {
      if (isValidMessage(m) && m.content.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
          { error: `A message is too long (max ${MAX_MESSAGE_LENGTH} characters).` },
          { status: 400 }
        );
      }
    }

    const history = prepareMessages(messages.filter(isValidMessage));

    if (history.length === 0) {
      return NextResponse.json(
        { error: "No valid messages provided." },
        { status: 400 }
      );
    }

    const totalLength = history.reduce((sum, m) => sum + m.content.length, 0);
    if (totalLength > MAX_TOTAL_LENGTH) {
      return NextResponse.json(
        { error: "Conversation is too long. Please start a new chat." },
        { status: 400 }
      );
    }

    const last = history[history.length - 1];
    if (last.role !== "user") {
      return NextResponse.json(
        { error: "The last message must be from the user." },
        { status: 400 }
      );
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: getGeminiModelId(),
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const prior = history.slice(0, -1);
    const chat = model.startChat({
      history: toGeminiContents(prior),
    });

    const result = await chat.sendMessage(last.content);
    const reply = result.response.text();

    if (!reply) {
      return NextResponse.json(
        { error: "No response from the model." },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Chat API error:", error);

    const friendlyMessage = getApiErrorMessage(error);
    if (friendlyMessage) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : 429;
      return NextResponse.json({ error: friendlyMessage }, { status });
    }

    return NextResponse.json(
      { error: "Failed to generate a response. Please try again." },
      { status: 500 }
    );
  }
}
