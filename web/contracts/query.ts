import { isValidSuiAddress } from "@mysten/sui/utils";
import { NetworkVariables, suiClient } from "./index";
import { SuiObjectData, SuiObjectResponse } from "@mysten/sui/client";
import { categorizeSuiObjects, CategorizedObjects } from "@/utils/assetsHelpers";
import { RobotConfig, UserInfo } from "@/types";
import { mockOwnedElement } from "@/mock";

export const getUserProfile = async (address: string): Promise<CategorizedObjects> => {
  if (!isValidSuiAddress(address)) {
    throw new Error("Invalid Sui address");
  }

  let hasNextPage = true;
  let nextCursor: string | null = null;
  let allObjects: SuiObjectResponse[] = [];

  while (hasNextPage) {
    const response = await suiClient.getOwnedObjects({
      owner: address,
      options: {
        showContent: true,
      },
      cursor: nextCursor,
    });

    allObjects = allObjects.concat(response.data);
    hasNextPage = response.hasNextPage;
    nextCursor = response.nextCursor ?? null;
  }

  return categorizeSuiObjects(allObjects);
};


export const getUserInfo = async (address: string, networkVariables: NetworkVariables): Promise<UserInfo> => {
  let userInfo: UserInfo = {
    address,
    name: "",
    robot: undefined,
    trash: 0,
    ownedElement: [],
    last_mint_token_time: 0,
  }

  let hasNextPage = true;
  let nextCursor: string | null = null;

  while (hasNextPage) {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      options: {
        showContent: true,
      },
      filter:{
        MatchAny:[
          {
            StructType: `${networkVariables.Package}::robot::Robot`,
          },
          {
            StructType: `${networkVariables.Package}::user::Passport`,
          },
          {
            StructType: `0x2::token::Token<${networkVariables.Package}::trash::TRASH>`,
          },
        ]
      },
      cursor: nextCursor,
    });

    nextCursor = objects.nextCursor ?? null;
    hasNextPage = objects.hasNextPage;

    objects.data.forEach((object) => {
      const data = object.data as unknown as SuiObjectData;
      if (data.content?.dataType !== "moveObject") {
        return
      }
      const contentType =  data.content?.type;
      if (contentType === `${networkVariables.Package}::user::Passport`) {
        userInfo = {...userInfo, ...(data.content?.fields as unknown as UserInfo)};
      }
      if(contentType === `${networkVariables.Package}::robot::Robot`) {
        userInfo.robot = data.content?.fields as unknown as RobotConfig;
        userInfo.robot.attack -= 128;
        userInfo.robot.energy -= 128;
        userInfo.robot.speed -= 128;
        userInfo.robot.personality -= 128;
      }
      if(contentType === `0x2::token::Token<${networkVariables.Package}::trash::TRASH>`) {
        userInfo.trash = (data.content?.fields as unknown as {
          balance: number
        }).balance;
      }
    });
  }
  userInfo.ownedElement = mockOwnedElement
  return userInfo;
}
