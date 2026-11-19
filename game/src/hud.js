import { MAP } from './city.js';
import { drawCar } from './traffic.js';
export function makeHud(canvas) {
 const ctx=canvas.getContext('2d'); let w=0,h=0,dpr=1;
 function resize(){dpr=window.devicePixelRatio||1;w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 window.addEventListener('resize',resize);resize();
 function box(x,y,bw,bh){ctx.fillStyle='rgba(23,38,37,.84)';ctx.beginPath();ctx.roundRect(x,y,bw,bh,12);ctx.fill();ctx.strokeStyle='rgba(255,242,205,.25)';ctx.stroke();}
 function text(t,x,y,size=14,color='#fff',weight=600){ctx.fillStyle=color;ctx.font=weight+' '+size+'px system-ui';ctx.fillText(t,x,y);}
 function draw(s){
   // This shares the world canvas: main.js paints the frame before the HUD is layered on top.
   ctx.setTransform(dpr,0,0,dpr,0,0);
   if(s.screen==='title'||s.screen==='paused'||s.screen==='gameover'){
     ctx.fillStyle='rgba(15,29,30,.37)';ctx.fillRect(0,0,w,h);
     const pw=Math.min(610,w-36),ph=s.screen==='title'?390:245,px=(w-pw)/2,py=(h-ph)/2;box(px,py,pw,ph);
     text(s.screen==='title'?'NEON PALMS':s.screen==='paused'?'PAUSED':'RUN ENDED',px+30,py+53,31,'#f4d184',800);
     if(s.screen==='title'){
       text('VICE COAST   /   A SUNSET CITY STORY',px+32,py+84,13,'#9cd2c8',700);
       text('Mara Solís has one night to get her brother out of debt.',px+32,py+133,16);
       text('Steal a car, help Luz, and outrun the coast patrol.',px+32,py+160,16);
       text('WASD move / drive     E enter or exit     Mouse or Space fire',px+32,py+220,13,'#f1e6c7');
       text('P or Esc pause     M mute     F start mission',px+32,py+245,13,'#f1e6c7');
       text(s.saved?'ENTER  •  CONTINUE YOUR RUN':'ENTER  •  START STORY',px+32,py+315,17,'#f4d184',800);
       text('Vice Coast  •  1987',px+pw-175,py+360,12,'#b3c5b7',500);
     } else text('Press P or Esc to return',px+30,py+120,16,'#f1e6c7');
     return;
   }
   const pad=20;box(pad,pad,225,95);
   text('VITALS',pad+15,pad+22,11,'#9cd2c8',800);
   ctx.fillStyle='#322f2a';ctx.fillRect(pad+15,pad+34,190,13);ctx.fillStyle='#e26855';ctx.fillRect(pad+15,pad+34,190*Math.max(0,s.health/100),13);
   text('$ '+s.money.toLocaleString(),pad+15,pad+75,18,'#f5d581',750);
   text('HEAT',pad+15,pad+91,10,'#c5d3bf',700);
   text('★'.repeat(s.wanted)+'☆'.repeat(5-s.wanted),pad+62,pad+91,15,s.wanted?'#ffd66f':'#d7ddce',800);
   const mw=190,mh=142,mx=w-mw-20,my=20;box(mx,my,mw,mh);
   ctx.save();ctx.beginPath();ctx.rect(mx+9,my+9,mw-18,mh-18);ctx.clip();
   ctx.fillStyle='#81a872';ctx.fillRect(mx+9,my+9,mw-18,mh-18);
   ctx.fillStyle='#68736e';
   for(let x=0;x<MAP.w;x+=400)ctx.fillRect(mx+9+x/MAP.w*(mw-18)-4,my+9,8,mh-18);
   for(let y=0;y<MAP.h;y+=400)ctx.fillRect(mx+9,my+9+y/MAP.h*(mh-18)-4,mw-18,8);
   const dot=(x,y,color,r=2)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(mx+9+x/MAP.w*(mw-18),my+9+y/MAP.h*(mh-18),r,0,7);ctx.fill();};
   for(const c of s.cars)if(c.active&&c.police)dot(c.x,c.y,'#ff5c56',3);
   dot(s.marker.x,s.marker.y,'#ffe16e',4);dot(s.player.x,s.player.y,'#fff',3);
   ctx.restore();text('VICE COAST',mx+12,my+mh-5,9,'#f2e6c4',800);
   box(20,h-113,Math.min(455,w-40),93);
   text('STORY  /  '+s.missionTitle.toUpperCase(),35,h-88,11,'#9cd2c8',800);
   text(s.objective,35,h-64,14,'#fff',650);
   if(s.timer>0)text('TIME  '+Math.ceil(s.timer)+'s',35,h-41,12,'#f5d581',750);
   if(s.inCar){box(w/2-65,h-87,130,66);text(Math.round(s.speed*2.15)+'',w/2-36,h-47,27,'#f5d581',800);text('KM/H',w/2+12,h-48,10,'#fff',750);}
   text('M  MUTE',20,h-10,10,'#f6edd5',600);
 }
 return {draw};
}
