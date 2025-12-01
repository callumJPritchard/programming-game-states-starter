import { AdventureStateConfig } from "../../config";
import { buySomething, dumpSomething, sellEverything, tryDropFood } from "../../../utils";

export const earlyAdventureConfig: AdventureStateConfig = {
    name: "early",
    // we don't want to dump anything at first
    inventoryDumpFn: () => null,
    restFn: (player) => {
        // rest if below 50% health
        return player.hp < player.stats.maxHp * 0.5;
    },
    objectiveFn: (player, heartbeat) => {
        // just attack everything we see
        const monster = Object.values(heartbeat.units).find((u) => u.type === "monster");

        if (monster) {
            return player.attack(monster);
        }
    },
    headingFn: (player) => {
        // just head to the right
        return player.move({
            x: player.position.x + 50,
            y: player.position.y,
        });
    },
    homeShoppingFn: (player, heartbeat) => {
        // sell everything
        const sellingIntent = sellEverything(heartbeat, player);
        if (sellingIntent) {
            return sellingIntent;
        }

        const shield = player.equipment.offhand;

        // Buy a shield if we don't have one
        if (shield !== "pinewoodShield") {
            if ((player.inventory.pinewoodShield || 0) < 1) {
                const bought = buySomething(heartbeat, player, "pinewoodShield");
                if (bought) {
                    return bought;
                }
            } else {
                // we should equip our shield
                return player.equip("pinewoodShield", "offhand");
            }
        }
    },
};

export const lateAdventureConfig: AdventureStateConfig = {
    name: "late",
    // we don't want to dump anything at first
    inventoryDumpFn: (player, heartbeat) => {
        // drop excess food if over limit
        const dropped = tryDropFood(player, heartbeat);
        if (dropped) {
            return dropped;
        }
        // actually just drop anything
        return dumpSomething(player, heartbeat);
    },
    restFn: (player) => {
        // rest if below 90% health
        return player.hp < player.stats.maxHp * 0.9;
    },
    // no special objective, just keep exploring
    objectiveFn: () => null,
    headingFn: (player) => {
        // just head to the right
        return player.move({
            x: player.position.x + 50,
            y: player.position.y,
        });
    },
    homeShoppingFn: (player, heartbeat) => {
        // sell everything
        return sellEverything(heartbeat, player);
    },
};
