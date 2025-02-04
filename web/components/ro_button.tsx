import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-no-repeat bg-contain transition-none",
  {
    variants: {
      variant: {
        chat_send: "bg-[url('/gameui/chat/chatbox_sent_btn.png')] w-[60px] h-[60px]",
        chat_back: "bg-[url('/gameui/chat/top_back_btn.png')] w-[60px] h-[60px]",
        home_bottom:
          "bg-[url('/gameui/home/bottom_btn.png')] hover:bg-[url('/gameui/home/bottom_btn_pre.png')] active:bg-[url('/gameui/home/bottom_btn_pre.png')] w-[100px] h-[60px]",
        left_arrow_btn: "bg-[url('/gameui/home/left_arrow_btn.png')] w-[40px] h-[40px]",
        right_arrow_btn: "bg-[url('/gameui/home/right_arrow_btn.png')] w-[40px] h-[40px]",
        inventory_back: "bg-[url('/gameui/inventory/top_back_btn.png')] w-[60px] h-[60px]",
        mint_bottom:
          "bg-[url('/gameui/mint/bottom_bar_default.png')] hover:bg-[url('/gameui/mint/bottom_bar_pre.png')] active:bg-[url('/gameui/mint/bottom_bar_pre.png')] w-[260px] h-[60px] text-[30px]",
      },
    },
    defaultVariants: {
      variant: "home_bottom",
    },
  }
);

export interface RoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const RoButton = React.forwardRef<HTMLButtonElement, RoButtonProps>(
  ({ className, asChild = false, variant = "chat_send", children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, className }),
          "group select-none hover:cursor-pointer",
          "[&:active]:brightness-90",
          "[&:hover]:scale-105",
          "font-tiny5",
          "transition-transform duration-200",
          "flex justify-center items-center text-center" // 保证按钮文字居中
        )}
        ref={ref}
        {...props}
      >
        {children || null}
      </Comp>
    );
  }
);

RoButton.displayName = "RoButton";

export { RoButton, buttonVariants };
