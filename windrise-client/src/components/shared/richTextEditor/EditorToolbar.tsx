"use client"

import * as React from "react"
import { useEditorState, type Editor } from "@tiptap/react"
import { sinkListItem, liftListItem } from "@tiptap/pm/schema-list"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Palette,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react"

import { HeadingDropdown } from "./HeadingDropdown"
import { LinkPopover, type LinkPopoverHandle } from "./LinkPopover"
import { ColorSwatchPopover } from "./ColorSwatchPopover"
import { ToolbarButton, ToolbarSeparator } from "./ToolbarButton"
import { TableGridPicker } from "./toolbar/TableGridPicker"
import { activeAlignment, applyAlignment } from "./editorActions"

const TEXT_COLORS = [
  "#1a1a1a", "#334155", "#64748b", "#94a3b8", "#e5484d", "#f97316",
  "#f59e0b", "#16a34a", "#0d9488", "#0ea5e9", "#5b5bf5", "#a855f7",
]

const HIGHLIGHT_COLORS = [
  "#fef08a", "#fecaca", "#bbf7d0", "#bfdbfe",
  "#e9d5ff", "#fed7aa", "#cffafe", "#e2e8f0",
]

/**
 * Toolbar row one — the core formatting controls.
 *
 * `full` turns on the extras the blog editor needs (super/subscript, the
 * table grid picker, fullscreen). The product editor keeps the shorter row.
 */
export function EditorToolbar({
  editor,
  full,
  fullscreen,
  onToggleFullscreen,
  lastColor,
  onColorUsed,
  linkRef,
}: {
  editor: Editor
  full?: boolean
  fullscreen?: boolean
  onToggleFullscreen?: () => void
  lastColor?: string
  onColorUsed?: (color: string) => void
  /** Lets ⌘K open the link editor from outside the toolbar. */
  linkRef?: React.Ref<LinkPopoverHandle>
}) {
  const listItemType = editor.schema.nodes.listItem

  // Tiptap v3's `useEditor` does not re-render on transactions
  // (`shouldRerenderOnTransaction` defaults to false), so every piece of
  // derived toolbar state has to be subscribed explicitly. Without this the
  // active states, enabled/disabled states and the heading label go stale the
  // moment the caret moves without changing the document.
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isStrike: editor.isActive("strike"),
      isSuperscript: editor.isActive("superscript"),
      isSubscript: editor.isActive("subscript"),
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isBlockquote: editor.isActive("blockquote"),
      isCode: editor.isActive("code"),
      isLink: editor.isActive("link"),
      // Media blocks report their own alignment, so the buttons light up
      // correctly whether an image or a paragraph is selected.
      alignment: activeAlignment(editor),
      headingLevel:
        ([1, 2, 3, 4, 5, 6] as const).find((level) =>
          editor.isActive("heading", { level })
        ) ?? 0,
      textColor: editor.getAttributes("textStyle").color ?? null,
      highlightColor: editor.getAttributes("highlight").color ?? null,
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
      canIndent: sinkListItem(listItemType)(editor.state),
      canOutdent: liftListItem(listItemType)(editor.state),
    }),
  })

  const indent = () => {
    editor
      .chain()
      .focus()
      .command(({ state, dispatch }) => sinkListItem(listItemType)(state, dispatch))
      .run()
  }

  const outdent = () => {
    editor
      .chain()
      .focus()
      .command(({ state, dispatch }) => liftListItem(listItemType)(state, dispatch))
      .run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input p-1.5">
      <ToolbarButton
        label="Undo"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 />
      </ToolbarButton>

      <ToolbarSeparator />

      <HeadingDropdown editor={editor} activeLevel={state.headingLevel} />

      <ToolbarSeparator />

      <ToolbarButton
        label="Bold"
        active={state.isBold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={state.isItalic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={state.isUnderline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={state.isStrike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough />
      </ToolbarButton>

      <ColorSwatchPopover
        label="Text color"
        icon={
          full ? (
            <span className="flex flex-col items-center leading-none">
              <span className="text-[11px] font-semibold">A</span>
              <span
                className="mt-[2px] block h-[3px] w-[13px] rounded-sm"
                style={{ backgroundColor: state.textColor ?? lastColor ?? "#1a1a1a" }}
              />
            </span>
          ) : (
            <Palette />
          )
        }
        colors={TEXT_COLORS}
        columns={6}
        activeColor={state.textColor}
        onSelect={(color) => {
          onColorUsed?.(color)
          editor.chain().focus().setColor(color).run()
        }}
        onClear={() => editor.chain().focus().unsetColor().run()}
      />
      <ColorSwatchPopover
        label="Highlight"
        clearLabel="Remove highlight"
        icon={<Highlighter />}
        colors={HIGHLIGHT_COLORS}
        columns={full ? 8 : 6}
        activeColor={state.highlightColor}
        onSelect={(color) => editor.chain().focus().setHighlight({ color }).run()}
        onClear={() => editor.chain().focus().unsetHighlight().run()}
      />

      {full && (
        <>
          <ToolbarSeparator />
          <ToolbarButton
            label="Superscript"
            active={state.isSuperscript}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
          >
            <SuperscriptIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Subscript"
            active={state.isSubscript}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
          >
            <SubscriptIcon />
          </ToolbarButton>
        </>
      )}

      <ToolbarSeparator />

      <ToolbarButton
        label="Bullet list"
        active={state.isBulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={state.isOrderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton label="Decrease indent" disabled={!state.canOutdent} onClick={outdent}>
        <IndentDecrease />
      </ToolbarButton>
      <ToolbarButton label="Increase indent" disabled={!state.canIndent} onClick={indent}>
        <IndentIncrease />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        label="Align left"
        active={state.alignment === "left"}
        onClick={() => applyAlignment(editor, "left")}
      >
        <AlignLeft />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        active={state.alignment === "center"}
        onClick={() => applyAlignment(editor, "center")}
      >
        <AlignCenter />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        active={state.alignment === "right"}
        onClick={() => applyAlignment(editor, "right")}
      >
        <AlignRight />
      </ToolbarButton>
      <ToolbarButton
        label="Justify"
        active={state.alignment === "justify"}
        onClick={() => applyAlignment(editor, "justify")}
      >
        <AlignJustify />
      </ToolbarButton>

      <ToolbarSeparator />

      <LinkPopover ref={linkRef} editor={editor} isActive={state.isLink} />

      <ToolbarButton
        label="Blockquote"
        active={state.isBlockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote />
      </ToolbarButton>
      <ToolbarButton
        label="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={state.isCode}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code />
      </ToolbarButton>

      <ToolbarSeparator />

      {full ? (
        <TableGridPicker editor={editor} />
      ) : (
        <ToolbarButton
          label="Insert table"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <TableIcon />
        </ToolbarButton>
      )}

      {full && onToggleFullscreen ? (
        <ToolbarButton
          label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          active={fullscreen}
          onClick={onToggleFullscreen}
        >
          {fullscreen ? <Minimize2 /> : <Maximize2 />}
        </ToolbarButton>
      ) : (
        <>
          <ToolbarSeparator />
          <ToolbarButton
            label="Clear formatting"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          >
            <RemoveFormatting />
          </ToolbarButton>
        </>
      )}
    </div>
  )
}
