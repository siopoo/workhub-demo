import { AtSign, MoreHorizontal, Paperclip, SendHorizontal, Smile, Users } from "lucide-react"
import { FormEvent, useEffect, useRef, useState } from "react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn, formatMessageTime } from "@/lib/utils"
import type { Contact, Message } from "@/types"

export function ChatPanel({
  contact,
  messages,
  loading,
  onSend,
}: {
  contact: Contact | null
  messages: Message[]
  loading: boolean
  onSend: (content: string) => Promise<void>
}) {
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" })
  }, [messages])

  if (!contact) {
    return (
      <section className="grid min-w-0 flex-1 place-items-center bg-[radial-gradient(circle_at_50%_20%,#f8fbff_0%,#edf3fb_72%)] p-8">
        <div className="max-w-sm text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] border border-blue-100 bg-white text-brand-600 shadow-panel">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900">Select a conversation</h2>
          <p className="mt-2 text-base leading-7 text-slate-500">Choose a teammate to view your shared history and continue the conversation.</p>
        </div>
      </section>
    )
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || sending) return
    const content = draft.trim()
    setDraft("")
    setSending(true)
    try {
      await onSend(content)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[#f7f9fd]">
      <header className="flex h-[84px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <Avatar label={contact.name} id={contact.id} size="lg" />
            <span className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white", contact.status === "online" ? "bg-emerald-500" : contact.status === "away" ? "bg-amber-400" : "bg-slate-300")} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-950">{contact.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{contact.job_title} · <span className="capitalize">{contact.status}</span></p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Conversation options"><MoreHorizontal className="h-5 w-5" /></Button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          <div className="mx-auto rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">Today</div>
          {loading && <div className="text-center text-sm text-slate-500">Loading messages…</div>}
          {!loading && messages.map((message) => {
            const mine = message.sender_id === 1
            return (
              <article key={message.id} className={cn("flex items-end gap-2.5 animate-rise", mine && "flex-row-reverse")}>
                {!mine && <Avatar label={message.sender.name} id={message.sender.id} size="sm" />}
                <div className={cn("max-w-[72%]", mine && "text-right")}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-left text-[15px] leading-6 shadow-sm",
                    mine ? "rounded-br-md bg-brand-600 text-white shadow-blue-200/60" : "rounded-bl-md border border-slate-200/70 bg-white text-slate-700",
                  )}>
                    {message.content}
                  </div>
                  <p className="mt-1.5 px-1 text-xs text-slate-400">{formatMessageTime(message.created_at)}</p>
                </div>
              </article>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="shrink-0 px-5 pb-5 md:px-8">
        <form onSubmit={submit} className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            rows={2}
            placeholder={`Message ${contact.name}`}
            className="w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-6 text-slate-800 outline-none placeholder:text-slate-400"
          />
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <div className="flex text-slate-400">
              <Button type="button" variant="ghost" size="icon" aria-label="Attach file"><Paperclip className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Add emoji"><Smile className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Mention teammate"><AtSign className="h-4 w-4" /></Button>
            </div>
            <Button type="submit" disabled={!draft.trim() || sending} aria-label="Send message" className="min-w-24">
              Send <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
