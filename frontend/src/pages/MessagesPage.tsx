import { useEffect, useState } from "react"

import { ChatPanel } from "@/components/messages/ChatPanel"
import { ContactList } from "@/components/messages/ContactList"
import { api } from "@/services/api"
import type { Contact, Message } from "@/types"

export function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selected, setSelected] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    api.getContacts()
      .then(setContacts)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoadingContacts(false))
  }, [])

  async function selectContact(contact: Contact) {
    setSelected(contact)
    setLoadingMessages(true)
    setError("")
    try {
      const history = await api.getConversation(contact.id)
      setMessages(history)
      setContacts((current) => current.map((item) => item.id === contact.id ? { ...item, unread_count: 0 } : item))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load conversation")
    } finally {
      setLoadingMessages(false)
    }
  }

  async function sendMessage(content: string) {
    if (!selected) return
    const temporaryId = -Date.now()
    const optimistic: Message = {
      id: temporaryId,
      sender_id: 1,
      receiver_id: selected.id,
      content,
      created_at: new Date().toISOString(),
      is_read: true,
      sender: { id: 1, name: "Peng Ma", email: "peng@workhub.demo", avatar: "PM", status: "online" },
    }
    setMessages((current) => [...current, optimistic])
    try {
      const saved = await api.sendMessage(selected.id, content)
      setMessages((current) => current.map((item) => item.id === temporaryId ? saved : item))
      setContacts((current) => current.map((item) => item.id === selected.id ? { ...item, last_message: content, last_message_at: saved.created_at } : item))
    } catch (reason) {
      setMessages((current) => current.filter((item) => item.id !== temporaryId))
      setError(reason instanceof Error ? reason.message : "Message could not be sent")
    }
  }

  return (
    <div className="relative flex h-screen min-w-0 flex-1 overflow-hidden rounded-l-[26px] bg-white shadow-panel">
      <ContactList contacts={contacts} selectedId={selected?.id ?? null} loading={loadingContacts} onSelect={selectContact} />
      <ChatPanel contact={selected} messages={messages} loading={loadingMessages} onSend={sendMessage} />
      {error && <div role="alert" className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-xl bg-slate-950 px-4 py-3 text-sm text-white shadow-xl">{error}</div>}
    </div>
  )
}
