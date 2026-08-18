"use client"

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
  Minus,
  Palette,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react"

import { HeadingDropdown } from "./HeadingDropdown"
import { LinkPopover } from "./LinkPopover"
import { ColorSwatchPopover } from "./ColorSwatchPopover"
import { ToolbarButton, ToolbarSeparator } from "./ToolbarButton"

const TEXT_COLORS = [
  "#1a1a1a",
  "#64748b",
  "#e5484d",
  "#f59e0b",
  "#16a34a",
  "#5b5bf5",
  "#0ea5e9",
  "#a855f7",
]

const HIGHLIGHT_COLORS = [
  "#fef08a",
  "#fecaca",
  "#bbf7d0",
  "#bfdbfe",
  "#e9d5ff",
  "#fed7aa",
]

export function EditorToolbar({ editor }: { editor: Editor }) {
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
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isBlockquote: editor.isActive("blockquote"),
      isCode: editor.isActive("code"),
      isLink: editor.isActive("link"),
      alignLeft: editor.isActive({ textAlign: "left" }),
      alignCenter: editor.isActive({ textAlign: "center" }),
      alignRight: editor.isActive({ textAlign: "right" }),
      alignJustify: editor.isActive({ textAlign: "justify" }),
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
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border-b border-input p-1.5">
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
        icon={<Palette />}
        colors={TEXT_COLORS}
        activeColor={state.textColor}
        onSelect={(color) => editor.chain().focus().setColor(color).run()}
        onClear={() => editor.chain().focus().unsetColor().run()}
      />
      <ColorSwatchPopover
        label="Highlight"
        icon={<Highlighter />}
        colors={HIGHLIGHT_COLORS}
        activeColor={state.highlightColor}
        onSelect={(color) =>
          editor.chain().focus().setHighlight({ color }).run()
        }
        onClear={() => editor.chain().focus().unsetHighlight().run()}
      />

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
        active={state.alignLeft}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        active={state.alignCenter}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        active={state.alignRight}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight />
      </ToolbarButton>
      <ToolbarButton
        label="Justify"
        active={state.alignJustify}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify />
      </ToolbarButton>

      <ToolbarSeparator />

      <LinkPopover editor={editor} isActive={state.isLink} />

      <ToolbarSeparator />

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
      <ToolbarButton
        label="Insert table"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <TableIcon />
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarButton
        label="Clear formatting"
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
      >
        <RemoveFormatting />
      </ToolbarButton>
    </div>
  )
}
