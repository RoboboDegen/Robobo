import { Element } from "@/types";

export interface InfoBoxProps {
    selectedItem: Element | null;
}

export function InfoBox({ selectedItem }: InfoBoxProps) {
  return (

    <div className="w-full h-full bg-[url('/gameui/inventory/info_box.png')] bg-contain bg-no-repeat px-4 py-10 flex flex-col justify-start">
      <span className="text-white text-left text-[14px]">
        {selectedItem?.name ?? "no item"}
      </span>
        <span className="text-white text-left text-[14px]">
          Damage + {selectedItem?.value ?? 0}

        </span>
    </div>

  )
}