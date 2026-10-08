import {readFile,writeFile} from 'node:fs/promises';
const source=JSON.parse(await readFile('src/game/maps/profundezas002.json','utf8'));
const draft=structuredClone(source.draft),{cols,rows}=draft;
const bounds=[[7,18],[4,21],[2,23],[1,24],[1,24],[0,24],[0,25],[1,25],[1,24],[1,24],[0,23],[0,24],[1,25],[2,25],[0,24],[0,23],[3,22],[6,20]];
const inside=(x,y)=>y>=0&&y<rows&&x>=bounds[y][0]&&x<=bounds[y][1];
draft.tiles=Array.from({length:cols*rows},(_,i)=>inside(i%cols,Math.floor(i/cols))?'nave':'void');
draft.tileVariants=draft.tiles.map((t,i)=>t==='void'?0:((i%cols<bounds[Math.floor(i/cols)][0]+3||i%cols>bounds[Math.floor(i/cols)][1]-3||Math.floor(i/cols)<3)?11:10));
draft.tileRots=Array(cols*rows).fill(0);draft.baseTile='nave';draft.baseVariant=10;
draft.environment='indoor';draft.ambientIntensity=.85;draft.sunIntensity=.7;draft.mistType='none';draft.bloomIntensity=.2;
const decor=source.draft.decorations.filter(p=>p.id==='locked-chest');
// The old central chest sat inside the Horror's occupied footprint.
const centralChest=decor.find(p=>p.x===11&&p.y===5);if(centralChest){centralChest.x=10;centralChest.y=3;}
const claimed=new Set(decor.map(p=>`${p.x},${p.y}`));
const add=(id,x,y,width=1,mirrorX=false)=>{
 if(!Array.from({length:width},(_,i)=>inside(x+i,y)&&!claimed.has(`${x+i},${y}`)).every(Boolean))throw new Error(`Invalid decor ${id} ${x},${y}`);
 decor.push({id,x,y,...(mirrorX?{mirrorX:true}:{})});for(let i=0;i<width;i++)claimed.add(`${x+i},${y}`);
};
// Broken, offset upper ledges rather than a rectangular wall band.
for(const [x,y]of[[7,0],[11,0],[15,0],[4,1],[19,1],[21,2]])add('cave-slate-shelf-001',x,y,3,(x+y)%2===0);
// Large side shoulders interspersed with narrower natural cave formations.
for(const [x,y]of[[1,4],[22,4],[0,6],[24,6],[1,8],[23,8],[0,10],[22,10],[1,12],[24,12],[23,14],[3,16],[21,16],[6,17],[11,17],[17,17]])add('cave-fractured-boulders-001',x,y,2,(x+y)%2===0);
for(const [x,y]of[[2,2],[1,3],[24,3],[0,5],[24,5],[1,7],[25,7],[1,9],[24,9],[0,11],[24,11],[2,13],[25,13],[23,15]])add('cave-limestone-spires-001',x,y);
// Retain the interior rocky obstacles; no extra choke points in the combat lanes.
for(const [x,y]of[[18,4],[4,8],[20,8],[8,12],[16,12]])add('cave-fractured-boulders-001',x,y,2,true);
for(const [x,y]of[[6,4],[12,8]])add('cave-limestone-spires-001',x,y);
// Quiet evidence of the hungry depths, tucked against stone instead of filling the room.
for(const [x,y]of[[3,7],[21,11],[17,15]])add('cave-bones',x,y);
for(const [x,y]of[[4,3],[20,3],[3,11],[22,13]])add('light-brazier-bowl',x,y);
draft.decorations=decor;
await writeFile('src/game/maps/profundezas003.json',JSON.stringify({serial:3,savedAt:Date.now(),draft},null,2)+'\n');
console.log(`Saved version 3: ${draft.tiles.filter(t=>t!=='void').length} irregular floor cells; ${decor.length} decorations; west entrance open.`);
