import { MAP } from './city.js';
const SPACING = MAP.block + MAP.road;
const PAINT = ['#d4513f','#e9d28c','#388c91','#5c6264','#cf7b38','#d9d4c5','#6f65a3'];

export function makeTraffic() {
  const cars=[];
  cars.push({x:552,y:548,angle:0,speed:0,color:'#d4513f',driver:false,police:false,active:true,parked:true});
  for(let i=0;i<18;i++){
    const vertical=i%2===0, lane=Math.floor(i/2)%5, road=lane*SPACING+MAP.road/2;
    cars.push({x:vertical?road:((i*197)%MAP.w),y:vertical?((i*131)%MAP.h):road,angle:vertical?Math.PI/2:0,speed:42+(i%5)*9,color:PAINT[i%PAINT.length],driver:true,police:false,active:true});
  }
  return cars;
}

export function stepTraffic(cars, dt, player, parked) {
  for(const c of cars) if(c.active && !c.police && !c.parked && c!==parked) {
    c.x+=Math.cos(c.angle)*c.speed*dt; c.y+=Math.sin(c.angle)*c.speed*dt;
    if(c.x<0)c.x=MAP.w; if(c.x>MAP.w)c.x=0; if(c.y<0)c.y=MAP.h; if(c.y>MAP.h)c.y=0;
    if(Math.hypot(c.x-player.x,c.y-player.y)<48) c.speed=Math.max(20,c.speed-18*dt);
    else c.speed=Math.min(80,c.speed+10*dt);
  }
}

export function drawCar(ctx,c,scale=1) {
  ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.angle); ctx.scale(scale,scale);
  ctx.fillStyle='rgba(25,35,35,.27)';ctx.fillRect(-19,-8,42,21);
  ctx.fillStyle=c.police?'#e7e5d9':c.color;ctx.beginPath();ctx.roundRect(-21,-9,42,18,5);ctx.fill();
  ctx.fillStyle='#364d51';ctx.beginPath();ctx.roundRect(-9,-7,17,14,3);ctx.fill();
  ctx.fillStyle='#f7e4a0';ctx.fillRect(17,-6,3,4);ctx.fillRect(17,3,3,4);
  ctx.fillStyle='#303536';ctx.fillRect(-14,-11,8,3);ctx.fillRect(7,-11,8,3);ctx.fillRect(-14,8,8,3);ctx.fillRect(7,8,8,3);
  if(c.police){ctx.fillStyle='#315a9b';ctx.fillRect(-3,-10,6,3);ctx.fillStyle='#e4584b';ctx.fillRect(2,-10,5,3);}
  ctx.restore();
}
