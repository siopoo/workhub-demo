import { Archive, FileText, Inbox, PenLine, Send, Star, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EmailFolder } from "@/types"

const folders = [
  { id: "inbox" as const, label: "Inbox", icon: Inbox },
  { id: "starred" as const, label: "Starred", icon: Star },
  { id: "sent" as const, label: "Sent", icon: Send },
  { id: "drafts" as const, label: "Drafts", icon: FileText },
  { id: "trash" as const, label: "Trash", icon: Trash2 },
]

export function MailSidebar({ folder, inboxCount, onFolderChange, onCompose }: { folder: EmailFolder; inboxCount: number; onFolderChange: (folder: EmailFolder) => void; onCompose: () => void }) {
  return (
    <aside className="flex w-[218px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 px-3 py-6 max-xl:w-[184px] max-md:w-[78px]">
      <div className="mb-5 px-2 max-md:hidden">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">WorkHub</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Email</h1>
      </div>
      <Button onClick={onCompose} className="mb-6 h-11 w-full justify-start px-4 max-md:justify-center max-md:px-0" aria-label="Compose email">
        <PenLine className="h-4 w-4" /> <span className="max-md:hidden">Compose</span>
      </Button>
      <nav className="space-y-1" aria-label="Email folders">
        {folders.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => onFolderChange(id)}
            aria-label={label}
            aria-current={folder === id ? "page" : undefined}
            className={cn(
              "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition max-md:justify-center max-md:px-0",
              folder === id ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white hover:text-slate-900",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="flex-1 text-left max-md:hidden">{label}</span>
            {id === "inbox" && inboxCount > 0 && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 max-md:hidden">{inboxCount}</span>}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 max-md:hidden">
        <Archive className="mb-2 h-4 w-4" />
        <p className="font-semibold">Local mailbox</p>
        <p className="mt-1 text-xs leading-5 text-blue-700/75">Demo messages are stored securely on this device.</p>
      </div>
    </aside>
  )
}
