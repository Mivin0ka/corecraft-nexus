"use client"

import { useState } from "react"
import type { WikiPage } from "@/app/page"
import { Plus, Trash2, Edit3, BookOpen, X, FileText, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface WikiProps {
  wikiPages: WikiPage[]
  setWikiPages: (pages: WikiPage[]) => void
  uid: () => string
}

export function Wiki({ wikiPages, setWikiPages, uid }: WikiProps) {
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<WikiPage | null>(null)

  const categories = [...new Set(wikiPages.map((p) => p.cat).filter(Boolean))]

  const handleSave = (page: Partial<WikiPage>) => {
    if (editingPage) {
      const updated = { ...editingPage, ...page, updated: new Date().toISOString() }
      setWikiPages(wikiPages.map((p) => (p.id === editingPage.id ? updated : p)))
      if (selectedPage?.id === editingPage.id) {
        setSelectedPage(updated as WikiPage)
      }
    } else {
      const newPage: WikiPage = {
        id: uid(),
        title: page.title || "",
        cat: page.cat || "",
        content: page.content || "",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
      setWikiPages([...wikiPages, newPage])
    }
    setIsModalOpen(false)
    setEditingPage(null)
  }

  const handleDelete = (id: string) => {
    setWikiPages(wikiPages.filter((p) => p.id !== id))
    if (selectedPage?.id === id) {
      setSelectedPage(null)
    }
  }

  // Simple markdown renderer
  const renderMarkdown = (content: string) => {
    return content.split("\n").map((line, i) => {
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
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 pr-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Wiki</h1>
          </div>
          <button
            onClick={() => {
              setEditingPage(null)
              setIsModalOpen(true)
            }}
            className="rounded-xl p-2.5 text-primary transition-all hover:bg-primary/10 active-scale"
          >
            <Plus size={18} />
          </button>
        </div>

        {wikiPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BookOpen size={40} className="mb-4 text-muted-foreground/30" />
            <p className="text-base text-muted-foreground">Нет страниц</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.length > 0 &&
              categories.map((cat) => (
                <div key={cat}>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {cat}
                  </p>
                  {wikiPages
                    .filter((p) => p.cat === cat)
                    .map((page) => (
                      <WikiItem
                        key={page.id}
                        page={page}
                        isSelected={selectedPage?.id === page.id}
                        onSelect={() => setSelectedPage(page)}
                        onEdit={() => {
                          setEditingPage(page)
                          setIsModalOpen(true)
                        }}
                        onDelete={() => handleDelete(page.id)}
                      />
                    ))}
                </div>
              ))}
            {wikiPages.filter((p) => !p.cat).length > 0 && (
              <div>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Без категории
                </p>
                {wikiPages
                  .filter((p) => !p.cat)
                  .map((page) => (
                    <WikiItem
                      key={page.id}
                      page={page}
                      isSelected={selectedPage?.id === page.id}
                      onSelect={() => setSelectedPage(page)}
                      onEdit={() => {
                        setEditingPage(page)
                        setIsModalOpen(true)
                      }}
                      onDelete={() => handleDelete(page.id)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Viewer */}
      <div className="glass flex-1 rounded-2xl p-6">
        {!selectedPage ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <BookOpen size={56} className="mb-4 opacity-20" />
            <p className="text-base font-medium">Выберите страницу</p>
            <p className="text-sm text-muted-foreground/60">или создайте новую</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedPage.title}</h2>
                {selectedPage.cat && (
                  <span className="mt-1.5 inline-block rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {selectedPage.cat}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setEditingPage(selectedPage)
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <Edit3 size={14} />
                Редактировать
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-foreground">
              {selectedPage.content ? (
                renderMarkdown(selectedPage.content)
              ) : (
                <p className="text-muted-foreground">Нет содержимого</p>
              )}
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <WikiModal
          page={editingPage}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPage(null)
          }}
        />
      )}
    </div>
  )
}

function WikiItem({
  page,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  page: WikiPage
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all active-scale",
        isSelected ? "glass bg-primary/10" : "hover:bg-muted/50"
      )}
    >
      <FileText size={16} className="text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <span className="block truncate text-sm font-medium">{page.title}</span>
      </div>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Edit3 size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="rounded-lg p-1 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </button>
  )
}

function WikiModal({
  page,
  onSave,
  onClose,
}: {
  page: WikiPage | null
  onSave: (page: Partial<WikiPage>) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(page?.title || "")
  const [cat, setCat] = useState(page?.cat || "")
  const [content, setContent] = useState(page?.content || "")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass animate-slide-up w-full max-w-2xl rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{page ? "Редактировать страницу" : "Новая страница"}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Заголовок</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название страницы"
                autoFocus
                className="glass-subtle h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Категория</label>
              <input
                type="text"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                placeholder="Механики, Конфиги..."
                className="glass-subtle h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Содержимое (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Заголовок&#10;## Раздел&#10;- список&#10;> цитата"
              rows={12}
              className="glass-subtle w-full resize-none rounded-xl px-4 py-3 font-mono text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            Отмена
          </button>
          <button
            onClick={() => onSave({ title, cat, content })}
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
