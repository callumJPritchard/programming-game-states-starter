import { TickHeartbeat } from "programming-game";
import { State, StateMachine } from "..";
import { HomeShoppingFnT, Player } from "../../types";
import { AdventureStateConfig } from "../config";

export class HomeState implements State {
    name: string = "HOME";
    readonly PROTECTED_ITEMS = ["copperCoin", "copperSword", "pinewoodShield"] as const;

    shoppingFn: HomeShoppingFnT;

    constructor(config: AdventureStateConfig) {
        // use provided shopping function or default to no-op
        this.shoppingFn = config.homeShoppingFn || (() => null);
    }

    tick(heartbeat: TickHeartbeat, player: Player, machine: StateMachine) {
        // Logic: Selling / Buying
        const shoppingIntent = this.shoppingFn(player, heartbeat);
        if (shoppingIntent) {
            return shoppingIntent;
        }

        // Logic: Healing
        if (player.hp < player.stats.maxHp) {
            return player.move({ x: 0, y: 0 });
        }

        // finally, transition to ADVENTURE
        machine.transitionTo(heartbeat, "adventure");
        return null;
    }
}
