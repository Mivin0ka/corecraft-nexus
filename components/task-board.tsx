"use client"

import { useState } from "react"
import type { Task } from "@/app/page"
import { Plus, GripVertical, Trash2, Edit3, Clock, Calendar, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskBoardProps {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  uid: () => string
}

type Status = "planned" | "progress" | "done"

const columns: { status: Status; label: string; color: string; bgColor: string }[] = [
  { status: "planned", label: "В планах", color: "bg-muted-foreground", bgColor: "bg-muted/30" },
  { status: "progress", label: "В процессе", color: "bg-primary", bgColor: "bg-primary/10" },
  { status: "done", label: "Готово", color: "bg-[oklch(0.7_0.18_145)]", bgColor: "bg-[oklch(0.7_0.18_145)]/10" },
]

export function TaskBoard({ tasks, setTasks, uid }: TaskBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: Status) => {
    if (!draggedTask) return
    const updated = tasks.map((t) => (t.id === draggedTask.id ? { ...t, status } : t))
    setTasks(updated)
    setDraggedTask(null)
  }

  const handleSave = (task: Partial<Task>) => {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...task } : t)))
    } else {
      const newTask: Task = {
        id: uid(),
        title: task.title || "",
        desc: task.desc || "",
        priority: task.priority || "medium",
        status: task.status || "planned",
        deadline: task.deadline,
        created: new Date().toISOString(),
        history: [{ text: "Создана задача", ts: new Date().toISOString() }],
        pomodoro: 0,
      }
      setTasks([...tasks, newTask])
    }
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const activeTasks = tasks.filter((t) => t.status !== "done")
  const archivedTasks = tasks.filter((t) => t.status === "done")

  return (
    <div className="animate-fade-in p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Таск-борд</h1>
          </div>
          <p className="text-base text-muted-foreground">Канбан-доска задач</p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null)
            setIsModalOpen(true)
          }}
          className="glass flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10 active-scale"
        >
          <Plus size={18} />
          Новая задача
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-5">
        {columns.map((col) => (
          <div
            key={col.status}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.status)}
            className={cn("glass-subtle min-h-[450px] rounded-2xl p-4", col.bgColor)}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${col.color}`} />
              <span className="text-sm font-semibold text-foreground">{col.label}</span>
              <span className="ml-auto rounded-lg bg-muted/50 px-2.5 py-1 text-sm font-medium tabular-nums text-muted-foreground">
                {activeTasks.filter((t) => t.status === col.status).length}
              </span>
            </div>

            <div className="space-y-3">
              {activeTasks
                .filter((t) => t.status === col.status)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={() => handleDragStart(task)}
                    onEdit={() => {
                      setEditingTask(task)
                      setIsModalOpen(true)
                    }}
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Archive Section */}
      {archivedTasks.length > 0 && (
        <div className="mt-8">
          <div className="glass-subtle rounded-2xl p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <span>Архив выполненных</span>
              <span className="rounded-lg bg-muted/50 px-2.5 py-1 text-sm font-medium tabular-nums">{archivedTasks.length}</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {archivedTasks.slice(0, 6).map((task) => (
                <div key={task.id} className="glass rounded-xl p-3 opacity-60 hover:opacity-80 transition-opacity">
                  <p className="truncate text-sm">{task.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}

function TaskCard({
  task,
  onDragStart,
  onEdit,
  onDelete,
}: {
  task: Task
  onDragStart: () => void
  onEdit: () => void
  onDelete: () => void
}) {
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
    <div
      draggable
      onDragStart={onDragStart}
      className="glass group cursor-grab rounded-xl p-4 transition-all hover:scale-[1.02] active:cursor-grabbing active:scale-[0.98]"
    >
      <div className="mb-3 flex items-start gap-2">
        <GripVertical size={14} className="mt-0.5 text-muted-foreground/50" />
        <div className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${priorityColors[task.priority]}`} />
        <p className="flex-1 text-base font-medium leading-snug text-foreground">{task.title}</p>
      </div>

      {task.desc && <p className="mb-3 line-clamp-2 pl-6 text-sm text-muted-foreground">{task.desc}</p>}

      <div className="flex flex-wrap items-center gap-2 pl-6">
        <span className={cn(
          "rounded-lg px-2 py-0.5 text-[10px] font-medium",
          task.priority === "high" ? "bg-destructive/10 text-destructive" :
          task.priority === "medium" ? "bg-[oklch(0.8_0.18_80)]/10 text-[oklch(0.8_0.18_80)]" :
          "bg-muted/50 text-muted-foreground"
        )}>
          {priorityLabels[task.priority]}
        </span>
        {task.deadline && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={12} />
            {new Date(task.deadline).toLocaleDateString("ru-RU")}
          </span>
        )}
        {task.pomodoro > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            {Math.floor(task.pomodoro / 60)}m
          </span>
        )}
        <div className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
            <Edit3 size={12} />
          </button>
          <button onClick={onDelete} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

function TaskModal({
  task,
  onSave,
  onClose,
}: {
  task: Task | null
  onSave: (task: Partial<Task>) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(task?.title || "")
  const [desc, setDesc] = useState(task?.desc || "")
  const [priority, setPriority] = useState<Task["priority"]>(task?.priority || "medium")
  const [status, setStatus] = useState<Task["status"]>(task?.status || "planned")
  const [deadline, setDeadline] = useState(task?.deadline || "")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass animate-slide-up w-full max-w-md rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{task ? "Редактировать" : "Новая задача"}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название задачи"
              autoFocus
              className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Описание</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Описание..."
              rows={3}
              className="glass-subtle relative w-full resize-none rounded-xl px-4 py-3 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Приоритет</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none"
              >
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task["status"])}
                className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none"
              >
                <option value="planned">В планах</option>
                <option value="progress">В процессе</option>
                <option value="done">Готово</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Дедлайн</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            Отмена
          </button>
          <button
            onClick={() => onSave({ title, desc, priority, status, deadline })}
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
