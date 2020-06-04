import { WORLD_TO_GRAPHICS_RATIO } from "../constants.js";
import { tweenPoints } from "../util/tweenPoints.js";
import { Unit, UnitProps } from "./Unit.js";
import { dragSelect } from "./dragSelect.js";
import { game } from "../index.js";
import {
	stop as stopPlacement,
	active as activePlacement,
} from "./obstructionPlacement.js";
import { appendErrorMessage } from "../ui/chat.js";
import { Point } from "../pathing/PathingMap.js";
import { Sprite } from "./Sprite.js";
import { Obstruction, ObstructionSubclass } from "./obstructions/index.js";
import { Blueprint } from "./obstructions/Blueprint.js";

// Math.SQRT2 (~1.41) allows building tinies across diag space
const BUILD_DISTANCE = 1.4;

export class Crosser extends Unit {
	static isCrosser = (sprite: Crosser | Sprite): sprite is Crosser =>
		sprite instanceof Crosser;

	static defaults = {
		...Unit.defaults,
		radius: 0.5,
		priority: 1,
	};

	// 380 in WC3 on fast
	speed = 5.9375;
	obstructions: Obstruction[] = [];

	constructor(props: UnitProps) {
		super({ ...Crosser.defaults, ...props });

		this.addEventListener("death", () => {
			// Kill all their sprites
			[...this.owner.sprites].forEach((sprite) => sprite.kill());

			// Cancel any active placements
			if (activePlacement()) stopPlacement();
		});
	}

	buildAt(target: Point, ObstructionClass: ObstructionSubclass): void {
		let renderProgress = 0;
		let path = tweenPoints(this.round.pathingMap.path(this, target));
		const blueprint =
			this.owner === game.localPlayer
				? new Blueprint({
						...target,
						radius: ObstructionClass.defaults.radius,
				  })
				: undefined;

		this.action = {
			update: (delta) => {
				const updateProgress = delta * this.speed;
				const { x, y } = path(updateProgress);
				if (isNaN(x) || isNaN(y))
					throw new Error(`Returning NaN location x=${x} y=${y}`);

				const actualDistance = Math.sqrt(
					(x - target.x) ** 2 + (y - target.y) ** 2,
				);
				if (actualDistance < BUILD_DISTANCE) {
					this.action = undefined;

					if (ObstructionClass.defaults.cost) {
						const check = game.localPlayer.checkResources(
							ObstructionClass.defaults.cost,
						);
						if (check?.length) {
							appendErrorMessage(`Not enough ${check.join(" ")}`);
							return;
						}

						game.localPlayer.subtractResources(
							ObstructionClass.defaults.cost,
						);
					}

					const obstruction = new ObstructionClass({
						x: target.x,
						y: target.y,
						owner: this.owner,
					});

					this.round.pathingMap.withoutEntity(this, () => {
						if (
							this.round.pathingMap.pathable(
								obstruction,
								target.x,
								target.y,
							)
						) {
							this.round.pathingMap.addEntity(obstruction);
							this.obstructions.push(obstruction);
						} else obstruction.kill({ removeImmediately: true });

						const { x, y } = path.radialStepBack(BUILD_DISTANCE);
						this.setPosition(
							this.round.pathingMap.nearestSpiralPathing(
								x,
								y,
								this,
							),
						);
					});

					// We're never going to get there
				} else if (path.distance < updateProgress) {
					this.action = undefined;
					this.setPosition(x, y);
				} else {
					// Update self
					this._setPosition(x, y);

					// Start new build path
					path = tweenPoints(
						this.round.pathingMap.path(this, target),
					);
					renderProgress = 0;
				}
			},
			render: (delta) => {
				renderProgress += delta * this.speed;
				const { x, y } = path(renderProgress);
				this.elem.style.left =
					(x - this.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
				this.elem.style.top =
					(y - this.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
			},
			cleanup: () =>
				blueprint && blueprint.kill({ removeImmediately: true }),
			toJSON: () => ({
				name: "buildAt",
				obstruction: Obstruction.name,
				target,
				path,
			}),
		};
	}

	ascend(): void {
		this._health = 0;
		this.action = undefined;
		dragSelect.removeSelectables([this]);
		if (this._selected)
			dragSelect.setSelection(
				dragSelect.selection.filter((u) => u !== this),
			);
		if (this.owner) {
			const index = this.owner.sprites.indexOf(this);
			if (index >= 0) this.owner.sprites.splice(index, 1);
		}

		if (game.round) {
			game.round.pathingMap.removeEntity(this);
			const index = game.round.sprites.indexOf(this);
			if (index >= 0) game.round.sprites.splice(index, 1);
		}

		// Cancel any active placements
		if (activePlacement()) stopPlacement();

		this.elem.classList.add("ascend");

		this.round.setTimeout(() => this.remove(), 1);
	}
}
