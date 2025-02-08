import { AttributeBar } from "./attribute-bar";
import { HealthBar } from "./health-bar";
import { BattleRecords } from "./battle-records";
import { useEffect, useMemo, useRef } from "react";
import { useGameData } from "@/context/GameDataProvider";
import Image from "next/image";
import { usePopup } from "@/context/PopupProvider";
import Battle from "./battleRecords";

export function Fighting({ handleBackMain }: { handleBackMain: () => void }) {
    const {
        userInfo,
        enemy,
        getEnemyFromMirrorPool,
        battleRecords,
        updateRobotEnergies
    } = useGameData();
    const { showPopup } = usePopup();


    // 派生状态：记录初始能量值作为最大生命值
    const leftHealth = useMemo(
        () => userInfo?.robot?.energy || 256,  // 使用初始能量或默认值
        []  // 空依赖数组，只在组件挂载时计算一次
    );

    const rightHealth = useMemo(
        () => enemy?.energy || 256,  // 使用敌人的初始能量
        []  // 当敌人对象首次加载时更新，而不是跟踪 energy 的变化
    );

    // 监听战斗记录变化并更新能量值
    useEffect(() => {
        if (battleRecords.length > 0) {
            const lastRecord = battleRecords[battleRecords.length - 1];
            if (lastRecord.includes("Final energy")) {
                const match = lastRecord.match(/Attacker: (\d+), Defender: (\d+)/);
                if (match) {
                    const attackerEnergy = parseInt(match[1]);
                    const defenderEnergy = parseInt(match[2]);
                    console.log('==== Battle Update ====');
                    console.log('Before update:', {
                        attacker: {
                            currentEnergy: userInfo?.robot?.energy,
                            maxEnergy: leftHealth
                        },
                        defender: {
                            currentEnergy: enemy?.energy,
                            maxEnergy: rightHealth
                        }
                    });
                    console.log('New values:', {
                        attackerEnergy,
                        defenderEnergy
                    });
                    if (userInfo?.robot?.energy !== attackerEnergy || enemy?.energy !== defenderEnergy) {
                        updateRobotEnergies(attackerEnergy, defenderEnergy);
                    }
                }
            }
        }
    }, [battleRecords]);

    // 在组件挂载时输出初始状态
    useEffect(() => {
        console.log('==== Initial Fighting State ====');
        console.log('User Robot:', {
            currentEnergy: userInfo?.robot?.energy,
            maxEnergy: leftHealth
        });
        console.log('Enemy Robot:', {
            currentEnergy: enemy?.energy,
            maxEnergy: rightHealth
        });
    }, []); // 只在组件挂载时运行

    // 监听能量值变化
    useEffect(() => {
        console.log('==== Energy Update ====');
        console.log('Current State:', {
            userRobot: {
                currentEnergy: userInfo?.robot?.energy,
                maxEnergy: leftHealth
            },
            enemy: {
                currentEnergy: enemy?.energy,
                maxEnergy: rightHealth
            }
        });
    }, [userInfo?.robot?.energy, enemy?.energy]);

    // 检查战斗结果并显示弹窗
    useEffect(() => {
        const attackerEnergy = userInfo?.robot?.energy;
        const defenderEnergy = enemy?.energy;

        if (attackerEnergy === 128 && !showPopupCalled.current) {
            showPopupCalled.current = true;
            showPopup("Oh no! You lost the battle!", () => {
                showPopupCalled.current = false;
                handleBackMain();
            });
        } else if (defenderEnergy === 128 && !showPopupCalled.current) {
            showPopupCalled.current = true;
            showPopup("恭喜! You won the battle!", () => {
                showPopupCalled.current = false;
                handleBackMain();
            });
        }
    }, [userInfo?.robot?.energy, enemy?.energy, handleBackMain, showPopup]); // 添加必要的依赖

    // 添加一个 ref 来追踪弹窗是否已经显示
    const showPopupCalled = useRef(false);

    useEffect(() => {
        // 调用获取敌人数据的方法
        getEnemyFromMirrorPool("0x1234567890123456789012345678901234567890");
    }, []);  // 移除不必要的依赖

    const leftAttributes = useMemo(
        () => [
            {
                name: "Attack",
                value: userInfo?.robot?.attack || 0,
                color: "bg-red-500",
            },
            {
                name: "Energy",
                value: userInfo?.robot?.energy || 0,
                color: "bg-cyan-400",
            },

            {
                name: "Speed",
                value: userInfo?.robot?.speed || 0,
                color: "bg-yellow-400",
            },
            {
                name: "Personality",
                value: userInfo?.robot?.personality || 0,
                color: "bg-orange-400",
            },
        ],
        [userInfo]
    );

    const rightAttributes = useMemo(
        () => [
            { name: "Attack", value: enemy?.attack || 0, color: "bg-red-500" },

            { name: "Energy", value: enemy?.energy || 0, color: "bg-cyan-400" },
            { name: "Speed", value: enemy?.speed || 0, color: "bg-yellow-400" },
            {
                name: "Personality",
                value: enemy?.personality || 0,
                color: "bg-orange-400",
            },
        ],
        [enemy]
    );

    return (
        <div className="flex flex-col h-full items-center justify-between p-5">
            {/* Health Bars */}
            <div className="flex justify-between items-center space-x-10">
                <div className="w-20">
                    <HealthBar
                        value={userInfo?.robot?.energy || 0}
                        maxValue={leftHealth}
                    />
                </div>
                <Image
                    src="/gameui/pk/pk_label.png"
                    alt="VS"
                    width={80}
                    height={80}
                />

                <div className="w-20">
                    <HealthBar value={enemy?.energy || 0} maxValue={rightHealth} />
                </div>
            </div>



            <div>
                {/* Stats - Made smaller */}
                <div className="flex justify-between gap-8">
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
                            height: "225px",
                            width: "100%",
                        }}
                    >
                        <BattleRecords />

                        {userInfo?.robot && enemy ? (
                            <Battle attacker={userInfo.robot} defender={enemy} />
                        ) : (
                            <div>Loading...</div>
                        )}


                    </div>
                </div>

            </div>
        </div>
    );
}
