import {chromium} from 'playwright';const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage();await p.goto('http://127.0.0.1:8080');await p.getByRole('button',{name:'Nova campanha',exact:true}).waitFor({timeout:60000});await p.getByRole('button',{name:'Modo teste',exact:true}).click();await p.getByRole('button',{name:/^Debug/}).click();await p.getByRole('button',{name:/Classic Tactical/}).click();await p.waitForTimeout(5000);await p.getByRole('button',{name:'Stone Bridge',exact:true}).click();await p.waitForTimeout(1500);console.log((await p.locator('body').innerText()).slice(0,3000));await p.getByRole('button',{name:/O Vau/}).click();await p.getByRole('button',{name:/Entrar em combate/i}).click();await p.waitForTimeout(5000);console.log(await p.evaluate(()=>{const e=window.__emberEngine;return {keys:Object.keys(e),units:e.units?.map(u=>({id:u.id,name:u.name,side:u.side,x:u.x,y:u.y}))}}));console.log(await p.locator('button').evaluateAll(bs=>bs.map(b=>({text:b.innerText,aria:b.getAttribute('aria-label'),title:b.title}))));console.log((await p.locator('body').innerText()).slice(0,12000));await p.screenshot({path:'work/combat-debug-menu.png'});}finally{await b.close();}











