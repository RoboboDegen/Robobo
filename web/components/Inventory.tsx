"use client"

import { useEffect, useState } from "react"
import { RoButton } from "@/components/ro_button"
import { AttributeBar } from "@/components/attribute-bar"
import EquipedBar, { type EquipedItemProps } from "./inventory/equipedBar"
import { InfoBox } from "./inventory/info_box"
import InventoryGrid from "./inventory/scrollbar"
import { useGameData } from "@/context/GameDataProvider"

interface Item {
  id: number
  name: string
  damage?: number
  icon?: string
  isEquipped?: boolean
  isRecyclable?: boolean
  size?: string
}

interface Attribute {
  name: string
  value: number | string
  color: string
}

export function Inventory({ handleInventoryBack }: { handleInventoryBack: () => void }) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const { robot } = useGameData()

  useEffect(() => {
    console.log(robot)
    const attributes: Attribute[] = []
    attributes.push({ name: "Attack", value: robot?.attack || 0, color: "bg-red-500" })
    attributes.push({ name: "Energy", value: robot?.energy || 0, color: "bg-cyan-400" })
    attributes.push({ name: "Speed", value: robot?.speed || 0, color: "bg-yellow-400" })
    attributes.push({ name: "Personality", value: robot?.personality || 0, color: "bg-orange-400" })
    setAttributes(attributes)
  }, [robot])

  const equippedItems: EquipedItemProps[] = [
    { id: "1", name: "Pistol", icon: "/gameui/inventory/test_gun.png" },
    { id: "2", name: "Shield", icon: "/gameui/inventory/test_gun.png" },
    { id: "3", name: "Laser", icon: "/gameui/inventory/test_gun.png" },
  ]

  const inventoryItems: Item[] = Array(51)
    .fill(null)
    .map((_, index) => {
      if (index < 5) {
        return {
          id: index + 4,
          name: index === 0 ? "Plasma Sword" : `Empty`,
          damage: index === 0 ? 150 : undefined,
          icon: index === 0 ? "/gameui/inventory/test_gun.png" : undefined,
          size: index === 0 ? "51 x 53.43" : undefined,
        }
      }
      return { id: index + 4, name: `Empty Slot ${index + 4}` }
    })

  return (
    <div className="">
      <div className="w-full h-full font-tiny5 flex flex-col items-center justify-between pl-5">
        {/* Header */}
        <div className="flex items-center justify-start w-full">
          <RoButton variant="inventory_back" onClick={handleInventoryBack}>Back</RoButton>
        </div>
        {/* Body */}
        {/* Main Container with 3:2 ratio */}
        <div className="flex items-start justify-between w-full">
          {/* Equipment Section */}
          <div className="flex flex-col w-7/12 gap-y-3 pr-2">
            <EquipedBar equippedItems={equippedItems} />

            <div className="flex-1 relative">
              <div
                className="h-full p-3"
                style={{
                  backgroundImage: `url(/gameui/inventory/inventory_section_bg.png)`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  height: "390px",
                }}
              >
                <InventoryGrid
                  inventoryItems={inventoryItems}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                />
                
                <div className="flex items-center ">
                  <InfoBox selectedItem={selectedItem} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-5/12 gap-y-3">
            <div className="flex flex-col justify-start items-center">
              <div
                className="w-24 h-24 mt-12"
                style={{
                  backgroundImage: `url(/gameui/inventory/character_frame.png)`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <h2 className="text-sm text-[#ff3366] mb-2">{robot?.name}</h2>
            </div>

            {/* Attribute Bars */}
            <div className="space-y-8">
              {attributes.map((attr, index) => (
                <AttributeBar
                  key={index}
                  name={attr.name}
                  value={attr.value}
                  color={attr.color}
                  width={120}
                  height={20}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

