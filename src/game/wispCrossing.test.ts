import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DECORATIONS, CLASSES, placedBlockingFootprint } from "./data.ts";
import { buildDecorOverlay, hexDef } from "./hexprops.ts";
import { footprint, hexNeighbors } from "./pathfinding.ts";
import { WISP_CROSSING_ID, WISP_BOSS_ID, completedAfterWispVictory, routeWispCrossing, wispCrossingCompleted } from "./wispCrossing.ts";
import type { Mission, TerrainId } from "./types.ts";

const readDraft = (name: string) => JSON.parse(readFileSync(new URL(`./maps/${name}`, import.meta.url), "utf8")).draft;
const crossing = readDraft("wisp-forest-crossing007.json") as Mission;
const room = readDraft("wisp-forest-crossing-boss001.json");

test("all forward exits lead to the boss only until the crossing is completed", () => {
  const first = routeWispCrossing(crossing, []);
  const exits = first.decorations!.filter(p => p.targetMapId === WISP_BOSS_ID);
  assert.equal(exits.length, 3);
  assert.ok(exits.every(p => DECORATIONS[p.id]?.exitKind === "connector"));
  assert.equal(first.win, "escape", "clearing the original enemies cannot bypass the boss");
  for (const completed of [[WISP_CROSSING_ID], [WISP_BOSS_ID]]) {
    const repeat = routeWispCrossing(crossing, completed);
    assert.ok(wispCrossingCompleted(completed));
    assert.ok(!repeat.decorations!.some(p => p.targetMapId === WISP_BOSS_ID));
    assert.equal(repeat.decorations!.filter(p => p.id === "dungeon-exit").length, 3);
  }
  assert.equal(crossing.decorations!.filter(p => p.targetMapId === WISP_BOSS_ID).length, 3, "routing does not mutate saved map data");
});

test("only the boss victory completes the first crossing", () => {
  assert.deepEqual(completedAfterWispVictory(WISP_CROSSING_ID, []), []);
  assert.deepEqual(completedAfterWispVictory(WISP_BOSS_ID, []), [WISP_BOSS_ID, WISP_CROSSING_ID]);
  assert.deepEqual(completedAfterWispVictory(WISP_BOSS_ID, [WISP_BOSS_ID, WISP_CROSSING_ID]), [WISP_BOSS_ID, WISP_CROSSING_ID]);
});

test("the rooted boss is reachable only at the front sweep, with a closed tree barrier behind", () => {
  assert.equal(room.win, "boss");
  assert.equal(room.enemySpawns.length, 1);
  const plant = room.enemySpawns[0];
  assert.equal(plant.classId, "carnivorousPlant");
  assert.equal(plant.holdsPosition, true);
  assert.ok(CLASSES.carnivorousPlant.boss);
  assert.ok(!room.decorations.some((p: { id: string }) => DECORATIONS[p.id]?.exitKind), "there is no exit to bypass the Plant");
  const tiles = room.tiles as TerrainId[];
  const overlay = buildDecorOverlay(room.decorations, room.cols, room.rows, placedBlockingFootprint);
  const body = footprint({ ...plant, size: 4, footprintOffsets: CLASSES.carnivorousPlant.footprintOffsets });
  const bodyKeys = new Set(body.map(p => `${p.x},${p.y}`));
  for (const p of body) assert.ok(hexDef(tiles, room.cols, p.x, p.y, overlay).passable, "no tree overlaps the boss");
  const seen = new Set<string>();
  const queue = [...room.playerSpawns];
  for (const p of queue) {
    assert.ok(hexDef(tiles, room.cols, p.x, p.y, overlay).passable);
    seen.add(`${p.x},${p.y}`);
  }
  for (let i = 0; i < queue.length; i++) for (const p of hexNeighbors(queue[i].x, queue[i].y)) {
    const key = `${p.x},${p.y}`;
    if (p.x < 0 || p.y < 0 || p.x >= room.cols || p.y >= room.rows || seen.has(key) || bodyKeys.has(key)) continue;
    if (!hexDef(tiles, room.cols, p.x, p.y, overlay).passable) continue;
    seen.add(key); queue.push(p);
  }
  const adjacent = new Map(body.flatMap(p => hexNeighbors(p.x, p.y)).map(p => [`${p.x},${p.y}`,p]));
  const accessible = [...adjacent].filter(([key]) => seen.has(key)).map(([,p]) => p);
  assert.equal(accessible.length, 2, "only the two front approach hexes are reachable");
  assert.ok(accessible.every(p => p.y > plant.y && p.y >= plant.y - 2), "approaches lie in her sweep area");
});
