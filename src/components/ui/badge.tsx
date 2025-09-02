import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10",
        secondary:
          "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10",
        destructive:
          "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10",
        success:
          "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
        warning:
          "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20",
        outline:
          "text-gray-700 ring-1 ring-inset ring-gray-300",
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