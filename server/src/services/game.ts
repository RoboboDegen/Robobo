import { ContractService } from './contract'
import { StorageService } from './storage'
import { ChatService } from './chat'
import { ChatData, RewardData, GameChatResponse } from '@/types'

export class GameService {
    private contract: ContractService
    private storage: StorageService
    private chatService: ChatService

    constructor() {
        this.contract = ContractService.getInstance()
        this.storage = new StorageService()
        this.chatService = ChatService.getInstance()
    }

    // ======== 聊天相关 ========
    async chat(robotId: string, message: string): Promise<GameChatResponse> {
        try {
            // 1. 获取机器人信息
            const robot = await this.contract.getRobot(robotId)
            if (!robot) {
                return {
                    success: false,
                    reply: "机器人不存在"
                }
            }

            // 2. 使用ChatService生成回复
            const response = await this.chatService.generateResponse(robotId, message)

            // 3. 转换奖励格式
            const rewards: RewardData[] = []
            if (response.rewards?.tokens) {
                rewards.push({
                    id: `reward_${Date.now()}_token`,
                    type: 'token',
                    amount: response.rewards.tokens,
                    elementId: null,
                    claimed: false,
                    robotId
                })
            }
            if (response.rewards?.element) {
                rewards.push({
                    id: `reward_${Date.now()}_element`,
                    type: 'element',
                    amount: null,
                    elementId: response.rewards.element.id,
                    claimed: false,
                    robotId
                })
            }

            // 4. 保存聊天记录
            const chatData: ChatData = {
                id: `chat_${Date.now()}`,
                robotId,
                message,
                reply: response.text,
                personalityChange: response.personalityChange || null,
                rewards
            }
            await this.storage.saveChat(chatData)

            // 5. 返回结果
            return {
                success: true,
                reply: response.text,
                rewards,
                personalityChange: response.personalityChange,
                signatureRequired: rewards.length > 0,
                signatureRequest: rewards.length > 0 ? {
                    signData: "mock_sign_data",
                    nonce: "abcdef123456"
                } : undefined
            }
        } catch (error) {
            console.error('Chat failed:', error)
            return {
                success: false,
                reply: "对话生成失败，请稍后重试"
            }
        }
    }

    // ======== 聊天历史 ========
    async getChatHistory(robotId: string, cursor?: string, limit: number = 20) {
        const history = await this.storage.getChatHistory(robotId, cursor, limit)
        return {
            success: true,
            history: history.map(chat => ({
                timestamp: chat.createdAt?.toISOString(),
                message: chat.message,
                reply: chat.reply,
                rewards: chat.rewards,
                personalityChange: chat.personalityChange
            })),
            nextCursor: history.length === limit ? history[history.length - 1].id : null
        }
    }

    // ======== 奖励相关 ========
    async claimReward(rewardId: string): Promise<boolean> {
        try {
            await this.storage.updateRewardStatus(rewardId, true)
            return true
        } catch (error) {
            console.error('Claim reward failed:', error)
            return false
        }
    }

    // ======== 测试数据初始化 ========
    async initTestData(): Promise<void> {
        await this.contract.initTestData()
    }
} 