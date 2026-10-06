"""Plague Bearing Cattle sound cues, cut from the same video windows as its sheets (see
raw/manifest.json). The game plays every 36-frame action sheet over 3 s and the walk loop over
1.5 s, so each window is time-stretched (pitch kept, atempo) to exactly that length and starts
on the sheet's first frame. Idle gets no sound on purpose. 128k/48k stereo like the other cues,
5 ms fade-in and 80 ms fade-out so the edges don't click."""
import json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SFX = ROOT / 'public/game/MUSIC/SoundFX'
FPS = 24
manifest = {m['animation']: m for m in json.loads((ROOT / 'work/plague-cattle/raw/manifest.json').read_text())}

def cut(animation, out, game_seconds, loops=1, inclusive=True):
    m = manifest[animation]
    frames = m['sourceFrames']
    first, last = frames[0], frames[-1]
    # Sheet frame k shows at k * game_seconds / 36; source frame k sits at first + k * step.
    # (A looping cut spans first..last+1, since its 37th frame would repeat the first.)
    step = (last - first) / 35 if inclusive else (last + 1 - first) / 36
    tempo = (step / FPS) / (game_seconds / 36)
    span = game_seconds * tempo
    loop_filter = f',aloop=loop={loops - 1}:size={round(game_seconds * 48000)}' if loops > 1 else ''
    total = game_seconds * loops
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{first / FPS:.4f}', '-t', f'{span:.4f}', '-i', m['video'], '-vn',
                    '-af', f'aresample=48000,atempo={tempo:.5f}{loop_filter},atrim=duration={total:.4f},'
                           f'afade=t=in:d=0.005,afade=t=out:st={total - 0.08:.4f}:d=0.08',
                    '-ar', '48000', '-ac', '2', '-b:a', '128k', str(SFX / out)], check=True)
    print(f'{out}: source {first / FPS:.3f}s +{span:.3f}s, tempo {tempo:.4f}, {total:.2f}s')

cut('attack', 'PlagueCattleATT001.mp3', 3.0)
cut('cast', 'PlagueCattleCast001.mp3', 3.0)
cut('death', 'PlagueCattleDeath001.mp3', 3.0)
# Walk: two passes of the 1.5 s loop (same as the Sapling); stopped when the move ends.
cut('walk', 'PlagueCattleWalk001.mp3', 1.5, loops=2, inclusive=False)
