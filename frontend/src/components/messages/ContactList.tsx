import { Search } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { cn, formatListTime } from "@/lib/utils"
import type { Contact } from "@/types"

export function ContactList({
  contacts,
  selectedId,
  loading,
  onSelect,
}: {
  contacts: Contact[]
  selectedId: number | null
  loading: boolean
  onSelect: (contact: Contact) => void
}) {
  return (
    <section className="flex w-[326px] shrink-0 flex-col border-r border-slate-200/80 bg-white/95 max-lg:w-[286px] max-md:hidden">
      <div className="border-b border-slate-100 px-5 pb-4 pt-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Workspace</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Messages</h1>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-700">{contacts.length}</span>
        </div>
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 focus-within:border-brand-500 focus-within:bg-white">
          <Search className="h-4 w-4" />
          <input className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none" placeholder="Search conversations" aria-label="Search conversations" />
        </label>
      </div>
      <div className="flex-1 overflow-y-auto p-2.5">
        {loading && <div className="p-5 text-sm text-slate-500">Loading conversations…</div>}
        {!loading && contacts.map((contact) => (
          <button
            type="button"
            key={contact.id}
            onClick={() => onSelect(contact)}
            className={cn(
              "mb-1 flex w-full items-start gap-3 rounded-2xl p-3 text-left transition",
              selectedId === contact.id ? "bg-blue-50 shadow-sm ring-1 ring-blue-100" : "hover:bg-slate-50",
            )}
          >
            <div className="relative">
              <Avatar label={contact.name} id={contact.id} size="lg" />
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white",
                contact.status === "online" && "bg-emerald-500",
                contact.status === "away" && "bg-amber-400",
                contact.status === "offline" && "bg-slate-300",
              )} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-slate-900">{contact.name}</span>
                <span className="shrink-0 text-xs text-slate-400">{formatListTime(contact.last_message_at)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <p className={cn("line-clamp-1 flex-1 text-sm", contact.unread_count ? "font-semibold text-slate-700" : "text-slate-500")}>{contact.last_message}</p>
                {contact.unread_count > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">{contact.unread_count}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
