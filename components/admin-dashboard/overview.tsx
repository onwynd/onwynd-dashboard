"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type DataPoint = {
  label: string
  value: number
}

export function Overview({ className, data }: { className?: string; data: DataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("h-40 w-full flex items-center justify-center text-sm text-muted-foreground", className)}>
        No data available.
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div className={cn("h-40 w-full", className)}>
      <div className="flex h-full items-end gap-2">
        {data.map((d) => {
          const height = Math.round((d.value / max) * 100)
          return (
            <div key={d.label} className="flex-1">
              <div className="bg-primary/20 rounded-md" style={{ height: `${height}%` }} />
              <div className="mt-1 text-[10px] text-muted-foreground text-center">{d.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
