import * as Dialog from "@radix-ui/react-dialog"
import { SendHorizontal, X } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import type { ComposePayload } from "@/types"

export function ComposeDialog({ open, initial, onOpenChange, onSend }: { open: boolean; initial?: Partial<ComposePayload>; onOpenChange: (open: boolean) => void; onSend: (payload: ComposePayload) => Promise<void> }) {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open) {
      setTo(initial?.to ?? "")
      setSubject(initial?.subject ?? "")
      setBody(initial?.body ?? "")
    }
  }, [open, initial])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!to.trim() || !subject.trim() || !body.trim()) return
    setSending(true)
    try {
      await onSend({ to: to.trim(), subject: subject.trim(), body: body.trim() })
      onOpenChange(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed bottom-5 right-5 z-50 flex h-[620px] max-h-[calc(100vh-40px)] w-[620px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
            <Dialog.Title className="text-base font-bold text-slate-900">New message</Dialog.Title>
            <Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Close compose"><X className="h-5 w-5" /></Button></Dialog.Close>
          </header>
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <label className="flex h-14 shrink-0 items-center border-b border-slate-100 px-5 text-sm text-slate-500">
              <span className="w-16">To</span>
              <input value={to} onChange={(event) => setTo(event.target.value)} type="email" required className="min-w-0 flex-1 bg-transparent text-slate-800 outline-none" placeholder="name@workhub.demo" />
            </label>
            <label className="flex h-14 shrink-0 items-center border-b border-slate-100 px-5 text-sm text-slate-500">
              <span className="w-16">Subject</span>
              <input value={subject} onChange={(event) => setSubject(event.target.value)} required className="min-w-0 flex-1 bg-transparent font-semibold text-slate-800 outline-none" placeholder="What is this about?" />
            </label>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} required className="min-h-0 flex-1 resize-none p-5 text-base leading-7 text-slate-800 outline-none" placeholder="Write your message…" />
            <footer className="flex shrink-0 items-center justify-between border-t border-slate-100 p-4">
              <p className="text-xs text-slate-400">Local demo mailbox</p>
              <Button type="submit" disabled={sending || !to.trim() || !subject.trim() || !body.trim()} aria-label="Send email">
                {sending ? "Sending…" : "Send"} <SendHorizontal className="h-4 w-4" />
              </Button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
