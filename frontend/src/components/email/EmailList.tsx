import { RefreshCw, Search, Star } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn, formatListTime } from "@/lib/utils"
import type { Email, EmailFolder } from "@/types"

export function EmailList({ emails, folder, selectedId, loading, onSelect, onRefresh }: { emails: Email[]; folder: EmailFolder; selectedId: number | null; loading: boolean; onSelect: (email: Email) => void; onRefresh: () => void }) {
  return (
    <section className="flex w-[368px] shrink-0 flex-col border-r border-slate-200 bg-white max-xl:w-[318px] max-lg:w-[300px] max-sm:flex-1">
      <header className="border-b border-slate-100 px-4 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold capitalize text-slate-900">{folder}</h2>
          <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh mailbox"><RefreshCw className="h-4 w-4" /></Button>
        </div>
        <label className="mt-3 flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 focus-within:border-brand-500 focus-within:bg-white">
          <Search className="h-4 w-4" />
          <input className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none" placeholder="Search mail" aria-label="Search mail" />
        </label>
      </header>
      <div className="flex-1 overflow-y-auto p-2.5">
        {loading && <div className="p-5 text-sm text-slate-500">Loading email…</div>}
        {!loading && emails.length === 0 && <div className="p-8 text-center text-sm leading-6 text-slate-500">This folder is empty.</div>}
        {!loading && emails.map((email) => {
          const person = folder === "sent" || folder === "drafts" ? email.receiver : email.sender
          return (
            <button
              type="button"
              key={email.id}
              onClick={() => onSelect(email)}
              className={cn(
                "mb-1 w-full rounded-2xl p-3 text-left transition",
                selectedId === email.id ? "bg-blue-50 ring-1 ring-blue-100" : "hover:bg-slate-50",
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar label={person.name} id={person.id} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!email.is_read && folder === "inbox" && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                    <span className={cn("min-w-0 flex-1 truncate text-sm", !email.is_read && folder === "inbox" ? "font-bold text-slate-950" : "font-semibold text-slate-700")}>{person.name}</span>
                    <span className="shrink-0 text-xs text-slate-400">{formatListTime(email.created_at)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className={cn("line-clamp-1 flex-1 text-sm", !email.is_read && folder === "inbox" ? "font-bold text-slate-900" : "font-semibold text-slate-700")}>{email.subject}</p>
                    {email.is_starred && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{email.preview}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
