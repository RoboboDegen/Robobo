interface ScrollbarProps {
  className?: string
}

export function Scrollbar({ className }: ScrollbarProps) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(/gameui/inventory/inventory_scrollbar_track.png)`,
        backgroundSize: "cover",
        width: "12px",
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          backgroundImage: `url(/gameui/inventory/inventory_scrollbar_thumb.png)`,
          backgroundSize: "cover",
          width: "100%",
          height: "40px",
          cursor: "pointer",
        }}
      />
    </div>
  )
}

