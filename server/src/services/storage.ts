import { PrismaService } from './prisma'
import { PrismaClient } from '@prisma/client'
import { RobotData, ChatData, ElementData } from '@/types'

export class StorageService {
    private prisma: PrismaService

    constructor() {
        this.prisma = PrismaService.getInstance()
    }

    // Robot相关操作
    async getRobots(): Promise<RobotData[]> {
        return this.prisma.getClient().robot.findMany()
    }

    async saveRobot(robot: RobotData): Promise<void> {
        await this.prisma.getClient().robot.upsert({
            where: { id: robot.id },
            update: robot,
            create: robot
        })
    }

    async getRobot(id: string): Promise<RobotData | null> {
        return this.prisma.getClient().robot.findUnique({
            where: { id }
        })
    }

    // Chat相关操作
    async saveChat(chat: ChatData): Promise<void> {
        const { rewards, ...chatData } = chat
        
        await this.prisma.getClient().chat.create({
            data: {
                ...chatData,
                rewards: {
                    create: rewards?.map(reward => ({
                        ...reward,
                        robotId: reward.robotId || chatData.robotId
                    }))
                }
            }
        })
    }

    async getChatHistory(robotId: string, cursor?: string, limit: number = 20): Promise<ChatData[]> {
        return this.prisma.getClient().chat.findMany({
            where: { robotId },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { rewards: true }
        })
    }

    // 清空聊天记录
    async clearChatHistory(robotId: string): Promise<void> {
        const prismaClient = this.prisma.getClient();
        
        // 使用事务确保数据一致性
        await prismaClient.$transaction(async (tx) => {
            // 1. 先删除所有相关的奖励记录
            await tx.reward.deleteMany({
                where: {
                    chat: {
                        robotId: robotId
                    }
                }
            });
            
            // 2. 然后删除聊天记录
            await tx.chat.deleteMany({
                where: { robotId }
            });
        });
    }

    // Element相关操作
    async saveElement(element: ElementData): Promise<void> {
        await this.prisma.getClient().element.upsert({
            where: { id: element.id },
            update: element,
            create: element
        })
    }

    async getRobotElements(robotId: string): Promise<ElementData[]> {
        return this.prisma.getClient().element.findMany({
            where: { robotId }
        })
    }

    // 奖励相关操作
    async updateRewardStatus(rewardId: string, claimed: boolean): Promise<void> {
        await this.prisma.getClient().reward.update({
            where: { id: rewardId },
            data: { claimed }
        })
    }

    // 初始化测试数据
    async initTestData(): Promise<void> {
        // 创建测试机器人
        const robots: RobotData[] = [
            {
                id: 'robot-001',
                name: '小R',
                avatar: '🤖',
                personality: 85,
                description: '一个友好的助手机器人',
                status: 'online'
            },
            {
                id: 'robot-002',
                name: '大白',
                avatar: '🦾',
                personality: 92,
                description: '医疗护理机器人',
                status: 'online'
            },
            {
                id: 'robot-003',
                name: 'Wall-E',
                avatar: '🤖',
                personality: 78,
                description: '环保清理机器人',
                status: 'online'
            }
        ];

        // 创建测试零件
        const elements: ElementData[] = [
            {
                id: 'element-001',
                name: '高级处理器',
                description: '提升思考能力',
                attackMod: 10,
                defenseMod: 10,
                speedMod: 20,
                energyMod: 15,
                personalityMod: 25,
                robotId: 'robot-001'
            },
            {
                id: 'element-002',
                name: '情感模块',
                description: '增强情感交互',
                attackMod: 5,
                defenseMod: 5,
                speedMod: 10,
                energyMod: 10,
                personalityMod: 40,
                robotId: 'robot-001'
            },
            {
                id: 'element-003',
                name: '量子计算核心',
                description: '超强运算能力',
                attackMod: 30,
                defenseMod: 20,
                speedMod: 30,
                energyMod: 25,
                personalityMod: 15,
                robotId: 'robot-002'
            },
            {
                id: 'element-004',
                name: '太阳能电池',
                description: '持久续航',
                attackMod: 5,
                defenseMod: 15,
                speedMod: 10,
                energyMod: 40,
                personalityMod: 10,
                robotId: 'robot-003'
            },
            {
                id: 'element-005',
                name: '环保处理器',
                description: '垃圾分类能力',
                attackMod: 15,
                defenseMod: 10,
                speedMod: 15,
                energyMod: 20,
                personalityMod: 20,
                robotId: 'robot-003'
            }
        ];

        // 保存所有机器人数据
        for (const robot of robots) {
            await this.saveRobot(robot);
        }

        // 保存所有零件数据
        for (const element of elements) {
            await this.saveElement(element);
        }
    }

    // 事务处理
    async transaction<T>(fn: (prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>): Promise<T> {
        return this.prisma.getClient().$transaction(fn);
    }

    // 更新或创建机器人
    async upsertRobot(tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">, data: {
        id: string;
        name: string;
        avatar: string;
        personality: number;
    }) {
        return tx.robot.upsert({
            where: { id: data.id },
            update: {
                name: data.name,
                avatar: data.avatar,
                personality: data.personality,
            },
            create: {
                id: data.id,
                name: data.name,
                avatar: data.avatar,
                personality: data.personality,
            },
        });
    }

    // 更新或创建元素
    async upsertElement(tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">, data: {
        id: string;
        name: string;
        description: string;
        attackMod: number;
        defenseMod: number;
        speedMod: number;
        energyMod: number;
        personalityMod: number;
        robotId: string;
    }) {
        return tx.element.upsert({
            where: { id: data.id },
            update: {
                name: data.name,
                description: data.description,
                attackMod: data.attackMod,
                defenseMod: data.defenseMod,
                speedMod: data.speedMod,
                energyMod: data.energyMod,
                personalityMod: data.personalityMod,
                robotId: data.robotId,
            },
            create: {
                id: data.id,
                name: data.name,
                description: data.description,
                attackMod: data.attackMod,
                defenseMod: data.defenseMod,
                speedMod: data.speedMod,
                energyMod: data.energyMod,
                personalityMod: data.personalityMod,
                robotId: data.robotId,
            },
        });
    }
} 