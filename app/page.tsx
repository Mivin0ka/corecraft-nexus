"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { TaskBoard } from "@/components/task-board"
import { BugTracker } from "@/components/bug-tracker"
import { Notes } from "@/components/notes"
import { Servers } from "@/components/servers"
import { Plugins } from "@/components/plugins"
import { Testing } from "@/components/testing"
import { Wiki } from "@/components/wiki"
import { Archive } from "@/components/archive"


export type Theme = "light" | "dark"
export type Page = "dashboard" | "tasks" | "bugs" | "notes" | "servers" | "plugins" | "testing" | "wiki" | "archive"

export interface Task {
  id: string
  title: string
  desc: string
  priority: "high" | "medium" | "low"
  status: "planned" | "progress" | "done"
  deadline?: string
  created: string
  history: { text: string; ts: string }[]
  pomodoro: number
}

export interface Bug {
  id: string
  title: string
  desc: string
  severity: "critical" | "medium" | "minor"
  status: "open" | "progress" | "fixed"
  plugin?: string
  repro: "always" | "sometimes" | "rare"
  created: string
}

export interface Note {
  id: string
  title: string
  content: string
  created: string
  updated: string
}

export interface ServerPlugin {
  id: string
  title: string
  desc: string
  ver: string
  status: "active" | "testing" | "deprecated"
  deps: string
  tasks: { id: string; text: string; done: boolean }[]
  changelog: { ver: string; desc: string; date: string }[]
}

export interface ServerGroup {
  id: string
  name: string
  plugins: ServerPlugin[]
}

export interface GlobalPlugin {
  id: string
  title: string
  ver: string
  deps: string
}

export interface TestingItem {
  id: string
  title: string
  done: string
  todo: string
  notes: string
  created: string
}

export interface WikiPage {
  id: string
  title: string
  cat: string
  content: string
  created: string
  updated: string
}

export interface AppState {
  tasks: Task[]
  bugs: Bug[]
  notes: Note[]
  serverGroups: ServerGroup[]
  globalPlugins: GlobalPlugin[]
  testingItems: TestingItem[]
  wikiPages: WikiPage[]
  theme: Theme
}

const defaultState: AppState = {
  tasks: [],
  bugs: [],
  notes: [],
  serverGroups: [],
  globalPlugins: [],
  testingItems: [],
  wikiPages: [],
  theme: "dark",
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export default function Home() {
  const [state, setState] = useState<AppState>(defaultState)
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("ccn_v3")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState({ ...defaultState, ...parsed })
      } catch {
        // ignore
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ccn_v3", JSON.stringify(state))
    }
  }, [state, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(state.theme)
    }
  }, [state.theme, isLoaded])

  const setTheme = (theme: Theme) => {
    setState((s) => ({ ...s, theme }))
  }

  const updateState = <K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState((s) => ({ ...s, [key]: value }))
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
          <span className="text-sm text-muted-foreground">Загрузка...</span>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard state={state} />
      case "tasks":
        return <TaskBoard tasks={state.tasks} setTasks={(tasks) => updateState("tasks", tasks)} uid={uid} />
      case "bugs":
        return <BugTracker bugs={state.bugs} setBugs={(bugs) => updateState("bugs", bugs)} uid={uid} />
      case "notes":
        return <Notes notes={state.notes} setNotes={(notes) => updateState("notes", notes)} uid={uid} />
      case "servers":
        return (
          <Servers
            serverGroups={state.serverGroups}
            setServerGroups={(groups) => updateState("serverGroups", groups)}
            uid={uid}
          />
        )
      case "plugins":
        return (
          <Plugins
            globalPlugins={state.globalPlugins}
            setGlobalPlugins={(plugins) => updateState("globalPlugins", plugins)}
            uid={uid}
          />
        )
      case "testing":
        return (
          <Testing
            testingItems={state.testingItems}
            setTestingItems={(items) => updateState("testingItems", items)}
            uid={uid}
          />
        )
      case "wiki":
        return <Wiki wikiPages={state.wikiPages} setWikiPages={(pages) => updateState("wikiPages", pages)} uid={uid} />
      case "archive":
        return <Archive tasks={state.tasks} setTasks={(tasks) => updateState("tasks", tasks)} />
      default:
        return <Dashboard state={state} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        theme={state.theme}
        setTheme={setTheme}
        state={state}
        setState={setState}
      />
      <main className="flex-1 overflow-auto">{renderPage()}</main>
    </div>
  )
}
