import { TickHeartbeat } from "programming-game";
import { State, StateMachine } from "../..";
import { getHostiles, getDistance, inventoryGrams } from "../../../utils";
import { CALORY_THRESHOLDS, MAX_INVENTORY_GRAMS } from "../../../constants";
import { HeadingFnT, InventoryDumpFnT, ObjectiveFnT, Player, RestFnT } from "../../../types";
import { AdventureStateConfig } from "../../config";

export class AdventureBaseState implements State {
    name: string = "ADVENTURE";

    inventoryDumpFn: InventoryDumpFnT;
    restFn: RestFnT;
    objectiveFn: ObjectiveFnT;
    headingFn: HeadingFnT;

    constructor(config: AdventureStateConfig) {
        this.inventoryDumpFn = config.inventoryDumpFn;
        this.restFn = config.restFn;
        this.objectiveFn = config.objectiveFn;
        this.headingFn = config.headingFn;
    }

    tick(heartbeat: TickHeartbeat, player: Player, machine: StateMachine) {
        // Transition: Low Health -> Flee
        if (player.hp < player.stats.maxHp * 0.3) {
            machine.transitionTo(heartbeat, "flee");
            return null;
        }

        // kill the nearest hostile
        const hostiles = getHostiles(heartbeat);
        if (hostiles.length > 0) {
            // sort by distance
            hostiles.sort((a, b) => {
                const distA = getDistance(player, a.position) || Infinity;
                const distB = getDistance(player, b.position) || Infinity;
                return distA - distB;
            });

            const target = hostiles[0];
            return player.attack(target);
        }

        // if we're low on calories, start fleeing
        if (player.calories < CALORY_THRESHOLDS.STARVING) {
            machine.transitionTo(heartbeat, "flee");
            return null;
        }

        // if we have too much weight, go home
        const inventoryWeight = inventoryGrams(player.inventory, heartbeat.items);
        if (inventoryWeight > MAX_INVENTORY_GRAMS) {
            // drump inventory if possible to save weight
            const dumpIntent = this.inventoryDumpFn(player, heartbeat);
            if (dumpIntent) {
                return dumpIntent;
            }

            // otherwise, return to home

            machine.transitionTo(heartbeat, "returnToHome");
            return null;
        }

        // do we need to rest? (heal up)
        const canRest = this.restFn(player, heartbeat);
        if (canRest) {
            return player.move({ x: player.position.x, y: player.position.y });
        }

        // any specific objectives for the current adventure
        const objectiveIntent = this.objectiveFn(player, heartbeat);
        if (objectiveIntent) {
            return objectiveIntent;
        }

        // if nothing else, we need to go somewhere
        return this.headingFn(player, heartbeat);
    }
}
