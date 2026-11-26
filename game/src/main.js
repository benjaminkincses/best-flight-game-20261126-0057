import {PHYSICS as P} from './config.js';
import {clamp,angleDifference} from './random.js';
import {createInput} from './input.js';
import {createWorld} from './world.js';
import {createFlight,step} from './flight.js';
import {renderScene} from './render.js';
import {drawHUD,drawTitle,drawPause,drawEnd} from './hud.js';
import {createAudio} from './audio.js';
import {createShot} from './shots.js';
export function newSortie(world){return {...createFlight(world),mode:'flying',ringIndex:0,score:0,landingBonus:0,fuelBonus:0,notice:'',noticeTime:0,crashReason:''};}
export function isOverRunway(s,r){const dx=s.x-r.x,dz=s.z-r.z;return Math.abs(dx*Math.cos(r.heading)-dz*Math.sin(r.heading))<r.width/2-2&&Math.abs(dx*Math.sin(r.heading)+dz*Math.cos(r.heading))<r.length/2;}
export function updateSortie(s,input,dt,world,audio){const before={x:s.x,y:s.y,z:s.z};step(s,input,dt,world.terrainHeight);s.noticeTime=Math.max(0,s.noticeTime-dt);
 if(s.ringIndex<world.rings.length){const r=world.rings[s.ringIndex];if(before.z<r.z&&s.z>=r.z){const t=(r.z-before.z)/(s.z-before.z),x=before.x+(s.x-before.x)*t,y=before.y+(s.y-before.y)*t;if(Math.hypot(x-r.x,y-r.y)<r.radius){s.ringIndex++;s.score+=100;s.fuel=clamp(s.fuel+3,0,100);s.notice=s.ringIndex===8?'ALL RINGS CLEAR · TURN BACK TO MERIDIAN':'RING CLEAR · +100 PTS · +3% FUEL';s.noticeTime=4;audio?.chime();}else{s.notice='RING MISSED · TURN BACK AND APPROACH FROM THE SOUTH';s.noticeTime=5;}}}
 const floor=world.terrainHeight(s.x,s.z),over=isOverRunway(s,world.runway);
 if(s.grounded&&!over){s.mode='crashed';s.crashReason='Runway excursion. Keep the wings level during the takeoff roll.';}
 if(!s.grounded&&s.y<=floor+P.gearHeight){const alignment=Math.min(Math.abs(angleDifference(s.heading,world.runway.heading)),Math.abs(angleDifference(s.heading,world.runway.heading+Math.PI)));const gentle=over&&s.verticalSpeed>=-P.landingSink&&s.verticalSpeed<=2&&s.airspeed<=P.landingSpeed&&Math.abs(s.roll)<.2&&alignment<P.landingAlignment;
  s.y=floor+P.gearHeight;if(gentle&&s.ringIndex===8){s.mode='landed';s.grounded=true;s.landingBonus=500;s.fuelBonus=Math.round(s.fuel*2);s.score+=s.landingBonus+s.fuelBonus;s.airspeed=0;s.verticalSpeed=0;s.throttle=0;s.pitch=0;s.roll=0;}
  else if(gentle){s.grounded=true;s.pitch=0;s.verticalSpeed=0;s.notice='SAFE TOUCHDOWN · COMPLETE ALL 8 RINGS BEFORE RETURNING';s.noticeTime=5;}
  else{s.mode='crashed';s.crashReason=over?'Hard landing. Reduce speed and sink; level and align the wings.':'Terrain contact. Follow the valley and leave room below your wings.';}}
 if(s.mode==='crashed'){s.damage=100;s.throttle=0;audio?.crash();}
}
const canvas=document.getElementById('flight'),ctx=canvas.getContext('2d');
const params=new URLSearchParams(location.search),shot=createShot(params);
let world=shot?.world??createWorld(1),state=shot?.state??{...newSortie(world),mode:'title'};
const input=createInput(),audio=createAudio();
window.addEventListener('keydown',()=>audio.start(),{once:true});
function resize(){canvas.width=Math.max(320,Math.round(window.innerWidth));canvas.height=Math.max(320,Math.round(window.innerHeight));}
function draw(time){renderScene(ctx,world,state,time);drawHUD(ctx,state,world);if(state.mode==='title')drawTitle(ctx);if(state.mode==='paused')drawPause(ctx);if(state.mode==='landed'||state.mode==='crashed')drawEnd(ctx,state);}
resize();
window.addEventListener('resize',()=>{resize();if(shot)draw(shot.time);});
if(shot){draw(shot.time);}else{let last=0,accumulator=0,time=0;
 window.addEventListener('blur',()=>{if(state.mode==='flying'){state.mode='paused';accumulator=0;}});
 function frame(now){const dt=Math.min(P.maxFrame,Math.max(0,(now-last)/1000));last=now;
  if(input.consume('KeyM'))audio.toggle();
  if(input.consume('Enter')&&['title','landed','crashed'].includes(state.mode)){state=newSortie(world);accumulator=0;}
  if(input.consume('KeyP')){if(state.mode==='flying')state.mode='paused';else if(state.mode==='paused')state.mode='flying';accumulator=0;}
  if(state.mode==='flying'){accumulator+=dt;while(accumulator>=P.fixedStep){updateSortie(state,input,P.fixedStep,world,audio);accumulator-=P.fixedStep;time+=P.fixedStep;if(state.mode!=='flying'){accumulator=0;break;}}}else accumulator=0;
  input.clearPresses();audio.update(state,state.mode==='flying');draw(time);requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
}
