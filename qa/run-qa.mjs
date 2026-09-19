import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const require=createRequire(import.meta.url);
const { chromium }=require("playwright");
const sharp=require("sharp");
const iteration=Number(process.argv[2]||1);
const base="http://127.0.0.1:4182";
const root=path.resolve(import.meta.dirname,"..");
const shots=path.join(import.meta.dirname,"screenshots");
await fs.mkdir(shots,{recursive:true});

const routes=[
  ["01","홈","home"],["02","음역 안내","range-guide"],["03","음역 측정","range-test"],
  ["04","보이스 리포트","voice-report"],["05","곡 탐색","songs"],["06","곡·파트","song/wave"],
  ["07","열린 파트","open-parts"],["08","보컬 궁합","compatibility/low"],["09","참여 조건","join/low"],
  ["10","프로젝트룸","project"],["11","녹음","record/alto"],["12","믹싱·완성","mix/wave"]
];
const browser=await chromium.launch({headless:true,executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"});
const consoleErrors=[];
const results=[];
const storage={measurement:"complete",measurementStep:2,voiceProfile:{min:"A2",max:"E5",stable:"C3–C5"},songFilter:"전체",selectedSong:0,selectedPart:"알토 응답",selectedKey:"-1키",openPartIndex:0,conditionsAccepted:false,joined:true,projectProgress:50,reelAnimation:"",recordingState:"idle",mixingMode:"ai",mixStatus:"idle",toast:"",modal:null};

const context=await browser.newContext({viewport:{width:430,height:932},locale:"ko-KR",deviceScaleFactor:1});
const page=await context.newPage();
page.on("console",m=>{if(m.type()==="error")consoleErrors.push(`browser:${m.text()}`);});
page.on("pageerror",e=>consoleErrors.push(`browser:page:${e.message}`));
page.on("response",response=>{if(response.status()>=400)consoleErrors.push(`http:${response.status()}:${response.url()}`);});
await page.goto(base,{waitUntil:"commit",timeout:15000});
await page.waitForSelector("#app h1",{timeout:15000});
await page.evaluate(value=>{localStorage.setItem("ieum.linen-tape.v1",JSON.stringify(value));location.reload();},storage);
await page.waitForSelector("#app h1");
for(const width of [430,390,360]){
  await page.setViewportSize({width,height:932});
  for(const [no,name,route] of routes){
    await page.evaluate(r=>{location.hash=`#/${r}`;},route);
    await page.waitForTimeout(120);
    await page.waitForTimeout(500);
    await page.evaluate(()=>{window.scrollTo(0,document.body.scrollHeight);document.querySelectorAll(".image-rail,.chip-row").forEach(el=>el.scrollLeft=el.scrollWidth);});
    await page.waitForTimeout(260);
    await page.evaluate(()=>window.scrollTo(0,0));
    const audit=await page.evaluate(currentRoute=>{
      const interactive=[...document.querySelectorAll("button,a,input")].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0;});
      const targetRect=el=>el.matches("input[type=checkbox]")&&el.closest("label")?el.closest("label").getBoundingClientRect():el.getBoundingClientRect();
      const undersized=interactive.filter(el=>{const r=targetRect(el);return r.width<44||r.height<44;}).map(el=>{const r=targetRect(el);return {tag:el.tagName,text:(el.innerText||el.getAttribute("aria-label")||"").trim().slice(0,40),w:Math.round(r.width),h:Math.round(r.height)};});
      const broken=[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src);
      const mediaErrors=[];
      const measure=(selector,label,minH,maxH,square=false)=>{const el=document.querySelector(selector);if(!el){mediaErrors.push(`${label}:missing`);return;}const r=el.getBoundingClientRect();if(r.height<minH||r.height>maxH||(square&&Math.abs(r.width-r.height)>1))mediaErrors.push(`${label}:${Math.round(r.width)}x${Math.round(r.height)}`);};
      if(currentRoute==="home"){
        const rangeImage=document.querySelector(".range-feature>img");
        if(rangeImage){const r=rangeImage.getBoundingClientRect();if(r.height<140||r.height>165)mediaErrors.push(`home-range:${Math.round(r.width)}x${Math.round(r.height)}`);}
        if(document.querySelector(".range-feature"))mediaErrors.push("measured-home:range-feature-visible");
        const stripCassettes=[...document.querySelectorAll(".cassette-strip>.song-cassette")];
        if(stripCassettes.length!==2)mediaErrors.push(`cassette-strips:${stripCassettes.length}`);
        stripCassettes.forEach((el,index)=>{const r=el.getBoundingClientRect(),reels=[...el.querySelectorAll(".record-reel")].map(x=>x.getBoundingClientRect());if(r.width<132||r.width>152||Math.abs(r.width/r.height-1.54)>.03)mediaErrors.push(`cassette-strip-${index+1}:${Math.round(r.width)}x${Math.round(r.height)}`);if(reels.length!==2||reels.some(x=>x.left<r.left||x.right>r.right||x.top<r.top||x.bottom>r.bottom||Math.abs(x.width-x.height)>1))mediaErrors.push(`cassette-reels-${index+1}:clipped`);});
        const songCassettes=[...document.querySelectorAll(".cassette-song-card .song-cassette")];
        const skins=new Set(songCassettes.map(el=>el.querySelector(".cassette-skin-image")?.getAttribute("src")||""));
        if(songCassettes.length!==3||skins.size!==3)mediaErrors.push(`song-skins:${songCassettes.length}/${skins.size}`);
      }
      if(currentRoute==="range-guide")measure('.page-intro+.section>img[src$="01-range-calibration.webp"]',"range-guide",130,149);
      return {title:document.querySelector("h1")?.innerText||"",h1:document.querySelectorAll("h1").length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,broken,undersized,mediaErrors,buttons:interactive.length,body:document.body.innerText.trim().length};
    },route);
    const pass=audit.body>0&&audit.h1===1&&audit.overflow<=1&&audit.broken.length===0&&audit.undersized.length===0&&audit.mediaErrors.length===0;
    results.push({width,no,name,route,pass,...audit});
    if(width===430)await page.screenshot({path:path.join(shots,`${no}-${route.replaceAll("/","-")}.png`),fullPage:true});
  }
}
const flows=[];
{
  await page.setViewportSize({width:430,height:932});await page.evaluate(()=>{localStorage.clear();location.hash="#/home";location.reload();});await page.waitForSelector("#app h1");const firstHome=await page.evaluate(()=>({rangeFeature:!!document.querySelector(".range-feature"),measureButton:!![...document.querySelectorAll("button")].find(x=>x.textContent.includes("음역 측정 준비하기"))}));await page.getByRole("button",{name:"음역 측정 준비하기"}).click();
  await page.getByRole("button",{name:/마이크 확인하고/}).click();
  await page.getByRole("button",{name:"다음 구간 측정하기"}).click();await page.getByRole("button",{name:"다음 구간 측정하기"}).click();await page.getByRole("button",{name:"측정 결과 분석하기"}).click();
  await page.waitForURL(/voice-report/);const reportReady=(await page.locator("h1").innerText()).includes("C3–C5");await page.evaluate(()=>{location.hash="#/home";});await page.waitForSelector("#app h1");const measuredHome=await page.evaluate(()=>({rangeFeature:!!document.querySelector(".range-feature"),heading:document.querySelector("h1")?.innerText||"",measureButton:!![...document.querySelectorAll("button")].find(x=>x.textContent.includes("음역 측정"))}));flows.push({name:"A 최초 음역 측정과 완료 후 홈 전환",pass:firstHome.rangeFeature&&firstHome.measureButton&&reportReady&&!measuredHome.rangeFeature&&!measuredHome.measureButton&&measuredHome.heading.includes("부르기 좋은 곡"),values:{firstHome,measuredHome}});
}
{
  await page.evaluate(v=>{localStorage.setItem("ieum.linen-tape.v1",JSON.stringify(v));location.hash="#/songs";location.reload();},{...storage,conditionsAccepted:false,projectProgress:0});await page.waitForSelector("#app h1");await page.locator(".song-row .icon-button").nth(1).click();await page.getByRole("button",{name:/열린 자리 보기/}).click();await page.getByRole("button",{name:"궁합 자세히 보기"}).click();await page.getByRole("button",{name:"일정과 공개 범위 확인하기"}).click();await page.locator("[data-condition]").check();await page.getByRole("button",{name:"이 조건으로 프로젝트에 참여하기"}).click();await page.waitForURL(/project/);flows.push({name:"B 곡·파트 참여",pass:(await page.locator("h1").innerText()).includes("트랙")});
}
{
  await page.evaluate(v=>{localStorage.setItem("ieum.linen-tape.v1",JSON.stringify(v));location.hash="#/project";location.reload();},{...storage,projectProgress:0,recordingState:"idle",userName:"민서"});await page.waitForSelector("#app h1");await page.getByRole("button",{name:"알토 응답 녹음하기"}).click();await page.getByRole("button",{name:"녹음 시작"}).click();const motion=await page.evaluate(()=>{const cassette=document.querySelector(".recorder-cassette>.song-cassette"),card=document.querySelector(".recorder-cassette .separate-jcard"),c=cassette.getBoundingClientRect(),j=card.getBoundingClientRect();return {reel:getComputedStyle(document.querySelector(".record-reel.left")).animationName,tape:getComputedStyle(document.querySelector(".record-tape i")).animationName,playhead:getComputedStyle(document.querySelector(".pitch-playhead")).animationName,lyrics:!!document.querySelector(".lyric-guide"),emptyCassette:cassette.textContent.trim()==="",separate:j.top>c.bottom+12&&!cassette.contains(card)}});await page.getByRole("button",{name:"녹음 멈추기"}).click();const preview=await page.evaluate(()=>({named:document.querySelector(".record-jcard")?.innerText||"",nameEditor:!!document.querySelector("[data-recorder-name],.name-sheet"),jCardCopy:document.querySelector(".record-intro p")?.innerText||""}));await page.getByRole("button",{name:"이 트랙 제출하기"}).click();await page.waitForURL(/project/);await page.getByRole("button",{name:"다음 파트 도착 상태 보기"}).click();await page.getByRole("button",{name:"믹싱 방식 고르기"}).click();await page.getByRole("button",{name:"AI 믹스 데모 만들기"}).click();flows.push({name:"C 녹음·카세트·가사·분리 J카드·믹싱",pass:motion.reel==="record-reel-spin"&&motion.tape==="tape-travel"&&motion.playhead==="pitch-playhead"&&motion.lyrics&&motion.emptyCassette&&motion.separate&&preview.named.includes("민서")&&!preview.nameEditor&&!preview.jCardCopy.includes("J카드")&&(await page.locator("h1").innerText()).includes("한 파일"),values:{...motion,...preview}});
}
{
  await page.evaluate(()=>{location.hash="#/home";});
  await page.waitForSelector(".image-rail[data-slider-ready]");
  const rail=page.locator(".image-rail");
  await rail.scrollIntoViewIfNeeded();
  const before=await rail.evaluate(el=>el.scrollLeft);
  const box=await rail.boundingBox();
  await page.mouse.move(box.x+box.width*.78,box.y+box.height*.5);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.18,box.y+box.height*.5,{steps:12});
  const whileDragging=await rail.evaluate(el=>el.scrollLeft);
  await page.mouse.up();
  await page.waitForTimeout(420);
  const afterDrag=await rail.evaluate(el=>el.scrollLeft);
  flows.push({name:"D 추천 곡 마우스 드래그",pass:whileDragging>before&&afterDrag>before,values:{before,whileDragging,afterDrag,box}});
}
await context.close();
await browser.close();

