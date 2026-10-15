"use client"

/**
 * 설명 말풍선 — 마우스를 올려도, 손가락으로 눌러도 열립니다.
 * (기존 Radix Tooltip은 휴대폰에서 열리지 않아서 Popover 기반으로 바꿨어요.
 *  사용하는 쪽 코드는 그대로 Tooltip / TooltipTrigger / TooltipContent 를 쓰면 됩니다.)
 */
import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

type Ctx = { open: boolean; setOpen: (v: boolean) => void; hover: React.MutableRefObject<number | null> }
const TipContext = React.createContext<Ctx | null>(null)

const TooltipProvider = ({ children }: { children: React.ReactNode; delayDuration?: number }) => <>{children}</>

function Tooltip({ children }: { children: React.ReactNode; delayDuration?: number }) {
  const [open, setOpen] = React.useState(false)
  const hover = React.useRef<number | null>(null)
  return (
    <TipContext.Provider value={{ open, setOpen, hover }}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </PopoverPrimitive.Root>
    </TipContext.Provider>
  )
}

const canHover = () => typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ onMouseEnter, onMouseLeave, onClick, ...props }, ref) => {
  const ctx = React.useContext(TipContext)!
  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      aria-label={props["aria-label"] ?? "설명 보기"}
      onClick={(e) => {
        // 폼 안에 있어도 계산이 실행되지 않게
        e.preventDefault()
        e.stopPropagation()
        ctx.setOpen(!ctx.open)
        onClick?.(e)
      }}
      onMouseEnter={(e) => {
        if (canHover()) {
          if (ctx.hover.current) window.clearTimeout(ctx.hover.current)
          ctx.setOpen(true)
        }
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (canHover()) ctx.hover.current = window.setTimeout(() => ctx.setOpen(false), 120)
        onMouseLeave?.(e)
      }}
      {...props}
    />
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, sideOffset = 6, side = "top", ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      side={side}
      sideOffset={sideOffset}
      collisionPadding={12}
      onOpenAutoFocus={(e) => e.preventDefault()}
      className={cn(
        "z-50 max-w-[260px] rounded-xl border border-border-strong bg-popover px-3 py-2 text-[13px] leading-relaxed text-foreground shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
