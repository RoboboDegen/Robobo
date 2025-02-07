import { RobotConfig, Element, UserInfo, MirrorConfig, Message } from "@/types";



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
    attack: 20,
    defense: 11,
    speed: 45,
    energy: 60,
    personality: 70,
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
    attack: 20,
    defense: 11,
    speed: 45,
    energy: 60,
    personality: 70,
}

const messages: Message[] = [

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

  ];




export { mockUserInfo, mockMirrorConfig };