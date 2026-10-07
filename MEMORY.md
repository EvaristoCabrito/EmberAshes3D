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
