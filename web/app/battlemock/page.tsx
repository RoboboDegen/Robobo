"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { keccak256 } from "ethers";

interface RobotStats {
    attack: number;
    defense: number;
    speed: number;
    energy: number;
    personality: number;
}

export default function BattleMockPage() {
    const [attacker, setAttacker] = useState<RobotStats>({
        attack: 143,
        defense: 143,
        speed: 133,
        energy: 168,
        personality: 128,
    });

    const [defender, setDefender] = useState<RobotStats>({
        attack: 143,
        defense: 143,
        speed: 133,
        energy: 168,
        personality: 128,
    });

    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [attackerName, setAttackerName] = useState("");
    const [defenderName, setDefenderName] = useState("");
    const [battleHashInput, setBattleHashInput] = useState<string>("");
    const [currentBattleHash, setCurrentBattleHash] = useState<number[]>([]);

    function generateRandomHash(): number[] {
        const newHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));


        setCurrentBattleHash(newHash);
        setBattleHashInput(newHash.join(','));
        return newHash;
    }

    function handleHashInput(input: string) {
        setBattleHashInput(input);
        const hashArray = input.split(',').map(num => parseInt(num.trim()));
        if (hashArray.length === 32 && hashArray.every(num => !isNaN(num) && num >= 0 && num <= 255)) {
            setCurrentBattleHash(hashArray);
        }
    }

    function calculateDamage(
        baseStat: number,
        multiplier: number,
        personality: number,
        isAttack: boolean
    ): number {
        const personalityModifier = isAttack
            ? Math.floor((personality - 128) / 100) + 1
            : Math.floor((228 - personality) / 100) + 1;

        const safeStat = Math.min(153, baseStat);
        const safeMultiplier = Math.min(25, multiplier);

        const step1 = (safeStat - 128) * safeMultiplier;
        const step2 = step1 * personalityModifier;
        const finalValue = Math.floor(step2 / 100);

        if (isAttack) {
            const damage = Math.max(3, Math.min(12, finalValue));
            return 128 + damage;
        } else {
            return Math.max(3, Math.min(6, finalValue));
        }
    }

    function calculateInitiative(speed: number, moveValue: number): number {
        const moveBonus = moveValue * 10;
        return speed + moveBonus;
    }

    function processAction(
        actor: RobotStats,
        target: RobotStats,
        moveValue: number,
        isAttacker: boolean
    ): { actorEnergy: number; targetEnergy: number; logs: string[] } {
        const actorName = isAttacker ? "Attacker" : "Defender";
        const zeroPoint = 128;
        const maxEnergy = 188;
        let newActorEnergy = actor.energy;
        let newTargetEnergy = target.energy;
        const logs: string[] = [];

        logs.push(`${actorName} energy: ${newActorEnergy}`);
        if (newActorEnergy <= (zeroPoint + 1)) {
            if (actor.personality >= 178) {
                const damage = calculateDamage(actor.attack, 25, actor.personality, true) - zeroPoint;
                newTargetEnergy = Math.max(zeroPoint, target.energy - damage);
                logs.push(`${actorName} used Special Attack: -${damage} damage`);
            } else {
                const recovery = calculateDamage(actor.defense, 20, actor.personality, false);
                newActorEnergy = Math.min(maxEnergy, newActorEnergy + recovery);
                logs.push(`${actorName} used Special Defense: +${recovery} energy, total energy: ${newActorEnergy}`);
            }
        } else {
            newActorEnergy = newActorEnergy - 1;
            logs.push(`${actorName} base energy cost: -1`);
            if (moveValue <= 3) {
                const damage = calculateDamage(actor.attack, 10, actor.personality, true) - zeroPoint;
                newTargetEnergy = Math.max(zeroPoint, target.energy - damage);
                logs.push(`${actorName} used Light Attack: -${damage} damage`);
            } else if (moveValue <= 6) {
                const damage = calculateDamage(actor.attack, 20, actor.personality, true) - zeroPoint;
                newTargetEnergy = Math.max(zeroPoint, target.energy - damage);
                logs.push(`${actorName} used Heavy Attack: -${damage} damage`);
            } else if (moveValue <= 8) {
                const recovery = calculateDamage(actor.defense, 15, actor.personality, false);
                newActorEnergy = Math.min(maxEnergy, newActorEnergy + recovery);
                logs.push(`${actorName} used Defense: +${recovery} energy, total energy: ${newActorEnergy}`);
            } else {
                if (actor.personality >= 178) {
                    const damage = calculateDamage(actor.attack, 25, actor.personality, true) - zeroPoint;
                    newTargetEnergy = Math.max(zeroPoint, target.energy - damage);
                    logs.push(`${actorName} used Special Attack: -${damage} damage`);
                } else {
                    const recovery = calculateDamage(actor.defense, 20, actor.personality, false);
                    newActorEnergy = Math.min(maxEnergy, newActorEnergy + recovery);
                    logs.push(`${actorName} used Special Defense: +${recovery} energy, total energy: ${newActorEnergy}`);
                }
            }
        }

        return {
            actorEnergy: newActorEnergy,
            targetEnergy: newTargetEnergy,
            logs: logs,
        };
    }

    function processHash(hash: number[]): [number[], number[]] {
        const attackerMoves: number[] = [];
        const defenderMoves: number[] = [];
        let attackerDefenseCount = 0;
        let defenderDefenseCount = 0;

        // 处理攻击者的行动
        for (let i = 0; i < 16; i++) {
            let num = hash[i] % 10;
            if (num >= 7 && num <= 8) {
                attackerDefenseCount++;
                if (attackerDefenseCount > 3) {
                    num = num % 4; // 转换为轻攻击(0-3)
                }
            }
            attackerMoves.push(num);
        }

        // 处理防守者的行动
        for (let i = 16; i < 32; i++) {
            let num = hash[i] % 10;
            if (num >= 7 && num <= 8) {
                defenderDefenseCount++;
                if (defenderDefenseCount > 3) {
                    num = num % 4; // 转换为轻攻击(0-3)
                }
            }
            defenderMoves.push(num);
        }

        return [attackerMoves, defenderMoves];
    }

    function simulateBattle() {
        const battleHash = currentBattleHash.length === 32 ? currentBattleHash : generateRandomHash();
        const [attackerMoves, defenderMoves] = processHash(battleHash);
        let currentAttackerEnergy = attacker.energy;
        let currentDefenderEnergy = defender.energy;
        const logs: string[] = [];
        const ZERO_POINT = 128;

        let action_count = 0;
        let round = 0;
        while (true) {
            if (currentAttackerEnergy <= ZERO_POINT || currentDefenderEnergy <= ZERO_POINT) {
                break;
            };
            if (action_count === 16) {
                action_count = 0;
            };
            const attackerMove = attackerMoves[action_count];
            const defenderMove = defenderMoves[action_count];

            const attackerInitiative = calculateInitiative(attacker.speed, attackerMove);
            const defenderInitiative = calculateInitiative(defender.speed, defenderMove);

            logs.push(`Round ${round + 1}:`);

            if (attackerInitiative >= defenderInitiative) {
                const attackerAction = processAction(
                    { ...attacker, energy: currentAttackerEnergy },
                    { ...defender, energy: currentDefenderEnergy },
                    attackerMove,
                    true
                );
                logs.push(...attackerAction.logs);

                currentAttackerEnergy = attackerAction.actorEnergy;
                currentDefenderEnergy = attackerAction.targetEnergy;

                if (currentDefenderEnergy <= ZERO_POINT) {
                    currentDefenderEnergy = ZERO_POINT;
                    logs.push(`Defender energy depleted!`);
                    break;
                }

                const defenderAction = processAction(
                    { ...defender, energy: currentDefenderEnergy },
                    { ...attacker, energy: currentAttackerEnergy },
                    defenderMove,
                    false
                );
                logs.push(...defenderAction.logs);

                currentDefenderEnergy = defenderAction.actorEnergy;
                currentAttackerEnergy = defenderAction.targetEnergy;
                if (currentAttackerEnergy <= ZERO_POINT) {
                    currentAttackerEnergy = ZERO_POINT;
                    logs.push(`Attacker energy depleted!`);
                    break;
                }
            } else {
                const defenderAction = processAction(
                    { ...defender, energy: currentDefenderEnergy },
                    { ...attacker, energy: currentAttackerEnergy },
                    defenderMove,
                    false
                );
                logs.push(...defenderAction.logs);

                currentDefenderEnergy = defenderAction.actorEnergy;
                currentAttackerEnergy = defenderAction.targetEnergy;
                if (currentAttackerEnergy <= ZERO_POINT) {
                    currentAttackerEnergy = ZERO_POINT;
                    logs.push(`Attacker energy depleted!`);
                    break;
                }

                const attackerAction = processAction(
                    { ...attacker, energy: currentAttackerEnergy },
                    { ...defender, energy: currentDefenderEnergy },
                    attackerMove,
                    true
                );
                logs.push(...attackerAction.logs);

                currentAttackerEnergy = attackerAction.actorEnergy;
                currentDefenderEnergy = attackerAction.targetEnergy;
                if (currentDefenderEnergy <= ZERO_POINT) {
                    currentDefenderEnergy = ZERO_POINT;
                    logs.push(`Defender energy depleted!`);
                    break;
                }
            }

            logs.push(`Energy levels - Attacker: ${currentAttackerEnergy}, Defender: ${currentDefenderEnergy}`);
            logs.push("---");
            action_count++;
            round++;
        }

        const winner = currentAttackerEnergy > currentDefenderEnergy ? "Attacker" : "Defender";
        logs.push(`Battle ended! ${winner} wins!`);
        logs.push(`Final energy - Attacker: ${currentAttackerEnergy}, Defender: ${currentDefenderEnergy}`);

        setBattleLog(logs);
    }

    function stringToBytes(str: string): number[] {
        const hash = keccak256(Buffer.from(str));
        const bytes = Array.from(Buffer.from(hash.slice(2), 'hex'));
        return bytes;
    }

    function calculateRobotStatsFromHash(nameHash: number[]): RobotStats {
        const zeroPoint = 128;

        const energyMin = 40;
        const energyRange = 20;
        const attackMin = 15;
        const attackRange = 10;
        const defenseMin = 15;
        const defenseRange = 10;
        const speedMin = 5;
        const speedRange = 5;

        const attack = zeroPoint + attackMin +
            Math.floor(((nameHash[1] + nameHash[9] + nameHash[17] + nameHash[25]) * attackRange) / (255 * 4));

        const defense = zeroPoint + defenseMin +
            Math.floor(((nameHash[2] + nameHash[10] + nameHash[18] + nameHash[26]) * defenseRange) / (255 * 4));

        const speed = zeroPoint + speedMin +
            Math.floor(((nameHash[3] + nameHash[11] + nameHash[19] + nameHash[27]) * speedRange) / (255 * 4));

        const energy = zeroPoint + energyMin +
            Math.floor(((nameHash[0] + nameHash[8] + nameHash[16] + nameHash[24]) * energyRange) / (255 * 4));

        const personality = zeroPoint +
            Math.floor(((nameHash[4] + nameHash[12] + nameHash[20] + nameHash[28]) * 100) / (255 * 4));

        return {
            attack: Math.min(153, Math.max(143, attack)),
            defense: Math.min(153, Math.max(143, defense)),
            speed: Math.min(138, Math.max(133, speed)),
            energy: Math.min(188, Math.max(168, energy)),
            personality: Math.min(228, Math.max(128, personality)),
        };
    }

    function generateStatsFromName(name: string, isAttacker: boolean) {
        if (!name.trim()) return;

        const nameHash = stringToBytes(name);
        const stats = calculateRobotStatsFromHash(nameHash);

        if (isAttacker) {
            setAttacker(stats);
        } else {
            setDefender(stats);
        }
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold mb-4">Battle Simulator</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Attacker</h2>
                    <div className="space-y-4">
                        <div>
                            <Label>Robot Name</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={attackerName}
                                    onChange={(e) => setAttackerName(e.target.value)}
                                    placeholder="Enter robot name"
                                />
                                <Button
                                    onClick={() => generateStatsFromName(attackerName, true)}
                                    className="whitespace-nowrap"
                                >
                                    Generate Stats
                                </Button>
                            </div>
                        </div>
                        {Object.entries(attacker).map(([key, value]) => (
                            <div key={key}>
                                <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                                <Input
                                    type="number"
                                    value={value}
                                    onChange={(e) =>
                                        setAttacker({ ...attacker, [key]: parseInt(e.target.value) })
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Defender</h2>
                    <div className="space-y-4">
                        <div>
                            <Label>Robot Name</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={defenderName}
                                    onChange={(e) => setDefenderName(e.target.value)}
                                    placeholder="Enter robot name"
                                />
                                <Button
                                    onClick={() => generateStatsFromName(defenderName, false)}
                                    className="whitespace-nowrap"
                                >
                                    Generate Stats
                                </Button>
                            </div>
                        </div>
                        {Object.entries(defender).map(([key, value]) => (
                            <div key={key}>
                                <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                                <Input
                                    type="number"
                                    value={value}
                                    onChange={(e) =>
                                        setDefender({ ...defender, [key]: parseInt(e.target.value) })
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Battle Hash</h2>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={battleHashInput}
                            onChange={(e) => handleHashInput(e.target.value)}
                            placeholder="Enter 32 comma-separated numbers (0-255)"
                            className="flex-1"
                        />
                        <Button
                            onClick={generateRandomHash}
                            className="whitespace-nowrap"
                        >
                            Generate Random Hash
                        </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                        Current Hash: {currentBattleHash.length === 32 ? "Valid" : "Invalid"}
                        ({currentBattleHash.length} bytes)
                    </div>
                </div>
            </Card>

            <Button onClick={simulateBattle} className="w-full">
                Simulate Battle
            </Button>

            <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Battle Log</h2>
                <div className="space-y-2 h-96 overflow-y-auto">
                    {battleLog.map((log, index) => (
                        <p key={index} className="font-mono">
                            {log}
                        </p>
                    ))}
                </div>
            </Card>
        </div>
    );
}