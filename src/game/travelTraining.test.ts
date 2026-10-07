import assert from "node:assert/strict";
import { test } from "node:test";
import { advanceTravelTraining, cleanTravelTraining } from "./skills.ts";

test("nothing trains until a skill is chosen", () => {
  const r = advanceTravelTraining({ Kael: { poisonResistance: 5 } }, {}, {}, 48, ["Kael"]);
  assert.deepEqual(r.heroSkills, { Kael: { poisonResistance: 5 } });
  assert.deepEqual(r.travelTrainingHours, {});
});

test("a resistance gains 0.1 per 12 road hours and carries leftover hours", () => {
  let r = advanceTravelTraining({}, { Kael: "poisonResistance" }, {}, 6, ["Kael"]);
  assert.equal(r.heroSkills.Kael?.poisonResistance, undefined);
  assert.equal(r.travelTrainingHours.Kael, 6);
  r = advanceTravelTraining(r.heroSkills, { Kael: "poisonResistance" }, r.travelTrainingHours, 30, ["Kael"]);
  assert.equal(r.heroSkills.Kael?.poisonResistance, 0.3);
  assert.equal(r.travelTrainingHours.Kael, 0);
});

test("each hero trains only their own chosen skill", () => {
  const r = advanceTravelTraining({}, { Kael: "fireResistance", Neera: "poisonResistance" }, {}, 24, ["Kael", "Neera", "Voss"]);
  assert.deepEqual(r.heroSkills, { Kael: { fireResistance: 0.2 }, Neera: { poisonResistance: 0.2 } });
});

test("heroes not travelling (fallen) don't bank hours", () => {
  const r = advanceTravelTraining({}, { Kael: "fireResistance", Voss: "fireResistance" }, {}, 24, ["Kael"]);
  assert.equal(r.heroSkills.Voss, undefined);
  assert.equal(r.travelTrainingHours.Voss, undefined);
});

test("weapon skills pay whole points: +1 per 120 road hours", () => {
  let r = advanceTravelTraining({ Kael: { swordWeapon: 3 } }, { Kael: "swordWeapon" }, {}, 119, ["Kael"]);
  assert.equal(r.heroSkills.Kael?.swordWeapon, 3);
  r = advanceTravelTraining(r.heroSkills, { Kael: "swordWeapon" }, r.travelTrainingHours, 1, ["Kael"]);
  assert.equal(r.heroSkills.Kael?.swordWeapon, 4);
});

test("training stops at the cap", () => {
  const r = advanceTravelTraining({ Kael: { holyResistance: 99.95 } }, { Kael: "holyResistance" }, {}, 240, ["Kael"]);
  assert.equal(r.heroSkills.Kael?.holyResistance, 100);
});

test("saved choices keep only real skills", () => {
  assert.deepEqual(cleanTravelTraining({ Kael: "poisonResistance", Neera: "juggling", Voss: 3 }, ["Kael", "Neera", "Voss"]), { Kael: "poisonResistance" });
});
