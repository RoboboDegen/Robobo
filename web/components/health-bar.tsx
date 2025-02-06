import Image from "next/image";

interface HealthBarProps {
  value: number
  maxValue: number
}

export function HealthBar({ value, maxValue }: HealthBarProps) {
  return (
    <div className="relative w-32 h-4 -ml-4">
      <Image
        src="/gameui/pk/pk_health_bar_bg.png"
        alt=""
        className="absolute inset-0 w-full h-full"
        width={100}
        height={20}
      />
      <Image
        src="/gameui/pk/pk_health_bar_fill.png"

        alt=""
        className="absolute inset-0 h-full transition-all duration-300"
        style={{ width: `${value/maxValue*100}%` }}
        width={100}
        height={20}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-pixel">{value}</span>
    </div>

  )
}

