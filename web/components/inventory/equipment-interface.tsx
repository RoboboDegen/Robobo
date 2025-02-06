"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Scrollbar } from "@/components/scrollbar"
import { RoButton } from "@/components/ro_button"
import { AttributeBar } from "@/components/attribute-bar"
import EquipedBar, { EquipedItemProps } from "./equipedBar"

interface Item {
  id: number
  name: string
  damage?: number
  icon?: string
  isEquipped?: boolean
  isRecyclable?: boolean
  size?: string
}


export default function EquipmentInterface() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  // 3x1 grid for equipped items
  const equippedItems: EquipedItemProps[] = [
    {
      id: "1",
      name: "Pistol",
      icon: "/gameui/inventory/test_gun.png",
    },

    {
      id: "2",
      name: "Shield",
      icon: "/gameui/inventory/test_gun.png",
    },


    {
      id: "3",
      name: "Laser",
      icon: "/gameui/inventory/test_gun.png",
    },
  ]


  // 3x4 grid for inventory items (12 slots total)
  const inventoryItems: Item[] = Array(12)
    .fill(null)
    .map((_, index) => {
      if (index < 5) {
        return {
          id: index + 4,
          name: index === 0 ? "Plasma Sword" : `Item ${index + 4}`,
          damage: index === 0 ? 150 : undefined,
          icon:
            index === 0
              ? "/gameui/inventory/test_gun.png"
              : undefined,
          size: index === 0 ? "51 x 53.43" : undefined,
        }
      }
      return { id: index + 4, name: `Empty Slot ${index + 4}` }
    })


  return (
    <div className="w-full h-full font-tiny5 flex flex-col items-center justify-between py-5">
      {/* Header */}
      <div className="flex items-center justify-start w-full">
        <RoButton variant="inventory_back">Back</RoButton>
      </div>
      {/* Body */}
      {/* Main Container with 3:2 ratio */}
      <div className="flex items-center justify-center w-full">
        {/* Equipment Section */}
        <div className="flex flex-col w-3/5 gap-y-3">
          <EquipedBar equippedItems={equippedItems} />
          <div className="flex-1 relative">
            <div
              className="h-[90%] p-3"
              style={{
                backgroundImage: `url(/gameui/inventory/inventory_section_bg.png)`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="grid grid-cols-3 gap-3 pr-3">
                {inventoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "w-14 h-14 relative cursor-pointer flex items-center justify-center",
                      selectedItem?.id === item.id && "border-2 border-yellow-400"
                    )}
                    style={{
                      backgroundImage: `url(/gameui/inventory/inventory_item_slot.png)`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat"
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.icon && (
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="p-1"
                      />
                    )}
                  </div>
                ))}
              </div>
              <Scrollbar className="absolute right-1 top-3 bottom-3" />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-2/5">
        <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 mb-1"
              style={{
                backgroundImage: `url(/gameui/inventory/character_frame.png)`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
              }}
            />
            <h2 className="text-sm text-[#ff3366] mb-2">Rename</h2>
          </div>

          {/* Attribute Bars */}
          <div className="space-y-3">
            <AttributeBar name="Attack" value={60} color="bg-red-500" width={120} height={20} />
            <AttributeBar name="Energy" value={65} color="bg-cyan-400" width={120} height={20} />
            <AttributeBar name="Speed" value={45} color="bg-yellow-400" width={120} height={20} />
            <AttributeBar name="Personality" value={85} color="bg-orange-400" width={120} height={20} />
          </div>
        </div>
        </div>
      </div>
  )
}

