import type {
	Action,
	ObstructionProps as EngineObstructionProps,
} from "webcraft";
import { Obstruction as EngineObstruction } from "webcraft";

import { selfDestructAction } from "../../actions/selfDestruct";
import type { Resource } from "../../types";

export type ObstructionProps = EngineObstructionProps<Resource>;

export class Obstruction extends EngineObstruction<Resource> {
	get actions(): Action[] {
		const actions = super.actions;
		actions.push(selfDestructAction);
		return actions;
	}
}
