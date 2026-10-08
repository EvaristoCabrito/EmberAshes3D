import {chromium} from 'playwright';
const b=await chromium.launch({channel:'msedge',headless:true,args:['--no-sandbox','--use-angle=d3d11']});
try{const p=await b.newPage();await p.goto('http://127.0.0.1:8080/provoke-preview.html');
const r=await p.evaluate(async()=>{const {BattleEngine}=await import('/src/game/engine.ts');
const art=new Proxy({decorations:{}},{get:(t,k)=>t[k]??(t[k]={})});
const m={id:'q',index:0,title:'',place:'',briefing:'',objective:'',win:'rout',cols:8,rows:4,layout:['........','........','........','........'],decorations:[],playerSpawns:[{name:'Kael',classId:'swordsman',x:1,y:1}],enemySpawns:[{name:'M',classId:'miliciaV2',x:5,y:1}]};
const e=new BattleEngine(m,art,{hp:{},levels:{}},1);const u=e.units[1];const out=[];
for(const t of [0,0.119,0.238,1,2,4.28,4.4]){u.bob=t;out.push([t,e.idleFrame(u,36)]);}
const k=e.units[0];const kael=[];for(const t of [0,1,2,3,4]){k.bob=t;kael.push([t,e.idleFrame(k,36)]);}
return {militia:out,kaelUnchanged:kael};});console.log(JSON.stringify(r));}finally{await b.close();}
