export const JOBS = [
  {title:'A Favor for Luz', text:'Drive to the seawall and meet Luz.', x:1850,y:760,kind:'go'},
  {title:'The Blue Cooler', text:'Pick up the cooler behind Citrus Market.', x:930,y:1110,kind:'pickup'},
  {title:'The Dockside Ambush', text:'Clear the rival crew guarding the marina route.', x:1010,y:1145,kind:'combat'},
  {title:'No Questions', text:'Deliver the cooler to the marina.', x:2150,y:1450,kind:'deliver'},
  {title:'Neon Exit', text:'Lose the patrols. Keep moving until the heat cools.', x:360,y:1520,kind:'escape'},
  {title:'Last Run', text:'Beat the clock: get the package to Palm Court.', x:690,y:290,kind:'timed'}
];
export function newStory(done=0) { return { index:done, active:false, complete:done>=JOBS.length, timer:0, hasCargo:false, flash:0 }; }
export function currentJob(s) { return JOBS[Math.min(s.index,JOBS.length-1)]; }
export function startJob(s) { if(!s.active&&!s.complete){s.active=true;s.timer=currentJob(s).kind==='timed'?65:0;} }
export function stepJob(s,player,dt,wanted,enemiesRemaining=0) {
  if(!s.active)return null;
  const job=currentJob(s); if(job.kind==='timed'){s.timer-=dt;if(s.timer<=0){s.active=false;return 'failed';}}
  if(job.kind==='escape'){if(wanted===0){s.active=false;s.index++;if(s.index>=JOBS.length)s.complete=true;return 'complete';}return null;}
  if(job.kind==='combat'&&enemiesRemaining===0){s.active=false;s.index++;if(s.index>=JOBS.length)s.complete=true;return 'complete';}
  if(job.kind==='combat')return null;
  if(Math.hypot(player.x-job.x,player.y-job.y)<58){
    if(job.kind==='pickup'){s.hasCargo=true;s.active=false;s.index++;return 'pickup';}
    s.active=false;s.index++;if(s.index>=JOBS.length)s.complete=true;return 'complete';
  }
  return null;
}
