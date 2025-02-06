export interface RobotConfig {
    id:string,
    name: string;
    attack: number;
    defense: number;
    speed: number;
    energy: number;
    personality: number;
    image?: string;
}


export interface UserInfo {
    address: string;
    robot: RobotConfig;    
}

export interface Message {
    id: number
    text: string
    sender: "user" | "ai"
    timestamp: Date
}
