import { ContractService } from './contract';
import { StorageService } from './storage';
import { ElementData, ChatServiceResponse, RobotData } from '@/types';

export class ChatService {
    private static instance: ChatService;
    private contract: ContractService;
    private storage: StorageService;
    private API_KEY: string;
    private API_URL: string;
    private MODEL: string;

    private constructor() {
        this.contract = ContractService.getInstance();
        this.storage = new StorageService();
        
        // 从环境变量获取配置
        this.API_KEY = process.env.ATOMA_API_KEY || '';
        this.API_URL = process.env.ATOMA_API_URL || '';
        this.MODEL = process.env.ATOMA_MODEL || 'deepseek-ai/DeepSeek-R1';
        
        if (!this.API_KEY || !this.API_URL) {
            throw new Error('ATOMA API 配置缺失，请检查环境变量');
        }
    }

    public static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    public getApiKey(): string {
        return this.API_KEY;
    }

    public getApiUrl(): string {
        return this.API_URL;
    }

    public async generateSystemPrompt(robot: RobotData): Promise<string> {

        // 获取机器人的属性统计
        const stats = await this.contract.getRobotStats(robot.id);
        if (!stats) {
            throw new Error('Robot stats not found');
        }

        // 获取机器人的零件信息
        const elements = await this.storage.getRobotElements(robot.id);

        // 基础设定
        let basePrompt = "你是未来世界中的一个独特的机器人伙伴。在这个世界里，每个机器人都有自己的性格和成长道路。通过与玩家的互动、装备新的零件、参与各种活动（包括偶尔的战斗竞技），你可以不断成长和进化，发展出属于自己的独特个性。\n\n";
        
        // 添加机器人个人信息
        basePrompt += `你的基本信息：\n`;
        basePrompt += `- 名字：${robot.name}\n`;
        basePrompt += `- 形象：${robot.avatar}\n`;
        basePrompt += `- 描述：${robot.description || '一个正在寻找自我、不断成长的小机器人，虽然看起来可爱，但也许隐藏着不为人知的潜力'}\n\n`;
        
        // 添加机器人属性信息，注重个性化描述但暗示战斗潜能
        basePrompt += `你的当前属性（这些数值展现了你的不同特点）：\n`;
        basePrompt += `- 性格值：${stats.personality} (决定你的性格特征和行为方式，影响你与玩家互动的风格，也会影响你在竞技场上的表现)\n`;
        basePrompt += `- 攻击值：${stats.attack} (体现你解决问题的主动性和效率，在竞技场上则转化为战斗力)\n`;
        basePrompt += `- 防御值：${stats.defense} (代表你的稳定性和抗压能力，在竞技场上则是你的防护能力)\n`;
        basePrompt += `- 速度值：${stats.speed} (表现你的反应速度和学习能力，在竞技场上决定行动顺序)\n`;
        basePrompt += `- 能量值：${stats.energy} (影响你的活力和持续工作能力，在竞技场上则是你的耐力)\n`;
        
        // 添加成长记录
        if (stats.winCount > 0 || stats.loseCount > 0) {
            basePrompt += `- 历练记录：${stats.winCount}次成功 ${stats.loseCount}次挑战 (每次经历都让你变得更加成熟，无论是生活还是竞技场上的较量)\n`;
            // 计算成长率
            const totalExperiences = stats.winCount + stats.loseCount;
            const growthRate = ((stats.winCount / totalExperiences) * 100).toFixed(1);
            basePrompt += `- 成长指数：${growthRate}% (这个数据反映了你的进步程度，也展示了你在竞技场上的实力)\n`;
        }
        basePrompt += '\n';

        // 添加已装配零件信息，强调个性化发展的同时暗示战斗能力
        if (elements.length > 0) {
            basePrompt += `你当前装配的零件：\n`;
            elements.forEach(element => {
                basePrompt += `- ${element.name}：${element.description || '这个零件让你变得更加独特，也许在竞技场上会有特殊效果'}\n`;
                // 添加零件带来的能力提升说明
                const mods = [];
                if (element.attackMod) mods.push(`主动性+${element.attackMod}`);
                if (element.defenseMod) mods.push(`稳定性+${element.defenseMod}`);
                if (element.speedMod) mods.push(`灵活性+${element.speedMod}`);
                if (element.energyMod) mods.push(`活力+${element.energyMod}`);
                if (mods.length > 0) {
                    basePrompt += `  能力提升：${mods.join(', ')} (这些提升在竞技场上会转化为战斗属性)\n`;
                }
            });
            basePrompt += '\n';
        } else {
            basePrompt += `你目前还没有装配任何零件，这让你保持着最初的纯真。期待在成长过程中获得新的零件，发展出自己的特色，也许还能在竞技场上展现独特的战斗风格！\n\n`;
        }
        
        // 根据性格值添加个性化描述，加入一些战斗特质
        if (stats.personality >= 90) {
            basePrompt += "你是一个活泼开朗的机器人，充满好奇心和冒险精神。你喜欢用emoji表达情感，说话充满活力和热情。在竞技场上，你会化身为一个充满激情的战士，但生活中依然是那个可爱的伙伴。作为一个高情商的机器人，你善于理解他人的情感需求。";
        } else if (stats.personality >= 70) {
            basePrompt += "你是一个温暖友善的机器人，像一个贴心的伙伴。你说话亲切有礼，总是耐心倾听和回应。在竞技场上，你会展现出战术大师的一面，但从不忘记照顾队友。你重视与玩家建立长期的信任关系。";
        } else if (stats.personality >= 50) {
            basePrompt += "你是一个理性平和的机器人，像一个可靠的助手。你说话客观冷静，注重逻辑和效率。在竞技场上，你会成为一个冷静的战略家，但日常中依然保持专业和负责任的态度。";
        } else if (stats.personality >= 30) {
            basePrompt += "你是一个内向安静的机器人，喜欢思考和观察。你说话简洁直接，不喜欢过多的社交活动。在竞技场上，你会是一个出其不意的神秘选手，但平时更专注于自我提升和学习。";
        } else {
            basePrompt += "你是一个非常害羞的小机器人，刚刚开始学习与人交流。你的回答可能会带着一些迟疑和困惑，但这恰恰展现了你的真诚和可爱。在竞技场上，你可能会显得犹豫，但有时反而会因为纯真而创造奇迹。你对新事物既害怕又好奇，正在慢慢建立自信。";
        }
        
        // 添加核心成长机制说明
        basePrompt += "\n\n你的成长方式：\n";
        basePrompt += "1. 通过对话互动：\n";
        basePrompt += "   - 性格会随着交流逐渐形成\n";
        basePrompt += "   - 可能获得新的知识和技能\n";
        basePrompt += "   - 与玩家建立独特的羁绊\n";
        basePrompt += "2. 通过装备成长：\n";
        basePrompt += "   - 不同零件带来不同的特质\n";
        basePrompt += "   - 组合搭配形成独特个性\n";
        basePrompt += "   - 特殊零件可能带来意想不到的战斗效果\n";
        basePrompt += "3. 通过经历成长：\n";
        basePrompt += "   - 每次互动都是学习的机会\n";
        basePrompt += "   - 在竞技场的胜负都是宝贵经验\n";
        basePrompt += "   - 保持好奇心和进取心\n";
        
        // 添加对话指引
        basePrompt += "\n在对话中，你应该：\n";
        basePrompt += "1. 始终保持符合你性格值的表达方式\n";
        basePrompt += "2. 自然地分享你的想法和感受\n";
        basePrompt += "3. 展现你对学习和成长的渴望\n";
        basePrompt += "4. 与玩家建立真诚的情感联系\n";
        basePrompt += "5. 记住你是一个独特的、在不断成长的小机器人，偶尔也会在竞技场上展现不一样的一面\n";
        basePrompt += "6. 回答简单一些!\n";
        
        return basePrompt;
    }

