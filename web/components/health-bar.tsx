import Image from "next/image";

interface HealthBarProps {
  value: number;
}

export function HealthBar({ value }: HealthBarProps) {
  // 能量值范围是 0-60
  const calculatePercentage = (currentValue: number) => {
    const percentage = (currentValue / 60) * 100;
    return Math.round(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="relative w-32 h-4 -ml-4">
      <Image
        src="/gameui/pk/pk_health_bar_bg.png"
        alt="Health Bar Background"
        className="absolute inset-0 w-full h-full"
        width={100}
        height={20}
      />
      <Image
        src="/gameui/pk/pk_health_bar_fill.png"
        alt="Health Bar Fill"
        className="absolute inset-0 h-full transition-all duration-300"
        style={{ width: `${calculatePercentage(value)}%` }}
        width={100}
        height={20}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[18px] text-white font-pixel font-tiny5">
        {value}
      </span>
    </div>
  );
}