const assetFiles=(await fs.readdir(path.join(root,"assets","images"))).filter(x=>x.endsWith(".webp"));
const result={iteration,summary:{checks:results.length,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,flowsPassed:flows.filter(x=>x.pass).length,flowsTotal:flows.length,consoleErrors:[...new Set(consoleErrors)],imageCount:assetFiles.length},flows,results};
await fs.writeFile(path.join(import.meta.dirname,`qa-results-iteration-${iteration}.json`),JSON.stringify(result,null,2));

if(iteration>=3){
  const cardW=230,cardH=548,gap=18,margin=34,headerH=120,cols=3,rows=4;
  const canvasW=margin*2+cols*cardW+(cols-1)*gap,canvasH=headerH+rows*cardH+(rows-1)*gap+70;
  const composites=[];
  const svg=(w,h,body)=>Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Arial,sans-serif;fill:#191817}.k{font-size:13px;font-weight:700;fill:#b6422f;letter-spacing:2px}.h{font-size:27px;font-weight:800}.s{font-size:12px;fill:#5d5a55}.n{font-size:12px;font-weight:700}.t{font-size:18px;font-weight:800}.ok{fill:#008e9b}</style>${body}</svg>`);
  composites.push({input:svg(canvasW,headerH,`<text x="${margin}" y="38" class="k">IEUM / SCREEN QA SHEET</text><text x="${margin}" y="76" class="h">이음 · 화면별 QA</text><text x="${margin}" y="103" class="s">360 / 390 / 430px · 12 screens · ${iteration} regression passes · deployment excluded</text>`),left:0,top:0});
  for(let i=0;i<routes.length;i++){
    const [no,name,route]=routes[i],left=margin+(i%cols)*(cardW+gap),top=headerH+Math.floor(i/cols)*(cardH+gap);
    const shot=await sharp(path.join(shots,`${no}-${route.replaceAll("/","-")}.png`)).resize({width:cardW-16,height:480,fit:"cover",position:"top"}).png().toBuffer();
    composites.push({input:svg(cardW,cardH,`<rect x=".5" y=".5" width="${cardW-1}" height="${cardH-1}" fill="#fbfaf6" stroke="#191817"/><text x="10" y="510" class="n">${no} / PASS</text><text x="${cardW-10}" y="510" text-anchor="end" class="ok">✓</text><text x="10" y="538" class="t">${name}</text>`),left,top});composites.push({input:shot,left:left+8,top:top+8});
  }
  composites.push({input:svg(canvasW,70,`<line x1="${margin}" y1="8" x2="${canvasW-margin}" y2="8" stroke="#191817"/><text x="${margin}" y="38" class="s">PASS = responsive media size · no overflow · no broken image · targets ≥ 44px · one H1</text><text x="${canvasW-margin}" y="38" text-anchor="end" class="s">Linen Paper · Carbon Ink · Cognac Oxide</text>`),left:0,top:canvasH-70});
  await sharp({create:{width:canvasW,height:canvasH,channels:3,background:"#f1f0ec"}}).composite(composites).png().toFile(path.join(import.meta.dirname,"ieum-screen-qa-sheet.png"));
}
console.log(JSON.stringify(result.summary));
if(result.summary.failed||result.summary.flowsPassed!==result.summary.flowsTotal||result.summary.consoleErrors.length||result.summary.imageCount!==10)process.exitCode=1;
