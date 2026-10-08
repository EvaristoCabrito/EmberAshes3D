# Project instructions

## Map design

- **DONT DO SQUARE MAPS.** Never create square map layouts or square board outlines.
- Use irregular outlines that fit the location and leave ample usable space for combat.
- Read [MEMORY.md](MEMORY.md) for the user's persistent project preferences.

## User preferences

- NEVER use circular or square spell AOEs. Gameplay areas, targeting previews, and spell FX must follow the exact affected hex cells and their outer hex boundary.

- Use complete tables in their original format; never summarize, compress, or invent a different format to save characters.
- Make tables easy to scan at a glance, with values shown directly so the user does not need to perform mental calculations or convert formats.
- Do calculations and data extraction yourself; do not expect the user to calculate or convert values.

## Browser automation

- Use Playwright ONLY for all browser and game inspection, interaction, and verification. Do not use accessibility clicks, native computer controls, or other browser automation methods.



## Veo Animation Prompt Rules

### Prompt scope and format

- Write prompts specifically for Veo. Describe the visible action and performance clearly; do not add explanations or generic production boilerplate.
- Write one complete prompt for each separate animation action. Keep Walk, ATT, HIT, and FALL as separate clips. Never combine walking with an attack or another state unless the user explicitly requests a combo.
- When the user explicitly requests two actions in one 10-second combo, divide it into 0–5 seconds and 5–10 seconds. Keep the two actions distinct and use the full time assigned to each.
- Reproduce the complete revised prompt whenever the user asks for a change. Do not provide patches or partial replacement lines.
- Use English for animation prompts unless the user requests another language. Do not use code boxes.
- No character names in prompts. Do not use negative prompts; state the intended action and result directly.

### Reference and continuity

- When a reference image is supplied, use `reference_image: "use_uploaded_image"` where the prompt format calls for it.
- Treat the reference as the authority for appearance, proportions, pose, clothing, equipment, and starting orientation. Preserve the same character throughout; avoid unnecessary appearance or location descriptions.
- Keep the full character and all equipment visible when the user requests full framing. Preserve the reference composition unless the user asks to change it.

### Veo settings and camera

- The user configures Veo duration, camera, framing, resolution, and aspect ratio in the tool. Omit these settings from prompts by default.
- If the user explicitly asks for a camera instruction, include only the requested camera behavior. For a locked full-body view, say the camera remains fixed in a steady full-body composition with the character kept in frame. Do not add camera movement, zoom, tracking, reframing, or scanning unless requested.
- Do not add timing unless the user requests timed choreography or a combo.

### Action and direction

- Keep actions natural, restrained, and readable by default. Do not exaggerate, add theatrical gestures, or invent unrelated body actions.
- Use concrete action verbs instead of unexplained state labels. Do not use the word “idle” in prompts; the model does not respond reliably to it. For a resting action, describe the specific subtle behavior the user requested.
- Follow the direction the user specifies. If they ask for a character to walk right, clearly say she walks to the right. Keep any related attack direction consistent only when that attack is requested in its own prompt.
- Make each action appropriate to its animation state: a walk contains walking; an ATT contains the attack; a HIT contains only the reaction; a FALL contains the fall. Do not mix states.
- For attacks, give a clear, controlled action arc at the requested intensity. Avoid unnecessary windups, broad swings, large body turns, repeated gestures, or dramatic recoil unless requested.
- For HIT reactions, show the character reacting to an unseen hit. Do not show or imply an attacker, weapon, projectile, spell, or impact source.
- Use the label “FALL” when the user asks for a fall animation. Do not label it “death.”

### Current lightning-ghost animation

- This character is a lightning ghost. Do not describe her as a frozen or ice ghost.
- Use blue electrical sparks and lightning effects. In the ATT action, she gathers blue sparks with her hands, her expression becomes serious, then she performs a concise, deliberate cast in the requested direction. Keep the casting controlled and not exaggerated.
- Do not add ice crystals, shards, or other spell forms the user did not request.
- For the current requested walk, she walks to the right. Keep this as a separate prompt from ATT.

### Audio

- Include audio only when requested or when the user’s animation format expects it. Use action or character sound effects only; omit music and ambient tracks.
