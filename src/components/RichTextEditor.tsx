"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync value when it changes externally (e.g. on edit page load)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
          label="B"
          className="font-bold"
        />
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
          label="I"
          className="italic"
        />
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive("strike")}
          label="S"
          className="line-through"
        />
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive("heading", { level: 2 })}
          label="H2"
        />
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive("heading", { level: 3 })}
          label="H3"
        />
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList")}
          label="• List"
        />
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList")}
          label="1. List"
        />
        <ToolBtn
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote")}
          label="❝"
        />
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <ToolBtn
          onClick={() => editor?.chain().focus().undo().run()}
          label="↩"
        />
        <ToolBtn
          onClick={() => editor?.chain().focus().redo().run()}
          label="↪"
        />
      </div>
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}

function ToolBtn({
  onClick,
  active,
  label,
  className = "",
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded ${
        active
          ? "bg-indigo-100 text-indigo-700"
          : "text-gray-600 hover:bg-gray-100"
      } ${className}`}
    >
      {label}
    </button>
  );
}
