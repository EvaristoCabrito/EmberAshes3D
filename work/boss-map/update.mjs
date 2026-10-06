import fs from 'node:fs';
const path='src/game/maps/wisp-forest-crossing-boss001.json';
const file=JSON.parse(fs.readFileSync(path,'utf8'));
const m=file.draft;
const oldRows=m.rows;
m.rows=22;
const edges=[[4,25],[5,24],[6,24],[7,23],[8,22],[8,21],[9,21],[8,22],[9,22],[10,21],[10,20],[11,20],[12,19],[13,18]];
for(const key of ['tiles','tileVariants','tileRots','terrainElevations','waterLevels']) {
 const previous=m[key];
 m[key]=Array.from({length:m.cols*m.rows},(_,i)=>{
  const y=Math.floor(i/m.cols),x=i%m.cols;
  if(y<8)return previous[i];
  if(key!=='tiles')return y<oldRows?previous[i]:0;
  const [left,right]=edges[y-8];
  if(x<left||x>right)return 'void';
  return x===left||x===right?'woods':'plains';
 });
}
m.playerSpawns.forEach(p=>p.y=19);
m.enemySpawns=m.enemySpawns.filter(p=>p.classId==='carnivorousPlant');
for(const [x,y] of [[13,12],[17,13],[15,15]])m.enemySpawns.push({name:'Muda Carnívora',classId:'sapling',x,y,useClassSprite:true,level:2});
const props=[
 ['wilds-mossy-log',7,9,true,0],['wilds-mossy-stones',23,9,true,0],
 ['wilds-root-tangle',10,10,false,0],['wilds-mushroom-cluster',20,10,false,0],
 ['wilds-thorn-bramble',9,12,true,0],['wilds-hollow-stump',20,12,true,0],
 ['wilds-dead-fern-pile',10,14,false,0],['wilds-mossy-log',20,15,true,0],
 ['wilds-root-tangle',11,16,false,0],['wilds-mushroom-cluster',19,17,false,0],
 ['wilds-tree-stump',12,18,true,0],['wilds-dry-twig-pile',18,18,false,0],
 ['wilds-shelf-mushrooms',11,8,false,0],['wilds-root-tangle',20,8,false,0],
];
m.decorations=m.decorations.filter(p=>p.y<8);
for(const [id,x,y,blocksPath,rot] of props)m.decorations.push({id,x,y,blocksPath,rot});
fs.writeFileSync(path,JSON.stringify(file,null,2)+'\n');
