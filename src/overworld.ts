import * as fs from "fs";

import { TickHeartbeat } from "programming-game";
import { GameObject } from "programming-game/types";
import { playerMachine } from "./behavior";

export function onTickOW(heartbeat: TickHeartbeat) {
    const { player } = heartbeat;
    if (!player) return;

    // Delegate to State Machine
    return playerMachine.tick(heartbeat, player);
}
