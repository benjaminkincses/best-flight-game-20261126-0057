import {WORLD} from './config.js';
import {mulberry32} from './random.js';
export function createWorld(seed=WORLD.seed) {
 const rng=mulberry32(seed), phases=[rng()*6.28,rng()*6.28,rng()*6.28];
 const valleyCentre=z=>z<1400?0:150*Math.sin((z-1400)/1500);
 function terrainHeight(x,z) {
  if(Math.abs(x)<95&&z>-570&&z<780)return WORLD.floor;
  const d=Math.abs(x-valleyCentre(z));
  const base=WORLD.floor+Math.max(0,Math.abs(z)-900)*.002;
  const ridge=Math.pow(Math.max(0,d-270)/1000,1.27)*(340+110*Math.sin(z/1100+phases[0])+70*Math.sin(z/430+phases[1]));
  const detail=Math.max(0,Math.min(1,(d-120)/600))*(34*Math.sin(x/190+z/310+phases[2])+22*Math.sin(x/91-z/170));
  return Math.max(WORLD.floor-5,base+ridge+detail);
 }
 const runway={x:0,z:WORLD.runwayZ,y:WORLD.floor,heading:0,length:WORLD.runwayLength,width:WORLD.runwayWidth};
 const rings=Array.from({length:8},(_,i)=>{const z=1500+i*740;return {x:valleyCentre(z)+(i===0?0:85*Math.sin(i*.9)),y:220+55*Math.sin(i*.8),z,radius:92,heading:0};});
 const scatter=[];
 for(let i=0;i<620;i++){const z=-1500+rng()*12000,x=valleyCentre(z)+(rng()-.5)*6500;if(Math.abs(x)<100&&Math.abs(z-runway.z)<runway.length/2+100)continue;const y=terrainHeight(x,z);scatter.push({x,y,z,size:9+rng()*19,type:y>1050?'rock':i%37===0?'hut':'tree'});}
 return {seed,terrainHeight,valleyCentre,runway,rings,scatter};
}
export const defaultWorld=createWorld();
export const terrainHeight=defaultWorld.terrainHeight;
