import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as THREE from 'three';
import { execFileSync } from 'node:child_process';

const baseline = process.argv.includes('--baseline');
const source = baseline ? execFileSync('git', ['show', 'HEAD:src/game/gfx/three/ThreeBattleRenderer.ts'], { encoding: 'utf8' }) : fs.readFileSync('src/game/gfx/three/ThreeBattleRenderer.ts', 'utf8');
const ast = ts.createSourceFile('renderer.ts', source, ts.ScriptTarget.Latest, true);
const declaration = ast.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === 'ThreeBattleRenderer');
const fixture = {
  scene: new THREE.Scene(), spellVfxScene: new THREE.Group(), lightBudget: null,
  fillerLights: { point: [], shadow: [] },
};
for (const name of ['syncSpellVfxLayers', 'parkHiddenLights', 'balanceLightCount', 'restoreParkedLights']) {
  const method = declaration.members.find(node => node.name?.getText(ast) === name);
  const params = method.parameters.map(node => node.getText(ast)).join(',');
  const compiled = ts.transpile(`function invoke(${params}) ${method.body.getText(ast)}`, { target: ts.ScriptTarget.ES2022 });
  fixture[name] = new Function('THREE', 'SPELL_VFX_LAYER', 'LIGHT_BUDGET_HEADROOM', 'SHADOW_LIGHT_BUDGET_HEADROOM', `${compiled}; return invoke;`)(THREE, 31, 6, 3);
}
fixture.scene.add(fixture.spellVfxScene);
const world = new THREE.PointLight(0xffffff, 1); world.layers.enable(31); fixture.scene.add(world);
const spellRoot = new THREE.Group(); fixture.spellVfxScene.add(spellRoot);
const spellLight = new THREE.PointLight(0xff8000, 4); spellLight.visible = false; spellRoot.add(spellLight);
const count = layer => {
  const mask = new THREE.Layers(); mask.set(layer); let result = 0;
  fixture.scene.traverseVisible(object => { if (object.isPointLight && object.layers.test(mask)) result++; });
  return result;
};
let expected;
for (const state of ['idle', 'casting', 'hidden-root', 'finished']) {
  spellLight.visible = state === 'casting';
  spellRoot.visible = state !== 'hidden-root';
  if (state === 'finished') spellRoot.removeFromParent();
  fixture.syncSpellVfxLayers();
  const parked = fixture.parkHiddenLights(); fixture.balanceLightCount();
  const mainCount = count(0);
  // Match the foreground renderer's light-layer setup before its draw.
  fixture.scene.traverse(object => { if (object instanceof THREE.Light) object.layers.enable(31); });
  const actual = [mainCount, count(31)];
  expected ??= actual;
  if (!baseline) assert.deepEqual(actual, expected, `Light count changed in ${state}`);
  if (!baseline && state === 'idle') assert.equal(spellLight.intensity, 0);
  fixture.restoreParkedLights(parked);
  assert.equal(spellLight.intensity, 4);
  console.log(`${state}: main=${actual[0]}, foreground=${actual[1]}`);
}
