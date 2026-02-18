"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bold, Check, Underline } from "lucide-react"
import { cn } from "@/lib/utils"

const TEXT_COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Red", value: "#EF4444" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Green", value: "#22C55E" },
] as const

function normalizeColor(color: string): string {
  if (color.startsWith("#")) return color.toUpperCase()
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) {
    const hex = `#${[match[1], match[2], match[3]]
      .map((n) => parseInt(n).toString(16).padStart(2, "0"))
      .join("")}`
    return hex.toUpperCase()
  }
  return "#000000"
}

interface FloatingToolbarProps {
  placeholder?: string
}

export function FloatingToolbar({ placeholder }: FloatingToolbarProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [toolbarX, setToolbarX] = useState(0)
  const [toolbarY, setToolbarY] = useState(0)
  const [isBold, setIsBold] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [showColors, setShowColors] = useState(false)

  const refreshFormats = useCallback(() => {
    setIsBold(document.queryCommandState("bold"))
    setIsUnderline(document.queryCommandState("underline"))
    const c = document.queryCommandValue("foreColor")
    if (c) setCurrentColor(normalizeColor(c))
  }, [])

  const onSelectionChange = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount || !editorRef.current) {
      setToolbarVisible(false)
      return
    }
    const range = sel.getRangeAt(0)
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      setToolbarVisible(false)
      return
    }
    const rect = range.getBoundingClientRect()
    const editorRect = editorRef.current.getBoundingClientRect()
    setToolbarX(rect.left + rect.width / 2 - editorRect.left)
    setToolbarY(rect.top - editorRect.top - 12)
    setToolbarVisible(true)
    refreshFormats()
  }, [refreshFormats])

  useEffect(() => {
    document.addEventListener("selectionchange", onSelectionChange)
    return () => document.removeEventListener("selectionchange", onSelectionChange)
  }, [onSelectionChange])

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    refreshFormats()
    setTimeout(onSelectionChange, 0)
  }

  const pickColor = (c: string) => {
    exec("foreColor", c)
    setCurrentColor(c)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); exec("bold") }
      if (e.key === "u") { e.preventDefault(); exec("underline") }
    }
  }

  return (
    <div className="relative">
      {toolbarVisible && (
        <div
          ref={toolbarRef}
          className="absolute z-50 -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-150"
          style={{ left: toolbarX, top: toolbarY }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg">
            <button
              type="button"
              onClick={() => exec("underline")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isUnderline && "bg-accent text-accent-foreground"
              )}
              aria-label="Underline"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("bold")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold transition-colors hover:bg-accent hover:text-accent-foreground",
                isBold && "bg-accent text-accent-foreground"
              )}
              aria-label="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <div className="mx-0.5 h-5 w-px bg-border" />
            <button
              type="button"
              onClick={() => setShowColors((p) => !p)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                showColors && "bg-accent text-accent-foreground"
              )}
              aria-label="Text color"
            >
              <span className="flex flex-col items-center leading-none">
                <span className="text-xs font-bold" style={{ color: currentColor }}>A</span>
                <span className="mt-0.5 h-0.5 w-3 rounded-full" style={{ backgroundColor: currentColor }} />
              </span>
            </button>
            {showColors && (
              <>
                <div className="mx-0.5 h-5 w-px bg-border" />
                {TEXT_COLORS.map((color) => {
                  const active = currentColor.toUpperCase() === color.value.toUpperCase()
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => pickColor(color.value)}
                      className="flex h-8 w-8 items-center justify-center"
                      aria-label={color.label}
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ backgroundColor: color.value }}
                      >
                        {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </span>
                    </button>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={onKeyDown}
        className="min-h-[100px] w-full rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-card-foreground outline-none focus:ring-2 focus:ring-ring/20"
        data-placeholder={placeholder ?? "テキストを入力..."}
      />
    </div>
  )
}
