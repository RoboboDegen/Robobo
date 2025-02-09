"use client"

import { useState } from "react"
import { RoButton } from "@/components/ro_button"
import EquipedBar, { type EquipedItemProps } from "./inventory/equipedBar"
import { InfoBox } from "./inventory/info_box"
import InventoryGrid from "./inventory/scrollbar"
import { useGameData } from "@/context/GameDataProvider"

import { Element } from "@/types"
import AttributeBars from "./AttributeBars"

export function Inventory({ handleInventoryBack }: { handleInventoryBack: () => void }) {
    const [selectedItem, setSelectedItem] = useState<Element | null>(null)
    const { userInfo } = useGameData()

    const handleSelectItem = (item: EquipedItemProps) => {
        console.log(item)
    }


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
                    <span className="text-[24px]">Back</span>
                </RoButton>
            </div>
            <div className="w-full h-full self-end">
                {/* Body */}
                {/* Main Container with 3:2 ratio */}
                <div className="flex justify-between h-full space-x-5">
                    {/* Equipment Section */}
                    <div className="flex flex-col justify-between w-8/12 gap-y-3">
                        <EquipedBar equippedItems={equippedItems} onSelectItem={handleSelectItem} />

                        <div className="flex-1 relative self-end">
                            <div
                                className="h-full w-full"
                                style={{
                                    backgroundImage: `url(/gameui/inventory/inventory_section_bg.png)`,
                                    backgroundSize: "100% 100%",
                                    backgroundRepeat: "no-repeat",
                                }}

                            >
                                <div className="flex flex-col justify-between h-full p-5">
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
                            />
                            <h2 className="text-2xl font-bold text-[#ff3366] mb-2">{userInfo?.robot?.name}</h2>
                        </div>

                        {/* Attribute Bars */}
                        <div className="space-y-7">
                            <AttributeBars attack={userInfo?.robot?.attack || 0} energy={userInfo?.robot?.energy || 0} speed={userInfo?.robot?.speed || 0} personality={userInfo?.robot?.personality || 0} width={120}/>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}