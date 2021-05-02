import type { Action } from "webcraft";
import {
	Animation,
	Hover,
	MeshBuilderComponent,
	PathingComponent,
	Selected,
} from "webcraft";

import { destroyLastBox } from "../actions/destroyLastBox";
import { currentKatma } from "../katmaContext";
import { Basic } from "./obstructions/Basic";
import { Dense } from "./obstructions/Dense";
import { Huge } from "./obstructions/Huge";
import { Large } from "./obstructions/Large";
import type { Obstruction } from "./obstructions/Obstruction";
import { Resource } from "./obstructions/Resource";
import { Slow } from "./obstructions/Slow";
import { Stack } from "./obstructions/Stack";
import { Tiny } from "./obstructions/Tiny";
import type { UnitProps } from "./Unit";
import { Unit } from "./Unit";

export class Crosser extends Unit {
	static readonly isCrosser = true;

	static defaults = {
		...Unit.defaults,
		priority: 1,
		collisionRadius: 0.5,
		builds: [Basic, Dense, Huge, Large, Resource, Slow, Stack, Tiny],
	};

	// 380 in WC3 on fast
	speed = 5.9375;
	obstructions: Obstruction[] = [];

	constructor(props: UnitProps) {
		super({ ...Crosser.clonedDefaults, ...props });

		this.addEventListener("death", () => {
			// Kill all their sprites
			[...this.owner.sprites].forEach((sprite) => sprite.kill());

			// Cancel any active placements
			currentKatma().obstructionPlacement?.stop();
		});
	}

	ascend(): void {
		this.invulnerable = true;
		if (this.owner) {
			const index = this.owner.sprites.indexOf(this);
			if (index >= 0) this.owner.sprites.splice(index, 1);
		}

		// Active components we want to clear right away
		this.stop();
		this.clear(Selected);
		this.clear(Hover);
		this.clear(PathingComponent);

		const game = currentKatma();

		// Cancel any active placements
		game.obstructionPlacement?.stop();

		const meshBuilderComponent = this.get(MeshBuilderComponent)[0];
		if (meshBuilderComponent) new Animation(this, "explode", 0.25);

		game.setTimeout(() => this.remove(), 0.25);
	}

	get actions(): Action[] {
		const actions = super.actions;
		actions.push(destroyLastBox);
		return actions;
	}
}
