import { useState } from "react"

import { PrimaryNav, type WorkHubModule } from "@/components/layout/PrimaryNav"
import { EmailPage } from "@/pages/EmailPage"
import { AssistantPage } from "@/pages/AssistantPage"
import { MessagesPage } from "@/pages/MessagesPage"

export default function App() {
  const [activeModule, setActiveModule] = useState<WorkHubModule>("messages")

  const pages = {
    messages: <MessagesPage />,
    email: <EmailPage />,
    assistant: <AssistantPage />,
  }

  return (
    <main className="flex h-screen min-h-[640px] w-full overflow-hidden bg-[#132348]">
      <PrimaryNav activeModule={activeModule} onChange={setActiveModule} />
      {pages[activeModule]}
    </main>
  )
}