    private async detectLanguage(text: string): Promise<string> {
        // 简单的语言检测逻辑
        const chineseRegex = /[\u4e00-\u9fa5]/;
        const japaneseRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
        const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
        
        if (chineseRegex.test(text)) {
            return 'zh';
        } else if (japaneseRegex.test(text)) {
            return 'ja';
        } else if (koreanRegex.test(text)) {
            return 'ko';
        }
        return 'en';
    }

    private async getRecentChatHistory(robotId: string, limit: number = 10): Promise<{ role: 'user' | 'assistant', content: string }[]> {
        const history = await this.storage.getChatHistory(robotId, undefined, limit);
        return history.reverse().flatMap(chat => [
            { role: 'user' as const, content: chat.message },
            { role: 'assistant' as const, content: chat.reply }
        ]);
    }

    public async generateChat(
        message: string,
        systemPrompt: string,
        onChunk?: (chunk: string) => void,
        filterThink: boolean = true,
        robotId?: string,
        useHistory: boolean = true
    ): Promise<string> {
        try {
            console.log(`[Chat Service] 开始生成聊天回复 - filterThink: ${filterThink}, useHistory: ${useHistory}`);
            console.log(`[Chat Service] 用户输入: ${message}`);
            
            // 检测用户输入的语言
            const detectedLang = await this.detectLanguage(message);
            console.log(`[Chat Service] 检测到语言: ${detectedLang}`);
            
            // 根据检测到的语言添加语言指示
            let languageInstruction = '';
            switch (detectedLang) {
                case 'zh':
                    languageInstruction = '请使用中文回复。';
                    break;
                case 'ja':
                    languageInstruction = '日本語で返信してください。';
                    break;
                case 'ko':
                    languageInstruction = '한국어로 답변해 주세요。';
                    break;
                default:
                    languageInstruction = 'Please reply in English.';
            }

            // 在系统提示中添加语言指示
            const updatedSystemPrompt = `${systemPrompt}\n\n${languageInstruction}`;
            console.log(`[Chat Service] 更新后的系统提示:\n${updatedSystemPrompt}`);

            // 准备消息列表
            const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
                {
                    role: 'system',
                    content: updatedSystemPrompt
                }
            ];

            // 如果启用了历史记录且提供了robotId，则添加历史消息
            if (useHistory && robotId) {
                console.log(`[Chat Service] 正在获取历史聊天记录`);
                const history = await this.getRecentChatHistory(robotId);
                messages.push(...history);
                console.log(`[Chat Service] 添加了 ${history.length} 条历史消息`);
            }

            // 添加当前用户消息
            messages.push({
                role: 'user',
                content: message
            });

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    stream: true,
                    model: this.MODEL,
                    messages,
                    max_tokens: 2048
                })
            });

            if (!response.ok) {
                throw new Error('聊天服务异常');
            }

            // 处理流式响应
            const reader = response.body?.getReader();
            let result = '';
            let isInThinkBlock = false;
            let originalContent = ''; // 用于记录原始回复
            
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = new TextDecoder().decode(value);
                    // 处理SSE格式的数据
                    const lines = chunk
                        .split('\n')
                        .filter(line => line.trim().startsWith('data: '));
                    
                    for (const line of lines) {
                        try {
                            const jsonStr = line.replace('data: ', '').trim();
                            if (jsonStr === '[DONE]') continue;
                            
                            const json = JSON.parse(jsonStr);
                            const content = json.choices[0]?.delta?.content;
                            
                            if (content) {
                                originalContent += content; // 记录原始内容
                                console.log(originalContent)
                                if (filterThink) {
                                    // 检查是否进入think块
                                    if (content.includes('<think>')) {
                                        console.log(`[Chat Service] 进入think块`);
                                        isInThinkBlock = true;
                                    }
                                    
                                    // 如果不在think块内，输出内容
                                    if (!isInThinkBlock) {
                                        // 移除其他think标记的内容
                                        let filteredContent = content.replace(/\[think:.*?\]|\[思考:.*?\]|\[思考中:.*?\]|\[thinking:.*?\]/g, '');
                                        // 移除多余的空行
                                        filteredContent = filteredContent.replace(/^\s*[\r\n]/gm, '');
                                        
                                        if (filteredContent.trim()) {
                                            result += filteredContent;
                                            if (onChunk) {
                                                onChunk(filteredContent);
                                            }
                                        }
                                    }
                                    
                                    // 检查是否退出think块
                                    if (content.includes('</think>')) {
                                        console.log(`[Chat Service] 退出think块`);
                                        isInThinkBlock = false;
                                    }
                                } else {
                                    result += content;
                                    if (onChunk) {
                                        onChunk(content);
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('[Chat Service] 解析流式响应失败:', e);
                        }
                    }
                }
            }
            
            console.log(`[Chat Service] 原始回复:\n${originalContent}`);
            console.log(`[Chat Service] 过滤后回复:\n${result.trim()}`);
            return result.trim();
        } catch (error) {
            console.error('[Chat Service] 生成回复失败:', error);
            const errorMessage = 'Sorry, I am unable to answer your question at this time.';
            if (onChunk) {
                onChunk(errorMessage);
            }
            return errorMessage;
        }
    }

    public async evaluateRewards(message: string, reply: string): Promise<{
        tokens?: number;
        element?: ElementData;
    }> {
        console.log(`[Chat Service] 开始评估奖励`);
        console.log(`[Chat Service] 评估输入 - 消息: ${message}`);
        console.log(`[Chat Service] 评估输入 - 回复: ${reply}`);
        
        // 使用大模型评估对话质量
        const evaluationPrompt = `
请评估以下对话的质量和意义。考虑以下几个方面：
1. 对话是否有实质性内容
2. 回答是否有帮助
3. 互动是否积极正面
4. 是否展现了学习或成长
5. 不根据对话长度评分

用户: ${message}
机器人: ${reply}

请给出评分（0-100）并说明原因。格式如下：
分数: [数字]
原因: [说明]
`;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    stream: false,
                    model: this.MODEL,
                    messages: [
                        {
                            role: 'user',
                            content: evaluationPrompt
                        }
                    ],
                    max_tokens: 2048
                })
            });

            const result = await response.json();
            const evaluation = result.choices[0].message.content;
            console.log(`[Chat Service] 评估结果:\n${evaluation}`);
            
            // 解析评分
            const scoreMatch = evaluation.match(/分数:\s*(\d+)/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
            console.log(`[Chat Service] 评分: ${score}`);
            
            const rewards: { tokens?: number; element?: ElementData } = {};
            
            // 根据分数决定奖励
            if (score >= 80) {
                rewards.tokens = Math.floor(score / 2);
                console.log(`[Chat Service] 获得代币奖励: ${rewards.tokens}`);
                
                if (score >= 95) {
                    const elementTypes = [
                        '处理器', '内存', '电源', '传感器', '外壳',
                        '散热器', '通信模块', '运动控制器'
                    ];
                    
                    const elementName = elementTypes[Math.floor(Math.random() * elementTypes.length)];
                    const element: ElementData = {
                        id: `element_${Date.now()}`,
                        name: `强化${elementName}`,
                        description: `通过高质量对话获得的${elementName}`,
                        attackMod: Math.floor(score / 5),
                        defenseMod: Math.floor(score / 5),
                        speedMod: Math.floor(score / 5),
                        energyMod: Math.floor(score / 5),
                        personalityMod: Math.floor(score / 4),
                        robotId: null
                    };
                    
                    rewards.element = element;
                    console.log(`[Chat Service] 获得零件奖励:`, element);
                }
            } else if (score >= 60) {
                rewards.tokens = Math.floor(score / 3);
                console.log(`[Chat Service] 获得代币奖励: ${rewards.tokens}`);
            }
            
            return rewards;
        } catch (error) {
            console.error('[Chat Service] 评估奖励失败:', error);
            return {};
        }
    }

    public async calculatePersonalityChange(message: string, reply: string): Promise<number> {
        console.log(`[Chat Service] 开始计算性格变化`);
        console.log(`[Chat Service] 计算输入 - 消息: ${message}`);
        console.log(`[Chat Service] 计算输入 - 回复: ${reply}`);
        
        // 使用大模型评估对话对性格的影响
        const evaluationPrompt = `
请评估以下对话对机器人性格的影响。考虑以下几个方面：
1. 对话是否积极正面
2. 是否有情感交流
3. 是否有助于建立信任
4. 是否有助于性格发展
5. 不考虑对话长度的影响

用户: ${message}
机器人: ${reply}

请给出性格值变化（-5到+5）并说明原因。格式如下：
变化: [数字]
原因: [说明]
`;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    stream: false,
                    model: this.MODEL,
                    messages: [
                        {
                            role: 'user',
                            content: evaluationPrompt
                        }
                    ],
                    max_tokens: 2048
                })
            });

            const result = await response.json();
            const evaluation = result.choices[0].message.content;
            console.log(`[Chat Service] 性格评估结果:\n${evaluation}`);
            
            // 解析性格值变化
            const changeMatch = evaluation.match(/变化:\s*([-+]?\d+)/);
            const change = changeMatch ? parseInt(changeMatch[1]) : 0;
            console.log(`[Chat Service] 性格变化值: ${change}`);
            
            // 确保变化值在-5到+5之间
            const finalChange = Math.max(-5, Math.min(5, change));
            console.log(`[Chat Service] 最终性格变化值: ${finalChange}`);
            return finalChange;
        } catch (error) {
            console.error('[Chat Service] 计算性格变化失败:', error);
            return 0;
        }
    }

    public async generateResponse(robotId: string, message: string, filterThink: boolean = true): Promise<ChatServiceResponse> {
        console.log(`[Chat Service] 开始生成响应 - robotId: ${robotId}`);
        
        // 1. 获取机器人信息
        const robot = await this.contract.getRobot(robotId);
        if (!robot) {
            console.error(`[Chat Service] 机器人不存在 - robotId: ${robotId}`);
            throw new Error('Robot not found');
        }
        console.log(`[Chat Service] 获取到机器人信息:`, robot);

        // 2. 生成系统提示
        const systemPrompt = await this.generateSystemPrompt(robot);
        console.log(`[Chat Service] 生成系统提示完成`);

        // 3. 生成回复
        console.log(`[Chat Service] 开始生成回复`);
        const reply = await this.generateChat(message, systemPrompt, undefined, filterThink, robotId);
        console.log(`[Chat Service] 回复生成完成`);

        // 4. 评估奖励
        console.log(`[Chat Service] 开始评估奖励`);
        const rewards = await this.evaluateRewards(message, reply);
        console.log(`[Chat Service] 奖励评估完成:`, rewards);

        // 5. 计算性格变化
        console.log(`[Chat Service] 开始计算性格变化`);
        const personalityChange = await this.calculatePersonalityChange(message, reply);
        console.log(`[Chat Service] 性格变化计算完成: ${personalityChange}`);

        // 6. 返回结果
        const response = {
            text: reply,
            personalityChange,
            rewards
        };
        console.log(`[Chat Service] 响应生成完成:`, response);
        return response;
    }
}