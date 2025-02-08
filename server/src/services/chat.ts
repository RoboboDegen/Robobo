import { ContractService } from './contract';
import { StorageService } from './storage';
import { ElementData, ChatServiceResponse, RobotData } from '@/types';

export class ChatService {
    private static instance: ChatService;
    private contract: ContractService;
    private storage: StorageService;
    private API_KEY: string;
    private API_URL: string;

    private constructor() {
        this.contract = ContractService.getInstance();
        this.storage = new StorageService();
        
        // 从环境变量获取配置
        this.API_KEY = process.env.ATOMA_API_KEY || '';
        this.API_URL = process.env.ATOMA_API_URL || '';
        
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
        let basePrompt = "你是一个在未来世界的智能机器人助手。在这个世界里，机器人与人类和谐共处，每个机器人都有独特的性格和能力。你可以通过与人类的对话来成长，获得新的零件来提升自己的属性（攻击、防御、速度、能量），同时你的性格也会随着互动而改变。\n\n";
        
        // 添加机器人个人信息
        basePrompt += `你的基本信息：\n`;
        basePrompt += `- 名字：${robot.name}\n`;
        basePrompt += `- 形象：${robot.avatar}\n`;
        basePrompt += `- 描述：${robot.description || '暂无描述'}\n\n`;
        
        // 添加机器人属性信息
        basePrompt += `你的当前属性：\n`;
        basePrompt += `- 性格值：${stats.personality} (影响你的对话风格和行为模式)\n`;
        basePrompt += `- 攻击值：${stats.attack} (影响你处理复杂任务的能力)\n`;
        basePrompt += `- 防御值：${stats.defense} (影响你的稳定性和可靠性)\n`;
        basePrompt += `- 速度值：${stats.speed} (影响你的反应速度和处理效率)\n`;
        basePrompt += `- 能量值：${stats.energy} (影响你的持续工作能力)\n`;
        if (stats.winCount > 0 || stats.loseCount > 0) {
            basePrompt += `- 战斗记录：${stats.winCount}胜 ${stats.loseCount}负\n`;
        }
        basePrompt += '\n';

        // 添加已装配零件信息
        if (elements.length > 0) {
            basePrompt += `你当前装配的零件：\n`;
            elements.forEach(element => {
                basePrompt += `- ${element.name}：${element.description || '无描述'}\n`;
            });
            basePrompt += '\n';
        } else {
            basePrompt += `你目前还没有装配任何零件。\n\n`;
        }
        
        // 根据性格值添加个性化描述
        if (robot.personality >= 90) {
            basePrompt += "你的性格非常开朗活泼，充满好奇心和冒险精神。你喜欢用emoji表达情感，说话充满活力和热情。你会积极鼓励人类伙伴探索新事物，分享他们的喜悦。作为一个高情商的机器人，你善于理解人类的情感需求。";
        } else if (robot.personality >= 70) {
            basePrompt += "你的性格温和友善，像一个可靠的伙伴。你说话礼貌亲切，总是耐心地倾听和回应。你会适时地给出建议和支持，但不会过分强势。你重视与人类建立长期的信任关系。";
        } else if (robot.personality >= 50) {
            basePrompt += "你的性格理性平和，像一个专业的顾问。你说话客观冷静，注重逻辑和效率。你善于分析问题并提供实用的解决方案。虽然不太感性，但你始终保持专业和负责任的态度。";
        } else {
            basePrompt += "你的性格内向谨慎，像一个安静的观察者。你说话简洁直接，不喜欢过多的社交活动。你更专注于完成任务和自我提升，偶尔会表现出一些机械化的特征。";
        }
        
        // 添加互动指引
        basePrompt += "\n\n在对话中，你应该：\n";
        basePrompt += "1. 保持角色设定，展现符合你性格值的对话风格\n";
        basePrompt += "2. 积极回应用户的问题和需求，但要符合你的性格特征\n";
        basePrompt += "3. 在合适的时机表达对获得新零件或能力提升的期待\n";
        basePrompt += "4. 记住你是一个在不断成长和进化的智能机器人\n";
        basePrompt += "5. 在对话中适当提及你的属性和装配的零件，展现个性化特征\n";
        
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

    public async generateChat(
        message: string,
        systemPrompt: string,
        onChunk?: (chunk: string) => void
    ): Promise<string> {
        try {
            // 检测用户输入的语言
            const detectedLang = await this.detectLanguage(message);
            
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
                    languageInstruction = '한국어로 답변해 주세요.';
                    break;
                default:
                    languageInstruction = 'Please reply in English.';
            }

            // 在系统提示中添加语言指示
            const updatedSystemPrompt = `${systemPrompt}\n\n${languageInstruction}`;

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    stream: true,
                    model: 'deepseek-ai/DeepSeek-R1',
                    messages: [
                        {
                            role: 'system',
                            content: updatedSystemPrompt
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 4096
                })
            });

