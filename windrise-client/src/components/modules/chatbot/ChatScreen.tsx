"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CheckCheckIcon,
  Loader2Icon,
  PaperclipIcon,
  SendHorizonalIcon,
  XIcon,
} from "lucide-react";

import type { ChatCard, ChatMessage } from "@/services/chatbot/chatbot";
import { chatMediaUrl } from "@/services/chatbot/chatbot";
import { ChatCardView, HelpCard, QueueCard } from "./ChatCards";

/**
 * Renders the model's `**emphasis**` as bold.
 *
 * The prompt asks for plain prose, but the model still reaches for markdown
 * when it names a product or a total — and the bubble is plain text, so those
 * asterisks were showing up literally. Only this one marker is handled: it is
 * the one that actually appears, and parsing more would invite rendering
 * whatever else a model decides to emit.
 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);

  return (
    <>
      {parts.map((part, index) =>
        // Odd indexes are the captured groups, i.e. what was wrapped.
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

const clockTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

/**
 * What Windee looks like it is doing, guessed from what was just asked.
 *
 * The tool it will actually reach for is only known once the reply comes back,
 * so this reads the request rather than claiming to know. Anything that does
 * not match falls back to the neutral wording instead of inventing a task.
 */
function pendingLabel(lastUserMessage: string): string {
  const text = lastUserMessage.toLowerCase();

  if (/\border|track|delivery status|where is/.test(text)) {
    return "Fetching your order details…";
  }
  if (/return|exchange|refund/.test(text)) return "Checking the returns policy…";
  if (/ship|deliver|charge|cost of delivery/.test(text)) {
    return "Checking delivery details…";
  }
  if (/product|price|size|colou?r|stock|available|buy|pant|shirt|jogger/.test(text)) {
    return "Looking through the catalogue…";
  }
  if (/cancel/.test(text)) return "Pulling up that order…";

  return "Windee is thinking…";
}

