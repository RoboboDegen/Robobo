export function BattleRecords() {
  const records = Array(6).fill("battle record 1234567890")

  return (
    <div className="relative">
      <img
        src="/gameui/pk/info_box_bg.png"
        alt=""
        className="w-full"
      />
      <div className="absolute inset-0 overflow-auto custom-scrollbar p-2">
        {records.map((record, index) => (
          <div key={index} className="flex items-center gap-2 text-cyan-400 text-sm mb-2">
            <img
              src="/gameui/pk/info_attack_icon.png"
              alt=""
              className="w-6 h-6"
            />
            <span className="font-tiny5">{record}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

