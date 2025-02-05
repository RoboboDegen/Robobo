interface ResponsiveContainerProps {
  children: React.ReactNode;
}

export function ResponsiveContainer({ children }: ResponsiveContainerProps) {
  return (
    <div className="relative w-full h-dvh bg-white">
      <div className="relative w-full h-full max-w-[720px] max-h-[calc(100dvh-2rem)]">
        <div 
          className="absolute inset-0"

          style={{ 
            maxHeight: 'min(calc(100vw * 1.88235294118), calc(100dvh - 2rem))',
            margin: 'auto'
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 overflow-hidden rounded-none">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 