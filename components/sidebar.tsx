"use client"

import { cn } from "@/lib/utils"
import type { Page, Theme, AppState } from "@/app/page"
import {
  LayoutDashboard,
  ListTodo,
  Bug,
  FileText,
  Server,
  Package,
  TestTube,
  BookOpen,
  Archive,
  Sun,
  Moon,
  Download,
  Upload,
  Search,
  X,
} from "lucide-react"
import { useState, useRef, useMemo } from "react"

interface SidebarProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  state: AppState
  setState: (state: AppState) => void
}

interface SearchResult {
  type: "task" | "bug" | "note" | "server" | "plugin" | "testing" | "wiki"
  id: string
  title: string
  page: Page
  subtitle?: string
}

const navItems: { page: Page; label: string; icon: React.ReactNode; section?: string }[] = [
  { page: "dashboard", label: "Статистика", icon: <LayoutDashboard size={18} />, section: "Обзор" },
  { page: "tasks", label: "Таск-борд", icon: <ListTodo size={18} />, section: "Разработка" },
  { page: "bugs", label: "Баг-трекер", icon: <Bug size={18} /> },
  { page: "notes", label: "Заметки", icon: <FileText size={18} /> },
  { page: "servers", label: "Серверы", icon: <Server size={18} />, section: "Инфраструктура" },
  { page: "plugins", label: "Плагины", icon: <Package size={18} /> },
  { page: "testing", label: "Тестируется", icon: <TestTube size={18} /> },
  { page: "wiki", label: "Wiki", icon: <BookOpen size={18} /> },
  { page: "archive", label: "Архив", icon: <Archive size={18} /> },
]

export function Sidebar({ currentPage, setCurrentPage, theme, setTheme, state, setState }: SidebarProps) {
  const [search, setSearch] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Global search across all data
  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    const results: SearchResult[] = []

    // Search tasks
    state.tasks.forEach((task) => {
      if (task.title.toLowerCase().includes(q) || task.desc.toLowerCase().includes(q)) {
        results.push({
          type: "task",
          id: task.id,
          title: task.title,
          page: task.status === "done" ? "archive" : "tasks",
          subtitle: task.status === "done" ? "Архив" : `Задача - ${task.priority}`,
        })
      }
    })

    // Search bugs
    state.bugs.forEach((bug) => {
      if (bug.title.toLowerCase().includes(q) || bug.desc.toLowerCase().includes(q)) {
        results.push({
          type: "bug",
          id: bug.id,
          title: bug.title,
          page: "bugs",
          subtitle: `Баг - ${bug.severity}`,
        })
      }
    })

    // Search notes
    state.notes.forEach((note) => {
      if (note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) {
        results.push({
          type: "note",
          id: note.id,
          title: note.title,
          page: "notes",
          subtitle: "Заметка",
        })
      }
    })

    // Search server groups and their plugins
    state.serverGroups.forEach((group) => {
      if (group.name.toLowerCase().includes(q)) {
        results.push({
          type: "server",
          id: group.id,
          title: group.name,
          page: "servers",
          subtitle: "Группа серверов",
        })
      }
      group.plugins.forEach((plugin) => {
        if (plugin.title.toLowerCase().includes(q) || plugin.desc.toLowerCase().includes(q)) {
          results.push({
            type: "plugin",
            id: plugin.id,
            title: plugin.title,
            page: "servers",
            subtitle: `Плагин в ${group.name}`,
          })
        }
      })
    })

    // Search global plugins
    state.globalPlugins.forEach((plugin) => {
      if (plugin.title.toLowerCase().includes(q) || plugin.deps.toLowerCase().includes(q)) {
        results.push({
          type: "plugin",
          id: plugin.id,
          title: plugin.title,
          page: "plugins",
          subtitle: `Глобальный плагин v${plugin.ver}`,
        })
      }
    })

    // Search testing items
    state.testingItems.forEach((item) => {
      if (
        item.title.toLowerCase().includes(q) ||
        item.done.toLowerCase().includes(q) ||
        item.todo.toLowerCase().includes(q)
      ) {
        results.push({
          type: "testing",
          id: item.id,
          title: item.title,
          page: "testing",
          subtitle: "Тестирование",
        })
      }
    })

    // Search wiki
    state.wikiPages.forEach((page) => {
      if (
        page.title.toLowerCase().includes(q) ||
        page.content.toLowerCase().includes(q) ||
        page.cat.toLowerCase().includes(q)
      ) {
        results.push({
          type: "wiki",
          id: page.id,
          title: page.title,
          page: "wiki",
          subtitle: `Wiki - ${page.cat}`,
        })
      }
    })

    return results.slice(0, 8)
  }, [search, state])

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `devpanel-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        setState(parsed)
      } catch {
        alert("Invalid JSON file")
      }
    }
    reader.readAsText(file)
  }

  const handleSearchSelect = (result: SearchResult) => {
    setCurrentPage(result.page)
    setSearch("")
    setIsSearchFocused(false)
  }

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "task":
        return <ListTodo size={14} />
      case "bug":
        return <Bug size={14} />
      case "note":
        return <FileText size={14} />
      case "server":
        return <Server size={14} />
      case "plugin":
        return <Package size={14} />
      case "testing":
        return <TestTube size={14} />
      case "wiki":
        return <BookOpen size={14} />
    }
  }

  return (
    <aside className="glass relative flex h-full w-72 flex-col border-r border-border/50">
      {/* Logo */}
      <div className="border-b border-border/30 p-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-foreground">DevPanel</span>
            <p className="text-xs text-muted-foreground">CoreCraft Nexus v2.0</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative z-50 p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск везде..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="glass-subtle relative h-11 w-full rounded-xl pl-10 pr-8 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchFocused && searchResults.length > 0 && (
          <div className="glass absolute left-4 right-4 top-[calc(100%-8px)] z-[100] mt-2 max-h-80 overflow-y-auto rounded-xl border border-border/50 bg-background/95 p-2 shadow-xl animate-slide-up">
            {searchResults.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSearchSelect(result)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-muted/50 active-scale"
              >
                <span className="text-muted-foreground">{getResultIcon(result.type)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{result.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{result.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearchFocused && search && searchResults.length === 0 && (
          <div className="glass absolute left-4 right-4 top-[calc(100%-8px)] z-[100] mt-2 rounded-xl border border-border/50 bg-background/95 p-4 text-center text-sm text-muted-foreground shadow-xl animate-slide-up">
            Ничего не найдено
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        {navItems.map((item, i) => (
          <div key={item.page}>
            {item.section && (
              <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {item.section}
              </p>
            )}
            {i === 0 && !item.section && null}
            <button
              onClick={() => setCurrentPage(item.page)}
              className={cn(
                "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all active-scale",
                currentPage === item.page
                  ? "glass bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {currentPage === item.page && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/30 p-4">
        {/* Theme Toggle */}
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all active-scale",
              theme === "light" ? "glass bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Sun size={16} />
            Светлая
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all active-scale",
              theme === "dark" ? "glass bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Moon size={16} />
            Тёмная
          </button>
        </div>

        {/* Export/Import */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="glass-subtle relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground active-scale"
          >
            <Upload size={14} />
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="glass-subtle relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground active-scale"
          >
            <Download size={14} />
            Import
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>

        {/* Credits */}
        <div className="mt-4 text-xs leading-relaxed text-muted-foreground/60">
          <div>DEV astridhanson</div>
          <div>TG @ahilesgroup</div>
        </div>
      </div>
    </aside>
  )
}
