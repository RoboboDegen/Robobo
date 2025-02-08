"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameData } from "@/context/GameDataProvider";
import { RobotConfig } from "@/types";

interface BattleMockPageProps {
  attacker: RobotConfig;
  defender: RobotConfig;
}

interface RobotStats {
  attack: number;
  defense: number;
  speed: number;
  energy: number;
  personality: number;
}

export default function Battle({ attacker, defender }: BattleMockPageProps) {
  const [battleHashInput, setBattleHashInput] = useState<string>("");
  const [currentBattleHash, setCurrentBattleHash] = useState<number[]>([]);
  const { battleRecords, setBattleRecords } = useGameData();

  function generateRandomHash(): number[] {
    const newHash = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256)
    );
    setCurrentBattleHash(newHash);
    setBattleHashInput(newHash.join(","));
    return newHash;
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
    actor: RobotConfig,
    target: RobotConfig,
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
    if (newActorEnergy <= zeroPoint + 1) {
      if (actor.personality >= 178) {
        const damage =
          calculateDamage(actor.attack, 25, actor.personality, true) -
          zeroPoint;
        newTargetEnergy = Math.max(zeroPoint, target.energy - damage);
        logs.push(`${actorName} used Special Attack: -${damage} damage`);
      } else {
        const recovery = calculateDamage(
          actor.defense,
          20,
          actor.personality,
          false
        );
        newActorEnergy = Math.min(maxEnergy, newActorEnergy + recovery);
        logs.push(
          `${actorName} used Special Defense: +${recovery} energy, total energy: ${newActorEnergy}`
        );
      }
    } else {
      newActorEnergy = newActorEnergy - 1;
      logs.push(`${actorName} base energy cost: -1`);
      if (moveValue <= 3) {
        const damage =
          calculateDamage(actor.attack, 10, actor.personality, true) -
          zeroPoint;
        newTargetEnergy = Math.max(zeroPoint, target.energy - damage);
        logs.push(`${actorName} used Light Attack: -${damage} damage`);
      } else if (moveValue <= 6) {
        const damage =
          calculateDamage(actor.attack, 20, actor.personality, true) -
          zeroPoint;
        newTargetEnergy = Math.max(zeroPoint, target.energy - damage);
        logs.push(`${actorName} used Heavy Attack: -${damage} damage`);
      } else if (moveValue <= 8) {
        const recovery = calculateDamage(
          actor.defense,
          15,
          actor.personality,
          false
        );
        newActorEnergy = Math.min(maxEnergy, newActorEnergy + recovery);
        logs.push(
          `${actorName} used Defense: +${recovery} energy, total energy: ${newActorEnergy}`
        );
      } else {
        if (actor.personality >= 178) {
          const damage =
            calculateDamage(actor.attack, 25, actor.personality, true) -
            zeroPoint;
          newTargetEnergy = Math.max(zeroPoint, target.energy - damage);
          logs.push(`${actorName} used Special Attack: -${damage} damage`);
        } else {
          const recovery = calculateDamage(
            actor.defense,
            20,
            actor.personality,
            false
          );
          newActorEnergy = Math.min(maxEnergy, newActorEnergy + recovery);
          logs.push(
            `${actorName} used Special Defense: +${recovery} energy, total energy: ${newActorEnergy}`
          );
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
    const battleHash =
      currentBattleHash.length === 32
        ? currentBattleHash
        : generateRandomHash();
    const [attackerMoves, defenderMoves] = processHash(battleHash);
    let currentAttackerEnergy = attacker.energy;
    let currentDefenderEnergy = defender.energy;
    const logs: string[] = [];
    const ZERO_POINT = 128;

    let action_count = 0;
    let round = 0;

    while (true) {
      if (
        currentAttackerEnergy <= ZERO_POINT ||
        currentDefenderEnergy <= ZERO_POINT
      ) {
        break;
      }
      if (action_count === 16) {
        action_count = 0;
      }
      const attackerMove = attackerMoves[action_count];
      const defenderMove = defenderMoves[action_count];

      const attackerInitiative = calculateInitiative(
        attacker.speed,
        attackerMove
      );
      const defenderInitiative = calculateInitiative(
        defender.speed,
        defenderMove
      );

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

      logs.push(
        `Energy levels - Attacker: ${currentAttackerEnergy}, Defender: ${currentDefenderEnergy}`
      );
      action_count++;
      round++;
    }

    const winner =
      currentAttackerEnergy > currentDefenderEnergy ? "Attacker" : "Defender";
    logs.push(`Battle ended! ${winner} wins!`);
    logs.push(
      `Final energy - Attacker: ${currentAttackerEnergy}, Defender: ${currentDefenderEnergy}`
    );

    console.log("Before setting battle records:", logs);
    setBattleRecords(logs);
    console.log("Battle records after setting:", battleRecords);
  }

  return (
    <div className="container mx-auto p-4 space-y-6 font-tiny5 ">
      {/* 其他 UI 结构和元素保持不变 */}
      <Button onClick={simulateBattle} className="w-full">
        Fitghting
      </Button>
    </div>
  );
}
