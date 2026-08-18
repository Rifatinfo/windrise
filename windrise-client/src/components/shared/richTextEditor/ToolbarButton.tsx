"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ToolbarButtonProps extends React.ComponentProps<"button"> {
  label: string
  active?: boolean
}

export function ToolbarButton({
  label,
  active,
  className,
  children,
  ...props
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            data-active={active || undefined}
            className={cn(
              "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 data-active:bg-brand/10 data-active:text-brand [&_svg]:size-4 [&_svg]:shrink-0",
              className
            )}
            {...props}
          >
            {children}
          </button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function ToolbarSeparator() {
  return <div className="mx-0.5 h-5 w-px shrink-0 self-center bg-border" aria-hidden="true" />
}
