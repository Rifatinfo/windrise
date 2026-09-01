"use client";

import { useRef, useState } from "react";
import {
  ChevronDownIcon,
  ImageIcon,
  MessageSquareIcon,
  PaperclipIcon,
  SendIcon,
  SmileIcon,
  TypeIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";

import type { Attachment } from "@/services/support/support";
import { uploadAttachment } from "@/services/support/support";

/** Replies an agent sends over and over, one click away. */
const CANNED = [
  "Thanks for reaching out! Let me check that for you.",
  "Could you share your order number, please?",
  "Your order is on the way and should arrive within 2–3 business days.",
  "I've raised this with our team — I'll update you shortly.",
  "Is there anything else I can help you with?",
];

const EMOJI = ["🙂", "👍", "🙏", "🎉", "😊", "❤️", "✅", "📦", "⏳", "😅", "🔥", "👋"];

type Mode = "reply" | "note";

export function Composer({
  disabled,
  disabledReason,
  onSend,
  onTyping,
}: {
  disabled: boolean;
  disabledReason?: string;
  onSend: (payload: {
    body: string;
    attachments: Attachment[];
    isInternalNote: boolean;
  }) => Promise<void>;
  onTyping: (on: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>("reply");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<"emoji" | "canned" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSend = (body.trim().length > 0 || attachments.length > 0) && !busy && !disabled;

  const send = async () => {
    if (!canSend) return;

    setBusy(true);
    setError(null);
    try {
      await onSend({ body: body.trim(), attachments, isInternalNote: mode === "note" });
      setBody("");
      setAttachments([]);
      onTyping(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that.");
    } finally {
      setBusy(false);
    }
  };

  /**
   * Announces typing once, then stops when the agent pauses. Firing on every
   * keystroke would put a request per character on the wire.
   */
  const announceTyping = () => {
    if (mode === "note" || disabled) return;

    if (!typingTimer.current) onTyping(true);
    else clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      onTyping(false);
      typingTimer.current = null;
    }, 2500);
  };

  const attach = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadAttachment));
      setAttachments((current) => [...current, ...uploaded].slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const insert = (text: string) => {
    setBody((current) => (current ? `${current}${current.endsWith(" ") ? "" : " "}${text}` : text));
    setPanel(null);
    textRef.current?.focus();
  };

  const toolButton =
    "flex h-7 w-7 items-center justify-center rounded-md text-[#8b93a7] transition-colors hover:bg-[#f4f5f8] hover:text-[#5b6274] disabled:opacity-40";

  return (
    <div className="border-t border-[#eef0f4]">
      <div className="flex items-center gap-5 px-5 pt-3">
        {(
          [
            ["reply", "Reply"],
            ["note", "Internal Note"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`relative pb-2 text-[12.5px] transition-colors ${
              mode === value ? "font-medium text-[#6d4ee6]" : "text-[#8b93a7] hover:text-[#5b6274]"
            }`}
          >
            {label}
            {mode === value && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#6d4ee6]" />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div
          className={`rounded-xl border bg-white ${
            mode === "note" ? "border-[#f0d9a8] bg-[#fffdf7]" : "border-[#e4e7ee]"
          }`}
        >
          <textarea
            ref={textRef}
            value={body}
            disabled={disabled}
            onChange={(event) => {
              setBody(event.target.value);
              announceTyping();
            }}
            onKeyDown={(event) => {
              // Enter sends; Shift+Enter is a newline — the convention every
              // agent already has in their fingers.
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            rows={2}
            placeholder={
              disabled
                ? (disabledReason ?? "You can't reply to this conversation.")
                : mode === "note"
                  ? "Write a note only your team can see..."
                  : "Type your message..."
            }
            className="w-full resize-none bg-transparent px-3.5 pt-3 text-[12.5px] leading-relaxed text-[#2b3049] outline-none placeholder:text-[#a3a9b8] disabled:cursor-not-allowed"
          />

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3.5 pb-1">
              {attachments.map((file) => (
                <span
                  key={file.url}
                  className="flex items-center gap-1 rounded-md bg-[#f4f5f8] px-2 py-1 text-[10.5px] text-[#5b6274]"
                >
                  <PaperclipIcon className="h-2.5 w-2.5" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() =>
                      setAttachments((current) => current.filter((f) => f.url !== file.url))
                    }
                    className="text-[#9aa1b1] hover:text-[#d0342c]"
                  >
                    <XIcon className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {panel === "emoji" && (
            <div className="mx-3.5 mb-2 flex flex-wrap gap-1 rounded-lg border border-[#eef0f4] bg-white p-2">
              {EMOJI.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insert(emoji)}
                  className="rounded p-1 text-[15px] transition-colors hover:bg-[#f4f5f8]"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {panel === "canned" && (
            <div className="mx-3.5 mb-2 space-y-0.5 rounded-lg border border-[#eef0f4] bg-white p-1.5">
              {CANNED.map((line) => (
                <button
                  key={line}
                  type="button"
                  onClick={() => insert(line)}
                  className="block w-full truncate rounded px-2 py-1.5 text-left text-[11.5px] text-[#5b6274] transition-colors hover:bg-[#f4f5f8]"
                >
                  {line}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Insert emoji"
                disabled={disabled}
                onClick={() => setPanel((p) => (p === "emoji" ? null : "emoji"))}
                className={toolButton}
              >
                <SmileIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Attach a file"
                disabled={disabled || busy}
                onClick={() => fileRef.current?.click()}
                className={toolButton}
              >
                <PaperclipIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Attach an image"
                disabled={disabled || busy}
                onClick={() => imageRef.current?.click()}
                className={toolButton}
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Saved replies"
                disabled={disabled}
                onClick={() => setPanel((p) => (p === "canned" ? null : "canned"))}
                className={toolButton}
              >
                <MessageSquareIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Quick reply"
                disabled={disabled}
                onClick={() => setPanel((p) => (p === "canned" ? null : "canned"))}
                className={toolButton}
              >
                <ZapIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Formatting help"
                disabled={disabled}
                onClick={() => insert("**bold**")}
                className={toolButton}
              >
                <TypeIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => void send()}
                disabled={!canSend}
                className="flex h-8 items-center gap-1.5 rounded-l-full bg-[#6d4ee6] pl-3.5 pr-2.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Sending…" : mode === "note" ? "Save" : "Send"}
                <SendIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Send options"
                disabled={!canSend}
                onClick={() => setMode(mode === "reply" ? "note" : "reply")}
                title={mode === "reply" ? "Switch to internal note" : "Switch to reply"}
                className="flex h-8 w-7 items-center justify-center rounded-r-full border-l border-white/25 bg-[#6d4ee6] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-1.5 text-[11px] text-[#d0342c]">{error}</p>}

        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            void attach(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            void attach(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
