import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.route('**/__resistance-qa', route => route.fulfill({ contentType: 'text/html', body: '<html><body></body></html>' }));
  await page.goto('http://127.0.0.1:8080/__resistance-qa');
  const result = await page.evaluate(async () => {
    const { BattleEngine } = await import('/src/game/engine.ts');
    const { SAVED_MISSIONS } = await import('/src/game/mapstore.ts');
    const { emptySave, writeSlot, activeSave, loadBank } = await import('/src/game/save.ts');
    const engineSource = await (await fetch('/src/game/engine.ts')).text();
    const dataUrl = engineSource.match(/from "([^"]*\/data\.ts[^"]*)"/)[1];
    const { EQUIPMENT, gearStatBonus } = await import(dataUrl);
    const mission = SAVED_MISSIONS.find(m => m.playerSpawns.some(s => s.name === 'Kael') && m.enemySpawns.length);
    const art = new Proxy({}, { get: (target, key) => target[key] ?? (target[key] = {}) });
    const roster = { hp: {}, levels: {}, bags: {}, xp: {}, heroSkills: { Kael: { fireResistance: 70, poisonResistance: 70 } } };
    const engine = new BattleEngine(mission, art, roster, 1);
    const hero = engine.units.find(u => u.name === 'Kael');
    const enemy = engine.units.find(u => u.side === 'enemy');
    enemy.mag = 40;
    engine.rng = () => 0;
    // Isolate the resistance stage using a fixed incoming spell damage.
    engine.spellDamage = () => 30;
    hero.hp = hero.maxHp = 500;
    const anim = kind => ({ type: 'spell', att: enemy.id, held: [], heldFrom: new Map(), heldAt: 0,
      tiles: [{ x: hero.x, y: hero.y }], ids: [hero.id], t: 0, hit: false,
      extraDice: 1, extraFaces: 6, extraBonus: 0, moreDice: 0, moreFaces: 6, echo: null,
      dmgMul: 1, weaponBonusDice: 0, weaponBonusFaces: 8, weaponBonusBonus: 0,
      spellKind: kind, projectileTo: null, centerId: null, centerDice: 0, centerFaces: 8,
      centerBonus: 0, poison: false, spellMul: 1, centerMul: 1 });
    engine.stepSpell(anim('fireball'), 0.6);
    const fireHit = { damage: 500 - hero.hp, trained: engine.heroSkills.Kael.fireResistance, poison: hero.resistances.poison };
    hero.resistances.fire = 120;
    const before = hero.hp;
    engine.stepSpell(anim('burningHands'), 0.3);
    const immunityDamage = before - hero.hp;
    hero.poisoned = true; hero.poisonTier = 'lethal'; hero.poisonMag = 40;
    hero.resistances.poison = 70;
    const poisonBefore = hero.hp;
    engine.startOfTurnEffects(hero);
    const lethalDamage = poisonBefore - hero.hp;
    const snapshot = engine.captureSnapshot();
    const fresh = new BattleEngine(mission, art, roster, 2);
    fresh.applySnapshot(snapshot);
    const restored = fresh.units.find(u => u.name === 'Kael');
    // Real save sanitization, confined to this throwaway browser's local storage.
    let bank = loadBank();
    bank = writeSlot(bank, 0, { ...emptySave(), pendingMission: mission.id, battle: snapshot,
      heroSkills: engine.heroSkills, heroPoisons: { Kael: 'lethal' }, heroPoisonMag: { Kael: 40 } });
    const saved = activeSave(loadBank());
    const roundTrip = { tier: saved.heroPoisons.Kael, mag: saved.heroPoisonMag.Kael,
      trained: saved.battle.heroSkills.Kael.fireResistance, resist: saved.battle.units.find(u => u.name === 'Kael').resistances.fire };
    const id = '__resistance_qa';
    EQUIPMENT[id] = { id, name: 'QA resistance gear', slot: 'neck', resistances: { ice: 25, ember: 15 } };
    hero.gear.neck = id;
    engine.reapplyGear(hero);
    const gear = { bonus: gearStatBonus([id]), ice: hero.resistances.ice, ember: hero.resistances.ember, fire: hero.resistances.fire };
    delete EQUIPMENT[id];
    hero.hp = hero.maxHp = 500;
    enemy.hp = enemy.maxHp = 500; enemy.alive = true;
    const second = { ...enemy, id: '__second_target', resistances: { ...enemy.resistances } };
    engine.units.push(second);
    const fireBeforeUse = engine.heroSkills.Kael.fireResistance;
    const cast = { ...anim('fireball'), att: hero.id, ids: [enemy.id, second.id] };
    engine.stepSpell(cast, 0.6);
    const fireAfterUse = engine.heroSkills.Kael.fireResistance;
    engine.stepSpell(cast, 0.01);
    const fireAfterAnimationUpdate = engine.heroSkills.Kael.fireResistance;
    const lightningBefore = engine.heroSkills.Kael.lightningResistance ?? 0;
    hero.shock = { dice: 1, faces: 6, bonus: 0, mag: 0 };
    engine.startOfTurnEffects(hero);
    const lightningAfter = engine.heroSkills.Kael.lightningResistance;
    const oldHexAt = engine.hexAt;
    engine.hexAt = () => ({ id: 'ember', name: 'Ember', hazardDice: 1, hazardFaces: 8 });
    engine.applyTileHazard(hero, { x: hero.x, y: hero.y });
    engine.hexAt = oldHexAt;
    const emberAfter = engine.heroSkills.Kael.emberResistance;
    const familiar = { ...enemy, id: '__familiar', name: '__familiar', classId: 'familiar3', sprite: 'familiar3',
      side: 'player', summoned: true, summonerId: hero.id, hp: 500, maxHp: 500, mag: 20, resistances: {}, weaponId: null };
    engine.units.push(familiar);
    for (const kind of ['fireball', 'magicMissile', 'lifeDrain']) {
      enemy.hp = 500; enemy.alive = true;
      engine.stepSpell({ ...anim(kind), att: familiar.id, ids: [enemy.id] }, 0.6);
    }
    const familiarTraining = { fire: engine.heroSkills.Kael.fireResistance,
      arcane: engine.heroSkills.Kael.arcaneResistance, darkness: engine.heroSkills.Kael.darknessResistance,
      familiarLedger: engine.heroSkills.__familiar ?? null };
    familiar.summonerId = '__missing_owner';
    engine.stepSpell({ ...anim('fireball'), att: familiar.id, ids: [enemy.id] }, 0.6);
    familiar.side = 'enemy'; familiar.summonerId = hero.id;
    engine.stepSpell({ ...anim('fireball'), att: familiar.id, ids: [enemy.id] }, 0.6);
    const fireAfterInvalidOwners = engine.heroSkills.Kael.fireResistance;
    return { fireHit, immunityDamage, lethalDamage, restored: { tier: restored.poisonTier, mag: restored.poisonMag }, roundTrip, gear,
      usage: { fireBeforeUse, fireAfterUse, fireAfterAnimationUpdate, lightningBefore, lightningAfter, emberAfter },
      familiarTraining, fireAfterInvalidOwners };
  });
  assert.equal(result.fireHit.damage, 15);
  assert.equal(result.fireHit.trained, 70.1);
  assert.equal(result.fireHit.poison, 70);
  assert.equal(result.immunityDamage, 0);
  assert.equal(result.lethalDamage, 3);
  assert.deepEqual(result.restored, { tier: 'lethal', mag: 40 });
  assert.equal(result.roundTrip.tier, 'lethal');
  assert.equal(result.roundTrip.mag, 40);
  assert.equal(result.roundTrip.trained, 70.2);
  assert.equal(result.gear.ice, 25);
  assert.equal(result.gear.ember, 15);
  assert.equal(result.gear.fire, 70.2);
  assert.equal(result.usage.fireBeforeUse, 70.2);
  assert.equal(result.usage.fireAfterUse, 70.3);
  assert.equal(result.usage.fireAfterAnimationUpdate, 70.3);
  assert.equal(result.usage.lightningAfter, result.usage.lightningBefore + 0.1);
  assert.equal(result.usage.emberAfter, 0.1);
  assert.deepEqual(result.familiarTraining, { fire: 70.4, arcane: 0.1, darkness: 0.1, familiarLedger: null });
  assert.equal(result.fireAfterInvalidOwners, 70.4);
  console.log(JSON.stringify(result, null, 2));
  console.log('Combat resistance, independent training, immunity, Lethal ticks, equipment and save/load checks passed.');
} finally {
  await browser.close();
}
