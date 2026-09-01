"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListFilterIcon,
  SearchIcon,
  ArrowUpDownIcon,
  XIcon,
} from "lucide-react";

import type {
  Conversation,
  ConversationStatus,
  ListFilters,
  Meta,
} from "@/services/support/support";
import { Avatar, CHANNEL_META, STATUS_BADGE, clock } from "./support.helpers";

const PANEL =
  "flex h-full flex-col rounded-xl border border-[#e8eaf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

const STATUS_OPTIONS: { value: ConversationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "IN_QUEUE", label: "In Queue" },
  { value: "WITH_AGENT", label: "With Agent" },
  { value: "CLOSED", label: "Closed" },
];

const SCOPE_OPTIONS: { value: NonNullable<ListFilters["scope"]>; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "mine", label: "Assigned to me" },
  { value: "unassigned", label: "Unassigned" },
];

function Row({
  conversation,
  active,
  onSelect,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
}) {
  const channel = CHANNEL_META[conversation.channel];
  const status = STATUS_BADGE[conversation.status];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
        active
          ? "border-[#c9bcf7] bg-[#f6f3ff]"
          : "border-transparent hover:border-[#e8eaf0] hover:bg-[#fafbfd]"
      }`}
    >
      <div className="flex gap-2.5">
        <Avatar name={conversation.contact.name} src={conversation.contact.avatarUrl} size={34} />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[12.5px] font-semibold text-[#1b2033]">
              {conversation.contact.name}
            </span>
            <span className="shrink-0 text-[10.5px] text-[#9aa1b1]">
              {clock(conversation.lastMessageAt)}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${channel.tint}`}
            >
              <channel.Icon className="h-2 w-2" />
            </span>
            <span className="truncate text-[11.5px] text-[#7b8194]">
              {conversation.lastMessagePreview || "No messages yet"}
            </span>
            {conversation.unreadForAgent > 0 && (
              <span className="ml-auto flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#6d4ee6] px-1 text-[9px] font-semibold text-white">
                {conversation.unreadForAgent}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-[10.5px] text-[#9aa1b1]">
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${channel.tint}`}
              >
                <channel.Icon className="h-2 w-2" />
              </span>
              {channel.label}
            </span>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function ConversationList({
  conversations,
  meta,
  loading,
  activeId,
  filters,
  onSelect,
  onFiltersChange,
}: {
  conversations: Conversation[];
  meta: Meta;
  loading: boolean;
  activeId: string | null;
  filters: ListFilters;
  onSelect: (id: string) => void;
  onFiltersChange: (next: Partial<ListFilters>) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [term, setTerm] = useState(filters.search ?? "");
  const searchRef = useRef<HTMLInputElement>(null);

  // Typing in the box should not fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      if ((filters.search ?? "") !== term) onFiltersChange({ search: term, page: 1 });
    }, 300);
    return () => clearTimeout(id);
  }, [term, filters.search, onFiltersChange]);

  const pageCount = Math.max(1, Math.ceil(meta.total / meta.limit));
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  // At most five numbered pages, centred on the current one.
  const windowStart = Math.max(1, Math.min(meta.page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => windowStart + i);

  return (
    <section className={PANEL}>
      <header className="border-b border-[#eef0f4] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[13.5px] font-semibold text-[#1b2033]">Conversations</h2>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                onFiltersChange({ sort: filters.sort === "oldest" ? "newest" : "oldest", page: 1 })
              }
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11.5px] text-[#5b6274] transition-colors hover:bg-[#f4f5f8]"
            >
              {filters.sort === "oldest" ? "Oldest" : "Newest"}
              <ArrowUpDownIcon className="h-3 w-3" />
            </button>

            <button
              type="button"
              aria-label="Search conversations"
              onClick={() => {
                setSearchOpen((open) => !open);
                setTimeout(() => searchRef.current?.focus(), 0);
              }}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                searchOpen || term ? "bg-[#f2effe] text-[#6d4ee6]" : "text-[#6b7280] hover:bg-[#f4f5f8]"
              }`}
            >
              <SearchIcon className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              aria-label="Filter conversations"
              onClick={() => setFilterOpen((open) => !open)}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                filterOpen || filters.status || (filters.scope && filters.scope !== "all")
                  ? "bg-[#f2effe] text-[#6d4ee6]"
                  : "text-[#6b7280] hover:bg-[#f4f5f8]"
              }`}
            >
              <ListFilterIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="relative mt-2.5">
            <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa1b1]" />
            <input
              ref={searchRef}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search name, message or ticket"
              className="h-8 w-full rounded-lg border border-[#e0e3ea] pl-8 pr-7 text-[12px] outline-none focus:border-[#6d4ee6]"
            />
            {term && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9aa1b1] hover:text-[#5b6274]"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {filterOpen && (
          <div className="mt-2.5 space-y-2">
            <div className="flex flex-wrap gap-1">
              {STATUS_OPTIONS.map((option) => {
                const selected =
                  option.value === "ALL" ? !filters.status : filters.status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onFiltersChange({
                        status: option.value === "ALL" ? undefined : option.value,
                        page: 1,
                      })
                    }
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-medium transition-colors ${
                      selected
                        ? "bg-[#6d4ee6] text-white"
                        : "bg-[#f4f5f8] text-[#5b6274] hover:bg-[#eceef3]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-1">
              {SCOPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onFiltersChange({ scope: option.value, page: 1 })}
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-medium transition-colors ${
                    (filters.scope ?? "all") === option.value
                      ? "bg-[#1b2033] text-white"
                      : "bg-[#f4f5f8] text-[#5b6274] hover:bg-[#eceef3]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2.5 py-2.5">
        {loading && conversations.length === 0 ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-xl px-3 py-2.5">
              <div className="flex gap-2.5">
                <div className="h-[34px] w-[34px] shrink-0 rounded-full bg-[#eef0f4]" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-1/2 rounded bg-[#eef0f4]" />
                  <div className="h-2.5 w-4/5 rounded bg-[#f2f4f7]" />
                  <div className="h-2.5 w-1/3 rounded bg-[#f2f4f7]" />
                </div>
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <p className="px-3 py-10 text-center text-[12px] text-[#9aa1b1]">
            No conversations match these filters.
          </p>
        ) : (
          conversations.map((conversation) => (
            <Row
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === activeId}
              onSelect={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-[#eef0f4] px-4 py-2.5">
        <span className="text-[11px] text-[#8b93a7]">
          {from} – {to} of {meta.total}
        </span>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Previous page"
            disabled={meta.page <= 1}
            onClick={() => onFiltersChange({ page: meta.page - 1 })}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#6b7280] transition-colors hover:bg-[#f4f5f8] disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>

          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onFiltersChange({ page })}
              className={`flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-[11px] transition-colors ${
                page === meta.page
                  ? "bg-[#6d4ee6] font-medium text-white"
                  : "text-[#5b6274] hover:bg-[#f4f5f8]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            aria-label="Next page"
            disabled={meta.page >= pageCount}
            onClick={() => onFiltersChange({ page: meta.page + 1 })}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#6b7280] transition-colors hover:bg-[#f4f5f8] disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>
    </section>
  );
}
