"use client"

import type { AppState } from "@/app/page"
import { ListTodo, Bug, CheckCircle2, Clock, AlertTriangle, TrendingUp, Sparkles } from "lucide-react"

interface DashboardProps {
  state: AppState
}

export function Dashboard({ state }: DashboardProps) {
  const activeTasks = state.tasks.filter((t) => t.status !== "done").length
  const doneTasks = state.tasks.filter((t) => t.status === "done").length
  const openBugs = state.bugs.filter((b) => b.status === "open").length
  const criticalBugs = state.bugs.filter((b) => b.severity === "critical" && b.status !== "fixed").length

  const tasksByPriority = {
    high: state.tasks.filter((t) => t.priority === "high" && t.status !== "done").length,
    medium: state.tasks.filter((t) => t.priority === "medium" && t.status !== "done").length,
    low: state.tasks.filter((t) => t.priority === "low" && t.status !== "done").length,
  }

  const recentTasks = [...state.tasks]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5)

  return (
    <div className="animate-fade-in p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Статистика</h1>
        </div>
        <p className="text-base text-muted-foreground">Обзор проекта CoreCraft Nexus</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <StatCard
          label="Активных задач"
          value={activeTasks}
          icon={<ListTodo className="text-primary" size={22} />}
          color="primary"
          trend={activeTasks > 0 ? "+active" : undefined}
        />
        <StatCard
          label="Выполнено"
          value={doneTasks}
          icon={<CheckCircle2 className="text-[oklch(0.7_0.18_145)]" size={22} />}
          color="success"
          trend={doneTasks > 0 ? `${Math.round((doneTasks / (doneTasks + activeTasks || 1)) * 100)}%` : undefined}
        />
        <StatCard
          label="Открытых багов"
          value={openBugs}
          icon={<Bug className="text-[oklch(0.8_0.18_80)]" size={22} />}
          color="warning"
        />
        <StatCard
          label="Критических"
          value={criticalBugs}
          icon={<AlertTriangle className="text-destructive" size={22} />}
          color="destructive"
          highlight={criticalBugs > 0}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Priority Chart */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp size={18} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Задачи по приоритету</h3>
          </div>
          <div className="space-y-5">
            <PriorityBar label="Высокий" count={tasksByPriority.high} total={activeTasks} color="bg-destructive" />
            <PriorityBar
              label="Средний"
              count={tasksByPriority.medium}
              total={activeTasks}
              color="bg-[oklch(0.8_0.18_80)]"
            />
            <PriorityBar
              label="Низкий"
              count={tasksByPriority.low}
              total={activeTasks}
              color="bg-muted-foreground/50"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Clock size={18} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Последние задачи</h3>
          </div>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <ListTodo size={32} className="mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Нет задач</p>
              </div>
            ) : (
              recentTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-3 transition-all hover:bg-muted/50 hover:translate-x-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      task.priority === "high"
                        ? "bg-destructive"
                        : task.priority === "medium"
                          ? "bg-[oklch(0.8_0.18_80)]"
                          : "bg-muted-foreground/50"
                    }`}
                  />
                  <span className="flex-1 truncate text-sm font-medium">{task.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(task.created).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  trend,
  highlight,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: string
  highlight?: boolean
}) {
  return (
    <div className={`glass rounded-2xl p-5 transition-all ${highlight ? 'ring-2 ring-destructive/50 animate-pulse-glow' : ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
          {icon}
        </div>
        {trend && (
          <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {trend}
          </span>
        )}
      </div>
      <div className="text-4xl font-bold tabular-nums text-foreground">{value}</div>
      <div className="mt-1.5 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function PriorityBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-foreground">{count}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted/50">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  )
}
