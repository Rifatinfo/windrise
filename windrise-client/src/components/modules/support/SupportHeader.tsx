"use client";

import { useEffect, useRef, useState } from "react";
import { BellIcon, ChevronDownIcon } from "lucide-react";

import type { Agent, Conversation, Presence } from "@/services/support/support";
import { Avatar, CHANNEL_META, PRESENCE_META, clock } from "./support.helpers";

const PRESENCES: Presence[] = ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"];

function useDismiss(onDismiss: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onDismiss();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onDismiss]);

  return ref;
}

export function SupportHeader({
  me,
  unreadCount,
  unread,
  onPresenceChange,
  onOpenConversation,
  onLoadUnread,
}: {
  me: Agent | null;
  unreadCount: number;
  unread: Conversation[];
  onPresenceChange: (presence: Presence) => Promise<void>;
  onOpenConversation: (id: string) => void;
  onLoadUnread: () => void;
}) {
  const [open, setOpen] = useState<"presence" | "bell" | "profile" | null>(null);
  const ref = useDismiss(() => setOpen(null));

  const presence = PRESENCE_META[me?.presence ?? "OFFLINE"];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#1b2033]">Support Inbox</h1>
        <p className="mt-0.5 text-[13px] text-[#8b93a7]">Manage chats from all your channels</p>
      </div>

      <div ref={ref} className="flex items-center gap-2.5">
        {/* Presence */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(open === "presence" ? null : "presence")}
            className="flex h-9 items-center gap-2 rounded-lg border border-[#e0e3ea] bg-white px-3 text-[12.5px] font-medium text-[#3d4459] transition-colors hover:bg-[#f7f8fb]"
          >
            <span className={`h-2 w-2 rounded-full ${presence.dot}`} />
            {presence.label}
            <ChevronDownIcon className="h-3.5 w-3.5 text-[#9aa1b1]" />
          </button>

          {open === "presence" && (
            <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-[#e8eaf0] bg-white p-1.5 shadow-[0_8px_28px_rgba(16,24,40,0.12)]">
              {PRESENCES.map((value) => {
                const meta = PRESENCE_META[value];
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      void onPresenceChange(value);
                      setOpen(null);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-[#f7f8fb] ${
                      me?.presence === value ? "text-[#6d4ee6]" : "text-[#3d4459]"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label={`${unreadCount} conversations need attention`}
            onClick={() => {
              setOpen(open === "bell" ? null : "bell");
              if (open !== "bell") onLoadUnread();
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e3ea] bg-white text-[#5b6274] transition-colors hover:bg-[#f7f8fb]"
          >
            <BellIcon className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#e5484d] px-1 text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open === "bell" && (
            <div className="absolute right-0 top-11 z-30 w-80 rounded-xl border border-[#e8eaf0] bg-white p-2 shadow-[0_8px_28px_rgba(16,24,40,0.12)]">
              <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-[#9aa1b1]">
                Needs your attention
              </p>

              {unread.length === 0 ? (
                <p className="px-2 py-4 text-center text-[11.5px] text-[#9aa1b1]">
                  You&apos;re all caught up.
                </p>
              ) : (
                <div className="max-h-72 space-y-0.5 overflow-y-auto">
                  {unread.map((conversation) => {
                    const meta = CHANNEL_META[conversation.channel];
                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => {
                          onOpenConversation(conversation.id);
                          setOpen(null);
                        }}
                        className="flex w-full gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f7f8fb]"
                      >
                        <Avatar
                          name={conversation.contact.name}
                          src={conversation.contact.avatarUrl}
                          size={28}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[12px] font-medium text-[#1b2033]">
                              {conversation.contact.name}
                            </span>
                            <span className="shrink-0 text-[10px] text-[#9aa1b1]">
                              {clock(conversation.lastMessageAt)}
                            </span>
                          </div>
                          <p className="truncate text-[11px] text-[#7b8194]">
                            {conversation.lastMessagePreview}
                          </p>
                          <span className="mt-0.5 flex items-center gap-1 text-[10px] text-[#9aa1b1]">
                            <span
                              className={`flex h-3 w-3 items-center justify-center rounded-full ${meta.tint}`}
                            >
                              <meta.Icon className="h-1.5 w-1.5" />
                            </span>
                            {meta.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Agent */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(open === "profile" ? null : "profile")}
            className="flex h-9 items-center gap-2 rounded-lg border border-[#e0e3ea] bg-white pl-1.5 pr-2.5 transition-colors hover:bg-[#f7f8fb]"
          >
            <Avatar name={me?.name ?? "Agent"} src={me?.avatar ?? null} size={26} />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[12.5px] font-medium text-[#1b2033]">
                {me?.name ?? "Agent"}
              </span>
              <span className="block text-[10.5px] text-[#8b93a7]">
                {me?.title ?? "Support Agent"}
              </span>
            </span>
            <ChevronDownIcon className="h-3.5 w-3.5 text-[#9aa1b1]" />
          </button>

          {open === "profile" && (
            <div className="absolute right-0 top-11 z-30 w-56 rounded-xl border border-[#e8eaf0] bg-white p-3 shadow-[0_8px_28px_rgba(16,24,40,0.12)]">
              <p className="text-[12.5px] font-medium text-[#1b2033]">{me?.name ?? "Agent"}</p>
              {me?.email && <p className="mt-0.5 text-[11px] text-[#8b93a7]">{me.email}</p>}
              <div className="my-2 h-px bg-[#eef0f4]" />
              <p className="flex items-center justify-between text-[11.5px] text-[#5b6274]">
                Open chats
                <span className="font-medium text-[#1b2033]">
                  {me?.openConversations ?? 0}/{me?.maxConcurrent ?? 0}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
