import type { InternalArena } from "webcraft";
import { stringMap, stringMapWithRamps } from "webcraft";

export const theTamedWoods: InternalArena = {
	name: "The Tamed Woods",
	// For jumping
	cliffs: stringMapWithRamps(
		`
		22222222222222222222222222222222222222222
		2                  22                   2
		2                   2                   2
		2                                       2
		2                                       2
		2                                       2
		2                                       2
		2                                    2  2
		2  2             2     2                2
		2                                       2
		2                                       2
		2                                       2
		2                                       2
		2                                       2
		2                   2                   2
		2                   22                  2
		22222222222222222222222222222222222222222
    `,
		1,
	),
	// 0 = open space
	// 1 = crosser spawn
	// 2 = crosser target
	// 3 = defender spawn
	tiles: stringMap(`
		00000000000000000000000000000000000000000
		00000000000000000000000000000000000000000
		00100000000000000000000000000000000000200
		00100000000000000000000000000000000000200
		00100000000000000000000000000000000000200
		00100000000000000000000000000000000000200
		00100000000000000000000000000000000000200
		00100000000000000003333000000000000000200
		00100000000000000003333000000000000000200
		00100000000000000003333000000000000000200
		00100000000000000000000000000000000000200
		00100000000000000000000000000000000000200
		00100000000000000000000000000000000000200
		00100000000000000000000000000000000000200
		00100000000000000000000000000000000000200
		00000000000000000000000000000000000000000
		00000000000000000000000000000000000000000
    `),
};
