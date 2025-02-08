import { RobotConfig, Element, UserInfo, MirrorConfig, Message, BattleRecord } from "@/types";



const mockEquippedElement: Element[] = [
    {
        id: "1",
        name: "Element 1",
        description: "Element 1 description",
        value: 10,
        image: "/gameui/inventory/test_gun.png",
    },
    {
        id: "2",

        name: "Element 2",
        description: "Element 2 description",
        value: 20,
        image: "/gameui/inventory/test_gun.png",
    },
    {
        id: "3",
        name: "Element 3",
        description: "Element 3 description",
        value: 30,
        image: "/gameui/inventory/test_gun.png",
    },
]

const mockOwnedElement: Element[] = [

    {
        id: "1",
        name: "Element 1",
        description: "Element 1 description",
        value: 10,
        image: "/gameui/inventory/test_gun.png",
    },
    {
        id: "2",
        name: "Element 2",
        description: "Element 2 description",
        value: 20,
        image: "/gameui/inventory/test_gun.png",
    },

    {
        id: "3",
        name: "Element 3",
        description: "Element 3 description",
        value: 30,
        image: "/gameui/inventory/test_gun.png",
    },


    {
        id: "4",
        name: "Element 4",
        description: "Element 4 description",
        value: 40,
        image: "/gameui/inventory/test_gun.png",
    },
    {
        id: "5",
        name: "Element 5",
        description: "Element 5 description",
        value: 50,
        image: "/gameui/inventory/test_gun.png",
    },



]

const mockRobot: RobotConfig = {
    id: "0x1234567890123456789012345678901234567890",
    name: "Bobo",
    attack: 148,  // Example value for attack
    defense: 150,  // Example value for defense
    speed: 135,    // Example value for speed
    energy: 175,   // Example value for energy
    personality: 180,  // Example value for personality
    equippedElement: mockEquippedElement,
}


const mockUserInfo: UserInfo = {
    address: "0x1234567890123456789012345678901234567890",
    robot: mockRobot,
    trash: 1000,
    ownedElement: mockOwnedElement,
}



const mockMirrorConfig: MirrorConfig = {
    id: "0x1234567890123456789012345678901234567890",
    name: "Robot 1",
    attack: 146,  // Example value for attack
    defense: 148,  // Example value for defense
    speed: 134,    // Example value for speed
    energy: 180,   // Example value for energy
    personality: 200,  // Example value for personality
}

const mockMessages: Message[] = [

    {
        id: 1,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",
    },
    {
        id: 2,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",
    },
    {
        id: 3,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "ai",
    },
    {
        id: 4,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",
    },
    {
        id: 5,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "ai",
    },
    {
        id: 6,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",
    },
    {
        id: 7,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",
    },{
        id: 8,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",

    },{
        id: 9,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",

    },{
        id: 10,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",
    },


];





async function mockBattleRecords(): Promise<BattleRecord> {
    return {
        attacker: mockRobot,
        defender: mockMirrorConfig,
        result: "win",
        timestamp: new Date(),
        rounds: [
            {
                attacker_id: mockRobot.id,
                defender_id: mockMirrorConfig.id,
                action: 1,
                result: 1,
            }
        ],
        winner: "attacker",
        attacker_final_energy: 100,
        defender_final_energy: 100,
        reward: "100",

    } satisfies BattleRecord;
}





export { mockUserInfo, mockMirrorConfig, mockMessages, mockBattleRecords };