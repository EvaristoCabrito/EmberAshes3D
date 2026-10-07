from pathlib import Path
import re

def read(p):return Path(p).read_text(encoding='utf-8')
def write(p,s):Path(p).write_text(s,encoding='utf-8')
p='src/game/types.ts';s=read(p);s='export type WeaponType = "sword" | "axe" | "mace" | "hammer" | "staff" | "spear" | "bow" | "crossbow" | "dagger";\nexport type WeaponSkillValues = Partial<Record<WeaponType, number>>;\n\n'+s
for interface in ['Unit','UnitPublic','BattleUnitSnap']:
 start=s.index('export interface '+interface+' {');end=s.index('\n}',start);chunk=s[start:end].replace('  resistances?: Resistances;','  resistances?: Resistances;\n  weaponSkills?: WeaponSkillValues;',1);s=s[:start]+chunk+s[end:]
start=s.index('export interface WeaponDef {');s=s[:start]+s[start:].replace('  id: string;','  id: string;\n  weaponType: WeaponType;',1)
start=s.index('export interface EquipmentDef {');s=s[:start]+s[start:].replace('  id: string;','  id: string;\n  /** Weapon equipment only: proficiency for an off-hand strike. */\n  weaponType?: WeaponType;',1)
s=s.replace('Partial<Record<`${ResistanceElement}Resistance`, number>>','Partial<Record<`${ResistanceElement}Resistance` | `${WeaponType}Weapon`, number>>')
write(p,s)
p='src/game/data.ts';s=read(p);s=s.replace('import type { Resistances }','import type { Resistances, WeaponType }',1)
s=s.replace('function wpn(id: string,','function wpn(weaponType: WeaponType, id: string,',1)
s=s.replace('return { id, name, usableBy, dice:','return { id, weaponType, name, usableBy, dice:',1)
def replace(m):
 id=m.group(1)
 rules=[('staff',('cajado','bastao','cetro')),('sword',('espada','lamina','montante','zweihander','cimitarra')),('axe',('machado',)),('mace',('maca',)),('hammer',('martelo','malho')),('bow',('arco',)),('crossbow',('besta',)),('spear',('lanca','partisan','guisarme'))]
 typ=next((t for t,prefix in rules if id.startswith(prefix)),None);assert typ,id
 return f'wpn("{typ}", "{id}"'
