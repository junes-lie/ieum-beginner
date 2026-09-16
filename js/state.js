(function(){
  const KEY="ieum.rebuild.v1";
  const defaults={measurement:"none",measurementStep:0,voiceProfile:null,songFilter:"전체",selectedSong:0,selectedPart:"알토 응답",selectedKey:"-1키",openPartIndex:0,conditionsAccepted:false,joined:false,projectProgress:0,reelAnimation:"",recordingState:"idle",mixingMode:"ai",mixStatus:"idle",toast:"",modal:null};
  function load(){try{const raw=localStorage.getItem(KEY);return raw?{...defaults,...JSON.parse(raw)}:{...defaults};}catch(error){return {...defaults,toast:"저장된 상태를 읽지 못해 기본 화면을 열었어요."};}}
  let value=load();
  function save(){const persist={...value,toast:"",modal:null,reelAnimation:""};localStorage.setItem(KEY,JSON.stringify(persist));}
  window.IEUM_STATE={get:()=>value,set(patch,{persist=true}={}){value={...value,...patch};if(persist)save();return value;},reset(){value={...defaults};save();return value;},save};
})();
