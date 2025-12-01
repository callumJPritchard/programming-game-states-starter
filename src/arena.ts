import { TickHeartbeat } from "programming-game";

export function onTickArena(heartbeat: TickHeartbeat) {
    const { player } = heartbeat;
    if (!player) return;

    // in the arena, we will just find the closest person and attack them
    const unitKeys = Object.keys(heartbeat.units) as (keyof typeof heartbeat.units)[];

    const notSelf = unitKeys.filter((k) => k !== player.id);

    // sort by distance
    const sortedByDistance = notSelf.sort((a, b) => {
        const unitA = heartbeat.units[a];
        const unitB = heartbeat.units[b];

        const distA = Math.hypot(unitA.position.x - player.position.x, unitA.position.y - player.position.y);
        const distB = Math.hypot(unitB.position.x - player.position.x, unitB.position.y - player.position.y);

        return distA - distB;
    });

    const closestUnitKey = sortedByDistance[0];
    if (!closestUnitKey) {
        // no one else here?
        return player.move({ x: 0, y: 0 });
    }

    const closestUnit = heartbeat.units[closestUnitKey];

    return player.attack(closestUnit);
}
