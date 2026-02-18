"use client"

import { FloatingToolbar } from "@/components/floating-toolbar"

interface RichTextEditorProps {
  label?: string
  placeholder?: string
}

export function RichTextEditor({
  label = "Rich Text Editor",
  placeholder,
}: RichTextEditorProps) {
  return (
    <div className="w-full max-w-2xl">
      <h2 className="mb-3 text-lg font-bold tracking-tight text-foreground">
        {label}
      </h2>
      <FloatingToolbar placeholder={placeholder} />
    </div>
  )
}
