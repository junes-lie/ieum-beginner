/* 이음 — 곡 데이터와 화성 붙이기
 *
 * 화면을 전혀 건드리지 않는다.
 *
 * 곡은 여기 데이터로만 들어 있다. 나중에 진짜 곡이 생기면
 * MELODY 배열만 갈아끼우면 되고 아래 함수들은 손댈 게 없다.
 *
 * -- 아래 두 곡은 제가 찍은 것입니다. 사람들이 부르고 싶어 할 곡인지는
 *    제가 보장하지 못합니다. 기능이 도는지 보여주기 위한 자리입니다.
 *    음역은 일부러 좁게 잡았습니다 (D4~D5 · D3~B3). 아마추어가 부를 수 있게.
 */
(function (root, factory) {
  var S = factory();
  if (typeof module === 'object' && module.exports) module.exports = S;
  root.SongData = S;
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

var NAMES = { C:0, 'C#':1, D:2, 'D#':3, E:4, F:5, 'F#':6, G:7, 'G#':8, A:9, 'A#':10, B:11 };

/* 'A4' -> 69 */
function m(name){
  var mm = /^([A-G]#?)(-?\d)$/.exec(name);
  if (!mm) throw new Error('음 이름이 이상합니다: ' + name);
  return NAMES[mm[1]] + (parseInt(mm[2], 10) + 1) * 12;
}

/* 가락 한 줄을 [음이름, 길이(4분음표=1), 가사] 로 적는다. */
function line(chord, arr){ return { chord: chord, arr: arr }; }

/* ── 밤 사이 — 듀엣 ──────────────────────────
 * 가단조. Am - F - C - G 를 돈다. 72 BPM.
 * 벌스 1 은 사람 1, 벌스 2 는 사람 2, 후렴은 둘이 같이. */
var BAM = {
  id: 'bam', title: '밤 사이', bpm: 72, key: 'Am',
  verse1: [
    line('Am', [['E4',.5,'불 '],['G4',.5,'꺼'],['A4',1,'진 '],['A4',.5,'방'],['G4',.5,'에 '],['E4',1,'혼'],['D4',1,'자']]),
    line('F',  [['F4',.5,'창'],['A4',.5,'밖'],['A4',1,'엔 '],['G4',.5,'비'],['F4',.5,'가 '],['E4',2,'와']]),
    line('C',  [['E4',.5,'네 '],['G4',.5,'목'],['C5',1,'소'],['B4',.5,'리'],['G4',.5,'가 '],['E4',1,'들'],['G4',1,'려']]),
    line('G',  [['D4',.5,'이'],['G4',.5,'제'],['B4',1,'는 '],['A4',.5,'혼'],['G4',.5,'자 '],['F4',1,'아'],['E4',1,'냐']])
  ],
  verse2: [
    line('Am', [['E4',.5,'잠 '],['G4',.5,'못 '],['A4',1,'드'],['A4',.5,'는 '],['G4',.5,'이 '],['E4',1,'밤'],['D4',1,'에']]),
    line('F',  [['F4',.5,'너'],['A4',.5,'를 '],['A4',1,'생'],['G4',.5,'각'],['F4',.5,'했'],['E4',2,'어']]),
    line('C',  [['E4',.5,'이'],['G4',.5,'제'],['C5',1,'야 '],['B4',.5,'네'],['G4',.5,'가 '],['E4',1,'왔'],['G4',1,'네']]),
    line('G',  [['D4',.5,'같'],['G4',.5,'이 '],['B4',1,'불'],['A4',.5,'러'],['G4',.5,'보'],['F4',1,'자'],['E4',1,'요']])
  ],
  chorus: [
    line('F',  [['A4',.5,'같'],['C5',.5,'이 '],['C5',1,'부'],['D5',1,'르'],['C5',1,'자']]),
    line('C',  [['C5',.5,'이 '],['B4',.5,'밤'],['A4',1,'이 '],['G4',.5,'끝'],['A4',.5,'나'],['G4',1,'도']]),
    line('Am', [['A4',.5,'우'],['C5',.5,'리 '],['D5',1,'둘'],['C5',1,'이'],['A4',1,'서']]),
    line('G',  [['G4',.5,'끝'],['A4',.5,'까'],['B4',1,'지 '],['A4',1,'가'],['A4',1,'자']])
  ]
};

/* ── 마주 — 네 사람 (아카펠라) ─────────────────
 * 같은 가락을 네 자리로 나눈다. 가사는 한 줄을 넷이 같이 부른다. */
var MAJU = {
  id: 'maju', title: '마주', bpm: 84, key: 'Am',
  chorus: [
    line('Am', [['A4',1,'마'],['C5',1,'주 '],['B4',1,'보'],['A4',1,'며']]),
    line('F',  [['G4',1,'한 '],['A4',1,'소'],['C5',1,'리'],['A4',1,'로']]),
    line('C',  [['C5',1,'이'],['B4',1,'어'],['G4',1,'지'],['E4',1,'는']]),
    line('G',  [['D4',1,'우'],['E4',1,'리'],['G4',2,'야']])
  ]
};

/* ── 음계 위에서 몇 칸 움직이기 ───────────────
 * 그냥 반음 수로 내리면 조성을 벗어난다. 가단조 음계 위에서 세어야 한다. */
var AM_PC = [9, 11, 0, 2, 4, 5, 7];        // A B C D E F G
var LADDER = (function(){
  var out = [], oct, i;
  for (oct = 0; oct < 11; oct++)
    for (i = 0; i < AM_PC.length; i++){
      var n = AM_PC[i] + oct * 12;
      if (n >= 0 && n <= 127) out.push(n);
    }
  return out.sort(function(a, b){ return a - b; });
})();

function stepBy(midi, steps){
  var i = LADDER.indexOf(midi);
  if (i < 0){                                    // 음계 밖이면 가장 가까운 칸으로
    var best = 0, bd = 999;
    LADDER.forEach(function(v, k){ var d = Math.abs(v - midi); if (d < bd){ bd = d; best = k; } });
    i = best;
  }
  var j = Math.max(0, Math.min(LADDER.length - 1, i + steps));
  return LADDER[j];
}

/* 가락에 화성을 붙인다.
 *   steps  음계 위에서 몇 칸 내릴지 (-2 = 3도 아래)
 *   octave 옥타브 몇 개 내릴지 */
function harmonize(notes, steps, octave){
  return notes.map(function(n){
    return { midi: stepBy(n.midi, steps) - 12 * (octave || 0),
             tick: n.tick, dur: n.dur, vel: n.vel };
  });
}

/* 줄 배열을 음표 + 가사로 펼친다.
   가사가 화면에서 줄바꿈되게 줄 경계도 같이 넘긴다. */
function layout(lines, ppq, startTick){
  var tick = startTick || 0, notes = [], lyrics = [], rows = [];
  lines.forEach(function(L){
    var from = tick, text = '';
    L.arr.forEach(function(a){
      var d = Math.round(a[1] * ppq);
      notes.push({ midi: m(a[0]), tick: tick, dur: Math.max(1, d - Math.round(ppq * 0.06)), vel: 84 });
      lyrics.push({ tick: tick, text: a[2] });
      text += a[2];
      tick += d;
    });
    rows.push({ from: from, to: tick, text: text, chord: L.chord });
    tick += ppq;                                  // 줄 끝에 한 박 쉰다
  });
  return { notes: notes, lyrics: lyrics, rows: rows, end: tick };
}

/* ── 곡 짓기 ──────────────────────────────── */

/* 밤 사이 — 파트 둘.
 * 벌스는 서로 자기 가사를 부르고(사람 2 는 옥타브 아래),
 * 후렴은 같은 가사를 3도 벌려 함께 부른다. */
function buildBam(ppq){
  ppq = ppq || 480;
  var v1 = layout(BAM.verse1, ppq, 0);
  var v2 = layout(BAM.verse2, ppq, v1.end);
  var ch = layout(BAM.chorus, ppq, v2.end);

  var high = { name: '높은 파트', channel: 0,
    notes: v1.notes.concat(ch.notes),
    lyrics: v1.lyrics.concat(ch.lyrics),
    rows: v1.rows.concat(ch.rows) };

  var low = { name: '낮은 파트', channel: 1,
    notes: harmonize(v2.notes, 0, 1).concat(harmonize(ch.notes, -2, 1)),
    lyrics: v2.lyrics.concat(ch.lyrics),
    rows: v2.rows.concat(ch.rows) };

  return { title: BAM.title, ppq: ppq, bpm: BAM.bpm, tracks: [high, low],
           rows: v1.rows.concat(v2.rows, ch.rows),
           sections: [
             { name: '벌스 1 · 사람 1', from: 0,       to: v1.end, who: [0] },
             { name: '벌스 2 · 사람 2', from: v1.end,  to: v2.end, who: [1] },
             { name: '후렴 · 둘이',     from: v2.end,  to: ch.end, who: [0,1] }
           ] };
}

/* 마주 — 네 파트. 같은 가락을 네 자리로 벌린다. */
function buildMaju(ppq){
  ppq = ppq || 480;
  var c = layout(MAJU.chorus, ppq, 0);
  var parts = [
    { name: '소프라노', steps:  0, oct: 0 },
    { name: '알토',     steps: -2, oct: 0 },
    { name: '테너',     steps: -4, oct: 0 },
    { name: '베이스',   steps: -2, oct: 1 }
  ];
  return {
    title: MAJU.title, ppq: ppq, bpm: MAJU.bpm,
    tracks: parts.map(function(p, i){
      return { name: p.name, channel: i,
               notes: harmonize(c.notes, p.steps, p.oct),
               lyrics: c.lyrics, rows: c.rows };
    }),
    rows: c.rows,
    sections: [{ name: '후렴 · 네 사람', from: 0, to: c.end, who: [0,1,2,3] }]
  };
}

/* 트랙의 음역 — 매칭 엔진(match.js)이 받는 모양 그대로 */
function partRange(track){
  var ms = track.notes.map(function(n){ return n.midi; });
  var lo = Math.min.apply(null, ms), hi = Math.max.apply(null, ms);
  var byPitch = {};
  track.notes.forEach(function(n){ byPitch[n.midi] = (byPitch[n.midi] || 0) + n.dur; });
  var ps = Object.keys(byPitch).map(Number).sort(function(a, b){ return a - b; });
  var tot = ps.reduce(function(a, p){ return a + byPitch[p]; }, 0) || 1;
  var acc = 0, lo90 = ps[0], hi90 = ps[ps.length - 1], i;
  for (i = 0; i < ps.length; i++){ acc += byPitch[ps[i]]; if (acc >= tot * 0.05){ lo90 = ps[i]; break; } }
  acc = 0;
  for (i = ps.length - 1; i >= 0; i--){ acc += byPitch[ps[i]]; if (acc >= tot * 0.10){ hi90 = ps[i]; break; } }
  var highDur = track.notes.filter(function(n){ return n.midi >= hi90 - 2; })
                           .reduce(function(a, n){ return a + n.dur; }, 0);
  return { name: track.name, lo: lo, hi: hi, lo90: lo90, hi90: hi90,
           n: track.notes.length, highRatio: highDur / tot };
}

function songs(ppq){ return [buildBam(ppq), buildMaju(ppq)]; }

return { m: m, stepBy: stepBy, harmonize: harmonize, layout: layout,
         buildBam: buildBam, buildMaju: buildMaju, partRange: partRange,
         songs: songs, RAW: { BAM: BAM, MAJU: MAJU } };
});
