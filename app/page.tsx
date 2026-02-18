import { RichTextEditor } from "@/components/rich-text-editor"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 bg-background px-4 py-12">
      <RichTextEditor label="コメント" placeholder="コメントを入力..." />
      <RichTextEditor label="推奨工事" placeholder="推奨工事を入力..." />
    </main>
  )
}
