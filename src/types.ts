import { TickHeartbeat } from "programming-game";
import { Intent } from "programming-game/types";

export type Player = NonNullable<TickHeartbeat["player"]>;

// Adventure config types

export type InventoryDumpFnT = (player: Player, heartbeat: TickHeartbeat) => Intent | null | undefined;
export type RestFnT = (player: Player, heartbeat: TickHeartbeat) => boolean;
export type ObjectiveFnT = (player: Player, heartbeat: TickHeartbeat) => Intent | null | undefined;
export type HeadingFnT = (player: Player, heartbeat: TickHeartbeat) => Intent;
export type HomeShoppingFnT = (player: Player, heartbeat: TickHeartbeat) => Intent | null | undefined;
