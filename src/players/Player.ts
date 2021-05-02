import type { PlayerState as EnginePlayerState } from "webcraft";
import { Player as EnginePlayer, releaseColor, takeColor } from "webcraft";

import type { Unit } from "../entities/Unit";
import type { Katma } from "../Katma";
import type { Resource } from "../types";

export type PlayerState = EnginePlayerState & {
	crosserPlays: number;
	score: { bulldog: number };
};

export class Player extends EnginePlayer<Resource> {
	crosserPlays;
	score: { bulldog: number };
	unit?: Unit;

	constructor(props: Partial<Player> & { game: Katma }) {
		super(props);
		this.crosserPlays ??= 0;
		this.score ??= { bulldog: 1000 };
	}

	toJSON(): PlayerState {
		return {
			...super.toJSON(),
			crosserPlays: this.crosserPlays,
			score: this.score,
		};
	}
}

export const patchInState = (
	game: Katma,
	playersState: PlayerState[],
): void => {
	playersState.forEach(({ color, id, ...playerData }) => {
		const player =
			game.players.find((p) => p.id === id) ??
			new Player({ ...playerData, id, game });

		if (
			color !== undefined &&
			(!player.color || player.color.index !== color)
		) {
			if (player.color) releaseColor(player.color);
			player.color = takeColor(color);
		}

		player.score = playerData.score;
	});
	game.players.sort((a, b) => a.id - b.id);
};
