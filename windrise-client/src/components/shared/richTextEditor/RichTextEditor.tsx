"use client"

import * as React from "react"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle, Color, FontFamily, FontSize } from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"

import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductDescriptionRenderer } from "@/components/shared/ProductDescriptionRenderer"


import { EditorToolbar } from "./EditorToolbar"
import type { LinkPopoverHandle } from "./LinkPopover"
import { InsertToolbar } from "./toolbar/InsertToolbar"
import { StyleToolbar } from "./toolbar/StyleToolbar"
import { SlashCommandMenu } from "./SlashCommandMenu"
import { Cheatsheet } from "./Cheatsheet"
import { getPrefs, getServerPrefs, setPrefs, subscribePrefs } from "./prefsStore"
import { EditorFooter, type EditorFooterActions, type SaveState } from "./EditorFooter"
import { EditorModal } from "./modals/EditorModal"
import { ShortcutsModal } from "./modals/ShortcutsModal"
import { TableToolbar } from "./toolbar/TableToolbar"
import { applyModal, modalSpec, type ModalKind } from "./editorActions"
import { POST_BLOCKS } from "./extensions/mediaViews"
import { StyledTableCell, StyledTableHeader } from "./extensions/tableCells"
import {
  AnchorId,
  BlockSpacing,
  HeadingId,
  InlineTypography,
  KeyboardKey,
  Subscript,
  Superscript,
} from "./extensions/typography"
import { PostContentRenderer } from "../PostContentRenderer"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  className?: string
  /**
   * `full` turns on the blog authoring surface: the insert and style toolbar
   * rows, slash commands, the cheatsheet panel and the publish footer.
   */
  variant?: "basic" | "full"
  /** Footer wiring — only read in the `full` variant. */
  footerActions?: EditorFooterActions
  saveState?: SaveState
  savedAt?: Date | null
  /** Called when auto-save is on and the document has settled. */
  onAutoSave?: () => void
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your product description...",
  minHeight = 300,
  className,
  variant = "basic",
  footerActions,
  saveState = "idle",
  savedAt = null,
  onAutoSave,
}: RichTextEditorProps) {
  const full = variant === "full"
  // Post-only table styling hangs off this extra class, so the product
  // editor keeps the scrolling block table it has always had.
  const contentClass = full ? "rte-content rte-content-post" : "rte-content"

  const [tab, setTab] = React.useState<"write" | "preview">("write")
  const [fullscreen, setFullscreen] = React.useState(false)
  const [modal, setModal] = React.useState<ModalKind | null>(null)
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)
  const [lastColor, setLastColor] = React.useState("#5b5bf5")
  const [notice, setNotice] = React.useState<string | null>(null)
  const linkRef = React.useRef<LinkPopoverHandle>(null)

  const prefs = React.useSyncExternalStore(subscribePrefs, getPrefs, getServerPrefs)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      TableRow,
      // Only the post editor gets draggable column widths and per-cell
      // styling; the product editor keeps the plain table it always had.
      ...(full
        ? [
            // `renderWrapper` puts the scroll container into the saved HTML
            // too, so a wide table behaves the same for the reader as it
            // does in the editor.
            Table.configure({ resizable: true, cellMinWidth: 56, renderWrapper: true }),
            StyledTableHeader,
            StyledTableCell,
            FontFamily,
            FontSize,
            InlineTypography,
            BlockSpacing,
            HeadingId,
            AnchorId,
            Superscript,
            Subscript,
            KeyboardKey,
            ...POST_BLOCKS,
          ]
        : [Table.configure({ resizable: false }), TableHeader, TableCell]),
    ],
    content: value,
    editorProps: {
      attributes: { class: contentClass },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Keep the editor in sync when `value` changes from outside (e.g. the
  // Edit Product page hydrating form state after the product loads).
  React.useEffect(() => {
    if (!editor) return
    if (value === editor.getHTML()) return
    editor.commands.setContent(value ?? "", { emitUpdate: false })
  }, [value, editor])

  const { words, characters, blockTag } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      words: editor?.storage.characterCount?.words() ?? 0,
      characters: editor?.storage.characterCount?.characters() ?? 0,
      blockTag: currentBlockTag(editor),
    }),
  }) ?? { words: 0, characters: 0, blockTag: "P" }

  // ---- Preferences ---------------------------------------------------------

  React.useEffect(() => {
    editor?.setOptions({
      editorProps: {
        attributes: {
          class: contentClass,
          spellcheck: prefs.noSpellCheck ? "false" : "true",
        },
      },
    })
  }, [editor, contentClass, prefs.noSpellCheck])

  // ---- Auto-save -----------------------------------------------------------

  // Held in a ref so the debounce timer always calls the latest closure
  // without re-arming every time the host re-renders.
  const autoSaveRef = React.useRef(onAutoSave)
  React.useEffect(() => {
    autoSaveRef.current = onAutoSave
  })

  React.useEffect(() => {
    if (!full || !prefs.autoSave || !autoSaveRef.current) return
    const timer = window.setTimeout(() => autoSaveRef.current?.(), 900)
    return () => window.clearTimeout(timer)
    // `value` is the document; re-arming on every keystroke is the debounce.
  }, [value, full, prefs.autoSave])

  // ---- Keyboard shortcuts --------------------------------------------------

  React.useEffect(() => {
    if (!full) return

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (!mod) return

      if (event.key.toLowerCase() === "k") {
        event.preventDefault()
        linkRef.current?.open()
        return
      }
      if (event.key.toLowerCase() === "s") {
        event.preventDefault()
        footerActions?.onSaveDraft()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [full, footerActions])

  // Fullscreen locks the page behind the overlay.
  React.useEffect(() => {
    if (!fullscreen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [fullscreen])

  // Transient hint from the cheatsheet ("add headings first", etc.).
  React.useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  const editorHeight = fullscreen ? undefined : { minHeight, maxHeight: minHeight * 2 }

  const surface = (
    <Tabs
      value={tab}
      onValueChange={(next) => setTab((next as "write" | "preview") ?? "write")}
    >
      <div className="flex items-center justify-between gap-2 border-b border-input px-1.5 pt-1.5">
        <TabsList className="bg-transparent p-0">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {full && (
          <span className="pr-2 text-[12px] text-slate-400">{words} words</span>
        )}
      </div>

      <TabsContent value="write" className="m-0">
        {editor && (
          <EditorToolbar
            editor={editor}
            full={full}
            fullscreen={fullscreen}
            onToggleFullscreen={full ? () => setFullscreen((on) => !on) : undefined}
            lastColor={lastColor}
            onColorUsed={setLastColor}
            linkRef={linkRef}
          />
        )}

        {full && editor && (
          <>
            <InsertToolbar editor={editor} onOpenModal={setModal} />
            <StyleToolbar editor={editor} lastColor={lastColor} />
            <TableToolbar editor={editor} />
          </>
        )}

        <div
          className={cn(
            "scrollbar-auto overflow-y-auto px-3 py-2.5",
            fullscreen && "flex-1"
          )}
          style={{
            ...editorHeight,
            ...(fullscreen
              ? { paddingLeft: "max(24px, calc(50% - 400px))", paddingRight: "max(24px, calc(50% - 400px))" }
              : null),
          }}
          onClick={() => editor?.chain().focus().run()}
        >
          <EditorContent editor={editor} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-input px-3 py-1.5 text-xs text-muted-foreground">
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-px text-[10px] font-semibold text-slate-400">
            {blockTag}
          </span>
          <span className="flex items-center gap-3">
            {(!full || prefs.showWordCount) && <span>{words} words</span>}
            {(!full || (prefs.showWordCount && prefs.showCharCount)) && (
              <span aria-hidden="true">·</span>
            )}
            {(!full || prefs.showCharCount) && <span>{characters} characters</span>}
          </span>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="m-0">
        <div className="overflow-y-auto px-4 py-3" style={editorHeight}>
          {full ? (
            <PostContentRenderer html={value} />
          ) : (
            <ProductDescriptionRenderer
              html={value}
              fallback="Nothing to preview yet — switch to Write to add a description."
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  )

  return (
    <TooltipProvider>
      <div
        className={cn(
          "w-full rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          fullscreen
            ? "fixed inset-0 z-[65] flex flex-col overflow-y-auto rounded-none border-0 bg-white ring-0 focus-within:ring-0"
            : "overflow-hidden",
          className
        )}
      >
        {surface}

        {full && editor && tab === "write" && (
          <Cheatsheet
            editor={editor}
            prefs={prefs}
            onPrefsChange={setPrefs}
            onOpenShortcuts={() => setShortcutsOpen(true)}
            onNotify={setNotice}
            onRequestLink={() => linkRef.current?.open()}
          />
        )}

        {full && footerActions && (
          <EditorFooter
            saveState={prefs.autoSave ? saveState : "off"}
            savedAt={savedAt}
            actions={footerActions}
            onRequestSchedule={() => setModal("schedule")}
          />
        )}
      </div>

      {full && editor && <SlashCommandMenu editor={editor} onOpenModal={setModal} />}

      {full && editor && modal && (
        <EditorModal
          spec={modalSpec(modal, !editor.state.selection.empty)}
          onClose={() => setModal(null)}
          onSubmit={(values) => {
            if (modal === "schedule") footerActions?.onSchedule(values.publishAt)
            else applyModal(editor, modal, values)
          }}
        />
      )}

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-[12px] text-white shadow-lg">
          {notice}
        </div>
      )}
    </TooltipProvider>
  )
}

/** The small "P" / "H2" pill in the editor's status bar. */
function currentBlockTag(editor: { isActive: (name: string, attrs?: object) => boolean } | null) {
  if (!editor) return "P"
  for (const level of [1, 2, 3, 4, 5, 6]) {
    if (editor.isActive("heading", { level })) return `H${level}`
  }
  if (editor.isActive("blockquote")) return "QUOTE"
  if (editor.isActive("codeBlock")) return "CODE"
  if (editor.isActive("bulletList")) return "UL"
  if (editor.isActive("orderedList")) return "OL"
  return "P"
}
