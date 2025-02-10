import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { GameService } from '@/services/game'
import { StorageService } from '@/services/storage'
import { ContractService } from '@/services/contract'
import { ChatService } from '@/services/chat'
import { ChatRequest, ChatResponse, ChatHistoryResponse, ChatServiceResponse } from '@/types'

const gameService = new GameService()
const storageService = new StorageService()
const contractService = ContractService.getInstance()
const chatService = ChatService.getInstance()

const app = new Elysia({ prefix: '/api', aot: false })
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Robobo API Documentation',
          version: '1.0.0'
        }
      }
    })
  )
  // 获取机器人列表
  .get('/game/robots', async () => {
    const robots = await storageService.getRobots()
    return {
      success: true,
      robots
    }
  })
  
  // 创建机器人
  .post('/game/robots', async ({ body }) => {
    const { name, description, avatar, personality } = body as {
      name: string
      description: string
      avatar: string
      personality: number
    }

    try {
      const robot = await contractService.createRobot(
        name,
        description,
        avatar,
        personality
      )
      return {
        success: true,
        robot
      }
    } catch (error) {
      console.error('创建机器人失败:', error)
      return {
        success: false,
        error: '创建机器人失败'
      }
    }
  }, {
    body: t.Object({
      name: t.String(),
      description: t.String(),
      avatar: t.String(),
      personality: t.Number()
    })
  })
  
  // 获取机器人零件
  .get('/game/robots/:robotId/elements', async ({ params }) => {
    const elements = await storageService.getRobotElements(params.robotId)
    return {
      success: true,
      elements
    }
  }, {
    params: t.Object({
      robotId: t.String()
    })
  })

  // 聊天接口
  .post('/game/chat', async ({ body }) => {
    const { robot_uid, message, filter_think = true } = body as ChatRequest
    const response = await gameService.chat(robot_uid, message, filter_think)
    const chatResponse: ChatResponse = {
      success: response.success,
      reply: response.reply,
      rewards: response.rewards?.map(r => ({
        type: r.type as 'token' | 'element',
        amount: r.type === 'token' ? (r.amount || undefined) : undefined,
        uid: r.type === 'element' ? (r.elementId || undefined) : undefined
      })),
      attribute_changes: response.personalityChange ? {
        personality: response.personalityChange
      } : undefined,
      signature_required: response.signatureRequired,
      signature_request: response.signatureRequest ? {
        sign_data: response.signatureRequest.signData,
        nonce: response.signatureRequest.nonce
      } : undefined
    }
    return chatResponse
  }, {
    body: t.Object({
      robot_uid: t.String(),
      message: t.String(),
      filter_think: t.Optional(t.Boolean())
    })
  })

  // 流式聊天接口
  .post('/game/chat/stream', async ({ body }) => {
    const { robot_uid, message, filter_think = true } = body as ChatRequest
    console.log(`[Stream Chat] 开始处理聊天请求 - robotId: ${robot_uid}`)
    
    // 创建一个 TransformStream 用于处理流式响应
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    
    // 创建编码器
    const encoder = new TextEncoder()

    // 异步处理聊天响应
    ;(async () => {
      type ChatRewards = NonNullable<ChatServiceResponse['rewards']>;
      
      let rewards: ChatRewards | null = null;
      let personalityChange: number | null = null;
      let reply: string = '';

      try {
        // 1. 获取机器人信息
        console.log(`[Stream Chat] 正在获取机器人信息 - robotId: ${robot_uid}`)
        const robot = await storageService.getRobot(robot_uid)
        if (!robot) {
          console.error(`[Stream Chat] 机器人不存在 - robotId: ${robot_uid}`)
          writer.write(encoder.encode('data: {"error": "机器人不存在"}\n\n'))
          writer.close()
          return
        }
        console.log(`[Stream Chat] 成功获取机器人信息:`, robot)

        // 2. 生成系统提示并获取回复
        console.log(`[Stream Chat] 正在生成系统提示`)
        const systemPrompt = await chatService.generateSystemPrompt(robot)
        console.log(`[Stream Chat] 系统提示生成完成，开始生成聊天回复`)
        
        try {
          reply = await chatService.generateChat(
            message,
            systemPrompt,
            (chunk) => {
              console.log(`[Stream Chat] 收到聊天流式响应:`, chunk)
              // 实时返回聊天内容
              const chatResponse: ChatResponse = {
                success: true,
                reply: chunk
              }
              writer.write(encoder.encode(`data: ${JSON.stringify(chatResponse)}\n\n`))
            },
            filter_think
          )
          console.log(`[Stream Chat] 聊天回复生成完成:`, reply)
        
          // 3. 评估奖励
          console.log(`[Stream Chat] 开始评估奖励`)
          try {
            console.log(`[Stream Chat] 调用评估奖励API - 输入:`, { message, reply })
            rewards = await chatService.evaluateRewards(message, reply)
            console.log(`[Stream Chat] 评估奖励API调用成功，原始响应:`, rewards)
            console.log(`[Stream Chat] 奖励评估结果:`, {
              tokens: rewards?.tokens,
              element: rewards?.element ? {
                id: rewards.element.id,
                name: rewards.element.name,
                mods: {
                  attack: rewards.element.attackMod,
                  defense: rewards.element.defenseMod,
                  speed: rewards.element.speedMod,
                  energy: rewards.element.energyMod,
                  personality: rewards.element.personalityMod
                }
              } : null
            })
            if (rewards.tokens || rewards.element) {
              // 返回奖励信息
              const rewardResponse: ChatResponse = {
                success: true,
                reply: '',
                rewards: [
                  ...(rewards.tokens ? [{
                    type: 'token' as const,
                    amount: rewards.tokens
                  }] : []),
                  ...(rewards.element ? [{
                    type: 'element' as const,
                    uid: rewards.element.id
                  }] : [])
                ]
              }
              console.log(`[Stream Chat] 发送奖励响应:`, rewardResponse)
              writer.write(encoder.encode(`data: ${JSON.stringify(rewardResponse)}\n\n`))
            }
          } catch (error) {
            console.error(`[Stream Chat] 评估奖励失败:`, error)
          }

          // 4. 评估性格变化
          console.log(`[Stream Chat] 开始评估性格变化`)
          try {
            console.log(`[Stream Chat] 调用性格评估API - 输入:`, { message, reply })
            personalityChange = await chatService.calculatePersonalityChange(message, reply)
            console.log(`[Stream Chat] 性格评估API调用成功，原始响应:`, personalityChange)
            console.log(`[Stream Chat] 性格变化评估结果: ${personalityChange || 0} 点`)
            if (personalityChange) {
              // 返回性格变化信息
              const personalityResponse: ChatResponse = {
                success: true,
                reply: '',
                attribute_changes: {
                  personality: personalityChange
                }
              }
              console.log(`[Stream Chat] 发送性格变化响应:`, personalityResponse)
              writer.write(encoder.encode(`data: ${JSON.stringify(personalityResponse)}\n\n`))
            }
          } catch (error) {
            console.error(`[Stream Chat] 评估性格变化失败:`, error)
          }

          // 5. 处理奖励
          if (rewards?.element) {
            console.log(`[Stream Chat] 开始处理元素奖励:`, rewards.element)
            try {
              await contractService.createElement(
                rewards.element.name,
                rewards.element.description || '',
                [
                  rewards.element.attackMod,
                  rewards.element.defenseMod,
                  rewards.element.speedMod,
                  rewards.element.energyMod,
                  rewards.element.personalityMod
                ],
                robot_uid
              )
              console.log(`[Stream Chat] 元素奖励处理完成`)
            } catch (error) {
              console.error(`[Stream Chat] 处理元素奖励失败:`, error)
            }
          }

          // 6. 保存聊天记录
          console.log(`[Stream Chat] 开始保存聊天记录`)
          try {
            await storageService.saveChat({
              id: `chat_${Date.now()}`,
              robotId: robot_uid,
              message,
              reply: reply,
              personalityChange,
              rewards: [
                ...(rewards?.tokens ? [{
                  id: `reward_${Date.now()}_token`,
                  type: 'token',
                  amount: rewards.tokens,
                  elementId: null,
                  claimed: false,
                  robotId: robot_uid
                }] : []),
                ...(rewards?.element ? [{
                  id: `reward_${Date.now()}_element`,
                  type: 'element',
                  amount: null,
                  elementId: rewards.element.id,
                  claimed: false,
                  robotId: robot_uid
                }] : [])
              ]
            })
            console.log(`[Stream Chat] 聊天记录保存完成`)
          } catch (error) {
            console.error(`[Stream Chat] 保存聊天记录失败:`, error)
          }
        } catch (error) {
          console.error(`[Stream Chat] 生成聊天回复失败:`, error)
          throw error
        }

      } catch (error) {
        console.error('[Stream Chat] 处理过程发生错误:', error)
        writer.write(encoder.encode(`data: ${JSON.stringify({
          success: false,
          error: String(error)
        })}\n\n`))
      } finally {
        console.log(`[Stream Chat] 结束处理 - robotId: ${robot_uid}`)
        writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  }, {
    body: t.Object({
      robot_uid: t.String(),
      message: t.String(),
      filter_think: t.Optional(t.Boolean())
    })
  })

  // 聊天历史记录接口
  .get('/game/chat/history', async ({ query }) => {
    const queryParams = query as { robot_uid: string, cursor?: string | null, limit?: number }
    const { robot_uid, cursor, limit = 20 } = queryParams
    const result = await gameService.getChatHistory(
      robot_uid, 
      cursor && cursor !== 'null' ? cursor : undefined,
      limit
    )
    const response: ChatHistoryResponse = {
      success: result.success,
      history: result.history.map(h => ({
        timestamp: h.timestamp || new Date().toISOString(),
        message: h.message,
        reply: h.reply,
        rewards: h.rewards?.map(r => ({
          type: r.type as 'token' | 'element',
          amount: r.type === 'token' ? (r.amount || undefined) : undefined,
          uid: r.type === 'element' ? (r.elementId || undefined) : undefined
        })),
        attribute_changes: h.personalityChange ? {
          personality: h.personalityChange
        } : undefined
      })),
      next_cursor: result.nextCursor
    }
    return response
  }, {
    query: t.Object({
      robot_uid: t.String(),
      cursor: t.Optional(t.Union([t.String(), t.Null()])),
      limit: t.Optional(t.Number())
    })
  })

  // 清空聊天记录接口
  .post('/game/chat/clear', async ({ body }) => {
    const { robot_uid } = body as { robot_uid: string }
    
    if (!robot_uid) {
      return {
        success: false,
        error: '缺少必要参数 robot_uid'
      }
    }

    try {
      await storageService.clearChatHistory(robot_uid)
      return {
        success: true
      }
    } catch (error) {
      console.error('清空聊天记录失败:', error)
      return {
        success: false,
        error: '清空聊天记录失败'
      }
    }
  }, {
    body: t.Object({
      robot_uid: t.String()
    })
  })

  // 初始化游戏数据
  .post('/game/init', async () => {
    try {
      await contractService.initTestData()
      return {
        success: true,
        message: '初始化成功'
      }
    } catch (error) {
      console.error('初始化数据失败:', error)
      return {
        success: false,
        message: '初始化失败',
        error: String(error)
      }
    }
  })
  .compile()

// 导出 Next.js 支持的标准 HTTP 方法
export const GET = app.handle
export const POST = app.handle
export const PUT = app.handle
export const PATCH = app.handle
export const DELETE = app.handle
export const HEAD = app.handle
export const OPTIONS = app.handle