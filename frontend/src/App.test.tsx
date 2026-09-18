import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import App from "./App"

const contacts = [
  {
    id: 2,
    name: "Amanda Johnson",
    email: "amanda@workhub.demo",
    job_title: "HR Manager",
    avatar: "AJ",
    status: "online",
    last_message: "Could you share the latest version?",
    last_message_at: "2026-09-17T09:30:00",
    unread_count: 2,
  },
]

const emails = [
  {
    id: 1,
    sender: contacts[0],
    receiver: { id: 1, name: "Peng Ma", email: "peng@workhub.demo" },
    subject: "Project Meeting",
    body: "Can we review the WorkHub milestones on Monday afternoon?",
    preview: "Can we review the WorkHub milestones...",
    folder: "inbox",
    is_read: false,
    is_starred: false,
    created_at: "2026-09-17T08:00:00",
  },
]

describe("WorkHub", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.endsWith("/api/contacts")) return Response.json(contacts)
        if (url.includes("/api/conversations/2")) return Response.json([])
        if (url.includes("/api/emails?folder=inbox")) return Response.json(emails)
        if (url.endsWith("/api/emails/1")) return Response.json({ ...emails[0], is_read: true })
        if (url.endsWith("/api/messages") && init?.method === "POST") {
          return Response.json(
            {
              id: 99,
              sender_id: 1,
              receiver_id: 2,
              content: JSON.parse(String(init.body)).content,
              created_at: "2026-09-17T10:00:00",
              is_read: true,
              sender: { id: 1, name: "Peng Ma", avatar: "PM" },
            },
            { status: 201 },
          )
        }
        return Response.json([])
      }),
    )
  })

  it("loads contacts and sends a message into the active conversation", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByText("Amanda Johnson"))
    const composer = screen.getByPlaceholderText("Message Amanda Johnson")
    await user.type(composer, "Hi Amanda, I have finished the demo. Could you take a look?")
    await user.click(screen.getByRole("button", { name: "Send message" }))

    expect(
      (await screen.findAllByText("Hi Amanda, I have finished the demo. Could you take a look?")).length,
    ).toBeGreaterThan(0)
  })

  it("opens the email inbox and displays a selected message", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("button", { name: "Email" }))
    await user.click(await screen.findByText("Project Meeting"))

    await waitFor(() => {
      expect(screen.getByText("Can we review the WorkHub milestones on Monday afternoon?")).toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: "Reply" })).toBeInTheDocument()
  })
})
