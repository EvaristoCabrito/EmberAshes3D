import { chromium } from 'playwright';
const b=await chromium.launch({channel:'msedge',headless:true});const p=await b.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(15000);
await p.goto('http://127.0.0.1:8080',{waitUntil:'domcontentloaded'});await p.getByRole('button',{name:/nova campanha/i}).waitFor();await p.getByRole('button',{name:/modo teste/i}).click();await p.getByRole('button',{name:/Dev Controls/i}).click();
for(const [label,name] of [['Procedural Pixel Poison V2 · estacionário','poison'],['Força Fantasmal · 3D compressão espectral','phantasmal'],['Burning Hands V3 · leque de fogo 3D','burning-hands'],['Web of Dreams · rede 3D persistente','web']]){
await p.getByLabel('Selecionar efeito VFX').selectOption({label});await p.getByRole('button',{name:'Reiniciar',exact:true}).click();await p.waitForTimeout(850);await p.screenshot({path:`work/existing-fx-${name}.png`});console.log(label+' captured');}
await b.close();
