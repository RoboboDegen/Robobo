import { Element } from "@/types";

export interface InfoBoxProps {
    selectedItem: Element | null;
}

export function InfoBox({ selectedItem }: InfoBoxProps) {
  return (

    <div className="w-[170px] h-[94px] bg-[url('/gameui/inventory/info_box.png')] bg-cover flex flex-col justify-center">
      <span className="text-white text-left text-[14px] mt-2 py-0.5 pl-6">
        {selectedItem?.name}
      </span>
      {selectedItem?.value && (
        <span className="text-white text-left text-[14px] pl-6">
          Damage + {selectedItem.value}
        </span>
      )}
    </div>
  )
}