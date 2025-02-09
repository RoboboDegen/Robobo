import { BattleRecord, BattleRound, MirrorConfig, RobotConfig } from "@/types";

interface BattleMockPageProps {
  attacker: RobotConfig;
  defender: MirrorConfig;
}


export default function CalculateBattleRecords({ attacker, defender }: BattleMockPageProps): BattleRecord {

  const result: BattleRecord = {
    attacker: attacker,
    defender: defender,
    result: "win",
    timestamp: new Date(),
    rounds: [],
    winner: "attacker",
    attacker_final_energy: 100,
    defender_final_energy: 100,
    reward: "100",
  } satisfies BattleRecord;

  const rounds: BattleRound[] = [];
  

  function generateRandomHash(): number[] {
    const newHash = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256)
    );
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


  /*
  processAction 函数用于处理每个回合的行动，并返回相关信息
  action 表示行动类型:
  1: 攻击
  2: 防御
  3: 轻攻击
  4: 重攻击
  5: 特殊攻击
  6: 特殊防御
  value 表示行动值
  actorEnergy 表示行动者的能量
  targetEnergy 表示目标的能量
  logs 表示行动日志
  */
  function processAction(
    actor: RobotConfig,
    target: RobotConfig,
    moveValue: number,
    isAttacker: boolean
  ): { actorEnergy: number; targetEnergy: number; logs: string[],action:number,value:number } {
    const actorName = isAttacker ? "Attacker" : "Defender";
    const zeroPoint = 128;
    const maxEnergy = 188;
    let action = 0;
    let value = 0;
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
        action = 1;
        value = damage;
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
        action = 2;
        value = recovery;
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
        action = 3;
        value = damage;
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
        action = 4;
        value = recovery;
      } else {
        if (actor.personality >= 178) {
          const damage =

            calculateDamage(actor.attack, 25, actor.personality, true) -
            zeroPoint;
          newTargetEnergy = Math.max(zeroPoint, target.energy - damage);
          logs.push(`${actorName} used Special Attack: -${damage} damage`);
          action = 5;
          value = damage;
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
          action = 6;
          value = recovery;
        }
      }
    }


    return {
      actorEnergy: newActorEnergy,
      targetEnergy: newTargetEnergy,
      logs: logs,
      action: action,
      value: value,
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

  function simulateBattle(): BattleRecord {
    const battleHash = generateRandomHash()
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

        rounds.push({
          id: attacker.id,
          name: attacker.name,
          action: attackerAction.action,
          result: attackerAction.value,
        });





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

        rounds.push({
          id: defender.id,
          name: defender.name,
          action: defenderAction.action,
          result: defenderAction.value,


        });
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

        rounds.push({
          id: defender.id,
          name: defender.name,
          action: defenderAction.action,
          result: defenderAction.value,


        });
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

        rounds.push({
          id: attacker.id,
          name: attacker.name,
          action: attackerAction.action,
          result: attackerAction.value,
        });


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

    result.attacker_final_energy = currentAttackerEnergy;
    result.defender_final_energy = currentDefenderEnergy;
    result.winner = 
    currentAttackerEnergy > currentDefenderEnergy ? attacker.id : defender.id;;
    result.rounds = rounds;
    result.result = currentAttackerEnergy > currentDefenderEnergy ? "win" : "lose";
    console.log("Battle records after setting:", result);
    const res_attacker = {
      ...attacker,
      energy: attacker.energy -128,
      attack: attacker.attack - 128,
      defense: attacker.defense - 128,
      speed: attacker.speed - 128,
      personality: attacker.personality - 128,

    }
    const res_defender = {
      ...defender,
      energy: defender.energy -128,
      attack: defender.attack - 128,
      defense: defender.defense - 128,
      speed: defender.speed - 128,
      personality: defender.personality - 128,

    }
    return {
      ...result,
      attacker: res_attacker,
      defender: res_defender,
    };

  }
  return simulateBattle();

}
