import { AttributeBar } from "./attribute-bar"
import { HealthBar } from "./health-bar"
import { BattleRecords } from "./battle-records"
import { useEffect, useState } from "react"
import { useGameData } from "@/context/GameDataProvider";
import Image from "next/image";

interface Attribute {
    name: string;
    value: number | string;
    color: string;
}



export function Fighting() {
    const { robot, enemy } = useGameData();
    const [leftAttributes, setLeftAttributes] = useState<Attribute[]>([
        { name: "Attack", value: robot?.attack || 0, color: "bg-red-500" },
        { name: "Energy", value: robot?.energy || 0, color: "bg-cyan-400" },
        { name: "Speed", value: robot?.speed || 0, color: "bg-yellow-400" },
        { name: "Personality", value: robot?.personality || 0, color: "bg-orange-400" }
    ]);

    const [rightAttributes, setRightAttributes] = useState<Attribute[]>([
        { name: "Attack", value: robot?.attack || 0, color: "bg-red-500" },
        { name: "Energy", value: robot?.energy || 0, color: "bg-cyan-400" },
        { name: "Speed", value: robot?.speed || 0, color: "bg-yellow-400" },
        { name: "Personality", value: robot?.personality || 0, color: "bg-orange-400" }
    ]);
    const [leftHealth, setLeftHealth] = useState(robot?.energy || 0);
    const [rightHealth, setRightHealth] = useState(enemy?.energy || 0);


    useEffect(() => {
        setRightAttributes([
            { name: "Attack", value: enemy?.attack || 0, color: "bg-red-500" },
            { name: "Energy", value: enemy?.energy || 0, color: "bg-cyan-400" },
            { name: "Speed", value: enemy?.speed || 0, color: "bg-yellow-400" },
            { name: "Personality", value: enemy?.personality || 0, color: "bg-orange-400" }

        ]);

        setLeftAttributes([
            { name: "Attack", value: robot?.attack || 0, color: "bg-red-500" },
            { name: "Energy", value: robot?.energy || 0, color: "bg-cyan-400" },
            { name: "Speed", value: robot?.speed || 0, color: "bg-yellow-400" },
            { name: "Personality", value: robot?.personality || 0, color: "bg-orange-400" }
        ]);

    }, [robot, enemy]);

    useEffect(() => {
        setLeftHealth(robot?.energy || 0);
        setRightHealth(enemy?.energy || 0);
    }, []);





    return (
        <div className="flex flex-col items-start justify-between h-full pr-5">

            <div className="w-[280px] flex flex-col gap-4 pl-2">
                {/* Health Bars */}
                <div className="flex justify-between items-center">
                    <div className="w-20">
                        <HealthBar value={robot?.energy || 0} maxValue={leftHealth || 0} />

                    </div>
                    <Image
                        src="/gameui/pk/pk_label.png"
                        alt="VS"
                        width={100}
                        height={100}
                    />
                    <div className="w-20">
                        <HealthBar value={enemy?.energy || 0} maxValue={rightHealth || 0} />

                    </div>
                </div>
                {/* Battle Arena */}
                <div className="relative aspect-video bg-[#2a2a4e] rounded-lg border border-gray-700">
                    {/* Add your robot sprites here */}
                </div>

                {/* Stats - Made smaller */}
                <div className="flex justify-start gap-20">
                    <div className="w-16 scale-90 origin-left">
                        {leftAttributes.map((attr) => (
                            <AttributeBar
                                key={attr.name}
                                name={attr.name}
                                value={attr.value}
                                color={attr.color}
                                width={150}
                                height={15}
                            />
                        ))}
                    </div>
                    <div className="w-16 scale-90 origin-right">
                        {rightAttributes.map((attr) => (
                            <AttributeBar
                                key={attr.name}
                                name={attr.name}
                                value={attr.value}
                                color={attr.color}
                                width={150}
                                height={15}
                            />
                        ))}
                    </div>
                </div>

                {/* Battle Records */}
                <div>
                    <BattleRecords />
                </div>
            </div>
        </div>
    )
}

