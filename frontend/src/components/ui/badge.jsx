import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-transparent hover:text-primary hover:border-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-transparent hover:text-secondary-foreground hover:border-secondary",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-transparent hover:text-destructive hover:border-destructive",
        outline: "text-foreground hover:bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 