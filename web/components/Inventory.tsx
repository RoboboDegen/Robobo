"use client"

import { useMemo, useState } from "react"
import { RoButton } from "@/components/ro_button"
import { AttributeBar } from "@/components/attribute-bar"
import EquipedBar, { type EquipedItemProps } from "./inventory/equipedBar"
import { InfoBox } from "./inventory/info_box"
import InventoryGrid from "./inventory/scrollbar"
import { useGameData } from "@/context/GameDataProvider"
import { Element } from "@/types"

export function Inventory({ handleInventoryBack }: { handleInventoryBack: () => void }) {
    const [selectedItem, setSelectedItem] = useState<Element | null>(null)
    const { userInfo } = useGameData()



    const attributes = useMemo(() => [
        { name: "Attack", value: userInfo?.robot?.attack || 0, color: "bg-red-500" },
        { name: "Energy", value: userInfo?.robot?.energy || 0, color: "bg-cyan-400" },

        { name: "Speed", value: userInfo?.robot?.speed || 0, color: "bg-yellow-400" },
        { name: "Personality", value: userInfo?.robot?.personality || 0, color: "bg-orange-400" }

    ], [userInfo]);

    const equippedItems: EquipedItemProps[] = [
        { id: "1", name: "Pistol", icon: "/gameui/inventory/test_gun.png" },
        { id: "2", name: "Shield", icon: "/gameui/inventory/test_gun.png" },
        { id: "3", name: "Laser", icon: "/gameui/inventory/test_gun.png" },
    ]

    return (
        <div className="w-full h-full font-tiny5 flex flex-col gap-y-10 items-center justify-between py-5 ">
            {/* Header */}
            <div className="flex items-center justify-start w-full">
                <RoButton variant="inventory_back" onClick={handleInventoryBack}>
                    <span className="translate-y-[-4.5px] text-[24px]">Back</span>
                </RoButton>
            </div>
            <div className="w-full h-full self-end">
                {/* Body */}
                {/* Main Container with 3:2 ratio */}
                <div className="flex justify-between h-full space-x-5">
                    {/* Equipment Section */}
                    <div className="flex flex-col justify-between w-8/12 gap-y-3">
                        <EquipedBar equippedItems={equippedItems} />

                        <div className="flex-1 relative self-end">
                            <div
                                className="h-full"
                                style={{
                                    backgroundImage: `url(/gameui/inventory/inventory_section_bg.png)`,
                                    backgroundSize: "100% 100%",
                                    backgroundRepeat: "no-repeat",
                                }}
                            >
                                <div className="flex flex-col justify-between h-full p-2">
                                    <InventoryGrid
                                        inventoryItems={userInfo?.ownedElement || []}
                                        selectedItem={selectedItem}
                                        setSelectedItem={setSelectedItem}
                                        className="flex-1"
                                    />
                                    <div className="self-end w-full py-2 px-1">
                                        <InfoBox selectedItem={selectedItem} />
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-4/12 gap-y-3">
                        <div className="flex flex-col justify-start items-center">
                            <div
                                className="w-32 h-32 mt-12"

                                style={{
                                    backgroundImage: `url(/gameui/inventory/character_frame.png)`,
                                    backgroundSize: "contain",
                                    backgroundRepeat: "no-repeat",
                                    height: "140px",
                                }}
                            />
                            <h2 className="text-lg text-[#ff3366] mb-2">{userInfo?.robot?.name}</h2>
                        </div>

                        {/* Attribute Bars */}
                        <div className="space-y-7">
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