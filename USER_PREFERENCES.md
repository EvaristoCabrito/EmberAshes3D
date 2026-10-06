# Visual asset preference

## Follow the exact requested scope

Do only what the user explicitly asks. Do not go the extra mile, add enhancements, expand scope, or make unsolicited changes. When asked to make an existing feature work, fix only its behavior and preserve its existing design and implementation wherever possible. In particular, a request to make the loading bar work does not authorize creating a new loading bar or changing its appearance. If an additional change is necessary but outside the requested scope, explain it and obtain the user's explicit direction before making it.

## Preserve the game's design

All existing maps and every new map created in the future must have straight, connected boundaries, with no hex-shaped or hex-scalloped edges, ever. Dungeon walls must meet the map floor with no void gap between them. Apply this in shared rendering and map-creation behavior for every map, not selected maps or previews.

Never draw floor or board edges outside enclosing walls. The floor must end underneath the outside wall faces. Do not add a second automatic outer wall ring around authored walls. Watchtower walls must use the matching masonry finish requested by the user.

Do not change the game's existing designs unless the user explicitly requests the specific design change. Preserve the established appearance, layouts, styling, characters, environments, and effects. Bug fixes and feature work must retain the existing design; do not redesign, restyle, or make unsolicited visual improvements.

Never generate, redraw, repaint, or otherwise alter visual artwork for this user.
Use only the exact image files the user supplies. Crop an image only when the user
explicitly requests a crop.

# Verification preference

Use rigorous tests by default before reporting work complete. Verify actual runtime behavior, exercise relevant alternate states and regressions, and inspect rendered results for visual changes. File checks and typechecks alone are insufficient for animation or rendering changes. State precisely what was tested and any remaining limitations. Deliver early results only when the user interrupts and requests them before verification is complete.

# Debug mode preference

Debug mode must follow the same game flow as normal play, including the same cutscenes, briefings, subtitle behavior, and sound controls. Its only gameplay differences are that missions are unlocked and party levels are boosted. Do not create separate debug-only menus or preview routes for content that belongs in the normal flow.

# Project state preference

Treat this directory as the current game files only. Do not initialize Git, create branches, or create worktrees. When the user requests saving a state, use a plain backup copy instead.

## Never undo earlier work

Never undo, revert, reset, discard, or overwrite earlier work. Preserve all prior changes
and user edits. Make new work additive and narrowly scoped. If a requested change appears to
conflict with earlier work, keep the earlier work intact and explain the conflict before
changing it.

