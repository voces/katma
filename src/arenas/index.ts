import { processArena } from "webcraft";

import { theDump } from "./theDump";
import { theFarm } from "./theFarm";
import { theGap } from "./theGap";
import { theRock } from "./theRock";
import { theTamedWoods } from "./theTamedWoods";
import { theTarget } from "./theTarget";
import { theTinyRectangle } from "./theTinyRectangle";
import { theWoods } from "./theWoods";

export const arenas = [
	theDump,
	theFarm,
	theGap,
	theRock,
	theTamedWoods,
	theTarget,
	theTinyRectangle,
	theWoods,
].map(processArena);
