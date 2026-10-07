import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8080/provoke-preview.html');
 const result=await page.evaluate(async()=>{
  const THREE=await import('/node_modules/.vite/deps/three.js');
  const {groundDepthLayer}=await import('/src/game/gfx/three/groundDepthLayer.ts');
  const {ThreeBattleRenderer}=await import('/src/game/gfx/three/ThreeBattleRenderer.ts');
  const {ThreeElevationSteps}=await import('/src/game/gfx/three/ThreeElevationSteps.ts');
  const renderer=new THREE.WebGLRenderer({antialias:false});renderer.setSize(128,128);renderer.setClearColor(0);
  const target=new THREE.WebGLRenderTarget(128,128);renderer.setRenderTarget(target);
  const camera=new THREE.OrthographicCamera(-64,64,64,-64,.1,1000);camera.position.z=400;
  const scene=new THREE.Scene();scene.add(new THREE.AmbientLight(0xffffff,3));
  const img=document.createElement('canvas');img.width=8;img.height=8;const ctx=img.getContext('2d');ctx.fillStyle='#ff0000';ctx.fillRect(0,0,8,8);
  const enabled={value:1};
  const game=Object.create(ThreeBattleRenderer.prototype);game.materialCache=new Map();game.engine={art:{tiles:{grass:[img]}}};game.groundAO={patch(){}};game.groundDepthLayerEnabled=enabled;
  const top=new THREE.Mesh(new THREE.PlaneGeometry(120,120),game.materialFor('grass',0));scene.add(top);
  const sprite=new THREE.Mesh(new THREE.PlaneGeometry(32,48),new THREE.MeshBasicMaterial({color:0x00ff00,transparent:true,depthWrite:false}));sprite.position.z=1.05;scene.add(sprite);
  const read=()=>{renderer.render(scene,camera);const pixel=new Uint8Array(4);renderer.readRenderTargetPixels(target,64,64,1,1,pixel);return Array.from(pixel)};
  const results=[];
  for(const height of [0,20,60,120]){top.position.z=height;enabled.value=1;const pixel=read();const samples=[];for(const x of [50,64,78])for(const y of [43,64,85]){const p=new Uint8Array(4);renderer.readRenderTargetPixels(target,x,y,1,1,p);samples.push(Array.from(p))}results.push({height,pixel,samples})}
  enabled.value=0;top.position.z=60;const original=read();
  // Raised side faces use the same shader and stay in the ground layer too.
  enabled.value=1;const steps=new ThreeElevationSteps(enabled);steps.rebuild(1,1,32,()=>2,11.2);
  const face=steps.group.children[0];const shader={uniforms:{},vertexShader:'#include <project_vertex>',fragmentShader:''};face.material.onBeforeCompile(shader,renderer);
  const sidePatched=shader.uniforms.groundDepthLayerEnabled===enabled&&shader.vertexShader.includes('terrainDepth * 0.04');
  renderer.dispose();target.dispose();steps.dispose();return{results,original,sidePatched};
 });
 assert.ok(result.results.every(r=>r.samples.every(p=>p[1]>240&&p[0]<10)));assert.ok(result.original[0]>200&&result.original[1]<10);assert.equal(result.sidePatched,true);
 console.log(JSON.stringify(result));console.log('PASS: real game terrain material preserves units over raised ground at four heights; raised sides share the fix; spatial depth remains available.');
}finally{await browser.close()}
