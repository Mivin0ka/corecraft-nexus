"use client"

import { useState } from "react"
import type { GlobalPlugin } from "@/app/page"
import { Plus, Trash2, Edit3, Package, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface PluginsProps {
  globalPlugins: GlobalPlugin[]
  setGlobalPlugins: (plugins: GlobalPlugin[]) => void
  uid: () => string
}

export function Plugins({ globalPlugins, setGlobalPlugins, uid }: PluginsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlugin, setEditingPlugin] = useState<GlobalPlugin | null>(null)

  const handleSave = (plugin: Partial<GlobalPlugin>) => {
    if (editingPlugin) {
      setGlobalPlugins(globalPlugins.map((p) => (p.id === editingPlugin.id ? { ...p, ...plugin } : p)))
    } else {
      const newPlugin: GlobalPlugin = {
        id: uid(),
        title: plugin.title || "",
        ver: plugin.ver || "1.0.0",
        deps: plugin.deps || "",
      }
      setGlobalPlugins([...globalPlugins, newPlugin])
    }
    setIsModalOpen(false)
    setEditingPlugin(null)
  }

  const handleDelete = (id: string) => {
    setGlobalPlugins(globalPlugins.filter((p) => p.id !== id))
  }

  return (
    <div className="animate-fade-in p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Глобальные плагины</h1>
          </div>
          <p className="text-base text-muted-foreground">Независимые плагины</p>
        </div>
        <button
          onClick={() => {
            setEditingPlugin(null)
            setIsModalOpen(true)
          }}
          className="glass flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10 active-scale"
        >
          <Plus size={18} />
          Новый плагин
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {globalPlugins.length === 0 ? (
          <div className="glass-subtle col-span-2 flex flex-col items-center justify-center rounded-2xl py-16">
            <Package size={48} className="mb-4 text-muted-foreground/30" />
            <p className="text-base font-medium text-muted-foreground">Нет глобальных плагинов</p>
            <p className="text-sm text-muted-foreground/60">Добавьте первый плагин</p>
          </div>
        ) : (
          globalPlugins.map((plugin, index) => (
            <div
              key={plugin.id}
              className="glass group flex items-start gap-4 rounded-2xl p-5 transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Package size={22} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-3">
                  <h3 className="text-base font-semibold text-foreground truncate">{plugin.title}</h3>
                  <span className="rounded-lg bg-muted/50 px-2.5 py-1 text-sm font-medium text-muted-foreground">v{plugin.ver}</span>
                </div>
                {plugin.deps && <p className="text-sm text-muted-foreground truncate">Deps: {plugin.deps}</p>}
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditingPlugin(plugin)
                    setIsModalOpen(true)
                  }}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(plugin.id)}
                  className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <PluginModal
          plugin={editingPlugin}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPlugin(null)
          }}
        />
      )}
    </div>
  )
}

function PluginModal({
  plugin,
  onSave,
  onClose,
}: {
  plugin: GlobalPlugin | null
  onSave: (plugin: Partial<GlobalPlugin>) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(plugin?.title || "")
  const [ver, setVer] = useState(plugin?.ver || "1.0.0")
  const [deps, setDeps] = useState(plugin?.deps || "")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass animate-slide-up w-full max-w-md rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{plugin ? "Редактировать" : "Новый плагин"}</h2>
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
              placeholder="Название плагина"
              autoFocus
              className="glass-subtle h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Версия</label>
            <input
              type="text"
              value={ver}
              onChange={(e) => setVer(e.target.value)}
              placeholder="1.0.0"
              className="glass-subtle h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Зависимости</label>
            <input
              type="text"
              value={deps}
              onChange={(e) => setDeps(e.target.value)}
              placeholder="WorldGuard, PAPI (через запятую)"
              className="glass-subtle h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            Отмена
          </button>
          <button
            onClick={() => onSave({ title, ver, deps })}
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
