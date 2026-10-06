This project is located at `C:\emberashes03D-main`.

## Preserve the project

- Preserve everything already in the project, including assets, source files, data, and existing user changes.
- Never delete, overwrite, replace, reset, or discard existing project content unless the user explicitly authorizes that specific change.
- When adding or changing behavior, keep the original implementation and assets available unless the user explicitly orders their removal. Prefer reversible changes that leave existing work intact.

## NEVER UNDO ANY EARLIER WORK

- Never revert, roll back, or overwrite work from an earlier session, Claude, or Codex — even if it looks unrelated to the current task. The only thing you may revert is a line you changed yourself in the current session.

## Loading bars are LOCKED (settled 2026-10-06)

- Never change any loading bar. Every bar shows REAL progress or nothing — no fake, indeterminate, sweeping, or random fill, ever.
- Title screen (`TitleLoader` / `useArtLoadProgress` in src/game/GameApp.tsx, `.title-loader*` in src/styles.css, `artProgress()` in src/game/assets.ts): gothic "Despertando as cinzas" bar with a real NN%, smooth molten fill with NO diagonal stripes/lines across it.
- Battle curtain: real % of the battle's files + 1 final warmed-frame step, "Preparando batalha · loaded/total recursos".
- `LoadingArt` (src/game/MapLoadingOverlay.tsx): no fill at all when progress is unknown — never a sweep.
- Full details: the "Loading bars" entry in CLAUDE.md's Locked behavior list.

## Debug mode parity

- Debug mode must follow the same game flow as normal play, including the same cutscenes, briefings, subtitle behavior, and sound controls. Its only gameplay differences are that missions are unlocked and party levels are boosted. Do not create separate debug-only menus or preview routes for content that belongs in the normal flow.

## FX preservation rule

- Never overwrite, replace, retune, or save over any existing FX or its settings. Preserve every version exactly as it is. Any new or revised FX must be created as a separate, uniquely named version with separate settings and an explicit selector. Keep approved FX available and unchanged unless the user explicitly authorizes a specific modification to that exact FX.

