import type { WeaponType } from "./types.ts";

export const WEAPON_TYPES = ["sword", "axe", "mace", "hammer", "staff", "spear", "bow", "crossbow", "dagger"] as const;
export const WEAPON_TYPE_LABELS: Record<WeaponType, string> = {
  sword: "Swords", axe: "Axes", mace: "Maces", hammer: "Hammers", staff: "Staves",
  spear: "Spears & Polearms", bow: "Bows", crossbow: "Crossbows", dagger: "Daggers",
};

export function weaponSkillAccuracy(value: number): number {
  return 75 + cleanWeaponSkill(value);
}

export function weaponSkillDamageMultiplier(value: number): number {
  return (100 + cleanWeaponSkill(value)) / 100;
}

/** Preserve legacy fractional progress by rounding upward, as approved by the user. */
export function cleanWeaponSkill(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, Math.ceil(value))) : 0;
}
