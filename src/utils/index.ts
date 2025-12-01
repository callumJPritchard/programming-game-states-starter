import { TickHeartbeat } from "programming-game";
import { Items, ItemDefinition } from "programming-game/items";
import { ClientSideUnit, Intent } from "programming-game/types";
import { Player } from "../types";
import { PROTECTED_ITEMS } from "../constants";

export function inventoryGrams(inventory: Record<string, number>, lookup: Record<Items, ItemDefinition>): number {
    let totalWeight = 0;

    for (const [item, amount] of Object.entries(inventory)) {
        // look up the item in the lookup table
        const itemDef = lookup[item as Items];
        if (itemDef) {
            totalWeight += itemDef.weight * amount;
        }
    }

    return totalWeight;
}

export function tryDropFood(player: Player, heartbeat: TickHeartbeat): Intent | null {
    // find all food in inventory
    const foodItems = Object.entries(player.inventory).filter(([itemKey, amount]) => {
        const itemDef = heartbeat.items[itemKey as Items];
        return itemDef && itemDef.type === "food" && amount > 0;
    });

    for (const [foodKey, amount] of foodItems) {
        // drop all but 1 of each food item
        const toDrop = amount - 1;
        if (toDrop > 0) {
            console.log(`Dropping ${toDrop} of ${foodKey} to avoid over-encumbrance`);

            return player.drop({
                item: foodKey as Items,
                amount: toDrop,
            });
        }
    }

    return null;
}

// we must dump something
export function dumpSomething(player: Player, heartbeat: TickHeartbeat): Intent {
    // first try dropping extra food
    const dropFoodIntent = tryDropFood(player, heartbeat);
    if (dropFoodIntent) {
        return dropFoodIntent;
    }

    // otherwise we need to drop something else
    // find the heaviest item in inventory
    let heaviestItem: { itemKey: Items; weight: number } | null = null;

    for (const [itemKey, amount] of Object.entries(player.inventory)) {
        const itemDef = heartbeat.items[itemKey as Items];
        if (itemDef && amount > 0) {
            const totalWeight = itemDef.weight * amount;
            if (!heaviestItem || totalWeight > heaviestItem.weight) {
                heaviestItem = { itemKey: itemKey as Items, weight: totalWeight };
            }
        }
    }

    if (heaviestItem) {
        console.log(`Dumping some of ${heaviestItem.itemKey} to avoid over-encumbrance`);

        return player.drop({
            item: heaviestItem.itemKey,
            amount: 1,
        });
    }

    // should never happen, but just in case
    throw new Error("No items to dump");
}

export function getHostiles(heartbeat: TickHeartbeat) {
    const { player } = heartbeat;
    if (!player) return [];

    return Object.values(heartbeat.units).filter((u) => u.intent?.type === "attack" && u.intent.target === player.id);
}

export function getDistance(player: Player, position: { x: number; y: number }) {
    const playerPos = player.position;

    const dx = playerPos.x - position.x;
    const dy = playerPos.y - position.y;

    return Math.sqrt(dx * dx + dy * dy);
}

export function sellEverything(heartbeat: TickHeartbeat, player: Player) {
    const npcs = Object.values(heartbeat.units).filter((u) => u.type === "npc");
    if (npcs.length > 0) {
        const npc = npcs[0];
        // Sell everything except weapons and coins
        const toSell: Record<string, number> = {};
        for (const [item, amount] of Object.entries(player.inventory)) {
            if (!PROTECTED_ITEMS.includes(item as (typeof PROTECTED_ITEMS)[number]) && (amount as number) > 0) {
                toSell[item] = amount;
            }
        }

        if (Object.keys(toSell).length > 0) {
            return player.sell({ items: toSell, to: npc });
        }
    }
}

export function buySomething(heartbeat: TickHeartbeat, player: Player, item: Items) {
    const npcs = Object.values(heartbeat.units).filter((u) => u.type === "npc");
    const vendor = npcs.find((n) => n.trades.selling[item] && n.trades.selling[item].quantity > 0);

    const price = vendor?.trades.selling[item]?.price;

    if (price && (player.inventory.copperCoin || 0) >= price) {
        return player.buy({
            items: { [item]: 1 },
            from: vendor,
        });
    }
}
