import { MAP, makeCity, drawCity } from './city.js';
import { makeTraffic, stepTraffic, drawCar } from './traffic.js';
import { JOBS, newStory, currentJob, startJob, stepJob } from './missions.js';
import { makeHud } from './hud.js';
import { makeAudio } from './audio.js';

const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),hud=makeHud(canvas),audio=makeAudio();
const city=makeCity(),cars=makeTraffic();
const player={x:522,y:548,angle:0,health:100,money:120,car:null,speed:0};
const walkers=Array.from({length:32},(_,i)=>({x:100+(i*173)%2200,y:100+(i*211)%1600,a:(i%4)*Math.PI/2,s:14+i%8,color:['#4b7780','#b45743','#e6ca89','#805e8d'][i%4]}));
const enemies=[{x:1000,y:1120,alive:true},{x:1045,y:1150,alive:true},{x:980,y:1170,alive:true}];
const bullets=[],particles=[];
const medkits=[{x:740,y:850,active:true},{x:1650,y:1200,active:true},{x:350,y:1370,active:true}];
let screen='title',wanted=0,heatClock=0,hidden=0,worldTime=0,shake=0,crimeToast=0,missionToast='',missionToastTime=0;
let story=newStory(),saved=false,last=performance.now(),camera={x:player.x,y:player.y},keys=new Set(),pressed=new Set(),mouse={x:0,y:0,fire:false,clicked:false};
const wantedKey='vicecoast.save.v1';
try{const save=JSON.parse(localStorage.getItem(wantedKey)||'null');if(save){saved=true;player.money=save.money||120;story=newStory(save.done||0);wanted=save.wanted||0;}}catch{}
function persist(){try{localStorage.setItem(wantedKey,JSON.stringify({money:player.money,done:story.index,wanted}));}catch{}}
function crime(amount=1){wanted=Math.min(5,wanted+amount);heatClock=0;crimeToast=2.4;audio.crime();persist();}
function keyDown(e){if(['KeyW','KeyA','KeyS','KeyD','KeyE','KeyF','KeyP','Escape','Space','KeyM','Enter'].includes(e.code)){e.preventDefault();keys.add(e.code);if(!e.repeat)pressed.add(e.code);audio.wake();}}
window.addEventListener('keydown',keyDown);window.addEventListener('keyup',e=>{keys.delete(e.code);});
window.addEventListener('blur',()=>{keys.clear();mouse.fire=false;});
canvas.addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
canvas.addEventListener('pointerdown',e=>{mouse.fire=true;mouse.clicked=true;audio.wake();});
window.addEventListener('pointerup',()=>mouse.fire=false);
function press(k){if(!pressed.has(k))return false;pressed.delete(k);return true;}
function begin(){screen='play';mouse.clicked=false;audio.wake();last=performance.now();}
function enterCar(){
 if(player.car){const c=player.car;player.x=c.x-Math.cos(c.angle)*31;player.y=c.y-Math.sin(c.angle)*31;c.driver=false;player.car=null;player.speed=0;return;}
 let best=null,d=67;
 for(const c of cars)if(c.active&&!c.police){const z=Math.hypot(c.x-player.x,c.y-player.y);if(z<d){d=z;best=c;}}
 if(best){player.car=best;best.driver=true;best.speed=0;player.x=best.x;player.y=best.y;crime();if(wanted>=2)audio.siren();}
}
function createPolice(){
 const count=cars.filter(c=>c.police&&c.active).length;
 if(count<wanted){const a=Math.random()*Math.PI*2;cars.push({x:Math.max(20,Math.min(MAP.w-20,player.x+Math.cos(a)*460)),y:Math.max(20,Math.min(MAP.h-20,player.y+Math.sin(a)*460)),angle:a+Math.PI,speed:75+wanted*8,color:'#eee9d9',driver:true,police:true,active:true});}
}
function shoot(){
 const sx=player.x,sy=player.y;let target=null,dist=330;
 for(const e of enemies)if(e.alive){const d=Math.hypot(e.x-sx,e.y-sy);if(d<dist){dist=d;target=e;}}
 if(target){target.alive=false;particles.push({x:target.x,y:target.y,t:.7,color:'#dc7251'});crime();}
 else {const targetWalker=walkers.find(p=>Math.hypot(p.x-sx,p.y-sy)<130);if(targetWalker){crime(2);targetWalker.x=-100;}}
 particles.push({x:sx+Math.cos(player.angle)*22,y:sy+Math.sin(player.angle)*22,t:.15,color:'#ffd477'});audio.shot();
}
function update(dt){
 worldTime+=dt; if(press('KeyM'))audio.toggle();
 if(screen==='title'){if(press('Enter')||press('Space')||mouse.clicked)begin();return;}
 if(screen==='paused'){if(press('KeyP')||press('Escape'))screen='play';return;}
 if(screen==='gameover'){if(press('Enter')){player.health=100;player.x=522;player.y=548;player.car=null;story=newStory();screen='title';}return;}
 if(press('Escape')||press('KeyP')){screen='paused';persist();return;}
 if(press('KeyE'))enterCar();
 if(press('KeyF'))startJob(story);
 const moving=player.car||{x:player.x,y:player.y,angle:player.angle,speed:0};
 if(player.car){
   const c=player.car,throttle=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),steer=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
   c.speed=Math.max(-65,Math.min(155,c.speed+throttle*105*dt));c.speed*=Math.pow(.984,dt*60);c.angle+=steer*dt*Math.min(2.4,Math.abs(c.speed)/38)*Math.sign(c.speed||1);
   c.x=Math.max(20,Math.min(MAP.w-20,c.x+Math.cos(c.angle)*c.speed*dt));c.y=Math.max(20,Math.min(MAP.h-20,c.y+Math.sin(c.angle)*c.speed*dt));
   player.x=c.x;player.y=c.y;player.angle=c.angle;player.speed=Math.abs(c.speed);
   for(const p of walkers)if(Math.hypot(p.x-c.x,p.y-c.y)<23&&Math.abs(c.speed)>45){p.x=-200;player.health-=8;crime();shake=.3;}
 } else {
   const dx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),dy=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0),len=Math.hypot(dx,dy)||1;
   if(dx||dy){player.x+=dx/len*142*dt;player.y+=dy/len*142*dt;player.angle=Math.atan2(dy,dx);}
   if((mouse.fire||keys.has('Space'))&&worldTime>(player.lastShot||0)+.24){player.lastShot=worldTime;shoot();}
   for(const p of walkers){p.x+=Math.cos(p.a)*p.s*dt;p.y+=Math.sin(p.a)*p.s*dt;if(Math.random()<dt*.3)p.a+=(Math.random()-.5)*1.5;if(Math.hypot(p.x-player.x,p.y-player.y)<24)p.a+=Math.PI;}
   for(const e of enemies)if(e.alive&&story.active&&currentJob(story).kind==='combat'&&Math.hypot(e.x-player.x,e.y-player.y)<260){e.x+=(player.x-e.x)/Math.max(80,Math.hypot(player.x-e.x,player.y-e.y))*22*dt;e.y+=(player.y-e.y)/Math.max(80,Math.hypot(player.x-e.x,player.y-e.y))*22*dt;if(Math.hypot(e.x-player.x,e.y-player.y)<25){player.health-=9*dt;}}
 }
 moving.x=Math.max(0,Math.min(MAP.w,moving.x));moving.y=Math.max(0,Math.min(MAP.h,moving.y));
 stepTraffic(cars,dt,player,player.car);
 for(const kit of medkits)if(kit.active&&Math.hypot(kit.x-player.x,kit.y-player.y)<28){kit.active=false;player.health=Math.min(100,player.health+38);audio.pickup();}
 createPolice();
 let visible=false;
 for(const c of cars)if(c.police&&c.active){const dx=player.x-c.x,dy=player.y-c.y,d=Math.hypot(dx,dy);if(d<310)visible=true;c.angle=Math.atan2(dy,dx);c.speed=90+wanted*16;c.x+=Math.cos(c.angle)*c.speed*dt;c.y+=Math.sin(c.angle)*c.speed*dt;if(d<27){if(player.car){player.car.speed*=.8;player.health-=dt*2;}else player.health-=dt*5;}}
 if(wanted){heatClock+=dt;if(!visible)hidden+=dt;else hidden=0;if(hidden>5){heatClock+=dt*2;if(heatClock>12){wanted--;hidden=0;heatClock=0;persist();}}if(worldTime%4<dt)audio.siren();}
 const event=stepJob(story,player,dt,wanted,enemies.filter(e=>e.alive).length);
 if(event==='complete'){player.money+=350;missionToast='JOB COMPLETE  •  +$350';missionToastTime=3;audio.pickup();persist();}
 if(event==='pickup'){missionToast='PACKAGE SECURED';missionToastTime=2;audio.pickup();}
 if(event==='failed'){crime();missionToast='DELIVERY FAILED  •  Press F to retry';missionToastTime=4;story.active=false;}
 if(story.index===3&&story.active&&wanted===0){const e=stepJob(story,player,dt,wanted);if(e==='complete'){player.money+=350;persist();}}
 for(let i=bullets.length-1;i>=0;i--){bullets[i].t-=dt;if(bullets[i].t<=0)bullets.splice(i,1);}
 for(let i=particles.length-1;i>=0;i--){particles[i].t-=dt;if(particles[i].t<=0)particles.splice(i,1);}
 player.health=Math.max(0,player.health);if(player.health===0){screen='gameover';persist();}
 if(shake>0)shake=Math.max(0,shake-dt);if(crimeToast>0)crimeToast-=dt;if(missionToastTime>0)missionToastTime-=dt;else missionToast='';
 audio.engine(!!player.car,player.speed);
 camera.x+=(player.x-camera.x)*Math.min(1,dt*5);camera.y+=(player.y-camera.y)*Math.min(1,dt*5);
}
function paint(){
 const dpr=devicePixelRatio||1,w=canvas.width/dpr,h=canvas.height/dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.fillStyle='#d7b37e';ctx.fillRect(0,0,w,h);
 const ox=w/2-camera.x+(shake?Math.sin(worldTime*60)*shake*9:0),oy=h/2-camera.y;
 ctx.save();ctx.translate(ox,oy);drawCity(ctx,city);
 for(const p of walkers)if(p.x>0){ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,6,0,7);ctx.fill();ctx.fillStyle='#2e403b';ctx.fillRect(p.x-3,p.y+4,6,7);}
 for(const c of cars)if(c.active)drawCar(ctx,c);
 for(const kit of medkits)if(kit.active){ctx.fillStyle='#e9dfbd';ctx.fillRect(kit.x-8,kit.y-8,16,16);ctx.fillStyle='#c74841';ctx.fillRect(kit.x-2,kit.y-6,4,12);ctx.fillRect(kit.x-6,kit.y-2,12,4);}
 for(const e of enemies)if(e.alive){ctx.fillStyle='#823d47';ctx.beginPath();ctx.arc(e.x,e.y,9,0,7);ctx.fill();ctx.fillStyle='#fff0cd';ctx.fillRect(e.x-3,e.y-2,6,2);}
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.t*2);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,4+p.t*7,0,7);ctx.fill();}ctx.globalAlpha=1;
 const job=story.active?currentJob(story):null,marker=job||JOBS[Math.min(story.index,JOBS.length-1)];
 if(!story.complete){ctx.strokeStyle='#ffe178';ctx.lineWidth=3;ctx.beginPath();ctx.arc(marker.x,marker.y,22+Math.sin(worldTime*4)*4,0,7);ctx.stroke();ctx.fillStyle='#ffe178';ctx.beginPath();ctx.arc(marker.x,marker.y,5,0,7);ctx.fill();}
 if(!player.car){ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.angle);ctx.fillStyle='#e9d2a0';ctx.beginPath();ctx.ellipse(0,0,8,11,0,0,7);ctx.fill();ctx.fillStyle='#2c5557';ctx.fillRect(3,-4,8,8);ctx.restore();}
 if(player.car&&player.speed>60){ctx.strokeStyle='rgba(48,43,38,.3)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(player.x-Math.cos(player.angle)*22,player.y-Math.sin(player.angle)*22);ctx.lineTo(player.x-Math.cos(player.angle)*80,player.y-Math.sin(player.angle)*80);ctx.stroke();}
 ctx.restore();
 const obj=story.complete?'The coast is yours. Story complete.':story.active?currentJob(story).text:'Press F to take the next job.';
 hud.draw({screen,health:player.health,money:player.money,wanted,cars,player,marker,objective:crimeToast>0?'Police are looking for you. Break line of sight.':missionToastTime>0?missionToast:obj,missionTitle:story.complete?'FREE ROAM':story.active?currentJob(story).title:'Luz has a lead',timer:story.active&&currentJob(story).kind==='timed'?story.timer:0,inCar:!!player.car,speed:player.speed,saved});
}
function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;update(dt);paint();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
