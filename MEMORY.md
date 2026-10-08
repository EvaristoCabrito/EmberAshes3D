# Persistent project memory

## Spell areas — user instruction, 2026-10-07

**NEVER create round or square AOEs.** The user chose a hex grid specifically to avoid these shapes. Spell targeting, persistent areas, and visual effects must follow the exact affected hex cells. Never substitute a circle, circular ring, or square for a hex footprint. Show new spell FX in a preview and wait for the user's acceptance before integrating them into the game.

## Map design — user instruction, 2026-10-06

**DONT DO SQUARE MAPS.**

The user explicitly rejects square maps. Future map creation and map edits must respect this preference. Use irregular outlines appropriate to the location, with ample usable combat space. Do not fill maps with excessive trees that reduce frame rates.

## Browser automation — user instruction, 2026-10-07

**Use Playwright ONLY for all browser and game inspection, interaction, and verification. Do not use accessibility clicks, native computer controls, or other browser automation methods.**


## Ice Storm — user instruction, 2026-10-07

Ice Storm has NO clouds, now or in future versions. Do not create, reuse, or suggest cloud layers for this spell. Its effect uses falling ice, snow, impacts, and real lighting.

## Spell FX style — user instruction, 2026-10-07

Use only the game's existing normal 2D WebGL FX style for spell effects: animated energy, particles, glow, and light rendered through its WebGL effect system. Do not substitute 3D effects, sprite animations, image apparitions, or polygon/cartoon illustrations. Spell icons remain separate artwork. Preview new effects before combat integration.

Provoke FX: NO SKULL in the effect. Use energy, sparks, and glow only. The supplied skull image is the icon only.


## Local preview servers and ports — user instruction, 2026-10-07

Do not use ports 8080 or 8087 again. Do not start local game/preview servers unless the user explicitly asks. This preference follows the user asking to free the ports and then saying "never use it again".


## Turn Undead FX — user instruction, 2026-10-07

Turn Undead is a brief flash of divine light at impact, then disappears completely. It does not stay on the map. Use the existing healing, potion, lightning/lighting, and Birolho venom 2D FX as the visual reference. The V1 cage/line effect was rejected and must not be integrated. New versions still require preview acceptance before combat integration.

Turn Undead is centered on the priest, with no target selection. Selecting it must preview the affected area, then let the player confirm or cancel. Never cast immediately or spend a charge before confirmation. The Tier 3 radius must be substantial and grow through level 22; the rejected maximum radius of 3 was too small.

The user accepted Turn Undead V4 for combat integration to finish the task and move on, while explicitly saying the effect is unsatisfactory. Do not treat this acceptance as praise or as a preferred visual reference for future effects.

## Apparition lightning ATT — user instruction, 2026-10-07

Apparition's ATT is magical lightning, not physical. Blue lightning leaves her hands sideways, expanding along a straight line through exactly two hexes in front of her. Match the original five-second ATT animation's charge and hand release. New FX must be previewed before combat integration.
