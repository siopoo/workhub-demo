import type { ComposePayload, Contact, Email, EmailFolder, Message } from "@/types"

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ""

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Something went wrong" }))
    throw new Error(error.detail ?? "Something went wrong")
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  getContacts: () => request<Contact[]>("/api/contacts"),
  getConversation: (contactId: number) =>
    request<Message[]>(`/api/conversations/${contactId}`),
  sendMessage: (receiverId: number, content: string) =>
    request<Message>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ receiver_id: receiverId, content }),
    }),
  getEmails: (folder: EmailFolder) => request<Email[]>(`/api/emails?folder=${folder}`),
  getEmail: (emailId: number) => request<Email>(`/api/emails/${emailId}`),
  sendEmail: (payload: ComposePayload) =>
    request<Email>("/api/emails", { method: "POST", body: JSON.stringify(payload) }),
  replyToEmail: (emailId: number, body: string) =>
    request<Email>(`/api/emails/${emailId}/reply`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),
  deleteEmail: (emailId: number) =>
    request<void>(`/api/emails/${emailId}`, { method: "DELETE" }),
}
