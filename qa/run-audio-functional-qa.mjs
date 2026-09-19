import {createRequire} from "node:module";
const require=createRequire("C:\\Users\\LEE\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright\\package.json");
const {chromium}=require("playwright");

const browser=await chromium.launch({
  headless:true,
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  args:["--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream","--autoplay-policy=no-user-gesture-required"]
});
const context=await browser.newContext({viewport:{width:430,height:932},permissions:["microphone"]});
const page=await context.newPage();
const errors=[];
page.on("console",message=>{if(message.type()==="error")errors.push(message.text());});
page.on("pageerror",error=>errors.push(error.message));
await page.goto("http://127.0.0.1:4182/#/home",{waitUntil:"networkidle"});

const result=await page.evaluate(async()=>{
  const A=window.IEUM_AUDIO;
  const profile={stable:"C3–C5",stableLowMidi:48,stableHighMidi:72,timbre:{brightness:.64,density:.58,stability:.76}};
  const score=A.compatibility(profile,{required:"G3–C5"},{genreMatch:1,timbreContrast:.72});
  const image=A.timbreImage(profile.timbre);
  await A.startRecording(()=>{});
  await new Promise(resolve=>setTimeout(resolve,1400));
  const recording=await A.stopRecording();
  const mixUrl=await A.createAutomaticMix();
  return {
    compatibility:score,
    imageGenerated:image.startsWith("data:image/png"),
    recordingCreated:Boolean(recording?.url&&recording?.blob?.size),
    recordingBytes:recording?.blob?.size||0,
    mixCreated:Boolean(mixUrl),
    mixScheme:mixUrl?.split(":")[0]||""
  };
});

await page.evaluate(profile=>{
  localStorage.setItem("ieum.linen-tape.v1",JSON.stringify({measurement:"complete",voiceProfile:profile,recordingState:"idle",recordingMeta:null,projectProgress:0,mixStatus:"idle"}));
  location.hash="#/voice-report";location.reload();
},{min:"C3",max:"E5",stable:"C3–C5",center:"G4",stableLowMidi:48,stableHighMidi:72,timbre:{brightness:.64,density:.58,stability:.76}});
await page.waitForSelector(".generated-timbre img");
const ui=await page.evaluate(()=>({title:document.querySelector("h1")?.textContent||"",generatedImage:document.querySelector(".generated-timbre img")?.src.startsWith("data:image/png")||false,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}));

await browser.close();
const output={pass:errors.length===0&&result.recordingCreated&&result.mixCreated&&result.imageGenerated&&result.compatibility.score>0&&ui.generatedImage&&ui.overflow<=1,result,ui,errors};
console.log(JSON.stringify(output,null,2));
if(!output.pass)process.exitCode=1;
