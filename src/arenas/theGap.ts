import type { InternalArena } from "webcraft";
import { stringMap, stringMapWithRamps } from "webcraft";

export const theGap: InternalArena = {
	name: "The Gap",
	// For jumping
	cliffs: stringMapWithRamps(
		`
        .22222222222
        22111111111222
        211       1112
        21          12
        21 111    1112
        21 121    1222
        21 111    1222
        21        1112
        21          12
        21          12
        2111        12
        2221    111 12
        2221    121 12
        2111    111 12
        21          12
        21          12
        21111111111112
        22222222222222
    `,
		1,
	),
	// 0 = open space
	// 1 = crosser spawn
	// 2 = crosser target
	// 3 = defender spawn
	tiles: stringMap(`
         00000000000
         00000000000
        00011111110000
        00000000000000
        00000000000000
        00000000000000
        00000000000000
        00000000000000
        00000000000000
        00000000000000
        00000000000000
        00000000000000
        00000003330000
        00000003330000
        00000003330000
        00222222222200
        00000000000000
        00000000000000
    `),
};
