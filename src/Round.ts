import type { Arena, Emitter, Sprite, TileType } from "webcraft";
import {
	emitter,
	Entity,
	logLine,
	PathingComponent,
	PathingSystem,
	TILE_TYPES,
	Timer,
	TimerWindow,
} from "webcraft";

import { arenas } from "./arenas/index";
import { Crosser } from "./entities/Crosser";
import { Defender } from "./entities/Defender";
import type { Unit } from "./entities/Unit";
import { currentKatma } from "./katmaContext";
import { elo, updateDisplay } from "./players/elo";
import { getPlaceholderPlayer } from "./players/placeholder";
import type { Player } from "./players/Player";
import { TileSystem } from "./systems/TileSystem";
import { isCrosser, isResource } from "./typeguards";
import type { Settings } from "./types";
import { resourceKeys, teamKeys } from "./types";

// A round starts upon construction
class Round {
	players: Player[];
	crossers: Player[] = [];
	defenders: Player[] = [];
	sprites: Sprite[] = [];
	scores = 0;

	lastUpdate: number;
	settings: Settings;
	arena: Arena;
	expireAt: number;

	timer: Entity;

	private tileSystem: TileSystem;
	private pathingSystem: PathingSystem;

	private ended = false;

	constructor({
		time,
		settings,
		players,
	}: {
		time: number;
		settings: Settings;
		players: Player[];
	}) {
		emitter(this);
		const katma = currentKatma();
		katma.round = this;
		this.lastUpdate = time;
		this.settings = settings;
		this.players = [...players];
		this.arena = arenas[settings.arenaIndex];
		this.expireAt = time + settings.duration;

		this.tileSystem = new TileSystem().addToApp(katma);
		this.pathingSystem = katma.pathingSystem = new PathingSystem({
			pathing: this.arena.pathing.slice().reverse(),
			layers: this.arena.pathingCliffs.slice().reverse(),
			resolution: 2,
		}).addToApp(katma);

		this.pickTeams();
		logLine(
			"Round started",
			this.crossers.map((p) => `${p.username}#${p.id}`),
			this.defenders.map((p) => `${p.username}#${p.id}`),
		);
		this.grantResources();
		this.spawnUnits();
		this.timer = new Entity();
		new Timer(this.timer, () => void 0, settings.duration);
		new TimerWindow(this.timer, "");
		katma.add(this.timer);
	}

	private addCrosser(player: Player): void {
		const katma = currentKatma();

		for (const crosser of this.crossers)
			katma.alliances.set(player, crosser, "ally", true);

		for (const defender of this.defenders)
			katma.alliances.set(player, defender, "enemy", true);

		this.crossers.push(player);
		player.crosserPlays++;
	}

	private addDefender(player: Player): void {
		const katma = currentKatma();

		for (const crosser of this.crossers)
			katma.alliances.set(player, crosser, "enemy", true);

		for (const defender of this.defenders)
			katma.alliances.set(player, defender, "ally", true);

		this.defenders.push(player);
	}

	pickTeams(): void {
		const katma = currentKatma();
		const remaining = [...this.players];
		while (remaining.length) {
			const lowPlays = Math.min(...remaining.map((p) => p.crosserPlays));
			const low = remaining.filter((p) => p.crosserPlays === lowPlays);

			const player = low.splice(
				Math.floor(katma.random() * low.length),
				1,
			)[0];
			remaining.splice(remaining.indexOf(player), 1);
			if (this.crossers.length < this.settings.crossers)
				this.addCrosser(player);
			else this.addDefender(player);
		}

		const placeholderPlaying = this.players.some((p) => p.id === -1);
		if (!placeholderPlaying)
			getPlaceholderPlayer().crosserPlays = this.players[0].crosserPlays;

		updateDisplay(katma);
	}

	grantResources(): void {
		for (const team of teamKeys)
			for (const player of this[team])
				for (const resource of resourceKeys)
					player.resources[resource] =
						this.settings.resources[team][resource].starting;
	}

