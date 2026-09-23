import { Bot, Mail, MessageCircleMore, Settings } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type WorkHubModule = "messages" | "email" | "assistant"

export function PrimaryNav({
  activeModule,
  onChange,
}: {
  activeModule: WorkHubModule
  onChange: (module: WorkHubModule) => void
}) {
  const items = [
    { id: "messages" as const, label: "Messages", icon: MessageCircleMore },
    { id: "email" as const, label: "Email", icon: Mail },
    { id: "assistant" as const, label: "AI Assistant", icon: Bot },
  ]

  return (
    <aside className="flex h-screen w-[78px] shrink-0 flex-col items-center border-r border-blue-950/30 bg-[#132348] px-2 py-5 text-white shadow-2xl shadow-blue-950/20">
      <div className="mb-8 grid h-11 w-11 place-items-center rounded-2xl bg-brand-500 shadow-lg shadow-blue-950/30" aria-label="WorkHub home">
        <span className="text-lg font-black tracking-tight">W</span>
      </div>
      <nav className="flex w-full flex-1 flex-col gap-3" aria-label="WorkHub modules">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-current={activeModule === id ? "page" : undefined}
            onClick={() => onChange(id)}
            className={cn(
              "group flex min-h-[62px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl text-[11px] font-semibold text-blue-200 transition",
              activeModule === id
                ? "bg-white/12 text-white shadow-inner ring-1 ring-white/10"
                : "hover:bg-white/8 hover:text-white",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={activeModule === id ? 2.4 : 1.8} />
            {label}
          </button>
        ))}
      </nav>
      <div className="flex flex-col items-center gap-3">
        <button type="button" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-xl text-blue-200 transition hover:bg-white/10 hover:text-white">
          <Settings className="h-5 w-5" />
        </button>
        <div className="relative">
          <Avatar label="Peng Ma" id={1} size="md" className="ring-2 ring-white/25" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#132348] bg-emerald-400" />
        </div>
      </div>
    </aside>
  )
}
