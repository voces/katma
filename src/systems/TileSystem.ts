import type { Sprite } from "webcraft";
import { System, TILE_TYPES } from "webcraft";

import type { Crosser } from "../entities/Crosser";
import { currentRound } from "../roundContext";
import { isCrosser } from "../typeguards";

export class TileSystem extends System<Crosser> {
	static components = [];
	readonly pure = false;

	test(entity: Sprite): entity is Crosser {
		return isCrosser(entity);
	}

	update(crosser: Crosser): void {
		// A simple optimization to hoist this; move to if condition if we have
		// multiple tile checks
		if (crosser.invulnerable) return;

		const round = currentRound();
		const currentTile =
			round.arena.tiles[
				round.arena.tiles.length - Math.ceil(crosser.position.y)
			][Math.floor(crosser.position.x)];

		if (currentTile === TILE_TYPES.END) {
			crosser.ascend();
			round.scores++;
			crosser.owner.unit = undefined;

			round.onCrosserRemoval();
		}
	}
}
