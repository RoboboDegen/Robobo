import { ElizantSpec } from '@elizant/core';

export class OpenAPIService {
  private static instance: OpenAPIService;

  private constructor() {
  }

  static getInstance(): OpenAPIService {
    if (!OpenAPIService.instance) {
      OpenAPIService.instance = new OpenAPIService();
    }
    return OpenAPIService.instance;
  }

  async generateOpenAPI(agentId: string): Promise<ElizantSpec | null> {
    const spec:ElizantSpec = {
      openapi: '3.0.0',
      info: {
        title: `Agent API`,
        version: '1.0.0',
        description:`API for Agent`
      },
      paths: {
        '/chat': {
          post: {
            summary: 'Chat with the agent',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Agent response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        response: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      'x-elizant': {
        name: config.name,
        bio: config.description || `A helpful agent named ${config.name}`,
        topics: config.topics || [],
        style: config.style || 'friendly and professional',
        knowledge: config.knowledge || '',
        modelProvider: config.modelProvider || 'openai',
        messageExamples: {
          all: [],
          chat: [],
          post: []
        },
        postExamples: [],
        system: `You are ${config.name}, a helpful assistant.`,
        adjectives: ['helpful', 'friendly'],
        plugins: [],
        clients: [],
        settings: {}
      }
    };

    return spec;
  }
} 