"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BotIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  HeadsetIcon,
  Loader2Icon,
  SearchIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

import * as api from "@/services/support/support";
import type { BotChat, BotChatMessage } from "@/services/support/support";

const PAGE_SIZE = 20;

const time = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

/**
 * Windee conversations, read-only.
 *
 * Kept apart from the working inbox on purpose: these have no queue, no
 * assignee and no unread badge, so they never sit in the counters or set the
 * notification bell off. Reading one changes nothing.
 *
 * There is one way out of that: Take over chat. It silences Windee, tells the
 * customer a person has joined, and turns the conversation into an ordinary
 * ticket assigned to whoever pressed it — after which the agent is moved to
 * the inbox, because that is where they can reply.
 */
export function WindeeChats({
  onOpenTicket,
}: {
  onOpenTicket: (conversationId: string) => void;
}) {
  const [chats, setChats] = useState<BotChat[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [hideEscalated, setHideEscalated] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<BotChatMessage[] | null>(null);
  const [threadFor, setThreadFor] = useState<BotChat | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [takingOver, setTakingOver] = useState(false);

  // A request per keystroke would search the whole message table each time.
  useEffect(() => {
    const id = setTimeout(() => {
      setTerm(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, meta: next } = await api.listBotChats({
        search: term,
        onlyWithoutTicket: hideEscalated,
        page,
        limit: PAGE_SIZE,
      });
      setChats(data);
      setMeta(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load Windee chats.");
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [term, hideEscalated, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = async (chat: BotChat) => {
    setActiveId(chat.id);
    setThreadFor(chat);
    setThreadLoading(true);
    try {
      const detail = await api.getBotChat(chat.id);
      setThread(detail.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open that chat.");
      setThread(null);
    } finally {
      setThreadLoading(false);
    }
  };

  /**
   * Steps into the conversation.
   *
   * Windee falls silent, the customer is told a person has joined, and the
   * chat becomes an ordinary ticket — so the last thing this does is hand the
   * agent over to the inbox, where they can actually reply. Staying on a
   * read-only screen after taking a chat over would be a dead end.
   */
  const takeOver = async (chat: BotChat) => {
    setTakingOver(true);
    setError("");
    try {
      const detail = await api.takeOverBotChat(chat.id);
      onOpenTicket(detail.conversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't take over that chat.");
    } finally {
      setTakingOver(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div className="grid grid-cols-1 gap-4 @min-[900px]:grid-cols-[320px_minmax(0,1fr)]">
      {/* List */}
      <div className="flex h-[560px] flex-col rounded-xl border border-[#e8eaf0] bg-white @min-[1000px]:h-[680px]">
        <div className="border-b border-[#f1f2f6] p-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa1b1]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone or message"
              className="h-9 w-full rounded-lg border border-[#e0e3ea] bg-white pl-9 pr-8 text-[12px] outline-none transition-colors focus:border-[#1b2033]"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9aa1b1] hover:text-[#5b6274]"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-[11.5px] text-[#5b6274]">
            <input
              type="checkbox"
              checked={hideEscalated}
              onChange={(event) => {
                setHideEscalated(event.target.checked);
                setPage(1);
              }}
              className="h-3.5 w-3.5 accent-[#6B4EE6]"
            />
            Only chats that never reached a person
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-3">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="h-14 animate-pulse rounded-lg bg-[#f4f5f8]" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <p className="px-4 py-10 text-center text-[12.5px] text-[#8b93a7]">
              {term ? "Nothing matches that search." : "No Windee chats yet."}
            </p>
          ) : (
            <ul>
              {chats.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => void open(chat)}
                    className={`w-full border-b border-[#f4f5f8] px-3 py-2.5 text-left transition-colors ${
                      activeId === chat.id ? "bg-[#F5F3FF]" : "hover:bg-[#fafbfc]"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[12.5px] font-medium text-[#1b2033]">
                        {chat.name || "Guest"}
                      </span>
                      <span className="shrink-0 text-[10px] text-[#9aa1b1]">
                        {time(chat.updatedAt)}
                      </span>
                    </div>

                    {chat.lastMessage && (
                      <p className="mt-0.5 truncate text-[11.5px] text-[#6f7585]">
                        <span className="text-[#9aa1b1]">
                          {chat.lastMessage.from === "WINDEE" ? "Windee: " : ""}
                        </span>
                        {chat.lastMessage.preview}
                      </p>
                    )}

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[9.5px] text-[#475569]">
                        {chat.messageCount} message{chat.messageCount === 1 ? "" : "s"}
                      </span>
                      {chat.phone && (
                        <span className="text-[10px] text-[#9aa1b1]">{chat.phone}</span>
                      )}
                      {chat.ticket && (
                        <span className="rounded bg-[#ECFDF5] px-1.5 py-0.5 text-[9.5px] font-medium text-[#047857]">
                          {chat.ticket.ticketNo}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {meta.total > 0 && (
          <div className="flex items-center justify-between border-t border-[#f1f2f6] px-3 py-2">
            <span className="text-[11px] text-[#8b93a7]">{meta.total} chats</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid h-6 w-6 place-items-center rounded border border-[#e0e3ea] text-[#6b7280] disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-3 w-3" />
              </button>
              <span className="px-1 text-[11px] text-[#5b6274]">
                {meta.page} / {pageCount}
              </span>
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
                className="grid h-6 w-6 place-items-center rounded border border-[#e0e3ea] text-[#6b7280] disabled:opacity-40"
              >
                <ChevronRightIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transcript */}
      <div className="flex h-[560px] flex-col rounded-xl border border-[#e8eaf0] bg-white @min-[1000px]:h-[680px]">
        {!threadFor ? (
          <p className="m-auto max-w-xs px-6 text-center text-[12.5px] text-[#8b93a7]">
            Pick a chat to read it. These are conversations with Windee — reading
            one changes nothing, and you can step in whenever you want to.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f1f2f6] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#1b2033]">
                  {threadFor.name || "Guest"}
                </p>
                <p className="mt-0.5 text-[11px] text-[#8b93a7]">
                  {threadFor.phone ?? "No phone given"} · started {time(threadFor.startedAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {threadFor.ticket ? (
                  <button
                    type="button"
                    onClick={() => onOpenTicket(threadFor.ticket!.conversationId)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#CFEBDA] bg-[#F3FBF6] px-2.5 py-1.5 text-[11px] font-medium text-[#047857] transition-colors hover:bg-[#E7F7EE]"
                  >
                    Open {threadFor.ticket.ticketNo}
                    <ExternalLinkIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="rounded-lg bg-[#F1F5F9] px-2.5 py-1.5 text-[11px] text-[#5b6274]">
                    Never reached a person
                  </span>
                )}

                {/* A chat the customer has closed can't be taken over: they
                    have no widget left to answer in. */}
                {threadFor.status !== "CLOSED" &&
                  threadFor.ticket?.status !== "WITH_AGENT" && (
                    <button
                      type="button"
                      onClick={() => void takeOver(threadFor)}
                      disabled={takingOver}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B4EE6] px-2.5 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {takingOver ? (
                        <Loader2Icon className="h-3 w-3 animate-spin" />
                      ) : (
                        <HeadsetIcon className="h-3 w-3" />
                      )}
                      {takingOver ? "Taking over…" : "Take over chat"}
                    </button>
                  )}
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {threadLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="h-10 animate-pulse rounded-lg bg-[#f4f5f8]" />
                  ))}
                </div>
              ) : (
                thread?.map((message) => {
                  const fromCustomer = message.from === "CUSTOMER";
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${fromCustomer ? "justify-end" : "justify-start"}`}
                    >
                      {!fromCustomer && (
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#EEEAFB] text-[#6B4EE6]">
                          <BotIcon className="h-3.5 w-3.5" />
                        </span>
                      )}

                      <div className="max-w-[78%]">
                        <div
                          className={`whitespace-pre-wrap rounded-xl px-3 py-2 text-[12px] leading-[19px] ${
                            fromCustomer
                              ? "bg-[#EEEAFB] text-[#1b2033]"
                              : "border border-[#ECEAF4] bg-white text-[#3d4459]"
                          }`}
                        >
                          {message.body}
                        </div>
                        {message.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={message.imageUrl}
                            alt=""
                            className="mt-1.5 max-h-40 rounded-lg border border-[#ECEAF4] object-cover"
                          />
                        )}
                        <p
                          className={`mt-1 text-[10px] text-[#9aa1b1] ${
                            fromCustomer ? "text-right" : ""
                          }`}
                        >
                          {time(message.createdAt)}
                        </p>
                      </div>

                      {fromCustomer && (
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eef0f4] text-[#9aa1b1]">
                          <UserIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <p className="border-t border-[#f1f2f6] px-4 py-2.5 text-center text-[11px] text-[#8b93a7]">
              {threadFor.ticket?.status === "WITH_AGENT"
                ? "An agent is handling this in the inbox."
                : threadFor.status === "CLOSED"
                  ? "The customer closed this chat, so it can no longer be taken over."
                  : "Reading this changes nothing. Take over to silence Windee and reply yourself."}
            </p>
          </>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[#f3d9d9] bg-[#fdf6f6] px-3 py-2 text-[12px] text-[#b21f1f] @min-[900px]:col-span-2"
        >
          {error}
        </p>
      )}
    </div>
  );
}
