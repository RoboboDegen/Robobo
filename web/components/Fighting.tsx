import { AttributeBar } from "./attribute-bar";
import { HealthBar } from "./health-bar";
import { BattleRecords } from "./battle-records";
import { useEffect, useState } from "react";
import { useGameData } from "@/context/GameDataProvider";
import Image from "next/image";
import { usePopup } from "@/context/PopupProvider";
import { MirrorConfig, RobotConfig } from "@/types";
import { mockMirrorConfig } from "@/mock";
import AttributeBars from "./AttributeBars";
import { SceneEventTypes } from "@/game/core/event-types";
import { triggerEvent } from "@/lib/utils";




export function Fighting({ handleBackMain }: { handleBackMain: () => void }) {
    const {
        userInfo,
        battleRecords,
        getBattleRecords,
    } = useGameData();


    const { showPopup } = usePopup();

    const [attacker, setAttacker] = useState<RobotConfig | null>(null);
    const [defender, setDefender] = useState<MirrorConfig | null>(null);
    const [attackerMaxEnergy, setAttackerMaxEnergy] = useState<number>(0);
    const [defenderMaxEnergy, setDefenderMaxEnergy] = useState<number>(0);



    useEffect(() => {
        if (battleRecords) {
            setAttacker(battleRecords.attacker);
            setDefender(battleRecords.defender);
            setAttackerMaxEnergy(battleRecords.attacker.energy);
            setDefenderMaxEnergy(battleRecords.defender.energy);
        }
        if (userInfo?.robot) {
            getBattleRecords(userInfo.robot, mockMirrorConfig);
        }
    }, [])


    const handleOnFinish = () => {
        // showPopup("战斗结束", () => {
        //     handleBackMain();
        // }, () => {
        //     handleBackMain();
        // });
    }


    return (
        <div className="flex flex-col h-full items-center justify-between p-5 max-w-[360px]">

            {/* Health Bars */}
            <div className="flex justify-between items-center space-x-10">
                <div className="w-20">
                    <HealthBar
                        value={attacker?.energy || 0}
                        maxValue={attackerMaxEnergy || 0}
                    />
                </div>

                <Image
                    src="/gameui/pk/pk_label.png"
                    alt="VS"
                    width={80}
                    height={80}
                />

                <div className="w-20">
                    <HealthBar value={defender?.energy || 0} maxValue={defenderMaxEnergy || 0} />
                </div>
            </div>

            <div className="flex flex-col items-center justify-between w-full">
                {/* Stats - Made smaller */}
                <div className="flex justify-between w-full">
                    <AttributeBars attack={attacker?.attack || 0} energy={attacker?.energy || 0} speed={attacker?.speed || 0} personality={attacker?.personality || 0} width={140} />
                    <AttributeBars attack={defender?.attack || 0} energy={defender?.energy || 0} speed={defender?.speed || 0} personality={defender?.personality || 0} width={140} />
                </div>

                {/* Battle Records */}
                <div className="flex">
                    <div
                        className="h-full p-3"
                        style={{
                            backgroundImage: `url(/gameui/pk/info_box_bg.png)`,
                            backgroundSize: "100% 100%",
                            backgroundRepeat: "no-repeat",
                            height: "225px",
                            width: "100%",
                        }}
                    >
                        <BattleRecords record={battleRecords?.rounds || []} onFinish={handleOnFinish} />




                    </div>
                </div>

            </div>
        </div>
    );
}
