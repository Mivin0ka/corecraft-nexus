"use client"

import type { Task } from "@/app/page"
import { Archive as ArchiveIcon, Trash2, RotateCcw, Calendar, Sparkles } from "lucide-react"

interface ArchiveProps {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
}

export function Archive({ tasks, setTasks }: ArchiveProps) {
  const archivedTasks = tasks.filter((t) => t.status === "done")

  const handleRestore = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "planned" as const,
              history: [...t.history, { text: "Восстановлено из архива", ts: new Date().toISOString() }],
            }
          : t
      )
    )
  }

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const handleClearAll = () => {
    setTasks(tasks.filter((t) => t.status !== "done"))
  }

  const priorityColors = {
    high: "bg-destructive",
    medium: "bg-[oklch(0.8_0.18_80)]",
    low: "bg-muted-foreground/50",
  }

  const priorityLabels = {
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
  }

  return (
    <div className="animate-fade-in p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Архив</h1>
          </div>
          <p className="text-base text-muted-foreground">Выполненные задачи</p>
        </div>
        {archivedTasks.length > 0 && (
          <button
            onClick={handleClearAll}
            className="glass flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10 active-scale"
          >
            <Trash2 size={18} />
            Очистить архив
          </button>
        )}
      </div>

      {archivedTasks.length === 0 ? (
        <div className="glass-subtle flex flex-col items-center justify-center rounded-2xl py-16">
          <ArchiveIcon size={48} className="mb-4 text-muted-foreground/30" />
          <p className="text-base font-medium text-muted-foreground">Архив пуст</p>
          <p className="text-sm text-muted-foreground/60">Выполненные задачи появятся здесь</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {archivedTasks.map((task, index) => (
            <div
              key={task.id}
              className="glass group flex items-start gap-4 rounded-2xl p-5 opacity-80 transition-all hover:opacity-100"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ${priorityColors[task.priority]}`} />
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 font-semibold line-through text-foreground/80">{task.title}</h3>
                {task.desc && <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{task.desc}</p>}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className={`rounded-lg px-2 py-0.5 font-medium ${
                    task.priority === "high" ? "bg-destructive/10 text-destructive" :
                    task.priority === "medium" ? "bg-[oklch(0.8_0.18_80)]/10 text-[oklch(0.8_0.18_80)]" :
                    "bg-muted/50 text-muted-foreground"
                  }`}>
                    {priorityLabels[task.priority]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(task.created).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleRestore(task.id)}
                  className="rounded-lg p-2 text-primary hover:bg-primary/10 transition-colors"
                  title="Восстановить"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
                  title="Удалить навсегда"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