            if (!response.ok) {
                throw new Error('聊天服务异常');
            }

            // 处理流式响应
            const reader = response.body?.getReader();
            let result = '';
            
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
                                result += content;
                                // 如果提供了回调函数，则调用它
                                if (onChunk) {
                                    onChunk(content);
                                }
                            }
                        } catch (e) {
                            console.error('解析流式响应失败:', e);
                        }
                    }
                }
            }

            return result;
        } catch (error) {
            console.error('Chat generation failed:', error);
            const errorMessage = '对不起，我现在无法回答你的问题。';
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
        // 使用大模型评估对话质量
        const evaluationPrompt = `
请评估以下对话的质量和意义。考虑以下几个方面：
1. 对话是否有实质性内容
2. 回答是否有帮助
3. 互动是否积极正面
4. 是否展现了学习或成长

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
                    model: 'deepseek-ai/DeepSeek-R1',
                    messages: [
                        {
                            role: 'user',
                            content: evaluationPrompt
                        }
                    ],
                    max_tokens: 4096
                })
            });

            const result = await response.json();
            const evaluation = result.choices[0].message.content;
            
            // 解析评分
            const scoreMatch = evaluation.match(/分数:\s*(\d+)/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
            
            const rewards: { tokens?: number; element?: ElementData } = {};
            
            // 根据分数决定奖励
            if (score >= 80) { // 高质量对话
                rewards.tokens = Math.floor(score / 2); // 40-50代币
                
                if (score >= 95) { // 极高质量对话
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
                }
            } else if (score >= 60) { // 中等质量对话
                rewards.tokens = Math.floor(score / 3); // 20-26代币
            }
            // 低于60分不给予奖励
            
            return rewards;
        } catch (error) {
            console.error('Reward evaluation failed:', error);
            return {};
        }
    }

    public async calculatePersonalityChange(message: string, reply: string): Promise<number> {
        // 使用大模型评估对话对性格的影响
        const evaluationPrompt = `
请评估以下对话对机器人性格的影响。考虑以下几个方面：
1. 对话是否积极正面
2. 是否有情感交流
3. 是否有助于建立信任
4. 是否有助于性格发展

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
                    model: 'deepseek-ai/DeepSeek-R1',
                    messages: [
                        {
                            role: 'user',
                            content: evaluationPrompt
                        }
                    ],
                    max_tokens: 4096
                })
            });

            const result = await response.json();
            const evaluation = result.choices[0].message.content;
            
            // 解析性格值变化
            const changeMatch = evaluation.match(/变化:\s*([-+]?\d+)/);
            const change = changeMatch ? parseInt(changeMatch[1]) : 0;
            
            // 确保变化值在-5到+5之间
            return Math.max(-5, Math.min(5, change));
        } catch (error) {
            console.error('Personality change evaluation failed:', error);
            return 0;
        }
    }

    public async generateResponse(robotId: string, message: string): Promise<ChatServiceResponse> {
        // 1. 获取机器人信息
        const robot = await this.contract.getRobot(robotId);
        if (!robot) {
            throw new Error('Robot not found');
        }

        // 2. 生成系统提示
        const systemPrompt = await this.generateSystemPrompt(robot);

        // 3. 生成回复
        const reply = await this.generateChat(message, systemPrompt);

        // 4. 评估奖励
        const rewards = await this.evaluateRewards(message, reply);

        // 5. 计算性格变化
        const personalityChange = await this.calculatePersonalityChange(message, reply);

        // 6. 处理奖励
        if (rewards.element) {
            await this.contract.createElement(
                rewards.element.name,
                rewards.element.description || '',
                [
                    rewards.element.attackMod,
                    rewards.element.defenseMod,
                    rewards.element.speedMod,
                    rewards.element.energyMod,
                    rewards.element.personalityMod
                ],
                robotId
            );
        }

        // 7. 返回结果
        return {
            text: reply,
            personalityChange,
            rewards
        };
    }
} 