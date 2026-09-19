(function(){
  const runtime={context:null,stream:null,source:null,analyser:null,frame:0,samples:[],pcmChunks:[],listener:null,recorder:null,chunks:[],recordingBlob:null,recordingUrl:"",recordingPcm:null,recordingSampleRate:0,recordingFeatures:null,mixBlob:null,mixUrl:"",guideNodes:[],startedAt:0};
  const AC=window.AudioContext||window.webkitAudioContext;

  function noteName(midi){
    const names=["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"];
    const n=Math.round(midi);
    return `${names[(n%12+12)%12]}${Math.floor(n/12)-1}`;
  }
  function frequencyToMidi(frequency){return 69+12*Math.log2(frequency/440);}
  function noteToMidi(note){
    const match=String(note).trim().match(/^([A-G])([#♯b♭]?)(-?\d)$/);
    if(!match)return null;
    const base={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[match[1]];
    const accidental=match[2]==="#"||match[2]==="♯"?1:match[2]==="b"||match[2]==="♭"?-1:0;
    return (Number(match[3])+1)*12+base+accidental;
  }
  function rangeToMidi(range){const [low,high]=String(range).split(/[–-]/).map(noteToMidi);return {low,high};}
  function pitchFromBuffer(buffer,sampleRate){
    let rms=0;
    for(let i=0;i<buffer.length;i++)rms+=buffer[i]*buffer[i];
    rms=Math.sqrt(rms/buffer.length);
    if(rms<0.018)return {frequency:0,rms,clarity:0};
    const minLag=Math.floor(sampleRate/1000),maxLag=Math.min(Math.floor(sampleRate/65),buffer.length-2);
    let bestLag=0,best=-1;
    for(let lag=minLag;lag<=maxLag;lag++){
      let sum=0,a=0,b=0;
      for(let i=0;i<buffer.length-lag;i++){const x=buffer[i],y=buffer[i+lag];sum+=x*y;a+=x*x;b+=y*y;}
      const corr=sum/Math.sqrt(a*b||1);
      if(corr>best){best=corr;bestLag=lag;}
    }
    if(best<0.62)return {frequency:0,rms,clarity:best};
    return {frequency:sampleRate/bestLag,rms,clarity:best};
  }
  async function ensureMicrophone(){
    if(!AC)throw new Error("이 브라우저는 오디오 분석을 지원하지 않아요.");
    if(!navigator.mediaDevices?.getUserMedia)throw new Error("마이크는 localhost 또는 HTTPS에서만 사용할 수 있어요.");
    if(runtime.stream&&runtime.stream.active)return runtime.stream;
    runtime.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
    runtime.context=new AC();
    await runtime.context.resume();
    runtime.source=runtime.context.createMediaStreamSource(runtime.stream);
    runtime.analyser=runtime.context.createAnalyser();
    runtime.analyser.fftSize=2048;
    runtime.analyser.smoothingTimeConstant=.15;
    runtime.source.connect(runtime.analyser);
    return runtime.stream;
  }
  function stopStream(){
    cancelAnimationFrame(runtime.frame);
    runtime.frame=0;
    if(runtime.stream)runtime.stream.getTracks().forEach(track=>track.stop());
    runtime.stream=null;runtime.source=null;runtime.analyser=null;
  }
  function beginPitchLoop(collect=true){
    cancelAnimationFrame(runtime.frame);
    const buffer=new Float32Array(runtime.analyser.fftSize);
    let last=0;
    const tick=time=>{
      if(!runtime.analyser)return;
      runtime.analyser.getFloatTimeDomainData(buffer);
      const found=pitchFromBuffer(buffer,runtime.context.sampleRate);
      if(found.frequency&&time-last>85){
        const midi=frequencyToMidi(found.frequency);
        const item={midi,frequency:found.frequency,rms:found.rms,clarity:found.clarity,time:performance.now()};
        if(collect){runtime.samples.push(item);runtime.pcmChunks.push(new Float32Array(buffer));}
        runtime.listener?.({...item,note:noteName(midi),level:Math.min(100,Math.round(found.rms*520)),waveform:new Float32Array(buffer)});
        last=time;
      }else if(time-last>120){runtime.listener?.({frequency:0,note:"—",level:Math.min(100,Math.round(found.rms*520)),rms:found.rms,clarity:found.clarity});last=time;}
      runtime.frame=requestAnimationFrame(tick);
    };
    runtime.frame=requestAnimationFrame(tick);
  }
  async function startMeasurement(listener){
    stopStream();runtime.samples=[];runtime.pcmChunks=[];runtime.listener=listener;
    await ensureMicrophone();beginPitchLoop(true);
  }
  function setListener(listener){runtime.listener=listener;}
  function percentile(values,p){if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))];}
  function summarizeMeasurement(){
    const valid=runtime.samples.filter(x=>x.clarity>.65&&x.rms>.018);
    if(valid.length<5){stopStream();return null;}
    const notes=valid.map(x=>x.midi);
    const min=percentile(notes,.04),max=percentile(notes,.96),stableLow=percentile(notes,.22),stableHigh=percentile(notes,.78),center=percentile(notes,.5);
    const avgRms=valid.reduce((a,x)=>a+x.rms,0)/valid.length;
    const avgClarity=valid.reduce((a,x)=>a+x.clarity,0)/valid.length;
    const variance=valid.reduce((a,x)=>a+(x.midi-center)**2,0)/valid.length;
    const brightness=Math.max(0,Math.min(1,(center-43)/30));
    let timbreFull=null,role="메인";
    if(runtime.pcmChunks.length){const total=runtime.pcmChunks.reduce((n,c)=>n+c.length,0),pcm=new Float32Array(total);let at=0;runtime.pcmChunks.forEach(c=>{pcm.set(c,at);at+=c.length;});try{const analysis=IEUM_CORE.analyzeVoice(pcm,runtime.context.sampleRate);timbreFull=analysis.features;role=analysis.roles.top;}catch(_){}}
    const profile={min:noteName(min),max:noteName(max),stable:`${noteName(stableLow)}–${noteName(stableHigh)}`,center:noteName(center),minMidi:Math.round(min),maxMidi:Math.round(max),stableLowMidi:Math.round(stableLow),stableHighMidi:Math.round(stableHigh),role,timbre:{brightness:+brightness.toFixed(2),density:+Math.min(1,avgRms*7).toFixed(2),stability:+Math.max(0,Math.min(1,avgClarity-Math.sqrt(variance)/18)).toFixed(2)},timbreFull};
    stopStream();return profile;
  }
  function normalizedTimbre(features={}){return {b:features.brightness??Math.max(0,Math.min(1,(features.centroid||1800)/4200)),d:features.density??.5,s:features.stability??features.steady??.5};}
  function timbreLabel(features={}){
    const {b,d,s}=normalizedTimbre(features);
    return {title:`${b>.58?"맑은":"차분한"} ${d>.52?"밀도":"결"}`,attack:s>.68?"중심이 곧게 유지됨":"흔들림이 자연스럽게 남음",texture:b>.58?"밝은 배음이 또렷함":"낮은 배음이 부드러움",body:d>.52?"소리의 몸통이 단단함":"공기가 가볍게 섞임"};
  }
  function timbreImage(features={}){
    const {b,d,s}=normalizedTimbre(features),canvas=document.createElement("canvas"),size=720;canvas.width=size;canvas.height=size;
    const g=canvas.getContext("2d"),paper=g.createLinearGradient(0,0,size,size);paper.addColorStop(0,"#e7e0d3");paper.addColorStop(1,"#c9c2b7");g.fillStyle=paper;g.fillRect(0,0,size,size);
    let seed=Math.round((b*97+d*193+s*389)*1000)||17;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    const copper=`rgba(${Math.round(116+80*(1-b))},${Math.round(72+35*d)},45,`,blue=`rgba(35,${Math.round(66+55*b)},${Math.round(78+70*b)},`;
    g.globalCompositeOperation="multiply";
    for(let i=0;i<2400;i++){const x=rnd()*size,y=rnd()*size,r=.3+rnd()*2.1;g.fillStyle=`rgba(31,28,24,${.015+rnd()*.05})`;g.fillRect(x,y,r,r);}
    g.translate(size/2,size/2);const rings=Math.round(7+d*11);
    for(let i=0;i<rings;i++){const radius=55+i*(18+d*8),w=1+d*3,warp=(1-s)*34;g.beginPath();for(let a=0;a<=Math.PI*2+.04;a+=.04){const rr=radius+Math.sin(a*(3+i%5)+i)*warp+Math.sin(a*11+i)*5;const x=Math.cos(a)*rr,y=Math.sin(a)*rr*(.72+b*.3);a===0?g.moveTo(x,y):g.lineTo(x,y);}g.strokeStyle=(i%3?blue:copper)+(.18+i/rings*.38)+")";g.lineWidth=w;g.stroke();}
    const glow=g.createRadialGradient(0,0,0,0,0,150+d*100);glow.addColorStop(0,`rgba(20,19,17,${.78-d*.2})`);glow.addColorStop(1,"rgba(20,19,17,0)");g.fillStyle=glow;g.fillRect(-size/2,-size/2,size,size);g.setTransform(1,0,0,1,0,0);
    return canvas.toDataURL("image/png");
  }
  function scheduleGuide(context,start,duration=24,destination=context.destination,songId="wave"){
    const song=IEUM_CORE.getSong(songId),secondsPerTick=60/(song.bpm*song.ppq);
    song.tracks.forEach((track,trackIndex)=>track.notes.forEach(note=>{const t=start+note.tick*secondsPerTick,d=Math.max(.06,note.dur*secondsPerTick);if(t>start+duration)return;[1,2].forEach((harmonic,h)=>{const osc=context.createOscillator(),gain=context.createGain();osc.type=h?"sine":"triangle";osc.frequency.value=440*Math.pow(2,(note.midi-69)/12)*harmonic;const amp=(h?.018:.05)/(song.tracks.length||1);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(amp,t+.015);gain.gain.setValueAtTime(amp,t+Math.max(.02,d*.72));gain.gain.exponentialRampToValueAtTime(.0001,t+d);osc.connect(gain).connect(destination);osc.start(t);osc.stop(t+d+.02);runtime.guideNodes.push(osc);});}));
  }
  async function playGuide(duration=8){
    if(!runtime.context||runtime.context.state==="closed")runtime.context=new AC();
    await runtime.context.resume();runtime.guideNodes.forEach(n=>{try{n.stop();}catch(_){}});runtime.guideNodes=[];
    scheduleGuide(runtime.context,runtime.context.currentTime+.08,duration);
  }
  async function startRecording(listener){
    stopStream();runtime.listener=listener;runtime.samples=[];runtime.pcmChunks=[];const stream=await ensureMicrophone();beginPitchLoop(true);
    const types=["audio/webm;codecs=opus","audio/webm","audio/mp4"],mimeType=types.find(type=>MediaRecorder.isTypeSupported(type))||"";
    runtime.chunks=[];runtime.recorder=new MediaRecorder(stream,mimeType?{mimeType}:undefined);
    runtime.recorder.ondataavailable=e=>{if(e.data.size)runtime.chunks.push(e.data);};
    runtime.recorder.start(200);runtime.startedAt=performance.now();scheduleGuide(runtime.context,runtime.context.currentTime+.24,24);
  }
  async function stopRecording(){
    if(!runtime.recorder||runtime.recorder.state==="inactive")return null;
    const recorder=runtime.recorder;
    await new Promise(resolve=>{recorder.addEventListener("stop",resolve,{once:true});recorder.stop();});
    runtime.recordingBlob=new Blob(runtime.chunks,{type:recorder.mimeType||"audio/webm"});
    if(runtime.recordingUrl)URL.revokeObjectURL(runtime.recordingUrl);
    runtime.recordingUrl=URL.createObjectURL(runtime.recordingBlob);
    try{const decoded=await runtime.context.decodeAudioData(await runtime.recordingBlob.arrayBuffer());runtime.recordingPcm=new Float32Array(decoded.getChannelData(0));runtime.recordingSampleRate=decoded.sampleRate;runtime.recordingFeatures=IEUM_CORE.analyzeVoice(runtime.recordingPcm,decoded.sampleRate);}catch(_){runtime.recordingPcm=null;runtime.recordingFeatures=null;}
    const stats=summarizeMeasurement();if(stats&&runtime.recordingFeatures){stats.timbreFull=runtime.recordingFeatures.features;stats.role=runtime.recordingFeatures.roles.top;stats.timbreImage=timbreImage(runtime.recordingFeatures.features);}
    return {url:runtime.recordingUrl,blob:runtime.recordingBlob,duration:(performance.now()-runtime.startedAt)/1000,stats,pcm:runtime.recordingPcm,sampleRate:runtime.recordingSampleRate,features:runtime.recordingFeatures};
  }
  function playUrl(url){if(!url)return false;const audio=new Audio(url);audio.play();return true;}
  function writeString(view,offset,string){for(let i=0;i<string.length;i++)view.setUint8(offset+i,string.charCodeAt(i));}
  function bufferToWave(buffer){
    const channels=buffer.numberOfChannels,length=buffer.length*channels*2+44,array=new ArrayBuffer(length),view=new DataView(array);let offset=0,pos=0;
    writeString(view,pos,"RIFF");pos+=4;view.setUint32(pos,length-8,true);pos+=4;writeString(view,pos,"WAVE");pos+=4;writeString(view,pos,"fmt ");pos+=4;view.setUint32(pos,16,true);pos+=4;view.setUint16(pos,1,true);pos+=2;view.setUint16(pos,channels,true);pos+=2;view.setUint32(pos,buffer.sampleRate,true);pos+=4;view.setUint32(pos,buffer.sampleRate*channels*2,true);pos+=4;view.setUint16(pos,channels*2,true);pos+=2;view.setUint16(pos,16,true);pos+=2;writeString(view,pos,"data");pos+=4;view.setUint32(pos,length-pos-4,true);pos+=4;
    const data=Array.from({length:channels},(_,i)=>buffer.getChannelData(i));
    while(pos<length){for(let ch=0;ch<channels;ch++){const sample=Math.max(-1,Math.min(1,data[ch][offset]||0));view.setInt16(pos,sample<0?sample*32768:sample*32767,true);pos+=2;}offset++;}
    return new Blob([array],{type:"audio/wav"});
  }
  async function createAutomaticMix(){
    if(!runtime.recordingBlob)throw new Error("먼저 실제 녹음을 완료해 주세요.");
    const context=new AC(),voice=await context.decodeAudioData(await runtime.recordingBlob.arrayBuffer());await context.close();
    const duration=Math.max(voice.duration,2),rate=44100,offline=new OfflineAudioContext(2,Math.ceil(duration*rate),rate);
    const source=offline.createBufferSource(),high=offline.createBiquadFilter(),compressor=offline.createDynamicsCompressor(),gain=offline.createGain(),pan=offline.createStereoPanner();
    source.buffer=voice;high.type="highpass";high.frequency.value=90;compressor.threshold.value=-20;compressor.ratio.value=3;gain.gain.value=.92;pan.pan.value=-.08;
    source.connect(high).connect(compressor).connect(gain).connect(pan).connect(offline.destination);source.start(.24);
    scheduleGuide(offline,0,duration,offline.destination);
    const rendered=await offline.startRendering();runtime.mixBlob=bufferToWave(rendered);if(runtime.mixUrl)URL.revokeObjectURL(runtime.mixUrl);runtime.mixUrl=URL.createObjectURL(runtime.mixBlob);return runtime.mixUrl;
  }
  function compatibility(profile,part,{genreMatch=.5,timbreContrast=.5}={}){
    if(!profile)return {score:null,range:0,timbre:0,genre:0};
    const target=rangeToMidi(part.required),userLow=profile.stableLowMidi??noteToMidi(String(profile.stable||"").split("–")[0]),userHigh=profile.stableHighMidi??noteToMidi(String(profile.stable||"").split("–")[1]);
    if([target.low,target.high,userLow,userHigh].some(x=>x==null))return {score:null,range:0,timbre:0,genre:0};
    const overlap=Math.max(0,Math.min(target.high,userHigh)-Math.max(target.low,userLow)+1),span=Math.max(1,target.high-target.low+1),range=Math.round(Math.min(1,overlap/span)*100);
    const timbre=Math.round(Math.max(0,Math.min(1,timbreContrast))*100),genre=Math.round(Math.max(0,Math.min(1,genreMatch))*100);
    return {score:Math.round(range*.62+timbre*.25+genre*.13),range,timbre,genre};
  }
  window.IEUM_AUDIO={startMeasurement,setListener,summarizeMeasurement,startRecording,stopRecording,playGuide,playUrl,createAutomaticMix,compatibility,timbreImage,timbreLabel,noteToMidi,get recordingUrl(){return runtime.recordingUrl;},get recordingPcm(){return runtime.recordingPcm;},get recordingFeatures(){return runtime.recordingFeatures;},get mixUrl(){return runtime.mixUrl;}};
})();
