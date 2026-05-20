"use client"

import { useState } from "react"
import type { Note } from "@/app/page"
import { Plus, Trash2, FileText, X, Eye, Edit3, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotesProps {
  notes: Note[]
  setNotes: (notes: Note[]) => void
  uid: () => string
}

export function Notes({ notes, setNotes, uid }: NotesProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editContent, setEditContent] = useState("")

  const handleCreate = (title: string) => {
    const newNote: Note = {
      id: uid(),
      title,
      content: "",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
    setNotes([...notes, newNote])
    setSelectedNote(newNote)
    setIsEditing(true)
    setEditContent("")
    setIsModalOpen(false)
  }

  const handleSave = () => {
    if (!selectedNote) return
    setNotes(
      notes.map((n) =>
        n.id === selectedNote.id ? { ...n, content: editContent, updated: new Date().toISOString() } : n
      )
    )
    setSelectedNote({ ...selectedNote, content: editContent })
    setIsEditing(false)
  }

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }

  // Simple markdown renderer
  const renderMarkdown = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="mb-4 mt-6 text-2xl font-bold first:mt-0">
              {line.slice(2)}
            </h1>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="mb-3 mt-5 text-xl font-semibold text-muted-foreground">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="mb-2 mt-4 text-lg font-medium">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="ml-4 list-disc">
              {line.slice(2)}
            </li>
          )
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-2 border-primary pl-4 italic text-muted-foreground">
              {line.slice(2)}
            </blockquote>
          )
        }
        if (line.startsWith("```")) {
          return null
        }
        if (line.trim() === "") {
          return <br key={i} />
        }
        return (
          <p key={i} className="mb-2">
            {line}
          </p>
        )
      })
  }

  return (
    <div className="animate-fade-in flex h-full p-8">
      {/* Notes List */}
      <div className="w-72 flex-shrink-0 pr-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Заметки</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl p-2.5 text-primary transition-all hover:bg-primary/10 active-scale"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText size={40} className="mb-4 text-muted-foreground/30" />
              <p className="text-base text-muted-foreground">Нет заметок</p>
            </div>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNote(note)
                  setEditContent(note.content)
                  setIsEditing(false)
                }}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all active-scale",
                  selectedNote?.id === note.id ? "glass bg-primary/10" : "hover:bg-muted/50"
                )}
              >
                <FileText size={16} className="text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-sm font-medium">{note.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updated).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(note.id)
                  }}
                  className="rounded-lg p-1.5 text-destructive opacity-0 transition-all hover:bg-destructive/10 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor/Viewer */}
      <div className="glass flex-1 rounded-2xl p-6">
        {!selectedNote ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <FileText size={56} className="mb-4 opacity-20" />
            <p className="text-base font-medium">Выберите заметку</p>
            <p className="text-sm text-muted-foreground/60">или создайте новую</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{selectedNote.title}</h2>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setEditContent(selectedNote.content)
                      setIsEditing(true)
                    }}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Edit3 size={14} />
                    Редактировать
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Eye size={14} />
                      Просмотр
                    </button>
                    <button
                      onClick={handleSave}
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active-scale"
                    >
                      Сохранить
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="# Заголовок&#10;## Раздел&#10;**жирный** _курсив_&#10;- список"
                className="glass-subtle h-[calc(100%-80px)] w-full resize-none rounded-xl p-4 font-mono text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30"
              />
            ) : (
              <div className="prose prose-sm max-w-none text-foreground">
                {selectedNote.content ? renderMarkdown(selectedNote.content) : (
                  <p className="text-muted-foreground">Нажмите &quot;Редактировать&quot; чтобы добавить содержимое</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <CreateNoteModal onSave={handleCreate} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}

function CreateNoteModal({ onSave, onClose }: { onSave: (title: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass animate-slide-up w-full max-w-sm rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Новая заметка</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Название</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название заметки"
            autoFocus
            className="glass-subtle relative h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            Отмена
          </button>
          <button
            onClick={() => onSave(title)}
            disabled={!title.trim()}
            className={cn(
              "rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all active-scale",
              !title.trim() ? "cursor-not-allowed opacity-50" : "hover:opacity-90"
            )}
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  )
}
