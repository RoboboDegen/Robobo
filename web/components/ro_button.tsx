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
        chat_back: "bg-[url('/gameui/chat/top_back_btn.png')] w-[120px] h-[60px]  text-right pl-2",
        inventory:
          "bg-[url('/gameui/home/bottom_btn.png')] hover:bg-[url('/gameui/home/bottom_btn_pre.png')] active:bg-[url('/gameui/home/bottom_btn_pre.png')] w-[100px] h-[60px] bg-center text-[18px]",
        fight: "bg-[url('/gameui/home/fight_button.png')] w-[100px] h-[60px] bg-center hover:bg-[url('/gameui/home/fight_button_click.png')] active:bg-[url('/gameui/home/fight_button_click.png')] text-[20px] ",
        chat: "bg-[url('/gameui/home/chat_button.png')] w-[100px] h-[60px] bg-center hover:bg-[url('/gameui/home/chat_button_click.png')] active:bg-[url('/gameui/home/chat_button_click.png')] text-[20px]",
        left_arrow_btn: "bg-[url('/gameui/home/left_arrow_btn.png')] w-[40px] h-[40px]",
        right_arrow_btn: "bg-[url('/gameui/home/right_arrow_btn.png')] w-[40px] h-[40px]",
        inventory_back: "bg-[url('/gameui/inventory/top_back_btn.png')] bg-center w-[120px] h-[40px] text-[24px] text-right pl-2",
        mint_bottom:
          "bg-[url('/gameui/mint/bottom_bar_default.png')] w-[300px] hover:w-[300px] hover:bg-[url('/gameui/mint/bottom_bar_pre.png')] active:w-[300px] active:bg-[url('/gameui/mint/bottom_bar_pre.png')] h-[60px] text-[30px] bg-[length:300px_60px] bg-center text-black",
      },
    },
    defaultVariants: {
      variant: "inventory",
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
