(function(){
  const D=window.IEUM_DATA;
  const img=name=>`${D.images}${name}`;
  const icon=(name)=>`<i class="fa-solid ${name}" aria-hidden="true"></i>`;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function header(active=""){
    return `<header class="app-header"><a class="wordmark" href="#/home" aria-label="이음 홈"><span class="mark"></span>이음</a><div class="header-actions"><button class="icon-button" data-action="notice" aria-label="알림 보기">${icon("fa-bell")}</button><button class="icon-button" data-action="saved" aria-label="저장한 항목 보기">${icon("fa-bookmark")}</button></div></header>`;
  }
  function detail(title){return `<header class="detail-header"><button class="icon-button" data-action="back" aria-label="이전 화면">${icon("fa-chevron-left")}</button><strong>${esc(title)}</strong><span class="header-spacer"></span></header>`;}
  const navItem=(route,label,ico,active)=>`<a href="#/${route}" class="nav-item ${active===route?"active":""}" ${active===route?'aria-current="page"':""}>${icon(ico)}<span>${label}</span></a>`;
  function nav(active){return `<nav class="bottom-nav" aria-label="주요 메뉴">${navItem("home","홈","fa-house",active)}${navItem("songs","곡","fa-music",active)}${navItem("project","프로젝트","fa-tape",active)}${navItem("voice-report","내 목소리","fa-wave-square",active)}</nav>`;}
  function sticky(label,action,disabled=false,secondary=""){return `<div class="sticky-bar">${secondary?`<button class="button secondary" data-action="${secondary}">이전</button>`:""}<button class="button primary" data-action="${action}" ${disabled?"disabled":""}>${label}</button></div>`;}
  function pitchRail(compare=false){return `<div class="pitch-rail ${compare?"compare":""}" role="img" aria-label="${compare?"내 안정 구간 C3부터 C5와 선택한 파트 A3부터 E4 비교":"전체 음역 A2부터 E5, 안정 구간 C3부터 C5"}"><div class="pitch-labels"><span>A2</span><span>C3</span><span>G3</span><span>C5</span><span>E5</span></div><div class="rail-base"><span class="rail-all"></span><span class="rail-stable"></span>${compare?'<span class="rail-part"></span>':""}</div><div class="rail-legend"><span><i class="dot cyan"></i>안정 구간</span>${compare?'<span><i class="dot red"></i>파트 구간</span>':""}</div></div>`;}
  function songRow(song,index){return `<article class="song-row"><img src="${img(song.image)}" alt="${esc(song.arrangement)} 편성을 표현한 자기테이프 이미지" width="184" height="184" loading="lazy"><div class="song-info"><h3>${esc(song.title)}</h3><p>${esc(song.arrangement)} · ${esc(song.key)}키</p><span class="status-badge accent">${esc(song.fit)}</span><small>${esc(song.part)} · ${song.score}% 중첩</small></div><div class="row-actions"><button class="icon-button" data-audio="${song.preview}" aria-label="${esc(song.title)} 데모 듣기">${icon("fa-play")}</button><a class="icon-button" href="#/song/${song.id}" data-song="${index}" aria-label="${esc(song.title)} 상세 보기">${icon("fa-chevron-right")}</a></div></article>`;}
  function cassetteVisual(imageName,{compact=false,motion="",progress=0}={}){
    const p=Math.max(0,Math.min(100,progress));
    return `<div class="song-cassette ${compact?"is-compact":""} ${motion?`motion-${motion}`:""}" style="--tape-progress:${p}%" role="img" aria-label="곡 이미지 스킨이 입혀진 카세트">
      <img class="cassette-skin-image" src="${img(imageName)}" alt="" aria-hidden="true">
      <div class="cassette-glaze"></div>
      <div class="record-transport">
        <span class="record-reel left"><i></i></span>
        <span class="record-tape"><i></i><b></b></span>
        <span class="record-reel right"><i></i></span>
      </div>
      <div class="cassette-screws" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    </div>`;
  }
  function jCard(progress,userName="민서",{recording=false,recorded=false}={}){
    const p=Math.max(0,Math.min(100,progress));
    return `<aside class="separate-jcard ${recording?"is-writing":""} ${recorded?"is-recorded":""}" aria-label="카세트와 분리된 J카드">
      <div class="jcard-heading"><span>J카드</span><strong>파도가 남긴 것</strong><small>듀엣 · -1키</small></div>
      <div class="jcard-row"><span>TRACK 01</span>${recorded||p>=50?`<strong class="hand-a">${esc(userName)} · 알토 응답</strong><time>9월 18일</time>`:`<em aria-label="아직 기록 없음">—</em><time>—</time>`}</div>
      <div class="jcard-row"><span>TRACK 02</span>${p>=100?'<strong class="hand-b">낮은 응답</strong><time>9월 21일</time>':'<em aria-label="아직 기록 없음">—</em><time>—</time>'}</div>
    </aside>`;
  }
  function cassette(progress,animation="",userName="민서",imageName="02-song-duet-ribbon.webp"){
    const p=Math.max(0,Math.min(100,progress)),outside=100-p,motion=animation||"";
    return `<section class="cassette-stage progress-${p}" aria-label="카세트 프로젝트 진행률 ${p}퍼센트">
      <div class="cassette-object">${cassetteVisual(imageName,{motion,progress:p})}<svg class="loose-tape" viewBox="0 0 360 120" aria-hidden="true" style="--outside:${outside}"><path pathLength="100" d="M36 4 C 36 78, 106 112, 174 76 S 300 42, 326 4"/></svg></div>
      ${jCard(p,userName)}
    </section>`;
  }
  function recorderCassette(status,userName="민서",imageName="02-song-duet-ribbon.webp"){
    const recording=status==="recording",recorded=status==="preview"||status==="submitted";
    return `<section class="recorder-cassette ${recording?"is-recording":""} ${recorded?"is-recorded":""}" aria-label="${recording?"녹음 중, 왼쪽 릴과 자기테이프가 움직이는 곡 카세트":"알토 응답 곡 카세트"}">
      ${cassetteVisual(imageName,{motion:recording?"recording":"",progress:recorded?50:0})}
      <div class="record-jcard">${jCard(recorded?50:0,userName,{recording,recorded})}</div>
    </section>`;
  }
  function miniCassette(imageName,progress=0){return cassetteVisual(imageName,{compact:true,progress});}
  window.IEUM_UI={img,icon,esc,header,detail,nav,sticky,pitchRail,songRow,cassette,recorderCassette,miniCassette};
})();
