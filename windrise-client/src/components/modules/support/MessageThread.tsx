"use client";

import { useEffect, useRef } from "react";
import { AlertCircleIcon, CheckCheckIcon, PaperclipIcon } from "lucide-react";

import type { Message } from "@/services/support/support";
import { Avatar, clock, duration } from "./support.helpers";

/** The three animated dots shown while the customer is typing. */
function TypingBubble() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl bg-[#f1f2f6] px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.15}s` }}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b7bcc9]"
        />
      ))}
    </div>
  );
}

function Attachments({ items }: { items: Message["attachments"] }) {
  if (!items.length) return null;

  return (
    <div className="mt-1.5 space-y-1.5">
      {items.map((file) =>
        file.mime.startsWith("image") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={file.url}
            src={file.url}
            alt={file.name}
            className="max-h-52 w-auto rounded-lg border border-[#e8eaf0] object-cover"
          />
        ) : (
          <a
            key={file.url}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-[#e8eaf0] bg-white px-2 py-1.5 text-[11px] text-[#5b6274] hover:border-[#c9bcf7]"
          >
            <PaperclipIcon className="h-3 w-3" />
            <span className="truncate">{file.name}</span>
          </a>
        ),
      )}
    </div>
  );
}

/**
 * The transcript.
 *
 * Sides mean roles, not people: the customer sits on the right because that is
 * where the agent's own eye goes last, and everything the *shop* said — Windee
 * before the handoff, and the agent after it — sits on the left, so a customer
 * reading over an agent's shoulder sees a single voice.
 */
export function MessageThread({
  messages,
  customerName,
  customerAvatar,
  customerTyping,
  queue,
}: {
  messages: Message[];
  customerName: string;
  customerAvatar: string | null;
  customerTyping: boolean;
  queue: { position: number; estimatedWaitSeconds: number | null } | null;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastId = messages.at(-1)?.id;

  // Follow the conversation down as it grows, and on first open.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lastId, customerTyping]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((message) => {
          if (message.author === "SYSTEM") {
            return (
              <p
                key={message.id}
                className="mx-auto w-fit rounded-full bg-[#f4f5f8] px-3 py-1 text-[10.5px] text-[#8b93a7]"
              >
                {message.body}
              </p>
            );
          }

          const isCustomer = message.author === "CUSTOMER";
          const label = message.author === "BOT" ? "Windee" : (message.agent?.name ?? "Support");

          if (isCustomer) {
            return (
              <div key={message.id} className="flex flex-col items-end gap-1">
                <span className="pr-10 text-[10.5px] text-[#9aa1b1]">
                  {clock(message.createdAt)}
                </span>
                <div className="flex items-end gap-2">
                  <div className="max-w-[min(420px,80%)] rounded-2xl rounded-br-md bg-[#f0ecff] px-3.5 py-2.5">
                    {message.body && (
                      <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-[#2b3049]">
                        {message.body}
                      </p>
                    )}
                    <Attachments items={message.attachments} />
                    <span className="mt-1 flex justify-end text-[#8b7ce0]">
                      <CheckCheckIcon className="h-3 w-3" />
                    </span>
                  </div>
                  <Avatar name={customerName} src={customerAvatar} size={26} />
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {message.author === "BOT" ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#efeaff]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/Windee-Chatbot.png"
                      alt=""
                      className="h-3.5 w-3.5 object-contain"
                    />
                  </span>
                ) : (
                  <Avatar name={label} src={message.agent?.avatar ?? null} size={24} />
                )}
                <span className="text-[10.5px] text-[#8b93a7]">
                  {label} · {clock(message.createdAt)}
                </span>
                {message.isInternalNote && (
                  <span className="rounded bg-[#fff4e0] px-1.5 py-0.5 text-[9px] font-medium text-[#b7791f]">
                    Internal note
                  </span>
                )}
              </div>

              <div
                className={`ml-8 w-fit max-w-[min(420px,80%)] rounded-2xl rounded-tl-md px-3.5 py-2.5 ${
                  message.isInternalNote
                    ? "border border-dashed border-[#f0d9a8] bg-[#fffaf0]"
                    : "bg-[#f4f5f8]"
                }`}
              >
                {message.body && (
                  <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-[#2b3049]">
                    {message.body}
                  </p>
                )}
                <Attachments items={message.attachments} />

                {message.deliveryError && (
                  <p className="mt-1.5 flex items-center gap-1 text-[10.5px] text-[#d0342c]">
                    <AlertCircleIcon className="h-3 w-3 shrink-0" />
                    Not delivered — {message.deliveryError}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {customerTyping && (
          <div className="ml-8">
            <TypingBubble />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {queue && (
        <p className="border-t border-[#eef0f4] px-5 py-2.5 text-[11px] text-[#8b93a7]">
          The customer is #{queue.position} in queue.
          {queue.estimatedWaitSeconds !== null
            ? ` Approx. wait time: ${duration(queue.estimatedWaitSeconds)}`
            : ""}
        </p>
      )}
    </div>
  );
}
