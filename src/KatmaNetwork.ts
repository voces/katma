import type {
	ConnectionEvent,
	Emitter,
	EntityID,
	InitEvent,
	PlayerEvent,
	StateEvent,
} from "webcraft";
import { activeHost, Network } from "webcraft";

import type { Katma } from "./Katma";

type KatmaInitEvent = InitEvent & {
	state: ReturnType<Katma["toJSON"]>;
};

type KatmaStateEvent = StateEvent & {
	state: ReturnType<Katma["toJSON"]>;
};

export type SelfDestructEvent = PlayerEvent & {
	type: "selfDestruct";
	connection: number;
	sprites: EntityID[];
};

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
const networkEvents = {
	...Network.networkEvents,
	init: (data: KatmaInitEvent) => {},
	state: (data: KatmaStateEvent) => {},
	selfDestruct: (data: SelfDestructEvent) => {},
} as const;
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

export type NetworkEventCallback = typeof networkEvents;

class KatmaNetwork extends Network implements Emitter<NetworkEventCallback> {
	static networkEvents = networkEvents;

	// These are implemented via calling emitter(this)
	addEventListener!: Emitter<NetworkEventCallback>["addEventListener"];
	removeEventListener!: Emitter<NetworkEventCallback>["removeEventListener"];
	removeEventListeners!: Emitter<NetworkEventCallback>["removeEventListeners"];
	dispatchEvent!: Emitter<NetworkEventCallback>["dispatchEvent"];
}

export { activeHost, ConnectionEvent, KatmaNetwork };
