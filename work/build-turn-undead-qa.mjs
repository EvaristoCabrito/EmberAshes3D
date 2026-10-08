import {rolldown} from 'rolldown';
const b=await rolldown({input:'work/qa-turn-undead-entry.ts',platform:'node'});await b.write({file:'work/qa-turn-undead-bundle.mjs',format:'esm'});await b.close();
