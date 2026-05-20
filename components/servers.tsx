"use client"

import { useState } from "react"
import type { ServerGroup, ServerPlugin } from "@/app/page"
import { Plus, Trash2, Edit3, ChevronDown, ChevronRight, Package, X, Server, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServersProps {
  serverGroups: ServerGroup[]
  setServerGroups: (groups: ServerGroup[]) => void
  uid: () => string
}

export function Servers({ serverGroups, setServerGroups, uid }: ServersProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [isPluginModalOpen, setIsPluginModalOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [editingPlugin, setEditingPlugin] = useState<ServerPlugin | null>(null)

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  const handleCreateGroup = (name: string) => {
    const newGroup: ServerGroup = {
      id: uid(),
      name,
      plugins: [],
    }
    setServerGroups([...serverGroups, newGroup])
    setIsGroupModalOpen(false)
  }

  const handleDeleteGroup = (id: string) => {
    setServerGroups(serverGroups.filter((g) => g.id !== id))
  }

  const handleSavePlugin = (groupId: string, plugin: Partial<ServerPlugin>) => {
    setServerGroups(
      serverGroups.map((g) => {
        if (g.id !== groupId) return g
        if (editingPlugin) {
          return {
            ...g,
            plugins: g.plugins.map((p) => (p.id === editingPlugin.id ? { ...p, ...plugin } : p)),
          }
        } else {
          const newPlugin: ServerPlugin = {
            id: uid(),
            title: plugin.title || "",
            desc: plugin.desc || "",
            ver: plugin.ver || "1.0.0",
            status: plugin.status || "active",
            deps: plugin.deps || "",
            tasks: [],
            changelog: [],
          }
          return { ...g, plugins: [...g.plugins, newPlugin] }
        }
      })
    )
    setIsPluginModalOpen(false)
    setEditingPlugin(null)
  }

  const handleDeletePlugin = (groupId: string, pluginId: string) => {
    setServerGroups(
      serverGroups.map((g) =>
        g.id === groupId ? { ...g, plugins: g.plugins.filter((p) => p.id !== pluginId) } : g
      )
    )
  }

  const statusColors = {
    active: "bg-[oklch(0.7_0.18_145)]/10 text-[oklch(0.7_0.18_145)]",
    testing: "bg-primary/10 text-primary",
    deprecated: "bg-destructive/10 text-destructive",
  }

  const statusLabels = {
    active: "Активен",
    testing: "Тестируется",
    deprecated: "Устарел",
  }

  return (
    <div className="animate-fade-in p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Группы серверов</h1>
          </div>
          <p className="text-base text-muted-foreground">Управление серверами и плагинами</p>
        </div>
        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="glass flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10 active-scale"
        >
          <Plus size={18} />
          Новая группа
        </button>
      </div>

      {/* Server Groups */}
      <div className="space-y-4">
        {serverGroups.length === 0 ? (
          <div className="glass-subtle flex flex-col items-center justify-center rounded-2xl py-16">
            <Server size={48} className="mb-4 text-muted-foreground/30" />
            <p className="text-base font-medium text-muted-foreground">Нет групп серверов</p>
            <p className="text-sm text-muted-foreground/60">Создайте первую группу</p>
          </div>
        ) : (
          serverGroups.map((group) => (
            <div key={group.id} className="glass rounded-2xl overflow-hidden">
              <div
                className="flex cursor-pointer items-center gap-3 p-5 transition-colors hover:bg-muted/30"
                onClick={() => toggleGroup(group.id)}
              >
                {expandedGroups.includes(group.id) ? (
                  <ChevronDown size={18} className="text-muted-foreground" />
                ) : (
                  <ChevronRight size={18} className="text-muted-foreground" />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Server size={18} className="text-primary" />
                </div>
                <h3 className="flex-1 font-semibold">{group.name}</h3>
                <span className="rounded-lg bg-muted/50 px-2.5 py-1 text-sm font-medium tabular-nums text-muted-foreground">
                  {group.plugins.length} плагинов
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedGroupId(group.id)
                    setEditingPlugin(null)
                    setIsPluginModalOpen(true)
                  }}
                  className="rounded-lg p-2 text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteGroup(group.id)
                  }}
                  className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {expandedGroups.includes(group.id) && (
                <div className="border-t border-border/30 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {group.plugins.map((plugin) => (
                      <div
                        key={plugin.id}
                        className="glass-subtle group flex items-start gap-3 rounded-xl p-4 transition-all"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                          <Package size={18} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-1 flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">{plugin.title}</span>
                            <span className="text-xs text-muted-foreground">v{plugin.ver}</span>
                            <span className={cn("rounded-lg px-2 py-0.5 text-[10px] font-medium", statusColors[plugin.status])}>
                              {statusLabels[plugin.status]}
                            </span>
                          </div>
                          {plugin.desc && <p className="text-sm text-muted-foreground truncate">{plugin.desc}</p>}
                          {plugin.deps && (
                            <p className="mt-1 text-xs text-muted-foreground/70">Deps: {plugin.deps}</p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setSelectedGroupId(group.id)
                              setEditingPlugin(plugin)
                              setIsPluginModalOpen(true)
                            }}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeletePlugin(group.id, plugin.id)}
                            className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {group.plugins.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">Нет плагинов в этой группе</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Group Modal */}
      {isGroupModalOpen && (
        <CreateGroupModal onSave={handleCreateGroup} onClose={() => setIsGroupModalOpen(false)} />
      )}

      {/* Plugin Modal */}
      {isPluginModalOpen && selectedGroupId && (
        <PluginModal
          plugin={editingPlugin}
          onSave={(p) => handleSavePlugin(selectedGroupId, p)}
          onClose={() => {
            setIsPluginModalOpen(false)
            setEditingPlugin(null)
          }}
        />
      )}
    </div>
  )
}

function CreateGroupModal({ onSave, onClose }: { onSave: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass animate-slide-up w-full max-w-sm rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Новая группа</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Survival 1.21, Anarchy..."
            autoFocus
            className="glass-subtle h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            Отмена
          </button>
          <button
            onClick={() => onSave(name)}
            disabled={!name.trim()}
            className={cn(
              "rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all active-scale",
              !name.trim() ? "cursor-not-allowed opacity-50" : "hover:opacity-90"
            )}
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  )
}

function PluginModal({
  plugin,
  onSave,
  onClose,
}: {
  plugin: ServerPlugin | null
  onSave: (plugin: Partial<ServerPlugin>) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(plugin?.title || "")
  const [desc, setDesc] = useState(plugin?.desc || "")
  const [ver, setVer] = useState(plugin?.ver || "1.0.0")
  const [status, setStatus] = useState<ServerPlugin["status"]>(plugin?.status || "active")
  const [deps, setDeps] = useState(plugin?.deps || "")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass animate-slide-up w-full max-w-md rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{plugin ? "Редактировать плагин" : "Новый плагин"}</h2>
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
            <label className="mb-2 block text-sm font-medium text-foreground">Описание</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Краткое описание"
              className="glass-subtle h-12 w-full rounded-xl px-4 text-base outline-none transition-all focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="mb-2 block text-sm font-medium text-foreground">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServerPlugin["status"])}
                className="glass-subtle h-12 w-full rounded-xl px-4 text-base outline-none"
              >
                <option value="active">Активен</option>
                <option value="testing">Тестируется</option>
                <option value="deprecated">Устарел</option>
              </select>
            </div>
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
            onClick={() => onSave({ title, desc, ver, status, deps })}
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
