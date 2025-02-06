interface InfoBoxProps {
    selectedItem: Item | null; // 这里指定 selectedItem 的类型
  }
  interface Item {
    id: number
    name: string
    damage?: number
    icon?: string
    isEquipped?: boolean
    isRecyclable?: boolean
    size?: string
  }
export function InfoBox({ selectedItem }: InfoBoxProps) {
    return (
        <div className="w-[170px] h-[94px] bg-[url('/gameui/inventory/info_box.png')] bg-cover flex flex-col justify-center">
        <span className="text-white text-left text-[14px] mt-2 py-0.5 pl-6">
          {selectedItem?.name}
        </span>
        {selectedItem?.damage && (
          <span className="text-white text-left text-[14px] pl-6">
            Damage + {selectedItem.damage}
          </span>
        )}
      </div>
    )
}