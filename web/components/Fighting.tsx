import { useGameStore, GameUIState } from "@/hooks/use-game-store";
import { RoButton } from "./ro_button";

export function Fighting() {
    const { setUIState } = useGameStore();

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800">
            <h1 className="text-white mb-4">Fighting Page</h1>
            <RoButton 
                variant="mint_bottom" 
                onClick={() => setUIState(GameUIState.MAIN_MENU)}
            >
                Back
            </RoButton>
        </div>
    );
}