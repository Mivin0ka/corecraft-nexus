"use client"

import { useState } from "react"
import type { TestingItem } from "@/app/page"
import { Plus, Trash2, Edit3, TestTube, X, CheckCircle, Circle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface TestingProps {
  testingItems: TestingItem[]
  setTestingItems: (items: TestingItem[]) => void
  uid: () => string
}

export function Testing({ testingItems, setTestingItems, uid }: TestingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TestingItem | null>(null)

  const handleSave = (item: Partial<TestingItem>) => {
    if (editingItem) {
      setTestingItems(testingItems.map((t) => (t.id === editingItem.id ? { ...t, ...item } : t)))
    } else {
      const newItem: TestingItem = {
        id: uid(),
        title: item.title || "",
        done: item.done || "",
        todo: item.todo || "",
        notes: item.notes || "",
        created: new Date().toISOString(),
      }
      setTestingItems([...testingItems, newItem])
    }
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleDelete = (id: string) => {
    setTestingItems(testingItems.filter((t) => t.id !== id))
  }

  return (
    <div className="animate-fade-in p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Тестируется</h1>
          </div>
          <p className="text-base text-muted-foreground">Что не успел - что доделать</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setIsModalOpen(true)
          }}
          className="glass flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10 active-scale"
        >
          <Plus size={18} />
          Добавить
        </button>
      </div>

      <div className="space-y-4">
        {testingItems.length === 0 ? (
          <div className="glass-subtle flex flex-col items-center justify-center rounded-2xl py-16">
            <TestTube size={48} className="mb-4 text-muted-foreground/30" />
            <p className="text-base font-medium text-muted-foreground">Нет элементов</p>
            <p className="text-sm text-muted-foreground/60">Добавьте первый элемент</p>
          </div>
        ) : (
          testingItems.map((item, index) => (
            <div 
              key={item.id} 
              className="glass group rounded-2xl p-6 transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <TestTube size={22} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setEditingItem(item)
                      setIsModalOpen(true)
                    }}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {item.done && (
                  <div className="glass-subtle rounded-xl p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[oklch(0.7_0.18_145)]">
                      <CheckCircle size={16} />
                      Что сделано
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">{item.done}</p>
                  </div>
                )}
                {item.todo && (
                  <div className="glass-subtle rounded-xl p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                      <Circle size={16} />
                      Что НЕ успел
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">{item.todo}</p>
                  </div>
                )}
              </div>

              {item.notes && (
                <div className="mt-4 rounded-xl bg-muted/30 p-4">
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">Заметки</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <TestingModal
          item={editingItem}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

function TestingModal({
  item,
  onSave,
  onClose,
}: {
  item: TestingItem | null
  onSave: (item: Partial<TestingItem>) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(item?.title || "")
  const [done, setDone] = useState(item?.done || "")
  const [todo, setTodo] = useState(item?.todo || "")
  const [notes, setNotes] = useState(item?.notes || "")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass animate-slide-up w-full max-w-lg rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{item ? "Редактировать" : "Добавить"}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Плагин / фича</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что тестируется"
              autoFocus
              className="glass-subtle h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Что сделано</label>
            <textarea
              value={done}
              onChange={(e) => setDone(e.target.value)}
              placeholder="Что уже реализовано..."
              rows={3}
              className="glass-subtle w-full resize-none rounded-xl px-4 py-3 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Что НЕ успел</label>
            <textarea
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              placeholder="Что осталось доделать..."
              rows={3}
              className="glass-subtle w-full resize-none rounded-xl px-4 py-3 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Заметки</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительные заметки..."
              rows={2}
              className="glass-subtle w-full resize-none rounded-xl px-4 py-3 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            Отмена
          </button>
          <button
            onClick={() => onSave({ title, done, todo, notes })}
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
