import type { Resistances, ResistanceElement, SpellKind } from "./types";

export const RESISTANCE_ELEMENTS = ["fire", "lightning", "ice", "arcane", "darkness", "holy", "poison", "ember"] as const;
export const RESISTANCE_LABELS: Record<ResistanceElement, string> = {
  fire: "Fire", lightning: "Lightning", ice: "Ice", arcane: "Arcane",
  darkness: "Darkness", holy: "Holy", poison: "Poison", ember: "Ember",
};

/** Stored resistance stays uncapped: penetration is subtracted before clamping. */
export function effectiveResistance(resistance: number, mag = 0, penalty = 0): number {
  return Math.max(-50, Math.min(100, resistance - penalty - mag / 2));
}

/** Round once, after resistance; full immunity must be able to produce zero damage. */
export function elementalDamage(baseDamage: number, resistance: number, mag = 0, penalty = 0): number {
  return Math.max(0, baseDamage) * (1 - effectiveResistance(resistance, mag, penalty) / 100);
}

export function sumResistances(...sources: (Resistances | undefined)[]): Resistances {
  return Object.fromEntries(RESISTANCE_ELEMENTS.map(element => [element,
    sources.reduce((sum, source) => sum + (source?.[element] ?? 0), 0),
  ]));
}

/** Save compatibility: absent elements are zero; reject malformed/nonfinite values. */
export function cleanResistances(raw: unknown): Resistances | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const source = raw as Record<string, unknown>;
  return Object.fromEntries(RESISTANCE_ELEMENTS.map(element => {
    const value = source[element];
    return [element, typeof value === "number" && Number.isFinite(value) ? Math.max(-999, Math.min(999, value)) : 0];
  }));
}

const SPELL_ELEMENTS: Partial<Record<SpellKind, ResistanceElement>> = {
  fireball: "fire", burningHands: "fire",
  lightning: "lightning", lightningTier3: "lightning", shock: "lightning",
  magicMissile: "arcane", magicMissileV2: "arcane", phantasmalForce: "arcane", fantomForce: "arcane",
  lifeDrain: "darkness", divineWrath: "holy",
  causticVenom: "poison", minorVenom: "poison", poisonBreath: "poison",
};

export function spellElement(kind: SpellKind | null): ResistanceElement | undefined {
  return kind ? SPELL_ELEMENTS[kind] : undefined;
}
