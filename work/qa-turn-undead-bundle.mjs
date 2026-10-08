import assert from "node:assert/strict";
//#region src/game/resistances.ts
const RESISTANCE_ELEMENTS = [
	"fire",
	"lightning",
	"ice",
	"arcane",
	"darkness",
	"holy",
	"poison",
	"ember"
];
const RESISTANCE_LABELS = {
	fire: "Fire",
	lightning: "Lightning",
	ice: "Ice",
	arcane: "Arcane",
	darkness: "Darkness",
	holy: "Holy",
	poison: "Poison",
	ember: "Ember"
};
/** Stored resistance stays uncapped: penetration is subtracted before clamping. */
function effectiveResistance(resistance, mag = 0, penalty = 0) {
	return Math.max(-50, Math.min(100, resistance - penalty - mag / 2));
}
/** Round once, after resistance; full immunity must be able to produce zero damage. */
function elementalDamage(baseDamage, resistance, mag = 0, penalty = 0) {
	return Math.max(0, baseDamage) * (1 - effectiveResistance(resistance, mag, penalty) / 100);
}
function sumResistances(...sources) {
	return Object.fromEntries(RESISTANCE_ELEMENTS.map((element) => [element, sources.reduce((sum, source) => sum + (source?.[element] ?? 0), 0)]));
}
const SPELL_CLASSIFICATION = {
	fireball: "fire",
	iceStorm: "ice",
	frost: "ice",
	bless: "utility",
	provoke: "utility",
	cureMinor: "utility",
	cureWounds: "utility",
	cureLight: "utility",
	longShot: "physical",
	bloodyShot: "physical",
	piercing: "physical",
	lightning: "lightning",
	lightningTier3: "lightning",
	magicMissile: "arcane",
	magicMissileV2: "arcane",
	causticVenom: "poison",
	divineBolt: "holy",
	minorVenom: "poison",
	doubleStrike: "physical",
	cleave: "physical",
	cureDisease: "utility",
	piercingThrust: "physical",
	sweep: "physical",
	trip: "physical",
	summonFamiliar: "utility",
	phantasmalForce: "arcane",
	fantomForce: "arcane",
	summonFamiliar2: "utility",
	summonFamiliar3: "utility",
	summonFamiliar4: "utility",
	summonZombieDog: "utility",
	lifeDrain: "darkness",
	webOfDreams: "arcane",
	multiShot: "physical",
	secondWind: "utility",
	auraOfProtection: "utility",
	divineWrath: "holy",
	shoulderSmash: "physical",
	intimidatingPresence: "utility",
	stampede: "physical",
	shock: "lightning",
	bullRush: "physical",
	executionerStrike: "physical",
	shieldBash: "physical",
	poisonBreath: "poison",
	tendrilSwipe: "physical",
	burningHands: "fire",
	createFoodAndWater: "utility",
	turnUndead: "holy"
};
function spellElement(kind) {
	if (!kind) return void 0;
	const classification = SPELL_CLASSIFICATION[kind];
	return classification === "physical" || classification === "utility" ? void 0 : classification;
}
//#endregion
//#region src/game/types.ts
const TIER_KEYS = [
	"tier1",
	"tier2",
	"tier3",
	"tier4",
	"tier5",
	"tier6",
	"tier7",
	"tier8",
	"tier9",
	"tier10"
];
//#endregion
//#region src/game/encounter-npcs.ts
const ENCOUNTER_NPC_IDS = [
	"roadCartographer",
	"mushroomForager",
	"bellCollector",
	"mothKeeper",
	"charcoalBurner",
	"wanderingTinker",
	"marshTrapper",
	"ratCatcher",
	"maskedPhysician",
	"shadowScholar",
	"swampFerryman",
	"lostCourier"
];
const ENCOUNTER_NPC_CLASSES = {
	roadCartographer: {
		id: "roadCartographer",
		name: "Nara, Cartógrafa das Trilhas",
		role: "Cartógrafa itinerante",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "roadCartographer",
		size: 1,
		init: 8
	},
	mushroomForager: {
		id: "mushroomForager",
		name: "Bento, Catador de Cogumelos",
		role: "Coletor desconfiado",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "mushroomForager",
		size: 1,
		init: 8
	},
	bellCollector: {
		id: "bellCollector",
		name: "Baltasar, Colecionador de Sinos",
		role: "Excêntrico — ouvinte do invisível",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "bellCollector",
		size: 1,
		init: 8
	},
	mothKeeper: {
		id: "mothKeeper",
		name: "Ofélia, Guardiã das Mariposas",
		role: "Excêntrica — guardiã noturna",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "mothKeeper",
		size: 1,
		init: 8
	},
	charcoalBurner: {
		id: "charcoalBurner",
		name: "Dário, Carvoeiro",
		role: "Trabalhador da floresta",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "charcoalBurner",
		size: 1,
		init: 8
	},
	wanderingTinker: {
		id: "wanderingTinker",
		name: "Ada, Funileira Ambulante",
		role: "Artesã de estrada",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "wanderingTinker",
		size: 1,
		init: 8
	},
	marshTrapper: {
		id: "marshTrapper",
		name: "Gaspar, Caçador dos Brejos",
		role: "Armadilheiro de estrada",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "marshTrapper",
		size: 1,
		init: 8
	},
	ratCatcher: {
		id: "ratCatcher",
		name: "Tereza, Caça-Ratos",
		role: "Excêntrica — exterminadora itinerante",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "ratCatcher",
		size: 1,
		init: 8
	},
	maskedPhysician: {
		id: "maskedPhysician",
		name: "Severino, Médico da Máscara",
		role: "Excêntrico — médico da peste",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "maskedPhysician",
		size: 1,
		init: 8
	},
	shadowScholar: {
		id: "shadowScholar",
		name: "Erasmo, Estudioso da Própria Sombra",
		role: "Excêntrico — erudito errante",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "shadowScholar",
		size: 1,
		init: 8
	},
	swampFerryman: {
		id: "swampFerryman",
		name: "Rúben, Barqueiro do Brejo",
		role: "Guia de travessias",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "swampFerryman",
		size: 1,
		init: 8
	},
	lostCourier: {
		id: "lostCourier",
		name: "Lia, Mensageira Perdida",
		role: "Mensageira obstinada",
		hp: 12,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "lostCourier",
		size: 1,
		init: 8
	}
};
const ENCOUNTER_NPC_GROWTH = {
	roadCartographer: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	mushroomForager: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	bellCollector: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	mothKeeper: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	charcoalBurner: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	wanderingTinker: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	marshTrapper: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	ratCatcher: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	maskedPhysician: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	shadowScholar: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	swampFerryman: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	lostCourier: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	}
};
function fullness(value) {
	return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(120, value)) : 100;
}
function drainHunger(value, cost) {
	return Math.max(0, fullness(value) - cost);
}
//#endregion
//#region src/game/data.ts
/**
* How far a sprite lifts off its hex while standing on high ground, as a fraction of
* the hex width.
*
* A fraction and not a pixel count because the board draws at four zoom levels (see
* ZOOM_RADII in ./engine): twenty pixels reads as a real step up at the closest zoom
* and as nothing at the widest, whereas a fraction of the hex holds its proportion at
* all four.
*
* Purely presentational. The unit's grid coordinates do not move, the order sprites
* draw in still sorts on the logical row, and the shadow stays on the hex — the gap
* that opens between the feet and the shadow is the whole of the effect.
*/
const HIGH_GROUND_LIFT = .18;
const TERRAIN = {
	plains: {
		id: "plains",
		name: "Planície",
		moveCost: 1,
		def: 0,
		atk: 0,
		passable: true
	},
	woods: {
		id: "woods",
		name: "Bosque",
		moveCost: 2,
		def: 1,
		atk: 0,
		passable: true
	},
	ruins: {
		id: "ruins",
		name: "Ruínas",
		moveCost: 1,
		def: 2,
		atk: 0,
		passable: true
	},
	water: {
		id: "water",
		name: "Água",
		moveCost: 99,
		def: 0,
		atk: 0,
		passable: false
	},
	ember: {
		id: "ember",
		name: "Brasa",
		moveCost: 2,
		def: 0,
		atk: 0,
		passable: true,
		hazardDice: 1,
		hazardFaces: 6
	},
	hill: {
		id: "hill",
		name: "Colina",
		moveCost: 2,
		def: 1,
		atk: 2,
		passable: true,
		height: 1
	},
	flame: {
		id: "flame",
		name: "Chama",
		moveCost: 3,
		def: 0,
		atk: 0,
		passable: true,
		hazardDice: 1,
		hazardFaces: 8
	},
	column: {
		id: "column",
		name: "Coluna",
		moveCost: 99,
		def: 0,
		atk: 0,
		passable: false,
		blocksShot: true
	},
	nave: {
		id: "nave",
		name: "Laje",
		moveCost: 1,
		def: 0,
		atk: 0,
		passable: true
	},
	barricade: {
		id: "barricade",
		name: "Barricada",
		moveCost: 99,
		def: 0,
		atk: 0,
		passable: false,
		blocksShot: true
	},
	door: {
		id: "door",
		name: "Porta trancada",
		moveCost: 99,
		def: 0,
		atk: 0,
		passable: false,
		blocksShot: true
	},
	snow: {
		id: "snow",
		name: "Neve",
		moveCost: 1,
		def: 0,
		atk: 0,
		passable: true
	},
	/** Pure void — a building block for closed/indoor maps: apaga o terreno e nem se atravessa, nem se vê através. */
	void: {
		id: "void",
		name: "Vazio",
		moveCost: 99,
		def: 0,
		atk: 0,
		passable: false,
		blocksShot: true
	}
};
/** Tipo 2 — a plain side-by-side pair, no hex behind (e.g. o Lobo Morveniano). */
const FOOTPRINT_TYPE_2 = [{
	dx: 0,
	dy: 0
}, {
	dx: 1,
	dy: 0
}];
/** Tipo 4 — two hexes at the legs/front row and two above under the torso/head. */
const FOOTPRINT_TYPE_4 = [
	{
		dx: 0,
		dy: 0
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: 0,
		dy: -1
	},
	{
		dx: 1,
		dy: -1
	}
];
/** Tipo 3 — a normal side-by-side pair plus one hex behind, on the creature's back (e.g. o Cão de guerra). */
const FOOTPRINT_TYPE_3 = [
	{
		dx: 0,
		dy: 0
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: 0,
		dy: -1
	}
];
/** Tipo 8 — a 2-wide/3-tall block plus one hex above the head and one at the arms row (Troll, Asherah).
* Exported so the renderer can key its "big creature" draw-size correction off the footprint
* shape itself (reference equality) instead of a hardcoded classId, the same size correction
* applying to every Type 8 creature by default rather than needing a one-off per class. */
const FOOTPRINT_TYPE_8 = [
	{
		dx: 0,
		dy: 0
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: -1,
		dy: -1
	},
	{
		dx: 0,
		dy: -1
	},
	{
		dx: 1,
		dy: -1
	},
	{
		dx: 0,
		dy: -2
	},
	{
		dx: 1,
		dy: -2
	},
	{
		dx: 0,
		dy: -3
	}
];
/** Tipo 7 — Type 8 without hex 8 (the lone hex above the head, which sat on empty ground for
* the Horror's sprite). Its own constant, not a mutation of FOOTPRINT_TYPE_8 — that shape stays
* exactly as defined for every creature still using it. Hex 3 (the left-arm hex) is still under
* review; do not move it without explicit confirmation of its target cell. */
const FOOTPRINT_TYPE_7 = [
	{
		dx: 0,
		dy: 0
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: -1,
		dy: -1
	},
	{
		dx: 0,
		dy: -1
	},
	{
		dx: 1,
		dy: -1
	},
	{
		dx: 0,
		dy: -2
	},
	{
		dx: 1,
		dy: -2
	}
];
/** Tipo 6 — Familiar Titã: a broad 3–3 body. The rear row is shifted one hex left so the
* upper-right outer body cell sits toward the tail-side instead of tapering to a single tail. */
const FOOTPRINT_TYPE_6 = [
	{
		dx: -1,
		dy: 0
	},
	{
		dx: 0,
		dy: 0
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: -2,
		dy: -1
	},
	{
		dx: -1,
		dy: -1
	},
	{
		dx: 0,
		dy: -1
	}
];
const DECO_PAIR = [{
	dx: 0,
	dy: 0
}, {
	dx: 1,
	dy: 0
}];
const DECO_TRIO = [
	{
		dx: 0,
		dy: 0
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: 0,
		dy: -1
	}
];
const DECO_ROW_FIVE = [
	{
		dx: 0,
		dy: 0
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: 2,
		dy: 0
	},
	{
		dx: 3,
		dy: 0
	},
	{
		dx: 4,
		dy: 0
	}
];
const DECO_QUAD = [
	{
		dx: 0,
		dy: 0
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: 2,
		dy: 0
	},
	{
		dx: 3,
		dy: 0
	}
];
const DECO_ONE = [{
	dx: 0,
	dy: 0
}];
const DECO_BLOCK_5 = [
	{
		dx: 0,
		dy: 0
	},
	{
		dx: 1,
		dy: 0
	},
	{
		dx: -1,
		dy: -1
	},
	{
		dx: 0,
		dy: -1
	},
	{
		dx: 1,
		dy: -1
	}
];
const HOUSE_GROUND_FOOTPRINT = [
	...DECO_BLOCK_5,
	{
		dx: -1,
		dy: -2
	},
	{
		dx: 0,
		dy: -2
	},
	{
		dx: 1,
		dy: -2
	},
	{
		dx: 0,
		dy: -3
	}
];
const BURNT_HOUSE_GROUND_FOOTPRINT = [
	...FOOTPRINT_TYPE_6,
	{
		dx: -2,
		dy: -2
	},
	{
		dx: -1,
		dy: -2
	},
	{
		dx: 0,
		dy: -2
	},
	{
		dx: -2,
		dy: -3
	},
	{
		dx: -1,
		dy: -3
	}
];
const DECO_BLOCK_3X3 = [
	0,
	1,
	2
].flatMap((dy) => [
	0,
	1,
	2
].map((dx) => ({
	dx,
	dy: dy - 1
})));
/** Props from the two supplied Wilds sheets. They remain manually placed editor art. */
function decorationSet(entries, pairIds = /* @__PURE__ */ new Set()) {
	return Object.fromEntries(entries.map(([id, name]) => [id, {
		id,
		name,
		footprint: pairIds.has(id) ? DECO_PAIR : DECO_ONE
	}]));
}
const WILDS_DECORATIONS = decorationSet([
	["wilds-twisted-tree", "Árvore retorcida"],
	["wilds-mossy-shrine", "Oratório musgoso"],
	["wilds-lantern-post", "Poste com lanterna"],
	["wilds-ivy-arch", "Arco coberto de hera"],
	["wilds-palisade", "Paliçada antiga"],
	["wilds-ancient-boulder", "Pedra ancestral"],
	["wilds-fallen-log", "Tronco caído selvagem"],
	["wilds-campfire-cauldron", "Caldeirão de acampamento"],
	["wilds-broken-wheel", "Roda quebrada"],
	["wilds-ruined-wayside-shrine", "Santuário de estrada"],
	["wilds-weathered-signpost", "Placa de caminho"],
	["wilds-rope-bridge", "Ponte de corda"],
	["wilds-root-arch", "Arco de raízes"],
	["wilds-stone-steps", "Escadaria musgosa"],
	["wilds-wishing-well", "Poço antigo"],
	["wilds-gibbet-tree", "Árvore com gaiola"],
	["wilds-dead-oak", "Carvalho morto"],
	["wilds-wisp-waystone", "Marco dos Wisps"],
	["wilds-wisp-shrine", "Altar Esquecido"],
	["wilds-wisp-lantern-marker", "Lanterna dos Wisps"],
	["wilds-wisp-mushrooms", "Cogumelos Luminosos dos Wisps"],
	["wilds-hollow-tree-001", "Árvore oca — arco profundo"],
	["wilds-hollow-tree-002", "Árvore oca — tronco duplo"],
	["wilds-hollow-tree-003", "Árvore oca — tronco inclinado"],
	["wilds-gothic-arch", "Arco gótico em ruínas"],
	["wilds-lantern-signpost", "Marco com lanterna"],
	["wilds-lichen-boulder", "Rochedo com líquen"],
	["wilds-ivy-statue", "Estátua coberta de hera"],
	["wilds-abandoned-cart", "Carroça abandonada"],
	["wilds-candle-menhir", "Menir das velas"],
	["wilds-moss-bridge", "Ponte musgosa"]
], /* @__PURE__ */ new Set([
	"wilds-abandoned-cart",
	"wilds-ancient-boulder",
	"wilds-lichen-boulder",
	"wilds-candle-menhir"
]));
WILDS_DECORATIONS["wilds-twisted-tree"] = {
	...WILDS_DECORATIONS["wilds-twisted-tree"],
	artScale: 1.4,
	artOffsetX: .0415
};
WILDS_DECORATIONS["wilds-dead-oak"] = {
	...WILDS_DECORATIONS["wilds-dead-oak"],
	artScale: 2
};
WILDS_DECORATIONS["wilds-lantern-signpost"] = {
	...WILDS_DECORATIONS["wilds-lantern-signpost"],
	aboveTacticalOverlays: true
};
const TORTURE_TWO_HEX = /* @__PURE__ */ new Set([
	...Array.from({ length: 12 }, (_, index) => `torture-gear-${String(index + 1).padStart(2, "0")}`),
	"torture-gear-14",
	"torture-gear-15"
]);
const TORTURE_DECORATIONS = decorationSet(Array.from({ length: 44 }, (_, index) => index + 1).filter((number) => number !== 13 && number !== 22 && number !== 30).map((number) => {
	const serial = String(number).padStart(2, "0");
	return [`torture-gear-${serial}`, `Equipamento de tortura ${serial}`];
}), TORTURE_TWO_HEX);
const CITY_DECORATIONS = decorationSet([
	["city-gate-banner", "Portão com estandarte"],
	["city-palisade-banner", "Paliçada com estandarte"],
	["city-spike-barricade-large", "Barricada de estacas grande"],
	["city-spike-barricade", "Barricada de estacas"],
	["city-palisade-frame", "Moldura de paliçada"],
	["city-wooden-barricade", "Barricada de madeira"],
	["city-banner-barricade", "Barricada com bandeira"],
	["city-spike-barricade-low", "Estacas baixas"],
	["city-wattle-fence", "Cerca trançada"],
	["city-stone-banner-wall", "Muralha baixa com estandarte"],
	["city-banner-post", "Mastro de estandarte"],
	["city-lantern-post", "Poste de lanterna"],
	["city-well", "Poço da cidade"],
	["city-signpost", "Placa direcional"],
	["city-market-stall", "Barraca de mercado"],
	["city-supply-cart", "Carroça de suprimentos"],
	["city-covered-wagon", "Carroça coberta"],
	["city-covered-crate", "Caixa coberta"],
	["city-workbench", "Bancada"],
	["city-execution-block", "Bloco de execução"],
	["city-provisions", "Mantimentos"],
	["city-log-stack", "Pilha de lenha"],
	["city-campfire", "Fogueira"],
	["city-barrels", "Barris"],
	["city-stool", "Banco de madeira"],
	["city-shrineCandle", "Oratório urbano com velas"],
	["city-stone-pillar", "Pilar de pedra"],
	["city-notice-post", "Poste de avisos"],
	["city-ring-pillar", "Pilar com argola"],
	["city-brazier", "Braseiro"],
	["city-clothesline", "Varal"],
	["city-wheelbarrow", "Carrinho de mão"],
	["city-gallows-cages", "Forca com gaiolas"],
	["city-gallows-cages2", "Forca com gaiolas II"]
], /* @__PURE__ */ new Set(["city-supply-cart", "city-covered-wagon"]));
CITY_DECORATIONS["city-stool"] = {
	...CITY_DECORATIONS["city-stool"],
	artScale: 2 / 3
};
/** How much bigger decoration art is drawn than the box that fits its footprint hexes. Props
* used to be squeezed into their own hex and read as tiny; they now overhang their
* neighbours. Purely visual — the footprint (what the prop blocks) is unchanged, and the art
* grows from its ground line so it still stands on the same spot. Houses use HOUSE_ART_SCALE
* instead (their art is already drawn at 3x). Shared by the 3D renderer and the 2D path so
* they stay in sync. */
const DECOR_ART_SCALE = 1.2;
/** Houses (already drawn at 3x) get their own, smaller boost instead of DECOR_ART_SCALE. */
const HOUSE_ART_SCALE = 1.35;
const NEW_DECOR_2026 = {
	"light-candle": {
		id: "light-candle",
		name: "Vela",
		footprint: DECO_ONE,
		artScale: .5
	},
	"light-wall-torch": {
		id: "light-wall-torch",
		name: "Tocha de Parede",
		footprint: DECO_ONE
	},
	"light-brazier-bowl": {
		id: "light-brazier-bowl",
		name: "Braseiro II",
		footprint: DECO_ONE
	},
	"light-fireplace": {
		id: "light-fireplace",
		name: "Lareira",
		footprint: DECO_ONE,
		artScale: 2,
		unitLayer: "behind"
	},
	"inn-fireplace": {
		id: "inn-fireplace",
		name: "Lareira de Pedra da Estalagem",
		footprint: DECO_ONE,
		artScale: 2,
		unitLayer: "behind"
	},
	"inn-herb-shelf": {
		id: "inn-herb-shelf",
		name: "Prateleira de Ervas e Jarras",
		footprint: DECO_ONE,
		artScale: .85,
		unitLayer: "behind"
	},
	"inn-provisions-display": {
		id: "inn-provisions-display",
		name: "Mantimentos Pendentes da Estalagem",
		footprint: DECO_ONE,
		artScale: .9,
		unitLayer: "behind"
	},
	"forest-mossy-stump": {
		id: "forest-mossy-stump",
		name: "Toco Musgoso com Raízes",
		footprint: DECO_ONE,
		heightScale: .84
	},
	"forest-amanitas": {
		id: "forest-amanitas",
		name: "Grupo de Amanitas",
		footprint: DECO_ONE,
		heightScale: 1.08,
		artScale: .5
	},
	"forest-mossy-trunk": {
		id: "forest-mossy-trunk",
		name: "Tronco Caído Musgoso",
		footprint: DECO_ONE,
		heightScale: .68
	},
	"cave-stalagmites": {
		id: "cave-stalagmites",
		name: "Grupo de Estalagmites",
		footprint: DECO_ONE
	},
	"cave-blue-crystals": {
		id: "cave-blue-crystals",
		name: "Cristais Azuis",
		footprint: DECO_ONE
	},
	"cave-hanging-bat": {
		id: "cave-hanging-bat",
		name: "Morcego Pendurado",
		footprint: DECO_ONE,
		unitLayer: "behind",
		heightScale: 1.2
	},
	"cave-mossy-rocks": {
		id: "cave-mossy-rocks",
		name: "Rocha Coberta de Musgo",
		footprint: DECO_ONE
	},
	"cave-bones": {
		id: "cave-bones",
		name: "Ossos e Crânio",
		footprint: DECO_ONE
	},
	"cave-rock-pile": {
		id: "cave-rock-pile",
		name: "Monte de Pedras",
		footprint: DECO_ONE
	},
	"cave-stalactite": {
		id: "cave-stalactite",
		name: "Estalactite",
		footprint: DECO_ONE,
		unitLayer: "behind",
		heightScale: 1.25
	},
	"cave-cracked-stone": {
		id: "cave-cracked-stone",
		name: "Pedra Rachada com Luz Azul",
		footprint: DECO_ONE
	},
	"cave-amethyst-geode": {
		id: "cave-amethyst-geode",
		name: "Geodo de Ametista",
		footprint: DECO_ONE
	},
	"cave-underground-pool": {
		id: "cave-underground-pool",
		name: "Poço Subterrâneo",
		footprint: DECO_ONE
	},
	"cave-hanging-roots": {
		id: "cave-hanging-roots",
		name: "Raízes Suspensas",
		footprint: DECO_ONE,
		unitLayer: "behind",
		heightScale: 1.2
	},
	"cave-ammonite-fossil": {
		id: "cave-ammonite-fossil",
		name: "Fóssil de Amonite",
		footprint: DECO_ONE
	},
	"cave-stone-rubble": {
		id: "cave-stone-rubble",
		name: "Entulho de Pedras",
		footprint: DECO_ONE
	},
	"cave-boulder": {
		id: "cave-boulder",
		name: "Pedregulho",
		footprint: DECO_ONE
	},
	"cave-glowing-mushrooms": {
		id: "cave-glowing-mushrooms",
		name: "Cogumelos Luminescentes",
		footprint: DECO_ONE
	},
	"cave-carved-stone-block": {
		id: "cave-carved-stone-block",
		name: "Bloco de Pedra Entalhado",
		footprint: DECO_ONE
	},
	"cave-barred-stone-opening": {
		id: "cave-barred-stone-opening",
		name: "Abertura de Pedra Gradeada",
		footprint: DECO_ONE,
		unitLayer: "behind"
	},
	"cave-rusty-lantern": {
		id: "cave-rusty-lantern",
		name: "Lanterna Enferrujada",
		footprint: DECO_ONE
	},
	"cave-webbed-chest": {
		id: "cave-webbed-chest",
		name: "Baú Coberto por Teias",
		footprint: DECO_ONE
	},
	"cave-wall-ring": {
		id: "cave-wall-ring",
		name: "Argola de Ferro na Pedra",
		footprint: DECO_ONE,
		unitLayer: "behind"
	},
	"cave-candle-stand": {
		id: "cave-candle-stand",
		name: "Candelabro de Velas",
		footprint: DECO_ONE
	},
	"cave-spiked-gate": {
		id: "cave-spiked-gate",
		name: "Grade com Pontas",
		footprint: DECO_ONE,
		unitLayer: "behind"
	},
	"cave-wall-brazier": {
		id: "cave-wall-brazier",
		name: "Braseiro de Parede",
		footprint: DECO_ONE,
		unitLayer: "behind"
	},
	"cave-hanging-chains": {
		id: "cave-hanging-chains",
		name: "Correntes Suspensas",
		footprint: DECO_ONE,
		unitLayer: "behind",
		heightScale: 1.2
	},
	"cave-rusty-keys": {
		id: "cave-rusty-keys",
		name: "Chaves Enferrujadas",
		footprint: DECO_ONE
	},
	Brazier3: {
		id: "Brazier3",
		name: "Braseiro III",
		footprint: DECO_ONE,
		artScale: 1.05
	},
	Chandelier: {
		id: "Chandelier",
		name: "Lustre",
		footprint: DECO_ONE,
		artScale: 1.1,
		heightScale: 1.25,
		unitLayer: "behind",
		noShadow: true
	},
	"city-root-shrine": {
		id: "city-root-shrine",
		name: "Santuário Coberto de Raízes",
		footprint: DECO_PAIR
	},
	"city-market-stall-2": {
		id: "city-market-stall-2",
		name: "Barraca de Mercado II",
		footprint: DECO_PAIR
	},
	"city-bear-trap": {
		id: "city-bear-trap",
		name: "Armadilha de Urso",
		footprint: DECO_ONE
	},
	"city-forge": {
		id: "city-forge",
		name: "Forja do Ferreiro",
		footprint: DECO_TRIO
	},
	"city-well-2": {
		id: "city-well-2",
		name: "Poço II",
		footprint: DECO_ONE
	},
	"city-supply-cart-2": {
		id: "city-supply-cart-2",
		name: "Carroça de Suprimentos II",
		footprint: DECO_PAIR
	},
	"city-log-cart": {
		id: "city-log-cart",
		name: "Carroça de Lenha",
		footprint: DECO_PAIR
	},
	"city-wreckage-pile": {
		id: "city-wreckage-pile",
		name: "Barricada Destruída",
		footprint: DECO_PAIR
	},
	"city-notice-board-2": {
		id: "city-notice-board-2",
		name: "Quadro de Avisos II",
		footprint: DECO_ONE
	},
	"city-gallows-2": {
		id: "city-gallows-2",
		name: "Forca II",
		footprint: DECO_PAIR
	},
	"city-broken-chair": {
		id: "city-broken-chair",
		name: "Cadeira Quebrada",
		footprint: DECO_ONE
	},
	"city-broken-pottery": {
		id: "city-broken-pottery",
		name: "Potes Quebrados",
		footprint: DECO_ONE
	},
	"city-basket": {
		id: "city-basket",
		name: "Cesto de Vime",
		footprint: DECO_ONE
	},
	"city-nailed-planks": {
		id: "city-nailed-planks",
		name: "Tábuas com Pregos",
		footprint: DECO_ONE
	},
	"city-bucket": {
		id: "city-bucket",
		name: "Balde de Madeira",
		footprint: DECO_ONE,
		artScale: .65
	},
	"city-rope-coil": {
		id: "city-rope-coil",
		name: "Rolo de Corda",
		footprint: DECO_ONE
	},
	"city-crate-stack": {
		id: "city-crate-stack",
		name: "Caixas Empilhadas",
		footprint: DECO_ONE
	},
	"city-broken-barrel": {
		id: "city-broken-barrel",
		name: "Barril Quebrado",
		footprint: DECO_ONE
	},
	"city-sack-pile": {
		id: "city-sack-pile",
		name: "Sacos de Grãos",
		footprint: DECO_ONE
	},
	"city-firewood-pile": {
		id: "city-firewood-pile",
		name: "Pilha de Lenha",
		footprint: DECO_ONE
	},
	"dungeon-ossuary": {
		id: "dungeon-ossuary",
		name: "Ossário",
		footprint: DECO_PAIR
	},
	"dungeon-hanging-cage": {
		id: "dungeon-hanging-cage",
		name: "Gaiola Suspensa",
		footprint: DECO_ONE
	},
	"dungeon-stone-door": {
		id: "dungeon-stone-door",
		name: "Porta de Pedra Trancada",
		footprint: DECO_PAIR,
		tile: "door"
	},
	"wilds-snowy-dead-tree": {
		id: "wilds-snowy-dead-tree",
		name: "Árvore Morta Nevada",
		footprint: DECO_PAIR
	},
	"wilds-mushroom-stump": {
		id: "wilds-mushroom-stump",
		name: "Toco Oco com Cogumelos",
		footprint: DECO_ONE
	},
	"wilds-snowy-log": {
		id: "wilds-snowy-log",
		name: "Tronco Caído Nevado",
		footprint: DECO_PAIR
	},
	"wilds-snowy-pines": {
		id: "wilds-snowy-pines",
		name: "Pinheiros Nevados",
		footprint: DECO_PAIR,
		heightScale: 3.3 / 2.3
	},
	"wilds-camp": {
		id: "wilds-camp",
		name: "Acampamento",
		footprint: DECO_PAIR
	},
	"wilds-snowy-bush": {
		id: "wilds-snowy-bush",
		name: "Arbusto Seco Nevado",
		footprint: DECO_ONE
	},
	"wilds-iron-cage": {
		id: "wilds-iron-cage",
		name: "Gaiola de Ferro",
		footprint: DECO_ONE
	},
	"wilds-chained-pillar": {
		id: "wilds-chained-pillar",
		name: "Pilar Acorrentado",
		footprint: DECO_ONE
	},
	"wilds-torture-rack": {
		id: "wilds-torture-rack",
		name: "Mesa de Tortura",
		footprint: DECO_PAIR
	},
	"wilds-ruined-gate": {
		id: "wilds-ruined-gate",
		name: "Portal em Ruínas",
		footprint: DECO_TRIO
	},
	"wilds-brazier-tripod": {
		id: "wilds-brazier-tripod",
		name: "Braseiro de Tripé",
		footprint: DECO_ONE
	},
	"wilds-altar-sarcophagus": {
		id: "wilds-altar-sarcophagus",
		name: "Sarcófago Ornamentado",
		footprint: DECO_PAIR
	},
	"wilds-broken-column": {
		id: "wilds-broken-column",
		name: "Coluna Derrubada",
		footprint: DECO_PAIR
	},
	"wilds-temple-door": {
		id: "wilds-temple-door",
		name: "Portal do Templo",
		footprint: DECO_PAIR
	},
	"wilds-fallen-king": {
		id: "wilds-fallen-king",
		name: "Estátua de Rei Caído",
		footprint: DECO_PAIR
	},
	"wilds-knight-statue": {
		id: "wilds-knight-statue",
		name: "Estátua de Cavaleiro",
		footprint: DECO_ONE
	},
	"wilds-ivy-archway": {
		id: "wilds-ivy-archway",
		name: "Arco em Ruínas",
		footprint: DECO_PAIR
	},
	"wilds-incense-burner": {
		id: "wilds-incense-burner",
		name: "Incensário Antigo",
		footprint: DECO_ONE
	},
	"wilds-fountain": {
		id: "wilds-fountain",
		name: "Fonte de Pedra Ornamentada",
		footprint: DECO_PAIR
	},
	"wilds-ancestral-tree": {
		id: "wilds-ancestral-tree",
		name: "Árvore Ancestral",
		footprint: DECO_BLOCK_3X3
	},
	"wilds-exposed-roots": {
		id: "wilds-exposed-roots",
		name: "Raízes Expostas",
		footprint: DECO_ONE
	},
	"wilds-branch-pile": {
		id: "wilds-branch-pile",
		name: "Pilha de Galhos",
		footprint: DECO_ONE
	},
	"wilds-mossy-log": {
		id: "wilds-mossy-log",
		name: "Tronco Musgoso com Cogumelos",
		footprint: DECO_ONE
	},
	"wilds-dry-bush": {
		id: "wilds-dry-bush",
		name: "Moita Seca",
		footprint: DECO_ONE
	},
	"wilds-tree-stump": {
		id: "wilds-tree-stump",
		name: "Toco de Árvore",
		footprint: DECO_ONE
	},
	"wilds-mushroom-cluster": {
		id: "wilds-mushroom-cluster",
		name: "Cogumelos Silvestres",
		footprint: DECO_ONE
	},
	"ice-rope-coil": {
		id: "ice-rope-coil",
		name: "Corda Congelada",
		footprint: DECO_PAIR,
		artScale: .3
	},
	"ice-barrel": {
		id: "ice-barrel",
		name: "Barril Congelado",
		footprint: DECO_PAIR,
		artScale: .3
	},
	"ice-sack": {
		id: "ice-sack",
		name: "Saco Congelado",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-bones": {
		id: "ice-bones",
		name: "Ossos Congelados",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-crystal-spikes": {
		id: "ice-crystal-spikes",
		name: "Espinhos de Gelo",
		footprint: DECO_PAIR,
		artScale: .45
	},
	"ice-frozen-stump": {
		id: "ice-frozen-stump",
		name: "Toco Congelado",
		footprint: DECO_PAIR,
		artScale: .4
	},
	"ice-frozen-boulder": {
		id: "ice-frozen-boulder",
		name: "Rochedo Congelado",
		footprint: DECO_PAIR,
		artScale: .42
	},
	"ice-frozen-grass": {
		id: "ice-frozen-grass",
		name: "Moita Congelada",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-bear-trap": {
		id: "ice-bear-trap",
		name: "Armadilha Congelada",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-lantern-cage": {
		id: "ice-lantern-cage",
		name: "Lanterna Congelada",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-chains": {
		id: "ice-chains",
		name: "Correntes Congeladas",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-wooden-spikes": {
		id: "ice-wooden-spikes",
		name: "Estacas Congeladas",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-shield": {
		id: "ice-shield",
		name: "Escudo Congelado",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-skull": {
		id: "ice-skull",
		name: "Crânio Congelado",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-firewood": {
		id: "ice-firewood",
		name: "Lenha Congelada",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-broken-shield": {
		id: "ice-broken-shield",
		name: "Escudo Quebrado Congelado",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-helmet": {
		id: "ice-helmet",
		name: "Elmo Congelado",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-crate": {
		id: "ice-crate",
		name: "Caixote Congelado",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-cairn": {
		id: "ice-cairn",
		name: "Pedras Empilhadas Congeladas",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-tools-pile": {
		id: "ice-tools-pile",
		name: "Ferramentas Congeladas",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-satchel": {
		id: "ice-satchel",
		name: "Alforje Congelado",
		footprint: DECO_ONE,
		artScale: .45
	},
	"ice-weapon-pile": {
		id: "ice-weapon-pile",
		name: "Armas Congeladas",
		footprint: DECO_ONE,
		artScale: .45
	},
	"wilds-dead-fern-pile": {
		id: "wilds-dead-fern-pile",
		name: "Pilha de Samambaia Seca",
		footprint: DECO_PAIR
	},
	"wilds-bark-pile": {
		id: "wilds-bark-pile",
		name: "Pilha de Casca de Árvore",
		footprint: DECO_PAIR
	},
	"wilds-dead-sapling": {
		id: "wilds-dead-sapling",
		name: "Muda Morta com Raízes",
		footprint: DECO_PAIR
	},
	"wilds-mossy-charred-log": {
		id: "wilds-mossy-charred-log",
		name: "Tronco Carbonizado Musgoso",
		footprint: DECO_PAIR
	},
	"wilds-hollow-stump": {
		id: "wilds-hollow-stump",
		name: "Toco Oco",
		footprint: DECO_ONE
	},
	"wilds-burnt-branch-pile": {
		id: "wilds-burnt-branch-pile",
		name: "Pilha de Galhos Queimados",
		footprint: DECO_ONE
	},
	"wilds-dry-twig-pile": {
		id: "wilds-dry-twig-pile",
		name: "Pilha de Gravetos Secos",
		footprint: DECO_ONE
	},
	"wilds-thorn-bramble": {
		id: "wilds-thorn-bramble",
		name: "Moita de Espinhos",
		footprint: DECO_PAIR
	},
	"wilds-hollow-log": {
		id: "wilds-hollow-log",
		name: "Tronco Oco",
		footprint: DECO_ONE
	},
	"wilds-bare-branch": {
		id: "wilds-bare-branch",
		name: "Galho Seco Solto",
		footprint: DECO_ONE
	},
	"wilds-root-tangle": {
		id: "wilds-root-tangle",
		name: "Emaranhado de Raízes",
		footprint: DECO_ONE
	},
	"wilds-shelf-mushrooms": {
		id: "wilds-shelf-mushrooms",
		name: "Cogumelos em Prateleira",
		footprint: DECO_ONE
	},
	"wilds-charred-stump": {
		id: "wilds-charred-stump",
		name: "Toco Carbonizado",
		footprint: DECO_ONE
	},
	"wilds-mossy-stones": {
		id: "wilds-mossy-stones",
		name: "Pedras Musgosas Empilhadas",
		footprint: DECO_ONE
	},
	"wilds-birds-nest": {
		id: "wilds-birds-nest",
		name: "Ninho de Pássaro",
		footprint: DECO_ONE
	},
	"dungeon-sarcophagus": {
		id: "dungeon-sarcophagus",
		name: "Sarcófago de Pedra",
		footprint: DECO_PAIR
	},
	"dungeon-penitent-statue": {
		id: "dungeon-penitent-statue",
		name: "Estátua Penitente",
		footprint: DECO_ONE,
		heightScale: 1.35
	},
	"dungeon-funerary-urn": {
		id: "dungeon-funerary-urn",
		name: "Urna Funerária",
		footprint: DECO_ONE,
		heightScale: 1.25
	},
	"dungeon-tomb-relief": {
		id: "dungeon-tomb-relief",
		name: "Laje Tumular Ornamentada",
		footprint: DECO_ONE
	},
	"dungeon-bones": {
		id: "dungeon-bones",
		name: "Ossos Antigos",
		footprint: DECO_PAIR
	},
	"torture-wall-shackles": {
		id: "torture-wall-shackles",
		name: "Argola de Masmorra",
		footprint: DECO_ONE
	},
	"torture-pillory": {
		id: "torture-pillory",
		name: "Pelourinho de Madeira",
		footprint: DECO_PAIR
	},
	"dungeon-stone-rubble": {
		id: "dungeon-stone-rubble",
		name: "Escombros de Masmorra",
		footprint: DECO_PAIR
	},
	"torture-brazier": {
		id: "torture-brazier",
		name: "Braseiro de Ferro",
		footprint: DECO_ONE
	},
	"torture-chain-pile": {
		id: "torture-chain-pile",
		name: "Correntes Enferrujadas",
		footprint: DECO_ONE
	},
	"wilds-gothic-gravestone": {
		id: "wilds-gothic-gravestone",
		name: "Lápide Gótica",
		footprint: DECO_ONE,
		heightScale: 1.2
	},
	"wilds-broken-gravestone": {
		id: "wilds-broken-gravestone",
		name: "Lápide Quebrada",
		footprint: DECO_ONE,
		heightScale: 1.15
	},
	"wilds-broken-cross": {
		id: "wilds-broken-cross",
		name: "Cruz Caída no Túmulo",
		footprint: DECO_ONE
	},
	"wilds-grave-mound": {
		id: "wilds-grave-mound",
		name: "Monte de Sepultura",
		footprint: DECO_PAIR
	},
	"wilds-cemetery-lantern": {
		id: "wilds-cemetery-lantern",
		name: "Lanterna de Cemitério",
		footprint: DECO_ONE,
		heightScale: 1.3
	},
	"wilds-cave-stalagmite-cluster": {
		id: "wilds-cave-stalagmite-cluster",
		name: "Formação de Estalagmites",
		footprint: DECO_ONE
	},
	"wilds-cave-stalactites": {
		id: "wilds-cave-stalactites",
		name: "Estalactites Suspensas",
		footprint: DECO_ONE,
		heightScale: 1.2
	},
	"wilds-cave-crystal-boulder": {
		id: "wilds-cave-crystal-boulder",
		name: "Rocha com Cristais",
		footprint: DECO_ONE
	},
	"wilds-cave-mushrooms": {
		id: "wilds-cave-mushrooms",
		name: "Cogumelos de Caverna",
		footprint: DECO_ONE
	},
	"wilds-cave-crystal-rubble": {
		id: "wilds-cave-crystal-rubble",
		name: "Escombros com Cristais",
		footprint: DECO_PAIR
	},
	"city-inn-barrel": {
		id: "city-inn-barrel",
		name: "Barril da Taverna",
		footprint: DECO_ONE,
		heightScale: 1.15
	},
	"city-inn-table": {
		id: "city-inn-table",
		name: "Mesa da Taverna",
		footprint: DECO_ONE
	},
	"city-inn-chair": {
		id: "city-inn-chair",
		name: "Cadeira da Taverna",
		footprint: DECO_ONE,
		heightScale: 1.2
	},
	"city-inn-tankard": {
		id: "city-inn-tankard",
		name: "Caneca de Estanho",
		footprint: DECO_ONE
	},
	"city-inn-candle-sconce": {
		id: "city-inn-candle-sconce",
		name: "Castiçal de Parede",
		footprint: DECO_ONE,
		heightScale: 1.25
	},
	"wilds-snowy-stump": {
		id: "wilds-snowy-stump",
		name: "Toco Nevado com Raízes",
		footprint: DECO_PAIR
	},
	"wilds-snowy-fallen-tree": {
		id: "wilds-snowy-fallen-tree",
		name: "Árvore Caída Nevada",
		footprint: DECO_PAIR
	},
	"wilds-snowy-roots": {
		id: "wilds-snowy-roots",
		name: "Raízes Expostas na Neve",
		footprint: DECO_PAIR
	},
	"wilds-winter-thorn-bush": {
		id: "wilds-winter-thorn-bush",
		name: "Arbusto Espinhoso de Inverno",
		footprint: DECO_ONE
	},
	"wilds-winter-mossy-log": {
		id: "wilds-winter-mossy-log",
		name: "Tronco Musgoso Nevado",
		footprint: DECO_PAIR
	},
	"wilds-cave-stalagmite-formation": {
		id: "wilds-cave-stalagmite-formation",
		name: "Colunas de Pedra da Caverna",
		footprint: DECO_ONE
	},
	"wilds-cave-stalactite-formation": {
		id: "wilds-cave-stalactite-formation",
		name: "Grande Estalactite",
		footprint: DECO_ONE,
		heightScale: 1.25
	},
	"wilds-cave-amethyst-boulder": {
		id: "wilds-cave-amethyst-boulder",
		name: "Afloramento de Ametista",
		footprint: DECO_ONE
	},
	"wilds-cave-glowing-mushrooms": {
		id: "wilds-cave-glowing-mushrooms",
		name: "Cogumelos Luminescentes",
		footprint: DECO_ONE
	},
	"wilds-cave-crystal-wall": {
		id: "wilds-cave-crystal-wall",
		name: "Parede de Cristais",
		footprint: DECO_PAIR
	},
	"city-lantern-post-new": {
		id: "city-lantern-post-new",
		name: "Poste de Rua com Lanterna",
		footprint: DECO_ONE,
		heightScale: 1.8
	},
	"city-market-wagon-new": {
		id: "city-market-wagon-new",
		name: "Carroça de Feira Coberta",
		footprint: DECO_PAIR
	},
	"city-hanging-sign": {
		id: "city-hanging-sign",
		name: "Placa Suspensa da Cidade",
		footprint: DECO_ONE
	},
	"city-firewood-stack-new": {
		id: "city-firewood-stack-new",
		name: "Pilha Amarrada de Lenha",
		footprint: DECO_PAIR
	},
	"city-stone-trough-fountain": {
		id: "city-stone-trough-fountain",
		name: "Bebedouro de Pedra",
		footprint: DECO_ONE
	}
};
const DECORATIONS = {
	"watchtower-stone-open-door-2hex": {
		id: "watchtower-stone-open-door-2hex",
		name: "Vão de Pedra Aberto do Torreão 3D · 2 hexes",
		footprint: DECO_PAIR,
		architectureSpan: 2,
		blockingFootprint: [],
		model3d: "doorway"
	},
	"door-3d-stone-oak": {
		id: "door-3d-stone-oak",
		name: "Porta de madeira em pedra clara 3D",
		footprint: [
			{
				dx: -1,
				dy: 0
			},
			{
				dx: 0,
				dy: 0
			},
			{
				dx: 1,
				dy: 0
			}
		],
		architectureSpan: 3,
		model3d: "door",
		doorStyle: "stoneOak",
		wallTexture: "/game/textures/doors/stone-oak-reference.jpg"
	},
	"door-3d-stone-oak-open": {
		id: "door-3d-stone-oak-open",
		name: "Vão de madeira em pedra clara 3D",
		footprint: [
			{
				dx: -1,
				dy: 0
			},
			{
				dx: 0,
				dy: 0
			},
			{
				dx: 1,
				dy: 0
			}
		],
		architectureSpan: 3,
		blockingFootprint: [{
			dx: -1,
			dy: 0
		}, {
			dx: 1,
			dy: 0
		}],
		model3d: "doorway",
		doorStyle: "stoneOak",
		wallTexture: "/game/textures/doors/stone-oak-reference.jpg"
	},
	"door-3d-dungeon-oak": {
		id: "door-3d-dungeon-oak",
		name: "Porta espessa de masmorra com grade 3D",
		footprint: [
			{
				dx: -1,
				dy: 0
			},
			{
				dx: 0,
				dy: 0
			},
			{
				dx: 1,
				dy: 0
			}
		],
		architectureSpan: 3,
		model3d: "door",
		doorStyle: "dungeonOak",
		thickWall: true,
		wallTexture: "/game/textures/doors/dungeon-oak-reference.jpg"
	},
	"door-3d-dungeon-oak-open": {
		id: "door-3d-dungeon-oak-open",
		name: "Vão espesso de masmorra com grade 3D",
		footprint: [
			{
				dx: -1,
				dy: 0
			},
			{
				dx: 0,
				dy: 0
			},
			{
				dx: 1,
				dy: 0
			}
		],
		architectureSpan: 3,
		blockingFootprint: [{
			dx: -1,
			dy: 0
		}, {
			dx: 0,
			dy: 0
		}],
		model3d: "doorway",
		doorStyle: "dungeonOak",
		thickWall: true,
		wallTexture: "/game/textures/doors/dungeon-oak-reference.jpg"
	},
	"dungeon-3d-thick-basalt": {
		id: "dungeon-3d-thick-basalt",
		name: "Masmorra — muralha espessa de basalto 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		thickWall: true,
		wallThicknessScale: 2.35,
		wallTexture: "/game/textures/walls/dungeon-thick-basalt.png"
	},
	"dungeon-3d-thick-reference": {
		id: "dungeon-3d-thick-reference",
		name: "Masmorra — muralha espessa com argolas 3D",
		footprint: [
			{
				dx: -1,
				dy: 0
			},
			{
				dx: 0,
				dy: 0
			},
			{
				dx: 1,
				dy: 0
			}
		],
		architectureSpan: 3,
		model3d: "wall",
		thickWall: true,
		dungeonReference: true,
		wallThicknessScale: 2.35,
		wallTexture: "/game/textures/walls/dungeon-thick-reference.jpg"
	},
	"castle-3d-thick": {
		id: "castle-3d-thick",
		name: "Muralha espessa com ameias 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		castleStyle: "battlement",
		thickWall: true,
		wallThicknessScale: 1.8,
		wallTexture: "/game/textures/walls/castle-thick.jpg"
	},
	"castle-3d-thick-tower": {
		id: "castle-3d-thick-tower",
		name: "Torre quadrada espessa 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		castleStyle: "tower",
		thickWall: true,
		heightScale: 1.15,
		wallTexture: "/game/textures/walls/castle-thick.jpg"
	},
	"castle-3d-thick-ruined": {
		id: "castle-3d-thick-ruined",
		name: "Muralha espessa arruinada 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		castleStyle: "ruined",
		thickWall: true,
		wallThicknessScale: 1.8,
		wallTexture: "/game/textures/walls/castle-thick.jpg"
	},
	"house-3d-vau": {
		id: "house-3d-vau",
		name: "Casa clássica do Vau 3D",
		footprint: DECO_BLOCK_5,
		model3d: "prop",
		propModel: "small-house"
	},
	"rocks-3d-outcrop": {
		id: "rocks-3d-outcrop",
		name: "Afloramento rochoso realista 3D",
		footprint: DECO_PAIR,
		model3d: "prop",
		propModel: "rocky-outcrop"
	},
	"rocks-3d-grey-outcrop": {
		id: "rocks-3d-grey-outcrop",
		name: "Afloramento rochoso cinzento 3D II",
		footprint: DECO_PAIR,
		model3d: "prop",
		propModel: "grey-outcrop"
	},
	"prop-3d-tavern-barrel": {
		id: "prop-3d-tavern-barrel",
		name: "Barril da taverna 3D",
		footprint: DECO_ONE,
		model3d: "prop",
		propModel: "tavern-barrel"
	},
	"prop-3d-tavern-chair": {
		id: "prop-3d-tavern-chair",
		name: "Cadeira da taverna 3D",
		footprint: DECO_ONE,
		model3d: "prop",
		propModel: "tavern-chair"
	},
	"prop-3d-tavern-candlestick": {
		id: "prop-3d-tavern-candlestick",
		name: "Castiçal de parede 3D",
		footprint: DECO_ONE,
		model3d: "prop",
		propModel: "tavern-candlestick"
	},
	"prop-3d-tavern-mug": {
		id: "prop-3d-tavern-mug",
		name: "Caneca de metal 3D",
		footprint: DECO_ONE,
		model3d: "prop",
		propModel: "tavern-mug"
	},
	"prop-3d-tavern-table": {
		id: "prop-3d-tavern-table",
		name: "Mesa redonda da taverna 3D",
		footprint: DECO_ONE,
		model3d: "prop",
		propModel: "tavern-table"
	},
	"tree-3d-broadleaf": {
		id: "tree-3d-broadleaf",
		name: "Árvore realista 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "tree",
		treeModel: "broadleaf"
	},
	"tree-3d-snowy-pine": {
		id: "tree-3d-snowy-pine",
		name: "Pinheiro nevado 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "tree",
		treeModel: "snowy-pine"
	},
	"tree-3d-dead-oak": {
		id: "tree-3d-dead-oak",
		name: "Carvalho morto 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "tree",
		treeModel: "dead-oak"
	},
	"tree-3d-dead-snag": {
		id: "tree-3d-dead-snag",
		name: "Árvore morta 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "tree",
		treeModel: "dead-snag"
	},
	"tree-3d-twisted-stump": {
		id: "tree-3d-twisted-stump",
		name: "Árvore retorcida 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "tree",
		treeModel: "twisted-stump"
	},
	"rock-3d-layered": {
		id: "rock-3d-layered",
		name: "Rochas — parede estratificada 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		rockStyle: "layered",
		heightScale: .55,
		wallTexture: "/game/textures/walls/rock-formation.jpg"
	},
	"rock-3d-arch": {
		id: "rock-3d-arch",
		name: "Rochas — arco natural 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "doorway",
		rockStyle: "arch",
		wallTexture: "/game/textures/walls/rock-formation.jpg"
	},
	"rock-3d-broken": {
		id: "rock-3d-broken",
		name: "Rochas — parede desmoronada 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		rockStyle: "broken",
		heightScale: .75,
		wallTexture: "/game/textures/walls/rock-formation.jpg"
	},
	"temple-3d-plain": {
		id: "temple-3d-plain",
		name: "Templo — muralha de pedra 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		templeStyle: "plain",
		wallTexture: "/game/textures/walls/temple-plain.jpg"
	},
	"temple-3d-niche": {
		id: "temple-3d-niche",
		name: "Templo — nicho arqueado 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		templeStyle: "niche",
		wallTexture: "/game/textures/walls/temple-niche.jpg"
	},
	"temple-3d-relief": {
		id: "temple-3d-relief",
		name: "Templo — arco com relevo floral 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		templeStyle: "relief",
		wallTexture: "/game/textures/walls/temple-relief.jpg"
	},
	"castle-3d-battlement": {
		id: "castle-3d-battlement",
		name: "Castelo — muralha com ameias 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		castleStyle: "battlement",
		wallTexture: "/game/textures/walls/castle-battlement.jpg"
	},
	"castle-3d-ruined": {
		id: "castle-3d-ruined",
		name: "Castelo — muralha arruinada 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		castleStyle: "ruined",
		wallTexture: "/game/textures/walls/castle-ruined.jpg"
	},
	"castle-3d-gate": {
		id: "castle-3d-gate",
		name: "Castelo — portão arqueado 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "door",
		doorStyle: "castle",
		castleStyle: "gate",
		wallTexture: "/game/textures/walls/castle-gate.jpg"
	},
	"castle-3d-gate-open": {
		id: "castle-3d-gate-open",
		name: "Castelo — arco aberto 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "doorway",
		doorStyle: "castle",
		castleStyle: "gate",
		wallTexture: "/game/textures/walls/castle-gate.jpg"
	},
	"wall-3d-dungeon": {
		id: "wall-3d-dungeon",
		name: "Parede de Masmorra 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		wallThicknessScale: 1.55,
		wallTexture: "/game/textures/walls/dungeon-v2.png"
	},
	"wall-3d-tower": {
		id: "wall-3d-tower",
		name: "Parede de Torre 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		wallTexture: "/game/textures/walls/tower-v2.png"
	},
	"wall-3d-tavern": {
		id: "wall-3d-tavern",
		name: "Parede de Taverna 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		wallTexture: "/game/textures/walls/tavern-v2.png"
	},
	"wall-3d-crypt": {
		id: "wall-3d-crypt",
		name: "Parede de Cripta 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		wallThicknessScale: 1.55,
		wallTexture: "/game/textures/walls/crypt-v2.png"
	},
	"wall-3d-temple": {
		id: "wall-3d-temple",
		name: "Parede de Templo 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		wallTexture: "/game/textures/walls/temple-v2.png"
	},
	"wall-3d-cave": {
		id: "wall-3d-cave",
		name: "Parede de Caverna 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		wallThicknessScale: 1.55,
		wallTexture: "/game/textures/walls/cave-v2.png"
	},
	"wall-3d-castle": {
		id: "wall-3d-castle",
		name: "Parede de Castelo 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		wallThicknessScale: 1.55,
		wallTexture: "/game/textures/walls/castle-v2.png"
	},
	"wall-3d-city": {
		id: "wall-3d-city",
		name: "Parede de Cidade 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		wallTexture: "/game/textures/walls/city-v2.png"
	},
	"wall-3d-stone": {
		id: "wall-3d-stone",
		name: "Parede de pedra 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall"
	},
	"wall-3d-low": {
		id: "wall-3d-low",
		name: "Mureta de pedra 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "wall",
		heightScale: .5
	},
	"door-3d-frame": {
		id: "door-3d-frame",
		name: "Passagem aberta 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "doorway",
		doorStyle: "oak",
		wallTexture: "/game/textures/doors/medieval-oak-door.png"
	},
	"door-3d-closed": {
		id: "door-3d-closed",
		name: "Porta fechada 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "door",
		doorStyle: "oak",
		wallTexture: "/game/textures/doors/medieval-oak-door.png"
	},
	"door-3d-reinforced-frame": {
		id: "door-3d-reinforced-frame",
		name: "Vão de porta reforçada 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "doorway",
		doorStyle: "reinforced",
		wallTexture: "/game/textures/doors/reinforced-wood-door.png"
	},
	"door-3d-reinforced": {
		id: "door-3d-reinforced",
		name: "Porta reforçada 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "door",
		doorStyle: "reinforced",
		wallTexture: "/game/textures/doors/reinforced-wood-door.png"
	},
	"door-3d-iron-frame": {
		id: "door-3d-iron-frame",
		name: "Arco de ferro aberto 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "doorway",
		doorStyle: "iron"
	},
	"door-3d-iron": {
		id: "door-3d-iron",
		name: "Porta arqueada de ferro rebitado 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "door",
		doorStyle: "iron"
	},
	"door-3d-steel-frame": {
		id: "door-3d-steel-frame",
		name: "Arco de aço aberto 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "doorway",
		doorStyle: "steel"
	},
	"door-3d-steel": {
		id: "door-3d-steel",
		name: "Porta arqueada de aço com painéis 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "door",
		doorStyle: "steel"
	},
	"secret-door-3d-frame": {
		id: "secret-door-3d-frame",
		name: "Passagem secreta aberta 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "doorway",
		doorStyle: "secretStone",
		wallTexture: "/game/textures/doors/passage-stone.png"
	},
	"secret-door-3d-hidden": {
		id: "secret-door-3d-hidden",
		name: "Porta secreta de pedra 3D",
		footprint: [{
			dx: 0,
			dy: 0
		}],
		model3d: "secretDoor",
		doorStyle: "secretStone",
		wallThicknessScale: 1.55,
		wallTexture: "/game/textures/walls/dungeon-v2.png"
	},
	"mountain-ridge": {
		id: "mountain-ridge",
		name: "Cordilheira",
		footprint: DECO_PAIR,
		tile: "hill"
	},
	"spike-rocks": {
		id: "spike-rocks",
		name: "Agulhas de Pedra",
		footprint: DECO_PAIR
	},
	"dead-tree-large": {
		id: "dead-tree-large",
		name: "Árvore Morta Grande",
		footprint: DECO_PAIR
	},
	"dense-forest": {
		id: "dense-forest",
		name: "Bosque Denso",
		footprint: DECO_PAIR,
		tile: "woods"
	},
	"stone-bridge": {
		id: "stone-bridge",
		name: "Ponte de Pedra",
		footprint: DECO_PAIR
	},
	"bridge-parapet-gothic-statues-001": {
		id: "bridge-parapet-gothic-statues-001",
		name: "Parapeito Gótico — Estátuas",
		footprint: DECO_QUAD,
		foreground: true,
		unitLayer: "front",
		repeatGroup: "bridge-parapet-gothic-statues",
		noShadow: true,
		aboveGroundMist: true
	},
	"bridge-parapet-gothic-wall-001": {
		id: "bridge-parapet-gothic-wall-001",
		name: "Parapeito Gótico — Muralha",
		footprint: DECO_QUAD,
		unitLayer: "behind",
		repeatGroup: "bridge-parapet-gothic-wall",
		noShadow: true,
		aboveGroundMist: true
	},
	"bridge-parapet-tall-001": {
		id: "bridge-parapet-tall-001",
		name: "Tall-Parapeito",
		footprint: DECO_ROW_FIVE,
		unitLayer: "behind",
		repeatGroup: "bridge-parapet-tall",
		heightScale: 1.8,
		noShadow: true,
		aboveGroundMist: true
	},
	"bridge-parapet-tall-statues-001": {
		id: "bridge-parapet-tall-statues-001",
		name: "Tall-Parapeito — Estátuas",
		footprint: DECO_ROW_FIVE,
		foreground: true,
		unitLayer: "front",
		decorRenderOrder: 10,
		repeatGroup: "bridge-parapet-tall",
		heightScale: 1.8,
		noShadow: true,
		aboveGroundMist: true
	},
	"ember-channels-001": {
		id: "ember-channels-001",
		name: "Canais de Brasa",
		footprint: DECO_PAIR
	},
	gatehouse: {
		id: "gatehouse",
		name: "Portão Fortificado",
		footprint: DECO_PAIR
	},
	watchtower: {
		id: "watchtower",
		name: "Torre de Vigia",
		footprint: DECO_PAIR
	},
	"locked-chest": {
		id: "locked-chest",
		name: "Baú Pequeno",
		footprint: DECO_ONE
	},
	"chest-medium": {
		id: "chest-medium",
		name: "Baú Médio",
		footprint: DECO_ONE
	},
	"chest-large": {
		id: "chest-large",
		name: "Baú Grande",
		footprint: DECO_ONE
	},
	barricade: {
		id: "barricade",
		name: "Barricada",
		footprint: DECO_ONE
	},
	"wooden-barricade-1": {
		id: "wooden-barricade-1",
		name: "Barricada de Estacas II",
		footprint: DECO_ONE
	},
	"dead-tree": {
		id: "dead-tree",
		name: "Árvore morta",
		footprint: DECO_ONE
	},
	"fallen-log": {
		id: "fallen-log",
		name: "Tronco caído",
		footprint: DECO_PAIR
	},
	"small-house": {
		id: "small-house",
		name: "Casa pequena",
		footprint: DECO_BLOCK_5
	},
	"stone-hut": {
		id: "stone-hut",
		name: "Cabana de pedra",
		footprint: DECO_BLOCK_5
	},
	"rocky-outcrop": {
		id: "rocky-outcrop",
		name: "Afloramento Rochoso",
		footprint: DECO_PAIR
	},
	"boulder-pile": {
		id: "boulder-pile",
		name: "Pilha de Pedras",
		footprint: DECO_PAIR
	},
	"twin-spires": {
		id: "twin-spires",
		name: "Torres Gêmeas de Pedra",
		footprint: DECO_PAIR
	},
	"large-boulder": {
		id: "large-boulder",
		name: "Pedregulho Grande",
		footprint: DECO_ONE
	},
	"burning-house": {
		id: "burning-house",
		name: "Casa em Chamas",
		footprint: DECO_BLOCK_5,
		blockingFootprint: HOUSE_GROUND_FOOTPRINT
	},
	"burnt-house-ruins": {
		id: "burnt-house-ruins",
		name: "Ruínas Queimadas",
		footprint: DECO_BLOCK_5,
		blockingFootprint: BURNT_HOUSE_GROUND_FOOTPRINT
	},
	well: {
		id: "well",
		name: "Poço",
		footprint: DECO_ONE
	},
	"stone-fountain": {
		id: "stone-fountain",
		name: "Fonte de Pedra",
		footprint: DECO_ONE
	},
	tombstones: {
		id: "tombstones",
		name: "Lápides",
		footprint: DECO_ONE,
		artScale: .625
	},
	"spike-rocks-2": {
		id: "spike-rocks-2",
		name: "Agulhas de Pedra II",
		footprint: DECO_PAIR
	},
	lamppost: {
		id: "lamppost",
		name: "Poste de Lampião",
		footprint: DECO_ONE
	},
	"mossy-rocks": {
		id: "mossy-rocks",
		name: "Pedras Musgosas",
		footprint: DECO_PAIR
	},
	"jagged-ridge": {
		id: "jagged-ridge",
		name: "Crista Irregular",
		footprint: DECO_PAIR,
		tile: "hill"
	},
	"mossy-boulder": {
		id: "mossy-boulder",
		name: "Pedregulho Musgoso",
		footprint: DECO_ONE
	},
	"mountain-range": {
		id: "mountain-range",
		name: "Cadeia de Montanhas",
		footprint: DECO_TRIO,
		tile: "hill"
	},
	"rune-stone": {
		id: "rune-stone",
		name: "Menir Rúnico",
		footprint: DECO_ONE
	},
	"burning-hamlet": {
		id: "burning-hamlet",
		name: "Vilarejo em Chamas",
		footprint: DECO_BLOCK_5,
		blockingFootprint: HOUSE_GROUND_FOOTPRINT
	},
	"boulder-mound": {
		id: "boulder-mound",
		name: "Monte de Pedras",
		footprint: DECO_ONE
	},
	"wooden-cart": {
		id: "wooden-cart",
		name: "Carroça de Madeira",
		footprint: DECO_PAIR
	},
	"merchant-covered-cart-001": {
		id: "merchant-covered-cart-001",
		name: "Carroça Coberta do Mercador",
		footprint: DECO_PAIR,
		artScale: 1.2,
		heightScale: 1.15
	},
	"inn-stairs-up": {
		id: "inn-stairs-up",
		name: "Escada para o Andar de Cima",
		footprint: DECO_PAIR,
		artScale: .9
	},
	"inn-stairs-down": {
		id: "inn-stairs-down",
		name: "Escada para o Andar de Baixo",
		footprint: DECO_PAIR,
		artScale: .9
	},
	"stone-stairs-up-001": {
		id: "stone-stairs-up-001",
		name: "Escada de Pedra · Subir",
		footprint: [{
			dx: 0,
			dy: 0
		}, {
			dx: 0,
			dy: -1
		}],
		noShadow: true,
		exitKind: "connector"
	},
	"stone-stairs-down-001": {
		id: "stone-stairs-down-001",
		name: "Escada de Pedra · Descer",
		footprint: [{
			dx: 0,
			dy: 0
		}, {
			dx: 0,
			dy: -1
		}],
		noShadow: true,
		exitKind: "connector"
	},
	"spike-crown": {
		id: "spike-crown",
		name: "Coroa de Espinhos",
		footprint: DECO_TRIO
	},
	...WILDS_DECORATIONS,
	...TORTURE_DECORATIONS,
	...CITY_DECORATIONS,
	...NEW_DECOR_2026,
	"escape-exit": {
		id: "escape-exit",
		name: "Saída de Fuga",
		footprint: DECO_PAIR,
		exitKind: "escape",
		noShadow: true
	},
	"dungeon-exit-single": {
		id: "dungeon-exit-single",
		name: "Saída da Masmorra · Porta · 1 hex",
		footprint: DECO_ONE,
		exitKind: "dungeon",
		noShadow: true
	},
	"dungeon-exit": {
		id: "dungeon-exit",
		name: "Saída da Masmorra",
		footprint: DECO_PAIR,
		exitKind: "dungeon",
		noShadow: true
	},
	"floor-connector": {
		id: "floor-connector",
		name: "Passagem de Andar",
		footprint: DECO_ONE,
		exitKind: "connector",
		noShadow: true
	}
};
const THREE_D_DOOR_VARIANTS = {
	stoneOak: {
		open: "door-3d-stone-oak-open",
		closed: "door-3d-stone-oak"
	},
	dungeonOak: {
		open: "door-3d-dungeon-oak-open",
		closed: "door-3d-dungeon-oak"
	},
	castle: {
		open: "castle-3d-gate-open",
		closed: "castle-3d-gate"
	},
	oak: {
		open: "door-3d-frame",
		closed: "door-3d-closed"
	},
	reinforced: {
		open: "door-3d-reinforced-frame",
		closed: "door-3d-reinforced"
	},
	iron: {
		open: "door-3d-iron-frame",
		closed: "door-3d-iron"
	},
	steel: {
		open: "door-3d-steel-frame",
		closed: "door-3d-steel"
	},
	secretStone: {
		open: "secret-door-3d-frame",
		closed: "secret-door-3d-hidden"
	}
};
const TALL_POST_DECOR_IDS = [
	"wilds-lantern-post",
	"wilds-weathered-signpost",
	"wilds-lantern-signpost",
	"city-banner-post",
	"city-lantern-post",
	"city-signpost",
	"city-notice-post",
	"lamppost"
];
for (const id of TALL_POST_DECOR_IDS) {
	const def = DECORATIONS[id];
	if (def) DECORATIONS[id] = {
		...def,
		heightScale: 2,
		mirrorAlternate: true
	};
}
/** Every lockable-chest decoration id. Both size variants block/open the same way
* (BattleEngine.useLockpick/adjacentLock, hexprops.buildDecorOverlay) — callers that need
* "is this a chest" check membership here instead of one hardcoded id. */
const CHEST_DECOR_IDS = /* @__PURE__ */ new Set([
	"locked-chest",
	"chest-medium",
	"chest-large"
]);
/** Small/wide house artwork uses the five-hex ground base under its visible structure, so
* the full building area is impassable. Kept separate from BIG_HOUSE_DECOR_IDS. */
const HOUSE_DECOR_IDS = /* @__PURE__ */ new Set([
	"small-house",
	"stone-hut",
	"burning-house",
	"burnt-house-ruins"
]);
/** Retained empty set for renderer compatibility; the large mansion prop was removed. */
const BIG_HOUSE_DECOR_IDS = /* @__PURE__ */ new Set();
/** Other house props (drawn at their own size, not the house art scale) that are just as solid:
* impassable and never faded by fog, same as HOUSE_DECOR_IDS. This also includes the gatehouse
* and watchtower: both are solid buildings whose full footprint must stay out of movement range. */
const SOLID_HOUSE_DECOR_IDS = /* @__PURE__ */ new Set([
	"burning-hamlet",
	"gatehouse",
	"watchtower"
]);
/** Carts, wagons and handcarts are solid scenery: their complete authored footprint
* blocks movement, arrows and line of sight, including placements saved on older maps. */
const SOLID_CART_DECOR_IDS = /* @__PURE__ */ new Set([
	"wilds-abandoned-cart",
	"wooden-cart",
	"merchant-covered-cart-001",
	"city-supply-cart",
	"city-covered-wagon",
	"city-supply-cart-2",
	"city-log-cart",
	"city-market-wagon-new",
	"city-wheelbarrow"
]);
/** Rock props are solid decorations; their art must never replace the ground with column terrain. */
/** Low props: "Bloquear caminho" stops walking through them, but arrows and sight pass over (a well is knee-high). */
const LOW_BLOCKER_DECOR_IDS = /* @__PURE__ */ new Set([
	"well",
	"wilds-wishing-well",
	"tombstones"
]);
const SOLID_ROCK_DECOR_IDS = /* @__PURE__ */ new Set([
	"rocks-3d-grey-outcrop",
	"rocks-3d-outcrop",
	"spike-rocks",
	"rocky-outcrop",
	"boulder-pile",
	"twin-spires",
	"large-boulder",
	"spike-rocks-2",
	"mossy-rocks",
	"mossy-boulder",
	"boulder-mound",
	"spike-crown"
]);
/** City props that read as a barricade/wall and should block like one — impassable, blocks
* shots — without repainting the hex underneath to barricade terrain (that would replace
* the nice city ground art with barricade's dirt/rubble look). See BARRICADE_LIKE_DECOR
* usage: these get `blocksPath: true` by default the moment they're placed, the same real
* mechanism as the "Bloquear caminho" checkbox, just defaulted on instead of manual.
* city-gate-banner is excluded on purpose — it is a gate, meant to be walked through. */
const BARRICADE_LIKE_DECOR = /* @__PURE__ */ new Set([
	"barricade",
	"wooden-barricade-1",
	"city-spike-barricade-low",
	"city-palisade-frame",
	"city-wattle-fence",
	"city-wooden-barricade",
	"city-palisade-banner",
	"city-spike-barricade-large",
	"city-spike-barricade",
	"city-banner-barricade",
	"city-stone-banner-wall"
]);
[
	...Object.keys(WILDS_DECORATIONS),
	...Object.keys(TORTURE_DECORATIONS),
	...Object.keys(CITY_DECORATIONS),
	...Object.keys(NEW_DECOR_2026)
];
/** The six sides a prop can face, numbered the way the editor turns through them:
* side 1 east, 2 southeast, 3 southwest, 4 west, 5 northwest, 6 northeast.
*
* Isometric art is never turned by rotating the bitmap — a rotated drawing tilts, it does
* not face a new way. No game does that; they swap in a drawing per side. Side 1 is the
* prop's base file, `<id>.png`, so nothing already drawn needs renaming; the others are
* `<id>-side2.png` … `<id>-side6.png`, made whenever it is worth making them.
*
* A horizontal mirror already gives the opposite side, so a drawing covers two: side 1
* mirrors to 4, 2 to 3, 6 to 5. That is the economy — six sides for three drawings — but
* it is only a fallback. A side with its own file always wins, so drawing side 4 by hand
* replaces the mirrored side 1 rather than being ignored.
*/
const DECOR_MIRROR_SIDE = [
	3,
	2,
	1,
	0,
	5,
	4
];
/** The art file for one side: side 1 is the base file, the rest carry a -sideN suffix. */
function decorationSideFile(id, step) {
	return step === 0 ? id : `${id}-side${step + 1}`;
}
function floorConnectorDirection(p) {
	return p.connectorDirection ?? (p.id === "stone-stairs-up-001" ? "up" : p.id === "stone-stairs-down-001" ? "down" : p.returnConnector ? "up" : "down");
}
function decorationPlacementArt(p) {
	if (p.id === "stone-stairs-up-001" || p.id === "stone-stairs-down-001") return floorConnectorDirection(p) === "up" ? "stone-stairs-up-001" : "stone-stairs-down-001";
	return p.id === "floor-connector" ? (p.connectorDirection ? p.connectorDirection === "up" : p.returnConnector) ? "floor-connector-up-gold-v1" : "floor-connector-down-red-v1" : p.id;
}
/** Which drawing to use for a prop's current facing, and how.
*
* Asks in order: this side's own drawing, then the drawing that mirrors onto it, then the
* base. `own: false` means neither exists and the caller is on the placeholder path —
* turning the bitmap, which tilts rather than faces.
*/
function decorationFacing(id, rot, has) {
	const step = (Math.round(rot) % 6 + 6) % 6;
	if (step === 0) return {
		file: id,
		mirror: false,
		own: true,
		step,
		side: 1
	};
	const mine = decorationSideFile(id, step);
	if (has(mine)) return {
		file: mine,
		mirror: false,
		own: true,
		step,
		side: step + 1
	};
	const partner = DECOR_MIRROR_SIDE[step];
	const partnerFile = decorationSideFile(id, partner);
	if (partner === 0 || has(partnerFile)) return {
		file: partnerFile,
		mirror: true,
		own: true,
		step,
		side: step + 1
	};
	return {
		file: id,
		mirror: false,
		own: false,
		step,
		side: step + 1
	};
}
/** Source generations remain intact. These recent decorations render their non-destructive
* alpha-clean siblings, so the baked white checkerboard never reaches the game canvas. */
const DECORATION_ALPHA_CLEAN = /* @__PURE__ */ new Set([
	"ember-channels-001",
	"small-house",
	"stone-hut",
	"burning-house",
	"burnt-house-ruins"
]);
function decorationImagePath(id, ext) {
	if (id === "floor-connector") id = "floor-connector-down-red-v1";
	id = DECORATIONS[id]?.propModel ?? id;
	const file = DECORATION_ALPHA_CLEAN.has(id) ? `${id}-alpha-001` : id;
	const baseId = id.replace(/-side\d+$/, "");
	return `/game/decorations/${file}.${ext}${(TALL_POST_DECOR_IDS.includes(baseId) ? "?v=post-hd-20260930-2" : "") || (id === "locked-chest" ? "?v=4" : id === "dead-tree" || id === "fallen-log" || id === "barricade" || id === "small-house" || id === "stone-hut" ? "?v=4" : "")}`;
}
/** Every decoration's art, PNG first — the format every existing prop ships as. */
function decorationImage(id) {
	return decorationImagePath(id, "png");
}
/** Attach to an <img>'s onerror right after pointing it at decorationImage(id): if the PNG
* 404s, retries once with the same id as a WebP instead — for a prop supplied straight from AI
* generation with real alpha baked in, which sometimes only exists as .webp (no re-exporting
* through a lossy conversion step needed). A PNG that loads normally never touches this. */
function decorationImageRetryWebp(img, id) {
	img.onerror = () => {
		img.onerror = null;
		img.src = decorationImagePath(id, "webp");
	};
}
/** Every hex a placed decoration's footprint covers — impassable and blocks line of
* sight, independent of the terrain tile underneath (per user: "half covered is not a
* walking path"). */
/** Barricade props for every bare "barricade" tile that hasn't got one.
*
* Barricades are authored as terrain — the "b" of a hand-written layout, and what
* scatterTactics paints — but they are a decoration now. Rather than rewrite every map that
* ever placed one, the two meet here: the tile stays the source of truth for the rules, and
* the prop that belongs on it is derived wherever a board is loaded or generated. */
function barricadeDecor(tiles, cols, rows, existing) {
	const out = [];
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		if (tiles[y * cols + x] !== "barricade") continue;
		if (existing.some((d) => d.id === "barricade" && d.x === x && d.y === y)) continue;
		out.push({
			id: "barricade",
			x,
			y
		});
	}
	return out;
}
/** A footprint offset turned `rot` sixths of a circle about its anchor hex.
*
* Offsets are odd-r, where a row's horizontal shift depends on its parity, so a relative
* offset cannot be turned on its own — the same (dx, dy) means different neighbours on an
* odd row than on an even one. The turn therefore happens in cube space around the real
* anchor: offset to cube, subtract the anchor, rotate (x, y, z) -> (-z, -x, -y) per step,
* add the anchor back, and convert home.
*
* This never touches the shape constants themselves — a footprint is read, turned for this
* one placement, and the constant stays exactly as it was written.
*/
function rotateFootprint(footprint, anchorX, anchorY, rot) {
	const steps = (Math.round(rot) % 6 + 6) % 6;
	if (steps === 0) return footprint.map(({ dx, dy }) => ({
		dx,
		dy
	}));
	const parity = (row) => (row % 2 + 2) % 2;
	const toCube = (col, row) => {
		const x = col - (row - parity(row)) / 2;
		const z = row;
		return {
			x,
			y: -x - z,
			z
		};
	};
	const toOffset = (x, z) => ({
		col: x + (z - parity(z)) / 2,
		row: z
	});
	const anchor = toCube(anchorX, anchorY);
	return footprint.map(({ dx, dy }) => {
		const cell = toCube(anchorX + dx, anchorY + dy);
		let x = cell.x - anchor.x;
		let y = cell.y - anchor.y;
		let z = cell.z - anchor.z;
		for (let i = 0; i < steps; i++) {
			const nx = -z;
			const ny = -x;
			const nz = -y;
			x = nx;
			y = ny;
			z = nz;
		}
		const back = toOffset(x + anchor.x, z + anchor.z);
		return {
			dx: back.col - anchorX,
			dy: back.row - anchorY
		};
	});
}
/** The footprint a placement actually occupies, turned if it says it is turned. */
function placedFootprint(p) {
	const def = DECORATIONS[p.id];
	if (!def) return [];
	if (def.architectureSpan) return def.footprint.map(({ dx, dy }) => {
		const turn = (p.rot ?? 0) % 4;
		return turn === 1 ? {
			dx: -dy,
			dy: dx
		} : turn === 2 ? {
			dx: -dx,
			dy: -dy
		} : turn === 3 ? {
			dx: dy,
			dy: -dx
		} : {
			dx,
			dy
		};
	});
	return rotateFootprint(def.footprint, p.x, p.y, p.rot ?? 0);
}
/** Collision cells may cover more ground than the visual sizing footprint. */
function placedBlockingFootprint(p) {
	const def = DECORATIONS[p.id];
	if (!def) return [];
	if (def.architectureSpan) return placedFootprint({
		...p,
		id: p.id
	}).filter((cell) => {
		if (!def.blockingFootprint) return true;
		const turn = (p.rot ?? 0) % 4;
		return def.blockingFootprint.some(({ dx, dy }) => {
			const f = turn === 1 ? {
				dx: -dy,
				dy: dx
			} : turn === 2 ? {
				dx: -dx,
				dy: -dy
			} : turn === 3 ? {
				dx: dy,
				dy: -dx
			} : {
				dx,
				dy
			};
			return f.dx === cell.dx && f.dy === cell.dy;
		});
	});
	return rotateFootprint(def.blockingFootprint ?? def.footprint, p.x, p.y, p.rot ?? 0);
}
/** Remove legacy column terrain used as collision scaffolding under solid rocks.
* The decoration overlay supplies collision; the tile underneath is ordinary ground. */
function clearRockColumnTiles(tiles, cols, rows, decorations, baseTile) {
	const ground = baseTile && TERRAIN[baseTile].passable && baseTile !== "water" && baseTile !== "void" ? baseTile : tiles.includes("nave") ? "nave" : tiles.includes("snow") ? "snow" : "plains";
	const cleaned = [...tiles];
	for (const p of decorations) {
		const def = DECORATIONS[p.id];
		if (!SOLID_ROCK_DECOR_IDS.has(p.id) && !(def?.rockStyle && def.model3d === "wall")) continue;
		for (const { dx, dy } of placedFootprint(p)) {
			const x = p.x + dx, y = p.y + dy;
			if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
			const index = y * cols + x;
			if (cleaned[index] === "column") cleaned[index] = ground;
		}
	}
	return cleaned;
}
function decorationCells(placements) {
	const out = /* @__PURE__ */ new Set();
	for (const p of placements) for (const { dx, dy } of placedFootprint(p)) out.add(`${p.x + dx},${p.y + dy}`);
	return out;
}
/** Malrec's Conjurador line only: a starting 5% Ember resistance. Mages get no flat class
* boost — their resistances come from casting (a separate system). Trained skills add on top. */
const CONJURER_RESISTANCES = { ember: 5 };
const CLASSES = {
	...ENCOUNTER_NPC_CLASSES,
	swordsman: {
		id: "swordsman",
		name: "Guerreiro",
		role: "Linha de frente",
		hp: 34,
		atk: 9,
		mag: 0,
		def: 6,
		dex: 3,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "defaultWarrior",
		size: 1,
		init: 7
	},
	archer: {
		id: "archer",
		name: "Arqueira",
		role: "Alcance",
		hp: 24,
		atk: 8,
		mag: 0,
		def: 3,
		dex: 4,
		mov: 6,
		minRange: 2,
		maxRange: 4,
		sprite: "archerRecruit",
		size: 1,
		init: 3
	},
	mage: {
		id: "mage",
		name: "Mago Negro",
		role: "Magia",
		hp: 22,
		atk: 3,
		mag: 10,
		def: 2,
		dex: 6,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "mageRecruit",
		size: 1,
		init: 5
	},
	healer: {
		id: "healer",
		name: "Curandeiro",
		role: "Cura",
		hp: 26,
		atk: 4,
		mag: 8,
		def: 3,
		dex: 6,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "healerRecruit",
		size: 1,
		init: 8
	},
	soldier: {
		id: "soldier",
		name: "Soldado",
		role: "Milícia",
		hp: 31,
		atk: 8,
		mag: 0,
		def: 4,
		dex: 2,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "soldier",
		size: 1,
		init: 2
	},
	miliciaV2: {
		id: "miliciaV2",
		name: "Milícia",
		role: "Milícia",
		hp: 31,
		atk: 8,
		mag: 0,
		def: 4,
		dex: 2,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "militia-v2",
		size: 1,
		init: 2
	},
	pikeman: {
		id: "pikeman",
		name: "Piqueiro",
		role: "Pique",
		hp: 33,
		atk: 8,
		mag: 0,
		def: 5,
		dex: 2,
		mov: 3,
		minRange: 1,
		maxRange: 2,
		sprite: "pikeman",
		size: 1,
		init: 3
	},
	brigand: {
		id: "brigand",
		name: "Besteiro",
		role: "Emboscada",
		hp: 25,
		atk: 7,
		mag: 0,
		def: 2,
		dex: 3,
		mov: 3,
		minRange: 2,
		maxRange: 3,
		sprite: "brigand",
		size: 1,
		init: 4
	},
	captain: {
		id: "captain",
		name: "Capitão",
		role: "Comando",
		hp: 60,
		atk: 11,
		mag: 0,
		def: 7,
		dex: 4,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "captain",
		size: 1,
		init: 1
	},
	wardog: {
		id: "wardog",
		name: "Cão de guerra",
		role: "Profano",
		hp: 40,
		atk: 9,
		mag: 0,
		def: 3,
		dex: 1,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "wardog",
		size: 2,
		footprintOffsets: FOOTPRINT_TYPE_3,
		init: 6
	},
	wardog2: {
		id: "wardog2",
		name: "Cão de guerra 2",
		role: "Profano",
		hp: 40,
		atk: 9,
		mag: 0,
		def: 3,
		dex: 1,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "wardog2",
		size: 2,
		footprintOffsets: FOOTPRINT_TYPE_3,
		init: 6
	},
	morvenianWolf: {
		id: "morvenianWolf",
		name: "Mordavian Puppy",
		role: "Fera",
		hp: 34,
		atk: 10,
		mag: 0,
		def: 2,
		dex: 1,
		mov: 6,
		minRange: 1,
		maxRange: 1,
		sprite: "morvenian-wolf",
		size: 2,
		footprintOffsets: FOOTPRINT_TYPE_2,
		init: 7
	},
	mordavianWolf: {
		id: "mordavianWolf",
		name: "Mordavian Wolf",
		role: "Fera",
		hp: 44,
		atk: 13,
		mag: 0,
		def: 3,
		dex: 2,
		mov: 6,
		minRange: 1,
		maxRange: 1,
		sprite: "mordavian-wolf",
		size: 2,
		footprintOffsets: FOOTPRINT_TYPE_2,
		init: 7
	},
	mordavianWolfFinal: {
		id: "mordavianWolfFinal",
		name: "Mordavian Wolf Final",
		role: "Fera",
		hp: 44,
		atk: 13,
		mag: 0,
		def: 3,
		dex: 2,
		mov: 6,
		minRange: 1,
		maxRange: 1,
		sprite: "mordavian-wolf-final",
		size: 2,
		footprintOffsets: FOOTPRINT_TYPE_2,
		init: 7
	},
	punisher: {
		id: "punisher",
		name: "Carrasco",
		role: "Carrasco",
		hp: 55,
		atk: 13,
		mag: 0,
		def: 6,
		dex: 2,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "punisher",
		size: 1,
		init: 5
	},
	theButcher: {
		id: "theButcher",
		name: "The Butcher",
		role: "Chefe",
		hp: 72,
		atk: 19,
		mag: 0,
		def: 11,
		dex: 6,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "theButcher",
		size: 1,
		init: 6
	},
	birolho: {
		id: "birolho",
		name: "Birolho",
		role: "Abominação",
		hp: 78,
		atk: 12,
		mag: 0,
		def: 4,
		dex: 4,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "birolho",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 6
	},
	birolho2: {
		id: "birolho2",
		name: "Birolho2",
		role: "Abominação",
		hp: 78,
		atk: 12,
		mag: 0,
		def: 4,
		dex: 4,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "birolho2",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 6
	},
	birolho3: {
		id: "birolho3",
		name: "Birolho3",
		role: "Abominação",
		hp: 78,
		atk: 12,
		mag: 0,
		def: 4,
		dex: 4,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "birolho3",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 6
	},
	birolhoLegs: {
		id: "birolhoLegs",
		name: "BirolhoLegs",
		role: "Abominação",
		hp: 78,
		atk: 12,
		mag: 0,
		def: 4,
		dex: 4,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "BirolhoLegs",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 6
	},
	birolhoLegs2: {
		id: "birolhoLegs2",
		name: "BirolhoLegs2",
		role: "Abominação",
		hp: 78,
		atk: 12,
		mag: 0,
		def: 4,
		dex: 4,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "BirolhoLegs2",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 6
	},
	carnivorousPlant: {
		id: "carnivorousPlant",
		name: "Planta Carnívora",
		role: "Chefe",
		hp: 250,
		atk: 28,
		mag: 22,
		def: 20,
		dex: 15,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "carnivorous-plant-001",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 7,
		boss: true
	},
	sapling: {
		id: "sapling",
		name: "Muda Carnívora",
		role: "Planta",
		hp: 39,
		atk: 12,
		mag: 10,
		def: 7,
		dex: 6,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "sapling-001",
		size: 1,
		init: 5
	},
	cultist: {
		id: "cultist",
		name: "Feiticeiro",
		role: "Rito",
		hp: 23,
		atk: 2,
		mag: 9,
		def: 2,
		dex: 5,
		mov: 3,
		minRange: 1,
		maxRange: 2,
		sprite: "sorcerer",
		size: 1,
		init: 5
	},
	cultistV2: {
		id: "cultistV2",
		name: "Cultista Ancestral",
		role: "Rito",
		hp: 23,
		atk: 2,
		mag: 9,
		def: 2,
		dex: 5,
		mov: 3,
		minRange: 1,
		maxRange: 2,
		sprite: "cultist-v2",
		size: 1,
		init: 5
	},
	minorHorror: {
		id: "minorHorror",
		name: "Minor Horror",
		role: "Abominação",
		hp: 42,
		atk: 9,
		mag: 7,
		def: 3,
		dex: 4,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "minor-horror-001",
		size: 1,
		init: 5
	},
	horror: {
		id: "horror",
		name: "Horror",
		role: "Abominação",
		hp: 86,
		atk: 11,
		mag: 0,
		def: 5,
		dex: 5,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "horror",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 6
	},
	asherah: {
		id: "asherah",
		name: "Asherah",
		role: "Pesadelo",
		hp: 120,
		atk: 13,
		mag: 0,
		def: 6,
		dex: 4,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "Asherah",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 7
	},
	ancientGolem: {
		id: "ancientGolem",
		name: "Golem Ancião",
		role: "Construto",
		hp: 123,
		atk: 17,
		mag: 0,
		def: 13,
		dex: 4,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "ancient-golem",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 9
	},
	zombie: {
		id: "zombie",
		creatureType: "undead",
		name: "Zumbi",
		role: "Morto-vivo",
		hp: 38,
		atk: 9,
		mag: 0,
		def: 3,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "zombie",
		size: 1,
		init: 2
	},
	emberedWraith: {
		id: "emberedWraith",
		creatureType: "undead",
		name: "Embered Wraith",
		role: "Morto-vivo",
		hp: 76,
		atk: 18,
		mag: 18,
		def: 6,
		dex: 2,
		mov: 6,
		minRange: 1,
		maxRange: 1,
		sprite: "EmberedWraith",
		size: 1,
		init: 4
	},
	apparition: {
		id: "apparition",
		creatureType: "undead",
		name: "Apparition",
		role: "Fantasma",
		hp: 76,
		atk: 18,
		mag: 18,
		def: 6,
		dex: 2,
		mov: 6,
		minRange: 1,
		maxRange: 1,
		sprite: "apparition",
		size: 1,
		init: 4,
		undead: "ghost"
	},
	zombie2: {
		id: "zombie2",
		creatureType: "undead",
		name: "Zumbi 2",
		role: "Morto-vivo",
		hp: 38,
		atk: 9,
		mag: 0,
		def: 3,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "zombie2",
		size: 1,
		init: 2
	},
	undeadOx: {
		id: "undeadOx",
		creatureType: "undead",
		name: "Boi Morto-vivo",
		role: "Morto-vivo",
		hp: 95,
		atk: 20,
		mag: 10,
		def: 7,
		dex: 3,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "undeadOx",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_4,
		init: 3
	},
	plagueBearingCattle: {
		id: "plagueBearingCattle",
		creatureType: "undead",
		name: "Plague Bearing Cattle",
		role: "Morto-vivo",
		hp: 114,
		atk: 24,
		mag: 12,
		def: 8,
		dex: 4,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "plague-bearing-cattle",
		size: 2,
		footprintOffsets: FOOTPRINT_TYPE_3,
		init: 3
	},
	troll: {
		id: "troll",
		name: "Troll da caverna",
		role: "Bruto",
		hp: 88,
		atk: 12,
		mag: 0,
		def: 9,
		dex: 3,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "troll",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_8,
		init: 8
	},
	troll2: {
		id: "troll2",
		name: "Troll da caverna 2",
		role: "Bruto",
		hp: 88,
		atk: 12,
		mag: 0,
		def: 9,
		dex: 3,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "troll2",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 8
	},
	roccoTheBird: {
		id: "roccoTheBird",
		name: "Rocco The Bird",
		role: "Chefe",
		hp: 108,
		atk: 25,
		mag: 25,
		def: 20,
		dex: 20,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "RoccoTheBird",
		size: 4,
		footprintOffsets: FOOTPRINT_TYPE_7,
		init: 8,
		boss: true
	},
	swampBlueCalf: {
		id: "swampBlueCalf",
		name: "Cobalt Blue Deer",
		role: "Fera",
		hp: 22,
		atk: 7,
		mag: 0,
		def: 3,
		dex: 2,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "cobalt-blue-deer",
		size: 1,
		init: 6
	},
	bigBlueCalf: {
		id: "bigBlueCalf",
		name: "Big Blue Ox",
		role: "Fera",
		hp: 22,
		atk: 7,
		mag: 0,
		def: 3,
		dex: 2,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "big-blue-ox-002",
		size: 2,
		footprintOffsets: FOOTPRINT_TYPE_2,
		init: 6
	},
	assassin: {
		id: "assassin",
		name: "Assassino",
		role: "Emboscada",
		hp: 20,
		atk: 9,
		mag: 0,
		def: 2,
		dex: 3,
		mov: 6,
		minRange: 1,
		maxRange: 1,
		sprite: "brigand",
		size: 1,
		init: 1
	},
	rogue: {
		id: "rogue",
		name: "Ladino",
		role: "Infiltração",
		hp: 22,
		atk: 7,
		mag: 0,
		def: 2,
		dex: 3,
		mov: 6,
		minRange: 1,
		maxRange: 2,
		sprite: "brigand",
		size: 1,
		init: 2
	},
	lancer: {
		id: "lancer",
		name: "Lanceiro",
		role: "Pique",
		hp: 26,
		atk: 8,
		mag: 0,
		def: 4,
		dex: 3,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "lancer",
		size: 1,
		init: 4
	},
	aldric: {
		id: "aldric",
		name: "Lanceiro",
		role: "Pique",
		hp: 26,
		atk: 8,
		mag: 0,
		def: 4,
		dex: 3,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "aldric",
		size: 1,
		init: 4
	},
	sandoval: {
		id: "sandoval",
		name: "Lanceiro",
		role: "Lanceiro rival · Chefe",
		hp: 58,
		atk: 15,
		mag: 0,
		def: 10,
		dex: 6,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "sandoval",
		size: 1,
		init: 5,
		boss: true
	},
	kaelFinal: {
		id: "kaelFinal",
		name: "Guerreiro",
		role: "Espadachim · Teste visual",
		hp: 34,
		atk: 9,
		mag: 0,
		def: 6,
		dex: 3,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "kaelFinal",
		size: 1,
		init: 7
	},
	kaelEarly: {
		id: "kaelEarly",
		name: "Guerreiro",
		role: "Espadachim · versão inicial",
		hp: 34,
		atk: 9,
		mag: 0,
		def: 6,
		dex: 3,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "kaelEarly",
		size: 1,
		init: 7
	},
	neera: {
		id: "neera",
		name: "Arqueira",
		role: "Alcance",
		hp: 24,
		atk: 8,
		mag: 0,
		def: 3,
		dex: 4,
		mov: 6,
		minRange: 2,
		maxRange: 4,
		sprite: "neera",
		size: 1,
		init: 3
	},
	voss: {
		id: "voss",
		name: "Mago Negro",
		role: "Magia",
		hp: 22,
		atk: 3,
		mag: 10,
		def: 2,
		dex: 6,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "voss",
		size: 1,
		init: 5
	},
	salazar: {
		id: "salazar",
		name: "Curandeiro",
		role: "Cura",
		hp: 26,
		atk: 4,
		mag: 8,
		def: 3,
		dex: 6,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "salazar",
		size: 1,
		init: 8
	},
	conjurer: {
		id: "conjurer",
		resistances: CONJURER_RESISTANCES,
		name: "Conjurador",
		role: "Suporte arcano",
		hp: 18,
		atk: 3,
		mag: 10,
		def: 2,
		dex: 9,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "conjurer",
		size: 1,
		init: 6
	},
	familiar: {
		id: "familiar",
		name: "Familiar",
		role: "Invocação",
		hp: 10,
		atk: 3,
		mag: 3,
		def: 1,
		dex: 1,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "familiar",
		size: 1,
		init: 5,
		summon: true
	},
	familiar2: {
		id: "familiar2",
		name: "Familiar Maior",
		role: "Invocação",
		hp: 16,
		atk: 5,
		mag: 5,
		def: 2,
		dex: 2,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "familiar2",
		size: 1,
		init: 6,
		summon: true
	},
	familiar4: {
		id: "familiar4",
		name: "Familiar Radiante",
		role: "Invocação",
		hp: 16,
		atk: 5,
		mag: 5,
		def: 2,
		dex: 2,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "familiar4",
		size: 1,
		init: 6,
		summon: true
	},
	familiar3: {
		id: "familiar3",
		name: "Familiar Titã",
		role: "Invocação",
		hp: 22,
		atk: 8,
		mag: 8,
		def: 4,
		dex: 4,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "familiar3",
		size: 2,
		footprintOffsets: FOOTPRINT_TYPE_6,
		init: 6,
		summon: true
	},
	zombieDog: {
		id: "zombieDog",
		creatureType: "undead",
		name: "Cão Zumbi",
		role: "Invocação",
		hp: 22,
		atk: 8,
		mag: 8,
		def: 4,
		dex: 4,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "zombieDog",
		size: 2,
		footprintOffsets: FOOTPRINT_TYPE_2,
		init: 6,
		summon: true
	},
	paladin: {
		id: "paladin",
		name: "Paladino",
		role: "Guardião",
		hp: 30,
		atk: 6,
		mag: 4,
		def: 7,
		dex: 5,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "captain",
		size: 1,
		init: 9
	},
	heavyKnight: {
		id: "heavyKnight",
		name: "Cavaleiro Pesado",
		role: "Muralha",
		hp: 32,
		atk: 7,
		mag: 0,
		def: 9,
		dex: 3,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "troll",
		size: 1,
		init: 10
	},
	elementalist: {
		id: "elementalist",
		name: "Elementalista",
		role: "Promovido — Mago Negro",
		hp: 22,
		atk: 3,
		mag: 10,
		def: 2,
		dex: 6,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "mageRecruit",
		size: 1,
		init: 5
	},
	warlock: {
		id: "warlock",
		name: "Bruxo",
		role: "Promovido — Mago Negro",
		hp: 22,
		atk: 3,
		mag: 10,
		def: 2,
		dex: 6,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "mageRecruit",
		size: 1,
		init: 5
	},
	sorcerer: {
		id: "sorcerer",
		resistances: CONJURER_RESISTANCES,
		name: "Arcanista",
		role: "Promovido — Conjurador",
		hp: 18,
		atk: 3,
		mag: 10,
		def: 2,
		dex: 9,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "sorcerer",
		size: 1,
		init: 6
	},
	necromancer: {
		id: "necromancer",
		resistances: CONJURER_RESISTANCES,
		name: "Necromante",
		role: "Promovido — Conjurador",
		hp: 18,
		atk: 3,
		mag: 10,
		def: 2,
		dex: 9,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "sorcerer",
		size: 1,
		init: 6
	},
	cleric: {
		id: "cleric",
		name: "Clérigo",
		role: "Promovido — Curandeiro",
		hp: 26,
		atk: 4,
		mag: 8,
		def: 3,
		dex: 6,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "healerRecruit",
		size: 1,
		init: 8
	},
	bishop: {
		id: "bishop",
		name: "Bispo",
		role: "Promovido — Curandeiro",
		hp: 26,
		atk: 4,
		mag: 8,
		def: 3,
		dex: 6,
		mov: 5,
		minRange: 1,
		maxRange: 1,
		sprite: "healerRecruit",
		size: 1,
		init: 8
	},
	ranger: {
		id: "ranger",
		name: "Patrulheiro",
		role: "Promovido — Arqueira",
		hp: 24,
		atk: 8,
		mag: 0,
		def: 3,
		dex: 4,
		mov: 6,
		minRange: 2,
		maxRange: 4,
		sprite: "archerRecruit",
		size: 1,
		init: 3
	},
	sentinel: {
		id: "sentinel",
		name: "Sentinela",
		role: "Promovido — Lanceiro",
		hp: 26,
		atk: 8,
		mag: 0,
		def: 4,
		dex: 3,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "pikeman",
		size: 1,
		init: 4
	},
	templar: {
		id: "templar",
		name: "Templário",
		role: "Promovido — Lanceiro",
		hp: 26,
		atk: 8,
		mag: 0,
		def: 4,
		dex: 3,
		mov: 5,
		minRange: 1,
		maxRange: 2,
		sprite: "pikeman",
		size: 1,
		init: 4
	},
	beberrao: {
		id: "beberrao",
		name: "Beberrão",
		role: "Civil",
		hp: 11,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 0,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "beberrao",
		size: 1,
		init: 9
	},
	breadLady: {
		id: "breadLady",
		name: "Padeira",
		role: "Civil",
		hp: 9,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 0,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "breadLady",
		size: 1,
		init: 8
	},
	brue: {
		id: "brue",
		name: "Brue",
		role: "Civil — carcereiro",
		hp: 13,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "brue",
		size: 1,
		init: 8
	},
	crazyLady: {
		id: "crazyLady",
		name: "Louca da Vela",
		role: "Civil — errática",
		hp: 7,
		atk: 0,
		mag: 1,
		def: 0,
		dex: 2,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "crazyLady",
		size: 1,
		init: 10
	},
	mudinho: {
		id: "mudinho",
		name: "Mudinho",
		role: "Civil — mudo",
		hp: 8,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "mudinho",
		size: 1,
		init: 8
	},
	oldHealer: {
		id: "oldHealer",
		name: "Curandeiro Ancião",
		role: "Civil — místico errante",
		hp: 8,
		atk: 0,
		mag: 2,
		def: 0,
		dex: 2,
		mov: 3,
		minRange: 1,
		maxRange: 2,
		sprite: "oldHealer",
		size: 1,
		init: 9
	},
	peasant1: {
		id: "peasant1",
		name: "Camponês",
		role: "Civil",
		hp: 12,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 0,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "peasant1",
		size: 1,
		init: 7
	},
	shadyPatron: {
		id: "shadyPatron",
		name: "Cliente Suspeito",
		role: "Civil — frequentador estranho",
		hp: 9,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "shadyPatron",
		size: 1,
		init: 8
	},
	soupLady: {
		id: "soupLady",
		name: "Velha da Sopa",
		role: "Civil",
		hp: 7,
		atk: 0,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "soupLady",
		size: 1,
		init: 9
	},
	villagerF1: {
		id: "villagerF1",
		name: "Aldeã",
		role: "Civil",
		hp: 9,
		atk: 1,
		mag: 0,
		def: 0,
		dex: 1,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "villagerF1",
		size: 1,
		init: 8
	},
	woodsman: {
		id: "woodsman",
		name: "Lenhador",
		role: "Civil",
		hp: 13,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 0,
		mov: 4,
		minRange: 1,
		maxRange: 1,
		sprite: "woodsman",
		size: 1,
		init: 7
	},
	travelingMerchant: {
		id: "travelingMerchant",
		name: "Mercador",
		role: "Civil — mercador",
		hp: 10,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1,
		mov: 3,
		minRange: 1,
		maxRange: 1,
		sprite: "travelingMerchant",
		size: 1,
		init: 7
	}
};
const GROWTH = {
	...ENCOUNTER_NPC_GROWTH,
	swordsman: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	archer: {
		hp: 3,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 1
	},
	mage: {
		hp: 3,
		atk: 0,
		mag: 3,
		def: 1,
		dex: 3
	},
	healer: {
		hp: 3,
		atk: 0,
		mag: 1,
		def: 2,
		dex: 2
	},
	soldier: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	miliciaV2: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	pikeman: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	brigand: {
		hp: 3,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 1
	},
	captain: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	wardog: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	wardog2: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	zombie: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 1
	},
	zombie2: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 1
	},
	undeadOx: {
		hp: 10,
		atk: 5,
		mag: 2,
		def: 3,
		dex: 2
	},
	plagueBearingCattle: {
		hp: 12,
		atk: 6,
		mag: 2,
		def: 4,
		dex: 2
	},
	emberedWraith: {
		hp: 8,
		atk: 4,
		mag: 4,
		def: 2,
		dex: 2
	},
	apparition: {
		hp: 8,
		atk: 4,
		mag: 4,
		def: 2,
		dex: 2
	},
	morvenianWolf: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	mordavianWolf: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	mordavianWolfFinal: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	punisher: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	theButcher: {
		hp: 5,
		atk: 3,
		mag: 0,
		def: 3,
		dex: 2
	},
	birolho: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 2
	},
	birolho2: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 2
	},
	birolho3: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 2
	},
	birolhoLegs: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 2
	},
	birolhoLegs2: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 2
	},
	carnivorousPlant: {
		hp: 6,
		atk: 3,
		mag: 2,
		def: 3,
		dex: 3
	},
	sapling: {
		hp: 3,
		atk: 1,
		mag: 1,
		def: 1,
		dex: 1
	},
	cultist: {
		hp: 3,
		atk: 0,
		mag: 2,
		def: 1,
		dex: 2
	},
	cultistV2: {
		hp: 3,
		atk: 0,
		mag: 2,
		def: 1,
		dex: 2
	},
	minorHorror: {
		hp: 3,
		atk: 1,
		mag: 1,
		def: 1,
		dex: 1
	},
	horror: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 2
	},
	asherah: {
		hp: 5,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 2
	},
	troll: {
		hp: 5,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	troll2: {
		hp: 5,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	roccoTheBird: {
		hp: 5,
		atk: 3,
		mag: 3,
		def: 2,
		dex: 2
	},
	ancientGolem: {
		hp: 7,
		atk: 3,
		mag: 0,
		def: 3,
		dex: 1
	},
	swampBlueCalf: {
		hp: 3,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 1
	},
	bigBlueCalf: {
		hp: 3,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 1
	},
	assassin: {
		hp: 3,
		atk: 3,
		mag: 0,
		def: 1,
		dex: 1
	},
	rogue: {
		hp: 3,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 1
	},
	lancer: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	aldric: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	sandoval: {
		hp: 5,
		atk: 3,
		mag: 0,
		def: 2,
		dex: 1
	},
	kaelFinal: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	kaelEarly: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	neera: {
		hp: 3,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 1
	},
	voss: {
		hp: 3,
		atk: 0,
		mag: 3,
		def: 1,
		dex: 3
	},
	salazar: {
		hp: 3,
		atk: 0,
		mag: 1,
		def: 2,
		dex: 2
	},
	conjurer: {
		hp: 2,
		atk: 0,
		mag: 3,
		def: 1,
		dex: 4
	},
	familiar: {
		hp: 0,
		atk: 0,
		mag: 0,
		def: 0,
		dex: 0
	},
	familiar2: {
		hp: 0,
		atk: 0,
		mag: 0,
		def: 0,
		dex: 0
	},
	familiar3: {
		hp: 0,
		atk: 0,
		mag: 0,
		def: 0,
		dex: 0
	},
	zombieDog: {
		hp: 0,
		atk: 0,
		mag: 0,
		def: 0,
		dex: 0
	},
	familiar4: {
		hp: 0,
		atk: 0,
		mag: 0,
		def: 0,
		dex: 0
	},
	paladin: {
		hp: 5,
		atk: 1,
		mag: 1,
		def: 3,
		dex: 2
	},
	heavyKnight: {
		hp: 5,
		atk: 1,
		mag: 0,
		def: 3,
		dex: 1
	},
	elementalist: {
		hp: 3,
		atk: 0,
		mag: 3,
		def: 1,
		dex: 3
	},
	warlock: {
		hp: 3,
		atk: 0,
		mag: 3,
		def: 1,
		dex: 3
	},
	sorcerer: {
		hp: 2,
		atk: 0,
		mag: 3,
		def: 1,
		dex: 4
	},
	necromancer: {
		hp: 2,
		atk: 0,
		mag: 3,
		def: 1,
		dex: 4
	},
	cleric: {
		hp: 3,
		atk: 0,
		mag: 1,
		def: 2,
		dex: 2
	},
	bishop: {
		hp: 3,
		atk: 0,
		mag: 1,
		def: 2,
		dex: 2
	},
	ranger: {
		hp: 3,
		atk: 2,
		mag: 0,
		def: 1,
		dex: 1
	},
	sentinel: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	templar: {
		hp: 4,
		atk: 2,
		mag: 0,
		def: 2,
		dex: 1
	},
	beberrao: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 0
	},
	breadLady: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 0
	},
	brue: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	crazyLady: {
		hp: 1,
		atk: 0,
		mag: 1,
		def: 0,
		dex: 1
	},
	mudinho: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	oldHealer: {
		hp: 1,
		atk: 0,
		mag: 1,
		def: 0,
		dex: 1
	},
	peasant1: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 0
	},
	shadyPatron: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 1
	},
	soupLady: {
		hp: 1,
		atk: 0,
		mag: 0,
		def: 1,
		dex: 1
	},
	villagerF1: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 0,
		dex: 1
	},
	woodsman: {
		hp: 2,
		atk: 1,
		mag: 0,
		def: 1,
		dex: 0
	},
	travelingMerchant: {
		hp: 2,
		atk: 0,
		mag: 0,
		def: 1,
		dex: 1
	}
};
/** Cost from the current level to the next; each band starts at its named level. */
function expToLevel(level) {
	const current = Math.max(1, Math.min(29, level));
	if (current >= 28) return 600;
	if (current >= 23) return 500;
	if (current >= 18) return 400;
	if (current >= 13) return 300;
	if (current >= 8) return 225;
	if (current >= 3) return 150;
	return 100;
}
/** Flat XP adjustment per level of gap between target and attacker — see expForHit. */
const EXP_LEVEL_GAP_ADJUST = 3;
/**
* XP granted for a single qualifying action (a damaging hit, a heal, a potion — anything
* that calls gainExp). Fixed linear model, no diminishing curve and no cap: every level the
* TARGET outranks the attacker adds EXP_LEVEL_GAP_ADJUST XP (fighting up pays more), and
* every level the attacker outranks the target subtracts the same, down to a floor of 1 so
* an action never earns nothing. E.g. a level 5 attacker vs. a level 15 target (+10 gap)
* earns 43; equal-level actions earn 13; the floor starts at a -4 level gap.
*/
function expForHit(attackerLevel, defenderLevel) {
	const gap = defenderLevel - attackerLevel;
	return Math.max(1, 13 + EXP_LEVEL_GAP_ADJUST * gap);
}
Object.keys(CLASSES).filter((c) => !!CLASSES[c].summon);
function isBossClass(classId) {
	return !!CLASSES[classId]?.boss;
}
/** Kael's own story-progress variants — not a class choice, so they never belong next to
* an actual playable class name in a hint (see equipmentTooltip/weaponTooltip). Every
* *_TRIO usableBy group still lists them for real, so whoever's actually playing as Kael
* at that point in the story can still equip the gear — this only hides the redundant
* name from what the player reads. */
const NON_PLAYABLE_DISPLAY_CLASSES = /* @__PURE__ */ new Set(["kaelFinal", "kaelEarly"]);
/** Whether a class belongs in a player-facing "who can use this" list — excludes bosses
* (e.g. Sandoval) and Kael's internal story variants, which are real usableBy entries for
* gameplay but never a name a player should see listed as if it were a class of its own. */
function isPlayableClassForDisplay(classId) {
	return !isBossClass(classId) && !NON_PLAYABLE_DISPLAY_CLASSES.has(classId);
}
function isSummonClass(classId) {
	return !!CLASSES[classId]?.summon;
}
function statsFor(classId, level) {
	const cls = CLASSES[classId];
	const g = GROWTH[classId];
	const n = Math.max(0, Math.min(30, level) - 1);
	return {
		hp: cls.hp + g.hp * n,
		atk: cls.atk + g.atk * n,
		mag: cls.mag + g.mag * n,
		def: cls.def + g.def * n,
		dex: cls.dex + g.dex * n,
		resistances: { ...cls.resistances },
		mov: cls.mov,
		minRange: cls.minRange,
		maxRange: cls.maxRange,
		level: Math.max(1, Math.min(30, level))
	};
}
function rangeLabel(min, max) {
	return min === max ? `${min}` : `${min}–${max}`;
}
const POTIONS = {
	mid: {
		id: "mid",
		name: "Poção Média",
		dice: 2,
		faces: 8,
		bonus: 4,
		effect: "heal"
	},
	weak: {
		id: "weak",
		name: "Poção Fraca",
		dice: 1,
		faces: 8,
		bonus: 2,
		effect: "heal"
	},
	potent: {
		id: "potent",
		name: "Poção De Cura Potente",
		dice: 2,
		faces: 12,
		bonus: 6,
		effect: "heal"
	},
	disease: {
		id: "disease",
		name: "Poção De Curar Doenças",
		dice: 0,
		faces: 0,
		bonus: 0,
		effect: "disease"
	},
	manaSmall: {
		id: "manaSmall",
		name: "Poção De Mana Pequena",
		dice: 0,
		faces: 0,
		bonus: 0,
		effect: "mana",
		manaRestore: 1
	},
	manaMid: {
		id: "manaMid",
		name: "Poção De Mana Média",
		dice: 0,
		faces: 0,
		bonus: 0,
		effect: "mana",
		manaRestore: 2
	},
	manaLarge: {
		id: "manaLarge",
		name: "Poção De Mana Grande",
		dice: 0,
		faces: 0,
		bonus: 0,
		effect: "mana",
		manaRestore: 3
	}
};
const STARTING_BAG = {
	mid: 2,
	weak: 2,
	potent: 1,
	disease: 1,
	manaSmall: 1,
	manaMid: 0,
	manaLarge: 0,
	lockpick: 3
};
const EMPTY_BAG = {
	mid: 0,
	weak: 0,
	potent: 0,
	disease: 0,
	manaSmall: 0,
	manaMid: 0,
	manaLarge: 0,
	lockpick: 0
};
/** Rarity weights for loot rolls: weaker/cheaper potions and gear come up far more often
* than the strongest ones — "the strongest is harder to come out". */
const POTION_LOOT_WEIGHT = {
	weak: 50,
	mid: 30,
	potent: 12,
	disease: 8,
	manaSmall: 25,
	manaMid: 15,
	manaLarge: 6
};
function weightedPick(rng, entries) {
	const total = entries.reduce((n, [, w]) => n + w, 0);
	let roll = rng() * total;
	for (const [item, w] of entries) {
		roll -= w;
		if (roll <= 0) return item;
	}
	return entries[entries.length - 1][0];
}
function weightedPotionPick(rng) {
	return weightedPick(rng, Object.entries(POTION_LOOT_WEIGHT));
}
/** Loot-table weight for a priced item — inversely proportional to price (sqrt-tempered so
* top-tier gear is meaningfully rarer without being nearly unobtainable from chest luck). */
function priceWeight(price) {
	return 1 / Math.sqrt(Math.max(1, price));
}
/** Free starting weapons, including the heroes' explicit main/off-hand loadouts. */
function startingWeaponIds() {
	const ids = /* @__PURE__ */ new Set(["cajado-da-galhada", "punhal-curvo"]);
	for (const classId of Object.keys(CLASSES)) {
		const id = starterWeaponFor(classId);
		if (id) ids.add(id);
	}
	return ids;
}
/** Lowest/highest price across every lootable item (every weapon, every offHand
* EquipmentDef) — the endpoints of the 1-MAX_LEVEL power-level scale below. Recomputed
* from whatever WEAPONS/EQUIPMENT currently contain rather than hardcoded, so adding a new
* weapon or piece of gear (with a price, same as every existing one) automatically finds
* its place on the scale — nothing else to update by hand. */
function lootPriceRange() {
	const prices = [...Object.values(WEAPONS).map((w) => w.price), ...Object.values(EQUIPMENT).map((e) => e.price ?? 60)];
	return {
		min: Math.min(...prices),
		max: Math.max(...prices)
	};
}
/** Maps any lootable item's price onto the same 1-MAX_LEVEL scale player levels run —
* log-scaled, since price itself climbs roughly exponentially from rung to rung (see
* WEAPON_RUNGS). A level-1 dagger and a level-30 endgame greataxe read the same way loot
* power reads everywhere else in the game. */
function gearPowerLevel(price) {
	const { min, max } = lootPriceRange();
	if (max <= min) return 1;
	const t = Math.log(Math.max(min, price) / min) / Math.log(max / min);
	return Math.max(1, Math.min(30, Math.round(1 + t * 29)));
}
/** Weighted random pick across weapons and equipment, excluding free starting weapons, rarer as price
* climbs, capped to maxLevel on the gearPowerLevel scale (see BattleEngine.highestEnemyLevel)
* and — for weapons — excluding anything in ownedWeaponIds so a drop never announces a weapon the
* recipient already has. Used for chest loot and enemy kill drops alike. */
function weightedLootPick(rng, maxLevel = 30, ownedWeaponIds = /* @__PURE__ */ new Set()) {
	const startingWeapons = startingWeaponIds();
	const build = (level) => [...Object.values(WEAPONS).filter((w) => !startingWeapons.has(w.id) && gearPowerLevel(w.price) <= level && !ownedWeaponIds.has(w.id)).map((w) => [{
		kind: "weapon",
		id: w.id
	}, priceWeight(w.price)]), ...Object.values(EQUIPMENT).filter((e) => !startingWeapons.has(e.id) && gearPowerLevel(e.price ?? 60) <= level).map((e) => [{
		kind: "equipment",
		id: e.id
	}, priceWeight(e.price ?? 60)])];
	const entries = build(maxLevel);
	return weightedPick(rng, entries.length > 0 ? entries : build(30));
}
/** Weighted random pick across a given set of weapon ids, capped to maxLevel on the
* gearPowerLevel scale — for drop sources that only ever granted a weapon before (e.g.
* enemy kill drops), optionally restricted to a pool (e.g. "not already owned"). Defaults
* to every non-starting weapon in the game. Starting weapons stay excluded from fallback pools. */
function weightedWeaponPick(rng, ids = Object.keys(WEAPONS), maxLevel = 30) {
	const startingWeapons = startingWeaponIds();
	const lootable = (id) => !!WEAPONS[id] && !startingWeapons.has(id);
	const eligible = ids.filter(lootable);
	const candidates = eligible.length > 0 ? eligible : Object.keys(WEAPONS).filter(lootable);
	const capped = candidates.filter((id) => gearPowerLevel(WEAPONS[id].price) <= maxLevel);
	return weightedPick(rng, (capped.length > 0 ? capped : candidates).map((id) => [id, priceWeight(WEAPONS[id]?.price ?? 100)]));
}
/** How many of each potion a single hero can carry at once — a "goes to whoever acts
* next" chest-loot overflow (see BattleEngine.useLockpick) keeps a full-up party from
* losing drops outright; if every living hero is already at this cap, the potion is
* discarded. */
const POTION_CARRY_MAX = {
	weak: 5,
	mid: 5,
	potent: 5,
	disease: 5,
	manaSmall: 5,
	manaMid: 5,
	manaLarge: 5
};
/** Shared true-alpha artwork used by the backpack, Inn shop and loot notices. */
const RATIONS_ICON = "/game/icons/rations.png";
/** Chest-loot odds (BattleEngine.useLockpick): Ember gain is emberBase + 1..emberDice, and
* gearChance is an independent roll for one extra weapon/equipment drop on top of the
* guaranteed potion. Tier is picked by which chest decoration was opened — Baú Pequeno
* (locked-chest) rolls the base numbers, Baú Médio (chest-medium) the "better" ones, and
* Baú Grande (chest-large) the "best" ones; a chest listed in Mission.betterChests (a
* locked-loot-room, currently unused by any mission) also gets the "better" tier regardless
* of decoration. Same pool and price range throughout, just climbing odds — and gearTierMul
* stretches BattleEngine.highestEnemyLevel()'s cap (see weightedLootPick), so a bigger chest
* can hand out gear a plain one on the same map couldn't reach yet. */
const CHEST_LOOT = {
	emberBase: 3,
	emberDice: 6,
	gearChance: .4,
	gearTierMul: 1,
	betterEmberBase: 5,
	betterEmberDice: 8,
	betterGearChance: .55,
	betterGearTierMul: 1.35,
	bestEmberBase: 8,
	bestEmberDice: 10,
	bestGearChance: .75,
	bestGearTierMul: 1.75
};
const WEAPON_RUNGS = [
	{
		dice: 1,
		faces: 4,
		bonus: 0,
		price: 40
	},
	{
		dice: 1,
		faces: 6,
		bonus: 0,
		price: 90
	},
	{
		dice: 1,
		faces: 8,
		bonus: 0,
		price: 180
	},
	{
		dice: 1,
		faces: 10,
		bonus: 0,
		price: 320
	},
	{
		dice: 1,
		faces: 12,
		bonus: 0,
		price: 520
	},
	{
		dice: 2,
		faces: 6,
		bonus: 0,
		price: 800
	},
	{
		dice: 2,
		faces: 8,
		bonus: 0,
		price: 1200
	},
	{
		dice: 2,
		faces: 10,
		bonus: 0,
		price: 1800
	},
	{
		dice: 2,
		faces: 12,
		bonus: 0,
		price: 2600
	}
];
const MELEE = {
	minRange: 1,
	maxRange: 1
};
const REACH = {
	minRange: 1,
	maxRange: 2
};
const SPEAR = {
	minRange: 1,
	maxRange: 2,
	twoHanded: true
};
const RANGED = {
	minRange: 2,
	maxRange: 4,
	ranged: true
};
const RANGED_MASTERWORK = {
	minRange: 2,
	maxRange: 5,
	ranged: true
};
function wpn(weaponType, id, name, usableBy, rung, range = MELEE, bonusClass, extraBonus = 0) {
	const r = WEAPON_RUNGS[rung - 1];
	return {
		id,
		weaponType,
		name,
		usableBy,
		dice: r.dice,
		faces: r.faces,
		bonus: r.bonus + extraBonus,
		price: r.price + extraBonus * 60,
		minRange: range.minRange,
		maxRange: range.maxRange,
		ranged: range.ranged,
		twoHanded: range.twoHanded,
		bonusClass
	};
}
const ARCANE_MAGE_TRIO = [
	"mage",
	"voss",
	"elementalist",
	"warlock"
];
const ARCANE_CONJURER_TRIO = [
	"conjurer",
	"sorcerer",
	"necromancer"
];
const ARCANE_ALL = [...ARCANE_MAGE_TRIO, ...ARCANE_CONJURER_TRIO];
const HEAL_TRIO = [
	"healer",
	"salazar",
	"bishop",
	"cleric"
];
const WARRIOR_TRIO = [
	"swordsman",
	"kaelFinal",
	"kaelEarly",
	"paladin",
	"heavyKnight"
];
const ARCHER_TRIO = [
	"archer",
	"neera",
	"ranger",
	"assassin"
];
const LANCER_TRIO = [
	"lancer",
	"aldric",
	"sandoval",
	"sentinel",
	"templar"
];
const LEATHER_WEARERS = [
	...ARCHER_TRIO,
	...WARRIOR_TRIO,
	...LANCER_TRIO,
	"rogue"
];
const BOOT_WEARERS = [...LEATHER_WEARERS, ...ARCANE_ALL];
const SHIELD_WEARERS = [
	...WARRIOR_TRIO,
	...LANCER_TRIO,
	...HEAL_TRIO,
	"rogue"
];
const WEAPONS = {
	"cajado-de-osso": wpn("staff", "cajado-de-osso", "Cajado do Crescente Negro", ARCANE_ALL, 1, REACH, "mage"),
	"cajado-abissal": wpn("staff", "cajado-abissal", "Cajado Abissal", ARCANE_ALL, 9, REACH, void 0, 2),
	"cajado-de-ebano": wpn("staff", "cajado-de-ebano", "Cajado de Ébano", ARCANE_ALL, 3, REACH, "mage"),
	"cajado-igneo": wpn("staff", "cajado-igneo", "Cajado Ígneo", ARCANE_ALL, 4, REACH, "elementalist"),
	"bastao-do-pacto": wpn("staff", "bastao-do-pacto", "Bastão do Pacto", ARCANE_ALL, 5, REACH, "warlock"),
	"cajado-tempestuoso": wpn("staff", "cajado-tempestuoso", "Cajado Tempestuoso", ARCANE_ALL, 6, REACH, "elementalist"),
	"cetro-da-corrupcao": wpn("staff", "cetro-da-corrupcao", "Cetro da Corrupção", ARCANE_ALL, 7, REACH, "warlock"),
	"cajado-terrano": wpn("staff", "cajado-terrano", "Cajado Terrano", ARCANE_ALL, 8, REACH, "elementalist"),
	"bastao-do-vacuo": wpn("staff", "bastao-do-vacuo", "Bastão do Vácuo", ARCANE_ALL, 9, REACH, "mage"),
	"cajado-arcano": wpn("staff", "cajado-arcano", "Cajado Arcano", ARCANE_ALL, 1, REACH, "sorcerer", 1),
	"cajado-etereo": wpn("staff", "cajado-etereo", "Cajado Etéreo", ARCANE_ALL, 2, REACH, "conjurer", 1),
	"cajado-da-luz-sombria": wpn("staff", "cajado-da-luz-sombria", "Cajado da Luz Sombria", ARCANE_ALL, 3, REACH, "conjurer", 1),
	"cajado-da-chama-purpura": wpn("staff", "cajado-da-chama-purpura", "Cajado da Chama Púrpura", ARCANE_ALL, 4, REACH, "sorcerer", 1),
	"cajado-funebre": wpn("staff", "cajado-funebre", "Cajado Fúnebre", ARCANE_ALL, 5, REACH, "necromancer", 1),
	"bastao-do-caos": wpn("staff", "bastao-do-caos", "Bastão do Caos", ARCANE_ALL, 6, REACH, "conjurer", 1),
	"bastao-dos-restos": wpn("staff", "bastao-dos-restos", "Bastão dos Restos", ARCANE_ALL, 7, REACH, "necromancer", 1),
	"cajado-do-arcano-puro": wpn("staff", "cajado-do-arcano-puro", "Cajado do Arcano Puro", ARCANE_ALL, 8, REACH, "sorcerer", 1),
	"cajado-da-praga": wpn("staff", "cajado-da-praga", "Cajado da Praga", ARCANE_ALL, 9, REACH, "necromancer", 1),
	"cajado-da-renovacao": wpn("staff", "cajado-da-renovacao", "Cajado da Renovação", HEAL_TRIO, 2, MELEE, void 0, 1),
	"cajado-da-esperanca": wpn("staff", "cajado-da-esperanca", "Cajado da Esperança", HEAL_TRIO, 2),
	"cajado-da-graca": wpn("staff", "cajado-da-graca", "Cajado da Graça", HEAL_TRIO, 3),
	"cetro-da-luz": wpn("staff", "cetro-da-luz", "Cetro da Luz", HEAL_TRIO, 4),
	"bastao-da-purificacao": wpn("staff", "bastao-da-purificacao", "Bastão da Purificação", HEAL_TRIO, 5),
	"cajado-do-bispo": wpn("staff", "cajado-do-bispo", "Cajado do Bispo", HEAL_TRIO, 6),
	"cajado-da-comunhao": wpn("staff", "cajado-da-comunhao", "Cajado da Comunhão", HEAL_TRIO, 7),
	"cajado-da-fe": wpn("staff", "cajado-da-fe", "Cajado da Fé", HEAL_TRIO, 8),
	"cajado-da-justica": wpn("staff", "cajado-da-justica", "Cajado da Justiça", HEAL_TRIO, 9),
	"espada-larga": wpn("sword", "espada-larga", "Espada Larga", WARRIOR_TRIO, 1),
	"espadao": wpn("sword", "espadao", "Espadão", WARRIOR_TRIO, 2),
	"machado-de-guerra": wpn("axe", "machado-de-guerra", "Machado de Guerra", WARRIOR_TRIO, 3),
	"espada-da-lealdade": wpn("sword", "espada-da-lealdade", "Espada da Lealdade", WARRIOR_TRIO, 4),
	"espadao-pesado": wpn("sword", "espadao-pesado", "Espadão Pesado", WARRIOR_TRIO, 5),
	"lamina-sagrada": wpn("sword", "lamina-sagrada", "Lâmina Sagrada", WARRIOR_TRIO, 6),
	"martelo-de-guerra": wpn("hammer", "martelo-de-guerra", "Martelo de Guerra", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 1),
	"martelo-da-justica": wpn("hammer", "martelo-da-justica", "Martelo da Justiça", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 2),
	"machado-barbaro": wpn("axe", "machado-barbaro", "Machado Bárbaro", WARRIOR_TRIO, 7),
	"maca-de-espinhos": wpn("mace", "maca-de-espinhos", "Maça de Espinhos", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 1, MELEE, void 0, 3),
	"maca-flangeada-negra": wpn("mace", "maca-flangeada-negra", "Maça Flangeada Negra", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 2, MELEE, void 0, 3),
	"maca-diamantada-de-ferro": wpn("mace", "maca-diamantada-de-ferro", "Maça Diamantada de Ferro", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 3, MELEE, void 0, 3),
	"maca-da-cruz-ferrea": wpn("mace", "maca-da-cruz-ferrea", "Maça da Cruz Férrea", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 4, MELEE, void 0, 3),
	"maca-espinhada-dourada": wpn("mace", "maca-espinhada-dourada", "Maça Espinhada Dourada", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 5, MELEE, void 0, 3),
	"maca-alada-negra": wpn("mace", "maca-alada-negra", "Maça Alada Negra", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 6, MELEE, void 0, 3),
	"maca-do-leao-cruzado": wpn("mace", "maca-do-leao-cruzado", "Maça do Leão Cruzado", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 7, MELEE, void 0, 2),
	"maca-rubi-sombria": wpn("mace", "maca-rubi-sombria", "Maça Rubi Sombria", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 7, MELEE, void 0, 3),
	"maca-do-leao-duplo": wpn("mace", "maca-do-leao-duplo", "Maça do Leão Duplo", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 8, MELEE, void 0, 2),
	"maca-do-cranio-flamejante": wpn("mace", "maca-do-cranio-flamejante", "Maça do Crânio Flamejante", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 8, MELEE, void 0, 3),
	"maca-do-sol-sagrado": wpn("mace", "maca-do-sol-sagrado", "Maça do Sol Sagrado", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 9, MELEE, void 0, 2),
	"maca-do-nucleo-azul": wpn("mace", "maca-do-nucleo-azul", "Maça do Núcleo Azul", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 9, MELEE, void 0, 3),
	"arco-composto": wpn("bow", "arco-composto", "Arco Composto", ARCHER_TRIO, 1, RANGED),
	"arco-longo": wpn("bow", "arco-longo", "Arco Longo", ARCHER_TRIO, 2, RANGED),
	"arco-elfico": wpn("bow", "arco-elfico", "Arco Élfico", ARCHER_TRIO, 3, RANGED),
	"arco-do-cacador": wpn("bow", "arco-do-cacador", "Arco do Caçador", ARCHER_TRIO, 4, RANGED),
	"besta-leve": wpn("crossbow", "besta-leve", "Besta Leve", ARCHER_TRIO, 5, {
		minRange: 1,
		maxRange: 4,
		ranged: true
	}),
	"lanca": wpn("spear", "lanca", "Lança", LANCER_TRIO, 1, SPEAR),
	"partisan": wpn("spear", "partisan", "Partisan", LANCER_TRIO, 2, SPEAR),
	"guisarme": wpn("spear", "guisarme", "Guisarme", LANCER_TRIO, 3, SPEAR),
	"lanca-de-defesa": wpn("spear", "lanca-de-defesa", "Lança de Defesa", LANCER_TRIO, 4, SPEAR),
	"lanca-da-faixa-vermelha": wpn("spear", "lanca-da-faixa-vermelha", "Lança da Faixa Vermelha", LANCER_TRIO, 1, SPEAR, void 0, 1),
	"lanca-diamantada": wpn("spear", "lanca-diamantada", "Lança Diamantada", LANCER_TRIO, 2, SPEAR, void 0, 1),
	"lanca-da-faixa-sombria": wpn("spear", "lanca-da-faixa-sombria", "Lança da Faixa Sombria", LANCER_TRIO, 1, SPEAR, void 0, 2),
	"lanca-fluida-carmesim": wpn("spear", "lanca-fluida-carmesim", "Lança Fluida Carmesim", LANCER_TRIO, 2, SPEAR, void 0, 2),
	"lanca-alada-azul": wpn("spear", "lanca-alada-azul", "Lança Alada Azul", LANCER_TRIO, 3, SPEAR, void 0, 1),
	"lanca-serpente-rubra": wpn("spear", "lanca-serpente-rubra", "Lança da Serpente Rubra", LANCER_TRIO, 3, SPEAR, void 0, 2),
	"lanca-da-trepadeira": wpn("spear", "lanca-da-trepadeira", "Lança da Trepadeira", LANCER_TRIO, 4, SPEAR, void 0, 1),
	"lanca-da-estrela-polar": wpn("spear", "lanca-da-estrela-polar", "Lança da Estrela Polar", LANCER_TRIO, 5, SPEAR),
	"lanca-do-anjo-guardiao": wpn("spear", "lanca-do-anjo-guardiao", "Lança do Anjo Guardião", LANCER_TRIO, 6, SPEAR),
	"lanca-do-lobo-carmesim": wpn("spear", "lanca-do-lobo-carmesim", "Lança do Lobo Carmesim", LANCER_TRIO, 7, SPEAR),
	"lanca-da-esmeralda-viva": wpn("spear", "lanca-da-esmeralda-viva", "Lança da Esmeralda Viva", LANCER_TRIO, 8, SPEAR),
	"lanca-da-estrela-celeste": wpn("spear", "lanca-da-estrela-celeste", "Lança da Estrela Celeste", LANCER_TRIO, 9, SPEAR),
	"bastao-purificacao-sombrio": wpn("staff", "bastao-purificacao-sombrio", "Bastão da Purificação Sombria", HEAL_TRIO, 5, REACH, void 0, 1),
	"bastao-caos-fraturado": wpn("staff", "bastao-caos-fraturado", "Bastão do Caos Fraturado", ARCANE_ALL, 1, REACH, "conjurer", 2),
	"bastao-pacto-sangue": wpn("staff", "bastao-pacto-sangue", "Bastão do Pacto de Sangue", ARCANE_ALL, 2, REACH, "warlock", 2),
	"bastao-vacuo-negro": wpn("staff", "bastao-vacuo-negro", "Bastão do Vácuo Negro", ARCANE_ALL, 3, REACH, "mage", 2),
	"espada-juramento-negro": wpn("sword", "espada-juramento-negro", "Espada do Juramento Negro", WARRIOR_TRIO, 8),
	"montante-da-ruina": wpn("sword", "montante-da-ruina", "Montante da Ruína", WARRIOR_TRIO, 9),
	"espadao-do-carrasco": wpn("sword", "espadao-do-carrasco", "Espadão do Carrasco", WARRIOR_TRIO, 1, MELEE, void 0, 1),
	"zweihander-profana": wpn("sword", "zweihander-profana", "Zweihänder Profana", WARRIOR_TRIO, 2, MELEE, void 0, 1),
	"arco-composto-de-chifre": wpn("bow", "arco-composto-de-chifre", "Arco Composto de Chifre", ARCHER_TRIO, 5, RANGED),
	"arco-do-cacador-sombrio": wpn("bow", "arco-do-cacador-sombrio", "Arco do Caçador Sombrio", ARCHER_TRIO, 6, RANGED),
	"arco-elfico-de-cinzas": wpn("bow", "arco-elfico-de-cinzas", "Arco Élfico de Cinzas", ARCHER_TRIO, 7, RANGED),
	"arco-longo-de-teixo": wpn("bow", "arco-longo-de-teixo", "Arco Longo de Teixo", ARCHER_TRIO, 8, RANGED_MASTERWORK),
	"martelo-belico": wpn("hammer", "martelo-belico", "Martelo Bélico", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 3),
	"malho-do-juizo": wpn("hammer", "malho-do-juizo", "Malho do Juízo", [
		...WARRIOR_TRIO,
		"cleric",
		"healer",
		"salazar",
		"bishop"
	], 4),
	"lamina-consagrada": wpn("sword", "lamina-consagrada", "Lâmina Consagrada", WARRIOR_TRIO, 3, MELEE, void 0, 1),
	"arco-rustico": wpn("bow", "arco-rustico", "Arco Rústico", ARCHER_TRIO, 9, RANGED_MASTERWORK),
	"arco-prateado": wpn("bow", "arco-prateado", "Arco Prateado", ARCHER_TRIO, 1, RANGED, void 0, 1),
	"arco-de-peles": wpn("bow", "arco-de-peles", "Arco de Peles", ARCHER_TRIO, 2, RANGED, void 0, 1),
	"arco-de-aco": wpn("bow", "arco-de-aco", "Arco de Aço", ARCHER_TRIO, 3, RANGED, void 0, 1),
	"arco-de-galhos": wpn("bow", "arco-de-galhos", "Arco de Galhos", ARCHER_TRIO, 4, RANGED, void 0, 1),
	"arco-presas-douradas": wpn("bow", "arco-presas-douradas", "Arco de Presas Douradas", ARCHER_TRIO, 5, RANGED, void 0, 1),
	"arco-caveira-sombria": wpn("bow", "arco-caveira-sombria", "Arco da Caveira Sombria", ARCHER_TRIO, 6, RANGED, void 0, 1),
	"arco-guardiao-dos-galhos": wpn("bow", "arco-guardiao-dos-galhos", "Arco do Guardião dos Galhos", ARCHER_TRIO, 7, RANGED, void 0, 1),
	"arco-do-leao-dourado": wpn("bow", "arco-do-leao-dourado", "Arco do Leão Dourado", ARCHER_TRIO, 8, RANGED_MASTERWORK, void 0, 1),
	"arco-espinhoso-negro": wpn("bow", "arco-espinhoso-negro", "Arco Espinhoso Negro", ARCHER_TRIO, 9, RANGED_MASTERWORK, void 0, 1),
	"arco-outonal": wpn("bow", "arco-outonal", "Arco Outonal", ARCHER_TRIO, 1, RANGED, void 0, 2),
	"arco-penas-sombrias": wpn("bow", "arco-penas-sombrias", "Arco das Penas Sombrias", ARCHER_TRIO, 2, RANGED, void 0, 2),
	"cajado-do-julgamento": wpn("staff", "cajado-do-julgamento", "Cajado do Julgamento", ARCANE_ALL, 4, REACH, void 0, 2),
	"cajado-da-vinha": wpn("staff", "cajado-da-vinha", "Cajado da Vinha", HEAL_TRIO, 1, MELEE, void 0, 1),
	"cajado-espinhos-carmesim": wpn("staff", "cajado-espinhos-carmesim", "Cajado dos Espinhos Carmesim", ARCANE_ALL, 5, REACH, void 0, 2),
	"cajado-orbe-crescente": wpn("staff", "cajado-orbe-crescente", "Cajado do Orbe Crescente", ARCANE_ALL, 6, REACH, void 0, 2),
	"cajado-da-galhada": wpn("staff", "cajado-da-galhada", "Cajado da Galhada", HEAL_TRIO, 1),
	"cajado-cristal-sombrio": wpn("staff", "cajado-cristal-sombrio", "Cajado de Cristal Sombrio", ARCANE_ALL, 7, REACH, void 0, 2),
	"cajado-caveira-carneiro": wpn("staff", "cajado-caveira-carneiro", "Cajado da Caveira de Carneiro", ARCANE_ALL, 8, REACH, void 0, 2),
	"cajado-crescente-negro": wpn("staff", "cajado-crescente-negro", "Cajado de Osso", ARCANE_ALL, 2, REACH, "warlock"),
	"cajado-da-trepadeira": wpn("staff", "cajado-da-trepadeira", "Cajado da Trepadeira", HEAL_TRIO, 3, MELEE, void 0, 1),
	"espada-do-leao": wpn("sword", "espada-do-leao", "Espada do Leão", WARRIOR_TRIO, 4, MELEE, void 0, 1),
	"espada-diamante": wpn("sword", "espada-diamante", "Espada de Diamante", WARRIOR_TRIO, 5, MELEE, void 0, 1),
	"espada-real": wpn("sword", "espada-real", "Espada Real", WARRIOR_TRIO, 6, MELEE, void 0, 1),
	"espada-do-tridente": wpn("sword", "espada-do-tridente", "Espada do Tridente", WARRIOR_TRIO, 7, MELEE, void 0, 1),
	"espada-da-roda-solar": wpn("sword", "espada-da-roda-solar", "Espada da Roda Solar", WARRIOR_TRIO, 8, MELEE, void 0, 1),
	"cimitarra-do-dragao": wpn("sword", "cimitarra-do-dragao", "Cimitarra do Dragão", WARRIOR_TRIO, 9, MELEE, void 0, 1),
	"espada-do-leao-carmesim": wpn("sword", "espada-do-leao-carmesim", "Espada do Leão Carmesim", WARRIOR_TRIO, 1, MELEE, void 0, 2),
	"espada-da-caveira-espinhosa": wpn("sword", "espada-da-caveira-espinhosa", "Espada da Caveira Espinhosa", WARRIOR_TRIO, 2, MELEE, void 0, 2),
	"espada-dourada-suprema": wpn("sword", "espada-dourada-suprema", "Espada Dourada Suprema", WARRIOR_TRIO, 3, MELEE, void 0, 2),
	"espada-do-peregrino-caido": wpn("sword", "espada-do-peregrino-caido", "Espada do Peregrino Caído", WARRIOR_TRIO, 4, MELEE, void 0, 2),
	"espada-do-coracao-sangrento": wpn("sword", "espada-do-coracao-sangrento", "Espada do Coração Sangrento", WARRIOR_TRIO, 5, MELEE, void 0, 2),
	"espada-serrilhada": wpn("sword", "espada-serrilhada", "Espada Serrilhada", WARRIOR_TRIO, 6, MELEE, void 0, 2)
};
function weaponIcon(id) {
	return WEAPONS[id] ? `/game/icons/weapons/${id}.png` : "/game/icons/refresh-001/weapons/broad-sword.png";
}
function weaponsForClass(classId) {
	return Object.values(WEAPONS).filter((w) => w.usableBy.includes(classId));
}
function weaponPower(w) {
	return w.dice * (w.faces + 1) / 2 + w.bonus;
}
/** Cheapest/weakest weapon a class can use — auto-equipped for free until the player picks another. */
function starterWeaponFor(classId) {
	const staffStarter = classId === "healer" || classId === "salazar" || classId === "bishop";
	const list = weaponsForClass(classId).filter((w) => !staffStarter || w.weaponType === "staff");
	if (list.length === 0) return null;
	return list.reduce((a, b) => weaponPower(a) <= weaponPower(b) ? a : b).id;
}
function weaponRoll(weaponId, enh, rng) {
	if (!weaponId) return 0;
	const w = WEAPONS[weaponId];
	if (!w) return 0;
	return rollDice(w.dice, w.faces, w.bonus, rng) + enh;
}
function weaponDiceLabel(weaponId) {
	const w = WEAPONS[weaponId];
	return w ? diceFormula(w.dice, w.faces, w.bonus) : "";
}
function weaponRangeLabel(weaponId) {
	const w = WEAPONS[weaponId];
	return w ? `Alc ${rangeLabel(w.minRange, w.maxRange)}` : "";
}
const WEAPON_MAX_ENH = 5;
const EQUIPMENT_SLOTS = [
	{
		id: "head",
		label: "Cabeça"
	},
	{
		id: "neck",
		label: "Pescoço"
	},
	{
		id: "shoulders",
		label: "Ombros"
	},
	{
		id: "chest",
		label: "Peito"
	},
	{
		id: "hands",
		label: "Mãos"
	},
	{
		id: "waist",
		label: "Cintura"
	},
	{
		id: "legs",
		label: "Pernas"
	},
	{
		id: "feet",
		label: "Pés"
	},
	{
		id: "ring1",
		label: "Anel 1"
	},
	{
		id: "ring2",
		label: "Anel 2"
	},
	{
		id: "offHand",
		label: "Mão Secundária"
	}
];
/** Every dagger/katar of the archer line. They are never a main-hand weapon: the bow is always
* the main hand, and a dagger always goes in the off-hand slot (Mão Secundária attack and the
* adjacent counter). They keep the ids and art they had as main-hand weapons; damage is the same
* rung of the shared dice ladder. */
const OFFHAND_DAGGERS = [
	[
		"punhal-curvo",
		"Punhal Curvo",
		1
	],
	[
		"katar",
		"Katar",
		2
	],
	[
		"adaga-sombria",
		"Adaga Sombria",
		3
	],
	[
		"adaga-de-veneno",
		"Adaga de Veneno",
		4
	],
	[
		"adaga-viperina",
		"Adaga Viperina",
		5
	],
	[
		"misericordia-sombria",
		"Misericórdia Sombria",
		6
	],
	[
		"punhal-do-salteador",
		"Punhal do Salteador",
		7
	],
	[
		"katar-sepulcral",
		"Katar Sepulcral",
		8
	]
];
const OFFHAND_DAGGER_IDS = new Set(OFFHAND_DAGGERS.map(([id]) => id));
const EQUIPMENT = {
	hood: {
		id: "hood",
		name: "Capuz",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		dex: 1,
		price: 50
	},
	barbute: {
		id: "barbute",
		name: "Barbuta",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 1,
		price: 50
	},
	sallet: {
		id: "sallet",
		name: "Elmo Salade",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		price: 120
	},
	"heavy-war-helmet": {
		id: "heavy-war-helmet",
		name: "Elmo de Guerra Pesado",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		price: 600
	},
	"great-helm": {
		id: "great-helm",
		name: "Elmo de Grande Porte",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 7,
		price: 1300
	},
	"full-helm": {
		id: "full-helm",
		name: "Elmo Completo Gótico",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 4,
		dex: 1,
		price: 600
	},
	"elmo-de-cavaleiro-negro": {
		id: "elmo-de-cavaleiro-negro",
		name: "Elmo de Cavaleiro Negro",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 6,
		price: 900
	},
	"elmo-do-leao-dourado": {
		id: "elmo-do-leao-dourado",
		name: "Elmo do Leão Dourado",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 1,
		def: 6,
		price: 1300
	},
	"elmo-da-cruz-prateada": {
		id: "elmo-da-cruz-prateada",
		name: "Elmo da Cruz Prateada",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 7,
		dex: 1,
		price: 1800
	},
	"elmo-prateado-florido": {
		id: "elmo-prateado-florido",
		name: "Elmo Prateado Florido",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 8,
		price: 1800
	},
	"elmo-alado-da-flor-de-lis": {
		id: "elmo-alado-da-flor-de-lis",
		name: "Elmo Alado da Flor-de-Lis",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 8,
		dex: 1,
		price: 2400
	},
	"elmo-da-echarpe-carmesim": {
		id: "elmo-da-echarpe-carmesim",
		name: "Elmo da Echarpe Carmesim",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 1,
		def: 8,
		price: 2400
	},
	"coifa-de-malha-do-leao": {
		id: "coifa-de-malha-do-leao",
		name: "Coifa de Malha do Leão",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 1,
		def: 1,
		price: 120
	},
	"coifa-de-malha-da-estrela-carmesim": {
		id: "coifa-de-malha-da-estrela-carmesim",
		name: "Coifa de Malha da Estrela Carmesim",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		price: 120
	},
	"coifa-de-malha-leonina": {
		id: "coifa-de-malha-leonina",
		name: "Coifa de Malha Leonina",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		dex: 1,
		price: 220
	},
	"coifa-de-malha-da-estrela": {
		id: "coifa-de-malha-da-estrela",
		name: "Coifa de Malha da Estrela",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 3,
		dex: 1,
		price: 380
	},
	"elmo-de-malha-da-flor-de-lis": {
		id: "elmo-de-malha-da-flor-de-lis",
		name: "Elmo de Malha da Flor-de-Lis",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 1,
		def: 3,
		price: 380
	},
	"elmo-de-malha-celtico": {
		id: "elmo-de-malha-celtico",
		name: "Elmo de Malha Céltico",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 4,
		price: 380
	},
	"elmo-de-malha-alado": {
		id: "elmo-de-malha-alado",
		name: "Elmo de Malha Alado",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 4,
		dex: 2,
		price: 900
	},
	"elmo-de-malha-do-leao": {
		id: "elmo-de-malha-do-leao",
		name: "Elmo de Malha do Leão",
		slot: "head",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 3,
		dex: 2,
		price: 600
	},
	"capuz-negro-rasgado": {
		id: "capuz-negro-rasgado",
		name: "Capuz Negro Rasgado",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		dex: 2,
		price: 120
	},
	"capuz-bege-rasgado": {
		id: "capuz-bege-rasgado",
		name: "Capuz Bege Rasgado",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		mag: 1,
		dex: 1,
		price: 120
	},
	"capuz-costurado": {
		id: "capuz-costurado",
		name: "Capuz Costurado",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		atk: 1,
		dex: 2,
		price: 220
	},
	"capuz-vermelho-rasgado": {
		id: "capuz-vermelho-rasgado",
		name: "Capuz Vermelho Rasgado",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		hp: 1,
		dex: 2,
		price: 220
	},
	"capuz-verde-bordado": {
		id: "capuz-verde-bordado",
		name: "Capuz Verde Bordado",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		dmgMul: .05,
		dex: 4,
		price: 380
	},
	"capuz-remendado": {
		id: "capuz-remendado",
		name: "Capuz Remendado",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		def: 3,
		dex: 2,
		price: 600
	},
	"capuz-cinza-puido": {
		id: "capuz-cinza-puido",
		name: "Capuz Cinza Puído",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		dex: 5,
		price: 600
	},
	"capuz-argola-de-ferro": {
		id: "capuz-argola-de-ferro",
		name: "Capuz com Argola de Ferro",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		mag: 4,
		dex: 2,
		price: 900
	},
	"capuz-bussola-negro": {
		id: "capuz-bussola-negro",
		name: "Capuz da Bússola Negra",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		def: 2,
		dex: 5,
		price: 1300
	},
	"capuz-de-viajante": {
		id: "capuz-de-viajante",
		name: "Capuz do Viajante",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		mag: 2,
		def: 2,
		dex: 2,
		price: 900
	},
	"capuz-fivela-verde": {
		id: "capuz-fivela-verde",
		name: "Capuz de Fivela Verde",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		mag: 3,
		dex: 5,
		price: 1800
	},
	"capuz-argola-carmesim": {
		id: "capuz-argola-carmesim",
		name: "Capuz de Argola Carmesim",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		atk: 3,
		dex: 6,
		price: 2400
	},
	"capuz-corda-trancada": {
		id: "capuz-corda-trancada",
		name: "Capuz de Corda Trançada",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		atk: 3,
		def: 2,
		dex: 2,
		price: 1300
	},
	"capuz-remendo-de-couro": {
		id: "capuz-remendo-de-couro",
		name: "Capuz com Remendo de Couro",
		slot: "head",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		hp: 3,
		dex: 5,
		price: 1800
	},
	"plague-doctor-mask": {
		id: "plague-doctor-mask",
		name: "Máscara do Médico da Peste",
		slot: "head",
		usableBy: [
			...ARCANE_ALL,
			...ARCHER_TRIO,
			...HEAL_TRIO
		],
		mag: 1,
		def: 1,
		dex: 3,
		price: 600
	},
	"leather-shoulder-guards": {
		id: "leather-shoulder-guards",
		name: "Protetores de Ombro de Couro",
		slot: "shoulders",
		usableBy: LEATHER_WEARERS,
		def: 3,
		price: 220
	},
	"ombreira-de-couro-da-flor-de-lis": {
		id: "ombreira-de-couro-da-flor-de-lis",
		name: "Ombreira de Couro da Flor-de-Lis",
		slot: "shoulders",
		usableBy: LEATHER_WEARERS,
		def: 1,
		price: 50
	},
	"ombreira-de-couro-da-echarpe": {
		id: "ombreira-de-couro-da-echarpe",
		name: "Ombreira de Couro da Echarpe",
		slot: "shoulders",
		usableBy: LEATHER_WEARERS,
		def: 3,
		dex: 2,
		price: 600
	},
	"ombreira-de-couro-ornamentada": {
		id: "ombreira-de-couro-ornamentada",
		name: "Ombreira de Couro Ornamentada",
		slot: "shoulders",
		usableBy: LEATHER_WEARERS,
		def: 9,
		price: 2400
	},
	"ombreira-de-couro-do-pingente": {
		id: "ombreira-de-couro-do-pingente",
		name: "Ombreira de Couro do Pingente",
		slot: "shoulders",
		usableBy: LEATHER_WEARERS,
		atk: 2,
		def: 4,
		price: 900
	},
	"ombreira-de-couro-trancada": {
		id: "ombreira-de-couro-trancada",
		name: "Ombreira de Couro Trançada",
		slot: "shoulders",
		usableBy: LEATHER_WEARERS,
		def: 3,
		dex: 3,
		price: 900
	},
	"ombreira-de-pele-do-leao": {
		id: "ombreira-de-pele-do-leao",
		name: "Ombreira de Pele do Leão",
		slot: "shoulders",
		usableBy: LEATHER_WEARERS,
		dex: 8,
		price: 1800
	},
	"armored-shoulder-mantle": {
		id: "armored-shoulder-mantle",
		name: "Manto de Ombro Blindado",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		price: 120
	},
	"massive-pauldrons": {
		id: "massive-pauldrons",
		name: "Ombreiras Maciças",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 1,
		dex: 1,
		price: 120
	},
	"gothic-pauldrons-exceptional": {
		id: "gothic-pauldrons-exceptional",
		name: "Ombreiras Góticas Excepcionais",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 7,
		dex: 2,
		price: 2400
	},
	"ombreira-de-flor-de-lis": {
		id: "ombreira-de-flor-de-lis",
		name: "Ombreira de Flor-de-Lis",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 6,
		price: 900
	},
	"ombreira-do-leao-rugidor": {
		id: "ombreira-do-leao-rugidor",
		name: "Ombreira do Leão Rugidor",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 6,
		dex: 2,
		price: 1800
	},
	"ombreira-de-malha-do-leao": {
		id: "ombreira-de-malha-do-leao",
		name: "Ombreira de Malha do Leão",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 1,
		def: 3,
		price: 380
	},
	"ombreira-de-malha-da-estrela": {
		id: "ombreira-de-malha-da-estrela",
		name: "Ombreira de Malha da Estrela",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 3,
		price: 220
	},
	"ombreira-de-malha-do-leao-nobre": {
		id: "ombreira-de-malha-do-leao-nobre",
		name: "Ombreira de Malha do Leão Nobre",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 1,
		def: 6,
		price: 1300
	},
	"ombreira-de-malha-da-estrela-guia": {
		id: "ombreira-de-malha-da-estrela-guia",
		name: "Ombreira de Malha da Estrela-Guia",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 6,
		price: 900
	},
	"manto-de-malha-do-leao-carmesim": {
		id: "manto-de-malha-do-leao-carmesim",
		name: "Manto de Malha do Leão Carmesim",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		dex: 2,
		price: 380
	},
	"manto-de-malha-da-estrela": {
		id: "manto-de-malha-da-estrela",
		name: "Manto de Malha da Estrela",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		dex: 3,
		price: 1800
	},
	"travelers-cloak": {
		id: "travelers-cloak",
		name: "Capa de Viajante",
		slot: "shoulders",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		dex: 1,
		price: 50
	},
	"wine-cloak": {
		id: "wine-cloak",
		name: "Capa Tingida de Vinho",
		slot: "shoulders",
		usableBy: [...ARCANE_ALL, ...ARCHER_TRIO],
		def: 3,
		dex: 6,
		price: 2400
	},
	"tattered-war-cloak": {
		id: "tattered-war-cloak",
		name: "Capa de Guerra Esfarrapada",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 1,
		price: 50
	},
	"noble-war-cloak": {
		id: "noble-war-cloak",
		name: "Capa Nobre de Guerra Esfarrapada",
		slot: "shoulders",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 2,
		def: 3,
		price: 600
	},
	"leather-steel-cuirass": {
		id: "leather-steel-cuirass",
		name: "Couraça de Couro e Aço",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		def: 3,
		price: 220
	},
	"chainmail-hauberk": {
		id: "chainmail-hauberk",
		name: "Cota de Malha",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		def: 2,
		price: 120
	},
	"cota-do-leao": {
		id: "cota-do-leao",
		name: "Cota de Malha do Leão",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		def: 4,
		dex: 1,
		price: 600
	},
	"cota-da-cruz": {
		id: "cota-da-cruz",
		name: "Cota de Malha da Cruz",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		mag: 1,
		def: 3,
		price: 380
	},
	"cota-do-leao-dourada": {
		id: "cota-do-leao-dourada",
		name: "Cota de Malha Dourada do Leão",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		def: 11,
		price: 3900
	},
	"cota-de-pele-de-lobo-malha": {
		id: "cota-de-pele-de-lobo-malha",
		name: "Cota de Malha com Pele de Lobo",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		def: 4,
		dex: 2,
		price: 900
	},
	"cota-encapelada": {
		id: "cota-encapelada",
		name: "Cota de Malha Encapelada",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		def: 3,
		dex: 4,
		price: 1300
	},
	"cota-do-templario": {
		id: "cota-do-templario",
		name: "Cota de Malha do Templário",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		mag: 3,
		def: 9,
		price: 4800
	},
	"cota-da-echarpe-vermelha": {
		id: "cota-da-echarpe-vermelha",
		name: "Cota de Malha da Echarpe Vermelha",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		atk: 2,
		def: 8,
		price: 3100
	},
	"cota-sombria": {
		id: "cota-sombria",
		name: "Cota de Malha Sombria",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		mag: 1,
		def: 3,
		dex: 1,
		price: 600
	},
	"cota-da-arvore": {
		id: "cota-da-arvore",
		name: "Cota de Malha da Árvore",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		atk: 3,
		def: 4,
		dex: 3,
		price: 3100
	},
	"cota-do-templario-andrajosa": {
		id: "cota-do-templario-andrajosa",
		name: "Cota de Malha Andrajosa do Templário",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		hp: 3,
		def: 10,
		price: 5800
	},
	"cota-azul-ornamentada": {
		id: "cota-azul-ornamentada",
		name: "Cota de Malha Azul Ornamentada",
		slot: "chest",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		def: 11,
		dex: 3,
		price: 6900
	},
	"heavy-brigandine": {
		id: "heavy-brigandine",
		name: "Brigantina Pesada",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		dmgMul: .05,
		def: 2,
		price: 120
	},
	"scale-armor": {
		id: "scale-armor",
		name: "Armadura Escamada Medieval",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		dex: 1,
		price: 220
	},
	"couraca-do-leao-dourada": {
		id: "couraca-do-leao-dourada",
		name: "Couraça Dourada do Leão",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 9,
		dex: 2,
		price: 3900
	},
	"couraca-da-cruz-prateada": {
		id: "couraca-da-cruz-prateada",
		name: "Couraça Prateada da Cruz",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 9,
		dex: 3,
		price: 4800
	},
	"couraca-da-flor-de-lis": {
		id: "couraca-da-flor-de-lis",
		name: "Couraça da Flor-de-Lis",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 6,
		price: 900
	},
	"couraca-do-leao-rugidor": {
		id: "couraca-do-leao-rugidor",
		name: "Couraça do Leão Rugidor",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 6,
		dex: 1,
		price: 1300
	},
	"couraca-de-malha-do-leao-atlante": {
		id: "couraca-de-malha-do-leao-atlante",
		name: "Couraça de Malha do Leão Atlante",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 3,
		dex: 1,
		price: 380
	},
	"couraca-de-malha-da-cruz-estrelada": {
		id: "couraca-de-malha-da-cruz-estrelada",
		name: "Couraça de Malha da Cruz Estrelada",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		price: 600
	},
	"couraca-de-malha-do-leao-carmesim": {
		id: "couraca-de-malha-do-leao-carmesim",
		name: "Couraça de Malha do Leão Carmesim",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 2,
		def: 7,
		price: 2400
	},
	"couraca-de-malha-da-estrela-guia": {
		id: "couraca-de-malha-da-estrela-guia",
		name: "Couraça de Malha da Estrela-Guia",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 10,
		price: 3100
	},
	"couraca-de-malha-do-dragao-rubro": {
		id: "couraca-de-malha-do-dragao-rubro",
		name: "Couraça de Malha do Dragão Rubro",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 2,
		def: 11,
		price: 5800
	},
	"couraca-de-malha-do-grifo-azul": {
		id: "couraca-de-malha-do-grifo-azul",
		name: "Couraça de Malha do Grifo Azul",
		slot: "chest",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 14,
		price: 6900
	},
	"wanderer-brigandine": {
		id: "wanderer-brigandine",
		name: "Brigantina do Andarilho Sombrio",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		hp: 4,
		def: 3,
		dex: 3,
		price: 3100
	},
	"peitoral-do-leao": {
		id: "peitoral-do-leao",
		name: "Peitoral do Leão",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		def: 5,
		price: 600
	},
	"peitoral-encapuzado": {
		id: "peitoral-encapuzado",
		name: "Peitoral Encapuzado",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		hp: 1,
		def: 2,
		dex: 1,
		price: 380
	},
	"peitoral-escamado-ornamentado": {
		id: "peitoral-escamado-ornamentado",
		name: "Peitoral Escamado Ornamentado",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		atk: 2,
		def: 9,
		price: 3900
	},
	"peitoral-de-pele-de-lobo": {
		id: "peitoral-de-pele-de-lobo",
		name: "Peitoral de Pele de Lobo",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		def: 6,
		dex: 1,
		price: 1300
	},
	"peitoral-da-echarpe-carmesim": {
		id: "peitoral-da-echarpe-carmesim",
		name: "Peitoral da Echarpe Carmesim",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		atk: 5,
		def: 7,
		price: 4800
	},
	"peitoral-de-correias-cruzadas": {
		id: "peitoral-de-correias-cruzadas",
		name: "Peitoral de Correias Cruzadas",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		hp: 3,
		def: 5,
		price: 1800
	},
	"peitoral-do-emblema-do-leao": {
		id: "peitoral-do-emblema-do-leao",
		name: "Peitoral do Emblema do Leão",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		atk: 2,
		def: 5,
		dex: 2,
		price: 2400
	},
	"peitoral-de-pele-cinzenta": {
		id: "peitoral-de-pele-cinzenta",
		name: "Peitoral de Pele Cinzenta",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		hp: 2,
		def: 4,
		dex: 2,
		price: 1800
	},
	"peitoral-do-manto-drapeado": {
		id: "peitoral-do-manto-drapeado",
		name: "Peitoral do Manto Drapeado",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		def: 11,
		dex: 2,
		price: 5800
	},
	"peitoral-cravejado": {
		id: "peitoral-cravejado",
		name: "Peitoral Cravejado",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		hp: 1,
		def: 5,
		price: 900
	},
	"peitoral-de-couro-do-leao": {
		id: "peitoral-de-couro-do-leao",
		name: "Peitoral de Couro do Leão",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		atk: 1,
		def: 2,
		price: 220
	},
	"peitoral-escamado-carmesim": {
		id: "peitoral-escamado-carmesim",
		name: "Peitoral Escamado Carmesim",
		slot: "chest",
		usableBy: LEATHER_WEARERS,
		atk: 2,
		def: 10,
		dex: 2,
		price: 6900
	},
	"manto-remendado-do-arcanista": {
		id: "manto-remendado-do-arcanista",
		name: "Manto Remendado do Arcanista",
		slot: "chest",
		usableBy: ARCANE_ALL,
		dex: 2,
		price: 120
	},
	"manto-das-luas-rasgado": {
		id: "manto-das-luas-rasgado",
		name: "Manto das Luas Rasgado",
		slot: "chest",
		usableBy: ARCANE_ALL,
		mag: 1,
		dex: 2,
		price: 220
	},
	"manto-encapuzado-desgastado": {
		id: "manto-encapuzado-desgastado",
		name: "Manto Encapuzado Desgastado",
		slot: "chest",
		usableBy: ARCANE_ALL,
		dex: 5,
		price: 600
	},
	"manto-sombrio-encapuzado": {
		id: "manto-sombrio-encapuzado",
		name: "Manto Sombrio Encapuzado",
		slot: "chest",
		usableBy: ARCANE_ALL,
		hp: 3,
		dex: 3,
		price: 900
	},
	"manto-astral-da-meia-noite": {
		id: "manto-astral-da-meia-noite",
		name: "Manto Astral da Meia-Noite",
		slot: "chest",
		usableBy: ARCANE_ALL,
		mag: 3,
		dex: 4,
		price: 1300
	},
	"manto-sagrado-carmesim": {
		id: "manto-sagrado-carmesim",
		name: "Manto Sagrado Carmesim",
		slot: "chest",
		usableBy: ARCANE_ALL,
		atk: 2,
		mag: 2,
		dex: 5,
		price: 2400
	},
	"manto-da-noite-escarlate": {
		id: "manto-da-noite-escarlate",
		name: "Manto da Noite Escarlate",
		slot: "chest",
		usableBy: ARCANE_ALL,
		atk: 3,
		dex: 7,
		price: 3100
	},
	"manto-celeste-ornamentado": {
		id: "manto-celeste-ornamentado",
		name: "Manto Celeste Ornamentado",
		slot: "chest",
		usableBy: ARCANE_ALL,
		mag: 6,
		dex: 8,
		price: 6900
	},
	"manto-do-arauto-sombrio": {
		id: "manto-do-arauto-sombrio",
		name: "Manto do Arauto Sombrio",
		slot: "chest",
		usableBy: ARCANE_ALL,
		mag: 3,
		dex: 8,
		price: 3900
	},
	"manto-do-sol-radiante": {
		id: "manto-do-sol-radiante",
		name: "Manto do Sol Radiante",
		slot: "chest",
		usableBy: ARCANE_ALL,
		hp: 3,
		mag: 5,
		dex: 5,
		price: 5800
	},
	"studded-gauntlets": {
		id: "studded-gauntlets",
		name: "Manoplas Cravejadas",
		slot: "hands",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		atk: 1,
		price: 50
	},
	"plate-gauntlets": {
		id: "plate-gauntlets",
		name: "Manoplas de Placas",
		slot: "hands",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		atk: 3,
		def: 5,
		price: 1800
	},
	"engraved-vambrace": {
		id: "engraved-vambrace",
		name: "Braçadeira de Aço Gravada",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		price: 120
	},
	"manopla-de-cavaleiro-negro": {
		id: "manopla-de-cavaleiro-negro",
		name: "Manopla de Cavaleiro Negro",
		slot: "hands",
		usableBy: [
			...WARRIOR_TRIO,
			...LANCER_TRIO,
			...HEAL_TRIO
		],
		atk: 1,
		def: 2,
		dex: 2,
		price: 600
	},
	"manopla-do-leao-dourada": {
		id: "manopla-do-leao-dourada",
		name: "Manopla do Leão Dourada",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 3,
		def: 3,
		price: 900
	},
	"manopla-da-cruz-prateada": {
		id: "manopla-da-cruz-prateada",
		name: "Manopla da Cruz Prateada",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		dex: 2,
		price: 1300
	},
	"manopla-de-flor-de-lis": {
		id: "manopla-de-flor-de-lis",
		name: "Manopla de Flor-de-Lis",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		price: 600
	},
	"luva-de-couro-da-flor-de-lis": {
		id: "luva-de-couro-da-flor-de-lis",
		name: "Luva de Couro da Flor-de-Lis",
		slot: "hands",
		usableBy: LEATHER_WEARERS,
		def: 1,
		price: 50
	},
	"luva-de-couro-cruzada": {
		id: "luva-de-couro-cruzada",
		name: "Luva de Couro Cruzada",
		slot: "hands",
		usableBy: LEATHER_WEARERS,
		atk: 2,
		def: 2,
		price: 380
	},
	"luva-de-couro-diamantada": {
		id: "luva-de-couro-diamantada",
		name: "Luva de Couro Diamantada",
		slot: "hands",
		usableBy: LEATHER_WEARERS,
		atk: 7,
		price: 1300
	},
	"luva-de-couro-folheada": {
		id: "luva-de-couro-folheada",
		name: "Luva de Couro Folheada",
		slot: "hands",
		usableBy: LEATHER_WEARERS,
		def: 5,
		dex: 3,
		price: 1800
	},
	"luva-de-couro-blindada": {
		id: "luva-de-couro-blindada",
		name: "Luva de Couro Blindada",
		slot: "hands",
		usableBy: LEATHER_WEARERS,
		def: 5,
		price: 600
	},
	"luva-de-couro-andrajosa": {
		id: "luva-de-couro-andrajosa",
		name: "Luva de Couro Andrajosa",
		slot: "hands",
		usableBy: LEATHER_WEARERS,
		dex: 4,
		price: 380
	},
	"luva-de-couro-cravejada": {
		id: "luva-de-couro-cravejada",
		name: "Luva de Couro Cravejada",
		slot: "hands",
		usableBy: LEATHER_WEARERS,
		def: 2,
		dex: 3,
		price: 600
	},
	"luva-de-couro-da-espada": {
		id: "luva-de-couro-da-espada",
		name: "Luva de Couro da Espada",
		slot: "hands",
		usableBy: LEATHER_WEARERS,
		atk: 3,
		dex: 3,
		price: 900
	},
	"luva-de-couro-remendada": {
		id: "luva-de-couro-remendada",
		name: "Luva de Couro Remendada",
		slot: "hands",
		usableBy: LEATHER_WEARERS,
		dex: 3,
		price: 220
	},
	"manopla-de-malha-da-flor-de-lis": {
		id: "manopla-de-malha-da-flor-de-lis",
		name: "Manopla de Malha da Flor-de-Lis",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		price: 600
	},
	"manopla-de-malha-da-echarpe": {
		id: "manopla-de-malha-da-echarpe",
		name: "Manopla de Malha da Echarpe",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		dex: 1,
		price: 50
	},
	"manopla-de-malha-do-escudo": {
		id: "manopla-de-malha-do-escudo",
		name: "Manopla de Malha do Escudo",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		dex: 2,
		price: 380
	},
	"manopla-de-malha-do-leao": {
		id: "manopla-de-malha-do-leao",
		name: "Manopla de Malha do Leão",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 2,
		def: 5,
		price: 1300
	},
	"manopla-de-malha-cinturada": {
		id: "manopla-de-malha-cinturada",
		name: "Manopla de Malha Cinturada",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 3,
		price: 220
	},
	"manopla-de-malha-carmesim": {
		id: "manopla-de-malha-carmesim",
		name: "Manopla de Malha Carmesim",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		dex: 2,
		price: 120
	},
	"manopla-de-malha-cruzada": {
		id: "manopla-de-malha-cruzada",
		name: "Manopla de Malha Cruzada",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 3,
		def: 1,
		price: 380
	},
	"manopla-de-malha-do-medalhao": {
		id: "manopla-de-malha-do-medalhao",
		name: "Manopla de Malha do Medalhão",
		slot: "hands",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 8,
		price: 1800
	},
	"luva-do-pentagrama-desgastada": {
		id: "luva-do-pentagrama-desgastada",
		name: "Luva do Pentagrama Desgastada",
		slot: "hands",
		usableBy: ARCANE_ALL,
		mag: 1,
		price: 50
	},
	"luva-das-fases-da-lua": {
		id: "luva-das-fases-da-lua",
		name: "Luva das Fases da Lua",
		slot: "hands",
		usableBy: ARCANE_ALL,
		mag: 1,
		dex: 1,
		price: 120
	},
	"luva-do-talisma-gasto": {
		id: "luva-do-talisma-gasto",
		name: "Luva do Talismã Gasto",
		slot: "hands",
		usableBy: ARCANE_ALL,
		atk: 2,
		price: 120
	},
	"luva-da-bussola-arcana": {
		id: "luva-da-bussola-arcana",
		name: "Luva da Bússola Arcana",
		slot: "hands",
		usableBy: ARCANE_ALL,
		mag: 4,
		price: 380
	},
	"luva-do-viajante-astral": {
		id: "luva-do-viajante-astral",
		name: "Luva do Viajante Astral",
		slot: "hands",
		usableBy: ARCANE_ALL,
		atk: 2,
		mag: 2,
		price: 380
	},
	"luva-do-orbe-crescente": {
		id: "luva-do-orbe-crescente",
		name: "Luva do Orbe Crescente",
		slot: "hands",
		usableBy: ARCANE_ALL,
		mag: 3,
		dex: 2,
		price: 600
	},
	"luva-ritualistica-remendada": {
		id: "luva-ritualistica-remendada",
		name: "Luva Ritualística Remendada",
		slot: "hands",
		usableBy: ARCANE_ALL,
		hp: 1,
		mag: 2,
		price: 220
	},
	"luva-da-lua-negra": {
		id: "luva-da-lua-negra",
		name: "Luva da Lua Negra",
		slot: "hands",
		usableBy: ARCANE_ALL,
		atk: 2,
		mag: 5,
		price: 1300
	},
	"luva-do-oraculo-rasgada": {
		id: "luva-do-oraculo-rasgada",
		name: "Luva do Oráculo Rasgada",
		slot: "hands",
		usableBy: ARCANE_ALL,
		hp: 2,
		mag: 3,
		price: 600
	},
	"luva-do-olho-arcano": {
		id: "luva-do-olho-arcano",
		name: "Luva do Olho Arcano",
		slot: "hands",
		usableBy: ARCANE_ALL,
		mag: 7,
		price: 1300
	},
	"luva-carmesim-do-pentagrama": {
		id: "luva-carmesim-do-pentagrama",
		name: "Luva Carmesim do Pentagrama",
		slot: "hands",
		usableBy: ARCANE_ALL,
		hp: 2,
		atk: 2,
		mag: 2,
		price: 900
	},
	"luva-da-noite-estelar": {
		id: "luva-da-noite-estelar",
		name: "Luva da Noite Estelar",
		slot: "hands",
		usableBy: ARCANE_ALL,
		mag: 6,
		dex: 2,
		price: 1800
	},
	"studded-leather-pants": {
		id: "studded-leather-pants",
		name: "Calças de Couro Cravejado",
		slot: "legs",
		usableBy: LEATHER_WEARERS,
		def: 8,
		price: 1800
	},
	"chainmail-leggings": {
		id: "chainmail-leggings",
		name: "Grevas de Malha",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		price: 120
	},
	"plate-greaves": {
		id: "plate-greaves",
		name: "Grevas de Placas",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		price: 600
	},
	"plate-legs": {
		id: "plate-legs",
		name: "Perneiras de Placas Completas",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		mov: -1,
		def: 9,
		price: 2400
	},
	"perneiras-de-placas-ornamentadas": {
		id: "perneiras-de-placas-ornamentadas",
		name: "Perneiras de Placas Ornamentadas",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 11,
		price: 3900
	},
	"perneiras-de-flor-de-lis": {
		id: "perneiras-de-flor-de-lis",
		name: "Perneiras de Flor-de-Lis",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 9,
		dex: 2,
		price: 3900
	},
	"perneiras-andrajosas-de-batalha": {
		id: "perneiras-andrajosas-de-batalha",
		name: "Perneiras Andrajosas de Batalha",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 4,
		dex: 3,
		price: 1300
	},
	"perneiras-do-leao-douradas": {
		id: "perneiras-do-leao-douradas",
		name: "Perneiras do Leão Douradas",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 2,
		def: 10,
		price: 4800
	},
	"perneiras-da-cruz-prateadas": {
		id: "perneiras-da-cruz-prateadas",
		name: "Perneiras da Cruz Prateadas",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 11,
		dex: 2,
		price: 5800
	},
	"perneiras-do-emblema-de-flor-de-lis": {
		id: "perneiras-do-emblema-de-flor-de-lis",
		name: "Perneiras do Emblema de Flor-de-Lis",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 2,
		def: 8,
		price: 3100
	},
	"perneiras-de-malha-do-pingente": {
		id: "perneiras-de-malha-do-pingente",
		name: "Perneiras de Malha do Pingente",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 4,
		price: 380
	},
	"perneiras-de-malha-carmesim": {
		id: "perneiras-de-malha-carmesim",
		name: "Perneiras de Malha Carmesim",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 8,
		price: 1800
	},
	"perneiras-de-malha-do-leao": {
		id: "perneiras-de-malha-do-leao",
		name: "Perneiras de Malha do Leão",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 2,
		def: 4,
		price: 900
	},
	"perneiras-de-malha-ornamentada": {
		id: "perneiras-de-malha-ornamentada",
		name: "Perneiras de Malha Ornamentada",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 3,
		dex: 1,
		price: 380
	},
	"perneiras-de-malha-do-leao-emblema": {
		id: "perneiras-de-malha-do-leao-emblema",
		name: "Perneiras de Malha do Emblema do Leão",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		dex: 3,
		price: 1800
	},
	"perneiras-de-malha-da-estrela": {
		id: "perneiras-de-malha-da-estrela",
		name: "Perneiras de Malha da Estrela",
		slot: "legs",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 3,
		price: 220
	},
	"worn-leather-boots": {
		id: "worn-leather-boots",
		name: "Botas de Couro Gastas",
		slot: "feet",
		usableBy: BOOT_WEARERS,
		dex: 1,
		price: 50
	},
	"worn-mud-boots": {
		id: "worn-mud-boots",
		name: "Botas Enlameadas",
		slot: "feet",
		usableBy: BOOT_WEARERS,
		def: 3,
		price: 220
	},
	"buckled-leather-boots": {
		id: "buckled-leather-boots",
		name: "Botas de Fivela",
		slot: "feet",
		usableBy: BOOT_WEARERS,
		def: 4,
		price: 380
	},
	"steel-sabatons": {
		id: "steel-sabatons",
		name: "Solerets de Aço",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 1,
		price: 50
	},
	"bota-de-cavaleiro-negro": {
		id: "bota-de-cavaleiro-negro",
		name: "Bota de Cavaleiro Negro",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		price: 120
	},
	"bota-de-fivela-dupla": {
		id: "bota-de-fivela-dupla",
		name: "Bota de Fivela Dupla",
		slot: "feet",
		usableBy: BOOT_WEARERS,
		def: 3,
		dex: 4,
		price: 1300
	},
	"bota-de-cadarco-negra": {
		id: "bota-de-cadarco-negra",
		name: "Bota de Cadarço Negra",
		slot: "feet",
		usableBy: BOOT_WEARERS,
		mag: 2,
		def: 4,
		dex: 2,
		price: 1800
	},
	"bota-envolta": {
		id: "bota-envolta",
		name: "Bota Envolta",
		slot: "feet",
		usableBy: BOOT_WEARERS,
		dex: 5,
		price: 600
	},
	"bota-de-malha-do-leao": {
		id: "bota-de-malha-do-leao",
		name: "Bota de Malha do Leão",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 1,
		dex: 1,
		price: 120
	},
	"bota-ornamentada-de-flor-de-lis": {
		id: "bota-ornamentada-de-flor-de-lis",
		name: "Bota Ornamentada de Flor-de-Lis",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 4,
		dex: 1,
		price: 600
	},
	"bota-de-pele-nortenha": {
		id: "bota-de-pele-nortenha",
		name: "Bota de Pele Nortenha",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 1,
		dex: 2,
		price: 220
	},
	"bota-pesada-do-leao": {
		id: "bota-pesada-do-leao",
		name: "Bota Pesada do Leão",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		price: 600
	},
	"bota-pesada-da-cruz": {
		id: "bota-pesada-da-cruz",
		name: "Bota Pesada da Cruz",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		dex: 2,
		price: 380
	},
	"bota-pesada-dracontas": {
		id: "bota-pesada-dracontas",
		name: "Bota Pesada Dracônica",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 8,
		price: 1800
	},
	"bota-do-leao-dourada": {
		id: "bota-do-leao-dourada",
		name: "Bota do Leão Dourada",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 1,
		def: 5,
		price: 900
	},
	"bota-da-cruz-prateada": {
		id: "bota-da-cruz-prateada",
		name: "Bota da Cruz Prateada",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 5,
		dex: 2,
		price: 1300
	},
	"bota-de-malha-da-flor-de-lis": {
		id: "bota-de-malha-da-flor-de-lis",
		name: "Bota de Malha da Flor-de-Lis",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 3,
		price: 220
	},
	"bota-de-malha-da-cruz-carmesim": {
		id: "bota-de-malha-da-cruz-carmesim",
		name: "Bota de Malha da Cruz Carmesim",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 6,
		price: 900
	},
	"bota-de-malha-do-leao-dourado": {
		id: "bota-de-malha-do-leao-dourado",
		name: "Bota de Malha do Leão Dourado",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 1,
		def: 7,
		price: 1800
	},
	"bota-de-malha-florida": {
		id: "bota-de-malha-florida",
		name: "Bota de Malha Florida",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		atk: 1,
		def: 3,
		price: 380
	},
	"bota-de-malha-simples": {
		id: "bota-de-malha-simples",
		name: "Bota de Malha Simples",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 2,
		price: 120
	},
	"bota-de-malha-da-estrela": {
		id: "bota-de-malha-da-estrela",
		name: "Bota de Malha da Estrela",
		slot: "feet",
		usableBy: [...WARRIOR_TRIO, ...LANCER_TRIO],
		def: 6,
		dex: 1,
		price: 1300
	},
	"bota-do-pentagrama-desgastada": {
		id: "bota-do-pentagrama-desgastada",
		name: "Bota do Pentagrama Desgastada",
		slot: "feet",
		usableBy: ARCANE_ALL,
		mag: 1,
		price: 50
	},
	"bota-da-bussola-celeste": {
		id: "bota-da-bussola-celeste",
		name: "Bota da Bússola Celeste",
		slot: "feet",
		usableBy: ARCANE_ALL,
		mag: 5,
		price: 600
	},
	"bota-andrajosa-do-arcanista": {
		id: "bota-andrajosa-do-arcanista",
		name: "Bota Andrajosa do Arcanista",
		slot: "feet",
		usableBy: ARCANE_ALL,
		hp: 1,
		mag: 1,
		price: 120
	},
	"bota-encantada-da-lua-crescente": {
		id: "bota-encantada-da-lua-crescente",
		name: "Bota Encantada da Lua Crescente",
		slot: "feet",
		usableBy: ARCANE_ALL,
		mag: 5,
		dex: 2,
		price: 1300
	},
	"bota-da-faixa-escarlate": {
		id: "bota-da-faixa-escarlate",
		name: "Bota da Faixa Escarlate",
		slot: "feet",
		usableBy: ARCANE_ALL,
		atk: 2,
		mag: 2,
		price: 380
	},
	"bota-de-malha-lunar": {
		id: "bota-de-malha-lunar",
		name: "Bota de Malha Lunar",
		slot: "feet",
		usableBy: ARCANE_ALL,
		hp: 2,
		mag: 4,
		price: 900
	},
	"bota-da-faixa-runica": {
		id: "bota-da-faixa-runica",
		name: "Bota da Faixa Rúnica",
		slot: "feet",
		usableBy: ARCANE_ALL,
		mag: 1,
		dex: 2,
		price: 220
	},
	"bota-da-estrela-ornamentada": {
		id: "bota-da-estrela-ornamentada",
		name: "Bota da Estrela Ornamentada",
		slot: "feet",
		usableBy: ARCANE_ALL,
		atk: 3,
		mag: 5,
		price: 1800
	},
	broquel: {
		id: "broquel",
		name: "Broquel",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 1,
		dmgMul: .5,
		price: 50
	},
	"shield-buckler": {
		id: "shield-buckler",
		name: "Broquel de Aço",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		dmgMul: .6,
		def: 2,
		price: 220
	},
	"shield-round": {
		id: "shield-round",
		name: "Escudo Redondo",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 1,
		dmgMul: .6,
		price: 120
	},
	"shield-heater": {
		id: "shield-heater",
		name: "Escudo em Coração",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		dmgMul: .6,
		def: 3,
		price: 380
	},
	"cross-kite-shield": {
		id: "cross-kite-shield",
		name: "Escudo em Cunha com Cruz",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		dmgMul: .9,
		def: 6,
		price: 3100
	},
	"ancient-round-shield": {
		id: "ancient-round-shield",
		name: "Escudo Redondo Ancestral",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 3,
		dmgMul: .7,
		price: 600
	},
	"white-tree-shield": {
		id: "white-tree-shield",
		name: "Escudo da Árvore Branca",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 4,
		dex: 2,
		dmgMul: .9,
		price: 3100
	},
	"battle-cross-shield": {
		id: "battle-cross-shield",
		name: "Escudo Cruzado de Batalha",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 5,
		dmgMul: .9,
		price: 2400
	},
	"holy-paladin-shield": {
		id: "holy-paladin-shield",
		name: "Escudo do Paladino Sagrado",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 6,
		dex: 1,
		dmgMul: .95,
		price: 4800
	},
	"radiant-lion-shield": {
		id: "radiant-lion-shield",
		name: "Escudo do Leão Radiante",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 5,
		dex: 2,
		dmgMul: .9,
		price: 3900
	},
	"tattered-raven-shield": {
		id: "tattered-raven-shield",
		name: "Escudo do Corvo Andrajoso",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 2,
		dex: 2,
		dmgMul: .8,
		price: 1300
	},
	"crimson-banner-shield": {
		id: "crimson-banner-shield",
		name: "Escudo Bandeira Carmesim",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		dmgMul: .7,
		def: 5,
		price: 1300
	},
	"escudo-de-taboas": {
		id: "escudo-de-taboas",
		name: "Escudo de Tábuas",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 1,
		dex: 1,
		dmgMul: .7,
		price: 380
	},
	"escudo-da-cruz-palida": {
		id: "escudo-da-cruz-palida",
		name: "Escudo da Cruz Pálida",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 5,
		dmgMul: .8,
		price: 1800
	},
	"escudo-vermelho-e-negro": {
		id: "escudo-vermelho-e-negro",
		name: "Escudo Vermelho e Negro",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 4,
		dmgMul: .7,
		price: 900
	},
	"escudo-do-leao-rompante": {
		id: "escudo-do-leao-rompante",
		name: "Escudo do Leão Rompante",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 6,
		dex: 1,
		dmgMul: .9,
		price: 3900
	},
	"escudo-de-bandas-cruzadas": {
		id: "escudo-de-bandas-cruzadas",
		name: "Escudo de Bandas Cruzadas",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		def: 3,
		dex: 1,
		dmgMul: .8,
		price: 1300
	},
	"escudo-andrajoso": {
		id: "escudo-andrajoso",
		name: "Escudo Andrajoso",
		slot: "offHand",
		kind: "shield",
		usableBy: SHIELD_WEARERS,
		mag: 1,
		def: 1,
		dmgMul: .7,
		price: 380
	},
	...Object.fromEntries(OFFHAND_DAGGERS.map(([id, name, rung]) => {
		const r = WEAPON_RUNGS[rung - 1];
		return [id, {
			id,
			name,
			slot: "offHand",
			kind: "weapon",
			weaponType: "dagger",
			usableBy: ARCHER_TRIO,
			dice: r.dice,
			faces: r.faces,
			bonus: r.bonus,
			minRange: 1,
			maxRange: 1,
			price: r.price
		}];
	})),
	"katar-secundario": {
		id: "katar-secundario",
		name: "Katar Secundário",
		slot: "offHand",
		kind: "weapon",
		weaponType: "dagger",
		usableBy: ARCHER_TRIO,
		dice: 1,
		faces: 6,
		bonus: 0,
		minRange: 1,
		maxRange: 1,
		price: 90
	},
	amulet: {
		id: "amulet",
		name: "Amuleto de Cordão de Couro",
		slot: "neck",
		mag: 1,
		price: 50
	},
	"venom-flask-charm": {
		id: "venom-flask-charm",
		name: "Frasco-Talismã Venenoso",
		slot: "neck",
		mag: 3,
		dex: 1,
		price: 380
	},
	"amuleto-da-cruz-caveira": {
		id: "amuleto-da-cruz-caveira",
		name: "Amuleto da Cruz Caveira",
		slot: "neck",
		atk: 1,
		price: 50
	},
	"amuleto-da-cabeca-de-lobo": {
		id: "amuleto-da-cabeca-de-lobo",
		name: "Amuleto da Cabeça de Lobo",
		slot: "neck",
		atk: 1,
		def: 1,
		price: 120
	},
	"talisma-do-cristal-carmesim": {
		id: "talisma-do-cristal-carmesim",
		name: "Talismã do Cristal Carmesim",
		slot: "neck",
		atk: 1,
		dex: 1,
		price: 120
	},
	"talisma-do-chifre-antigo": {
		id: "talisma-do-chifre-antigo",
		name: "Talismã do Chifre Antigo",
		slot: "neck",
		mag: 2,
		def: 1,
		dex: 1,
		price: 380
	},
	"frasco-do-elixir-vermelho": {
		id: "frasco-do-elixir-vermelho",
		name: "Frasco do Elixir Vermelho",
		slot: "neck",
		def: 3,
		dex: 1,
		price: 380
	},
	"amuleto-da-coroa-de-espinhos": {
		id: "amuleto-da-coroa-de-espinhos",
		name: "Amuleto da Coroa de Espinhos",
		slot: "neck",
		def: 2,
		dex: 3,
		price: 600
	},
	"placa-da-cruz-crescente": {
		id: "placa-da-cruz-crescente",
		name: "Placa da Cruz Crescente",
		slot: "neck",
		mag: 2,
		dex: 3,
		price: 600
	},
	"talisma-da-presa-e-do-crucifixo": {
		id: "talisma-da-presa-e-do-crucifixo",
		name: "Talismã da Presa e do Crucifixo",
		slot: "neck",
		mag: 3,
		def: 2,
		price: 600
	},
	"medalhao-do-sol-e-da-lua": {
		id: "medalhao-do-sol-e-da-lua",
		name: "Medalhão do Sol e da Lua",
		slot: "neck",
		mag: 2,
		def: 3,
		price: 600
	},
	"placa-da-arvore-sagrada": {
		id: "placa-da-arvore-sagrada",
		name: "Placa da Árvore Sagrada",
		slot: "neck",
		atk: 1,
		mag: 1,
		price: 120
	},
	"amuleto-do-lobo-crescente": {
		id: "amuleto-do-lobo-crescente",
		name: "Amuleto do Lobo Crescente",
		slot: "neck",
		hp: 1,
		dex: 2,
		price: 220
	},
	"talisma-do-cristal-envolto": {
		id: "talisma-do-cristal-envolto",
		name: "Talismã do Cristal Envolto",
		slot: "neck",
		hp: 1,
		def: 2,
		price: 220
	},
	"talisma-da-ampulheta-sangrenta": {
		id: "talisma-da-ampulheta-sangrenta",
		name: "Talismã da Ampulheta Sangrenta",
		slot: "neck",
		hp: 1,
		atk: 2,
		price: 220
	},
	"medalhao-do-sol-dourado": {
		id: "medalhao-do-sol-dourado",
		name: "Medalhão do Sol Dourado",
		slot: "neck",
		def: 3,
		dex: 4,
		price: 1300
	},
	"amuleto-dos-espinhos-negros": {
		id: "amuleto-dos-espinhos-negros",
		name: "Amuleto dos Espinhos Negros",
		slot: "neck",
		mag: 3,
		dex: 4,
		price: 1300
	},
	"talisma-do-chifre-ornamentado": {
		id: "talisma-do-chifre-ornamentado",
		name: "Talismã do Chifre Ornamentado",
		slot: "neck",
		mag: 3,
		def: 4,
		price: 1300
	},
	"amuleto-da-cruz-rubra": {
		id: "amuleto-da-cruz-rubra",
		name: "Amuleto da Cruz Rubra",
		slot: "neck",
		atk: 2,
		mag: 2,
		dex: 2,
		price: 900
	},
	"medalhao-da-arvore-da-vida": {
		id: "medalhao-da-arvore-da-vida",
		name: "Medalhão da Árvore da Vida",
		slot: "neck",
		atk: 2,
		def: 2,
		dex: 2,
		price: 900
	},
	"talisma-do-cristal-ardente": {
		id: "talisma-do-cristal-ardente",
		name: "Talismã do Cristal Ardente",
		slot: "neck",
		def: 6,
		dex: 2,
		price: 1800
	},
	"talisma-da-caveira-de-corvo": {
		id: "talisma-da-caveira-de-corvo",
		name: "Talismã da Caveira de Corvo",
		slot: "neck",
		dex: 6,
		price: 900
	},
	"placa-runica-antiga": {
		id: "placa-runica-antiga",
		name: "Placa Rúnica Antiga",
		slot: "neck",
		atk: 2,
		mag: 2,
		def: 2,
		dex: 2,
		price: 1800
	},
	"equipment-satchel": {
		id: "equipment-satchel",
		name: "Sacola de Equipamento",
		slot: "waist",
		hp: 6,
		def: 1,
		price: 6e3
	},
	"double-buckle-belt": {
		id: "double-buckle-belt",
		name: "Cinto de Fivela Dupla",
		slot: "waist",
		hp: 1,
		price: 50
	},
	"iron-ration-bowl": {
		id: "iron-ration-bowl",
		name: "Tigela de Campanha de Ferro",
		slot: "waist",
		hp: 7,
		dex: 2,
		price: 2400
	},
	"cinturao-remendado-do-arcanista": {
		id: "cinturao-remendado-do-arcanista",
		name: "Cinturão Remendado do Arcanista",
		slot: "waist",
		usableBy: ARCANE_ALL,
		mag: 1,
		price: 50
	},
	"cinturao-do-grimorio-rasgado": {
		id: "cinturao-do-grimorio-rasgado",
		name: "Cinturão do Grimório Rasgado",
		slot: "waist",
		usableBy: ARCANE_ALL,
		mag: 1,
		dex: 1,
		price: 120
	},
	"cinturao-da-estrela-cadente": {
		id: "cinturao-da-estrela-cadente",
		name: "Cinturão da Estrela Cadente",
		slot: "waist",
		usableBy: ARCANE_ALL,
		mag: 4,
		price: 380
	},
	"cinturao-da-lua-crescente-desgastado": {
		id: "cinturao-da-lua-crescente-desgastado",
		name: "Cinturão da Lua Crescente Desgastado",
		slot: "waist",
		usableBy: ARCANE_ALL,
		hp: 1,
		mag: 2,
		price: 220
	},
	"cinturao-do-frasco-carmesim": {
		id: "cinturao-do-frasco-carmesim",
		name: "Cinturão do Frasco Carmesim",
		slot: "waist",
		usableBy: ARCANE_ALL,
		atk: 2,
		mag: 4,
		price: 900
	},
	"cinturao-do-cristal-etereo": {
		id: "cinturao-do-cristal-etereo",
		name: "Cinturão do Cristal Etéreo",
		slot: "waist",
		usableBy: ARCANE_ALL,
		mag: 5,
		dex: 2,
		price: 1300
	},
	"cinturao-ornamentado-do-oraculo": {
		id: "cinturao-ornamentado-do-oraculo",
		name: "Cinturão Ornamentado do Oráculo",
		slot: "waist",
		usableBy: ARCANE_ALL,
		mag: 8,
		price: 1800
	},
	"cinturao-do-selo-lunar": {
		id: "cinturao-do-selo-lunar",
		name: "Cinturão do Selo Lunar",
		slot: "waist",
		usableBy: ARCANE_ALL,
		hp: 2,
		mag: 7,
		price: 2400
	},
	"cinto-de-adagas-remendado": {
		id: "cinto-de-adagas-remendado",
		name: "Cinto de Adagas Remendado",
		slot: "waist",
		usableBy: ["rogue"],
		atk: 1,
		price: 50
	},
	"cinto-de-lamina-oculta": {
		id: "cinto-de-lamina-oculta",
		name: "Cinto de Lâmina Oculta",
		slot: "waist",
		usableBy: ["rogue"],
		atk: 1,
		dex: 1,
		price: 120
	},
	"cinto-do-assassino-escarlate": {
		id: "cinto-do-assassino-escarlate",
		name: "Cinto do Assassino Escarlate",
		slot: "waist",
		usableBy: ["rogue"],
		atk: 4,
		price: 380
	},
	"cinto-da-bolsa-furtiva": {
		id: "cinto-da-bolsa-furtiva",
		name: "Cinto da Bolsa Furtiva",
		slot: "waist",
		usableBy: ["rogue"],
		hp: 1,
		atk: 2,
		price: 220
	},
	"cinto-de-adagas-triplo": {
		id: "cinto-de-adagas-triplo",
		name: "Cinto de Adagas Triplo",
		slot: "waist",
		usableBy: ["rogue"],
		atk: 3,
		dex: 2,
		price: 600
	},
	"cinto-da-caveira-alada": {
		id: "cinto-da-caveira-alada",
		name: "Cinto da Caveira Alada",
		slot: "waist",
		usableBy: ["rogue"],
		dex: 5,
		price: 600
	},
	"cinto-das-laminas-rubras": {
		id: "cinto-das-laminas-rubras",
		name: "Cinto das Lâminas Rubras",
		slot: "waist",
		usableBy: ["rogue"],
		atk: 6,
		price: 900
	},
	"cinto-do-encapuzado-esmeralda": {
		id: "cinto-do-encapuzado-esmeralda",
		name: "Cinto do Encapuzado Esmeralda",
		slot: "waist",
		usableBy: ["rogue"],
		atk: 4,
		dex: 4,
		price: 1800
	},
	"cinto-do-carrasco-encapuzado": {
		id: "cinto-do-carrasco-encapuzado",
		name: "Cinto do Carrasco Encapuzado",
		slot: "waist",
		usableBy: ["rogue"],
		atk: 7,
		dex: 2,
		price: 2400
	},
	"cinto-da-serpente-ancestral": {
		id: "cinto-da-serpente-ancestral",
		name: "Cinto da Serpente Ancestral",
		slot: "waist",
		usableBy: ["rogue"],
		hp: 2,
		atk: 5,
		price: 1300
	},
	"cinto-de-batalha-remendado": {
		id: "cinto-de-batalha-remendado",
		name: "Cinto de Batalha Remendado",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		def: 1,
		price: 50
	},
	"cinto-de-malha-e-pano-rasgado": {
		id: "cinto-de-malha-e-pano-rasgado",
		name: "Cinto de Malha e Pano Rasgado",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		def: 1,
		dex: 1,
		price: 120
	},
	"cinto-de-pele-com-bussola": {
		id: "cinto-de-pele-com-bussola",
		name: "Cinto de Pele com Bússola",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		def: 3,
		price: 220
	},
	"cinto-de-malha-ensanguentado": {
		id: "cinto-de-malha-ensanguentado",
		name: "Cinto de Malha Ensanguentado",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		def: 3,
		dex: 1,
		price: 380
	},
	"cinto-da-lamina-carmesim": {
		id: "cinto-da-lamina-carmesim",
		name: "Cinto da Lâmina Carmesim",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		atk: 2,
		def: 3,
		price: 600
	},
	"cinto-do-leao-de-malha": {
		id: "cinto-do-leao-de-malha",
		name: "Cinto do Leão de Malha",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		atk: 2,
		dex: 3,
		price: 600
	},
	"cinto-do-leao-dourado-guerreiro": {
		id: "cinto-do-leao-dourado-guerreiro",
		name: "Cinto do Leão Dourado",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		def: 4,
		dex: 2,
		price: 900
	},
	"cinto-do-lobo-feroz": {
		id: "cinto-do-lobo-feroz",
		name: "Cinto do Lobo Feroz",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		atk: 2,
		def: 5,
		price: 1300
	},
	"cinto-do-leao-real-azul": {
		id: "cinto-do-leao-real-azul",
		name: "Cinto do Leão Real Azul",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		def: 5,
		dex: 3,
		price: 1800
	},
	"cinto-do-dragao-carmesim-guerreiro": {
		id: "cinto-do-dragao-carmesim-guerreiro",
		name: "Cinto do Dragão Carmesim",
		slot: "waist",
		usableBy: WARRIOR_TRIO,
		atk: 2,
		def: 7,
		price: 2400
	},
	"small-leather-pouch": {
		id: "small-leather-pouch",
		name: "Bolsa de Couro Pequena",
		slot: "waist",
		hp: 3,
		price: 800
	},
	"large-adventurers-pouch": {
		id: "large-adventurers-pouch",
		name: "Bolsa Grande de Aventureiro",
		slot: "waist",
		hp: 5,
		price: 2500
	},
	"plain-iron-ring": {
		id: "plain-iron-ring",
		name: "Anel de Ferro Simples",
		slot: "ring1",
		hp: 1,
		price: 50
	},
	"silver-signet-ring": {
		id: "silver-signet-ring",
		name: "Anel de Sinete de Prata",
		slot: "ring1",
		atk: 1,
		price: 50
	},
	"heavy-steel-ring": {
		id: "heavy-steel-ring",
		name: "Anel de Aço Pesado",
		slot: "ring1",
		def: 1,
		dex: 1,
		price: 120
	},
	"blackened-iron-ring": {
		id: "blackened-iron-ring",
		name: "Anel de Ferro Enegrecido",
		slot: "ring1",
		mag: 5,
		price: 600
	},
	"ancient-gold-ring": {
		id: "ancient-gold-ring",
		name: "Anel de Ouro Ancestral",
		slot: "ring1",
		atk: 3,
		mag: 2,
		def: 2,
		price: 1300
	},
	"black-metal-ring": {
		id: "black-metal-ring",
		name: "Anel de Metal Negro Ornamentado",
		slot: "ring1",
		atk: 3,
		def: 4,
		price: 1300
	},
	"anel-do-leao": {
		id: "anel-do-leao",
		name: "Anel do Leão",
		slot: "ring1",
		atk: 2,
		price: 120
	},
	"anel-do-rubi-sombrio": {
		id: "anel-do-rubi-sombrio",
		name: "Anel do Rubi Sombrio",
		slot: "ring1",
		mag: 2,
		dex: 2,
		price: 380
	},
	"anel-da-safira-azul": {
		id: "anel-da-safira-azul",
		name: "Anel da Safira Azul",
		slot: "ring1",
		dex: 2,
		price: 120
	},
	"anel-da-estrela-negra": {
		id: "anel-da-estrela-negra",
		name: "Anel da Estrela Negra",
		slot: "ring1",
		atk: 2,
		mag: 2,
		price: 380
	},
	"anel-do-rubi-elfico": {
		id: "anel-do-rubi-elfico",
		name: "Anel do Rubi Élfico",
		slot: "ring1",
		atk: 1,
		dex: 2,
		price: 220
	},
	"anel-do-leao-nobre": {
		id: "anel-do-leao-nobre",
		name: "Anel do Leão Nobre",
		slot: "ring1",
		def: 2,
		price: 120
	},
	"anel-da-lamina-azul": {
		id: "anel-da-lamina-azul",
		name: "Anel da Lâmina Azul",
		slot: "ring1",
		mag: 4,
		dex: 2,
		price: 900
	},
	"anel-das-raizes-negras": {
		id: "anel-das-raizes-negras",
		name: "Anel das Raízes Negras",
		slot: "ring1",
		mag: 2,
		def: 2,
		price: 380
	},
	"anel-da-caveira": {
		id: "anel-da-caveira",
		name: "Anel da Caveira",
		slot: "ring1",
		hp: 1,
		def: 2,
		price: 220
	},
	"anel-do-sol": {
		id: "anel-do-sol",
		name: "Anel do Sol",
		slot: "ring1",
		hp: 1,
		mag: 2,
		price: 220
	},
	"anel-da-esmeralda-gotica": {
		id: "anel-da-esmeralda-gotica",
		name: "Anel da Esmeralda Gótica",
		slot: "ring1",
		mag: 2,
		dex: 4,
		price: 900
	},
	"anel-da-serpente-rubra": {
		id: "anel-da-serpente-rubra",
		name: "Anel da Serpente Rubra",
		slot: "ring1",
		hp: 2,
		atk: 2,
		price: 380
	},
	"anel-da-hera-esmeralda": {
		id: "anel-da-hera-esmeralda",
		name: "Anel da Hera Esmeralda",
		slot: "ring1",
		def: 3,
		dex: 2,
		price: 600
	},
	"anel-do-dragao-carmesim": {
		id: "anel-do-dragao-carmesim",
		name: "Anel do Dragão Carmesim",
		slot: "ring1",
		atk: 4,
		dex: 2,
		price: 900
	},
	"anel-da-bussola-dourada": {
		id: "anel-da-bussola-dourada",
		name: "Anel da Bússola Dourada",
		slot: "ring1",
		mag: 1,
		def: 2,
		dex: 2,
		price: 600
	},
	"anel-da-caveira-negra": {
		id: "anel-da-caveira-negra",
		name: "Anel da Caveira Negra",
		slot: "ring1",
		atk: 2,
		mag: 4,
		price: 900
	}
};
/** Whether a class's main-hand weapon choice blocks the offHand slot — true when it's a
* two-handed weapon (lances and the like: both hands are already full). */
function offHandBlocked(mainHandWeaponId) {
	return !!(mainHandWeaponId ? WEAPONS[mainHandWeaponId] : null)?.twoHanded;
}
/** Ring 1 and ring 2 share one pool — every ring is authored as `ring1`, and both fingers
* accept that type. Other slots only match their own id. */
function equipmentFitsSlot(item, slot) {
	if (item.slot === slot) return true;
	if ((item.slot === "ring1" || item.slot === "ring2") && (slot === "ring1" || slot === "ring2")) return true;
	if (item.slot === "shoulders" && slot === "back") return true;
	return false;
}
function equipmentSlotName(slot) {
	return EQUIPMENT_SLOTS.find((s) => s.id === slot)?.label ?? slot;
}
/** Where this piece belongs on the doll — rings mention both fingers since either can wear them. */
function equipmentTypeSlotName(item) {
	if (item.slot === "ring1" || item.slot === "ring2") return "Anel (espaço 1 ou 2)";
	return equipmentSlotName(item.slot);
}
/** Short "+N STAT" summary line for a passive-stat EquipmentDef, classic-RPG-tooltip style. */
/** Every stat worn gear contributes, summed across the slots a unit has filled.
*
* EquipmentDef already carries hp/atk/mag/def/dex/mov, and every one of them is applied to
* combat (see spawnUnit and reapplyGear in engine.ts). */
function gearStatBonus(itemIds) {
	const total = {
		hp: 0,
		atk: 0,
		mag: 0,
		def: 0,
		dex: 0,
		mov: 0,
		resistances: {}
	};
	for (const id of itemIds) {
		if (!id) continue;
		const it = EQUIPMENT[id];
		if (!it) continue;
		total.hp += it.hp ?? 0;
		total.atk += it.atk ?? 0;
		total.mag += it.mag ?? 0;
		total.def += it.def ?? 0;
		total.dex += it.dex ?? 0;
		total.mov += it.mov ?? 0;
		total.resistances = sumResistances(total.resistances, it.resistances);
	}
	return total;
}
function equipmentStatSummary(it) {
	const parts = [];
	if (it.hp) parts.push(`${it.hp > 0 ? "+" : ""}${it.hp} HP`);
	if (it.atk) parts.push(`${it.atk > 0 ? "+" : ""}${it.atk} AT`);
	if (it.mag) parts.push(`${it.mag > 0 ? "+" : ""}${it.mag} MAG`);
	if (it.def) parts.push(`${it.def > 0 ? "+" : ""}${it.def} DF`);
	if (it.dex) parts.push(`${it.dex > 0 ? "+" : ""}${it.dex} DEX`);
	if (it.mov) parts.push(`${it.mov > 0 ? "+" : ""}${it.mov} Mov`);
	for (const element of RESISTANCE_ELEMENTS) {
		const value = it.resistances?.[element] ?? 0;
		if (value) parts.push(`${value > 0 ? "+" : ""}${value}% ${RESISTANCE_LABELS[element]} Resist`);
	}
	return parts.join(" · ");
}
/** Full hover card for a piece of gear — name, which slot, stats, who can wear it. */
function equipmentTooltip(it) {
	const lines = [it.name, `Espaço: ${equipmentTypeSlotName(it)}`];
	const stats = equipmentStatSummary(it);
	if (stats) lines.push(stats);
	if (it.kind === "shield") lines.push(`Investida de Escudo · ${Math.round((it.dmgMul ?? .75) * 100)}% dano · 70% atordoa`);
	if (it.kind === "weapon") lines.push(`${it.dice}D${it.faces}${it.bonus ? `+${it.bonus}` : ""} · Mão secundária`);
	const usableByPlayable = it.usableBy?.filter(isPlayableClassForDisplay) ?? [];
	if (usableByPlayable.length > 0) lines.push(`Usável: ${usableByPlayable.map((c) => CLASSES[c]?.name ?? c).join(", ")}`);
	if (it.price) lines.push(`${it.price} Gold`);
	if (isPouch(it.id)) {
		const bonus = POUCH_UPGRADE_BONUS[it.id] ?? 0;
		if (bonus > 0) lines.push(`+${bonus} espaços na Mochila da party (precisa estar equipada)`);
	}
	return lines.join("\n");
}
function weaponTooltip(w, enh = 0) {
	const lines = [
		`${w.name}${enh > 0 ? ` +${enh}` : ""}`,
		`${weaponDiceLabel(w.id)} · ${weaponRangeLabel(w.id)}`,
		"Espaço: Mão principal"
	];
	if (w.twoHanded) lines.push("Duas mãos");
	if (w.ranged) lines.push("À distância");
	const usableByPlayable = w.usableBy?.filter(isPlayableClassForDisplay) ?? [];
	if (usableByPlayable.length > 0) lines.push(`Usável: ${usableByPlayable.map((c) => CLASSES[c]?.name ?? c).join(", ")}`);
	if (w.bonusClass && isPlayableClassForDisplay(w.bonusClass)) lines.push(`+10% dano · ${CLASSES[w.bonusClass]?.name ?? w.bonusClass}`);
	if (w.price) lines.push(`${w.price} Gold`);
	return lines.join("\n");
}
function potionTooltip(kind) {
	const p = POTIONS[kind];
	const lines = [p.name];
	if (p.effect === "heal") lines.push(`Cura ${diceFormula(p.dice, p.faces, p.bonus)}`, "Gasta a ação do turno");
	else if (p.effect === "disease") lines.push("Cura doença e veneno", "Gasta a ação do turno");
	else if (p.effect === "mana") {
		const n = p.manaRestore ?? 0;
		lines.push(`Restaura ${n} uso${n === 1 ? "" : "s"} de cada magia disponível (sem passar do máximo)`, "Gasta a ação do turno");
	}
	lines.push(`Máximo ${POTION_CARRY_MAX[kind]} por personagem`);
	return lines.join("\n");
}
function equipmentIcon(id) {
	if (OFFHAND_DAGGER_IDS.has(id)) return `/game/icons/weapons/${id}.png`;
	return `/game/icons/equipment/${id}.png`;
}
const POUCH_UPGRADE_BONUS = {
	"small-leather-pouch": 5,
	"large-adventurers-pouch": 10,
	"equipment-satchel": 15
};
function isPouch(id) {
	return id === "small-leather-pouch" || !!id && id in POUCH_UPGRADE_BONUS;
}
const CURES = {
	cureMinor: {
		name: "Cura Menor",
		dice: 1,
		faces: 6,
		bonus: 0,
		mul: 1,
		range: 2
	},
	cureWounds: {
		name: "Cura Média",
		dice: 2,
		faces: 6,
		bonus: 0,
		mul: 1.6,
		range: 3
	},
	cureLight: {
		name: "Healing Hands",
		dice: 1,
		faces: 8,
		bonus: 0,
		mul: 1.2,
		range: 1
	}
};
function rollDice(dice, faces, bonus, rng) {
	let total = bonus;
	for (let i = 0; i < dice; i++) total += 1 + Math.floor(rng() * faces);
	return total;
}
function rollCure(kind, mag, rng) {
	const p = CURES[kind];
	return Math.floor(Math.floor(mag / 2) * p.mul + rollDice(p.dice, p.faces, p.bonus, rng));
}
function diceFormula(dice, faces, bonus) {
	if (dice <= 0) return "";
	const core = `${dice}D${faces}`;
	return bonus ? `${core}+${bonus}` : core;
}
function rollPotion(kind, rng) {
	const p = POTIONS[kind];
	return rollDice(p.dice, p.faces, p.bonus, rng);
}
function potionLabel(kind) {
	const p = POTIONS[kind];
	const formula = diceFormula(p.dice, p.faces, p.bonus);
	return formula ? `${p.name} ${formula}` : p.name;
}
/** Written the way rollCure computes it, so the tooltip and the number that lands agree —
* same convention as spellFormula for the damage spells. */
function healFormula(mag, kind) {
	const p = CURES[kind];
	return spellFormula(mag, p.mul, p.dice, p.faces, p.bonus);
}
/** Spell multipliers weight the caster's own power (see spellDamage in engine.ts). All are
* above 1, so a cast always beats the plain hit the same unit could have made, and because
* they scale the stat rather than sitting beside it the spells keep their order apart as
* MAG climbs instead of all converging on it. The dice are small on purpose: they are there
* so damage varies between casts, not to carry the spell. */
const FIREBALL = {
	name: "Bola De Fogo",
	size: 2,
	range: 5,
	dice: 2,
	faces: 6,
	bonus: 0,
	mul: 1.35
};
/** Salazar's Tier 4 Divine Bolt: focused holy lightning with a compact radius-1 splash.
* Its center and splash remain below Caustic Venom's corresponding Tier 4 damage. */
const DIVINE_BOLT = {
	name: "Divine Bolt",
	size: 1,
	range: 6,
	centerDice: 2,
	centerFaces: 4,
	centerBonus: 0,
	centerMul: 1.4,
	splashDice: 1,
	splashFaces: 4,
	splashBonus: 0,
	splashMul: 1
};
const CAUSTIC_VENOM = {
	name: "Veneno Cáustico",
	size: 3,
	range: 7,
	centerDice: 1,
	centerFaces: 10,
	centerBonus: 0,
	centerMul: 1.5,
	splashDice: 1,
	splashFaces: 6,
	splashMul: 1.1,
	splashBonus: 0
};
/** Mage Tier 4 sustained area spell. It damages every unit at the start of that unit's turn
* while they occupy the ice field; the field's footprint, reach, duration, and per-tick
* power grow at four-level intervals. Area is three cells at level 8 and seven from level 12. */
const ICE_STORM = {
	name: "Ice Storm",
	unlockLevel: 8,
	range: 5,
	size: 1,
	durationRounds: 2,
	dice: 1,
	faces: 6,
	mul: .65
};
function iceStormPower(level) {
	const step = Math.max(0, Math.min(5, Math.floor((level - ICE_STORM.unlockLevel) / 4)));
	return {
		range: ICE_STORM.range + step,
		size: ICE_STORM.size,
		areaHexes: level < 12 ? 3 : 7,
		durationRounds: ICE_STORM.durationRounds + step,
		dice: [
			1,
			1,
			2,
			2,
			3,
			3
		][step],
		faces: [
			6,
			8,
			6,
			8,
			6,
			8
		][step],
		mul: ICE_STORM.mul + step * .05
	};
}
/** Three adjoining cells at levels 8–11; the seven-cell ring from level 12 onward.
* Both targeting and damage use this exact footprint, clipped at board edges. */
function iceStormAreaTiles(origin, level, cols, rows) {
	const ring = hexAreaTiles(origin, 1, cols, rows);
	if (iceStormPower(level).areaHexes === 7) return ring;
	const neighbors = ring.filter((cell) => cell.x !== origin.x || cell.y !== origin.y);
	for (const first of neighbors) {
		const adjoining = hexAreaTiles(first, 1, cols, rows);
		const second = neighbors.find((cell) => cell !== first && adjoining.some((other) => other.x === cell.x && other.y === cell.y));
		if (second) return [
			{ ...origin },
			first,
			second
		];
	}
	return ring.slice(0, 3);
}
function iceStormFormula(level, mag) {
	const power = iceStormPower(level);
	return spellFormula(mag, power.mul, power.dice, power.faces, 0);
}
/** Veneno Menor — the mobs' venom (Undead Ox, Zombie Dog; the Birolhos keep the full Veneno
* Cáustico): same range, dice and poison as Caustic Venom on a radius-2 splash, drawn with the
* original effect (green bolt, burst and acid patch) instead of the 3D V2 smoke. */
const MINOR_VENOM = {
	...CAUSTIC_VENOM,
	name: "Veneno Menor",
	size: 2
};
const LONG_SHOT = {
	name: "Tiro Longo",
	range: 7
};
/** Warrior Tier 1, learned at level 3: no damage — piles volatile enmity (enmity.ts) onto
* every enemy it reaches, so they turn on the warrior until someone out-generates him. */
const PROVOKE = {
	name: "Provoke",
	unlockLevel: 3
};
/** Provoke grows from one target into wider and wider areas, reaching further each step. */
function provokePower(level) {
	if (level >= 15) return {
		range: 8,
		radius: 4
	};
	if (level >= 12) return {
		range: 7,
		radius: 3
	};
	if (level >= 9) return {
		range: 6,
		radius: 2
	};
	if (level >= 6) return {
		range: 5,
		radius: 1
	};
	return {
		range: 4,
		radius: 0
	};
}
function provokeFormula(level) {
	const p = provokePower(level);
	return p.radius === 0 ? `um inimigo, alcance ${p.range}` : `inimigos em raio ${p.radius}, alcance ${p.range}`;
}
const BLOODY_SHOT = {
	name: "Bloody Shot",
	unlockLevel: 5,
	range: 6
};
/** Bloody Shot's direct hit follows the existing Tier 2 weapon-skill progression. */
function bloodyShotMul(level) {
	if (level >= 13) return 2.5;
	if (level >= 10) return 2.25;
	if (level >= 6) return 2;
	return 1.5;
}
/** Bleed duration breakpoints: 1D6 at unlock, then 1D8, 2D4, and 2D6. */
function bloodyShotBleed(level) {
	if (level >= 15) return {
		dice: 2,
		faces: 6
	};
	if (level >= 12) return {
		dice: 2,
		faces: 4
	};
	if (level >= 8) return {
		dice: 1,
		faces: 8
	};
	return {
		dice: 1,
		faces: 6
	};
}
/** Long Shot's bonus die, always added on top of plain weapon damage (never in place of
* it) — grows in explicit level breakpoints, same shape as Lightning/Fireball, rather than a
* smooth per-level formula. */
function longShotPower(level) {
	if (level >= 14) return {
		dice: 2,
		faces: 12
	};
	if (level >= 12) return {
		dice: 2,
		faces: 10
	};
	if (level >= 9) return {
		dice: 2,
		faces: 8
	};
	if (level >= 7) return {
		dice: 2,
		faces: 6
	};
	if (level >= 5) return {
		dice: 1,
		faces: 12
	};
	if (level >= 3) return {
		dice: 1,
		faces: 10
	};
	if (level >= 2) return {
		dice: 2,
		faces: 4
	};
	return {
		dice: 1,
		faces: 8
	};
}
function longShotFormula(level) {
	const p = longShotPower(level);
	return `arma + ${diceFormula(p.dice, p.faces, 0)}`;
}
const PIERCING = { name: "Tiro Perfurante" };
/** Tiro Perfurante's weapon-damage multiplier — explicit level breakpoints, same shape as
* every other level-gated skill here rather than a smooth per-level formula. */
function piercingMul(level) {
	if (level >= 13) return 2.5;
	if (level >= 10) return 2.25;
	if (level >= 6) return 2;
	return 1.5;
}
/** Lancer tier 1: a short-reach line thrust (weapon range + 1 hex) that ignores a slice of
* the target's armor and hits everyone caught in the line — 1st target full damage, every
* one behind it half. */
const PIERCING_THRUST = {
	name: "Investida Perfurante",
	armorIgnore: .2
};
/** Lancer tier 2: a self-centered AoE that hits every enemy within `radius` hexes for
* plain weapon damage and shoves each one back a hex to reopen reach. Aimed by previewing
* the area, then confirming — not an instant adjacent-only swing. */
const SWEEP = {
	name: "Varredura",
	knockback: 1,
	radius: 2
};
/** Lancer tier 3: a single-target hook-the-legs strike — weapon damage + 1D8, stuns for 2 of
* the target's own turns, and knocks 10% off every stat for the rest of the battle (not
* cured by anything, unlike Doente). */
const TRIP = {
	name: "Rasteira",
	bonusFaces: 8,
	bonusBonus: 0,
	stunRounds: 2,
	statPenalty: .1
};
const DOUBLE_STRIKE = { name: "Corte Duplo" };
/** Corte Duplo's bonus die — rolled fresh on EACH of its two hits (it does not stack: the
* tiers replace each other, never add up, and landing both hits doesn't double a single
* roll — each hit gets its own independent roll of whatever the current tier is). No bonus
* at all until level 2. */
function doubleStrikePower(level) {
	if (level >= 14) return {
		dice: 2,
		faces: 8
	};
	if (level >= 13) return {
		dice: 2,
		faces: 6
	};
	if (level >= 11) return {
		dice: 1,
		faces: 12
	};
	if (level >= 9) return {
		dice: 1,
		faces: 10
	};
	if (level >= 7) return {
		dice: 2,
		faces: 4
	};
	if (level >= 5) return {
		dice: 1,
		faces: 8
	};
	if (level >= 3) return {
		dice: 1,
		faces: 6
	};
	if (level >= 2) return {
		dice: 1,
		faces: 4
	};
	return {
		dice: 0,
		faces: 0
	};
}
function doubleStrikeFormula(level) {
	const p = doubleStrikePower(level);
	return p.dice > 0 ? `2× (arma + ${diceFormula(p.dice, p.faces, 0)})` : "2× dano de arma";
}
const CLEAVE = {
	name: "Cleave",
	hexes: 3,
	/** Footprint size (hexes occupied) at which Cleave deals `largeMul` damage.
	* Tipo 3 (cão de guerra) and every bigger brute (troll, horror, Asherah, …). */
	largeHexes: 3,
	largeMul: 2
};
/** How many hexes a unit actually occupies — Cleave's "large creature" check. */
function occupiedHexCount(unit) {
	if (unit.footprintOffsets && unit.footprintOffsets.length > 0) return unit.footprintOffsets.length;
	return Math.max(1, unit.size ?? 1);
}
function cleaveDoublesVs(unit) {
	return occupiedHexCount(unit) >= CLEAVE.largeHexes;
}
/** Cleave's bonus die, always added on top of plain weapon damage — explicit level
* breakpoints, same shape as Long Shot/Lightning/Fireball. */
function cleavePower(level) {
	if (level >= 14) return {
		dice: 2,
		faces: 8
	};
	if (level >= 11) return {
		dice: 2,
		faces: 6
	};
	if (level >= 9) return {
		dice: 2,
		faces: 4
	};
	return {
		dice: 1,
		faces: 8
	};
}
function cleaveFormula(level) {
	const p = cleavePower(level);
	return `arma + ${diceFormula(p.dice, p.faces, 0)}`;
}
/** Warrior tier 1's alternative to Corte Duplo, unlocked at level 3 — shares the same tier-1 charge pool (see
* SPELL_TIER). A straight-line charge: stops adjacent to the first enemy reached along an
* unobstructed hex axis, hits it for weapon + bonus dice with no counter, then knocks it
* straight away. If the knockback is blocked (wall/edge/column/barricade/locked door/
* decoration/unit), it stops immediately and the wall-impact dice are folded into the same
* damage roll (see castBullRush in engine.ts) rather than landing as a second hit. */
const BULL_RUSH = { name: "Investida Touro" };
function bullRushPower(level) {
	if (level >= 27) return {
		chargeRange: 4,
		dice: 2,
		faces: 12,
		knockback: 3,
		wallDice: 2,
		wallFaces: 10
	};
	if (level >= 23) return {
		chargeRange: 4,
		dice: 2,
		faces: 10,
		knockback: 2,
		wallDice: 2,
		wallFaces: 8
	};
	if (level >= 19) return {
		chargeRange: 4,
		dice: 2,
		faces: 8,
		knockback: 2,
		wallDice: 2,
		wallFaces: 8
	};
	if (level >= 16) return {
		chargeRange: 4,
		dice: 2,
		faces: 6,
		knockback: 2,
		wallDice: 2,
		wallFaces: 6
	};
	if (level >= 13) return {
		chargeRange: 3,
		dice: 2,
		faces: 6,
		knockback: 2,
		wallDice: 2,
		wallFaces: 6
	};
	if (level >= 10) return {
		chargeRange: 3,
		dice: 1,
		faces: 10,
		knockback: 1,
		wallDice: 1,
		wallFaces: 8
	};
	if (level >= 7) return {
		chargeRange: 3,
		dice: 1,
		faces: 8,
		knockback: 1,
		wallDice: 1,
		wallFaces: 8
	};
	if (level >= 4) return {
		chargeRange: 3,
		dice: 1,
		faces: 6,
		knockback: 1,
		wallDice: 1,
		wallFaces: 6
	};
	return {
		chargeRange: 2,
		dice: 1,
		faces: 4,
		knockback: 1,
		wallDice: 1,
		wallFaces: 4
	};
}
function bullRushFormula(level) {
	const p = bullRushPower(level);
	return `arma + ${diceFormula(p.dice, p.faces, 0)}`;
}
/** Warrior tier 3: an adjacent strike whose execution multiplier REPLACES a normal critical
* hit rather than stacking with it (see castExecutionerStrike/stepCombat's "hit" branch,
* which rebuilds off rollDamage's preCritDmg whenever the execution threshold is met) — a
* late-game crit + execution stacking would otherwise be far too swingy. */
const EXECUTIONER_STRIKE = { name: "Golpe do Carrasco" };
function executionerStrikePower(level) {
	if (level >= 28) return {
		dice: 3,
		faces: 10,
		threshold: .4,
		mult: 2.25
	};
	if (level >= 25) return {
		dice: 2,
		faces: 12,
		threshold: .4,
		mult: 2
	};
	if (level >= 21) return {
		dice: 2,
		faces: 10,
		threshold: .35,
		mult: 2
	};
	if (level >= 17) return {
		dice: 2,
		faces: 8,
		threshold: .35,
		mult: 1.75
	};
	if (level >= 14) return {
		dice: 2,
		faces: 6,
		threshold: .3,
		mult: 1.75
	};
	if (level >= 11) return {
		dice: 1,
		faces: 10,
		threshold: .3,
		mult: 1.5
	};
	return {
		dice: 1,
		faces: 8,
		threshold: .3,
		mult: 1.5
	};
}
function executionerStrikeFormula(level) {
	const p = executionerStrikePower(level);
	return `arma + ${diceFormula(p.dice, p.faces, 0)}, execução ×${p.mult} se o alvo estiver a ≤${Math.round(p.threshold * 100)}% de vida`;
}
/** Warrior tier 2's shield-only option (shares Cleave's tier-2 pool) — refuses to arm
* without a shield in the off hand (see startShieldBash, the mirror of startShoulderSmash's
* own "no shield" gate). Plain weapon + bonus dice, then stuns — no stat penalty, unlike
* Rasteira. */
const SHIELD_BASH = { name: "Golpe de Escudo" };
function shieldBashPower(level) {
	if (level >= 27) return {
		dice: 2,
		faces: 12,
		stunTurns: 3
	};
	if (level >= 23) return {
		dice: 2,
		faces: 10,
		stunTurns: 3
	};
	if (level >= 19) return {
		dice: 2,
		faces: 8,
		stunTurns: 2
	};
	if (level >= 16) return {
		dice: 2,
		faces: 6,
		stunTurns: 2
	};
	if (level >= 13) return {
		dice: 1,
		faces: 10,
		stunTurns: 2
	};
	if (level >= 10) return {
		dice: 1,
		faces: 8,
		stunTurns: 1
	};
	if (level >= 7) return {
		dice: 1,
		faces: 6,
		stunTurns: 1
	};
	return {
		dice: 1,
		faces: 4,
		stunTurns: 1
	};
}
function shieldBashFormula(level) {
	const p = shieldBashPower(level);
	return `arma + ${diceFormula(p.dice, p.faces, 0)}, atordoa por ${p.stunTurns} turno${p.stunTurns > 1 ? "s" : ""}`;
}
/** Archer tier 3: fires at several targets in one shot, each rolling weapon damage plus its
* own bonus die. Two targets from the tier's unlock at level 7, a third at level 11; the
* bonus die itself starts at level 8 and upgrades once at level 13 (replaces, doesn't stack —
* same convention as every other bonus die in this file). */
const MULTI_SHOT = {
	name: "Tiro Múltiplo",
	range: 6
};
function multiShotTargets(level) {
	return level >= 11 ? 3 : 2;
}
function multiShotPower(level) {
	if (level >= 13) return {
		dice: 2,
		faces: 4
	};
	if (level >= 8) return {
		dice: 1,
		faces: 4
	};
	return {
		dice: 0,
		faces: 0
	};
}
function multiShotFormula(level) {
	const p = multiShotPower(level);
	return p.dice > 0 ? `arma + ${diceFormula(p.dice, p.faces, 0)} por alvo` : "arma por alvo";
}
/** Paladin tier 3: a passive, not a hotbar cast — checked once at the start of the paladin's
* own turn (see startOfTurnEffects). The first time they're at or below this HP fraction with
* a tier-3 use still banked, it auto-heals them for a % of DEX and spends the use — the same
* tier-use accounting every other spell goes through, just spent automatically instead of by
* the player picking a target. */
const SECOND_WIND = {
	name: "Fôlego Renovado",
	badlyWoundedPct: .3
};
function secondWindPct(level) {
	if (level >= 13) return .75;
	if (level >= 10) return .5;
	return .25;
}
/** Paladin tier 5 / Heavy Knight tier 5: an instant, self-centered zone (cast like Sweep —
* no aim) lasting `duration` rounds. Aura of Protection cuts damage allies inside it take by
* `pct`; Intimidating Presence (same table, opposite side filter — "scales in the same way")
* raises damage enemies inside it take by `pct` instead. Levels below the spec's own floor
* (18) just get the floor row; there's nothing weaker to fall back to. */
function auraPower(level) {
	if (level >= 30) return {
		radius: 3,
		pct: .35,
		duration: 4
	};
	if (level >= 28) return {
		radius: 3,
		pct: .3,
		duration: 4
	};
	if (level >= 26) return {
		radius: 3,
		pct: .25,
		duration: 4
	};
	if (level >= 24) return {
		radius: 2,
		pct: .25,
		duration: 4
	};
	if (level >= 22) return {
		radius: 2,
		pct: .25,
		duration: 3
	};
	if (level >= 20) return {
		radius: 2,
		pct: .2,
		duration: 3
	};
	return {
		radius: 1,
		pct: .2,
		duration: 3
	};
}
const AURA_OF_PROTECTION = { name: "Aura de Proteção" };
const INTIMIDATING_PRESENCE = { name: "Presença Intimidante" };
/** Paladin tier 6: a holy line — aimed the same way as Piercing (click through a cell to set
* the direction), capped to `range` — that only ever hits `foe.side !== caster.side`, the one
* AoE in the game that can never clip an ally. Its bonus is a flat half-MAG term (unlike
* Cleave/Long Shot's pure dice bonus) added on top of a plain weapon hit — "weird +MAG bonus
* plus weapon DMG" per spec — layered on the same weaponBonusDice/Faces/Bonus mechanism, no
* new field needed. */
const DIVINE_WRATH = {
	name: "Ira Divina",
	range: 4
};
function divineWrathPower(level) {
	if (level >= 30) return {
		dice: 3,
		faces: 10
	};
	if (level >= 26) return {
		dice: 3,
		faces: 8
	};
	if (level >= 22) return {
		dice: 2,
		faces: 10
	};
	if (level >= 19) return {
		dice: 2,
		faces: 8
	};
	return {
		dice: 1,
		faces: 10
	};
}
function divineWrathFormula(level, mag) {
	const p = divineWrathPower(level);
	return `arma + ${Math.floor(mag / 2)} + ${diceFormula(p.dice, p.faces, 0)}`;
}
/** Heavy Knight tier 4: only usable bare-handed/two-handed — no shield in the off hand (see
* offHandBlocked's sibling check at the cast site). Aimed like Cleave (click a neighbor to
* pick the starting direction of the arc), hitting `hexes` hexes of that arc — 1 growing to 4
* — each for weapon damage + a bonus die, and shoving every hit target back a fixed 2 hexes
* (knockBack run twice per target). */
const SHOULDER_SMASH = {
	name: "Investida de Ombro",
	knockback: 2
};
function shoulderSmashPower(level) {
	if (level >= 28) return {
		dice: 2,
		faces: 12,
		hexes: 4
	};
	if (level >= 24) return {
		dice: 2,
		faces: 10,
		hexes: 3
	};
	if (level >= 20) return {
		dice: 2,
		faces: 8,
		hexes: 2
	};
	if (level >= 16) return {
		dice: 1,
		faces: 10,
		hexes: 2
	};
	return {
		dice: 1,
		faces: 8,
		hexes: 1
	};
}
function shoulderSmashFormula(level) {
	const p = shoulderSmashPower(level);
	return `arma + ${diceFormula(p.dice, p.faces, 0)}`;
}
/** Heavy Knight tier 6: same aimed line as Divine Wrath ("similar to Divine Wrath" per spec),
* capped to `range` — but never filtered by side, so it runs through allies caught in the
* line too ("causes ally dmg", the one thing that tells it apart from Divine Wrath). Pure
* weapon + dice, no MAG term — Heavy Knight's MAG stat is 0. */
const STAMPEDE = {
	name: "Debandada",
	range: 4
};
function stampedePower(level) {
	if (level >= 30) return {
		dice: 3,
		faces: 10
	};
	if (level >= 27) return {
		dice: 3,
		faces: 8
	};
	if (level >= 24) return {
		dice: 2,
		faces: 10
	};
	if (level >= 21) return {
		dice: 2,
		faces: 8
	};
	return {
		dice: 1,
		faces: 10
	};
}
function stampedeFormula(level) {
	const p = stampedePower(level);
	return `arma + ${diceFormula(p.dice, p.faces, 0)}`;
}
const MAGIC_MISSILE = {
	name: "Míssil Mágico",
	range: 5,
	dice: 1,
	faces: 4,
	bonus: 0,
	mul: 1.15
};
/** Missiles the caster gets, each aimed on its own: one to start, a second at level 3, a
* third at level 6. They may all go into the same enemy or be split between several. */
function magicMissileCount(level) {
	if (level >= 6) return 3;
	if (level >= 3) return 2;
	return 1;
}
/** Enemy mages (currently just the cultist/"Feiticeiro") — how many casts of Magic Missile
* and Lightning they're spawned with per battle, spent one at a time by runAiFor's cultist
* branch (unlike a player caster, each cast is a single missile at a single target, never the
* player's own click-N-targets spread). Level 1-3: one Magic Missile cast; level 4-6: two;
* level 7+: three. Lightning joins on top at level 10, one cast. Choque is tracked separately
* on Unit.shockCharges (see shockChargesFor) so it doesn't steal a player-facing tier. */
function cultistSpellUses(level) {
	return {
		magicMissile: level >= 7 ? 3 : level >= 4 ? 2 : 1,
		lightning: level >= 10 ? 1 : 0
	};
}
/** Enemy archers (currently just the brigand/"Besteiro") — how many casts of Long Shot and
* Piercing they're spawned with per battle, spent one at a time by runAiFor's brigand branch.
* Same shape as cultistSpellUses: level 1-3 one Long Shot cast, level 4-6 two, level 7+ three;
* Piercing joins on top at level 10, one cast. */
function brigandSpellUses(level) {
	return {
		longShot: level >= 7 ? 3 : level >= 4 ? 2 : 1,
		piercing: level >= 10 ? 1 : 0
	};
}
/** Birolho — the one enemy that opens with both a bolt AND an AoE: 1 Caustic Venom, 3 Magic
* Missile at spawn; level 5 bumps to 2 Venom, 4 Magic Missile; Lightning joins at level 10,
* one cast. Per-spell counts, not a tier ladder like cultist/brigand's, since Venom sits on
* tier4 while Magic Missile/Lightning share tier1/tier2 — see runAiFor's birolho branch. */
function birolhoSpellUses(level) {
	return {
		magicMissile: level >= 5 ? 4 : 3,
		causticVenom: level >= 5 ? 2 : 1,
		lightning: level >= 10 ? 1 : 0
	};
}
/** Conjurer tier 1: summons a controllable ally at half the conjurer's current stats
* (recomputed from the conjurer at cast time, so a later-battle or higher-level cast comes
* in stronger) anywhere within range, passable and unoccupied. Stays until the battle ends —
* no duration to track, no re-cast limit beyond the tier's own uses per scenario. */
const SUMMON_FAMILIAR = {
	name: "Invocar Familiar",
	range: 4,
	statScale: .5
};
/** Conjurer tier 1's second spell (shares tier 1's pool of uses with Invocar Familiar, same
* "more than one spell at the same tier" deal as summonFamiliar2/webOfDreams at tier 2 — see
* FAMILIAR_SPELL's doc above and tierRemaining/spendTier in engine.ts) — a long-range single
* hit from a summoned spirit that strikes once and vanishes, never a lingering ally like the
* familiar summons. Unlocked at PHANTASMAL_FORCE_UNLOCK_LEVEL rather than from level 1 like
* Invocar Familiar, even though they share a tier — tierUses alone can't express a
* per-spell gate within a shared tier, so startPhantasmalForce checks the caster's level
* directly (see engine.ts). */
const PHANTASMAL_FORCE = {
	name: "Força Fantasmal",
	range: 6
};
/** Monster-only Phantom System: legacy 2D arcane bolt with its own charge pool and damage
* settings, independent of the Conjurer's Phantasmal Force. */
const FANTOM_FORCE = {
	name: "Phantom System",
	range: 6,
	usesPerBattle: 2,
	damageMul: .82
};
function fantomForceChargesFor(classId) {
	return classId === "cultist" || classId === "cultistV2" || classId === "emberedWraith" || classId === "swampBlueCalf" ? FANTOM_FORCE.usesPerBattle : 0;
}
/** Monster spell's own dice progression; changing Phantasmal Force does not change it. */
function fantomForceDice(level) {
	return {
		dice: 1,
		faces: 4 + Math.floor((Math.max(1, level) - 1) / 2) * 2
	};
}
/** Phantasmal Force's damage dice — no flat power multiplier (spellDamage's mul stays at 1,
* same reasoning as Dreno de Vida's own lifeDrainDice above), just MAG plus a die that
* climbs one weapon-style size every 2 levels (1D4 at 1-2, 1D6 at 3-4, 1D8 at 5-6, ...) — 1D4
* at unlock (level 2), since the level gate and the dice curve are two independent things
* that just happen to share this spell; don't re-derive one from the other. */
function phantasmalForceDice(level) {
	return {
		dice: 1,
		faces: 4 + Math.floor((Math.max(1, level) - 1) / 2) * 2
	};
}
function phantasmalForceFormula(level, mag) {
	const p = phantasmalForceDice(level);
	return spellFormula(mag, 1, p.dice, p.faces, 0);
}
/** Conjurer tier 2: a second, stronger summon — its own spell/slot/tier-2 charge, not an
* upgrade of Invocar Familiar. The first case of a class having more than one spell choice
* at the same tier, sharing that tier's pool of uses (see castSummonFamiliar's `evolved`
* parameter and SPELL_TIER.summonFamiliar2). */
const SUMMON_FAMILIAR2 = {
	name: "Invocar Familiar Maior",
	range: 4,
	statScale: .75
};
/** Conjurer tier 4 (moved up from tier 3 when Familiar Radiante took tier 3): "the Big Guy" — same summon shape as tiers 1-2, its own spell/slot, but
* at 100% of the conjurer's current attributes (not a fraction) and its own Fireball once
* summoned — see familiarSpellCharges. */
const SUMMON_FAMILIAR3 = {
	name: "Invocar Familiar Titã",
	range: 5,
	statScale: 1
};
/** Conjurer tier 3: Familiar Radiante — Familiar Maior's range, 75% stat share and kit
* (Magic Missile + Dreno de Vida) on its own one-hex body. */
const SUMMON_FAMILIAR4 = {
	name: "Invocar Familiar Radiante",
	range: 4,
	statScale: .75
};
/** Conjurer tier 5 (for testing — meant to become a Necromancer tier 6 spell): summons a
* Zombie Dog (Type 2 body) with 100% of the caster's current stats, same one-at-a-time rule
* and range as the familiars. The dog casts Veneno Cáustico twice per battle. */
const SUMMON_ZOMBIE_DOG = {
	name: "Invocar Cão Zumbi",
	range: 4,
	statScale: 1,
	causticVenomCharges: 2
};
/** Which of the conjurer's familiar tiers gets a spell of its own, and which one —
* Familiar and Familiar Maior (tiers 1-2) both get Magic Missile, Familiar Titã (tier 3) gets
* Bola de Fogo instead. Familiar Radiante (tier 4) gets three Shock charges per summon.
* Classes absent here have no familiar spell of their own (see familiarSpellRemaining in
* engine.ts). Familiar Maior and Familiar Radiante also have a SECOND
* own spell on top of this, Dreno de Vida (see LIFE_DRAIN/familiarLifeDrainCharges below) —
* it isn't listed here because it runs through its own dedicated Unit.lifeDrainCharges field
* and castLifeDrain, not the generic spellCharges machinery this table drives. */
const FAMILIAR_SPELL = {
	familiar: "magicMissile",
	familiar2: "magicMissile",
	familiar3: "fireball",
	familiar4: "shock",
	zombieDog: "minorVenom"
};
/** Familiar Titã's own Fireball charges for the battle — set once at summon time from the
* conjurer's level (the familiar's own `level` is copied from its summoner in
* castSummonFamiliar, so passing either one in works out the same). Once per combat at
* unlock, then +1 at each of these levels — validated by hand like every other level×count
* breakpoint table in this file, not a formula. */
function familiarSpellCharges(level) {
	if (level >= 28) return 4;
	if (level >= 21) return 3;
	if (level >= 16) return 2;
	return 1;
}
/** Familiar and Familiar Maior's own Magic Missile charges for the battle — same idea as
* familiarSpellCharges above (set once at summon time from the conjurer's level), but its own
* curve: it starts a level earlier and climbs on a tighter breakpoint schedule, topping out
* one charge higher, so the weaker two familiar tiers still feel like they're gaining
* something across a full playthrough even without Familiar Titã's raw power. */
function familiarMagicMissileCharges(level) {
	if (level >= 20) return 5;
	if (level >= 16) return 4;
	if (level >= 11) return 3;
	if (level >= 5) return 2;
	return 1;
}
/** Familiar Maior's own second spell, Dreno de Vida — a magical melee touch (MAG vs DEX,
* same as every other caster's attack — see powerOf/protOf in combat.ts) that also heals its
* summoning conjurer for a share of the damage it deals (see the lifeDrain branch in
* BattleEngine.stepSpell). Melee range, matching the familiar's own minRange/maxRange. */
const LIFE_DRAIN = {
	name: "Dreno de Vida",
	range: 1
};
/** Dreno de Vida's own damage dice — no flat power multiplier (spellDamage's mul stays at
* 1, unlike Fireball/Lightning's own), just MAG plus a die that climbs one weapon-style size
* every 3 levels (1D4 at 1-3, 1D6 at 4-6, 1D8 at 7-9, ...), the same shape a real weapon
* upgrade path uses rather than a hand-picked breakpoint table. */
function lifeDrainDice(level) {
	return {
		dice: 1,
		faces: 4 + Math.floor((Math.max(1, level) - 1) / 3) * 2
	};
}
function lifeDrainFormula(level, mag) {
	const p = lifeDrainDice(level);
	return spellFormula(mag, 1, p.dice, p.faces, 0);
}
/** Familiar Maior's own Dreno de Vida charges for the battle — set once at summon time
* from the conjurer's level, same idea as familiarSpellCharges/familiarMagicMissileCharges
* (its own hand-validated breakpoint table, not a formula), but its own schedule since it's a
* second, independent spell/charge pool on top of that tier's Magic Missile. */
function familiarLifeDrainCharges(level) {
	if (level >= 30) return 5;
	if (level >= 23) return 4;
	if (level >= 17) return 3;
	if (level >= 10) return 2;
	return 1;
}
/** What fraction of Dreno de Vida's dealt damage heals the familiar's summoning conjurer —
* climbs in lockstep with familiarLifeDrainCharges' own breakpoints (same level thresholds),
* hand-validated the same way. */
function lifeDrainHealMul(level) {
	if (level >= 30) return 1;
	if (level >= 23) return .75;
	if (level >= 17) return .6;
	if (level >= 10) return .4;
	return .25;
}
/** Conjurer tier 2: drops a sticky patch of webbing centered on the target cell. Every unit
* (either side) standing in it at cast time rolls sleepChance to fall asleep for 1D4 of its
* own turns (early wake + sleepBonusDamage on the hit that wakes it). While the zone lasts,
* anyone whose current cell is inside it — caught at cast time or wandered in after — has
* their movement clamped to 1 hex for the turn (see BattleEngine.effectiveUnitForReach): the
* "difficult terrain / restrained" part of the spell, folded into one mechanic. */
const WEB_OF_DREAMS = {
	name: "Teia dos Sonhos",
	range: 7,
	size: 1,
	durationRounds: 3,
	sleepChance: .25,
	sleepDice: 1,
	sleepFaces: 4,
	sleepBonusDamage: .25
};
/** Web of Dreams' splash radius grows at later levels: 1 hex at unlock, +1 at 7, +1 at 12. */
function webOfDreamsSize(level) {
	if (level >= 12) return WEB_OF_DREAMS.size + 2;
	if (level >= 7) return WEB_OF_DREAMS.size + 1;
	return WEB_OF_DREAMS.size;
}
/** Web of Dreams' sleep chance scales with the caster's level instead of staying flat at the
* base WEB_OF_DREAMS.sleepChance (25%) forever: linear from that base at level 3 (when
* Conjurer first unlocks the tier-2 spell — see FULL_TABLE/tierUses) up to 85% at level 30.
* Baked into the zone at cast time (see castWebOfDreams), not re-read live, so a zone always
* rolls at the level that actually created it. */
function webOfDreamsSleepChance(level) {
	const unlockLevel = 3;
	const maxChance = .85;
	const t = Math.max(0, Math.min(1, (level - unlockLevel) / 27));
	return WEB_OF_DREAMS.sleepChance + (maxChance - WEB_OF_DREAMS.sleepChance) * t;
}
const LIGHTNING = {
	name: "Relâmpago",
	range: 5,
	dice: 2,
	faces: 8,
	bonus: 0,
	mul: 2,
	echoDice: 1,
	echoFaces: 12,
	echoBonus: 2
};
/** Elementalist T5 thunderbolt — Relâmpago3. Bigger than Relâmpago on every lever. */
const LIGHTNING_T3 = {
	name: "Relâmpago3",
	range: 7,
	dice: 3,
	faces: 12,
	bonus: 8,
	mul: 3,
	echoDice: 2,
	echoFaces: 12,
	echoBonus: 8
};
/** Enemy-only weaker Relâmpago: about 1/3 the damage stats, same range, same echo shape.
* Current bolt FX is this spell; Relâmpago itself now uses a heavier sky-strike. */
const SHOCK = {
	name: "Choque",
	range: 5,
	dice: 1,
	faces: 6,
	bonus: 0,
	mul: .67,
	echoDice: 1,
	echoFaces: 4,
	echoBonus: 0
};
const ENEMY_MAGE_IDS = /* @__PURE__ */ new Set([
	"minorHorror",
	"cultist",
	"cultistV2",
	"mage",
	"elementalist",
	"warlock",
	"sorcerer",
	"necromancer",
	"birolho",
	"birolho2",
	"birolho3",
	"birolhoLegs",
	"birolhoLegs2"
]);
function isEnemyMageClass(id) {
	return ENEMY_MAGE_IDS.has(id);
}
/** Choque charges spawned on an enemy mage. Birolho (and Birolho2) get 3; every other mage
* gets 2. */
function shockChargesFor(classId) {
	if (classId === "roccoTheBird") return 1;
	if (classId === "birolho" || classId === "birolho2" || classId === "birolho3" || classId === "birolhoLegs" || classId === "birolhoLegs2") return 3;
	if (isEnemyMageClass(classId)) return 2;
	return 0;
}
const DISEASE = {
	biteChance: .2,
	/** A zombie hit sickens a surviving target this often. */
	zombieChance: .3,
	statPenalty: .1
};
const CURE_DISEASE = {
	name: "Curar Doença Leve",
	range: 2
};
/** Priest Tier 3: Holy damage and fear, exclusively against explicitly typed undead. */
const TURN_UNDEAD = {
	name: "Turn Undead",
	fearTurns: 2
};
const TURN_UNDEAD_PROGRESSION = [
	{
		level: 6,
		range: 4,
		radius: 4,
		dice: 4,
		faces: 6,
		mul: 1.6
	},
	{
		level: 9,
		range: 5,
		radius: 5,
		dice: 5,
		faces: 6,
		mul: 1.8
	},
	{
		level: 12,
		range: 6,
		radius: 6,
		dice: 6,
		faces: 6,
		mul: 2
	},
	{
		level: 15,
		range: 7,
		radius: 7,
		dice: 7,
		faces: 6,
		mul: 2.2
	},
	{
		level: 18,
		range: 8,
		radius: 8,
		dice: 8,
		faces: 6,
		mul: 2.4
	},
	{
		level: 22,
		range: 9,
		radius: 9,
		dice: 10,
		faces: 6,
		mul: 2.6
	}
];
function turnUndeadPower(level) {
	const capped = Math.max(1, Math.min(22, Math.floor(level)));
	const p = [...TURN_UNDEAD_PROGRESSION].reverse().find((p) => capped >= p.level) ?? TURN_UNDEAD_PROGRESSION[0];
	return {
		...p,
		areaHexes: 1 + 3 * p.radius * (p.radius + 1),
		fearTurns: TURN_UNDEAD.fearTurns
	};
}
function turnUndeadFormula(level, mag) {
	const p = turnUndeadPower(level);
	return spellFormula(mag, p.mul, p.dice, p.faces, 0);
}
function isUndeadClass(classId) {
	return CLASSES[classId]?.creatureType === "undead";
}
/** Healer tier 4: instant, self-centered, no aim — same as Aura
* of Protection/Intimidating Presence — tops off the hunger of the caster and every ally
* within `radius` hexes, and conjures a level-scaled batch of plain Rations per ally fed,
* ordinary inventory items, no secondary effect. `fullness` and the bonus-Rations dice are
* two independent breakpoint ladders: the 120%-"overfed" tier (same value a paid Inn meal
* already grants, INN_FULLNESS) starts flat at level 10, cutting across the dice table's own
* 9-10 pairing. */
const CREATE_FOOD_AND_WATER = {
	name: "Criar Comida e Água",
	radius: 2
};
function createFoodAndWaterPower(level) {
	const fullness = level >= 10 ? 120 : 100;
	if (level >= 15) return {
		dice: 2,
		faces: 4,
		bonus: 2,
		fullness
	};
	if (level >= 13) return {
		dice: 1,
		faces: 6,
		bonus: 2,
		fullness
	};
	if (level >= 11) return {
		dice: 1,
		faces: 6,
		bonus: 1,
		fullness
	};
	if (level >= 9) return {
		dice: 1,
		faces: 4,
		bonus: 1,
		fullness
	};
	if (level >= 7) return {
		dice: 1,
		faces: 4,
		bonus: 0,
		fullness
	};
	if (level >= 5) return {
		dice: 1,
		faces: 3,
		bonus: 0,
		fullness
	};
	if (level >= 3) return {
		dice: 1,
		faces: 2,
		bonus: 0,
		fullness
	};
	return {
		dice: 0,
		faces: 0,
		bonus: 0,
		fullness
	};
}
/** Flat, for the same reason as fireballPower: the caster's MAG carries the growth now. */
function lightningDice() {
	return LIGHTNING.dice;
}
/** How a spell's damage reads to the player: the caster's power weighted by the spell,
* plus its dice. Written the way it is computed (see spellDamage in engine.ts), so the tip
* and the number that lands agree. */
function spellFormula(mag, mul, dice, faces, bonus) {
	return `${Math.floor(Math.floor(mag / 2) * mul)} + ${diceFormula(dice, faces, bonus)}`;
}
/** Priest tier 2 (shares Cura Média's pool): a short frontal cone with friendly fire — the priest has to position
* carefully instead of firing through allies. Its multiplier starts under Magic Missile's
* 1.15 and stays below Fireball's 1.35 even at max level, matching its short cone and
* friendly-fire risk. `range` only bounds how far the priest can click to set the facing
* direction (see startBurningHands's wrathRay use) — the cone's own footprint is governed
* by `wide` (see coneWedge in pathfinding.ts): false = the 3-hex front rank only, true =
* that rank plus a second, wider rank further out (the "5-hex cone" tiers). */
const POISON_BREATH = {
	name: "Poison Breath",
	unlockLevel: 3
};
/** Tier 1 cone: scaling starts at level 3, with damage delayed two progression levels. */
function poisonBreathPower(level) {
	const progressionLevel = Math.max(1, level - POISON_BREATH.unlockLevel + 1);
	const power = burningHandsPower(Math.max(1, progressionLevel - 2));
	const radius = Math.max(1, burningHandsRadius(progressionLevel) - 1);
	return {
		...power,
		range: radius,
		radius
	};
}
function poisonBreathFormula(level, mag) {
	const p = poisonBreathPower(level);
	return spellFormula(mag, p.mul, p.dice, p.faces, 0);
}
const BURNING_HANDS = { name: "Mãos Flamejantes" };
const BLESS = {
	name: "Bless",
	radius: 3,
	unlockLevel: 3,
	hitBonusPct: (level) => Math.min(10, Math.max(1, level - 2)),
	durationRounds: (level) => level >= 15 ? 8 : level >= 12 ? 7 : level >= 9 ? 6 : level >= 7 ? 5 : level >= 5 ? 4 : 3
};
/** Burning Hands' cone radius: grows in even steps from 1 hex at level 1 to 6 at level 15
* (1-3: 1, 4-6: 2, 7-9: 3, 10-12: 4, 13-14: 5, 15+: 6). Aim range always equals it. The cone
* itself is slim (see coneSector): 3, 6, 11, 16, 23, 30 hexes for radius 1-6. */
function burningHandsRadius(level) {
	return Math.min(6, 1 + Math.floor((Math.max(1, level) - 1) * 5 / 14));
}
function burningHandsPower(level) {
	const radius = burningHandsRadius(level);
	if (level >= 25) return {
		range: radius,
		radius,
		dice: 2,
		faces: 10,
		mul: 1.35
	};
	if (level >= 21) return {
		range: radius,
		radius,
		dice: 2,
		faces: 8,
		mul: 1.3
	};
	if (level >= 17) return {
		range: radius,
		radius,
		dice: 2,
		faces: 6,
		mul: 1.25
	};
	if (level >= 13) return {
		range: radius,
		radius,
		dice: 2,
		faces: 4,
		mul: 1.2
	};
	if (level >= 9) return {
		range: radius,
		radius,
		dice: 1,
		faces: 8,
		mul: 1.15
	};
	if (level >= 5) return {
		range: radius,
		radius,
		dice: 1,
		faces: 6,
		mul: 1.1
	};
	return {
		range: radius,
		radius,
		dice: 1,
		faces: 4,
		mul: 1.05
	};
}
function burningHandsFormula(level, mag) {
	const p = burningHandsPower(level);
	return spellFormula(mag, p.mul, p.dice, p.faces, 0);
}
function lightningFormula(mag) {
	return spellFormula(mag, LIGHTNING.mul, lightningDice(), LIGHTNING.faces, LIGHTNING.bonus);
}
function lightningTier3Formula(mag) {
	return spellFormula(mag, LIGHTNING_T3.mul, LIGHTNING_T3.dice, LIGHTNING_T3.faces, LIGHTNING_T3.bonus);
}
/** Fireball's dice no longer climb with level. They used to (6d6+10 by level 9) because the
* spell had no other way to grow — it ignored the caster entirely. The multiplier on the
* caster's own MAG does that now, and keeping both would have scaled it twice. */
function fireballPower() {
	return {
		dice: FIREBALL.dice,
		faces: FIREBALL.faces,
		bonus: FIREBALL.bonus
	};
}
function fireballFormula(mag) {
	const p = fireballPower();
	return spellFormula(mag, FIREBALL.mul, p.dice, p.faces, p.bonus);
}
const TIER_SPEED = { rogue: "slow" };
/** Levels needed to go from one tier's unlock to the next, for that casting speed. */
const TIER_SPEED_STEP = {
	full: 3,
	half: 4,
	slow: 5
};
/**
* Explicit level×tier slot tables. These don't follow the TIER_SPEED_STEP formula
* above — they're the exact numbers validated by hand: "quarto" (6 tiers), "meio"
* (8 tiers) and "pleno"/maxed (10 tiers), every tier reaching 5 slots by level 30,
* total never dropping between levels.
*/
const QUARTER_TABLE = [
	[
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		2,
		1,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		2,
		1,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		2,
		1,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		3,
		2,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		3,
		2,
		1,
		0,
		0,
		0,
		0,
		0
	],
	[
		3,
		2,
		1,
		0,
		0,
		0,
		0,
		0
	],
	[
		4,
		3,
		1,
		0,
		0,
		0,
		0,
		0
	],
	[
		4,
		3,
		2,
		1,
		0,
		0,
		0,
		0
	],
	[
		4,
		3,
		2,
		1,
		0,
		0,
		0,
		0
	],
	[
		5,
		4,
		2,
		1,
		0,
		0,
		0,
		0
	],
	[
		5,
		4,
		3,
		2,
		0,
		0,
		0,
		0
	],
	[
		5,
		4,
		3,
		2,
		1,
		0,
		0,
		0
	],
	[
		5,
		5,
		3,
		2,
		1,
		0,
		0,
		0
	],
	[
		5,
		5,
		4,
		3,
		1,
		0,
		0,
		0
	],
	[
		5,
		5,
		4,
		3,
		2,
		1,
		0,
		0
	],
	[
		5,
		5,
		4,
		3,
		2,
		1,
		0,
		0
	],
	[
		5,
		5,
		5,
		4,
		2,
		1,
		0,
		0
	],
	[
		5,
		5,
		5,
		4,
		3,
		2,
		0,
		0
	],
	[
		5,
		5,
		5,
		4,
		3,
		2,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		3,
		2,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		4,
		3,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		4,
		3,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		4,
		3,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		4,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		4,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		4,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		0,
		0
	]
];
const HALF_TABLE = [
	[
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		2,
		1,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		3,
		1,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		3,
		2,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		4,
		2,
		1,
		0,
		0,
		0,
		0,
		0
	],
	[
		4,
		3,
		1,
		0,
		0,
		0,
		0,
		0
	],
	[
		5,
		3,
		2,
		0,
		0,
		0,
		0,
		0
	],
	[
		5,
		4,
		2,
		1,
		0,
		0,
		0,
		0
	],
	[
		5,
		4,
		3,
		1,
		0,
		0,
		0,
		0
	],
	[
		5,
		5,
		3,
		2,
		0,
		0,
		0,
		0
	],
	[
		5,
		5,
		4,
		2,
		1,
		0,
		0,
		0
	],
	[
		5,
		5,
		4,
		3,
		1,
		0,
		0,
		0
	],
	[
		5,
		5,
		5,
		3,
		2,
		0,
		0,
		0
	],
	[
		5,
		5,
		5,
		4,
		2,
		1,
		0,
		0
	],
	[
		5,
		5,
		5,
		4,
		3,
		1,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		3,
		2,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		4,
		2,
		1,
		0
	],
	[
		5,
		5,
		5,
		5,
		4,
		3,
		1,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		3,
		2,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		4,
		2,
		1
	],
	[
		5,
		5,
		5,
		5,
		5,
		4,
		3,
		1
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		3,
		2
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		2
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		3
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		3
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5
	]
];
const FULL_TABLE = [
	[
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		2,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		3,
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		3,
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		4,
		3,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		4,
		3,
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		5,
		4,
		2,
		1,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		5,
		4,
		3,
		2,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		5,
		5,
		3,
		2,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		5,
		5,
		4,
		3,
		1,
		0,
		0,
		0,
		0,
		0
	],
	[
		5,
		5,
		4,
		3,
		2,
		0,
		0,
		0,
		0,
		0
	],
	[
		5,
		5,
		5,
		4,
		2,
		1,
		0,
		0,
		0,
		0
	],
	[
		5,
		5,
		5,
		4,
		3,
		2,
		0,
		0,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		3,
		2,
		0,
		0,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		4,
		3,
		1,
		0,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		4,
		3,
		2,
		0,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		4,
		2,
		1,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		4,
		3,
		2,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		3,
		2,
		0,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		3,
		1,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		3,
		2,
		0
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		2,
		1
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		3,
		2
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		3,
		2
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		3
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4,
		3
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		4
	],
	[
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5
	]
];
/** Every class's slot table, base and promoted alike. Promotion (level 15) doesn't
* change the slot table on its own — it only unlocks the promoted class's spell list
* on top of the base class's (hybrid, nothing lost). Base tier and each promotion:
*   Black Mage  ALTA  — Elementalist ALTA (pleno) · Warlock MEIA
*   Conjurer    ALTA  — Sorcerer ALTA (pleno)     · Necromancer MEIA
*   Healer      ALTA  — Bishop ALTA (pleno)       · Cleric MEIA
*   Warrior     QUARTA — Paladin MEIA              · Heavy Knight QUARTA
*   Archer      MEIA  — Ranger QUARTA             · Assassin MEIA
*   Lancer      QUARTA — Sentinel QUARTA           · Templar MEIA
*   Aldric      QUARTA — Sentinel QUARTA           · Templar MEIA (same kit as Lancer;
*                                                     see PROMOTIONS, only Aldric's own
*                                                     classId carries the promotion path)
*/
const CLASS_TIER_TABLE = {
	mage: FULL_TABLE,
	voss: FULL_TABLE,
	conjurer: FULL_TABLE,
	healer: FULL_TABLE,
	salazar: FULL_TABLE,
	swordsman: QUARTER_TABLE,
	archer: HALF_TABLE,
	neera: HALF_TABLE,
	lancer: QUARTER_TABLE,
	aldric: QUARTER_TABLE,
	kaelFinal: QUARTER_TABLE,
	elementalist: FULL_TABLE,
	warlock: HALF_TABLE,
	sorcerer: FULL_TABLE,
	necromancer: HALF_TABLE,
	bishop: FULL_TABLE,
	cleric: HALF_TABLE,
	paladin: HALF_TABLE,
	heavyKnight: QUARTER_TABLE,
	ranger: QUARTER_TABLE,
	assassin: HALF_TABLE,
	sentinel: QUARTER_TABLE,
	templar: HALF_TABLE
};
/** Canonical FFT-style job family for promoted classes. Hero-specific class ids (Voss,
* Salazar, Neera, Kael) share promotion choices with their original jobs, so deriving this
* map by reversing PROMOTIONS is ambiguous: the last hero alias silently wins. Keep one
* canonical rules owner instead; hero identity remains on the unit/sprite. */
const PROMOTED_BASE = {
	elementalist: "mage",
	warlock: "mage",
	sorcerer: "conjurer",
	necromancer: "conjurer",
	bishop: "healer",
	cleric: "healer",
	paladin: "swordsman",
	heavyKnight: "swordsman",
	ranger: "archer",
	assassin: "archer",
	sentinel: "lancer",
	templar: "lancer"
};
/** Hero-specific visual classes use the exact rules and spell progression of their
* original job. This is deliberately separate from CLASSES so enemy variants can retain
* independent presentation/AI without forking player progression again. */
function rulesClass(classId) {
	const base = PROMOTED_BASE[classId] ?? classId;
	if (base === "voss") return "mage";
	if (base === "salazar") return "healer";
	if (base === "neera") return "archer";
	if (base === "kaelFinal" || base === "kaelEarly") return "swordsman";
	return base;
}
function tierUses(classId, tier, level) {
	if (classId === "swampBlueCalf") return 0;
	const progressionClass = rulesClass(classId);
	const table = CLASS_TIER_TABLE[progressionClass];
	if (table) return table[Math.max(0, Math.min(29, level - 1))][tier - 1] ?? 0;
	const speed = TIER_SPEED[progressionClass];
	if (!speed) return 0;
	const step = TIER_SPEED_STEP[speed];
	return Math.max(0, Math.min(5, Math.floor(level / step) - tier + 2));
}
/** Extra spell uses unlocked by going from `fromLevel` to `toLevel` (inclusive of the jump).
* Level-up grants exactly this delta — never a full rest of spent charges. */
function spellUseGains(classId, fromLevel, toLevel) {
	if (toLevel <= fromLevel) return [];
	const out = [];
	for (let t = 1; t <= 10; t++) {
		const tier = t;
		const gain = tierUses(classId, tier, toLevel) - tierUses(classId, tier, fromLevel);
		if (gain > 0) out.push({
			tier,
			key: tierKey(tier),
			gain
		});
	}
	return out;
}
function formatSpellUseGains(gains) {
	if (gains.length === 0) return "";
	return gains.map((g) => `+${g.gain} T${g.tier}`).join(" · ");
}
const SPELL_TIER = {
	bless: 1,
	magicMissile: 1,
	longShot: 1,
	bloodyShot: 2,
	provoke: 1,
	cureMinor: 1,
	doubleStrike: 1,
	piercingThrust: 1,
	lightning: 2,
	piercing: 2,
	cureWounds: 2,
	cleave: 2,
	sweep: 2,
	trip: 3,
	summonFamiliar: 1,
	phantasmalForce: 1,
	summonFamiliar2: 2,
	summonFamiliar3: 4,
	summonFamiliar4: 3,
	summonZombieDog: 5,
	webOfDreams: 2,
	fireball: 3,
	iceStorm: 4,
	frost: 2,
	lightningTier3: 5,
	cureDisease: 3,
	causticVenom: 5,
	divineBolt: 4,
	minorVenom: 4,
	multiShot: 3,
	secondWind: 3,
	cureLight: 4,
	auraOfProtection: 5,
	divineWrath: 6,
	shoulderSmash: 4,
	intimidatingPresence: 5,
	stampede: 6,
	bullRush: 1,
	shieldBash: 2,
	executionerStrike: 3,
	poisonBreath: 1,
	burningHands: 2,
	createFoodAndWater: 4,
	turnUndead: 3
};
function spellTier(kind) {
	return SPELL_TIER[kind] ?? null;
}
function tierKey(tier) {
	return TIER_KEYS[tier - 1];
}
function enemyLevelFor(missionIndex) {
	if (missionIndex >= 9) return 4;
	if (missionIndex >= 5) return 3;
	if (missionIndex >= 2) return 2;
	return 1;
}
function fireballOrigin(click, _cols, _rows) {
	return {
		x: click.x,
		y: click.y
	};
}
function fireballTiles(origin, cols, rows) {
	const out = [];
	const radius = FIREBALL.size;
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const Aq = x - (y - (y & 1)) / 2;
		const Ar = y;
		const As = -Aq - Ar;
		const Bq = origin.x - (origin.y - (origin.y & 1)) / 2;
		const Br = origin.y;
		const Bs = -Bq - Br;
		if ((Math.abs(Aq - Bq) + Math.abs(Ar - Br) + Math.abs(As - Bs)) / 2 <= radius) out.push({
			x,
			y
		});
	}
	return out;
}
/** Generic hex-radius area, same cube-distance math as fireballTiles but parameterized —
* used by Web of Dreams (and anything else with its own AoE size) instead of FIREBALL.size. */
function hexAreaTiles(origin, radius, cols, rows) {
	const out = [];
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const Aq = x - (y - (y & 1)) / 2;
		const Ar = y;
		const As = -Aq - Ar;
		const Bq = origin.x - (origin.y - (origin.y & 1)) / 2;
		const Br = origin.y;
		const Bs = -Bq - Br;
		if ((Math.abs(Aq - Bq) + Math.abs(Ar - Br) + Math.abs(As - Bs)) / 2 <= radius) out.push({
			x,
			y
		});
	}
	return out;
}
function fireballRangeTiles(from, cols, rows) {
	const out = [];
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const Aq = x - (y - (y & 1)) / 2;
		const Ar = y;
		const As = -Aq - Ar;
		const Bq = from.x - (from.y - (from.y & 1)) / 2;
		const Br = from.y;
		const Bs = -Bq - Br;
		if ((Math.abs(Aq - Bq) + Math.abs(Ar - Br) + Math.abs(As - Bs)) / 2 <= FIREBALL.range) out.push({
			x,
			y
		});
	}
	return out;
}
const CHAR = {
	".": "plains",
	w: "woods",
	r: "ruins",
	a: "water",
	e: "ember",
	h: "hill",
	f: "flame",
	c: "column",
	n: "nave",
	b: "barricade",
	o: "door",
	v: "void",
	u: "snow"
};
function parseLayout(layout) {
	const tiles = [];
	for (const row of layout) for (const ch of row) tiles.push(CHAR[ch] ?? "plains");
	return tiles;
}
const TILE_CHAR = {
	plains: ".",
	woods: "w",
	ruins: "r",
	water: "a",
	ember: "e",
	hill: "h",
	flame: "f",
	column: "c",
	nave: "n",
	barricade: "b",
	door: "o",
	void: "v",
	snow: "u"
};
function isRangedWeapon(unit) {
	return unit.maxRange > 1 && unit.mag === 0;
}
function isProjectile(unit) {
	return unit.maxRange > 1;
}
function effectiveMaxRange(unit, tile) {
	const high = TERRAIN[tile].height ? 1 : 0;
	const ranged = unit.weaponId ? !!WEAPONS[unit.weaponId]?.ranged : false;
	return unit.maxRange + (ranged ? high : 0);
}
function terrainNote(id) {
	const t = TERRAIN[id];
	if (t.height) return `${t.name} · +10% ataque · arqueira +1 alcance`;
	if (t.id === "barricade") return "não se atravessa · 3 hexes · de trás você atira · quem está atrás não é acertado";
	if (t.id === "door") return "trancada · precisa de Gazua para abrir";
	if (t.id === "void") return "vazio · não se atravessa, não se vê através · apaga o terreno pra fechar áreas indoor";
	if (t.hazardDice) return `${t.name} · atravessável · custa ${t.moveCost} Mov · dano ${t.hazardDice}D${t.hazardFaces ?? 8} ao entrar e no início de cada turno`;
}
const RAW_MISSIONS = [
	{
		id: "vau",
		index: 0,
		title: "O Vau",
		place: "Rio de cinza",
		briefing: "O rio ainda corta a planície queimada. Três sobreviventes. Do outro lado, a milícia que os persegue. Atravessem o vau e abram caminho.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 8,
		rows: 7,
		layout: [
			"..ww..h.",
			"...ww.h.",
			"aaa.aaaa",
			"aaa.aaah",
			".h......",
			"w......w",
			"ww....ww"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 2,
				y: 6
			},
			{
				name: "Neera",
				classId: "neera",
				x: 3,
				y: 6
			},
			{
				name: "Voss",
				classId: "voss",
				x: 4,
				y: 6
			}
		],
		enemySpawns: [
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 1,
				y: 0
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 6,
				y: 0
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 4,
				y: 1
			}
		]
	},
	{
		id: "bosque",
		index: 1,
		title: "Bosque Morto",
		place: "Troncos secos",
		briefing: "As árvores não têm folhas há duas estações. O bosque aperta o passo e esconde besteiros. No charco fareja um Cobalt Blue Deer. Não deixem Kael sozinho na frente.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 9,
		rows: 8,
		layout: [
			"w.w...w.w",
			".www.www.",
			"w..w.w..w",
			"ww.....ww",
			"w..hhh..w",
			".w.....w.",
			"w.......w",
			"ww.....ww"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 4,
				y: 7
			},
			{
				name: "Neera",
				classId: "neera",
				x: 3,
				y: 7
			},
			{
				name: "Voss",
				classId: "voss",
				x: 5,
				y: 7
			}
		],
		enemySpawns: [
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 1,
				y: 0
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 7,
				y: 0
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 4,
				y: 1
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 2,
				y: 2
			},
			{
				name: "Cobalt Blue Deer",
				classId: "swampBlueCalf",
				x: 6,
				y: 2
			},
			{
				name: "Cobalt Blue Deer",
				classId: "swampBlueCalf",
				x: 8,
				y: 4
			}
		]
	},
	{
		id: "aldeia",
		index: 2,
		title: "Aldeia Queimada",
		place: "Casario em ruína",
		briefing: "A aldeia ainda fumega. Casas em chama custam o passo e queimam quem atravessa — 1d8. Piqueiros alcançam duas casas. Não corram pelo fogo.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 10,
		rows: 8,
		layout: [
			"eewrr.wree",
			"ew.fff...e",
			"w.rrr.rr.w",
			".fff..fff.",
			"ww.rr.rr.w",
			".f.h..h.f.",
			"w...ff...w",
			"www....www"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 4,
				y: 7
			},
			{
				name: "Neera",
				classId: "neera",
				x: 3,
				y: 7
			},
			{
				name: "Voss",
				classId: "voss",
				x: 5,
				y: 7
			}
		],
		enemySpawns: [
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 3,
				y: 2
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 7,
				y: 2
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 5,
				y: 2
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 2,
				y: 5
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 6,
				y: 5
			}
		]
	},
	{
		id: "muralha",
		index: 3,
		title: "Muralha Rasa",
		place: "Porta da fortaleza",
		briefing: "A muralha baixa ainda segura o caminho. Besteiros no adarve, soldados no vão do portão. Três cães de guerra — carne de rito, ferro uruk no focinho — tomam duas casas cada. Não deixem cercar Kael.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 11,
		rows: 8,
		layout: [
			"rrrr.e.rrrr",
			"r.........r",
			"rrr.....rrr",
			"r.........r",
			"....hhh....",
			"h.........h",
			"...........",
			"www.....www"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 5,
				y: 7
			},
			{
				name: "Neera",
				classId: "neera",
				x: 4,
				y: 7
			},
			{
				name: "Voss",
				classId: "voss",
				x: 6,
				y: 7
			}
		],
		enemySpawns: [
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 4,
				y: 1
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 6,
				y: 1
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 5,
				y: 2
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 1,
				y: 3
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 9,
				y: 3
			},
			{
				name: "Cão de guerra",
				classId: "wardog",
				x: 3,
				y: 5
			},
			{
				name: "Cão de guerra",
				classId: "wardog",
				x: 7,
				y: 5
			},
			{
				name: "Cão de guerra",
				classId: "wardog",
				x: 5,
				y: 4
			}
		]
	},
	{
		id: "fortaleza",
		index: 4,
		title: "Fortaleza de Cinzas",
		place: "Pátio interior",
		briefing: "O capitão espera no pátio. Derrubem ele — a guarda se dispersa. Voss e Neera acertam de longe, sem contra-ataque. Não encostem no chefe. Usem bosque e ruína.",
		objective: "Derrube o capitão",
		win: "boss",
		cols: 10,
		rows: 8,
		layout: [
			"rrr.ee.rrr",
			"r........r",
			"r........r",
			"r........r",
			"r..rrrr..r",
			"r.ww..ww.r",
			"e........e",
			"ee......ee"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 4,
				y: 7
			},
			{
				name: "Neera",
				classId: "neera",
				x: 3,
				y: 7
			},
			{
				name: "Voss",
				classId: "voss",
				x: 5,
				y: 7
			}
		],
		enemySpawns: [
			{
				name: "Capitão",
				classId: "captain",
				x: 4,
				y: 1
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 2,
				y: 2
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 7,
				y: 2
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 8,
				y: 3
			}
		]
	},
	{
		id: "templo",
		index: 5,
		title: "As Jaulas da Lua Carmim",
		place: "Nave enforcada",
		briefing: "A lua de sangue pende sobre a nave. Gaiolas de ferro e carne. O rito já acabou — Asherah ocupa o altar. Matem todos. Se ela alcançar Voss, ele cai.",
		objective: "Derrote Asherah e os feiticeiros",
		win: "rout",
		cols: 13,
		rows: 12,
		layout: [
			"rrrrreeerrrrr",
			"rcnhhhnnnncrr",
			"rnnhhhhnnnncr",
			"rcnnfnnnnfncr",
			"rnncnnrnncnnr",
			"rcnnnnnnnnncr",
			"rnncnnnrrcnnr",
			"rcnnnnnnnncnr",
			"rnnrnnnnnrnnr",
			"rcnncnnncncnr",
			"rnnnnnnnnnnnr",
			"rrrnnnnnnnrrr"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 5,
				y: 11
			},
			{
				name: "Neera",
				classId: "neera",
				x: 6,
				y: 11
			},
			{
				name: "Voss",
				classId: "voss",
				x: 7,
				y: 11
			}
		],
		enemySpawns: [
			{
				name: "Asherah",
				classId: "asherah",
				x: 6,
				y: 2
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 2,
				y: 4
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 10,
				y: 4
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 2,
				y: 8
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 10,
				y: 8
			}
		]
	},
	{
		id: "cripta",
		index: 6,
		title: "Cripta de Cinzas",
		place: "Sob o templo",
		briefing: "Asherah caiu. O prisioneiro do rito anda — Salazar, clérigo sem poções. Duas curas menores e uma cura simples por combate. A cripta ainda tem culto. Não deixem cercá-lo.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 11,
		rows: 10,
		layout: [
			"rrrrrrrrrrr",
			"rcncnnncncr",
			"nnnnnnnnnnn",
			"rcncnnncncr",
			"nnnnnnnnnnn",
			"rcncnnncncr",
			"nnnnnnnnnnn",
			"rcncnnncncr",
			"nnnnnnnnnnn",
			"rrrnnnnnrrr"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 4,
				y: 9
			},
			{
				name: "Neera",
				classId: "neera",
				x: 5,
				y: 9
			},
			{
				name: "Voss",
				classId: "voss",
				x: 6,
				y: 9
			},
			{
				name: "Salazar",
				classId: "salazar",
				x: 7,
				y: 9
			}
		],
		enemySpawns: [
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 2,
				y: 1
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 8,
				y: 1
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 5,
				y: 2
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 1,
				y: 4
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 9,
				y: 4
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 5,
				y: 5
			}
		]
	},
	{
		id: "estalagem",
		index: 7,
		title: "A Estalagem do Osso Seco",
		place: "Pousada à margem da cinza",
		briefing: "A estrada acaba num copo. O Osso Seco ainda serve, se Gold pagar. Brue vende o que restou da adega. O mudo escreve. A hóspede do porão só fala. Ninguém ataca aqui.",
		objective: "Descanso, conversa e troca",
		win: "rout",
		hub: true,
		cols: 8,
		rows: 6,
		layout: [
			"rrrrrrrr",
			"r......r",
			"r......r",
			"r......r",
			"r......r",
			"rrrrrrrr"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 2,
				y: 4
			},
			{
				name: "Neera",
				classId: "neera",
				x: 3,
				y: 4
			},
			{
				name: "Voss",
				classId: "voss",
				x: 4,
				y: 4
			},
			{
				name: "Salazar",
				classId: "salazar",
				x: 5,
				y: 4
			}
		],
		enemySpawns: []
	},
	{
		id: "colina",
		index: 8,
		title: "A Colina Morta",
		place: "Encosta seca",
		briefing: "Uma colina ampla, coberta de vegetação morta. Árvores retorcidas, capim amarelado, pedras antigas. O caminho sobe. Quanto mais alto, mais a encosta vira paredão. No cume, a silhueta de uma construção fortificada. A superfície acaba.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 11,
		rows: 9,
		layout: [
			"ccc...ccccc",
			"chhhhhhhhcc",
			"h.w.h.w.h.h",
			".w...h...w.",
			"wh.......hw",
			".h..hhh..h.",
			"w.w.....w.w",
			"...........",
			"www.....www"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 4,
				y: 8
			},
			{
				name: "Neera",
				classId: "neera",
				x: 3,
				y: 8
			},
			{
				name: "Voss",
				classId: "voss",
				x: 6,
				y: 8
			},
			{
				name: "Salazar",
				classId: "salazar",
				x: 7,
				y: 8
			}
		],
		enemySpawns: [
			{
				name: "Besteiro",
				classId: "brigand",
				x: 2,
				y: 2
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 8,
				y: 2
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 5,
				y: 3
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 4,
				y: 5
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 6,
				y: 5
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 1,
				y: 6
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 9,
				y: 6
			}
		]
	},
	{
		id: "passagem",
		index: 9,
		title: "A Passagem Antiga",
		place: "Caverna talhada",
		briefing: "A única passagem pelo paredão é uma caverna escavada há muito tempo. Paredes talhadas, blocos de pedra, nichos e plataformas sem função. Raízes no teto. No escuro vive um troll da caverna, em armadura grosseira. Ele parte barricadas. Desce e sobe através da montanha.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 11,
		rows: 10,
		layout: [
			"ccccccccccc",
			"cnnnnnnnnnc",
			"cnnncnnncnn",
			"cnnnnnnnnnc",
			"cnncccccnnc",
			"cnnnnnnnnnc",
			"cnnncnnncnn",
			"cnnnnnnnnnc",
			"cnnnnnnnnnc",
			"cccnnnnnccc"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 4,
				y: 9
			},
			{
				name: "Neera",
				classId: "neera",
				x: 3,
				y: 9
			},
			{
				name: "Voss",
				classId: "voss",
				x: 6,
				y: 9
			},
			{
				name: "Salazar",
				classId: "salazar",
				x: 7,
				y: 9
			}
		],
		enemySpawns: [
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 2,
				y: 1
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 8,
				y: 1
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 5,
				y: 2
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 1,
				y: 5
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 9,
				y: 5
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 5,
				y: 6
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 5,
				y: 3
			},
			{
				name: "Troll da caverna",
				classId: "troll",
				x: 6,
				y: 6
			}
		]
	},
	{
		id: "profundezas",
		index: 10,
		title: "As Profundezas Famintas",
		music: "MindReading UMNX  077-Balanced-High.mp3",
		place: "Câmaras mais fundas da caverna",
		briefing: "A passagem continua abaixo, mais funda que qualquer mapa registrado. O ar cheira a cinza fria. Pilares talhados sustentam um teto que não deveria existir a essa profundidade. Algo aqui não come há muito tempo — e não é comida que procura.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 13,
		rows: 9,
		layout: [
			"ccccccccccccc",
			"cnnnnnnnnnnnc",
			"cnncnnnnncnnc",
			"cnnnnnnnnnnnc",
			"cncnnncnnncnc",
			"cnnnnnnnnnnnc",
			"cnnncnnncnnnc",
			"nnnnnnnnnnnnc",
			"cnnnnnnnnnnnc"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 5,
				y: 7
			},
			{
				name: "Neera",
				classId: "neera",
				x: 4,
				y: 7
			},
			{
				name: "Voss",
				classId: "voss",
				x: 6,
				y: 7
			},
			{
				name: "Salazar",
				classId: "salazar",
				x: 7,
				y: 7
			}
		],
		enemySpawns: [
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 3,
				y: 1
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 9,
				y: 1
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 8,
				y: 2
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 2,
				y: 3
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 10,
				y: 3
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 7,
				y: 4
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 6,
				y: 5
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 3,
				y: 5
			},
			{
				name: "Troll da caverna",
				classId: "troll",
				x: 2,
				y: 6
			},
			{
				name: "Troll da caverna",
				classId: "troll",
				x: 10,
				y: 7
			},
			{
				name: "Horror",
				classId: "horror",
				x: 6,
				y: 3,
				guaranteedDrop: true
			}
		]
	},
	{
		id: "vertente",
		index: 11,
		title: "R1",
		place: "Face norte da colina",
		briefing: "A passagem desemboca na outra face. Pouco muda no chão. Muda a vista: a elevação inteira acima, e no topo o Templo Fortificado, nítido pela primeira vez. Não parece abandonado. A encosta é pior deste lado.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 11,
		rows: 9,
		layout: [
			"rrrr.e.rrrr",
			"r.........r",
			"hhh.....hhh",
			".w.h...h.w.",
			"h.........h",
			".w..hhh..w.",
			"w.........w",
			"...........",
			"www.....www"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 4,
				y: 8
			},
			{
				name: "Neera",
				classId: "neera",
				x: 3,
				y: 8
			},
			{
				name: "Voss",
				classId: "voss",
				x: 6,
				y: 8
			},
			{
				name: "Salazar",
				classId: "salazar",
				x: 7,
				y: 8
			}
		],
		enemySpawns: [
			{
				name: "Besteiro",
				classId: "brigand",
				x: 2,
				y: 1
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 8,
				y: 1
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 5,
				y: 2
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 3,
				y: 4
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 7,
				y: 4
			},
			{
				name: "Cão de guerra",
				classId: "wardog",
				x: 1,
				y: 6
			},
			{
				name: "Cão de guerra",
				classId: "wardog",
				x: 9,
				y: 6
			}
		]
	},
	{
		id: "portao",
		index: 12,
		title: "R2",
		place: "Portões do cume",
		briefing: "O caminho acaba diante da entrada. Muralhas espessas, torres no corpo da igreja, portão monumental. Antigo e preservado. A escadaria sobe até as portas. O interior fica para depois.",
		objective: "Derrote todos os inimigos",
		win: "rout",
		cols: 11,
		rows: 8,
		layout: [
			"rrr.....rrr",
			"r.........r",
			"rrr.....rrr",
			"....hhh....",
			"...........",
			"h.........h",
			"...........",
			"www.....www"
		],
		playerSpawns: [
			{
				name: "Kael",
				classId: "kaelFinal",
				x: 4,
				y: 7
			},
			{
				name: "Neera",
				classId: "neera",
				x: 3,
				y: 7
			},
			{
				name: "Voss",
				classId: "voss",
				x: 6,
				y: 7
			},
			{
				name: "Salazar",
				classId: "salazar",
				x: 7,
				y: 7
			}
		],
		enemySpawns: [
			{
				name: "Capitão",
				classId: "captain",
				x: 5,
				y: 1
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 2,
				y: 1
			},
			{
				name: "Soldado",
				classId: "miliciaV2",
				x: 8,
				y: 1
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 1,
				y: 2
			},
			{
				name: "Besteiro",
				classId: "brigand",
				x: 9,
				y: 2
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 4,
				y: 3
			},
			{
				name: "Piqueiro",
				classId: "pikeman",
				x: 6,
				y: 3
			},
			{
				name: "Feiticeiro",
				classId: "cultist",
				x: 5,
				y: 0
			},
			{
				name: "Cão de guerra",
				classId: "wardog",
				x: 2,
				y: 5
			},
			{
				name: "Cão de guerra",
				classId: "wardog",
				x: 8,
				y: 5
			}
		]
	}
];
function expandMaps(missions) {
	return missions.map((m) => {
		if (m.hub) return m;
		const layout = [];
		for (const row of m.layout) {
			const wide = Array.from(row, (ch) => ch + ch).join("");
			layout.push(wide, wide);
		}
		const place = (s) => ({
			...s,
			x: s.x * 2,
			y: s.y * 2
		});
		const doubled = {
			...m,
			cols: m.cols * 2,
			rows: m.rows * 2,
			layout,
			playerSpawns: m.playerSpawns.map(place),
			enemySpawns: m.enemySpawns.map(place),
			neutralSpawns: m.neutralSpawns?.map(place)
		};
		return m.autoTactics === false ? doubled : scatterTactics(doubled);
	});
}
/** The six neighbor cells of an odd-r offset hex grid coordinate, as absolute [x, y] pairs
* — the one copy of this offset table for the whole file (it was previously re-declared
* three separate times: twice inline in scatterTactics, once more for decorateOpenTerrain's
* flood-fill/connectivity checks below). */
function hexAdj(x, y) {
	return (y & 1 ? [
		[1, 0],
		[1, -1],
		[0, -1],
		[-1, 0],
		[0, 1],
		[1, 1]
	] : [
		[1, 0],
		[0, -1],
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, 1]
	]).map(([dx, dy]) => [x + dx, y + dy]);
}
function oddrDist(ax, ay, bx, by) {
	const aq = ax - (ay - (ay & 1)) / 2;
	const bq = bx - (by - (by & 1)) / 2;
	const ar = ay;
	const br = by;
	return (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(-aq - ar - (-bq - br))) / 2;
}
/** Scatters barricades, hills and high-terrain variants over a map.
*
* This is the generator: it runs on load for any mission that has not opted out
* (Mission.autoTactics), and the Map Editor calls it directly so a blank map can be filled
* with something to react to and then cleaned up by hand. Exported for that second use. */
function scatterTactics(m) {
	const tiles = parseLayout(m.layout);
	const blocked = /* @__PURE__ */ new Set();
	const mark = (x, y) => blocked.add(`${x},${y}`);
	for (const s of [
		...m.playerSpawns,
		...m.enemySpawns,
		...m.neutralSpawns ?? []
	]) {
		mark(s.x, s.y);
		for (const [nx, ny] of hexAdj(s.x, s.y)) mark(nx, ny);
	}
	const cand = [];
	for (let y = 1; y < m.rows - 1; y++) for (let x = 1; x < m.cols - 1; x++) {
		const t = tiles[y * m.cols + x];
		if ((t === "plains" || t === "nave" || t === "woods") && !blocked.has(`${x},${y}`)) cand.push({
			x,
			y
		});
	}
	let seed = (m.index + 1) * 9973;
	const rnd = () => {
		seed = Math.imul(seed, 1664525) + 1013904223 | 0;
		return (seed >>> 0) / 4294967296;
	};
	for (let i = cand.length - 1; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		const tmp = cand[i];
		cand[i] = cand[j];
		cand[j] = tmp;
	}
	const taken = [];
	const walkable = (t) => !!t && TERRAIN[t].passable;
	const canWalk = (tilesNow) => {
		const from = m.playerSpawns[0];
		const to = m.enemySpawns[0];
		if (!from || !to) return true;
		const seen = /* @__PURE__ */ new Set([`${from.x},${from.y}`]);
		const q = [{
			x: from.x,
			y: from.y
		}];
		while (q.length) {
			const p = q.pop();
			if (oddrDist(p.x, p.y, to.x, to.y) <= 1) return true;
			for (const [nx, ny] of hexAdj(p.x, p.y)) {
				if (nx < 0 || ny < 0 || nx >= m.cols || ny >= m.rows) continue;
				const k = `${nx},${ny}`;
				if (seen.has(k)) continue;
				if (!walkable(tilesNow[ny * m.cols + nx])) continue;
				seen.add(k);
				q.push({
					x: nx,
					y: ny
				});
			}
		}
		return false;
	};
	const okBase = (x, y) => {
		if (x < 1 || y < 1 || x >= m.cols - 1 || y >= m.rows - 1) return false;
		if (blocked.has(`${x},${y}`)) return false;
		const t = tiles[y * m.cols + x];
		return t === "plains" || t === "nave" || t === "woods";
	};
	const cubeOf = (col, row) => {
		return {
			q: col - (row - (row & 1)) / 2,
			r: row
		};
	};
	const oddrOf = (q, r) => ({
		x: q + (r - (r & 1)) / 2,
		y: r
	});
	const cubeDirs = [
		[1, 0],
		[1, -1],
		[0, -1],
		[-1, 0],
		[-1, 1],
		[0, 1]
	];
	const avg = (list) => ({
		x: list.reduce((s, p) => s + p.x, 0) / Math.max(1, list.length),
		y: list.reduce((s, p) => s + p.y, 0) / Math.max(1, list.length)
	});
	const P = avg(m.playerSpawns);
	const E = avg(m.enemySpawns);
	const frontX = (P.x + E.x) / 2;
	const frontY = (P.y + E.y) / 2;
	const minY = Math.min(P.y, E.y);
	const maxY = Math.max(P.y, E.y);
	const walls = [];
	for (const p of cand) {
		if (!okBase(p.x, p.y)) continue;
		const A = cubeOf(p.x, p.y);
		for (const [dq, dr] of cubeDirs) {
			const cells = [p];
			let q = A.q;
			let r = A.r;
			let good = true;
			for (let k = 0; k < 2; k++) {
				q += dq;
				r += dr;
				const n = oddrOf(q, r);
				n.x = Math.round(n.x);
				n.y = Math.round(n.y);
				if (!okBase(n.x, n.y)) {
					good = false;
					break;
				}
				cells.push(n);
			}
			if (!good) continue;
			const mx = cells.reduce((s, c) => s + c.x, 0) / 3;
			const my = cells.reduce((s, c) => s + c.y, 0) / 3;
			const between = my > minY + 1.2 && my < maxY - 1.2;
			const sameRow = cells.every((c) => c.y === cells[0].y) ? 3 : 0;
			const dFront = Math.abs(mx - frontX) * .3 + Math.abs(my - frontY);
			const central = 1 - Math.abs(mx - (m.cols - 1) / 2) / (m.cols / 2);
			walls.push({
				cells,
				score: (between ? 12 : 0) + sameRow + central * 4 - dFront
			});
		}
	}
	const density = m.cols * m.rows / 288;
	const wantWalls = Math.min(3, Math.max(1, Math.round(2 * density)));
	const wallCenters = [];
	const remaining = [...walls];
	let placed = 0;
	while (placed < wantWalls && remaining.length) {
		let bestIdx = -1;
		let bestScore = -Infinity;
		for (let idx = 0; idx < remaining.length; idx++) {
			const wall = remaining[idx];
			if (wall.cells.some((c) => taken.some((q) => oddrDist(c.x, c.y, q.x, q.y) < 3))) continue;
			const mx = Math.round(wall.cells.reduce((s, c) => s + c.x, 0) / 3);
			const my = Math.round(wall.cells.reduce((s, c) => s + c.y, 0) / 3);
			const spread = wallCenters.length ? Math.min(...wallCenters.map((p) => oddrDist(mx, my, p.x, p.y))) : 0;
			const effScore = wall.score + spread * 2.2;
			if (effScore > bestScore) {
				bestScore = effScore;
				bestIdx = idx;
			}
		}
		if (bestIdx < 0) break;
		const wall = remaining[bestIdx];
		remaining.splice(bestIdx, 1);
		const prev = wall.cells.map((c) => tiles[c.y * m.cols + c.x]);
		for (const c of wall.cells) tiles[c.y * m.cols + c.x] = "barricade";
		if (!canWalk(tiles)) {
			wall.cells.forEach((c, i) => {
				tiles[c.y * m.cols + c.x] = prev[i];
			});
			continue;
		}
		taken.push(...wall.cells);
		wallCenters.push({
			x: Math.round(wall.cells.reduce((s, c) => s + c.x, 0) / 3),
			y: Math.round(wall.cells.reduce((s, c) => s + c.y, 0) / 3)
		});
		placed += 1;
	}
	const layout = [];
	for (let y = 0; y < m.rows; y++) {
		let row = "";
		for (let x = 0; x < m.cols; x++) row += TILE_CHAR[tiles[y * m.cols + x] ?? "plains"] ?? ".";
		layout.push(row);
	}
	return {
		...m,
		layout
	};
}
const ROCK_IDS = ["spike-rocks"];
/** Replaces every "column" tile (a marble pillar rendered on its own patch of grass —
* looks absurd indoors, and doubly so on a plains/cave map that has no grass anywhere
* else) with rock-formation decorations instead, on every mission that uses columns at
* all, not just the worst offenders. Runs after expandMaps() specifically because a raw
* mission's single hex always doubles into a horizontally-adjacent PAIR of the same tile
* (expandMaps does `ch + ch` per character) — so working at the expanded grid means every
* column, however isolated it looked in the original hand-authored layout, already has a
* same-row neighbor to pair with here. That's what makes plain adjacent-pair matching
* enough: no leftover singles to fall back on, no footprint mismatch to design around.
* (An earlier pass tried placing decorations directly on the raw pre-expansion missions —
* their coordinates don't survive expandMaps(), which scales spawns but not decorations,
* so anything placed that way renders in the wrong spot. Doing it here, post-expansion,
* on real rendered coordinates, sidesteps that entirely.) */
function rockifyColumns(mission) {
	if (mission.hub) return mission;
	const grid = mission.layout.map((row) => row.split(""));
	const fallbackFloor = mission.layout.some((row) => row.includes("n")) ? "n" : ".";
	const decorations = [...mission.decorations ?? []];
	const claimed = /* @__PURE__ */ new Set();
	let next = 0;
	for (let y = 0; y < mission.rows; y++) for (let x = 0; x < mission.cols - 1; x++) {
		const key = `${x},${y}`;
		if (grid[y][x] !== "c" || claimed.has(key)) continue;
		const rightKey = `${x + 1},${y}`;
		if (grid[y][x + 1] !== "c" || claimed.has(rightKey)) continue;
		claimed.add(key);
		claimed.add(rightKey);
		decorations.push({
			id: ROCK_IDS[next % ROCK_IDS.length],
			x,
			y
		});
		next += 1;
	}
	for (let y = 0; y < mission.rows; y++) for (let x = 0; x < mission.cols; x++) if (grid[y][x] === "c") grid[y][x] = fallbackFloor;
	return {
		...mission,
		layout: grid.map((row) => row.join("")),
		decorations
	};
}
const DEADTREE_REPLACEMENT = "wilds-fallen-log";
const HIGHWOOD_REPLACEMENT = "wilds-dead-oak";
const HIGHRUIN_REPLACEMENT = "wilds-ruined-wayside-shrine";
/** Retires deadtree/highwood/highruin as ground-tile terrain, per direct instruction: those
* three were never really "ground" — a fallen tree trunk (deadtree/highwood, distinguished
* only by which sprite folder inherited the name — see TERRAIN's own "Tronco caído"/"Tronco
* morto") and an abandoned house (highruin) are props that happen to sit on the ground, not
* a kind of ground themselves — so every occurrence becomes plain floor (matching
* rockifyColumns' own fallbackFloor convention: "n" on an indoor/underground map, "."
* everywhere else) with a same-theme decoration placed on top instead. Runs in the same
* post-expandMaps pipeline slot as rockifyColumns for the same reason: coordinates only
* line up with the final rendered grid after expandMaps has already doubled every raw
* hand-authored cell. */
function clearScrappedGroundTiles(mission) {
	if (mission.hub) return mission;
	const grid = mission.layout.map((row) => row.split(""));
	const fallbackFloor = "h";
	const decorations = [...mission.decorations ?? []];
	const claimed = decorationCells(decorations);
	const targets = [
		{
			char: "t",
			id: DEADTREE_REPLACEMENT
		},
		{
			char: "d",
			id: HIGHWOOD_REPLACEMENT
		},
		{
			char: "s",
			id: HIGHRUIN_REPLACEMENT
		}
	];
	for (const { char, id } of targets) for (let y = 0; y < mission.rows; y++) for (let x = 0; x < mission.cols; x++) {
		if (grid[y][x] !== char) continue;
		grid[y][x] = fallbackFloor;
		const key = `${x},${y}`;
		if (claimed.has(key)) continue;
		decorations.push({
			id,
			x,
			y
		});
		claimed.add(key);
	}
	return {
		...mission,
		layout: grid.map((row) => row.join("")),
		decorations
	};
}
function mulberry32Local(seed) {
	let a = seed | 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function seedFromId(id) {
	let h = 2166136261;
	for (let i = 0; i < id.length; i++) {
		h ^= id.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function inBoundsCell(x, y, cols, rows) {
	return x >= 0 && x < cols && y >= 0 && y < rows;
}
function connectivityOk(grid, cols, rows, blockedExtra, spawns) {
	if (spawns.length === 0) return true;
	const passable = (x, y) => {
		if (blockedExtra.has(`${x},${y}`)) return false;
		const id = CHAR[grid[y][x]] ?? "plains";
		return TERRAIN[id]?.passable !== false;
	};
	const [sx, sy] = spawns[0];
	const seen = /* @__PURE__ */ new Set([`${sx},${sy}`]);
	const stack = [[sx, sy]];
	while (stack.length) {
		const [cx, cy] = stack.pop();
		for (const [nx, ny] of hexAdj(cx, cy)) {
			const k = `${nx},${ny}`;
			if (inBoundsCell(nx, ny, cols, rows) && !seen.has(k) && passable(nx, ny)) {
				seen.add(k);
				stack.push([nx, ny]);
			}
		}
	}
	return spawns.every(([x, y]) => seen.has(`${x},${y}`));
}
function chebyshev(a, b) {
	return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}
function minDist(cell, pts) {
	return pts.length ? Math.min(...pts.map((p) => chebyshev(cell, p))) : Infinity;
}
/** Sprinkles a handful of lockable chests ("here and there", not blanket coverage) onto
* open ground — spaced apart, never where they'd cut off a spawn (same BFS check as
* decoration placement, since a chest is impassable terrain until picked), and biased
* toward enemy territory: candidates are ranked by (distance from the nearest player
* spawn) minus (distance from the nearest enemy spawn), so a chest is worth fighting
* through the enemy line for, not a freebie sitting next to the party's own spawn. */
function placeChests(grid, cols, rows, playerSpawns, enemySpawns, spawnSet, blockedExtra, seed, floorChar) {
	const rng = mulberry32Local(seed);
	const spawns = [...playerSpawns, ...enemySpawns];
	const candidates = [];
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		const k = `${x},${y}`;
		if (spawnSet.has(k) || blockedExtra.has(k) || grid[y][x] !== floorChar) continue;
		candidates.push([x, y]);
	}
	candidates.sort((a, b) => {
		const scoreA = minDist(a, playerSpawns) - minDist(a, enemySpawns);
		return minDist(b, playerSpawns) - minDist(b, enemySpawns) - scoreA;
	});
	const CHEST_MIN_HERO_DIST = 4;
	const heroHexes = (c) => playerSpawns.length ? Math.min(...playerSpawns.map((sp) => oddrDist(c[0], c[1], sp[0], sp[1]))) : Infinity;
	const farEnough = candidates.filter((c) => heroHexes(c) >= CHEST_MIN_HERO_DIST);
	const usable = farEnough.length > 0 ? farEnough : candidates;
	const pool = usable.slice(0, Math.max(1, Math.ceil(usable.length / 2)));
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	const budget = Math.min(3, Math.max(1, Math.floor(cols * rows / 150)));
	const placed = [];
	for (const [cx, cy] of pool) {
		if (placed.length >= budget) break;
		if (placed.some(([px, py]) => Math.max(Math.abs(px - cx), Math.abs(py - cy)) < 3)) continue;
		const candidate = new Set(blockedExtra);
		candidate.add(`${cx},${cy}`);
		if (connectivityOk(grid, cols, rows, candidate, spawns)) {
			blockedExtra.add(`${cx},${cy}`);
			placed.push([cx, cy]);
		}
	}
	return placed;
}
/** Strips "funky" single-hex clutter tiles — woods ("w") and ruins ("r"), whose baked-in
* tree/house art tiles awkwardly at hex scale (and reads as grass/greenery even indoors,
* e.g. a temple nave) — back to plain ground, replaced with a modest sprinkling of the
* multi-hex decoration objects instead. Elevation (hill), fire (flame) and ember are
* untouched. Also sprinkles 1-3 lockable chests per map onto open ground, deterministically
* seeded by mission id so they don't reshuffle on reload. Every placement is verified with a
* BFS connectivity check — dropped if it would cut any spawn off from the rest of the board —
* so this can never produce an unwinnable map. Runs last, after rockifyColumns, on the same
* real expanded coordinates the game actually renders. */
function decorateOpenTerrain(mission) {
	if (mission.hub) return mission;
	const { cols, rows } = mission;
	const grid = mission.layout.map((row) => row.split(""));
	const playerSpawns = mission.playerSpawns.map((s) => [s.x, s.y]);
	const enemySpawns = mission.enemySpawns.map((s) => [s.x, s.y]);
	const spawnSet = new Set([...playerSpawns, ...enemySpawns].map(([x, y]) => `${x},${y}`));
	const floorChar = mission.layout.some((row) => row.includes("n")) ? "n" : ".";
	const blockedExtra = /* @__PURE__ */ new Set();
	const hasAuthoredChest = (mission.decorations ?? []).some((d) => CHEST_DECOR_IDS.has(d.id));
	const decorations = [...mission.decorations ?? []];
	if (!hasAuthoredChest) {
		const placedChests = placeChests(grid, cols, rows, playerSpawns, enemySpawns, spawnSet, blockedExtra, seedFromId(mission.id), floorChar);
		for (const [x, y] of placedChests) decorations.push({
			id: "locked-chest",
			x,
			y
		});
	}
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		if (grid[y][x] !== "k") continue;
		if (decorations.some((d) => d.id === "locked-chest" && d.x === x && d.y === y)) continue;
		decorations.push({
			id: "locked-chest",
			x,
			y
		});
	}
	return {
		...mission,
		layout: grid.map((row) => row.join("")),
		decorations
	};
}
/** Missions whose open ground is meant to read as dead/scorched, not living grass.
* Swaps every plains cell to the Cinza art variant (plains005.png). Still mechanically plains. */
const DEAD_GROUND_MISSIONS = /* @__PURE__ */ new Set(["portao"]);
const DEAD_GROUND_VARIANT = 4;
function applyDeadGround(mission) {
	if (!DEAD_GROUND_MISSIONS.has(mission.id)) return mission;
	const tiles = parseLayout(mission.layout);
	const variants = mission.tileVariants ? [...mission.tileVariants] : new Array(tiles.length).fill(0);
	for (let i = 0; i < tiles.length; i++) if (tiles[i] === "plains") variants[i] = DEAD_GROUND_VARIANT;
	return {
		...mission,
		tileVariants: variants
	};
}
const MISSIONS = expandMaps(RAW_MISSIONS).map(rockifyColumns).map(decorateOpenTerrain).map(applyDeadGround).map(clearScrappedGroundTiles);
/** Campaign world map markers, positioned (percent x/y, 0-100) against the real map art
* at public/game/assets/world-map.jpg, pinned to that art's own labels per direct instruction:
* Stone Bridge (missions 1-3: O Vau, Bosque Morto, Aldeia Queimada), the first of the two
* "Ruins" (missions 4-6 plus Cripta de Cinzas, mission 7 — it's set under the temple ruins
* above it, so it joins them as that location's 4th fight instead of Cemetery), the Inn
* (mission 8), Dungeon (Colina Morta and Passagem Antiga, missions 9-10 — moved here from
* Cemetery, which sits locked with no missions until more content backfills it), and the
* Dungeon also picked up a third mission, "As Profundezas Famintas" (mission 11 —
* deeper still, a new unique boss). The Fortified Temple Complex's own two missions
* ("vertente"/"portao", titled R1/R2 as placeholders) are locked out of the map entirely
* for now — pushed later in the story than mission 12, not ready for a real pass yet — same
* "no missionIds" treatment as every other undeveloped location below. Those (Village,
* Farm, the second Ruins, Cemetery, Frozen Swamp, Forest, Misty Cave — the last reserved
* for a future troll encounter arc, City — reserved for the second Ferreiro) render
* permanently locked until missions are written for them — "we'll open up more as we make
* more missions." */
const WORLD_LOCATIONS = [
	{
		id: "stonebridge",
		name: "Stone Bridge",
		x: 14,
		y: 62,
		missionIds: ["vau", "aldeia"]
	},
	{
		id: "ruins",
		name: "Ruins",
		x: 77.94,
		y: 30,
		missionIds: [
			"muralha",
			"fortaleza",
			"templo",
			"cripta"
		]
	},
	{
		id: "estalagem",
		name: "Inn",
		x: 51.96,
		y: 60,
		missionIds: ["estalagem"]
	},
	{
		id: "ashen-forest",
		name: "Ashen Forest Crossing",
		x: 73.61215932167728,
		y: 52.5,
		missionIds: ["ashen-forest-crossing"],
		openAccess: true
	},
	{
		id: "dungeon",
		name: "The Sunken Ruins",
		x: 12.99,
		y: 82.5,
		missionIds: [
			"colina",
			"passagem",
			"profundezas"
		]
	},
	{
		id: "watchtower",
		name: "Watchtower",
		x: 24,
		y: 50,
		missionIds: ["bosque"]
	},
	{
		id: "vertente",
		name: "Fortified Temple Complex",
		x: 51.96,
		y: 15,
		missionIds: []
	},
	{
		id: "village",
		name: "Village",
		x: 22,
		y: 25,
		missionIds: []
	},
	{
		id: "farm",
		name: "Farm",
		x: 14,
		y: 38,
		missionIds: []
	},
	{
		id: "mordavian-woods",
		name: "Mordavian Woods",
		x: 8.66,
		y: 30,
		missionIds: ["mordavian-woods"],
		encountersAllowed: true,
		openAccess: true,
		submaps: [
			{
				missionId: "mordavian-woods-floor-1",
				floor: 1
			},
			{
				missionId: "mordavian-woods-floor-2",
				floor: 2
			},
			{
				missionId: "mordavian-woods-floor-3",
				floor: 3
			},
			{
				missionId: "mordavian-woods-floor-4",
				floor: 4
			},
			{
				missionId: "mordavian-woods-floor-5",
				floor: 5
			}
		]
	},
	{
		id: "misty-cave",
		name: "Misty Cave",
		x: 51.96,
		y: 45,
		missionIds: []
	},
	{
		id: "cemetery",
		name: "Cemetery",
		x: 86,
		y: 52,
		missionIds: []
	},
	{
		id: "frozen-swamp",
		name: "Frozen Swamp",
		x: 51.96,
		y: 75,
		missionIds: ["frozen-swamp-crossing-1"],
		openAccess: true,
		submaps: [
			{
				missionId: "frozen-swamp-crossing-2",
				floor: 2
			},
			{
				missionId: "frozen-swamp-crossing-3",
				floor: 3
			},
			{
				missionId: "frozen-swamp-1-sunk-vault",
				floor: 1
			},
			{
				missionId: "frozen-swamp-1-hidden-cellar",
				floor: 1
			},
			{
				missionId: "frozen-swamp-2-sunk-vault",
				floor: 2
			},
			{
				missionId: "frozen-swamp-2-hidden-cellar",
				floor: 2
			},
			{
				missionId: "frozen-swamp-3-sunk-vault",
				floor: 3
			},
			{
				missionId: "frozen-swamp-3-hidden-cellar",
				floor: 3
			}
		]
	},
	{
		id: "forest",
		name: "The Verdant Refuge",
		x: 82.27,
		y: 82.5,
		missionIds: []
	},
	{
		id: "wisp-forest",
		name: "Wisp Forest",
		x: 34.64,
		y: 60,
		missionIds: []
	}
];
(() => {
	const out = {};
	for (const m of MISSIONS) {
		if (m.hub) continue;
		for (const s of m.playerSpawns) if (out[s.name] == null || m.index < out[s.name]) out[s.name] = m.index;
	}
	return out;
})();
//#endregion
//#region src/game/gfx/TurnUndeadV4.ts
const TURN_UNDEAD_V4_DURATION = .3;
/** One transient area-wide flash using the existing healing aura's hot cream core,
* gold falloff and additive blend. Each draw samples the same single light field;
* the exact affected cells clip it, without per-hex lights or a persistent zone. */
function drawTurnUndeadV4(ctx, cells, elapsed) {
	if (!cells.length || elapsed <= 0 || elapsed >= .3) return;
	const fade = Math.min(1, elapsed / .02) * Math.pow(1 - elapsed / TURN_UNDEAD_V4_DURATION, 1.3);
	const cx = cells.reduce((v, p) => v + p.x, 0) / cells.length, cy = cells.reduce((v, p) => v + p.y, 0) / cells.length;
	const radius = Math.max(...cells.flatMap((cell) => cell.corners.map(([x, y]) => Math.hypot(x - cx, y - cy))));
	const path = (cell) => {
		ctx.beginPath();
		cell.corners.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
		ctx.closePath();
	};
	ctx.save();
	ctx.globalCompositeOperation = "lighter";
	const light = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.15);
	light.addColorStop(0, `rgba(255,250,220,${.98 * fade})`);
	light.addColorStop(.35, `rgba(255,232,160,${.8 * fade})`);
	light.addColorStop(.72, `rgba(255,210,90,${.42 * fade})`);
	light.addColorStop(1, "rgba(255,210,90,0)");
	cells.forEach((cell, index) => {
		ctx.save();
		path(cell);
		ctx.clip();
		ctx.fillStyle = light;
		path(cell);
		ctx.fill();
		for (let i = 0; i < 2; i++) {
			const seed = index * 13.17 + i * 73.51;
			const r = Math.max(...cell.corners.map(([x, y]) => Math.hypot(x - cell.x, y - cell.y)));
			const x = cell.x + Math.sin(seed) * r * .7, y = cell.y + Math.cos(seed * 1.7) * r * .6 - elapsed * r * .3;
			ctx.strokeStyle = `rgba(255,250,230,${fade * .85})`;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x, y - r * .055);
			ctx.stroke();
		}
		ctx.restore();
	});
	ctx.restore();
}
const EMPTY_OVERLAY = /* @__PURE__ */ new Uint8Array(0);
/**
* Fold every placement's switches into a per-cell overlay. Call it when the decoration
* list changes, not per query.
*
* `cellsOf` is injected because expanding a rotated footprint lives in ./data, which
* imports this module's neighbour — passing it in keeps the dependency one-way and
* keeps this file testable without the decoration table.
*/
function buildDecorOverlay(decorations, cols, rows, cellsOf, terrainElevations = []) {
	const overlay = new Uint8Array(cols * rows);
	for (let index = 0; index < overlay.length; index++) {
		const level = terrainElevations[index];
		if (level != null && Number.isFinite(level) && level > 0) overlay[index] |= 2;
	}
	const solidCells = [];
	for (const p of decorations) {
		const isHouse = HOUSE_DECOR_IDS.has(p.id) || BIG_HOUSE_DECOR_IDS.has(p.id) || SOLID_HOUSE_DECOR_IDS.has(p.id);
		const isChest = CHEST_DECOR_IDS.has(p.id);
		const isBarricade = BARRICADE_LIKE_DECOR.has(p.id);
		const isCart = SOLID_CART_DECOR_IDS.has(p.id);
		const isRock = SOLID_ROCK_DECOR_IDS.has(p.id);
		const architecture = DECORATIONS[p.id]?.model3d;
		const solidArchitecture = architecture === "wall" || architecture === "door" || architecture === "secretDoor" || architecture === "doorway" && !!DECORATIONS[p.id]?.architectureSpan && !!DECORATIONS[p.id]?.blockingFootprint;
		const lowProp = !!p.blocksPath && LOW_BLOCKER_DECOR_IDS.has(p.id) && !isHouse && !isChest && !isBarricade && !isCart && !isRock && !solidArchitecture;
		const bits = (p.blocksPath || isHouse || isChest || isBarricade || isCart || isRock || solidArchitecture ? 1 : 0) | (p.yieldsHighGround ? 2 : 0) | (lowProp ? 4 : 0);
		if (!bits) continue;
		for (const { dx, dy } of cellsOf(p)) {
			const x = p.x + dx;
			const y = p.y + dy;
			if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
			overlay[y * cols + x] |= bits;
			if (bits & 1 && !lowProp) solidCells.push(y * cols + x);
		}
	}
	for (const index of solidCells) overlay[index] &= -5;
	return overlay;
}
/**
* Derived terrain defs, one per (base terrain, flags) pair actually used.
*
* `hexDef` sits in the movement and line-of-sight inner loops, so it must not mint an
* object per call. There are at most three flag combinations per terrain, so the whole
* cache is tiny and settles after the first few queries.
*/
const derived = /* @__PURE__ */ new Map();
function deriveDef(base, bits) {
	const cacheKey = `${base.id}|${bits}`;
	const hit = derived.get(cacheKey);
	if (hit) return hit;
	const out = { ...base };
	if (bits & 1) {
		out.passable = false;
		out.moveCost = 99;
		out.blocksShot = bits & 4 ? !!base.blocksShot : true;
	}
	if (bits & 2) {
		out.height = 1;
		out.atk = Math.max(base.atk, 2);
		out.def = Math.max(base.def, 1);
		if (out.passable) out.moveCost = Math.max(base.moveCost, 2);
	}
	derived.set(cacheKey, out);
	return out;
}
/**
* The properties of one hex: base terrain, plus whatever decoration sits on it.
*
* Returns the shared `TERRAIN` entry untouched when no decoration overrides the cell,
* which is the overwhelmingly common case and costs one array read to establish.
*/
function hexDef(tiles, cols, x, y, overlay = EMPTY_OVERLAY) {
	const base = TERRAIN[tiles[y * cols + x] ?? "plains"];
	if (overlay.length === 0) return base;
	const bits = overlay[y * cols + x] ?? 0;
	return bits === 0 ? base : deriveDef(base, bits);
}
/**
* A shooter's reach from one hex, with the high-ground bonus taken from the
* consolidated properties.
*
* `effectiveMaxRange` in ./data answers the same question from a bare TerrainId, which
* cannot see a decoration's `yieldsHighGround`. This is the version rules should use
* where a cell is known; the other stays for the HUD readouts that only have a tile.
*/
function effectiveMaxRangeAt(unit, tiles, cols, x, y, overlay = EMPTY_OVERLAY) {
	const high = hexDef(tiles, cols, x, y, overlay).height ? 1 : 0;
	const ranged = unit.weaponId ? !!WEAPONS[unit.weaponId]?.ranged : false;
	return unit.maxRange + (ranged ? high : 0);
}
//#endregion
//#region src/game/pathfinding.ts
function key(x, y) {
	return `${x},${y}`;
}
function inBounds(x, y, cols, rows) {
	return x >= 0 && y >= 0 && x < cols && y < rows;
}
/** Only these two classes fly over water in the current roster. Blocking decorations still
* stop them; this exception applies to water terrain itself, not to obstacles placed on it. */
function canTraverseWater(unit, terrain, overlay, x, y, cols) {
	if (terrain.id !== "water" || unit.classId !== "swampBlueCalf" && unit.classId !== "roccoTheBird") return false;
	const index = y * cols + x;
	return overlay.length === 0 || ((overlay[index] ?? 0) & 1) === 0;
}
function tileAt(tiles, cols, x, y) {
	return tiles[y * cols + x] ?? "plains";
}
function oddrToCube(col, row) {
	const q = col - (row - (row & 1)) / 2;
	const r = row;
	return {
		q,
		r,
		s: -q - r
	};
}
function cubeToOddr(q, r) {
	return {
		x: q + (r - (r & 1)) / 2,
		y: r
	};
}
function cubeRound(q, r, s) {
	let rq = Math.round(q);
	let rr = Math.round(r);
	let rs = Math.round(s);
	const dq = Math.abs(rq - q);
	const dr = Math.abs(rr - r);
	const ds = Math.abs(rs - s);
	if (dq > dr && dq > ds) rq = -rr - rs;
	else if (dr > ds) rr = -rq - rs;
	else rs = -rq - rr;
	return {
		q: rq,
		r: rr,
		s: rs
	};
}
function hexLine(a, b) {
	const n = hexDist(a, b);
	if (n === 0) return [{
		x: a.x,
		y: a.y
	}];
	const A = oddrToCube(a.x, a.y);
	const B = oddrToCube(b.x, b.y);
	const out = [];
	let prev = "";
	for (let i = 0; i <= n; i++) {
		const t = i / n;
		const c = cubeRound(A.q + (B.q - A.q) * t, A.r + (B.r - A.r) * t, A.s + (B.s - A.s) * t);
		const p = cubeToOddr(c.q, c.r);
		const k = key(p.x, p.y);
		if (k === prev) continue;
		prev = k;
		out.push(p);
	}
	return out;
}
function clearShot(from, to, tiles, cols, kind, overlay = EMPTY_OVERLAY) {
	return shotBlocker(from, to, tiles, cols, kind, overlay) === null;
}
/** The hex that stops a shot from `from` to `to` (clearShot's rules), or null when the line is clear —
* so the game can tell the player exactly what is in the way. */
function shotBlocker(from, to, tiles, cols, kind, overlay = EMPTY_OVERLAY) {
	const fromHigh = !!hexDef(tiles, cols, from.x, from.y, overlay).height;
	const line = hexLine(from, to);
	for (let i = 1; i < line.length; i++) {
		const p = line[i];
		const end = i === line.length - 1;
		const t = hexDef(tiles, cols, p.x, p.y, overlay);
		if (t.id === "barricade") {
			if (end) return p;
			const shooterBehind = hexDist(from, p) <= 1;
			if (hexDist(to, p) <= 1) return p;
			if (!shooterBehind) return p;
			continue;
		}
		if (t.blocksShot && !end) return p;
		if (!end && kind === "arrow" && t.height && !fromHigh) return p;
	}
	return null;
}
function shotKind(unit) {
	if (isRangedWeapon(unit)) return "arrow";
	if (isProjectile(unit)) return "bolt";
	return null;
}
function hexDist(a, b) {
	const A = oddrToCube(a.x, a.y);
	const B = oddrToCube(b.x, b.y);
	return (Math.abs(A.q - B.q) + Math.abs(A.r - B.r) + Math.abs(A.s - B.s)) / 2;
}
function manhattan(a, b) {
	return hexDist(a, b);
}
const CUBE_DIRS = [
	{
		q: 1,
		r: 0,
		s: -1
	},
	{
		q: 1,
		r: -1,
		s: 0
	},
	{
		q: 0,
		r: -1,
		s: 1
	},
	{
		q: -1,
		r: 0,
		s: 1
	},
	{
		q: -1,
		r: 1,
		s: 0
	},
	{
		q: 0,
		r: 1,
		s: -1
	}
];
function cubeAdd(a, b) {
	return {
		q: a.q + b.q,
		r: a.r + b.r,
		s: a.s + b.s
	};
}
function axisDir(from, to) {
	const A = oddrToCube(from.x, from.y);
	const B = oddrToCube(to.x, to.y);
	const dq = B.q - A.q;
	const dr = B.r - A.r;
	const ds = B.s - A.s;
	if (dq === 0 && dr === 0 && ds === 0) return null;
	if (dq !== 0 && dr !== 0 && ds !== 0) return null;
	const n = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
	if (n <= 0) return null;
	if (dq % n !== 0 || dr % n !== 0 || ds % n !== 0) return null;
	return {
		q: dq / n,
		r: dr / n,
		s: ds / n
	};
}
function hexRay(from, dir, cols, rows) {
	const out = [];
	let c = cubeAdd(oddrToCube(from.x, from.y), dir);
	for (let i = 0; i < cols + rows + 4; i++) {
		const p = cubeToOddr(c.q, c.r);
		if (!inBounds(p.x, p.y, cols, rows)) break;
		out.push(p);
		c = cubeAdd(c, dir);
	}
	return out;
}
function allAxisRays(from, cols, rows) {
	const out = [];
	for (const d of CUBE_DIRS) out.push(...hexRay(from, d, cols, rows));
	return out;
}
/**
* Ray from `from` through `through`, continuing straight to the map edge.
* Unlike `axisDir` this isn't limited to the 6 exact hex axes — it points at
* `through` from any angle (snapping each step to the nearest hex, same
* technique as `hexLine`), so any target hex gives a usable line, not just
* ones perfectly aligned with a hex direction.
*/
function piercingLine(from, through, cols, rows) {
	const n = hexDist(from, through);
	if (n <= 0) return null;
	const A = oddrToCube(from.x, from.y);
	const B = oddrToCube(through.x, through.y);
	const stepQ = (B.q - A.q) / n;
	const stepR = (B.r - A.r) / n;
	const stepS = (B.s - A.s) / n;
	const out = [];
	let prevKey = "";
	const maxSteps = cols + rows + 4;
	for (let i = 1; i <= maxSteps; i++) {
		const c = cubeRound(A.q + stepQ * i, A.r + stepR * i, A.s + stepS * i);
		const p = cubeToOddr(c.q, c.r);
		const k = key(p.x, p.y);
		if (k === prevKey) continue;
		prevKey = k;
		if (!inBounds(p.x, p.y, cols, rows)) break;
		out.push(p);
	}
	return out.length ? out : null;
}
function hexNeighbors(col, row) {
	return (row & 1 ? [
		[1, 0],
		[1, -1],
		[0, -1],
		[-1, 0],
		[0, 1],
		[1, 1]
	] : [
		[1, 0],
		[0, -1],
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, 1]
	]).map(([dx, dy]) => ({
		x: col + dx,
		y: row + dy
	}));
}
function cleaveHexes(from, start, count, cols, rows) {
	const ring = hexNeighbors(from.x, from.y);
	const i = ring.findIndex((p) => p.x === start.x && p.y === start.y);
	if (i < 0) return [];
	const n = Math.max(1, Math.min(6, count));
	const out = [];
	for (let k = 0; k < n; k++) {
		const p = ring[(i + k) % ring.length];
		if (p && inBounds(p.x, p.y, cols, rows)) out.push(p);
	}
	return out;
}
/**
* Walks a straight hex-axis ray from `from` in the exact direction `dir` (one of the 6
* `CUBE_DIRS`), stopping at the first hex `blockedAt` reports true for. `blockedAt` is
* supplied by the caller so this stays free of any live Unit/occupancy state (same
* one-way-dependency reasoning as `buildDecorOverlay`'s injected `cellsOf` in
* ./hexprops) — it composes terrain/decoration passability and live-unit occupancy
* however the caller needs.
*
* Used both for Bull Rush's charge approach (walking toward the target, stopping the
* instant something occupies or blocks a hex) and for its knockback (walking away from
* the attacker along that same `dir`, past the target, to find where a wall-impact
* would land).
*/
function axisWalk(from, dir, cols, rows, maxSteps, blockedAt) {
	const ray = hexRay(from, dir, cols, rows).slice(0, Math.max(0, maxSteps));
	const path = [];
	for (const p of ray) {
		if (blockedAt(p)) return {
			path,
			stoppedAt: p
		};
		path.push(p);
	}
	return {
		path,
		stoppedAt: null
	};
}
/** A slim hex cone out to `radius` rows from `from`, centred on `dir`: rows are 3, 3, 5, 5,
* 7, 7 hexes wide (widening by 2 every other row), so radius 1..6 covers 3, 6, 11, 16, 23, 30
* hexes. Row 1 is the same 3 hexes coneWedge's narrow form gives. Used by Burning Hands'
* level-scaled cone. */
function coneSector(from, dir, radius, cols, rows) {
	const i = CUBE_DIRS.findIndex((d) => d.q === dir.q && d.r === dir.r && d.s === dir.s);
	if (i < 0) return [];
	const left = CUBE_DIRS[(i + 5) % 6];
	const right = CUBE_DIRS[(i + 1) % 6];
	const o = oddrToCube(from.x, from.y);
	const out = [];
	for (let k = 1; k <= radius; k++) {
		const row = [];
		for (let a = k; a >= 0; a--) row.push({
			q: left.q * a + dir.q * (k - a),
			r: left.r * a + dir.r * (k - a),
			s: 0
		});
		for (let a = 1; a <= k; a++) row.push({
			q: right.q * a + dir.q * (k - a),
			r: right.r * a + dir.r * (k - a),
			s: 0
		});
		const half = (3 + 2 * Math.floor((k - 1) / 2) - 1) / 2;
		for (let j = k - half; j <= k + half; j++) {
			const c = row[j];
			if (!c) continue;
			const p = cubeToOddr(o.q + c.q, o.r + c.r);
			if (inBounds(p.x, p.y, cols, rows)) out.push(p);
		}
	}
	return out;
}
function unitSize(unit) {
	return Math.max(1, unit.size || 1);
}
/** The front row of a big creature's footprint — closest to the player, where the feet render (see footprint() below). */
function footprintFrontRow(unit, width = 2) {
	if (unit.footprintOffsets) return unit.footprintOffsets.filter((o) => o.dy === 0).map((o) => ({
		x: unit.x + o.dx,
		y: unit.y
	}));
	const start = unit.x - Math.floor((width - 1) / 2);
	const out = [];
	for (let i = 0; i < width; i++) out.push({
		x: start + i,
		y: unit.y
	});
	return out;
}
function footprint(unit) {
	const s = unitSize(unit);
	if (s <= 1) return [{
		x: unit.x,
		y: unit.y
	}];
	if (unit.footprintOffsets) {
		const shift = unit.y & 1;
		return unit.footprintOffsets.map((o) => ({
			x: unit.x + o.dx + (o.dy & 1 ? shift : 0),
			y: unit.y + o.dy
		}));
	}
	if (s >= 4) {
		const width = unit.footprintW ?? 2;
		const height = unit.footprintH ?? 4;
		const out = [];
		for (let dy = 0; dy > -height; dy--) {
			const rowX = dy % 2 !== 0 ? unit.x - 1 : unit.x;
			out.push(...footprintFrontRow({
				x: rowX,
				y: unit.y + dy
			}, width));
		}
		return out;
	}
	const out = [{
		x: unit.x,
		y: unit.y
	}];
	const want = s <= 2 ? 2 : Math.min(4, s);
	for (const n of hexNeighbors(unit.x, unit.y)) {
		out.push(n);
		if (out.length >= want) break;
	}
	return out;
}
function occupies(unit, x, y) {
	if (!unit.alive) return false;
	return footprint(unit).some((p) => p.x === x && p.y === y);
}
function occupancy(units) {
	const map = /* @__PURE__ */ new Map();
	for (const u of units) {
		if (!u.alive) continue;
		for (const p of footprint(u)) map.set(key(p.x, p.y), u);
	}
	return map;
}
function minRangeTo(ax, ay, unit) {
	let best = 999;
	for (const p of footprint(unit)) {
		const d = hexDist({
			x: ax,
			y: ay
		}, p);
		if (d < best) best = d;
	}
	return best;
}
function inRangeOf(ax, ay, unit, min, max) {
	const m = minRangeTo(ax, ay, unit);
	return m >= min && m <= max;
}
function footprintCost(x, y, size, tiles, cols, rows, occ, self, stop, overlay = EMPTY_OVERLAY) {
	const cells = self.footprintOffsets ? footprintFrontRow({
		x,
		y,
		footprintOffsets: self.footprintOffsets
	}) : footprint({
		x,
		y,
		size
	});
	let cost = 1;
	for (const p of cells) {
		if (!inBounds(p.x, p.y, cols, rows)) return null;
		const terr = hexDef(tiles, cols, p.x, p.y, overlay);
		const fliesOverWater = canTraverseWater(self, terr, overlay, p.x, p.y, cols);
		if (!terr.passable && !fliesOverWater) {
			if (!(terr.id === "barricade" && (self.classId === "troll" || self.classId === "troll2"))) return null;
		}
		const costHere = fliesOverWater ? 1 : terr.id === "barricade" && (self.classId === "troll" || self.classId === "troll2") ? 2 : terr.moveCost;
		if (costHere > cost) cost = costHere;
		const who = occ.get(key(p.x, p.y));
		if (!who || who.id === self.id) continue;
		if (who.side !== self.side) return null;
		if (who.footprintOffsets) return null;
		if (stop) return null;
	}
	return cost;
}
function computeReachable(unit, tiles, cols, rows, units, pruneStopPoints = true, overlay = EMPTY_OVERLAY) {
	const occ = occupancy(units);
	const size = unitSize(unit);
	const result = /* @__PURE__ */ new Map();
	const start = {
		x: unit.x,
		y: unit.y,
		cost: 0,
		parent: null
	};
	result.set(key(unit.x, unit.y), start);
	const queue = [start];
	while (queue.length) {
		queue.sort((a, b) => a.cost - b.cost);
		const cur = queue.shift();
		if (cur.cost >= unit.mov) continue;
		for (const n of hexNeighbors(cur.x, cur.y)) {
			const step = footprintCost(n.x, n.y, size, tiles, cols, rows, occ, unit, false, overlay);
			if (step == null) continue;
			const nextCost = cur.cost + step;
			if (nextCost > unit.mov) continue;
			const nk = key(n.x, n.y);
			const prev = result.get(nk);
			if (prev && prev.cost <= nextCost) continue;
			const cell = {
				x: n.x,
				y: n.y,
				cost: nextCost,
				parent: key(cur.x, cur.y)
			};
			result.set(nk, cell);
			queue.push(cell);
		}
	}
	if (!pruneStopPoints) return result;
	for (const [k, cell] of result) {
		if (k === key(unit.x, unit.y)) continue;
		if (footprintCost(cell.x, cell.y, size, tiles, cols, rows, occ, unit, true, overlay) == null) result.delete(k);
	}
	return result;
}
/** True path-cost distance from `from` to every tile on the map, ignoring who's standing
* where and ignoring the mover's own mov stat (ie. a Dijkstra over terrain alone, ceiling
* cols+rows deep, more than enough for any map this game builds). Used by AI targeting so
* "which reachable cell gets me closer to the player" is judged by real path distance, not
* straight-line hex distance — plain hexDist can't see walls/pillars, so an enemy on the far
* side of an obstacle can end up with every hex-closer cell actually a dead end, greedily
* "closest by hexDist" then never picks a move at all (every real step reads as moving away)
* and the enemy freezes in place turn after turn even though a real route exists. */
function terrainDistanceField(from, tiles, cols, rows, overlay = EMPTY_OVERLAY) {
	const dist = /* @__PURE__ */ new Map();
	dist.set(key(from.x, from.y), 0);
	const buckets = [[{
		x: from.x,
		y: from.y
	}]];
	for (let c = 0; c < buckets.length; c++) {
		const bucket = buckets[c];
		if (!bucket) continue;
		for (const cur of bucket) {
			if ((dist.get(key(cur.x, cur.y)) ?? Infinity) < c) continue;
			for (const n of hexNeighbors(cur.x, cur.y)) {
				if (!inBounds(n.x, n.y, cols, rows)) continue;
				const terr = hexDef(tiles, cols, n.x, n.y, overlay);
				if (!terr.passable) continue;
				const nextCost = c + terr.moveCost;
				const nk = key(n.x, n.y);
				if ((dist.get(nk) ?? Infinity) <= nextCost) continue;
				dist.set(nk, nextCost);
				(buckets[nextCost] ??= []).push({
					x: n.x,
					y: n.y
				});
			}
		}
		buckets[c] = void 0;
	}
	return dist;
}
function reconstructPath(reach, to) {
	const path = [];
	let cur = reach.get(key(to.x, to.y));
	while (cur) {
		path.push({
			x: cur.x,
			y: cur.y
		});
		cur = cur.parent ? reach.get(cur.parent) : void 0;
	}
	path.reverse();
	return path;
}
function attackCellsFrom(x, y, minRange, maxRange, cols, rows) {
	const out = [];
	for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
		const m = hexDist({
			x,
			y
		}, {
			x: gx,
			y: gy
		});
		if (m >= minRange && m <= maxRange) out.push({
			x: gx,
			y: gy
		});
	}
	return out;
}
function inWeaponRange(ax, ay, bx, by, min, max) {
	const m = hexDist({
		x: ax,
		y: ay
	}, {
		x: bx,
		y: by
	});
	return m >= min && m <= max;
}
function canHitFrom(unit, from, foe, tiles, cols, overlay = EMPTY_OVERLAY, fullFootprint = false) {
	const placed = {
		...unit,
		x: from.x,
		y: from.y
	};
	const max = effectiveMaxRange(unit, tileAt(tiles, cols, from.x, from.y));
	let ok = false;
	for (const p of fullFootprint || !placed.footprintOffsets ? footprint(placed) : footprintFrontRow(placed)) if (inRangeOf(p.x, p.y, foe, unit.minRange, max)) {
		ok = true;
		break;
	}
	if (!ok) return false;
	const kind = shotKind(unit);
	if (!kind) return true;
	return clearShot(from, {
		x: foe.x,
		y: foe.y
	}, tiles, cols, kind, overlay);
}
function attackableEnemies(unit, reach, units, tiles, cols, overlay = EMPTY_OVERLAY) {
	const best = /* @__PURE__ */ new Map();
	for (const cell of reach.values()) for (const foe of units) {
		if (!foe.alive || foe.side === unit.side) continue;
		if (!canHitFrom(unit, cell, foe, tiles, cols, overlay)) continue;
		if (!best.has(foe.id)) best.set(foe.id, {
			x: cell.x,
			y: cell.y
		});
	}
	return best;
}
function computeThreat(unit, tiles, cols, rows, units, overlay = EMPTY_OVERLAY) {
	const reach = computeReachable(unit, tiles, cols, rows, units, true, overlay);
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const cell of reach.values()) {
		const max = effectiveMaxRangeAt(unit, tiles, cols, cell.x, cell.y, overlay);
		const kind = shotKind(unit);
		for (const p of attackCellsFrom(cell.x, cell.y, unit.minRange, max, cols, rows)) {
			if (kind && !clearShot(cell, p, tiles, cols, kind, overlay)) continue;
			const k = key(p.x, p.y);
			if (seen.has(k)) continue;
			seen.add(k);
			out.push(p);
		}
	}
	return out;
}
//#endregion
//#region src/game/frost.ts
const FROST = {
	name: "Frost",
	unlockLevel: 5,
	tier: 2,
	baseLength: 2,
	levelsPerHex: 4,
	mul: 1.1,
	faces: 6
};
function frostPower(level) {
	const lv = Math.max(1, Math.min(30, Math.floor(level)));
	return {
		length: 2 + Math.floor(Math.max(0, lv - 5) / 4),
		dice: 1 + Math.floor(Math.max(0, lv - 5) / 6),
		faces: 6,
		mul: FROST.mul
	};
}
function frostCharges(level) {
	return 1 + Number(level >= 5) + Number(level >= 12) + Number(level >= 20);
}
/** One hex wide: adjacent to the caster, extending along one of the six exact hex axes. */
function frostAreaTiles(origin, through, level, cols, rows) {
	const first = hexLine(origin, through)[1];
	const direction = first ? axisDir(origin, first) : null;
	return direction ? hexRay(origin, direction, cols, rows).slice(0, frostPower(level).length) : [];
}
//#endregion
//#region src/game/gfx/ProvokeVFX.ts
const PROVOKE_FX_DURATION = 1.15;
/** Existing 2D WebGL path/glow FX style: a sharp flare of agitation on each enemy. */
function drawProvokeVFX(ctx, x, y, size, elapsed) {
	if (elapsed < 0 || elapsed >= 1.15) return;
	const t = elapsed / PROVOKE_FX_DURATION;
	const fade = Math.min(1, t / .065) * Math.pow(1 - t, .8);
	ctx.save();
	ctx.globalCompositeOperation = "lighter";
	for (let i = 0; i < 7; i++) {
		const side = (i - 3) / 3;
		const phase = t * 4 + i * 1.7;
		const baseX = x + side * size * .34;
		const baseY = y - size * .1;
		const height = size * (1.05 + .23 * Math.sin(i * 3.1));
		const points = [];
		for (let j = 0; j <= 12; j++) {
			const u = j / 12;
			points.push([baseX + Math.sin(u * 5 + phase) * size * .075 * u + side * size * .14 * u, baseY - height * u - t * size * .22]);
		}
		for (let layer = 0; layer < 3; layer++) {
			ctx.beginPath();
			points.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
			ctx.lineWidth = size * [
				.075,
				.028,
				.009
			][layer];
			ctx.strokeStyle = [
				`rgba(235,45,12,${fade * .24})`,
				`rgba(255,94,23,${fade * .68})`,
				`rgba(255,222,157,${fade * .88})`
			][layer];
			ctx.shadowColor = `rgba(255,58,16,${fade})`;
			ctx.shadowBlur = layer === 0 ? size * .2 : 0;
			ctx.stroke();
		}
	}
	ctx.shadowBlur = 0;
	for (let i = 0; i < 28; i++) {
		const delay = i % 7 * .018;
		const age = Math.max(0, t - delay);
		const seed = Math.sin(i * 73.13) * .5 + .5;
		const speed = .65 + seed;
		const sx = x + Math.sin(i * 4.37) * size * (.12 + age * .48);
		const sy = y - size * (.12 + age * speed * 1.9);
		const alpha = fade * Math.max(0, 1 - age / .8);
		ctx.strokeStyle = `rgba(255,${130 + Math.floor(seed * 95)},85,${alpha})`;
		ctx.lineWidth = Math.max(.7, size * .015 * (1 - age));
		ctx.beginPath();
		ctx.moveTo(sx, sy);
		ctx.lineTo(sx - Math.sin(i * 4.37) * size * .025, sy + size * (.035 + seed * .07));
		ctx.stroke();
	}
	ctx.restore();
}
//#endregion
//#region src/game/dexterity.ts
/** Subtract defender DEX from the complete accuracy score, then clamp once. */
function dexAccuracy(baseAccuracy, defenderDex) {
	return Math.max(0, Math.min(100, baseAccuracy - defenderDex));
}
/** Escape uses the escaping character's own DEX, retaining the exact division. */
function dexEscapeChance(runnerDex) {
	return Math.min(100, 60 + runnerDex / 3);
}
//#endregion
//#region src/game/weaponTypes.ts
const WEAPON_TYPES = [
	"sword",
	"axe",
	"mace",
	"hammer",
	"staff",
	"spear",
	"bow",
	"crossbow",
	"dagger"
];
const WEAPON_TYPE_LABELS = {
	sword: "Swords",
	axe: "Axes",
	mace: "Maces",
	hammer: "Hammers",
	staff: "Staves",
	spear: "Spears & Polearms",
	bow: "Bows",
	crossbow: "Crossbows",
	dagger: "Daggers"
};
function weaponSkillAccuracy(value) {
	return 75 + cleanWeaponSkill(value);
}
function weaponSkillDamageMultiplier(value) {
	return (100 + cleanWeaponSkill(value)) / 100;
}
/** Preserve small combat gains; old draft fractions can still be rounded up during migration. */
function cleanWeaponSkill(value, roundLegacyUp = false) {
	if (typeof value !== "number" || !Number.isFinite(value)) return 0;
	const bounded = Math.max(0, Math.min(100, value));
	return roundLegacyUp ? Math.ceil(bounded) : bounded;
}
//#endregion
//#region src/game/weaponSkills.ts
/** Derive the skill pool from the same permissions that govern equipping weapons. */
function weaponTypesForClass(classId) {
	const pool = /* @__PURE__ */ new Set();
	for (const weapon of Object.values(WEAPONS)) if (weapon.usableBy.includes(classId)) pool.add(weapon.weaponType);
	for (const item of Object.values(EQUIPMENT)) if (item.kind === "weapon" && item.weaponType && (!item.usableBy?.length || item.usableBy.includes(classId))) pool.add(item.weaponType);
	return WEAPON_TYPES.filter((type) => pool.has(type));
}
function trainedWeaponSkills(skills, hero, classId) {
	return Object.fromEntries(weaponTypesForClass(classId).map((type) => [type, cleanWeaponSkill(skills?.[hero]?.[`${type}Weapon`])]));
}
function equippedWeaponType(unit, offHand = false) {
	if (offHand) {
		const item = unit.offHandId ? EQUIPMENT[unit.offHandId] : void 0;
		return item?.kind === "weapon" && (!item.usableBy?.length || item.usableBy.includes(unit.classId)) ? item.weaponType : void 0;
	}
	const weapon = unit.weaponId ? WEAPONS[unit.weaponId] : void 0;
	return weapon?.usableBy.includes(unit.classId) ? weapon.weaponType : void 0;
}
function weaponModifiers(unit, type) {
	if (unit.side === "enemy") return {
		accuracy: 90 + (unit.dex ?? 0) + (unit.blessedHitBonusPct ?? 0) * 100,
		damage: 1
	};
	if (!type || !weaponTypesForClass(unit.classId).includes(type)) return {
		accuracy: 100,
		damage: 1
	};
	const value = unit.weaponSkills?.[type] ?? 0;
	return {
		accuracy: weaponSkillAccuracy(value) + (unit.blessedHitBonusPct ?? 0) * 100,
		damage: weaponSkillDamageMultiplier(value)
	};
}
/** Weapon abilities share mastery; ordinary magic, shield bashes and body attacks do not. */
function isWeaponAbility(kind) {
	return [
		"longShot",
		"bloodyShot",
		"multiShot",
		"piercing",
		"piercingThrust",
		"cleave",
		"doubleStrike",
		"sweep",
		"trip",
		"bullRush",
		"executionerStrike"
	].includes(kind ?? "");
}
//#endregion
//#region src/game/affinity.ts
const AFFINITY_HEROES = [
	"Kael",
	"Neera",
	"Voss",
	"Salazar",
	"Aldric",
	"Malrec"
];
function affinityBonus(points) {
	return points >= 90 ? .08 : points >= 50 ? .05 : points >= 25 ? .02 : 0;
}
function affinityPair(a, b) {
	return [a, b].sort().join("|");
}
function affinityScore(scores, a, b) {
	return scores?.[affinityPair(a, b)] ?? 0;
}
function cleanAffinityScores(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
	const result = {};
	for (const [pair, score] of Object.entries(raw)) {
		const heroes = pair.split("|");
		if (heroes.length !== 2 || heroes[0] === heroes[1] || !heroes.every((hero) => AFFINITY_HEROES.includes(hero))) continue;
		if (typeof score === "number" && Number.isFinite(score)) result[affinityPair(heroes[0], heroes[1])] = Math.max(0, Math.min(100, Math.round(score * 10) / 10));
	}
	return result;
}
function changeAffinity(scores, a, b, delta) {
	if (a === b || !Number.isFinite(delta)) return { ...scores };
	return {
		...scores,
		[affinityPair(a, b)]: Math.max(0, Math.min(100, Math.round((affinityScore(scores, a, b) + delta) * 10) / 10))
	};
}
//#endregion
//#region src/game/tacticalGrid.ts
/** Quiet tactical colors shared by the spatial and legacy renderers. */
function tacticalGridStyle(fill) {
	const m = /rgba?\(([^,]+),([^,]+),([^,]+)(?:,([^)]+))?\)/.exec(fill);
	const rgb = m ? `${m[1]},${m[2]},${m[3]}` : "220,230,238";
	const alpha = m?.[4] ? Number(m[4]) : 1;
	if (rgb === "220,226,235" || rgb === "110,0,8") return {
		fill,
		edge: `rgba(${rgb},1)`
	};
	return {
		fill: `rgba(${rgb},${Math.min(.12, alpha * .16)})`,
		edge: `rgba(${rgb},${Math.min(.52, .18 + alpha * .36)})`
	};
}
const GRID_MOVE = "rgba(112,174,220,0.5)";
const GRID_ROUTE = "rgba(220,226,235,1)";
const GRID_ALLY = "rgba(220,226,235,1)";
const GRID_ENEMY = "rgba(231,133,115,1)";
const GRID_ENEMY_TARGET = "rgba(110,0,8,0.85)";
const GRID_ENEMY_GLOW = "rgba(205,24,38,0.78)";
const GRID_OFFHAND_TARGET = "rgba(245,166,74,0.9)";
/** Quiet floor markings v2. Legacy palette and styling above remain available. */
function tacticalGridStyleQuiet(fill) {
	if (fill === "rgba(112,174,220,0.5)") return {
		fill: "rgba(226,221,203,0.035)",
		edge: "rgba(226,221,203,0.26)"
	};
	if (fill === "rgba(110,0,8,0.85)") return {
		fill: "rgba(214,162,102,0.065)",
		edge: "rgba(226,178,119,0.58)"
	};
	if (fill === "rgba(245,166,74,0.9)") return {
		fill: "rgba(245,166,74,0.18)",
		edge: "rgba(255,205,126,0.96)"
	};
	return tacticalGridStyle(fill);
}
//#endregion
//#region src/game/assets.ts
const TILE_VARIANT_COUNT = {
	plains: 43,
	woods: 10,
	ruins: 8,
	water: 23,
	ember: 6,
	hill: 5,
	flame: 4,
	column: 3,
	nave: 10,
	barricade: 1,
	door: 1,
	void: 1,
	snow: 18
};
/** Append-only terrain set: previous saved-map indices keep their exact artwork. */
const HEX_GROUND_001 = {
	water: {
		variant: 22,
		file: "hex-ground-001-agua"
	},
	woods: {
		variant: 9,
		file: "hex-ground-001-bosque"
	},
	ember: {
		variant: 5,
		file: "hex-ground-001-brasa"
	},
	flame: {
		variant: 3,
		file: "hex-ground-001-chama"
	},
	plains: {
		variant: 38,
		file: "hex-ground-001-city"
	},
	hill: {
		variant: 4,
		file: "hex-ground-001-colina"
	},
	column: {
		variant: 2,
		file: "hex-ground-001-coluna"
	},
	nave: {
		variant: 2,
		file: "hex-ground-001-laje"
	},
	ruins: {
		variant: 7,
		file: "hex-ground-001-ruinas"
	},
	snow: {
		variant: 15,
		file: "hex-ground-001-neve"
	}
};
function isHexGroundVariant(id, variant) {
	return id !== "column" && (HEX_GROUND_001[id]?.variant === variant || id === "plains" && variant >= 39 && variant <= 42 || id === "snow" && (variant === 16 || variant === 17) || id === "nave" && variant >= 3 && variant <= 9);
}
Object.keys(TILE_VARIANT_COUNT);
[
	"defaultWarrior",
	"neera",
	"voss",
	"salazar",
	"aldric",
	"malrec",
	"defaultLancer",
	"soldier",
	"brigand",
	"captain",
	"sorcerer",
	"horror",
	"minor-horror-001",
	"Asherah",
	"pikeman",
	"wardog",
	"wardog2",
	"EmberedWraith",
	"troll",
	"troll2",
	"RoccoTheBird",
	"morvenian-wolf",
	"mordavian-wolf",
	"mordavian-wolf-final",
	"punisher",
	"theButcher",
	"birolho",
	"birolho2",
	"birolho3",
	"BirolhoLegs",
	"BirolhoLegs2",
	"familiar",
	"familiar2",
	"familiar3",
	"familiar4",
	"zombieDog",
	"zombie",
	"zombie2",
	"undeadOx",
	"plague-bearing-cattle",
	"swamp-blue-calf",
	"cobalt-blue-deer",
	"big-blue-ox-002",
	"ancient-golem",
	"lancer",
	"sandoval",
	"kaelFinal",
	"kaelEarly",
	"conjurer",
	"cultist-v2",
	"militia-v2",
	"apparition",
	"archerRecruit",
	"mageRecruit",
	"healerRecruit",
	"beberrao",
	"breadLady",
	"brue",
	"crazyLady",
	"mudinho",
	"oldHealer",
	"peasant1",
	"shadyPatron",
	"soupLady",
	"villagerF1",
	"woodsman",
	"travelingMerchant"
].push(...ENCOUNTER_NPC_IDS);
const ART_TOTAL_KEY = "ember.artLoadTotal";
const ART_TOTAL_FALLBACK = 984;
function rememberedArtTotal() {
	try {
		const n = Number(localStorage.getItem(ART_TOTAL_KEY));
		return Number.isFinite(n) && n > 0 ? n : ART_TOTAL_FALLBACK;
	} catch {
		return ART_TOTAL_FALLBACK;
	}
}
rememberedArtTotal();
let artRequested = 0;
let artSettled = 0;
const artListeners = /* @__PURE__ */ new Set();
function artChanged() {
	for (const listener of artListeners) listener();
}
const LOAD_POOL = 8;
let loadActive = 0;
const loadWait = [];
function acquireLoad() {
	if (loadActive < LOAD_POOL) {
		loadActive++;
		return Promise.resolve();
	}
	return new Promise((resolve) => loadWait.push(() => {
		loadActive++;
		resolve();
	}));
}
function releaseLoad() {
	loadActive--;
	const next = loadWait.shift();
	if (next) next();
}
function spriteFrameSrc(id, frame, cacheBust = "") {
	const directory = id === "minor-horror-001" ? "minor-horror-003" : id === "big-blue-ox-002" ? "big-blue-ox-ai-006" : id === "conjurer" ? "conjurer/conjurer-complete-003" : id === "sandoval" ? "sandoval/sandoval-complete-001" : id === "kaelFinal" ? "Kael_Final/kael-final-002" : id === "kaelEarly" ? "kael" : id === "defaultWarrior" ? "kael-v2" : id;
	if (id === "neera" && /^(?:\d+|idle-\d+|atk-(?:left-)?\d+|atk-short-\d+|atk2-(?:left-)?\d+|move-(?:left-)?\d+)$/.test(frame)) return `/game/sprites/neera/neera-v2-001/${/^\d+$/.test(frame) ? `idle-${frame}` : frame}.png?v=neera-v2-003`;
	return `/game/sprites/${directory}/${frame}.png${cacheBust}`;
}
function loadImage(src) {
	artRequested++;
	artChanged();
	return acquireLoad().then(() => new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		const fail = () => reject(/* @__PURE__ */ new Error(`Falha ao carregar ${src}`));
		let settled = false;
		const t = window.setTimeout(() => {
			done();
			fail();
		}, 2e4);
		const done = () => {
			if (settled) return;
			settled = true;
			window.clearTimeout(t);
			releaseLoad();
			artSettled++;
			artChanged();
		};
		img.onload = () => {
			done();
			resolve(img);
		};
		img.onerror = () => {
			done();
			fail();
		};
		img.src = src;
	}));
}
const HERO_IDLE = /* @__PURE__ */ new Set([
	"defaultWarrior",
	"neera",
	"voss",
	"salazar",
	"aldric",
	"defaultLancer",
	"horror",
	"Asherah",
	"familiar",
	"familiar2",
	"ancient-golem",
	"lancer",
	"sandoval",
	"kaelFinal",
	"kaelEarly",
	"conjurer",
	"malrec",
	"archerRecruit",
	"mageRecruit",
	"healerRecruit"
]);
const ATTACK_FRAMES = {
	"minor-horror-001": {
		n: 36,
		bust: "?v=minor-horror-003"
	},
	"big-blue-ox-002": {
		n: 36,
		bust: "?v=big-blue-ox-ai-006"
	},
	"carnivorous-plant-001": {
		n: 36,
		bust: ""
	},
	"sapling-001": {
		n: 36,
		bust: ""
	},
	"swamp-blue-calf": {
		n: 32,
		bust: "?v=big-blue-calf-001"
	},
	"cobalt-blue-deer": {
		n: 4,
		bust: "?v=cobalt-blue-deer-002"
	},
	defaultWarrior: {
		n: 12,
		bust: "?v=kael-v2"
	},
	kaelEarly: {
		n: 12,
		bust: "?v=kael-early"
	},
	neera: {
		n: 36,
		bust: "?v=neera-attack-002"
	},
	voss: {
		n: 4,
		bust: ""
	},
	salazar: {
		n: 4,
		bust: ""
	},
	archerRecruit: {
		n: 4,
		bust: ""
	},
	mageRecruit: {
		n: 4,
		bust: ""
	},
	healerRecruit: {
		n: 4,
		bust: ""
	},
	aldric: {
		n: 36,
		bust: "?v=aldric-final-001"
	},
	malrec: {
		n: 36,
		bust: ""
	},
	defaultLancer: {
		n: 5,
		bust: "?v=sheet2"
	},
	familiar: {
		n: 8,
		bust: "?v=6"
	},
	familiar2: {
		n: 36,
		bust: "?v=familiar2-36"
	},
	"ancient-golem": {
		n: 36,
		bust: ""
	},
	"morvenian-wolf": {
		n: 6,
		bust: ""
	},
	"mordavian-wolf": {
		n: 7,
		bust: ""
	},
	birolho: {
		n: 4,
		bust: ""
	},
	birolho2: {
		n: 4,
		bust: ""
	},
	BirolhoLegs: {
		n: 36,
		bust: ""
	},
	BirolhoLegs2: {
		n: 36,
		bust: ""
	},
	troll2: {
		n: 36,
		bust: ""
	},
	RoccoTheBird: {
		n: 36,
		bust: "?v=f36"
	},
	EmberedWraith: {
		n: 36,
		bust: "?v=f36"
	},
	zombieDog: {
		n: 36,
		bust: "?v=f36"
	},
	wardog2: {
		n: 36,
		bust: "?v=f36"
	},
	zombie: {
		n: 32,
		bust: ""
	},
	zombie2: {
		n: 10,
		bust: ""
	},
	undeadOx: {
		n: 36,
		bust: "?v=ox-36"
	},
	"plague-bearing-cattle": {
		n: 36,
		bust: "?v=plague-cattle-001"
	},
	familiar4: {
		n: 36,
		bust: ""
	},
	"mordavian-wolf-final": {
		n: 36,
		bust: ""
	},
	punisher: {
		n: 4,
		bust: ""
	},
	theButcher: {
		n: 36,
		bust: "?v=the-butcher-001"
	},
	lancer: {
		n: 6,
		bust: "?v=3"
	},
	sandoval: {
		n: 6,
		bust: "?v=sandoval-complete-001"
	},
	kaelFinal: {
		n: 36,
		bust: "?v=kael-final-005-steady"
	},
	conjurer: {
		n: 36,
		bust: "?v=conjurer-complete-003"
	},
	"cultist-v2": {
		n: 36,
		bust: ""
	},
	"militia-v2": {
		n: 36,
		bust: ""
	},
	apparition: {
		n: 60,
		bust: ""
	},
	familiar3: {
		n: 36,
		bust: ""
	}
};
const CAST_FRAMES = {
	"minor-horror-001": {
		n: 36,
		bust: "?v=minor-horror-003"
	},
	"carnivorous-plant-001": {
		n: 36,
		bust: ""
	},
	"sapling-001": {
		n: 36,
		bust: ""
	},
	birolho: {
		n: 3,
		bust: ""
	},
	birolho2: {
		n: 3,
		bust: ""
	},
	birolho3: {
		n: 18,
		bust: ""
	},
	BirolhoLegs: {
		n: 48,
		bust: ""
	},
	BirolhoLegs2: {
		n: 36,
		bust: ""
	},
	neera: {
		n: 36,
		bust: ""
	},
	conjurer: {
		n: 36,
		bust: "?v=conjurer-complete-003"
	},
	malrec: {
		n: 36,
		bust: ""
	},
	aldric: {
		n: 36,
		bust: "?v=aldric-final-001"
	},
	"cultist-v2": {
		n: 36,
		bust: ""
	},
	apparition: {
		n: 36,
		bust: ""
	},
	familiar2: {
		n: 36,
		bust: "?v=familiar2-36"
	},
	RoccoTheBird: {
		n: 36,
		bust: "?v=f36"
	},
	EmberedWraith: {
		n: 36,
		bust: "?v=f36"
	},
	zombieDog: {
		n: 36,
		bust: "?v=f36"
	},
	undeadOx: {
		n: 36,
		bust: "?v=ox-36"
	},
	"plague-bearing-cattle": {
		n: 36,
		bust: "?v=plague-cattle-001"
	},
	"cobalt-blue-deer": {
		n: 4,
		bust: "?v=cobalt-blue-deer-002"
	},
	familiar3: {
		n: 36,
		bust: ""
	}
};
const ATTACK2_FRAMES = {
	"big-blue-ox-002": {
		n: 36,
		bust: "?v=big-blue-ox-ai-006"
	},
	familiar3: {
		n: 36,
		bust: ""
	},
	neera: {
		n: 36,
		bust: "?v=neera-special-001"
	}
};
const ATTACK_SHORT_FRAMES = { neera: {
	n: 36,
	bust: ""
} };
const CAST_DIR_LEFT = ["aldric"];
const COUNTER_FRAMES = { theButcher: {
	n: 36,
	bust: "?v=the-butcher-counter-001"
} };
const WALK_FRAMES = {
	"minor-horror-001": {
		n: 36,
		bust: "?v=minor-horror-003"
	},
	"sapling-001": {
		n: 36,
		bust: ""
	},
	"big-blue-ox-002": {
		n: 36,
		bust: "?v=big-blue-ox-ai-006"
	},
	"swamp-blue-calf": {
		n: 32,
		bust: "?v=big-blue-calf-001"
	},
	"cobalt-blue-deer": {
		n: 4,
		bust: "?v=cobalt-blue-deer-002"
	},
	familiar: {
		n: 8,
		bust: "?v=6"
	},
	familiar2: {
		n: 36,
		bust: "?v=familiar2-36"
	},
	neera: {
		n: 36,
		bust: ""
	},
	"ancient-golem": {
		n: 36,
		bust: ""
	},
	aldric: {
		n: 36,
		bust: "?v=aldric-final-001"
	},
	defaultLancer: {
		n: 6,
		bust: "?v=sheet2"
	},
	lancer: {
		n: 6,
		bust: "?v=3"
	},
	sandoval: {
		n: 6,
		bust: "?v=sandoval-complete-001"
	},
	kaelFinal: {
		n: 36,
		bust: "?v=kael-final-002"
	},
	conjurer: {
		n: 36,
		bust: "?v=conjurer-complete-003"
	},
	malrec: {
		n: 36,
		bust: "?v=malrec-walk-002"
	},
	birolho3: {
		n: 12,
		bust: ""
	},
	BirolhoLegs: {
		n: 36,
		bust: ""
	},
	BirolhoLegs2: {
		n: 36,
		bust: ""
	},
	troll2: {
		n: 36,
		bust: ""
	},
	RoccoTheBird: {
		n: 36,
		bust: "?v=f36"
	},
	EmberedWraith: {
		n: 36,
		bust: "?v=f36"
	},
	zombieDog: {
		n: 36,
		bust: "?v=f36"
	},
	wardog2: {
		n: 36,
		bust: "?v=f36"
	},
	zombie: {
		n: 32,
		bust: ""
	},
	zombie2: {
		n: 12,
		bust: ""
	},
	undeadOx: {
		n: 36,
		bust: "?v=ox-36"
	},
	"plague-bearing-cattle": {
		n: 36,
		bust: "?v=plague-cattle-001"
	},
	familiar4: {
		n: 36,
		bust: ""
	},
	"mordavian-wolf-final": {
		n: 36,
		bust: ""
	},
	theButcher: {
		n: 36,
		bust: "?v=the-butcher-001"
	},
	"cultist-v2": {
		n: 36,
		bust: ""
	},
	"militia-v2": {
		n: 36,
		bust: ""
	},
	apparition: {
		n: 36,
		bust: ""
	},
	familiar3: {
		n: 36,
		bust: ""
	},
	"morvenian-wolf": {
		n: 6,
		bust: ""
	},
	"mordavian-wolf": {
		n: 8,
		bust: ""
	}
};
const DIR_LEFT = [
	"aldric",
	"defaultLancer",
	"lancer",
	"sandoval"
];
const HIT_FRAMES = {
	"big-blue-ox-002": {
		n: 36,
		bust: "?v=big-blue-ox-ai-006"
	},
	"carnivorous-plant-001": {
		n: 36,
		bust: ""
	},
	"sapling-001": {
		n: 36,
		bust: ""
	},
	"mordavian-wolf-final": {
		n: 32,
		bust: ""
	},
	undeadOx: {
		n: 36,
		bust: "?v=ox-36"
	},
	zombieDog: {
		n: 36,
		bust: "?v=zd-hit-death-36"
	},
	"militia-v2": {
		n: 36,
		bust: ""
	},
	apparition: {
		n: 36,
		bust: ""
	}
};
const HIT2_FRAMES = { apparition: {
	n: 36,
	bust: ""
} };
const DEATH_FRAMES = {
	"minor-horror-001": {
		n: 36,
		bust: "?v=minor-horror-003"
	},
	"big-blue-ox-002": {
		n: 36,
		bust: "?v=big-blue-ox-ai-006"
	},
	"carnivorous-plant-001": {
		n: 36,
		bust: ""
	},
	"sapling-001": {
		n: 36,
		bust: ""
	},
	"swamp-blue-calf": {
		n: 32,
		bust: "?v=big-blue-calf-001"
	},
	"cobalt-blue-deer": {
		n: 4,
		bust: "?v=cobalt-blue-deer-002"
	},
	"mordavian-wolf-final": {
		n: 32,
		bust: ""
	},
	wardog2: {
		n: 36,
		bust: "?v=f36"
	},
	EmberedWraith: {
		n: 36,
		bust: "?v=f36"
	},
	zombieDog: {
		n: 36,
		bust: "?v=zd-hit-death-36"
	},
	undeadOx: {
		n: 36,
		bust: "?v=ox-36"
	},
	"plague-bearing-cattle": {
		n: 36,
		bust: "?v=plague-cattle-001"
	},
	"militia-v2": {
		n: 36,
		bust: ""
	},
	apparition: {
		n: 36,
		bust: ""
	}
};
const DEATH2_FRAMES = { zombieDog: {
	n: 36,
	bust: "?v=f36"
} };
const WALK_UP_DOWN_FRAMES = {
	BirolhoLegs: {
		up: 36,
		down: 36,
		bust: ""
	},
	"mordavian-wolf-final": {
		up: 36,
		down: 36,
		bust: ""
	},
	troll2: {
		up: 36,
		down: 36,
		bust: ""
	}
};
const WALK2_FRAMES = { familiar3: {
	n: 36,
	bust: ""
} };
/** Loads every pool one sprite contributes to GameArt (idle, attack, cast, walk, ...) — the
* same files, frame counts and cache-busts loadGameArt used to load for every sprite up front. */
async function loadSpritePools(id) {
	const cut = (n, frame, bust) => Promise.all(Array.from({ length: n }, (_, i) => loadImage(spriteFrameSrc(id, frame(i + 1), bust))));
	const pools = {};
	const jobs = [];
	const put = (key, job) => {
		jobs.push(job.then((value) => {
			pools[key] = value;
		}));
	};
	put("sprites", cut(id === "RoccoTheBird" || id === "wardog2" || id === "EmberedWraith" || id === "zombieDog" ? 36 : id === "undeadOx" || id === "plague-bearing-cattle" ? 36 : id === "minor-horror-001" ? 36 : id === "big-blue-ox-002" ? 36 : id === "carnivorous-plant-001" ? 36 : id === "sapling-001" ? 36 : id === "zombie2" ? 11 : id === "neera" || id === "conjurer" || id === "kaelFinal" || id === "aldric" || id === "cultist-v2" || id === "militia-v2" || id === "apparition" || id === "malrec" || id === "familiar3" || id === "familiar2" ? 36 : id === "sandoval" || id === "mordavian-wolf" ? 8 : id === "birolho2" ? 18 : id === "birolho3" ? 12 : id === "zombie" ? 32 : id === "BirolhoLegs" || id === "BirolhoLegs2" || id === "troll2" || id === "ancient-golem" || id === "familiar4" || id === "mordavian-wolf-final" ? 36 : HERO_IDLE.has(id) ? 12 : 4, (i) => id === "conjurer" ? `talk-${i}` : `${i}`, id === "neera" ? "?v=neera-idle-001" : id === "RoccoTheBird" || id === "wardog2" || id === "EmberedWraith" || id === "zombieDog" ? "?v=f36" : id === "undeadOx" ? "?v=ox-36-tail2" : id === "plague-bearing-cattle" ? "?v=plague-cattle-001" : id === "minor-horror-001" ? "?v=minor-horror-003" : id === "big-blue-ox-002" ? "?v=big-blue-ox-ai-006" : id === "troll" ? "?v=11" : id === "Asherah" ? "?v=3" : id === "familiar" ? "?v=6" : id === "aldric" ? "?v=aldric-final-001" : id === "defaultLancer" ? "?v=sheet2" : id === "lancer" ? "?v=3" : id === "sandoval" ? "?v=sandoval-complete-001" : id === "kaelFinal" ? "?v=kael-final-002" : id === "kaelEarly" ? "?v=kael-early" : id === "defaultWarrior" ? "?v=kael-v2" : id === "conjurer" ? "?v=conjurer-complete-003" : id === "familiar2" ? "?v=familiar2-36" : ""));
	const atk = ATTACK_FRAMES[id];
	if (atk) put("attacks", cut(atk.n, (i) => `atk-${i}`, atk.bust));
	const atk2 = ATTACK2_FRAMES[id];
	if (atk2) put("attacks2", cut(atk2.n, (i) => `atk2-${i}`, atk2.bust));
	if (id === "neera" && atk2) put("attacks2Left", cut(atk2.n, (i) => `atk2-left-${i}`, atk2.bust));
	const short = ATTACK_SHORT_FRAMES[id];
	if (short) put("attacksShort", cut(short.n, (i) => `atk-short-${i}`, short.bust));
	const cast = CAST_FRAMES[id];
	if (cast) put("casts", cut(cast.n, (i) => id === "conjurer" ? `${i}` : `cast-${i}`, cast.bust));
	if (cast && CAST_DIR_LEFT.includes(id)) put("castsLeft", cut(cast.n, (i) => `cast-left-${i}`, cast.bust));
	const counter = COUNTER_FRAMES[id];
	if (counter) put("counters", cut(counter.n, (i) => `counter-${i}`, counter.bust));
	const hit = HIT_FRAMES[id];
	if (hit) put("hits", cut(hit.n, (i) => `hit-${i}`, hit.bust));
	const hit2 = HIT2_FRAMES[id];
	if (hit2) put("hits2", cut(hit2.n, (i) => `hit2-${i}`, hit2.bust));
	const death = DEATH_FRAMES[id];
	if (death) put("deaths", cut(death.n, (i) => `death-${i}`, death.bust));
	const death2 = DEATH2_FRAMES[id];
	if (death2) put("deaths2", cut(death2.n, (i) => `death2-${i}`, death2.bust));
	const walk = WALK_FRAMES[id];
	if (walk) put("walks", cut(walk.n, (i) => id === "cobalt-blue-deer" ? `move-left-${i}` : `move-${i}`, walk.bust));
	if (DIR_LEFT.includes(id)) {
		const walkN = WALK_FRAMES[id]?.n ?? 6;
		const atkN = ATTACK_FRAMES[id]?.n ?? 5;
		const bust = id === "lancer" ? "?v=3" : id === "sandoval" ? "?v=sandoval-complete-001" : id === "aldric" ? "?v=aldric-final-001" : "?v=sheet2";
		put("walksLeft", cut(walkN, (i) => `move-left-${i}`, bust));
		put("attacksLeft", cut(atkN, (i) => `atk-left-${i}`, bust));
	}
	if (id === "neera" && atk) put("attacksLeft", cut(atk.n, (i) => `atk-left-${i}`, atk.bust));
	if (id === "neera" && walk) put("walksLeft", cut(walk.n, (i) => `move-left-${i}`, walk.bust));
	if (walk && (id === "theButcher" || id === "cultist-v2" || id === "militia-v2" || id === "familiar2" || id === "familiar3")) put("walksLeft", cut(walk.n, (i) => `move-left-${i}`, walk.bust));
	if (id === "cobalt-blue-deer" && walk) put("walksLeft", cut(walk.n, (i) => `move-${i}`, walk.bust));
	if (id === "morvenian-wolf") put("walksLeft", cut(7, (i) => `move-left-${i}`, ""));
	if (id === "defaultWarrior") put("idles", Promise.all(Array.from({ length: 12 }, (_, i) => loadImage(`/game/sprites/kael-v2/stand-${i + 1}.png?v=kael-v2`))));
	if (id === "neera") put("idles", cut(36, (i) => `idle-${i}`, "?v=neera-idle-001"));
	if (id === "kaelEarly") put("idles", Promise.all(Array.from({ length: 36 }, (_, i) => loadImage(`/game/sprites/kael/stand-${i + 1}.png?v=kael-early`))));
	if (id === "malrec") put("idles2", Promise.all(Array.from({ length: 36 }, (_, i) => loadImage(`/game/sprites/malrec/idle2-${i + 1}.png`))));
	const upDown = WALK_UP_DOWN_FRAMES[id];
	if (upDown?.up) put("walksUp", cut(upDown.up, (i) => `move-up-${i}`, upDown.bust));
	if (upDown?.down) put("walksDown", cut(upDown.down, (i) => `move-down-${i}`, upDown.bust));
	const walk2 = WALK2_FRAMES[id];
	if (walk2) {
		put("walks2", cut(walk2.n, (i) => `move2-${i}`, walk2.bust));
		put("walksLeft2", cut(walk2.n, (i) => `move2-left-${i}`, walk2.bust));
	}
	const dirs = (front, back, side) => Promise.all([
		loadImage(front),
		loadImage(back),
		loadImage(side)
	]).then(([f, b, s]) => ({
		front: f,
		back: b,
		side: s
	}));
	if (id === "kaelEarly") put("walkDirs", dirs("/game/sprites/kael/walk-front.png?v=kael-early", "/game/sprites/kael/walk-back.png?v=kael-early", "/game/sprites/kael/walk-side.png?v=kael-early"));
	if (id === "birolho") put("walkDirs", dirs("/game/sprites/birolho/1.png", "/game/sprites/birolho/back.png", "/game/sprites/birolho/1.png"));
	if (id === "birolho2") put("walkDirs", dirs("/game/sprites/birolho2/1.png", "/game/sprites/birolho2/back.png", "/game/sprites/birolho2/1.png"));
	if (id === "punisher") put("walkDirs", dirs("/game/sprites/punisher/front.png", "/game/sprites/punisher/back.png", "/game/sprites/punisher/front.png"));
	await Promise.all(jobs);
	return pools;
}
const spriteLoads = /* @__PURE__ */ new WeakMap();
/** Loads one sprite's art into `art`, once — repeat calls share the same request. Every pool
* lands at the same moment, so a unit never plays a half-loaded set; until then its
* `art.sprites` entry is simply absent. A failed load is logged and not retried. */
function requestSpriteArt(art, id) {
	let loads = spriteLoads.get(art);
	if (!loads) spriteLoads.set(art, loads = /* @__PURE__ */ new Map());
	const pending = loads.get(id);
	if (pending) return pending;
	const job = loadSpritePools(id).then((pools) => {
		for (const [key, value] of Object.entries(pools)) art[key][id] = value;
	}, (err) => console.error(`[art] sprite ${id} failed to load`, err));
	loads.set(id, job);
	return job;
}
//#endregion
//#region src/game/hexGround.ts
/** Draw a continuous material in board coordinates, clipped by the caller's hex.
* Mirroring each repeat gives identical boundary pixels without modifying the source art.
* Camera motion changes only the screen offset, never the material's board position. */
function drawHexGround(ctx, image, cx, cy, worldX, worldY, radius) {
	const period = radius * 8;
	ctx.save();
	ctx.translate(cx - worldX, cy - worldY);
	const left = Math.floor((worldX - radius) / period);
	const right = Math.floor((worldX + radius) / period);
	const top = Math.floor((worldY - radius) / period);
	const bottom = Math.floor((worldY + radius) / period);
	for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
		const flipX = Math.abs(x % 2) === 1;
		const flipY = Math.abs(y % 2) === 1;
		ctx.save();
		ctx.translate((x + Number(flipX)) * period, (y + Number(flipY)) * period);
		ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
		drawGroundTexture(ctx, image, 0, 0, period, period);
		ctx.restore();
	}
	ctx.restore();
}
/** Match the border filler: enlarge the middle half of every ground texture. */
const GROUND_TEXTURE_SPAN = .5;
const GROUND_TEXTURE_INSET = .5 / 2;
const croppedGroundTextures = /* @__PURE__ */ new WeakMap();
function croppedGroundTexture(image) {
	let cropped = croppedGroundTextures.get(image);
	if (cropped) return cropped;
	if (!image.complete || !image.naturalWidth) return image;
	cropped = document.createElement("canvas");
	cropped.width = Math.max(1, Math.round(image.naturalWidth * GROUND_TEXTURE_SPAN));
	cropped.height = Math.max(1, Math.round(image.naturalHeight * GROUND_TEXTURE_SPAN));
	cropped.getContext("2d").drawImage(image, image.naturalWidth * GROUND_TEXTURE_INSET, image.naturalHeight * GROUND_TEXTURE_INSET, image.naturalWidth * GROUND_TEXTURE_SPAN, image.naturalHeight * GROUND_TEXTURE_SPAN, 0, 0, cropped.width, cropped.height);
	croppedGroundTextures.set(image, cropped);
	return cropped;
}
function drawGroundTexture(ctx, image, x, y, width, height) {
	if (!(ctx instanceof CanvasRenderingContext2D)) {
		ctx.drawImage(croppedGroundTexture(image), x, y, width, height);
		return;
	}
	ctx.drawImage(image, image.naturalWidth * GROUND_TEXTURE_INSET, image.naturalHeight * GROUND_TEXTURE_INSET, image.naturalWidth * GROUND_TEXTURE_SPAN, image.naturalHeight * GROUND_TEXTURE_SPAN, x, y, width, height);
}
//#endregion
//#region src/game/vauBackdrop.ts
/** Shared world-space framing of O Vau's painted river and camera limits. */
function vauBackdropBounds(tile, cols, viewW, viewH, imageRatio) {
	const boardWidth = tile * Math.sqrt(3) * cols;
	const width = Math.max(boardWidth * 1.35, viewW, viewH * imageRatio);
	const height = width / imageRatio;
	const centerY = tile * 11.65 - .06 * height;
	return {
		width,
		height,
		left: (boardWidth - width) / 2,
		top: centerY - height / 2
	};
}
//#endregion
//#region src/game/mapFloor.ts
/** Only a filled rectangular board gets an orthogonal perimeter. */
function hasSquareMapBorder(tiles, cols, rows) {
	let minX = cols, minY = rows, maxX = -1, maxY = -1, count = 0;
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
		if (!tiles[y * cols + x] || tiles[y * cols + x] === "void") continue;
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
		count++;
	}
	return count > 0 && count === (maxX - minX + 1) * (maxY - minY + 1);
}
const floorRectParts = (rect) => rect.parts ?? [rect];
/** Tile-normalized rectangular floor, ending under the outside face of authored walls. */
function mapFloorRects(tiles, cols, rows, decorations) {
	const rects = /* @__PURE__ */ new Map();
	const width = Math.sqrt(3);
	const floor = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && tiles[y * cols + x] !== "void";
	const walls = new Set(decorations.filter((p) => DECORATIONS[p.id]?.model3d === "wall" || DECORATIONS[p.id]?.model3d === "secretDoor").map((p) => `${p.x},${p.y}`));
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (floor(x, y)) rects.set(y * cols + x, {
		minX: x * width,
		maxX: (x + 1) * width,
		minY: y * 1.5,
		maxY: (y + 1) * 1.5
	});
	for (const placement of decorations) {
		const def = DECORATIONS[placement.id];
		if (def?.model3d !== "wall" && def?.model3d !== "secretDoor" && placement.id !== "watchtower-stone-open-door-2hex") continue;
		for (const cell of placedFootprint(placement)) {
			const p = {
				x: placement.x + cell.dx,
				y: placement.y + cell.dy
			};
			const rect = rects.get(p.y * cols + p.x);
			if (!rect) continue;
			const half = .16 * (def.wallThicknessScale ?? 1);
			const cx = (p.x + .5) * width, cy = (p.y + .5) * 1.5;
			if (!floor(p.x - 1, p.y)) rect.minX = Math.max(rect.minX, cx - half);
			if (!floor(p.x + 1, p.y)) rect.maxX = Math.min(rect.maxX, cx + half);
			if (!floor(p.x, p.y - 1)) rect.minY = Math.max(rect.minY, cy - half);
			if (!floor(p.x, p.y + 1)) rect.maxY = Math.min(rect.maxY, cy + half);
			for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
				if (floor(p.x + dx, p.y + dy) || !walls.has(`${p.x + dx},${p.y}`) || !walls.has(`${p.x},${p.y + dy}`)) continue;
				const cutX = cx + dx * half, cutY = cy + dy * half;
				rect.parts = floorRectParts(rect).flatMap((r) => {
					return [{
						minX: dx < 0 ? Math.max(r.minX, cutX) : r.minX,
						maxX: dx > 0 ? Math.min(r.maxX, cutX) : r.maxX,
						minY: r.minY,
						maxY: r.maxY
					}, {
						minX: dx > 0 ? Math.max(r.minX, cutX) : r.minX,
						maxX: dx < 0 ? Math.min(r.maxX, cutX) : r.maxX,
						minY: dy < 0 ? Math.max(r.minY, cutY) : r.minY,
						maxY: dy > 0 ? Math.min(r.maxY, cutY) : r.maxY
					}].filter((p) => p.maxX > p.minX && p.maxY > p.minY);
				});
			}
		}
	}
	return rects;
}
//#endregion
//#region src/game/watchtowerDungeon.ts
const WATCHTOWER_FLOORS = {
	"watchtower-gate-floor": 0,
	"watchtower-barracks": 1,
	"watchtower-command": 2,
	"watchtower-beacon": 3,
	"watchtower-undercroft": -1,
	"watchtower-prison": -2
};
/** Placing an entrance replaces the wall records across both of its cells. */
function removeWallsUnderWatchtowerEntrances(placements) {
	const openings = new Set(placements.filter((p) => p.id === "watchtower-stone-open-door-2hex").flatMap((p) => placedFootprint(p).map((f) => `${p.x + f.dx},${p.y + f.dy}`)));
	return placements.filter((p) => DECORATIONS[p.id]?.model3d !== "wall" || !placedFootprint(p).some((f) => openings.has(`${p.x + f.dx},${p.y + f.dy}`)));
}
/** Complete the existing floor boundary, including older activated editor drafts. */
function closeWatchtowerWalls(id, tiles, cols, rows, placements) {
	if (!id.startsWith("watchtower-")) return placements;
	const floor = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && tiles[y * cols + x] !== "void";
	const boundary = (x, y) => floor(x, y) && (!floor(x - 1, y) || !floor(x + 1, y) || !floor(x, y - 1) || !floor(x, y + 1));
	let result = placements.filter((p) => !p.waypointStairs && (id === "watchtower-gate-floor" || !DECORATIONS[p.id]?.exitKind || DECORATIONS[p.id]?.exitKind === "connector")).map((p) => {
		const floors = WATCHTOWER_FLOORS;
		const connectorDirection = p.connectorDirection ?? (p.id === "floor-connector" && p.targetMapId && floors[p.targetMapId] != null && floors[id] != null ? floors[p.targetMapId] > floors[id] ? "up" : "down" : void 0);
		return {
			...p,
			connectorDirection,
			id: p.id === "city-stone-banner-wall" ? "wall-3d-dungeon" : p.id
		};
	}).filter((p, i, all) => DECORATIONS[p.id]?.model3d !== "wall" || all.findIndex((a) => DECORATIONS[a.id]?.model3d === "wall" && a.x === p.x && a.y === p.y) === i);
	const cellsOf = (p) => placedFootprint(p).map((c) => ({
		x: p.x + c.dx,
		y: p.y + c.dy
	}));
	const entranceCells = new Set(result.filter((p) => p.id === "watchtower-stone-open-door-2hex").flatMap((p) => cellsOf(p).map((c) => `${c.x},${c.y}`)));
	result = removeWallsUnderWatchtowerEntrances(result);
	const occupied = new Set(result.filter((p) => DECORATIONS[p.id]?.model3d).map((p) => `${p.x},${p.y}`));
	for (const cell of entranceCells) occupied.add(cell);
	const wallId = result.find((p) => DECORATIONS[p.id]?.model3d === "wall")?.id ?? "wall-3d-dungeon";
	for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (boundary(x, y) && !occupied.has(`${x},${y}`)) {
		result.push({
			id: wallId,
			x,
			y
		});
		occupied.add(`${x},${y}`);
	}
	const degree = (x, y) => [
		[x - 1, y],
		[x + 1, y],
		[x, y - 1],
		[x, y + 1]
	].filter(([a, b]) => occupied.has(`${a},${b}`)).length;
	const ends = result.filter((p) => DECORATIONS[p.id]?.model3d === "wall" && degree(p.x, p.y) < 2);
	for (const a of ends) for (const b of ends) {
		if (Math.abs(a.x - b.x) !== 1 || Math.abs(a.y - b.y) !== 1) continue;
		const join = [{
			x: a.x,
			y: b.y
		}, {
			x: b.x,
			y: a.y
		}].find((p) => floor(p.x, p.y) && !occupied.has(`${p.x},${p.y}`));
		if (join) {
			result.push({
				id: wallId,
				...join
			});
			occupied.add(`${join.x},${join.y}`);
		}
	}
	for (const p of result.filter((p) => DECORATIONS[p.id]?.exitKind === "connector")) {
		const stairId = floorConnectorDirection(p) === "up" ? "stone-stairs-up-001" : "stone-stairs-down-001";
		Object.assign(p, {
			id: stairId,
			waypointStairs: void 0,
			connectorDirection: floorConnectorDirection(p)
		});
	}
	return result;
}
//#endregion
//#region src/game/combat.ts
/** Two adjacent hexes behind the defender's board heading, independent of camera rotation. */
function isRearAttack(attacker, defender) {
	if (!Number.isFinite(attacker.x) || !Number.isFinite(defender.x) || hexDist(attacker, defender) !== 1) return false;
	const dx = defender.faceDx ?? defender.facing ?? 1;
	const dy = defender.faceDy ?? 0;
	if (Math.hypot(dx, dy) < 1e-6) return false;
	const rear = Math.atan2(-dy, -dx);
	const originX = defender.x + (defender.y & 1) * .5;
	return hexNeighbors(defender.x, defender.y).map((cell) => {
		const angle = Math.atan2((cell.y - defender.y) * Math.sqrt(3) / 2, cell.x + (cell.y & 1) * .5 - originX);
		return {
			cell,
			distance: Math.abs(Math.atan2(Math.sin(angle - rear), Math.cos(angle - rear)))
		};
	}).sort((a, b) => Math.round((a.distance - b.distance) * 1e9) || a.cell.y - b.cell.y || a.cell.x - b.cell.x).slice(0, 2).some(({ cell }) => cell.x === attacker.x && cell.y === attacker.y);
}
/** What a unit's own stat contributes to a hit: half of ATK, or half of MAG for a caster.
*
* Halved because the stat used to be the whole story — a point of ATK was a point of
* damage, so levels drowned out what a unit was carrying. At half weight the weapon and
* spell dice decide as much as the stat does. Rounded down; there are no half points. */
function powerOf(unit) {
	return Math.floor((unit.mag > 0 ? unit.mag : unit.atk) / 2);
}
/** Physical attacks subtract half DEF. Elemental resistances protect against magic. */
function protOf(attacker, defender) {
	return Math.floor((attacker.mag > 0 ? 0 : defender.def) / 2);
}
/** High ground's attack bonus, as a fraction of the attacker's own ATK (or MAG for a
* caster) instead of the old flat +2 — so it keeps mattering as a character grows instead
* of shrinking to nothing at high levels. The range bonus (effectiveMaxRange /
* effectiveMaxRangeAt) is untouched: still a flat +1 for a ranged weapon. */
const HIGH_GROUND_ATK_PCT = .1;
function terrainBonus(attacker, defender, attTile, defTile) {
	const attT = TERRAIN[attTile];
	const defT = TERRAIN[defTile];
	let def = defT.def;
	if (isProjectile(attacker) && defT.cover) def += defT.cover;
	return {
		atk: attT.height ? Math.round((attacker.mag > 0 ? attacker.mag : attacker.atk) * HIGH_GROUND_ATK_PCT) : attT.atk,
		def
	};
}
/** A weapon tuned for one specific class (a staff named after a school of magic, say) hits
* 10% harder in that class's own hands — everyone else in its usableBy pool can still wield
* it at no penalty, just without this. */
const WEAPON_CLASS_BONUS_MUL = 1.1;
function weaponClassBonusMul(attacker) {
	return (attacker.weaponId ? WEAPONS[attacker.weaponId] : null)?.bonusClass === attacker.classId ? WEAPON_CLASS_BONUS_MUL : 1;
}
function rollDamage(attacker, defender, attTile, defTile, rng, useWeaponSkill = true) {
	const b = terrainBonus(attacker, defender, attTile, defTile);
	const rear = useWeaponSkill && isRearAttack(attacker, defender);
	const mastery = useWeaponSkill ? weaponModifiers(attacker, equippedWeaponType(attacker)) : {
		accuracy: 100,
		damage: 1
	};
	const definition = attacker.weaponId ? WEAPONS[attacker.weaponId] : void 0;
	const weapon = definition ? rollDice(definition.dice, definition.faces, 0, rng) * mastery.damage + definition.bonus + attacker.weaponEnh : 0;
	const hitChance = useWeaponSkill ? dexAccuracy(mastery.accuracy + (rear ? 10 : 0), defender.dex ?? 0) : 100;
	const raw = powerOf(attacker) + weapon + b.atk - protOf(attacker, defender) - b.def;
	const preCritDmg = Math.max(1, Math.floor(Math.max(1, raw) * weaponClassBonusMul(attacker) * (rear ? 1.1 : 1)));
	let dmg = preCritDmg;
	const crit = rng() < .08;
	if (crit) dmg = Math.max(1, Math.floor(dmg * 1.5));
	return {
		dmg,
		crit,
		landed: hitChance >= 100 || rng() * 100 < hitChance,
		hitChance,
		preCritDmg
	};
}
/** Same formula as rollDamage, but rolling explicit dice instead of the attacker's
* equipped main-hand weapon — for an off-hand weapon attack, whose dice come from the
* EquipmentDef in the offHand slot rather than WEAPONS[attacker.weaponId]. */
function rollDamageCustom(attacker, defender, attTile, defTile, dice, faces, bonus, rng, useWeaponSkill = true) {
	const b = terrainBonus(attacker, defender, attTile, defTile);
	const rear = useWeaponSkill && isRearAttack(attacker, defender);
	const mastery = useWeaponSkill ? weaponModifiers(attacker, equippedWeaponType(attacker, true)) : {
		accuracy: 100,
		damage: 1
	};
	const weapon = rollDice(dice, faces, 0, rng) * mastery.damage + bonus;
	const hitChance = useWeaponSkill ? dexAccuracy(mastery.accuracy + (rear ? 10 : 0), defender.dex ?? 0) : 100;
	const raw = powerOf(attacker) + weapon + b.atk - protOf(attacker, defender) - b.def;
	const preCritDmg = Math.max(1, Math.floor(Math.max(1, raw) * (rear ? 1.1 : 1)));
	let dmg = preCritDmg;
	const crit = rng() < .08;
	if (crit) dmg = Math.max(1, Math.floor(dmg * 1.5));
	return {
		dmg,
		crit,
		landed: hitChance >= 100 || rng() * 100 < hitChance,
		hitChance,
		preCritDmg
	};
}
function previewDamage(attacker, defender, attTile, defTile, offHand = false, useWeaponSkill = true) {
	const b = terrainBonus(attacker, defender, attTile, defTile);
	const rear = useWeaponSkill && isRearAttack(attacker, defender);
	const item = offHand && attacker.offHandId ? EQUIPMENT[attacker.offHandId] : void 0;
	const mastery = useWeaponSkill ? weaponModifiers(attacker, equippedWeaponType(attacker, offHand)) : {
		accuracy: 100,
		damage: 1
	};
	const definition = attacker.weaponId ? WEAPONS[attacker.weaponId] : void 0;
	const weapon = offHand ? item?.kind === "weapon" ? (item.dice ?? 1) * ((item.faces ?? 4) + 1) / 2 * mastery.damage + (item.bonus ?? 0) : 0 : definition ? definition.dice * (definition.faces + 1) / 2 * mastery.damage + definition.bonus + attacker.weaponEnh : 0;
	const hitChance = useWeaponSkill ? dexAccuracy(mastery.accuracy + (rear ? 10 : 0), defender.dex ?? 0) : 100;
	const raw = powerOf(attacker) + weapon + b.atk - protOf(attacker, defender) - b.def;
	return {
		dmg: Math.max(1, Math.floor(Math.max(1, raw) * (offHand ? 1 : weaponClassBonusMul(attacker)) * (rear ? 1.1 : 1))),
		hitChance
	};
}
function canCounter(attacker, defender, from, tiles, cols) {
	if (!defender.alive) return false;
	const target = {
		...attacker,
		x: from.x,
		y: from.y
	};
	if (canHitFrom(defender, {
		x: defender.x,
		y: defender.y
	}, target, tiles, cols, void 0, true)) return true;
	const offHand = defender.offHandId ? EQUIPMENT[defender.offHandId] : null;
	if (offHand?.kind !== "weapon") return false;
	return canHitFrom({
		...defender,
		minRange: offHand.minRange ?? 1,
		maxRange: offHand.maxRange ?? 1
	}, {
		x: defender.x,
		y: defender.y
	}, target, tiles, cols, void 0, true);
}
function makeForecast(attacker, defender, attTile, defTile, tiles, cols, offHand = false, useWeaponSkill = true) {
	const out = previewDamage(attacker, defender, attTile, defTile, offHand, useWeaponSkill);
	const counter = canCounter(attacker, defender, {
		x: attacker.x,
		y: attacker.y
	}, tiles, cols);
	const counterWeapon = defender.offHandId ? EQUIPMENT[defender.offHandId] : void 0;
	const daggerCounter = counterWeapon?.kind === "weapon" && hexDist(defender, attacker) <= (counterWeapon.maxRange ?? 1);
	const facingAttacker = {
		...attacker,
		faceDx: defender.x + (defender.y & 1) * .5 - attacker.x - (attacker.y & 1) * .5,
		faceDy: (defender.y - attacker.y) * Math.sqrt(3) / 2
	};
	const back = counter ? previewDamage(defender, facingAttacker, defTile, attTile, daggerCounter) : null;
	return {
		attacker: attacker.id,
		defender: defender.id,
		dmgOut: out.dmg,
		dmgBack: back?.dmg ?? 0,
		hitOut: out.hitChance,
		hitBack: back?.hitChance ?? 0,
		canCounter: counter,
		critOut: false,
		kill: out.dmg >= defender.hp
	};
}
function mulberry32(seed) {
	let a = seed | 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
//#endregion
//#region src/game/poison.ts
/** Every poison tier: the dice it rolls each tick, and how many points it strips off the
* target's Poison Resistance (Resistência a Veneno skill) before anything else. */
const POISON_TIERS = {
	lesser: {
		name: "Veneno Menor",
		dice: 1,
		faces: 4,
		penalty: 0
	},
	poison: {
		name: "Veneno",
		dice: 1,
		faces: 10,
		penalty: 10
	},
	greater: {
		name: "Veneno Maior",
		dice: 1,
		faces: 10,
		penalty: 20
	},
	deadly: {
		name: "Veneno Mortal",
		dice: 2,
		faces: 8,
		penalty: 40
	},
	lethal: {
		name: "Veneno Letal",
		dice: 3,
		faces: 6,
		penalty: 50
	}
};
const POISON_TIER_ORDER = [
	"lesser",
	"poison",
	"greater",
	"deadly",
	"lethal"
];
/** Effective Poison Resistance = clamp(PR − tier penalty − attacker MAG / 2, −50, 100).
* Every point counts as 1%; below zero the poison hits harder than its dice. */
function effectivePoisonResistance(poisonResist, tier, mag) {
	return Math.max(-50, Math.min(100, poisonResist - POISON_TIERS[tier].penalty - mag / 2));
}
/** Percentage chance to apply poison on a landed hit: 100 − effective resistance, 0–100. */
function poisonChance(effectiveResist) {
	return Math.max(0, Math.min(100, 100 - effectiveResist));
}
/** Final tick damage = rolled poison damage × (1 − effective resistance / 100), rounded. */
function poisonTickDamage(rolled, effectiveResist) {
	return Math.max(0, Math.round(rolled * (1 - effectiveResist / 100)));
}
/** A new poison never downgrades one already in the target — the stronger tier stays. */
function strongerPoison(current, incoming) {
	if (!current) return incoming;
	return POISON_TIER_ORDER.indexOf(current) >= POISON_TIER_ORDER.indexOf(incoming) ? current : incoming;
}
/** "1D4", "2D8", … for a tier's tick. */
function poisonDice(tier) {
	const t = POISON_TIERS[tier];
	return `${t.dice}D${t.faces}`;
}
/** Reads a saved poison value. Older saves stored `true`/4 (Lesser) or 10 (old 1D10 = Poison). */
function poisonTierOf(value) {
	if (value === true || value === 4) return "lesser";
	if (value === 10) return "poison";
	return typeof value === "string" && POISON_TIER_ORDER.includes(value) ? value : void 0;
}
//#endregion
//#region src/game/skills.ts
const SKILLS = {
	healing: {
		name: "Healing",
		description: "Each skill point adds 1% to the total healing effect. Improves through effective healing."
	},
	...Object.fromEntries(WEAPON_TYPES.map((type) => [`${type}Weapon`, {
		name: WEAPON_TYPE_LABELS[type],
		description: "Improves weapon accuracy and damage through combat use."
	}])),
	fireResistance: {
		name: "Fire Resistance",
		description: "Reduces fire damage. Improves by using or being hit by fire magic."
	},
	lightningResistance: {
		name: "Lightning Resistance",
		description: "Reduces lightning and its delayed damage. Improves by using or being hit by lightning magic."
	},
	iceResistance: {
		name: "Ice Resistance",
		description: "Reduces ice damage. Improves by using or being hit by ice magic."
	},
	arcaneResistance: {
		name: "Arcane Resistance",
		description: "Reduces arcane damage. Improves by using or being hit by arcane magic."
	},
	darknessResistance: {
		name: "Darkness Resistance",
		description: "Reduces darkness damage. Improves by using or being hit by darkness magic."
	},
	holyResistance: {
		name: "Holy Resistance",
		description: "Reduces holy damage. Improves by using or being hit by holy magic."
	},
	poisonResistance: {
		name: "Poison Resistance",
		description: "Reduces poison damage and application chance. Improves by using or being hit by poison magic."
	},
	emberResistance: {
		name: "Ember Resistance",
		description: "Reduces ember damage. Improves by using or being hit by ember magic."
	}
};
function skillResistances(skills, hero) {
	return Object.fromEntries(RESISTANCE_ELEMENTS.map((element) => [element, skillValue(skills, hero, `${element}Resistance`)]));
}
const SKILL_IDS = Object.keys(SKILLS);
const SKILL_GAIN = .1;
function skillValue(skills, hero, id) {
	return skills?.[hero]?.[id] ?? 0;
}
/** Retain the exact skill percentage; only the final HP result is rounded down. */
function healingAmount(base, skill) {
	return Math.floor(Math.max(0, base) * (1 + (Number.isFinite(skill) ? Math.max(0, Math.min(100, skill)) : 0) / 100) + 1e-9);
}
/** Chance (0–1) that one use of the skill raises it: 100% at 0, 50% at 50, none at the cap. */
function skillGainChance(value) {
	return Math.max(0, Math.min(1, (100 - value) / 100));
}
/** One use of the skill. Returns the new value when it went up, otherwise null. */
function rollSkillGain(value, rng, amount = SKILL_GAIN) {
	if (rng() >= skillGainChance(value)) return null;
	return Math.min(100, Math.round((value + amount) * 100) / 100);
}
function cleanHeroSkills(raw, heroes, allowedWeapon, roundLegacyWeaponFractions = false) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
	const out = {};
	for (const hero of heroes) {
		const values = raw[hero];
		if (!values || typeof values !== "object") continue;
		const clean = {};
		for (const id of SKILL_IDS) {
			if (id.endsWith("Weapon") && allowedWeapon && !allowedWeapon(hero, id.slice(0, -6))) continue;
			const v = values[id];
			if (typeof v === "number" && Number.isFinite(v)) clean[id] = id.endsWith("Weapon") ? cleanWeaponSkill(v, roundLegacyWeaponFractions) : Math.max(0, Math.min(100, Math.round(v * 100) / 100));
		}
		if (Object.keys(clean).length) out[hero] = clean;
	}
	return out;
}
/** Weapon proficiency gains tenths, retaining smaller gains against lower-level enemies. */
function rollWeaponSkillGain(value, rng, amount = SKILL_GAIN) {
	const current = cleanWeaponSkill(value);
	if (current >= 100 || rng() >= skillGainChance(current)) return null;
	return Math.min(100, Math.round((current + amount) * 100) / 100);
}
//#endregion
//#region src/game/enmity.ts
/**
* Enmity (aggro), after Final Fantasy XI. Every enemy keeps a score for each hero/ally in two
* parts:
*  - cumulative (CE): builds slowly, lasts; worn down when that enemy hurts the hero.
*  - volatile (VE): builds fast, drains every round.
* An enemy targets whoever has the highest CE + VE on its own table; an enemy with an empty
* table keeps its usual targeting. All tuning lives here.
*/
const ENMITY = {
	/** Per point of damage dealt with a weapon (attacks, counters, weapon skills). */
	weapon: {
		ce: 1,
		ve: 3
	},
	/** Per point of spell damage — magic draws more attention than a sword. */
	spell: {
		ce: 1.5,
		ve: 6
	},
	/** Per HP healed, on every enemy that is aware of the party. */
	heal: {
		ce: .5,
		ve: 3
	},
	/** Flat, per use of a support/status skill (buffs, debuffs, summons, cures), on every aware enemy. */
	support: {
		ce: 20,
		ve: 120
	},
	/** Provoke, on each enemy it reaches. */
	provoke: {
		ce: 1,
		ve: 1800
	},
	/** Cumulative enmity a hero loses with an enemy per point of damage that enemy deals them. */
	damageTakenCe: 2,
	/** Volatile enmity drained from every entry at the start of each round. */
	volatileDecayPerRound: 300,
	/** Neither part grows past this. */
	cap: 1e4
};
function enmityTotal(entry) {
	return entry ? entry.ce + entry.ve : 0;
}
function addToEntry(entry, ce, ve) {
	return {
		ce: Math.max(0, Math.min(ENMITY.cap, (entry?.ce ?? 0) + ce)),
		ve: Math.max(0, Math.min(ENMITY.cap, (entry?.ve ?? 0) + ve))
	};
}
function enmityToSnapshot(table) {
	const out = {};
	for (const [enemy, row] of table) {
		const entries = [...row].filter(([, e]) => e.ce > 0 || e.ve > 0);
		if (entries.length) out[enemy] = Object.fromEntries(entries.map(([hero, e]) => [hero, [Math.round(e.ce * 10) / 10, Math.round(e.ve * 10) / 10]]));
	}
	return out;
}
function enmityFromSnapshot(raw) {
	const table = /* @__PURE__ */ new Map();
	if (!raw || typeof raw !== "object") return table;
	for (const [enemy, row] of Object.entries(raw)) {
		if (!row || typeof row !== "object") continue;
		const entries = /* @__PURE__ */ new Map();
		for (const [hero, pair] of Object.entries(row)) {
			if (!Array.isArray(pair) || pair.length !== 2) continue;
			const [ce, ve] = pair.map(Number);
			if (Number.isFinite(ce) && Number.isFinite(ve)) entries.set(hero, addToEntry(void 0, ce, ve));
		}
		if (entries.size) table.set(enemy, entries);
	}
	return table;
}
/**
* Whether `to` is in sight from `from`, stopping at the first blocker — which is
* itself seen, since you see the wall and not past it.
*
* Uses `blocksShot` rather than a sight flag of its own so what hides a body from a
* bow also hides it from the eye, and reads it off `tiles`: a decoration that blocks
* stamps blocking terrain under itself when the board loads, so the tile grid is the
* single source of truth for both.
*/
function sightReaches(from, to, tiles, cols, overlay = EMPTY_OVERLAY) {
	const line = hexLine(from, to);
	for (let i = 1; i < line.length - 1; i++) {
		const p = line[i];
		if (hexDef(tiles, cols, p.x, p.y, overlay).blocksShot) return false;
	}
	return true;
}
/**
* Demote what was visible to remembered, then light up what the given eyes can see.
* Explored never falls back to unseen: fog lifts and stays lifted.
*
* `vis` is mutated in place — it is one byte per cell and gets rewritten whenever the
* party moves, so handing back a fresh array every time would churn 25 KB a step on a
* dungeon-sized board.
*
* Cost is O(eyes x radius^2) and does not depend on the size of the board: a 160x160
* dungeon costs exactly what a 20x16 skirmish does.
*/
function relight(vis, eyes, radius, tiles, cols, rows, overlay = EMPTY_OVERLAY, lineOfSight = true) {
	for (let i = 0; i < vis.length; i++) if (vis[i] === 2) vis[i] = 1;
	for (let e = 0; e < eyes.length; e++) {
		const eye = eyes[e];
		const r = typeof radius === "number" ? radius : radius[e] ?? 0;
		const x0 = Math.max(0, eye.x - r);
		const x1 = Math.min(cols - 1, eye.x + r);
		const y0 = Math.max(0, eye.y - r);
		const y1 = Math.min(rows - 1, eye.y + r);
		for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
			const i = y * cols + x;
			if (vis[i] === 2) continue;
			if (hexDist(eye, {
				x,
				y
			}) > r) continue;
			if (!lineOfSight || sightReaches(eye, {
				x,
				y
			}, tiles, cols, overlay)) vis[i] = 2;
		}
	}
}
/**
* Explored cells as one bit each, base64.
*
* A bit per cell keeps a 160x160 dungeon at about 3.4 KB rather than the 25 KB the
* raw byte array would cost, which matters because this rides inside a save bank that
* also carries the whole tile grid (see lastSaveWrite in ./save).
*/
function packExplored(vis) {
	const bytes = new Uint8Array(Math.ceil(vis.length / 8));
	for (let i = 0; i < vis.length; i++) if (vis[i] > 0) bytes[i >> 3] |= 1 << (i & 7);
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary);
}
/**
* Explored cells for a board of `cells` hexes, or `null` when the string does not
* decode or does not match that board.
*
* Refusing a mismatch rather than applying part of it is deliberate: a bitset from a
* different board would light unrelated cells, and resuming a fight with the fog
* still down costs far less than revealing a room the party never entered.
*/
function unpackExplored(encoded, cells) {
	let binary;
	try {
		binary = atob(encoded);
	} catch {
		return null;
	}
	if (binary.length !== Math.ceil(cells / 8)) return null;
	const vis = new Uint8Array(cells);
	for (let i = 0; i < cells; i++) if (binary.charCodeAt(i >> 3) >> (i & 7) & 1) vis[i] = 1;
	return vis;
}
//#endregion
//#region src/game/gfx/three/devGfx.ts
const KEY = "emberash:devGfx";
const DEFAULTS = {
	realShadows: true,
	shadowResolution: 2048,
	softShadows: false,
	contactShadows: true,
	ambientOcclusion: true,
	fogOfWar: true,
	fogDebug: false,
	localLights: true,
	atmosphericFx: true,
	sunAzimuth: 53.13,
	sunElevation: 45,
	moonAzimuth: 140,
	moonElevation: 35
};
function load() {
	try {
		const raw = window.localStorage.getItem(KEY);
		if (raw) return {
			...DEFAULTS,
			...JSON.parse(raw)
		};
	} catch {}
	return { ...DEFAULTS };
}
let current = load();
function getDevGfx() {
	return current;
}
//#endregion
//#region src/game/gfx/decorationAnchor.ts
const anchorCache = /* @__PURE__ */ new WeakMap();
/** Measures the actual visible base rather than trusting transparent crop padding. This lets
* refreshed cutouts sit on the same map point even when their cleaner exports use new margins. */
function decorationAnchor(img) {
	if (anchorCache.has(img)) return anchorCache.get(img);
	let result = null;
	try {
		const scale = Math.min(1, 256 / Math.max(img.naturalWidth, img.naturalHeight));
		const w = Math.max(1, Math.round(img.naturalWidth * scale));
		const h = Math.max(1, Math.round(img.naturalHeight * scale));
		const canvas = document.createElement("canvas");
		canvas.width = w;
		canvas.height = h;
		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) throw new Error("Canvas unavailable");
		context.drawImage(img, 0, 0, w, h);
		const pixels = context.getImageData(0, 0, w, h).data;
		let bottom = -1;
		for (let y = h - 1; y >= 0 && bottom < 0; y--) for (let x = 0; x < w; x++) if (pixels[(y * w + x) * 4 + 3] > 128) {
			bottom = y;
			break;
		}
		if (bottom >= 0) {
			const top = Math.max(0, bottom - Math.max(1, Math.round(h * .04)));
			const columns = new Float64Array(w);
			let total = 0;
			for (let y = top; y <= bottom; y++) for (let x = 0; x < w; x++) {
				const alpha = pixels[(y * w + x) * 4 + 3];
				if (alpha > 128) {
					columns[x] += alpha;
					total += alpha;
				}
			}
			let accumulated = 0;
			let x0 = 0;
			let x1 = w - 1;
			for (let x = 0; x < w; x++) {
				const previous = accumulated;
				accumulated += columns[x];
				if (previous < total * .05 && accumulated >= total * .05) x0 = x;
				if (previous < total * .95 && accumulated >= total * .95) x1 = x;
			}
			result = {
				u0: x0 / w,
				u1: (x1 + 1) / w,
				v: (bottom + 1) / h
			};
		}
	} catch {
		result = null;
	}
	anchorCache.set(img, result);
	return result;
}
//#endregion
//#region src/game/overworld.ts
/** RPG map only: the hidden hex grid laid over the world-map image. The renderer never
* draws this — it only ever asks `neighborsOf` the party's current hex for what's
* clickable, and `hexToWorld` for where to draw a dot. Coordinates are odd-r offset,
* same convention pathfinding.ts already uses for the battle grid, just a separate and
* much coarser grid with its own pixel scale. */
/** Hex "radius" in percent of the world-map image's width/height. Chosen so the existing
* WORLD_LOCATIONS (spread roughly 12-86% x, 9-80% y) land several hex-steps apart, giving
* travel room instead of every location being a single step from the next. */
const OVERWORLD_HEX_SIZE = 5;
const SQRT3 = Math.sqrt(3);
/** World-map percent coordinate -> nearest hex, via the standard pointy-top axial/pixel
* conversion (redblobgames), reusing this project's own cube rounding and axial->offset
* conversion instead of reinventing either. */
function worldToHex(xPct, yPct) {
	const q = (SQRT3 / 3 * xPct - 1 / 3 * yPct) / OVERWORLD_HEX_SIZE;
	const r = 2 / 3 * yPct / OVERWORLD_HEX_SIZE;
	const c = cubeRound(q, r, -q - r);
	return cubeToOddr(c.q, c.r);
}
(() => {
	const stoneBridge = WORLD_LOCATIONS.find((location) => location.id === "stonebridge");
	const bridge = worldToHex(stoneBridge?.x ?? 14, stoneBridge?.y ?? 62);
	return {
		x: bridge.x - 1,
		y: bridge.y
	};
})().x;
WORLD_LOCATIONS.find((location) => location.id === "stonebridge")?.missionIds;
const ASHEN_FOREST_ENTRANCE = worldToHex(73.61215932167728, 52.5);
ASHEN_FOREST_ENTRANCE.x + 1, ASHEN_FOREST_ENTRANCE.y + 1;
key(2, 1), key(1, 1), key(1, 2), key(3, 1), key(4, 1), key(5, 1), key(7, 1), key(6, 1), key(8, 0), key(9, 0), key(9, 1), key(10, 1), key(11, 2), key(11, 3), key(11, 0), key(11, 5), key(11, 7), key(11, 8), key(11, 9), key(11, 11), key(11, 12), key(11, 13), key(10, 13), key(9, 13), key(11, 10), key(8, 13), key(1, 9), key(2, 9), key(3, 10), key(5, 12), key(6, 12), key(7, 11), key(7, 12), key(8, 10), key(8, 9), key(9, 9), key(10, 9), key(2, 13), key(5, 5), key(6, 5);
//#endregion
//#region src/game/audio.ts
let muted = false;
const activeSfx = /* @__PURE__ */ new Set();
const AUDIO_SETTINGS_KEY = "ember-ashes-audio-v1";
const clampVolume = (value) => Math.max(0, Math.min(1, value));
let sfxVolume = 1;
if (typeof window !== "undefined") try {
	const saved = JSON.parse(window.localStorage.getItem(AUDIO_SETTINGS_KEY) ?? "{}");
	if (typeof saved.music === "number") saved.music;
	if (typeof saved.sfx === "number") sfxVolume = clampVolume(saved.sfx);
	if (typeof saved.cutscene === "number") saved.cutscene;
} catch {}
if (typeof window !== "undefined") {
	const g = window;
	if (g.__brasaMusic) {
		clearInterval(g.__brasaMusic);
		g.__brasaMusic = 0;
	}
}
/** One-shot effect from a file in public/game/MUSIC/SoundFX, layered over the music
* rather than replacing it — unlike playFile, this never
* touches the theme/track elements, so it can't interrupt them. A fresh Audio() per call: the
* previous play is left to finish on its own instead of being cut short by the next one. */
/** Preloaded copy of a one-shot file, cloned per play so a cue starts from already-fetched data. */
const sfxTemplates = /* @__PURE__ */ new Map();
function sfxTemplate(file) {
	let el = sfxTemplates.get(file);
	if (!el) {
		el = new Audio(`/game/MUSIC/SoundFX/${file}`);
		el.preload = "auto";
		sfxTemplates.set(file, el);
		el.load();
	}
	return el;
}
function playSfxFile(file, volume = .55) {
	if (typeof Audio === "undefined") return;
	const el = sfxTemplate(file).cloneNode(true);
	activeSfx.add(el);
	el.addEventListener("ended", () => activeSfx.delete(el), { once: true });
	el.addEventListener("error", () => activeSfx.delete(el), { once: true });
	el.muted = muted;
	el.volume = volume * sfxVolume;
	el.play().catch(() => {});
}
/** One persistent element per file, reused instead of a fresh Audio() per call. A retrigger
* while the previous play is still going seeks back to 0 and restarts it rather than layering
* a second copy on top — so a generic cue fired several times in quick succession (a flurry of
* basic attacks, a multi-target skill) never stacks into a buzzing chord of itself. Only worth
* it for a cue reused across many different actions (the shared attack/cast recordings); a
* one-off cue tied to a single distinct moment (LevelUp, Cultist V2's own cuts) has nothing to
* overlap with itself and keeps using playSfxFile's layered fresh-Audio() behavior. */
const exclusiveSfxEls = /* @__PURE__ */ new Map();
function preloadExclusiveSfx(file) {
	if (typeof Audio === "undefined" || exclusiveSfxEls.has(file)) return;
	const el = new Audio(`/game/MUSIC/SoundFX/${file}`);
	el.preload = "auto";
	exclusiveSfxEls.set(file, el);
	el.load();
}
for (const file of [
	"ShortArrowsDraw.mp3",
	"ShortArrowsRelease.mp3",
	"NeeraBowRelease.mp3"
]) preloadExclusiveSfx(file);
for (const file of [
	"ATT01Blunt.mp3",
	"BladeSlash1Dagger.mp3",
	"Blade3.mp3",
	"Attack2.mp3",
	"Spellcast01.mp3",
	"ShieldBash.mp3"
]) preloadExclusiveSfx(file);
for (const file of [
	"CarnivorousPlantATT001.mp3",
	"CarnivorousPlantCast001.mp3",
	"CarnivorousPlantHit001.mp3",
	"CarnivorousPlantDeath001.mp3"
]) preloadExclusiveSfx(file);
for (const file of [
	"SaplingATT001.mp3",
	"SaplingCast001.mp3",
	"SaplingHit001.mp3",
	"SaplingDeath001.mp3",
	"SaplingWalk001.mp3"
]) preloadExclusiveSfx(file);
for (const file of [
	"PlagueCattleATT001.mp3",
	"PlagueCattleCast001.mp3",
	"PlagueCattleDeath001.mp3",
	"PlagueCattleWalk001.mp3"
]) preloadExclusiveSfx(file);
if (typeof Audio !== "undefined") for (const file of [
	"CultistV2Attack.mp3",
	"CultistV2Spellcast.mp3",
	"MinorHorrorATT001.mp3",
	"MinorHorrorCasting001.mp3"
]) sfxTemplate(file);
/** Where NeeraBowRelease.mp3's string snap begins (measured: silence/draw until a sharp
* transient at 2.77 s, peaking at 2.774 s). */
const NEERA_BOW_SNAP = 2.77;
function playSfxFileExclusive(file, volume = .55, startAt = 0) {
	if (typeof Audio === "undefined") return;
	let el = exclusiveSfxEls.get(file);
	if (!el) {
		el = new Audio(`/game/MUSIC/SoundFX/${file}`);
		el.preload = "auto";
		exclusiveSfxEls.set(file, el);
		activeSfx.add(el);
		el.load();
	}
	el.volume = volume * sfxVolume;
	el.currentTime = startAt;
	el.muted = muted;
	el.play().catch(() => {});
}
const MONSTER_SFX = {
	undeadOx: {
		attack: "UndeadOxATT001.mp3",
		cast: "UndeadOxCast001.mp3",
		walk: "UndeadOxWalk001.mp3",
		hit: "UndeadOxHit001.mp3",
		death: "UndeadOxDeath001.mp3"
	},
	wardog2: {
		attack: "WarDog2ATT001.mp3",
		walk: "WarDog2Walk001.mp3",
		death: "WarDog2Death001.mp3"
	},
	zombieDog: {
		attack: "ZombieDogATT001.mp3",
		cast: "ZombieDogCast001.mp3",
		walk: "ZombieDogWalk001.mp3",
		hit: "ZombieDogHit001.mp3",
		death: "ZombieDogDeath001.mp3",
		death2: "ZombieDogDeath2001.mp3"
	},
	RoccoTheBird: {
		cast: "RoccoTheBirdCast001.mp3",
		walk: "RoccoTheBirdWalk001.mp3"
	},
	"mordavian-wolf-final": {
		attack: "MordavianWolfFinalATT001.mp3",
		hit: "MordavianWolfFinalHit001.mp3",
		death: "MordavianWolfFinalDeath001.mp3"
	},
	troll2: {
		attack: "CaveTroll2ATT001.mp3",
		walk: "CaveTroll2Walk001.mp3"
	},
	BirolhoLegs: {
		attack: "BirolhoLegsATT001.mp3",
		cast: "BirolhoLegsCast001.mp3"
	},
	BirolhoLegs2: {
		cast: "BirolhoLegs2Cast001.mp3",
		walk: "BirolhoLegs2Walk001.mp3"
	},
	EmberedWraith: {
		attack: "EmberedWraithATT001.mp3",
		cast: "EmberedWraithCast001.mp3",
		walk: "EmberedWraithWalk001.mp3"
	},
	zombie: { attack: "ZombieATT001.mp3" },
	"big-blue-ox-002": {
		attack: "BigBlueOxATT001.mp3",
		walk: "BigBlueOxWalk001.mp3",
		hit: "BigBlueOxHit001.mp3",
		death: "BigBlueOxDeath001.mp3"
	},
	apparition: {
		cast: "ApparitionCast001.mp3",
		hit: "ApparitionHit001.mp3"
	},
	"militia-v2": {
		attack: "FootmanLameSword.mp3",
		walk: "FootSteps1.mp3",
		hit: "HitreactArmor.mp3",
		death: "DeadArmor.mp3"
	}
};
for (const cues of Object.values(MONSTER_SFX)) for (const file of Object.values(cues)) preloadExclusiveSfx(file);
/** Whether a sprite has its own cue of this kind (see MONSTER_SFX). */
function hasMonsterSfx(sprite, kind) {
	return !!sprite && !!MONSTER_SFX[sprite]?.[kind];
}
/** Stops an exclusive cue early with a short fade, so cutting it off never clicks. */
function stopSfxFileExclusive(file, fadeMs = 120) {
	const el = exclusiveSfxEls.get(file);
	if (!el || el.paused) return;
	const from = el.volume;
	const started = performance.now();
	const step = () => {
		const k = Math.min(1, (performance.now() - started) / fadeMs);
		el.volume = from * (1 - k);
		if (k < 1) requestAnimationFrame(step);
		else el.pause();
	};
	requestAnimationFrame(step);
}
const sfxPlay = {
	select: () => {},
	move: () => {},
	ui: () => {},
	purchase: () => {},
	hit: () => {},
	crit: () => {},
	death: () => {},
	turn: () => {},
	win: () => {},
	lose: () => {},
	spell: () => playSfxFileExclusive("Spellcast01.mp3", .55),
	dreamingWeb: () => {},
	summonFamiliar: () => {},
	meleeAttack: (blade = false, bladeStartAt = 0) => playSfxFileExclusive(blade ? "BladeSlash1Dagger.mp3" : "ATT01Blunt.mp3", .55, blade ? bladeStartAt : 0),
	daggerAttack: () => playSfxFileExclusive("Blade3.mp3", .55),
	kaelBladeSkill: () => playSfxFileExclusive("Attack2.mp3", .55),
	shieldBash: () => playSfxFileExclusive("ShieldBash.mp3", .55),
	minorHorrorAttack: () => playSfxFileExclusive("MinorHorrorATT001.mp3", .55),
	minorHorrorCast: () => playSfxFileExclusive("MinorHorrorCasting001.mp3", .55),
	minorHorrorWalk: () => playSfxFileExclusive("MinorHorrorWalk001.mp3", .45),
	carnivorousPlantAttack: () => playSfxFileExclusive("CarnivorousPlantATT001.mp3", .55),
	carnivorousPlantCast: () => playSfxFileExclusive("CarnivorousPlantCast001.mp3", .55),
	carnivorousPlantHit: () => playSfxFileExclusive("CarnivorousPlantHit001.mp3", .55),
	carnivorousPlantDeath: () => playSfxFileExclusive("CarnivorousPlantDeath001.mp3", .55),
	saplingAttack: () => playSfxFileExclusive("SaplingATT001.mp3", .55),
	saplingCast: () => playSfxFileExclusive("SaplingCast001.mp3", .55),
	saplingHit: () => playSfxFileExclusive("SaplingHit001.mp3", .55),
	saplingDeath: () => playSfxFileExclusive("SaplingDeath001.mp3", .55),
	saplingWalk: () => playSfxFileExclusive("SaplingWalk001.mp3", .45),
	plagueCattleAttack: () => playSfxFileExclusive("PlagueCattleATT001.mp3", .55),
	plagueCattleCast: () => playSfxFileExclusive("PlagueCattleCast001.mp3", .55),
	plagueCattleDeath: () => playSfxFileExclusive("PlagueCattleDeath001.mp3", .55),
	plagueCattleWalk: () => playSfxFileExclusive("PlagueCattleWalk001.mp3", .45),
	plagueCattleWalkStop: () => stopSfxFileExclusive("PlagueCattleWalk001.mp3"),
	/** A monster's own cue from MONSTER_SFX; returns false (and plays nothing) when it has none,
	* so the caller can fall back to the generic cue. */
	monster: (sprite, kind) => {
		const file = sprite ? MONSTER_SFX[sprite]?.[kind] : void 0;
		if (!file) return false;
		playSfxFileExclusive(file, kind === "walk" ? .45 : .55);
		return true;
	},
	/** Fades out a monster's walk cue when its move ends (moves are shorter than the clip). */
	monsterWalkStop: (sprite) => {
		const file = sprite ? MONSTER_SFX[sprite]?.walk : void 0;
		if (file) stopSfxFileExclusive(file);
	},
	cultistV2Attack: () => playSfxFile("CultistV2Attack.mp3", .55),
	cultistV2Spellcast: () => playSfxFile("CultistV2Spellcast.mp3", .55),
	cultistV2WalkLeft: () => playSfxFile("CultistV2WalkLeft.mp3", .45),
	cultistV2WalkRight: () => playSfxFile("CultistV2WalkRight.mp3", .45),
	arrowAttack: (neera = false, releaseIn = 0) => {
		if (!neera) {
			playSfxFileExclusive("ShortArrowsDraw.mp3", .55);
			return;
		}
		const lead = releaseIn - NEERA_BOW_SNAP;
		if (lead > 0) window.setTimeout(() => playSfxFileExclusive("NeeraBowRelease.mp3", .55), lead * 1e3);
		else playSfxFileExclusive("NeeraBowRelease.mp3", .55, -lead);
	},
	arrowRelease: (neera = false) => {
		if (!neera) playSfxFileExclusive("ShortArrowsRelease.mp3", .55);
	},
	magicAttack: () => playSfxFileExclusive("Spellcast01.mp3", .55),
	heal: () => playSfxFileExclusive("Spellcast01.mp3", .55),
	stun: () => {},
	miss: () => {},
	chest: () => {},
	loot: () => {},
	thrust: (blade = false) => playSfxFileExclusive(blade ? "BladeSlash1Dagger.mp3" : "ATT01Blunt.mp3", .55),
	sweep: (blade = false) => playSfxFileExclusive(blade ? "BladeSlash1Dagger.mp3" : "ATT01Blunt.mp3", .55),
	trip: (blade = false) => playSfxFileExclusive(blade ? "BladeSlash1Dagger.mp3" : "ATT01Blunt.mp3", .55),
	levelUp: () => playSfxFile("LevelUp.mp3", .6)
};
if (typeof window !== "undefined") {
	const g = window;
	if (g.__emberIntro) g.__emberIntro;
}
//#endregion
//#region src/game/quests.ts
/** Extra levels a named boss spawn gets over its mission's normal enemy level (see
* spawnUnit in engine.ts). The engine's own per-5-levels stat boost then applies on top, so
* the bonus raises both level and stats. Keyed by spawn name, not stored in the map JSON, for
* the same reason quest data lives here. */
const NOTORIOUS_LEVEL_BONUS = { "O Birolho": 8 };
//#endregion
//#region src/game/gfx/WebGL2DRenderer.ts
function sweepDelta(a0, a1, ccw) {
	const TWO_PI = Math.PI * 2;
	let delta = a1 - a0;
	if (!ccw) {
		while (delta < 0) delta += TWO_PI;
		delta = Math.min(delta, TWO_PI);
	} else {
		while (delta > 0) delta -= TWO_PI;
		delta = Math.max(delta, -TWO_PI);
	}
	return delta;
}
function tessellateArc(cx, cy, r, a0, a1, ccw) {
	const delta = sweepDelta(a0, a1, ccw);
	const segs = Math.max(6, Math.ceil(Math.abs(delta) * Math.max(r, 1) / 6));
	const pts = [];
	for (let i = 0; i <= segs; i++) {
		const a = a0 + delta * i / segs;
		pts.push(cx + r * Math.cos(a), cy + r * Math.sin(a));
	}
	return pts;
}
function tessellateEllipse(cx, cy, rx, ry, rotation, a0, a1, ccw) {
	const delta = sweepDelta(a0, a1, ccw);
	const segs = Math.max(6, Math.ceil(Math.abs(delta) * Math.max(rx, ry, 1) / 6));
	const cosR = Math.cos(rotation), sinR = Math.sin(rotation);
	const pts = [];
	for (let i = 0; i <= segs; i++) {
		const a = a0 + delta * i / segs;
		const ex = rx * Math.cos(a), ey = ry * Math.sin(a);
		pts.push(cx + ex * cosR - ey * sinR, cy + ex * sinR + ey * cosR);
	}
	return pts;
}
function tessellateQuadratic(x0, y0, cx, cy, x1, y1) {
	const segs = 12;
	const pts = [];
	for (let i = 1; i <= segs; i++) {
		const t = i / segs;
		const mt = 1 - t;
		const x = mt * mt * x0 + 2 * mt * t * cx + t * t * x1;
		const y = mt * mt * y0 + 2 * mt * t * cy + t * t * y1;
		pts.push(x, y);
	}
	return pts;
}
/** Shared by the renderer's own implicit path and the exported Path2D shim below — both just
* record subpaths the same way. */
var PathRecorder = class {
	subpaths = [];
	cur = null;
	moveTo(x, y) {
		this.cur = {
			pts: [x, y],
			closed: false
		};
		this.subpaths.push(this.cur);
	}
	lineTo(x, y) {
		if (!this.cur) this.moveTo(x, y);
		else this.cur.pts.push(x, y);
	}
	closePath() {
		if (this.cur) this.cur.closed = true;
	}
	arc(x, y, r, startAngle, endAngle, ccw = false) {
		const pts = tessellateArc(x, y, r, startAngle, endAngle, ccw);
		if (!this.cur) this.moveTo(pts[0], pts[1]);
		else this.cur.pts.push(pts[0], pts[1]);
		if (this.cur) this.cur.pts.push(...pts.slice(2));
	}
	ellipse(x, y, rx, ry, rotation, startAngle, endAngle, ccw = false) {
		const pts = tessellateEllipse(x, y, rx, ry, rotation, startAngle, endAngle, ccw);
		if (!this.cur) this.moveTo(pts[0], pts[1]);
		else this.cur.pts.push(pts[0], pts[1]);
		if (this.cur) this.cur.pts.push(...pts.slice(2));
	}
	quadraticCurveTo(cx, cy, x, y) {
		if (!this.cur) this.moveTo(cx, cy);
		const last = this.cur;
		const x0 = last.pts[last.pts.length - 2];
		const y0 = last.pts[last.pts.length - 1];
		last.pts.push(...tessellateQuadratic(x0, y0, cx, cy, x, y));
	}
	rect(x, y, w, h) {
		this.cur = {
			pts: [
				x,
				y,
				x + w,
				y,
				x + w,
				y + h,
				x,
				y + h
			],
			closed: true
		};
		this.subpaths.push(this.cur);
	}
};
/** Drop-in for the one `new Path2D()` use in engine.ts (the blade-sweep crescent) — importing
* this class into that file shadows the DOM global of the same name, so the call site itself
* needs no change. */
var Path2D = class extends PathRecorder {};
//#endregion
//#region src/game/engine.ts
const PARTICLE_CAP = 32;
const ZOOM_RADII = [
	22,
	34,
	50,
	72
];
/** Which WebGL elemental FX shader (see gfx/shaders.ts) a landed spell hit lights up on its
* target tile(s), and how long that shader patch lingers (seconds) before it self-expires —
* see EffectsRenderer.spawnEffect's `duration` option. Only spells with a clear elemental
* theme are listed; anything absent here (melee skills, arrows, heals, ...) queues no FX. */
const SPELL_ELEMENT_FX = {
	causticVenom: {
		kind: "acid",
		duration: 1.3
	},
	minorVenom: {
		kind: "acid",
		duration: 1.3
	},
	divineBolt: {
		kind: "holy",
		duration: 1.15
	},
	divineWrath: {
		kind: "holy",
		duration: .9
	}
};
const LEVEL_UP_FX_CAP = 72;
function blankLevelUpSpark() {
	return {
		live: false,
		unitId: "",
		kind: "star",
		dx: 0,
		dy: 0,
		vx: 0,
		vy: 0,
		life: 0,
		max: 1,
		size: 1,
		hue: 46,
		rot: 0,
		vrot: 0,
		refCell: 1
	};
}
/** How long Magic Missile's bolt takes to reach its target — stepSpell's own hit/damage tick
* for a magicMissile cast fires at exactly this time (see MISSILE_HIT_AT below) instead of
* the normal 0.18, so slowing this down keeps the impact flash/number landing right as the
* bolt visually arrives instead of drifting out of sync with it. */
const MISSILE_TRAVEL = .18;
/** Phantasmal Force is an apparition, not a bolt: give its attacking silhouette enough
* screen time to read before its claws land. */
const PHANTASMAL_FORCE_TRAVEL = .38;
/** Phantom System retains its own legacy bolt timing. */
const FANTOM_FORCE_TRAVEL = .38;
/** Flight time of the actual spell bolts (Magic Missile, Fireball, Caustic Venom) — slower and
* more cinematic than arrows, so the effect can be seen travelling. Their hit/damage tick
* (stepSpell's hitAt) is this same value, so the impact still lands as the bolt arrives. */
const SPELL_TRAVEL = .6;
/** Standard projectile timing: Neera's arrows now land at the same speed as the rest of combat. */
const ARROW_TRAVEL = MISSILE_TRAVEL;
/** How much longer the bolt's glowing trail lingers on screen, fading, after the bolt
* itself has already landed. Kept short enough that MISSILE_TRAVEL + this stays under 0.55
* — stepSpell's own finishCombat threshold for every spell — so the trail's afterglow never
* outlives the active step it belongs to. */
const MISSILE_AFTERGLOW = .2;
/** Dreaming Web's shot is purely cosmetic — the spell's real effect (the zone, the sleep
* rolls) already happens synchronously in castWebOfDreams before this ever starts playing, so
* unlike every other MissileFx kind its travel time isn't tied to any hit-timing threshold and
* can just be as long as it needs to be to actually read as the dense, tangled WebGL beam it
* is (see BattleEngine.webShotBeam / shaders.ts WEB_SHOT) instead of a blink-and-miss streak. */
const WEB_SHOT_TRAVEL = .85;
const MISSILE_FX_CAP = 12;
const FIREBALL_BURST_CAP = 19;
function blankFireballBurstFx() {
	return {
		live: false,
		x: 0,
		y: 0,
		t: 0,
		max: .58,
		seed: 0,
		kind: "fireball"
	};
}
function blankMissileFx() {
	return {
		live: false,
		fromX: 0,
		fromY: 0,
		toX: 0,
		toY: 0,
		t: 0,
		max: .38,
		travel: MISSILE_TRAVEL,
		hue: 268,
		neeraArrow: false,
		kind: "magicMissile",
		seed: 0
	};
}
/** How long the Lightning strike's flash lasts, start to fully faded — short and sudden on
* purpose, a real strike rather than a travelling bolt. Choque keeps this; Relâmpago uses a
* longer, heavier sky-fall (see LightningFx.power). */
const LIGHTNING_STRIKE_DUR = .42;
const LIGHTNING_RAIO_DUR = .72;
const LIGHTNING_T3_DUR = .92;
/** How many hexes of "sky" the bolt is drawn falling from, above the struck hex. */
const LIGHTNING_FALL_HEIGHT = 3.2;
const LIGHTNING_RAIO_FALL_HEIGHT = 6.4;
const LIGHTNING_FX_CAP = 16;
function blankLightningFx() {
	return {
		live: false,
		x: 0,
		y: 0,
		t: 0,
		max: LIGHTNING_STRIKE_DUR,
		hue: 205,
		segs: [],
		branches: [],
		power: "shock"
	};
}
const PORTAL_FX_CAP = 4;
function blankPortalFx() {
	return {
		live: false,
		x: 0,
		y: 0,
		t: 0,
		max: .85,
		seed: 0,
		body: null,
		red: false
	};
}
const HOLY_FX_CAP = 10;
function blankHolyFx() {
	return {
		live: false,
		unitId: "",
		x: 0,
		y: 0,
		t: 0,
		max: .8,
		kind: "minor",
		seed: 0,
		rays: []
	};
}
function holyDuration(kind) {
	if (kind === "hands") return .94;
	if (kind === "medium" || kind === "food") return 1.18;
	if (kind === "disease") return 1.02;
	if (kind === "potion") return .88;
	return .7;
}
const BLADE_FX_CAP = 12;
function blankBladeFx() {
	return {
		live: false,
		kind: "arc",
		x: 0,
		y: 0,
		toX: 0,
		toY: 0,
		a0: 0,
		a1: 0,
		t: 0,
		max: .32,
		seed: 0,
		warm: false,
		mirrorX: false
	};
}
function blankParticle() {
	return {
		live: false,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		life: 0,
		max: 1,
		size: 1,
		color: "#fff",
		kind: "spark",
		frame: 0
	};
}
/** Global playback rule for long sprite sheets, keyed only on frame count (never on a sprite
* name), so every 36-frame FINAL sprite — and any added later — plays at a real frame rate
* instead of being squeezed into the timing built for 4-12 frame sheets. Sheets shorter than
* LONG_SHEET_FRAMES are untouched. */
const LONG_SHEET_FRAMES = 24;
/** Bull Rush's targeting radius, in hexes. */
const BULL_RUSH_RANGE = 4;
/** Seconds the movement/range grid takes to fade in once every action and effect is done. */
const OVERLAY_FADE_IN = .4;
/** Default: one full pass of any long sheet (idle, walk, attack, cast) lasts this many
* seconds, whatever its frame count — a 36-frame sheet plays at 12 fps. */
const LONG_ANIM_SECONDS = 3;
/** Kael's 36-frame swing, start to finish — shorter than the 3s every other long sheet gets. */
const KAEL_FINAL_ATTACK_SECONDS = 2;
/** Apparition's 60-frame ATT (5 s of her video at real speed), longer than the usual 3 s on purpose. */
const APPARITION_ATTACK_SECONDS = 5;
/** Seconds into BladeSlash1Dagger.mp3 Kael's swing sound starts from (see stepCombat). */
const KAEL_BLADE_SOUND_START = 1.12;
/** A death sheet (GameArt.deaths) plays over this long, then the body lies still for
* DEATH_HOLD_SECONDS before fading out like any other fallen unit. */
const DEATH_ANIM_SECONDS = 3;
const DEATH_HOLD_SECONDS = 1;
/** A hit-reaction sheet (GameArt.hits) plays over this long. On a killing blow it plays
* first and the death sheet starts right after it. */
const HIT_ANIM_SECONDS = 3;
/** Walk cycles run faster than the rest: one full pass of a long walk sheet takes this long. */
const LONG_WALK_SECONDS = 1.5;
const BIG_BLUE_OX_PACE = .75;
const MINOR_HORROR_SECONDS = {
	idle: 3.24,
	attack: 2.844,
	cast: 3.168,
	walk: 3.456,
	death: 3.924
};
/** Bow shots on a long sheet: normal ATT shots wait for the full sheet. Bow skills normally
* release mid-sheet, except Neera's Special sheet, which must finish before her arrow leaves. */
const LONG_ARROW_RELEASE_SECONDS = LONG_ANIM_SECONDS;
const LONG_ARROW_SKILL_RELEASE_SECONDS = 2;
function pub(u, restrained, movLeft) {
	return {
		id: u.id,
		name: u.name,
		classId: u.classId,
		className: u.className,
		role: u.role,
		side: u.side,
		sprite: u.sprite,
		hp: u.hp,
		escaped: u.escaped,
		maxHp: u.maxHp,
		atk: u.atk,
		mag: u.mag,
		def: u.def,
		dex: u.dex,
		resistances: { ...u.resistances },
		weaponSkills: { ...u.weaponSkills },
		healingSkill: u.healingSkill ?? 0,
		initiative: u.initiative,
		initiativeRoll: u.initiativeRoll,
		mov: u.mov,
		movLeft,
		minRange: u.minRange,
		maxRange: u.maxRange,
		moved: u.moved,
		acted: u.acted,
		x: u.x,
		y: u.y,
		level: u.level,
		xp: u.xp,
		bag: { ...u.bag },
		spells: { ...u.spells },
		frostCharges: u.frostCharges,
		weaponId: u.weaponId,
		weaponEnh: u.weaponEnh,
		size: u.size,
		diseased: u.diseased,
		poisoned: u.poisoned,
		poisonTier: u.poisonTier,
		poisonMag: u.poisonMag,
		bleeding: u.bleeding,
		bleedRoundsLeft: u.bleedRoundsLeft,
		blessedHitBonusPct: u.blessedHitBonusPct,
		blessedRoundsLeft: u.blessedRoundsLeft,
		shock: u.shock ? { ...u.shock } : null,
		fearTurns: u.fearTurns,
		fearSourceId: u.fearSourceId,
		stunned: u.stunned,
		crippled: u.crippled,
		hungry: u.hungerPenaltyPct > 0,
		hungerPct: Math.round(u.hungerPenaltyPct * 100),
		fullness: u.fullness,
		offHandId: u.offHandId,
		summoned: u.summoned,
		spellCharges: u.spellCharges,
		lifeDrainCharges: u.lifeDrainCharges,
		asleep: u.asleep,
		restrained,
		gear: { ...u.gear }
	};
}
/** True once a hero is starving badly enough to be benched outright rather than merely
* fighting at reduced stats — the party's hunger streak has hit its worst tier AND this
* specific hero's own fullness is still at zero (feeding just them, even while the rest of
* the party stays hungry, keeps them off this list). */
function heroUnconscious(name, roster) {
	if (!roster) return false;
	return (roster.hungerPenaltyPct ?? 0) >= .9 && fullness(roster.heroHunger?.[name]) <= 0;
}
/** Remaining uses for one spell tier at spawn — the class/level cap minus whatever the
* roster says this hero already spent so far this scenario (see Roster.spellSpent), never
* below 0. Always 0 for enemies, matching the previous unconditional side-check inline. */
function remainingTier(classId, tier, key, level, side, roster, name) {
	if (side !== "player") return 0;
	const cap = tierUses(classId, tier, level);
	const spent = roster?.spellSpent?.[name]?.[key] ?? 0;
	return Math.max(0, cap - spent);
}
const MAGE_RANGE_BONUS_CLASSES = /* @__PURE__ */ new Set([
	"mage",
	"voss",
	"elementalist",
	"warlock"
]);
const HERO_SPRITE_BY_NAME = {
	Kael: "kaelFinal",
	Neera: "neera",
	Voss: "voss",
	Salazar: "salazar",
	Aldric: "aldric",
	Malrec: "malrec"
};
/** The name-pin above, with the mission editor's per-spawn escape hatch (Spawn.useClassSprite
* — see its doc comment in types.ts) applied first: set, it renders with classId's own class
* sprite instead, so any enemy/creature classId dropped into a hero-named slot actually shows
* up as itself rather than snapping back to that hero's pinned look. */
/** Resolves the persistent visual identity used by battle units and out-of-battle hero views. */
function heroSpriteFor(name, classSprite, useClassSprite) {
	if (useClassSprite) return classSprite;
	return HERO_SPRITE_BY_NAME[name] ?? classSprite;
}
function spawnUnit(spawn, side, i, roster, enemyLevel = 1) {
	const requestedClassId = (side === "player" ? roster?.promotions?.[spawn.name] : void 0) ?? spawn.classId;
	const classId = spawn.name === "Kael" ? "swordsman" : requestedClassId;
	const cls = CLASSES[classId];
	const level = side === "enemy" ? roster?.enemyLevels?.[i] ?? enemyLevel + (NOTORIOUS_LEVEL_BONUS[spawn.name] ?? 0) : side === "neutral" ? roster?.neutralLevels?.[i] ?? enemyLevel : roster?.levels[spawn.name] ?? 1;
	const st = statsFor(classId, level);
	if (side === "enemy") {
		const boost = 1 + Math.floor(level / 5) * .1;
		st.hp = Math.round(st.hp * boost);
		st.atk = Math.round(st.atk * boost);
		st.mag = Math.round(st.mag * boost);
		st.def = Math.round(st.def * boost);
		st.dex = Math.round(st.dex * boost);
	}
	const statPointAllocation = side === "player" ? { ...roster?.statPointAllocations?.[spawn.name] ?? {} } : {};
	const point = (attribute) => statPointAllocation[attribute] ?? 0;
	const heroIsStarving = fullness(roster?.heroHunger?.[spawn.name]) <= 0;
	const hungerPenaltyPct = side === "player" && heroIsStarving ? Math.min(.9, Math.max(0, roster?.hungerPenaltyPct ?? 0)) : 0;
	const hungerKeep = 1 - hungerPenaltyPct;
	const diseased = side === "player" && roster?.heroDiseases?.[spawn.name] === true;
	const poisoned = side === "player" && !!roster?.heroPoisons?.[spawn.name];
	const diseaseKeep = diseased ? 1 - DISEASE.statPenalty : 1;
	const weapon = side === "player" ? roster?.weapons?.[spawn.name] ?? {
		id: starterWeaponFor(classId),
		enh: 0
	} : null;
	const weaponDef = weapon?.id ? WEAPONS[weapon.id] : null;
	const minRange = weaponDef?.minRange ?? st.minRange;
	const maxRange = (weaponDef?.maxRange ?? st.maxRange) + (MAGE_RANGE_BONUS_CLASSES.has(classId) ? 1 : 0);
	const offHandId = side === "player" && !weaponDef?.twoHanded ? roster?.offHand?.[spawn.name] ?? null : null;
	const gear = side === "player" ? { ...roster?.equipment?.[spawn.name] ?? {} } : {};
	const gearBonus = gearStatBonus(Object.values(gear));
	const hpCap = roster?.hp[spawn.name];
	const maxHp = Math.round((st.hp + point("hp") + gearBonus.hp) * hungerKeep);
	const hp = hpCap != null && hpCap > 0 ? Math.min(maxHp, hpCap) : maxHp;
	return {
		id: `${side}-${spawn.name}-${i}`,
		name: spawn.name,
		classId: cls.id,
		className: cls.name,
		role: cls.role,
		side,
		sprite: heroSpriteFor(spawn.name, cls.sprite, spawn.useClassSprite),
		useClassSprite: spawn.useClassSprite,
		x: spawn.x,
		y: spawn.y,
		hp,
		maxHp,
		atk: Math.round((st.atk + point("atk") + gearBonus.atk) * hungerKeep * diseaseKeep),
		mag: Math.round((st.mag + point("mag") + gearBonus.mag) * hungerKeep * diseaseKeep),
		def: Math.round((st.def + point("def") + gearBonus.def) * hungerKeep * diseaseKeep),
		dex: Math.round((st.dex + point("dex") + gearBonus.dex) * hungerKeep * diseaseKeep),
		resistances: sumResistances(st.resistances, gearBonus.resistances, side === "player" ? skillResistances(roster?.heroSkills, spawn.name) : void 0),
		weaponSkills: side === "player" ? trainedWeaponSkills(roster?.heroSkills, spawn.name, cls.id) : void 0,
		healingSkill: skillValue(roster?.heroSkills, spawn.name, "healing"),
		initiative: initiativeBonus(cls.id),
		initiativeRoll: 0,
		statPointAllocation,
		mov: spawn.holdsPosition ? 0 : diseased ? Math.max(1, Math.round((st.mov + gearBonus.mov) * diseaseKeep)) : st.mov + gearBonus.mov,
		gear,
		minRange,
		maxRange,
		moved: false,
		acted: false,
		facing: side === "player" ? 1 : -1,
		faceDx: side === "player" ? 1 : -1,
		faceDy: 0,
		walkPose: "front",
		idleAlt: false,
		alive: true,
		drawX: spawn.x,
		drawY: spawn.y,
		flash: 0,
		levelGlow: 0,
		healGlow: 0,
		healGlowKind: "potionZero",
		fade: 1,
		bob: 0,
		level,
		xp: side === "player" ? roster?.xp?.[spawn.name] ?? 0 : 0,
		bag: side === "player" ? { ...roster?.bags?.[spawn.name] ?? (cls.id === "healer" ? EMPTY_BAG : STARTING_BAG) } : { ...EMPTY_BAG },
		spells: {
			tier1: cls.id === "carnivorousPlant" ? 2 : cls.id === "sapling" ? 1 : cls.id === "swampBlueCalf" ? tierUses(cls.id, 1, level) : cls.id === "bigBlueCalf" ? 3 : cls.id === "roccoTheBird" ? 2 : cls.id === "emberedWraith" ? 0 : cls.id === "cultist" || cls.id === "cultistV2" ? cultistSpellUses(level).magicMissile : cls.id === "brigand" ? brigandSpellUses(level).longShot : cls.id === "birolho" || cls.id === "birolho2" || cls.id === "birolho3" || cls.id === "birolhoLegs" || cls.id === "birolhoLegs2" ? birolhoSpellUses(level).magicMissile : remainingTier(cls.id, 1, "tier1", level, side, roster, spawn.name),
			tier2: cls.id === "roccoTheBird" ? 3 : cls.id === "emberedWraith" ? 1 : cls.id === "cultist" || cls.id === "cultistV2" ? cultistSpellUses(level).lightning : cls.id === "brigand" ? brigandSpellUses(level).piercing : cls.id === "birolho" || cls.id === "birolho2" || cls.id === "birolho3" || cls.id === "birolhoLegs" || cls.id === "birolhoLegs2" ? birolhoSpellUses(level).lightning : remainingTier(cls.id, 2, "tier2", level, side, roster, spawn.name),
			tier3: cls.id === "carnivorousPlant" ? 2 : remainingTier(cls.id, 3, "tier3", level, side, roster, spawn.name),
			tier4: cls.id === "carnivorousPlant" ? 3 : cls.id === "birolho" || cls.id === "birolho2" || cls.id === "birolho3" || cls.id === "birolhoLegs" || cls.id === "birolhoLegs2" ? birolhoSpellUses(level).causticVenom : cls.id === "undeadOx" || cls.id === "plagueBearingCattle" ? 2 : remainingTier(cls.id, 4, "tier4", level, side, roster, spawn.name),
			tier5: remainingTier(cls.id, 5, "tier5", level, side, roster, spawn.name),
			tier6: remainingTier(cls.id, 6, "tier6", level, side, roster, spawn.name),
			tier7: remainingTier(cls.id, 7, "tier7", level, side, roster, spawn.name),
			tier8: remainingTier(cls.id, 8, "tier8", level, side, roster, spawn.name),
			tier9: remainingTier(cls.id, 9, "tier9", level, side, roster, spawn.name),
			tier10: remainingTier(cls.id, 10, "tier10", level, side, roster, spawn.name)
		},
		weaponId: weapon?.id ?? null,
		weaponEnh: weapon?.enh ?? 0,
		size: cls.size,
		footprintW: cls.footprintW,
		footprintH: cls.footprintH,
		footprintOffsets: cls.footprintOffsets,
		shock: null,
		shockCharges: side === "enemy" ? shockChargesFor(cls.id) : 0,
		frostCharges: side === "enemy" && cls.id === "cultistV2" ? frostCharges(level) : 0,
		fantomForceCharges: side === "enemy" ? fantomForceChargesFor(cls.id) : 0,
		diseased,
		diseaseBase: diseased ? {
			atk: Math.round((st.atk + point("atk") + gearBonus.atk) * hungerKeep),
			mag: Math.round((st.mag + point("mag") + gearBonus.mag) * hungerKeep),
			def: Math.round((st.def + point("def") + gearBonus.def) * hungerKeep),
			dex: Math.round((st.dex + point("dex") + gearBonus.dex) * hungerKeep),
			mov: st.mov + gearBonus.mov
		} : null,
		poisoned,
		poisonTier: poisoned ? poisonTierOf(roster?.heroPoisons?.[spawn.name]) ?? "lesser" : void 0,
		poisonMag: poisoned ? roster?.heroPoisonMag?.[spawn.name] ?? 0 : void 0,
		poisonResist: side === "player" ? skillResistances(roster?.heroSkills, spawn.name).poison ?? 0 : 0,
		bleeding: false,
		bleedRoundsLeft: void 0,
		bleedRoundMarker: void 0,
		bleedMovedThisTurn: false,
		stunned: false,
		stunTurns: 0,
		crippled: false,
		hungerPenaltyPct,
		fullness: fullness(roster?.heroHunger?.[spawn.name]),
		offHandId,
		summoned: isSummonClass(cls.id),
		asleep: false,
		sleepTurns: 0,
		guaranteedDrop: side === "enemy" && !!spawn.guaranteedDrop,
		dialog: spawn.dialog ?? null,
		moveBudgetUsed: 0
	};
}
function unitFromSnap(snap) {
	const classId = snap.name === "Kael" ? "swordsman" : snap.classId;
	const cls = CLASSES[classId];
	return {
		id: snap.id,
		name: snap.name,
		classId,
		className: cls?.name ?? classId,
		role: cls?.role ?? "",
		side: snap.side,
		sprite: heroSpriteFor(snap.name, cls?.sprite ?? "soldier", snap.useClassSprite),
		useClassSprite: snap.useClassSprite,
		x: snap.x,
		y: snap.y,
		hp: snap.hp,
		escaped: snap.escaped,
		maxHp: snap.maxHp,
		atk: snap.atk,
		mag: snap.mag,
		def: snap.def,
		dex: snap.dex,
		weaponSkills: snap.weaponSkills,
		resistances: snap.resistances ?? sumResistances(cls?.resistances, gearStatBonus(Object.values(snap.gear ?? {})).resistances, { poison: snap.poisonResist ?? 0 }),
		initiative: snap.initiative ?? initiativeBonus(classId),
		initiativeRoll: snap.initiativeRoll ?? 0,
		statPointAllocation: { ...snap.statPointAllocation ?? {} },
		mov: snap.mov,
		minRange: snap.minRange,
		maxRange: snap.maxRange,
		moved: snap.moved,
		acted: snap.acted,
		facing: snap.facing,
		faceDx: snap.faceDx ?? snap.facing,
		faceDy: snap.faceDy ?? 0,
		walkPose: "front",
		idleAlt: false,
		alive: snap.alive,
		drawX: snap.x,
		drawY: snap.y,
		flash: 0,
		levelGlow: 0,
		healGlow: 0,
		healGlowKind: "potionZero",
		fade: snap.fade,
		bob: 0,
		level: snap.level,
		xp: snap.xp,
		bag: { ...snap.bag },
		spells: { ...snap.spells },
		weaponId: snap.weaponId,
		weaponEnh: snap.weaponEnh,
		size: cls?.size ?? 1,
		footprintW: cls?.footprintW,
		footprintH: cls?.footprintH,
		footprintOffsets: cls?.footprintOffsets,
		shock: snap.shock ? { ...snap.shock } : null,
		shockCharges: snap.shockCharges ?? 0,
		frostCharges: snap.frostCharges ?? (snap.side === "enemy" && classId === "cultistV2" ? frostCharges(snap.level) : 0),
		fantomForceCharges: snap.fantomForceCharges ?? (snap.side === "enemy" ? fantomForceChargesFor(classId) : 0),
		blessedHitBonusPct: snap.blessedHitBonusPct ?? 0,
		blessedRoundsLeft: snap.blessedRoundsLeft ?? 0,
		diseased: snap.diseased,
		diseaseBase: snap.diseaseBase ? { ...snap.diseaseBase } : null,
		poisoned: snap.poisoned,
		poisonTier: snap.poisonTier ?? poisonTierOf(snap.poisonFaces),
		poisonMag: snap.poisonMag ?? 0,
		poisonResist: snap.poisonResist ?? 0,
		bleeding: snap.bleeding ?? false,
		bleedRoundsLeft: snap.bleedRoundsLeft,
		bleedRoundMarker: snap.bleedRoundMarker,
		bleedMovedThisTurn: false,
		fearTurns: snap.fearTurns ?? 0,
		fearSourceId: snap.fearSourceId,
		stunned: snap.stunned,
		stunTurns: snap.stunTurns,
		crippled: snap.crippled,
		hungerPenaltyPct: snap.hungerPenaltyPct ?? 0,
		fullness: fullness(snap.fullness),
		offHandId: snap.offHandId,
		gear: { ...snap.gear },
		summoned: snap.summoned,
		asleep: snap.asleep,
		sleepTurns: snap.sleepTurns,
		guaranteedDrop: snap.guaranteedDrop,
		dialog: snap.dialog,
		moveBudgetUsed: snap.moveBudgetUsed
	};
}
/** Whether a unit gets its own turn. Neutrals hold their ground: they are placed, they can
* be attacked, and they do nothing until something wakes them (see BattleEngine.provoke). */
function takesTurns(u) {
	return u.alive && u.side !== "neutral";
}
/** Initiative modifier by archetype. Legacy class values are speed ranks, inverted into
* bonuses; dedicated agile jobs deliberately sit above every other archetype. */
function initiativeBonus(classId) {
	if (classId === "assassin") return 12;
	if (classId === "rogue") return 11;
	if (classId === "archer" || classId === "neera" || classId === "ranger") return 10;
	return 11 - (CLASSES[classId].init ?? 10);
}
/** Whether the player may swing at this unit. Enemies always; wild neutrals too — that is
* how a beast gets provoked in the first place. A neutral carrying a dialog tree is an NPC,
* not a beast — never an attack target, clicking it opens the conversation instead (see
* BattleEngine.handleCell). */
function attackableByPlayer(u) {
	if (u.dialog) return false;
	return u.alive && (u.side === "enemy" || u.side === "neutral");
}
function easeOut(t) {
	return 1 - (1 - t) * (1 - t);
}
var BattleEngine = class BattleEngine {
	/** React preserves a running battle across development updates; refresh its methods too. */
	static refreshLiveEngine(engine) {
		Object.setPrototypeOf(engine, BattleEngine.prototype);
		engine.provokeFx ??= [];
		engine.supportAffinityRecipients ??= /* @__PURE__ */ new Map();
	}
	/** Stable sprite overlap order, independent of animation sway and camera depth. */
	unitActionOrder = /* @__PURE__ */ new Map();
	unitActionSerial = 0;
	noteUnitDrawAction(id) {
		this.unitActionOrder.set(id, ++this.unitActionSerial);
	}
	mission;
	tiles;
	/** Art variant index per tile, same indexing as tiles. Undefined/missing = variant 0. */
	tileVariants;
	/** How far each tile's art is turned, in sixths of a circle. */
	tileRots;
	decorations;
	/** Permanent elemental GPU FX placed on this map in the editor — spawned once at battle
	* start and left running for the whole fight. See BattleCanvas/gfx.EffectsRenderer. */
	elementalFxPlacements;
	/** `row * cols + col` keys of tiles whose photo art is suppressed in favor of a full-cover
	* WebGL water FX (water/water2 only — see the constructor and renderGround). */
	waterFxTileKeys;
	cols;
	rows;
	units = [];
	art;
	phase = "player";
	mode = "locked";
	turn = 1;
	selectedId = null;
	inspectedId = null;
	pendingFoeId = null;
	/** The staged attack (pendingFoeId) is the off-hand strike — see stageAttack. */
	pendingAttackOffHand = false;
	threat = [];
	cursor = {
		x: 0,
		y: 0
	};
	reach = /* @__PURE__ */ new Map();
	attackFrom = /* @__PURE__ */ new Map();
	/** Active Web of Dreams patches (Conjurer tier 2) — cast, not terrain, so they live here
	* rather than on the map. Ticks down by one every startNewRound and is dropped at 0.
	* center/radius (the cast cell and hexAreaTiles' own radius) are the zone's hex-cluster
	* shape, kept alongside `cells` so BattleCanvas can size ONE WebGL "web" effect over the
	* whole zone (see webZoneRadiusTiles) instead of stamping a separate copy per hex — that
	* per-hex stamping used to be the only option and is what used to clash into a snowflake
	* cluster on anything bigger than a single hex. */
	webZones = [];
	/** Active Ice Storm damage fields, fixed to the cells covered when cast. */
	iceStormZones = [];
	/** One-shot WebGL elemental FX spawn requests queued by a landed spell hit (see
	* SPELL_ELEMENT_FX/queueElementalFx) — BattleCanvas's render loop drains this every frame
	* and calls EffectsRenderer.spawnEffect for each, since `fx` itself only exists over there.
	* Each request self-expires after its own `duration`, so nothing here needs manual removal. */
	elementalFxRequests = [];
	/** Active Aura of Protection / Intimidating Presence zones (Paladin/Heavy Knight tier 5) —
	* same fixed-cells-at-cast-time, ticks-down-every-round shape as webZones. "protection"
	* cuts damage taken by units on the caster's own side standing in the zone; "intimidation"
	* raises damage taken by units on the OTHER side — see zoneDamageMul. */
	auraZones = [];
	/** Whether the unit whose turn is currently active was standing in a web zone at the
	* START of that turn — decided once in beginUnitTurn and left alone for the rest of it
	* (see effectiveUnitForReach). */
	turnRestrained = false;
	/** Where the active unit stood when its turn began, and whether anything irreversible has
	* happened since — see undoMove. Cleared with the turn. */
	turnStart = null;
	moveSpoiled = false;
	/**
	* Cached `occupancy` map plus the layout it describes, packed one int per unit.
	*
	* `occupancy` walks every living unit and expands its footprint into a fresh Map
	* keyed by string, and it was rebuilt at each of twenty-odd call sites — eight of
	* them inside one `spellAimValid`, which `render` runs every frame while a spell
	* is aimed. At a hundred-odd multi-hex units that dominates the frame.
	*
	* The guard compares the packed layout rather than counting a version: positions
	* and aliveness are mutated in place all over this file, so a counter would need
	* a bump at every one of those sites and one missed bump hands out a stale map —
	* a unit that reads as passable when it is not. Comparing is O(units) of integer
	* work against O(units x footprint) of Map building, so it still pays, and it
	* cannot go stale. Footprint shape is fixed at spawn, so it needs no stamp; a
	* summon changes the array length, which the compare catches.
	*/
	/**
	* The two per-placement decoration switches, folded to one byte per cell.
	*
	* Rebuilt whenever the decoration list changes rather than consulted per query: a
	* rule asking about a hex must not walk every prop on the board to find out, and
	* `terrainDistanceField` asks about every cell six times over. Read through
	* `hexAt`, never directly.
	*/
	decorOverlay = /* @__PURE__ */ new Uint8Array(0);
	occCache = null;
	occStamp = [];
	/**
	* Whole-board distance fields, one per player, shared by every enemy that runs its
	* AI against the same board (see playerDistanceFields).
	*
	* `terrainDistanceField` is a Dijkstra over every cell, and runAiFor built one per
	* player for each enemy in turn. Players cannot move during the enemy phase, so
	* all of those were the same field computed again and again: at 160x160 with a
	* hundred enemies and six players that is six hundred whole-board searches per
	* round, about 45 seconds of them. Six suffice.
	*
	* `terrainVersion` is bumped by the two things that reshape the board mid-battle —
	* a smashed barricade and an opened chest — since either changes path costs.
	*/
	fieldCache = /* @__PURE__ */ new Map();
	fieldStamp = "";
	terrainVersion = 0;
	/**
	* Fog of war, one byte per cell, row-major like `tiles`.
	*
	*   0 unseen   — never in sight; drawn as nothing at all
	*   1 explored — walked past and remembered: terrain draws dim, but whatever
	*                moves through it does not, because memory is not sight
	*   2 visible  — in sight of a living party member this instant
	*
	* Empty when `mission.fog` is off, and every read goes through `visible`/`explored`
	* which answer true for everything in that case, so the twenty missions that
	* shipped before fog behave exactly as they did.
	*
	* Recomputed when the party moves rather than per frame — sight only changes when
	* someone walks, dies or the board does (see refreshVisibility).
	*/
	vis = /* @__PURE__ */ new Uint8Array(0);
	visStamp = "";
	/** Bumped every time the fog-of-war visibility grid actually changes — the renderer's fog
	* mask rebuilds only when this moves, never per frame. */
	visVersion = 0;
	/** Foes that have already spotted the party, so waking sticks. Ids rather than a
	* flag on Unit, which keeps it out of the per-unit save validation. */
	awake = /* @__PURE__ */ new Set();
	/** All living combatants, mixed by their single battle-opening initiative roll. */
	turnOrder = [];
	/** id of the unit whose turn we've already dispatched — lets the tick loop react only on change. */
	activeUnitId = null;
	orig = null;
	/** Movement already spent at the last cancel-safe point (turn start or completed action). */
	origMoveBudgetUsed = null;
	hover = null;
	lastClickAt = 0;
	lastClickCell = null;
	result = null;
	/** True when the mission's normal objective is complete or a waypoint is occupied. The
	* player confirms before ending; it flips back if a new enemy appears or the party leaves. */
	winAvailable = false;
	/** The waypoint a player unit is standing on, set alongside winAvailable by evaluateEnd.
	* The HUD and result screen use it to select the correct action and destination. */
	activeExit = null;
	/** Recheck after each player movement settles, regardless of the mission's win condition. */
	waypointCheckPending = false;
	banner = null;
	/** Ember found in chests opened mid-battle; folded into the save's Ember total on victory. */
	lootEmber = 0;
	/** Rations found in chests opened mid-battle (see useLockpick's 40% roll); folded into
	* the save's rations stock on victory, same as lootEmber. */
	lootRations = 0;
	/** Inn-quest pickups still lying on the map, and the keys collected so far this battle
	* (folded into save.questItems on victory, see GameApp's persistVictory). */
	questPickups = [];
	questFound = [];
	/** Weapon ids found in chests or off an enemy kill mid-battle; folded into the save's
	* weapon stash on victory. */
	/** Targets picked so far for a multi-missile Magic Missile, one per missile. Cleared
	* whenever aiming ends, so an abandoned cast never leaks into the next one. */
	missileTargets = [];
	lootWeapons = [];
	/** EquipmentDef ids found in chests mid-battle; folded into the save's shared gear stash
	* on victory (save.looseEquipment) — never auto-equipped onto whoever opened the chest,
	* the player assigns it to a hero afterward from the Paperdoll picker. */
	lootEquipment = [];
	/** Every weapon id the player already owns, plus anything granted mid-battle the moment
	* it's granted — checked before every loot roll so a chest or kill drop never announces
	* a weapon the player already has (it used to: the roll didn't know about ownership at
	* all, so a "found" weapon could silently vanish once persistVictory deduped it against
	* the save, with nothing to show for the mid-battle "you found X" message). */
	ownedWeapons;
	/** Rolling combat log — attacks, spells, heals, kills, and loot, newest last. Capped so
	* a long battle doesn't grow it without bound; read via getHud() for the in-battle log
	* view. */
	log = [];
	/** missionMapKey of the authored map this battle was built from — set by whoever starts the
	* battle, stamped into every snapshot (see BattleSnapshot.mapKey). */
	mapKey = "";
	/** The mission's intro dialog has already been shown for this fight. Saved in every
	* snapshot, so saving and loading never replays it (see BattleSnapshot.introDialogDone). */
	introDialogDone = false;
	/** See HudSnapshot.chestLoot — set the instant a chest opens, cleared only by
	* acknowledgeChestLoot() (the player's "Ok" on the popup), not by anything time-based. */
	chestLoot = null;
	/** See HudSnapshot.pendingDialog — set the instant a dialog-bearing NPC is clicked,
	* cleared only by acknowledgeDialog() (the player closing the popup), same convention as
	* chestLoot above. */
	pendingDialog = null;
	tip;
	lastTipSeen = null;
	tipSetAt = 0;
	time = 0;
	trauma = 0;
	hitstop = 0;
	zoom = 1;
	/** Camera elevation above the board plane, in degrees. */
	cameraTilt = 0;
	/** Horizontal camera orbit around the board center, in degrees. */
	cameraTiltSide = 0;
	/** Opt-in spatial terrain, upright sprites and scenery for the tactics camera. */
	tacticsCamera = false;
	/** How long a unit takes to glide across one hex — "normal" is the default, readable
	* pace; "fast" is the old, snappier speed for players who prefer it. Toggled from the
	* pause menu, applies to the very next step (mid-step changes aren't jarring since a
	* step is at most a quarter second). */
	speedMode = "normal";
	camX = 0;
	camY = 0;
	/** The Three scene owns architecture even while sprite props move to the FX overlay. */
	architectureRenderedInThree = false;
	/** Off (0) in battle. The editor preview opts into a small edge rim so camera focus near
	* the board boundary does not expose half a viewport of empty void. */
	previewPanMarginRadii = 0;
	viewW = 1;
	viewH = 1;
	camReady = false;
	/** This frame's screen-shake offset, rolled once in renderGround and reused (not
	* re-rolled) by renderUnitsAndOverlays, so the two layers shake together instead of
	* jittering apart when they're drawn onto separate canvases (see BattleCanvas's FX
	* overlay) — two independent `Math.random()` calls would desync them. */
	frameShakeDx = 0;
	frameShakeDy = 0;
	queue = [];
	active = null;
	/** Queue steps whose long-sheet wind-up already played (see startSeq), with how many
	* seconds of the sheet it covered — the step picks the pose up from there. */
	woundUp = /* @__PURE__ */ new WeakMap();
	/** Monster hit/death cues already played, per unit (see tick and audio.ts MONSTER_SFX). */
	monsterSoundCues = /* @__PURE__ */ new WeakMap();
	/** Hits taken so far, per unit, for sprites with a second hit sheet (see hitPoolFor). */
	hitSheetCounts = /* @__PURE__ */ new WeakMap();
	/** Plague Bearing Cattle death cues already played (see tick). */
	cattleDeathCued = /* @__PURE__ */ new WeakSet();
	/** Carnivorous Plant hit/death cues already played, per unit (see tick). */
	plantSoundCues = /* @__PURE__ */ new WeakMap();
	/** Work a queued step defers until it really starts (after any wind-up) — e.g. a summon's
	* familiar appearing. Run once, then dropped. */
	onSeqStart = /* @__PURE__ */ new WeakMap();
	/** Units already charged Bleeding for the action currently playing (see startSeq). */
	bleedChargedIds = /* @__PURE__ */ new Set();
	/** Queued move steps that are Bull Rush charges (see castBullRush / startSeq). */
	chargeMoves = /* @__PURE__ */ new WeakSet();
	particles = Array.from({ length: PARTICLE_CAP }, blankParticle);
	particleLive = 0;
	levelUpFx = Array.from({ length: LEVEL_UP_FX_CAP }, blankLevelUpSpark);
	levelUpFxLive = 0;
	missileFx = Array.from({ length: MISSILE_FX_CAP }, blankMissileFx);
	missileFxLive = 0;
	fireballBurstFx = Array.from({ length: FIREBALL_BURST_CAP }, blankFireballBurstFx);
	fireballBurstFxLive = 0;
	lightningFx = Array.from({ length: LIGHTNING_FX_CAP }, blankLightningFx);
	lightningFxLive = 0;
	holyFx = Array.from({ length: HOLY_FX_CAP }, blankHolyFx);
	holyFxLive = 0;
	turnUndeadFx = [];
	provokeFx = [];
	bladeFx = Array.from({ length: BLADE_FX_CAP }, blankBladeFx);
	bladeFxLive = 0;
	portalFx = Array.from({ length: PORTAL_FX_CAP }, blankPortalFx);
	portalFxLive = 0;
	/** 0-1: how visible the movement/range grid is right now (see OVERLAY_FADE_IN). Read by
	* both renderers when they draw boardOverlayLayers. */
	overlayFade = 1;
	/** Flips each time Double Strike lands, so its two hits swoosh opposite diagonals and read
	* as one crossing pair of slashes rather than the same cut drawn twice. */
	doubleStrikeAlt = false;
	onNextIdle = null;
	rng;
	listeners = /* @__PURE__ */ new Set();
	reducedMotion = false;
	layout = {
		ox: 0,
		oy: 0,
		tile: 48,
		cols: 8,
		rows: 7
	};
	spellArmed = false;
	spellAim = null;
	spellKind = null;
	/** Set while mode === "awaitPotion": which potion the selected unit is about to use on
	* whichever valid target (self or an adjacent ally — see confirmPotionAt) is tapped next. */
	potionAim = null;
	/** After a mid-battle load, the next beginUnitTurn must not re-run start-of-turn effects
	* (echo, poison, stun skip) — those already happened on the turn we saved in the middle of. */
	skipStartOfTurn = false;
	/** Test-mode-only: drops every ally/enemy/condition restriction on who a spell can target
	* (targetable's side check, healing/curing an enemy, aiming at a full-HP or undiseased
	* unit) so a debug session can freely fire any spell at any unit just to look at its FX,
	* without the normal "that's not a valid target" gameplay rules getting in the way. Wired
	* from GameApp's testMode — never true for a real save. */
	debugFreeCast = false;
	frostVfxRequests = [];
	fireballVfxRequests = [];
	fireballVfxEvents = [];
	fireballVfxAvailable = false;
	fireballVfxSequence = 0;
	causticVenomVfxRequests = [];
	causticVenomVfxEvents = [];
	causticVenomVfxAvailable = false;
	causticVenomVfxSequence = 0;
	phantasmalForceVfxRequests = [];
	phantasmalForceVfxEvents = [];
	phantasmalForceVfxAvailable = false;
	phantasmalForceVfxSequence = 0;
	blessVfxRequests = [];
	blessVfxEvents = [];
	blessTimelineEvents = [];
	blessVfxAvailable = false;
	blessVfxSequence = 0;
	magicMissileV2VfxRequests = [];
	magicMissileV2VfxEvents = [];
	magicMissileV2TimelineEvents = [];
	magicMissileV2VfxAvailable = false;
	magicMissileV2VfxSequence = 0;
	burningHandsV2VfxRequests = [];
	burningHandsV2VfxEvents = [];
	burningHandsV2VfxAvailable = false;
	burningHandsV2VfxSequence = 0;
	varreduraVfxRequests = [];
	varreduraVfxSequence = 0;
	cleaveVfxRequests = [];
	cleaveVfxSequence = 0;
	affinityScores = {};
	heroSkills = {};
	partyLeader = "Kael";
	supportAffinityRecipients = /* @__PURE__ */ new Map();
	adjacentAllies(u) {
		return this.units.filter((ally) => ally.id !== u.id && ally.alive && ally.side === "player" && !ally.summoned && footprint(u).some((a) => footprint(ally).some((b) => hexDist(a, b) === 1)));
	}
	affinityUnit(u) {
		if (u.side !== "player" || u.summoned || !u.alive) return u;
		const bonus = Math.max(0, ...this.adjacentAllies(u).map((ally) => affinityBonus(affinityScore(this.affinityScores, u.name, ally.name))));
		return bonus ? {
			...u,
			atk: u.atk * (1 + bonus),
			mag: u.mag * (1 + bonus),
			def: u.def * (1 + bonus),
			dex: u.dex * (1 + bonus)
		} : u;
	}
	/** Enmity (enmity.ts): each enemy's score per player-side unit. Drives enemy targeting. */
	enmity = /* @__PURE__ */ new Map();
	addEnmity(foe, hero, ce, ve) {
		if (foe.side !== "enemy" || hero.side !== "player" || !foe.alive || !hero.alive) return;
		const row = this.enmity.get(foe.id) ?? /* @__PURE__ */ new Map();
		row.set(hero.id, addToEntry(row.get(hero.id), ce, ve));
		this.enmity.set(foe.id, row);
	}
	/** Damage in either direction: a hero hurting an enemy raises their enmity with it (spells
	* more than weapons); an enemy hurting a hero wears that hero's cumulative enmity down. */
	noteDamageEnmity(attacker, target, dmg, kind) {
		if (dmg <= 0) return;
		if (attacker.side === "player" && target.side === "enemy") {
			const k = ENMITY[kind];
			this.addEnmity(target, attacker, dmg * k.ce, dmg * k.ve);
		} else if (attacker.side === "enemy" && target.side === "player") {
			const entry = this.enmity.get(attacker.id)?.get(target.id);
			if (entry) this.enmity.get(attacker.id).set(target.id, addToEntry(entry, -dmg * ENMITY.damageTakenCe, 0));
		}
	}
	/** Heals and support skills are noticed by every enemy already aware of the party. */
	noteAwareEnmity(hero, ce, ve) {
		if (hero.side !== "player") return;
		for (const foe of this.units) {
			if (foe.side !== "enemy" || !foe.alive) continue;
			if (this.fogged && !this.awake.has(foe.id)) continue;
			this.addEnmity(foe, hero, ce, ve);
		}
	}
	/** Whoever tops this enemy's enmity table, or null while it has none (usual targeting). */
	enmityTarget(foe) {
		const row = this.enmity.get(foe.id);
		if (!row) return null;
		let best = null;
		let bestTotal = 0;
		for (const [heroId, entry] of row) {
			const hero = this.units.find((u) => u.id === heroId);
			if (!hero || !hero.alive || hero.side !== "player") continue;
			const total = enmityTotal(entry);
			if (total > bestTotal) {
				best = hero;
				bestTotal = total;
			}
		}
		return best;
	}
	adjustAffinity(a, b, delta) {
		if (a.id === b.id || a.side !== "player" || b.side !== "player" || a.summoned || b.summoned) return;
		this.adjustHeroAffinity(a.name, b.name, delta, false);
	}
	gainSupportAffinity(actor, target) {
		if (actor.side !== "player" || target.side !== "player" || actor.summoned || target.summoned) return;
		const recipients = this.supportAffinityRecipients.get(actor.id) ?? /* @__PURE__ */ new Set();
		if (recipients.has(target.id)) return;
		recipients.add(target.id);
		this.supportAffinityRecipients.set(actor.id, recipients);
		this.adjustAffinity(actor, target, .2);
	}
	/** Each completed action builds affinity with heroes fighting beside its actor. */
	gainAdjacentAffinity(u) {
		if (u.acted || !u.alive || u.side !== "player" || u.summoned) return;
		const recipients = this.supportAffinityRecipients.get(u.id);
		for (const ally of this.adjacentAllies(u)) if (!recipients?.has(ally.id)) this.adjustAffinity(u, ally, .1);
		this.supportAffinityRecipients.delete(u.id);
	}
	adjustHeroAffinity(a, b, delta, dialogue = true) {
		if (a === b || delta === 0 || !AFFINITY_HEROES.includes(a) || !AFFINITY_HEROES.includes(b)) return;
		if (dialogue && delta > 0 && (a === this.partyLeader || b === this.partyLeader)) delta = Math.round(delta * (2 - affinityScore(this.affinityScores, a, b) / 100) * 100) / 100;
		this.affinityScores = changeAffinity(this.affinityScores, a, b, delta);
		this.pushLog(`Afinidade ${a} + ${b}: ${delta > 0 ? "+" : ""}${delta.toLocaleString("pt-BR")}`);
	}
	applyDialogAffinity(reply) {
		if (reply.affinity) this.adjustHeroAffinity(reply.affinity.from, reply.affinity.to, reply.affinity.delta);
	}
	constructor(mission, art, roster, seed = 1, debugFreeCast = false) {
		this.affinityScores = cleanAffinityScores(roster.affinityScores);
		this.heroSkills = cleanHeroSkills(roster.heroSkills, Object.keys(roster.heroSkills ?? {}));
		this.partyLeader = roster.partyLeader ?? "Kael";
		this.debugFreeCast = debugFreeCast;
		this.mission = mission;
		this.art = art;
		this.ownedWeapons = new Set(roster.ownedWeaponIds ?? []);
		this.cols = mission.cols;
		this.rows = mission.rows;
		this.tiles = parseLayout(mission.layout);
		this.tileVariants = mission.tileVariants ?? [];
		this.tileRots = mission.tileRots ?? [];
		this.decorations = (mission.decorations ?? []).map((d) => ({ ...d }));
		this.decorations = closeWatchtowerWalls(mission.id, this.tiles, this.cols, this.rows, this.decorations);
		this.tiles = clearRockColumnTiles(this.tiles, this.cols, this.rows, this.decorations, mission.baseTile);
		this.elementalFxPlacements = (mission.elementalFx ?? []).map((p) => ({ ...p }));
		const WATER_FAMILY = /* @__PURE__ */ new Set(["water", "water2"]);
		this.waterFxTileKeys = new Set(this.elementalFxPlacements.filter((p) => WATER_FAMILY.has(p.kind)).map((p) => p.y * this.cols + p.x));
		for (const p of this.decorations) {
			if (DECORATIONS[p.id]?.model3d) continue;
			const artId = decorationPlacementArt(p);
			if (this.art.decorations[artId]?.naturalWidth) continue;
			const img = new Image();
			img.src = decorationImage(artId);
			decorationImageRetryWebp(img, artId);
			this.art.decorations[artId] = img;
		}
		for (const p of this.decorations) {
			const def = DECORATIONS[p.id];
			if (!def?.tile) continue;
			for (const { dx, dy } of placedFootprint(p)) {
				const x = p.x + dx;
				const y = p.y + dy;
				if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) this.tiles[y * this.cols + x] = def.tile;
			}
		}
		if (this.landShoreFxDebugEnabled()) {
			const occupied = new Set(this.elementalFxPlacements.map((p) => p.y * this.cols + p.x));
			for (const p of this.decorations) for (const { dx, dy } of placedFootprint(p)) occupied.add((p.y + dy) * this.cols + (p.x + dx));
			for (let wy = 0; wy < this.rows; wy++) for (let wx = 0; wx < this.cols; wx++) {
				const key = wy * this.cols + wx;
				if (this.tiles[key] !== "water" || occupied.has(key)) continue;
				this.elementalFxPlacements.push({
					id: `fx-synth-water-${key}`,
					kind: "water",
					x: wx,
					y: wy
				});
			}
			this.waterFxTileKeys = new Set(this.elementalFxPlacements.filter((p) => WATER_FAMILY.has(p.kind)).map((p) => p.y * this.cols + p.x));
		}
		this.decorations.push(...barricadeDecor(this.tiles, this.cols, this.rows, this.decorations));
		this.refreshDecorOverlay();
		this.rng = mulberry32(seed + mission.index * 97);
		const defeatedCrossingSpawns = new Set(roster.crossingDefeatedSpawns ?? []);
		this.questPickups = (roster.questPickups ?? []).map((p) => ({ ...p }));
		this.units = [
			...mission.playerSpawns.filter((s) => !heroUnconscious(s.name, roster)).map((s, i) => spawnUnit(s, "player", i, roster)),
			...mission.enemySpawns.flatMap((s, i) => {
				const id = `enemy-${s.name}-${i}`;
				return defeatedCrossingSpawns.has(id) ? [] : [spawnUnit(s, "enemy", i, roster, enemyLevelFor(mission.index))];
			}),
			...this.uniqueNeutralNpcSpawns(mission.neutralSpawns ?? []).flatMap(({ spawn: s, index: i }) => {
				const id = `neutral-${s.name}-${i}`;
				return defeatedCrossingSpawns.has(id) ? [] : [spawnUnit(s, "neutral", i, roster, enemyLevelFor(mission.index))];
			})
		];
		for (const u of this.units) {
			this.nudgeOffHazard(u);
			if (u.side === "player") this.nudgeOffWaypoint(u);
			u.bob = this.rng() * 16;
		}
		this.rollOpeningInitiative(this.units.filter(takesTurns));
		this.turnOrder = this.sortByInitiative(this.units.filter(takesTurns));
		const first = this.units.find((u) => u.side === "player");
		if (first) this.cursor = {
			x: first.x,
			y: first.y
		};
		this.tip = mission.index === 0 ? "Toque numa aliada para mover. Toque num inimigo para ver HP e alcance." : mission.win === "boss" ? "Objetivo: o capitão. Toque nele para ver a área de perigo." : "Toque num inimigo para ver HP, alcance e onde ele pode atacar.";
		if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) this.reducedMotion = true;
		this.evaluateEnd();
	}
	/** One battle-opening roll per unit: 1d20 + its archetype modifier. The class data's
	* historical scale is a delay (1 fast .. 10 slow), so 11-delay is the additive bonus. */
	rollOpeningInitiative(units) {
		for (const unit of units) {
			unit.initiativeRoll = 1 + Math.floor(this.rng() * 20);
			unit.initiative = unit.initiativeRoll + initiativeBonus(unit.classId);
		}
	}
	/** Highest opening initiative first. On an exact draw, the player wins. */
	sortByInitiative(units) {
		return [...units].sort((a, b) => {
			if (a.initiative !== b.initiative) return b.initiative - a.initiative;
			if (a.side !== b.side) return a.side === "player" ? -1 : 1;
			return a.id.localeCompare(b.id);
		}).map((u) => u.id);
	}
	subscribe(fn) {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}
	emit() {
		for (const fn of this.listeners) fn();
	}
	/** How many targets an aimed spell still wants, for a spell that picks more than one.
	*
	* Magic Missile fires 2 missiles at level 3 and 3 at level 6, each aimed separately, and
	* the only thing that ever said so was the tip line at the bottom of the screen — small,
	* grey, and easy to walk straight past while wondering why the spell hasn't gone off. The
	* HUD puts this where it has to be read. Null for a single-target cast, which needs no
	* counting. */
	targetPrompt() {
		if (this.spellKind !== "magicMissile") return null;
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u) return null;
		const need = magicMissileCount(u.level);
		return need > 1 ? {
			name: MAGIC_MISSILE.name,
			need,
			picked: this.missileTargets.length
		} : null;
	}
	getHud() {
		const selected = this.units.find((u) => u.id === this.selectedId) ?? null;
		const hoverCell = this.hover ?? this.cursor;
		const hoverUnit = hoverCell ? this.units.find((u) => u.alive && occupies(u, hoverCell.x, hoverCell.y)) : void 0;
		const terr = hoverCell && tileAt(this.tiles, this.cols, hoverCell.x, hoverCell.y) !== "void" && this.explored(hoverCell.x, hoverCell.y) ? this.hexAt(hoverCell.x, hoverCell.y) : null;
		const hoveredWeb = hoverCell ? this.webZones.filter((zone) => zone.cells.has(key(hoverCell.x, hoverCell.y))).reduce((best, zone) => !best || zone.roundsLeft > best.roundsLeft ? zone : best, null) : null;
		const hoveredIceStorm = hoverCell ? this.iceStormZones.filter((zone) => zone.cells.has(key(hoverCell.x, hoverCell.y))).reduce((best, zone) => !best || zone.roundsLeft > best.roundsLeft ? zone : best, null) : null;
		const inspected = this.units.find((u) => u.id === this.inspectedId) ?? null;
		const pendingFoe = this.units.find((u) => u.id === this.pendingFoeId) ?? null;
		const foeForForecast = pendingFoe ?? (this.targetable(inspected ?? void 0) ? inspected : null);
		let forecast = null;
		if (selected && foeForForecast && selected.side === "player") {
			const offHandItem = EQUIPMENT[selected.offHandId ?? ""];
			const offHandAttack = pendingFoe ? this.pendingAttackOffHand : this.mode === "awaitOffHand" || this.mode !== "awaitSpell" && offHandItem?.kind === "weapon" && this.isArrowAttack(selected) && hexDist(selected, foeForForecast) <= (offHandItem.maxRange ?? 1);
			const from = offHandAttack ? void 0 : this.attackFrom.get(foeForForecast.id);
			const fx = from?.x ?? selected.x;
			const fy = from?.y ?? selected.y;
			const fake = {
				...selected,
				x: fx,
				y: fy
			};
			forecast = makeForecast(this.affinityUnit(fake), this.affinityUnit(foeForForecast), tileAt(this.tiles, this.cols, fx, fy), tileAt(this.tiles, this.cols, foeForForecast.x, foeForForecast.y), this.tiles, this.cols, offHandAttack && offHandItem?.kind === "weapon", !(offHandAttack && offHandItem?.kind === "shield") && (this.mode !== "awaitSpell" || isWeaponAbility(this.spellKind)));
		}
		const canAttack = !!selected && !selected.acted && (this.attackFrom.size > 0 || this.units.some((u) => u.alive && u.side !== selected.side && canHitFrom(selected, selected, u, this.tiles, this.cols, this.decorOverlay)));
		const canLockpick = !!selected && !selected.acted && selected.bag.lockpick > 0 && !!this.adjacentLock(selected);
		const offHandKind = selected && !selected.acted && selected.offHandId ? EQUIPMENT[selected.offHandId]?.kind ?? null : null;
		return {
			phase: this.phase,
			banner: this.banner,
			selected: selected ? pub(this.affinityUnit(selected), this.isWebCell(selected.x, selected.y), this.movLeft(selected)) : null,
			hoveredUnit: hoverUnit ? pub(hoverUnit, this.isWebCell(hoverUnit.x, hoverUnit.y), this.movLeft(hoverUnit)) : null,
			terrain: terr ? {
				id: terr.id,
				name: terr.name,
				moveCost: terr.moveCost,
				def: terr.def,
				atk: terr.atk,
				passable: terr.passable,
				blocksShot: !!terr.blocksShot,
				hazard: terr.hazardDice ? `${terr.hazardDice}d${terr.hazardFaces ?? 8}` : void 0,
				note: hoveredWeb || hoveredIceStorm ? void 0 : terrainNote(terr.id),
				spellZone: hoveredWeb ? {
					kind: "webOfDreams",
					roundsLeft: hoveredWeb.roundsLeft,
					movementCap: 1,
					sleepChance: hoveredWeb.sleepChance ?? WEB_OF_DREAMS.sleepChance,
					sleepDice: diceFormula(WEB_OF_DREAMS.sleepDice, WEB_OF_DREAMS.sleepFaces, 0)
				} : hoveredIceStorm ? {
					kind: "iceStorm",
					roundsLeft: hoveredIceStorm.roundsLeft,
					damageFormula: iceStormFormula(hoveredIceStorm.casterLevel, hoveredIceStorm.casterMag)
				} : void 0
			} : null,
			mode: this.mode,
			canAttack,
			offHandKind,
			canLockpick,
			forecast,
			turn: this.turn,
			objective: this.mission.objective,
			missionTitle: this.mission.title,
			playerAlive: this.units.filter((u) => u.side === "player" && u.alive && !u.summoned).length,
			enemyAlive: this.units.filter((u) => u.side === "enemy" && u.alive && !this.unitHidden(u)).length,
			busy: this.mode === "locked" || !!this.active || this.queue.length > 0,
			canCancelMovement: this.active?.type === "move" && !!this.selectedId && this.active.id === this.selectedId && this.units.some((u) => u.id === this.selectedId && u.side === "player" && u.alive) || this.canCancelCommittedMovement(),
			result: this.result,
			winAvailable: this.winAvailable,
			activeExit: this.activeExit,
			canUndoMove: this.canUndoMove(),
			targetPrompt: this.targetPrompt(),
			zoom: this.zoom,
			speedMode: this.speedMode,
			tip: this.tip,
			inspected: inspected ? pub(inspected, this.isWebCell(inspected.x, inspected.y), this.movLeft(inspected)) : pendingFoe ? pub(pendingFoe, this.isWebCell(pendingFoe.x, pendingFoe.y), this.movLeft(pendingFoe)) : null,
			pendingFoe: pendingFoe ? pub(pendingFoe, this.isWebCell(pendingFoe.x, pendingFoe.y), this.movLeft(pendingFoe)) : null,
			spellReady: this.mode === "awaitSpell" && !!selected && (this.spellKind === "sweep" || this.spellKind === "turnUndead" || !!this.hover && this.spellAimValid(selected, this.hover)),
			spellArmed: this.mode === "awaitSpell" && !!selected && this.spellArmed && !!this.spellAim,
			spellHitChance: (() => {
				if (this.mode !== "awaitSpell" || !selected || !this.spellArmed || !this.spellAim || !isWeaponAbility(this.spellKind)) return null;
				const foe = this.occ().get(key(this.spellAim.x, this.spellAim.y));
				if (!foe || foe.side === selected.side || !this.targetable(foe)) return null;
				return makeForecast(this.affinityUnit(selected), this.affinityUnit(foe), tileAt(this.tiles, this.cols, selected.x, selected.y), tileAt(this.tiles, this.cols, foe.x, foe.y), this.tiles, this.cols, false, true).hitOut;
			})(),
			spellKind: this.mode === "awaitSpell" ? this.spellKind : null,
			turnQueue: (() => {
				const active = this.activeTurnUnit();
				return this.turnOrder.map((id) => this.units.find((u) => u.id === id)).filter((u) => !!u && u.alive && !this.unitHidden(u)).map((u) => ({
					id: u.id,
					name: u.name,
					side: u.side,
					acted: u.moved,
					active: u.id === active?.id,
					initiative: u.initiative
				}));
			})(),
			log: this.log,
			chestLoot: this.chestLoot,
			pendingDialog: this.pendingDialog
		};
	}
	/** The player's "Ok" on the chest loot popup — see HudSnapshot.chestLoot. */
	acknowledgeChestLoot() {
		this.chestLoot = null;
	}
	/** Opens an NPC's conversation — see handleCell's dialog branch. Always starts fresh from
	* the tree's own startId; NPC dialog replays in full every time, no "already talked to"
	* state kept. */
	openDialog(tree) {
		this.pendingDialog = tree;
	}
	/** The player closing the dialog popup — see HudSnapshot.pendingDialog. */
	acknowledgeDialog() {
		this.pendingDialog = null;
	}
	battlePlayerHunger() {
		return Object.fromEntries(this.units.filter((u) => u.side === "player" && !u.summoned).map((u) => [u.name, u.fullness]));
	}
	battlePlayerHp() {
		const out = {};
		for (const u of this.units) {
			if (u.side !== "player" || u.summoned) continue;
			out[u.name] = u.alive ? u.hp : 0;
		}
		return out;
	}
	remainingPlayerHp() {
		const out = {};
		for (const u of this.units) {
			if (u.side !== "player" || u.summoned) continue;
			if (!u.alive) out[u.name] = Math.max(1, Math.ceil(u.maxHp * .5));
			else out[u.name] = Math.min(u.maxHp, u.hp + Math.ceil((u.maxHp - u.hp) * .5));
		}
		return out;
	}
	remainingBags() {
		const out = {};
		for (const u of this.units) {
			if (u.side !== "player" || u.summoned) continue;
			out[u.name] = { ...u.bag };
		}
		return out;
	}
	/** Hands a found potion to `starter` (the one who opened the chest), or — if their bag for
	* that kind is already full — to the next living party member who will act, walking the
	* current initiative order and wrapping into the next round. Returns the unit who took it,
	* or null if the whole party is capped out so the drop is discarded. */
	givePotion(starter, kind) {
		const cap = POTION_CARRY_MAX[kind];
		const orderIds = this.turnOrder.length > 0 ? this.turnOrder : this.units.map((u) => u.id);
		const startIdx = Math.max(0, orderIds.indexOf(starter.id));
		const sequenced = [];
		const seen = /* @__PURE__ */ new Set();
		for (let i = 0; i < orderIds.length; i++) {
			const id = orderIds[(startIdx + i) % orderIds.length];
			const u = this.units.find((x) => x.id === id);
			if (!u || seen.has(u.id)) continue;
			seen.add(u.id);
			sequenced.push(u);
		}
		for (const u of this.units) {
			if (seen.has(u.id)) continue;
			sequenced.push(u);
		}
		for (const target of sequenced) {
			if (target.side !== "player" || !target.alive) continue;
			const have = target.bag[kind] ?? 0;
			if (have < cap) {
				target.bag[kind] = have + 1;
				return target;
			}
		}
		return null;
	}
	/** Hero name → tier key → spell uses spent so far this scenario, for persisting into
	* save.spellUses (see Roster.spellSpent) — recomputed as the current class/level cap
	* minus whatever's left, so a level-up mid-battle naturally reflects the bigger cap
	* instead of needing its own bookkeeping. */
	spentTiers() {
		const out = {};
		for (const u of this.units) {
			if (u.side !== "player") continue;
			const perTier = {};
			for (let t = 1; t <= 10; t++) {
				const key = tierKey(t);
				const cap = tierUses(u.classId, t, u.level);
				const left = Number.isFinite(u.spells[key]) ? u.spells[key] : 0;
				perTier[key] = Math.max(0, cap - left);
			}
			out[u.name] = perTier;
		}
		return out;
	}
	/** Freeze the live board so a save can resume this fight instead of restarting it. */
	captureSnapshot() {
		const units = this.units.map((u) => {
			return {
				id: u.id,
				name: u.name,
				classId: u.classId,
				side: u.side,
				x: Math.round(u.x),
				y: Math.round(u.y),
				hp: u.hp,
				escaped: u.escaped,
				maxHp: u.maxHp,
				atk: u.atk,
				mag: u.mag,
				def: u.def,
				dex: u.dex,
				resistances: { ...u.resistances },
				weaponSkills: { ...u.weaponSkills },
				healingSkill: u.healingSkill ?? 0,
				initiative: u.initiative,
				initiativeRoll: u.initiativeRoll,
				statPointAllocation: { ...u.statPointAllocation },
				mov: u.mov,
				minRange: u.minRange,
				maxRange: u.maxRange,
				moved: u.moved,
				acted: u.acted,
				facing: u.facing,
				faceDx: u.faceDx,
				faceDy: u.faceDy,
				alive: u.alive,
				fade: u.fade,
				level: u.level,
				xp: u.xp,
				bag: { ...u.bag },
				spells: { ...u.spells },
				weaponId: u.weaponId,
				weaponEnh: u.weaponEnh,
				shock: u.shock ? { ...u.shock } : null,
				shockCharges: u.shockCharges ?? 0,
				frostCharges: u.frostCharges,
				fantomForceCharges: u.fantomForceCharges,
				blessedHitBonusPct: u.blessedHitBonusPct,
				blessedRoundsLeft: u.blessedRoundsLeft,
				diseased: u.diseased,
				diseaseBase: u.diseaseBase ? { ...u.diseaseBase } : null,
				poisoned: u.poisoned,
				poisonTier: u.poisonTier,
				poisonMag: u.poisonMag,
				poisonResist: u.poisonResist,
				bleeding: u.bleeding,
				bleedRoundsLeft: u.bleedRoundsLeft,
				bleedRoundMarker: u.bleedRoundMarker,
				fearTurns: u.fearTurns,
				fearSourceId: u.fearSourceId,
				stunned: u.stunned,
				stunTurns: u.stunTurns,
				crippled: u.crippled,
				hungerPenaltyPct: u.hungerPenaltyPct,
				fullness: u.fullness,
				offHandId: u.offHandId,
				gear: { ...u.gear },
				summoned: u.summoned,
				asleep: u.asleep,
				sleepTurns: u.sleepTurns,
				guaranteedDrop: u.guaranteedDrop,
				dialog: u.dialog,
				moveBudgetUsed: u.moveBudgetUsed,
				useClassSprite: u.useClassSprite
			};
		});
		if (this.active || this.queue.length > 0) {
			const active = this.activeTurnUnit();
			const snap = active ? units.find((u) => u.id === active.id) : void 0;
			if (snap) {
				snap.acted = true;
				if (this.phase === "enemy" || snap.mov - snap.moveBudgetUsed <= 0) snap.moved = true;
			}
		}
		return {
			affinityScores: { ...this.affinityScores },
			heroSkills: structuredClone(this.heroSkills),
			missionId: this.mission.id,
			mapKey: this.mapKey || void 0,
			introDialogDone: this.introDialogDone,
			enmity: enmityToSnapshot(this.enmity),
			turn: this.turn,
			phase: this.phase,
			units,
			tiles: [...this.tiles],
			decorations: this.decorations.map((d) => ({ ...d })),
			turnOrder: [...this.turnOrder],
			activeUnitId: this.activeTurnUnit()?.id ?? this.activeUnitId,
			selectedId: this.selectedId,
			lootEmber: this.lootEmber,
			lootRations: this.lootRations,
			questFound: [...this.questFound],
			lootWeapons: [...this.lootWeapons],
			lootEquipment: [...this.lootEquipment],
			ownedWeapons: [...this.ownedWeapons],
			webZones: this.webZones.map((z) => ({
				cells: [...z.cells],
				roundsLeft: z.roundsLeft,
				center: z.center,
				radius: z.radius,
				sleepChance: z.sleepChance
			})),
			iceStormZones: this.iceStormZones.map((z) => ({
				...z,
				cells: [...z.cells],
				center: { ...z.center }
			})),
			auraZones: this.auraZones.map((z) => ({
				cells: [...z.cells],
				roundsLeft: z.roundsLeft,
				kind: z.kind,
				side: z.side,
				pct: z.pct
			})),
			log: [...this.log],
			winAvailable: this.winAvailable,
			chestLoot: this.chestLoot ? {
				unitName: this.chestLoot.unitName,
				ember: this.chestLoot.ember,
				items: this.chestLoot.items.map((i) => ({ ...i }))
			} : null,
			pendingDialog: this.pendingDialog,
			turnRestrained: this.turnRestrained,
			turnBegan: !!this.activeTurnUnit() && this.activeUnitId === this.activeTurnUnit()?.id,
			explored: this.snapshotExplored(),
			awake: this.fogged && this.awake.size > 0 ? [...this.awake] : void 0
		};
	}
	/** Overlay a saved fight onto this engine (which has already constructed the mission). */
	applySnapshot(snap) {
		this.affinityScores = cleanAffinityScores(snap.affinityScores ?? this.affinityScores);
		this.heroSkills = cleanHeroSkills(snap.heroSkills ?? this.heroSkills, Object.keys(snap.heroSkills ?? this.heroSkills));
		if (snap.missionId !== this.mission.id) return;
		if (snap.tiles.length === this.tiles.length) {
			for (let i = 0; i < snap.tiles.length; i++) this.tiles[i] = snap.tiles[i];
			this.terrainVersion++;
		}
		this.decorations.splice(0, this.decorations.length, ...snap.decorations.map((d) => ({ ...d })));
		const cleanedTiles = clearRockColumnTiles(this.tiles, this.cols, this.rows, this.decorations, this.mission.baseTile);
		for (let i = 0; i < cleanedTiles.length; i++) this.tiles[i] = cleanedTiles[i];
		this.refreshDecorOverlay();
		const needsOpeningInitiative = snap.units.some((unit) => unit.initiative == null || unit.initiativeRoll == null);
		this.units = snap.units.map((saved) => {
			const unit = unitFromSnap(saved);
			if (unit.side === "player" && !unit.summoned) {
				for (const type of weaponTypesForClass(unit.classId)) {
					const id = `${type}Weapon`;
					if (this.heroSkills[unit.name]?.[id] == null && saved.weaponSkills?.[type] != null) this.heroSkills[unit.name] = {
						...this.heroSkills[unit.name],
						[id]: saved.weaponSkills[type]
					};
				}
				this.heroSkills = cleanHeroSkills(this.heroSkills, Object.keys(this.heroSkills));
				unit.weaponSkills = trainedWeaponSkills(this.heroSkills, unit.name, unit.classId);
				unit.healingSkill = skillValue(this.heroSkills, unit.name, "healing");
			}
			if (!saved.resistances && unit.side === "player" && !unit.summoned) unit.resistances = sumResistances(CLASSES[unit.classId]?.resistances, gearStatBonus(Object.values(unit.gear)).resistances, skillResistances(this.heroSkills, unit.name));
			return unit;
		});
		this.invalidateOcc();
		this.turn = snap.turn;
		this.phase = snap.phase;
		if (needsOpeningInitiative) {
			const actingUnits = this.units.filter(takesTurns);
			this.rollOpeningInitiative(actingUnits);
			this.turnOrder = this.sortByInitiative(actingUnits);
		} else this.turnOrder = [...snap.turnOrder];
		this.lootEmber = snap.lootEmber;
		this.lootRations = snap.lootRations ?? 0;
		this.questFound = [...snap.questFound ?? []];
		this.questPickups = this.questPickups.filter((p) => !this.questFound.includes(p.key));
		this.lootWeapons = [...snap.lootWeapons];
		this.lootEquipment = [...snap.lootEquipment];
		this.ownedWeapons = new Set(snap.ownedWeapons);
		this.webZones = snap.webZones.map((z) => ({
			cells: new Set(z.cells),
			roundsLeft: z.roundsLeft,
			center: z.center,
			radius: z.radius,
			sleepChance: z.sleepChance
		}));
		this.iceStormZones = (snap.iceStormZones ?? []).map((z) => ({
			...z,
			cells: new Set(z.cells),
			center: { ...z.center }
		}));
		this.auraZones = snap.auraZones.map((z) => ({
			cells: new Set(z.cells),
			roundsLeft: z.roundsLeft,
			kind: z.kind,
			side: z.side,
			pct: z.pct
		}));
		this.log = [...snap.log];
		this.winAvailable = snap.winAvailable;
		this.waypointCheckPending = true;
		this.chestLoot = snap.chestLoot ? {
			unitName: snap.chestLoot.unitName,
			ember: snap.chestLoot.ember,
			items: snap.chestLoot.items.map((i) => ({ ...i }))
		} : null;
		this.pendingDialog = snap.pendingDialog;
		this.introDialogDone = snap.introDialogDone ?? true;
		this.enmity = enmityFromSnapshot(snap.enmity);
		this.turnRestrained = snap.turnRestrained;
		this.result = null;
		this.queue.length = 0;
		this.active = null;
		this.mode = "locked";
		this.selectedId = null;
		this.pendingFoeId = null;
		this.inspectedId = null;
		this.spellKind = null;
		this.spellArmed = false;
		this.spellAim = null;
		this.potionAim = null;
		this.missileTargets = [];
		this.hover = null;
		this.reach.clear();
		this.attackFrom.clear();
		this.threat = [];
		this.orig = null;
		this.origMoveBudgetUsed = null;
		this.turnStart = null;
		this.moveSpoiled = true;
		this.skipStartOfTurn = snap.turnBegan;
		this.restoreExplored(snap.explored);
		this.awake = new Set(snap.awake ?? []);
		this.activeUnitId = null;
		const first = this.units.find((u) => u.side === "player" && u.alive);
		if (first) {
			this.cursor = {
				x: first.x,
				y: first.y
			};
			this.centerOn(first.x, first.y);
		}
		this.tip = "Combate retomado.";
	}
	tick(dt) {
		const cap = Math.min(.05, dt);
		this.time += cap;
		const actionCap = cap * (this.speedMode === "fast" ? 1 : this.speedMode === "slow" ? .4 : .65);
		for (const fx of this.provokeFx) fx.t += actionCap;
		this.provokeFx = this.provokeFx.filter((fx) => fx.t < PROVOKE_FX_DURATION);
		if (this.tip !== this.lastTipSeen) {
			this.lastTipSeen = this.tip;
			this.tipSetAt = this.time;
		} else if (this.tip !== null && this.time - this.tipSetAt >= 5) {
			this.tip = null;
			this.lastTipSeen = null;
		}
		if (this.onNextIdle && !this.active && this.queue.length === 0) {
			const fn = this.onNextIdle;
			this.onNextIdle = null;
			fn();
		}
		if (this.waypointCheckPending && !this.active && this.queue.length === 0) {
			this.waypointCheckPending = false;
			this.evaluateEnd();
		}
		if (this.trauma > 0) this.trauma = Math.max(0, this.trauma - cap * 2.2);
		for (const u of this.units) {
			if (u.flash > 0) u.flash = Math.max(0, u.flash - cap * 4);
			if (u.levelGlow > 0) u.levelGlow = Math.max(0, u.levelGlow - cap * .42);
			if (u.healGlow > 0) u.healGlow = Math.max(0, u.healGlow - cap * .7);
			if (!u.alive && u.fade > 0 && !this.deathSheetPlaying(u)) u.fade = Math.max(0, u.fade - cap * 2.4);
			else if (u.alive && u.fade < 1) u.fade = Math.min(1, u.fade + cap * 2.4);
			if (u.sprite === "carnivorous-plant-001" || u.sprite === "sapling-001") {
				const sapling = u.sprite === "sapling-001";
				let cue = this.plantSoundCues.get(u);
				if (!cue) this.plantSoundCues.set(u, cue = { hitAt: u.hitAt });
				if (u.hitAt != null && u.hitAt !== cue.hitAt) {
					cue.hitAt = u.hitAt;
					if (sapling) sfxPlay.saplingHit();
					else sfxPlay.carnivorousPlantHit();
				}
				if (!u.alive && u.diedAt != null && !cue.death && this.time - u.diedAt >= HIT_ANIM_SECONDS) {
					cue.death = true;
					if (sapling) sfxPlay.saplingDeath();
					else sfxPlay.carnivorousPlantDeath();
				}
			}
			if (u.sprite === "plague-bearing-cattle" && !u.alive && u.diedAt != null && !this.cattleDeathCued.has(u)) {
				this.cattleDeathCued.add(u);
				sfxPlay.plagueCattleDeath();
			}
			if (hasMonsterSfx(u.sprite, "hit") || hasMonsterSfx(u.sprite, "death")) {
				let cue = this.monsterSoundCues.get(u);
				if (!cue) this.monsterSoundCues.set(u, cue = { hitAt: u.hitAt });
				if (u.hitAt != null && u.hitAt !== cue.hitAt) {
					cue.hitAt = u.hitAt;
					if (u.alive || u.classId !== "bigBlueCalf") sfxPlay.monster(u.sprite, "hit");
				}
				const hitLead = u.classId !== "bigBlueCalf" && this.art.hits[u.sprite] ? HIT_ANIM_SECONDS : 0;
				if (!u.alive && u.diedAt != null && !cue.death && this.time - u.diedAt >= hitLead) {
					cue.death = true;
					if (!(u.deathAlt && !!this.art.deaths2[u.sprite] && sfxPlay.monster(u.sprite, "death2"))) sfxPlay.monster(u.sprite, "death");
				}
			}
			if (u.alive) {
				const haste = u.classId === "wardog" ? 1.4 : u.size >= 4 ? .58 : u.classId === "mage" || u.classId === "cultist" || u.classId === "cultistV2" ? .8 : 1;
				u.bob += cap * haste;
			}
		}
		if (this.particleLive) {
			let live = 0;
			for (const p of this.particles) {
				if (!p.live) continue;
				p.life += cap;
				if (p.life >= p.max) {
					p.live = false;
					continue;
				}
				p.x += p.vx * cap;
				p.y += p.vy * cap;
				if (p.kind === "impact") p.frame += cap * 12;
				live += 1;
			}
			this.particleLive = live;
		}
		if (this.levelUpFxLive) {
			let live = 0;
			for (const s of this.levelUpFx) {
				if (!s.live) continue;
				s.life += cap;
				if (s.life >= s.max) {
					s.live = false;
					continue;
				}
				s.dx += s.vx * cap;
				s.dy += s.vy * cap;
				if (s.kind !== "label") s.vy += s.refCell * .9 * cap;
				s.rot += s.vrot * cap;
				live += 1;
			}
			this.levelUpFxLive = live;
		}
		if (this.missileFxLive) {
			let live = 0;
			for (const m of this.missileFx) {
				if (!m.live) continue;
				m.t += actionCap;
				if (m.t < m.travel) {
					const k = m.t / m.travel;
					this.ensureVisible(m.fromX + (m.toX - m.fromX) * k, m.fromY + (m.toY - m.fromY) * k);
				}
				if (m.t >= m.max) {
					m.live = false;
					continue;
				}
				live += 1;
			}
			this.missileFxLive = live;
		}
		if (this.fireballBurstFxLive) {
			let live = 0;
			for (const burst of this.fireballBurstFx) {
				if (!burst.live) continue;
				burst.t += actionCap;
				if (burst.t >= burst.max) {
					burst.live = false;
					continue;
				}
				live += 1;
			}
			this.fireballBurstFxLive = live;
		}
		if (this.lightningFxLive) {
			let live = 0;
			for (const l of this.lightningFx) {
				if (!l.live) continue;
				l.t += actionCap;
				if (l.t >= l.max) {
					l.live = false;
					continue;
				}
				live += 1;
			}
			this.lightningFxLive = live;
		}
		this.turnUndeadFx = this.turnUndeadFx.filter((fx) => (fx.t += actionCap) < TURN_UNDEAD_V4_DURATION);
		if (this.holyFxLive) {
			let live = 0;
			for (const h of this.holyFx) {
				if (!h.live) continue;
				h.t += actionCap;
				if (h.t >= h.max) {
					h.live = false;
					continue;
				}
				live += 1;
			}
			this.holyFxLive = live;
		}
		if (this.bladeFxLive) {
			let live = 0;
			for (const b of this.bladeFx) {
				if (!b.live) continue;
				b.t += actionCap;
				if (b.t >= b.max) {
					b.live = false;
					continue;
				}
				live += 1;
			}
			this.bladeFxLive = live;
		}
		if (this.portalFxLive) {
			let live = 0;
			for (const p of this.portalFx) {
				if (!p.live) continue;
				p.t += actionCap;
				if (p.t >= p.max) {
					p.live = false;
					continue;
				}
				live += 1;
			}
			this.portalFxLive = live;
		}
		if (this.hitstop > 0) {
			this.hitstop -= cap;
			this.emit();
			return;
		}
		if (!this.active && this.queue.length) this.startSeq(this.queue.shift());
		if (this.active) this.stepActive(cap);
		const boardBusy = !!this.active || this.queue.length > 0 || this.missileFxLive > 0 || this.fireballBurstFxLive > 0 || this.lightningFxLive > 0 || this.holyFxLive > 0 || this.turnUndeadFx.length > 0 || this.provokeFx.length > 0 || this.bladeFxLive > 0 || this.portalFxLive > 0;
		this.overlayFade = boardBusy ? 0 : Math.min(1, this.overlayFade + cap / OVERLAY_FADE_IN);
		if (!this.active && this.queue.length === 0) this.bleedChargedIds.clear();
		if (!this.result && !this.active && this.queue.length === 0) {
			const active = this.activeTurnUnit();
			const activeId = active?.id ?? null;
			if (activeId !== this.activeUnitId) {
				this.activeUnitId = activeId;
				if (active) this.beginUnitTurn(active);
				else this.startNewRound();
			}
		}
		this.emit();
	}
	/** Point a directional sprite (conjurer / lancer) at a column so walk and attack
	* play the matching left/right cut instead of a mirrored idle. Other sprites keep
	* the historical "facing = 1 shows the sheet as drawn" convention — EXCEPT familiar3,
	* familiar4, morvenian-wolf and mordavian-wolf, whose facing drives render()'s ordinary CSS
	* mirror (dirAction is false for them, same as every other non-directional sprite) rather than
	* an asset pick. Outside faceSpriteToward, u.facing only
	* ever changes from actually walking (see the stepMove branch that sets it), so a unit
	* that attacked without moving, or moved one way and then got attacked from the other
	* side, kept whatever stale facing its last step left behind instead of turning to face
	* the fight — the "not facing the enemy" report, distinct from (and left uncaught by) the
	* earlier mirrored-attack-frame fix above familiar3Scale. */
	faceSpriteToward(id, x, y) {
		const u = this.units.find((n) => n.id === id);
		if (!u) return;
		const from = this.hexCenter(u.x, u.y);
		const to = this.hexCenter(x, y);
		if (to.cx === from.cx && to.cy === from.cy) return;
		u.faceDx = to.cx - from.cx;
		u.faceDy = to.cy - from.cy;
		this.applyHeading(u);
	}
	/** Hard rule for every unit: on-screen facing always follows its last real heading (faceDx/faceDy),
	* resolved for the current camera angle — it never falls back to a default, and a camera rotation
	* can't leave a unit facing away from whoever it last fought. */
	applyHeading(u) {
		if (u.faceDx == null || u.faceDy == null) return;
		const azimuth = this.tacticsCamera ? this.cameraTiltSide * Math.PI / 180 : 0;
		const screenDx = u.faceDx * Math.cos(azimuth) - u.faceDy * Math.sin(azimuth);
		if (screenDx > 1e-6) u.facing = 1;
		else if (screenDx < -1e-6) u.facing = -1;
	}
	startSeq(step) {
		if (!this.woundUp.has(step) && (step.type === "combat" || step.type === "spell")) {
			const actor = this.units.find((u) => u.id === step.att);
			const targets = step.type === "combat" ? [step.def] : step.ids;
			const target = this.units.find((u) => u.id === targets[0]) ?? (step.type === "spell" ? step.tiles[0] : void 0);
			if (actor && target) this.faceSpriteToward(actor.id, target.x, target.y);
			for (const id of targets) {
				const recipient = this.units.find((u) => u.id === id);
				if (step.type === "spell" && actor && recipient && actor.side !== recipient.side && (step.spellKind !== "turnUndead" || isUndeadClass(recipient.classId))) this.faceSpriteToward(recipient.id, actor.x, actor.y);
			}
		}
		if (!this.woundUp.has(step)) {
			if (step.type === "spell") {
				const caster = this.units.find((u) => u.id === step.att);
				const arrowSpell = step.spellKind === "longShot" || step.spellKind === "bloodyShot" || step.spellKind === "multiShot" || step.spellKind === "piercing";
				const meleeSkill = step.spellKind === "cleave" || step.spellKind === "sweep" || step.spellKind === "shoulderSmash" || step.spellKind === "stampede" || step.spellKind === "piercingThrust" || step.spellKind === "trip" || step.spellKind === "doubleStrike";
				if (arrowSpell) sfxPlay.arrowAttack(caster?.sprite === "neera", this.reducedMotion ? 0 : LONG_ANIM_SECONDS);
				else if (step.spellKind === "tendrilSwipe") sfxPlay.carnivorousPlantAttack();
				else if (meleeSkill && caster) this.playMeleeCue(caster, false, step.spellKind);
				else if (step.spellKind !== "webOfDreams" && step.spellKind !== "bless" && !meleeSkill) {
					if (caster?.sprite === "minor-horror-001") sfxPlay.minorHorrorCast();
					else if (caster?.sprite === "carnivorous-plant-001") sfxPlay.carnivorousPlantCast();
					else if (caster?.sprite === "sapling-001") sfxPlay.saplingCast();
					else if (caster?.sprite === "plague-bearing-cattle") sfxPlay.plagueCattleCast();
					else if (sfxPlay.monster(caster?.sprite, "cast")) {} else if (caster?.sprite === "cultist-v2") sfxPlay.cultistV2Spellcast();
					else sfxPlay.spell();
				}
			} else if (step.type === "combat") {
				const attacker = this.units.find((u) => u.id === step.att);
				if (step.spellKind === "shieldBash") {} else if (attacker && (attacker.classId === "brigand" || !step.customDice && this.isArrowAttack(attacker))) sfxPlay.arrowAttack(attacker.sprite === "neera", this.reducedMotion ? 0 : LONG_ARROW_RELEASE_SECONDS);
				else if (attacker && !step.customDice && this.isArcaneCaster(attacker)) {
					if (attacker.sprite === "cultist-v2") sfxPlay.cultistV2Attack();
					else if (!sfxPlay.monster(attacker.sprite, "attack")) sfxPlay.magicAttack();
				} else if (attacker && !this.isArcaneCaster(attacker) && (attacker.sprite !== "kaelFinal" || !!step.customDice)) {
					if (attacker.sprite === "minor-horror-001") sfxPlay.minorHorrorAttack();
					else if (attacker.sprite === "carnivorous-plant-001") sfxPlay.carnivorousPlantAttack();
					else if (attacker.sprite === "sapling-001") sfxPlay.saplingAttack();
					else if (attacker.sprite === "plague-bearing-cattle") sfxPlay.plagueCattleAttack();
					else if (sfxPlay.monster(attacker.sprite, "attack")) {} else this.playMeleeCue(attacker, !!step.customDice, step.spellKind);
				}
			} else if (step.type === "heal" || step.type === "cureDisease") sfxPlay.heal();
		}
		if ((step.type === "spell" || step.type === "heal" || step.type === "combat") && !this.woundUp.has(step) && !this.reducedMotion) {
			const actor = this.units.find((u) => u.id === step.att);
			const target = step.type === "combat" || step.type === "heal" ? this.units.find((u) => u.id === step.def) : step.ids[0] ? this.units.find((u) => u.id === step.ids[0]) : null;
			const ranged = !(step.type === "spell" && (step.spellKind === "doubleStrike" || step.spellKind === "cleave" || step.spellKind === "piercingThrust" || step.spellKind === "sweep" || step.spellKind === "trip" || step.spellKind === "shoulderSmash" || step.spellKind === "stampede" || step.spellKind === "tendrilSwipe")) && (step.type !== "combat" || !!actor && !step.customDice && (this.isArrowAttack(actor) || this.isArcaneCaster(actor)));
			const arrowSkill = step.type === "spell" && (step.spellKind === "longShot" || step.spellKind === "bloodyShot" || step.spellKind === "multiShot" || step.spellKind === "piercing");
			const neeraArrowSkill = !!actor && actor.sprite === "neera" && arrowSkill;
			const pose = neeraArrowSkill ? "specialAttack" : step.type === "combat" ? "attack" : "cast";
			const frames = actor ? neeraArrowSkill ? this.art.attacks2[actor.sprite] ?? this.art.attacks[actor.sprite] : pose === "cast" ? this.art.casts[actor.sprite] ?? this.art.attacks[actor.sprite] : actor.classId !== "bigBlueCalf" && actor.sprite !== "neera" && actor.idleAlt ? this.art.attacks2[actor.sprite] ?? this.art.attacks[actor.sprite] : this.art.attacks[actor.sprite] : void 0;
			const targetAlive = step.type !== "combat" || !!target?.alive;
			if (actor && ranged && targetAlive && (frames?.length ?? 0) >= LONG_SHEET_FRAMES) {
				const arrowAttack = step.type === "combat" && this.isArrowAttack(actor);
				const release = neeraArrowSkill ? LONG_ANIM_SECONDS : arrowSkill ? LONG_ARROW_SKILL_RELEASE_SECONDS : arrowAttack ? LONG_ARROW_RELEASE_SECONDS : actor.classId === "minorHorror" ? MINOR_HORROR_SECONDS.cast : LONG_ANIM_SECONDS;
				this.woundUp.set(step, release);
				this.queue.unshift(step);
				const look = target ?? (step.type === "spell" ? step.tiles[0] : void 0);
				if (look) this.faceSpriteToward(actor.id, look.x, look.y);
				this.ensureVisible(actor.x, actor.y);
				this.active = {
					type: "windup",
					id: actor.id,
					t: 0,
					dur: release,
					pose
				};
				return;
			}
		}
		const held = this.woundUp.has(step);
		const heldFrom = this.woundUp.get(step);
		const heldAt = this.time;
		const deferred = this.onSeqStart.get(step);
		if (deferred) {
			this.onSeqStart.delete(step);
			deferred();
		}
		const actionId = step.type === "move" ? step.id : step.type === "combat" || step.type === "spell" || step.type === "heal" || step.type === "cureDisease" ? step.att : null;
		const isMove = step.type === "move" && step.path.length > 1;
		const charged = !isMove && !!actionId && this.bleedChargedIds.has(actionId);
		if (actionId && step.type !== "move") this.bleedChargedIds.add(actionId);
		if (actionId && (isMove || step.type !== "move" && !charged) && !this.applyBleedingActionDamage(this.units.find((u) => u.id === actionId), isMove)) {
			this.queue = this.queue.filter((q) => !("att" in q && q.att === actionId) && !(q.type === "move" && q.id === actionId));
			this.onNextIdle = null;
			if (this.selectedId === actionId) this.selectedId = null;
			if (this.phase === "player") this.mode = "idle";
			this.evaluateEnd();
			return;
		}
		if (step.type === "move") {
			this.active = {
				type: "move",
				id: step.id,
				path: step.path,
				i: 0,
				t: 0,
				charge: this.chargeMoves.has(step)
			};
			const mover = this.units.find((u) => u.id === step.id);
			if (mover?.sprite === "minor-horror-001") sfxPlay.minorHorrorWalk();
			else if (mover?.sprite === "sapling-001") sfxPlay.saplingWalk();
			else if (mover?.sprite === "plague-bearing-cattle") sfxPlay.plagueCattleWalk();
			else if (sfxPlay.monster(mover?.sprite, "walk")) {} else if (mover?.sprite === "cultist-v2" && step.path.length >= 2) {
				if (step.path[1].x < step.path[0].x) sfxPlay.cultistV2WalkLeft();
				else sfxPlay.cultistV2WalkRight();
			} else sfxPlay.move();
		} else if (step.type === "combat") {
			const target = this.units.find((u) => u.id === step.def);
			if (!target || !target.alive) return;
			const attacker = this.units.find((u) => u.id === step.att);
			this.faceSpriteToward(step.att, target.x, target.y);
			if (attacker) {
				this.ensureVisible(attacker.x, attacker.y);
				this.ensureVisible(target.x, target.y);
			}
			this.active = {
				type: "combat",
				att: step.att,
				def: step.def,
				stage: "lunge",
				t: held ? .2 : 0,
				held,
				heldFrom,
				heldAt,
				swapped: false,
				bonusDice: step.bonusDice ?? 0,
				bonusDiceCount: step.bonusDiceCount ?? 1,
				bonusFlat: step.bonusFlat ?? 0,
				noCounter: step.noCounter ?? false,
				spellKind: step.spellKind ?? null,
				customDice: step.customDice ?? null,
				counterCustomDice: null,
				dmgMul: step.dmgMul ?? 1,
				stunChance: step.stunChance ?? 0,
				wallImpact: step.wallImpact ?? null,
				knockTo: step.knockTo ?? null
			};
		} else if (step.type === "spell") {
			this.active = {
				type: "spell",
				att: step.att,
				held,
				heldFrom,
				heldAt,
				tiles: step.tiles,
				ids: step.ids,
				t: 0,
				hit: false,
				extraDice: step.dice ?? 0,
				extraFaces: step.faces ?? 8,
				extraBonus: step.bonus ?? 0,
				moreDice: step.moreDice ?? 0,
				moreFaces: step.moreFaces ?? 6,
				echo: step.echo ?? null,
				dmgMul: step.dmgMul ?? 1,
				weaponBonusDice: step.weaponBonusDice ?? 0,
				weaponBonusFaces: step.weaponBonusFaces ?? 8,
				weaponBonusBonus: step.weaponBonusBonus ?? 0,
				spellKind: step.spellKind ?? null,
				projectileTo: step.projectileTo ?? null,
				centerId: step.centerId ?? null,
				centerDice: step.centerDice ?? 0,
				centerFaces: step.centerFaces ?? 8,
				centerBonus: step.centerBonus ?? 0,
				poison: step.poison ?? false,
				spellMul: step.spellMul ?? 1,
				centerMul: step.centerMul ?? step.spellMul ?? 1
			};
			{
				const at = (step.ids[0] ? this.units.find((u) => u.id === step.ids[0]) : null) ?? step.tiles[0];
				if (at) this.faceSpriteToward(step.att, at.x, at.y);
				const caster = this.units.find((u) => u.id === step.att);
				if (caster) {
					this.ensureVisible(caster.x, caster.y);
					this.ensureAreaVisible(step.tiles);
				}
			}
			this.banner = step.label ?? "";
			if (step.spellKind === "bless") sfxPlay.heal();
			else if (step.spellKind !== "longShot" && step.spellKind !== "multiShot" && step.spellKind !== "piercing") sfxPlay.crit();
			if (step.spellKind === "frost") {
				const caster = this.units.find((u) => u.id === step.att);
				if (caster) this.frostVfxRequests.push({
					origin: {
						x: caster.x,
						y: caster.y
					},
					cells: step.tiles.map((c) => ({ ...c })),
					seed: Math.floor(this.time * 1e3)
				});
			}
			if (step.spellKind === "magicMissile") {
				const caster = this.units.find((u) => u.id === step.att);
				if (caster) for (const t of step.tiles) this.emitMissileFx(caster.x, caster.y, t.x, t.y, "magicMissile");
			}
			if (step.spellKind === "fantomForce") {
				const caster = this.units.find((u) => u.id === step.att);
				const target = step.tiles[0];
				if (caster && target) this.emitMissileFx(caster.x, caster.y, target.x, target.y, "fantomForce");
			}
			if (step.spellKind === "phantasmalForce" && (!this.phantasmalForceVfxAvailable || this.reducedMotion)) {
				const caster = this.units.find((u) => u.id === step.att);
				const target = step.tiles[0];
				if (caster && target) this.emitMissileFx(caster.x, caster.y, target.x, target.y, "phantasmalForce");
			}
			if (step.spellKind === "causticVenom") {
				const caster = this.units.find((u) => u.id === step.att);
				const target = step.projectileTo ?? null;
				if (caster && target) this.emitMissileFx(caster.x, caster.y, target.x, target.y, caster.classId === "carnivorousPlant" ? "minorVenom" : step.spellKind);
			}
			if (step.spellKind === "minorVenom") {
				const caster = this.units.find((u) => u.id === step.att);
				const target = step.projectileTo ?? null;
				if (caster && target) this.emitMissileFx(caster.x, caster.y, target.x, target.y, "minorVenom");
			}
			if (step.spellKind === "longShot" || step.spellKind === "bloodyShot") {
				const caster = this.units.find((u) => u.id === step.att);
				const target = step.tiles[0];
				if (caster && target) this.emitMissileFx(caster.x, caster.y, target.x, target.y, "longShot");
			}
			if (step.spellKind === "multiShot") {
				const caster = this.units.find((u) => u.id === step.att);
				if (caster) for (const target of step.tiles) this.emitMissileFx(caster.x, caster.y, target.x, target.y, "longShot");
			}
			if (step.spellKind === "piercing") {
				const caster = this.units.find((u) => u.id === step.att);
				const target = step.tiles[step.tiles.length - 1];
				if (caster && target) this.emitMissileFx(caster.x, caster.y, target.x, target.y, "longShot");
			}
			if (step.spellKind === "divineBolt") {
				const center = step.projectileTo ?? step.tiles[0];
				if (center) this.emitLightningFx(center.x, center.y, "divine");
				for (const t of step.tiles) if (!center || t.x !== center.x || t.y !== center.y) this.emitLightningFx(t.x, t.y, "divineSplash");
			}
			if (step.spellKind === "lightning" || step.spellKind === "lightningTier3" || step.spellKind === "shock") {
				const power = step.spellKind === "lightningTier3" ? "t3" : step.spellKind === "lightning" ? "raio" : "shock";
				for (const t of step.tiles) this.emitLightningFx(t.x, t.y, power);
			}
		} else if (step.type === "heal") {
			this.active = {
				type: "heal",
				att: step.att,
				def: step.def,
				kind: step.kind,
				t: 0,
				applied: false,
				held,
				heldFrom,
				heldAt
			};
			this.banner = CURES[step.kind].name;
			sfxPlay.ui();
			const healed = this.units.find((u) => u.id === step.def);
			if (healed) this.faceSpriteToward(step.att, healed.x, healed.y);
			const healer = this.units.find((u) => u.id === step.att);
			if (healer) this.ensureVisible(healer.x, healer.y);
			if (healed) this.ensureVisible(healed.x, healed.y);
		} else if (step.type === "cureDisease") {
			this.active = {
				type: "cureDisease",
				att: step.att,
				def: step.def,
				t: 0,
				applied: false
			};
			this.banner = CURE_DISEASE.name;
			sfxPlay.ui();
		} else if (step.type === "banner") {
			this.banner = step.text;
			this.active = {
				type: "banner",
				text: step.text,
				t: 0,
				dur: step.dur
			};
			sfxPlay.turn();
		} else if (step.type === "delay") this.active = {
			type: "delay",
			t: 0,
			dur: step.dur
		};
		else if (step.type === "checkEnd") this.evaluateEnd();
	}
	stepActive(dt) {
		const a = this.active;
		if (!a) return;
		if (a.type === "windup") {
			a.t += dt;
			if (a.t >= a.dur) this.active = null;
			return;
		}
		if (a.type === "delay" || a.type === "banner") {
			a.t += dt;
			if (a.type === "banner" && a.t >= a.dur) this.banner = null;
			if (a.t >= a.dur) {
				this.active = null;
				if (a.type === "banner" && a.text === "Fase do jogador") this.mode = "idle";
			}
			return;
		}
		if (a.type === "move") {
			const unit = this.units.find((u) => u.id === a.id);
			if (!unit || a.path.length < 2) {
				this.active = null;
				return;
			}
			const from = a.path[a.i];
			const to = a.path[a.i + 1];
			if (!to) {
				unit.x = from.x;
				unit.y = from.y;
				unit.drawX = from.x;
				unit.drawY = from.y;
				const origin = a.path[0];
				if (a.charge && origin) this.emitBladeFx("rushTrail", origin.x, origin.y, {
					toX: from.x,
					toY: from.y
				});
				if (unit.sprite === "plague-bearing-cattle") sfxPlay.plagueCattleWalkStop();
				sfxPlay.monsterWalkStop(unit.sprite);
				this.active = null;
				return;
			}
			const fromScreen = this.hexCenter(from.x, from.y);
			const toScreen = this.hexCenter(to.x, to.y);
			if (toScreen.cx !== fromScreen.cx || toScreen.cy !== fromScreen.cy) {
				unit.faceDx = toScreen.cx - fromScreen.cx;
				unit.faceDy = toScreen.cy - fromScreen.cy;
				this.applyHeading(unit);
			}
			unit.walkPose = to.y < from.y ? "back" : to.y > from.y ? "front" : "side";
			a.t += dt;
			const dur = this.moveStepDur(a);
			const k = Math.min(1, a.t / dur);
			unit.drawX = from.x + (to.x - from.x) * k;
			unit.drawY = from.y + (to.y - from.y) * k;
			if (unit.side === "player" && this.activeTurnUnit()?.id === unit.id) {
				const cx = fromScreen.cx + (toScreen.cx - fromScreen.cx) * k;
				const cy = fromScreen.cy + (toScreen.cy - fromScreen.cy) * k;
				this.centerOnPoint(cx, cy);
			}
			if (a.t >= dur) {
				a.i += 1;
				a.t = Math.min(a.t - dur, dur);
				unit.x = to.x;
				unit.y = to.y;
				unit.drawX = to.x;
				unit.drawY = to.y;
				if (unit.side === "player") this.waypointCheckPending = true;
				this.ensureVisible(unit.x, unit.y);
				const hpBefore = unit.hp;
				const propsBefore = this.decorations.length;
				this.smashBarricades(unit);
				this.applyTileHazard(unit, to);
				if (unit.hp !== hpBefore || this.decorations.length !== propsBefore) this.moveSpoiled = true;
				if (!unit.alive) {
					if (unit.sprite === "plague-bearing-cattle") sfxPlay.plagueCattleWalkStop();
					sfxPlay.monsterWalkStop(unit.sprite);
					this.active = null;
					this.selectedId = null;
					this.pendingFoeId = null;
					this.evaluateEnd();
					if (!this.result && this.phase === "player") this.mode = "idle";
				}
			}
			return;
		}
		const speedScale = this.speedMode === "fast" ? 1 : this.speedMode === "slow" ? .4 : .65;
		const actionDt = dt * speedScale * this.longSheetActionPace(a, speedScale);
		if (a.type === "combat") this.stepCombat(a, actionDt);
		if (a.type === "spell") this.stepSpell(a, actionDt);
		if (a.type === "heal") this.stepHeal(a, actionDt);
		if (a.type === "cureDisease") this.stepCureDisease(a, actionDt);
	}
	stepCombat(a, dt) {
		const att = this.units.find((u) => u.id === a.att);
		const def = this.units.find((u) => u.id === a.def);
		if (!att || !def) {
			this.active = null;
			return;
		}
		a.t += dt;
		const lunge = .2;
		if (a.stage === "counterLunge" && a.counterWindAt != null && this.time - a.counterWindAt < LONG_ARROW_RELEASE_SECONDS) {
			a.t = 0;
			return;
		}
		if (a.stage === "counterLunge" && a.counterWindAt != null && a.t < lunge) a.t = lunge;
		if (a.stage === "lunge" || a.stage === "counterLunge") {
			const actor = a.stage === "lunge" ? att : def;
			const target = a.stage === "lunge" ? def : att;
			const k = Math.min(1, a.t / lunge);
			const arrowShot = this.isArrowAttack(actor) && !this.offHandStrike(a);
			const arcaneBolt = !arrowShot && this.isArcaneCaster(actor);
			const ranged = arrowShot || arcaneBolt;
			actor.drawX = actor.x + (target.x - actor.x) * (ranged ? 0 : .28) * k;
			actor.drawY = actor.y + (target.y - actor.y) * (ranged ? 0 : .28) * k;
			if (a.t >= lunge) {
				if (arrowShot) this.emitMissileFx(actor.x, actor.y, target.x, target.y, "longShot");
				else if (arcaneBolt) this.emitMissileFx(actor.x, actor.y, target.x, target.y, "arcaneBolt");
				else if (actor.sprite === "kaelFinal" && !this.offHandStrike(a) && !(a.stage === "lunge" && a.spellKind === "shieldBash")) this.playMeleeCue(actor, false, a.stage === "lunge" ? a.spellKind : void 0, KAEL_BLADE_SOUND_START);
				a.t = 0;
				a.stage = a.stage === "lunge" ? "hit" : "counterHit";
			}
			return;
		}
		if (a.stage === "hit" || a.stage === "counterHit") {
			const actor = a.stage === "hit" ? att : def;
			const target = a.stage === "hit" ? def : att;
			const arrowShot = this.isArrowAttack(actor) && !this.offHandStrike(a);
			const arcaneBolt = !arrowShot && this.isArcaneCaster(actor);
			const impactAt = arrowShot ? ARROW_TRAVEL : arcaneBolt ? MISSILE_TRAVEL : .02;
			if (a.t >= impactAt && a.t - dt < impactAt) {
				if (a.stage === "hit" && a.spellKind === "shieldBash") sfxPlay.shieldBash();
				const attTile = tileAt(this.tiles, this.cols, actor.x, actor.y);
				const defTile = tileAt(this.tiles, this.cols, target.x, target.y);
				const dice = a.stage === "hit" ? a.customDice : a.counterCustomDice;
				const hit = dice ? rollDamageCustom(this.affinityUnit(actor), this.affinityUnit(target), attTile, defTile, dice.dice, dice.faces, dice.bonus, this.rng, !(a.stage === "hit" && a.spellKind === "shieldBash")) : rollDamage(this.affinityUnit(actor), this.affinityUnit(target), attTile, defTile, this.rng, !(a.stage === "hit" && a.spellKind === "shieldBash"));
				if (target.side === "enemy" && !(a.stage === "hit" && a.spellKind === "shieldBash")) this.trainWeapon(actor, equippedWeaponType(actor, !!dice), target.level);
				const usesArcane = arcaneBolt && !this.offHandStrike(a) && (a.stage === "counterHit" || !a.spellKind);
				if (!hit.landed) {
					this.spawnMiss(target);
					this.pushLog(`${actor.name} atacou ${target.name}: Missed`);
					sfxPlay.miss();
					if (a.stage === "hit" && a.spellKind === "bullRush") this.queue = this.queue.filter((q) => !(q.type === "move" && q.id === actor.id) && !("att" in q && q.att === actor.id && q.type === "combat" && q.spellKind === "bullRush"));
				} else {
					let bonusRoll = 0;
					if (a.stage === "hit" && a.bonusDice > 0) {
						bonusRoll = rollDice(a.bonusDiceCount, a.bonusDice, a.bonusFlat, this.rng);
						hit.dmg += bonusRoll;
					}
					if (a.stage === "hit" && a.wallImpact) hit.dmg += rollDice(a.wallImpact.dice, a.wallImpact.faces, 0, this.rng);
					let executed = false;
					if (a.stage === "hit" && a.spellKind === "executionerStrike") {
						const power = executionerStrikePower(actor.level);
						if (target.maxHp > 0 && target.hp / target.maxHp <= power.threshold) {
							hit.dmg = Math.max(1, Math.floor((hit.preCritDmg + bonusRoll) * power.mult));
							executed = true;
						}
					}
					if (a.stage === "hit" && a.dmgMul !== 1) hit.dmg = Math.max(1, Math.floor(hit.dmg * a.dmgMul));
					if (a.stage === "hit" && a.stunChance > 0 && this.rng() < a.stunChance) {
						target.stunned = true;
						target.stunTurns = 1;
						sfxPlay.stun();
					}
					if (target.asleep) {
						hit.dmg = Math.max(1, Math.floor(hit.dmg * (1 + WEB_OF_DREAMS.sleepBonusDamage)));
						target.asleep = false;
						target.sleepTurns = 0;
					}
					hit.dmg = Math.max(1, Math.floor(hit.dmg * this.zoneDamageMul(target)));
					if (usesArcane) {
						hit.dmg = Math.floor(elementalDamage(hit.dmg, target.resistances?.arcane ?? 0, this.affinityUnit(actor).mag));
						this.trainResistance(target, "arcane", actor.level);
					}
					if (a.stage === "hit" && a.spellKind && hit.dmg > 0) this.adjustAffinity(actor, target, -1);
					target.hp = Math.max(0, target.hp - hit.dmg);
					this.noteDamageEnmity(actor, target, hit.dmg, "weapon");
					target.flash = 1;
					target.hitAt = this.time;
					this.provoke(target, actor);
					if (target.side !== actor.side) {
						if (a.stage === "hit") this.gainExp(actor, target.level, hit.dmg, 1, target.hp <= 0);
						else this.gainCounterExp(actor);
					}
					this.spawnHit(target, hit.dmg, hit.crit, !this.isArrowAttack(actor) && !this.isArcaneCaster(actor));
					this.pushLog(`${actor.name} atacou ${target.name}: ${hit.dmg} dano${hit.crit ? " (crítico)" : ""}`);
					if (a.stage === "hit" && a.spellKind === "trip") {
						const oc = this.hexCenter(actor.x, actor.y);
						const tc = this.hexCenter(target.x, target.y);
						this.emitBladeFx("tripSweep", target.x, target.y, { a0: Math.atan2(tc.cy - oc.cy, tc.cx - oc.cx) });
					}
					if (a.stage === "hit" && a.spellKind === "doubleStrike") {
						const oc = this.hexCenter(actor.x, actor.y);
						const tc = this.hexCenter(target.x, target.y);
						const base = Math.atan2(tc.cy - oc.cy, tc.cx - oc.cx);
						this.doubleStrikeAlt = !this.doubleStrikeAlt;
						this.emitBladeFx("cross", target.x, target.y, { a0: base + (this.doubleStrikeAlt ? .7 : -.7) });
					}
					if (a.stage === "hit" && a.spellKind === "bullRush") {
						const oc = this.hexCenter(actor.x, actor.y);
						const tc = this.hexCenter(target.x, target.y);
						this.emitBladeFx("rushImpact", target.x, target.y, { a0: Math.atan2(tc.cy - oc.cy, tc.cx - oc.cx) });
					}
					if (a.stage === "hit" && a.spellKind === "shieldBash") this.emitBladeFx("shockRing", target.x, target.y);
					if (a.stage === "hit" && a.spellKind === "executionerStrike") {
						const attackerCenter = this.hexCenter(actor.x, actor.y);
						const targetCenter = this.hexCenter(target.x, target.y);
						const fromLeft = attackerCenter.cx < targetCenter.cx || attackerCenter.cx === targetCenter.cx && actor.x < target.x;
						this.emitBladeFx("execution", target.x, target.y, {
							warm: executed,
							mirrorX: fromLeft
						});
					}
					if (target.hp <= 0) this.markDead(target);
					else {
						sfxPlay.hit();
						if (a.stage === "hit") this.maybeInflictDisease(actor, target);
						if (a.stage === "hit" && a.spellKind === "trip") {
							target.bleeding = true;
							target.bleedRoundsLeft = void 0;
							target.bleedRoundMarker = void 0;
							if (!target.crippled) {
								target.crippled = true;
								const keep = 1 - TRIP.statPenalty;
								target.atk = Math.round(target.atk * keep);
								target.mag = Math.round(target.mag * keep);
								target.def = Math.round(target.def * keep);
								target.dex = Math.round(target.dex * keep);
								target.mov = Math.max(1, Math.round(target.mov * keep));
							}
							if (actor.name !== "Kael") sfxPlay.trip(this.isBladeAttack(actor));
						}
						if (a.stage === "hit" && a.spellKind === "shieldBash") {
							target.stunned = true;
							target.stunTurns = shieldBashPower(actor.level).stunTurns;
							sfxPlay.stun();
						}
						if (a.stage === "hit" && a.spellKind === "bullRush" && a.knockTo) {
							target.x = a.knockTo.x;
							target.y = a.knockTo.y;
							target.drawX = a.knockTo.x;
							target.drawY = a.knockTo.y;
							this.emitParticle({
								x: target.drawX,
								y: target.drawY + .3,
								vx: 0,
								vy: 0,
								life: 0,
								max: .35,
								size: 1,
								color: "#c9b28a",
								kind: "impact",
								frame: 0
							});
						}
					}
				}
				if (!this.reducedMotion) this.trauma = Math.min(1, this.trauma + (hit.landed ? .28 : .08));
				this.hitstop = hit.landed ? .06 : 0;
			}
			if (a.t >= (arrowShot ? .36 : this.isArcaneCaster(actor) ? .36 : .18)) {
				a.t = 0;
				a.stage = a.stage === "hit" ? "recover" : "counterRecover";
			}
			return;
		}
		if (a.stage === "recover" || a.stage === "counterRecover") {
			const actor = a.stage === "recover" ? att : def;
			const k = Math.min(1, a.t / .16);
			actor.drawX = actor.drawX + (actor.x - actor.drawX) * k;
			actor.drawY = actor.drawY + (actor.y - actor.drawY) * k;
			if (a.t >= .16 && (a.stage !== "recover" || this.heldDone(a))) {
				actor.drawX = actor.x;
				actor.drawY = actor.y;
				a.t = 0;
				if (a.stage === "recover") {
					if (!a.noCounter && !def.stunned && def.alive && canCounter(att, def, {
						x: att.x,
						y: att.y
					}, this.tiles, this.cols)) {
						this.faceSpriteToward(def.id, att.x, att.y);
						const offHand = def.offHandId ? EQUIPMENT[def.offHandId] : null;
						a.counterCustomDice = offHand?.kind === "weapon" && hexDist(def, att) <= (offHand.maxRange ?? 1) ? {
							dice: offHand.dice ?? 1,
							faces: offHand.faces ?? 4,
							bonus: offHand.bonus ?? 0
						} : null;
						const counterSheet = this.art.counters[def.sprite] ?? this.art.attacks[def.sprite];
						a.counterWindAt = !a.counterCustomDice && this.isArrowAttack(def) && (counterSheet?.length ?? 0) >= LONG_SHEET_FRAMES && !this.reducedMotion ? this.time : void 0;
						if (!a.counterCustomDice && this.isArrowAttack(def)) sfxPlay.arrowAttack(def.sprite === "neera", a.counterWindAt != null ? LONG_ARROW_RELEASE_SECONDS : 0);
						else if (this.isArcaneCaster(def)) {
							if (def.sprite === "cultist-v2") sfxPlay.cultistV2Attack();
							else if (!sfxPlay.monster(def.sprite, "attack")) sfxPlay.magicAttack();
						} else if (def.sprite === "minor-horror-001") sfxPlay.minorHorrorAttack();
						else if (def.sprite === "carnivorous-plant-001") sfxPlay.carnivorousPlantAttack();
						else if (def.sprite === "sapling-001") sfxPlay.saplingAttack();
						else if (def.sprite === "plague-bearing-cattle") sfxPlay.plagueCattleAttack();
						else if (sfxPlay.monster(def.sprite, "attack")) {} else if (def.sprite !== "kaelFinal" || a.counterCustomDice) this.playMeleeCue(def, !!a.counterCustomDice);
						a.stage = "counterLunge";
					} else if (!def.alive) a.stage = "fade";
					else this.finishCombat(att);
				} else if (!att.alive) a.stage = "fade";
				else this.finishCombat(att);
			}
			return;
		}
		if (a.stage === "fade") {
			for (const u of this.units) if (!u.alive && u.fade > 0 && !this.deathSheetPlaying(u)) u.fade = Math.max(0, u.fade - dt * 2.4);
			if (a.t >= .4) this.finishCombat(att);
		}
	}
	/** Damage for one spell hit on one target.
	*
	* A spell is a boosted version of the hit the caster could have made instead: same power,
	* same protection, with the caster's own stat weighted by the spell's multiplier and the
	* spell's dice standing in for the weapon. Every multiplier is above 1 and the result is
	* floored at a plain attack, so a cast can never come out worse than simply swinging —
	* which it could before, because spells ignored the caster's stat entirely and a mage's
	* MAG only ever improved their basic attack.
	*
	* The multiplier weights the power term alone. Applied to the whole total it would scale
	* terrain protection with it. Elemental resistance is applied after spell damage. */
	spellDamage(att, foe, mul, roll) {
		att = this.affinityUnit(att);
		foe = this.affinityUnit(foe);
		const attTile = this.hexAt(att.x, att.y);
		const defTile = this.hexAt(foe.x, foe.y);
		const prot = 0;
		const spell = Math.floor(powerOf(att) * mul) + roll + attTile.atk - prot - (defTile.cover ?? 0);
		const plain = powerOf(att) + weaponRoll(att.weaponId, att.weaponEnh, this.rng) + attTile.atk - prot - defTile.def;
		return Math.max(1, Math.floor(Math.max(spell, plain)));
	}
	stepSpell(a, dt) {
		const att = this.units.find((u) => u.id === a.att);
		if (!att) {
			this.active = null;
			return;
		}
		a.t += dt;
		if (a.spellKind === "bless") {
			if (this.blessVfxAvailable && !this.reducedMotion) {
				if (!a.blessVfxId) {
					const id = `bless-${++this.blessVfxSequence}`;
					a.blessVfxId = id;
					const allies = a.ids.map((unitId) => this.units.find((unit) => unit.id === unitId && unit.alive)).filter((unit) => !!unit);
					this.blessVfxRequests.push({
						id,
						center: {
							x: att.x,
							y: att.y
						},
						allies: allies.map((unit) => ({
							id: unit.id,
							x: unit.x,
							y: unit.y,
							distanceHexes: hexDist(att, unit)
						}))
					});
				}
				for (let index = this.blessVfxEvents.length - 1; index >= 0; index--) {
					const event = this.blessVfxEvents[index];
					if (event.id !== a.blessVfxId) continue;
					this.blessVfxEvents.splice(index, 1);
					if (event.phase === "complete") a.blessComplete = true;
					else if (event.phase === "timeline") continue;
					else {
						const applied = a.blessAppliedIds ?? (a.blessAppliedIds = []);
						if (applied.includes(event.unitId)) continue;
						const ally = this.units.find((unit) => unit.id === event.unitId && unit.alive && unit.side === att.side);
						if (ally) {
							this.applyBless(ally, att.level);
							this.gainSupportAffinity(att, ally);
						}
						applied.push(event.unitId);
					}
				}
			} else if (a.t >= .3) {
				for (const id of a.ids) {
					const applied = a.blessAppliedIds ?? (a.blessAppliedIds = []);
					if (applied.includes(id)) continue;
					const ally = this.units.find((unit) => unit.id === id && unit.alive && unit.side === att.side);
					if (ally) {
						this.applyBless(ally, att.level);
						this.gainSupportAffinity(att, ally);
					}
					applied.push(id);
				}
				if (a.t >= 1.5) a.blessComplete = true;
			}
			if (a.blessComplete && this.heldDone(a)) this.finishCombat(att);
			return;
		}
		const syncFireballVfx = a.spellKind === "fireball" && this.fireballVfxAvailable && !this.reducedMotion && !!a.projectileTo;
		const syncCausticVenomVfx = a.spellKind === "causticVenom" && att.classId !== "carnivorousPlant" && this.causticVenomVfxAvailable && !this.reducedMotion && !!a.projectileTo;
		const syncPhantasmalVfx = a.spellKind === "phantasmalForce" && this.phantasmalForceVfxAvailable && !this.reducedMotion;
		const syncBurningHandsVfx = (a.spellKind === "burningHands" || a.spellKind === "poisonBreath") && this.burningHandsV2VfxAvailable && !this.reducedMotion;
		if (a.spellKind === "cleave" && !a.cleaveVfxQueued && a.t >= .18 && !this.reducedMotion) {
			a.cleaveVfxQueued = true;
			this.cleaveVfxRequests.push({
				id: `cleave-sweep-${++this.cleaveVfxSequence}`,
				casterId: att.id,
				tiles: a.tiles.map((tile) => ({ ...tile })),
				targetIds: [...a.ids]
			});
		}
		if (a.spellKind === "sweep" && !a.varreduraVfxQueued && a.t >= .18 && !this.reducedMotion) {
			a.varreduraVfxQueued = true;
			this.varreduraVfxRequests.push({
				id: `varredura-${++this.varreduraVfxSequence}`,
				casterId: att.id,
				tiles: a.tiles.map((tile) => ({ ...tile })),
				targetIds: [...a.ids]
			});
		}
		if (syncBurningHandsVfx) {
			if (!a.burningHandsVfxId) {
				const id = `burning-hands-v2-${++this.burningHandsV2VfxSequence}`;
				a.burningHandsVfxId = id;
				this.burningHandsV2VfxRequests.push({
					id,
					casterId: att.id,
					tiles: a.tiles.map((tile) => ({ ...tile })),
					poison: a.spellKind === "poisonBreath"
				});
			}
			for (let index = this.burningHandsV2VfxEvents.length - 1; index >= 0; index--) {
				const event = this.burningHandsV2VfxEvents[index];
				if (event.id !== a.burningHandsVfxId) continue;
				this.burningHandsV2VfxEvents.splice(index, 1);
				if (event.phase === "release") a.burningHandsReleased = true;
				else a.burningHandsComplete = true;
			}
			if (!a.burningHandsReleased && a.t >= .7) a.burningHandsReleased = true;
			if (!a.burningHandsComplete && a.t >= 2.5) a.burningHandsComplete = true;
		}
		if (syncFireballVfx) {
			if (!a.fireballVfxId) {
				const id = `fireball-${++this.fireballVfxSequence}`;
				a.fireballVfxId = id;
				this.fireballVfxRequests.push({
					id,
					casterId: att.id,
					target: { ...a.projectileTo },
					tiles: a.tiles.map((tile) => ({ ...tile }))
				});
			}
			for (let index = this.fireballVfxEvents.length - 1; index >= 0; index--) {
				const event = this.fireballVfxEvents[index];
				if (event.id !== a.fireballVfxId) continue;
				this.fireballVfxEvents.splice(index, 1);
				if (event.phase === "launch") {
					a.fireballVfxLaunched = true;
					for (const missile of this.missileFx) if (missile.kind === "fireball") missile.live = false;
				} else if (event.phase === "impact") a.fireballImpact = true;
				else if (event.phase === "complete") a.fireballComplete = true;
			}
		}
		if (syncCausticVenomVfx) {
			if (!a.causticVenomVfxId) {
				const id = `caustic-venom-${++this.causticVenomVfxSequence}`;
				a.causticVenomVfxId = id;
				this.causticVenomVfxRequests.push({
					id,
					casterId: att.id,
					target: { ...a.projectileTo },
					tiles: a.tiles.map((tile) => ({ ...tile }))
				});
			}
			for (let index = this.causticVenomVfxEvents.length - 1; index >= 0; index--) {
				const event = this.causticVenomVfxEvents[index];
				if (event.id !== a.causticVenomVfxId) continue;
				this.causticVenomVfxEvents.splice(index, 1);
				if (event.phase === "impact") a.causticVenomImpact = true;
				else if (event.phase === "complete") a.causticVenomComplete = true;
			}
			if (!a.causticVenomImpact && a.t >= .98) a.causticVenomImpact = true;
			if (!a.causticVenomComplete && a.t >= 2.9) a.causticVenomComplete = true;
		}
		if (syncPhantasmalVfx) {
			if (!a.phantasmalVfxId) {
				const id = `phantasmal-${++this.phantasmalForceVfxSequence}`;
				a.phantasmalVfxId = id;
				const target = a.tiles[0];
				if (target) this.phantasmalForceVfxRequests.push({
					id,
					target: { ...target },
					targetUnitId: a.ids[0] ?? ""
				});
			}
			for (let index = this.phantasmalForceVfxEvents.length - 1; index >= 0; index--) {
				const event = this.phantasmalForceVfxEvents[index];
				if (event.id !== a.phantasmalVfxId) continue;
				this.phantasmalForceVfxEvents.splice(index, 1);
				if (event.phase === "impact") a.phantasmalImpact = true;
				else a.phantasmalComplete = true;
			}
		}
		const syncMagicMissileV2Vfx = a.spellKind === "magicMissileV2" && this.magicMissileV2VfxAvailable && !this.reducedMotion;
		if (syncMagicMissileV2Vfx) {
			if (!a.magicMissileV2VfxId) {
				const targetUnitId = a.ids[0];
				const target = targetUnitId ? this.units.find((unit) => unit.id === targetUnitId) : void 0;
				if (target) {
					const id = `magic-missile-v2-${++this.magicMissileV2VfxSequence}`;
					a.magicMissileV2VfxId = id;
					this.magicMissileV2VfxRequests.push({
						id,
						casterId: att.id,
						targetUnitId: target.id
					});
				} else a.magicMissileV2VfxId = "";
			}
			for (let index = this.magicMissileV2VfxEvents.length - 1; index >= 0; index--) {
				const event = this.magicMissileV2VfxEvents[index];
				if (event.id !== a.magicMissileV2VfxId) continue;
				this.magicMissileV2VfxEvents.splice(index, 1);
				if (event.phase === "impact") {
					if (event.index === 0) a.magicMissileV2Impact = true;
				} else a.magicMissileV2Complete = true;
			}
			if (!a.magicMissileV2Impact && a.t >= 2.5) a.magicMissileV2Impact = true;
			if (!a.magicMissileV2Complete && a.t >= 3.2) a.magicMissileV2Complete = true;
		}
		const arrowSpell = a.spellKind === "longShot" || a.spellKind === "bloodyShot" || a.spellKind === "multiShot" || a.spellKind === "piercing";
		const hitAt = a.spellKind === "frost" ? .75 : arrowSpell ? ARROW_TRAVEL : a.spellKind === "fantomForce" ? FANTOM_FORCE_TRAVEL : a.spellKind === "phantasmalForce" ? PHANTASMAL_FORCE_TRAVEL : a.spellKind === "magicMissile" || a.spellKind === "magicMissileV2" || a.spellKind === "fireball" || a.spellKind === "causticVenom" || a.spellKind === "minorVenom" ? SPELL_TRAVEL : .18;
		if (syncMagicMissileV2Vfx && a.magicMissileV2VfxId === "") {
			if (a.t >= hitAt) a.magicMissileV2Impact = true;
		}
		if (!a.hit && (syncFireballVfx ? a.fireballImpact === true : syncCausticVenomVfx ? a.causticVenomImpact === true : syncPhantasmalVfx ? a.phantasmalImpact === true : syncMagicMissileV2Vfx ? a.magicMissileV2Impact === true : syncBurningHandsVfx ? a.burningHandsReleased === true : a.t >= hitAt)) {
			a.hit = true;
			if (a.spellKind === "turnUndead") this.turnUndeadFx.push({
				tiles: a.tiles.map((p) => ({ ...p })),
				t: .001
			});
			const usedElement = spellElement(a.spellKind);
			if (usedElement && (a.spellKind === "magicMissile" || a.spellKind === "magicMissileV2")) {
				const enemy = a.ids.map((id) => this.units.find((u) => u.id === id && u.alive && u.side === "enemy")).find(Boolean);
				if (enemy) this.trainElementUse(att, usedElement, enemy.level);
			}
			let firstAoeEnemyHit = true;
			let thrustHitIndex = 0;
			for (const id of a.ids) {
				const foe = this.units.find((u) => u.id === id && u.alive);
				if (!foe || a.spellKind === "turnUndead" && !isUndeadClass(foe.classId)) continue;
				if (this.hexAt(foe.x, foe.y).id === "barricade") {
					this.emitParticle({
						x: foe.drawX,
						y: foe.drawY - .35,
						vx: 0,
						vy: -.18,
						life: 0,
						max: 1.6,
						size: 1,
						color: "#e0b48a",
						text: "bloqueado",
						kind: "text",
						frame: 0
					});
					continue;
				}
				let dmg;
				let crit = false;
				let landed = true;
				let weaponRolled = false;
				if (a.centerId && foe.id === a.centerId) dmg = this.spellDamage(att, foe, a.centerMul, rollDice(a.centerDice, a.centerFaces, a.centerBonus, this.rng));
				else if (a.extraDice > 0) {
					let roll = rollDice(a.extraDice, a.extraFaces, a.extraBonus, this.rng);
					if (a.moreDice > 0) roll += rollDice(a.moreDice, a.moreFaces, 0, this.rng);
					dmg = this.spellDamage(att, foe, a.spellMul, roll);
				} else if (a.spellKind === "piercingThrust") {
					const softened = {
						...foe,
						def: Math.max(0, Math.floor(foe.def * (1 - PIERCING_THRUST.armorIgnore)))
					};
					const hit = rollDamage(this.affinityUnit(att), this.affinityUnit(softened), tileAt(this.tiles, this.cols, att.x, att.y), tileAt(this.tiles, this.cols, foe.x, foe.y), this.rng);
					weaponRolled = true;
					landed = hit.landed;
					dmg = thrustHitIndex === 0 ? hit.dmg : Math.max(1, Math.floor(hit.dmg * .5));
					crit = hit.crit;
					if (landed) thrustHitIndex++;
				} else {
					const hit = rollDamage(this.affinityUnit(att), this.affinityUnit(foe), tileAt(this.tiles, this.cols, att.x, att.y), tileAt(this.tiles, this.cols, foe.x, foe.y), this.rng, isWeaponAbility(a.spellKind));
					weaponRolled = true;
					landed = hit.landed;
					dmg = hit.dmg;
					crit = hit.crit;
					if (a.weaponBonusDice > 0 && landed) dmg += rollDice(a.weaponBonusDice, a.weaponBonusFaces, a.weaponBonusBonus, this.rng);
				}
				if (isWeaponAbility(a.spellKind)) {
					const type = equippedWeaponType(att);
					if (!weaponRolled) {
						const accuracy = dexAccuracy(weaponModifiers(att, type).accuracy, this.affinityUnit(foe).dex);
						landed = accuracy >= 100 || this.rng() * 100 < accuracy;
					}
					if (foe.side === "enemy") this.trainWeapon(att, type, foe.level);
				}
				if (!landed) {
					this.spawnMiss(foe);
					this.pushLog(`${att.name} atacou ${foe.name}: Missed`);
					sfxPlay.miss();
					continue;
				}
				if (a.spellKind === "fantomForce") dmg = Math.max(1, Math.floor(dmg * FANTOM_FORCE.damageMul));
				if (a.dmgMul > 1) dmg = Math.max(1, Math.floor(dmg * a.dmgMul));
				if (a.spellKind === "cleave" && cleaveDoublesVs(foe)) dmg = Math.max(1, Math.floor(dmg * CLEAVE.largeMul));
				if (foe.asleep) {
					dmg = Math.max(1, Math.floor(dmg * (1 + WEB_OF_DREAMS.sleepBonusDamage)));
					foe.asleep = false;
					foe.sleepTurns = 0;
				}
				dmg = Math.max(1, Math.floor(dmg * this.zoneDamageMul(foe)));
				const element = spellElement(a.spellKind);
				if (element) dmg = Math.floor(elementalDamage(dmg, foe.resistances?.[element] ?? 0, this.affinityUnit(att).mag));
				if (dmg > 0 && a.spellKind) this.adjustAffinity(att, foe, -1);
				foe.hp = Math.max(0, foe.hp - dmg);
				if (a.spellKind === "turnUndead" && foe.hp > 0) {
					foe.fearTurns = Math.max(foe.fearTurns ?? 0, TURN_UNDEAD.fearTurns);
					foe.fearSourceId = att.id;
					this.pushLog(`${foe.name} fears the divine light and retreats for ${TURN_UNDEAD.fearTurns} turns.`);
				}
				this.noteDamageEnmity(att, foe, dmg, isWeaponAbility(a.spellKind) ? "weapon" : "spell");
				foe.flash = 1;
				foe.hitAt = this.time;
				this.provoke(foe, att);
				const poisonTier = a.spellKind === "causticVenom" ? "poison" : "lesser";
				if (a.poison && this.rng() * 100 < poisonChance(effectivePoisonResistance(foe.resistances?.poison ?? 0, poisonTier, this.affinityUnit(att).mag))) {
					const currentTier = foe.poisoned ? foe.poisonTier : void 0;
					const nextTier = strongerPoison(currentTier, poisonTier);
					if (!currentTier || nextTier !== currentTier) foe.poisonMag = this.affinityUnit(att).mag;
					else if (nextTier === poisonTier) foe.poisonMag = Math.max(foe.poisonMag ?? 0, this.affinityUnit(att).mag);
					foe.poisonTier = nextTier;
					foe.poisoned = true;
				}
				if (element) this.trainResistance(foe, element, att.level);
				if (a.spellKind === "lifeDrain") {
					const healer = this.units.find((u) => u.id === att.summonerId && u.alive);
					if (healer) {
						const gained = Math.min(Math.round(dmg * lifeDrainHealMul(att.level)), healer.maxHp - healer.hp);
						if (gained > 0) {
							healer.hp += gained;
							healer.healGlow = 1;
							healer.healGlowKind = "holyMinor";
							this.emitParticle({
								x: healer.drawX,
								y: healer.drawY - .35,
								vx: 0,
								vy: -.18,
								life: 0,
								max: 2,
								size: 1,
								color: "#d8ead2",
								text: `+${gained}`,
								kind: "text",
								frame: 0
							});
						}
					}
				}
				if (foe.side !== att.side) {
					const isAoeSpell = a.spellKind === "turnUndead" || a.spellKind === "fireball" || a.spellKind === "cleave" || a.spellKind === "piercing" || a.spellKind === "causticVenom" || a.spellKind === "minorVenom" || a.spellKind === "piercingThrust" || a.spellKind === "sweep" || a.spellKind === "divineWrath" || a.spellKind === "shoulderSmash" || a.spellKind === "stampede" || a.spellKind === "burningHands" || a.spellKind === "poisonBreath" || a.spellKind === "tendrilSwipe";
					const xpMul = foe.hp <= 0 && !isAoeSpell && (att.classId === "mage" || att.classId === "voss" || att.classId === "conjurer" || a.spellKind === "longShot" || a.spellKind === "bloodyShot") ? 2 : isAoeSpell && !firstAoeEnemyHit ? .5 : 1;
					if (isAoeSpell) firstAoeEnemyHit = false;
					this.gainExp(att, foe.level, dmg, xpMul, foe.hp <= 0);
				}
				const meleeSkill = a.spellKind === "doubleStrike" || a.spellKind === "cleave" || a.spellKind === "piercingThrust" || a.spellKind === "sweep" || a.spellKind === "trip" || a.spellKind === "shoulderSmash" || a.spellKind === "stampede" || a.spellKind === "tendrilSwipe";
				this.spawnHit(foe, dmg, crit, meleeSkill);
				const large = a.spellKind === "cleave" && cleaveDoublesVs(foe);
				this.pushLog(`${att.name} atingiu ${foe.name} com magia: ${dmg} dano${crit ? " (crítico)" : ""}${large ? " · Cleave x2 criatura grande" : ""}`);
				if (foe.hp <= 0) this.markDead(foe);
				else {
					sfxPlay.hit();
					if (a.echo) foe.shock = {
						...a.echo,
						mag: this.affinityUnit(att).mag
					};
					if (a.spellKind === "bloodyShot" && (!foe.bleeding || foe.bleedRoundsLeft != null)) {
						const duration = bloodyShotBleed(att.level);
						foe.bleeding = true;
						foe.bleedRoundsLeft = rollDice(duration.dice, duration.faces, 0, this.rng);
						foe.bleedRoundMarker = this.turn;
						this.pushLog(`${foe.name} sangra por ${foe.bleedRoundsLeft} rodadas (1D8 por ação).`);
					}
					if (a.spellKind === "sweep") this.knockBack(att, foe);
					if (a.spellKind === "shoulderSmash") for (let i = 0; i < SHOULDER_SMASH.knockback; i++) this.knockBack(att, foe);
				}
			}
			if (a.spellKind === "poisonBreath" && !syncBurningHandsVfx) this.emitFireballBurstFx(a.tiles, "causticVenom");
			if (a.spellKind === "minorVenom") this.emitFireballBurstFx(a.tiles, "causticVenom");
			if (a.spellKind === "causticVenom" && att.classId === "carnivorousPlant") this.emitFireballBurstFx(a.tiles, "causticVenom");
			const elementFx = a.spellKind ? SPELL_ELEMENT_FX[a.spellKind] : void 0;
			if (elementFx && !(a.spellKind === "burningHands" && syncBurningHandsVfx) && !(a.spellKind === "causticVenom" && syncCausticVenomVfx)) this.queueElementalFx(elementFx.kind, a.tiles, elementFx.duration);
			if ((a.spellKind === "cleave" && !a.cleaveVfxQueued || a.spellKind === "shoulderSmash") && a.tiles.length > 0) {
				const { a0, a1 } = this.arcSweepAngles({
					x: att.x,
					y: att.y
				}, a.tiles);
				this.emitBladeFx("arc", att.x, att.y, {
					a0,
					a1,
					warm: a.spellKind === "shoulderSmash"
				});
			}
			if (a.spellKind === "sweep" && !a.varreduraVfxQueued) this.emitBladeFx("ring", att.x, att.y);
			if ((a.spellKind === "piercingThrust" || a.spellKind === "stampede") && a.tiles.length > 0) {
				const end = a.tiles[a.tiles.length - 1];
				this.emitBladeFx("dash", att.x, att.y, {
					toX: end.x,
					toY: end.y
				});
			}
			if (!this.reducedMotion) this.trauma = Math.min(1, this.trauma + (a.spellKind === "lightningTier3" ? .95 : a.spellKind === "lightning" ? .72 : .45));
		}
		const boltSpell = a.spellKind === "magicMissile" || a.spellKind === "magicMissileV2" || a.spellKind === "fireball" || a.spellKind === "causticVenom" || a.spellKind === "minorVenom" || a.spellKind === "fantomForce";
		const spellEnd = Math.max(a.spellKind === "frost" ? 1.1 : 0, att.sprite === "conjurer" ? .72 : .55, boltSpell ? .8 + .15 : 0, syncPhantasmalVfx ? 1.5 : 0, syncCausticVenomVfx ? 2.9 : 0);
		if (syncMagicMissileV2Vfx && a.magicMissileV2VfxId === "" && a.t >= spellEnd) a.magicMissileV2Complete = true;
		if (syncFireballVfx) {
			if (a.fireballComplete && this.heldDone(a)) this.finishCombat(att);
		} else if (syncCausticVenomVfx) {
			if (a.causticVenomComplete && this.heldDone(a)) this.finishCombat(att);
		} else if (syncPhantasmalVfx) {
			if (a.phantasmalComplete && this.heldDone(a)) this.finishCombat(att);
		} else if (syncMagicMissileV2Vfx) {
			if (a.magicMissileV2Complete && this.heldDone(a)) this.finishCombat(att);
		} else if (syncBurningHandsVfx) {
			if (a.burningHandsComplete && this.heldDone(a)) this.finishCombat(att);
		} else if (a.t >= spellEnd && this.heldDone(a)) this.finishCombat(att);
	}
	stepHeal(a, dt) {
		const att = this.units.find((u) => u.id === a.att);
		const target = this.units.find((u) => u.id === a.def);
		if (!att || !target) {
			this.active = null;
			return;
		}
		a.t += dt;
		if (!a.applied && a.t >= .2) {
			a.applied = true;
			const heal = this.healingPower(att, rollCure(a.kind, this.affinityUnit(att).mag, this.rng));
			const gained = Math.min(heal, target.maxHp - target.hp);
			target.hp += gained;
			if (gained > 0) {
				this.gainSupportAffinity(att, target);
				this.trainHealing(att);
			}
			if (gained > 0) this.noteAwareEnmity(att, gained * ENMITY.heal.ce, gained * ENMITY.heal.ve);
			this.gainExp(att, target.level, gained);
			this.emitParticle({
				x: target.drawX,
				y: target.drawY - .35,
				vx: 0,
				vy: -.18,
				life: 0,
				max: 2,
				size: 1,
				color: "#d8ead2",
				text: `+${gained}`,
				kind: "text",
				frame: 0
			});
			this.tip = `${CURES[a.kind].name} · +${gained} HP`;
			this.pushLog(`${att.name} curou ${target.name}: +${gained} HP`);
			this.emitHolyFx(target.x, target.y, a.kind === "cureMinor" ? "minor" : a.kind === "cureLight" ? "hands" : "medium", target.id);
		}
		if (a.t >= .5) this.finishCombat(att);
	}
	stepCureDisease(a, dt) {
		const att = this.units.find((u) => u.id === a.att);
		const target = this.units.find((u) => u.id === a.def);
		if (!att || !target) {
			this.active = null;
			return;
		}
		a.t += dt;
		if (!a.applied && a.t >= .2) {
			a.applied = true;
			this.curePlayerDisease(target);
			this.gainSupportAffinity(att, target);
			this.trainHealing(att);
			this.noteAwareEnmity(att, ENMITY.support.ce, ENMITY.support.ve);
			this.emitParticle({
				x: target.drawX,
				y: target.drawY - .35,
				vx: 0,
				vy: -.18,
				life: 0,
				max: 2,
				size: 1,
				color: "#d8ead2",
				text: "curado",
				kind: "text",
				frame: 0
			});
			this.tip = `${CURE_DISEASE.name} · ${target.name} está curado.`;
			this.emitHolyFx(target.x, target.y, "disease", target.id);
		}
		if (a.t >= .5) this.finishCombat(att);
	}
	/** A wardog's bite (20%) or a zombie's hit (30%) can inflict disease on a surviving target. */
	maybeInflictDisease(actor, target) {
		const chance = actor.classId === "wardog" || actor.classId === "wardog2" ? DISEASE.biteChance : actor.classId === "zombie" || actor.classId === "zombie2" || actor.classId === "undeadOx" || actor.classId === "plagueBearingCattle" ? DISEASE.zombieChance : 0;
		if (chance <= 0 || !target.alive || target.diseased) return;
		if (this.rng() >= chance) return;
		target.diseased = true;
		target.diseaseBase = {
			atk: target.atk,
			mag: target.mag,
			def: target.def,
			dex: target.dex,
			mov: target.mov
		};
		const pen = (n) => Math.round(n * (1 - DISEASE.statPenalty));
		target.atk = pen(target.atk);
		target.mag = pen(target.mag);
		target.def = pen(target.def);
		target.dex = pen(target.dex);
		target.mov = Math.max(1, pen(target.mov));
		this.tip = `${target.name} não se sente muito bem.`;
	}
	/**
	* Grants XP for an action with a measurable, real effect — damage on a hit, HP restored by
	* a heal or potion — and applies any level-ups on the spot, mid-battle. Multi-target
	* abilities (fireball, cleave, piercing...) call this once per unit actually hit, so every
	* landed hit counts on its own. Side-eligibility (don't gain XP for friendly fire) is the
	* caller's job, since the same helper also grants XP for healing your own side.
	*/
	pushLog(line) {
		this.log.push(line);
		if (this.log.length > 200) this.log.shift();
	}
	/** Single choke point for a unit's death: sfx, the log line, and — for an enemy — the
	* kill-drop roll, so every death path (melee, counter, spell, lightning echo, tile
	* hazard) behaves identically instead of four separate copies of the same logic. */
	markDead(u) {
		u.alive = false;
		u.diedAt = this.time;
		u.deathAlt = !!this.art.deaths2[u.sprite] && Math.random() < 1 / 3;
		sfxPlay.death();
		this.pushLog(`${u.name} foi derrotado.`);
		if (u.side === "enemy" && u.guaranteedDrop) {
			const drop = weightedLootPick(this.rng, this.highestEnemyLevel(), this.ownedWeapons);
			if (drop.kind === "weapon") {
				if (this.ownedWeapons.has(drop.id)) this.lootEmber += 15;
				else {
					this.ownedWeapons.add(drop.id);
					this.lootWeapons.push(drop.id);
					this.pushLog(`Loot: ${WEAPONS[drop.id]?.name ?? drop.id}`);
				}
			} else {
				this.lootEquipment.push(drop.id);
				this.pushLog(`Loot: ${EQUIPMENT[drop.id]?.name ?? drop.id}`);
			}
		} else if (u.side === "enemy" && this.rng() < .01) {
			const id = weightedWeaponPick(this.rng, Object.keys(WEAPONS), this.highestEnemyLevel());
			if (this.ownedWeapons.has(id)) this.lootEmber += 15;
			else {
				this.ownedWeapons.add(id);
				this.lootWeapons.push(id);
				this.pushLog(`Loot: ${WEAPONS[id]?.name ?? id}`);
			}
		}
	}
	/** Finishing off a target pays 25% more XP than just wounding it — stacks multiplicatively
	* with whatever skill-specific multiplier (mage/conjurer/Long Shot's own kill bonus, the
	* AoE first-target-only full share, etc.) the caller already worked out, rather than
	* replacing it. */
	static KILL_EXP_BONUS_MUL = 1.25;
	/** A summoned familiar never persists past this battle to keep XP of its own, so its
	* attacks/spells/counters instead pay its summoning conjurer this fraction of what a real
	* unit would have earned — floored in grantExp below, never rounded up, so a small gain (a
	* familiar's own flat 1 XP counter, say) becomes 0 rather than bouncing back up to 1. */
	static FAMILIAR_XP_SHARE = .1;
	gainExp(attacker, targetLevel, amount, multiplier = 1, isKill = false) {
		if (amount <= 0 || attacker.side !== "player" || !attacker.alive) return;
		const killMul = isKill ? BattleEngine.KILL_EXP_BONUS_MUL : 1;
		const gained = Math.round(expForHit(attacker.level, targetLevel) * multiplier * killMul);
		this.grantExp(attacker, gained);
	}
	/** A successful counter always earns exactly 1 XP — flat, no level-gap scaling, no kill
	* bonus, no stacking with anything. The counter still deals its full real damage; this
	* only caps what it's worth in experience, so a unit can't out-level by baiting hits and
	* countering instead of attacking. */
	gainCounterExp(attacker) {
		if (attacker.side !== "player" || !attacker.alive) return;
		this.grantExp(attacker, 1);
	}
	/** Routes earned XP to whoever should actually keep it: a summoned familiar (summonerId
	* set) redirects FAMILIAR_XP_SHARE of its own gain to its summoning conjurer instead of
	* keeping any itself; every other unit keeps 100% of its own gain, unchanged from before. */
	grantExp(attacker, amount) {
		if (attacker.summonerId) {
			const conjurer = this.units.find((u) => u.id === attacker.summonerId);
			if (!conjurer || conjurer.side !== "player" || !conjurer.alive || conjurer.level >= 30) return;
			this.addExp(conjurer, Math.floor(amount * BattleEngine.FAMILIAR_XP_SHARE));
			return;
		}
		if (attacker.level >= 30) return;
		this.addExp(attacker, amount);
	}
	addExp(attacker, gained) {
		if (gained <= 0) return;
		attacker.xp += gained;
		while (attacker.xp >= expToLevel(attacker.level) && attacker.level < 30) {
			attacker.xp -= expToLevel(attacker.level);
			this.levelUpUnit(attacker);
		}
		if (attacker.level >= 30) attacker.xp = 0;
	}
	/** Bumps a unit by one level: stat growth, the level's HP gain added to current HP (not a
	* full heal), and any newly-unlocked tier uses granted right away. Spent charges stay
	* spent — only the extra slots this level adds land in the remaining pool. */
	levelUpUnit(u) {
		const from = u.level;
		const to = from + 1;
		const before = statsFor(u.classId, from);
		const after = statsFor(u.classId, to);
		u.level = to;
		u.maxHp = after.hp + (u.statPointAllocation.hp ?? 0);
		u.atk = after.atk + (u.statPointAllocation.atk ?? 0);
		u.mag = after.mag + (u.statPointAllocation.mag ?? 0);
		u.def = after.def + (u.statPointAllocation.def ?? 0);
		u.dex = after.dex + (u.statPointAllocation.dex ?? 0);
		u.hp = Math.min(u.maxHp, u.hp + (after.hp - before.hp));
		this.reapplyGear(u);
		const nextSpells = { ...u.spells };
		const gains = spellUseGains(u.classId, from, to);
		for (const g of gains) {
			const have = Number.isFinite(nextSpells[g.key]) ? nextSpells[g.key] : 0;
			const cap = tierUses(u.classId, g.tier, to);
			nextSpells[g.key] = Math.min(cap, have + g.gain);
		}
		u.spells = nextSpells;
		const extra = formatSpellUseGains(gains);
		this.tip = extra ? `${u.name} subiu para o nível ${to} · ${extra}` : `${u.name} subiu para o nível ${to}!`;
		this.pushLog(this.tip);
		if (extra) this.emitParticle({
			x: u.drawX,
			y: u.drawY - .55,
			vx: 0,
			vy: -.18,
			life: 0,
			max: 1.8,
			size: 1,
			color: "#e8d48a",
			text: extra,
			kind: "text",
			frame: 0
		});
		this.emitLevelUpFx(u, to);
		sfxPlay.levelUp();
	}
	curePlayerDisease(u) {
		u.poisoned = false;
		u.poisonTier = void 0;
		u.poisonMag = void 0;
		if (!u.diseaseBase) {
			u.diseased = false;
			return;
		}
		u.atk = u.diseaseBase.atk;
		u.mag = u.diseaseBase.mag;
		u.def = u.diseaseBase.def;
		u.dex = u.diseaseBase.dex;
		u.mov = u.diseaseBase.mov;
		u.diseaseBase = null;
		u.diseased = false;
	}
	/**
	* Marks a unit as having acted this turn.
	*
	* Movement is a pool of MOV per turn, not a single move that acting cancels: spend two
	* hexes, cast, and the other three are still there to run with. So acting no longer ends
	* the turn just because the unit had already walked — it stays selected with whatever
	* budget is left. The turn ends here only when there is nothing left to do with it (the
	* pool is empty), or for a unit that is dead or on the enemy side, where leaving anything
	* "selected" would expose it to player input.
	*
	* What acting does close off is the refund: undoMove refuses once acted is set, because an
	* action was taken from a position a rewind would erase.
	*/
	finishAction(u) {
		this.gainAdjacentAffinity(u);
		this.noteUnitDrawAction(u.id);
		if (u.side === "player" && !u.summoned) u.fullness = drainHunger(u.fullness, 2);
		u.acted = true;
		this.pendingFoeId = null;
		this.inspectedId = null;
		this.threat = [];
		this.attackFrom.clear();
		if (!u.alive || u.side !== "player" || u.mov - u.moveBudgetUsed <= 0) {
			u.moved = true;
			this.selectedId = null;
			this.reach.clear();
			this.orig = null;
			this.turnStart = null;
			this.mode = this.phase === "player" ? "idle" : "locked";
			return;
		}
		this.selectedId = u.id;
		this.orig = {
			x: u.x,
			y: u.y
		};
		this.origMoveBudgetUsed = u.moveBudgetUsed;
		this.reach = computeReachable(this.effectiveUnitForReach(u), this.tiles, this.cols, this.rows, this.units, true, this.decorOverlay);
		this.mode = "selected";
	}
	finishCombat(att) {
		att.drawX = att.x;
		att.drawY = att.y;
		this.active = null;
		this.spellKind = null;
		this.missileTargets = [];
		this.banner = null;
		this.evaluateEnd();
		if (this.result) {
			this.gainAdjacentAffinity(att);
			att.acted = true;
			this.selectedId = null;
			this.pendingFoeId = null;
			this.inspectedId = null;
			this.threat = [];
			this.reach.clear();
			this.attackFrom.clear();
			this.orig = null;
			this.mode = "idle";
			return;
		}
		this.finishAction(att);
	}
	smashBarricades(unit) {
		if (unit.classId !== "troll" && unit.classId !== "troll2" || !unit.alive) return;
		const fill = this.tiles.includes("nave") ? "nave" : "plains";
		const seen = /* @__PURE__ */ new Set();
		let n = 0;
		for (const p of footprint(unit)) for (const c of [p, ...hexNeighbors(p.x, p.y)]) {
			if (!inBounds(c.x, c.y, this.cols, this.rows)) continue;
			const k = key(c.x, c.y);
			if (seen.has(k)) continue;
			seen.add(k);
			const i = c.y * this.cols + c.x;
			if (this.tiles[i] !== "barricade") continue;
			this.tiles[i] = fill;
			this.terrainVersion++;
			for (let d = this.decorations.length - 1; d >= 0; d--) {
				const dec = this.decorations[d];
				if (dec.id === "barricade" && dec.x === c.x && dec.y === c.y) {
					this.decorations.splice(d, 1);
					this.refreshDecorOverlay();
				}
			}
			n += 1;
			this.emitParticle({
				x: c.x,
				y: c.y,
				vx: 0,
				vy: -.2,
				life: 0,
				max: .45,
				size: 1,
				color: "#c4a07a",
				kind: "impact",
				frame: 0
			});
		}
		if (n) {
			this.tip = "O troll parte a barricada.";
			this.trauma = Math.min(1, this.trauma + .35);
			sfxPlay.hit();
		}
	}
	nudgeOffHazard(unit) {
		const here = this.hexAt(unit.x, unit.y);
		if (here.passable || canTraverseWater(unit, here, this.decorOverlay, unit.x, unit.y, this.cols)) return;
		const occ = this.occ();
		const seen = /* @__PURE__ */ new Set([key(unit.x, unit.y)]);
		const q = [{
			x: unit.x,
			y: unit.y
		}];
		while (q.length) {
			const cur = q.shift();
			for (const n of hexNeighbors(cur.x, cur.y)) {
				if (n.x < 0 || n.y < 0 || n.x >= this.cols || n.y >= this.rows) continue;
				const k = key(n.x, n.y);
				if (seen.has(k)) continue;
				seen.add(k);
				const terr = this.hexAt(n.x, n.y);
				const who = occ.get(k);
				if ((terr.passable || canTraverseWater(unit, terr, this.decorOverlay, n.x, n.y, this.cols)) && (!who || who.id === unit.id)) {
					unit.x = n.x;
					unit.y = n.y;
					unit.drawX = n.x;
					unit.drawY = n.y;
					return;
				}
				q.push(n);
			}
		}
	}
	/** A hero must never start a map standing on a waypoint, or the "use waypoint" prompt
	* fires immediately. Moves it to the nearest passable, unoccupied, non-waypoint hex
	* (occ() includes body-type zones, so no zone is ever entered). */
	nudgeOffWaypoint(unit) {
		const waypointCells = /* @__PURE__ */ new Set();
		for (const d of this.decorations) {
			if (!DECORATIONS[d.id]?.exitKind) continue;
			for (const f of placedFootprint(d)) waypointCells.add(key(d.x + f.dx, d.y + f.dy));
		}
		if (!waypointCells.has(key(unit.x, unit.y))) return;
		const occ = this.occ();
		const seen = /* @__PURE__ */ new Set([key(unit.x, unit.y)]);
		const q = [{
			x: unit.x,
			y: unit.y
		}];
		while (q.length) {
			const cur = q.shift();
			for (const n of hexNeighbors(cur.x, cur.y)) {
				if (n.x < 0 || n.y < 0 || n.x >= this.cols || n.y >= this.rows) continue;
				const k = key(n.x, n.y);
				if (seen.has(k)) continue;
				seen.add(k);
				const who = occ.get(k);
				if (this.hexAt(n.x, n.y).passable && !waypointCells.has(k) && (!who || who.id === unit.id)) {
					unit.x = n.x;
					unit.y = n.y;
					unit.drawX = n.x;
					unit.drawY = n.y;
					return;
				}
				q.push(n);
			}
		}
	}
	/** Bleeding hurts on every action; walking only opens the wound once per own turn. */
	applyBleedingActionDamage(u, isMove) {
		if (!u || !u.alive || !u.bleeding || isMove && u.bleedMovedThisTurn) return !!u?.alive;
		if (isMove) u.bleedMovedThisTurn = true;
		const dmg = rollDice(1, 8, 0, this.rng);
		u.hp = Math.max(0, u.hp - dmg);
		u.flash = 1;
		u.hitAt = this.time;
		this.spawnHit(u, dmg, false);
		this.tip = `Sangramento · 1D8 dano`;
		this.pushLog(`Sangramento fere ${u.name}: ${dmg} dano`);
		sfxPlay.hit();
		if (u.hp <= 0) {
			this.markDead(u);
			return false;
		}
		return true;
	}
	/** Using an item (potion, lockpick) is an action: a bleeding user takes the 1D8 too. */
	bleedOnItemUse(u) {
		if (!this.applyBleedingActionDamage(u, false)) this.evaluateEnd();
	}
	/** Lightning echo + standing-hazard damage, applied once when this unit's own turn begins. */
	startOfTurnEffects(u) {
		if (!u.alive) return;
		if (u.shock) {
			const echo = u.shock;
			u.shock = null;
			const baseDamage = rollDice(echo.dice, echo.faces, echo.bonus, this.rng);
			const dmg = Math.floor(elementalDamage(baseDamage, u.resistances?.lightning ?? 0, echo.mag ?? 0));
			u.hp = Math.max(0, u.hp - dmg);
			u.flash = 1;
			u.hitAt = this.time;
			this.spawnHit(u, dmg, false);
			this.tip = `Relâmpago · ${diceFormula(echo.dice, echo.faces, echo.bonus)}`;
			this.pushLog(`Eco de relâmpago em ${u.name}: ${dmg} dano`);
			this.trainResistance(u, "lightning");
			sfxPlay.hit();
			if (u.hp <= 0) this.markDead(u);
		}
		if (u.alive && u.poisoned) {
			const tier = POISON_TIERS[u.poisonTier ?? "lesser"];
			const dmg = poisonTickDamage(rollDice(tier.dice, tier.faces, 0, this.rng), effectivePoisonResistance(u.resistances?.poison ?? 0, u.poisonTier ?? "lesser", u.poisonMag ?? 0));
			u.hp = Math.max(0, u.hp - dmg);
			u.flash = 1;
			u.hitAt = this.time;
			this.spawnHit(u, dmg, false);
			this.tip = `${tier.name} · ${poisonDice(u.poisonTier ?? "lesser")} dano`;
			this.pushLog(`Veneno consome ${u.name}: ${dmg} dano`);
			sfxPlay.hit();
			if (u.side === "player" && !u.summoned) this.trainResistance(u, "poison");
			if (u.hp <= 0) this.markDead(u);
		}
		if (u.alive) for (const zone of this.iceStormZones) {
			const isStandingInZone = [...zone.cells].some((cell) => {
				const comma = cell.indexOf(",");
				return occupies(u, Number(cell.slice(0, comma)), Number(cell.slice(comma + 1)));
			});
			if (!u.alive || !isStandingInZone) continue;
			const base = Math.floor(Math.floor(zone.casterMag / 2) * zone.damageMul) + rollDice(zone.damageDice, zone.damageFaces, 0, this.rng);
			const dmg = Math.floor(elementalDamage(base, u.resistances?.ice ?? 0, zone.casterMag));
			u.hp = Math.max(0, u.hp - dmg);
			u.flash = 1;
			u.hitAt = this.time;
			if (dmg > 0) this.spawnHit(u, dmg, false);
			this.tip = `${ICE_STORM.name} · ${diceFormula(zone.damageDice, zone.damageFaces, 0)}`;
			this.pushLog(`${ICE_STORM.name} atinge ${u.name}: ${dmg} dano`);
			this.queueElementalFx("ice", [{
				x: u.x,
				y: u.y
			}], .8);
			this.trainResistance(u, "ice", zone.casterLevel);
			const caster = this.units.find((candidate) => candidate.id === zone.casterId);
			if (caster && caster.side === "player") this.trainElementUse(caster, "ice", u.level);
			if (u.hp <= 0) this.markDead(u);
			else sfxPlay.hit();
		}
		if (u.alive && u.classId === "paladin" && u.hp / u.maxHp <= SECOND_WIND.badlyWoundedPct && this.tierRemaining(u, "secondWind") > 0) {
			this.spendTier(u, "secondWind");
			const heal = Math.min(u.maxHp - u.hp, Math.floor(secondWindPct(u.level) * u.dex));
			if (heal > 0) {
				u.hp += heal;
				u.flash = 1;
				this.emitParticle({
					x: u.drawX,
					y: u.drawY - .35,
					vx: 0,
					vy: -.18,
					life: 0,
					max: 2,
					size: 1,
					color: "#d8ead2",
					text: `+${heal}`,
					kind: "text",
					frame: 0
				});
				this.tip = `${SECOND_WIND.name} · +${heal} HP`;
				this.pushLog(`${u.name} usa ${SECOND_WIND.name}: +${heal} HP`);
				sfxPlay.heal();
			}
		}
		if (u.alive) this.applyTileHazard(u, {
			x: u.x,
			y: u.y
		});
		this.evaluateEnd();
	}
	trainingGainForLevel(unitLevel, enemyLevel) {
		const difference = unitLevel - enemyLevel;
		if (difference === 10) return null;
		if (difference === 5) return .05;
	}
	trainWeapon(unit, type, enemyLevel) {
		if (!type || unit.side !== "player" || unit.summoned || !weaponTypesForClass(unit.classId).includes(type)) return;
		const amount = this.trainingGainForLevel(unit.level, enemyLevel);
		if (amount === null) return;
		const id = `${type}Weapon`;
		const current = this.heroSkills[unit.name]?.[id] ?? 0;
		const gained = rollWeaponSkillGain(current, this.rng, amount ?? .1);
		if (gained === null) return;
		this.heroSkills[unit.name] = {
			...this.heroSkills[unit.name],
			[id]: gained
		};
		unit.weaponSkills = {
			...unit.weaponSkills,
			[type]: gained
		};
		this.logSkillGain(unit, id, current, gained);
	}
	/** Every skill point a hero earns in battle is announced in the combat log. */
	logSkillGain(unit, id, before, after) {
		const number = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
		this.pushLog(`${unit.name} melhorou ${SKILLS[id].name}: ${number(after)} (+${number(after - before)})`);
	}
	/** A familiar's elemental magic practises its summoner's matching resistance. */
	trainElementUse(caster, element, enemyLevel) {
		const learner = caster.summoned ? this.units.find((unit) => unit.id === caster.summonerId && unit.alive && unit.side === caster.side) : caster;
		if (learner) this.trainResistance(learner, element, enemyLevel);
	}
	healingPower(actor, base) {
		return healingAmount(base, skillValue(this.heroSkills, actor.name, "healing"));
	}
	trainHealing(actor) {
		if (actor.side !== "player" || actor.summoned) return;
		const current = skillValue(this.heroSkills, actor.name, "healing");
		const next = rollSkillGain(current, this.rng);
		if (next === null) return;
		this.heroSkills[actor.name] = {
			...this.heroSkills[actor.name],
			healing: next
		};
		actor.healingSkill = next;
		this.logSkillGain(actor, "healing", current, next);
	}
	trainResistance(unit, element, enemyLevel) {
		if (unit.side !== "player" || unit.summoned) return;
		const amount = enemyLevel == null ? void 0 : this.trainingGainForLevel(unit.level, enemyLevel);
		if (amount === null) return;
		const id = `${element}Resistance`;
		const current = this.heroSkills[unit.name]?.[id] ?? 0;
		const gained = rollSkillGain(current, this.rng, amount ?? .1);
		if (gained === null) return;
		this.heroSkills[unit.name] = {
			...this.heroSkills[unit.name],
			[id]: gained
		};
		unit.resistances = {
			...unit.resistances,
			[element]: Number(((unit.resistances?.[element] ?? 0) + gained - current).toFixed(2))
		};
		if (element === "poison") unit.poisonResist = gained;
		this.logSkillGain(unit, id, current, gained);
	}
	applyTileHazard(unit, cell) {
		const terr = this.hexAt(cell.x, cell.y);
		if (!terr.hazardDice || !unit.alive) return;
		const faces = terr.hazardFaces ?? 8;
		let dmg = 0;
		for (let i = 0; i < terr.hazardDice; i++) dmg += 1 + Math.floor(this.rng() * faces);
		const element = terr.id === "flame" ? "fire" : terr.id === "ember" ? "ember" : void 0;
		if (element) dmg = Math.floor(elementalDamage(dmg, unit.resistances?.[element] ?? 0));
		unit.hp = Math.max(0, unit.hp - dmg);
		unit.flash = 1;
		unit.hitAt = this.time;
		this.spawnHit(unit, dmg, false);
		this.pushLog(`${terr.name} feriu ${unit.name}: ${dmg} dano`);
		if (element) this.trainResistance(unit, element);
		sfxPlay.hit();
		if (unit.hp <= 0) {
			this.markDead(unit);
			this.onNextIdle = null;
		}
	}
	emitParticle(init) {
		if (this.reducedMotion && init.kind === "spark") return;
		let slot;
		for (const p of this.particles) if (!p.live) {
			slot = p;
			break;
		}
		if (!slot) {
			slot = this.particles.find((p) => p.kind !== "text") ?? this.particles[0];
			let oldest = 0;
			for (const p of this.particles) {
				if (p.kind === "text") continue;
				if (p.life / p.max > oldest) {
					oldest = p.life / p.max;
					slot = p;
				}
			}
		} else this.particleLive += 1;
		slot.live = true;
		slot.x = init.x;
		slot.y = init.y;
		slot.vx = init.vx;
		slot.vy = init.vy;
		slot.life = init.life;
		slot.max = init.max;
		slot.size = init.size;
		slot.color = init.color;
		slot.text = init.text;
		slot.kind = init.kind;
		slot.frame = init.frame;
	}
	/** Golden burst played once when a unit levels up: an expanding ring, a scatter of small
	* stars, and a big glowing "Nível X!" label over the head, all anchored to the unit's hex
	* and drifting in real pixel space (see LevelUpSpark) rather than the grid-snapped Particle
	* system above. Also arms the unit's own sustained levelGlow (see tick/render) so the
	* character itself, not just the burst around it, reads as glowing for a couple seconds. */
	emitLevelUpFx(u, level) {
		u.levelGlow = 1;
		if (this.reducedMotion) return;
		const cell = this.layout.tile;
		const claim = () => {
			let slot = this.levelUpFx.find((s) => !s.live);
			if (slot) {
				this.levelUpFxLive += 1;
				return slot;
			}
			slot = this.levelUpFx[0];
			let oldest = 0;
			for (const s of this.levelUpFx) if (s.life / s.max > oldest) {
				oldest = s.life / s.max;
				slot = s;
			}
			return slot;
		};
		const spawn = (init) => {
			const slot = claim();
			if (!slot) return;
			Object.assign(slot, init, { live: true });
		};
		for (const [max, size] of [[.7, 0], [.95, 0]]) spawn({
			unitId: u.id,
			kind: "ring",
			dx: 0,
			dy: -cell * .55,
			vx: 0,
			vy: 0,
			life: 0,
			max,
			size,
			hue: 46,
			rot: 0,
			vrot: 0,
			refCell: cell
		});
		const n = 18;
		for (let i = 0; i < n; i++) {
			const angle = Math.PI * 2 * i / n + (this.rng() - .5) * .4;
			const speed = cell * (.9 + this.rng() * 1.1);
			spawn({
				unitId: u.id,
				kind: "star",
				dx: 0,
				dy: -cell * .55,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed * .7 - cell * .6,
				life: 0,
				max: .85 + this.rng() * .5,
				size: cell * (.05 + this.rng() * .05),
				hue: 42 + this.rng() * 20,
				rot: this.rng() * Math.PI,
				vrot: (this.rng() - .5) * 6,
				refCell: cell
			});
		}
		spawn({
			unitId: u.id,
			kind: "label",
			text: `Nível ${level}`,
			dx: 0,
			dy: 0,
			vx: 0,
			vy: -this.layout.tile * .05,
			life: 0,
			max: 2.2,
			size: this.layout.tile * Math.sqrt(3) * .5,
			hue: 46,
			rot: 0,
			vrot: 0,
			refCell: cell
		});
	}
	/** Potionzero — the original warm-white halo + rising motes. Kept as its own FX so a
	* future skill can fire it without sharing the new holy/potion bursts. Not used by
	* current heals or potions. */
	emitPotionZeroFx(u) {
		u.healGlow = 1;
		u.healGlowKind = "potionZero";
		if (this.reducedMotion) return;
		const n = 6;
		for (let i = 0; i < n; i++) {
			const ang = -Math.PI / 2 + (this.rng() - .5) * 1.6;
			const speed = .5 + this.rng() * .6;
			this.emitParticle({
				x: u.drawX + (this.rng() - .5) * .5,
				y: u.drawY - .1,
				vx: Math.cos(ang) * speed * .3,
				vy: Math.sin(ang) * speed - .3,
				life: 0,
				max: .7 + this.rng() * .3,
				size: 2 + this.rng() * 2,
				color: "#fff6df",
				kind: "spark",
				frame: 0
			});
		}
	}
	/** Divine light on a hex (and optional unit). minor = Cura Menor, medium = Cura Média /
	* hands = Healing Hands, disease = Curar Doença (teal), potion = the drink FX. */
	emitHolyFx(x, y, kind, unitId = "") {
		const u = unitId ? this.units.find((n) => n.id === unitId) : this.units.find((n) => n.alive && n.x === x && n.y === y);
		if (u) {
			u.healGlow = kind === "minor" ? .72 : kind === "hands" ? .86 : kind === "potion" ? .88 : 1;
			u.healGlowKind = kind === "minor" ? "holyMinor" : kind === "hands" ? "healingHands" : kind === "medium" ? "holyMedium" : kind === "food" ? "food" : kind === "disease" ? "disease" : "potion";
		}
		if (this.reducedMotion) return;
		let slot = this.holyFx.find((h) => !h.live);
		if (!slot) {
			slot = this.holyFx[0];
			let oldest = 0;
			for (const h of this.holyFx) if (h.t / h.max > oldest) {
				oldest = h.t / h.max;
				slot = h;
			}
		} else this.holyFxLive += 1;
		const rayCount = kind === "medium" || kind === "food" ? 10 : kind === "hands" || kind === "disease" ? 8 : kind === "potion" ? 5 : 6;
		slot.live = true;
		slot.unitId = u?.id ?? unitId;
		slot.x = x;
		slot.y = y;
		slot.t = 0;
		slot.max = holyDuration(kind);
		slot.kind = kind;
		slot.seed = this.rng() * Math.PI * 2;
		slot.rays = Array.from({ length: rayCount }, (_, i) => Math.PI * 2 * i / rayCount + (this.rng() - .5) * .18);
	}
	/** Queues one WebGL elemental FX spawn per target tile, drained by BattleCanvas's render
	* loop (see elementalFxRequests). Respects reducedMotion the same way every other spell-hit
	* FX emitter here does. */
	queueElementalFx(kind, tiles, duration) {
		if (this.reducedMotion) return;
		for (const t of tiles) this.elementalFxRequests.push({
			kind,
			x: t.x,
			y: t.y,
			duration
		});
	}
	/** One burning patch per Fireball area cell, all procedural so it conforms to every map. */
	emitFireballBurstFx(tiles, kind) {
		if (this.reducedMotion) return;
		for (const cell of tiles) {
			let burst = this.fireballBurstFx.find((x) => !x.live);
			if (!burst) burst = this.fireballBurstFx[0];
			else this.fireballBurstFxLive += 1;
			burst.live = true;
			burst.x = cell.x;
			burst.y = cell.y;
			burst.t = 0;
			burst.max = kind === "causticVenom" ? .92 : .58;
			burst.seed = this.rng() * Math.PI * 2;
			burst.kind = kind;
		}
	}
	/** Select the supplied cue for the actual weapon or Kael's Blade Skill. */
	playMeleeCue(unit, offHand = false, skill, bladeStartAt = 0) {
		if (unit.name === "Kael" && skill && [
			"cleave",
			"sweep",
			"shoulderSmash",
			"stampede",
			"piercingThrust",
			"trip",
			"doubleStrike",
			"bullRush",
			"executionerStrike"
		].includes(skill)) {
			sfxPlay.kaelBladeSkill();
			return;
		}
		const weaponId = offHand ? unit.offHandId : unit.weaponId ?? starterWeaponFor(unit.classId);
		if (weaponId && EQUIPMENT[weaponId]?.weaponType === "dagger") sfxPlay.daggerAttack();
		else sfxPlay.meleeAttack(this.isBladeAttack(unit, offHand), bladeStartAt);
	}
	/** Resolve the striking hand; shared class pools also contain blunt weapons. */
	isBladeAttack(unit, offHand = false) {
		if (offHand) return !!unit.offHandId && EQUIPMENT[unit.offHandId]?.kind === "weapon";
		const weaponId = unit.weaponId ?? starterWeaponFor(unit.classId);
		return !!weaponId && /^(espada|machado|lamina|adaga|punhal|katar)/.test(weaponId);
	}
	/** True only for bow/crossbow users. Reach weapons strike physically instead of firing arrows. */
	isArrowAttack(unit) {
		if (unit.classId === "pikeman" || unit.classId === "lancer" || unit.classId === "aldric" || unit.classId === "sandoval" || unit.classId === "sentinel" || unit.classId === "templar") return false;
		if (unit.classId === "brigand") return true;
		if (unit.weaponId) return !!WEAPONS[unit.weaponId]?.ranged;
		return unit.classId === "archer" || unit.classId === "ranger" || unit.classId === "assassin";
	}
	/** Only spellcasting classes use the distinct basic-attack arcane bolt. */
	isArcaneCaster(unit) {
		return unit.classId === "mage" || unit.classId === "voss" || unit.classId === "elementalist" || unit.classId === "warlock" || unit.classId === "cultist" || unit.classId === "cultistV2" || unit.classId === "birolho" || unit.classId === "birolho2" || unit.classId === "birolho3" || unit.classId === "birolhoLegs" || unit.classId === "birolhoLegs2";
	}
	/** One glowing bolt per target, hex-to-hex — see MissileFx. */
	emitMissileFx(fromX, fromY, toX, toY, kind) {
		if (kind === "longShot") sfxPlay.arrowRelease(this.units.find((u) => u.x === Math.round(fromX) && u.y === Math.round(fromY) && u.alive)?.sprite === "neera");
		if (this.reducedMotion) return;
		let slot = this.missileFx.find((m) => !m.live);
		if (!slot) {
			slot = this.missileFx[0];
			let oldest = 0;
			for (const m of this.missileFx) if (m.t / m.max > oldest) {
				oldest = m.t / m.max;
				slot = m;
			}
		} else this.missileFxLive += 1;
		slot.live = true;
		slot.fromX = fromX;
		slot.fromY = fromY;
		slot.toX = toX;
		slot.toY = toY;
		slot.t = 0;
		slot.travel = kind === "longShot" ? ARROW_TRAVEL : kind === "webOfDreams" ? WEB_SHOT_TRAVEL : kind === "fantomForce" ? FANTOM_FORCE_TRAVEL : kind === "phantasmalForce" ? PHANTASMAL_FORCE_TRAVEL : kind === "magicMissile" || kind === "fireball" || kind === "causticVenom" || kind === "minorVenom" ? SPELL_TRAVEL : MISSILE_TRAVEL;
		slot.max = slot.travel + MISSILE_AFTERGLOW;
		slot.hue = kind === "fireball" ? 22 : kind === "causticVenom" || kind === "minorVenom" ? 104 : kind === "longShot" ? 205 : kind === "arcaneBolt" ? 2 : kind === "webOfDreams" ? 276 : kind === "phantasmalForce" ? 202 : 268;
		slot.neeraArrow = kind === "longShot" && this.units.some((u) => u.alive && u.sprite === "neera" && u.x === Math.round(fromX) && u.y === Math.round(fromY));
		slot.kind = kind;
		slot.seed = this.rng() * Math.PI * 2;
	}
	/** A bolt struck down onto one hex — see LightningFx. The jagged shape (main bolt plus
	* forks) is rolled once here so it stays put for the strike's whole short life.
	* `power: "shock"` is Choque; `"raio"` is Relâmpago; `"t3"` is Lighting Tier 3. */
	emitLightningFx(x, y, power = "shock") {
		if (this.reducedMotion) return;
		const emitOne = (spread, segs, branchMin, branchExtra, hue) => {
			let slot = this.lightningFx.find((l) => !l.live);
			if (!slot) {
				slot = this.lightningFx[0];
				let oldest = 0;
				for (const l of this.lightningFx) if (l.t / l.max > oldest) {
					oldest = l.t / l.max;
					slot = l;
				}
			} else this.lightningFxLive += 1;
			const rollSegs = (n, s) => Array.from({ length: n }, () => (this.rng() - .5) * s);
			slot.live = true;
			slot.x = x;
			slot.y = y;
			slot.t = 0;
			slot.max = power === "t3" ? LIGHTNING_T3_DUR : power === "raio" || power === "divine" ? LIGHTNING_RAIO_DUR : LIGHTNING_STRIKE_DUR;
			slot.hue = hue;
			slot.segs = rollSegs(segs, spread);
			slot.power = power;
			const branchCount = branchMin + Math.floor(this.rng() * (branchExtra + 1));
			const branchSegs = power === "t3" ? 7 : power === "raio" || power === "divine" ? 6 : 4;
			const branchSpread = power === "t3" ? .62 : power === "raio" || power === "divine" ? .55 : .4;
			slot.branches = Array.from({ length: branchCount }, () => ({
				at: .18 + this.rng() * .58,
				side: this.rng() < .5 ? -1 : 1,
				segs: rollSegs(branchSegs, branchSpread)
			}));
		};
		if (power === "divine") {
			emitOne(.28, 11, 3, 2, 42 + this.rng() * 12);
			emitOne(.18, 8, 2, 1, 48 + this.rng() * 8);
		} else if (power === "divineSplash") emitOne(.14, 6, 1, 1, 42 + this.rng() * 12);
		else if (power === "t3") {
			emitOne(.2, 9, 2, 1, 206 + this.rng() * 10);
			emitOne(.12, 7, 1, 1, 198 + this.rng() * 8);
		} else if (power === "raio") {
			emitOne(.42, 14, 4, 2, 210 + this.rng() * 18);
			emitOne(.28, 11, 2, 2, 198 + this.rng() * 14);
		} else emitOne(.34, 9, 2, 1, 200 + this.rng() * 20);
	}
	/** Summon Familiar's conjuring circle — see PortalFx/drawPortalFx. */
	emitPortalFx(x, y, body = null, red = false) {
		if (this.reducedMotion) return;
		let slot = this.portalFx.find((p) => !p.live);
		if (!slot) {
			slot = this.portalFx[0];
			let oldest = 0;
			for (const p of this.portalFx) if (p.t / p.max > oldest) {
				oldest = p.t / p.max;
				slot = p;
			}
		} else this.portalFxLive += 1;
		slot.live = true;
		slot.x = x;
		slot.y = y;
		slot.t = 0;
		slot.max = body && body.length > 1 ? 1.3 : .85;
		slot.seed = this.rng() * Math.PI * 2;
		slot.body = body && body.length > 1 ? body : null;
		slot.red = red;
	}
	/** One steel-swoosh effect — see BladeFx/BladeKind. Shared by every warrior/lancer/knight
	* physical skill; `opts` fills in only whatever that shape needs (arc's a0/a1, dash's
	* toX/toY, Shoulder Smash's warm tint). */
	emitBladeFx(kind, x, y, opts = {}) {
		if (this.reducedMotion) return;
		let slot = this.bladeFx.find((b) => !b.live);
		if (!slot) {
			slot = this.bladeFx[0];
			let oldest = 0;
			for (const b of this.bladeFx) if (b.t / b.max > oldest) {
				oldest = b.t / b.max;
				slot = b;
			}
		} else this.bladeFxLive += 1;
		slot.live = true;
		slot.kind = kind;
		slot.x = x;
		slot.y = y;
		slot.toX = opts.toX ?? x;
		slot.toY = opts.toY ?? y;
		slot.a0 = opts.a0 ?? 0;
		slot.a1 = opts.a1 ?? opts.a0 ?? 0;
		slot.warm = opts.warm ?? false;
		slot.mirrorX = opts.mirrorX ?? false;
		slot.t = 0;
		slot.max = opts.dur ?? (kind === "rushTrail" ? .5 : kind === "rushImpact" ? .55 : kind === "execution" ? .7 : kind === "tripSweep" ? .65 : kind === "ring" || kind === "shockRing" ? .46 : kind === "dash" ? .36 : .4);
		slot.seed = this.rng() * Math.PI * 2;
	}
	/** The unwrapped angle range (a0..a1, a1 >= a0) from `origin` through each hex in
	* `tiles` in order — used to point Cleave/Shoulder Smash's blade arc at exactly the fan of
	* hexes cleaveHexes picked, whichever of the 6 ring directions that turned out to be. */
	arcSweepAngles(origin, tiles) {
		const o = this.hexCenter(origin.x, origin.y);
		const angleTo = (t) => {
			const c = this.hexCenter(t.x, t.y);
			return Math.atan2(c.cy - o.cy, c.cx - o.cx);
		};
		const unwrap = (base, ang) => {
			let d = ang - base;
			while (d > Math.PI) d -= Math.PI * 2;
			while (d < -Math.PI) d += Math.PI * 2;
			return base + d;
		};
		const a0 = angleTo(tiles[0]);
		let last = a0;
		for (let i = 1; i < tiles.length; i++) last = unwrap(last, angleTo(tiles[i]));
		return last >= a0 ? {
			a0,
			a1: last
		} : {
			a0: last,
			a1: a0
		};
	}
	/** A whiffed attack: just the floating "Missed" text, no impact flash or hit particles. */
	spawnMiss(target) {
		this.emitParticle({
			x: target.drawX,
			y: target.drawY - .35,
			vx: 0,
			vy: -.18,
			life: 0,
			max: 2,
			size: 1,
			color: "#c9c4bb",
			text: "Missed",
			kind: "text",
			frame: 0
		});
	}
	spawnHit(target, dmg, crit, physicalImpact = false) {
		const cx = target.drawX;
		const cy = target.drawY;
		this.emitParticle({
			x: cx,
			y: cy - .35,
			vx: 0,
			vy: -.18,
			life: 0,
			max: 2,
			size: 1,
			color: crit ? "#f0ebe3" : "#f2d2c6",
			text: crit ? `CRÍTICO  −${dmg}` : `−${dmg}`,
			kind: "text",
			frame: 0
		});
		this.emitParticle({
			x: cx,
			y: cy - .15,
			vx: 0,
			vy: 0,
			life: 0,
			max: .32,
			size: 1,
			color: "#fff",
			kind: "impact",
			frame: 0
		});
		if (this.reducedMotion) return;
		const n = 3;
		for (let i = 0; i < n; i++) {
			const ang = Math.PI * 2 * i / n + this.rng();
			this.emitParticle({
				x: cx,
				y: cy,
				vx: Math.cos(ang) * (1.4 + this.rng()),
				vy: Math.sin(ang) * (1.4 + this.rng()) - .4,
				life: 0,
				max: .28 + this.rng() * .12,
				size: 2 + this.rng() * 2,
				color: i % 2 ? "#b54a32" : "#f0ebe3",
				kind: "spark",
				frame: 0
			});
		}
	}
	/** A player strike on a wild neutral wakes the whole species: every living neutral of the
	* same class turns "enemy" at once. They are not in this round's turn order, so they rouse
	* and start acting from the next round. Nothing turns a woken beast back. */
	provoke(target, attacker) {
		if (target.side !== "neutral" || attacker.side !== "player") return;
		const pack = this.units.filter((u) => u.alive && u.side === "neutral" && u.classId === target.classId);
		for (const u of pack) u.side = "enemy";
		this.pushLog(pack.length > 1 ? `${target.name} reage — e todo o bando de ${CLASSES[target.classId].name.toLowerCase()} vem junto (${pack.length}).` : `${target.name} se volta contra vocês.`);
		this.evaluateEnd();
	}
	/** Inn-quest pickups: a living player unit standing on one picks it up. Checked from
	* evaluateEnd, which already runs after every walk finishes. */
	collectQuestPickups() {
		if (this.questPickups.length === 0) return;
		for (const pickup of [...this.questPickups]) {
			const finder = this.units.find((u) => u.side === "player" && u.alive && u.x === pickup.x && u.y === pickup.y);
			if (!finder) continue;
			this.questPickups = this.questPickups.filter((p) => p.key !== pickup.key);
			this.questFound.push(pickup.key);
			this.tip = `${finder.name} encontrou: ${pickup.name}.`;
			this.pushLog(this.tip);
			sfxPlay.chest();
		}
	}
	evaluateEnd() {
		if (this.result) return;
		this.collectQuestPickups();
		const exitHit = this.exitDecorationHere();
		if (this.mission.explore) {
			this.winAvailable = !!exitHit;
			this.activeExit = exitHit;
			return;
		}
		const p = this.units.some((u) => u.side === "player" && u.alive && !u.summoned);
		const bossAlive = this.units.some((u) => u.side === "enemy" && u.alive && isBossClass(u.classId));
		const anyEnemy = this.units.some((u) => u.side === "enemy" && u.alive);
		const won = !!exitHit || (this.mission.win === "boss" ? !bossAlive : this.mission.win === "escape" ? false : !anyEnemy);
		this.winAvailable = won;
		this.activeExit = exitHit;
		if (!p) this.result = "defeat";
	}
	/** The waypoint a living player unit is currently standing on, if any. */
	exitDecorationHere() {
		for (const u of this.units) {
			if (u.side !== "player" || !u.alive) continue;
			const hit = this.decorations.find((d) => DECORATIONS[d.id]?.exitKind && placedFootprint(d).some((f) => d.x + f.dx === u.x && d.y + f.dy === u.y));
			if (hit) return hit;
		}
		return null;
	}
	exitUnitHere(exit) {
		const cells = placedFootprint(exit);
		return this.units.find((unit) => unit.side === "player" && unit.alive && cells.some((cell) => exit.x + cell.dx === unit.x && exit.y + cell.dy === unit.y)) ?? null;
	}
	/** Confirms the currently offered mission exit. Escape waypoints keep their explicit 60%
	* chance; on failure the active hero loses their turn and the encounter continues. */
	canConfirmFinish() {
		if (!this.winAvailable || this.result) return false;
		if (this.activeExit && DECORATIONS[this.activeExit.id]?.exitKind === "escape") return !!this.exitUnitHere(this.activeExit);
		return true;
	}
	confirmFinish() {
		if (!this.canConfirmFinish()) return;
		if (this.activeExit && DECORATIONS[this.activeExit.id]?.exitKind === "escape") {
			const u = this.exitUnitHere(this.activeExit);
			if (!u) return;
			if (this.rng() * 100 < this.fleeChance(u)) {
				this.tip = `${u.name} encontrou uma saída! O grupo foge do combate.`;
				this.pushLog(this.tip);
				this.result = "victory";
			} else {
				u.moved = true;
				u.acted = true;
				u.x = Math.round(u.drawX);
				u.y = Math.round(u.drawY);
				u.drawX = u.x;
				u.drawY = u.y;
				this.deselect(true);
				this.tip = `${u.name} não conseguiu fugir — o combate continua.`;
				this.pushLog(this.tip);
			}
			sfxPlay.ui();
			this.emit();
			return;
		}
		this.result = "victory";
	}
	/** First not-yet-acted unit in this round's initiative order, or null if everyone has gone. */
	activeTurnUnit() {
		for (const id of this.turnOrder) {
			const u = this.units.find((x) => x.id === id);
			if (u && u.alive && !u.moved) return u;
		}
		return null;
	}
	/** Whoever the board should visually credit as "acting right now" — for activeTurnHighlight
	* only, never for turn-order logic (which stays on activeTurnUnit/`.moved` exactly as it
	* is). Enemy AI (runAiFor) sets `.moved = true` the instant it DECIDES to move, not once the
	* queued walk actually finishes — turn-advancement needs that (tick() only looks for the
	* next unit once `this.queue` fully drains, so the flag has to already be true by then), but
	* it means an enemy's own `activeTurnUnit()` stops returning it before its walk animation
	* even starts, so the hex vanished mid-move ("enemies have no hex when they move", a direct
	* complaint). Prefer whoever `this.active` (the queue item currently mid-playback) actually
	* belongs to — `.id` on a move, `.att` on everything else with an actor — falling back to
	* activeTurnUnit() the rest of the time (nothing queued, or a queue item with no actor, like
	* a banner/delay). */
	visuallyActingUnit() {
		const a = this.active;
		const actorId = a?.id ?? a?.att;
		if (actorId) {
			const u = this.units.find((x) => x.id === actorId);
			if (u && u.alive) return u;
		}
		return this.activeTurnUnit();
	}
	select(unit) {
		if (unit.side !== "player" || !unit.alive || unit.moved || this.phase !== "player") return;
		const active = this.activeTurnUnit();
		if (active && active.id !== unit.id) {
			this.tip = `Ainda não é a vez de ${unit.name} — espere ${active.name} agir.`;
			return;
		}
		if (this.selectedId === unit.id && this.mode === "awaitAction") return;
		this.selectedId = unit.id;
		this.pendingFoeId = null;
		this.inspectedId = null;
		this.orig = {
			x: unit.x,
			y: unit.y
		};
		this.origMoveBudgetUsed = unit.moveBudgetUsed;
		this.reach = computeReachable(this.effectiveUnitForReach(unit), this.tiles, this.cols, this.rows, this.units, true, this.decorOverlay);
		this.attackFrom = unit.acted ? /* @__PURE__ */ new Map() : this.visibleAttackTargets(unit);
		this.threat = [];
		this.mode = "selected";
		this.tip = null;
		this.ensureVisible(unit.x, unit.y);
		sfxPlay.select();
	}
	/** Read-only snapshot of any living unit, keyed by id — lets UI browse the roster (a
	* "next character" control on the status sheet, say) without touching inspectedId or
	* selectedId, so it can't disturb an attack/spell forecast already in progress the way
	* calling the private inspect() from outside would. */
	publicUnit(unitId) {
		const u = this.units.find((candidate) => candidate.id === unitId);
		if (!u || !u.alive) return null;
		return pub(this.affinityUnit(u), this.isWebCell(u.x, u.y), this.movLeft(u));
	}
	/** Drops the current inspection without touching the selection, so the same unit can be
	* clicked open again after its status sheet is closed. */
	dismissInspect() {
		this.inspectedId = null;
		this.threat = [];
		this.tip = null;
	}
	inspect(unit) {
		this.inspectedId = unit.id;
		this.threat = computeThreat(unit, this.tiles, this.cols, this.rows, this.units, this.decorOverlay);
		const max = effectiveMaxRange(unit, tileAt(this.tiles, this.cols, unit.x, unit.y));
		const tile = this.hexAt(unit.x, unit.y);
		this.tip = `${unit.name} · HP ${unit.hp}/${unit.maxHp} · Alc ${unit.minRange === max ? max : `${unit.minRange}–${max}`}${tile.height ? " · alto +10% atq" : ""}${tile.id === "barricade" ? " · barricada bloqueia projéteis" : ""}${unit.classId === "troll" || unit.classId === "troll2" ? " · parte barricadas" : ""}${unit.shock ? ` · Relâmpago ${diceFormula(unit.shock.dice, unit.shock.faces, unit.shock.bonus)} no turno` : ""}${unit.diseased ? " · Doente (−10% em todos os stats)" : ""}${unit.poisoned ? ` · ${POISON_TIERS[unit.poisonTier ?? "lesser"].name} (${poisonDice(unit.poisonTier ?? "lesser")} dano por turno)` : ""}`;
		this.ensureVisible(unit.x, unit.y);
		sfxPlay.ui();
	}
	/** Whether the movement taken this turn can still be taken back.
	*
	* Only for the player's own active unit, only while it is standing somewhere other than
	* where its turn began, and only while nothing has been spent that a rewind could not
	* honestly return: acting fixes the position the action was taken from, and a move that
	* broke a barricade or crossed a hazard has already changed the board (see moveSpoiled). */
	canUndoMove() {
		const u = this.activeTurnUnit();
		return !!u && u.side === "player" && u.alive && !u.acted && !u.moved && !this.moveSpoiled && !!this.turnStart && !this.active && this.queue.length === 0 && (u.x !== this.turnStart.x || u.y !== this.turnStart.y) && (this.mode === "selected" || this.mode === "awaitAction" || this.mode === "awaitAttack" || this.mode === "awaitOffHand" || this.mode === "awaitSpell" || this.mode === "awaitPotion");
	}
	/** A post-action move that used the last movement points can still be cancelled before
	* the player explicitly ends the turn. `orig` is the safe position captured when the
	* action finished, so this only rewinds the movement after that action. */
	canCancelCommittedMovement() {
		const u = this.units.find((candidate) => candidate.id === this.selectedId);
		return !!u && u.side === "player" && u.alive && u.acted && !u.moved && !this.moveSpoiled && !!this.orig && (u.x !== this.orig.x || u.y !== this.orig.y) && !this.active && this.queue.length === 0 && this.mode === "selected";
	}
	/** Puts the active unit back where its turn began and refunds every hex it walked — the
	* whole budget, not the last hop, so a wrong click costs nothing. Undoing is not itself a
	* move: the unit is left selected with its full reach, exactly as the turn opened. */
	undoMove() {
		if (!this.canUndoMove()) return;
		const u = this.activeTurnUnit();
		const back = this.turnStart;
		u.x = back.x;
		u.y = back.y;
		u.drawX = back.x;
		u.drawY = back.y;
		u.moveBudgetUsed = 0;
		this.orig = {
			x: back.x,
			y: back.y
		};
		this.origMoveBudgetUsed = 0;
		this.pendingFoeId = null;
		this.inspectedId = null;
		this.threat = [];
		this.spellArmed = false;
		this.spellAim = null;
		this.spellKind = null;
		this.potionAim = null;
		this.missileTargets = [];
		this.selectedId = u.id;
		this.mode = "selected";
		this.reach = computeReachable(this.effectiveUnitForReach(u), this.tiles, this.cols, this.rows, this.units, true, this.decorOverlay);
		this.attackFrom = this.visibleAttackTargets(u);
		this.ensureVisible(u.x, u.y);
		this.centerOn(u.x, u.y);
		this.tip = `${u.name} voltou ao ponto de partida — ${u.mov} de movimento de volta.`;
		sfxPlay.ui();
		this.emit();
	}
	deselect(commit = false) {
		const u = this.units.find((x) => x.id === this.selectedId);
		const orig = this.orig;
		if (!commit && u && orig && (this.mode === "awaitAction" || this.mode === "selected") && u && orig) {
			u.x = orig.x;
			u.y = orig.y;
			u.drawX = u.x;
			u.drawY = u.y;
			u.moveBudgetUsed = this.origMoveBudgetUsed ?? (u.acted ? u.moveBudgetUsed : 0);
			this.evaluateEnd();
		}
		this.selectedId = null;
		this.pendingFoeId = null;
		this.inspectedId = null;
		this.threat = [];
		this.reach.clear();
		this.attackFrom.clear();
		this.orig = null;
		this.origMoveBudgetUsed = null;
		this.mode = "idle";
	}
	/** Backs a cancelled skill/attack/off-hand choice out to the same "selected" state the
	* unit was already in — reach and attackable targets recomputed fresh — instead of the
	* old half-cleared "awaitAction" mode, which never recomputed reach and left the
	* movement highlight gone until the unit was fully deselected and reselected. */
	returnToSelected(u) {
		this.selectedId = u.id;
		this.pendingFoeId = null;
		this.mode = "selected";
		this.reach = computeReachable(this.effectiveUnitForReach(u), this.tiles, this.cols, this.rows, this.units, true, this.decorOverlay);
		this.attackFrom = u.acted ? /* @__PURE__ */ new Map() : this.visibleAttackTargets(u);
	}
	cancel() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (this.active?.type === "move" && u?.side === "player" && u.alive && this.active.id === u.id) {
			this.active = null;
			this.queue.length = 0;
			this.onNextIdle = null;
			this.waypointCheckPending = false;
			this.mode = "selected";
			this.deselect();
			sfxPlay.ui();
			this.emit();
			return;
		}
		if (this.canUndoMove()) {
			this.undoMove();
			return;
		}
		if (this.mode === "awaitSpell") {
			this.spellArmed = false;
			this.spellAim = null;
			this.spellKind = null;
			this.missileTargets = [];
			this.tip = null;
			if (u) this.returnToSelected(u);
			else this.deselect();
			sfxPlay.ui();
			return;
		}
		if (this.mode === "awaitPotion") {
			this.potionAim = null;
			this.tip = null;
			if (u) this.returnToSelected(u);
			else this.deselect();
			sfxPlay.ui();
			return;
		}
		if ((this.mode === "awaitAttack" || this.mode === "awaitOffHand") && u) {
			this.tip = null;
			this.returnToSelected(u);
			sfxPlay.ui();
			return;
		}
		this.deselect();
		sfxPlay.ui();
	}
	wait() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || this.phase !== "player") return;
		this.noteUnitDrawAction(u.id);
		u.moved = true;
		u.x = Math.round(u.drawX);
		u.y = Math.round(u.drawY);
		u.drawX = u.x;
		u.drawY = u.y;
		this.deselect(true);
		sfxPlay.ui();
	}
	startAttack() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted) return;
		this.mode = "awaitAttack";
		this.tip = "Toque no alvo.";
		sfxPlay.ui();
	}
	startOffHand() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || !u.offHandId) return;
		this.mode = "awaitOffHand";
		this.tip = "Toque no alvo.";
		sfxPlay.ui();
	}
	/** Shared by off-hand highlighting and target validation so both use identical reach. */
	offHandReach(unit) {
		const item = unit.offHandId ? EQUIPMENT[unit.offHandId] : null;
		return item?.kind === "weapon" ? {
			...unit,
			minRange: item.minRange ?? 1,
			maxRange: item.maxRange ?? 1
		} : unit;
	}
	/** `kind`'s remaining casts for `u` this battle: a familiar casting its OWN spell (see
	* FAMILIAR_SPELL) draws from its own spellCharges (set at summon time, never a slot-table
	* tier — see familiarSpellCharges); every other caster (including a familiar's other
	* actions, which is a no-op since they have none) uses the normal tier-slot pool. */
	familiarSpellRemaining(u, kind) {
		return FAMILIAR_SPELL[u.classId] === kind ? u.spellCharges ?? 0 : this.tierRemaining(u, kind);
	}
	/** Spends one cast of `kind` for `u`: its own spellCharges if `kind` is that familiar's own
	* spell (see FAMILIAR_SPELL), otherwise the normal tier-slot pool — has to agree with
	* familiarSpellRemaining above on which pool a given (unit, kind) pair actually draws from. */
	spendFamiliarOrTier(u, kind) {
		if (FAMILIAR_SPELL[u.classId] === kind) u.spellCharges = Math.max(0, (u.spellCharges ?? 1) - 1);
		else this.spendTier(u, kind);
	}
	startFireball() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.familiarSpellRemaining(u, "fireball") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "fireball";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${FIREBALL.name}: alcance ${FIREBALL.range}, ${fireballFormula(u.mag)} em área. Toque para mirar, toque de novo para lançar.`;
		sfxPlay.ui();
	}
	frostTiles(origin, through, level) {
		const cells = frostAreaTiles(origin, through, level ?? origin.level, this.cols, this.rows);
		const out = [];
		for (const cell of cells) {
			if (tileAt(this.tiles, this.cols, cell.x, cell.y) === "void" || !clearShot(origin, cell, this.tiles, this.cols, "bolt", this.decorOverlay)) break;
			out.push(cell);
		}
		return out;
	}
	startFrost() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || u.side === "player" && u.level < FROST.unlockLevel || this.tierRemaining(u, "frost") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "frost";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `Frost: linha de ${frostPower(u.level).length} hexes à frente. Dano de Ice; atinge aliados também.`;
	}
	queueFrost(u, origin, through) {
		const cells = this.frostTiles(origin, through, u.level);
		if (!cells.length) return;
		const ids = this.units.filter((target) => target.alive && target.id !== u.id && cells.some((c) => occupies(target, c.x, c.y))).map((target) => target.id);
		const p = frostPower(u.level);
		this.spendTier(u, "frost");
		this.queue.push({
			type: "spell",
			att: u.id,
			tiles: cells,
			ids,
			dice: p.dice,
			faces: p.faces,
			bonus: 0,
			spellMul: p.mul,
			label: FROST.name,
			spellKind: "frost"
		});
	}
	castFrost(u, cell) {
		if (this.tierRemaining(u, "frost") <= 0 || !this.frostTiles(u, cell).length) return;
		this.queueFrost(u, u, cell);
		this.spellKind = null;
		this.mode = "locked";
		this.tip = null;
	}
	startTurnUndead() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || rulesClass(u.classId) !== "healer" || this.tierRemaining(u, "turnUndead") <= 0) return;
		const p = turnUndeadPower(u.level);
		this.mode = "awaitSpell";
		this.spellKind = "turnUndead";
		this.spellArmed = true;
		this.spellAim = {
			x: u.x,
			y: u.y
		};
		this.hover = {
			x: u.x,
			y: u.y
		};
		this.tip = `${TURN_UNDEAD.name}: radius ${p.radius} around the priest (${p.areaHexes} hexes), ${turnUndeadFormula(u.level, u.mag)} Holy damage and ${p.fearTurns} turns of fear against undead. Review the highlighted area, then confirm or cancel.`;
	}
	turnUndeadTiles(cell, level) {
		return hexAreaTiles(cell, turnUndeadPower(level).radius, this.cols, this.rows).filter((p) => tileAt(this.tiles, this.cols, p.x, p.y) !== "void");
	}
	castTurnUndead(unit) {
		if (unit.acted || rulesClass(unit.classId) !== "healer" || this.tierRemaining(unit, "turnUndead") <= 0) return;
		const p = turnUndeadPower(unit.level);
		const tiles = this.turnUndeadTiles(unit, unit.level);
		const ids = this.units.filter((target) => target.alive && !target.dialog && isUndeadClass(target.classId) && tiles.some((cell) => occupies(target, cell.x, cell.y))).map((target) => target.id);
		this.spendTier(unit, "turnUndead");
		this.spellKind = null;
		this.spellArmed = false;
		this.spellAim = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			dice: p.dice,
			faces: p.faces,
			bonus: 0,
			spellMul: p.mul,
			label: TURN_UNDEAD.name,
			spellKind: "turnUndead"
		});
	}
	startIceStorm() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || u.level < ICE_STORM.unlockLevel || this.tierRemaining(u, "iceStorm") <= 0) return;
		const power = iceStormPower(u.level);
		this.mode = "awaitSpell";
		this.spellKind = "iceStorm";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${ICE_STORM.name}: alcance ${power.range}, área de ${power.areaHexes} hexes, ${power.durationRounds} rodadas, ${iceStormFormula(u.level, u.mag)} de dano de gelo por turno na área. Afeta aliados e inimigos que permanecerem no campo.`;
		sfxPlay.ui();
	}
	startCausticVenom() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.familiarSpellRemaining(u, "causticVenom") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "causticVenom";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${CAUSTIC_VENOM.name}: alcance ${CAUSTIC_VENOM.range}, alvo ${diceFormula(CAUSTIC_VENOM.centerDice, CAUSTIC_VENOM.centerFaces, CAUSTIC_VENOM.centerBonus)}, respingo ${diceFormula(CAUSTIC_VENOM.splashDice, CAUSTIC_VENOM.splashFaces, CAUSTIC_VENOM.splashBonus)} em área — envenena todos atingidos, até aliados. Toque para mirar, toque de novo para lançar.`;
		sfxPlay.ui();
	}
	startDivineBolt() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.name !== "Salazar" || rulesClass(u.classId) !== "healer" || u.acted || this.tierRemaining(u, "divineBolt") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "divineBolt";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${DIVINE_BOLT.name}: alcance ${DIVINE_BOLT.range}, centro ${spellFormula(u.mag, DIVINE_BOLT.centerMul, DIVINE_BOLT.centerDice, DIVINE_BOLT.centerFaces, DIVINE_BOLT.centerBonus)}, hexes adjacentes ${spellFormula(u.mag, DIVINE_BOLT.splashMul, DIVINE_BOLT.splashDice, DIVINE_BOLT.splashFaces, DIVINE_BOLT.splashBonus)}. Holy, raio ${DIVINE_BOLT.size}; atinge todos na área. Toque para mirar, toque de novo para lançar.`;
		sfxPlay.ui();
	}
	startMinorVenom() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.familiarSpellRemaining(u, "minorVenom") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "minorVenom";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${MINOR_VENOM.name}: alcance ${MINOR_VENOM.range}, alvo ${diceFormula(MINOR_VENOM.centerDice, MINOR_VENOM.centerFaces, MINOR_VENOM.centerBonus)}, respingo ${diceFormula(MINOR_VENOM.splashDice, MINOR_VENOM.splashFaces, MINOR_VENOM.splashBonus)} em área de raio ${MINOR_VENOM.size} — envenena todos atingidos, até aliados. Toque para mirar, toque de novo para lançar.`;
		sfxPlay.ui();
	}
	startLongShot() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "longShot") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "longShot";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${LONG_SHOT.name}: alcance ${u.minRange}–${this.longMax(u)}, ${longShotFormula(u.level)} − DF. Toque no inimigo.`;
		sfxPlay.ui();
	}
	startBloodyShot() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || u.level < BLOODY_SHOT.unlockLevel || this.tierRemaining(u, "bloodyShot") <= 0) return;
		const bleed = bloodyShotBleed(u.level);
		this.mode = "awaitSpell";
		this.spellKind = "bloodyShot";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${BLOODY_SHOT.name}: ${Math.round(bloodyShotMul(u.level) * 100)}% do dano de arma, alcance ${u.minRange}–${BLOODY_SHOT.range}; sangramento 1D8 por ação durante ${diceFormula(bleed.dice, bleed.faces, 0)} rodadas. Toque no inimigo.`;
		sfxPlay.ui();
	}
	startPiercing() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "piercing") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "piercing";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${PIERCING.name}: reta da colmeia. ${piercingMul(u.level)}× do AT − DF em cada um na linha, aliado ou inimigo.`;
		sfxPlay.ui();
	}
	startShock() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.familiarSpellRemaining(u, "shock") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "shock";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${SHOCK.name}: alcance ${SHOCK.range}, ${spellFormula(u.mag, SHOCK.mul, SHOCK.dice, SHOCK.faces, SHOCK.bonus)}. Toque no inimigo.`;
		sfxPlay.ui();
	}
	startLightning() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "lightning") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "lightning";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `Relâmpago: alcance ${LIGHTNING.range}, ${lightningFormula(u.mag)}. Atravessa cobertura e barricadas. No turno seguinte ${diceFormula(LIGHTNING.echoDice, LIGHTNING.echoFaces, LIGHTNING.echoBonus)}. Toque no inimigo.`;
		sfxPlay.ui();
	}
	startLightningTier3() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "lightningTier3") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "lightningTier3";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${LIGHTNING_T3.name}: alcance ${LIGHTNING_T3.range}, ${lightningTier3Formula(u.mag)}. Atravessa cobertura e barricadas. Eco ${diceFormula(LIGHTNING_T3.echoDice, LIGHTNING_T3.echoFaces, LIGHTNING_T3.echoBonus)}. Toque no inimigo.`;
		sfxPlay.ui();
	}
	startMagicMissile() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.familiarSpellRemaining(u, "magicMissile") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "magicMissile";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		const shots = magicMissileCount(u.level);
		this.tip = `${MAGIC_MISSILE.name}: alcance ${MAGIC_MISSILE.range}, ${spellFormula(u.mag, MAGIC_MISSILE.mul, MAGIC_MISSILE.dice, MAGIC_MISSILE.faces, MAGIC_MISSILE.bonus)} por míssil. ${shots} míssil${shots > 1 ? "eis, um alvo cada (pode repetir)" : ""}. Acerto garantido. Toque no inimigo.`;
		sfxPlay.ui();
	}
	/** Familiar Maior's own second spell — its own dedicated lifeDrainCharges pool, never the
	* generic familiarSpellRemaining/spendFamiliarOrTier machinery (that's reserved for the ONE
	* own-spell every other familiar tier has). */
	startLifeDrain() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || (u.lifeDrainCharges ?? 0) <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "lifeDrain";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${LIFE_DRAIN.name}: alcance ${LIFE_DRAIN.range}, ${lifeDrainFormula(u.level, u.mag)}, cura o invocador em ${Math.round(lifeDrainHealMul(u.level) * 100)}% do dano causado. Toque no inimigo.`;
		sfxPlay.ui();
	}
	startDoubleStrike() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "doubleStrike") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "doubleStrike";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${DOUBLE_STRIKE.name}: ataca duas vezes, ${doubleStrikeFormula(u.level)}. Toque no inimigo.`;
		sfxPlay.ui();
	}
	startCleave() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "cleave") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "cleave";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${CLEAVE.name}: ${CLEAVE.hexes} hexes adjacentes, ${cleaveFormula(u.level)}. x${CLEAVE.largeMul} em criaturas de ${CLEAVE.largeHexes}+ hexes. Toque num hex vizinho.`;
		sfxPlay.ui();
	}
	/** Warrior tier 1's alternative to Corte Duplo (shares its charge pool), available at level 3. */
	startBullRush() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "bullRush") <= 0) return;
		if (u.classId !== "bigBlueCalf" && u.level < 3) {
			this.tip = `${BULL_RUSH.name} disponível a partir do nível 3.`;
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitSpell";
		this.spellKind = "bullRush";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		const p = bullRushPower(u.level);
		this.tip = `${BULL_RUSH.name}: investida em linha reta até ${BULL_RUSH_RANGE} hexes, para no primeiro inimigo, ${bullRushFormula(u.level)}, sem contra-ataque. Empurra 2 hexes (criaturas grandes: 1). Se o empurrão bater em algo, causa +${diceFormula(p.wallDice, p.wallFaces, 0)} de impacto.`;
		sfxPlay.ui();
	}
	/** Every hex from `u` to `cell` walked strictly along one of the 6 true hex axes — the
	* shared geometry behind Bull Rush's approach (spellAimValid/castBullRush) and its
	* knockback (castBullRush's wall-impact precomputation). `blockedAt` reports true for
	* anything that stops the charge: impassable terrain/walls/columns/barricades/locked
	* doors/decorations (all folded into hexDef's `passable`, see hexprops.ts) or a live unit. */
	axisBlocked(x, y, occ) {
		if (!inBounds(x, y, this.cols, this.rows)) return true;
		if (!hexDef(this.tiles, this.cols, x, y, this.decorOverlay).passable) return true;
		return !!occ.get(key(x, y));
	}
	/** Terrain stops a charge. */
	chargeTerrainBlocked(x, y) {
		return !inBounds(x, y, this.cols, this.rows) || !hexDef(this.tiles, this.cols, x, y, this.decorOverlay).passable;
	}
	/** A Bull Rush push, precomputed before anything moves: who, where it ends up, and
	* whether it slammed into something short of its full distance (impact damage). */
	bullRushPush(foe, dir, occ) {
		const dist = this.bullRushPushDistance(foe);
		const knock = axisWalk({
			x: foe.x,
			y: foe.y
		}, dir, this.cols, this.rows, dist, (pt) => !this.bullRushPushFits(foe, pt, occ));
		return {
			path: knock.path,
			blocked: knock.path.length < dist
		};
	}
	/** Bull Rush: aim at an enemy up to BULL_RUSH_RANGE away and charge the straight line to
	* it. Any enemy standing in the way is hit and shoved aside (to whichever flank has room,
	* off the rest of the line) and the charge carries on; the aimed enemy is hit and pushed
	* forward. If an in-the-way enemy has no room on either side, the charge stops there and
	* it becomes the one pushed forward. An ally or blocking terrain in the way = no charge.
	* Everything is simulated on a copy of the board, so no push or landing hex ever overlaps
	* a unit or a body-type target zone. */
	bullRushCharge(caster, cell) {
		if (hexDist(caster, cell) > BULL_RUSH_RANGE) return null;
		const occ = new Map(this.occ());
		const target = occ.get(key(cell.x, cell.y));
		if (!target || !target.alive || target.side === caster.side) return null;
		const line = hexLine(caster, cell).slice(1);
		const legs = [];
		let run = [];
		let at = {
			x: caster.x,
			y: caster.y
		};
		const place = (u, to) => {
			for (const c of footprint(u)) if (occ.get(key(c.x, c.y)) === u) occ.delete(key(c.x, c.y));
			for (const c of footprint({
				...u,
				x: to.x,
				y: to.y
			})) occ.set(key(c.x, c.y), u);
		};
		for (let i = 0; i < line.length; i++) {
			const pt = line[i];
			if (this.chargeTerrainBlocked(pt.x, pt.y)) return null;
			const body = footprint({
				...caster,
				...pt
			});
			if (caster.classId === "bigBlueCalf" && body.some((c) => this.chargeTerrainBlocked(c.x, c.y))) return null;
			const who = caster.classId === "bigBlueCalf" ? body.map((c) => occ.get(key(c.x, c.y))).find((u) => u != null && u.id !== caster.id) : occ.get(key(pt.x, pt.y));
			if (!who || who.id === caster.id) {
				if (caster.classId === "bigBlueCalf" && footprint({
					...caster,
					...pt
				}).some((c) => this.chargeTerrainBlocked(c.x, c.y) || occ.get(key(c.x, c.y)) != null && occ.get(key(c.x, c.y)).id !== caster.id)) return null;
				run.push(pt);
				at = pt;
				continue;
			}
			if (!who.alive || who.side === caster.side) return null;
			const dir = axisDir(at, pt);
			if (!dir) return null;
			for (const [k, u] of occ) if (u === caster) occ.delete(k);
			for (const c of footprint({
				...caster,
				...at
			})) occ.set(key(c.x, c.y), caster);
			if (who.id !== target.id) {
				const di = CUBE_DIRS.findIndex((d) => d.q === dir.q && d.r === dir.r && d.s === dir.s);
				const ahead = new Set(line.slice(i).map((c) => key(c.x, c.y)));
				let side = null;
				for (const s of [CUBE_DIRS[(di + 1) % 6], CUBE_DIRS[(di + 5) % 6]]) {
					const push = this.bullRushPush(who, s, occ);
					const land = push.path[push.path.length - 1];
					if (!land) continue;
					if (footprint({
						...who,
						x: land.x,
						y: land.y
					}).every((c) => !ahead.has(key(c.x, c.y)))) {
						side = push;
						break;
					}
				}
				if (side) {
					legs.push({
						path: run,
						foe: who,
						push: side
					});
					place(who, side.path[side.path.length - 1]);
					run = [];
					i--;
					continue;
				}
			}
			legs.push({
				path: run,
				foe: who,
				push: this.bullRushPush(who, dir, occ)
			});
			return {
				dir,
				foe: who,
				legs
			};
		}
		return null;
	}
	/** Bull Rush push distance: a body-type creature (any multi-hex footprint) moves 1 hex, a
	* normal one-hex creature 2. */
	bullRushPushDistance(foe) {
		return foe.footprintOffsets && foe.footprintOffsets.length > 1 ? 1 : 2;
	}
	/** Whether `foe` can be pushed so its anchor lands on `to`: its front row must be in
	* bounds on passable ground, and no cell of its whole body may overlap any other unit or
	* that unit's target zone (`occ` already has the charger at its landing hex). */
	bullRushPushFits(foe, to, occ) {
		const placed = {
			...foe,
			x: to.x,
			y: to.y
		};
		for (const c of footprintFrontRow(placed)) if (this.chargeTerrainBlocked(c.x, c.y)) return false;
		for (const c of footprint(placed)) {
			if (!inBounds(c.x, c.y, this.cols, this.rows)) continue;
			const who = occ.get(key(c.x, c.y));
			if (who && who.id !== foe.id) return false;
		}
		return true;
	}
	castBullRush(unit, cell) {
		if (!unit.alive || unit.acted || this.tierRemaining(unit, "bullRush") <= 0) return;
		const p = bullRushPower(unit.level);
		const charge = this.bullRushCharge(unit, cell);
		if (!charge) {
			this.tip = `Toque num inimigo a até ${BULL_RUSH_RANGE} hexes, sem aliado ou obstáculo no caminho.`;
			sfxPlay.ui();
			return;
		}
		this.spendTier(unit, "bullRush");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		let from = {
			x: unit.x,
			y: unit.y
		};
		for (const leg of charge.legs) {
			if (leg.path.length > 0) {
				const dash = {
					type: "move",
					id: unit.id,
					path: [from, ...leg.path]
				};
				this.chargeMoves.add(dash);
				this.queue.push(dash);
				from = leg.path[leg.path.length - 1];
			}
			this.queue.push({
				type: "combat",
				att: unit.id,
				def: leg.foe.id,
				noCounter: true,
				bonusDice: p.faces,
				bonusDiceCount: p.dice,
				bonusFlat: 0,
				wallImpact: leg.push.blocked ? {
					dice: p.wallDice,
					faces: p.wallFaces
				} : null,
				knockTo: leg.push.path.length > 0 ? leg.push.path[leg.push.path.length - 1] : null,
				spellKind: "bullRush"
			});
		}
	}
	/** Warrior tier 3: adjacent, replaces (never stacks with) a normal crit — see
	* stepCombat's executionerStrike branch. */
	startProvoke() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || u.level < PROVOKE.unlockLevel || this.tierRemaining(u, "provoke") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "provoke";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${PROVOKE.name}: ${provokeFormula(u.level)}. Os inimigos atingidos voltam-se contra ${u.name}. Toque no inimigo.`;
		sfxPlay.ui();
	}
	/** Board cells Provoke reaches around its aim — only the aim itself at radius 0. */
	provokeArea(cell, level) {
		const { radius } = provokePower(level);
		const out = [];
		for (let y = cell.y - radius; y <= cell.y + radius; y++) for (let x = cell.x - radius - 1; x <= cell.x + radius + 1; x++) if (inBounds(x, y, this.cols, this.rows) && hexDist(cell, {
			x,
			y
		}) <= radius) out.push({
			x,
			y
		});
		return out;
	}
	/** Provoke: no damage — every enemy in the area gets Provoke's huge volatile enmity on the
	* warrior (enmity.ts), so it turns on him until someone out-generates it. */
	castProvoke(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const area = new Set(this.provokeArea(cell, unit.level).map((p) => key(p.x, p.y)));
		const foes = this.units.filter((f) => f.alive && f.side === "enemy" && this.targetable(f) && footprint(f).some((c) => area.has(key(c.x, c.y))));
		this.spendTier(unit, "provoke");
		for (const foe of foes) {
			this.addEnmity(foe, unit, ENMITY.provoke.ce, ENMITY.provoke.ve);
			this.provokeFx.push({
				unitId: foe.id,
				t: 0
			});
			this.emitParticle({
				x: foe.drawX,
				y: foe.drawY - .35,
				vx: 0,
				vy: -.18,
				life: 0,
				max: 2,
				size: 1,
				color: "#e0603a",
				text: "Provocado",
				kind: "text",
				frame: 0
			});
		}
		this.spellKind = null;
		this.spellArmed = false;
		this.spellAim = null;
		this.missileTargets = [];
		this.tip = null;
		this.pushLog(`${unit.name} usa ${PROVOKE.name}: ${foes.map((f) => f.name).join(", ")} ${foes.length > 1 ? "voltam-se" : "volta-se"} contra ${unit.name}.`);
		sfxPlay.ui();
		this.finishAction(unit);
	}
	startExecutionerStrike() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "executionerStrike") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "executionerStrike";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${EXECUTIONER_STRIKE.name}: ${executionerStrikeFormula(u.level)}. Toque no inimigo.`;
		sfxPlay.ui();
	}
	castExecutionerStrike(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		this.spendTier(unit, "executionerStrike");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const power = executionerStrikePower(unit.level);
		this.queue.push({
			type: "combat",
			att: unit.id,
			def: foe.id,
			bonusDice: power.faces,
			bonusDiceCount: power.dice,
			bonusFlat: 0,
			spellKind: "executionerStrike"
		});
	}
	/** Warrior tier 2's shield-only option (shares Cleave's charge pool) — refuses to arm
	* without a shield in the off hand, the mirror of startShoulderSmash's own "no shield"
	* gate (which requires bare/two hands instead). */
	startShieldBash() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "shieldBash") <= 0) return;
		if (!u.offHandId || EQUIPMENT[u.offHandId]?.kind !== "shield") {
			this.tip = "Requer um escudo equipado.";
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitSpell";
		this.spellKind = "shieldBash";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${SHIELD_BASH.name}: ${shieldBashFormula(u.level)}. Toque no inimigo.`;
		sfxPlay.ui();
	}
	castShieldBash(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		this.spendTier(unit, "shieldBash");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const power = shieldBashPower(unit.level);
		this.queue.push({
			type: "combat",
			att: unit.id,
			def: foe.id,
			bonusDice: power.faces,
			bonusDiceCount: power.dice,
			bonusFlat: 0,
			spellKind: "shieldBash"
		});
	}
	startPiercingThrust() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "piercingThrust") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "piercingThrust";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${PIERCING_THRUST.name}: reta curta, ignora ${Math.round(PIERCING_THRUST.armorIgnore * 100)}% da defesa. 1º alvo dano cheio, os demais metade.`;
		sfxPlay.ui();
	}
	/** Sweep (Lancer tier 2): self-centered AoE — preview the radius, then confirm. */
	startSweep() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "sweep") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "sweep";
		this.spellArmed = true;
		this.spellAim = {
			x: u.x,
			y: u.y
		};
		this.hover = {
			x: u.x,
			y: u.y
		};
		this.tip = `${SWEEP.name}: inimigos a até ${SWEEP.radius} hexes, dano de arma, empurra ${SWEEP.knockback} hex. A área está marcada — Lançar para confirmar.`;
		sfxPlay.ui();
	}
	sweepTiles(u) {
		return hexAreaTiles({
			x: u.x,
			y: u.y
		}, SWEEP.radius, this.cols, this.rows).filter((t) => t.x !== u.x || t.y !== u.y);
	}
	confirmSweep() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || this.mode !== "awaitSpell" || this.spellKind !== "sweep") return;
		const tiles = this.sweepTiles(u);
		const ids = [];
		for (const t of tiles) {
			const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (who && who.id !== u.id && who.side !== u.side && !ids.includes(who.id)) ids.push(who.id);
		}
		this.spendTier(u, "sweep");
		this.spellKind = null;
		this.missileTargets = [];
		this.spellArmed = false;
		this.spellAim = null;
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: u.id,
			tiles,
			ids,
			label: SWEEP.name,
			spellKind: "sweep"
		});
		if (u.name !== "Kael") sfxPlay.sweep(this.isBladeAttack(u));
	}
	startTrip() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "trip") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "trip";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${TRIP.name}: dano da arma + ${diceFormula(1, TRIP.bonusFaces, TRIP.bonusBonus)}, causa Sangramento (1D8 a cada ação) e reduz stats em ${Math.round(TRIP.statPenalty * 100)}% até o fim do combate. Toque no inimigo.`;
		sfxPlay.ui();
	}
	/** One of each familiar tier at a time per caster — a conjurer re-casting a tier it
	* already has out just replaces nothing and clutters the field, so every summonFamiliarX
	* entry point (start and cast, both checked for the same reason spellAimValid AND
	* castX both validate range) blocks while a living familiar of that exact class still
	* carries this caster's id as its summonerId. Tiers stack freely with each other — this is
	* a per-tier cap, not "one familiar total". */
	hasFamiliarOut(caster, classId) {
		return this.units.some((u) => u.alive && u.summonerId === caster.id && u.classId === classId);
	}
	startSummonFamiliar() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "summonFamiliar") <= 0) return;
		if (this.hasFamiliarOut(u, "familiar")) {
			this.tip = `${u.name} já tem ${SUMMON_FAMILIAR.name} invocado.`;
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitSpell";
		this.spellKind = "summonFamiliar";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${SUMMON_FAMILIAR.name}: convoca um aliado com metade dos seus atributos atuais, até ${SUMMON_FAMILIAR.range} hexes. Pode lançar Míssil Mágico por conta própria. Toque num espaço livre.`;
		sfxPlay.ui();
	}
	/** Conjurer tier 1's second spell — shares Invocar Familiar's own tier-1 pool of uses
	* (tierRemaining/spendTier), but gated further by the caster's own level, since tierUses
	* alone can't express "unlocked partway through a tier both spells already share". */
	startPhantasmalForce() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "phantasmalForce") <= 0) return;
		if (u.level < 2) {
			this.tip = `${PHANTASMAL_FORCE.name} disponível a partir do nível 2.`;
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitSpell";
		this.spellKind = "phantasmalForce";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${PHANTASMAL_FORCE.name}: alcance ${PHANTASMAL_FORCE.range}, ${phantasmalForceFormula(u.level, u.mag)}. Toque no inimigo.`;
		sfxPlay.ui();
	}
	startSummonFamiliar2() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "summonFamiliar2") <= 0) return;
		if (u.level < 5) {
			this.tip = `${SUMMON_FAMILIAR2.name} disponível a partir do nível 5.`;
			sfxPlay.ui();
			return;
		}
		if (this.hasFamiliarOut(u, "familiar2")) {
			this.tip = `${u.name} já tem ${SUMMON_FAMILIAR2.name} invocado.`;
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitSpell";
		this.spellKind = "summonFamiliar2";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${SUMMON_FAMILIAR2.name}: convoca um aliado maior, com ${Math.round(SUMMON_FAMILIAR2.statScale * 100)}% dos seus atributos atuais, até ${SUMMON_FAMILIAR2.range} hexes. Pode lançar Míssil Mágico ou Dreno de Vida por conta própria. Toque num espaço livre.`;
		sfxPlay.ui();
	}
	startSummonFamiliar3() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "summonFamiliar3") <= 0) return;
		if (this.hasFamiliarOut(u, "familiar3")) {
			this.tip = `${u.name} já tem ${SUMMON_FAMILIAR3.name} invocado.`;
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitSpell";
		this.spellKind = "summonFamiliar3";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${SUMMON_FAMILIAR3.name}: convoca um aliado com ${Math.round(SUMMON_FAMILIAR3.statScale * 100)}% dos seus atributos atuais, até ${SUMMON_FAMILIAR3.range} hexes. Pode lançar Bola de Fogo por conta própria. Toque num espaço livre.`;
		sfxPlay.ui();
	}
	startSummonFamiliar4() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "summonFamiliar4") <= 0) return;
		if (this.hasFamiliarOut(u, "familiar4")) {
			this.tip = `${u.name} já tem ${SUMMON_FAMILIAR4.name} invocado.`;
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitSpell";
		this.spellKind = "summonFamiliar4";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${SUMMON_FAMILIAR4.name}: convoca um aliado radiante, com ${Math.round(SUMMON_FAMILIAR4.statScale * 100)}% dos seus atributos atuais, até ${SUMMON_FAMILIAR4.range} hexes. Pode lançar Míssil Mágico ou Dreno de Vida por conta própria. Toque num espaço livre.`;
		sfxPlay.ui();
	}
	startSummonZombieDog() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "summonZombieDog") <= 0) return;
		if (this.hasFamiliarOut(u, "zombieDog")) {
			this.tip = `${u.name} já tem ${CLASSES.zombieDog.name} invocado.`;
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitSpell";
		this.spellKind = "summonZombieDog";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${SUMMON_ZOMBIE_DOG.name}: convoca um Cão Zumbi com ${Math.round(SUMMON_ZOMBIE_DOG.statScale * 100)}% dos seus atributos atuais, até ${SUMMON_ZOMBIE_DOG.range} hexes. Pode lançar Veneno Cáustico ${SUMMON_ZOMBIE_DOG.causticVenomCharges}× por conta própria. Toque num espaço livre.`;
		sfxPlay.ui();
	}
	startWebOfDreams() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "webOfDreams") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "webOfDreams";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${WEB_OF_DREAMS.name}: cria uma teia grudenta por ${WEB_OF_DREAMS.durationRounds} rodadas — quem estiver dentro fica com movimento reduzido a 1 hex, e testa ${Math.round(webOfDreamsSleepChance(u.level) * 100)}% de chance de adormecer por ${diceFormula(WEB_OF_DREAMS.sleepDice, WEB_OF_DREAMS.sleepFaces, 0)} turnos a cada turno que permanecer lá dentro (cumulativo). Alcance ${WEB_OF_DREAMS.range}, raio ${webOfDreamsSize(u.level)}. Toque para mirar.`;
		sfxPlay.ui();
	}
	startMultiShot() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "multiShot") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "multiShot";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		const want = multiShotTargets(u.level);
		this.tip = `${MULTI_SHOT.name}: ${multiShotFormula(u.level)}, alcance ${MULTI_SHOT.range}. Escolha ${want} alvos (pode repetir).`;
		sfxPlay.ui();
	}
	/** Aura of Protection (Paladin tier 5) / Intimidating Presence (Heavy Knight tier 5): both
	* instant and self-centered, same as Sweep — no aim, no confirmSpell branch needed. */
	startAuraOfProtection() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "auraOfProtection") <= 0) return;
		const p = auraPower(u.level);
		const cells = new Set(hexAreaTiles({
			x: u.x,
			y: u.y
		}, p.radius, this.cols, this.rows).map((c) => key(c.x, c.y)));
		this.auraZones.push({
			cells,
			roundsLeft: p.duration,
			kind: "protection",
			side: u.side,
			pct: p.pct
		});
		this.spendTier(u, "auraOfProtection");
		this.noteAwareEnmity(u, ENMITY.support.ce, ENMITY.support.ve);
		this.spellKind = null;
		this.spellArmed = false;
		this.spellAim = null;
		this.tip = `${AURA_OF_PROTECTION.name}: aliados a até ${p.radius} hexes tomam ${Math.round(p.pct * 100)}% menos dano por ${p.duration} rodadas.`;
		this.mode = "locked";
		this.queue.push({
			type: "banner",
			text: AURA_OF_PROTECTION.name,
			dur: 1.1
		});
		sfxPlay.ui();
	}
	startIntimidatingPresence() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "intimidatingPresence") <= 0) return;
		const p = auraPower(u.level);
		const cells = new Set(hexAreaTiles({
			x: u.x,
			y: u.y
		}, p.radius, this.cols, this.rows).map((c) => key(c.x, c.y)));
		this.auraZones.push({
			cells,
			roundsLeft: p.duration,
			kind: "intimidation",
			side: u.side,
			pct: p.pct
		});
		this.spendTier(u, "intimidatingPresence");
		this.noteAwareEnmity(u, ENMITY.support.ce, ENMITY.support.ve);
		this.spellKind = null;
		this.spellArmed = false;
		this.spellAim = null;
		this.tip = `${INTIMIDATING_PRESENCE.name}: inimigos a até ${p.radius} hexes tomam ${Math.round(p.pct * 100)}% mais dano por ${p.duration} rodadas.`;
		this.mode = "locked";
		this.emitBladeFx("shockRing", u.x, u.y);
		this.queue.push({
			type: "banner",
			text: INTIMIDATING_PRESENCE.name,
			dur: 1.1
		});
		sfxPlay.ui();
	}
	/** Healer tier 1 Bless: the caster is the center and every living ally within three hexes
	* receives the level-scaled accuracy bonus as the authored 3D wave reaches them. */
	startBless() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "bless") <= 0) return;
		if (rulesClass(u.classId) !== "healer") return;
		if (u.level < BLESS.unlockLevel) {
			this.tip = `Bless disponível a partir do nível ${BLESS.unlockLevel}.`;
			sfxPlay.ui();
			return;
		}
		const allies = this.units.filter((target) => target.alive && target.side === u.side && hexDist(u, target) <= BLESS.radius);
		this.spendTier(u, "bless");
		this.noteAwareEnmity(u, ENMITY.support.ce, ENMITY.support.ve);
		this.spellKind = null;
		this.spellArmed = false;
		this.spellAim = null;
		this.tip = `Bless: +${BLESS.hitBonusPct(u.level)}% de chance de acerto por ${BLESS.durationRounds(u.level)} rodadas para aliados a até ${BLESS.radius} hexes.`;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: u.id,
			tiles: allies.map((target) => ({
				x: target.x,
				y: target.y
			})),
			ids: allies.map((target) => target.id),
			label: BLESS.name,
			spellKind: "bless"
		});
		sfxPlay.ui();
	}
	/** Healer tier 3: resolves instantly like Aura of Protection/Intimidating Presence — never
	* arms awaitSpell, so it never reaches spellAimValid/confirmSpell. Tops off the hunger of
	* the caster and every ally within CREATE_FOOD_AND_WATER.radius hexes, adding plain Rations
	* per ally fed to the same pool a battle-picked-up ration would (see lootRations,
	* reconciled back into save.rations at battle end — see GameApp.tsx). */
	startCreateFoodAndWater() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "createFoodAndWater") <= 0) return;
		const power = createFoodAndWaterPower(u.level);
		const targets = this.units.filter((t) => t.alive && t.side === u.side && hexDist(u, t) <= CREATE_FOOD_AND_WATER.radius && fullness(t.fullness) < power.fullness);
		if (targets.length === 0) {
			this.tip = "Já está bem alimentado.";
			sfxPlay.ui();
			return;
		}
		let gained = 0;
		for (const t of targets) {
			t.fullness = power.fullness;
			t.hungerPenaltyPct = 0;
			this.reapplyGear(t);
			gained += power.dice > 0 ? rollDice(power.dice, power.faces, power.bonus, this.rng) : 0;
			this.emitHolyFx(t.x, t.y, "food", t.id);
		}
		this.lootRations += gained;
		this.spendTier(u, "createFoodAndWater");
		this.noteAwareEnmity(u, ENMITY.support.ce, ENMITY.support.ve);
		this.spellKind = null;
		this.spellArmed = false;
		this.spellAim = null;
		this.mode = "locked";
		this.tip = `${CREATE_FOOD_AND_WATER.name}: fome restaurada${power.fullness > 100 ? ` (${power.fullness}%)` : ""}${gained > 0 ? `, +${gained} rações` : ""}.`;
		this.queue.push({
			type: "banner",
			text: CREATE_FOOD_AND_WATER.name,
			dur: 1.1
		});
		sfxPlay.heal();
	}
	startDivineWrath() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "divineWrath") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "divineWrath";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${DIVINE_WRATH.name}: linha reta, ${divineWrathFormula(u.level, u.mag)}, nunca atinge aliados. Alcance ${DIVINE_WRATH.range}. Toque para mirar.`;
		sfxPlay.ui();
	}
	/** Shoulder Smash (Heavy Knight tier 4): refuses to arm while a shield is equipped in the
	* off hand — it's the bare-handed/two-handed version of a knightly charge. */
	startShoulderSmash() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "shoulderSmash") <= 0) return;
		if (u.offHandId && EQUIPMENT[u.offHandId]?.kind === "shield") {
			this.tip = "Requer as duas mãos livres — sem escudo equipado.";
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitSpell";
		this.spellKind = "shoulderSmash";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		const p = shoulderSmashPower(u.level);
		this.tip = `${SHOULDER_SMASH.name}: ${p.hexes} hexes adjacentes, ${shoulderSmashFormula(u.level)}, empurra ${SHOULDER_SMASH.knockback} hexes. Toque num hex vizinho.`;
		sfxPlay.ui();
	}
	startStampede() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "stampede") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "stampede";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${STAMPEDE.name}: linha reta, ${stampedeFormula(u.level)}, atinge todos na linha (aliados inclusos). Alcance ${STAMPEDE.range}. Toque para mirar.`;
		sfxPlay.ui();
	}
	confirmSpell() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || this.mode !== "awaitSpell" || !this.spellKind) return;
		if (this.spellKind === "turnUndead") {
			this.castTurnUndead(u);
			return;
		}
		if (this.spellKind === "sweep") {
			this.confirmSweep();
			return;
		}
		const cell = this.hover;
		if (!cell) return;
		if (this.spellKind === "fireball") {
			this.confirmFireball();
			return;
		}
		if (this.spellKind === "frost") {
			this.castFrost(u, cell);
			return;
		}
		if (this.spellKind === "iceStorm") {
			this.castIceStorm(u, cell);
			return;
		}
		if (this.spellKind === "causticVenom") {
			this.confirmCausticVenom();
			return;
		}
		if (this.spellKind === "divineBolt") {
			this.confirmDivineBolt();
			return;
		}
		if (this.spellKind === "minorVenom") {
			this.confirmMinorVenom();
			return;
		}
		if (this.spellKind === "bloodyShot") {
			this.castBloodyShot(u, cell);
			return;
		}
		if (this.spellKind === "longShot") {
			this.castLongShot(u, cell);
			return;
		}
		if (this.spellKind === "piercing") {
			this.castPiercing(u, cell);
			return;
		}
		if (this.spellKind === "piercingThrust") {
			this.castPiercingThrust(u, cell);
			return;
		}
		if (this.spellKind === "trip") {
			this.castTrip(u, cell);
			return;
		}
		if (this.spellKind === "summonFamiliar") {
			this.castSummonFamiliar(u, cell, 1);
			return;
		}
		if (this.spellKind === "summonFamiliar2") {
			this.castSummonFamiliar(u, cell, 2);
			return;
		}
		if (this.spellKind === "summonFamiliar3") {
			this.castSummonFamiliar(u, cell, 3);
			return;
		}
		if (this.spellKind === "summonFamiliar4") {
			this.castSummonFamiliar(u, cell, 4);
			return;
		}
		if (this.spellKind === "summonZombieDog") {
			this.castSummonFamiliar(u, cell, 5);
			return;
		}
		if (this.spellKind === "webOfDreams") {
			this.castWebOfDreams(u, cell);
			return;
		}
		if (this.spellKind === "lightning") {
			this.castLightning(u, cell);
			return;
		}
		if (this.spellKind === "lightningTier3") {
			this.castLightningTier3(u, cell);
			return;
		}
		if (this.spellKind === "magicMissile" || this.spellKind === "magicMissileV2") {
			this.castMagicMissile(u, cell);
			return;
		}
		if (this.spellKind === "lifeDrain") {
			this.castLifeDrain(u, cell);
			return;
		}
		if (this.spellKind === "phantasmalForce") {
			this.castPhantasmalForce(u, cell);
			return;
		}
		if (this.spellKind === "doubleStrike") {
			this.castDoubleStrike(u, cell);
			return;
		}
		if (this.spellKind === "cleave") {
			this.castCleave(u, cell);
			return;
		}
		if (this.spellKind === "cureDisease") {
			this.castCureDisease(u, cell);
			return;
		}
		if (this.spellKind === "multiShot") {
			this.castMultiShot(u, cell);
			return;
		}
		if (this.spellKind === "divineWrath") {
			this.castDivineWrath(u, cell);
			return;
		}
		if (this.spellKind === "shoulderSmash") {
			this.castShoulderSmash(u, cell);
			return;
		}
		if (this.spellKind === "stampede") {
			this.castStampede(u, cell);
			return;
		}
		if (this.spellKind === "bullRush") {
			this.castBullRush(u, cell);
			return;
		}
		if (this.spellKind === "provoke") {
			this.castProvoke(u, cell);
			return;
		}
		if (this.spellKind === "executionerStrike") {
			this.castExecutionerStrike(u, cell);
			return;
		}
		if (this.spellKind === "shieldBash") {
			this.castShieldBash(u, cell);
			return;
		}
		if (this.spellKind === "burningHands" || this.spellKind === "poisonBreath") {
			this.castBurningHands(u, cell, this.spellKind);
			return;
		}
		if (this.spellKind === "auraOfProtection" || this.spellKind === "intimidatingPresence" || this.spellKind === "createFoodAndWater") return;
		if (this.spellKind === "secondWind") return;
		if (this.spellKind === "shock") {
			this.castShock(u, cell);
			return;
		}
		if (this.isHeal(this.spellKind)) this.castHeal(u, cell, this.spellKind);
	}
	startCure(kind) {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, kind) <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = kind;
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${CURES[kind].name}: ${healFormula(u.mag, kind)} HP, alcance ${CURES[kind].range}. Toque num aliado ferido.`;
		sfxPlay.ui();
	}
	/** Priest tier 2: a short frontal fire cone, aimed by clicking through a direction like
	* Divine Wrath/Stampede. Friendly fire on purpose — see BURNING_HANDS's own comment. */
	startBurningHands() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "burningHands") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "burningHands";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${BURNING_HANDS.name}: cone curto à frente, ${burningHandsFormula(u.level, u.mag)} contra resistência elemental. Atinge aliados também — mire com cuidado. Toque para mirar.`;
		sfxPlay.ui();
	}
	startPoisonBreath() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "poisonBreath") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "poisonBreath";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${POISON_BREATH.name}: cone curto à frente, ${poisonBreathFormula(u.level, u.mag)} contra resistência elemental; Veneno Menor (1D4 por turno). Atinge aliados também — mire com cuidado. Toque para mirar.`;
		sfxPlay.ui();
	}
	startCureDisease() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.acted || this.tierRemaining(u, "cureDisease") <= 0) return;
		this.mode = "awaitSpell";
		this.spellKind = "cureDisease";
		this.spellArmed = false;
		this.spellAim = null;
		this.hover = null;
		this.tip = `${CURE_DISEASE.name}: cura doença e veneno, alcance ${CURE_DISEASE.range}. Toque num aliado doente.`;
		sfxPlay.ui();
	}
	confirmHeal() {
		const u = this.units.find((x) => x.id === this.selectedId);
		const cell = this.hover;
		if (!u || this.mode !== "awaitSpell" || !cell || !this.isHeal(this.spellKind)) return;
		this.castHeal(u, cell, this.spellKind);
	}
	isHeal(kind) {
		return kind === "cureMinor" || kind === "cureWounds" || kind === "cureLight";
	}
	tierRemaining(u, kind) {
		if (kind === "frost" && u.side === "enemy") return u.frostCharges ?? 0;
		if (kind === "poisonBreath" && u.level < POISON_BREATH.unlockLevel) return 0;
		if (kind === "burningHands" && u.level < 5) return 0;
		const tier = spellTier(kind);
		return tier ? u.spells[tierKey(tier)] : 0;
	}
	spendTier(u, kind) {
		if (kind === "frost" && u.side === "enemy") {
			u.frostCharges = Math.max(0, (u.frostCharges ?? 0) - 1);
			return;
		}
		const tier = spellTier(kind);
		if (!tier) return;
		u.spells[tierKey(tier)] -= 1;
	}
	longMax(u) {
		return LONG_SHOT.range;
	}
	/** True while (x,y) sits inside any still-active Web of Dreams patch. */
	isWebCell(x, y) {
		return this.webZones.some((z) => z.cells.has(key(x, y)));
	}
	/** The sleep chance of whichever Dreaming Web zone covers (x,y) — set once at cast time
	* from the caster's level (see castWebOfDreams/webOfDreamsSleepChance) and carried on the
	* zone itself, so a lingering roll always uses the level that created the zone rather than
	* whatever level some other unit is at now. Falls back to the base chance for a zone
	* restored from an older save that predates this field. */
	webCellSleepChance(x, y) {
		return this.webZones.find((z) => z.cells.has(key(x, y)))?.sleepChance ?? WEB_OF_DREAMS.sleepChance;
	}
	/** Combined multiplier from every active Aura of Protection / Intimidating Presence zone
	* covering `defender`'s current cell — applied to the final damage of a hit right before it
	* comes off their HP, same insertion point as the sleepBonusDamage multiplier. Protection
	* only discounts a zone's own side; Intimidating Presence only surcharges the other side, so
	* a unit standing in both a friendly and a hostile zone at once takes both at the same time. */
	zoneDamageMul(defender) {
		let mul = 1;
		for (const z of this.auraZones) {
			if (!z.cells.has(key(defender.x, defender.y))) continue;
			if (z.kind === "protection" && z.side === defender.side) mul *= 1 - z.pct;
			if (z.kind === "intimidation" && z.side !== defender.side) mul *= 1 + z.pct;
		}
		return mul;
	}
	/** Every reach computation for a player unit's own turn — including every re-derive free
	* repositioning does after each move — funnels through here.
	*
	* Reach is measured from wherever the unit is actually standing right now, capped by
	* mov - moveBudgetUsed: movement is spent as you walk, cumulatively, exactly like the
	* panel counts it down. A prior version anchored reach at this.turnStart with the full mov
	* instead, meaning moveBudgetUsed measured distance-from-turnStart rather than distance
	* walked — walk 3 hexes out and 3 back and it read 0 again, full budget restored, every
	* cell within mov of the start tile re-selectable indefinitely. That's not a movement cap,
	* it's a teleport with a leash. The real fix for "an exploratory move can strand you" was
	* already sitting right here: canUndoMove/undoMove, a full manual rewind to turnStart for
	* exactly a wrong click — never trade the cap itself away for that.
	*
	* Enemy AI turns never set this.turnStart and don't reposition, so they were never affected
	* by the turnStart-anchoring either way — they've always read straight off their own live
	* x/y, same as here.
	*
	* Web of Dreams' "restrained / difficult terrain" clause — a unit whose current cell was
	* webbed at the START of its turn (this.turnRestrained, decided once in beginUnitTurn, not
	* re-checked live) clamps mov to 1 — applies on top, for both sides. */
	/** Movement this unit has left this turn, off the same cumulative moveBudgetUsed
	* commitMove accumulates — how far it's actually walked. Reach (effectiveUnitForReach)
	* shrinks with it too now, so this and what's selectable always agree. It's also what
	* decides when an already-acted unit's turn auto-ends (see commitMove), and what the panel
	* counts down as the unit walks.
	*
	* The restrained clamp applies to whoever's turn it actually is and nobody else:
	* turnRestrained is decided once, in beginUnitTurn, for the active unit, and says nothing
	* about an enemy the player happens to be inspecting. */
	movLeft(u) {
		const remaining = Math.max(0, u.mov - u.moveBudgetUsed);
		return this.turnRestrained && this.activeTurnUnit()?.id === u.id ? Math.min(remaining, 1) : remaining;
	}
	effectiveUnitForReach(u) {
		if (u.side === "enemy" && this.mission.enemySpawns.some((s, i) => s.holdsPosition && u.id === `enemy-${s.name}-${i}`)) return {
			...u,
			mov: 0
		};
		if (this.mission.explore) return {
			...u,
			mov: this.cols * this.rows
		};
		const remaining = Math.max(0, u.mov - u.moveBudgetUsed);
		const cap = this.turnRestrained ? Math.min(1, remaining) : remaining;
		return cap === u.mov ? u : {
			...u,
			mov: cap
		};
	}
	/** Whether this mission hides anything at all. */
	get fogged() {
		return this.mission.fog === true && getDevGfx().fogOfWar;
	}
	/** In sight of the party right now. Always true on a mission without fog. */
	visible(x, y) {
		if (!this.fogged) return true;
		return this.vis[y * this.cols + x] === 2;
	}
	/** Seen at least once — visible now, or remembered. True everywhere without fog. */
	explored(x, y) {
		if (!this.fogged) return true;
		return (this.vis[y * this.cols + x] ?? 0) > 0;
	}
	/** Whether a unit is hidden from the player: any cell of its footprint in sight
	* reveals the whole of it, so a big body never half-appears. Public because
	* ThreeBattleRenderer needs this same fog-of-war gate for its own unit meshes. */
	unitHidden(u) {
		if (!this.fogged || u.side === "player") return false;
		return !footprint(u).some((p) => this.visible(p.x, p.y));
	}
	/**
	* Whether the player may swing at, shoot or cast on this unit — `attackableByPlayer`
	* plus sight. Every enemy-targeting branch of spellAimValid and the attack picker
	* funnel through here, which is the whole of "you cannot aim at what you cannot
	* see": a foe standing in the dark is not a legal target, so no spell arms on it
	* and no attack offers itself.
	*
	* Fog does not go the other way. `occ` stays sight-blind, so an unseen body still
	* blocks a step and still stops an arrow — walking through one because the party
	* had not spotted it yet would be a worse lie than not being able to shoot it.
	*/
	targetable(u) {
		if (!u || !u.alive || u.dialog) return false;
		if (!this.debugFreeCast && !attackableByPlayer(u)) return false;
		return !this.unitHidden(u);
	}
	/** Give Magic Missile's target picker and cast guard the same actionable reason. */
	magicMissileTargetError(caster, cell) {
		const here = this.occ().get(key(cell.x, cell.y));
		if (!here || !here.alive || here.dialog || this.unitHidden(here)) return "Não há inimigo visível nessa casa.";
		if (!this.debugFreeCast && here.side !== "enemy" && here.side !== "neutral") return "Míssil Mágico não pode mirar em aliados.";
		if (manhattan(caster, cell) > MAGIC_MISSILE.range) return `Alvo fora de alcance (máximo ${MAGIC_MISSILE.range} hexes).`;
		if (!clearShot(caster, cell, this.tiles, this.cols, "bolt", this.decorOverlay)) return this.shotBlockedTip(caster, cell, "bolt");
		return null;
	}
	spellAimError(caster, cell) {
		const kind = this.spellKind;
		if (!kind) return "Nenhuma habilidade está mirando agora.";
		if (kind === "magicMissile" || kind === "magicMissileV2") return this.magicMissileTargetError(caster, cell) ?? "Esse alvo não pode ser atingido por esta habilidade.";
		if (kind === "cureMinor" || kind === "cureWounds" || kind === "cureLight") {
			const range = CURES[kind].range;
			const who = this.occ().get(key(cell.x, cell.y));
			if (manhattan(caster, cell) > range) return `Alvo fora de alcance (máximo ${range} hexes).`;
			if (!who) return "Escolha uma aliada na casa selecionada.";
			if (!this.debugFreeCast && who.side !== "player") return "Essa cura só pode ser usada em uma aliada.";
			if (!this.debugFreeCast && who.hp >= who.maxHp) return "Essa aliada está com a vida cheia.";
			return "Essa casa não atende aos requisitos desta cura.";
		}
		if (kind === "cureDisease") {
			const who = this.occ().get(key(cell.x, cell.y));
			if (manhattan(caster, cell) > CURE_DISEASE.range) return `Alvo fora de alcance (máximo ${CURE_DISEASE.range} hexes).`;
			if (!who) return "Escolha uma aliada na casa selecionada.";
			if (!this.debugFreeCast && who.side !== "player") return "A cura de doença só pode ser usada em uma aliada.";
			if (!this.debugFreeCast && !who.diseased && !who.poisoned) return "Essa aliada não está doente nem envenenada.";
			return "Essa casa não atende aos requisitos desta habilidade.";
		}
		const target = this.occ().get(key(cell.x, cell.y));
		if ([
			"longShot",
			"bloodyShot",
			"lightning",
			"lightningTier3",
			"shock",
			"phantasmalForce",
			"multiShot",
			"doubleStrike",
			"trip",
			"lifeDrain",
			"executionerStrike",
			"shieldBash",
			"provoke"
		].includes(kind)) {
			if (!target) return "Não há unidade na casa selecionada.";
			if (this.unitHidden(target)) return "Escolha um inimigo visível.";
			if (target.dialog) return "Personagens de conversa não podem ser alvos de ataque.";
			if (target.side === caster.side) return "Essa habilidade não pode mirar em uma aliada.";
		}
		const distance = manhattan(caster, cell);
		if (kind === "longShot" || kind === "bloodyShot" || kind === "multiShot") {
			const max = kind === "longShot" ? this.longMax(caster) : kind === "bloodyShot" ? BLOODY_SHOT.range : MULTI_SHOT.range;
			if (distance < caster.minRange) return `Alvo perto demais (alcance mínimo ${caster.minRange} hexes).`;
			if (distance > max) return `Alvo fora de alcance (máximo ${max} hexes).`;
			if (!clearShot(caster, cell, this.tiles, this.cols, "arrow", this.decorOverlay)) return this.shotBlockedTip(caster, cell, "arrow");
		}
		if (kind === "lightning" || kind === "lightningTier3" || kind === "shock" || kind === "phantasmalForce") {
			const range = kind === "lightning" ? LIGHTNING.range : kind === "lightningTier3" ? LIGHTNING_T3.range : kind === "shock" ? SHOCK.range : PHANTASMAL_FORCE.range;
			if (distance > range) return `Alvo fora de alcance (máximo ${range} hexes).`;
			if (kind === "phantasmalForce" && !clearShot(caster, cell, this.tiles, this.cols, "bolt", this.decorOverlay)) return this.shotBlockedTip(caster, cell, "bolt");
		}
		if (kind === "fireball" || kind === "causticVenom" || kind === "divineBolt" || kind === "minorVenom" || kind === "webOfDreams") {
			const range = kind === "fireball" ? FIREBALL.range : kind === "causticVenom" ? CAUSTIC_VENOM.range : kind === "divineBolt" ? DIVINE_BOLT.range : kind === "minorVenom" ? MINOR_VENOM.range : WEB_OF_DREAMS.range;
			if (distance > range) return `Casa fora de alcance (máximo ${range} hexes).`;
			if (!clearShot(caster, fireballOrigin(cell, this.cols, this.rows), this.tiles, this.cols, "bolt", this.decorOverlay)) return this.shotBlockedTip(caster, fireballOrigin(cell, this.cols, this.rows), "bolt");
		}
		if (kind === "iceStorm") {
			const range = iceStormPower(caster.level).range;
			if (distance > range) return `Casa fora de alcance (máximo ${range} hexes).`;
			if (!clearShot(caster, fireballOrigin(cell, this.cols, this.rows), this.tiles, this.cols, "bolt", this.decorOverlay)) return this.shotBlockedTip(caster, fireballOrigin(cell, this.cols, this.rows), "bolt");
		}
		if (kind === "provoke") {
			const range = provokePower(caster.level).range;
			if (hexDist(caster, cell) > range) return `Alvo fora de alcance (máximo ${range} hexes).`;
		}
		if (kind === "cleave" || kind === "shoulderSmash") return "Escolha um hex vizinho ao personagem.";
		if (kind === "sweep") return `Escolha uma casa dentro do raio ${SWEEP.radius}.`;
		if (kind === "piercing" || kind === "piercingThrust" || kind === "burningHands" || kind === "poisonBreath" || kind === "divineWrath" || kind === "stampede") return "Escolha uma linha reta válida dentro do alcance da habilidade.";
		if (kind === "bullRush") return "Não há um caminho livre com espaço para concluir a investida nesse alvo.";
		if (kind === "summonFamiliar" || kind === "summonFamiliar2" || kind === "summonFamiliar3" || kind === "summonFamiliar4" || kind === "summonZombieDog") {
			const range = kind === "summonZombieDog" ? SUMMON_ZOMBIE_DOG.range : kind === "summonFamiliar4" ? SUMMON_FAMILIAR4.range : kind === "summonFamiliar3" ? SUMMON_FAMILIAR3.range : kind === "summonFamiliar2" ? SUMMON_FAMILIAR2.range : SUMMON_FAMILIAR.range;
			if (distance > range) return `Ponto de invocação fora de alcance (máximo ${range} hexes).`;
			if (target) return "O ponto de invocação está ocupado.";
			if (!inBounds(cell.x, cell.y, this.cols, this.rows)) return "O ponto de invocação fica fora do mapa.";
			if (!this.hexAt(cell.x, cell.y).passable) return "O terreno bloqueia a invocação.";
			return "Não há espaço livre para essa criatura nesse ponto.";
		}
		if ([
			"doubleStrike",
			"trip",
			"lifeDrain",
			"executionerStrike",
			"shieldBash"
		].includes(kind)) return "Esse inimigo não está ao alcance ou não pode ser atingido daqui.";
		return "Esta casa não atende aos requisitos de alvo da habilidade.";
	}
	/**
	* `attackableEnemies` filtered down to foes the party can actually see.
	*
	* The underlying pass is sight-blind on purpose — it is shared with the enemy AI,
	* which has no business consulting the player's fog. Dropping hidden foes here
	* keeps the attack offers, and the highlights drawn from them, honest without
	* teaching the pathfinder about fog.
	*/
	visibleAttackTargets(unit) {
		const reach = this.reach;
		const all = attackableEnemies(unit, reach, this.units, this.tiles, this.cols, this.decorOverlay);
		if (!this.fogged) return all;
		for (const id of [...all.keys()]) {
			const foe = this.units.find((u) => u.id === id);
			if (!foe || this.unitHidden(foe)) all.delete(id);
		}
		return all;
	}
	/**
	* Recompute sight if the party has moved since the last pass.
	*
	* Cells already marked explored stay explored — fog lifts and never falls back to
	* unseen. The stamp is the party's own layout, so this is a cheap no-op on the
	* frames and turns where nobody walked.
	*
	* Cost is O(party x radius^2), independent of how big the board is: a 160x160
	* dungeon costs exactly what a 20x16 skirmish does.
	*/
	refreshVisibility() {
		if (!this.fogged) return;
		const cells = this.cols * this.rows;
		if (this.vis.length !== cells) {
			this.vis = new Uint8Array(cells);
			this.visStamp = "";
		}
		let stamp = `${this.terrainVersion}`;
		for (const u of this.units) {
			if (u.side !== "player" || !u.alive) continue;
			stamp += `|${u.id}:${u.x},${u.y}:${u.visionRange ?? 7}`;
		}
		if (stamp === this.visStamp) return;
		this.visStamp = stamp;
		this.visVersion++;
		const eyes = [];
		const radii = [];
		for (const u of this.units) {
			if (u.side !== "player" || !u.alive) continue;
			for (const p of footprint(u)) {
				eyes.push(p);
				radii.push(u.visionRange ?? 7);
			}
		}
		relight(this.vis, eyes, radii, this.tiles, this.cols, this.rows, this.decorOverlay, false);
	}
	/**
	* Whether this foe is allowed to act, waking it if it can see the party.
	*
	* Always true without fog. Under fog a foe starts asleep and wakes the moment any
	* living party member is inside its own sight — its own, not the party's `vis`,
	* since the two see different things and reading the player's fog here would let a
	* foe act on knowledge it does not have.
	*
	* Waking sticks, and is remembered in the save: a foe that loses sight again keeps
	* hunting, because one that forgot the instant the party stepped behind a pillar
	* could be shaken off by walking one hex sideways.
	*
	* Known gap: a shot from beyond its sight radius does not wake it, so a long enough
	* bow can pick off a sleeping foe. Waking on damage needs a hook in the damage path
	* and is worth doing on its own.
	*/
	wakeIfSeesParty(foe) {
		if (!this.fogged) return true;
		if (this.awake.has(foe.id)) return true;
		for (const p of this.units) {
			if (p.side !== "player" || !p.alive) continue;
			if (hexDist(foe, p) > 7) continue;
			if (!sightReaches(foe, p, this.tiles, this.cols, this.decorOverlay)) continue;
			this.awake.add(foe.id);
			return true;
		}
		return false;
	}
	/** Explored cells for the save, or absent on a mission without fog. */
	snapshotExplored() {
		if (!this.fogged || this.vis.length === 0) return void 0;
		return packExplored(this.vis);
	}
	/** Restore explored cells, falling back to nothing seen when the save carries none
	* or carries a bitset that does not fit this board — see unpackExplored. */
	restoreExplored(encoded) {
		const cells = this.cols * this.rows;
		this.visStamp = "";
		this.vis = (this.fogged && encoded ? unpackExplored(encoded, cells) : null) ?? new Uint8Array(cells);
	}
	/**
	* The consolidated properties of one hex: painted terrain with the decoration layer
	* folded in. Every rule in this class goes through here instead of reading `TERRAIN`
	* off `tiles` directly, which is what lets a placement's switches change movement,
	* sight and the high-ground bonus without the board itself being rewritten.
	*/
	/** "Tiro bloqueado: <what> no caminho." — names the prop (chests stay generic) or terrain that
	* stops this shot, so the player is never left guessing. */
	shotBlockedTip(from, to, kind) {
		const p = shotBlocker(from, to, this.tiles, this.cols, kind, this.decorOverlay);
		if (!p) return "Linha de tiro bloqueada.";
		const deco = this.decorations.find((d) => DECORATIONS[d.id] && placedBlockingFootprint(d).some((f) => d.x + f.dx === p.x && d.y + f.dy === p.y));
		return `Tiro bloqueado: ${deco ? CHEST_DECOR_IDS.has(deco.id) ? "um baú" : DECORATIONS[deco.id].name : this.hexAt(p.x, p.y).height && !this.hexAt(p.x, p.y).blocksShot ? `terreno alto (${this.hexAt(p.x, p.y).name})` : this.hexAt(p.x, p.y).name} no caminho.`;
	}
	hexAt(x, y) {
		return hexDef(this.tiles, this.cols, x, y, this.decorOverlay);
	}
	/** Real elevation for the Three renderer's terrain mesh — the same consolidated
	* high-ground flag (painted `hill` terrain or a decoration's `yieldsHighGround` switch,
	* see hexprops.ts) every combat/LOS rule already reads through hexAt, exposed read-only
	* so terrain geometry can be generated FROM this gameplay data instead of a second,
	* possibly-drifting copy of it. */
	hexElevated(x, y) {
		return !!this.hexAt(x, y).height;
	}
	/** Refold the decoration switches. Call after anything adds or removes a prop. */
	refreshDecorOverlay() {
		this.decorOverlay = buildDecorOverlay(this.decorations, this.cols, this.rows, placedBlockingFootprint, this.mission.terrainElevations);
	}
	/** Who stands where, rebuilt only when the layout actually moved. See `occCache`. */
	occ() {
		const n = this.units.length;
		let same = this.occCache !== null && this.occStamp.length === n;
		for (let i = 0; i < n; i++) {
			const u = this.units[i];
			const packed = (u.x * 1024 + u.y) * 2 + (u.alive ? 1 : 0);
			if (this.occStamp[i] !== packed) {
				same = false;
				this.occStamp[i] = packed;
			}
		}
		if (same) return this.occCache;
		this.occStamp.length = n;
		const units = this.units;
		this.occCache = occupancy(units);
		return this.occCache;
	}
	/**
	* Drop the cache when `this.units` is replaced wholesale rather than mutated.
	* The packed compare only sees positions, so a restore that happens to land every
	* unit on the cell it already held would otherwise keep a map pointing at the
	* previous Unit objects — same coordinates, wrong identities.
	*/
	invalidateOcc() {
		this.occCache = null;
		this.occStamp.length = 0;
	}
	/**
	* One whole-board distance field per player, cached while the board and the party
	* stand still. See `fieldCache` for why this matters.
	*
	* Keyed on terrain version plus every player's position, so the first enemy of a
	* phase pays for the fields and the rest read them. A player moving (their own
	* phase, or a Trip/Stampede shove during the enemy's) or terrain changing retires
	* the whole set rather than trying to patch it.
	*/
	playerDistanceFields(players) {
		let stamp = `${this.terrainVersion}`;
		for (const p of players) stamp += `|${p.id}:${p.x},${p.y}`;
		if (stamp !== this.fieldStamp) {
			this.fieldCache.clear();
			this.fieldStamp = stamp;
		}
		return players.map((p) => {
			let field = this.fieldCache.get(p.id);
			if (!field) {
				field = terrainDistanceField(p, this.tiles, this.cols, this.rows, this.decorOverlay);
				this.fieldCache.set(p.id, field);
			}
			return {
				p,
				field
			};
		});
	}
	spellAimValid(caster, cell) {
		if (!this.spellKind) return false;
		if (this.spellKind === "fireball") {
			if (manhattan(caster, cell) > FIREBALL.range) return false;
			return clearShot(caster, fireballOrigin(cell, this.cols, this.rows), this.tiles, this.cols, "bolt", this.decorOverlay);
		}
		if (this.spellKind === "frost") return this.frostTiles(caster, cell).length > 0;
		if (this.spellKind === "iceStorm") {
			if (manhattan(caster, cell) > iceStormPower(caster.level).range) return false;
			return clearShot(caster, fireballOrigin(cell, this.cols, this.rows), this.tiles, this.cols, "bolt", this.decorOverlay);
		}
		if (this.spellKind === "causticVenom") {
			if (manhattan(caster, cell) > CAUSTIC_VENOM.range) return false;
			return clearShot(caster, fireballOrigin(cell, this.cols, this.rows), this.tiles, this.cols, "bolt", this.decorOverlay);
		}
		if (this.spellKind === "divineBolt") {
			if (manhattan(caster, cell) > DIVINE_BOLT.range) return false;
			return clearShot(caster, fireballOrigin(cell, this.cols, this.rows), this.tiles, this.cols, "bolt", this.decorOverlay);
		}
		if (this.spellKind === "minorVenom") {
			if (manhattan(caster, cell) > MINOR_VENOM.range) return false;
			return clearShot(caster, fireballOrigin(cell, this.cols, this.rows), this.tiles, this.cols, "bolt", this.decorOverlay);
		}
		if (this.spellKind === "longShot") {
			const d = manhattan(caster, cell);
			const here = this.occ().get(key(cell.x, cell.y));
			if (!this.targetable(here) || d < caster.minRange || d > this.longMax(caster)) return false;
			return clearShot(caster, cell, this.tiles, this.cols, "arrow", this.decorOverlay);
		}
		if (this.spellKind === "bloodyShot") {
			const d = manhattan(caster, cell);
			const here = this.occ().get(key(cell.x, cell.y));
			if (!this.targetable(here) || d < caster.minRange || d > BLOODY_SHOT.range) return false;
			return clearShot(caster, cell, this.tiles, this.cols, "arrow", this.decorOverlay);
		}
		if (this.spellKind === "piercing") return this.piercingRay(caster, cell) !== null;
		if (this.spellKind === "piercingThrust") return this.piercingThrustRay(caster, cell) !== null;
		if (this.spellKind === "lightning") {
			const here = this.occ().get(key(cell.x, cell.y));
			if (!this.targetable(here) || manhattan(caster, cell) > LIGHTNING.range) return false;
			return true;
		}
		if (this.spellKind === "lightningTier3") {
			const here = this.occ().get(key(cell.x, cell.y));
			if (!this.targetable(here) || manhattan(caster, cell) > LIGHTNING_T3.range) return false;
			return true;
		}
		if (this.spellKind === "shock") {
			const here = this.occ().get(key(cell.x, cell.y));
			if (!this.targetable(here) || manhattan(caster, cell) > SHOCK.range) return false;
			return true;
		}
		if (this.spellKind === "sweep") return manhattan(caster, cell) <= SWEEP.radius;
		if (this.spellKind === "magicMissile" || this.spellKind === "magicMissileV2") return this.magicMissileTargetError(caster, cell) === null && this.targetable(this.occ().get(key(cell.x, cell.y)));
		if (this.spellKind === "phantasmalForce") {
			const here = this.occ().get(key(cell.x, cell.y));
			if (!this.targetable(here) || manhattan(caster, cell) > PHANTASMAL_FORCE.range) return false;
			return clearShot(caster, cell, this.tiles, this.cols, "bolt", this.decorOverlay);
		}
		if (this.spellKind === "summonFamiliar" || this.spellKind === "summonFamiliar2" || this.spellKind === "summonFamiliar3" || this.spellKind === "summonFamiliar4" || this.spellKind === "summonZombieDog") {
			const range = this.spellKind === "summonZombieDog" ? SUMMON_ZOMBIE_DOG.range : this.spellKind === "summonFamiliar4" ? SUMMON_FAMILIAR4.range : this.spellKind === "summonFamiliar3" ? SUMMON_FAMILIAR3.range : this.spellKind === "summonFamiliar2" ? SUMMON_FAMILIAR2.range : SUMMON_FAMILIAR.range;
			if (manhattan(caster, cell) > range) return false;
			const bodyClass = this.spellKind === "summonFamiliar3" ? CLASSES.familiar3 : this.spellKind === "summonZombieDog" ? CLASSES.zombieDog : null;
			const cells = bodyClass ? footprint({
				x: cell.x,
				y: cell.y,
				size: bodyClass.size,
				footprintOffsets: bodyClass.footprintOffsets
			}) : [cell];
			const occ = this.occ();
			for (const p of cells) {
				if (!inBounds(p.x, p.y, this.cols, this.rows)) return false;
				if (!this.hexAt(p.x, p.y).passable) return false;
				if (occ.get(key(p.x, p.y))) return false;
			}
			return true;
		}
		if (this.spellKind === "webOfDreams") {
			if (manhattan(caster, cell) > WEB_OF_DREAMS.range) return false;
			return clearShot(caster, fireballOrigin(cell, this.cols, this.rows), this.tiles, this.cols, "bolt", this.decorOverlay);
		}
		if (this.spellKind === "doubleStrike" || this.spellKind === "trip" || this.spellKind === "lifeDrain" || this.spellKind === "executionerStrike" || this.spellKind === "shieldBash") {
			const here = this.occ().get(key(cell.x, cell.y));
			return !!here && here.alive && here.side !== caster.side && canHitFrom(caster, caster, here, this.tiles, this.cols, this.decorOverlay);
		}
		if (this.spellKind === "provoke") {
			const here = this.occ().get(key(cell.x, cell.y));
			return !!here && here.alive && here.side === "enemy" && this.targetable(here) && hexDist(caster, cell) <= provokePower(caster.level).range;
		}
		if (this.spellKind === "cleave" || this.spellKind === "shoulderSmash") return hexNeighbors(caster.x, caster.y).some((p) => p.x === cell.x && p.y === cell.y);
		if (this.spellKind === "bullRush") return this.bullRushCharge(caster, cell) !== null;
		if (this.spellKind === "burningHands" || this.spellKind === "poisonBreath") return this.wrathRay(caster, cell, (this.spellKind === "poisonBreath" ? poisonBreathPower : burningHandsPower)(caster.level).range) !== null;
		if (this.spellKind === "multiShot") {
			const d = manhattan(caster, cell);
			const here = this.occ().get(key(cell.x, cell.y));
			if (!this.targetable(here) || d < caster.minRange || d > MULTI_SHOT.range) return false;
			return clearShot(caster, cell, this.tiles, this.cols, "arrow", this.decorOverlay);
		}
		if (this.spellKind === "divineWrath") return this.wrathRay(caster, cell, DIVINE_WRATH.range) !== null;
		if (this.spellKind === "stampede") return this.wrathRay(caster, cell, STAMPEDE.range) !== null;
		if (this.spellKind === "cureDisease") return this.validCureDiseaseTarget(caster, cell);
		return this.validHealTarget(caster, cell);
	}
	/** Divine Wrath / Stampede: the same directional-line traversal as Piercing (aimed by
	* clicking through a cell to set the direction), just capped to their own range instead of
	* running the length of the board. */
	wrathRay(caster, through, range) {
		const raw = this.piercingRay(caster, through);
		if (!raw) return null;
		const capped = raw.slice(0, range);
		return capped.length ? capped : null;
	}
	piercingRay(from, through) {
		const raw = piercingLine(from, through, this.cols, this.rows);
		if (!raw) return null;
		const fromHigh = !!this.hexAt(from.x, from.y).height;
		const out = [];
		for (const p of raw) {
			const t = this.hexAt(p.x, p.y);
			if (t.id === "barricade" || t.blocksShot) break;
			if (t.height && !fromHigh) break;
			out.push(p);
		}
		return out.length ? out : null;
	}
	/** Piercing Thrust (Lancer tier 1): the same straight-line traversal as Piercing, capped
	* to the caster's own weapon reach + 1 hex — a short lunge, not an arrow flying the length
	* of the board. */
	piercingThrustRay(caster, through) {
		const raw = this.piercingRay(caster, through);
		if (!raw) return null;
		const capped = raw.slice(0, caster.maxRange + 1);
		return capped.length ? capped : null;
	}
	/** Sweep / Shoulder Smash: shoves `foe` one hex further away from `att`, silently doing
	* nothing if that hex is off the board, impassable, or already occupied — a blocked shove
	* just fails, it never displaces someone else instead. Always one hex (SWEEP.knockback),
	* even when the target is two hexes out in Sweep's radius-2 area. */
	knockBack(att, foe) {
		const neighbors = hexNeighbors(foe.x, foe.y);
		let dest = null;
		let best = manhattan(att, foe);
		for (const n of neighbors) {
			if (!inBounds(n.x, n.y, this.cols, this.rows)) continue;
			const d = manhattan(att, n);
			if (d > best) {
				best = d;
				dest = n;
			}
		}
		if (!dest) return;
		if (!this.hexAt(dest.x, dest.y).passable) return;
		if (this.units.some((u) => u.alive && occupies(u, dest.x, dest.y))) return;
		foe.x = dest.x;
		foe.y = dest.y;
		foe.drawX = dest.x;
		foe.drawY = dest.y;
		this.emitParticle({
			x: foe.drawX,
			y: foe.drawY + .3,
			vx: 0,
			vy: 0,
			life: 0,
			max: .35,
			size: 1,
			color: "#c9b28a",
			kind: "impact",
			frame: 0
		});
	}
	validHealTarget(caster, cell) {
		if (!this.isHeal(this.spellKind)) return false;
		const range = CURES[this.spellKind].range;
		if (manhattan(caster, cell) > range) return false;
		const who = this.occ().get(key(cell.x, cell.y));
		if (!who || !who.alive) return false;
		if (this.debugFreeCast) return true;
		return who.side === "player" && who.hp < who.maxHp;
	}
	validCureDiseaseTarget(caster, cell) {
		if (manhattan(caster, cell) > CURE_DISEASE.range) return false;
		const who = this.occ().get(key(cell.x, cell.y));
		if (!who || !who.alive) return false;
		if (this.debugFreeCast) return true;
		return who.side === "player" && (who.diseased || who.poisoned);
	}
	healRangeTiles(from, range) {
		const out = [];
		for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) if (manhattan(from, {
			x,
			y
		}) <= range) out.push({
			x,
			y
		});
		return out;
	}
	castHeal(unit, cell, kind) {
		if (!this.validHealTarget(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const target = this.occ().get(key(cell.x, cell.y));
		if (!target) return;
		this.spendTier(unit, kind);
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "heal",
			att: unit.id,
			def: target.id,
			kind
		});
	}
	castCureDisease(unit, cell) {
		if (!this.validCureDiseaseTarget(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const target = this.occ().get(key(cell.x, cell.y));
		if (!target) return;
		this.spendTier(unit, "cureDisease");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "cureDisease",
			att: unit.id,
			def: target.id
		});
	}
	confirmFireball() {
		const u = this.units.find((x) => x.id === this.selectedId);
		const cell = this.hover;
		if (!u || this.mode !== "awaitSpell" || !cell) return;
		if (manhattan(u, cell) > FIREBALL.range) {
			this.tip = "Fora de alcance.";
			sfxPlay.ui();
			return;
		}
		this.castFireball(u, cell);
	}
	confirmCausticVenom() {
		const u = this.units.find((x) => x.id === this.selectedId);
		const cell = this.hover;
		if (!u || this.mode !== "awaitSpell" || !cell) return;
		if (manhattan(u, cell) > CAUSTIC_VENOM.range) {
			this.tip = "Fora de alcance.";
			sfxPlay.ui();
			return;
		}
		this.castCausticVenom(u, cell);
	}
	confirmDivineBolt() {
		const u = this.units.find((x) => x.id === this.selectedId);
		const cell = this.hover;
		if (!u || u.name !== "Salazar" || this.mode !== "awaitSpell" || this.spellKind !== "divineBolt" || !cell) return;
		if (!this.spellAimValid(u, cell)) {
			this.tip = this.spellAimError(u, cell);
			sfxPlay.ui();
			return;
		}
		this.castDivineBolt(u, cell);
	}
	confirmMinorVenom() {
		const u = this.units.find((x) => x.id === this.selectedId);
		const cell = this.hover;
		if (!u || this.mode !== "awaitSpell" || !cell) return;
		if (manhattan(u, cell) > MINOR_VENOM.range) {
			this.tip = "Fora de alcance.";
			sfxPlay.ui();
			return;
		}
		this.castMinorVenom(u, cell);
	}
	castLongShot(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) {
			this.tip = "Não há unidade na casa selecionada.";
			sfxPlay.ui();
			return;
		}
		this.spendTier(unit, "longShot");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const power = longShotPower(unit.level);
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [cell],
			ids: [foe.id],
			label: LONG_SHOT.name,
			weaponBonusDice: power.dice,
			weaponBonusFaces: power.faces,
			weaponBonusBonus: 0,
			spellKind: "longShot"
		});
	}
	castBloodyShot(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) {
			this.tip = "Não há unidade na casa selecionada.";
			sfxPlay.ui();
			return;
		}
		this.spendTier(unit, "bloodyShot");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [cell],
			ids: [foe.id],
			label: BLOODY_SHOT.name,
			dmgMul: bloodyShotMul(unit.level),
			spellKind: "bloodyShot"
		});
	}
	castPiercing(unit, cell) {
		const line = this.piercingRay(unit, cell);
		if (!line) {
			this.tip = "Escolha uma reta da colmeia.";
			sfxPlay.ui();
			return;
		}
		const ids = [];
		for (const t of line) {
			const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (who && who.id !== unit.id && !ids.includes(who.id)) ids.push(who.id);
		}
		this.spendTier(unit, "piercing");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: line,
			ids,
			label: PIERCING.name,
			dmgMul: piercingMul(unit.level),
			spellKind: "piercing"
		});
	}
	castPiercingThrust(unit, cell) {
		const line = this.piercingThrustRay(unit, cell);
		if (!line) {
			this.tip = "Escolha uma reta na frente.";
			sfxPlay.ui();
			return;
		}
		const ids = [];
		for (const t of line) {
			const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (who && who.id !== unit.id && !ids.includes(who.id)) ids.push(who.id);
		}
		this.spendTier(unit, "piercingThrust");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		if (unit.name !== "Kael") sfxPlay.thrust(this.isBladeAttack(unit));
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: line,
			ids,
			label: PIERCING_THRUST.name,
			spellKind: "piercingThrust"
		});
	}
	castShock(unit, cell) {
		if (unit.acted || this.familiarSpellRemaining(unit, "shock") <= 0) return;
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		this.spendFamiliarOrTier(unit, "shock");
		this.spellKind = null;
		this.spellAim = null;
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [cell],
			ids: [foe.id],
			dice: SHOCK.dice,
			faces: SHOCK.faces,
			bonus: SHOCK.bonus,
			label: SHOCK.name,
			echo: {
				dice: SHOCK.echoDice,
				faces: SHOCK.echoFaces,
				bonus: SHOCK.echoBonus
			},
			spellMul: SHOCK.mul,
			spellKind: "shock"
		});
	}
	castLightning(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		this.spendTier(unit, "lightning");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [cell],
			ids: [foe.id],
			dice: lightningDice(),
			faces: LIGHTNING.faces,
			bonus: LIGHTNING.bonus,
			label: LIGHTNING.name,
			echo: {
				dice: LIGHTNING.echoDice,
				faces: LIGHTNING.echoFaces,
				bonus: LIGHTNING.echoBonus
			},
			spellMul: LIGHTNING.mul,
			spellKind: "lightning"
		});
	}
	castLightningTier3(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		this.spendTier(unit, "lightningTier3");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [cell],
			ids: [foe.id],
			dice: LIGHTNING_T3.dice,
			faces: LIGHTNING_T3.faces,
			bonus: LIGHTNING_T3.bonus,
			label: LIGHTNING_T3.name,
			echo: {
				dice: LIGHTNING_T3.echoDice,
				faces: LIGHTNING_T3.echoFaces,
				bonus: LIGHTNING_T3.echoBonus
			},
			spellMul: LIGHTNING_T3.mul,
			spellKind: "lightningTier3"
		});
	}
	/** Each missile is aimed separately, so the cast collects one target per tap and only
	* fires once they are all chosen. They may be stacked on one enemy or spread around. */
	castMagicMissile(unit, cell) {
		const targetError = this.magicMissileTargetError(unit, cell);
		if (targetError || !this.spellAimValid(unit, cell)) {
			this.tip = targetError ?? this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) {
			this.tip = "Não há inimigo visível nessa casa.";
			sfxPlay.ui();
			return;
		}
		const want = magicMissileCount(unit.level);
		this.missileTargets.push({
			id: foe.id,
			cell: {
				x: cell.x,
				y: cell.y
			}
		});
		if (this.missileTargets.length < want) {
			const left = want - this.missileTargets.length;
			this.tip = `${MAGIC_MISSILE.name} · escolha mais ${left} alvo${left > 1 ? "s" : ""} (pode repetir).`;
			sfxPlay.ui();
			return;
		}
		const shots = this.missileTargets;
		this.missileTargets = [];
		this.spendFamiliarOrTier(unit, "magicMissile");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		for (const shot of shots) this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [shot.cell],
			ids: [shot.id],
			dice: MAGIC_MISSILE.dice,
			faces: MAGIC_MISSILE.faces,
			bonus: MAGIC_MISSILE.bonus,
			label: MAGIC_MISSILE.name,
			spellMul: MAGIC_MISSILE.mul,
			spellKind: "magicMissileV2"
		});
	}
	/** Archer tier 3: the same click-N-targets flow as Magic Missile (this.missileTargets),
	* but each shot is a plain weapon hit plus a bonus die (weaponBonusDice) instead of a
	* MAG-scaled spellDamage roll — Multi Shot is a volley of arrows, not a spell. */
	castMultiShot(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		const want = multiShotTargets(unit.level);
		this.missileTargets.push({
			id: foe.id,
			cell: {
				x: cell.x,
				y: cell.y
			}
		});
		if (this.missileTargets.length < want) {
			const left = want - this.missileTargets.length;
			this.tip = `${MULTI_SHOT.name} · escolha mais ${left} alvo${left > 1 ? "s" : ""} (pode repetir).`;
			sfxPlay.ui();
			return;
		}
		const shots = this.missileTargets;
		this.missileTargets = [];
		this.spendTier(unit, "multiShot");
		this.spellKind = null;
		this.tip = null;
		this.mode = "locked";
		const power = multiShotPower(unit.level);
		for (const shot of shots) this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [shot.cell],
			ids: [shot.id],
			label: MULTI_SHOT.name,
			weaponBonusDice: power.dice,
			weaponBonusFaces: power.faces,
			weaponBonusBonus: 0,
			spellKind: "multiShot"
		});
	}
	castDoubleStrike(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		this.spendTier(unit, "doubleStrike");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const power = doubleStrikePower(unit.level);
		const bonus = power.dice > 0 ? {
			bonusDice: power.faces,
			bonusDiceCount: power.dice,
			bonusFlat: 0
		} : {};
		this.queue.push({
			type: "combat",
			att: unit.id,
			def: foe.id,
			noCounter: true,
			spellKind: "doubleStrike",
			...bonus
		});
		this.queue.push({
			type: "combat",
			att: unit.id,
			def: foe.id,
			spellKind: "doubleStrike",
			...bonus
		});
	}
	castTrip(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		this.spendTier(unit, "trip");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "combat",
			att: unit.id,
			def: foe.id,
			noCounter: true,
			bonusDice: TRIP.bonusFaces,
			bonusFlat: TRIP.bonusBonus,
			spellKind: "trip"
		});
	}
	/** Familiar Maior's Dreno de Vida — routed through the same "spell" queue/stepSpell
	* machinery as every other MAG-based cast (spellMul: 1, since its only power scaling is
	* the level-scaled die from lifeDrainDice, not a flat multiplier like Fireball/Lightning's
	* own). The heal-on-hit itself lands inside stepSpell's own lifeDrain branch, once the
	* damage is known. */
	castLifeDrain(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		unit.lifeDrainCharges = Math.max(0, (unit.lifeDrainCharges ?? 1) - 1);
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const dice = lifeDrainDice(unit.level);
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [cell],
			ids: [foe.id],
			dice: dice.dice,
			faces: dice.faces,
			bonus: 0,
			label: LIFE_DRAIN.name,
			spellMul: 1,
			spellKind: "lifeDrain"
		});
	}
	/** Conjurer tier 1's second spell — a long-range single hit, same MAG/spellMul:1/level-
	* scaled-die shape as castLifeDrain above, just ranged (magicMissile's own FX/hit-timing;
	* no dedicated art of its own yet) instead of melee. */
	castPhantasmalForce(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const foe = this.occ().get(key(cell.x, cell.y));
		if (!foe) return;
		this.spendTier(unit, "phantasmalForce");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const dice = phantasmalForceDice(unit.level);
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [cell],
			ids: [foe.id],
			dice: dice.dice,
			faces: dice.faces,
			bonus: 0,
			label: PHANTASMAL_FORCE.name,
			spellMul: 1,
			spellKind: "phantasmalForce"
		});
	}
	/** Summon Familiar (Conjurer tier 1): spawns a new player-side unit directly into
	* `this.units` — no queued animation step, it just appears. It has no slot in this round's
	* `turnOrder` (that's rebuilt from `this.units` fresh every round in startNewRound), so it
	* waits for the round after this one to act, same as any other reinforcement would. */
	/** Summon Familiar / Summon Familiar 2 / Summon Familiar 3 (Conjurer tiers 1-3): `tier`
	* selects which of the three — same spawn logic, just a stronger creature/class/tier and
	* its own spell/slot per tier, never an automatic upgrade of the one before it. See
	* SUMMON_FAMILIAR2/SUMMON_FAMILIAR3's notes. */
	castSummonFamiliar(unit, cell, tier) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const cls = tier === 5 ? CLASSES.zombieDog : tier === 4 ? CLASSES.familiar4 : tier === 3 ? CLASSES.familiar3 : tier === 2 ? CLASSES.familiar2 : CLASSES.familiar;
		if (tier === 2 && unit.level < 5) {
			this.spellKind = null;
			this.tip = `${SUMMON_FAMILIAR2.name} disponível a partir do nível 5.`;
			sfxPlay.ui();
			return;
		}
		if (this.hasFamiliarOut(unit, cls.id)) {
			this.spellKind = null;
			this.tip = `${unit.name} já tem ${cls.name} invocado.`;
			sfxPlay.ui();
			return;
		}
		const scale = tier === 5 ? SUMMON_ZOMBIE_DOG.statScale : tier === 4 ? SUMMON_FAMILIAR4.statScale : tier === 3 ? SUMMON_FAMILIAR3.statScale : tier === 2 ? SUMMON_FAMILIAR2.statScale : SUMMON_FAMILIAR.statScale;
		const spellKind = tier === 5 ? "summonZombieDog" : tier === 4 ? "summonFamiliar4" : tier === 3 ? "summonFamiliar3" : tier === 2 ? "summonFamiliar2" : "summonFamiliar";
		const spellName = tier === 5 ? SUMMON_ZOMBIE_DOG.name : tier === 4 ? SUMMON_FAMILIAR4.name : tier === 3 ? SUMMON_FAMILIAR3.name : tier === 2 ? SUMMON_FAMILIAR2.name : SUMMON_FAMILIAR.name;
		const namePrefix = tier === 5 ? "Cão Zumbi de" : tier === 4 ? "Familiar Radiante de" : tier === 3 ? "Familiar Titã de" : tier === 2 ? "Familiar Maior de" : "Familiar de";
		const maxHp = Math.max(1, Math.round(unit.maxHp * scale));
		const familiarInitiativeRoll = 1 + Math.floor(this.rng() * 20);
		const familiar = {
			id: `player-familiar-${this.units.length}`,
			name: `${namePrefix} ${unit.name}`,
			classId: cls.id,
			className: cls.name,
			role: cls.role,
			side: "player",
			sprite: cls.sprite,
			x: cell.x,
			y: cell.y,
			hp: maxHp,
			maxHp,
			atk: Math.round(unit.atk * scale),
			mag: Math.round(unit.mag * scale),
			def: Math.round(unit.def * scale),
			dex: Math.round(unit.dex * scale),
			resistances: { ...cls.resistances },
			initiativeRoll: familiarInitiativeRoll,
			initiative: familiarInitiativeRoll + initiativeBonus(cls.id),
			statPointAllocation: {},
			mov: cls.mov,
			minRange: cls.minRange,
			maxRange: cls.maxRange,
			moved: false,
			acted: false,
			facing: 1,
			faceDx: 1,
			faceDy: 0,
			walkPose: "front",
			idleAlt: false,
			alive: true,
			drawX: cell.x,
			drawY: cell.y,
			flash: 0,
			levelGlow: 0,
			healGlow: 0,
			healGlowKind: "potionZero",
			fade: 0,
			bob: 0,
			level: unit.level,
			xp: 0,
			bag: { ...EMPTY_BAG },
			spells: {
				tier1: 0,
				tier2: 0,
				tier3: 0,
				tier4: 0,
				tier5: 0,
				tier6: 0,
				tier7: 0,
				tier8: 0,
				tier9: 0,
				tier10: 0
			},
			weaponId: null,
			weaponEnh: 0,
			size: cls.size,
			footprintW: cls.footprintW,
			footprintH: cls.footprintH,
			footprintOffsets: cls.footprintOffsets,
			shock: null,
			shockCharges: 0,
			spellCharges: tier === 4 ? 3 : tier === 5 ? SUMMON_ZOMBIE_DOG.causticVenomCharges : tier === 3 ? familiarSpellCharges(unit.level) : familiarMagicMissileCharges(unit.level),
			lifeDrainCharges: tier === 2 || tier === 4 ? familiarLifeDrainCharges(unit.level) : void 0,
			summonerId: unit.id,
			diseased: false,
			diseaseBase: null,
			poisoned: false,
			bleeding: false,
			bleedMovedThisTurn: false,
			stunned: false,
			stunTurns: 0,
			crippled: false,
			hungerPenaltyPct: 0,
			fullness: 100,
			offHandId: null,
			gear: {},
			summoned: true,
			asleep: false,
			sleepTurns: 0,
			guaranteedDrop: false,
			dialog: null,
			moveBudgetUsed: 0
		};
		this.spendTier(unit, spellKind);
		this.noteAwareEnmity(unit, ENMITY.support.ce, ENMITY.support.ve);
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = `${unit.name} invocou ${familiar.name}.`;
		const step = {
			type: "spell",
			att: unit.id,
			tiles: [cell],
			ids: [],
			label: spellName,
			spellKind
		};
		this.onSeqStart.set(step, () => {
			this.units.push(familiar);
			this.emitPortalFx(cell.x, cell.y, cls.footprintOffsets ?? null, tier === 3);
			sfxPlay.summonFamiliar();
		});
		this.queue.push(step);
	}
	castWebOfDreams(unit, click) {
		if (!this.spellAimValid(unit, click)) {
			this.tip = this.spellAimError(unit, click);
			sfxPlay.ui();
			return;
		}
		const radius = webOfDreamsSize(unit.level);
		const sleepChance = webOfDreamsSleepChance(unit.level);
		const cells = hexAreaTiles(click, radius, this.cols, this.rows);
		const cellKeys = new Set(cells.map((p) => key(p.x, p.y)));
		this.webZones.push({
			cells: cellKeys,
			roundsLeft: WEB_OF_DREAMS.durationRounds,
			createdAt: this.time,
			center: {
				x: click.x,
				y: click.y
			},
			radius,
			sleepChance
		});
		let asleepCount = 0;
		for (const u of this.units) {
			if (!u.alive || !cellKeys.has(key(u.x, u.y))) continue;
			if (this.rng() < sleepChance) {
				u.asleep = true;
				u.sleepTurns = rollDice(WEB_OF_DREAMS.sleepDice, WEB_OF_DREAMS.sleepFaces, 0, this.rng);
				asleepCount++;
			}
		}
		this.spendTier(unit, "webOfDreams");
		this.noteAwareEnmity(unit, ENMITY.support.ce, ENMITY.support.ve);
		this.spellKind = null;
		this.missileTargets = [];
		this.emitMissileFx(unit.x, unit.y, click.x, click.y, "webOfDreams");
		this.emitParticle({
			x: click.x,
			y: click.y - .2,
			vx: 0,
			vy: -.3,
			life: 0,
			max: .5,
			size: 1.4,
			color: "#8c6cd8",
			kind: "impact",
			frame: 0
		});
		this.tip = `${unit.name} conjurou ${WEB_OF_DREAMS.name}${asleepCount > 0 ? ` — ${asleepCount} adormeceu(ram)` : ""}.`;
		this.pushLog(`${unit.name} conjura ${WEB_OF_DREAMS.name}.`);
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [click],
			ids: [],
			label: WEB_OF_DREAMS.name,
			spellKind: "webOfDreams"
		});
	}
	castCleave(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const tiles = cleaveHexes(unit, cell, CLEAVE.hexes, this.cols, this.rows);
		if (tiles.length === 0) {
			this.tip = "Toque num hex vizinho.";
			sfxPlay.ui();
			return;
		}
		const ids = [];
		for (const t of tiles) {
			const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (who && who.id !== unit.id && who.side !== unit.side && !ids.includes(who.id)) ids.push(who.id);
		}
		this.spendTier(unit, "cleave");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const power = cleavePower(unit.level);
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			label: CLEAVE.name,
			weaponBonusDice: power.dice,
			weaponBonusFaces: power.faces,
			weaponBonusBonus: 0,
			spellKind: "cleave"
		});
	}
	/** Paladin tier 6: a holy line down the aimed direction — the one AoE that filters allies
	* OUT of `ids` rather than in, so it can never clip one. Bonus is a flat half-MAG term
	* (weaponBonusBonus) plus a level-gated die, on top of a plain weapon hit. */
	castDivineWrath(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const tiles = this.wrathRay(unit, cell, DIVINE_WRATH.range);
		if (!tiles || tiles.length === 0) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const ids = [];
		for (const t of tiles) {
			const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (who && who.id !== unit.id && who.side !== unit.side && !ids.includes(who.id)) ids.push(who.id);
		}
		this.spendTier(unit, "divineWrath");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const power = divineWrathPower(unit.level);
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			label: DIVINE_WRATH.name,
			weaponBonusDice: power.dice,
			weaponBonusFaces: power.faces,
			weaponBonusBonus: Math.floor(unit.mag / 2),
			spellKind: "divineWrath"
		});
	}
	/** Heavy Knight tier 4: an arc of `hexes` neighbors (same cleaveHexes traversal as Cleave),
	* enemies only, each knocked back a fixed 2 hexes on top of the hit — see the
	* a.spellKind === "shoulderSmash" knockback loop in stepSpell. Refuses to arm at all while
	* a shield is equipped (see startShoulderSmash), so no equipment check needed here. */
	castShoulderSmash(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const power = shoulderSmashPower(unit.level);
		const tiles = cleaveHexes(unit, cell, power.hexes, this.cols, this.rows);
		if (tiles.length === 0) {
			this.tip = "Toque num hex vizinho.";
			sfxPlay.ui();
			return;
		}
		const ids = [];
		for (const t of tiles) {
			const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (who && who.id !== unit.id && who.side !== unit.side && !ids.includes(who.id)) ids.push(who.id);
		}
		this.spendTier(unit, "shoulderSmash");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			label: SHOULDER_SMASH.name,
			weaponBonusDice: power.dice,
			weaponBonusFaces: power.faces,
			weaponBonusBonus: 0,
			spellKind: "shoulderSmash"
		});
	}
	/** Heavy Knight tier 6: the same aimed line as Divine Wrath, but `ids` keeps EVERY unit in
	* the line except the caster themselves — allies included — which is the one thing that
	* tells it apart from Divine Wrath's ally-proof line. */
	castStampede(unit, cell) {
		if (!this.spellAimValid(unit, cell)) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const tiles = this.wrathRay(unit, cell, STAMPEDE.range);
		if (!tiles || tiles.length === 0) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const ids = [];
		for (const t of tiles) {
			const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (who && who.id !== unit.id && !ids.includes(who.id)) ids.push(who.id);
		}
		this.spendTier(unit, "stampede");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const power = stampedePower(unit.level);
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			label: STAMPEDE.name,
			weaponBonusDice: power.dice,
			weaponBonusFaces: power.faces,
			weaponBonusBonus: 0,
			spellKind: "stampede"
		});
	}
	/** Priest tier 2: derives a facing axis from the aimed cell (wrathRay's first step is
	* always one exact hex-neighbor away, so it maps 1:1 onto one of the 6 CUBE_DIRS), then
	* hits every unit in the resulting wedge — no side filter, friendly fire is intentional. */
	castBurningHands(unit, cell, kind = "burningHands") {
		const power = (kind === "poisonBreath" ? poisonBreathPower : burningHandsPower)(unit.level);
		const ray = this.wrathRay(unit, cell, power.range);
		const dir = ray && ray[0] ? axisDir(unit, ray[0]) : null;
		if (!dir) {
			this.tip = this.spellAimError(unit, cell);
			sfxPlay.ui();
			return;
		}
		const tiles = coneSector(unit, dir, power.radius, this.cols, this.rows);
		const ids = [];
		for (const t of tiles) {
			const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (who && who.id !== unit.id && !ids.includes(who.id)) ids.push(who.id);
		}
		this.spendTier(unit, kind);
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			dice: power.dice,
			faces: power.faces,
			bonus: 0,
			label: kind === "poisonBreath" ? POISON_BREATH.name : BURNING_HANDS.name,
			spellMul: power.mul,
			spellKind: kind,
			poison: kind === "poisonBreath"
		});
	}
	/** Arms a potion: the next tap on self or an adjacent ally (see confirmPotionAt) applies
	* it and spends the actor's action — same as attacking or casting, never a free extra. */
	usePotion(kind) {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.side !== "player" || !u.alive || u.acted) return;
		if (this.mode !== "awaitAction" && this.mode !== "selected" && this.mode !== "awaitAttack" && this.mode !== "awaitSpell") return;
		if (this.phase !== "player" || this.result) return;
		if (u.bag[kind] <= 0) return;
		this.mode = "awaitPotion";
		this.potionAim = kind;
		this.tip = `${potionLabel(kind)}: toque em você ou num aliado adjacente. Gasta a ação.`;
		sfxPlay.ui();
	}
	/** Whether `cell` is a legal potion target for `actor`: an alive ally on their own hex or
	* one hex away — the "1 de radius" a potion reaches, per direct instruction. */
	validPotionTarget(actor, cell) {
		const target = this.units.find((x) => x.alive && x.side === "player" && x.x === cell.x && x.y === cell.y);
		if (!target) return null;
		if (target.id === actor.id) return target;
		return hexNeighbors(actor.x, actor.y).some((n) => n.x === cell.x && n.y === cell.y) ? target : null;
	}
	potionTargetError(actor, cell) {
		const occupant = this.units.find((x) => x.alive && occupies(x, cell.x, cell.y));
		if (!occupant) return "Não há aliado nessa casa. Escolha você ou um aliado adjacente.";
		if (occupant.side !== "player") return "Poções só podem ser usadas em você ou em um aliado.";
		if (occupant.id !== actor.id && !hexNeighbors(actor.x, actor.y).some((n) => n.x === cell.x && n.y === cell.y)) return "Esse aliado está longe demais; poções alcançam apenas o próprio personagem ou um aliado adjacente.";
		return "Esse personagem não pode receber esta poção agora.";
	}
	/** The tap that resolves an armed potion (see usePotion/handleCell's awaitPotion branch). */
	confirmPotionAt(actor, cell) {
		const kind = this.potionAim;
		if (!kind) return;
		const target = this.validPotionTarget(actor, cell);
		if (!target) {
			this.tip = this.potionTargetError(actor, cell);
			sfxPlay.ui();
			return;
		}
		this.mode = "awaitAction";
		this.potionAim = null;
		this.applyPotion(actor, target, kind);
	}
	/** The potion's actual effect on `target`, spent from `actor`'s bag and ending their turn
	* — actor and target are the same unit for a self-drink, or actor hands it to an adjacent
	* ally (see confirmPotionAt/validPotionTarget). */
	applyPotion(actor, target, kind) {
		const def = POTIONS[kind];
		if (def.effect === "disease") {
			if (!target.diseased && !target.poisoned) {
				this.tip = `${def.name} · ${target.name} não está doente.`;
				sfxPlay.ui();
				return;
			}
			this.gainSupportAffinity(actor, target);
			actor.bag[kind] -= 1;
			this.curePlayerDisease(target);
			this.trainHealing(actor);
			actor.x = Math.round(actor.drawX);
			actor.y = Math.round(actor.drawY);
			this.tip = `${def.name} · ${target.name} curado(a) da doença.`;
			this.pushLog(`${actor.name} usou ${potionLabel(kind)} em ${target.name} e curou a doença.`);
			this.emitHolyFx(target.x, target.y, "potion", target.id);
			sfxPlay.ui();
			this.bleedOnItemUse(actor);
			this.finishAction(actor);
			return;
		}
		if (def.effect === "mana") {
			const restore = def.manaRestore ?? 0;
			let restored = 0;
			for (let t = 1; t <= 10; t++) {
				const tk = tierKey(t);
				const cap = tierUses(target.classId, t, target.level);
				if (cap <= 0) continue;
				const next = Math.min(cap, target.spells[tk] + restore);
				restored += next - target.spells[tk];
				target.spells[tk] = next;
			}
			if (restored <= 0) {
				this.tip = `${def.name} · magias de ${target.name} já estão no máximo.`;
				sfxPlay.ui();
				return;
			}
			this.gainSupportAffinity(actor, target);
			actor.bag[kind] -= 1;
			actor.x = Math.round(actor.drawX);
			actor.y = Math.round(actor.drawY);
			this.emitParticle({
				x: target.drawX,
				y: target.drawY - .35,
				vx: 0,
				vy: -.18,
				life: 0,
				max: 2,
				size: 1,
				color: "#a08cd8",
				text: `+${restored}`,
				kind: "text",
				frame: 0
			});
			this.tip = `${def.name} · +${restored} usos de magia (${target.name})`;
			this.pushLog(`${actor.name} usou ${potionLabel(kind)} em ${target.name} e restaurou ${restored} usos de magia.`);
			this.emitHolyFx(target.x, target.y, "potion", target.id);
			sfxPlay.ui();
			this.bleedOnItemUse(actor);
			this.finishAction(actor);
			return;
		}
		if (target.hp >= target.maxHp) {
			this.tip = `${target.name} já está com HP cheio.`;
			sfxPlay.ui();
			return;
		}
		const heal = this.healingPower(actor, rollPotion(kind, this.rng));
		const gained = Math.min(heal, target.maxHp - target.hp);
		target.hp += gained;
		if (gained > 0) {
			this.gainSupportAffinity(actor, target);
			this.trainHealing(actor);
		}
		this.gainExp(actor, target.level, gained);
		actor.bag[kind] -= 1;
		actor.x = Math.round(actor.drawX);
		actor.y = Math.round(actor.drawY);
		this.emitParticle({
			x: target.drawX,
			y: target.drawY - .35,
			vx: 0,
			vy: -.18,
			life: 0,
			max: 2,
			size: 1,
			color: "#d8ead2",
			text: `+${gained}`,
			kind: "text",
			frame: 0
		});
		this.tip = `${potionLabel(kind)} · +${gained} HP (${target.name})`;
		this.pushLog(`${actor.name} usou ${potionLabel(kind)} em ${target.name} e recuperou ${gained} HP.`);
		this.emitHolyFx(target.x, target.y, "potion", target.id);
		sfxPlay.ui();
		this.bleedOnItemUse(actor);
		this.finishAction(actor);
	}
	/** First adjacent locked chest/door around a unit's own tile, or null if none. A chest is
	* always a decoration (see CHEST_DECOR_IDS) — there is no "chest" terrain anymore — while a
	* door is still real terrain (see the "door" TerrainId). */
	adjacentLock(u) {
		for (const p of hexNeighbors(u.x, u.y)) {
			if (!inBounds(p.x, p.y, this.cols, this.rows)) continue;
			if (tileAt(this.tiles, this.cols, p.x, p.y) === "door") return p;
			if (this.decorations.some((d) => (DECORATIONS[d.id]?.model3d === "door" || DECORATIONS[d.id]?.model3d === "secretDoor") && d.x === p.x && d.y === p.y)) return p;
			if (this.decorations.some((d) => CHEST_DECOR_IDS.has(d.id) && d.x === p.x && d.y === p.y)) return p;
		}
		return null;
	}
	/** The strongest level among this battle's own enemy spawns — a per-spawn value (see
	* Mission.enemySpawns[].level, falling back to enemyLevelFor(mission.index) at spawn
	* time), already on the same 1..MAX_LEVEL scale gearPowerLevel runs on. Loot rolls cap
	* to this directly instead of stretching the coarse mission-index curve, so a mission
	* whose enemies are actually weak can't hand out gear built for a much harder one. */
	highestEnemyLevel() {
		let max = 1;
		for (const u of this.units) if (u.side === "enemy" && u.level > max) max = u.level;
		return max;
	}
	/** Removes one found-but-unclaimed weapon/item from this battle's loot list, because it
	* has just been equipped and written into the save directly. Without this the victory
	* fold would credit the same drop a second time. */
	claimLoot(kind, id) {
		const list = kind === "weapon" ? this.lootWeapons : this.lootEquipment;
		const i = list.indexOf(id);
		if (i >= 0) list.splice(i, 1);
	}
	/** Applies or refunds one already-authorized permanent level-up point. Authorization (the
	* three-points-per-level budget) belongs to the save/UI; the engine owns the live stat
	* update so the status sheet, damage forecast and any immediately-following action agree. */
	adjustStatPoint(unitId, stat, delta) {
		const u = this.units.find((candidate) => candidate.id === unitId);
		if (!u || u.side !== "player" || !u.alive || this.result) return false;
		const current = u.statPointAllocation[stat] ?? 0;
		if (delta < 0 && current <= 0) return false;
		const previousMaxHp = u.maxHp;
		const next = current + delta;
		if (next > 0) u.statPointAllocation[stat] = next;
		else delete u.statPointAllocation[stat];
		this.reapplyGear(u);
		if (stat === "hp" && delta > 0) u.hp = Math.min(u.maxHp, u.hp + (u.maxHp - previousMaxHp));
		this.tip = `${u.name}: ${stat.toUpperCase()} ${delta > 0 ? "+1" : "−1"}.`;
		this.pushLog(this.tip);
		sfxPlay.ui();
		return true;
	}
	/** Feeding is an immediate individual recovery: remove hunger's derived penalty and
	* recompute the live stats so the status panel switches back to Saudável at once. */
	feedUnit(unitId) {
		const u = this.units.find((candidate) => candidate.id === unitId);
		if (!u || u.side !== "player" || !u.alive) return false;
		u.fullness = 100;
		u.hungerPenaltyPct = 0;
		this.reapplyGear(u);
		return true;
	}
	/** Recomputes whatever worn gear contributes, after a slot changed mid-battle. Every core
	* stat gearStatBonus returns is applied here, kept in sync with the matching lines in
	* spawnUnit — folded into its own step rather than the equip methods so both entry points
	* stay in sync. */
	reapplyGear(u) {
		const base = statsFor(u.classId, u.level);
		const bonus = gearStatBonus(Object.values(u.gear));
		if (u.side === "player" && !u.summoned) u.weaponSkills = trainedWeaponSkills(this.heroSkills, u.name, u.classId);
		const hungerKeep = 1 - u.hungerPenaltyPct;
		const diseaseKeep = u.diseased ? 1 - DISEASE.statPenalty : 1;
		u.maxHp = Math.round((base.hp + (u.statPointAllocation.hp ?? 0) + bonus.hp) * hungerKeep);
		const diseaseBase = {
			atk: Math.round((base.atk + (u.statPointAllocation.atk ?? 0) + bonus.atk) * hungerKeep),
			mag: Math.round((base.mag + (u.statPointAllocation.mag ?? 0) + bonus.mag) * hungerKeep),
			def: Math.round((base.def + (u.statPointAllocation.def ?? 0) + bonus.def) * hungerKeep),
			dex: Math.round((base.dex + (u.statPointAllocation.dex ?? 0) + bonus.dex) * hungerKeep),
			mov: base.mov + bonus.mov
		};
		u.atk = Math.round(diseaseBase.atk * diseaseKeep);
		u.mag = Math.round(diseaseBase.mag * diseaseKeep);
		u.def = Math.round(diseaseBase.def * diseaseKeep);
		u.dex = Math.round(diseaseBase.dex * diseaseKeep);
		u.resistances = sumResistances(base.resistances, bonus.resistances, u.side === "player" && !u.summoned ? skillResistances(this.heroSkills, u.name) : void 0);
		u.mov = u.diseased ? Math.max(1, Math.round(diseaseBase.mov * diseaseKeep)) : diseaseBase.mov;
		u.diseaseBase = u.diseased ? diseaseBase : null;
		u.hp = Math.min(u.maxHp, u.hp);
	}
	/** Swaps a unit's main-hand weapon mid-battle.
	*
	* Changing gear is free and unlimited: it costs neither the turn's action nor its
	* movement, happens in any order around them, and can repeat until the turn is passed.
	* So this deliberately does not check `acted` and never calls finishAction — unlike
	* opening a chest, which does spend the action.
	*
	* Range is a weapon property, so it moves with the weapon; damage is rolled from
	* `weaponId` at attack time and follows on its own. */
	equipWeaponOn(unitId, weaponId, enh) {
		const u = this.units.find((x) => x.id === unitId);
		if (!u || u.side !== "player" || !u.alive) return false;
		if (this.phase !== "player" || this.result) return false;
		if (!weaponId) {
			u.weaponId = null;
			u.weaponEnh = 0;
			u.minRange = CLASSES[u.classId].minRange;
			u.maxRange = CLASSES[u.classId].maxRange;
			this.reapplyGear(u);
			this.tip = `${u.name} guardou a arma.`;
			this.pushLog(this.tip);
			sfxPlay.ui();
			return true;
		}
		const def = WEAPONS[weaponId];
		if (!def) return false;
		for (const other of this.units) if (other !== u && other.side === "player" && other.weaponId === weaponId) {
			other.weaponId = null;
			other.weaponEnh = 0;
			other.minRange = 1;
			other.maxRange = 1;
			this.reapplyGear(other);
		}
		u.weaponId = weaponId;
		u.weaponEnh = Math.max(0, Math.min(WEAPON_MAX_ENH, Math.floor(enh)));
		u.minRange = def.minRange;
		u.maxRange = def.maxRange;
		if (def.twoHanded && u.offHandId) {
			u.gear.offHand = void 0;
			u.offHandId = null;
		}
		this.reapplyGear(u);
		this.tip = `${u.name} equipou ${def.name}${u.weaponEnh > 0 ? ` +${u.weaponEnh}` : ""}.`;
		this.pushLog(this.tip);
		sfxPlay.ui();
		return true;
	}
	/** Swaps one worn equipment slot mid-battle — free, like the main hand above. Passing
	* null empties the slot. */
	equipItemOn(unitId, slot, itemId) {
		const u = this.units.find((x) => x.id === unitId);
		if (!u || u.side !== "player" || !u.alive) return false;
		if (this.phase !== "player" || this.result) return false;
		const item = itemId ? EQUIPMENT[itemId] : null;
		if (itemId && (!item || !equipmentFitsSlot(item, slot))) return false;
		if (slot === "offHand" && itemId && offHandBlocked(u.weaponId)) return false;
		if (itemId) for (const other of this.units) {
			if (other === u || other.side !== "player") continue;
			for (const [otherSlot, equippedId] of Object.entries(other.gear)) {
				if (equippedId !== itemId) continue;
				delete other.gear[otherSlot];
				if (otherSlot === "offHand") other.offHandId = null;
				this.reapplyGear(other);
				break;
			}
		}
		if (itemId) u.gear[slot] = itemId;
		else delete u.gear[slot];
		if (slot === "offHand") u.offHandId = itemId;
		this.reapplyGear(u);
		this.tip = item ? `${u.name} equipou ${item.name}.` : `${u.name} tirou o item de ${equipmentSlotName(slot)}.`;
		this.pushLog(this.tip);
		sfxPlay.ui();
		return true;
	}
	/** "Arrombar": spends a Gazua to open an adjacent locked chest/door. */
	useLockpick() {
		const u = this.units.find((x) => x.id === this.selectedId);
		if (!u || u.side !== "player" || !u.alive) return;
		if (this.mode !== "awaitAction" && this.mode !== "selected" && this.mode !== "awaitAttack" && this.mode !== "awaitSpell") return;
		if (this.phase !== "player" || this.result) return;
		if (u.bag.lockpick <= 0) return;
		const target = this.adjacentLock(u);
		if (!target) return;
		const i = target.y * this.cols + target.x;
		const chestDecorId = this.decorations.find((dec) => CHEST_DECOR_IDS.has(dec.id) && dec.x === target.x && dec.y === target.y)?.id;
		const wasChest = !!chestDecorId;
		const architectureDoor = this.decorations.find((dec) => (DECORATIONS[dec.id]?.model3d === "door" || DECORATIONS[dec.id]?.model3d === "secretDoor") && dec.x === target.x && dec.y === target.y);
		if (!wasChest && !architectureDoor) this.tiles[i] = this.mission.baseTile ?? "nave";
		if (architectureDoor) {
			const style = DECORATIONS[architectureDoor.id]?.doorStyle ?? "oak";
			architectureDoor.id = THREE_D_DOOR_VARIANTS[style].open;
			architectureDoor.blocksPath = void 0;
			this.refreshDecorOverlay();
		}
		this.terrainVersion++;
		for (let d = this.decorations.length - 1; d >= 0; d--) {
			const dec = this.decorations[d];
			if (CHEST_DECOR_IDS.has(dec.id) && dec.x === target.x && dec.y === target.y) {
				this.decorations.splice(d, 1);
				this.refreshDecorOverlay();
			}
		}
		u.bag.lockpick -= 1;
		u.x = Math.round(u.drawX);
		u.y = Math.round(u.drawY);
		this.emitParticle({
			x: target.x,
			y: target.y,
			vx: 0,
			vy: -.2,
			life: 0,
			max: .45,
			size: 1,
			color: "#d8b862",
			kind: "impact",
			frame: 0
		});
		const found = [];
		if (wasChest) {
			const betterSpot = this.mission.betterChests?.some((c) => c.x === target.x && c.y === target.y) ?? false;
			const tier = chestDecorId === "chest-large" ? "best" : chestDecorId === "chest-medium" || betterSpot ? "better" : "base";
			const emberBase = tier === "best" ? CHEST_LOOT.bestEmberBase : tier === "better" ? CHEST_LOOT.betterEmberBase : CHEST_LOOT.emberBase;
			const emberDice = tier === "best" ? CHEST_LOOT.bestEmberDice : tier === "better" ? CHEST_LOOT.betterEmberDice : CHEST_LOOT.emberDice;
			const gearChance = tier === "best" ? CHEST_LOOT.bestGearChance : tier === "better" ? CHEST_LOOT.betterGearChance : CHEST_LOOT.gearChance;
			const gearTierMul = tier === "best" ? CHEST_LOOT.bestGearTierMul : tier === "better" ? CHEST_LOOT.betterGearTierMul : CHEST_LOOT.gearTierMul;
			const gain = emberBase + Math.floor(this.rng() * emberDice);
			this.lootEmber += gain;
			const potionKind = weightedPotionPick(this.rng);
			const who = this.givePotion(u, potionKind);
			if (who) {
				const passed = who.id !== u.id ? ` → ${who.name}` : "";
				found.push({
					name: `${POTIONS[potionKind].name}${passed}`,
					icon: `/game/icons/potion-${potionKind}.png?v=ds2`,
					tip: potionTooltip(potionKind)
				});
			} else found.push({
				name: `${POTIONS[potionKind].name} (sem espaço — descartada)`,
				icon: `/game/icons/potion-${potionKind}.png?v=ds2`,
				tip: potionTooltip(potionKind)
			});
			if (this.rng() < gearChance) {
				const gearLevel = Math.max(1, Math.min(30, Math.round(this.highestEnemyLevel() * gearTierMul)));
				const drop = weightedLootPick(this.rng, gearLevel, this.ownedWeapons);
				if (drop.kind === "weapon") {
					this.ownedWeapons.add(drop.id);
					this.lootWeapons.push(drop.id);
					found.push({
						name: WEAPONS[drop.id].name,
						icon: weaponIcon(drop.id),
						tip: weaponTooltip(WEAPONS[drop.id])
					});
				} else {
					this.lootEquipment.push(drop.id);
					found.push({
						name: EQUIPMENT[drop.id].name,
						icon: equipmentIcon(drop.id),
						tip: equipmentTooltip(EQUIPMENT[drop.id])
					});
				}
			}
			if (this.rng() < .4) {
				const qty = 1 + Math.floor(this.rng() * 4);
				this.lootRations += qty;
				found.push({
					name: `Rações ×${qty}`,
					icon: RATIONS_ICON,
					tip: "Alimenta o grupo por dias no mapa."
				});
			}
			const foundNames = found.map((f) => f.name).join(", ");
			this.tip = `${u.name} arrombou o baú · +${gain} Gold · achou ${foundNames}.`;
			this.pushLog(this.tip);
			this.chestLoot = {
				unitName: u.name,
				ember: gain,
				items: found
			};
		} else {
			this.tip = `${u.name} arrombou a porta.`;
			this.pushLog(this.tip);
		}
		this.bleedOnItemUse(u);
		this.finishAction(u);
		if (wasChest) {
			sfxPlay.chest();
			if (found.length > 0) setTimeout(() => sfxPlay.loot(), 130);
		} else sfxPlay.ui();
	}
	/** "Fim do turno": passes whoever's turn it currently is (same as Esperar). */
	endTurn() {
		const active = this.activeTurnUnit();
		if (!active || active.side !== "player" || this.result) return;
		active.moved = true;
		active.x = Math.round(active.drawX);
		active.y = Math.round(active.drawY);
		active.drawX = active.x;
		active.drawY = active.y;
		this.deselect(true);
		sfxPlay.ui();
	}
	/** A random encounter can only be escaped by the hero whose turn it is, once that hero
	* reaches any outer hex of the battlefield. This engine owns the DEX-adjusted roll; the campaign
	* screen handles a successful transition back to the world map. A miss spends this hero's
	* turn, so enemies continue their normal turns and are the only source of ensuing damage. */
	canAttemptFlee() {
		const u = this.activeTurnUnit();
		return !!u && u.side === "player" && u.alive && !u.moved && !u.summoned && !this.result && !this.active && this.queue.length === 0 && this.phase === "player" && this.mode === "selected" && footprint(u).some((cell) => cell.x <= 0 || cell.y <= 0 || cell.x >= this.cols - 1 || cell.y >= this.rows - 1);
	}
	/** Rolls a DEX-adjusted escape for the active edge-bound hero. Failed attempts deliberately do
	* not inflict scripted damage: they end the hero's turn, letting the encounter's enemies
	* carry on attacking normally before the party can try again. */
	fleeChance(unit = this.activeTurnUnit() ?? void 0) {
		if (!unit) return 0;
		return dexEscapeChance(this.affinityUnit(unit).dex);
	}
	attemptFlee() {
		if (!this.canAttemptFlee()) return false;
		const u = this.activeTurnUnit();
		if (this.rng() * 100 < this.fleeChance(u)) {
			this.tip = `${u.name} encontrou uma saída! O grupo foge do combate.`;
			this.pushLog(this.tip);
			sfxPlay.ui();
			return true;
		}
		u.moved = true;
		u.x = Math.round(u.drawX);
		u.y = Math.round(u.drawY);
		u.drawX = u.x;
		u.drawY = u.y;
		this.deselect(true);
		this.tip = `${u.name} não conseguiu fugir — o combate continua.`;
		this.pushLog(this.tip);
		sfxPlay.ui();
		this.emit();
		return false;
	}
	/** Dispatches control for whoever is next in this round's initiative order. */
	beginUnitTurn(u) {
		this.phase = u.side === "player" ? "player" : "enemy";
		const resumed = this.skipStartOfTurn;
		this.skipStartOfTurn = false;
		if (!resumed) {
			u.idleAlt = !u.idleAlt;
			u.moveBudgetUsed = 0;
			u.bleedMovedThisTurn = false;
			this.startOfTurnEffects(u);
			if (!u.alive) {
				this.activeUnitId = null;
				return;
			}
			if (u.stunned) {
				u.stunTurns = Math.max(0, u.stunTurns - 1);
				u.stunned = u.stunTurns > 0;
				u.moved = true;
				u.acted = true;
				this.tip = `${u.name} está atordoado(a) — perde o turno.`;
				this.activeUnitId = null;
				return;
			}
			if (this.isWebCell(u.x, u.y) && this.rng() < this.webCellSleepChance(u.x, u.y)) {
				const wasAsleep = u.asleep;
				const extra = rollDice(WEB_OF_DREAMS.sleepDice, WEB_OF_DREAMS.sleepFaces, 0, this.rng);
				u.asleep = true;
				u.sleepTurns += extra;
				this.pushLog(wasAsleep ? `${u.name} afunda mais fundo na teia (+${extra} turnos).` : `${u.name} adormece na teia.`);
			}
			if (u.asleep) {
				u.sleepTurns = Math.max(0, u.sleepTurns - 1);
				u.asleep = u.sleepTurns > 0;
				u.moved = true;
				u.acted = true;
				this.tip = `${u.name} está adormecido(a) — perde o turno.`;
				this.activeUnitId = null;
				return;
			}
			if ((u.fearTurns ?? 0) > 0) {
				u.fearTurns = Math.max(0, (u.fearTurns ?? 0) - 1);
				const source = this.units.find((x) => x.id === u.fearSourceId);
				const threats = source ? [source] : this.units.filter((x) => x.alive && x.side !== u.side && x.side !== "neutral");
				this.turnRestrained = this.isWebCell(u.x, u.y);
				const reach = computeReachable(this.effectiveUnitForReach(u), this.tiles, this.cols, this.rows, this.units, true, this.decorOverlay);
				const paths = computeReachable(this.effectiveUnitForReach(u), this.tiles, this.cols, this.rows, this.units, false, this.decorOverlay);
				const distance = (cell) => threats.length ? Math.min(...threats.map((t) => hexDist(cell, t))) : 0;
				let destination = u;
				for (const cell of reach.values()) if (distance(cell) > distance(destination)) destination = cell;
				if (destination !== u) {
					const path = reconstructPath(paths, destination);
					if (path.length > 1) this.queue.push({
						type: "move",
						id: u.id,
						path
					});
				}
				u.moved = true;
				u.acted = true;
				this.mode = "locked";
				this.tip = `${u.name} flees in fear and cannot attack.`;
				if (this.queue.length === 0) this.activeUnitId = null;
				return;
			}
			this.turnRestrained = this.isWebCell(u.x, u.y);
		} else if (!u.alive) {
			this.activeUnitId = null;
			return;
		}
		if (u.side === "player") {
			if (!resumed) u.acted = false;
			this.selectedId = u.id;
			this.pendingFoeId = null;
			this.inspectedId = null;
			this.orig = {
				x: u.x,
				y: u.y
			};
			this.origMoveBudgetUsed = u.moveBudgetUsed;
			this.turnStart = {
				x: u.x,
				y: u.y
			};
			this.moveSpoiled = resumed;
			this.reach = computeReachable(this.effectiveUnitForReach(u), this.tiles, this.cols, this.rows, this.units, true, this.decorOverlay);
			this.attackFrom = u.acted ? /* @__PURE__ */ new Map() : this.visibleAttackTargets(u);
			this.threat = [];
			this.mode = "selected";
			this.tip = null;
			this.centerOn(u.x, u.y);
		} else {
			this.mode = "locked";
			this.ensureVisible(u.x, u.y);
			this.runAiFor(u);
		}
	}
	/** Everyone has had their turn this round — reset and re-roll the initiative order. */
	startNewRound() {
		for (const row of this.enmity.values()) for (const [heroId, entry] of row) row.set(heroId, addToEntry(entry, 0, -ENMITY.volatileDecayPerRound));
		this.mode = "locked";
		this.selectedId = null;
		this.pendingFoeId = null;
		this.inspectedId = null;
		this.reach.clear();
		this.attackFrom.clear();
		this.threat = [];
		for (const u of this.units) {
			u.moved = false;
			u.acted = false;
			if (u.bleedRoundsLeft != null && u.bleedRoundMarker != null && u.bleedRoundMarker < this.turn) {
				u.bleedRoundsLeft = Math.max(0, u.bleedRoundsLeft - 1);
				u.bleedRoundMarker = this.turn;
				if (u.bleedRoundsLeft === 0) {
					u.bleeding = false;
					u.bleedRoundMarker = void 0;
				}
			}
			if ((u.blessedRoundsLeft ?? 0) > 0) {
				u.blessedRoundsLeft = Math.max(0, u.blessedRoundsLeft - 1);
				if (u.blessedRoundsLeft === 0) u.blessedHitBonusPct = 0;
			}
		}
		for (const z of this.webZones) z.roundsLeft -= 1;
		this.webZones = this.webZones.filter((z) => z.roundsLeft > 0);
		for (const z of this.iceStormZones) z.roundsLeft -= 1;
		this.iceStormZones = this.iceStormZones.filter((z) => z.roundsLeft > 0);
		for (const z of this.auraZones) z.roundsLeft -= 1;
		this.auraZones = this.auraZones.filter((z) => z.roundsLeft > 0);
		this.turnOrder = this.sortByInitiative(this.units.filter(takesTurns));
		this.turn += 1;
		this.activeUnitId = null;
	}
	applyBless(target, casterLevel) {
		const pct = BLESS.hitBonusPct(casterLevel) / 100;
		target.blessedHitBonusPct = Math.max(target.blessedHitBonusPct ?? 0, pct);
		const duration = BLESS.durationRounds(casterLevel);
		target.blessedRoundsLeft = duration;
		target.healGlow = 1;
		target.healGlowKind = "bless";
		this.pushLog(`${target.name} recebeu Bless: +${Math.round(pct * 100)}% de acerto por ${duration} rodadas.`);
	}
	/** Enemy Choque: same ignore-cover targeting as Relâmpago, ~1/3 the stats. Returns true
	* if a cast was queued so the caller can skip the rest of the AI. */
	tryAiShock(next, reach, walkReach, players) {
		if (next.shockCharges <= 0) return false;
		let best = null;
		for (const cell of reach.values()) for (const foe of players) {
			if (manhattan(cell, foe) > SHOCK.range) continue;
			const score = (foe.maxHp - foe.hp) * 3 + (foe.hp <= 8 ? 20 : 0);
			if (!best || score > best.score) best = {
				foe,
				from: {
					x: cell.x,
					y: cell.y
				},
				score
			};
		}
		if (!best) return false;
		if (best.from.x !== next.x || best.from.y !== next.y) this.queue.push({
			type: "move",
			id: next.id,
			path: reconstructPath(walkReach, best.from)
		});
		next.shockCharges -= 1;
		this.queue.push({
			type: "spell",
			att: next.id,
			tiles: [{
				x: best.foe.x,
				y: best.foe.y
			}],
			ids: [best.foe.id],
			dice: SHOCK.dice,
			faces: SHOCK.faces,
			bonus: SHOCK.bonus,
			label: SHOCK.name,
			echo: {
				dice: SHOCK.echoDice,
				faces: SHOCK.echoFaces,
				bonus: SHOCK.echoBonus
			},
			spellMul: SHOCK.mul,
			spellKind: "shock"
		});
		this.queue.push({
			type: "delay",
			dur: .12
		});
		return true;
	}
	runAiFor(next) {
		if (!this.wakeIfSeesParty(next)) {
			next.moved = true;
			next.acted = true;
			return;
		}
		this.smashBarricades(next);
		const reach = computeReachable(this.effectiveUnitForReach(next), this.tiles, this.cols, this.rows, this.units, true, this.decorOverlay);
		const walkReach = computeReachable(this.effectiveUnitForReach(next), this.tiles, this.cols, this.rows, this.units, false, this.decorOverlay);
		const focus = this.enmityTarget(next);
		const players = focus ? [focus] : this.units.filter((u) => u.side === "player" && u.alive);
		if (next.classId === "bigBlueCalf" && !next.acted && this.tierRemaining(next, "bullRush") > 0) {
			const target = players.flatMap((foe) => footprint(foe).map((cell) => ({
				foe,
				cell
			}))).sort((a, b) => hexDist(next, a.cell) - hexDist(next, b.cell) || a.foe.hp - b.foe.hp).find(({ cell }) => this.bullRushCharge(next, cell) !== null);
			if (target) {
				this.castBullRush(next, target.cell);
				return;
			}
		}
		if ((next.classId === "cultist" || next.classId === "cultistV2" || next.classId === "emberedWraith" || next.classId === "swampBlueCalf") && (next.spells.tier1 > 0 || next.spells.tier2 > 0 || next.shockCharges > 0 || (next.fantomForceCharges ?? 0) > 0)) {
			if (next.spells.tier2 > 0) {
				let bestBolt = null;
				for (const cell of reach.values()) for (const foe of players) {
					if (manhattan(cell, foe) > LIGHTNING.range) continue;
					const score = (foe.maxHp - foe.hp) * 3 + (foe.hp <= 8 ? 20 : 0);
					if (!bestBolt || score > bestBolt.score) bestBolt = {
						foe,
						from: {
							x: cell.x,
							y: cell.y
						},
						score
					};
				}
				if (bestBolt) {
					if (bestBolt.from.x !== next.x || bestBolt.from.y !== next.y) this.queue.push({
						type: "move",
						id: next.id,
						path: reconstructPath(walkReach, bestBolt.from)
					});
					this.spendTier(next, "lightning");
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles: [{
							x: bestBolt.foe.x,
							y: bestBolt.foe.y
						}],
						ids: [bestBolt.foe.id],
						dice: lightningDice(),
						faces: LIGHTNING.faces,
						bonus: LIGHTNING.bonus,
						label: LIGHTNING.name,
						echo: {
							dice: LIGHTNING.echoDice,
							faces: LIGHTNING.echoFaces,
							bonus: LIGHTNING.echoBonus
						},
						spellMul: LIGHTNING.mul,
						spellKind: "lightning"
					});
					this.queue.push({
						type: "delay",
						dur: .12
					});
					return;
				}
			}
			if ((next.fantomForceCharges ?? 0) > 0) {
				let bestForce = null;
				for (const cell of reach.values()) for (const foe of players) {
					if (manhattan(cell, foe) > FANTOM_FORCE.range) continue;
					if (!clearShot(cell, {
						x: foe.x,
						y: foe.y
					}, this.tiles, this.cols, "bolt", this.decorOverlay)) continue;
					const score = (foe.maxHp - foe.hp) * 3 + (foe.hp <= 8 ? 20 : 0);
					if (!bestForce || score > bestForce.score) bestForce = {
						foe,
						from: {
							x: cell.x,
							y: cell.y
						},
						score
					};
				}
				if (bestForce) {
					if (bestForce.from.x !== next.x || bestForce.from.y !== next.y) this.queue.push({
						type: "move",
						id: next.id,
						path: reconstructPath(walkReach, bestForce.from)
					});
					next.fantomForceCharges = Math.max(0, next.fantomForceCharges - 1);
					const dice = fantomForceDice(next.level);
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles: [{
							x: bestForce.foe.x,
							y: bestForce.foe.y
						}],
						ids: [bestForce.foe.id],
						dice: dice.dice,
						faces: dice.faces,
						bonus: 0,
						label: FANTOM_FORCE.name,
						spellMul: 1,
						spellKind: "fantomForce"
					});
					this.queue.push({
						type: "delay",
						dur: .12
					});
					return;
				}
			}
			if (this.tryAiShock(next, reach, walkReach, players)) return;
			if (next.spells.tier1 > 0) {
				let bestSpell = null;
				for (const cell of reach.values()) for (const foe of players) {
					if (manhattan(cell, foe) > MAGIC_MISSILE.range) continue;
					if (!clearShot(cell, {
						x: foe.x,
						y: foe.y
					}, this.tiles, this.cols, "bolt", this.decorOverlay)) continue;
					const score = (foe.maxHp - foe.hp) * 3 + (foe.hp <= 8 ? 20 : 0);
					if (!bestSpell || score > bestSpell.score) bestSpell = {
						foe,
						from: {
							x: cell.x,
							y: cell.y
						},
						score
					};
				}
				if (bestSpell) {
					if (bestSpell.from.x !== next.x || bestSpell.from.y !== next.y) this.queue.push({
						type: "move",
						id: next.id,
						path: reconstructPath(walkReach, bestSpell.from)
					});
					this.spendTier(next, "magicMissile");
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles: [{
							x: bestSpell.foe.x,
							y: bestSpell.foe.y
						}],
						ids: [bestSpell.foe.id],
						dice: MAGIC_MISSILE.dice,
						faces: MAGIC_MISSILE.faces,
						bonus: MAGIC_MISSILE.bonus,
						label: MAGIC_MISSILE.name,
						spellMul: MAGIC_MISSILE.mul,
						spellKind: "magicMissile"
					});
					this.queue.push({
						type: "delay",
						dur: .12
					});
					return;
				}
			}
		}
		if (next.classId === "cultistV2" && (next.frostCharges ?? 0) > 0) {
			let best = null;
			for (const from of [next]) for (const foe of players) {
				const cells = this.frostTiles(from, foe, next.level);
				const hits = players.filter((p) => cells.some((c) => occupies(p, c.x, c.y))).length;
				if (!hits) continue;
				const allies = this.units.filter((u) => u.alive && u.side === next.side && u.id !== next.id && cells.some((c) => occupies(u, c.x, c.y))).length;
				const score = hits * 10 - allies * 12 - hexDist(next, from);
				if (!best || score > best.score) best = {
					from: {
						x: from.x,
						y: from.y
					},
					target: {
						x: foe.x,
						y: foe.y
					},
					score
				};
			}
			if (best && best.score > 0) {
				if (best.from.x !== next.x || best.from.y !== next.y) this.queue.push({
					type: "move",
					id: next.id,
					path: reconstructPath(walkReach, best.from)
				});
				this.queueFrost(next, best.from, best.target);
				this.queue.push({
					type: "delay",
					dur: .12
				});
				return;
			}
		}
		if ((next.classId === "undeadOx" || next.classId === "plagueBearingCattle") && this.tryAiMinorVenom(next, reach, walkReach, players)) return;
		if (next.classId === "carnivorousPlant") {
			if (this.tryAiPlantSwipe(next, reach, walkReach)) return;
			if (this.tryAiPlantCausticVenom(next, reach, walkReach, players)) return;
			if (this.tryAiPlantPoisonBreath(next, reach, walkReach)) return;
			if (this.tryAiMinorVenom(next, reach, walkReach, players)) return;
		}
		if (next.classId === "sapling" && this.tryAiPlantPoisonBreath(next, reach, walkReach)) return;
		if ((next.classId === "birolho" || next.classId === "birolho2" || next.classId === "birolho3" || next.classId === "birolhoLegs" || next.classId === "birolhoLegs2") && (next.spells.tier1 > 0 || next.spells.tier2 > 0 || next.spells.tier4 > 0 || next.shockCharges > 0)) {
			if (next.spells.tier2 > 0) {
				let bestBolt = null;
				for (const cell of reach.values()) for (const foe of players) {
					if (manhattan(cell, foe) > LIGHTNING.range) continue;
					const score = (foe.maxHp - foe.hp) * 3 + (foe.hp <= 8 ? 20 : 0);
					if (!bestBolt || score > bestBolt.score) bestBolt = {
						foe,
						from: {
							x: cell.x,
							y: cell.y
						},
						score
					};
				}
				if (bestBolt) {
					if (bestBolt.from.x !== next.x || bestBolt.from.y !== next.y) this.queue.push({
						type: "move",
						id: next.id,
						path: reconstructPath(walkReach, bestBolt.from)
					});
					this.spendTier(next, "lightning");
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles: [{
							x: bestBolt.foe.x,
							y: bestBolt.foe.y
						}],
						ids: [bestBolt.foe.id],
						dice: lightningDice(),
						faces: LIGHTNING.faces,
						bonus: LIGHTNING.bonus,
						label: LIGHTNING.name,
						echo: {
							dice: LIGHTNING.echoDice,
							faces: LIGHTNING.echoFaces,
							bonus: LIGHTNING.echoBonus
						},
						spellMul: LIGHTNING.mul,
						spellKind: "lightning"
					});
					this.queue.push({
						type: "delay",
						dur: .12
					});
					return;
				}
			}
			if (next.spells.tier4 > 0) {
				let bestVenom = null;
				for (const cell of reach.values()) for (const foe of players) {
					if (manhattan(cell, foe) > CAUSTIC_VENOM.range) continue;
					if (!clearShot(cell, {
						x: foe.x,
						y: foe.y
					}, this.tiles, this.cols, "bolt", this.decorOverlay)) continue;
					const splash = hexAreaTiles({
						x: foe.x,
						y: foe.y
					}, CAUSTIC_VENOM.size, this.cols, this.rows);
					let hits = 0;
					let score = 0;
					for (const t of splash) {
						const hit = players.find((p) => p.x === t.x && p.y === t.y);
						if (!hit) continue;
						hits += 1;
						score += hit.maxHp - hit.hp + (hit.hp <= 8 ? 15 : 0);
					}
					if (hits === 0) continue;
					score += hits * 10;
					if (!bestVenom || score > bestVenom.score) bestVenom = {
						at: {
							x: foe.x,
							y: foe.y
						},
						from: {
							x: cell.x,
							y: cell.y
						},
						score
					};
				}
				if (bestVenom) {
					if (bestVenom.from.x !== next.x || bestVenom.from.y !== next.y) this.queue.push({
						type: "move",
						id: next.id,
						path: reconstructPath(walkReach, bestVenom.from)
					});
					this.spendTier(next, "causticVenom");
					const tiles = hexAreaTiles(bestVenom.at, CAUSTIC_VENOM.size, this.cols, this.rows);
					const ids = [];
					for (const t of tiles) {
						const u = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
						if (u && !ids.includes(u.id)) ids.push(u.id);
					}
					const center = this.units.find((x) => x.alive && occupies(x, bestVenom.at.x, bestVenom.at.y));
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles,
						ids,
						dice: CAUSTIC_VENOM.splashDice,
						faces: CAUSTIC_VENOM.splashFaces,
						bonus: CAUSTIC_VENOM.splashBonus,
						centerId: center?.id,
						centerDice: CAUSTIC_VENOM.centerDice,
						centerFaces: CAUSTIC_VENOM.centerFaces,
						centerBonus: CAUSTIC_VENOM.centerBonus,
						poison: true,
						label: CAUSTIC_VENOM.name,
						spellMul: CAUSTIC_VENOM.splashMul,
						centerMul: CAUSTIC_VENOM.centerMul,
						spellKind: "causticVenom"
					});
					this.queue.push({
						type: "delay",
						dur: .12
					});
					return;
				}
			}
			if (this.tryAiShock(next, reach, walkReach, players)) return;
			if (next.spells.tier1 > 0) {
				let bestBolt = null;
				for (const cell of reach.values()) for (const foe of players) {
					if (manhattan(cell, foe) > MAGIC_MISSILE.range) continue;
					if (!clearShot(cell, {
						x: foe.x,
						y: foe.y
					}, this.tiles, this.cols, "bolt", this.decorOverlay)) continue;
					const score = (foe.maxHp - foe.hp) * 3 + (foe.hp <= 8 ? 20 : 0);
					if (!bestBolt || score > bestBolt.score) bestBolt = {
						foe,
						from: {
							x: cell.x,
							y: cell.y
						},
						score
					};
				}
				if (bestBolt) {
					if (bestBolt.from.x !== next.x || bestBolt.from.y !== next.y) this.queue.push({
						type: "move",
						id: next.id,
						path: reconstructPath(walkReach, bestBolt.from)
					});
					this.spendTier(next, "magicMissile");
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles: [{
							x: bestBolt.foe.x,
							y: bestBolt.foe.y
						}],
						ids: [bestBolt.foe.id],
						dice: MAGIC_MISSILE.dice,
						faces: MAGIC_MISSILE.faces,
						bonus: MAGIC_MISSILE.bonus,
						label: MAGIC_MISSILE.name,
						spellMul: MAGIC_MISSILE.mul,
						spellKind: "magicMissile"
					});
					this.queue.push({
						type: "delay",
						dur: .12
					});
					return;
				}
			}
		}
		if (next.classId === "roccoTheBird" && (next.spells.tier1 > 0 || next.spells.tier2 > 0 || next.shockCharges > 0)) {
			if (next.spells.tier2 > 0) {
				const power = burningHandsPower(next.level);
				let bestCone = null;
				for (const cell of reach.values()) for (const dir of CUBE_DIRS) {
					const tiles = coneSector(cell, dir, power.radius, this.cols, this.rows);
					const ids = [];
					let score = 0;
					let burnsAlly = false;
					for (const t of tiles) {
						const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
						if (!who || who.id === next.id || ids.includes(who.id)) continue;
						if (who.side !== "player") burnsAlly = true;
						ids.push(who.id);
						score += 10 + (who.maxHp - who.hp) * 3 + (who.hp <= 8 ? 20 : 0);
					}
					if (burnsAlly || !ids.length) continue;
					if (!bestCone || score > bestCone.score) bestCone = {
						tiles,
						ids,
						from: {
							x: cell.x,
							y: cell.y
						},
						score
					};
				}
				if (bestCone) {
					if (bestCone.from.x !== next.x || bestCone.from.y !== next.y) this.queue.push({
						type: "move",
						id: next.id,
						path: reconstructPath(walkReach, bestCone.from)
					});
					this.spendTier(next, "burningHands");
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles: bestCone.tiles,
						ids: bestCone.ids,
						dice: power.dice,
						faces: power.faces,
						bonus: 0,
						label: "Burning Beak",
						spellMul: power.mul,
						spellKind: "burningHands"
					});
					this.queue.push({
						type: "delay",
						dur: .12
					});
					return;
				}
			}
			if (next.spells.tier1 > 0) {
				let bestSpell = null;
				for (const cell of reach.values()) for (const foe of players) {
					if (manhattan(cell, foe) > MAGIC_MISSILE.range) continue;
					if (!clearShot(cell, {
						x: foe.x,
						y: foe.y
					}, this.tiles, this.cols, "bolt", this.decorOverlay)) continue;
					const score = (foe.maxHp - foe.hp) * 3 + (foe.hp <= 8 ? 20 : 0);
					if (!bestSpell || score > bestSpell.score) bestSpell = {
						foe,
						from: {
							x: cell.x,
							y: cell.y
						},
						score
					};
				}
				if (bestSpell) {
					if (bestSpell.from.x !== next.x || bestSpell.from.y !== next.y) this.queue.push({
						type: "move",
						id: next.id,
						path: reconstructPath(walkReach, bestSpell.from)
					});
					this.spendTier(next, "magicMissile");
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles: [{
							x: bestSpell.foe.x,
							y: bestSpell.foe.y
						}],
						ids: [bestSpell.foe.id],
						dice: MAGIC_MISSILE.dice,
						faces: MAGIC_MISSILE.faces,
						bonus: MAGIC_MISSILE.bonus,
						label: MAGIC_MISSILE.name,
						spellMul: MAGIC_MISSILE.mul,
						spellKind: "magicMissile"
					});
					this.queue.push({
						type: "delay",
						dur: .12
					});
					return;
				}
			}
			if (this.tryAiShock(next, reach, walkReach, players)) return;
		}
		if (next.side === "enemy" && next.shockCharges > 0 && next.classId !== "cultist" && next.classId !== "cultistV2" && next.classId !== "birolho" && next.classId !== "birolho2" && next.classId !== "birolho3" && next.classId !== "birolhoLegs" && next.classId !== "birolhoLegs2" && this.tryAiShock(next, reach, walkReach, players)) return;
		if (next.classId === "brigand" && (next.spells.tier1 > 0 || next.spells.tier2 > 0)) {
			const spellKind = next.spells.tier2 > 0 ? "piercing" : "longShot";
			const longMax = LONG_SHOT.range;
			let bestSpell = null;
			for (const cell of reach.values()) for (const foe of players) {
				if (spellKind === "longShot") {
					const d = manhattan(cell, foe);
					if (d < next.minRange || d > longMax) continue;
					if (!clearShot(cell, {
						x: foe.x,
						y: foe.y
					}, this.tiles, this.cols, "arrow", this.decorOverlay)) continue;
				} else {
					const line = this.piercingRay({
						x: cell.x,
						y: cell.y
					}, {
						x: foe.x,
						y: foe.y
					});
					if (!line || !line.some((p) => p.x === foe.x && p.y === foe.y)) continue;
				}
				const score = (foe.maxHp - foe.hp) * 3 + (foe.hp <= 8 ? 20 : 0);
				if (!bestSpell || score > bestSpell.score) bestSpell = {
					foe,
					from: {
						x: cell.x,
						y: cell.y
					},
					score
				};
			}
			if (bestSpell) {
				if (bestSpell.from.x !== next.x || bestSpell.from.y !== next.y) this.queue.push({
					type: "move",
					id: next.id,
					path: reconstructPath(walkReach, bestSpell.from)
				});
				this.spendTier(next, spellKind);
				if (spellKind === "longShot") {
					const power = longShotPower(next.level);
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles: [{
							x: bestSpell.foe.x,
							y: bestSpell.foe.y
						}],
						ids: [bestSpell.foe.id],
						label: LONG_SHOT.name,
						weaponBonusDice: power.dice,
						weaponBonusFaces: power.faces,
						weaponBonusBonus: 0,
						spellKind: "longShot"
					});
				} else {
					const line = this.piercingRay(bestSpell.from, {
						x: bestSpell.foe.x,
						y: bestSpell.foe.y
					});
					const ids = [];
					for (const t of line) {
						const who = this.units.find((u) => u.alive && occupies(u, t.x, t.y));
						if (who && who.id !== next.id && !ids.includes(who.id)) ids.push(who.id);
					}
					this.queue.push({
						type: "spell",
						att: next.id,
						tiles: line,
						ids,
						label: PIERCING.name,
						dmgMul: piercingMul(next.level),
						spellKind: "piercing"
					});
				}
				this.queue.push({
					type: "delay",
					dur: .12
				});
				return;
			}
		}
		let best = null;
		for (const cell of reach.values()) for (const foe of players) {
			if (!canHitFrom(next, cell, foe, this.tiles, this.cols, this.decorOverlay)) continue;
			const terr = this.hexAt(cell.x, cell.y);
			const score = (foe.maxHp - foe.hp) * 3 + terr.def * 2 + (foe.hp <= 8 ? 20 : 0);
			if (!best || score > best.score) best = {
				foe,
				from: {
					x: cell.x,
					y: cell.y
				},
				score
			};
		}
		if (best) {
			if (best.from.x !== next.x || best.from.y !== next.y) this.queue.push({
				type: "move",
				id: next.id,
				path: reconstructPath(walkReach, best.from)
			});
			this.queue.push({
				type: "combat",
				att: next.id,
				def: best.foe.id
			});
			this.queue.push({
				type: "delay",
				dur: .12
			});
			return;
		}
		if (players.length === 0) {
			next.moved = true;
			return;
		}
		const fields = this.playerDistanceFields(players);
		let nearest = fields[0];
		for (const f of fields) if ((f.field.get(key(next.x, next.y)) ?? Infinity) < (nearest.field.get(key(next.x, next.y)) ?? Infinity)) nearest = f;
		let closest = null;
		let dist = Infinity;
		for (const cell of reach.values()) {
			const d = nearest.field.get(key(cell.x, cell.y)) ?? Infinity;
			if (d < dist) {
				dist = d;
				closest = {
					x: cell.x,
					y: cell.y
				};
			}
		}
		if (closest && (closest.x !== next.x || closest.y !== next.y)) this.queue.push({
			type: "move",
			id: next.id,
			path: reconstructPath(walkReach, closest)
		});
		next.moved = true;
		this.queue.push({
			type: "delay",
			dur: .08
		});
	}
	pointerMove(cssX, cssY) {
		if (this.mode === "awaitSpell" && this.spellArmed && this.spellAim) return;
		const cell = this.cellAt(cssX, cssY);
		this.hover = cell;
	}
	/** Inspect a unit under the mouse without changing the selected unit or action mode. */
	inspectAt(cssX, cssY) {
		if (this.result) return null;
		const cell = this.cellAt(cssX, cssY);
		if (!cell) return null;
		const unit = this.occ().get(key(cell.x, cell.y));
		if (!unit?.alive) return null;
		this.inspect(unit);
		return unit.id;
	}
	pointerDown(cssX, cssY, via = "click") {
		if (this.result || this.mode === "locked") return;
		const cell = this.cellAt(cssX, cssY);
		if (!cell) {
			if (this.mode === "selected" || this.mode === "awaitAction") this.deselect();
			return;
		}
		const now = typeof performance !== "undefined" ? performance.now() : Date.now();
		const selected = this.units.find((u) => u.id === this.selectedId);
		const same = this.lastClickCell && this.lastClickCell.x === cell.x && this.lastClickCell.y === cell.y && now - this.lastClickAt < 340;
		this.lastClickAt = now;
		this.lastClickCell = cell;
		if (same && (this.mode === "awaitAction" || this.mode === "selected") && selected && occupies(selected, cell.x, cell.y)) {
			this.wait();
			const next = this.activeTurnUnit();
			if (next && next.side === "player") this.select(next);
			return;
		}
		this.cursor = cell;
		this.ensureVisible(cell.x, cell.y);
		this.handleCell(cell, via);
	}
	keyDown(code) {
		if (this.result || this.mode === "locked") {
			if (code === "KeyE") this.endTurn();
			return;
		}
		if (code === "Enter" || code === "Space") this.handleCell(this.cursor, "click");
		if (code === "Escape") this.cancel();
		if (code === "KeyE") this.endTurn();
		if (code === "KeyZ") this.wait();
	}
	handleCell(cell, via = "click") {
		const here = this.occ().get(key(cell.x, cell.y));
		const selected = this.units.find((u) => u.id === this.selectedId);
		if (this.pendingFoeId && !this.targetable(here)) this.pendingFoeId = null;
		if (this.mode === "awaitPotion" && selected) {
			this.hover = cell;
			this.confirmPotionAt(selected, cell);
			return;
		}
		if (this.mode === "awaitSpell" && selected) {
			if (this.spellKind === "turnUndead") {
				this.tip = "The area is centered on the priest. Confirm to cast or cancel to keep the turn.";
				return;
			}
			if (this.spellKind === "sweep") {
				if (manhattan(selected, cell) <= SWEEP.radius) this.confirmSweep();
				else {
					this.tip = "A área já está marcada — Lançar para confirmar.";
					sfxPlay.ui();
				}
				return;
			}
			this.hover = cell;
			if (!this.spellAimValid(selected, cell)) {
				this.tip = this.spellAimError(selected, cell);
				this.spellArmed = false;
				sfxPlay.ui();
				return;
			}
			const picks = this.spellKind === "magicMissile" ? magicMissileCount(selected.level) : this.spellKind === "multiShot" ? multiShotTargets(selected.level) : 1;
			if (this.missileTargets.length + 1 < picks) {
				this.confirmSpell();
				return;
			}
			if (!this.spellArmed || !this.spellAim || this.spellAim.x !== cell.x || this.spellAim.y !== cell.y) {
				this.spellArmed = true;
				this.spellAim = cell;
				this.tip = null;
				sfxPlay.ui();
				return;
			}
			this.confirmSpell();
			return;
		}
		if (here && here.side === "player" && here.alive && this.phase === "player") {
			if (selected && here.id !== selected.id && !this.mission.explore) return;
			if (selected && this.mode === "awaitAction") {
				if (here.id === selected.id) return;
				this.deselect();
			}
			this.select(here);
			return;
		}
		if (here?.dialog && here.alive) {
			const lockedDoor = (this.mission.neutralSpawns?.find((spawn) => spawn.name === here.name && spawn.x === here.x && spawn.y === here.y))?.dialogRequiresOpenDoor;
			if (lockedDoor && tileAt(this.tiles, this.cols, lockedDoor.x, lockedDoor.y) === "door") {
				this.tip = "A cela está trancada. Use uma gazua para abrir a porta.";
				this.pushLog(this.tip);
				sfxPlay.ui();
				return;
			}
			if (this.mission.explore && selected && this.mode === "selected" && !hexNeighbors(here.x, here.y).some((n) => n.x === selected.x && n.y === selected.y)) {
				let best = null;
				let bestCost = Infinity;
				for (const n of hexNeighbors(here.x, here.y)) {
					const cost = this.reach.get(key(n.x, n.y))?.cost;
					if (cost !== void 0 && cost < bestCost && !this.units.some((u) => u.alive && u.x === n.x && u.y === n.y)) {
						best = n;
						bestCost = cost;
					}
				}
				if (best) {
					const tree = here.dialog;
					this.commitMove(selected, best, () => this.openDialog(tree));
					return;
				}
			}
			this.openDialog(here.dialog);
			return;
		}
		if (this.targetable(here)) {
			if (selected && !selected.acted && this.mode === "awaitOffHand") {
				if (canHitFrom(this.offHandReach(selected), selected, here, this.tiles, this.cols, this.decorOverlay)) {
					this.stageAttack(here, true);
					return;
				}
				this.tip = "Fora de alcance.";
				sfxPlay.ui();
				return;
			}
			if (selected && !selected.acted && (this.mode === "awaitAttack" || this.mode === "awaitAction" || this.mode === "selected")) {
				if ((selected.offHandId ? EQUIPMENT[selected.offHandId] : null)?.kind === "weapon" && this.isArrowAttack(selected) && canHitFrom(this.offHandReach(selected), selected, here, this.tiles, this.cols, this.decorOverlay)) {
					this.stageAttack(here, true);
					return;
				}
				if (this.attackFrom.get(here.id) || canHitFrom(selected, selected, here, this.tiles, this.cols, this.decorOverlay)) {
					this.stageAttack(here, false);
					return;
				}
				if (shotKind(selected) && inWeaponRange(selected.x, selected.y, here.x, here.y, selected.minRange, effectiveMaxRange(selected, tileAt(this.tiles, this.cols, selected.x, selected.y)))) {
					this.tip = this.shotBlockedTip(selected, here, shotKind(selected));
					sfxPlay.ui();
					return;
				}
			}
			return;
		}
		if (selected && this.mode === "selected") {
			if (this.reach.has(key(cell.x, cell.y)) && !here) {
				this.commitMove(selected, cell);
				return;
			}
		}
		if (selected && this.mode === "awaitAction" && !here) this.deselect();
		if (!here && this.inspectedId && !selected) {
			this.inspectedId = null;
			this.threat = [];
			this.tip = null;
		}
	}
	commitMove(unit, to, after) {
		const path = reconstructPath(computeReachable(this.effectiveUnitForReach(unit), this.tiles, this.cols, this.rows, this.units, false, this.decorOverlay), to);
		if (path.length < 2 || path[0].x !== unit.x || path[0].y !== unit.y) return;
		const stepCost = this.reach.get(key(to.x, to.y))?.cost ?? 0;
		this.mode = "locked";
		this.queue.push({
			type: "move",
			id: unit.id,
			path
		});
		this.queue.push({
			type: "delay",
			dur: .02
		});
		this.onNextIdle = () => {
			unit.x = Math.round(to.x);
			unit.y = Math.round(to.y);
			unit.drawX = unit.x;
			unit.drawY = unit.y;
			unit.moveBudgetUsed += stepCost;
			if (unit.acted && unit.mov - unit.moveBudgetUsed <= 0) {
				this.selectedId = unit.id;
				this.reach.clear();
				this.attackFrom.clear();
				this.mode = "selected";
				return;
			}
			this.selectedId = unit.id;
			this.mode = "selected";
			this.reach = computeReachable(this.effectiveUnitForReach(unit), this.tiles, this.cols, this.rows, this.units, true, this.decorOverlay);
			this.attackFrom = this.visibleAttackTargets(unit);
			after?.();
		};
	}
	/** Clicking an enemy no longer attacks outright: it stages the attack on that foe, and the
	* HUD shows its forecast (hit chance, damage, counter) with Confirmar/Cancelar —
	* see confirmPendingAttack / cancelPendingAttack. `offHand`: the click resolved to the
	* off-hand strike (dagger/katar/shield) rather than the main attack. */
	stageAttack(foe, offHand) {
		this.pendingFoeId = foe.id;
		this.pendingAttackOffHand = offHand;
		this.tip = null;
		sfxPlay.ui();
	}
	/** Confirmar on the staged attack: runs exactly what the click used to run. */
	confirmPendingAttack() {
		const selected = this.units.find((u) => u.id === this.selectedId);
		const foe = this.units.find((u) => u.id === this.pendingFoeId);
		this.pendingFoeId = null;
		if (!selected || !foe || !foe.alive || selected.acted || this.phase !== "player") return;
		if (this.pendingAttackOffHand) {
			this.commitOffHandAction(selected, foe, {
				x: selected.x,
				y: selected.y
			});
			return;
		}
		const from = this.attackFrom.get(foe.id);
		this.commitAttack(selected, foe, from ?? {
			x: selected.x,
			y: selected.y
		});
	}
	/** Cancelar on an aimed skill's confirm panel: the skill is put away and the unit is back to
	* choosing — unlike cancel(), its movement this turn is kept, not rewound. */
	cancelSkillConfirm() {
		if (this.mode !== "awaitSpell") return;
		const u = this.units.find((x) => x.id === this.selectedId);
		this.spellArmed = false;
		this.spellAim = null;
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		if (u) this.returnToSelected(u);
		else this.deselect();
		sfxPlay.ui();
	}
	/** Cancelar on the staged attack: nothing happens, the unit keeps its turn. */
	cancelPendingAttack() {
		if (!this.pendingFoeId) return;
		this.pendingFoeId = null;
		sfxPlay.ui();
	}
	commitAttack(unit, foe, from) {
		const at = {
			x: Math.round(from.x),
			y: Math.round(from.y)
		};
		if (!canHitFrom(unit, at, foe, this.tiles, this.cols, this.decorOverlay)) {
			this.mode = "awaitAction";
			this.tip = "Fora de alcance.";
			return;
		}
		this.mode = "locked";
		if (at.x !== unit.x || at.y !== unit.y) {
			const path = reconstructPath(computeReachable(this.effectiveUnitForReach(unit), this.tiles, this.cols, this.rows, this.units, false, this.decorOverlay), at);
			if (path.length > 1) this.queue.push({
				type: "move",
				id: unit.id,
				path
			});
		}
		this.queue.push({
			type: "combat",
			att: unit.id,
			def: foe.id
		});
	}
	/** Off-hand attack (a light weapon in the offHand slot) or Shield Bash (a shield
	* there) — whichever EQUIPMENT[unit.offHandId].kind resolves to. Reuses the same
	* "already in range from here" check as a normal Atacar; no move-then-act chaining. */
	commitOffHandAction(unit, foe, from) {
		const item = unit.offHandId ? EQUIPMENT[unit.offHandId] : null;
		const reach = this.offHandReach(unit);
		if (!item || !canHitFrom(reach, from, foe, this.tiles, this.cols, this.decorOverlay)) {
			this.mode = "awaitAction";
			this.tip = "Fora de alcance.";
			return;
		}
		this.mode = "locked";
		if (item.kind === "shield") this.queue.push({
			type: "combat",
			att: unit.id,
			def: foe.id,
			dmgMul: item.dmgMul ?? .75,
			stunChance: .7,
			spellKind: "shieldBash"
		});
		else this.queue.push({
			type: "combat",
			att: unit.id,
			def: foe.id,
			customDice: {
				dice: item.dice ?? 1,
				faces: item.faces ?? 4,
				bonus: item.bonus ?? 0
			}
		});
	}
	castIceStorm(unit, click) {
		if (!this.spellAimValid(unit, click)) {
			this.tip = this.spellAimError(unit, click);
			sfxPlay.ui();
			return;
		}
		const power = iceStormPower(unit.level);
		const cells = iceStormAreaTiles(click, unit.level, this.cols, this.rows);
		const cellKeys = new Set(cells.map((p) => key(p.x, p.y)));
		this.iceStormZones.push({
			cells: cellKeys,
			roundsLeft: power.durationRounds,
			createdAt: this.time,
			center: { ...click },
			radius: power.size,
			damageDice: power.dice,
			damageFaces: power.faces,
			damageMul: power.mul,
			casterMag: unit.mag,
			casterLevel: unit.level,
			casterId: unit.id,
			side: unit.side
		});
		this.spendTier(unit, "iceStorm");
		this.spellKind = null;
		this.missileTargets = [];
		this.mode = "locked";
		this.tip = `${unit.name} conjura ${ICE_STORM.name}: área de ${power.areaHexes} hexes, ${power.durationRounds} rodadas.`;
		this.pushLog(`${unit.name} conjura ${ICE_STORM.name}.`);
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles: [click],
			ids: [],
			label: ICE_STORM.name,
			spellKind: "iceStorm"
		});
	}
	castFireball(unit, click) {
		const origin = fireballOrigin(click, this.cols, this.rows);
		const tiles = fireballTiles(origin, this.cols, this.rows);
		const ids = [];
		for (const t of tiles) {
			const u = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (u && !ids.includes(u.id)) ids.push(u.id);
		}
		this.spendFamiliarOrTier(unit, "fireball");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		const power = fireballPower();
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			dice: power.dice,
			faces: power.faces,
			bonus: power.bonus,
			label: FIREBALL.name,
			spellMul: FIREBALL.mul,
			spellKind: "fireball",
			projectileTo: origin
		});
	}
	castCausticVenom(unit, click) {
		const origin = fireballOrigin(click, this.cols, this.rows);
		const tiles = hexAreaTiles(origin, CAUSTIC_VENOM.size, this.cols, this.rows);
		const ids = [];
		for (const t of tiles) {
			const u = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (u && !ids.includes(u.id)) ids.push(u.id);
		}
		const center = this.units.find((x) => x.alive && occupies(x, origin.x, origin.y));
		this.spendFamiliarOrTier(unit, "causticVenom");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			dice: CAUSTIC_VENOM.splashDice,
			faces: CAUSTIC_VENOM.splashFaces,
			bonus: CAUSTIC_VENOM.splashBonus,
			centerId: center?.id,
			centerDice: CAUSTIC_VENOM.centerDice,
			centerFaces: CAUSTIC_VENOM.centerFaces,
			centerBonus: CAUSTIC_VENOM.centerBonus,
			poison: true,
			label: CAUSTIC_VENOM.name,
			spellMul: CAUSTIC_VENOM.splashMul,
			centerMul: CAUSTIC_VENOM.centerMul,
			spellKind: "causticVenom",
			projectileTo: origin
		});
	}
	castDivineBolt(unit, click) {
		const origin = fireballOrigin(click, this.cols, this.rows);
		const tiles = hexAreaTiles(origin, DIVINE_BOLT.size, this.cols, this.rows);
		const ids = [];
		for (const t of tiles) {
			const u = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (u && !ids.includes(u.id)) ids.push(u.id);
		}
		const center = this.units.find((x) => x.alive && occupies(x, origin.x, origin.y));
		this.spendTier(unit, "divineBolt");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			dice: DIVINE_BOLT.splashDice,
			faces: DIVINE_BOLT.splashFaces,
			bonus: DIVINE_BOLT.splashBonus,
			centerId: center?.id,
			centerDice: DIVINE_BOLT.centerDice,
			centerFaces: DIVINE_BOLT.centerFaces,
			centerBonus: DIVINE_BOLT.centerBonus,
			label: DIVINE_BOLT.name,
			spellMul: DIVINE_BOLT.splashMul,
			centerMul: DIVINE_BOLT.centerMul,
			spellKind: "divineBolt",
			projectileTo: origin
		});
	}
	/** Veneno Menor (MINOR_VENOM): Caustic Venom's dice and poison on a radius-2 splash. */
	castMinorVenom(unit, click) {
		const origin = fireballOrigin(click, this.cols, this.rows);
		this.spendFamiliarOrTier(unit, "minorVenom");
		this.spellKind = null;
		this.missileTargets = [];
		this.tip = null;
		this.mode = "locked";
		this.queueMinorVenom(unit, origin);
	}
	queueMinorVenom(unit, origin) {
		const tiles = hexAreaTiles(origin, MINOR_VENOM.size, this.cols, this.rows);
		const ids = [];
		for (const t of tiles) {
			const u = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (u && !ids.includes(u.id)) ids.push(u.id);
		}
		const center = this.units.find((x) => x.alive && occupies(x, origin.x, origin.y));
		this.queue.push({
			type: "spell",
			att: unit.id,
			tiles,
			ids,
			dice: MINOR_VENOM.splashDice,
			faces: MINOR_VENOM.splashFaces,
			bonus: MINOR_VENOM.splashBonus,
			centerId: center?.id,
			centerDice: MINOR_VENOM.centerDice,
			centerFaces: MINOR_VENOM.centerFaces,
			centerBonus: MINOR_VENOM.centerBonus,
			poison: true,
			label: MINOR_VENOM.name,
			spellMul: MINOR_VENOM.splashMul,
			centerMul: MINOR_VENOM.centerMul,
			spellKind: "minorVenom",
			projectileTo: origin
		});
	}
	/** Enemy Veneno Menor (Undead Ox): the Birolho branch's venom targeting on the smaller
	* splash. Returns true if a cast was queued so the caller can skip the rest of the AI. */
	tryAiMinorVenom(next, reach, walkReach, players) {
		if (this.tierRemaining(next, "minorVenom") <= 0) return false;
		let best = null;
		for (const cell of reach.values()) for (const foe of players) {
			if (manhattan(cell, foe) > MINOR_VENOM.range) continue;
			if (!clearShot(cell, {
				x: foe.x,
				y: foe.y
			}, this.tiles, this.cols, "bolt", this.decorOverlay)) continue;
			let hits = 0;
			let score = 0;
			for (const t of hexAreaTiles({
				x: foe.x,
				y: foe.y
			}, MINOR_VENOM.size, this.cols, this.rows)) {
				const hit = players.find((p) => p.x === t.x && p.y === t.y);
				if (!hit) continue;
				hits += 1;
				score += hit.maxHp - hit.hp + (hit.hp <= 8 ? 15 : 0);
			}
			if (hits === 0) continue;
			score += hits * 10;
			if (!best || score > best.score) best = {
				at: {
					x: foe.x,
					y: foe.y
				},
				from: {
					x: cell.x,
					y: cell.y
				},
				score
			};
		}
		if (!best) return false;
		if (best.from.x !== next.x || best.from.y !== next.y) this.queue.push({
			type: "move",
			id: next.id,
			path: reconstructPath(walkReach, best.from)
		});
		this.spendTier(next, "minorVenom");
		this.queueMinorVenom(next, best.at);
		this.queue.push({
			type: "delay",
			dur: .12
		});
		return true;
	}
	/** Carnivorous Plant's tendril swipe area with her anchor at `at`: every hex touching her
	* Type 7 body (front and both flanks), except the row behind her head. */
	plantSwipeTiles(next, at) {
		const body = footprint({
			...next,
			x: at.x,
			y: at.y
		});
		const inBody = (p) => body.some((b) => b.x === p.x && b.y === p.y);
		const out = [];
		for (const b of body) for (const p of hexNeighbors(b.x, b.y)) {
			if (p.y < at.y - 2 || !inBounds(p.x, p.y, this.cols, this.rows) || inBody(p)) continue;
			if (!out.some((o) => o.x === p.x && o.y === p.y)) out.push(p);
		}
		return out;
	}
	/** Carnivorous Plant: with more than one foe in reach of her swipe (from any cell she can
	* reach this turn), she swipes them all with a weapon hit on her ATT sheet. */
	tryAiPlantSwipe(next, reach, walkReach) {
		let best = null;
		for (const cell of reach.values()) {
			const tiles = this.plantSwipeTiles(next, cell);
			const ids = [];
			let score = 0;
			for (const t of tiles) {
				const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
				if (!who || who.id === next.id || who.side === next.side || ids.includes(who.id)) continue;
				ids.push(who.id);
				score += 10 + (who.maxHp - who.hp) * 3 + (who.hp <= 8 ? 20 : 0);
			}
			if (ids.length < 2) continue;
			if (!best || score > best.score) best = {
				tiles,
				ids,
				from: {
					x: cell.x,
					y: cell.y
				},
				score
			};
		}
		if (!best) return false;
		if (best.from.x !== next.x || best.from.y !== next.y) this.queue.push({
			type: "move",
			id: next.id,
			path: reconstructPath(walkReach, best.from)
		});
		this.queue.push({
			type: "spell",
			att: next.id,
			tiles: best.tiles,
			ids: best.ids,
			label: "Chicote de Gavinhas",
			spellKind: "tendrilSwipe"
		});
		this.queue.push({
			type: "delay",
			dur: .12
		});
		return true;
	}
	/** Carnivorous Plant's 2 Veneno Cáustico: the Birolho branch's venom targeting, spending
	* her own tier3 slot (her tier4 holds Veneno Menor). */
	tryAiPlantCausticVenom(next, reach, walkReach, players) {
		if (next.spells.tier3 <= 0) return false;
		let best = null;
		for (const cell of reach.values()) for (const foe of players) {
			if (manhattan(cell, foe) > CAUSTIC_VENOM.range) continue;
			if (!clearShot(cell, {
				x: foe.x,
				y: foe.y
			}, this.tiles, this.cols, "bolt", this.decorOverlay)) continue;
			let hits = 0;
			let score = 0;
			for (const t of hexAreaTiles({
				x: foe.x,
				y: foe.y
			}, CAUSTIC_VENOM.size, this.cols, this.rows)) {
				const hit = players.find((p) => p.x === t.x && p.y === t.y);
				if (!hit) continue;
				hits += 1;
				score += hit.maxHp - hit.hp + (hit.hp <= 8 ? 15 : 0);
			}
			if (hits === 0) continue;
			score += hits * 10;
			if (!best || score > best.score) best = {
				at: {
					x: foe.x,
					y: foe.y
				},
				from: {
					x: cell.x,
					y: cell.y
				},
				score
			};
		}
		if (!best) return false;
		if (best.from.x !== next.x || best.from.y !== next.y) this.queue.push({
			type: "move",
			id: next.id,
			path: reconstructPath(walkReach, best.from)
		});
		next.spells.tier3 -= 1;
		const tiles = hexAreaTiles(best.at, CAUSTIC_VENOM.size, this.cols, this.rows);
		const ids = [];
		for (const t of tiles) {
			const u = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
			if (u && !ids.includes(u.id)) ids.push(u.id);
		}
		const center = this.units.find((x) => x.alive && occupies(x, best.at.x, best.at.y));
		this.queue.push({
			type: "spell",
			att: next.id,
			tiles,
			ids,
			dice: CAUSTIC_VENOM.splashDice,
			faces: CAUSTIC_VENOM.splashFaces,
			bonus: CAUSTIC_VENOM.splashBonus,
			centerId: center?.id,
			centerDice: CAUSTIC_VENOM.centerDice,
			centerFaces: CAUSTIC_VENOM.centerFaces,
			centerBonus: CAUSTIC_VENOM.centerBonus,
			poison: true,
			label: CAUSTIC_VENOM.name,
			spellMul: CAUSTIC_VENOM.splashMul,
			centerMul: CAUSTIC_VENOM.centerMul,
			spellKind: "causticVenom"
		});
		this.queue.push({
			type: "delay",
			dur: .12
		});
		return true;
	}
	/** Carnivorous Plant's 2 Poison Breath: Rocco's Burning Beak cone targeting (never aimed
	* where it would also hit one of her allies), with Poison Breath's power and poison. */
	tryAiPlantPoisonBreath(next, reach, walkReach) {
		if (next.spells.tier1 <= 0) return false;
		const power = poisonBreathPower(next.level);
		let best = null;
		for (const cell of reach.values()) for (const dir of CUBE_DIRS) {
			const tiles = coneSector(cell, dir, power.radius, this.cols, this.rows);
			const ids = [];
			let score = 0;
			let hitsAlly = false;
			for (const t of tiles) {
				const who = this.units.find((x) => x.alive && occupies(x, t.x, t.y));
				if (!who || who.id === next.id || ids.includes(who.id)) continue;
				if (who.side === next.side) hitsAlly = true;
				ids.push(who.id);
				score += 10 + (who.maxHp - who.hp) * 3 + (who.hp <= 8 ? 20 : 0);
			}
			if (hitsAlly || !ids.length) continue;
			if (!best || score > best.score) best = {
				tiles,
				ids,
				from: {
					x: cell.x,
					y: cell.y
				},
				score
			};
		}
		if (!best) return false;
		if (best.from.x !== next.x || best.from.y !== next.y) this.queue.push({
			type: "move",
			id: next.id,
			path: reconstructPath(walkReach, best.from)
		});
		this.spendTier(next, "poisonBreath");
		this.queue.push({
			type: "spell",
			att: next.id,
			tiles: best.tiles,
			ids: best.ids,
			dice: power.dice,
			faces: power.faces,
			bonus: 0,
			label: POISON_BREATH.name,
			spellMul: power.mul,
			spellKind: "poisonBreath",
			poison: true
		});
		this.queue.push({
			type: "delay",
			dur: .12
		});
		return true;
	}
	/** CSS-pixel screen position (matching the coordinate space `render()` just drew into) of a
	* hex's center, plus the current tile size — what the WebGL FX overlay needs to keep a spawned
	* effect glued to its hex while the camera pans/zooms. Also carries a second, camera-INDEPENDENT
	* position (worldX/worldY) for the same hex — the exact same hexCenter formula, just without
	* this frame's pan offset (this.layout.ox/oy) folded in. The water/river shaders sample their
	* noise field from that instead of screen position: sampling from the live screen position
	* meant every camera pan (which happens constantly — dragging, zoom, the camera following a
	* moving unit) shifted the whole noise field by the pan delta, on top of its real u_time-driven
	* animation, so the water visibly slid/warped in lockstep with the camera instead of just
	* flowing. worldX/worldY still scale with the current tile size (so zooming rescales the
	* pattern, which reads as expected), only the pan-induced translation is removed. */
	effectAnchor(col, row) {
		const { cx, cy } = this.hexCenter(col, row);
		const { tile } = this.layout;
		return {
			x: cx,
			y: cy,
			tile,
			worldX: tile * Math.sqrt(3) * (col + .5 * (row & 1) + .5),
			worldY: this.boardPad(tile) + tile * (1.5 * row + 1)
		};
	}
	/** Footprint (as a multiple of one hex's own tile size, the same unit SpawnOptions.radiusTiles
	* already uses everywhere else) for ONE "web" WebGL effect drawn over an entire Dreaming Web
	* zone — see BattleCanvas's zone sync. Neighboring hex centers on this grid sit sqrt(3) tiles
	* apart (a regular hex grid — verified: dx=tile*sqrt3/2, dy=tile*1.5 gives the same
	* hypot(dx,dy)=tile*sqrt3 to every one of the 6 neighbors, not just the horizontal pair), so a
	* cube-distance-R hex disk's farthest cell sits R*sqrt(3) tiles out along its own spoke; + 1.0
	* reaches that cell's own outer edge, matching DEFAULT_RADIUS_TILES.web's existing convention
	* that 1.0 fills exactly one hex. */
	webZoneRadiusTiles(radius) {
		return radius * Math.sqrt(3) + 1;
	}
	/** Live geometry for Dreaming Web's travelling WebGL shot — null whenever no such shot is
	* currently in flight (including once it lands: the beam only exists while actually
	* travelling, per the same `m.t < m.travel` window MissileFx tracks; the floor patch that
	* appears at the target hex is its own separate "web" effect, not this one fading out).
	* BattleCanvas polls this every frame and feeds it straight into
	* EffectsRenderer.updateOverride — see EffectOverride for why a fixed-hex getAnchor(col,row)
	* effect can't represent a continuously moving, continuously growing beam on its own. */
	webShotBeam() {
		const m = this.missileFx.find((x) => x.live && x.kind === "webOfDreams" && x.t < x.travel);
		if (!m) return null;
		const from = this.effectAnchor(m.fromX, m.fromY);
		const to = this.effectAnchor(m.toX, m.toY);
		const k = Math.min(1, m.t / m.travel);
		const headX = from.x + (to.x - from.x) * k;
		const headY = from.y + (to.y - from.y) * k;
		const headWorldX = from.worldX + (to.worldX - from.worldX) * k;
		const headWorldY = from.worldY + (to.worldY - from.worldY) * k;
		const dx = headX - from.x;
		const dy = headY - from.y;
		return {
			x: (from.x + headX) / 2,
			y: (from.y + headY) / 2,
			worldX: (from.worldX + headWorldX) / 2,
			worldY: (from.worldY + headWorldY) / 2,
			tile: from.tile,
			angle: Math.atan2(dy, dx),
			length: Math.hypot(dx, dy)
		};
	}
	panBy(dx, dy) {
		this.camX += dx;
		this.camY += dy;
		this.clampCam();
	}
	/** Preserve an editor preview camera while its draft mission is rebuilt. */
	cameraPosition() {
		return {
			x: this.camX,
			y: this.camY
		};
	}
	restoreCamera(position) {
		this.camX = position.x;
		this.camY = position.y;
		this.clampCam();
	}
	/** Editor-only overlay: show the footprint of the decoration brush in the live preview. */
	drawDecorationHighlight(ctx, decorationId, selected) {
		const tile = this.layout.tile;
		ctx.save();
		ctx.lineWidth = Math.max(2, tile * .075);
		ctx.strokeStyle = "rgba(255, 207, 82, 0.98)";
		ctx.fillStyle = "rgba(255, 190, 46, 0.14)";
		ctx.shadowColor = "rgba(255, 174, 35, 0.95)";
		ctx.shadowBlur = Math.max(7, tile * .32);
		for (const placement of this.decorations) {
			if (placement.id !== decorationId) continue;
			if (selected && (placement.x !== selected.x || placement.y !== selected.y || (placement.rot ?? 0) !== (selected.rot ?? 0))) continue;
			for (const cell of placedFootprint(placement)) {
				const { cx, cy } = this.hexCenter(placement.x + cell.dx, placement.y + cell.dy);
				this.hexPath(ctx, cx, cy, tile * .91);
				ctx.fill();
				ctx.stroke();
			}
		}
		ctx.restore();
	}
	setZoom(level) {
		const next = Math.max(0, Math.min(ZOOM_RADII.length - 1, Math.round(level)));
		if (next === this.zoom) return;
		const old = ZOOM_RADII[this.zoom];
		const k = ZOOM_RADII[next] / old;
		this.camX = (this.camX + this.viewW / 2) * k - this.viewW / 2;
		this.camY = (this.camY + this.viewH / 2) * k - this.viewH / 2;
		this.zoom = next;
		this.clampCam();
		this.emit();
	}
	setSpeed(mode) {
		this.speedMode = mode;
		this.emit();
	}
	cycleZoom(dir) {
		this.setZoom(this.zoom + (dir < 0 ? -1 : 1));
	}
	boardPad(tile) {
		return tile * 2.4;
	}
	boardSize(tile) {
		return {
			w: tile * Math.sqrt(3) * (this.cols + .5),
			h: tile * (1.5 * (this.rows - 1) + 2) + this.boardPad(tile)
		};
	}
	/** Normal gameplay stays on the playable board, rather than panning across a large
	* decorative backdrop. The editor may opt into a fixed preview rim. */
	cameraMargin(tile) {
		const previewMargin = this.previewPanMarginRadii > 0 ? this.previewPanMarginRadii * tile : null;
		return {
			x: previewMargin ?? 0,
			y: previewMargin ?? 0
		};
	}
	uniqueNeutralNpcSpawns(spawns) {
		const names = /* @__PURE__ */ new Set();
		const appearances = /* @__PURE__ */ new Set();
		return spawns.flatMap((spawn, index) => {
			if (!spawn.dialog) return [{
				spawn,
				index
			}];
			const name = spawn.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase();
			const appearance = CLASSES[spawn.classId]?.sprite ?? spawn.classId;
			if (names.has(name) || appearances.has(appearance)) return [];
			names.add(name);
			appearances.add(appearance);
			return [{
				spawn,
				index
			}];
		});
	}
	/** Editor-only edge room for panning. Real battle never calls this, so battle camera bounds
	* stay unchanged. */
	setPreviewPanMargin(radii) {
		this.previewPanMarginRadii = Math.max(0, radii);
		this.clampCam();
	}
	clampCam() {
		const tile = ZOOM_RADII[this.zoom];
		const { w, h } = this.boardSize(tile);
		const roomX = 0;
		const roomY = 0;
		if (this.fogged) {
			const maxX = w - this.viewW;
			const boardTop = this.boardPad(tile);
			const maxY = h - this.viewH;
			const loX = maxX < 0 ? maxX / 2 : 0, hiX = maxX < 0 ? maxX / 2 : maxX;
			const loY = maxY < boardTop ? (boardTop + maxY) / 2 : boardTop, hiY = maxY < boardTop ? (boardTop + maxY) / 2 : maxY;
			this.camX = Math.min(hiX + roomX, Math.max(loX - roomX, this.camX));
			this.camY = Math.min(hiY + roomY, Math.max(loY - roomY, this.camY));
			return;
		}
		if (this.mission.id !== "thebridge" && this.previewPanMarginRadii <= 0) {
			const edgeHexes = 4;
			const edgeX = edgeHexes * Math.sqrt(3) * tile;
			const edgeY = edgeHexes * 1.5 * tile;
			const loX = -edgeX;
			const hiX = w + edgeX - this.viewW;
			const loY = this.boardPad(tile) - edgeY;
			const hiY = h + edgeY - this.viewH;
			this.camX = hiX < loX ? (loX + hiX) / 2 : Math.min(hiX, Math.max(loX, this.camX));
			this.camY = hiY < loY ? (loY + hiY) / 2 : Math.min(hiY, Math.max(loY, this.camY));
			const pinnedBackdrop = this.mission.id === "vau" && !this.tacticsCamera ? this.art.backdrops?.vau : void 0;
			if (pinnedBackdrop) {
				const b = vauBackdropBounds(tile, this.cols, this.viewW, this.viewH, pinnedBackdrop.width / Math.max(1, pinnedBackdrop.height));
				this.camX = Math.min(Math.max(b.left + b.width, w) - this.viewW, Math.max(Math.min(b.left, 0), this.camX));
				this.camY = Math.min(Math.max(b.top + b.height, h) - this.viewH, Math.max(Math.min(b.top, this.boardPad(tile)), this.camY));
			}
			return;
		}
		const margin = this.cameraMargin(tile);
		const naturalMaxX = w - this.viewW;
		const naturalMaxY = h - this.viewH;
		const minX = naturalMaxX < 0 ? naturalMaxX / 2 - margin.x : -margin.x;
		const minY = naturalMaxY < 0 ? naturalMaxY / 2 - margin.y : -margin.y;
		const maxX = naturalMaxX < 0 ? naturalMaxX / 2 + margin.x : naturalMaxX + margin.x;
		const maxY = naturalMaxY < 0 ? naturalMaxY / 2 + margin.y : naturalMaxY + margin.y;
		this.camX = Math.min(maxX + roomX, Math.max(minX - roomX, this.camX));
		this.camY = Math.min(maxY + roomY, Math.max(minY - roomY, this.camY));
	}
	ensureVisible(col, row) {
		const { cx, cy } = this.hexCenter(col, row);
		const tile = ZOOM_RADII[this.zoom];
		const m = 64;
		const top = this.boardPad(tile);
		if (cx < m) this.camX += cx - m;
		if (cy < top) this.camY += cy - top;
		if (cx > this.viewW - m) this.camX += cx - (this.viewW - m);
		if (cy > this.viewH - m) this.camY += cy - (this.viewH - m);
		this.clampCam();
	}
	/** Same job as ensureVisible, but for a whole spread of tiles at once — a Fireball/Caustic
	* Venom blast, an enemy's cone or line spell, anything hitting more than one hex. A single
	* ensureVisible(centroid) call still left a wide spread's outer edge off past the viewport
	* (the centroid can sit comfortably in view while the blast's far corner doesn't); this pulls
	* both the near and far corner of the affected area's bounding box in, one after the other —
	* each call sees the camera position the previous one just left, so the two corners converge
	* toward "as much of the whole spread fits as the viewport allows" rather than fighting each
	* other. A spread wider than the viewport itself still can't fully fit — no amount of panning
	* fixes that, only zooming out would — but every real spell's radius is well within one
	* screen, so this covers the actual reported case (a wide blast landing partly off-frame). */
	ensureAreaVisible(tiles) {
		if (tiles.length === 0) return;
		let minX = tiles[0].x, maxX = tiles[0].x, minY = tiles[0].y, maxY = tiles[0].y;
		for (const t of tiles) {
			if (t.x < minX) minX = t.x;
			if (t.x > maxX) maxX = t.x;
			if (t.y < minY) minY = t.y;
			if (t.y > maxY) maxY = t.y;
		}
		this.ensureVisible(minX, minY);
		this.ensureVisible(maxX, maxY);
	}
	focusPlayers() {
		const firstUnit = this.units.find((unit) => unit.side === "player" && unit.alive) ?? this.units[0];
		if (firstUnit) this.centerOn(firstUnit.x, firstUnit.y);
	}
	/** Opens an editor preview at the party's first configured starting position. */
	centerOnStartingParty() {
		this.focusPlayers();
	}
	/** Centers the camera on the board's own geometric middle, independent of any unit's
	* position — unlike focusPlayers/centerOn, which the map editor's preview panel should NOT
	* use: a spawn tucked near one edge (or no units at all yet, on a still-empty draft) would
	* otherwise leave the preview opening on a corner instead of showing the whole drafted map. */
	centerOnBoard() {
		this.centerOn((this.cols - 1) / 2, (this.rows - 1) / 2);
	}
	/** Same purpose as centerOnBoard (an editor-preview-only initial framing, independent of any
	* unit's position), but opens on the board's LEFT edge instead of its geometric middle — per
	* direct request: every map's own content starts at its left edge, and the preview centering
	* on the whole (often mostly-empty) bounding box read as opening on empty void instead.
	* centerOn(0, ...) clamps against the left margin same as any other camera move, so this
	* still leaves the small backdrop-peek margin clampCam already grants every camera. */
	centerOnBoardLeft() {
		this.centerOn(0, (this.rows - 1) / 2);
	}
	centerOn(col, row) {
		const { cx, cy } = this.hexCenter(col, row);
		this.centerOnPoint(cx, cy);
	}
	centerOnPoint(cx, cy) {
		this.camX += cx - this.viewW / 2;
		this.camY += cy - this.viewH / 2;
		this.clampCam();
	}
	/** Resolve a canvas coordinate to a board cell without changing game state. */
	cellAt(cssX, cssY) {
		const { ox, oy, tile } = this.layout;
		const sqrt3 = Math.sqrt(3);
		const x = cssX - ox - tile * sqrt3 * .5;
		const y = cssY - oy - this.boardPad(tile) - tile;
		const q = (sqrt3 / 3 * x - 1 / 3 * y) / tile;
		const r = 2 / 3 * y / tile;
		const c = cubeRound(q, r, -q - r);
		const col = c.q + (c.r - (c.r & 1)) / 2;
		const row = c.r;
		if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return null;
		return {
			x: col,
			y: row
		};
	}
	/** Finds the unit (if any) whose drawn sprite rectangle contains a canvas coordinate, not
	* just whichever single hex it's anchored to — a sprite commonly extends well beyond its own
	* hex on screen, so an exact-hex hit test alone makes some units hard to click. Used by the
	* map editor's preview to make right-click pickup work anywhere on a unit's visible art,
	* matching cellAt's own (cssX, cssY) convention. Ignores live idle wobble (sway/bob/lift):
	* the editor preview never ticks, so those sit at their rest value anyway. */
	unitSpriteAt(cssX, cssY) {
		const tile = ZOOM_RADII[this.zoom];
		const cell = tile * Math.sqrt(3);
		for (const u of this.units) {
			if (u.fade <= 0 || this.unitHidden(u)) continue;
			const { cx: px, cy: py } = this.unitPixel(u);
			const { w, h, footY, footOffset } = this.computeUnitVisual(u, cell, tile);
			if (cssX < px - w / 2 || cssX > px + w / 2) continue;
			if (cssY < py + footY - h + footOffset || cssY > py + footY + footOffset) continue;
			return u;
		}
		return null;
	}
	hexCenter(col, row) {
		const { ox, oy, tile } = this.layout;
		return {
			cx: ox + tile * Math.sqrt(3) * (col + .5 * (row & 1) + .5),
			cy: oy + this.boardPad(tile) + tile * (1.5 * row + 1)
		};
	}
	/** True when the land-shore-FX debug flag is set in this browser. Local to this class —
	* nothing else in the codebase reads or writes this key, so flipping it can only ever affect
	* the synthesized-placements block in the constructor above. */
	landShoreFxDebugEnabled() {
		if (typeof window === "undefined") return false;
		try {
			return window.localStorage.getItem("emberash:landShoreFx") === "1";
		} catch {
			return false;
		}
	}
	hexPath(ctx, cx, cy, size) {
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const a = Math.PI / 180 * (60 * i - 30);
			const x = cx + size * Math.cos(a);
			const y = cy + size * Math.sin(a);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
	}
	/** Whether a facing's own drawing exists, kicking off its load the first time it is
	* asked for. A file that 404s settles as "no" and the prop keeps the base drawing —
	* every prop starts with only its east art, so this is the normal answer, not a fault. */
	decorArtReady(file) {
		const known = this.art.decorations[file];
		if (known) return known.naturalWidth > 0;
		const img = new Image();
		img.src = decorationImage(file);
		this.art.decorations[file] = img;
		return false;
	}
	/** Multi-hex terrain props draw as one image over their whole footprint's bounding box,
	* not hex-clipped like regular tiles — they don't need to fill the exact hex shape. */
	drawDecorations(ctx, tile, cssW, cssH, layer = "ground", depthRange) {
		const SQRT3 = Math.sqrt(3);
		const orderedDecorations = this.decorations.map((p, index) => ({
			p,
			index,
			order: DECORATIONS[p.id]?.decorRenderOrder ?? 0
		})).sort((a, b) => a.order - b.order || a.index - b.index);
		for (const { p } of orderedDecorations) {
			const def = DECORATIONS[p.id];
			if (def?.model3d) continue;
			const artId = decorationPlacementArt(p);
			let img = this.art.decorations[artId];
			if ((!img || !img.naturalWidth) && def) {
				img = this.art.decorations[artId] ?? new Image();
				if (!img.src) {
					img.src = decorationImage(artId);
					decorationImageRetryWebp(img, artId);
				}
				this.art.decorations[artId] = img;
			}
			const decorLayer = def?.unitLayer ?? (def?.foreground ? "front" : "ground");
			if (!def || !img || decorLayer !== layer) continue;
			if (depthRange && layer === "ground") {
				const frontDepth = Math.max(...placedFootprint(p).map(({ dx, dy }) => this.effectAnchor(p.x + dx, p.y + dy).worldY));
				if (frontDepth <= depthRange.after || frontDepth > depthRange.through) continue;
			}
			if (this.fogged && !placedFootprint(p).some((f) => this.explored(p.x + f.dx, p.y + f.dy))) continue;
			let minDx = 0;
			let maxDx = 0;
			let minDy = 0;
			let maxDy = 0;
			let sumCx = 0;
			let sumCy = 0;
			for (const { dx, dy } of def.footprint) {
				minDx = Math.min(minDx, dx);
				maxDx = Math.max(maxDx, dx);
				minDy = Math.min(minDy, dy);
				maxDy = Math.max(maxDy, dy);
			}
			for (const { dx, dy } of placedFootprint(p)) {
				const c = this.hexCenter(p.x + dx, p.y + dy);
				sumCx += c.cx;
				sumCy += c.cy;
			}
			const n = def.footprint.length;
			const cx = sumCx / n;
			const cy = sumCy / n;
			const one = def.footprint.length === 1;
			const item = CHEST_DECOR_IDS.has(p.id);
			const tree = p.id === "dead-tree";
			const log = p.id === "fallen-log";
			const wall = p.id === "barricade";
			const waypoint = !!def.exitKind;
			const stoneStairs = p.id === "stone-stairs-up-001" || p.id === "stone-stairs-down-001";
			const house = HOUSE_DECOR_IDS.has(p.id);
			const bigHouse = BIG_HOUSE_DECOR_IDS.has(p.id);
			const anyHouse = house || bigHouse;
			const w0 = tree ? tile * 1.28 : log ? tile * SQRT3 * 2.05 : wall ? tile * 1.42 : anyHouse ? tile * 1.45 * 3 : waypoint ? tile * SQRT3 * (one ? 1 : 2) : item ? tile * .92 : one ? tile * 1.55 : tile * SQRT3 * (maxDx - minDx + 1.7);
			const baseH = tree ? tile * 2.55 : log ? tile * .82 : wall ? tile * 1.18 : anyHouse ? tile * 1.58 * 3 : waypoint ? tile * 2 : item ? tile * .72 : one ? tile * 1.65 : tile * (1.5 * (maxDy - minDy) + 2.3);
			const h0 = baseH * (def.heightScale ?? 1);
			const dy0 = waypoint ? 0 : (tree ? -tile * .55 : wall ? -tile * .12 : anyHouse ? -tile * .28 * 3 : 0) - (h0 - baseH) * .42;
			const artScale = waypoint ? 1 : (anyHouse ? HOUSE_ART_SCALE : DECOR_ART_SCALE) * (def.artScale ?? 1);
			const w = stoneStairs ? tile * SQRT3 : w0 * artScale;
			const h = stoneStairs ? tile * 3.5 : h0 * artScale;
			const dy = stoneStairs ? 0 : dy0 - h0 * (artScale - 1) / 2;
			const reach = Math.hypot(w, h) / 2;
			if (cx + reach < 0 || cx - reach > cssW || cy + dy + reach < 0 || cy + dy - reach > cssH) continue;
			const alternateMirror = !!def.mirrorAlternate && p.x >= this.cols / 2;
			const facing = decorationFacing(artId, ((p.rot ?? 0) + (alternateMirror ? 3 : 0)) % 6, (file) => this.decorArtReady(file));
			const facingMirror = facing.mirror;
			const art = facing.own ? this.art.decorations[facing.file] ?? img : img;
			const anchor = decorationAnchor(art);
			let anchorDx = (anchor ? .5 - (anchor.u0 + anchor.u1) / 2 : 0) * w + (def.artOffsetX ?? 0) * w;
			let anchorDy = anchor ? (1 - anchor.v) * h : 0;
			if (facing.step === 0) {
				if (p.mirrorX) {
					ctx.save();
					ctx.translate(cx, cy + dy);
					ctx.scale(-1, 1);
					ctx.drawImageLit(art, -w / 2 - anchorDx, -h / 2 + anchorDy, w, h);
					ctx.restore();
				} else ctx.drawImageLit(art, cx - w / 2 + anchorDx, cy - h / 2 + dy + anchorDy, w, h);
			} else if (facing.own) {
				ctx.save();
				ctx.translate(cx, cy + dy);
				if (facingMirror) {
					ctx.scale(-1, 1);
					anchorDx = -anchorDx;
				}
				ctx.translate(anchorDx, anchorDy);
				ctx.drawImageLit(art, -w / 2, -h / 2, w, h);
				ctx.restore();
			} else {
				ctx.save();
				ctx.translate(cx, cy + dy);
				ctx.rotate(facing.step * Math.PI / 3);
				ctx.translate(anchorDx, anchorDy);
				ctx.drawImageLit(art, -w / 2, -h / 2, w, h);
				ctx.restore();
			}
		}
	}
	footprintCentroid(x, y, size, footprintW, footprintOffsets) {
		const cells = size >= 4 || footprintOffsets ? footprintFrontRow({
			x,
			y,
			footprintOffsets
		}, footprintW ?? 2) : footprint({
			x,
			y,
			size
		});
		let cx = 0;
		let cy = 0;
		for (const p of cells) {
			const c = this.hexCenter(p.x, p.y);
			cx += c.cx;
			cy += c.cy;
		}
		const n = Math.max(1, cells.length);
		return {
			cx: cx / n,
			cy: cy / n
		};
	}
	/** World-space (camera-independent) equivalent of footprintCentroid — the same front-row
	* average, in the same worldX/worldY terms effectAnchor already exposes for a single hex.
	* Needed because effectAnchor only ever answers for one plain hex, which is wrong for a
	* multi-hex boss (Troll, Horror, Asherah, ...): its sprite anchors on its footprint's front
	* row, not the hex `col`/`row` happen to name — see footprintCentroid's own comment. */
	footprintCentroidWorld(x, y, size, footprintW, footprintOffsets) {
		const cells = size >= 4 || footprintOffsets ? footprintFrontRow({
			x,
			y,
			footprintOffsets
		}, footprintW ?? 2) : footprint({
			x,
			y,
			size
		});
		const { tile } = this.layout;
		const sqrt3 = Math.sqrt(3);
		let wx = 0;
		let wy = 0;
		for (const p of cells) {
			wx += tile * sqrt3 * (p.x + .5 * (p.y & 1) + .5);
			wy += this.boardPad(tile) + tile * (1.5 * p.y + 1);
		}
		const n = Math.max(1, cells.length);
		return {
			worldX: wx / n,
			worldY: wy / n
		};
	}
	/**
	* How far this unit's sprite rides above its hex, in pixels, for high ground.
	*
	* Mirrors unitPixel's interpolation instead of reading the current cell outright:
	* during a step `u.x`/`u.y` still hold the cell being left, so a unit walking onto a
	* hill would snap upward as the step ended. Easing it over the same step makes the
	* climb read as a climb.
	*
	* Reads the consolidated properties, so a prop whose `yieldsHighGround` switch is on
	* lifts a sprite exactly as a painted hill does — one answer for the bonus and for
	* the picture. Uses the anchor cell, which is the cell the combat bonus reads too.
	*/
	unitLift(u, cell) {
		const full = cell * HIGH_GROUND_LIFT;
		const liftAt = (x, y) => this.hexAt(x, y).height ? full : 0;
		if (this.active && this.active.type === "move" && this.active.id === u.id) {
			const a = this.active;
			const from = a.path[a.i];
			const to = a.path[a.i + 1];
			if (from && to) {
				const k = Math.min(1, a.t / this.moveStepDur(a));
				const A = liftAt(from.x, from.y);
				return A + (liftAt(to.x, to.y) - A) * k;
			}
		}
		return liftAt(u.x, u.y);
	}
	/** One hex step's duration — the single clock both the move stepper and every drawn
	* position (unitPixel/unitAnchor/unitLift) use, so the sprite glides at a constant speed
	* instead of dashing ahead and waiting for the step to finish. */
	moveStepDur(a) {
		const walk = this.speedMode === "fast" ? .12 : this.speedMode === "slow" ? .36 : .22;
		const ox = a && this.units.find((u) => u.id === a.id)?.classId === "bigBlueCalf";
		return (a?.charge ? walk * .5 : walk) / (ox ? BIG_BLUE_OX_PACE : 1);
	}
	unitPixel(u) {
		if (this.active && this.active.type === "move" && this.active.id === u.id) {
			const a = this.active;
			const from = a.path[a.i];
			const to = a.path[a.i + 1];
			if (from && to) {
				const k = Math.min(1, a.t / this.moveStepDur(a));
				const A = this.footprintCentroid(from.x, from.y, u.size, u.footprintW, u.footprintOffsets);
				const B = this.footprintCentroid(to.x, to.y, u.size, u.footprintW, u.footprintOffsets);
				return {
					cx: A.cx + (B.cx - A.cx) * k,
					cy: A.cy + (B.cy - A.cy) * k
				};
			}
		}
		return this.footprintCentroid(u.x, u.y, u.size, u.footprintW, u.footprintOffsets);
	}
	/** Public, world-space (camera-independent) equivalent of the private unitPixel — the anchor
	* position ThreeBattleRenderer needs for ANY unit, boss/multi-hex ones included, instead of
	* the plain single-hex position effectAnchor(u.drawX, u.drawY) gives (wrong for a footprint
	* that anchors on its front row — see footprintCentroidWorld). Mirrors unitPixel's own
	* mid-move interpolation so a boss's sprite tracks the same eased position while walking that
	* its combat hit box does. */
	unitAnchor(u) {
		if (this.active && this.active.type === "move" && this.active.id === u.id) {
			const a = this.active;
			const from = a.path[a.i];
			const to = a.path[a.i + 1];
			if (from && to) {
				const k = Math.min(1, a.t / this.moveStepDur(a));
				const A = this.footprintCentroidWorld(from.x, from.y, u.size, u.footprintW, u.footprintOffsets);
				const B = this.footprintCentroidWorld(to.x, to.y, u.size, u.footprintW, u.footprintOffsets);
				return {
					worldX: A.worldX + (B.worldX - A.worldX) * k,
					worldY: A.worldY + (B.worldY - A.worldY) * k
				};
			}
		}
		return this.footprintCentroidWorld(u.x, u.y, u.size, u.footprintW, u.footprintOffsets);
	}
	/** True while an action's visual sequence is still playing. */
	isAnimating() {
		return this.active !== null || this.queue.length > 0;
	}
	/** Walk-cycle frame for a unit mid-move, driven by how far along its path it actually is.
	*
	* Not by the global bob clock, which is what a walk cut got before and why none of them
	* played: a hex step lasts 0.22s (0.12 in fast mode) and bob runs at 0.58x for anything
	* size 4 or over, so a golem advanced barely half a frame per hex — measured, three of its
	* eight frames across three hexes, starting on whichever one bob's random spawn value
	* landed on. Tied to the path instead, every walk starts at frame 0 and runs a full loop
	* every two hexes, at the same pace for a golem as for a familiar. */
	walkFrame(u, n) {
		const a = this.active;
		if (n <= 1 || !a || a.type !== "move" || a.id !== u.id) return 0;
		const ox = u.classId === "bigBlueCalf";
		if (u.sprite === "minor-horror-001") {
			const dur = this.moveStepDur(a);
			return Math.floor((a.i * dur + Math.min(a.t, dur)) * n / MINOR_HORROR_SECONDS.walk) % n;
		}
		const dur = ox ? this.moveStepDur(a) : this.speedMode === "fast" ? .12 : this.speedMode === "slow" ? .36 : .22;
		const steps = a.i + Math.min(1, a.t / dur);
		const framesPerHex = n >= LONG_SHEET_FRAMES ? n / LONG_WALK_SECONDS * (ox ? BIG_BLUE_OX_PACE : 1) * dur : Math.min(n / 2, 6) * (u.sprite === "conjurer" || u.sprite === "malrec" ? .9 : 1);
		return Math.floor(steps * framesPerHex) % n;
	}
	/** Whether this move plays the cosmetic alternate walk (see GameArt.walks2). Decided once
	* per queued move and remembered for it, so the cycle never flips mid-walk. Visual only —
	* Math.random, never the seeded battle rng, so it can't change any gameplay roll. */
	walkAlt = /* @__PURE__ */ new WeakMap();
	walkAltFor(move) {
		let alt = this.walkAlt.get(move);
		if (alt === void 0) {
			alt = Math.random() < 1 / 3;
			this.walkAlt.set(move, alt);
		}
		return alt;
	}
	/** True while a unit that just died is still playing its death sheet (GameArt.deaths) or
	* lying still on its last frame — its fade-out waits until this is over. */
	deathSheetPlaying(u) {
		if (u.alive || u.diedAt == null || !this.art.deaths[u.sprite]) return false;
		const hitLead = u.classId !== "bigBlueCalf" && this.art.hits[u.sprite] ? HIT_ANIM_SECONDS : 0;
		const deathSeconds = u.classId === "minorHorror" ? MINOR_HORROR_SECONDS.death : DEATH_ANIM_SECONDS / (u.classId === "bigBlueCalf" ? BIG_BLUE_OX_PACE : 1);
		return this.time - u.diedAt < hitLead + deathSeconds + DEATH_HOLD_SECONDS;
	}
	idleFrame(u, n) {
		if (n <= 1) return 0;
		if (u.sprite === "neera") return Math.floor(u.bob / .098) % n;
		const moving = this.active?.type === "move" && this.active.id === u.id;
		if (u.sprite === "minor-horror-001") return Math.floor(u.bob * n / MINOR_HORROR_SECONDS.idle) % n;
		if (u.sprite === "big-blue-ox-002") return Math.floor(u.bob * (moving ? 8 * BIG_BLUE_OX_PACE : n / 5.5)) % n;
		if (u.classId === "familiar" || u.classId === "familiar2") {
			const rate = (moving ? 8 : 5.5) * (u.classId === "familiar2" ? n / 12 : 1);
			return Math.floor(u.bob * rate) % n;
		}
		if (u.classId === "wardog" || u.classId === "swampBlueCalf" || u.classId === "bigBlueCalf") {
			const rate = moving ? 4.2 : 2.6;
			return Math.floor(u.bob * rate) % n;
		}
		const base = u.classId === "horror" || u.classId === "asherah" || u.classId === "troll" || u.classId === "ancientGolem" ? 2 : u.sprite === "defaultWarrior" || u.sprite === "kaelEarly" || u.classId === "mage" || u.classId === "cultist" || u.classId === "cultistV2" || u.classId === "healer" ? 1.7 : isBossClass(u.classId) ? 1.75 : 1.85;
		const animationRate = u.sprite === "travelingMerchant" ? .45 : u.sprite === "conjurer" || u.sprite === "malrec" ? .9 : 1;
		const rate = base * (moving ? 2.2 : 1) * animationRate;
		if (moving || this.reducedMotion) return Math.floor(u.bob * rate) % n;
		const cycle = Math.max(2, n * 2 - 2);
		const pace = (n >= LONG_SHEET_FRAMES ? n / LONG_ANIM_SECONDS : cycle / 2.6) * animationRate;
		const x = Math.floor(u.bob * pace) % cycle;
		return x < n ? x : cycle - x;
	}
	/** Long sheets (see LONG_SHEET_FRAMES): stretches an attack/cast's whole clock so its
	* sheet lasts LONG_ANIM_SECONDS, the same uniform dt scaling speedMode already uses, so
	* the hit, damage and FX stay in sync with the pose — they just happen later. Never makes
	* anything faster than the chosen speedMode; returns 1 for every short sheet. */
	longSheetActionPace(a, speedScale) {
		let frames;
		let span;
		let seconds = LONG_ANIM_SECONDS;
		if (a.type === "combat") {
			if (a.stage === "fade") return 1;
			const counter = a.stage.startsWith("counter");
			if (a.held && !counter) return 1;
			if (counter && a.counterWindAt != null) return 1;
			const sprite = this.units.find((u) => u.id === (counter ? a.def : a.att))?.sprite;
			if (!sprite) return 1;
			if (sprite === "big-blue-ox-002") seconds /= BIG_BLUE_OX_PACE;
			if (sprite === "kaelFinal") seconds = KAEL_FINAL_ATTACK_SECONDS;
			if (sprite === "apparition") seconds = APPARITION_ATTACK_SECONDS;
			if (sprite === "minor-horror-001") seconds = MINOR_HORROR_SECONDS.attack;
			frames = (this.offHandStrike(a) ? this.art.attacksShort[sprite] : void 0) ?? (counter ? this.art.counters[sprite] : void 0) ?? this.art.attacks[sprite];
			span = .54;
		} else if (a.type === "spell" || a.type === "heal") {
			if (a.held) return 1;
			const sprite = this.units.find((u) => u.id === a.att)?.sprite;
			if (!sprite) return 1;
			if (sprite === "big-blue-ox-002") seconds /= BIG_BLUE_OX_PACE;
			if (sprite === "minor-horror-001") seconds = MINOR_HORROR_SECONDS.cast;
			frames = this.art.casts[sprite] ?? this.art.attacks[sprite];
			span = sprite === "conjurer" || sprite === "malrec" ? .65 : .4;
		} else return 1;
		if ((frames?.length ?? 0) < LONG_SHEET_FRAMES) return 1;
		return Math.min(1, span / speedScale / seconds);
	}
	/** After a wind-up: carry on from where it stopped (a bow's follow-through after the
	* arrow left), then hold the last frame. */
	heldFrame(a, n) {
		const played = (a.heldFrom ?? LONG_ANIM_SECONDS) + (this.time - (a.heldAt ?? this.time));
		return Math.min(n - 1, Math.floor(played / LONG_ANIM_SECONDS * n));
	}
	/** Whether a wound-up step's remaining sheet (see heldFrame) has finished playing. */
	/** Whether the current stage of this attack is struck with the off-hand dagger/katar: the
	* attacker's own off-hand attack (customDice) or a defender's off-hand counter. */
	offHandStrike(a) {
		return a.stage.startsWith("counter") ? !!a.counterCustomDice : !!a.customDice;
	}
	heldDone(a) {
		if (!a.held) return true;
		return (a.heldFrom ?? LONG_ANIM_SECONDS) + (this.time - (a.heldAt ?? this.time)) >= LONG_ANIM_SECONDS;
	}
	attackPose(u) {
		const a = this.active;
		if (!a) return null;
		if (a.type === "windup") {
			if (a.id !== u.id) return null;
			const n = (a.pose === "cast" ? this.art.casts[u.sprite] ?? this.art.attacks[u.sprite] : a.pose === "specialAttack" ? this.art.attacks2[u.sprite] ?? this.art.attacks[u.sprite] : u.classId !== "bigBlueCalf" && u.sprite !== "neera" && u.idleAlt ? this.art.attacks2[u.sprite] ?? this.art.attacks[u.sprite] : this.art.attacks[u.sprite])?.length ?? 0;
			if (n < 1) return null;
			return Math.min(n - 1, Math.floor(a.t / (u.sprite === "minor-horror-001" ? MINOR_HORROR_SECONDS.cast : LONG_ANIM_SECONDS) * n));
		}
		const pace = u.sprite === "conjurer" || u.sprite === "malrec" ? .9 : 1;
		const animationT = a.t * pace;
		if ((a.type === "spell" || a.type === "heal") && a.att === u.id) {
			const castFrames = u.sprite === "neera" && a.type === "spell" && (a.spellKind === "longShot" || a.spellKind === "bloodyShot" || a.spellKind === "multiShot" || a.spellKind === "piercing") ? this.art.attacks2[u.sprite] ?? this.art.attacks[u.sprite] : a.type === "spell" && a.spellKind === "tendrilSwipe" ? this.art.attacks[u.sprite] : this.art.casts[u.sprite] ?? this.art.attacks[u.sprite];
			if (!castFrames || castFrames.length < 3) return null;
			const n = castFrames.length;
			if (a.held && u.sprite === "familiar3" && this.heldDone(a)) return null;
			if (a.held) return this.heldFrame(a, n);
			if (n === 4) {
				if (animationT < .12) return 0;
				if (animationT < .22) return 1;
				if (animationT < .4) return 2;
				return 3;
			}
			const castDuration = u.sprite === "conjurer" || u.sprite === "malrec" ? .65 : .4;
			return Math.min(n - 1, Math.floor(Math.min(.99, animationT / castDuration) * n));
		}
		if (a.type === "combat") {
			if (a.spellKind === "bullRush" && u.classId !== "bigBlueCalf") return null;
			const counter = a.stage.startsWith("counter");
			const actor = counter ? a.def : a.att;
			if (u.id !== actor) return null;
			const attackPool = u.classId === "bigBlueCalf" ? a.spellKind === "bullRush" && !counter ? this.art.attacks2[u.sprite] ?? this.art.attacks[u.sprite] : this.art.attacks[u.sprite] : u.sprite !== "neera" && u.idleAlt ? this.art.attacks2[u.sprite] ?? this.art.attacks[u.sprite] : this.art.attacks[u.sprite];
			const frames = (this.offHandStrike(a) ? this.art.attacksShort[u.sprite] : void 0) ?? (counter ? this.art.counters[u.sprite] : void 0) ?? attackPool;
			if (!frames || frames.length < 4) return null;
			const n = frames.length;
			if (a.held && !counter) return this.heldFrame(a, n);
			if (counter && a.counterWindAt != null) return Math.min(n - 1, Math.floor((this.time - a.counterWindAt) / LONG_ANIM_SECONDS * n));
			const long = n >= 12;
			const lungeDur = .2 * pace;
			const hitDur = .18 * pace;
			const recoverDur = .16 * pace;
			if (long) {
				const lungeN = Math.max(2, Math.round(n * .5));
				const hitN = Math.max(2, Math.round(n * .25));
				const hitStart = lungeN;
				const recoverStart = Math.min(n - 1, hitStart + hitN);
				if (a.stage === "lunge" || a.stage === "counterLunge") return Math.min(lungeN - 1, Math.floor(animationT / lungeDur * lungeN));
				if (a.stage === "hit" || a.stage === "counterHit") return Math.min(recoverStart - 1, hitStart + Math.floor(animationT / hitDur * hitN));
				if (a.stage === "recover" || a.stage === "counterRecover") return Math.min(n - 1, recoverStart + Math.floor(animationT / recoverDur * (n - recoverStart)));
				return n - 1;
			}
			const lungeEnd = Math.max(1, Math.round((n - 1) * .35));
			const hitEnd = Math.max(lungeEnd + 1, Math.round((n - 1) * .6));
			const span = (from, to, prog) => Math.min(to, from + Math.floor(Math.max(0, Math.min(.999, prog)) * (to - from + 1)));
			if (a.stage === "lunge" || a.stage === "counterLunge") return span(0, lungeEnd, animationT / lungeDur);
			if (a.stage === "hit" || a.stage === "counterHit") return span(lungeEnd + 1, hitEnd, animationT / hitDur);
			if (a.stage === "recover" || a.stage === "counterRecover") return span(hitEnd + 1, n - 1, animationT / recoverDur);
			return n - 1;
		}
		return null;
	}
	liveMotion(u, cell) {
		if (!u.alive || this.reducedMotion) return {
			bob: 0,
			sway: 0,
			breath: 0
		};
		const t = u.bob;
		if (u.classId === "familiar" || u.classId === "familiar2") return {
			bob: Math.sin(t * 1.6) * 2.4,
			sway: Math.sin(t * .9) * .7,
			breath: .02 + Math.sin(t * 1.6) * .02
		};
		if (u.classId === "wardog" || u.classId === "swampBlueCalf" || u.classId === "bigBlueCalf") return {
			bob: Math.sin(t * 2.2) * 1.15,
			sway: 0,
			breath: .014 + Math.sin(t * 2.2) * .018
		};
		const heavy = u.size >= 4 ? 1.4 : u.size === 2 ? 1.12 : 1;
		if (u.sprite === "defaultWarrior" || u.sprite === "kaelEarly" || u.sprite === "aldric" || u.sprite === "defaultLancer" || u.sprite === "lancer" || u.sprite === "sandoval" || u.sprite === "conjurer" || u.sprite === "malrec" || u.size >= 4) return {
			bob: 0,
			sway: 0,
			breath: 0
		};
		return {
			bob: Math.sin(t * 1.55) * (1.15 * heavy),
			sway: Math.sin(t * .85 + .3) * (cell * .008 * heavy),
			breath: .012 + Math.sin(t * 1.55) * .014
		};
	}
	/** Every property of a unit's current animated pose — pose selection (idle/walk/atk/cast/
	* counter), the size/scale corrections tied to whichever pose that turns out to be, and the
	* live idle-motion (bob/sway/breath) and high-ground lift on top — computed once here so
	* renderUnitsAndOverlays and ThreeBattleRenderer (via the public unitVisual() wrapper below)
	* can never drift apart into two separate copies of this logic. Ported verbatim from what
	* used to be inlined in renderUnitsAndOverlays's own per-unit loop; see that method's history
	* for the reasoning behind each individual correction. */
	computeUnitVisual(u, cell, tile) {
		this.applyHeading(u);
		if (!this.art.sprites[u.sprite]) requestSpriteArt(this.art, u.sprite);
		const s = u.classId === "undeadOx" ? 2 : unitSize(u);
		const boss = isBossClass(u.classId);
		const { bob, sway, breath } = this.liveMotion(u, cell);
		const lift = this.unitLift(u, cell);
		const atk = this.attackPose(u);
		const moving = this.active?.type === "move" && this.active.id === u.id;
		const idlePool = u.idleAlt ? this.art.idles2[u.sprite] ?? this.art.idles[u.sprite] : this.art.idles[u.sprite];
		const idle = !atk && !moving ? idlePool : void 0;
		const faceRight = u.facing === 1;
		const useWalkLeft = u.sprite === "lancer" ? faceRight : !faceRight;
		const sideWalkPool = moving && !!this.art.walks2[u.sprite] && this.walkAltFor(this.active) ? useWalkLeft ? this.art.walksLeft2[u.sprite] ?? this.art.walks2[u.sprite] : this.art.walks2[u.sprite] : useWalkLeft ? this.art.walksLeft[u.sprite] ?? this.art.walks[u.sprite] : this.art.walks[u.sprite];
		const walkPool = (u.walkPose === "back" ? this.art.walksUp[u.sprite] : u.walkPose === "front" ? this.art.walksDown[u.sprite] : void 0) ?? sideWalkPool;
		const oxRush = u.classId === "bigBlueCalf" && this.active?.type === "combat" && this.active.spellKind === "bullRush" && this.active.att === u.id && !this.active.stage.startsWith("counter");
		const neeraArrowSkill = u.sprite === "neera" && (this.active?.type === "spell" && this.active.att === u.id && (this.active.spellKind === "longShot" || this.active.spellKind === "bloodyShot" || this.active.spellKind === "multiShot" || this.active.spellKind === "piercing") || this.active?.type === "windup" && this.active.id === u.id && this.active.pose === "specialAttack");
		const atkBase = neeraArrowSkill ? this.art.attacks2[u.sprite] ?? this.art.attacks[u.sprite] : u.classId === "bigBlueCalf" ? oxRush ? this.art.attacks2[u.sprite] ?? this.art.attacks[u.sprite] : this.art.attacks[u.sprite] : u.sprite !== "neera" && u.idleAlt ? this.art.attacks2[u.sprite] ?? this.art.attacks[u.sprite] : this.art.attacks[u.sprite];
		const atkPool = (this.active?.type === "combat" && (this.active.stage.startsWith("counter") ? this.active.def : this.active.att) === u.id && this.offHandStrike(this.active) ? this.art.attacksShort[u.sprite] : void 0) ?? (faceRight ? atkBase : neeraArrowSkill ? this.art.attacks2Left[u.sprite] ?? atkBase : this.art.attacksLeft[u.sprite] ?? atkBase);
		const walk = atk == null && moving ? walkPool : void 0;
		const casting = this.active && ((this.active.type === "spell" || this.active.type === "heal") && this.active.att === u.id && !(this.active.type === "spell" && this.active.spellKind === "tendrilSwipe") || this.active.type === "windup" && (this.active.pose === "cast" || this.active.pose === "specialAttack") && this.active.id === u.id);
		const castPool = neeraArrowSkill ? faceRight ? this.art.attacks2[u.sprite] : this.art.attacks2Left[u.sprite] ?? this.art.attacks2[u.sprite] : faceRight ? this.art.casts[u.sprite] : this.art.castsLeft[u.sprite] ?? this.art.casts[u.sprite];
		const countering = this.active?.type === "combat" && this.active.stage.startsWith("counter") && this.active.def === u.id;
		const counterPool = faceRight ? this.art.counters[u.sprite] : this.art.countersLeft[u.sprite] ?? this.art.counters[u.sprite];
		const hitPool = this.hitPoolFor(u);
		const oxPosePace = u.classId === "bigBlueCalf" ? BIG_BLUE_OX_PACE : 1;
		const hitSeconds = HIT_ANIM_SECONDS / oxPosePace * (u.classId === "bigBlueCalf" ? 75 / 83 : 1);
		const deathSeconds = u.classId === "minorHorror" ? MINOR_HORROR_SECONDS.death : DEATH_ANIM_SECONDS / oxPosePace;
		const sinceHit = hitPool && u.hitAt != null ? this.time - u.hitAt : Infinity;
		const directOxDeath = u.classId === "bigBlueCalf" && !u.alive && this.art.deaths[u.sprite] != null;
		const hitPlaying = !directOxDeath && sinceHit < hitSeconds && (!u.alive || atk == null && !moving);
		const deathPool = !hitPlaying && !u.alive && u.diedAt != null ? (u.deathAlt ? this.art.deaths2[u.sprite] : void 0) ?? this.art.deaths[u.sprite] : void 0;
		const deathT = u.diedAt != null ? this.time - u.diedAt - (hitPool && !directOxDeath ? HIT_ANIM_SECONDS : 0) : 0;
		const frames = hitPlaying ? hitPool : deathPool ?? (atk != null ? casting ? castPool ?? atkPool : countering ? counterPool ?? atkPool : atkPool : walk ?? idle ?? this.art.sprites[u.sprite]);
		const n = frames?.length ?? 0;
		const fi = hitPlaying ? Math.min(n - 1, Math.floor(sinceHit / hitSeconds * n)) : deathPool ? Math.min(n - 1, Math.max(0, Math.floor(deathT / deathSeconds * n))) : atk != null ? atk : walk ? this.walkFrame(u, n) : this.idleFrame(u, n || 4);
		const walkDirs = moving ? this.art.walkDirs[u.sprite] : void 0;
		const img = (walkDirs ? walkDirs[u.walkPose] : void 0) ?? frames?.[fi] ?? frames?.[0];
		const isBigCreatureFootprint = u.footprintOffsets === FOOTPRINT_TYPE_8 || u.footprintOffsets === FOOTPRINT_TYPE_7;
		const isLancer = u.classId === "lancer" || u.sprite === "lancer" || u.sprite === "defaultLancer";
		const isSandoval = u.classId === "sandoval" || u.sprite === "sandoval";
		const isFamiliar = u.classId === "familiar" || u.sprite === "familiar";
		const isKaelFinal = u.sprite === "kaelFinal";
		const isCultistV2 = u.classId === "cultistV2" || u.sprite === "cultist-v2";
		const isNeera = u.sprite === "neera";
		const isSoldier = u.sprite === "soldier";
		const spriteScale = isLancer ? 1.4 : isSandoval ? 1.2 : isFamiliar ? .5 : isKaelFinal ? .9 : isCultistV2 ? .98 : isNeera ? .9 : isSoldier ? .9 : 1;
		const familiar2WidthMul = u.sprite === "familiar2" ? 2.544 : 1;
		const familiar2WalkScale = u.sprite === "familiar2" && walk ? .97 : 1;
		const isCultistV2Casting = isCultistV2 && casting;
		const cultistV2CastHeightMul = isCultistV2Casting ? 1.24 : 1;
		const cultistV2CastWidthMul = isCultistV2Casting ? 1.06 : 1;
		const cultistV2AtkScale = isCultistV2 && atk != null && !isCultistV2Casting ? 1.13 : 1;
		const malrecWalkHeightScale = u.sprite === "malrec" && walk ? .948 : 1;
		const malrecWalkWidthScale = u.sprite === "malrec" && walk ? .689 : 1;
		const isMalrecAttacking = u.sprite === "malrec" && atk != null && !casting;
		const malrecAtkScale = isMalrecAttacking ? 1.113 : 1;
		const malrecAtkFrame27WidthScale = isMalrecAttacking && fi === 26 ? 1.49 : 1;
		const cultistV2WalkScale = isCultistV2 && walk ? 1.02 : 1;
		const isKaelFinalAttacking = isKaelFinal && atk != null;
		const kaelFinalAtkScale = isKaelFinalAttacking ? 1.135 : 1;
		const isNeeraCasting = isNeera && casting;
		const isNeeraAttacking = isNeera && atk != null && !isNeeraCasting;
		const neeraAtkScale = isNeeraAttacking ? 1.14 : 1;
		const neeraCastScale = isNeeraCasting ? 1.18 : 1;
		const familiar3Scale = u.classId === "familiar3" ? 1.4 : 1;
		const familiar3WidthScale = u.classId === "familiar3" ? 1.9 : 1;
		const birolhoLegsHeightScale = u.sprite === "BirolhoLegs" ? 1.32 : u.sprite === "BirolhoLegs2" ? 1.29 : 1;
		const birolhoLegsWidthScale = u.sprite === "BirolhoLegs" ? 2.17 : u.sprite === "BirolhoLegs2" ? 2.75 : 1;
		const troll2HeightScale = u.sprite === "troll2" ? 1.03 : 1;
		const troll2WidthScale = u.sprite === "troll2" ? 1.59 : 1;
		const wardog2HeightScale = u.sprite === "wardog2" ? .896 : 1;
		const wardog2WidthScale = u.sprite === "wardog2" ? 1.372 : 1;
		const wraithWidthScale = u.sprite === "minor-horror-001" ? 1.163 : u.sprite === "EmberedWraith" ? 1.037 : 1;
		const zombieDogHeightScale = u.sprite === "zombieDog" ? 1.051 : 1;
		const zombieDogWidthScale = u.sprite === "zombieDog" ? 1.33 : 1;
		const zombieDogWideSheetScale = u.sprite === "zombieDog" && (hitPlaying || !!deathPool && deathPool === this.art.deaths[u.sprite]) ? 528 / 437 : 1;
		const roccoHeightScale = u.sprite === "RoccoTheBird" ? 1.22 : 1;
		const roccoWidthScale = u.sprite === "RoccoTheBird" ? 2.55 : 1;
		const plantHeightScale = u.sprite === "carnivorous-plant-001" ? 1.03 : 1;
		const plantWidthScale = u.sprite === "carnivorous-plant-001" ? 2.15 : 1;
		const saplingHeightScale = u.sprite === "sapling-001" ? .582 : 1;
		const saplingWidthScale = u.sprite === "sapling-001" ? 1.264 : 1;
		const familiar4HeightScale = u.sprite === "familiar4" ? .97 : 1;
		const familiar4WidthScale = u.sprite === "familiar4" ? 2.61 : 1;
		const wolfFinalWidthScale = u.sprite === "mordavian-wolf-final" ? 1.395 : 1;
		const zombieWidthScale = u.sprite === "zombie" ? 1.705 : u.sprite === "zombie2" ? 1.085 : 1;
		const undeadOxScale = u.classId === "undeadOx" ? .94875 : 1;
		const undeadOxHeightScale = (u.sprite === "big-blue-ox-002" ? .85 : u.sprite === "undeadOx" || u.sprite === "plague-bearing-cattle" ? 1.283 : 1) * undeadOxScale;
		const undeadOxWidthScale = (u.sprite === "big-blue-ox-002" ? 1.49 : u.sprite === "undeadOx" || u.sprite === "plague-bearing-cattle" ? 1.889 : 1) * undeadOxScale;
		let h = cell * (s >= 4 ? 3.35 : s === 2 ? 1.72 : boss ? 1.44 : 1.42) * 1.2 * (isBigCreatureFootprint ? .75 : 1) * spriteScale * cultistV2CastHeightMul * cultistV2AtkScale * malrecWalkHeightScale * malrecAtkScale * cultistV2WalkScale * familiar3Scale * familiar2WalkScale * birolhoLegsHeightScale * troll2HeightScale * wardog2HeightScale * zombieDogHeightScale * undeadOxHeightScale * roccoHeightScale * plantHeightScale * saplingHeightScale * familiar4HeightScale * kaelFinalAtkScale * neeraAtkScale * neeraCastScale;
		let w = cell * (s >= 4 ? 2.85 : s === 2 ? 1.85 : boss ? 1.12 : 1.11) * 1.2 * (isBigCreatureFootprint ? .75 : 1) * spriteScale * familiar2WidthMul * familiar2WalkScale * cultistV2CastWidthMul * cultistV2AtkScale * malrecWalkWidthScale * malrecAtkScale * malrecAtkFrame27WidthScale * cultistV2WalkScale * familiar3Scale * familiar3WidthScale * birolhoLegsWidthScale * troll2WidthScale * wardog2WidthScale * wraithWidthScale * zombieDogWidthScale * zombieDogWideSheetScale * roccoWidthScale * plantWidthScale * saplingWidthScale * familiar4WidthScale * wolfFinalWidthScale * zombieWidthScale * undeadOxWidthScale * kaelFinalAtkScale * neeraAtkScale * neeraCastScale;
		const neeraV2Sheet = img?.src.includes("/neera-v2-001/") ? img.src.match(/\/(idle|atk2|atk-short|atk|move)-(?:left-)?\d+\.png/)?.[1] : void 0;
		if (neeraV2Sheet && img) {
			const worldPerPixel = cell * 1.53 / {
				idle: 800,
				atk: 672,
				atk2: 755,
				"atk-short": 675,
				move: 471
			}[neeraV2Sheet];
			h = img.naturalHeight * worldPerPixel;
			w = img.naturalWidth * worldPerPixel;
		}
		const isMiliciaV2 = u.sprite === "militia-v2";
		const miliciaV2PerPixel = cell * 1.53 / 628;
		if (isMiliciaV2 && img) {
			h = img.naturalHeight * miliciaV2PerPixel;
			w = img.naturalWidth * miliciaV2PerPixel;
		}
		const apparitionPerPixel = cell * 1.53 / 597;
		if (u.sprite === "apparition" && img) {
			h = img.naturalHeight * apparitionPerPixel;
			w = img.naturalWidth * apparitionPerPixel;
		}
		const footOffset = neeraV2Sheet ? 0 : isMiliciaV2 ? 61 * miliciaV2PerPixel : u.sprite === "apparition" ? 34 * apparitionPerPixel : isCultistV2Casting ? h * .127 : isKaelFinalAttacking ? h * .025 : isNeeraAttacking ? h * .042 : isNeeraCasting ? h * .045 : u.sprite === "familiar2" ? h * .028 : 0;
		const footY = s >= 4 ? tile * .9 : cell * .42;
		const dirActionWalk = (u.sprite === "aldric" || u.sprite === "defaultLancer" || u.sprite === "lancer" || u.sprite === "sandoval" || u.sprite === "theButcher" || u.sprite === "familiar2" || u.sprite === "familiar3" || u.sprite === "cultist-v2" || u.sprite === "militia-v2" || u.sprite === "cobalt-blue-deer" || u.sprite === "neera") && moving;
		const dirActionAttack = atk != null && !!frames && (frames === this.art.attacksLeft[u.sprite] || frames === this.art.attacks2Left[u.sprite] || frames === this.art.castsLeft[u.sprite] || frames === this.art.countersLeft[u.sprite]);
		const dirAction = dirActionWalk || dirActionAttack;
		const defaultWarriorIdleOrWalkReversed = u.sprite === "defaultWarrior" && atk == null;
		const neeraWalkReversed = u.sprite === "neera" && atk == null && moving;
		const deerFacingReversed = u.sprite === "cobalt-blue-deer";
		const kaelFinalIdleReversed = u.sprite === "kaelFinal" && atk == null && walk == null;
		const facing = u.classId === "familiar" || defaultWarriorIdleOrWalkReversed || neeraWalkReversed || deerFacingReversed || kaelFinalIdleReversed ? -u.facing : u.facing;
		const flip = dirAction ? 1 : facing;
		const noBreathScale = !!neeraV2Sheet || u.sprite === "defaultWarrior" || u.sprite === "kaelEarly" || u.sprite === "aldric" || u.sprite === "defaultLancer" || u.sprite === "lancer" || u.sprite === "sandoval" || u.sprite === "conjurer" || u.sprite === "malrec";
		const scaleX = noBreathScale ? flip : flip * (1 - breath * .22);
		const scaleY = noBreathScale ? 1 : 1 + breath;
		return {
			img,
			w,
			h,
			footY,
			bob,
			sway,
			breath,
			lift,
			scaleX,
			scaleY,
			footOffset
		};
	}
	/** The hit sheet for the hit being played. A sprite with a second hit sheet (GameArt.hits2,
	* e.g. the Apparition) cycles them per hit taken: hit, hit, hit2, hit, hit, hit2, ... Each new
	* hitAt counts once, however many times a frame reads it. */
	hitPoolFor(u) {
		const second = this.art.hits2[u.sprite];
		if (!second || u.hitAt == null) return this.art.hits[u.sprite];
		let seen = this.hitSheetCounts.get(u);
		if (!seen) this.hitSheetCounts.set(u, seen = {
			hitAt: u.hitAt,
			count: 1
		});
		else if (seen.hitAt !== u.hitAt) {
			seen.hitAt = u.hitAt;
			seen.count += 1;
		}
		return seen.count % 3 === 0 ? second : this.art.hits[u.sprite];
	}
	/** Public wrapper around computeUnitVisual — ThreeBattleRenderer calls this every frame to
	* animate its own unit meshes (walk/attack/cast/counter poses, live idle motion) instead of
	* only ever showing a static idle frame, using the exact same pose/size logic
	* renderUnitsAndOverlays draws with on the Canvas2D-shim canvas. `tile` is the same
	* `ZOOM_RADII[this.zoom]` value render()/renderUnitsAndOverlays already key off. */
	unitVisual(u, tile) {
		return this.computeUnitVisual(u, tile * Math.sqrt(3), tile);
	}
	/** Persistent visual-code status FX: it tracks a unit, loops with engine time,
	* and needs no image, texture, or background. */
	drawStatusFx(ctx, u, w, h) {
		if (!u.poisoned && !u.diseased) return;
		const layer = (poison) => {
			const core = poison ? "105,238,116" : "176,92,246";
			const dark = poison ? "24,112,63" : "78,34,126";
			const speed = poison ? .72 : .48;
			const seed = (u.x * 1.73 + u.y * 2.41 + u.id.length * .37) % (Math.PI * 2);
			ctx.save();
			ctx.globalCompositeOperation = "lighter";
			const pulse = .58 + Math.sin(this.time * (poison ? 3.8 : 2.5) + seed) * .16;
			const haze = ctx.createRadialGradient(0, -h * .18, 0, 0, -h * .18, w * .48);
			haze.addColorStop(0, `rgba(${core},${.12 * pulse})`);
			haze.addColorStop(.55, `rgba(${dark},${.055 * pulse})`);
			haze.addColorStop(1, `rgba(${dark},0)`);
			ctx.fillStyle = haze;
			ctx.beginPath();
			ctx.ellipse(0, -h * .18, w * .48, h * .18, 0, 0, Math.PI * 2);
			ctx.fill();
			for (let i = 0; i < 8; i += 1) {
				const rise = (this.time * speed + i * .137 + seed * .11) % 1;
				const wave = this.time * (1.8 + i % 3 * .21) + i * 2.37 + seed;
				const x = Math.sin(wave) * w * (.13 + i % 4 * .042);
				const y = -h * (.1 + rise * .72);
				const r = Math.max(1.2, w * (i % 3 === 0 ? .035 : .022));
				const alpha = (.18 + (1 - rise) * .38) * (poison ? 1 : .82);
				ctx.shadowColor = `rgba(${core},${alpha})`;
				ctx.shadowBlur = r * 3.2;
				ctx.fillStyle = `rgba(${core},${alpha})`;
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.lineCap = "round";
			for (let side = -1; side <= 1; side += 2) {
				ctx.strokeStyle = `rgba(${core},${poison ? .3 : .22})`;
				ctx.shadowColor = `rgba(${core},0.42)`;
				ctx.shadowBlur = w * .08;
				ctx.lineWidth = Math.max(1, w * .017);
				ctx.beginPath();
				for (let step = 0; step <= 5; step += 1) {
					const p = step / 5;
					const y = -h * (.08 + p * .64);
					const x = side * w * (.1 + Math.sin(this.time * (poison ? 2.2 : 1.45) + p * 7 + seed) * .1);
					if (step === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.stroke();
			}
			ctx.restore();
		};
		if (u.poisoned) layer(true);
		if (u.diseased) layer(false);
	}
	/** Draws a complete frame: ground then units/overlays, on one canvas — everything below
	* still works exactly as before. A caller that needs units/HP-bars on a visually separate
	* layer from the ground (see BattleCanvas's WebGL elemental-FX overlay, which needs to
	* insert itself between the two) calls renderGround and renderUnitsAndOverlays directly
	* instead of this. */
	render(ctx, cssW, cssH, dpr) {
		this.renderGround(ctx, cssW, cssH, dpr);
		this.renderUnitsAndOverlays(ctx, cssW, cssH);
	}
	/** Tiles, decorations, terrain-rule overlays (walk/attack/spell range highlights, the
	* active-turn glow, the hover cursor) — everything at or below "ground level". Opens this
	* frame's screen-shake transform but does not close it here (see renderUnitsAndOverlays). */
	/** Advances camera/visibility bookkeeping for this frame WITHOUT drawing anything — the
	* non-drawing prefix renderGround always ran, factored out so an alternate renderer (see
	* gfx/three/ThreeBattleRenderer.ts) can keep `layout`/visibility/camera state in sync without
	* going through the Canvas2D-shim draw path. renderGround calls this too, so its own
	* behavior is byte-for-byte unchanged. Returns the current zoom level's tile size, since
	* every caller needs it right after anyway. */
	updateCameraLayout(cssW, cssH) {
		const tile = ZOOM_RADII[this.zoom];
		if (cssW < 64 || cssH < 64) return tile;
		this.refreshVisibility();
		this.viewW = cssW;
		this.viewH = cssH;
		if (!this.camReady) {
			this.layout = {
				ox: 0,
				oy: 0,
				tile,
				cols: this.cols,
				rows: this.rows
			};
			this.camX = 0;
			this.camY = 0;
			this.camReady = true;
			this.focusPlayers();
		}
		this.clampCam();
		const ox = -this.camX;
		const oy = -this.camY;
		this.layout = {
			ox,
			oy,
			tile,
			cols: this.cols,
			rows: this.rows
		};
		const shake = this.reducedMotion ? 0 : this.trauma * this.trauma;
		if (shake) {
			this.frameShakeDx = (Math.random() - .5) * 10 * shake;
			this.frameShakeDy = (Math.random() - .5) * 10 * shake;
		} else {
			this.frameShakeDx = 0;
			this.frameShakeDy = 0;
		}
		return tile;
	}
	renderGround(ctx, cssW, cssH, dpr) {
		const tile = this.updateCameraLayout(cssW, cssH);
		const { w: boardW, h: boardH } = this.boardSize(tile);
		const { ox, oy } = this.layout;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, cssW, cssH);
		const backdrop = this.art.backdrops[this.mission.id];
		if (backdrop) {
			const ir = backdrop.width / Math.max(1, backdrop.height);
			const cr = cssW / Math.max(1, cssH);
			let dw;
			let dh;
			if (ir > cr) {
				dh = cssH;
				dw = cssH * ir;
			} else {
				dw = cssW;
				dh = cssW / ir;
			}
			ctx.drawImage(backdrop, (cssW - dw) / 2, (cssH - dh) / 2, dw, dh);
			ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
			ctx.fillRect(0, 0, cssW, cssH);
		} else {
			ctx.fillStyle = "#000000";
			ctx.fillRect(0, 0, cssW, cssH);
		}
		const shake = this.frameShakeDx !== 0 || this.frameShakeDy !== 0;
		if (shake) {
			ctx.save();
			ctx.translate(this.frameShakeDx, this.frameShakeDy);
		}
		const floorRects = mapFloorRects(this.tiles, this.cols, this.rows, this.decorations);
		const squareBorder = hasSquareMapBorder(this.tiles, this.cols, this.rows);
		const floorOrigin = this.hexCenter(0, 0);
		for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) {
			const cx = floorOrigin.cx + (x + (squareBorder ? 0 : (y & 1) * .5)) * Math.sqrt(3) * tile;
			const cy = floorOrigin.cy + y * 1.5 * tile;
			if (cx < -tile * 2 || cy < -tile * 2 || cx > cssW + tile * 2 || cy > cssH + tile * 2) continue;
			if (!this.explored(x, y)) continue;
			const drawId = tileAt(this.tiles, this.cols, x, y);
			if (drawId === "void") continue;
			const isWaterFx = this.waterFxTileKeys.has(y * this.cols + x);
			ctx.save();
			const floorRect = floorRects.get(y * this.cols + x);
			if (!floorRect) {
				ctx.restore();
				continue;
			}
			ctx.beginPath();
			if (!squareBorder) this.hexPath(ctx, cx, cy, tile);
			else for (const part of floorRectParts(floorRect)) ctx.rect(floorOrigin.cx - Math.sqrt(3) * tile / 2 + part.minX * tile, floorOrigin.cy - .75 * tile + part.minY * tile, (part.maxX - part.minX) * tile, (part.maxY - part.minY) * tile);
			ctx.clip();
			if (!this.visible(x, y)) ctx.globalAlpha = .38;
			if (isWaterFx) {
				ctx.fillStyle = "#0c2230";
				ctx.fill();
			} else {
				const variants = this.art.tiles[drawId];
				const variant = this.tileVariants[y * this.cols + x] ?? 0;
				const img = variants[variant] ?? variants[0];
				const rot = this.tileRots[y * this.cols + x] ?? 0;
				const continuousGround = isHexGroundVariant(drawId, variant);
				if (rot && !continuousGround) {
					ctx.translate(cx, cy);
					ctx.rotate(rot * Math.PI / 3);
					ctx.translate(-cx, -cy);
				}
				if (img && continuousGround) drawHexGround(ctx, img, cx, cy, cx - this.layout.ox, cy - this.layout.oy, tile);
				else if (img) drawGroundTexture(ctx, img, cx - tile, cy - tile, tile * 2, tile * 2);
				else {
					ctx.fillStyle = "#1e1b18";
					ctx.fill();
				}
			}
			ctx.restore();
		}
		for (const zone of this.webZones) {
			if (zone.createdAt != null && this.time < zone.createdAt + .85) continue;
			for (const k of zone.cells) {
				const comma = k.indexOf(",");
				const wx = Number(k.slice(0, comma));
				const wy = Number(k.slice(comma + 1));
				if (!Number.isFinite(wx) || !Number.isFinite(wy) || !this.explored(wx, wy)) continue;
				const { cx, cy } = this.hexCenter(wx, wy);
				if (cx < -tile * 2 || cy < -tile * 2 || cx > cssW + tile * 2 || cy > cssH + tile * 2) continue;
				ctx.save();
				this.hexPath(ctx, cx, cy, tile * 1);
				ctx.clip();
				if (!this.visible(wx, wy)) ctx.globalAlpha = .38;
				ctx.drawImage(this.art.webfloor, cx - tile, cy - tile, tile * 2, tile * 2);
				ctx.restore();
			}
		}
		if (shake) ctx.restore();
		this.renderBoardOverlays(ctx, cssW, cssH);
	}
	/** Canvas2D drawing for the movement/attack/spell-range highlight + active-turn ring — used
	* by the legacy `?renderer=legacy` path only (via renderGround's call site below). Split out
	* of renderGround as its own method because it used to be that function's inlined tail end,
	* and the actual cell/color decisions now live in boardOverlayLayers/activeTurnHighlight so
	* ThreeBattleRenderer can render the same highlight as real world-space geometry instead
	* (see ThreeBattleRenderer.syncOverlay) — this method is just the Canvas2D fill+glow+stroke
	* treatment on top of that shared data. */
	renderBoardOverlays(ctx, cssW, cssH) {
		const { tile } = this.layout;
		const shake = this.frameShakeDx !== 0 || this.frameShakeDy !== 0;
		if (shake) {
			ctx.save();
			ctx.translate(this.frameShakeDx, this.frameShakeDy);
		}
		const drawLayer = (cells, fill, glow) => {
			const style = tacticalGridStyleQuiet(fill);
			ctx.save();
			ctx.globalAlpha = fill === "rgba(112,174,220,0.5)" ? this.overlayFade : 1;
			ctx.shadowColor = fill === "rgba(110,0,8,0.85)" ? GRID_ENEMY_GLOW : style.edge;
			ctx.shadowBlur = 0;
			ctx.fillStyle = style.fill;
			ctx.strokeStyle = style.edge;
			ctx.lineWidth = Math.max(1, tile * .025);
			for (const c of cells) {
				const { cx, cy } = this.hexCenter(c.x, c.y);
				this.hexPath(ctx, cx, cy, tile);
				ctx.fill();
				if (fill === "rgba(112,174,220,0.5)" || fill === "rgba(110,0,8,0.85)" || fill === "rgba(245,166,74,0.9)") {
					this.hexPath(ctx, cx, cy, tile * .94);
					ctx.stroke();
				}
			}
			ctx.restore();
		};
		ctx.save();
		for (const layer of this.boardOverlayLayers()) drawLayer(layer.cells, layer.fill, layer.glow);
		ctx.restore();
		const route = this.movementPreview();
		ctx.save();
		ctx.shadowBlur = 0;
		ctx.globalAlpha = 1;
		route.forEach((c, i) => {
			const { cx, cy } = this.hexCenter(c.x, c.y);
			this.hexPath(ctx, cx, cy, tile * (i === route.length - 1 ? .94 : .12));
			ctx.fillStyle = i === route.length - 1 ? "rgba(220,226,235,0.1)" : GRID_ROUTE;
			ctx.strokeStyle = "rgba(8,12,16,0.95)";
			ctx.lineWidth = Math.max(4, tile * .1);
			ctx.fill();
			ctx.stroke();
			ctx.strokeStyle = GRID_ROUTE;
			ctx.shadowColor = GRID_ROUTE;
			ctx.shadowBlur = tile * .08;
			ctx.lineWidth = Math.max(2, tile * .045);
			ctx.stroke();
			ctx.shadowBlur = 0;
		});
		ctx.restore();
		const marker = this.activeTurnHighlight();
		if (marker) {
			const { cx, cy } = this.hexCenter(marker.x, marker.y);
			ctx.save();
			ctx.shadowBlur = 0;
			ctx.strokeStyle = "rgba(12,20,25,0.85)";
			ctx.lineWidth = Math.max(4, tile * .11);
			this.hexPath(ctx, cx, cy, tile * .94);
			ctx.stroke();
			ctx.strokeStyle = marker.player ? "rgba(220,226,235,0.32)" : marker.fill;
			ctx.shadowColor = marker.fill;
			ctx.shadowBlur = marker.player ? tile * .035 : 0;
			ctx.lineWidth = Math.max(2, tile * .055);
			ctx.stroke();
			ctx.restore();
		}
		if (shake) ctx.restore();
	}
	/** Pure data: which cells are highlighted right now (walkable range, attack range, an aimed
	* spell/AoE, an aura zone, the idle threat preview, ...) and what color each group gets —
	* every `overlay(cells, fill, glow)` call that used to live inline in renderBoardOverlays,
	* unchanged in behavior, just collected instead of drawn immediately. Shared by
	* renderBoardOverlays (Canvas2D fill + glow/blur/stroke) and ThreeBattleRenderer (a flat
	* translucent hex mesh per cell, positioned between terrain and decorations in world space)
	* so the two can never disagree about which cells light up or in what color. */
	boardOverlayLayers() {
		const layers = [];
		const push = (cells, fill, glow = true) => {
			const arr = Array.isArray(cells) ? cells : [...cells];
			if (arr.length) layers.push({
				cells: arr,
				fill,
				glow
			});
		};
		for (const zone of this.auraZones) push([...zone.cells].map((k) => {
			const [x, y] = k.split(",").map(Number);
			return {
				x,
				y
			};
		}), zone.kind === "protection" ? "rgba(150,210,255,0.3)" : "rgba(220,90,70,0.3)");
		for (const zone of this.iceStormZones) push([...zone.cells].map((cell) => {
			const [x, y] = cell.split(",").map(Number);
			return {
				x,
				y
			};
		}), "rgba(135,205,255,0.28)", false);
		if (this.mode === "idle" && this.threat.length) push(this.threat, "rgba(220,120,90,0.5)");
		if (this.mode === "awaitPotion") {
			const selected = this.units.find((u) => u.id === this.selectedId);
			if (selected) {
				push([{
					x: selected.x,
					y: selected.y
				}, ...hexNeighbors(selected.x, selected.y)].filter((c) => this.validPotionTarget(selected, c)), "rgba(150,210,170,0.45)");
				const cell = this.hover;
				if (cell && this.validPotionTarget(selected, cell)) push([cell], "rgba(170,230,180,0.55)");
			}
		}
		if (this.mode === "awaitSpell") {
			const selected = this.units.find((u) => u.id === this.selectedId);
			if (selected && this.spellKind === "fireball") {
				push(fireballRangeTiles(selected, this.cols, this.rows), "rgba(235,140,70,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && manhattan(selected, cell) <= FIREBALL.range) push(fireballTiles(fireballOrigin(cell, this.cols, this.rows), this.cols, this.rows), "rgba(235,140,70,0.55)");
			} else if (selected && this.spellKind === "causticVenom") {
				push(this.healRangeTiles(selected, CAUSTIC_VENOM.range), "rgba(200,210,90,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && manhattan(selected, cell) <= CAUSTIC_VENOM.range) push(hexAreaTiles(fireballOrigin(cell, this.cols, this.rows), CAUSTIC_VENOM.size, this.cols, this.rows), "rgba(200,210,90,0.55)");
			} else if (selected && this.spellKind === "divineBolt") {
				push(this.healRangeTiles(selected, DIVINE_BOLT.range), "rgba(255,205,110,0.48)");
				const cell = this.hover ?? this.spellAim;
				if (cell && manhattan(selected, cell) <= DIVINE_BOLT.range) push(hexAreaTiles(fireballOrigin(cell, this.cols, this.rows), DIVINE_BOLT.size, this.cols, this.rows), "rgba(255,225,150,0.62)");
			} else if (selected && this.spellKind === "minorVenom") {
				push(this.healRangeTiles(selected, MINOR_VENOM.range), "rgba(200,210,90,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && manhattan(selected, cell) <= MINOR_VENOM.range) push(hexAreaTiles(fireballOrigin(cell, this.cols, this.rows), MINOR_VENOM.size, this.cols, this.rows), "rgba(200,210,90,0.55)");
			} else if (selected && this.spellKind === "sweep") push(this.sweepTiles(selected), "rgba(220,150,70,0.5)");
			else if (selected && this.spellKind === "longShot") {
				const reach = [];
				const max = this.longMax(selected);
				for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.cols; x++) {
					const d = manhattan(selected, {
						x,
						y
					});
					if (d >= selected.minRange && d <= max) reach.push({
						x,
						y
					});
				}
				push(reach, "rgba(210,190,90,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(230,200,100,0.55)");
			} else if (selected && this.spellKind === "piercing") {
				push(allAxisRays(selected, this.cols, this.rows), "rgba(220,160,70,0.45)");
				const cell = this.hover ?? this.spellAim;
				const line = cell ? this.piercingRay(selected, cell) : null;
				if (line) push(line, "rgba(235,170,80,0.55)");
			} else if (selected && this.spellKind === "piercingThrust") {
				push(this.healRangeTiles(selected, selected.maxRange + 1), "rgba(220,160,80,0.45)");
				const cell = this.hover ?? this.spellAim;
				const line = cell ? this.piercingThrustRay(selected, cell) : null;
				if (line) push(line, "rgba(235,175,90,0.55)");
			} else if (selected && (this.spellKind === "doubleStrike" || this.spellKind === "trip" || this.spellKind === "lifeDrain")) {
				push(this.healRangeTiles(selected, selected.maxRange), "rgba(220,120,80,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(235,120,80,0.55)");
			} else if (selected && this.spellKind === "cleave") {
				push(hexNeighbors(selected.x, selected.y), "rgba(220,120,80,0.45)");
				const cell = this.hover ?? this.spellAim;
				const arc = cell ? cleaveHexes(selected, cell, CLEAVE.hexes, this.cols, this.rows) : [];
				if (arc.length) push(arc, "rgba(235,120,80,0.55)");
			} else if (selected && this.spellKind === "summonFamiliar") {
				push(this.healRangeTiles(selected, SUMMON_FAMILIAR.range), "rgba(180,150,235,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(200,170,245,0.55)");
			} else if (selected && this.spellKind === "summonFamiliar2") {
				push(this.healRangeTiles(selected, SUMMON_FAMILIAR2.range), "rgba(180,150,235,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(200,170,245,0.55)");
			} else if (selected && this.spellKind === "summonFamiliar4") {
				push(this.healRangeTiles(selected, SUMMON_FAMILIAR4.range), "rgba(180,150,235,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(200,170,245,0.55)");
			} else if (selected && this.spellKind === "summonZombieDog") {
				push(this.healRangeTiles(selected, SUMMON_ZOMBIE_DOG.range), "rgba(180,150,235,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push(footprint({
					x: cell.x,
					y: cell.y,
					size: CLASSES.zombieDog.size,
					footprintOffsets: CLASSES.zombieDog.footprintOffsets
				}), "rgba(200,170,245,0.55)");
			} else if (selected && this.spellKind === "summonFamiliar3") {
				push(this.healRangeTiles(selected, SUMMON_FAMILIAR3.range), "rgba(180,150,235,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push(footprint({
					x: cell.x,
					y: cell.y,
					size: CLASSES.familiar3.size,
					footprintOffsets: CLASSES.familiar3.footprintOffsets
				}), "rgba(200,170,245,0.55)");
			} else if (selected && this.spellKind === "webOfDreams") {
				push(this.healRangeTiles(selected, WEB_OF_DREAMS.range), "rgba(170,140,230,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && manhattan(selected, cell) <= WEB_OF_DREAMS.range) push(hexAreaTiles(cell, webOfDreamsSize(selected.level), this.cols, this.rows), "rgba(185,155,240,0.55)");
			} else if (selected && this.spellKind === "lightning") {
				push(this.healRangeTiles(selected, LIGHTNING.range), "rgba(140,200,245,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(160,215,255,0.55)");
			} else if (selected && this.spellKind === "lightningTier3") {
				push(this.healRangeTiles(selected, LIGHTNING_T3.range), "rgba(120,210,255,0.5)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(180,235,255,0.65)");
			} else if (selected && this.spellKind === "magicMissile") {
				push(this.healRangeTiles(selected, MAGIC_MISSILE.range), "rgba(180,150,235,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(200,170,245,0.55)");
			} else if (selected && this.spellKind === "phantasmalForce") {
				push(this.healRangeTiles(selected, PHANTASMAL_FORCE.range), "rgba(180,150,235,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(200,170,245,0.55)");
			} else if (selected && this.isHeal(this.spellKind)) {
				push(this.healRangeTiles(selected, CURES[this.spellKind].range), "rgba(150,210,170,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.validHealTarget(selected, cell)) push([cell], "rgba(170,230,180,0.55)");
			} else if (selected && this.spellKind === "cureDisease") {
				push(this.healRangeTiles(selected, CURE_DISEASE.range), "rgba(150,210,170,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.validCureDiseaseTarget(selected, cell)) push([cell], "rgba(170,230,180,0.55)");
			} else if (selected && this.spellKind === "multiShot") {
				push(this.healRangeTiles(selected, MULTI_SHOT.range), "rgba(210,190,90,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(230,200,100,0.55)");
			} else if (selected && this.spellKind === "divineWrath") {
				push(this.healRangeTiles(selected, DIVINE_WRATH.range), "rgba(255,225,140,0.4)");
				const cell = this.hover ?? this.spellAim;
				const line = cell ? this.wrathRay(selected, cell, DIVINE_WRATH.range) : null;
				if (line) push(line, "rgba(255,225,140,0.6)");
			} else if (selected && this.spellKind === "shoulderSmash") {
				push(hexNeighbors(selected.x, selected.y), "rgba(220,120,80,0.45)");
				const cell = this.hover ?? this.spellAim;
				const arc = cell ? cleaveHexes(selected, cell, shoulderSmashPower(selected.level).hexes, this.cols, this.rows) : [];
				if (arc.length) push(arc, "rgba(235,120,80,0.55)");
			} else if (selected && this.spellKind === "stampede") {
				push(this.healRangeTiles(selected, STAMPEDE.range), "rgba(200,90,60,0.4)");
				const cell = this.hover ?? this.spellAim;
				const line = cell ? this.wrathRay(selected, cell, STAMPEDE.range) : null;
				if (line) push(line, "rgba(200,90,60,0.6)");
			} else if (selected && this.spellKind === "bullRush") {
				push(this.healRangeTiles(selected, BULL_RUSH_RANGE), "rgba(220,120,80,0.22)");
				const legal = [];
				for (const u of this.units) {
					if (!u.alive || u.side === selected.side) continue;
					for (const c of footprint(u)) {
						if (!inBounds(c.x, c.y, this.cols, this.rows)) continue;
						if (this.bullRushCharge(selected, c)?.foe.id === u.id) legal.push(c);
					}
				}
				push(legal, "rgba(220,120,80,0.45)");
				const cell = this.hover ?? this.spellAim;
				const charge = cell ? this.bullRushCharge(selected, cell) : null;
				if (cell && charge) for (const leg of charge.legs) {
					push(leg.path, "rgba(235,120,80,0.6)");
					push(footprint(leg.foe), "rgba(255,90,60,0.7)");
					const land = leg.push.path[leg.push.path.length - 1] ?? {
						x: leg.foe.x,
						y: leg.foe.y
					};
					if (leg.push.path.length > 0 || leg.push.blocked) push(footprint({
						...leg.foe,
						x: land.x,
						y: land.y
					}), leg.push.blocked ? "rgba(255,60,40,0.8)" : "rgba(255,180,120,0.6)");
				}
			} else if (selected && this.spellKind === "provoke") {
				push(this.healRangeTiles(selected, provokePower(selected.level).range), "rgba(224,96,58,0.3)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push(this.provokeArea(cell, selected.level), "rgba(235,96,58,0.55)");
			} else if (selected && (this.spellKind === "executionerStrike" || this.spellKind === "shieldBash")) {
				push(this.healRangeTiles(selected, selected.maxRange), "rgba(220,120,80,0.45)");
				const cell = this.hover ?? this.spellAim;
				if (cell && this.spellAimValid(selected, cell)) push([cell], "rgba(235,120,80,0.55)");
			} else if (selected && (this.spellKind === "burningHands" || this.spellKind === "poisonBreath")) {
				const power = (this.spellKind === "poisonBreath" ? poisonBreathPower : burningHandsPower)(selected.level);
				push(allAxisRays(selected, this.cols, this.rows).filter((p) => hexDist(selected, p) <= power.range), this.spellKind === "poisonBreath" ? "rgba(100,200,60,0.35)" : "rgba(235,140,70,0.35)");
				const cell = this.hover ?? this.spellAim;
				const ray = cell ? this.wrathRay(selected, cell, power.range) : null;
				const dir = ray && ray[0] ? axisDir(selected, ray[0]) : null;
				if (dir) push(coneSector(selected, dir, power.radius, this.cols, this.rows), this.spellKind === "poisonBreath" ? "rgba(100,200,60,0.55)" : "rgba(235,140,70,0.55)");
			}
			if (selected && this.spellKind === "frost") {
				const cell = this.hover ?? this.spellAim;
				if (cell) push(this.frostTiles(selected, cell), "rgba(160,220,255,0.5)");
			}
			if (selected && this.spellKind === "turnUndead") push(this.turnUndeadTiles(selected, selected.level), "rgba(255,225,145,0.45)");
			if (selected && this.spellKind === "iceStorm") {
				const power = iceStormPower(selected.level);
				push(this.healRangeTiles(selected, power.range), "rgba(125,195,245,0.38)");
				const cell = this.hover ?? this.spellAim;
				if (cell && manhattan(selected, cell) <= power.range) push(iceStormAreaTiles(cell, selected.level, this.cols, this.rows), "rgba(150,220,255,0.5)");
			}
		}
		if (this.mode === "selected" || this.mode === "awaitAttack" || this.mode === "awaitAction" || this.mode === "awaitOffHand") {
			if (this.mode === "selected" && !this.mission.explore) {
				const reachable = [...this.reach.values()].filter((cell) => this.hexAt(cell.x, cell.y).passable);
				const inWeb = reachable.filter((c) => this.isWebCell(c.x, c.y));
				push(inWeb.length ? reachable.filter((c) => !this.isWebCell(c.x, c.y)) : reachable, GRID_MOVE);
				if (inWeb.length) push(inWeb, GRID_MOVE, false);
			}
			const selected = this.units.find((u) => u.id === this.selectedId);
			const offHandReach = selected && this.mode === "awaitOffHand" ? this.offHandReach(selected) : null;
			const atkTiles = [];
			const offHandTiles = [];
			for (const foe of this.units) {
				if (!foe.alive || foe.side === "player") continue;
				if ((this.mission.hub || this.mission.explore) && foe.side === "neutral") continue;
				if (this.mode === "selected" && this.attackFrom.has(foe.id)) atkTiles.push(...footprint(foe));
				if ((this.mode === "awaitAttack" || this.mode === "awaitAction") && selected && canHitFrom(selected, selected, foe, this.tiles, this.cols, this.decorOverlay)) atkTiles.push(...footprint(foe));
				if (offHandReach && selected && this.targetable(foe) && canHitFrom(offHandReach, selected, foe, this.tiles, this.cols, this.decorOverlay)) offHandTiles.push(...footprint(foe));
			}
			push(atkTiles, GRID_ENEMY_TARGET);
			push(offHandTiles, GRID_OFFHAND_TARGET);
			if (this.pendingFoeId) {
				const foe = this.units.find((u) => u.id === this.pendingFoeId);
				if (foe) push(footprint(foe), GRID_ENEMY_TARGET);
			}
		}
		return layers;
	}
	/** The active-turn unit's pulsing gold/red ring, as one more cell+color — kept separate from
	* boardOverlayLayers because the Canvas2D path draws it with its own bespoke size/glow (see
	* renderBoardOverlays' own active-turn block), not the generic drawLayer treatment.
	* ThreeBattleRenderer uses this instead, to get the same cell and color without duplicating
	* BattleEngine's turn-order logic. */
	previewReach = null;
	previewKey = "";
	previewCells = [];
	/** Uses the same unpruned walk graph as commitMove, including passage through allies. */
	movementPreview() {
		const selected = this.units.find((u) => u.id === this.selectedId);
		const to = this.hover ?? this.cursor;
		if (this.mode !== "selected" || this.active || !selected || this.mission.explore || !this.reach.has(key(to.x, to.y)) || to.x === selected.x && to.y === selected.y) return [];
		const previewKey = `${selected.id}:${selected.x},${selected.y}:${to.x},${to.y}:${selected.moveBudgetUsed}`;
		if (this.previewReach !== this.reach || this.previewKey !== previewKey) {
			const walkReach = computeReachable(this.effectiveUnitForReach(selected), this.tiles, this.cols, this.rows, this.units, false, this.decorOverlay);
			this.previewCells = reconstructPath(walkReach, to).slice(1);
			this.previewReach = this.reach;
			this.previewKey = previewKey;
		}
		return this.previewCells;
	}
	activeTurnHighlight() {
		const active = this.visuallyActingUnit();
		if (!active) return null;
		let { x, y } = active;
		const moving = this.active;
		if (moving?.type === "move" && moving.id === active.id) {
			if (active.side === "player") return null;
			const from = moving.path[moving.i];
			const to = moving.path[moving.i + 1];
			if (from && to) {
				const dur = this.speedMode === "fast" ? .12 : this.speedMode === "slow" ? .36 : .22;
				const progress = easeOut(Math.min(1, moving.t / dur));
				({x, y} = progress < .5 ? from : to);
			}
		}
		return {
			x,
			y,
			fill: active.side === "enemy" ? GRID_ENEMY : GRID_ALLY,
			player: active.side === "player"
		};
	}
	/** Units, HP bars, particles, projectiles, banners, and the foreground decoration layer —
	* drawn on top of renderGround's output. Re-applies this frame's screen-shake offset (see
	* frameShakeDx/Dy) independently rather than sharing one still-open ctx.save() with
	* renderGround, since the two may be drawing onto two different canvases. */
	/** Inn-quest pickups lying on the ground: a small pulsing gold glint (not a hex outline),
	* hidden under fog of war until the hex has been explored. */
	drawQuestPickups(ctx, tile) {
		if (this.questPickups.length === 0) return;
		const pulse = this.reducedMotion ? 1 : .75 + Math.sin(this.time * 3.4) * .25;
		for (const pickup of this.questPickups) {
			if (!this.explored(pickup.x, pickup.y)) continue;
			const { cx, cy } = this.hexCenter(pickup.x, pickup.y);
			const r = tile * .2;
			ctx.save();
			ctx.shadowColor = `rgba(255,208,96,${(.85 * pulse).toFixed(3)})`;
			ctx.shadowBlur = tile * .45 * pulse;
			ctx.fillStyle = "rgba(255,226,140,0.95)";
			ctx.beginPath();
			ctx.moveTo(cx, cy - r);
			ctx.lineTo(cx + r * .7, cy);
			ctx.lineTo(cx, cy + r);
			ctx.lineTo(cx - r * .7, cy);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
	}
	/** Floating combat text ("Missed", damage, heals, level-up labels) for the tactics camera,
	* drawn upright on a plain screen canvas. Same text, colors and timing as the
	* renderUnitsAndOverlays pass; toScreen maps a top-down board point lifted `up` pixels
	* above the ground onto the real camera view, and scale is the camera's sprite scale. */
	renderFloatingTextHud(ctx, toScreen, scale) {
		const tile = ZOOM_RADII[this.zoom];
		if (this.particleLive) {
			const dmgCell = tile * Math.sqrt(3);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			for (const p of this.particles) {
				if (!p.live || p.kind !== "text" || !p.text) continue;
				const { cx, cy } = this.hexCenter(Math.round(p.x - p.vx * p.life), Math.round(p.y - p.vy * p.life));
				const fade = .4;
				ctx.globalAlpha = p.life < p.max - fade ? 1 : Math.max(0, 1 - (p.life - (p.max - fade)) / fade);
				const fontPx = Math.max(16, Math.round(dmgCell * .42 * scale));
				ctx.font = `800 ${fontPx}px Figtree, sans-serif`;
				ctx.lineJoin = "round";
				ctx.lineWidth = Math.max(4, fontPx * .22);
				ctx.strokeStyle = "rgba(12,11,10,0.92)";
				ctx.fillStyle = p.color;
				const at = toScreen(cx, cy, dmgCell * .85);
				const y = at.y - p.life * 16 * scale;
				ctx.strokeText(p.text, at.x, y);
				ctx.fillText(p.text, at.x, y);
			}
			ctx.globalAlpha = 1;
		}
		if (this.levelUpFxLive) for (const s of this.levelUpFx) {
			if (!s.live || s.kind !== "label") continue;
			const unit = this.units.find((u) => u.id === s.unitId);
			if (!unit) continue;
			const k = s.life / s.max;
			const cellNow = tile * Math.sqrt(3);
			const us = unitSize(unit);
			const boss = unit.classId === "captain";
			const isBig = unit.footprintOffsets === FOOTPRINT_TYPE_8 || unit.footprintOffsets === FOOTPRINT_TYPE_7;
			const hh = cellNow * (us >= 4 ? 3.35 : us === 2 ? 1.72 : boss ? 1.44 : 1.42) * 1.2 * (isBig ? .75 : 1);
			const footY = us >= 4 ? tile * .9 : cellNow * .42;
			const { cx: upx, cy: upy } = this.unitPixel(unit);
			const labelFade = k < .12 ? k / .12 : k > .75 ? Math.max(0, 1 - (k - .75) / .25) : 1;
			const pop = k < .12 ? 1.35 - .35 * (k / .12) : 1;
			const at = toScreen(upx, upy + footY, hh - s.dy);
			const size = s.size * scale;
			ctx.save();
			ctx.globalAlpha = labelFade;
			ctx.translate(at.x + s.dx * scale, at.y);
			ctx.scale(pop, pop);
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
			ctx.font = `900 ${Math.round(size)}px Figtree, sans-serif`;
			ctx.shadowColor = `hsla(${s.hue}, 100%, 65%, 0.95)`;
			ctx.shadowBlur = size * .9;
			ctx.lineJoin = "round";
			ctx.lineWidth = Math.max(4, size * .16);
			ctx.strokeStyle = "rgba(24,16,4,0.9)";
			ctx.strokeText(s.text ?? "", 0, 0);
			ctx.fillStyle = `hsl(${s.hue}, 100%, 74%)`;
			ctx.fillText(s.text ?? "", 0, 0);
			ctx.shadowBlur = size * 1.6;
			ctx.fillText(s.text ?? "", 0, 0);
			ctx.restore();
		}
	}
	/** getLightAt, when given, answers "how much extra light falls on this screen point right
	* now?" from actually-active spell casts (fire/acid/holy/darkness/webShot) — see
	* EffectsRenderer.lightBoostAt, which BattleCanvas wires this to. Positive brightens a unit
	* standing near a fire/holy/acid glow or a travelling web shot; negative (darkness) dims one.
	* Omitted (the render() convenience path above, which has no EffectsRenderer of its own)
	* simply skips the check — units draw exactly as if nothing were casting light nearby.
	*
	* skipGroundDecor, when true, skips the "ground"/"behind" drawDecorations calls below (the
	* "front" one near the end still runs) — set by BattleCanvas when gfx/three/
	* ThreeBattleRenderer is drawing the ground canvas instead of WebGL2DRenderer, since that
	* renderer already draws those same two layers itself (see its own ensureDecorBuilt); without
	* this every ground/behind prop would be drawn twice, once by each renderer. */
	renderUnitsAndOverlays(ctx, cssW, cssH, getLightAt, skipGroundDecor, skipUnitSprites, skipUnitShadow, skipCursorHex, skipFrontDecor, skipPortalFx, skipUnitHealthHud, skipFloatingText) {
		const tile = ZOOM_RADII[this.zoom];
		const sqrt3 = Math.sqrt(3);
		const shake = this.reducedMotion ? 0 : this.trauma * this.trauma;
		if (shake) {
			ctx.save();
			ctx.translate(this.frameShakeDx, this.frameShakeDy);
		}
		if (!skipGroundDecor) this.drawDecorations(ctx, tile, cssW, cssH, "behind");
		if (!skipPortalFx) this.drawPortalFx(ctx, tile);
		this.drawQuestPickups(ctx, tile);
		{
			const cur = this.hover ?? this.cursor;
			const { cx, cy } = this.hexCenter(cur.x, cur.y);
			const hid = tileAt(this.tiles, this.cols, cur.x, cur.y);
			const ht = TERRAIN[hid];
			const blocked = !ht.passable;
			const erased = hid === "void" || !this.explored(cur.x, cur.y);
			if (!skipCursorHex && !erased) {
				if (blocked) {
					ctx.save();
					ctx.shadowColor = "rgba(219,58,44,0.95)";
					ctx.shadowBlur = 0;
					ctx.strokeStyle = "rgba(231,133,115,0.95)";
					ctx.lineWidth = 3;
					this.hexPath(ctx, cx, cy, tile * .9);
					ctx.stroke();
					ctx.restore();
				} else {
					ctx.strokeStyle = "rgba(240,235,227,0.9)";
					ctx.lineWidth = 2;
					this.hexPath(ctx, cx, cy, tile * .9);
					ctx.stroke();
				}
			}
			if (!erased && (blocked || ht.height)) {
				const label = blocked ? ht.name.toUpperCase() : "ALTO +2";
				const fontPx = Math.max(11, Math.round(tile * .32));
				ctx.font = `700 ${fontPx}px Figtree, sans-serif`;
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				ctx.lineJoin = "round";
				ctx.lineWidth = Math.max(3, fontPx * .22);
				ctx.strokeStyle = "rgba(12,11,10,0.88)";
				ctx.fillStyle = blocked ? "#ff7a68" : "#efe4c4";
				ctx.strokeText(label, cx, cy + tile * .38);
				ctx.fillText(label, cx, cy + tile * .38);
			}
		}
		const cell = tile * sqrt3;
		const shadowDirX = .6;
		const shadowDirY = .8;
		const shadowOffset = cell * .16;
		const sorted = [...this.units].sort((a, b) => this.unitAnchor(a).worldY - this.unitAnchor(b).worldY || a.drawX - b.drawX);
		let lastGroundDecorDepth = -Infinity;
		for (const u of sorted) {
			if (u.fade <= 0) continue;
			if (this.unitHidden(u)) continue;
			const unitDepth = this.unitAnchor(u).worldY;
			if (!skipGroundDecor) {
				this.drawDecorations(ctx, tile, cssW, cssH, "ground", {
					after: lastGroundDecorDepth,
					through: unitDepth
				});
				lastGroundDecorDepth = unitDepth;
			}
			const s = unitSize(u);
			const boss = isBossClass(u.classId);
			const { cx: px, cy: py } = this.unitPixel(u);
			const foot = s >= 4 ? 2.15 : s === 2 ? 1.5 : boss ? 1.12 : 1;
			const { bob, sway, breath, lift, img, w, h, footY, scaleX, scaleY, footOffset } = this.computeUnitVisual(u, cell, tile);
			ctx.save();
			ctx.globalAlpha = u.fade * (u.moved && u.side === "player" && this.phase === "player" && !this.active ? .9 : 1);
			if (!skipUnitShadow) {
				const stretch = 1 + Math.min(.6, lift / cell) * .5;
				const shadowCx = px + sway + shadowDirX * shadowOffset * stretch;
				const shadowCy = py + cell * .22 + shadowDirY * shadowOffset * stretch;
				const shadowRx = cell * .24 * foot * (1 + breath * .4) * stretch;
				const shadowRy = cell * .1 * Math.min(2.2, foot) * (1 - breath * .3);
				const shadowGrad = ctx.createRadialGradient(shadowCx, shadowCy, 0, shadowCx, shadowCy, Math.max(shadowRx, shadowRy));
				shadowGrad.addColorStop(0, "rgba(6,7,10,0.5)");
				shadowGrad.addColorStop(.72, "rgba(6,7,10,0.3)");
				shadowGrad.addColorStop(1, "rgba(6,7,10,0)");
				ctx.fillStyle = shadowGrad;
				ctx.beginPath();
				ctx.ellipse(shadowCx, shadowCy, shadowRx, shadowRy, 0, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.translate(px + sway, py + footY + bob - lift);
			ctx.scale(scaleX, scaleY);
			if (u.levelGlow > 0) {
				const pulse = .75 + Math.sin(this.time * 7) * .25;
				const bg = ctx.createRadialGradient(0, -h * .5, 0, 0, -h * .5, w * 1.15);
				bg.addColorStop(0, `rgba(255,214,120,${.5 * u.levelGlow * pulse})`);
				bg.addColorStop(1, "rgba(255,214,120,0)");
				ctx.fillStyle = bg;
				ctx.beginPath();
				ctx.arc(0, -h * .5, w * 1.15, 0, Math.PI * 2);
				ctx.fill();
				ctx.shadowColor = `rgba(255,208,110,${.95 * u.levelGlow})`;
				ctx.shadowBlur = w * .4 * u.levelGlow * pulse;
			}
			if (u.healGlow > 0) {
				const pulse = .8 + Math.sin(this.time * 5) * .2;
				const halo = this.healHaloRgb(u.healGlowKind);
				const reach = u.healGlowKind === "holyMedium" || u.healGlowKind === "food" ? 1.35 : u.healGlowKind === "healingHands" ? 1.13 : u.healGlowKind === "holyMinor" ? .92 : 1.08;
				const bg = ctx.createRadialGradient(0, -h * .5, 0, 0, -h * .5, w * reach);
				bg.addColorStop(0, `rgba(${halo.core},${.5 * u.healGlow * pulse})`);
				bg.addColorStop(.45, `rgba(${halo.mid},${.22 * u.healGlow * pulse})`);
				bg.addColorStop(1, `rgba(${halo.mid},0)`);
				ctx.fillStyle = bg;
				ctx.beginPath();
				ctx.arc(0, -h * .5, w * reach, 0, Math.PI * 2);
				ctx.fill();
				ctx.shadowColor = `rgba(${halo.core},${.9 * u.healGlow})`;
				ctx.shadowBlur = w * (u.healGlowKind === "holyMedium" || u.healGlowKind === "food" ? .48 : .32) * u.healGlow * pulse;
			}
			const lightBoost = getLightAt ? getLightAt(px, py) : 0;
			if (u.flash > 0) ctx.filter = `brightness(${1.8 + u.flash})`;
			else if (Math.abs(lightBoost) > .03) ctx.filter = `brightness(${Math.max(.35, 1 + lightBoost * .5)})`;
			if (skipUnitSprites) {} else if (img) ctx.drawImageLit(img, -w / 2, -h + footOffset, w, h);
			else {
				ctx.fillStyle = u.side === "player" ? "#8a97a1" : u.side === "neutral" ? "#5f8a58" : "#a35a4a";
				ctx.fillRect(-w / 2, -h, w, h);
			}
			if (!skipUnitSprites && u.levelGlow > 0 && img) {
				const pulse = .75 + Math.sin(this.time * 7) * .25;
				ctx.shadowBlur = w * .55 * u.levelGlow * pulse;
				ctx.drawImage(img, -w / 2, -h + footOffset, w, h);
			}
			if (!skipUnitSprites && u.healGlow > 0 && img) {
				const pulse = .8 + Math.sin(this.time * 5) * .2;
				ctx.shadowColor = `rgba(${this.healHaloRgb(u.healGlowKind).core},${.88 * u.healGlow})`;
				ctx.shadowBlur = w * (u.healGlowKind === "holyMedium" || u.healGlowKind === "food" ? .58 : .42) * u.healGlow * pulse;
				ctx.drawImage(img, -w / 2, -h + footOffset, w, h);
			}
			this.drawStatusFx(ctx, u, cell * 1.11 * 1.2, cell * 1.42 * 1.2);
			ctx.filter = "none";
			ctx.shadowBlur = 0;
			ctx.restore();
			if (u.alive) {
				const bw = cell * (s >= 4 ? 1.35 : s === 2 ? .9 : boss ? .68 : .62);
				const bh = Math.max(4, cell * .07);
				const bx = px - bw / 2;
				const by = py - h + cell * .42 + bob - lift - Math.max(8, cell * .12);
				if (!skipUnitHealthHud) {
					ctx.fillStyle = "rgba(12,11,10,0.82)";
					ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
					ctx.fillStyle = "#2c2824";
					ctx.fillRect(bx, by, bw, bh);
					ctx.fillStyle = u.side === "player" ? "#c8c4bc" : u.side === "neutral" ? "#5f9e52" : "#b54a32";
					ctx.fillRect(bx, by, bw * Math.max(0, u.hp / u.maxHp), bh);
					if (cell >= 32) {
						ctx.font = `600 ${Math.round(cell * .22)}px Figtree, sans-serif`;
						ctx.textAlign = "center";
						ctx.textBaseline = "bottom";
						ctx.lineJoin = "round";
						ctx.lineWidth = 3;
						ctx.strokeStyle = "rgba(12,11,10,0.9)";
						ctx.fillStyle = "#f0ebe3";
						ctx.strokeText(`${u.hp}`, px, by - 1);
						ctx.fillText(`${u.hp}`, px, by - 1);
					}
				}
				if ((u.fearTurns ?? 0) > 0) {
					ctx.font = `bold ${Math.max(11, cell * .18)}px sans-serif`;
					ctx.textAlign = "center";
					ctx.fillStyle = "#ffe6a0";
					ctx.fillText(`Fear ${u.fearTurns}`, px, by - bh - cell * .16);
				}
				if (u.stunned) {
					const gx = px;
					const gy = by - bh - cell * .16;
					const r = cell * .13;
					const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
					glow.addColorStop(0, "rgba(255,90,70,0.95)");
					glow.addColorStop(.6, "rgba(255,60,50,0.55)");
					glow.addColorStop(1, "rgba(255,60,50,0)");
					ctx.fillStyle = glow;
					ctx.beginPath();
					ctx.arc(gx, gy, r, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		}
		if (this.particleLive) {
			const dmgCell = tile * Math.sqrt(3);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			for (const p of this.particles) {
				if (!p.live || p.kind === "text") continue;
				const { cx, cy } = this.hexCenter(Math.round(p.x), Math.round(p.y));
				const px = cx;
				const py = cy - tile * .2;
				ctx.globalAlpha = 1 - p.life / p.max;
				if (p.kind === "impact") {
					const img = this.art.impact[Math.min(3, Math.floor(p.frame))];
					if (img) ctx.drawImage(img, px - tile * .45, py - tile * .45, tile * .9, tile * .9);
				} else {
					ctx.fillStyle = p.color;
					ctx.fillRect(px, py, p.size, p.size);
				}
			}
			for (const p of this.particles) {
				if (skipFloatingText || !p.live || p.kind !== "text" || !p.text) continue;
				const { cx, cy } = this.hexCenter(Math.round(p.x), Math.round(p.y));
				const fade = .4;
				ctx.globalAlpha = p.life < p.max - fade ? 1 : Math.max(0, 1 - (p.life - (p.max - fade)) / fade);
				const fontPx = Math.max(16, Math.round(dmgCell * .42));
				ctx.font = `800 ${fontPx}px Figtree, sans-serif`;
				ctx.lineJoin = "round";
				ctx.lineWidth = Math.max(4, fontPx * .22);
				ctx.strokeStyle = "rgba(12,11,10,0.92)";
				ctx.fillStyle = p.color;
				ctx.strokeText(p.text, cx, cy - dmgCell * .85 - p.life * 16);
				ctx.fillText(p.text, cx, cy - dmgCell * .85 - p.life * 16);
			}
			ctx.globalAlpha = 1;
		}
		if (this.levelUpFxLive) {
			for (const s of this.levelUpFx) {
				if (!s.live) continue;
				const unit = this.units.find((u) => u.id === s.unitId);
				if (!unit) continue;
				const { cx, cy } = this.hexCenter(Math.round(unit.x), Math.round(unit.y));
				const x = cx + s.dx;
				const y = cy + s.dy;
				const k = s.life / s.max;
				if (s.kind === "ring") {
					const r = s.refCell * (.15 + k * 1.25);
					ctx.globalAlpha = Math.max(0, 1 - k) * .85;
					ctx.strokeStyle = `hsl(${s.hue}, 95%, 68%)`;
					ctx.lineWidth = Math.max(1.5, s.refCell * .05 * (1 - k));
					ctx.beginPath();
					ctx.arc(x, y, r, 0, Math.PI * 2);
					ctx.stroke();
					if (k < .3) {
						const flash = ctx.createRadialGradient(x, y, 0, x, y, s.refCell * .5);
						flash.addColorStop(0, `rgba(255,250,220,${.6 * (1 - k / .3)})`);
						flash.addColorStop(1, "rgba(255,250,220,0)");
						ctx.fillStyle = flash;
						ctx.globalAlpha = 1;
						ctx.beginPath();
						ctx.arc(x, y, s.refCell * .5, 0, Math.PI * 2);
						ctx.fill();
					}
					continue;
				}
				if (s.kind === "label") {
					if (skipFloatingText) continue;
					const tileNow = this.layout.tile;
					const cellNow = tileNow * Math.sqrt(3);
					const us = unitSize(unit);
					const boss = unit.classId === "captain";
					const isBig = unit.footprintOffsets === FOOTPRINT_TYPE_8 || unit.footprintOffsets === FOOTPRINT_TYPE_7;
					const hh = cellNow * (us >= 4 ? 3.35 : us === 2 ? 1.72 : boss ? 1.44 : 1.42) * 1.2 * (isBig ? .75 : 1);
					const footY = us >= 4 ? tileNow * .9 : cellNow * .42;
					const { cx: upx, cy: upy } = this.unitPixel(unit);
					const labelFade = k < .12 ? k / .12 : k > .75 ? Math.max(0, 1 - (k - .75) / .25) : 1;
					const pop = k < .12 ? 1.35 - .35 * (k / .12) : 1;
					ctx.save();
					ctx.globalAlpha = labelFade;
					ctx.translate(upx + s.dx, upy + footY - hh + s.dy);
					ctx.scale(pop, pop);
					ctx.textAlign = "center";
					ctx.textBaseline = "bottom";
					ctx.font = `900 ${Math.round(s.size)}px Figtree, sans-serif`;
					ctx.shadowColor = `hsla(${s.hue}, 100%, 65%, 0.95)`;
					ctx.shadowBlur = s.size * .9;
					ctx.lineJoin = "round";
					ctx.lineWidth = Math.max(4, s.size * .16);
					ctx.strokeStyle = "rgba(24,16,4,0.9)";
					ctx.strokeText(s.text ?? "", 0, 0);
					ctx.fillStyle = `hsl(${s.hue}, 100%, 74%)`;
					ctx.fillText(s.text ?? "", 0, 0);
					ctx.shadowBlur = s.size * 1.6;
					ctx.fillText(s.text ?? "", 0, 0);
					ctx.restore();
					continue;
				}
				ctx.globalAlpha = k < .15 ? k / .15 : k > .7 ? Math.max(0, 1 - (k - .7) / .3) : 1;
				const size = s.size * (1 - k * .35);
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(s.rot);
				const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.2);
				glow.addColorStop(0, `hsla(${s.hue}, 100%, 82%, 0.9)`);
				glow.addColorStop(1, `hsla(${s.hue}, 100%, 60%, 0)`);
				ctx.fillStyle = glow;
				ctx.beginPath();
				ctx.arc(0, 0, size * 2.2, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = `hsl(${s.hue}, 95%, 78%)`;
				ctx.beginPath();
				for (let i = 0; i < 8; i++) {
					const ang = Math.PI / 4 * i;
					const r = i % 2 === 0 ? size : size * .35;
					const px = Math.cos(ang) * r;
					const py = Math.sin(ang) * r;
					if (i === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				}
				ctx.closePath();
				ctx.fill();
				ctx.restore();
			}
			ctx.globalAlpha = 1;
		}
		if (this.fireballBurstFxLive) for (const burst of this.fireballBurstFx) {
			if (!burst.live) continue;
			const { cx, cy } = this.hexCenter(burst.x, burst.y);
			const k = burst.t / burst.max;
			const fade = Math.max(0, 1 - k);
			const venom = burst.kind === "causticVenom";
			const radius = tile * (.34 + k * .72);
			ctx.save();
			ctx.globalCompositeOperation = "lighter";
			const glow = ctx.createRadialGradient(cx, cy - tile * .1, 0, cx, cy - tile * .1, radius);
			glow.addColorStop(0, venom ? `rgba(232,255,175,${.84 * fade})` : `rgba(255,248,194,${.9 * fade})`);
			glow.addColorStop(.22, venom ? `rgba(159,242,45,${.76 * fade})` : `rgba(255,174,35,${.78 * fade})`);
			glow.addColorStop(.62, venom ? `rgba(25,150,54,${.45 * fade})` : `rgba(236,62,12,${.42 * fade})`);
			glow.addColorStop(1, venom ? "rgba(4,72,30,0)" : "rgba(128,18,0,0)");
			ctx.fillStyle = glow;
			ctx.beginPath();
			ctx.arc(cx, cy - tile * .1, radius, 0, Math.PI * 2);
			ctx.fill();
			if (venom) {
				ctx.lineCap = "round";
				for (let i = 0; i < 8; i += 1) {
					const pair = i % 4;
					const angle = burst.seed + pair * (Math.PI / 2) + (i >= 4 ? Math.PI : 0);
					const drift = tile * (.14 + pair * .035 + k * .2);
					const startX = cx + Math.cos(angle) * drift * .45;
					const startY = cy + Math.sin(angle) * drift * .22;
					const endX = cx + Math.cos(angle) * drift;
					const endY = cy - tile * (.16 + k * (.36 + pair % 2 * .08));
					ctx.strokeStyle = pair % 3 === 0 ? `rgba(190,255,126,${.54 * fade})` : `rgba(47,188,82,${.48 * fade})`;
					ctx.lineWidth = tile * (.07 + pair % 2 * .026) * (.85 + k * .4);
					ctx.shadowColor = "rgba(71,235,94,0.72)";
					ctx.shadowBlur = tile * .16;
					ctx.beginPath();
					ctx.moveTo(startX, startY);
					ctx.quadraticCurveTo(cx + Math.cos(angle) * drift * .72, cy - tile * (.1 + k * .24), endX, endY);
					ctx.stroke();
				}
			} else for (let i = 0; i < 7; i += 1) {
				const angle = burst.seed + i * 2.41 + k * 5.2;
				const spread = tile * (.18 + i % 3 * .1) * (.75 + k * .35);
				const px = cx + Math.cos(angle) * spread;
				const py = cy - tile * (.08 + k * .28) + Math.sin(angle) * spread * .45;
				const r = tile * (.055 + i % 2 * .025) * fade;
				ctx.shadowColor = "rgba(255,106,12,0.95)";
				ctx.shadowBlur = tile * .22;
				ctx.fillStyle = i % 3 === 0 ? `rgba(255,239,150,${fade})` : `rgba(255,93,8,${.85 * fade})`;
				ctx.beginPath();
				ctx.arc(px, py, Math.max(1, r), 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}
		if (this.missileFxLive) {
			for (const m of this.missileFx) {
				if (!m.live) continue;
				if (m.kind === "fireball" && this.fireballVfxAvailable && !this.reducedMotion) continue;
				if (m.kind === "causticVenom" && this.causticVenomVfxAvailable && !this.reducedMotion) continue;
				const from = this.hexCenter(m.fromX, m.fromY);
				const to = this.hexCenter(m.toX, m.toY);
				const dxT = to.cx - from.cx;
				const dyT = to.cy - from.cy;
				const dist = Math.hypot(dxT, dyT) || 1;
				const nx = -dyT / dist;
				const ny = dxT / dist;
				const along = (k) => {
					const wave = Math.sin(k * Math.PI * 2.4 + m.seed) * tile * .16 * (1 - k * .6);
					return {
						x: from.cx + dxT * k + nx * wave,
						y: from.cy - tile * .3 + dyT * k + ny * wave
					};
				};
				const kHead = Math.min(1, m.t / m.travel);
				const afterglow = Math.max(0, (m.t - m.travel) / MISSILE_AFTERGLOW);
				const physicalArrow = m.kind === "longShot";
				if (physicalArrow) {
					const head = {
						x: from.cx + dxT * kHead,
						y: from.cy - tile * .3 + dyT * kHead
					};
					const flightAngle = Math.atan2(dyT, dxT);
					ctx.save();
					ctx.globalCompositeOperation = "lighter";
					ctx.globalAlpha = (1 - afterglow) * (m.neeraArrow ? .42 : .24);
					ctx.strokeStyle = m.neeraArrow ? "rgba(220,38,54,0.82)" : "rgba(215,222,226,0.74)";
					ctx.lineWidth = Math.max(1, tile * (m.neeraArrow ? .018 : .012));
					for (let ring = 1; ring <= 2; ring += 1) {
						const bk = Math.max(0, kHead - ring * .1);
						const back = {
							x: from.cx + dxT * bk,
							y: from.cy - tile * .3 + dyT * bk
						};
						if (m.neeraArrow) {
							ctx.beginPath();
							ctx.ellipse(back.x, back.y, tile * (.1 + ring * .035), tile * (.027 + ring * .01), flightAngle, 0, Math.PI * 2);
							ctx.stroke();
						} else {
							ctx.beginPath();
							ctx.ellipse(back.x, back.y, tile * (.09 + ring * .035), tile * (.024 + ring * .01), flightAngle, 0, Math.PI * 2);
							ctx.stroke();
						}
					}
					if (m.neeraArrow && afterglow < 1) {
						for (let spark = 0; spark < 5; spark += 1) {
							const trail = spark * .055;
							const k = Math.max(0, kHead - trail);
							const x = from.cx + dxT * k;
							const y = from.cy - tile * .3 + dyT * k;
							const phase = m.seed + spark * 2.4 + this.time * 5;
							const spread = tile * (.025 + spark * .012);
							ctx.fillStyle = `rgba(255,${58 + spark * 14},${48 + spark * 8},${(1 - afterglow) * (.85 - spark * .11)})`;
							ctx.beginPath();
							ctx.arc(x + Math.cos(phase) * spread, y + Math.sin(phase) * spread, tile * (.018 + spark % 2 * .008), 0, Math.PI * 2);
							ctx.fill();
						}
						if (kHead >= 1) {
							ctx.globalAlpha = (1 - afterglow) * .8;
							ctx.strokeStyle = "rgba(255,75,62,0.9)";
							ctx.lineWidth = Math.max(1, tile * .016);
							for (let ray = 0; ray < 7; ray += 1) {
								const a = m.seed + ray * (Math.PI * 2 / 7);
								ctx.beginPath();
								ctx.moveTo(head.x + Math.cos(a) * tile * .035, head.y + Math.sin(a) * tile * .035);
								ctx.lineTo(head.x + Math.cos(a) * tile * (.12 + afterglow * .12), head.y + Math.sin(a) * tile * (.12 + afterglow * .12));
								ctx.stroke();
							}
						}
					}
					ctx.restore();
					ctx.save();
					ctx.translate(head.x, head.y);
					ctx.rotate(flightAngle + Math.PI / 4);
					ctx.globalCompositeOperation = "source-over";
					ctx.globalAlpha = 1 - afterglow;
					ctx.drawImage(this.art.arrowCore, -tile * .675, -tile * .675, tile * 1.35, tile * 1.35);
					ctx.restore();
					continue;
				}
				if (m.kind === "webOfDreams") continue;
				if (m.kind === "phantasmalForce") {
					const head = along(kHead);
					const fade = 1 - afterglow;
					const pulse = .9 + .1 * Math.sin(this.time * 15 + m.seed);
					const reachAngle = Math.atan2(dyT, dxT);
					ctx.save();
					ctx.translate(head.x, head.y);
					ctx.globalCompositeOperation = "lighter";
					ctx.globalAlpha = fade;
					ctx.shadowColor = "rgba(64,196,255,0.95)";
					ctx.shadowBlur = tile * .38;
					const body = ctx.createLinearGradient(0, -tile * .35, 0, tile * .58);
					body.addColorStop(0, "rgba(188,246,255,0.80)");
					body.addColorStop(.34, "rgba(43,165,255,0.55)");
					body.addColorStop(1, "rgba(19,82,222,0)");
					ctx.fillStyle = body;
					ctx.beginPath();
					ctx.moveTo(-tile * .2 * pulse, -tile * .08);
					ctx.quadraticCurveTo(-tile * .34, tile * .22, -tile * .17, tile * .57);
					ctx.quadraticCurveTo(0, tile * .38, tile * .08, tile * .62);
					ctx.quadraticCurveTo(tile * .24, tile * .24, tile * .2 * pulse, -tile * .08);
					ctx.closePath();
					ctx.fill();
					ctx.shadowBlur = tile * .18;
					ctx.fillStyle = "rgba(180,242,255,0.92)";
					ctx.beginPath();
					ctx.ellipse(0, -tile * .24, tile * .16, tile * .19, 0, 0, Math.PI * 2);
					ctx.fill();
					ctx.fillStyle = "rgba(9,45,118,0.92)";
					for (const eye of [-1, 1]) {
						ctx.beginPath();
						ctx.ellipse(eye * tile * .058, -tile * .25, tile * .034, tile * .045, 0, 0, Math.PI * 2);
						ctx.fill();
					}
					ctx.rotate(reachAngle);
					ctx.strokeStyle = "rgba(127,225,255,0.86)";
					ctx.lineCap = "round";
					ctx.lineWidth = tile * .07;
					for (const side of [-1, 1]) {
						ctx.beginPath();
						ctx.moveTo(0, side * tile * .04);
						ctx.quadraticCurveTo(tile * .2, side * tile * .2, tile * .39, side * tile * .13);
						ctx.stroke();
						for (let claw = -1; claw <= 1; claw += 1) {
							ctx.beginPath();
							ctx.moveTo(tile * .35, side * tile * .13);
							ctx.lineTo(tile * .49, side * tile * (.13 + claw * .07));
							ctx.stroke();
						}
					}
					if (kHead >= 1) {
						ctx.strokeStyle = `rgba(212,251,255,${.9 * fade})`;
						ctx.lineWidth = tile * .035;
						for (const side of [-1, 1]) {
							ctx.beginPath();
							ctx.arc(tile * .48, side * tile * .1, tile * (.16 + afterglow * .28), side < 0 ? -1.9 : 1.9, side < 0 ? -.35 : .35);
							ctx.stroke();
						}
					}
					ctx.restore();
					continue;
				}
				const minorArcaneBolt = m.kind === "arcaneBolt";
				if (minorArcaneBolt) {
					const head = along(kHead);
					const angle = Math.atan2(dyT, dxT);
					ctx.save();
					ctx.globalCompositeOperation = "lighter";
					ctx.globalAlpha = 1 - afterglow;
					ctx.strokeStyle = "rgba(202,92,255,0.72)";
					ctx.lineWidth = Math.max(1, tile * .017);
					for (let ring = 1; ring <= 2; ring += 1) {
						const back = along(Math.max(0, kHead - ring * .1));
						ctx.beginPath();
						ctx.ellipse(back.x, back.y, tile * (.09 + ring * .035), tile * (.025 + ring * .012), angle + Math.PI / 4, 0, Math.PI * 2);
						ctx.stroke();
					}
					ctx.fillStyle = "rgba(244,150,255,0.92)";
					ctx.beginPath();
					ctx.arc(head.x, head.y, tile * .035, 0, Math.PI * 2);
					ctx.fill();
					if (kHead >= 1) {
						ctx.strokeStyle = "rgba(255,110,220,0.88)";
						ctx.lineWidth = Math.max(1, tile * .014);
						for (let ray = 0; ray < 8; ray += 1) {
							const a = m.seed + ray * Math.PI / 4;
							const inner = tile * .05;
							const outer = tile * (.12 + .09 * afterglow);
							ctx.beginPath();
							ctx.moveTo(head.x + Math.cos(a) * inner, head.y + Math.sin(a) * inner * .55);
							ctx.lineTo(head.x + Math.cos(a) * outer, head.y + Math.sin(a) * outer * .55);
							ctx.stroke();
						}
					}
					ctx.restore();
					continue;
				}
				if (kHead > .02) {
					const steps = 16;
					ctx.beginPath();
					for (let i = 0; i <= steps; i++) {
						const p = along(i / steps * kHead);
						if (i === 0) ctx.moveTo(p.x, p.y);
						else ctx.lineTo(p.x, p.y);
					}
					const traceFade = (1 - afterglow) * (physicalArrow ? .13 : minorArcaneBolt ? .44 : .55);
					ctx.lineCap = "round";
					ctx.lineJoin = "round";
					ctx.lineWidth = tile * (physicalArrow ? .018 : minorArcaneBolt ? .028 : .05);
					ctx.strokeStyle = physicalArrow ? `rgba(218,224,226,${traceFade})` : `hsla(${m.hue}, 90%, 74%, ${traceFade})`;
					ctx.shadowColor = physicalArrow ? `rgba(218,224,226,${traceFade})` : `hsla(${m.hue}, 95%, 70%, ${traceFade})`;
					ctx.shadowBlur = tile * (physicalArrow ? .1 : .4);
					ctx.stroke();
					ctx.shadowBlur = 0;
				}
				if (afterglow < 1) {
					const cometCount = minorArcaneBolt ? 11 : 7;
					for (let i = cometCount; i >= 0; i--) {
						const p = along(Math.max(0, kHead - i * .05));
						const fade = (1 - i / 8) * (1 - afterglow);
						const r = tile * (physicalArrow ? .045 - i * .004 : (minorArcaneBolt ? .64 : 1) * (.16 - i * .016));
						if (r <= 0) continue;
						const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
						g.addColorStop(0, physicalArrow ? `rgba(228,232,234,${fade * .18})` : `hsla(${m.hue}, 95%, 86%, ${fade})`);
						g.addColorStop(.35, physicalArrow ? `rgba(150,158,162,${fade * .08})` : `hsla(${m.hue}, 92%, 68%, ${fade * .75})`);
						g.addColorStop(1, physicalArrow ? `rgba(120,130,136,0)` : `hsla(${m.hue}, 90%, 55%, 0)`);
						ctx.fillStyle = g;
						ctx.beginPath();
						ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
						ctx.fill();
					}
					const head = along(kHead);
					const auraFade = 1 - afterglow;
					const aura = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, tile * (physicalArrow ? .16 : minorArcaneBolt ? .34 : .55));
					aura.addColorStop(0, physicalArrow ? `rgba(230,234,236,${.1 * auraFade})` : `hsla(${m.hue}, 100%, 85%, ${(minorArcaneBolt ? .34 : .55) * auraFade})`);
					aura.addColorStop(1, physicalArrow ? `rgba(180,188,192,0)` : `hsla(${m.hue}, 100%, 60%, 0)`);
					ctx.fillStyle = aura;
					ctx.beginPath();
					ctx.arc(head.x, head.y, tile * (physicalArrow ? .16 : minorArcaneBolt ? .34 : .55), 0, Math.PI * 2);
					ctx.fill();
					if (minorArcaneBolt) {
						ctx.save();
						ctx.globalCompositeOperation = "lighter";
						ctx.globalAlpha = auraFade;
						const core = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, tile * .18);
						core.addColorStop(0, "rgba(255,242,200,0.98)");
						core.addColorStop(.22, "rgba(255,104,58,0.9)");
						core.addColorStop(.62, "rgba(182,20,27,0.35)");
						core.addColorStop(1, "rgba(110,0,8,0)");
						ctx.fillStyle = core;
						ctx.beginPath();
						ctx.arc(head.x, head.y, tile * .18, 0, Math.PI * 2);
						ctx.fill();
						ctx.strokeStyle = "rgba(255,96,55,0.72)";
						ctx.lineWidth = Math.max(1, tile * .018);
						for (let spark = 0; spark < 12; spark += 1) {
							const a = m.seed + spark * 2.399 + this.time * (2.2 + spark * .09);
							const radius = tile * (.12 + spark * 7 % 6 * .018);
							const x = head.x + Math.cos(a) * radius;
							const y = head.y + Math.sin(a) * radius * .55;
							ctx.beginPath();
							ctx.moveTo(x, y);
							ctx.lineTo(x - Math.cos(a) * tile * .065, y - Math.sin(a) * tile * .04);
							ctx.stroke();
						}
						ctx.restore();
					}
					const projectileCore = m.kind === "fireball" ? this.art.fireballCore : m.kind === "causticVenom" || m.kind === "minorVenom" ? this.art.causticVenomCore : null;
					if (m.kind === "longShot" && this.art.arrowCore) {
						const angle = Math.atan2(dyT, dxT);
						ctx.save();
						ctx.translate(head.x, head.y);
						ctx.rotate(angle);
						ctx.globalCompositeOperation = "source-over";
						ctx.globalAlpha = auraFade;
						ctx.drawImage(this.art.arrowCore, -tile * .56, -tile * .22, tile * 1.12, tile * .44);
						ctx.restore();
					}
					if (projectileCore) {
						const img = projectileCore;
						const flightAngle = Math.atan2(dyT, dxT);
						const pulse = 1 + .05 * Math.sin(this.time * 13 + m.seed);
						const w = tile * 1.9 * pulse;
						const h = w * img.naturalHeight / img.naturalWidth;
						ctx.save();
						ctx.translate(head.x, head.y);
						ctx.rotate(flightAngle - Math.PI / 4);
						ctx.globalCompositeOperation = "source-over";
						ctx.globalAlpha = auraFade;
						ctx.drawImage(img, -w / 2, -h / 2, w, h);
						ctx.restore();
					}
					ctx.fillStyle = `rgba(255,255,255,${(physicalArrow ? 0 : .95) * auraFade})`;
					ctx.beginPath();
					ctx.arc(head.x, head.y, tile * (minorArcaneBolt ? .05 : .085), 0, Math.PI * 2);
					ctx.fill();
				}
			}
			ctx.globalAlpha = 1;
		}
		if (this.lightningFxLive) {
			for (const l of this.lightningFx) {
				if (!l.live) continue;
				const t3 = l.power === "t3";
				const raio = l.power === "raio";
				const divine = l.power === "divine";
				const divineSplash = l.power === "divineSplash";
				const { cx, cy } = this.hexCenter(l.x, l.y);
				const topY = t3 ? -tile * .2 : cy - tile * (raio || divine ? LIGHTNING_RAIO_FALL_HEIGHT : divineSplash ? 1.1 : LIGHTNING_FALL_HEIGHT);
				const k = l.t / l.max;
				const reveal = Math.min(1, l.t / (t3 ? .07 : raio || divine ? .1 : divineSplash ? .045 : .06));
				const hold = t3 ? .32 : raio || divine ? .28 : .35;
				const fade = k < hold ? 1 : Math.max(0, 1 - (k - hold) / (1 - hold));
				if (fade <= 0) continue;
				ctx.save();
				ctx.globalCompositeOperation = "lighter";
				const pulse = t3 || divine || divineSplash ? .82 + .18 * Math.abs(Math.sin(l.t * 52 + l.hue)) : 1;
				const strobe = l.t < .05 ? 1 : l.t < .08 ? .22 : l.t < .14 ? 1 : l.t < .17 ? .35 : l.t < .21 ? .95 : .8;
				const glow = fade * pulse * strobe;
				const makeRng = (s) => () => {
					s = s + 1831565813 >>> 0;
					let r = Math.imul(s ^ s >>> 15, 1 | s);
					r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
					return ((r ^ r >>> 14) >>> 0) / 4294967296;
				};
				const baseSeed = (Math.floor(l.hue * 1e3) ^ Math.floor((l.segs[0] ?? 0) * 1e6) ^ l.branches.length * 7919) >>> 0;
				const rnd = makeRng(baseSeed);
				const minSeg = tile * .08;
				const zig = (ax, ay, bx, by, rough, r) => {
					const out = [{
						x: ax,
						y: ay
					}];
					const rec = (x0, y0, x1, y1, d) => {
						const dx = x1 - x0;
						const dy = y1 - y0;
						const len = Math.hypot(dx, dy);
						if (len < minSeg) {
							out.push({
								x: x1,
								y: y1
							});
							return;
						}
						const off = (r() - .5) * d;
						const mx = (x0 + x1) / 2 - dy / len * off;
						const my = (y0 + y1) / 2 + dx / len * off;
						rec(x0, y0, mx, my, d * .55);
						rec(mx, my, x1, y1, d * .55);
					};
					rec(ax, ay, bx, by, Math.hypot(bx - ax, by - ay) * rough);
					return out;
				};
				const main = zig(cx + (rnd() - .5) * tile * (t3 ? .5 : 1.1), topY, cx, cy, t3 ? .14 : .2, rnd);
				const mainShown = Math.max(2, Math.ceil(main.length * reveal));
				const forks = [];
				for (const b of l.branches) {
					const idx = Math.min(main.length - 2, Math.floor(b.at * main.length));
					const start = main[idx];
					const ang = Math.PI / 2 + b.side * (.35 + rnd() * .55);
					const len = Math.max(tile * .6, (cy - start.y) * (.3 + rnd() * .35));
					const pts = zig(start.x, start.y, start.x + Math.cos(ang) * len, start.y + Math.sin(ang) * len, .3, rnd);
					const forkReveal = Math.max(0, Math.min(1, (reveal - b.at) / (1 - b.at + .001)));
					const shown = idx < mainShown ? Math.ceil(pts.length * forkReveal) : 0;
					forks.push({
						pts,
						shown,
						w: .55,
						a: .8
					});
					if (rnd() < .65) {
						const sIdx = Math.floor(pts.length * (.3 + rnd() * .4));
						const s = pts[sIdx];
						const sAng = ang + b.side * (.3 + rnd() * .5);
						const sLen = len * (.3 + rnd() * .25);
						const sub = zig(s.x, s.y, s.x + Math.cos(sAng) * sLen, s.y + Math.sin(sAng) * sLen, .32, rnd);
						forks.push({
							pts: sub,
							shown: shown > sIdx ? Math.ceil(sub.length * Math.min(1, (shown - sIdx) / Math.max(1, pts.length - sIdx))) : 0,
							w: .32,
							a: .55
						});
					}
				}
				const mainW = t3 ? 2.2 : divine ? 1.8 : raio ? 1.5 : divineSplash ? .85 : 1;
				const drawChannel = (pts, shown, w, a) => {
					if (shown < 2) return;
					ctx.beginPath();
					ctx.moveTo(pts[0].x, pts[0].y);
					for (let i = 1; i < shown; i++) ctx.lineTo(pts[i].x, pts[i].y);
					ctx.lineJoin = "round";
					ctx.lineCap = "round";
					ctx.shadowColor = `hsla(${l.hue}, 100%, 66%, ${Math.min(1, a * glow)})`;
					ctx.shadowBlur = tile * .45 * w;
					ctx.strokeStyle = `hsla(${l.hue}, 100%, 64%, ${.42 * a * glow})`;
					ctx.lineWidth = tile * .085 * w;
					ctx.stroke();
					ctx.shadowBlur = 0;
					ctx.strokeStyle = `hsla(${l.hue}, 100%, 86%, ${.8 * a * glow})`;
					ctx.lineWidth = tile * .032 * w;
					ctx.stroke();
					ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, a * glow)})`;
					ctx.lineWidth = Math.max(1, tile * .014 * w);
					ctx.stroke();
				};
				for (const f of forks) drawChannel(f.pts, f.shown, mainW * f.w, f.a);
				drawChannel(main, mainShown, mainW, 1);
				if (mainShown >= main.length && k < .5) {
					const crackle = makeRng((baseSeed ^ Math.floor(l.t * 40) * 2654435761) >>> 0);
					const arcs = t3 ? 6 : raio || divine ? 5 : 3;
					const reachT = tile * (t3 ? 1.3 : divine ? 1.15 : raio ? .9 : divineSplash ? .42 : .6);
					for (let i = 0; i < arcs; i++) {
						const ang = crackle() * Math.PI * 2;
						const len = reachT * (.45 + crackle() * .55);
						const arc = zig(cx, cy, cx + Math.cos(ang) * len, cy + Math.sin(ang) * len * .5, .35, crackle);
						drawChannel(arc, arc.length, mainW * .3, .7 * (1 - k / .5));
					}
				}
				const flashDuration = t3 ? .62 : divine ? .58 : raio ? .55 : .5;
				if (k < flashDuration) {
					const flashFade = Math.max(0, 1 - k / flashDuration);
					const flashR = tile * (t3 ? 2.1 : divine ? 1.7 : raio ? 1.55 : divineSplash ? .48 : .9);
					const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
					flash.addColorStop(0, `hsla(${l.hue}, 100%, 94%, ${(t3 ? .98 : divine ? .96 : raio ? .92 : divineSplash ? .68 : .7) * flashFade * pulse})`);
					flash.addColorStop(.32, `hsla(${l.hue}, 100%, 78%, ${(t3 ? .55 : divine ? .52 : raio ? .45 : divineSplash ? .22 : .3) * flashFade})`);
					flash.addColorStop(1, `hsla(${l.hue}, 100%, 70%, 0)`);
					ctx.fillStyle = flash;
					ctx.beginPath();
					ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.restore();
			}
			ctx.globalAlpha = 1;
		}
		this.drawChargeFx(ctx, tile);
		this.drawHolyFx(ctx, tile);
		for (const fx of this.turnUndeadFx) drawTurnUndeadV4(ctx, fx.tiles.map((p) => {
			const { cx, cy } = this.hexCenter(p.x, p.y);
			return {
				x: cx,
				y: cy,
				corners: Array.from({ length: 6 }, (_, i) => {
					const angle = (60 * i - 30) * Math.PI / 180;
					return [cx + tile * Math.cos(angle), cy + tile * Math.sin(angle)];
				})
			};
		}), fx.t);
		this.drawBladeFx(ctx, tile);
		for (const fx of this.provokeFx) {
			const target = this.units.find((u) => u.id === fx.unitId && u.alive);
			if (!target || !this.targetable(target)) continue;
			const { cx, cy } = this.hexCenter(target.x, target.y);
			drawProvokeVFX(ctx, cx, cy - tile * .15, tile * 1.1, fx.t);
		}
		if (!skipGroundDecor) this.drawDecorations(ctx, tile, cssW, cssH, "ground", {
			after: lastGroundDecorDepth,
			through: Infinity
		});
		if (!skipFrontDecor) this.drawDecorations(ctx, tile, cssW, cssH, "front");
		if (shake) ctx.restore();
	}
	healHaloRgb(kind) {
		if (kind === "bless") return {
			core: "255,250,216",
			mid: "255,189,67"
		};
		if (kind === "disease") return {
			core: "200,255,230",
			mid: "70,210,160"
		};
		if (kind === "potion") return {
			core: "255,230,170",
			mid: "255,150,60"
		};
		if (kind === "holyMedium") return {
			core: "255,250,220",
			mid: "255,210,90"
		};
		if (kind === "healingHands") return {
			core: "255,249,225",
			mid: "255,215,120"
		};
		if (kind === "food") return {
			core: "225,242,255",
			mid: "110,175,255"
		};
		if (kind === "holyMinor") return {
			core: "255,248,230",
			mid: "255,220,150"
		};
		return {
			core: "255,250,235",
			mid: "255,248,224"
		};
	}
	/** Bull Rush's charge: a Flash-style golden speed streak from where the charge started to
	* the charger, with speed lines and flickering crackles along it — drawn only while the
	* charge move itself is playing. */
	drawChargeFx(ctx, tile) {
		const a = this.active;
		if (!a || a.type !== "move" || !a.charge || this.reducedMotion) return;
		const u = this.units.find((n) => n.id === a.id);
		const origin = a.path[0];
		if (!u || !origin) return;
		const head = this.unitPixel(u);
		this.drawRushStreak(ctx, tile, this.hexCenter(origin.x, origin.y), head, 1);
	}
	/** The golden speed streak from `o` to `head` (screen space, hex centres), at `alpha`. */
	drawRushStreak(ctx, tile, o, head, alpha) {
		const hy = head.cy - tile * .45;
		const oy = o.cy - tile * .45;
		const dx = head.cx - o.cx;
		const dy = hy - oy;
		const len = Math.hypot(dx, dy);
		if (len < 1 || alpha <= .01) return;
		const nx = -dy / len;
		const ny = dx / len;
		const flick = Math.floor(this.time * 30);
		const rnd = (n) => {
			const v = Math.sin(n * 12.9898 + flick * 78.233) * 43758.5453;
			return v - Math.floor(v);
		};
		ctx.save();
		ctx.globalCompositeOperation = "lighter";
		ctx.globalAlpha = alpha;
		ctx.lineCap = "round";
		const band = ctx.createLinearGradient(o.cx, oy, head.cx, hy);
		band.addColorStop(0, "rgba(255,200,80,0)");
		band.addColorStop(.6, "rgba(255,190,70,0.28)");
		band.addColorStop(1, "rgba(255,240,190,0.75)");
		const wHead = tile * .42;
		ctx.fillStyle = band;
		ctx.beginPath();
		ctx.moveTo(o.cx, oy);
		ctx.lineTo(head.cx + nx * wHead, hy + ny * wHead);
		ctx.lineTo(head.cx - nx * wHead, hy - ny * wHead);
		ctx.closePath();
		ctx.fill();
		for (let i = 0; i < 9; i++) {
			const off = (rnd(i + 1) - .5) * tile * .9;
			const back = tile * (.6 + rnd(i + 20) * 1.6);
			const sx = head.cx + nx * off - dx / len * tile * .2;
			const sy = hy + ny * off - dy / len * tile * .2;
			ctx.strokeStyle = `rgba(255,236,180,${.35 + rnd(i + 40) * .45})`;
			ctx.lineWidth = Math.max(1, tile * .025);
			ctx.beginPath();
			ctx.moveTo(sx, sy);
			ctx.lineTo(sx - dx / len * back, sy - dy / len * back);
			ctx.stroke();
		}
		ctx.shadowColor = "rgba(255,210,90,0.95)";
		ctx.shadowBlur = tile * .25;
		for (let c = 0; c < 4; c++) {
			const f = .35 + rnd(c + 60) * .6;
			let x = o.cx + dx * f;
			let y = oy + dy * f;
			ctx.strokeStyle = `rgba(255,250,220,${.6 + rnd(c + 70) * .4})`;
			ctx.lineWidth = Math.max(1, tile * .02);
			ctx.beginPath();
			ctx.moveTo(x, y);
			for (let k = 0; k < 4; k++) {
				x += (rnd(c * 9 + k + 80) - .5) * tile * .5;
				y += (rnd(c * 9 + k + 90) - .5) * tile * .5;
				ctx.lineTo(x, y);
			}
			ctx.stroke();
		}
		ctx.restore();
	}
	drawHolyFx(ctx, tile) {
		if (!this.holyFxLive) return;
		for (const fx of this.holyFx) {
			if (!fx.live) continue;
			const u = fx.unitId ? this.units.find((n) => n.id === fx.unitId) : null;
			const pos = u ? this.hexCenter(u.drawX, u.drawY) : this.hexCenter(fx.x, fx.y);
			const cx = pos.cx;
			const cy = pos.cy;
			const k = fx.t / fx.max;
			const appear = Math.min(1, fx.t / .07);
			const hold = fx.kind === "medium" || fx.kind === "food" ? .36 : fx.kind === "hands" ? .31 : fx.kind === "disease" ? .32 : .26;
			const fade = (k < hold ? 1 : Math.max(0, 1 - (k - hold) / (1 - hold))) * appear;
			if (fade <= 0) continue;
			ctx.save();
			ctx.globalCompositeOperation = "lighter";
			if (fx.kind === "potion") this.drawPotionBurst(ctx, cx, cy, tile, fx, fade, k);
			else this.drawDivineLight(ctx, cx, cy, tile, fx, fade, k);
			ctx.restore();
		}
		ctx.globalAlpha = 1;
	}
	/** Summon Familiar's conjuring circle — a blue magic ring that opens on the ground, holds,
	* then closes, drawn on the ground layer (before the sorted unit-sprite pass) so the
	* familiar visibly steps out of it as its own fade-in ramps up (see castSummonFamiliar /
	* the `else if (u.alive && u.fade < 1)` tick branch) instead of just popping in next to an
	* unrelated puff of particles. */
	/** Whether any summoning portal is open — see ThreeBattleRenderer.syncPortalFx. */
	portalFxActive() {
		return this.portalFxLive > 0;
	}
	/** Paints the open portals (screen-space, same as the 2D overlay) onto `ctx`. Used by
	* ThreeBattleRenderer to show them as a ground layer beneath units. */
	drawPortalFxLayer(ctx) {
		this.drawPortalFx(ctx, ZOOM_RADII[this.zoom]);
	}
	/** Screen-space box around every open portal (circle, glow, rising motes, light column),
	* so ThreeBattleRenderer only repaints/uploads that area instead of the whole viewport. */
	portalFxBounds() {
		if (!this.portalFxLive) return null;
		const tile = ZOOM_RADII[this.zoom];
		let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
		for (const p of this.portalFx) {
			if (!p.live) continue;
			let cx, cy, maxR = tile * .95;
			if (p.body) {
				const cells = footprint({
					x: p.x,
					y: p.y,
					size: 4,
					footprintOffsets: p.body
				}).map((c) => this.hexCenter(c.x, c.y));
				cx = cells.reduce((s, c) => s + c.cx, 0) / cells.length;
				cy = cells.reduce((s, c) => s + c.cy, 0) / cells.length;
				maxR = Math.max(maxR, Math.max(...cells.map((c) => Math.abs(c.cx - cx))) + tile * .95);
			} else ({cx, cy} = this.hexCenter(p.x, p.y));
			const big = maxR / (tile * .95);
			const rx = maxR * 1.3 + tile * .4;
			const up = Math.max(maxR * .8, tile * (1.6 + big * .9), tile * (.9 + big * .4)) + tile * .4;
			x0 = Math.min(x0, cx - rx);
			x1 = Math.max(x1, cx + rx);
			y0 = Math.min(y0, cy - up);
			y1 = Math.max(y1, cy + maxR * .8 + tile * .4);
		}
		return x1 > x0 ? {
			x0,
			y0,
			x1,
			y1
		} : null;
	}
	drawPortalFx(ctx, tile) {
		if (!this.portalFxLive) return;
		const ease = (x) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3;
		for (const p of this.portalFx) {
			if (!p.live) continue;
			let cx;
			let cy;
			let maxR = tile * .95;
			if (p.body) {
				const cells = footprint({
					x: p.x,
					y: p.y,
					size: 4,
					footprintOffsets: p.body
				}).map((c) => this.hexCenter(c.x, c.y));
				cx = cells.reduce((s, c) => s + c.cx, 0) / cells.length;
				cy = cells.reduce((s, c) => s + c.cy, 0) / cells.length;
				const spread = Math.max(...cells.map((c) => Math.abs(c.cx - cx)));
				maxR = Math.max(maxR, spread + tile * .95);
			} else ({cx, cy} = this.hexCenter(p.x, p.y));
			const k = p.t / p.max;
			const openEnd = .35;
			const closeStart = .65;
			const radiusK = k < openEnd ? ease(k / openEnd) : k < closeStart ? 1 : Math.max(0, 1 - ease((k - closeStart) / .35));
			if (radiusK <= .01) continue;
			const big = maxR / (tile * .95);
			const r = maxR * radiusK;
			const flat = .55;
			const spin = p.t * 3.2 + p.seed;
			const pal = (blue, red) => p.red ? red : blue;
			ctx.save();
			ctx.globalCompositeOperation = "lighter";
			const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
			glow.addColorStop(0, `rgba(${pal("150,195,255", "255,150,130")},${.55 * radiusK})`);
			glow.addColorStop(.6, `rgba(${pal("95,145,255", "235,70,55")},${.32 * radiusK})`);
			glow.addColorStop(1, pal("rgba(60,110,255,0)", "rgba(180,20,20,0)"));
			ctx.fillStyle = glow;
			ctx.beginPath();
			ctx.ellipse(cx, cy, r * 1.3, r * 1.3 * flat, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.lineCap = "round";
			ctx.shadowColor = pal("rgba(140,190,255,0.9)", "rgba(255,90,70,0.9)");
			ctx.shadowBlur = tile * .2;
			const arms = big > 1.5 ? 5 : 4;
			for (let i = 0; i < arms; i++) {
				const base = spin * 2.1 + i / arms * Math.PI * 2;
				ctx.strokeStyle = `rgba(${pal("185,220,255", "255,170,150")},${.5 * radiusK})`;
				ctx.lineWidth = Math.max(1, tile * .03);
				ctx.beginPath();
				for (let s = 0; s <= 14; s++) {
					const f = s / 14;
					const a = base + f * 2.4;
					const rr = r * .85 * (1 - f);
					const x = cx + Math.cos(a) * rr;
					const y = cy + Math.sin(a) * rr * flat;
					if (s === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.stroke();
			}
			ctx.strokeStyle = `rgba(${pal("200,230,255", "255,190,175")},${.75 * radiusK})`;
			ctx.lineWidth = Math.max(1, tile * .02);
			ctx.shadowBlur = tile * .2;
			ctx.beginPath();
			ctx.ellipse(cx, cy, r * 1.08, r * 1.08 * flat, 0, 0, Math.PI * 2);
			ctx.stroke();
			const ticks = Math.round(18 * Math.max(1, big * .8));
			ctx.lineWidth = Math.max(1, tile * .025);
			for (let i = 0; i < ticks; i++) {
				const a = -spin * .6 + i / ticks * Math.PI * 2;
				const x0 = cx + Math.cos(a) * r * .96;
				const y0 = cy + Math.sin(a) * r * .96 * flat;
				const x1 = cx + Math.cos(a) * r * 1.08;
				const y1 = cy + Math.sin(a) * r * 1.08 * flat;
				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
				ctx.stroke();
			}
			const segs = 10;
			ctx.strokeStyle = `rgba(${pal("175,218,255", "255,150,130")},${.85 * radiusK})`;
			ctx.lineWidth = Math.max(1.5, tile * .035);
			ctx.shadowBlur = tile * .25;
			for (let i = 0; i < segs; i++) {
				const a0 = spin + i / segs * Math.PI * 2;
				const a1 = a0 + Math.PI * 2 / segs * .55;
				ctx.beginPath();
				ctx.ellipse(cx, cy, r, r * flat, 0, a0, a1);
				ctx.stroke();
			}
			ctx.strokeStyle = `rgba(${pal("222,240,255", "255,215,205")},${.7 * radiusK})`;
			ctx.lineWidth = Math.max(1, tile * .018);
			ctx.shadowBlur = tile * .15;
			const innerSegs = 6;
			for (let i = 0; i < innerSegs; i++) {
				const a0 = -spin * 1.4 + i / innerSegs * Math.PI * 2;
				const a1 = a0 + Math.PI * 2 / innerSegs * .6;
				ctx.beginPath();
				ctx.ellipse(cx, cy, r * .6, r * .6 * flat, 0, a0, a1);
				ctx.stroke();
			}
			ctx.shadowBlur = 0;
			if (!p.red) {
				const colH = tile * (1.6 + big * .9) * radiusK;
				const colW = r * .75;
				const col = ctx.createLinearGradient(cx, cy, cx, cy - colH);
				col.addColorStop(0, `rgba(170,210,255,${.32 * radiusK})`);
				col.addColorStop(.5, `rgba(120,170,255,${.14 * radiusK})`);
				col.addColorStop(1, "rgba(90,140,255,0)");
				ctx.fillStyle = col;
				ctx.beginPath();
				ctx.moveTo(cx - colW, cy);
				ctx.quadraticCurveTo(cx - colW * .55, cy - colH * .5, cx - colW * .3, cy - colH);
				ctx.lineTo(cx + colW * .3, cy - colH);
				ctx.quadraticCurveTo(cx + colW * .55, cy - colH * .5, cx + colW, cy);
				ctx.ellipse(cx, cy, colW, colW * flat, 0, 0, Math.PI);
				ctx.closePath();
				ctx.fill();
			}
			const motes = Math.round(8 * Math.max(1, big));
			for (let i = 0; i < motes; i++) {
				const ang = p.seed + i * 2.4;
				const rise = (p.t * .6 + i * .17) % 1;
				const mx = cx + Math.cos(ang) * r * .6;
				const my = cy + Math.sin(ang) * r * .6 * flat - rise * tile * (.9 + big * .4);
				ctx.fillStyle = `rgba(${pal("195,222,255", "255,180,160")},${(1 - rise) * .7 * radiusK})`;
				ctx.beginPath();
				ctx.arc(mx, my, tile * .028, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}
	}
	/** The shared steel-swoosh visual — see BladeFx/BladeKind. Every shape here is plain
	* white-steel light (glow pass + bright core pass), the same treatment a real blade catches
	* the light with, and never fire or a magic-circle glow. */
	drawBladeFx(ctx, tile) {
		if (!this.bladeFxLive) return;
		for (const b of this.bladeFx) {
			if (!b.live) continue;
			const k = b.t / b.max;
			const { cx, cy } = this.hexCenter(b.x, b.y);
			ctx.save();
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			if (b.kind === "arc") {
				const swing = Math.min(1, k / .42);
				const fadeStart = .48;
				const fade = k < fadeStart ? 1 : Math.max(0, 1 - (k - fadeStart) / .52);
				if (fade > .01) {
					const rOuter = tile * 2.05;
					const rInner = tile * .95;
					const end = b.a0 + (b.a1 - b.a0) * swing;
					const path = new Path2D();
					path.arc(cx, cy, rOuter, b.a0, end, false);
					path.arc(cx, cy, rInner, end, b.a0, true);
					path.closePath();
					ctx.globalCompositeOperation = "source-over";
					ctx.globalAlpha = fade;
					ctx.strokeStyle = "rgba(10,14,22,0.85)";
					ctx.lineWidth = tile * .055;
					ctx.stroke(path);
					const grad = ctx.createRadialGradient(cx, cy, rInner, cx, cy, rOuter);
					if (b.warm) {
						grad.addColorStop(0, "rgba(255,150,60,0.12)");
						grad.addColorStop(.42, "rgba(255,255,255,0.97)");
						grad.addColorStop(.75, "rgba(255,195,120,0.92)");
						grad.addColorStop(1, "rgba(255,140,50,0.1)");
					} else {
						grad.addColorStop(0, "rgba(170,205,255,0.12)");
						grad.addColorStop(.42, "rgba(255,255,255,0.98)");
						grad.addColorStop(.75, "rgba(205,228,255,0.92)");
						grad.addColorStop(1, "rgba(150,195,255,0.1)");
					}
					ctx.fillStyle = grad;
					ctx.fill(path);
					ctx.globalCompositeOperation = "lighter";
					ctx.shadowColor = b.warm ? "rgba(255,150,55,0.9)" : "rgba(190,220,255,0.9)";
					ctx.shadowBlur = tile * .4;
					ctx.fillStyle = b.warm ? `rgba(255,180,100,${.3 * fade})` : `rgba(205,228,255,${.3 * fade})`;
					ctx.fill(path);
					ctx.shadowBlur = 0;
					if (swing < 1) {
						const midR = (rOuter + rInner) / 2;
						const tipX = cx + Math.cos(end) * midR;
						const tipY = cy + Math.sin(end) * midR;
						const flash = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, tile * .42);
						flash.addColorStop(0, `rgba(255,255,255,${.95 * fade})`);
						flash.addColorStop(1, "rgba(255,255,255,0)");
						ctx.fillStyle = flash;
						ctx.beginPath();
						ctx.arc(tipX, tipY, tile * .42, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			} else if (b.kind === "rushTrail") this.drawRushStreak(ctx, tile, this.hexCenter(b.x, b.y), this.hexCenter(b.toX, b.toY), Math.max(0, 1 - k));
			else if (b.kind === "rushImpact") {
				const fade = Math.max(0, 1 - k);
				const chestY = cy - tile * .45;
				ctx.globalCompositeOperation = "lighter";
				const flash = ctx.createRadialGradient(cx, chestY, 0, cx, chestY, tile * (.7 + k * .8));
				flash.addColorStop(0, `rgba(255,248,215,${.85 * fade})`);
				flash.addColorStop(.4, `rgba(255,200,80,${.45 * fade})`);
				flash.addColorStop(1, "rgba(255,160,40,0)");
				ctx.fillStyle = flash;
				ctx.beginPath();
				ctx.arc(cx, chestY, tile * (.7 + k * .8), 0, Math.PI * 2);
				ctx.fill();
				ctx.lineCap = "round";
				ctx.shadowColor = "rgba(255,210,90,0.95)";
				ctx.shadowBlur = tile * .3;
				for (let j = 0; j < 3; j++) {
					const r = tile * (.35 + k * 1.5) - j * tile * .22;
					if (r <= 0) continue;
					ctx.strokeStyle = `rgba(255,${230 - j * 30},${170 - j * 50},${(.9 - j * .22) * fade})`;
					ctx.lineWidth = Math.max(1.5, tile * (.08 - j * .02));
					ctx.beginPath();
					ctx.arc(cx - Math.cos(b.a0) * tile * .3, chestY - Math.sin(b.a0) * tile * .3, r, b.a0 - .85, b.a0 + .85);
					ctx.stroke();
				}
				ctx.shadowBlur = 0;
				for (let i = 0; i < 10; i++) {
					const ang = b.a0 + Math.sin(b.seed * 9.7 + i * 5.3) * .5 * 1.3;
					const r0 = tile * (.25 + k * .6);
					const r1 = r0 + tile * (.3 + i % 3 * .15) * (1 - k * .5);
					ctx.strokeStyle = `rgba(255,236,180,${.85 * fade})`;
					ctx.lineWidth = Math.max(1, tile * .025);
					ctx.beginPath();
					ctx.moveTo(cx + Math.cos(ang) * r0, chestY + Math.sin(ang) * r0 * .7);
					ctx.lineTo(cx + Math.cos(ang) * r1, chestY + Math.sin(ang) * r1 * .7);
					ctx.stroke();
				}
			} else if (b.kind === "execution") {
				const exec = b.warm;
				const sz = exec ? 1.35 : 1;
				const fall = Math.min(1, k / .28);
				const fade = k < .4 ? 1 : Math.max(0, 1 - (k - .4) / .6);
				if (fade > .01) {
					const topY = cy - tile * 2.2 * sz;
					const botY = cy + tile * .15;
					const headY = topY + (botY - topY) * fall * fall;
					const w = tile * .8 * sz;
					const blade = new Path2D();
					const side = b.mirrorX ? -1 : 1;
					blade.moveTo(cx - w * .25 * side, topY);
					blade.quadraticCurveTo(cx + w * 1.7 * side, (topY + headY) / 2, cx, headY);
					blade.quadraticCurveTo(cx + w * .15 * side, (topY + headY) / 2, cx - w * .25 * side, topY);
					blade.closePath();
					ctx.globalCompositeOperation = "source-over";
					ctx.globalAlpha = fade;
					ctx.strokeStyle = "rgba(10,12,18,0.85)";
					ctx.lineWidth = tile * .07;
					ctx.stroke(blade);
					ctx.fillStyle = exec ? "rgba(255,226,218,0.97)" : "rgba(244,248,255,0.97)";
					ctx.fill(blade);
					ctx.globalCompositeOperation = "lighter";
					ctx.shadowColor = exec ? "rgba(255,40,28,0.95)" : "rgba(210,228,255,0.9)";
					ctx.shadowBlur = tile * .45 * sz;
					ctx.fillStyle = exec ? `rgba(255,70,50,${.55 * fade})` : `rgba(200,225,255,${.45 * fade})`;
					ctx.fill(blade);
					ctx.shadowBlur = 0;
					if (fall >= 1) {
						const ik = Math.min(1, (k - .28) / .5);
						const r = tile * (.4 + ik * 1.2) * sz;
						ctx.strokeStyle = exec ? `rgba(255,60,40,${.8 * (1 - ik)})` : `rgba(230,238,255,${.7 * (1 - ik)})`;
						ctx.lineWidth = Math.max(1.5, tile * .06 * (1 - ik));
						ctx.beginPath();
						ctx.ellipse(cx, botY, r, r * .35, 0, 0, Math.PI * 2);
						ctx.stroke();
						ctx.strokeStyle = exec ? `rgba(255,120,90,${.7 * (1 - ik)})` : `rgba(220,230,245,${.6 * (1 - ik)})`;
						ctx.lineWidth = Math.max(1, tile * .025);
						for (let i = 0; i < 6; i++) {
							const a = b.seed + i * 1.05;
							const len = tile * (.5 + i % 3 * .18) * sz * Math.min(1, ik * 2.5);
							ctx.beginPath();
							ctx.moveTo(cx, botY);
							ctx.lineTo(cx + Math.cos(a) * len * .5, botY + Math.sin(a) * len * .18);
							ctx.lineTo(cx + Math.cos(a + .25) * len, botY + Math.sin(a + .25) * len * .35);
							ctx.stroke();
						}
						if (exec) {
							const chestY = cy - tile * .6;
							const flash = ctx.createRadialGradient(cx, chestY, 0, cx, chestY, tile * 1.4);
							flash.addColorStop(0, `rgba(255,120,90,${.6 * (1 - ik)})`);
							flash.addColorStop(1, "rgba(160,0,0,0)");
							ctx.fillStyle = flash;
							ctx.beginPath();
							ctx.arc(cx, chestY, tile * 1.4, 0, Math.PI * 2);
							ctx.fill();
						}
					}
				}
			} else if (b.kind === "tripSweep") {
				const sweep = Math.min(1, k / .35);
				const fade = k < .45 ? 1 : Math.max(0, 1 - (k - .45) / .55);
				if (fade > .01) {
					const dirSign = Math.cos(b.a0) >= 0 ? 1 : -1;
					const fy = cy + tile * .32;
					const rx = tile * .95;
					const ry = tile * .3;
					const aStart = dirSign > 0 ? Math.PI : 0;
					const aEnd = aStart - dirSign * Math.PI * Math.max(.02, sweep);
					const ccw = dirSign > 0;
					const cut = new Path2D();
					cut.ellipse(cx, fy, rx, ry, 0, aStart, aEnd, ccw);
					cut.ellipse(cx, fy, rx * .7, ry * .5, 0, aEnd, aStart, !ccw);
					cut.closePath();
					ctx.globalCompositeOperation = "source-over";
					ctx.globalAlpha = fade;
					ctx.strokeStyle = "rgba(10,12,18,0.85)";
					ctx.lineWidth = tile * .06;
					ctx.stroke(cut);
					ctx.fillStyle = "rgba(244,248,255,0.96)";
					ctx.fill(cut);
					ctx.globalCompositeOperation = "lighter";
					ctx.shadowColor = "rgba(210,228,255,0.9)";
					ctx.shadowBlur = tile * .3;
					ctx.fillStyle = `rgba(200,225,255,${.45 * fade})`;
					ctx.fill(cut);
					ctx.shadowBlur = 0;
					const bk = (k - .25) / .75;
					if (bk > 0) {
						ctx.globalCompositeOperation = "source-over";
						const shinY = cy + tile * .05;
						for (let i = 0; i < 14; i++) {
							const hash = (n) => {
								const v = Math.sin(n * 12.9898 + b.seed * 78.233) * 43758.5453;
								return v - Math.floor(v);
							};
							const r1 = hash(i + 1);
							const r2 = hash(i + 31);
							const vx = (dirSign * (.2 + r1 * 1.1) + (r2 - .5) * 1.2) * tile;
							const vy = (.5 + r2 * 1.2) * tile;
							const x = cx + vx * bk;
							const y = shinY - vy * bk + tile * 1.9 * bk * bk;
							const size = tile * (.05 + r1 * .045) * (1 - bk * .35);
							ctx.globalAlpha = fade * Math.min(1, (1 - bk) * 2);
							ctx.fillStyle = "rgba(168,12,18,0.97)";
							ctx.beginPath();
							ctx.ellipse(x, y, size, size * 1.35, Math.atan2(vy, vx), 0, Math.PI * 2);
							ctx.fill();
							ctx.fillStyle = "rgba(255,95,90,0.85)";
							ctx.beginPath();
							ctx.arc(x - size * .3, y - size * .3, size * .35, 0, Math.PI * 2);
							ctx.fill();
						}
					}
				}
			} else if (b.kind === "cross" || b.kind === "lowCut") {
				const low = b.kind === "lowCut";
				const fade = Math.max(0, 1 - k * (low ? 1.25 : 1.1));
				if (fade > .01) {
					const len = tile * (low ? .78 : 1.05);
					const ang = low ? .07 : b.a0;
					const oy = low ? tile * .3 : -tile * .15;
					const dx = Math.cos(ang) * len * .5;
					const dy = Math.sin(ang) * len * .5;
					ctx.translate(cx, cy + oy);
					ctx.globalCompositeOperation = "source-over";
					ctx.globalAlpha = fade;
					ctx.strokeStyle = "rgba(10,14,22,0.85)";
					ctx.lineWidth = tile * (low ? .13 : .16);
					ctx.beginPath();
					ctx.moveTo(-dx, -dy);
					ctx.lineTo(dx, dy);
					ctx.stroke();
					ctx.strokeStyle = "rgba(255,255,255,0.98)";
					ctx.lineWidth = tile * (low ? .05 : .065);
					ctx.beginPath();
					ctx.moveTo(-dx, -dy);
					ctx.lineTo(dx, dy);
					ctx.stroke();
					ctx.globalCompositeOperation = "lighter";
					ctx.strokeStyle = `rgba(205,228,255,${.55 * fade})`;
					ctx.lineWidth = tile * (low ? .22 : .26);
					ctx.shadowColor = "rgba(205,228,255,0.9)";
					ctx.shadowBlur = tile * .3;
					ctx.beginPath();
					ctx.moveTo(-dx, -dy);
					ctx.lineTo(dx, dy);
					ctx.stroke();
				}
			} else if (b.kind === "ring" || b.kind === "shockRing") {
				const tight = b.kind === "shockRing";
				const fade = Math.max(0, 1 - k);
				if (fade > .01) {
					const r = tile * (tight ? .35 + k * 1.05 : .55 + k * 2.05);
					ctx.translate(cx, cy);
					ctx.scale(1, tight ? .62 : .5);
					ctx.globalCompositeOperation = "source-over";
					ctx.globalAlpha = fade;
					ctx.strokeStyle = "rgba(10,14,22,0.75)";
					ctx.lineWidth = tile * (tight ? .14 : .2) * (1 - k * .4);
					ctx.beginPath();
					ctx.arc(0, 0, r, 0, Math.PI * 2);
					ctx.stroke();
					ctx.strokeStyle = "rgba(255,255,255,0.95)";
					ctx.lineWidth = tile * (tight ? .06 : .09) * (1 - k * .4);
					ctx.beginPath();
					ctx.arc(0, 0, r, 0, Math.PI * 2);
					ctx.stroke();
					ctx.globalCompositeOperation = "lighter";
					ctx.strokeStyle = `rgba(205,228,255,${.55 * fade})`;
					ctx.lineWidth = tile * (tight ? .17 : .24);
					ctx.shadowColor = "rgba(205,228,255,0.9)";
					ctx.shadowBlur = tile * .3;
					ctx.beginPath();
					ctx.arc(0, 0, r, 0, Math.PI * 2);
					ctx.stroke();
					if (tight) {
						ctx.globalCompositeOperation = "source-over";
						ctx.strokeStyle = `rgba(255,255,255,${.5 * fade})`;
						ctx.lineWidth = tile * .03;
						ctx.beginPath();
						ctx.arc(0, 0, r * .68, 0, Math.PI * 2);
						ctx.stroke();
					}
				}
			} else if (b.kind === "dash") {
				const travel = b.max * .55;
				const kHead = Math.min(1, b.t / travel);
				const fade = b.t < travel ? 1 : Math.max(0, 1 - (b.t - travel) / (b.max - travel));
				if (fade > .01) {
					const to = this.hexCenter(b.toX, b.toY);
					const headX = cx + (to.cx - cx) * kHead;
					const headY = cy + (to.cy - cy) * kHead;
					const dx = to.cx - cx;
					const dy = to.cy - cy;
					const len = Math.hypot(dx, dy) || 1;
					const nx = -dy / len;
					const ny = dx / len;
					ctx.globalCompositeOperation = "source-over";
					ctx.globalAlpha = fade;
					ctx.strokeStyle = "rgba(10,14,22,0.85)";
					ctx.lineWidth = tile * .16;
					ctx.beginPath();
					ctx.moveTo(cx, cy);
					ctx.lineTo(headX, headY);
					ctx.stroke();
					ctx.strokeStyle = "rgba(255,255,255,0.98)";
					ctx.lineWidth = tile * .07;
					ctx.beginPath();
					ctx.moveTo(cx, cy);
					ctx.lineTo(headX, headY);
					ctx.stroke();
					ctx.globalCompositeOperation = "lighter";
					ctx.strokeStyle = `rgba(205,228,255,${.55 * fade})`;
					ctx.lineWidth = tile * .3;
					ctx.shadowColor = "rgba(205,228,255,0.9)";
					ctx.shadowBlur = tile * .35;
					ctx.beginPath();
					ctx.moveTo(cx, cy);
					ctx.lineTo(headX, headY);
					ctx.stroke();
					ctx.shadowBlur = 0;
					ctx.globalCompositeOperation = "source-over";
					for (let i = 0; i < 3; i++) {
						const t2 = Math.max(0, kHead - i * .16);
						const px = cx + dx * t2;
						const py = cy + dy * t2;
						const w = tile * (.22 - i * .05);
						ctx.strokeStyle = `rgba(255,255,255,${(.5 - i * .14) * fade})`;
						ctx.lineWidth = tile * .025;
						ctx.beginPath();
						ctx.moveTo(px - nx * w, py - ny * w);
						ctx.lineTo(px + nx * w, py + ny * w);
						ctx.stroke();
					}
					if (kHead < 1) {
						const flash = ctx.createRadialGradient(headX, headY, 0, headX, headY, tile * .32);
						flash.addColorStop(0, `rgba(255,255,255,${.95 * fade})`);
						flash.addColorStop(1, "rgba(255,255,255,0)");
						ctx.globalCompositeOperation = "lighter";
						ctx.fillStyle = flash;
						ctx.beginPath();
						ctx.arc(headX, headY, tile * .32, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			}
			ctx.restore();
		}
		ctx.globalAlpha = 1;
	}
	drawDivineLight(ctx, cx, cy, tile, fx, fade, k) {
		const medium = fx.kind === "medium" || fx.kind === "food";
		const hands = fx.kind === "hands";
		const disease = fx.kind === "disease";
		const h = disease ? 158 : fx.kind === "food" ? 208 : 46;
		const s = disease ? 80 : fx.kind === "food" ? 90 : 95;
		const height = tile * (medium ? 2.85 : hands ? 2.2 : disease ? 2.25 : 1.55);
		const width = tile * (medium ? .58 : hands ? .45 : disease ? .48 : .32);
		const topY = cy - height;
		const chestY = cy - tile * .55;
		const pulse = .88 + .12 * Math.abs(Math.sin(this.time * 7 + fx.seed));
		const shaft = ctx.createLinearGradient(cx, topY, cx, cy + tile * .1);
		shaft.addColorStop(0, `hsla(${h}, ${s}%, 96%, 0)`);
		shaft.addColorStop(.18, `hsla(${h}, ${s}%, 94%, ${(medium ? .42 : hands ? .32 : .22) * fade * pulse})`);
		shaft.addColorStop(.55, `hsla(${h}, ${s}%, 82%, ${(medium ? .55 : hands ? .435 : .32) * fade})`);
		shaft.addColorStop(.88, `hsla(${h}, ${s}%, 78%, ${(medium ? .28 : hands ? .22 : .16) * fade})`);
		shaft.addColorStop(1, `hsla(${h}, ${s}%, 70%, 0)`);
		ctx.fillStyle = shaft;
		ctx.beginPath();
		ctx.moveTo(cx - width * .22, topY);
		ctx.lineTo(cx + width * .22, topY);
		ctx.lineTo(cx + width, cy + tile * .08);
		ctx.lineTo(cx - width, cy + tile * .08);
		ctx.closePath();
		ctx.fill();
		const coreW = width * (medium ? .28 : hands ? .25 : .22);
		const core = ctx.createLinearGradient(cx, topY, cx, cy);
		core.addColorStop(0, `hsla(${h}, 40%, 100%, ${.55 * fade})`);
		core.addColorStop(.7, `hsla(${h}, 80%, 96%, ${(medium ? .85 : hands ? .675 : .5) * fade})`);
		core.addColorStop(1, `hsla(${h}, 80%, 90%, 0)`);
		ctx.fillStyle = core;
		ctx.fillRect(cx - coreW, topY, coreW * 2, cy - topY);
		const bloomR = tile * (medium ? 1.45 : hands ? 1.13 : disease ? 1.2 : .82);
		const bloom = ctx.createRadialGradient(cx, chestY, 0, cx, chestY, bloomR);
		bloom.addColorStop(0, `hsla(${h}, 90%, 96%, ${(medium ? .72 : hands ? .56 : .4) * fade * pulse})`);
		bloom.addColorStop(.35, `hsla(${h}, ${s}%, 72%, ${(medium ? .38 : hands ? .29 : .2) * fade})`);
		bloom.addColorStop(1, `hsla(${h}, ${s}%, 60%, 0)`);
		ctx.fillStyle = bloom;
		ctx.beginPath();
		ctx.arc(cx, chestY, bloomR, 0, Math.PI * 2);
		ctx.fill();
		const groundR = tile * (medium ? .85 : hands ? .7 : .55) * (.7 + k * .35);
		const ground = ctx.createRadialGradient(cx, cy, 0, cx, cy, groundR);
		ground.addColorStop(0, `hsla(${h}, ${s}%, 90%, ${(medium ? .55 : hands ? .425 : .3) * fade})`);
		ground.addColorStop(1, `hsla(${h}, ${s}%, 70%, 0)`);
		ctx.fillStyle = ground;
		ctx.beginPath();
		ctx.ellipse(cx, cy + tile * .06, groundR, groundR * .38, 0, 0, Math.PI * 2);
		ctx.fill();
		if (disease) {
			const ringR = tile * (.22 + k * .95);
			ctx.strokeStyle = `hsla(158, 90%, 72%, ${.55 * fade})`;
			ctx.lineWidth = Math.max(1.5, tile * .045);
			ctx.beginPath();
			ctx.ellipse(cx, cy + tile * .04, ringR, ringR * .4, 0, 0, Math.PI * 2);
			ctx.stroke();
		}
		if (hands) {
			ctx.strokeStyle = `hsla(42, 95%, 82%, ${.7 * fade * pulse})`;
			ctx.lineWidth = Math.max(1.5, tile * .035);
			for (const side of [-1, 1]) {
				ctx.beginPath();
				ctx.moveTo(cx + side * tile * .48, chestY - tile * .25);
				ctx.bezierCurveTo(cx + side * tile * .72, chestY + tile * .2, cx + side * tile * .3, chestY + tile * .5, cx + side * tile * .08, chestY + tile * .22);
				ctx.stroke();
			}
		}
		const motes = medium ? 16 : hands ? 11 : disease ? 12 : 7;
		for (let i = 0; i < motes; i++) {
			const rise = (fx.seed * 13 + i * .37 + k * (medium ? 1.6 : hands ? 1.35 : 1.1)) % 1;
			const mx = cx + Math.sin(fx.seed + i * 1.7 + this.time * 3) * tile * .18 + (i % 5 - 2) * tile * .08;
			const my = cy - rise * height * .95;
			const r = tile * (medium ? .045 : hands ? .0375 : .03) * (1 - rise * .4) * fade;
			ctx.fillStyle = `hsla(${h}, 80%, 96%, ${(.55 + i % 3 * .15) * fade})`;
			ctx.beginPath();
			ctx.arc(mx, my, Math.max(.8, r), 0, Math.PI * 2);
			ctx.fill();
		}
	}
	drawPotionBurst(ctx, cx, cy, tile, fx, fade, k) {
		const chestY = cy - tile * .5;
		const aura = ctx.createRadialGradient(cx, chestY, 0, cx, chestY, tile * .95);
		aura.addColorStop(0, `hsla(32, 100%, 88%, ${.55 * fade})`);
		aura.addColorStop(.4, `hsla(22, 95%, 58%, ${.32 * fade})`);
		aura.addColorStop(1, "hsla(18, 90%, 40%, 0)");
		ctx.fillStyle = aura;
		ctx.beginPath();
		ctx.arc(cx, chestY, tile * .95, 0, Math.PI * 2);
		ctx.fill();
		for (let i = 0; i < 12; i++) {
			const ang = fx.seed + i * .52 + fx.t * (2.8 + i % 3 * .4);
			const rad = tile * (.18 + i % 4 * .06) * (.85 + Math.sin(fx.t * 6 + i) * .12);
			const px = cx + Math.cos(ang) * rad;
			const py = chestY + Math.sin(ang) * rad * .72 - tile * .08 * Math.sin(fx.t * 5 + i);
			const r = tile * (.04 + i % 3 * .012) * fade;
			ctx.fillStyle = i % 3 === 0 ? `hsla(48, 100%, 88%, ${.9 * fade})` : `hsla(22, 95%, 62%, ${.75 * fade})`;
			ctx.beginPath();
			ctx.arc(px, py, Math.max(1, r), 0, Math.PI * 2);
			ctx.fill();
		}
		const splash = tile * (.28 + k * .42);
		ctx.strokeStyle = `hsla(28, 95%, 70%, ${.55 * fade})`;
		ctx.lineWidth = Math.max(1.4, tile * .04);
		ctx.beginPath();
		ctx.ellipse(cx, cy + tile * .05, splash, splash * .38, 0, 0, Math.PI * 2);
		ctx.stroke();
		const puddle = ctx.createRadialGradient(cx, cy + tile * .05, 0, cx, cy + tile * .05, splash);
		puddle.addColorStop(0, `hsla(36, 100%, 80%, ${.4 * fade})`);
		puddle.addColorStop(1, "hsla(24, 90%, 50%, 0)");
		ctx.fillStyle = puddle;
		ctx.beginPath();
		ctx.ellipse(cx, cy + tile * .05, splash, splash * .38, 0, 0, Math.PI * 2);
		ctx.fill();
		for (let i = 0; i < 8; i++) {
			const rise = (fx.seed + i * .21 + k * 1.2) % 1;
			ctx.fillStyle = `hsla(48, 100%, 92%, ${(.7 - rise * .4) * fade})`;
			ctx.beginPath();
			ctx.arc(cx + Math.sin(fx.seed + i * 2) * tile * .22, cy - rise * tile * 1.05, tile * .028 * fade, 0, Math.PI * 2);
			ctx.fill();
		}
	}
};
if (import.meta.hot) {
	const live = window.__emberEngine;
	if (live) BattleEngine.refreshLiveEngine(live);
	import.meta.hot.accept();
}
//#endregion
//#region work/qa-turn-undead-entry.ts
assert.equal(spellTier("createFoodAndWater"), 4);
assert.equal(spellTier("turnUndead"), 3);
for (let level = 1; level <= 30; level++) {
	const p = turnUndeadPower(level);
	const cells = hexAreaTiles({
		x: 12,
		y: 12
	}, p.radius, 25, 25);
	assert.equal(cells.length, p.areaHexes);
	assert.ok(cells.every((c) => hexDist(c, {
		x: 12,
		y: 12
	}) <= p.radius));
	if (level > 1) {
		const prev = turnUndeadPower(level - 1);
		for (const k of [
			"range",
			"radius",
			"dice",
			"mul"
		]) assert.ok(p[k] >= prev[k]);
	}
	if (level >= 22) assert.deepEqual(p, turnUndeadPower(22));
}
for (const id of [
	"zombie",
	"zombie2",
	"zombieDog",
	"undeadOx",
	"plagueBearingCattle",
	"emberedWraith",
	"apparition"
]) assert.equal(isUndeadClass(id), true);
for (const id of Object.keys(CLASSES)) assert.equal(isUndeadClass(id), CLASSES[id].creatureType === "undead");
const cols = 17;
const rows = 13;
const board = new Set(hexAreaTiles({
	x: 8,
	y: 6
}, 6, cols, rows).map((c) => c.x + "," + c.y));
const mission = {
	id: "turn-undead-qa",
	index: 0,
	title: "QA",
	place: "",
	briefing: "",
	objective: "",
	win: "rout",
	cols,
	rows,
	layout: Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => board.has(x + "," + y) ? "." : " ").join("")),
	decorations: [],
	playerSpawns: [{
		name: "Priest",
		classId: "healer",
		x: 6,
		y: 6,
		level: 12
	}],
	enemySpawns: [
		{
			name: "Zombie",
			classId: "zombie",
			x: 8,
			y: 6
		},
		{
			name: "Militia",
			classId: "miliciaV2",
			x: 8,
			y: 5
		},
		{
			name: "Ox",
			classId: "undeadOx",
			x: 9,
			y: 7
		},
		{
			name: "Outside",
			classId: "zombie",
			x: 15,
			y: 6
		}
	]
};
const art = new Proxy({ decorations: {} }, { get: (t, k) => t[k] ?? {} });
const e = new BattleEngine(mission, art, {
	hp: {},
	levels: {}
}, 1);
e.reducedMotion = true;
e.rng = () => .5;
const caster = e.units[0];
caster.level = 12;
caster.mag = 0;
caster.acted = false;
caster.spells.tier3 = 5;
e.selectedId = caster.id;
for (const u of e.units) {
	u.hp = u.maxHp = 5e3;
	u.resistances = {};
}
const zombie = e.units.find((u) => u.name === "Zombie");
const living = e.units.find((u) => u.name === "Militia");
const ox = e.units.find((u) => u.name === "Ox");
const outside = e.units.find((u) => u.name === "Outside");
const before = JSON.stringify(living);
e.startTurnUndead();
assert.equal(e.spellKind, "turnUndead");
assert.equal(e.mode, "awaitSpell");
assert.equal(caster.spells.tier3, 5);
assert.equal(e.queue.length, 0);
assert.equal(e.getHud().spellArmed, true);
assert.equal(e.getHud().spellReady, true);
e.cancelSkillConfirm();
assert.equal(caster.spells.tier3, 5);
assert.equal(e.queue.length, 0);
assert.equal(caster.acted, false);
e.startTurnUndead();
e.hover = {
	x: 15,
	y: 6
};
assert.equal(e.getHud().spellReady, true);
e.confirmSpell();
assert.equal(e.spellKind, null);
assert.equal(e.mode, "locked");
assert.equal(caster.spells.tier3, 4);
assert.equal(e.queue.length, 1);
e.confirmSpell();
assert.equal(e.queue.length, 1);
const step = e.queue.shift();
assert.ok(step.ids.includes(zombie.id));
assert.ok(step.ids.includes(ox.id));
assert.equal(new Set(step.ids).size, step.ids.length);
assert.ok(!step.ids.includes(living.id));
assert.ok(!step.ids.includes(outside.id));
e.startSeq(step);
assert.equal(e.active.type, "spell");
const action = e.active;
e.stepSpell(action, .5);
assert.ok(zombie.hp < 5e3);
assert.ok(ox.hp < 5e3);
assert.equal(zombie.fearTurns, 2);
assert.equal(zombie.fearSourceId, caster.id);
assert.equal(JSON.stringify(living), before);
assert.equal(outside.hp, 5e3);
assert.equal(outside.fearTurns ?? 0, 0);
assert.equal(e.turnUndeadFx.length, 1);
assert.deepEqual(e.turnUndeadFx[0].tiles, step.tiles);
e.stepSpell(action, .1);
assert.equal(e.turnUndeadFx.length, 1);
e.active = null;
e.startSeq({
	...step,
	ids: [living.id]
});
e.stepSpell(e.active, .5);
assert.equal(JSON.stringify(living), before);
const saved = e.captureSnapshot();
const copy = new BattleEngine(mission, art, {
	hp: {},
	levels: {}
}, 1);
copy.applySnapshot(saved);
const restored = copy.units.find((u) => u.id === zombie.id);
assert.equal(restored.fearTurns, 2);
assert.equal(restored.fearSourceId, caster.id);
const food = new BattleEngine(mission, art, {
	hp: {},
	levels: {}
}, 1);
const priest = food.units[0];
priest.level = 12;
priest.fullness = 0;
priest.acted = false;
priest.spells.tier3 = 4;
priest.spells.tier4 = 3;
food.selectedId = priest.id;
food.startCreateFoodAndWater();
assert.equal(priest.spells.tier4, 2);
assert.equal(priest.spells.tier3, 4);
assert.equal(priest.fullness, 120);
e.active = null;
e.queue = [];
e.skipStartOfTurn = false;
zombie.moved = false;
zombie.acted = false;
e.beginUnitTurn(zombie);
assert.equal(zombie.fearTurns, 1);
assert.equal(zombie.acted, true);
assert.ok(e.queue.every((s) => s.type === "move"));
assert.ok(e.queue.length > 0);
const retreat = e.queue[0];
assert.ok(hexDist(retreat.path.at(-1), caster) > hexDist(zombie, caster));
e.queue = [];
zombie.mov = 0;
zombie.moved = false;
zombie.acted = false;
e.skipStartOfTurn = false;
e.beginUnitTurn(zombie);
assert.equal(zombie.fearTurns, 0);
assert.equal(zombie.acted, true);
assert.equal(e.queue.length, 0);
console.log("PASS: both spell tiers, all level breakpoints and hex footprints, cap at 22, undead classification, living immunity, multi-hex deduplication, damage/fear, legal retreat, and trapped fear turns.");
//#endregion
export {};