s=re.sub(r'wpn\("([^"]+)"',replace,s)
# Mark the generated off-hand daggers explicitly.
s=s.replace('kind: "weapon",','kind: "weapon", weaponType: "dagger",',1)
write(p,s)
p='src/game/skills.ts';s=read(p);s='import { RESISTANCE_ELEMENTS } from "./resistances.ts";\nimport { WEAPON_TYPES, WEAPON_TYPE_LABELS } from "./weaponTypes.ts";\n'+s
s=s.replace('Resistances, ResistanceElement','Resistances, ResistanceElement, WeaponType')
s=s.replace('export type SkillId = `${ResistanceElement}Resistance`;','export type SkillId = `${ResistanceElement}Resistance` | `${WeaponType}Weapon`;')
s=s.replace('  fireResistance:', '  ...Object.fromEntries(WEAPON_TYPES.map(type => [`${type}Weapon`, { name: WEAPON_TYPE_LABELS[type], description: "Improves weapon accuracy and damage through combat use." }])) as Record<`${WeaponType}Weapon`, { name: string; description: string }>,\n  fireResistance:',1)
s=s.replace('SKILL_IDS.map(id => [id.replace("Resistance", ""), skillValue(skills, hero, id)])','RESISTANCE_ELEMENTS.map(element => [element, skillValue(skills, hero, `${element}Resistance`)])',1)
s=s.replace('heroes: readonly string[]): HeroSkills','heroes: readonly string[], allowedWeapon?: (hero: string, type: WeaponType) => boolean): HeroSkills',1)
s=s.replace('    for (const id of SKILL_IDS) {','    for (const id of SKILL_IDS) {\n      if (id.endsWith("Weapon") && allowedWeapon && !allowedWeapon(hero, id.slice(0, -6) as WeaponType)) continue;',1)
write(p,s)
p='src/game/combat.ts';s=read(p);s='import { equippedWeaponType, weaponModifiers } from "./weaponSkills.ts";\n'+s
s=s.replace('const hitChance = 100;','const mastery = weaponModifiers(attacker, equippedWeaponType(attacker));\n  const hitChance = mastery.accuracy;',1)
s=s.replace('const hitChance = 100;','const mastery = weaponModifiers(attacker, equippedWeaponType(attacker, true));\n  const hitChance = mastery.accuracy;',1)
s=s.replace('const hitChance = 100;','const mastery = weaponModifiers(attacker, equippedWeaponType(attacker));\n  const hitChance = mastery.accuracy;',1)
s=s.replace('Math.max(1, raw) * weaponClassBonusMul(attacker)','Math.max(1, raw) * weaponClassBonusMul(attacker) * mastery.damage')
s=s.replace('Math.floor(raw));','Math.floor(raw * mastery.damage));',1)
s=s.replace('return { dmg, crit, landed: true, hitChance, preCritDmg };','return { dmg, crit, landed: hitChance >= 100 || rng() * 100 < hitChance, hitChance, preCritDmg };')
s=s.replace('hitChance: Math.round(hitChance)','hitChance')
write(p,s)
p='src/game/engine.ts';s=read(p);s='import { equippedWeaponType, trainedWeaponSkills, weaponTypesForClass, weaponModifiers, isWeaponAbility } from "./weaponSkills";\n'+s
s=s.replace('    resistances: { ...u.resistances },','    resistances: { ...u.resistances },\n    weaponSkills: { ...u.weaponSkills },')
s=s.replace('    resistances: sumResistances(st.resistances, gearBonus.resistances, side === "player" ? skillResistances(roster?.heroSkills, spawn.name) : undefined),','    resistances: sumResistances(st.resistances, gearBonus.resistances, side === "player" ? skillResistances(roster?.heroSkills, spawn.name) : undefined),\n    weaponSkills: side === "player" ? trainedWeaponSkills(roster?.heroSkills, spawn.name, cls.id) : undefined,',1)
s=s.replace('    res: snap.res,','    res: snap.res,\n    weaponSkills: snap.weaponSkills,',1)
s=s.replace('      if (!saved.resistances && unit.side', '      if (unit.side === "player" && !unit.summoned) unit.weaponSkills = trainedWeaponSkills(this.heroSkills, unit.name, unit.classId);\n      if (!saved.resistances && unit.side',1)
# Attempts train even on misses, after the damage and hit rolls use the old skill.
s=s.replace('        if (!hit.landed) {','        if (actor.side !== target.side) this.trainWeapon(actor, equippedWeaponType(actor, !!dice && a.spellKind !== "shieldBash"));\n        if (!hit.landed) {',1)
# Spell-step weapon abilities that resolve as spells need accuracy and mastery too.
s=s.replace('        let landed = true;','        let landed = true;\n        let weaponRolled = false;',1)
s=s.replace('          landed = hit.landed;\n          dmg = thrustHitIndex','          weaponRolled = true;\n          landed = hit.landed;\n          dmg = thrustHitIndex',1)
s=s.replace('          landed = hit.landed;\n          dmg = hit.dmg;','          weaponRolled = true;\n          landed = hit.landed;\n          dmg = hit.dmg;',1)
anchor='        if (!landed) {'
s=s.replace(anchor,'''        if (isWeaponAbility(a.spellKind)) {
          const type = equippedWeaponType(att);
          if (!weaponRolled) {
            const mastery = weaponModifiers(att, type);
            landed = mastery.accuracy >= 100 || this.rng() * 100 < mastery.accuracy;
            dmg = Math.max(1, Math.floor(dmg * mastery.damage));
          }
          if (att.side !== foe.side) this.trainWeapon(att, type);
        }
'''+anchor,1)
anchor='  private trainResistance('
pos=s.index(anchor);s=s[:pos]+'''  private trainWeapon(unit: Unit, type: import("./types").WeaponType | undefined): void {
    if (!type || unit.side !== "player" || unit.summoned || !weaponTypesForClass(unit.classId).includes(type)) return;
    const id = `${type}Weapon` as const;
    const current = this.heroSkills[unit.name]?.[id] ?? 0;
    const gained = rollSkillGain(current, this.rng);
    if (gained === null) return;
    this.heroSkills[unit.name] = { ...this.heroSkills[unit.name], [id]: gained };
    unit.weaponSkills = { ...unit.weaponSkills, [type]: gained };
  }

'''+s[pos:]
s=s.replace('    const bonus = gearStatBonus(Object.values(u.gear));','    const bonus = gearStatBonus(Object.values(u.gear));\n    if (u.side === "player" && !u.summoned) u.weaponSkills = trainedWeaponSkills(this.heroSkills, u.name, u.classId);',1)
write(p,s)
p='src/game/save.ts';s=read(p);s='import { weaponTypesForClass } from "./weaponSkills";\nimport { WEAPON_TYPES } from "./weaponTypes";\n'+s
s=s.replace('    resistances: cleanResistances(u.resistances),','    resistances: cleanResistances(u.resistances),\n    weaponSkills: Object.fromEntries(WEAPON_TYPES.filter(type => weaponTypesForClass(u.classId as ClassId).includes(type)).map(type => [type, Math.max(0, Math.min(100, Number((u.weaponSkills as Record<string, unknown> | undefined)?.[type]) || 0))])),',1)
s=s.replace('cleanHeroSkills(raw.heroSkills, [...HEROES, ...Object.keys(LATE_HERO_BASE_CLASS)])','cleanHeroSkills(raw.heroSkills, [...HEROES, ...Object.keys(LATE_HERO_BASE_CLASS)], (hero, type) => weaponTypesForClass(cleanPromotions(raw.promotions)[hero] ?? ({ ...HERO_BASE_CLASS, ...LATE_HERO_BASE_CLASS } as Record<string, ClassId>)[hero]).includes(type))',1)
s=s.replace('cleanHeroSkills(b.heroSkills, [...HEROES, ...Object.keys(LATE_HERO_BASE_CLASS)])','cleanHeroSkills(b.heroSkills, [...HEROES, ...Object.keys(LATE_HERO_BASE_CLASS)], (hero, type) => weaponTypesForClass(units.find(unit => unit.name === hero)?.classId ?? ({ ...HERO_BASE_CLASS, ...LATE_HERO_BASE_CLASS } as Record<string, ClassId>)[hero]).includes(type))',1)
write(p,s)
p='src/game/GameApp.tsx';s=read(p);s='import { trainedWeaponSkills, weaponTypesForClass } from "./weaponSkills";\nimport { WEAPON_TYPE_LABELS, weaponSkillAccuracy, weaponSkillDamageMultiplier } from "./weaponTypes";\n'+s
s=s.replace('    resistances: sumResistances(stats.resistances, gearBonus.resistances, skillResistances(save.heroSkills, hero)),','    resistances: sumResistances(stats.resistances, gearBonus.resistances, skillResistances(save.heroSkills, hero)),\n    weaponSkills: trainedWeaponSkills(save.heroSkills, hero, classId),',1)
anchor='        <p className="text-xs ember-kicker mb-2">Elemental Resistances</p>'
s=s.replace(anchor,'''        {unit.side === "player" && !unit.summoned && <>
          <p className="text-xs ember-kicker mb-2">Weapon Skills</p>
          <table className="w-full mb-2 text-xs tabular-nums">
            <thead><tr className="text-muted"><th className="text-left py-1">Weapon Type</th><th className="text-right py-1">Skill</th><th className="text-right py-1">Accuracy</th><th className="text-right py-1">Damage Bonus</th></tr></thead>
            <tbody>{weaponTypesForClass(unit.classId).map(type => {
              const value = unit.weaponSkills?.[type] ?? 0;
              return <tr key={type} className="border-t border-border"><td className="py-1">{WEAPON_TYPE_LABELS[type]}</td><td className="text-right">{value.toFixed(1)} / 100</td><td className="text-right">{weaponSkillAccuracy(value).toFixed(2)}%</td><td className="text-right">+{((weaponSkillDamageMultiplier(value) - 1) * 100).toFixed(3)}%</td></tr>;
            })}</tbody>
          </table>
          <p className="text-[11px] text-muted mb-4">Allowed weapon types only. Combat attempts can raise the used skill by 0.1, up to 100.</p>
        </>}

'''+anchor,1)
write(p,s)
p='src/game/resistances.test.ts';s=read(p).replace('assert.equal(SKILL_IDS.length, 8);','assert.equal(SKILL_IDS.filter(id => id.endsWith("Resistance")).length, 8);');write(p,s)
