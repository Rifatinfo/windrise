"use client";

import { useState } from "react";
import { ListIcon, PlusIcon, XIcon } from "lucide-react";

import type { ChannelSummary, QueueSummary, SupportChannel } from "@/services/support/support";
import { ALL_CHANNELS_META, CHANNEL_META } from "./support.helpers";

const PANEL =
  "rounded-xl border border-[#e8eaf0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

function Row({
  active,
  onClick,
  icon,
  label,
  count,
  muted,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  muted?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
        active ? "bg-[#f2effe]" : "hover:bg-[#f7f8fb]"
      }`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">{icon}</span>
      <span
        className={`flex-1 truncate text-[12.5px] ${
          active ? "font-medium text-[#6d4ee6]" : muted ? "text-[#9aa1b1]" : "text-[#3d4459]"
        }`}
      >
        {label}
      </span>
      <span
        className={`shrink-0 text-[11.5px] tabular-nums ${
          active ? "font-medium text-[#6d4ee6]" : "text-[#9aa1b1]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export type RailSelection = {
  channel?: SupportChannel;
  queueId?: string;
};

export function ChannelRail({
  channels,
  queues,
  selection,
  onSelect,
  onCreateQueue,
  onDeleteQueue,
  canManageQueues,
}: {
  channels: ChannelSummary | null;
  queues: QueueSummary | null;
  selection: RailSelection;
  onSelect: (next: RailSelection) => void;
  onCreateQueue: (name: string) => Promise<void>;
  onDeleteQueue: (id: string) => Promise<void>;
  canManageQueues: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await onCreateQueue(name.trim());
      setName("");
      setAdding(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className={PANEL}>
        <header className="flex items-center justify-between px-4 py-3.5">
          <h2 className="text-[13.5px] font-semibold text-[#1b2033]">Channels</h2>
          {canManageQueues && (
            <button
              type="button"
              onClick={() => setAdding((open) => !open)}
              aria-label="Add a queue"
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#6b7280] transition-colors hover:bg-[#f2effe] hover:text-[#6d4ee6]"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
        </header>

        <div className="space-y-0.5 px-2.5 pb-3">
          <Row
            active={!selection.channel && !selection.queueId}
            onClick={() => onSelect({})}
            icon={<ALL_CHANNELS_META.Icon className="h-4 w-4 text-[#6b7280]" />}
            label={ALL_CHANNELS_META.label}
            count={channels?.total ?? 0}
          />

          {(channels?.channels ?? []).map(({ channel, count, connected }) => {
            const meta = CHANNEL_META[channel];
            return (
              <Row
                key={channel}
                active={selection.channel === channel}
                onClick={() => onSelect({ channel })}
                icon={
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${meta.tint}`}
                  >
                    <meta.Icon className="h-3.5 w-3.5" />
                  </span>
                }
                label={meta.label}
                count={count}
                muted={!connected}
                title={connected ? undefined : `${meta.label} is not connected yet`}
              />
            );
          })}
        </div>
      </section>

      <section className={PANEL}>
        <header className="flex items-center justify-between px-4 py-3.5">
          <h2 className="text-[13.5px] font-semibold text-[#1b2033]">Queue</h2>
          <ListIcon className="h-4 w-4 text-[#9aa1b1]" />
        </header>

        <div className="space-y-0.5 px-2.5 pb-3">
          <Row
            active={!selection.queueId && !selection.channel}
            onClick={() => onSelect({})}
            icon={<ALL_CHANNELS_META.Icon className="h-4 w-4 text-[#6b7280]" />}
            label="All Queues"
            count={queues?.total ?? 0}
          />

          {(queues?.queues ?? []).map((queue) => (
            <div key={queue.id} className="group relative">
              <Row
                active={selection.queueId === queue.id}
                onClick={() => onSelect({ queueId: queue.id })}
                icon={
                  <span className="flex h-5 w-5 items-center justify-center rounded border border-[#d8dbe4] text-[9px] text-[#9aa1b1]">
                    <ListIcon className="h-3 w-3" />
                  </span>
                }
                label={queue.name}
                count={queue.count}
              />

              {canManageQueues && !queue.isSystem && (
                <button
                  type="button"
                  onClick={() => onDeleteQueue(queue.id)}
                  aria-label={`Delete ${queue.name}`}
                  className="absolute right-8 top-1/2 hidden -translate-y-1/2 rounded p-1 text-[#9aa1b1] transition-colors hover:text-[#d0342c] group-hover:block"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {adding && (
            <div className="flex items-center gap-1.5 px-1 pt-1.5">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void submit();
                  if (event.key === "Escape") setAdding(false);
                }}
                placeholder="Queue name"
                autoFocus
                className="h-7 flex-1 rounded-md border border-[#e0e3ea] px-2 text-[12px] outline-none focus:border-[#6d4ee6]"
              />
              <button
                type="button"
                onClick={() => void submit()}
                disabled={busy || !name.trim()}
                className="h-7 rounded-md bg-[#6d4ee6] px-2.5 text-[11px] font-medium text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
