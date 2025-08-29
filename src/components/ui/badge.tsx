import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-discord-blurple text-discord-white hover:bg-discord-blurple/80",
        secondary:
          "bg-discord-bg-tertiary text-discord-text-secondary hover:bg-discord-bg-tertiary/80",
        destructive:
          "bg-discord-red text-discord-white hover:bg-discord-red/80",
        success:
          "bg-discord-green text-discord-bg-tertiary hover:bg-discord-green/80",
        warning:
          "bg-discord-yellow text-discord-bg-tertiary hover:bg-discord-yellow/80",
        outline:
          "border border-discord-border text-discord-text-primary",
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