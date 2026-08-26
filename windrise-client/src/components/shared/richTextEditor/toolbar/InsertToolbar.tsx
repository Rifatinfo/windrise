"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import {
  ChevronDown,
  ChevronsDownUp,
  FileIcon,
  ImageIcon,
  Images,
  Info,
  Link2,
  Minus,
  MoreHorizontal,
  MousePointerClick,
  Music,
  Code2,
  MoveVertical,
  PlayCircle,
  Quote,
  SquareArrowOutUpRight,
  TextQuote,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { runQuickAction, type ModalKind } from "../editorActions"
import { TableGridPicker } from "./TableGridPicker"

/** lucide-react v1 dropped brand marks, so YouTube is drawn inline. */
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <rect x="2" y="5" width="20" height="14" rx="4" fill="#ef4444" />
      <path d="M10 9.2v5.6l5-2.8z" fill="#fff" />
    </svg>
  )
}

/** A wide icon + label button — the row-2 visual language. */
export function WideButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-ink-soft transition-colors outline-none",
        "hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

/**
 * Toolbar row two — everything that drops a block of content into the post.
 * Anything needing input hands off to the shared modal via `onOpenModal`.
 */
export function InsertToolbar({
  editor,
  onOpenModal,
}: {
  editor: Editor
  onOpenModal: (kind: ModalKind) => void
}) {
  const [moreOpen, setMoreOpen] = React.useState(false)

  const more: { label: string; icon: React.ReactNode; run: () => void }[] = [
    {
      label: "Code block",
      icon: <Code2 />,
      run: () => runQuickAction(editor, "codeBlock"),
    },
    {
      label: "Blockquote",
      icon: <Quote />,
      run: () => runQuickAction(editor, "quote"),
    },
    {
      label: "Anchor link",
      icon: <Link2 />,
      run: () => onOpenModal("anchor"),
    },
    {
      label: "Read more tag",
      icon: <TextQuote />,
      run: () => runQuickAction(editor, "readMore"),
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-1.5 py-1">
      <WideButton icon={<ImageIcon />} label="Image" onClick={() => onOpenModal("image")} />
      <WideButton icon={<Images />} label="Gallery" onClick={() => onOpenModal("gallery")} />
      <WideButton icon={<PlayCircle />} label="Video" onClick={() => onOpenModal("video")} />
      <WideButton icon={<Music />} label="Audio" onClick={() => onOpenModal("audio")} />
      <WideButton icon={<FileIcon />} label="File" onClick={() => onOpenModal("file")} />
      <WideButton
        icon={<SquareArrowOutUpRight />}
        label="Embed"
        onClick={() => onOpenModal("embed")}
      />
      <WideButton
        icon={<YouTubeIcon />}
        label="YouTube"
        onClick={() => onOpenModal("youtube")}
      />
      <WideButton
        icon={<Minus />}
        label="Divider"
        onClick={() => runQuickAction(editor, "divider")}
      />
      <WideButton
        icon={<MoveVertical />}
        label="Spacer"
        onClick={() => runQuickAction(editor, "spacer")}
      />
      <WideButton
        icon={<MousePointerClick />}
        label="Button"
        onClick={() => onOpenModal("cta")}
      />
      <WideButton icon={<Info />} label="Callout" onClick={() => onOpenModal("callout")} />
      <WideButton
        icon={<ChevronsDownUp />}
        label="Accordion"
        onClick={() => runQuickAction(editor, "accordion")}
      />

      <TableGridPicker editor={editor} compact />

      <Popover open={moreOpen} onOpenChange={setMoreOpen}>
        <PopoverTrigger
          title="More blocks"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-ink-soft transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0"
        >
          <MoreHorizontal />
          <span>More</span>
          <ChevronDown className="size-3 opacity-60" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48 p-1">
          {more.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.run()
                setMoreOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-slate-700 outline-none transition-colors hover:bg-slate-100 [&_svg]:size-3.5 [&_svg]:text-slate-400"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}
