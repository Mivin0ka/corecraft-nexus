"use client"

import { useState } from "react"
import type { Bug } from "@/app/page"
import { Plus, Trash2, Edit3, X, AlertCircle, AlertTriangle, Info, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface BugTrackerProps {
  bugs: Bug[]
  setBugs: (bugs: Bug[]) => void
  uid: () => string
}

type Filter = "all" | "open" | "progress" | "fixed"

const filters: { value: Filter; label: string }[] = [
  { value: "open", label: "Открытые" },
  { value: "progress", label: "В работе" },
  { value: "fixed", label: "Исправлены" },
  { value: "all", label: "Все" },
]

export function BugTracker({ bugs, setBugs, uid }: BugTrackerProps) {
  const [filter, setFilter] = useState<Filter>("open")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBug, setEditingBug] = useState<Bug | null>(null)

  const filteredBugs = bugs.filter((b) => {
    if (filter === "all") return true
    return b.status === filter
  })

  const handleSave = (bug: Partial<Bug>) => {
    if (editingBug) {
      setBugs(bugs.map((b) => (b.id === editingBug.id ? { ...b, ...bug } : b)))
    } else {
      const newBug: Bug = {
        id: uid(),
        title: bug.title || "",
        desc: bug.desc || "",
        severity: bug.severity || "medium",
        status: bug.status || "open",
        plugin: bug.plugin,
        repro: bug.repro || "always",
        created: new Date().toISOString(),
      }
      setBugs([...bugs, newBug])
    }
    setIsModalOpen(false)
    setEditingBug(null)
  }

  const handleDelete = (id: string) => {
    setBugs(bugs.filter((b) => b.id !== id))
  }

  const severityIcons = {
    critical: <AlertCircle className="text-destructive" size={18} />,
    medium: <AlertTriangle className="text-[oklch(0.8_0.18_80)]" size={18} />,
    minor: <Info className="text-muted-foreground" size={18} />,
  }

  const statusColors = {
    open: "bg-destructive/10 text-destructive",
    progress: "bg-primary/10 text-primary",
    fixed: "bg-[oklch(0.7_0.18_145)]/10 text-[oklch(0.7_0.18_145)]",
  }

  const statusLabels = {
    open: "Открыт",
    progress: "В работе",
    fixed: "Исправлен",
  }

  return (
    <div className="animate-fade-in p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Баг-трекер</h1>
          </div>
          <p className="text-base text-muted-foreground">Отслеживание проблем</p>
        </div>
        <button
          onClick={() => {
            setEditingBug(null)
            setIsModalOpen(true)
          }}
          className="glass flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10 active-scale"
        >
          <Plus size={18} />
          Новый баг
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition-all active-scale",
              filter === f.value ? "glass bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="ml-2 rounded-md bg-muted/50 px-1.5 py-0.5 text-xs tabular-nums">
                {bugs.filter((b) => b.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bug List */}
      <div className="space-y-3">
        {filteredBugs.length === 0 ? (
          <div className="glass-subtle flex flex-col items-center justify-center rounded-2xl py-16">
            <AlertCircle size={40} className="mb-4 text-muted-foreground/30" />
            <p className="text-base font-medium text-muted-foreground">Нет багов</p>
            <p className="text-sm text-muted-foreground/60">Отлично! Все работает как надо</p>
          </div>
        ) : (
          filteredBugs.map((bug, index) => (
            <div 
              key={bug.id} 
              className="glass group flex items-start gap-4 rounded-2xl p-5 transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                {severityIcons[bug.severity]}
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-base font-semibold text-foreground">{bug.title}</h3>
                  <span className={cn("rounded-lg px-2.5 py-1 text-xs font-medium", statusColors[bug.status])}>
                    {statusLabels[bug.status]}
                  </span>
                </div>
                {bug.desc && <p className="mb-3 text-sm text-muted-foreground">{bug.desc}</p>}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {bug.plugin && (
                    <span className="rounded-lg bg-muted/50 px-2 py-0.5">{bug.plugin}</span>
                  )}
                  <span>{new Date(bug.created).toLocaleDateString("ru-RU")}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditingBug(bug)
                    setIsModalOpen(true)
                  }}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(bug.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <BugModal
          bug={editingBug}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false)
            setEditingBug(null)
          }}
        />
      )}
    </div>
  )
}

function BugModal({
  bug,
  onSave,
  onClose,
}: {
  bug: Bug | null
  onSave: (bug: Partial<Bug>) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(bug?.title || "")
  const [desc, setDesc] = useState(bug?.desc || "")
  const [severity, setSeverity] = useState<Bug["severity"]>(bug?.severity || "medium")
  const [status, setStatus] = useState<Bug["status"]>(bug?.status || "open")
  const [plugin, setPlugin] = useState(bug?.plugin || "")
  const [repro, setRepro] = useState<Bug["repro"]>(bug?.repro || "always")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass animate-slide-up w-full max-w-md rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{bug ? "Редактировать баг" : "Новый баг"}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Краткое описание бага"
              autoFocus
              className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Описание</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Шаги воспроизведения..."
              rows={3}
              className="glass-subtle relative w-full resize-none rounded-xl px-4 py-3 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Серьёзность</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Bug["severity"])}
                className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none"
              >
                <option value="critical">Критический</option>
                <option value="medium">Средний</option>
                <option value="minor">Мелкий</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Bug["status"])}
                className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none"
              >
                <option value="open">Открыт</option>
                <option value="progress">В работе</option>
                <option value="fixed">Исправлен</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Плагин</label>
              <input
                type="text"
                value={plugin}
                onChange={(e) => setPlugin(e.target.value)}
                placeholder="Необязательно"
                className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Воспроизводимость</label>
              <select
                value={repro}
                onChange={(e) => setRepro(e.target.value as Bug["repro"])}
                className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none"
              >
                <option value="always">Всегда</option>
                <option value="sometimes">Иногда</option>
                <option value="rare">Редко</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            Отмена
          </button>
          <button
            onClick={() => onSave({ title, desc, severity, status, plugin, repro })}
            disabled={!title.trim()}
            className={cn(
              "rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all active-scale",
              !title.trim() ? "cursor-not-allowed opacity-50" : "hover:opacity-90"
            )}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
