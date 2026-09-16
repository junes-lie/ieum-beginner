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
  function cassette(progress,animation=""){
    const p=Math.max(0,Math.min(100,progress));
    const outside=100-p;
    return `<section class="cassette-stage progress-${p} ${animation?`animate-${animation}`:""}" aria-label="카세트 프로젝트 진행률 ${p}퍼센트">
      <div class="cassette-shell"><div class="j-card"><div><span>TRACK 01</span>${p>=50?'<strong class="hand-a">민서 · 알토 응답</strong><time class="hand-a">9월 18일</time>':'<em>녹음 대기</em>'}</div><div><span>TRACK 02</span>${p>=100?'<strong class="hand-b">낮은 응답</strong><time class="hand-b">9월 21일</time>':'<em>다음 파트 대기</em>'}</div></div><div class="reel-bed"><span class="reel left"></span><span class="tape-window"><i style="width:${p}%"></i></span><span class="reel right"></span></div><div class="cassette-screws"><i></i><i></i><i></i><i></i></div></div>
      <svg class="loose-tape" viewBox="0 0 360 120" aria-hidden="true" style="--outside:${outside}"><path pathLength="100" d="M36 4 C 36 78, 106 112, 174 76 S 300 42, 326 4"/></svg>
    </section>`;
  }
  window.IEUM_UI={img,icon,esc,header,detail,nav,sticky,pitchRail,songRow,cassette};
})();
