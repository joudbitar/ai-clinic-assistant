import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("block truncate", className)}
    {...props}
  />
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } 