import { TickHeartbeat } from "programming-game";
import { Intent } from "programming-game/types";
import { Player } from "../../types";
import {
	getHostiles,
	getDistance,
	inventoryGrams,
	dumpSomething,
} from "../../utils";
import { CALORY_THRESHOLDS } from "../../constants";

export function survivalTick(
	heartbeat: TickHeartbeat,
	player: Player
): Intent | null | void {
	// track our attackers
	const hostiles = getHostiles(heartbeat);

	// should we fight back?
	// are any of them within 1 unit?
	const closeAttackers = hostiles.filter((h) => {
		const dist = getDistance(player, h.position);
		return dist !== null && dist < 1;
	});
	if (closeAttackers.length > 0) {
		const target = closeAttackers[0];
		return player.attack(target);
	}

	// eat if we're hungry
	if (player.calories < CALORY_THRESHOLDS.NORMAL) {
		for (const [itemKey, amount] of Object.entries(player.inventory) as [
			keyof typeof heartbeat.items,
			number | undefined
		][]) {
			if (!amount || amount <= 0) continue;

			const itemInfo = heartbeat.items[itemKey];
			if (itemInfo?.type === "food") {
				return player.eat(itemKey);
			}
		}
	}

	// if we're over 60Kg, drop something
	const inventoryWeight = inventoryGrams(player.inventory, heartbeat.items);
	if (inventoryWeight > 60_000) {
		return dumpSomething(player, heartbeat);
	}
}
