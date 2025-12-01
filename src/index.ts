import { connect } from "programming-game";
import { config } from "dotenv";

import { onTickOW } from "./overworld";
import { onTickArena } from "./arena";

config({
	path: ".env",
});

const assertEnv = (key: string): string => {
	const val = process.env[key];
	if (!val) {
		throw new Error(
			`Missing env var ${key}, please check your .env file, you can get these values from https://programming-game.com/dashboard`,
		);
	}
	return val;
};

connect({
	credentials: {
		id: assertEnv("USER_ID"),
		key: assertEnv("API_KEY"),
	},
	onTick(heartbeat) {
		if (heartbeat.inArena) {
			return onTickArena(heartbeat) || void 0;
		} else {
			return onTickOW(heartbeat) || void 0;
		}
	},
});
