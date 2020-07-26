import { Unit, UnitProps } from "./Unit.js";
import { dragSelect } from "./dragSelect.js";
import {
	stop as stopPlacement,
	active as activePlacement,
} from "./obstructionPlacement.js";
import { Sprite } from "./Sprite.js";
import {
	Obstruction,
	Basic,
	Dense,
	Huge,
	Large,
	Resource,
	Slow,
	Stack,
	Tiny,
} from "./obstructions/index.js";
import { Action } from "./spriteLogic.js";
import { MoveTargetManager } from "../components/MoveTarget.js";
import { AttackTargetManager } from "../components/AttackTarget.js";
import { BuildTargetManager } from "../components/BuildTarget.js";
import { HoldPositionManager } from "../components/HoldPositionComponent.js";
import { GraphicComponentManager } from "../components/graphics/GraphicComponent.js";
import {
	Animation,
	AnimationManager,
} from "../components/graphics/Animation.js";
import { Selected } from "../components/Selected.js";

const destroyLastBox: Action = {
	name: "Destroy box",
	description: "Destroys selected or last created box",
	hotkey: "x" as const,
	type: "custom" as const,
	handler: ({ player }): void => {
		const crosser = player.unit;
		if (!crosser || !Crosser.isCrosser(crosser)) return;
		const obstructions = [...crosser.obstructions];
		while (obstructions.length) {
			const obstruction = obstructions.pop();
			if (obstruction && obstruction.health > 0) {
				player.game.transmit({
					type: "kill",
					sprites: [obstruction.id],
				});
				break;
			}
		}
	},
};

export class Crosser extends Unit {
	static isCrosser = (sprite: Sprite): sprite is Crosser =>
		sprite instanceof Crosser;

	static defaults = {
		...Unit.defaults,
		priority: 1,
		radius: 0.5,
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
			if (activePlacement()) stopPlacement();
		});
	}

	ascend(): void {
		this.invulnerable = true;
		dragSelect.removeSelectables([this]);
		if (Selected.has(this))
			dragSelect.setSelection(
				dragSelect.selection.filter((u) => u !== this),
			);
		if (this.owner) {
			const index = this.owner.sprites.indexOf(this);
			if (index >= 0) this.owner.sprites.splice(index, 1);
		}

		MoveTargetManager.delete(this);
		AttackTargetManager.delete(this);
		BuildTargetManager.delete(this);
		HoldPositionManager.delete(this);

		this.round.pathingMap.removeEntity(this);
		const index = this.round.sprites.indexOf(this);
		if (index >= 0) this.round.sprites.splice(index, 1);

		// Cancel any active placements
		if (activePlacement()) stopPlacement();

		const graphicComponent = GraphicComponentManager.get(this);
		if (graphicComponent)
			AnimationManager.set(this, new Animation(this, "ascend", 1));

		this.round.setTimeout(() => this.remove(), 1);
	}

	get actions(): Action[] {
		const actions = super.actions;
		actions.push(destroyLastBox);
		return actions;
	}
}
