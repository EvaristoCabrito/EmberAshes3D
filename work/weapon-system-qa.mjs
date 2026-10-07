import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Uses the project's running Vite server and isolated, disposable browser storage.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.route('**/__weapon-qa', route => route.fulfill({ contentType: 'text/html', body: '<html></html>' }));
  await page.goto('http://127.0.0.1:8080/__weapon-qa');
  const result = await page.evaluate(async () => {
    const { BattleEngine } = await import('/src/game/engine.ts');
    const { SAVED_MISSIONS } = await import('/src/game/mapstore.ts');
    const { emptySave, writeSlot, activeSave, loadBank } = await import('/src/game/save.ts');
    const mission = SAVED_MISSIONS.find(m => m.playerSpawns.some(s => s.name === 'Kael') && m.enemySpawns.length);
    const art = new Proxy({}, { get: (target, key) => target[key] ?? (target[key] = {}) });
    const roster = { hp: {}, levels: {}, bags: {}, xp: {}, heroSkills: { Kael: { swordWeapon: 20.4, fireResistance: 12.3 } } };
    const engine = new BattleEngine(mission, art, roster, 1);
    engine.reducedMotion = true;
    const hero = engine.units.find(u => u.name === 'Kael');
    const enemy = engine.units.find(u => u.side === 'enemy');
    hero.weaponId = 'espada-larga'; hero.mag = 0;
    hero.hp = hero.maxHp = enemy.hp = enemy.maxHp = 500;
    enemy.dex = 999;
    engine.rng = () => 0;
    const initial = engine.heroSkills.Kael.swordWeapon;
    const combat = (att, def, fields = {}) => ({ type: 'combat', att: att.id, def: def.id,
      stage: 'hit', t: 0, held: [], heldAt: 0, swapped: false, bonusDice: 0, bonusDiceCount: 1,
      bonusFlat: 0, noCounter: true, spellKind: null, customDice: null, counterCustomDice: null,
      dmgMul: 1, stunChance: 0, wallImpact: null, knockTo: null, ...fields });
    const miss = combat(hero, enemy);
    engine.stepCombat(miss, 0.03);
    const afterMiss = engine.heroSkills.Kael.swordWeapon;
    engine.stepCombat(miss, 0.01);
    const afterRepeatedUpdate = engine.heroSkills.Kael.swordWeapon;
    engine.trainWeapon(hero, 'bow');
    const unsupported = engine.heroSkills.Kael.bowWeapon ?? null;
    const bash = combat(hero, enemy, { spellKind: 'shieldBash' });
    engine.stepCombat(bash, 0.03);
    const afterBash = engine.heroSkills.Kael.swordWeapon;
    const spell = kind => ({ type: 'spell', att: hero.id, held: [], heldFrom: new Map(), heldAt: 0,
      tiles: [{ x: enemy.x, y: enemy.y }], ids: [enemy.id], t: 0, hit: false,
      extraDice: 1, extraFaces: 6, extraBonus: 0, moreDice: 0, moreFaces: 6, echo: null,
      dmgMul: 1, weaponBonusDice: 0, weaponBonusFaces: 8, weaponBonusBonus: 0,
      spellKind: kind, projectileTo: null, centerId: null, centerDice: 0, centerFaces: 8,
      centerBonus: 0, poison: false, spellMul: 1, centerMul: 1 });
    engine.stepSpell(spell('fireball'), 0.6);
    const afterSpell = engine.heroSkills.Kael.swordWeapon;
    const weaponAbility = spell('cleave'); weaponAbility.extraDice = 0;
    engine.stepSpell(weaponAbility, 0.6);
    const afterAbilityMiss = engine.heroSkills.Kael.swordWeapon;
    // Actual off-hand counter resolution must train dagger, even when countering a bash.
    hero.name = 'Neera'; hero.classId = 'archer'; hero.weaponId = 'arco-composto';
    hero.offHandId = 'punhal-curvo'; hero.weaponSkills = { bow: 100, dagger: 0 };
    engine.heroSkills.Neera = { bowWeapon: 100, daggerWeapon: 0 };
    hero.dex = 30;
    engine.stepCombat(combat(enemy, hero, { stage: 'counterHit', spellKind: 'shieldBash',
      counterCustomDice: { dice: 1, faces: 4, bonus: 0 } }), 0.03);
    const counter = { bow: engine.heroSkills.Neera.bowWeapon, dagger: engine.heroSkills.Neera.daggerWeapon };
    const escape = engine.fleeChance(hero);
    enemy.dex = 0;
    const escapeWithoutEnemyDex = engine.fleeChance(hero);
    engine.canAttemptFlee = () => true;
    engine.activeTurnUnit = () => hero;
    engine.rng = () => 0.65;
    const actualEscape = engine.attemptFlee(); // DEX 30 succeeds at 65%; old fixed 60% failed.
    hero.weaponId = 'besta-mao'; engine.reapplyGear(hero);
    const afterSwitch = { ...hero.weaponSkills };
    hero.name = 'Kael'; hero.classId = 'swordsman'; hero.weaponId = 'espada-larga'; hero.offHandId = null;
    engine.reapplyGear(hero);
    const snapshot = engine.captureSnapshot();
    const savedHero = snapshot.units.find(u => u.name === 'Kael');
    delete savedHero.dex; savedHero.res = 30;
    savedHero.level = 10; savedHero.statPointAllocation = { res: 3 };
    snapshot.heroSkills.Kael.swordWeapon = 23.4;
    const write = (battle, allocations) => {
      writeSlot(loadBank(), 0, { ...emptySave(), pendingMission: mission.id, battle,
        levels: { Kael: 10 }, statPointAllocations: { Kael: allocations },
        heroSkills: { Kael: { swordWeapon: 23.4, fireResistance: 12.3 } } });
      return activeSave(loadBank());
    };
    let saved = write(snapshot, { res: 3 });
    const legacy = { dex: saved.battle.units.find(u => u.name === 'Kael').dex,
      allocation: saved.statPointAllocations.Kael.dex,
      battleAllocation: saved.battle.units.find(u => u.name === 'Kael').statPointAllocation.dex,
      skill: saved.heroSkills.Kael.swordWeapon, resist: saved.heroSkills.Kael.fireResistance };
    const restored = new BattleEngine(mission, art, roster, 2);
    restored.applySnapshot(saved.battle);
    const restoredHero = restored.units.find(u => u.name === 'Kael');
    const restoredSkill = restoredHero.weaponSkills.sword;
    savedHero.dex = 120; savedHero.statPointAllocation = { res: 3, dex: 2 };
    saved = write(snapshot, { res: 3, dex: 2 });
    const explicit = { dex: saved.battle.units.find(u => u.name === 'Kael').dex,
      allocation: saved.statPointAllocations.Kael.dex,
      battleAllocation: saved.battle.units.find(u => u.name === 'Kael').statPointAllocation.dex };
    delete snapshot.heroSkills;
    savedHero.weaponSkills = { sword: 30.4 };
    const fallback = new BattleEngine(mission, art, { hp: {}, levels: {}, bags: {}, xp: {} }, 3);
    fallback.applySnapshot(snapshot);
    const legacySnapshotSkill = fallback.units.find(u => u.name === 'Kael').weaponSkills.sword;
    // A wounded enemy at the board edge still takes its normal AI action.
    enemy.hp = 1; enemy.maxHp = 100; enemy.alive = true; enemy.escaped = false;
    enemy.x = enemy.drawX = 0; enemy.y = enemy.drawY = 0; enemy.mov = 3;
    enemy.dialog = null; enemy.guaranteedDrop = null; enemy.moved = enemy.acted = false;
    engine.rng = () => 0;
    engine.runAiFor(enemy);
    const enemyFled = enemy.escaped || !enemy.alive;
    return { initial, afterMiss, afterRepeatedUpdate, unsupported, afterBash, afterSpell,
      afterAbilityMiss, counter, escape, escapeWithoutEnemyDex, actualEscape, afterSwitch,
      legacy, explicit, restoredSkill, legacySnapshotSkill, enemyFled };
  });
  assert.equal(result.initial, 21);
  assert.equal(result.afterMiss, 22);
  assert.equal(result.afterRepeatedUpdate, 22);
  assert.equal(result.unsupported, null);
  assert.equal(result.afterBash, 22);
  assert.equal(result.afterSpell, 22);
  assert.equal(result.afterAbilityMiss, 23);
  assert.deepEqual(result.counter, { bow: 100, dagger: 1 });
  assert.equal(result.escape, 70);
  assert.equal(result.escapeWithoutEnemyDex, 70);
  assert.equal(result.actualEscape, true);
  assert.equal(result.afterSwitch.dagger, 1);
  assert.deepEqual(result.legacy, { dex: 30, allocation: 3, battleAllocation: 3, skill: 24, resist: 12.3 });
  assert.deepEqual(result.explicit, { dex: 120, allocation: 2, battleAllocation: 2 });
  assert.equal(result.restoredSkill, 24);
  assert.equal(result.legacySnapshotSkill, 31);
  assert.equal(result.enemyFled, false);
  console.log(JSON.stringify(result, null, 2));
  console.log('Weapon combat, misses, counters, spells, escape, legacy migration and save/load checks passed.');
} finally { await browser.close(); }
