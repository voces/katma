import type { Action } from "webcraft";
import { mirrorAction } from "webcraft";

import type { UnitProps } from "./Unit";
import { Unit } from "./Unit";

type DefenderProps = UnitProps & {
	autoAttack?: boolean;
};

export class Defender extends Unit {
	static readonly isDefender = true;

	static defaults = {
		...Unit.defaults,
		maxHealth: Number.MAX_VALUE,
		speed: 6.5625,
		weapon: {
			enabled: true,
			damage: 50,
			cooldown: 1.5,
			// todo: add backswing (time before damage) and recovery (time after damage where the unit can't do anything)
			last: 0,
			range: 0.65,
			projectile: "swing" as const,
			damagePoint: 0.5,
			rangeMotionBuffer: 2.75,
		},
		autoAttack: true,
	};

	autoAttack: boolean;

	constructor({
		autoAttack = Defender.defaults.autoAttack,
		...props
	}: DefenderProps) {
		super({ ...Defender.clonedDefaults, ...props });
		this.autoAttack = autoAttack;
	}

	get actions(): Action[] {
		const actions = super.actions;
		if (!this.isIllusion) actions.push(mirrorAction);
		return actions;
	}
}
