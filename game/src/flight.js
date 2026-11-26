import {PHYSICS as P} from './config.js';
import {clamp,lerp} from './random.js';
export function createFlight(world){return {x:0,y:world.runway.y+P.gearHeight,z:-370,heading:0,pitch:0,roll:0,airspeed:0,verticalSpeed:0,throttle:0,fuel:100,damage:0,stall:false,grounded:true,airborne:false};}
export function step(s,input,dt,terrainHeight){
 const down=code=>input.down?input.down(code):input.held.has(code);
 s.throttle=clamp(s.throttle+((+down('KeyW'))-(+down('KeyS')))*P.throttleRate*dt,0,1);
 if(s.fuel<=0)s.throttle=0;
 s.fuel=Math.max(0,s.fuel-P.fuelBurn*(.15+s.throttle)*dt);
 const rollInput=(+down('ArrowRight'))-(+down('ArrowLeft'));
 const pitchInput=(+down('ArrowDown'))-(+down('ArrowUp'));
 s.roll=clamp(s.roll+(rollInput*P.rollRate-(rollInput?0:s.roll*1.1))*dt,-P.maxRoll,P.maxRoll);
 s.pitch=clamp(s.pitch+(-pitchInput*P.pitchRate-(pitchInput?0:s.pitch*.22))*dt,-P.maxPitch,P.maxPitch);
 const target=(s.fuel>0?P.maxSpeed*s.throttle:0)-s.pitch*28-Math.abs(s.roll)*4;
 const acceleration=s.grounded?P.groundAcceleration:P.acceleration;
 s.airspeed=clamp(s.airspeed+(target-s.airspeed)*acceleration*dt,0,P.maxSpeed+20);
 const lift=clamp(s.airspeed/P.stallSpeed,0,1.15)*Math.cos(s.roll);
 s.stall=!s.grounded&&lift<.85;
 if(s.stall)s.pitch=Math.max(-.4,s.pitch-(1-lift)*.25*dt);
 const desiredSink=s.airspeed*Math.sin(s.pitch)-Math.max(0,1-lift)*20-Math.abs(s.roll)*1.5;
 s.verticalSpeed=lerp(s.verticalSpeed,desiredSink,1-Math.exp(-2.4*dt));
 if(s.grounded){s.roll*=Math.exp(-4*dt);s.verticalSpeed=0;if(s.airspeed>P.stallSpeed*1.15&&s.pitch>.055){s.grounded=false;s.airborne=true;s.verticalSpeed=2;}else s.y=terrainHeight(s.x,s.z)+P.gearHeight;}
 s.heading=(s.heading+Math.tan(s.roll)*P.turnGravity/Math.max(24,s.airspeed)*dt+Math.PI*2)%(Math.PI*2);
 s.x+=Math.sin(s.heading)*s.airspeed*Math.cos(s.pitch)*dt;
 s.z+=Math.cos(s.heading)*s.airspeed*Math.cos(s.pitch)*dt;
 if(!s.grounded)s.y+=s.verticalSpeed*dt;
 return s;
}
