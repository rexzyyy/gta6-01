export function makeAudio(){
 let ctx=null,muted=false,engine=null;
 function wake(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();}
 function tone(freq,duration,type='sine',volume=.05){if(muted)return;wake();const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration);}
 return { toggle(){muted=!muted;return muted;}, get muted(){return muted;}, wake, shot(){tone(105,.11,'square',.08);}, pickup(){tone(660,.12);setTimeout(()=>tone(880,.16),90);}, siren(){tone(520,.24,'sawtooth',.035);}, crime(){tone(180,.3,'triangle',.05);}, engine(on,speed=0){if(muted||!on){if(engine){engine.stop();engine=null;}return;}if(!engine){wake();engine=ctx.createOscillator();const g=ctx.createGain();g.gain.value=.018;engine.type='sawtooth';engine.connect(g);g.connect(ctx.destination);engine.start();}engine.frequency.setTargetAtTime(55+speed*2,ctx.currentTime,.12);} };
}
