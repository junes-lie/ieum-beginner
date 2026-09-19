(function(){
  const songMap={wave:()=>SongData.buildBam(480),season:()=>SongData.buildMaju(480),breath:()=>SongData.buildBam(480)};
  const cache={};
  const getSong=id=>cache[id]||(cache[id]=(songMap[id]||songMap.wave)());
  const matchSong=id=>{const song=getSong(id);return {title:song.title,parts:song.tracks.map(SongData.partRange)};};
  const personFromProfile=(profile,extra={})=>profile?{
    id:extra.id||"me",name:extra.name||"민서",
    lo:profile.minMidi,hi:profile.maxMidi,lo90:profile.stableLowMidi,hi90:profile.stableHighMidi,
    genres:extra.genres||{"발라드":.45,"인디":.3,"R&B":.15,"K-POP":.1},
    liked:extra.liked||["wave","season"],sing:extra.sing||["wave","season"],form:extra.form||"duet",role:extra.role||profile.role||"메인"
  }:null;
  const personFromCandidate=c=>({id:c.id,name:c.name,lo:c.person.lo,hi:c.person.hi,lo90:c.person.lo90,hi90:c.person.hi90,genres:c.person.genres,liked:c.person.liked,sing:c.person.sing,form:c.person.form,role:c.person.role});
  function candidateFeatures(candidate){
    if(candidate._features)return candidate._features;
    const p=candidate.person.voicePreset;
    const wave=Timbre.synth({sr:22050,dur:.7,f0:p.f0,roll:p.roll,noise:p.noise,atk:p.atk,rel:p.rel,seed:p.seed});
    return candidate._features=Timbre.features(wave.data,wave.sr);
  }
  function rank(profile,candidates,songId,myFeatures){
    const me=personFromProfile(profile);if(!me)return candidates.map(candidate=>({candidate,complete:null,fit:null,match:null,blend:null,role:null,taste:null,reasons:["음역을 측정하면 이 곡을 함께 부를 수 있는지 먼저 확인해요"]}));
    const song=matchSong(songId),byId=new Map(candidates.map(c=>[c.id,c]));
    const matched=Match.rankCandidates(me,candidates.map(personFromCandidate),song,7);
    return matched.map(match=>{
      const candidate=byId.get(match.you.id),youFeatures=candidateFeatures(candidate),youRoles=Timbre.roles(youFeatures);
      const meFeatures=myFeatures||profile.timbreFull||null,meRoles=meFeatures?Timbre.roles(meFeatures):{top:me.role,share:{}};
      const blend=meFeatures?Timbre.blend(meFeatures,youFeatures,"blend"):{score:null,ok:false,label:"내 음색 녹음 뒤 계산",audible:"아직 모름"};
      const role=Timbre.rolePair(meRoles,youRoles),taste=Taste.tasteMatch(me,match.you);
      const fit=Math.round(.35*role.fit*100+.25*(blend.score==null?50:blend.score)+.40*taste.score);
      return {candidate,complete:match.complete,fit,match,blend,role,taste,reasons:taste.reasons.slice(0,3)};
    }).sort((a,b)=>(b.complete===true)-(a.complete===true)||(b.fit||0)-(a.fit||0));
  }
  function partFits(profile,songId){
    const me=personFromProfile(profile),song=matchSong(songId);
    return song.parts.map(part=>({part,result:me?Match.partFit(me,part):null}));
  }
  function analyzeVoice(data,sampleRate){const features=Timbre.features(data,sampleRate),roles=Timbre.roles(features);return {features,roles};}
  function lyricsFor(songId,trackIndex=0){const song=getSong(songId),track=song.tracks[trackIndex]||song.tracks[0];return Midi.syncLyrics(track,song.ppq,song.bpm);}
  window.IEUM_CORE={getSong,matchSong,personFromProfile,rank,partFits,analyzeVoice,lyricsFor};
})();
