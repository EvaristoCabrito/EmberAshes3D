from pathlib import Path
import re
files=['types.ts','data.ts','encounter-npcs.ts','engine.ts','combat.ts','save.ts','GameApp.tsx','gamePreferences.ts','weaponSkills.test.ts']
for name in files:
 p=Path('src/game')/name;s=p.read_text(encoding='utf-8')
 s=re.sub(r'\bres\b','dex',s);s=re.sub(r'\bRES\b','DEX',s);s=s.replace('resFrom','dexFrom').replace('resTo','dexTo')
 p.write_text(s,encoding='utf-8')
p=Path('src/game/weaponSkills.test.ts');s=p.read_text(encoding='utf-8').replace('"plain"','"plains"').replace('blessedHitBonusPct: 10','blessedHitBonusPct: 0.1');p.write_text(s,encoding='utf-8')
p=Path('src/game/weaponSkills.ts');s=p.read_text(encoding='utf-8');s='import { dexWeaponDamageMultiplier } from "./dexterity.ts";\n'+s
s=s.replace('"blessedHitBonusPct">','"blessedHitBonusPct" | "dex">')
s=s.replace('(unit.blessedHitBonusPct ?? 0)', '(unit.blessedHitBonusPct ?? 0) * 100')
s=s.replace('damage: weaponSkillDamageMultiplier(value)','damage: weaponSkillDamageMultiplier(value) * dexWeaponDamageMultiplier(unit.dex ?? 0)')
p.write_text(s,encoding='utf-8')
p=Path('src/game/combat.ts');s=p.read_text(encoding='utf-8');s='import { dexAccuracy } from "./dexterity.ts";\n'+s
s=s.replace('attacker.mag > 0 ? defender.dex : defender.def','attacker.mag > 0 ? 0 : defender.def')
s=s.replace('const hitChance = mastery.accuracy;','const hitChance = dexAccuracy(mastery.accuracy, attacker.dex ?? 0, defender.dex ?? 0);')
s=s.replace(' * against a caster.', ' * against a weapon. Elemental resistances protect against magic.')
s=s.replace('against a weapon, DEX\r\n * against a caster','against a weapon; elemental resistance against a caster')
p.write_text(s,encoding='utf-8')
p=Path('src/game/save.ts');s=p.read_text(encoding='utf-8');s='import { savedDex } from "./dexterity";\n'+s
s=s.replace('(source as Record<string, unknown>)[stat]', 'stat === "dex" ? savedDex(source as Record<string, unknown>) : (source as Record<string, unknown>)[stat]',1)
s=s.replace('dex: clampInt(u.dex, 0, 99)','dex: clampInt(savedDex(u), 0, 99)',1)
s=s.replace('dex: clampInt((u.diseaseBase as { dex?: unknown }).dex, 0, 99)','dex: clampInt(savedDex(u.diseaseBase as Record<string, unknown>), 0, 99)',1)
# Snapshot stat allocations are read separately from campaign allocations.
s=s.replace('    statPointAllocation:', '    statPointAllocation:',1)
p.write_text(s,encoding='utf-8')
p=Path('src/game/engine.ts');s=p.read_text(encoding='utf-8');s='import { dexAccuracy, dexEscapeChance } from "./dexterity";\n'+s
s=s.replace('const baseDamage = Math.max(1, rollDice(echo.dice, echo.faces, echo.bonus, this.rng) - u.dex);','const baseDamage = rollDice(echo.dice, echo.faces, echo.bonus, this.rng);',1)
s=s.replace('landed = mastery.accuracy >= 100 || this.rng() * 100 < mastery.accuracy;','const accuracy = dexAccuracy(mastery.accuracy, this.affinityUnit(att).dex, this.affinityUnit(foe).dex);\n            landed = accuracy >= 100 || this.rng() * 100 < accuracy;',1)
# Skill-aware spell fallback must not impose weapon mastery on ordinary magic.
# The existing flat magical defense is removed now that elemental resistance is in use.
s=s.replace('    const prot = protOf(att, foe);\n    const spell =','    const prot = 0;\n    const spell =',1)
s=s.replace('if (this.rng() < 0.6) {','if (this.rng() * 100 < this.fleeChance(u)) {',1)
anchor='  attemptFlee(): boolean {'
s=s.replace(anchor,'''  fleeChance(unit: Unit | undefined = this.activeTurnUnit() ?? undefined): number {
    if (!unit) return 0;
    const pursuers = this.units.filter(other => other.alive && other.side !== unit.side && other.side !== "neutral" && hexDist(other, unit) <= 3);
    const fastest = pursuers.length ? Math.max(...pursuers.map(other => this.affinityUnit(other).dex)) : 0;
    return dexEscapeChance(this.affinityUnit(unit).dex, fastest);
  }

'''+anchor,1)
# Enemy flight only happens for wounded, nonscripted, nonboss units already at an exit edge.
anchor='    this.smashBarricades(next);'
s=s.replace(anchor,'''    if (next.side === "enemy" && !isBossClass(next.classId) && !next.dialog && !next.holdsPosition && next.hp <= next.maxHp * 0.25 && footprint(next).some(cell => cell.x <= 0 || cell.y <= 0 || cell.x >= this.cols - 1 || cell.y >= this.rows - 1)) {
      const chance = this.fleeChance(next);
      if (this.rng() * 100 < chance) {
        next.escaped = true;
        next.alive = false;
        next.fade = 0;
        this.invalidateOcc();
        this.pushLog(`${next.name} fugiu (${chance}% de chance).`);
      } else this.pushLog(`${next.name} tentou fugir, mas foi impedido (${chance}% de chance).`);
      next.moved = true;
      next.acted = true;
      this.mode = "idle";
      this.evaluateEnd();
      return;
    }
'''+anchor,1)
s=s.replace('    hp: u.hp,','    hp: u.hp,\n    escaped: u.escaped,')
s=s.replace('    hp: snap.hp,','    hp: snap.hp,\n    escaped: snap.escaped,',1)
# Remove incorrect flat-DEX magic-defense descriptions.
s=s.replace(' − DEX','').replace(' contra DEX',' contra resistência elemental')
p.write_text(s,encoding='utf-8')
p=Path('src/game/types.ts');s=p.read_text(encoding='utf-8')
for interface in ['Unit','UnitPublic','BattleUnitSnap']:
 start=s.index('export interface '+interface+' {');end=s.index('\n}',start);chunk=s[start:end].replace('  hp: number;','  hp: number;\n  escaped?: boolean;',1);s=s[:start]+chunk+s[end:]
