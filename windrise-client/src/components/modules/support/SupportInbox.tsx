"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import * as api from "@/services/support/support";
import type {
  Agent,
  ChannelSummary,
  Conversation,
  ConversationDetail,
  ListFilters,
  Message,
  Meta,
  Priority,
  QueueSummary,
  Stats,
} from "@/services/support/support";

import { SupportHeader } from "./SupportHeader";
import { StatCards } from "./StatCards";
import { WindeeChats } from "./WindeeChats";
import { ChannelRail, type RailSelection } from "./ChannelRail";
import { ConversationList } from "./ConversationList";
import { ConversationView } from "./ConversationView";
import { CustomerPanel } from "./CustomerPanel";

const EMPTY_META: Meta = { page: 1, limit: 20, total: 0 };

/** How long a typing indicator stays up without a further signal. */
const TYPING_TTL_MS = 4000;

export function SupportInbox() {
  const [me, setMe] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [channels, setChannels] = useState<ChannelSummary | null>(null);
  const [queues, setQueues] = useState<QueueSummary | null>(null);

  const [filters, setFilters] = useState<ListFilters>({ sort: "oldest", page: 1, limit: 20 });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [meta, setMeta] = useState<Meta>(EMPTY_META);
  const [listLoading, setListLoading] = useState(true);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [unread, setUnread] = useState<Conversation[]>([]);

  /**
   * Which surface is on screen. Windee chats are a separate view rather than a
   * filter on the inbox: they carry no queue, assignee or unread state, so
   * mixing them into the working list would put unanswerable rows next to real
   * queue work.
   */
  const [view, setView] = useState<"inbox" | "windee">("inbox");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  // Read inside the SSE handler, which is registered once and must not close
  // over a stale conversation id.
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Loaders -------------------------------------------------------------

  const refreshSidebars = useCallback(async () => {
    const [nextStats, nextChannels, nextQueues] = await Promise.all([
      api.getStats(),
      api.getChannels(),
      api.getQueues(),
    ]);
    setStats(nextStats);
    setChannels(nextChannels);
    setQueues(nextQueues);
  }, []);

  /**
   * Coalesces sidebar refreshes.
   *
   * One reply raises several events — the message, then the conversation — and
   * each of them wants the counters redrawn. Firing three summary requests per
   * event turned a busy queue into a stampede for numbers that had not changed
   * between them. A short trailing window collapses a burst into one refresh.
   */
  const sidebarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSidebarRefresh = useCallback(() => {
    if (sidebarTimer.current) clearTimeout(sidebarTimer.current);
    sidebarTimer.current = setTimeout(() => {
      sidebarTimer.current = null;
      void refreshSidebars().catch(() => null);
    }, 600);
  }, [refreshSidebars]);

  useEffect(() => () => {
    if (sidebarTimer.current) clearTimeout(sidebarTimer.current);
  }, []);

  const refreshList = useCallback(async (current: ListFilters) => {
    setListLoading(true);
    try {
      const { data, meta: nextMeta } = await api.listConversations(current);
      setConversations(data);
      setMeta(nextMeta);
      return data;
    } finally {
      setListLoading(false);
    }
  }, []);

  const openConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setTyping(false);
    try {
      const next = await api.getConversation(id);
      setDetail(next);
      if (next.conversation.unreadForAgent > 0) {
        await api.markRead(id);
        setConversations((current) =>
          current.map((row) => (row.id === id ? { ...row, unreadForAgent: 0 } : row)),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open that conversation.");
    }
  }, []);

  const loadUnread = useCallback(async () => {
    const { data } = await api.listConversations({ unread: true, limit: 10, sort: "newest" });
    setUnread(data);
  }, []);

  /**
   * Adds a message to the open thread unless it is already there.
   *
   * Two paths write to this list — the reply to a POST and the live stream —
   * and either can land first. Guarding only one of them left the other free to
   * insert a row the first had already added, which React sees as two children
   * with the same key. Identity is the message id, so checking it is enough.
   */
  const appendMessage = useCallback((conversationId: string, message: Message) => {
    setDetail((current) => {
      if (!current || current.conversation.id !== conversationId) return current;
      if (current.messages.some((m) => m.id === message.id)) return current;
      return { ...current, messages: [...current.messages, message] };
    });
  }, []);

  // --- First load ----------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [profile, roster] = await Promise.all([api.getMe(), api.getAgents()]);
        if (cancelled) return;

        setMe(profile);
        setAgents(roster);
        await refreshSidebars();

        const first = await refreshList({ sort: "oldest", page: 1, limit: 20 });
        // Open the top conversation so the panel is never empty on arrival.
        if (!cancelled && first.length > 0) void openConversation(first[0].id);
      } catch (err) {
        if (!cancelled) {
          setFatal(err instanceof Error ? err.message : "Couldn't load the support inbox.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshSidebars, refreshList, openConversation]);

  // Re-run whenever the filters change, but not on the very first render —
  // the bootstrap above already fetched page one.
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      return;
    }
    void refreshList(filters);
  }, [filters, refreshList]);

  // --- Live updates --------------------------------------------------------

  useEffect(() => {
    if (fatal) return;

    const source = new EventSource(api.streamUrl(), { withCredentials: true });

    const patchConversation = (incoming: Conversation) => {
      setConversations((current) => {
        const index = current.findIndex((row) => row.id === incoming.id);
        if (index === -1) return current;
        const next = [...current];
        next[index] = incoming;
        return next;
      });

      // Keep the open thread's header, status and tags in step.
      setDetail((current) =>
        current?.conversation.id === incoming.id
          ? { ...current, conversation: incoming }
          : current,
      );
    };

    const onConversation = (event: MessageEvent) => {
      const { conversation } = JSON.parse(event.data) as { conversation: Conversation };
      patchConversation(conversation);
      scheduleSidebarRefresh();
    };

    source.addEventListener("conversation.updated", onConversation);
    source.addEventListener("conversation.closed", onConversation);

    source.addEventListener("conversation.created", (event) => {
      const { conversation } = JSON.parse((event as MessageEvent).data) as {
        conversation: Conversation;
      };

      setConversations((current) => {
        // A customer returning to a ticket they had ended arrives as new work
        // on a row that is already listed. Patching it is what clears the
        // stale "Closed" badge and moves it back up the list; ignoring it, as
        // this once did, left the row looking closed while the person waited.
        const index = current.findIndex((row) => row.id === conversation.id);
        if (index !== -1) {
          const next = [...current];
          next.splice(index, 1);
          return [conversation, ...next];
        }

        // Only surface it where it belongs: dropping a new row onto page three
        // of a filtered list would be worse than leaving the counters to say so.
        return (filters.page ?? 1) === 1
          ? [conversation, ...current].slice(0, filters.limit ?? 20)
          : current;
      });

      // The open thread needs it too — this is what re-enables the composer
      // when the customer comes back to the conversation an agent is reading.
      setDetail((current) =>
        current?.conversation.id === conversation.id
          ? { ...current, conversation }
          : current,
      );

      scheduleSidebarRefresh();
      void loadUnread().catch(() => null);
    });

    source.addEventListener("message.created", (event) => {
      const { conversationId, message } = JSON.parse((event as MessageEvent).data) as {
        conversationId: string;
        message: ConversationDetail["messages"][number];
      };

      if (conversationId !== activeIdRef.current) {
        scheduleSidebarRefresh();
        return;
      }

      setTyping(false);
      appendMessage(conversationId, message);

      if (message.author === "CUSTOMER") void api.markRead(conversationId);
    });

    source.addEventListener("typing", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as {
        conversationId: string;
        from: string;
        on: boolean;
      };
      if (payload.conversationId !== activeIdRef.current || payload.from === "agent") return;

      setTyping(payload.on);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      // Fall back to off: a client that disconnects mid-type would otherwise
      // leave the dots running forever.
      if (payload.on) typingTimer.current = setTimeout(() => setTyping(false), TYPING_TTL_MS);
    });

    source.addEventListener("agent.presence", () => {
      void api.getAgents().then(setAgents);
    });

    return () => {
      source.close();
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [fatal, scheduleSidebarRefresh, appendMessage, loadUnread, filters.page, filters.limit]);

  // Keeps the agent's presence from going stale while the tab is open.
  useEffect(() => {
    if (fatal) return;
    const id = setInterval(() => void api.heartbeat().catch(() => null), 60_000);
    return () => clearInterval(id);
  }, [fatal]);

  // --- Actions -------------------------------------------------------------

  const guard = async (run: () => Promise<void>) => {
    setError(null);
    try {
      await run();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const applyDetail = async (next: ConversationDetail) => {
    setDetail(next);
    setConversations((current) =>
      current.map((row) => (row.id === next.conversation.id ? next.conversation : row)),
    );
    await refreshSidebars();
    const profile = await api.getMe();
    setMe(profile);
  };

  const updateFilters = useCallback((patch: Partial<ListFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const onRailSelect = (selection: RailSelection) =>
    setFilters((current) => ({
      ...current,
      channel: selection.channel,
      queueId: selection.queueId,
      page: 1,
    }));

  if (fatal) {
    return (
      <div className="px-4 lg:px-6">
        <div className="rounded-xl border border-[#f3d9d9] bg-[#fdf6f6] px-4 py-6 text-center">
          <p className="text-[13px] font-medium text-[#b21f1f]">{fatal}</p>
          <p className="mt-1 text-[12px] text-[#8b93a7]">
            The support inbox is available to admins and customer-support accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <SupportHeader
        me={me}
        unreadCount={stats?.unreadConversations ?? 0}
        unread={unread}
        onLoadUnread={() => void loadUnread()}
        onOpenConversation={(id) => void openConversation(id)}
        onPresenceChange={(presence) =>
          guard(async () => {
            setMe(await api.setPresence(presence));
          })
        }
      />

      <StatCards stats={stats} />

      {/* The counters above describe the inbox only, whichever view is open:
          Windee chats have no queue and no unread state to count. */}
      <div className="flex gap-1.5">
        {(
          [
            ["inbox", "Inbox"],
            ["windee", "Windee chats"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              view === value
                ? "bg-[#1b2033] text-white"
                : "bg-white text-[#5b6274] ring-1 ring-[#e8eaf0] hover:bg-[#f7f8fb]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-[#f3d9d9] bg-[#fdf6f6] px-3 py-2 text-[12px] text-[#b21f1f]">
          {error}
        </p>
      )}

      {/*
        Breakpoints follow the container, not the viewport: the dashboard's own
        sidebar takes ~288px and can be collapsed, so a viewport-based `xl:`
        would drop the customer rail to the bottom on exactly the screens that
        have room for it, and keep it squeezed on the ones that don't.
      */}
      <div className="@container">
        {view === "windee" ? (
          <WindeeChats
            onOpenTicket={(id) => {
              setView("inbox");
              void openConversation(id);
            }}
          />
        ) : (
        <div className="grid grid-cols-1 gap-4 @min-[760px]:grid-cols-[216px_minmax(0,1fr)] @min-[1000px]:grid-cols-[216px_290px_minmax(0,1fr)] @min-[1240px]:grid-cols-[216px_282px_minmax(0,1fr)_252px]">
          <ChannelRail
            channels={channels}
            queues={queues}
            selection={{ channel: filters.channel, queueId: filters.queueId }}
            onSelect={onRailSelect}
            canManageQueues={me?.role === "ADMIN"}
            onCreateQueue={(name) =>
              guard(async () => {
                await api.createQueue(name);
                await refreshSidebars();
              })
            }
            onDeleteQueue={(id) =>
              guard(async () => {
                await api.deleteQueue(id);
                await refreshSidebars();
              })
            }
          />

          <div className="h-[560px] @min-[1000px]:h-[680px]">
            <ConversationList
              conversations={conversations}
              meta={meta}
              loading={listLoading}
              activeId={activeId}
              filters={filters}
              onSelect={(id) => void openConversation(id)}
              onFiltersChange={updateFilters}
            />
          </div>

          {/* Spans the full row until there is a column of its own, so it is
              never squeezed into the 216px rail track. */}
          <div className="h-[680px] @min-[760px]:col-span-2 @min-[1000px]:col-span-1">
            <ConversationView
              detail={detail}
              agents={agents}
              queues={queues?.queues ?? []}
              meId={me?.id ?? null}
              customerTyping={typing}
              onClaim={() =>
                guard(async () => {
                  if (!activeId) return;
                  await applyDetail(await api.claimConversation(activeId));
                })
              }
              onTransfer={(target) =>
                guard(async () => {
                  if (!activeId) return;
                  await applyDetail(await api.transferConversation(activeId, target));
                })
              }
              onPriority={(priority: Priority) =>
                guard(async () => {
                  if (!activeId) return;
                  await api.setPriority(activeId, priority);
                  setDetail(await api.getConversation(activeId));
                })
              }
              onCloseConversation={() =>
                guard(async () => {
                  if (!activeId) return;
                  await applyDetail(await api.closeConversation(activeId));
                })
              }
              onReopen={() =>
                guard(async () => {
                  if (!activeId) return;
                  await applyDetail(await api.reopenConversation(activeId));
                })
              }
              onTyping={(on) => {
                if (activeId) void api.setTyping(activeId, on);
              }}
              onSend={async ({ body, attachments, isInternalNote }) => {
                if (!activeId) return;
                const message = await api.sendReply(activeId, {
                  body,
                  attachments,
                  isInternalNote,
                });

                // Shown immediately; if the stream already delivered it, the
                // helper leaves the transcript alone.
                appendMessage(activeId, message);

                // Nothing else is awaited. The composer stays disabled until
                // this resolves, and the two calls that used to follow —
                // re-reading the whole conversation and all three sidebar
                // summaries — are work the agent should never wait on: the
                // server broadcasts the same conversation update over the live
                // stream, and its handler already refreshes the sidebars.
                // Kept as a background safety net for a dropped stream.
                scheduleSidebarRefresh();
              }}
            />
          </div>

          <div className="@min-[760px]:col-span-2 @min-[1000px]:col-span-3 @min-[1240px]:col-span-1 @min-[1240px]:max-h-[680px] @min-[1240px]:overflow-y-auto">
            <CustomerPanel
              detail={detail}
              onAddTag={(name) =>
                guard(async () => {
                  if (!activeId) return;
                  await api.addTag(activeId, name);
                  setDetail(await api.getConversation(activeId));
                })
              }
              onRemoveTag={(tagId) =>
                guard(async () => {
                  if (!activeId) return;
                  await api.removeTag(activeId, tagId);
                  setDetail(await api.getConversation(activeId));
                })
              }
              onOpenConversation={(id) => void openConversation(id)}
            />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
