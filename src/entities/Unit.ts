import type { UnitProps as EngineUnitProps } from "webcraft";
import { Unit as EngineUnit } from "webcraft";

import type { Player } from "../players/Player";

export type UnitProps = EngineUnitProps;

export class Unit extends EngineUnit {
	owner!: Player;
}
