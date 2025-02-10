import { HealthBar } from "./health-bar";
import { BattleRecords } from "./battle-records";
import { useEffect, useState } from "react";
import { useGameData } from "@/context/GameDataProvider";
import Image from "next/image";
import { usePopup } from "@/context/PopupProvider";
import { BattleRound, MirrorConfig, RobotConfig } from "@/types";
import AttributeBars from "./AttributeBars";
import { RobotEventTypes } from "@/game/core/event-types";
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
    const [currentRounds, setCurrentRounds] = useState<BattleRound[]>([]);
    const [currentAttackerEnergy, setCurrentAttackerEnergy] = useState<number>(0);
    const [currentDefenderEnergy, setCurrentDefenderEnergy] = useState<number>(0);

    useEffect(() => {
        if (battleRecords) {
            setAttacker(battleRecords.attacker);
            setDefender(battleRecords.defender);
            setCurrentAttackerEnergy(battleRecords.attacker.energy);
            setCurrentDefenderEnergy(battleRecords.defender.energy);
            
            const rounds = battleRecords.rounds;
            let currentIndex = 0;

            const interval = setInterval(() => {
                if (currentIndex >= rounds.length) {
                    clearInterval(interval);
                    setCurrentAttackerEnergy(battleRecords.attacker_final_energy - 128);
                    setCurrentDefenderEnergy(battleRecords.defender_final_energy - 128);
                    if(battleRecords.attacker_final_energy < battleRecords.defender_final_energy) {
                        triggerEvent('ROBOT', {
                            type: RobotEventTypes.lose,
                            robotId: battleRecords.attacker.id
                        });
                        triggerEvent('ROBOT', {
                            type: RobotEventTypes.win,
                            robotId: battleRecords.defender.id
                        });
                    }else{
                        triggerEvent('ROBOT', {
                            type: RobotEventTypes.win,
                            robotId: battleRecords.attacker.id
                        });
                        triggerEvent('ROBOT', {
                            type: RobotEventTypes.lose,
                            robotId: battleRecords.defender.id
                        });
                    } 

                    handleOnFinish();
                    return;
                }

                const round = rounds[currentIndex];
                setCurrentRounds(prev => [...prev, round]);

                if (round.id === battleRecords.attacker.id) {
                    setCurrentAttackerEnergy(prev => {
                        const afterBaseCost = Math.max(0, prev - 1); // 基础消耗
                        if ([1, 3, 4, 6].includes(round.action)) {
                            triggerEvent('ROBOT', {
                                type: RobotEventTypes.hit,
                                robotId: battleRecords.attacker.id
                            });
                            return afterBaseCost;
                        } else {
                            triggerEvent('ROBOT', {
                                type: RobotEventTypes.defence,
                                robotId: battleRecords.attacker.id
                            });
                            return Math.min(60, afterBaseCost + round.result);
                        }
                    });
                    
                    if ([1, 3, 4, 6].includes(round.action)) {
                        setCurrentDefenderEnergy(prev => Math.max(0, prev - round.result));
                        triggerEvent('ROBOT', {
                            type: RobotEventTypes.hit,
                            robotId: battleRecords.defender.id
                        });
                    }
                } else {
                    setCurrentDefenderEnergy(prev => {
                        const afterBaseCost = Math.max(0, prev - 1); // 基础消耗
                        if ([1, 3, 4, 6].includes(round.action)) {
                            triggerEvent('ROBOT', {
                                type: RobotEventTypes.hit,
                                robotId: battleRecords.defender.id
                            });
                            return afterBaseCost;
                        } else {
                            triggerEvent('ROBOT', {
                                type: RobotEventTypes.defence,
                                robotId: battleRecords.defender.id
                            });
                            return Math.min(60, afterBaseCost + round.result);
                        }
                    });
                    
                    if ([1, 3, 4, 6].includes(round.action)) {
                        setCurrentAttackerEnergy(prev => Math.max(0, prev - round.result));
                        triggerEvent('ROBOT', {
                            type: RobotEventTypes.hit,
                            robotId: battleRecords.attacker.id
                        });
                    }
                }

                currentIndex++;
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [userInfo, battleRecords, getBattleRecords]);

    const handleOnFinish = () => {
        showPopup("Battle End", handleBackMain, handleBackMain);
    }

    return (
        <div className="flex flex-col h-full items-center justify-between p-5 max-w-[360px]">

            {/* Health Bars */}
            <div className="flex justify-between items-center space-x-10">
                <div className="w-20">
                    <HealthBar value={currentAttackerEnergy} />
                </div>
                <Image
                    src="/gameui/pk/pk_label.png"
                    alt="VS"
                    width={80}
                    height={80}
                />

                <div className="w-20">
                    <HealthBar value={currentDefenderEnergy} />
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
                        <BattleRecords record={currentRounds} onFinish={handleOnFinish} />
                    </div>
                </div>

            </div>
        </div>
    );
}
