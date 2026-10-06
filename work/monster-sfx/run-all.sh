#!/bin/bash
# One sheet at a time (light CPU). Music-bed videos are included only so a sheet cut from one is
# recognised as such; their sound is never used.
cd /c/emberashes03D-main
out=work/monster-sfx/matches.jsonl; : > $out
m(){ python work/monster-sfx/match.py "$@" >> $out 2>>work/monster-sfx/match-errors.log; }
UO=("Idle and ATT" "Creature_walking_and_casting_magic" "Creature_hit_reaction_and_death_20261002204200")
for p in atk- cast- move- hit- death-; do m undeadOx $p 36 "${UO[@]}"; done
WD=("WarDog_executing" "Creature_walking_left_animation" "Creature_death_animation_collapse" "WarDog_performing")
for p in atk- move- death-; do m wardog2 $p 36 "${WD[@]}"; done
ZD=("Zombie_dog_walk_and_attack" "Zombie_dog_animations_hit_death" "Zombie_dog_Hit Reactand" "Zombie_dog_Atfive" "Zombie_dog_animation_reference")
for p in atk- cast- move- hit- death- death2-; do m zombieDog $p 36 "${ZD[@]}"; done
RB=("RoccoTheBird_walking" "Rocco_casting" "RoccoTheBird_hovering" "Creature_hit_reaction_animation")
for p in atk- cast- move-; do m RoccoTheBird $p 36 "${RB[@]}"; done
WF=("Mordavian_wolf_hit" "Wolf_game_animation_sequences" "Wolf_walking_animation" "Wolf_character_animation")
m mordavian-wolf-final atk- 36 "${WF[@]}"; m mordavian-wolf-final move- 36 "${WF[@]}"
m mordavian-wolf-final hit- 32 "${WF[@]}"; m mordavian-wolf-final death- 32 "${WF[@]}"
for p in atk- move-; do m troll2 $p 36 "Cave_troll"; done
BL=("Birolho_game_sprite_an" "20260928213459" "20260929134649" "Creature_photorealistic" "Animate_creature_game_sprite" "Animate_dark_fantasy")
m BirolhoLegs atk- 36 "${BL[@]}"; m BirolhoLegs cast- 48 "${BL[@]}"; m BirolhoLegs move- 36 "${BL[@]}"
for p in atk- cast- move-; do m BirolhoLegs2 $p 36 "${BL[@]}"; done
EW=("IdleandCastinEmbered" "WalkLeftandATTEmbered" "Hit ReactionandDeath Embered")
for p in atk- cast- move- death-; do m EmberedWraith $p 36 "${EW[@]}"; done
ZB=("Creature_animation_generation" "Zombie_animation_actions")
for p in atk- move-; do m zombie $p 32 "${ZB[@]}"; done
echo DONE >> work/monster-sfx/match-errors.log
