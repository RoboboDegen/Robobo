"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

interface ScrollBarProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  scrollbarTrackImage?: string;  // 可传入滚动条轨道的图片
  scrollbarThumbImage?: string;  // 可传入滚动条滑块的图片
  orientation?: "vertical" | "horizontal";
}

const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>>(
  ({ className, children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
)
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>, ScrollBarProps>(
  ({ orientation = "vertical", scrollbarTrackImage, scrollbarThumbImage, ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" && "w-[10px] bg-transparent", // vertical scrollbar style, reduced width
        orientation === "horizontal" && "h-[10px] bg-transparent", // horizontal scrollbar style
      )}
      {...props}
    >
      <div
        className="flex-1"
        style={{
          backgroundImage: `url(${scrollbarTrackImage})` ,  // 使用传入的轨道图片
          backgroundSize: "100% 100%", // 确保轨道图片完全填充区域
          width: "100%",
          position: "absolute",
          top: 0,
          bottom: 0,
          height: "100%",
        }}
      >
        <ScrollAreaPrimitive.ScrollAreaThumb
          className="relative flex-1"
          style={{
            backgroundImage: `url(${scrollbarThumbImage})`,  // 使用传入的滑块图片
            backgroundSize: "100% 100%", // 确保滑块图片完全填充区域
            width: "100%",
            minHeight: "60px", // 调整滑块高度
            cursor: "pointer",
          }}
        />
      </div>
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
)
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
