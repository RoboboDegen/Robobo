interface HealthBarProps {
  value: number
  maxValue: number
}

export function HealthBar({ value, maxValue }: HealthBarProps) {
  const percentage = (value / maxValue) * 100

  return (
    <div className="relative w-32 h-4 -ml-4">
      <img
        src="/gameui/pk/pk_health_bar_bg.png"
        alt=""
        className="absolute inset-0 w-full h-full"
      />
      <img
        src="/gameui/pk/pk_health_bar_fill.png"
        alt=""
        className="absolute inset-0 h-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-pixel">{value}</span>
    </div>
  )
}

