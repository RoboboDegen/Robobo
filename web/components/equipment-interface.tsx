"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Scrollbar } from "@/components/scrollbar"
import { RoButton } from "@/components/ro_button"
import { AttributeBar } from "@/components/attribute-bar"

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
  const equippedItems: Item[] = [
    {
      id: 1,
      name: "Pistol",
      icon: "/gameui/inventory/test_gun.png",
      isRecyclable: false,
    },
    {
      id: 2,
      name: "Shield",
      icon: "/gameui/inventory/test_gun.png",
      isRecyclable: false,
    },
    {
      id: 3,
      name: "Laser",
      icon: "/gameui/inventory/test_gun.png",
      isRecyclable: false,
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
    <div className="w-full h-full p-2 font-pixel bg-[#1a1a2e]">
      {/* Header */}
      <div className="mb-2">
        <RoButton variant="inventory_back">Back</RoButton>
      </div>

      {/* Main Container with 3:2 ratio */}
      <div className="flex gap-2 h-[calc(100%-40px)]">
        {/* Left Column (Equipment + Inventory) - 3/5 width */}
        <div className="w-[60%] flex flex-col gap-2">
          {/* Equipped Section */}
          <div className="flex flex-col">
            <h2 className="text-[#ff3366] text-sm mb-1">Equipped</h2>
            <div 
              className="relative"
              style={{
                backgroundImage: `url(/gameui/inventory/equipped_section.png)`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                height: "120px",
                padding: "24px 12px 12px 12px"
              }}
            >
              <div className="flex justify-center items-center gap-4">
                {equippedItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "w-14 h-14 relative cursor-pointer flex items-center justify-center",
                      selectedItem?.id === item.id && "border-2 border-red-500"
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
            </div>
          </div>

          {/* Inventory Grid */}
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

        {/* Right Column - Character Stats - 2/5 width */}
        <div className="w-[40%] flex flex-col gap-2">
          {/* Character Portrait */}
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

      {/* Item Info Box */}
      {selectedItem && (
        <div
          className="absolute bottom-2 left-2 p-3 text-white"
          style={{
            backgroundImage: `url(/gameui/inventory/info_box.png)`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            minWidth: "180px"
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{selectedItem.name}</span>
            {selectedItem.damage && (
              <span className="text-xs text-[#ff3366]">Damage +{selectedItem.damage}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

