// 基础数据类型
export interface RobotData {
  id: string
  name: string
  avatar: string | null
  personality: number
  description: string | null
  status: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ElementData {
  id: string
  name: string
  description: string | null
  attackMod: number
  defenseMod: number
  speedMod: number
  energyMod: number
  personalityMod: number
  robotId: string | null
  createdAt?: Date
}

export interface ChatData {
  id: string
  robotId: string
  message: string
  reply: string
  personalityChange: number | null
  rewards?: RewardData[]
  createdAt?: Date
}

export interface RewardData {
  id: string
  type: string
  amount: number | null
  elementId: string | null
  claimed: boolean
  robotId?: string
  chatId?: string
}

// API 请求和响应类型
export interface ChatRequest {
  robot_uid: string
  message: string
  filter_think?: boolean
}

export interface ChatResponse {
  success: boolean
  reply: string
  rewards?: ChatReward[]
  attribute_changes?: AttributeChanges
  signature_required?: boolean
  signature_request?: SignatureRequest
  error?: string
}

export interface ChatReward {
  type: 'token' | 'element'
  amount?: number
  uid?: string
}

export interface AttributeChanges {
  personality: number
}

export interface SignatureRequest {
  sign_data: string
  nonce: string
}

export interface ChatHistoryResponse {
  success: boolean
  history: ChatHistoryEntry[]
  next_cursor: string | null
}

export interface ChatHistoryEntry {
  timestamp: string
  message: string
  reply: string
  rewards?: ChatReward[]
  attribute_changes?: AttributeChanges
}

// 服务层响应类型
export interface GameChatResponse {
  success: boolean
  reply: string
  rewards?: RewardData[]
  personalityChange?: number
  signatureRequired?: boolean
  signatureRequest?: {
    signData: string
    nonce: string
  }
}

export interface ChatServiceResponse {
  text: string
  personalityChange?: number
  rewards?: {
    tokens?: number
    element?: ElementData
  }
}
