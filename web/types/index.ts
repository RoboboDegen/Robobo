export interface RobotConfig {
    id: string,
    name: string;
    attack: number;
    defense: number;
    speed: number;
    energy: number;
    personality: number;
    image?: string;
    equippedElement?: Element[];
}

export interface MirrorConfig {
    id: string,
    name: string;
    attack: number;
    defense: number;
    speed: number;
    energy: number;
    personality: number;
}
export interface Element {
    id: string,
    name: string,
    description: string,
    value: number,
    image: string,
}


export interface UserInfo {
    address: string;
    robot: RobotConfig;
    trash: number,
    ownedElement: Element[];
}



export interface Message {
    id?: number
    text: string
    sender: "user" | "ai"
    timestamp?: Date
}


export interface BattleRecord {
    attacker: RobotConfig;
    defender: MirrorConfig;
    result: string;
    timestamp: Date;
    rounds: BattleRound[];
    winner: string;
    attacker_final_energy: number;
    defender_final_energy: number;
    reward: string;
}

/*1: 特殊攻击
  2: 特殊回复
  3: 轻攻击
  4: 重攻击
  5: 回复
  6: 绝命攻击
  7: 绝命回复
*/
export interface BattleRound {
    name: string,
    id: string,
    action: number,
    result: number,
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


