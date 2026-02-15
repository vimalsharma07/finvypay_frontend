'use client';

import * as React from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Strikethrough, Highlighter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';

const EMPTY_HTML = '<p></p>';

function getHtml(value: string | undefined): string {
  if (value == null || value.trim() === '') return EMPTY_HTML;
  return value;
}

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
}

function Toolbar({ editor, disabled }: { editor: Editor | null; disabled?: boolean }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1 rounded-t-md">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled}
        className="h-8 w-8 p-0 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled}
        className="h-8 w-8 p-0 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        disabled={disabled}
        className="h-8 w-8 p-0 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('highlight')}
        onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        disabled={disabled}
        className="h-8 w-8 p-0 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Highlight"
      >
        <Highlighter className="h-4 w-4" />
      </Toggle>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  disabled = false,
  className,
  minHeight = '120px',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: getHtml(value),
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[80px] px-3 py-2',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      if (onChange && html !== getHtml(value)) onChange(html);
    },
  });

  // Sync when value is set from outside (e.g. form.reset with loaded agreement)
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = getHtml(value);
    if (next !== current) editor.commands.setContent(next, false);
  }, [editor, value]);

  React.useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        'rounded-md border border-input bg-background text-foreground shadow-xs overflow-hidden',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      data-slot="rich-text-editor"
    >
      <Toolbar editor={editor} disabled={disabled} />
      <div style={{ minHeight }} className="[&_.ProseMirror]:min-h-[inherit] [&_.ProseMirror_mark]:bg-primary/20 [&_.ProseMirror_mark]:px-0.5 [&_.ProseMirror_mark]:rounded">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
