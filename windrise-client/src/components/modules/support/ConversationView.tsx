"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  MoreHorizontalIcon,
  RotateCcwIcon,
} from "lucide-react";

import type {
  Agent,
  Attachment,
  ConversationDetail,
  Priority,
  QueueSummary,
} from "@/services/support/support";
import { Avatar, CHANNEL_META, PRIORITY_BADGE } from "./support.helpers";
import { MessageThread } from "./MessageThread";
import { Composer } from "./Composer";

const PANEL =
  "flex h-full min-h-0 flex-col rounded-xl border border-[#e8eaf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

/** Closes a popover when the pointer goes anywhere else. */
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

function TransferMenu({
  agents,
  queues,
  meId,
  onTransfer,
  onClose,
}: {
  agents: Agent[];
  queues: QueueSummary["queues"];
  meId: string | null;
  onTransfer: (target: { agentId?: string; queueId?: string; note?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const ref = useDismiss(onClose);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (target: { agentId?: string; queueId?: string }) => {
    setBusy(true);
    try {
      await onTransfer({ ...target, note: note.trim() || undefined });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 z-30 w-64 rounded-xl border border-[#e8eaf0] bg-white p-2 shadow-[0_8px_28px_rgba(16,24,40,0.12)]"
    >
      <input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Reason (optional)"
        className="mb-2 h-8 w-full rounded-lg border border-[#e4e7ee] px-2.5 text-[11.5px] outline-none focus:border-[#6d4ee6]"
      />

      <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-[#9aa1b1]">
        Agents
      </p>
      <div className="max-h-40 overflow-y-auto">
        {agents.filter((agent) => agent.id !== meId).length === 0 ? (
          <p className="px-2 py-1.5 text-[11px] text-[#9aa1b1]">No other agents yet.</p>
        ) : (
          agents
            .filter((agent) => agent.id !== meId)
            .map((agent) => (
              <button
                key={agent.id}
                type="button"
                disabled={busy}
                onClick={() => void run({ agentId: agent.id })}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#f7f8fb] disabled:opacity-50"
              >
                <Avatar name={agent.name} src={agent.avatar} size={22} />
                <span className="min-w-0 flex-1 truncate text-[11.5px] text-[#3d4459]">
                  {agent.name}
                </span>
                <span className="shrink-0 text-[10px] text-[#9aa1b1]">
                  {agent.openConversations}/{agent.maxConcurrent}
                </span>
              </button>
            ))
        )}
      </div>

      <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[#9aa1b1]">
        Queues
      </p>
      {queues.map((queue) => (
        <button
          key={queue.id}
          type="button"
          disabled={busy}
          onClick={() => void run({ queueId: queue.id })}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#f7f8fb] disabled:opacity-50"
        >
          <span className="truncate text-[11.5px] text-[#3d4459]">{queue.name}</span>
          <span className="text-[10px] text-[#9aa1b1]">{queue.count}</span>
        </button>
      ))}
    </div>
  );
}

function MoreMenu({
  detail,
  onPriority,
  onClose,
  onCloseConversation,
  onReopen,
}: {
  detail: ConversationDetail;
  onPriority: (priority: Priority) => Promise<void>;
  onClose: () => void;
  onCloseConversation: () => Promise<void>;
  onReopen: () => Promise<void>;
}) {
  const ref = useDismiss(onClose);
  const closed = detail.conversation.status === "CLOSED";

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 z-30 w-52 rounded-xl border border-[#e8eaf0] bg-white p-1.5 shadow-[0_8px_28px_rgba(16,24,40,0.12)]"
    >
      <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-[#9aa1b1]">
        Priority
      </p>
      {(Object.keys(PRIORITY_BADGE) as Priority[]).map((priority) => (
        <button
          key={priority}
          type="button"
          onClick={() => {
            void onPriority(priority);
            onClose();
          }}
          className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[11.5px] transition-colors hover:bg-[#f7f8fb] ${
            detail.conversation.priority === priority ? "text-[#6d4ee6]" : "text-[#3d4459]"
          }`}
        >
          {PRIORITY_BADGE[priority].label}
          {detail.conversation.priority === priority && <span>✓</span>}
        </button>
      ))}

      <div className="my-1 h-px bg-[#eef0f4]" />

      {closed ? (
        <button
          type="button"
          onClick={() => {
            void onReopen();
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] text-[#3d4459] transition-colors hover:bg-[#f7f8fb]"
        >
          <RotateCcwIcon className="h-3.5 w-3.5" />
          Reopen conversation
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            void onCloseConversation();
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] text-[#3d4459] transition-colors hover:bg-[#f7f8fb]"
        >
          <CheckCircle2Icon className="h-3.5 w-3.5" />
          Mark as resolved
        </button>
      )}
    </div>
  );
}

export function ConversationView({
  detail,
  agents,
  queues,
  meId,
  customerTyping,
  onClaim,
  onTransfer,
  onSend,
  onTyping,
  onPriority,
  onCloseConversation,
  onReopen,
}: {
  detail: ConversationDetail | null;
  agents: Agent[];
  queues: QueueSummary["queues"];
  meId: string | null;
  customerTyping: boolean;
  onClaim: () => Promise<void>;
  onTransfer: (target: { agentId?: string; queueId?: string; note?: string }) => Promise<void>;
  onSend: (payload: {
    body: string;
    attachments: Attachment[];
    isInternalNote: boolean;
  }) => Promise<void>;
  onTyping: (on: boolean) => void;
  onPriority: (priority: Priority) => Promise<void>;
  onCloseConversation: () => Promise<void>;
  onReopen: () => Promise<void>;
}) {
  const [menu, setMenu] = useState<"transfer" | "more" | null>(null);
  const [claiming, setClaiming] = useState(false);

  if (!detail) {
    return (
      <section className={`${PANEL} items-center justify-center`}>
        <p className="text-[12.5px] text-[#9aa1b1]">
          Select a conversation to start reading it.
        </p>
      </section>
    );
  }

  const { conversation } = detail;
  const channel = CHANNEL_META[conversation.channel];
  const queued = conversation.status === "IN_QUEUE";
  const closed = conversation.status === "CLOSED";
  const mine = conversation.assignedAgent?.id === meId;

  return (
    <section className={PANEL}>
      <header className="flex items-center justify-between gap-3 border-b border-[#eef0f4] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={conversation.contact.name} src={conversation.contact.avatarUrl} size={34} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[#1b2033]">
              {conversation.contact.name}
            </p>
            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-[#8b93a7]">
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${channel.tint}`}
              >
                <channel.Icon className="h-2 w-2" />
              </span>
              {channel.label}
            </span>
          </div>
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="More actions"
            onClick={() => setMenu(menu === "more" ? null : "more")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition-colors hover:bg-[#f4f5f8]"
          >
            <MoreHorizontalIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={closed}
            onClick={() => setMenu(menu === "transfer" ? null : "transfer")}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e0e3ea] px-3 text-[12px] font-medium text-[#3d4459] transition-colors hover:bg-[#f7f8fb] disabled:opacity-40"
          >
            Transfer
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </button>

          {queued || (!mine && !closed) ? (
            <button
              type="button"
              disabled={claiming}
              onClick={async () => {
                setClaiming(true);
                try {
                  await onClaim();
                } finally {
                  setClaiming(false);
                }
              }}
              className="flex h-8 items-center rounded-lg bg-[#1b2033] px-3.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {claiming ? "Starting…" : "Start Chat"}
            </button>
          ) : closed ? (
            <button
              type="button"
              onClick={() => void onReopen()}
              className="flex h-8 items-center rounded-lg bg-[#1b2033] px-3.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Reopen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void onCloseConversation()}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-[#1b2033] px-3.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <CheckCircle2Icon className="h-3.5 w-3.5" />
              Resolve
            </button>
          )}

          {menu === "transfer" && (
            <TransferMenu
              agents={agents}
              queues={queues}
              meId={meId}
              onTransfer={onTransfer}
              onClose={() => setMenu(null)}
            />
          )}
          {menu === "more" && (
            <MoreMenu
              detail={detail}
              onPriority={onPriority}
              onClose={() => setMenu(null)}
              onCloseConversation={onCloseConversation}
              onReopen={onReopen}
            />
          )}
        </div>
      </header>

      {queued && (
        <p className="mx-4 mt-3 rounded-lg bg-[#fdf6e3] px-3 py-2.5 text-center text-[11.5px] text-[#8a6a25]">
          This conversation is from queue. It will be assigned to you once you start chatting.
        </p>
      )}

      {closed && (
        <p className="mx-4 mt-3 rounded-lg bg-[#f4f5f8] px-3 py-2.5 text-center text-[11.5px] text-[#7b8194]">
          This conversation is closed. Reopen it to reply.
        </p>
      )}

      <MessageThread
        messages={detail.messages}
        customerName={conversation.contact.name}
        customerAvatar={conversation.contact.avatarUrl}
        customerTyping={customerTyping}
        queue={detail.queue}
      />

      <Composer
        disabled={closed}
        disabledReason="This conversation is closed. Reopen it to reply."
        onSend={onSend}
        onTyping={onTyping}
      />
    </section>
  );
}
