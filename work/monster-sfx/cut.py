"""Cuts each monster's per-animation sound from its own source video, time-warped so it follows
the sheet exactly the way the game plays it (engine.ts):
  - "uniform": the whole sheet evenly over T seconds (casts / ranged wind-ups, hits, deaths).
  - "melee":   stepCombat's stages stretched to T: lunge 0.20 / hit 0.18 / recover 0.16 of the
               time, showing the first 50% / next 25% / rest of the frames (attackPose).
  - "walk":    the loop over T seconds, two passes (stopped when the move ends).
Source time of every sheet frame comes from match.py (matches.jsonl), the Big Blue Ox's own
manifest, or the Plague Cattle's raw manifest. Each segment between knots is stretched with
atempo (pitch kept). Levelled to -20 LUFS (walks -26), like the existing creature clips.
Clips cut from a music-bed video, or matched with a low score, are skipped."""
import json, subprocess, re
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
D = Path('C:/Users/evari/Downloads')
SFX = ROOT / 'public/game/MUSIC/SoundFX'
MUSIC = ('Wolf_walking_animation', 'Wolf_character_animation', 'Animate_creature_game_sprite', 'Animate_dark_fantasy',
         'Fantasy_creature_prompt', 'Creature_movement_and_attack', 'Zombie_animation_actions', 'Hit ReactionandDeath Embered',
         'Swamp_blue_calf_animation_guide')

# sprite -> (file stem, {pool prefix: (kind, model, seconds)})
PLAN = {
    'undeadOx': ('UndeadOx', {'atk-': ('attack', 'melee', 3), 'cast-': ('cast', 'uniform', 3), 'move-': ('walk', 'walk', 1.5), 'hit-': ('hit', 'uniform', 3), 'death-': ('death', 'uniform', 3)}),
    'wardog2': ('WarDog2', {'atk-': ('attack', 'melee', 3), 'move-': ('walk', 'walk', 1.5), 'death-': ('death', 'uniform', 3)}),
    'zombieDog': ('ZombieDog', {'atk-': ('attack', 'melee', 3), 'cast-': ('cast', 'uniform', 3), 'move-': ('walk', 'walk', 1.5), 'hit-': ('hit', 'uniform', 3), 'death-': ('death', 'uniform', 3), 'death2-': ('death2', 'uniform', 3)}),
    'RoccoTheBird': ('RoccoTheBird', {'atk-': ('attack', 'melee', 3), 'cast-': ('cast', 'uniform', 3), 'move-': ('walk', 'walk', 1.5)}),
    'mordavian-wolf-final': ('MordavianWolfFinal', {'atk-': ('attack', 'melee', 3), 'move-': ('walk', 'walk', 1.5), 'hit-': ('hit', 'uniform', 3), 'death-': ('death', 'uniform', 3)}),
    'troll2': ('CaveTroll2', {'atk-': ('attack', 'melee', 3), 'move-': ('walk', 'walk', 1.5)}),
    # Birolho Legs are arcane casters: their attack is a ranged wind-up, played evenly over 3 s.
    'BirolhoLegs': ('BirolhoLegs', {'atk-': ('attack', 'uniform', 3), 'cast-': ('cast', 'uniform', 3), 'move-': ('walk', 'walk', 1.5)}),
    'BirolhoLegs2': ('BirolhoLegs2', {'atk-': ('attack', 'uniform', 3), 'cast-': ('cast', 'uniform', 3), 'move-': ('walk', 'walk', 1.5)}),
    'EmberedWraith': ('EmberedWraith', {'atk-': ('attack', 'melee', 3), 'cast-': ('cast', 'uniform', 3), 'move-': ('walk', 'walk', 1.5), 'death-': ('death', 'uniform', 3)}),
    'zombie': ('Zombie', {'atk-': ('attack', 'melee', 3), 'move-': ('walk', 'walk', 1.5)}),
}
STEM = {'attack': 'ATT', 'cast': 'Cast', 'walk': 'Walk', 'hit': 'Hit', 'death': 'Death', 'death2': 'Death2'}

