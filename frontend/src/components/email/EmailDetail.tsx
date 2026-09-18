import { ArrowLeft, Forward, MoreHorizontal, Reply, Trash2 } from "lucide-react"
import { FormEvent, useState } from "react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatEmailDate } from "@/lib/utils"
import type { Email } from "@/types"

export function EmailDetail({ email, loading, onReply, onForward, onDelete }: { email: Email | null; loading: boolean; onReply: (body: string) => Promise<void>; onForward: () => void; onDelete: () => Promise<void> }) {
  const [replying, setReplying] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const [sending, setSending] = useState(false)

  if (loading) return <section className="grid flex-1 place-items-center bg-white text-sm text-slate-500">Opening email…</section>
  if (!email) {
    return (
      <section className="grid min-w-0 flex-1 place-items-center bg-[radial-gradient(circle_at_50%_20%,#f8fbff_0%,#f2f6fc_74%)] p-8 max-sm:hidden">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-blue-100 bg-white text-brand-600 shadow-panel"><ArrowLeft className="h-6 w-6" /></div>
          <h2 className="mt-5 text-lg font-bold text-slate-900">Choose an email to read</h2>
          <p className="mt-2 text-sm text-slate-500">Select a message from the list to open it here.</p>
        </div>
      </section>
    )
  }

  async function submitReply(event: FormEvent) {
    event.preventDefault()
    if (!replyBody.trim()) return
    setSending(true)
    try {
      await onReply(replyBody.trim())
      setReplyBody("")
      setReplying(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white max-sm:hidden">
      <header className="flex h-[72px] items-center justify-between border-b border-slate-200 px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setReplying(true)} aria-label="Reply from toolbar"><Reply className="h-4 w-4" /> Reply</Button>
          <Button variant="ghost" size="sm" onClick={onForward} aria-label="Forward from toolbar"><Forward className="h-4 w-4" /> Forward</Button>
          <Button variant="danger" size="sm" onClick={onDelete} aria-label="Delete email"><Trash2 className="h-4 w-4" /> Delete</Button>
        </div>
        <Button variant="ghost" size="icon" aria-label="More email actions"><MoreHorizontal className="h-5 w-5" /></Button>
      </header>
      <article className="flex-1 overflow-y-auto px-8 py-8 max-xl:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-950">{email.subject}</h1>
          <div className="mt-7 flex items-start gap-3 border-b border-slate-100 pb-6">
            <Avatar label={email.sender.name} id={email.sender.id} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-bold text-slate-900">{email.sender.name} <span className="ml-1 text-sm font-normal text-slate-400">&lt;{email.sender.email}&gt;</span></p>
                <time className="text-xs text-slate-400">{formatEmailDate(email.created_at)}</time>
              </div>
              <p className="mt-1 text-sm text-slate-500">To: {email.receiver.name} &lt;{email.receiver.email}&gt;</p>
            </div>
          </div>
          <div className="whitespace-pre-wrap py-8 text-base leading-8 text-slate-700">{email.body}</div>
          {!replying && (
            <div className="flex gap-3 border-t border-slate-100 pt-6">
              <Button variant="secondary" onClick={() => setReplying(true)} aria-label="Reply"><Reply className="h-4 w-4" /> Reply</Button>
              <Button variant="secondary" onClick={onForward} aria-label="Forward"><Forward className="h-4 w-4" /> Forward</Button>
            </div>
          )}
          {replying && (
            <form onSubmit={submitReply} className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-slate-700">Reply to {email.sender.name}</p>
              <textarea autoFocus rows={5} value={replyBody} onChange={(event) => setReplyBody(event.target.value)} placeholder="Write your reply…" className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-800 outline-none focus:border-brand-500" />
              <div className="mt-3 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setReplying(false)}>Cancel</Button>
                <Button type="submit" disabled={!replyBody.trim() || sending}>{sending ? "Sending…" : "Send reply"}</Button>
              </div>
            </form>
          )}
        </div>
      </article>
    </section>
  )
}
