import { Bot, SendHorizontal, Wrench } from "lucide-react"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { api } from "@/services/api"
import type { AgentResponse } from "@/types"

export function AssistantPage() {
  const [prompt, setPrompt] = useState("")
  const [lastPrompt, setLastPrompt] = useState("")
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    const message = prompt.trim()
    if (!message || busy) return

    setBusy(true)
    setError("")
    setLastPrompt(message)
    try {
      setResponse(await api.askAgent(message))
    } catch (reason) {
      setResponse(null)
      setError(reason instanceof Error ? reason.message : "Agent request failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="h-screen min-w-0 flex-1 overflow-y-auto rounded-l-[26px] bg-[radial-gradient(circle_at_50%_0%,#eff6ff_0%,#f8fafc_50%)] p-7 shadow-panel">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-blue-200">
            <Bot className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">AI Skills Demo</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">WorkHub Assistant</h1>
          <p className="mt-2 text-sm text-slate-500">Ask the Agent to search existing WorkHub messages or emails. Every Skill call remains visible.</p>
        </header>

        <form onSubmit={submit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            className="w-full resize-none p-2 text-base leading-7 outline-none"
            placeholder="Ask WorkHub to search messages or emails…"
          />
          <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
            <Button type="submit" aria-label="Ask assistant" disabled={!prompt.trim() || busy}>
              {busy ? "Running…" : "Ask assistant"} <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {error && <div role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        {response && (
          <div className="mt-6 space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">User Request</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{lastPrompt}</p>
              <div className="mt-5 border-t border-slate-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">AI Assistant</p>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{response.answer}</div>
              </div>
            </article>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm" aria-label="Skill trace">
              <div className="flex items-center gap-2 text-sm font-bold"><Wrench className="h-4 w-4" /> Skill trace</div>
              <div className="mt-4 grid gap-4">
                {response.tool_calls.map((call, index) => (
                  <article key={`${call.name}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Called Skill</p>
                    <p className="mt-1 font-mono text-sm font-bold text-brand-700">{call.name}</p>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Arguments</p>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700">{JSON.stringify(call.arguments, null, 2)}</pre>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Result / Summary</p>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700">{JSON.stringify(call.result, null, 2)}</pre>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  )
}
