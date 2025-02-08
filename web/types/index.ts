export interface RobotConfig {
    id:string,
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
    id:string,
    name: string;
    attack: number;
    defense: number;
    speed: number;
    energy: number;
    personality: number;
}

export interface BattleRecord {
    
}

export interface Element {
    id:string,
    name:string,
    description:string,
    value:number,
    image:string,
}


export interface UserInfo {
    address: string;
    robot: RobotConfig;    
    trash:number,    
    ownedElement: Element[];
}



export interface Message {
    id: number
    text: string
    sender: "user" | "ai"
    timestamp?: Date
}
