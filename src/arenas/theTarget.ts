import type { InternalArena } from "webcraft";
import { stringMap, stringMapWithRamps } from "webcraft";

const base = {
	name: "The Target",
	// For jumping
	cliffs: stringMapWithRamps(
		`
		333333333333333333333333333333333
		3          2 22222222 2         3
		3         22222222222222        3
		3        r22222222222222r       3
		3        r22222222222222r       3
		3        r22222222222222r       3
		3        r22222222222222r       3
		3        r22222222222222r       3
		3        r22222222222222r       3
		3        r22222222222222r       3
		3        r22222222222222r       3
		3         22222222222222        3
		3          2 22222222 2         3
		333333333333333333333333333333333
    `,
		1,
	),
	// 0 = open space
	// 1 = crosser spawn
	// 2 = crosser target
	// 3 = defender spawn
	tiles: stringMap(`
		000000000000000000000000000000000
		000000000000000000000000000000000
		001000000000000000000000000000200
		001000000000000000000000000000200
		001000000000000000000000000000200
		001000000000000000000000000000200
		001000000000000000033330000000200
		001000000000000000033330000000200
		001000000000000000033330000000200
		001000000000000000000000000000200
		001000000000000000000000000000200
		001000000000000000000000000000200
		000000000000000000000000000000000
		000000000000000000000000000000000
    `),
};

// This makes it easy to develop a new arena, so leaving it here
// base.tiles = base.layers.map( r => r.map( () => 0 ) );
// base.tiles[ Math.floor( base.tiles.length / 2 ) ][ Math.floor( base.tiles[ 0 ].length / 2 ) ] = 1;

export const theTarget: InternalArena = base;
