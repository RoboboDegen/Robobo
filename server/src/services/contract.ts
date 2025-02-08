import { StorageService } from './storage'
import { RobotData, ElementData } from '@/types'

export class ContractService {
    private storage: StorageService
    private static instance: ContractService

    private constructor() {
        this.storage = new StorageService()
    }

    public static getInstance(): ContractService {
        if (!ContractService.instance) {
            ContractService.instance = new ContractService()
        }
        return ContractService.instance
    }

    // ======== 管理员功能 (AdminCap) ========
    async createElement(
        name: string,
        description: string,
        abilities: number[],
        recipient: string
    ): Promise<void> {
        // Mock: game::create_element
        const element: ElementData = {
            id: `element_${Date.now()}`,
            name,
            description,
            attackMod: abilities[0],
            defenseMod: abilities[1],
            speedMod: abilities[2],
            energyMod: abilities[3],
            personalityMod: abilities[4],
            robotId: recipient  // 将 recipient 作为 robotId 使用
        }
        await this.storage.saveElement(element)
    }

    async mintAndTransferToken(
        amount: number,
        recipient: string
    ): Promise<void> {
        // Mock: game::admin_mint_and_transfer
        console.log(`[Mock Contract] Minting ${amount} tokens to ${recipient}`)
    }

    // ======== 链上数据查询 ========
    async getRobot(robotId: string): Promise<RobotData | null> {
        return this.storage.getRobot(robotId)
    }

    async getRobotElements(robotId: string): Promise<ElementData[]> {
        return this.storage.getRobotElements(robotId)
    }

    async getRobotStats(robotId: string): Promise<{
        attack: number
        defense: number
        speed: number
        energy: number
        personality: number
        winCount: number
        loseCount: number
    } | null> {
        // Mock: 查询机器人属性统计
        const robot = await this.storage.getRobot(robotId)
        if (!robot) return null

        const elements = await this.storage.getRobotElements(robotId)
        
        // 计算基础属性
        const baseStats = {
            attack: 128,
            defense: 128,
            speed: 128,
            energy: 128,
            personality: robot.personality,
            winCount: 0,
            loseCount: 0
        }

        // 计算元素加成
        elements.forEach(element => {
            baseStats.attack += element.attackMod - 128
            baseStats.defense += element.defenseMod - 128
            baseStats.speed += element.speedMod - 128
            baseStats.energy += element.energyMod - 128
        })

        return baseStats
    }

    // ======== 机器人创建 ========
    async createRobot(
        name: string,
        description: string,
        avatar: string,
        personality: number
    ): Promise<RobotData> {
        // Mock: game::create_robot
        const robot: RobotData = {
            id: `robot_${Date.now()}`,
            name,
            description,
            avatar,
            personality,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        }
        await this.storage.saveRobot(robot)
        return robot
    }

    // ======== 测试数据初始化 ========
    async initTestData(): Promise<void> {
        try {
            await this.storage.initTestData();
            console.log('[初始化] 测试数据初始化完成');
        } catch (error) {
            console.error('[初始化] 测试数据初始化失败:', error);
            throw error;
        }
    }
} 