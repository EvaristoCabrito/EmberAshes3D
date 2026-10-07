// Map files must reach the game with NO dev-server restart: save a throwaway copy of a map
// through the editor's own route, check the served map list picks it up, delete it through
// the editor's route, check it's gone. Runs against the user's running 8080 server.
import {readFileSync} from 'node:fs';
const BASE='http://127.0.0.1:8080';
const ID='qa-live-reload-check';
const served=async()=>(await (await fetch(`${BASE}/src/game/mapstore.ts`)).text()).match(new RegExp(`maps/${ID}\\d{3}\\.json`,'g'))??[];
// Each file appears twice in the served module (import + ?import); count files, not lines.
const unique=list=>[...new Set(list)];
const src=JSON.parse(readFileSync(process.argv[2]??'src/game/maps/vau027.json','utf8').replace(/^﻿/,''));
const save=await (await fetch(`${BASE}/__map-save`,{method:'POST',body:JSON.stringify({...src.draft,id:ID,locationId:''})})).json();
console.log('save',JSON.stringify(save));
const afterSave=await served();
console.log('served after save',JSON.stringify(afterSave));
const file=save.file?.split(/[\\/]/).pop();
const del=await (await fetch(`${BASE}/__map-delete`,{method:'POST',body:JSON.stringify({file})})).json();
console.log('delete',JSON.stringify(del));
const afterDelete=await served();
console.log('served after delete',JSON.stringify(afterDelete));
console.log(unique(afterSave).length===1&&afterDelete.length===0?'PASS: no restart needed':'FAIL');
