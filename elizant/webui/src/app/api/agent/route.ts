import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { AgentService } from './services/agent.service'
import { ConversationService } from './services/conversation.service'
import { AgentSpecService } from './services/spec.service'
import { CreateAgentSchema, ChatMessageSchema, RouteParams, CreateAgentBody, ChatMessageBody } from './types'

const agentService = AgentService.getInstance();
const conversationService = ConversationService.getInstance();
const specService = AgentSpecService.getInstance();

// 统一的Elysia路由
const app = new Elysia({ prefix: '/api/agent' })
  .use(swagger({
    documentation: {
      info: {
        title: 'Agent API Documentation',
        version: '1.0.0'
      }
    }
  }))
  // 获取所有agent列表
  .get('/list', async () => {
    const agents = await agentService.getAllAgents();
    return { agents };
  })

  // 获取特定agent
  .get('/:id', async ({ params }: { params: Pick<RouteParams, 'id'> }) => {
    const agent = await agentService.getAgent(params.id);
    if (!agent) {
      return { error: 'Agent not found' };
    }
    return { agent };
  })

  // 创建新agent
  .post('/create', CreateAgentSchema, async ({ body }: { body: CreateAgentBody }) => {
    try {
      const agent = await agentService.createAgent(body);
      return { success: true, agent };
    } catch (error) {
      console.error('Failed to create agent:', error);
      return { success: false, error: 'Failed to create agent' };
    }
  })

  // 获取agent的spec
  .get('/:id/spec', async ({ params }: { params: Pick<RouteParams, 'id'> }) => {
    const spec = await specService.generateOpenAPISpec(params.id);
    if (!spec) {
      return { error: 'Spec not found' };
    }
    return spec;
  })

  // 获取agent的所有对话
  .get('/:id/conversations', async ({ params }: { params: Pick<RouteParams, 'id'> }) => {
    const conversations = await conversationService.getConversations(params.id);
    return { conversations };
  })

  // 创建新对话
  .post('/:id/conversations', async ({ params }: { params: Pick<RouteParams, 'id'> }) => {
    try {
      const conversation = await conversationService.createConversation(params.id);
      return { success: true, conversation };
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return { success: false, error: 'Failed to create conversation' };
    }
  })

  // 获取对话消息
  .get('/:agentId/conversations/:conversationId/messages', async ({ 
    params 
  }: { 
    params: Pick<RouteParams, 'agentId' | 'conversationId'> 
  }) => {
    const messages = await conversationService.getMessages(params.conversationId);
    return { messages };
  })

  // 发送消息给agent
  .post('/:agentId/conversations/:conversationId/chat', ChatMessageSchema, async ({ 
    params,
    body 
  }: { 
    params: Pick<RouteParams, 'agentId' | 'conversationId'>;
    body: ChatMessageBody;
  }) => {
    try {
      const message = await conversationService.sendMessage(
        params.agentId, 
        params.conversationId, 
        body.message
      );
      return { success: true, message };
    } catch (error) {
      console.error('Failed to process message:', error);
      return { success: false, error: 'Failed to process message' };
    }
  });

// 导出 Next.js API 路由处理函数
export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const DELETE = app.handle; 