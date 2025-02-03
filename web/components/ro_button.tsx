import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ConnectButton } from "@mysten/dapp-kit"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[url('/robobo/button-normal.png')] bg-no-repeat bg-contain w-[366px] h-[84px] transition-none pb-[5%] group select-none hover:cursor-pointer [&:hover]:text-6xl",
  {
    variants: {
      variant: {
        connect: "font-tiny5",
        inventory: "font-tiny5",
        mint: "font-tiny5",
      },
    },
    defaultVariants: {
      variant: "connect",
    },
  },
)

export interface RoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const RoButton = React.forwardRef<HTMLButtonElement, RoButtonProps>(
  ({ className, asChild = false, children, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const buttonContent = (
      <Comp
        className={cn(buttonVariants({ variant, className }), "[&:active]:!bg-[url('/robobo/button-onclick.png')]")}
        ref={ref}
        {...props}
      >
        {children || "Connect Wallet"}
      </Comp>
    )

    if (variant === "connect") {
      return <ConnectButton>{buttonContent}</ConnectButton>
    }

    return buttonContent
  },
)

RoButton.displayName = "RoButton"

export { RoButton, buttonVariants }

