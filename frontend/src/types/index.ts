export interface User {
  id: number
  name: string
  email: string
  job_title?: string | null
  avatar?: string | null
  status?: "online" | "away" | "offline" | string | null
}

export interface Contact extends User {
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

export interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  created_at: string
  is_read: boolean
  sender: User
}

export type EmailFolder = "inbox" | "starred" | "sent" | "drafts" | "trash"

export interface Email {
  id: number
  sender: User
  receiver: User
  subject: string
  body: string
  preview: string
  folder: string
  is_read: boolean
  is_starred: boolean
  created_at: string
}

export interface ComposePayload {
  to: string
  subject: string
  body: string
  folder?: "sent" | "drafts"
}