p.write_text(s,encoding='utf-8')
p=Path('src/game/save.ts');s=p.read_text(encoding='utf-8');s=s.replace('    hp: clampInt(u.hp, 0, 999),','    hp: clampInt(u.hp, 0, 999),\n    escaped: u.escaped === true,',1);p.write_text(s,encoding='utf-8')
p=Path('src/game/GameApp.tsx');s=p.read_text(encoding='utf-8')
s=s.replace('!x.alive && !x.summoned','!x.alive && !x.summoned && !x.escaped')
s=s.replace('"Encontraram uma rota de fuga. Desejam tentar escapar? (60% de chance)"','`Encontraram uma rota de fuga. Desejam tentar escapar? (${engine.fleeChance()}% de chance)`')
s=s.replace('title="Apenas na borda do mapa. 60% de chance; se falhar, o turno acaba e os inimigos continuam atacando."','title={`Apenas na borda do mapa. ${engine.fleeChance()}% de chance; DEX dos oponentes próximos dificulta a fuga. Se falhar, o turno acaba.`}')
s=s.replace('Fugir combate · 60%','Fugir combate · {engine.fleeChance()}%')
s=s.replace('(DEX, contra magia)','(resistência elemental, contra magia)')
s=s.replace(' − DEX','').replace(' − ${unit.dex}','')
s=s.replace('weaponSkillAccuracy(value).toFixed(2)','Math.min(100, weaponSkillAccuracy(value) + Math.min(20, unit.dex / 2)).toFixed(2)')
s=s.replace('weaponSkillDamageMultiplier(value) - 1','weaponSkillDamageMultiplier(value) * (1 + Math.min(100, unit.dex) / 1000) - 1')
s=s.replace('<th className="text-right py-1">Accuracy</th>','<th className="text-right py-1">Accuracy vs DEX 0</th>')
p.write_text(s,encoding='utf-8')
