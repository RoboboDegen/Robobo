import { AttributeBar } from "./attribute-bar";
import { HealthBar } from "./health-bar";
import { BattleRecords } from "./battle-records";
import { useEffect, useState, useMemo } from "react";
import { useGameData } from "@/context/GameDataProvider";
import Image from "next/image";

interface Attribute {
    name: string;
    value: number | string;
    color: string;
}

export function Fighting() {
    const { robot, enemy } = useGameData();

    const leftAttributes = useMemo(() => [
        { name: "Attack", value: robot?.attack || 0, color: "bg-red-500" },
        { name: "Energy", value: robot?.energy || 0, color: "bg-cyan-400" },
        { name: "Speed", value: robot?.speed || 0, color: "bg-yellow-400" },
        { name: "Personality", value: robot?.personality || 0, color: "bg-orange-400" }
    ], [robot]);

    const rightAttributes = useMemo(() => [
        { name: "Attack", value: enemy?.attack || 0, color: "bg-red-500" },
        { name: "Energy", value: enemy?.energy || 0, color: "bg-cyan-400" },
        { name: "Speed", value: enemy?.speed || 0, color: "bg-yellow-400" },
        { name: "Personality", value: enemy?.personality || 0, color: "bg-orange-400" }
    ], [enemy]);

    // 派生状态：通过 useMemo 来计算健康值
    const leftHealth = useMemo(() => robot?.energy || 0, [robot?.energy]);
    const rightHealth = useMemo(() => enemy?.energy || 0, [enemy?.energy]);

    return (
        <div className="flex flex-col items-start justify-between h-full pr-5">
            <div className="w-[280px] flex flex-col gap-4 pl-2">
                {/* Health Bars */}
                <div className="flex justify-between items-center">
                    <div className="w-20">
                        <HealthBar value={robot?.energy || 0} maxValue={leftHealth} />
                    </div>

                    <div className="pl-4">
                        <Image
                            src="/gameui/pk/pk_label.png"
                            alt="VS"
                            width={80}
                            height={80}
                        />
                    </div>

                    <div className="w-20">
                        <HealthBar value={enemy?.energy || 0} maxValue={rightHealth} />
                    </div>
                </div>

                {/* Battle Arena */}
                <div className="relative aspect-video bg-[#2a2a4e] rounded-lg border border-gray-700">
                    {/* Add your robot sprites here */}
                </div>
                {/* Stats - Made smaller */}
                <div className="flex justify-between gap-2">
                    <div className="">
                        {leftAttributes.map((attr) => (
                            <AttributeBar
                                key={attr.name}
                                name={attr.name}
                                value={attr.value}
                                color={attr.color}
                                width={130}
                                height={15}
                            />
                        ))}
                    </div>
                    <div className="">
                        {rightAttributes.map((attr) => (
                            <AttributeBar
                                key={attr.name}
                                name={attr.name}
                                value={attr.value}
                                color={attr.color}
                                width={130}
                                height={15}
                            />
                        ))}
                    </div>
                </div>

                {/* Battle Records */}
                <div className="flex">
                    <div
                    className="h-full p-3"
                    style={{
                    backgroundImage: `url(/gameui/pk/info_box_bg.png)`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    height: "260px",
                    width: "100%",
                    }}
                >
                    <BattleRecords />
                </div>
            </div>
            </div>
        </div>
    );
}
