import type { InternalArena } from "webcraft";
import { stringMap, stringMapWithRamps } from "webcraft";

export const theTinyRectangle: InternalArena = {
	name: "The Tiny Rectangle",
	// For jumping
	cliffs: stringMapWithRamps(
		`
			.2222222222222222222
			22                 2
			2                  2
			2                  2
			2                  2
			2                  2
			22222222222222222222
		`,
		1,
	),
	// 0 = open space
	// 1 = crosser spawn
	// 2 = crosser target
	// 3 = defender spawn
	tiles: stringMap(`
		00000000000000000000
		00000000000000000000
		00000000000000000200
		00100000000000330200
		00100000000000330200
		00000000000000000000
		00000000000000000000
    `),
};
