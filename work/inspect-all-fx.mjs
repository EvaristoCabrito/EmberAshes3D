import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const b=await chromium.launch({channel:'msedge',headless:true});
try {
 const p=await b.newPage({viewport:{width:1440,height:1100}}); const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8080');await p.getByRole('button',{name:'Nova campanha',exact:true}).waitFor({timeout:60000});await p.getByRole('button',{name:'Modo teste',exact:true}).click();await p.getByRole('button',{name:/Dev Controls/}).click();
 const select=p.locator('select').first();const options=await select.locator('option').evaluateAll(os=>os.map(o=>({value:o.value,label:o.textContent})));await mkdir('work/fx-inspection',{recursive:true});
 const canvas=p.locator('canvas[aria-label="3D spell effect preview"]'); await canvas.scrollIntoViewIfNeeded();
 for(const o of options){await select.selectOption(o.value);await p.getByRole('button',{name:'Reiniciar',exact:true}).click();await canvas.click({position:{x:500,y:180}});await p.waitForTimeout(650);await canvas.screenshot({path:`work/fx-inspection/${o.value}-early.png`});await p.waitForTimeout(850);await canvas.screenshot({path:`work/fx-inspection/${o.value}-late.png`});console.log(o.value+' '+o.label);}
 await writeFile('work/fx-inspection/inventory.json',JSON.stringify({options,errors},null,2));
}finally{await b.close();}
