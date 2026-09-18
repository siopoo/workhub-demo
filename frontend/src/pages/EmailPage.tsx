import { useCallback, useEffect, useState } from "react"

import { ComposeDialog } from "@/components/email/ComposeDialog"
import { EmailDetail } from "@/components/email/EmailDetail"
import { EmailList } from "@/components/email/EmailList"
import { MailSidebar } from "@/components/email/MailSidebar"
import { api } from "@/services/api"
import type { ComposePayload, Email, EmailFolder } from "@/types"

export function EmailPage() {
  const [folder, setFolder] = useState<EmailFolder>("inbox")
  const [emails, setEmails] = useState<Email[]>([])
  const [selected, setSelected] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeInitial, setComposeInitial] = useState<Partial<ComposePayload> | undefined>()
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  const loadEmails = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setEmails(await api.getEmails(folder))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load email")
    } finally {
      setLoading(false)
    }
  }, [folder])

  useEffect(() => {
    setSelected(null)
    void loadEmails()
  }, [loadEmails])

  async function openEmail(summary: Email) {
    setOpening(true)
    try {
      const detail = await api.getEmail(summary.id)
      setSelected(detail)
      setEmails((current) => current.map((email) => email.id === detail.id ? { ...email, is_read: true } : email))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to open email")
    } finally {
      setOpening(false)
    }
  }

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 2600)
  }

  async function sendEmail(payload: ComposePayload) {
    await api.sendEmail(payload)
    showNotice("Email sent — you can find it in Sent.")
    if (folder === "sent") await loadEmails()
  }

  async function reply(body: string) {
    if (!selected) return
    await api.replyToEmail(selected.id, body)
    showNotice("Reply sent — it is now in Sent.")
  }

  async function removeEmail() {
    if (!selected) return
    await api.deleteEmail(selected.id)
    setSelected(null)
    await loadEmails()
    showNotice("Email moved to Trash.")
  }

  function forwardEmail() {
    if (!selected) return
    setComposeInitial({
      subject: selected.subject.startsWith("Fwd:") ? selected.subject : `Fwd: ${selected.subject}`,
      body: `\n\n---------- Forwarded message ----------\nFrom: ${selected.sender.name} <${selected.sender.email}>\nSubject: ${selected.subject}\n\n${selected.body}`,
    })
    setComposeOpen(true)
  }

  const unread = folder === "inbox" ? emails.filter((email) => !email.is_read).length : 0

  return (
    <div className="relative flex h-screen min-w-0 flex-1 overflow-hidden rounded-l-[26px] bg-white shadow-panel">
      <MailSidebar folder={folder} inboxCount={unread} onFolderChange={setFolder} onCompose={() => { setComposeInitial(undefined); setComposeOpen(true) }} />
      <EmailList emails={emails} folder={folder} selectedId={selected?.id ?? null} loading={loading} onSelect={openEmail} onRefresh={loadEmails} />
      <EmailDetail email={selected} loading={opening} onReply={reply} onForward={forwardEmail} onDelete={removeEmail} />
      <ComposeDialog open={composeOpen} initial={composeInitial} onOpenChange={setComposeOpen} onSend={sendEmail} />
      {(notice || error) && <div role="status" className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-xl bg-slate-950 px-4 py-3 text-sm text-white shadow-xl">{error || notice}</div>}
    </div>
  )
}