def knots_for(src, fps, model, T):
    """(game seconds, source seconds) knots for a sheet whose frame k came from video frame src[k]."""
    n = len(src)
    if model == 'melee':
        L = max(2, round(n * 0.5)); H = max(2, round(n * 0.25))
        stage = [(0, 0.0), (L, T * 0.2 / 0.54), (L + H, T * 0.38 / 0.54), (n, T)]
    else:
        stage = [(0, 0.0), (n, T)]
    # Extra knots every quarter sheet, placed on the stage's own time line.
    pts = {}
    for (f0, t0), (f1, t1) in zip(stage, stage[1:]):
        for f in range(f0, f1):
            pts[f] = t0 + (t1 - t0) * (f - f0) / (f1 - f0)
    pts[n] = T
    frames = sorted({0, n, *[s[0] for s in stage], *range(0, n, max(1, n // 4))})
    tail = float(np.mean(np.diff(src[-6:]))) if n > 6 else 1.0
    srcf = lambda f: (src[f] if f < n else src[-1] + max(tail, 0.5)) / fps
    out = []
    for f in frames:
        t, s = pts[f], srcf(f)
        if out and s <= out[-1][1] + 1e-3: s = out[-1][1] + 0.02  # never run backwards / zero length
        out.append((t, s))
    return out

def atempo_chain(r):
    parts = []
    while r < 0.5: parts.append('atempo=0.5'); r /= 0.5
    while r > 2.0: parts.append('atempo=2.0'); r /= 2.0
    parts.append(f'atempo={r:.5f}')
    return ','.join(parts)

def loudness(path):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', err)
    return float(m[-1]) if m else None

def render(video, knots, total, loops, out, target):
    segs, labels = [], []
    for i, ((t0, s0), (t1, s1)) in enumerate(zip(knots, knots[1:])):
        segs.append(f'[0:a]atrim=start={s0:.4f}:end={s1:.4f},asetpts=PTS-STARTPTS,aresample=48000,{atempo_chain((s1 - s0) / (t1 - t0))}[s{i}]')
        labels.append(f'[s{i}]')
    T = knots[-1][0]
    chain = ';'.join(segs) + f';{"".join(labels)}concat=n={len(labels)}:v=0:a=1,apad,atrim=duration={T:.4f}'
    if loops > 1: chain += f',aloop=loop={loops - 1}:size={round(T * 48000)}'
    full = T * loops
    chain += f',atrim=duration={full:.4f},afade=t=in:d=0.005,afade=t=out:st={full - 0.08:.4f}:d=0.08[a]'
    tmp = out.with_suffix('.tmp.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-filter_complex', chain, '-map', '[a]', '-ac', '2', str(tmp)], check=True)
    lufs = loudness(tmp)
    gain = 0 if lufs is None else max(-10, min(10, target - lufs))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(tmp), '-af', f'volume={gain:.2f}dB,alimiter=limit=0.95',
                    '-ar', '48000', '-ac', '2', '-b:a', '128k', str(out)], check=True)
    tmp.unlink()
    return lufs, gain

def main():
    results = []
    jobs = []  # (sprite, stem, kind, model, T, video path, src, fps, score)
    for line in (ROOT / 'work/monster-sfx/matches.jsonl').read_text().splitlines():
        m = json.loads(line)
        if m['sprite'] not in PLAN or m['pool'] not in PLAN[m['sprite']][1]: continue
        stem = PLAN[m['sprite']][0]; kind, model, T = PLAN[m['sprite']][1][m['pool']]
        jobs.append((m['sprite'], stem, kind, model, T, D / m['video'], m['src'], m['fps'], m['meanScore']))
    # Big Blue Ox: its manifest records every frame's source frame.
    ox = json.loads((ROOT / 'public/game/sprites/big-blue-ox-ai-006/manifest.json').read_text())
    pace = 0.75
    ox_plan = {'atk': ('attack', 'melee', 3 / pace), 'move': ('walk', 'walk', 1.5 / pace), 'hit': ('hit', 'uniform', 3 / pace * 75 / 83), 'death': ('death', 'uniform', 3 / pace)}
    for e in ox:
        if e['animation'] in ox_plan:
            kind, model, T = ox_plan[e['animation']]
            jobs.append(('big-blue-ox-002', 'BigBlueOx', kind, model, T, Path(e['source']), [f['sourceFrame'] for f in e['frames']], 24.0, 1.0))
    # Plague Bearing Cattle attack: re-cut with the melee stage timing (same file name).
    pc = {m['animation']: m for m in json.loads((ROOT / 'work/plague-cattle/raw/manifest.json').read_text())}
    jobs.append(('plague-bearing-cattle', 'PlagueCattle', 'attack', 'melee', 3, Path(pc['attack']['video']), pc['attack']['sourceFrames'], 24.0, 1.0))
    for sprite, stem, kind, model, T, video, src, fps, score in jobs:
        name = f'{stem}{STEM[kind]}001.mp3'
        if any(k in video.name for k in MUSIC):
            results.append(dict(sprite=sprite, kind=kind, file=None, skipped=f'music-bed video {video.name}')); continue
        if score < 0.6:
            results.append(dict(sprite=sprite, kind=kind, file=None, skipped=f'low match score {score}')); continue
        if kind == 'walk':
            # Loop: the sheet's frames plus one more step closes the cycle; two passes.
            knots = knots_for(src, fps, 'uniform', T); loops = 2
        else:
            knots = knots_for(src, fps, model, T); loops = 1
        lufs, gain = render(video, knots, T, loops, SFX / name, -26 if kind == 'walk' else -20)
        results.append(dict(sprite=sprite, kind=kind, file=name, video=video.name, score=score,
                            source=f'{knots[0][1]:.2f}-{knots[-1][1]:.2f}s', seconds=round(T * loops, 3), lufs=lufs, gain=round(gain, 1)))
        print(json.dumps(results[-1]), flush=True)
    (ROOT / 'work/monster-sfx/cuts.json').write_text(json.dumps(results, indent=1))
    for r in results:
        if r.get('skipped'): print('SKIPPED', r)

main()
