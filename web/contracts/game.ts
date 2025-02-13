import { createBetterTxFactory } from ".";

export const create_passport = createBetterTxFactory<{
    name: string;
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package:networkVariables.Package,
        module:'game',
        function:'create_passport',
        arguments:[
            tx.pure.string(params.name),
            tx.object(networkVariables.GameState),
            tx.object(networkVariables.GameConfig),
            tx.object(networkVariables.Robot_Pool),
            tx.object(networkVariables.TrashTokenCap),
        ]
    })
    return tx;
})

/*  public entry fun mint_robot(
        game_state: &mut GameState,
        game_config: &GameConfig,
        robot_pool: &mut Robot_Pool,
        robot_name: String,
        mut payment: Token<TRASH>,
        token_policy: &mut TokenPolicy<TRASH>,
        ctx: &mut TxContext
    ) */
export const mint_robot = createBetterTxFactory<{
    robot_name: string;
    payment: string;
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package:networkVariables.Package,
        module:'game',
        function:'mint_robot',
        arguments:[
            tx.object(networkVariables.GameState),
            tx.object(networkVariables.GameConfig),
            tx.object(networkVariables.Robot_Pool),
            tx.pure.string(params.robot_name),
            tx.object(params.payment),
            tx.object(networkVariables.TokenPolicy),
        ]
    })
    return tx;
})

