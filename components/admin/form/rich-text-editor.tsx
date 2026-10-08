"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/** Tiptap editor producing HTML. The server sanitizes it again on save. */
export function RichTextEditor({
  id,
  value,
  onChange,
  onBlur,
}: {
  id: string;
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          protocols: ["mailto"],
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
    ],
    content: value,
    editorProps: { attributes: { id, class: "prose-rich px-3 py-2 text-sm", "aria-multiline": "true", role: "textbox" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  // Reset content when the form is reset (e.g. opening another item).
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(value === "" && editor.isEmpty)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
          }
        : null,
  });

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https:// or mailto:)", previous ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else if (/^(https?:\/\/|mailto:)/i.test(url)) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const tools = [
    { icon: Bold, label: "Bold", active: state?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { icon: Italic, label: "Italic", active: state?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { icon: Heading2, label: "Heading", active: state?.h2, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    {
      icon: Heading3,
      label: "Subheading",
      active: state?.h3,
      run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    { icon: List, label: "Bullet list", active: state?.bullet, run: () => editor?.chain().focus().toggleBulletList().run() },
    {
      icon: ListOrdered,
      label: "Numbered list",
      active: state?.ordered,
      run: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    { icon: Quote, label: "Quote", active: state?.quote, run: () => editor?.chain().focus().toggleBlockquote().run() },
    { icon: Link2, label: "Link", active: state?.link, run: setLink },
    { icon: Undo2, label: "Undo", active: false, run: () => editor?.chain().focus().undo().run() },
    { icon: Redo2, label: "Redo", active: false, run: () => editor?.chain().focus().redo().run() },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border-strong bg-surface focus-within:border-ring">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-0.5 border-b border-border p-1">
        {tools.map(({ icon: Icon, label, active, run }) => (
          <button
            key={label}
            type="button"
            onClick={run}
            aria-label={label}
            aria-pressed={active ?? false}
            title={label}
            className={cn(
              "grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              active && "bg-surface-2 text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
