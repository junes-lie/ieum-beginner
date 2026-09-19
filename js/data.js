window.IEUM_DATA = {
  images: "assets/images/",
  songs: [
    {id:"wave",title:"파도가 남긴 것",genre:"발라드",arrangement:"듀엣",key:"C",fit:"-1키 권장",score:88,range:"A3–E5",part:"낮은 파트",image:"02-song-duet-ribbon.webp",preview:"song-wave.mp3"},
    {id:"season",title:"겹친 계절",genre:"인디",arrangement:"4파트",key:"G",fit:"원키 적합",score:93,range:"C3–C5",part:"중간 화음",image:"03-song-choir-layers.webp",preview:"song-season.mp3"},
    {id:"breath",title:"숨의 매듭",genre:"R&B",arrangement:"아카펠라",key:"D",fit:"원키 적합",score:84,range:"B2–D5",part:"리드 화음",image:"04-song-acapella-knot.webp",preview:"song-breath.mp3"}
  ],
  openParts: [
    {id:"low",name:"윤",part:"낮은 파트",required:"D3–C4",key:"곡에 따라 조정",deadline:"자유롭게 조율",pace:"날짜 없이 천천히",tracks:"1 / 2",timbre:"낮고 밀도 높은 소리",image:"06-timbre-low-oxide.webp",genres:["발라드","어쿠스틱"],sharedSongs:8,recentSongs:["밤 사이","새벽 우편"],history:"최근 부른 곡 · 발라드 2곡",person:{lo:43,hi:72,lo90:49,hi90:66,genres:{"발라드":.45,"인디":.25,"어쿠스틱":.2,"R&B":.1},liked:["wave","season"],sing:["wave","season"],form:"duet",role:"받침",voicePreset:{f0:196,roll:.58,noise:.015,atk:.035,rel:.12,seed:4}}},
    {id:"air",name:"솔",part:"높은 파트",required:"D4–D5",key:"곡에 따라 조정",deadline:"자유롭게 조율",pace:"천천히 맞추기",tracks:"1 / 2",timbre:"가볍고 긴 호흡",image:"07-timbre-air-silver.webp",genres:["인디","팝"],sharedSongs:5,recentSongs:["마주","유리 정원"],history:"최근 부른 곡 · 인디 2곡",person:{lo:52,hi:82,lo90:57,hi90:77,genres:{"인디":.4,"팝":.3,"발라드":.2,"R&B":.1},liked:["season"],sing:["wave","season"],form:"duet",role:"윗화음",voicePreset:{f0:293.66,roll:.76,noise:.035,atk:.07,rel:.25,seed:8}}},
    {id:"middle",name:"은",part:"중간 화음",required:"C3–B4",key:"곡에 따라 조정",deadline:"자유롭게 조율",pace:"한 번씩 편하게",tracks:"1 / 2",timbre:"균형 잡힌 중음",image:"08-timbre-warm-paper.webp",genres:["R&B","아카펠라"],sharedSongs:6,recentSongs:["마주","밤의 호흡"],history:"최근 부른 곡 · R&B 2곡",person:{lo:47,hi:79,lo90:53,hi90:72,genres:{"R&B":.35,"발라드":.3,"인디":.2,"아카펠라":.15},liked:["wave"],sing:["wave","season"],form:"duet",role:"중간화음",voicePreset:{f0:246.94,roll:.67,noise:.02,atk:.045,rel:.16,seed:11}}}
  ]
};
