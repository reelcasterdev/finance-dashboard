import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-discord-blurple text-white hover:bg-discord-blurple/90 shadow-discord-blurple/25",
        secondary:
          "bg-discord-bg-tertiary text-discord-text-secondary hover:bg-discord-bg-tertiary/80 border border-discord-border",
        destructive:
          "bg-discord-red text-white hover:bg-discord-red/90 shadow-discord-red/25",
        success:
          "bg-discord-green text-discord-bg-tertiary hover:bg-discord-green/90 shadow-discord-green/25",
        warning:
          "bg-discord-yellow text-discord-bg-tertiary hover:bg-discord-yellow/90 shadow-discord-yellow/25",
        outline:
          "border border-discord-border text-discord-text-primary hover:bg-discord-bg-tertiary/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }