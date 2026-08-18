"use client"

import * as React from "react"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
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

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your product description...",
  minHeight = 300,
  className,
}: RichTextEditorProps) {
  const [tab, setTab] = React.useState<"write" | "preview">("write")

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
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "rte-content",
      },
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

  const { words, characters } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      words: editor?.storage.characterCount?.words() ?? 0,
      characters: editor?.storage.characterCount?.characters() ?? 0,
    }),
  }) ?? { words: 0, characters: 0 }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "w-full overflow-hidden rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          className
        )}
      >
        <Tabs
          value={tab}
          onValueChange={(next) => setTab((next as "write" | "preview") ?? "write")}
        >
          <div className="flex items-center justify-between gap-2 border-b border-input  px-1.5 pt-1.5">
            <TabsList className="bg-transparent p-0">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="write" className="m-0">
            {editor && <EditorToolbar editor={editor} />}
            <div
              className="scrollbar-auto overflow-y-auto px-3 py-2.5"
              style={{ minHeight, maxHeight: minHeight * 2 }}
              onClick={() => editor?.chain().focus().run()}
            >
              <EditorContent editor={editor} />
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-input  px-3 py-1.5 text-xs text-muted-foreground">
              <span>{words} words</span>
              <span aria-hidden="true">·</span>
              <span>{characters} characters</span>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="m-0">
            <div
              className="overflow-y-auto px-4 py-3"
              style={{ minHeight, maxHeight: minHeight * 2 }}
            >
              <ProductDescriptionRenderer
                html={value}
                fallback="Nothing to preview yet — switch to Write to add a description."
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