/** Windee 04 — the pending state while a tool runs. */
function Thinking({ label }: { label: string }) {
  return (
    // Full width of the transcript rather than a centred pill, matching the
    // card the order lookup shows.
    <div className="w-full rounded-xl bg-[#F7F6FC] px-4 py-5 text-center">
      {/* A plain <img>: next/image would run a 450KB animated GIF through the
          optimizer, and an animated source has to pass through untouched to
          keep playing. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/Loading.gif"
        alt=""
        aria-hidden="true"
        width={34}
        height={34}
        className="mx-auto h-[44px] w-[44px] select-none object-contain"
      />
      <p className="mt-2 text-[12.5px] font-semibold text-[#1B1830]">{label}</p>
      <p className="mt-0.5 text-[10.5px] text-[#8B88A0]">This may take a few seconds.</p>
    </div>
  );
}

function Bubble({
  message,
  seen,
  busy,
  onConfirm,
  onDecline,
}: {
  message: ChatMessage;
  /** Windee has answered this one; the ticks go blue. */
  seen: boolean;
  busy: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  const mine = message.role === "USER";
  const card = message.card as ChatCard | null;

  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      {!mine && (
        <div className="mb-1 flex items-center gap-1.5">
          <Image
            src="/assets/Windee-Chatbot.png"
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px] select-none"
          />
          <span className="text-[10px] font-medium text-[#6B4EE6]">Windee</span>
          <span className="text-[9px] text-[#B4B1C4]">{clockTime(message.createdAt)}</span>
        </div>
      )}

      {message.imageUrl && (
        <div className="mb-1.5 max-w-[70%] overflow-hidden rounded-xl border border-[#ECEAF4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={chatMediaUrl(message.imageUrl) ?? ""}
            alt="Attached"
            className="block h-auto w-full"
          />
        </div>
      )}

      {message.content && (
        <div
          className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
            mine
              ? "rounded-br-sm bg-[#EFECFD] text-[#1B1830]"
              : "rounded-bl-sm border border-[#ECEAF4] bg-white text-[#3A3650]"
          }`}
        >
          <RichText text={message.content} />
        </div>
      )}

      {mine && (
        <span className="mt-1 flex items-center gap-1 text-[9px] text-[#B4B1C4]">
          {clockTime(message.createdAt)}
          {/* Delivered while Windee is still working, blue once it has replied. */}
          <CheckCheckIcon
            aria-label={seen ? "Seen by Windee" : "Sent"}
            className={`h-3 w-3 transition-colors duration-300 ${
              seen ? "text-[#4B6BFB]" : "text-[#C6C3D4]"
            }`}
          />
        </span>
      )}

      {card && (
        <div className="mt-2 w-[86%]">
          <ChatCardView
            card={card}
            busy={busy}
            onConfirm={onConfirm}
            onDecline={onDecline}
          />
        </div>
      )}
    </div>
  );
}

export function ChatScreen({
  messages,
  thinking,
  busy,
  handedOff,
  error,
  onSend,
  onConfirm,
  onDecline,
  onTalkToHuman,
  onContinueWithAi,
  onUploadImage,
}: {
  messages: ChatMessage[];
  thinking: boolean;
  busy: boolean;
  handedOff: boolean;
  error: string | null;
  onSend: (text: string, imageUrl?: string | null) => void;
  onConfirm: () => void;
  onDecline: () => void;
  onTalkToHuman: () => void;
  onContinueWithAi: () => void;
  onUploadImage: (file: File) => Promise<string>;
}) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  /**
   * Transcript length when "Continue with Windee" was last tapped.
   *
   * Without this the button had nothing to do — it only cleared a handed-off
   * flag that was already false, so the card stayed put and the tap looked
   * broken. Dismissing is now the whole point of it; the offer comes back on
   * its own after another exchange or two.
   */
  const [helpDismissedAt, setHelpDismissedAt] = useState<number | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  // Follow the conversation as it grows.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length, thinking]);

  const canSend = (text.trim().length > 0 || attachment) && !busy && !handedOff;

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim(), attachment?.url ?? null);
    setText("");
    setAttachment(null);
  };

  const pickFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      setAttachment({ url, name: file.name });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  /** Only the newest proposal is actionable; older ones are already resolved. */
  const lastConfirmIndex = messages.reduce(
    (found, message, index) =>
      message.card &&
      (message.card.kind === "confirm-order" || message.card.kind === "confirm-cancel")
        ? index
        : found,
    -1,
  );

  return (
    <div className="flex h-full flex-col bg-[#FCFCFE]">
      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => (
          <Bubble
            key={message.id}
            message={
              // A superseded proposal keeps its summary but loses its buttons.
              index !== lastConfirmIndex &&
              (message.card?.kind === "confirm-order" ||
                message.card?.kind === "confirm-cancel")
                ? { ...message, card: null }
                : message
            }
            // Windee has seen it once anything of its own follows, so the
            // ticks stay correct after a reload as well as live.
            seen={messages.slice(index + 1).some((m) => m.role === "ASSISTANT")}
            busy={busy}
            onConfirm={onConfirm}
            onDecline={onDecline}
          />
        ))}

        {thinking && (
          <Thinking
            label={pendingLabel(
              [...messages].reverse().find((m) => m.role === "USER")?.content ?? "",
            )}
          />
        )}

        {handedOff ? (
          <QueueCard />
        ) : (
          // Offered once the conversation has actually developed, and never
          // while a proposal is waiting — two sets of buttons at once reads as
          // a choice between them.
          messages.length >= 4 &&
          !thinking &&
          lastConfirmIndex === -1 &&
          // Stays hidden until the conversation has moved on a further turn.
          (helpDismissedAt === null || messages.length >= helpDismissedAt + 2) && (
            <HelpCard
              busy={busy}
              onTalkToHuman={onTalkToHuman}
              onContinue={() => {
                setHelpDismissedAt(messages.length);
                onContinueWithAi();
              }}
            />
          )
        )}

        {error && (
          <p className="rounded-lg bg-[#FDF3F3] px-3 py-2 text-[11px] text-[#B4413F]">
            {error}
          </p>
        )}

        <div ref={bottom} />
      </div>

      {handedOff && (
        <button
          type="button"
          onClick={onContinueWithAi}
          className="mx-4 mb-2 rounded-full border border-[#DCD8F0] py-2 text-[11px] font-medium text-[#6B4EE6] transition-colors hover:bg-[#F7F5FF]"
        >
          Go back to Windee
        </button>
      )}

      <div className="border-t border-[#F0EFF6] bg-white px-3 pb-2 pt-2.5">
        {attachment && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#F5F4FA] px-2.5 py-1.5">
            <span className="min-w-0 flex-1 truncate text-[10px] text-[#4A4660]">
              {attachment.name}
            </span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label="Remove attachment"
              className="text-[#9B98AC] hover:text-[#4A4660]"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-[15px] border border-[#EAE8F2] bg-white px-3 py-1.5">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void pickFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading || handedOff}
            aria-label="Attach an image"
            className="shrink-0 text-[#9B98AC] transition-colors hover:text-[#6B4EE6] disabled:opacity-40"
          >
            {uploading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <PaperclipIcon className="h-4 w-4" />
            )}
          </button>

          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={handedOff ? "Waiting for our team…" : "Type your message..."}
            disabled={handedOff}
            maxLength={2000}
            className="h-8 w-full bg-transparent text-[12px] text-[#1B1830] outline-none placeholder:text-[#B4B1C4] disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#6B4EE6] text-white transition-colors hover:bg-[#5B3FD6] disabled:bg-[#D8D5E6]"
          >
            <SendHorizonalIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-1.5 text-center text-[9px] text-[#B4B1C4]">
          Windee can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}
