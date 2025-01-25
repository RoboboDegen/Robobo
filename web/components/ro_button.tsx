import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[url('/robobo/button-normal.png')] bg-no-repeat bg-contain w-[366px] h-[84px] transition-none",
)

export interface RoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const RoButton = React.forwardRef<HTMLButtonElement, RoButtonProps>(
  ({ className, asChild = false, children = "Button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonVariants({ className }),
          "group select-none hover:cursor-pointer",
          "[&:active]:!bg-[url('/robobo/button-onclick.png')]",
          "[&:hover]:text-6xl",
          "pb-[5%]"
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
RoButton.displayName = "RoButton"

export { RoButton }