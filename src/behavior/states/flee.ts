import { TickHeartbeat } from "programming-game";
import { State, StateMachine } from "..";
import { Player } from "../../types";
import { getDistance, inventoryGrams } from "../../utils";
import { MAX_INVENTORY_GRAMS } from "../../constants";
import { Intent } from "programming-game/types";

export interface IReturnToHomeState extends State {
    extendedTick(heartbeat: TickHeartbeat, player: Player, machine: StateMachine): Intent | null | void;
}

export class ReturnToHomeState implements IReturnToHomeState {
    name: string = "RTB";
    hostilesLastSeen: Date = new Date();

    extendedTick(heartbeat: TickHeartbeat, player: Player, machine: StateMachine): Intent | null | void {
        void heartbeat;
        void player;
        void machine;
    }

    tick(heartbeat: TickHeartbeat, player: Player, machine: StateMachine): Intent | null {
        // if we're close enough to home, transition to HOME
        const distToHome = getDistance(player, { x: 0, y: 0 });
        if (distToHome < 10) {
            machine.transitionTo(heartbeat, "home");
            return null;
        }

        const extendedIntent = this.extendedTick(heartbeat, player, machine);

        if (extendedIntent) {
            return extendedIntent;
        }

        // move towards home
        return player.move({ x: 0, y: 0 });
    }
}

export class FleeState extends ReturnToHomeState {
    name: string = "FLEE";
    hostilesLastSeen: Date = new Date();

    extendedTick(heartbeat: TickHeartbeat, player: Player, machine: StateMachine): Intent | null | void {
        // if our health is above 90% and our inventory is under limit, go to ADVENTURE
        const inventoryWeight = inventoryGrams(player.inventory, heartbeat.items);
        if (player.hp > player.stats.maxHp * 0.9 && inventoryWeight < MAX_INVENTORY_GRAMS) {
            machine.transitionTo(heartbeat, "adventure");
            return null;
        }
    }
}
