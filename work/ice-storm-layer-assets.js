import * as THREE from 'three';
export const ICE_STORM_LAYERS = [
 {id:'cloud-main',file:'ice-cloud-main.png',height:2.8,width:1.8,size:1.2,opacity:.8,rate:9},
 {id:'cloud-secondary',file:'ice-cloud-secondary.png',height:2.65,width:1.7,size:1.0,opacity:.55,rate:11},
 {id:'cloud-particles',file:'ice-cloud-particles.png',height:2.9,width:1.5,size:1.0,opacity:.4,rate:13},
 {id:'ice-main',file:'ice-ice-main.png',height:1.3,width:1.25,size:1.8,opacity:.85,rate:15},
 {id:'ice-secondary',file:'ice-ice-secondary.png',height:.02,width:1.2,size:.8,opacity:.85,rate:14},
 {id:'ice-particles',file:'ice-ice-particles.png',height:.1,width:1.35,size:1.1,opacity:.7,rate:16},
 {id:'snow-main',file:'ice-snow-main.png',height:.65,width:1.4,size:1.7,opacity:.48,rate:12},
 {id:'snow-secondary',file:'ice-snow-secondary.png',height:.2,width:1.5,size:1.1,opacity:.42,rate:10},
 {id:'snow-particles',file:'ice-snow-particles.png',height:1.1,width:1.55,size:2.0,opacity:.65,rate:15}
];
export async function loadStormLayers(){return Promise.all(ICE_STORM_LAYERS.map(async layer=>({...layer,texture:await new THREE.TextureLoader().loadAsync('./'+layer.file)})));}
