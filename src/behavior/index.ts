import { TickHeartbeat } from "programming-game";
import { Intent } from "programming-game/types";

import { Player } from "../types";
import { AdventureStateConfig } from "./config";
import { survivalTick } from "./survival";

import { earlyAdventureConfig, lateAdventureConfig } from "./states/adventure";
import { AdventureBaseState } from "./states/adventure/common";
import { FleeState, ReturnToHomeState } from "./states/flee";
import { HomeState } from "./states/home";

export interface State {
    name: string;
    tick(heartbeat: TickHeartbeat, player: Player, machine: StateMachine): Intent | null;
}

let lastIntent: Intent | null = null;

export class StateMachine {
    name: string;
    currentState: State;
    currentAdventureConfig: AdventureStateConfig = earlyAdventureConfig;

    recentHostiles: Record<string, { x: number; y: number }> = {};
    lastpos: { x: number; y: number } = { x: 0, y: 0 };

    states = {
        adventure: AdventureBaseState,
        flee: FleeState,
        returnToHome: ReturnToHomeState,
        home: HomeState,
    };

    constructor() {
        this.currentState = new AdventureBaseState(this.currentAdventureConfig);
        this.name = "StateMachine";

        setInterval(() => {
            if (lastIntent) {
                console.log("Last Intent:", lastIntent);
                console.log(`Current State: ${this.currentState.name}`);
            }
        }, 5000);
    }

    pickNextConfig(heartbeat: TickHeartbeat): AdventureStateConfig {
        const { player } = heartbeat;
        if (!player) {
            return earlyAdventureConfig;
        }
        const shield = player.equipment.offhand;

        if (shield === "pinewoodShield") {
            return lateAdventureConfig;
        }

        return earlyAdventureConfig;
    }

    transitionTo(heartbeat: TickHeartbeat, nextState: keyof StateMachine["states"]) {
        if (nextState === "adventure") {
            const nextConfig = this.pickNextConfig(heartbeat);
            console.log(`Switching Adventure Config: ${this.currentAdventureConfig.name} -> ${nextConfig.name}`);
            this.currentAdventureConfig = nextConfig;
        }

        const newState = new this.states[nextState](this.currentAdventureConfig);

        console.log(`State Change: ${this.currentState.name} -> ${newState.name}`);
        this.currentState = newState;
    }

    tick(heartbeat: TickHeartbeat, player: Player) {
        lastIntent = player.intent;

        // respawn
        if (player.hp <= 0) {
            return player.respawn();
        }

        // basic survival instincts
        const survivalIntent = survivalTick(heartbeat, player);
        if (survivalIntent) {
            return survivalIntent;
        }

        // otherwise, delegate to current state

        return this.currentState.tick(heartbeat, player, this);
    }
}

export const playerMachine = new StateMachine();