	_spawnUnit(
		player: Player,
		UnitClass: typeof Unit,
		targetTile: TileType,
	): void {
		const katma = currentKatma();
		// Create the unit
		const unit = (player.unit = new UnitClass({
			owner: player,
			x: 0,
			y: 0,
		}));

		// Place it
		let maxTries = 8192;
		while (--maxTries) {
			// console.log("_spawnUnit", 1, maxTries);
			const xRand = katma.random() * this.pathingSystem.widthWorld;
			const yRand = katma.random() * this.pathingSystem.heightWorld;

			if (
				this.arena.tiles[this.arena.tiles.length - Math.ceil(yRand)][
					Math.floor(xRand)
				] !== targetTile
			)
				continue;

			const { x, y } = this.pathingSystem.nearestSpiralPathing(
				xRand,
				yRand,
				unit,
			);

			if (
				this.arena.tiles[this.arena.tiles.length - Math.ceil(y)][
					Math.floor(x)
				] === targetTile
			) {
				unit.position.setXY(x, y);
				new PathingComponent(unit);

				break;
			}
		}

		if (!maxTries) console.error("Exhausted placement attempts");

		// Select + pan to it
		if (player === katma.localPlayer) {
			katma.selectionSystem.select(unit);
			katma.graphics.panTo(unit.position, 0);
		}

		// Add event listeners
		if (player)
			unit.addEventListener("death", () => {
				player.unit = undefined;
				if (isCrosser(unit)) this.onCrosserRemoval();
			});
	}

	spawnUnits(): void {
		this.players.forEach((player) => {
			const isCrosser = this.crossers.includes(player);
			const targetTile = isCrosser ? TILE_TYPES.START : TILE_TYPES.SPAWN;
			const Unit = isCrosser ? Crosser : Defender;
			this._spawnUnit(player, Unit, targetTile);
		});
	}

	onCrosserRemoval(): void {
		if (this.crossers.some((p) => p.unit && p.unit.isAlive)) return;

		this.end();
	}

	end(skipElo = false): void {
		if (this.ended) return;
		logLine(
			"Round ended",
			this.crossers.map((p) => `${p.username}#${p.id}`),
			this.defenders.map((p) => `${p.username}#${p.id}`),
			this.scores,
		);
		this.ended = true;
		const katma = currentKatma();

		katma.remove(this.timer);

		if (!skipElo)
			elo({
				mode: katma.settings.mode,
				crossers: this.crossers,
				defenders: this.defenders,
				scores: this.scores,
				game: katma,
			});

		const innerCallback = () => {
			katma.removeSystem(this.tileSystem);
			katma.removeSystem(this.pathingSystem);
			katma.pathingSystem = undefined;
			this.removeEventListeners();
			katma.round = undefined;
		};

		const outerCallback = () => {
			[...this.sprites].forEach((sprite) => sprite.kill());

			if (skipElo) innerCallback();
			else katma.setTimeout(innerCallback, 0.25);
		};

		if (skipElo) outerCallback();
		else katma.setTimeout(outerCallback, 1);

		if (katma.newPlayers) {
			katma.newPlayers = false;
			logLine("synchronizing");
			katma.synchronizationState = "synchronizing";

			if (katma.isHost) katma.transmit({ type: "state", state: katma });
		} else katma.lastRoundEnd = katma.lastUpdate;
	}

	updateResources(delta: number): void {
		const factor =
			this.crossers.reduce(
				(sum, p) =>
					sum +
					p.sprites.reduce(
						(sum, s) => sum + (isResource(s) ? 1 : 0),
						0,
					),
				1,
			) / 2;

		for (const team of teamKeys)
			for (const player of this[team])
				for (const resource of resourceKeys)
					player.resources[resource] =
						(player.resources[resource] ?? 0) +
						this.settings.resources[team][resource].rate *
							delta *
							factor;
	}

	update(time: number): void {
		// meta info
		const delta = time - this.lastUpdate;
		if (isNaN(delta)) throw new Error(`delta=${delta}`);
		this.lastUpdate = time;

		// End of round
		if (time > this.expireAt)
			this.crossers.forEach((c) => c.unit && c.unit.kill());

		this.updateResources(delta);
	}

	toJSON(): {
		crossers: number[];
		defenders: number[];
		expireAt: number;
		lastUpdate: number;
		sprites: ReturnType<typeof Sprite.prototype.toJSON>[];
	} {
		return {
			crossers: this.crossers.map((c) => c.id),
			defenders: this.defenders.map((d) => d.id),
			expireAt: this.expireAt,
			lastUpdate: this.lastUpdate,
			sprites: this.sprites.map((s) => s.toJSON()),
		};
	}
}

type RoundEvents = {
	empty: never;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Round extends Emitter<RoundEvents> {}

export { Round };
