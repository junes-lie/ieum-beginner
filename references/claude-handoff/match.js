/* 이음 — 매칭 엔진
 *
 * 화면을 전혀 건드리지 않는다. 값을 넣으면 값이 나온다.
 * 지금은 <script src="match.js"> 로 쓰고,
 * 나중에 React 로 옮길 때 이 파일은 그대로 두고 import 만 하면 된다.
 *
 * 음 번호는 MIDI 번호를 쓴다. 60 = 가운데 도(C4). 1 차이 = 반음.
 *
 * 사람  {id, name, lo, hi, lo90, hi90}
 *        lo/hi     = 겨우 내는 끝까지 (음역대측정.html 이 뱉는 값)
 *        lo90/hi90 = 편하게 내는 구간
 *
 * 곡    {title, parts:[{name, lo, hi, lo90, hi90, highRatio}]}
 *        (파트궁합.html 이 MIDI 에서 뽑는 값과 같은 모양)
 *        highRatio = 그 파트가 꼭대기 근처에 머무는 시간의 비율
 */
(function (root, factory) {
  var M = factory();
  if (typeof module === 'object' && module.exports) module.exports = M;
  root.Match = M;
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

var NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

/* MIDI 번호를 사람이 읽는 이름으로. 60 -> C4 */
function noteName(m){
  m = Math.round(m);
  return NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
}

/* 구간 a 중 몇 %가 구간 b 안에 들어오는가 (0~1) */
function overlap(aLo, aHi, bLo, bHi){
  var w = aHi - aLo;
  if (w <= 0) return 0;
  return Math.max(0, Math.min(aHi, bHi) - Math.max(aLo, bLo)) / w;
}

/* 여유 반음 수를 0~1 점수로.
 * 3반음 이상 남으면 1, 딱 맞으면 0.5, 모자라면 빠르게 0.
 * -- 꺾이는 지점(3반음 / 0.5)은 실측이 아니라 설계값입니다. */
function marginScore(semi){
  if (semi >= 3) return 1;
  if (semi >= 0) return 0.5 + semi / 6;
  return Math.max(0, 0.5 + semi / 4);
}

/* 한 사람이 한 파트를 맡으면 어떻게 되는가 */
function partFit(person, part){
  var marginLo = part.lo - person.lo;   // 양수면 아래로 여유가 있다
  var marginHi = person.hi - part.hi;   // 양수면 위로 여유가 있다
  var tess = overlap(part.lo90, part.hi90, person.lo90, person.hi90);

  var fit = 0.50 * tess
          + 0.25 * marginScore(marginLo)
          + 0.25 * marginScore(marginHi);

  // 곡이 꼭대기에 오래 머무는데 내 천장이 빠듯하면 조금 더 깎는다
  var head = person.hi - part.hi90;
  var strain = 0;
  if (part.highRatio != null && part.highRatio > 0.25 && head < 3) {
    strain = (part.highRatio - 0.25) * (3 - Math.max(0, head)) / 3;
    fit = Math.max(0, fit - strain);
  }

  return {
    fit: fit,
    tess: tess,
    marginLo: marginLo,
    marginHi: marginHi,
    strain: strain,
    reachLo: marginLo >= 0,            // 최저음에 닿는가
    reachHi: marginHi >= 0,            // 최고음에 닿는가
    canSing: marginLo >= 0 && marginHi >= 0
  };
}

/* 사람들을 서로 다른 파트에 나눠 맡기는 모든 경우 */
function arrangements(nPeople, nParts){
  var out = [], cur = [], used = new Array(nParts);
  (function rec(i){
    if (i === nPeople) { out.push(cur.slice()); return; }
    for (var p = 0; p < nParts; p++){
      if (used[p]) continue;
      used[p] = true; cur.push(p);
      rec(i + 1);
      cur.pop(); used[p] = false;
    }
  })(0);
  return out;
}

/* 이 조합에서 가장 좋은 파트 배정을 찾는다.
 *
 * 점수는 '완주' 쪽에 무게를 둔다.
 * 한 사람이 아무리 잘해도 다른 한 사람이 못 부르면 곡은 끝나지 않는다.
 * 그래서 가장 약한 쪽에 0.6, 평균에 0.4 를 준다.
 * -- 0.6 / 0.4 도 실측이 아니라 설계값입니다. */
function bestAssign(people, song){
  var parts = song.parts;
  if (!people.length || !parts.length) return null;

  var covered = Math.min(1, people.length / parts.length);
  var best = null;

  arrangements(people.length, parts.length).forEach(function(arr){
    var rows = arr.map(function(pi, i){
      var f = partFit(people[i], parts[pi]);
      return { person: people[i], part: parts[pi], partIndex: pi,
               fit: f.fit, detail: f };
    });
    var vals = rows.map(function(r){ return r.fit; });
    var weakest = Math.min.apply(null, vals);
    var avg = vals.reduce(function(a,b){ return a+b; }, 0) / vals.length;
    var total = (0.6 * weakest + 0.4 * avg) * covered;

    if (!best || total > best.total) {
      best = { rows: rows, weakest: weakest, avg: avg,
               covered: covered, total: total };
    }
  });
  return best;
}

/* 점수 구간을 말로. -- 경계값 역시 설계값입니다. */
function verdictOf(score){
  if (score >= 75) return { key:'full',  label:'끝까지 갈 수 있음' };
  if (score >= 60) return { key:'tight', label:'갈 수 있지만 한쪽이 빠듯함' };
  if (score >= 40) return { key:'risky', label:'아슬아슬함' };
  return                   { key:'no',    label:'이 곡은 어려움' };
}

/* 가장 약한 고리를 사람 말로 설명한다 */
function weakestReason(best){
  var w = best.rows.reduce(function(a, b){ return b.fit < a.fit ? b : a; });
  var d = w.detail, who = w.person.name, part = w.part.name;

  if (!d.reachLo)
    return who + ' 이(가) ' + part + ' 최저음 ' + noteName(w.part.lo)
         + ' 을(를) ' + (-d.marginLo) + '반음 못 내려갑니다';
  if (!d.reachHi)
    return who + ' 이(가) ' + part + ' 최고음 ' + noteName(w.part.hi)
         + ' 을(를) ' + (-d.marginHi) + '반음 못 올라갑니다';
  if (d.tess < 0.6)
    return who + ' 의 편한 구간이 ' + part + ' 가 오래 머무는 자리와 '
         + Math.round(d.tess * 100) + '% 만 겹칩니다';
  if (d.strain > 0)
    return part + ' 는 꼭대기에 오래 머무는데 ' + who + ' 의 천장이 빠듯합니다';
  return who + ' 이(가) ' + part + ' 를 여유 있게 맡습니다';
}

/* 빈 파트가 남지 않았는가. 사람 수가 파트 수보다 적으면 못 채운다. */
function people_covers_all(best, song){
  return best.rows.length >= song.parts.length;
}

/* 두 사람 + 한 곡 -> 판정 한 장 */
function matchPair(me, you, song){
  var best = bestAssign([me, you], song);
  if (!best) return null;
  var score = Math.round(best.total * 100);

  // 두 사람의 편한 구간 한가운데가 몇 반음 떨어져 있는가.
  // 점수에는 안 쓴다. 왜 이렇게 갈렸는지 보여주는 값이다.
  var cMe  = (me.lo90  + me.hi90)  / 2;
  var cYou = (you.lo90 + you.hi90) / 2;

  // 거름망은 이 값으로 한다.
  // 맡은 파트의 음 하나라도 못 내면 곡이 안 끝난다. 점수와 상관없이 탈락이다.
  var complete = best.rows.every(function(r){ return r.detail.canSing; })
              && people_covers_all(best, song);

  return {
    me: me, you: you, song: song,
    complete: complete,
    miss: best.rows.filter(function(r){ return !r.detail.canSing; }),
    score: score,
    verdict: verdictOf(score),
    rows: best.rows,
    weakest: best.weakest,
    avg: best.avg,
    covered: best.covered,
    gap: Math.round(Math.abs(cMe - cYou)),
    reason: weakestReason(best)
  };
}

/* ── 조옮김 ──────────────────────────────────
 * 곡 전체를 반음 단위로 올리거나 내린다.
 * 원조성이 CPDL 합창 악보라서 베이스 최저음이 G2 다.
 * 아마추어에게는 너무 낮아서 그대로 두면 대부분 탈락한다. */
function transpose(song, semi){
  if (!semi) return song;
  return {
    title: song.title,
    semi: semi,
    parts: song.parts.map(function(p){
      return { name: p.name, lo: p.lo + semi, hi: p.hi + semi,
               lo90: p.lo90 + semi, hi90: p.hi90 + semi,
               highRatio: p.highRatio };
    })
  };
}

/* 이 사람들이 부를 수 있는 조성 중 원조성에서 가장 가까운 것을 찾는다.
 * 같은 거리면 올리는 쪽을 먼저 본다. 대개 내리는 것보다 부담이 적다.
 * -- 올리는 쪽을 먼저 보는 건 제가 정한 순서입니다. */
function bestKey(people, song, span){
  span = span == null ? 7 : span;              // 기본 ±7반음 (5도)
  var order = [0], i;
  for (i = 1; i <= span; i++) order.push(i, -i);
  for (i = 0; i < order.length; i++){
    var t = transpose(song, order[i]);
    var m = bestAssign(people, t);
    if (m && m.rows.every(function(r){ return r.detail.canSing; })
          && people.length >= t.parts.length)
      return { semi: order[i], song: t, assign: m };
  }
  return null;                                  // 어느 조성으로도 못 부른다
}

/* 후보 여러 명을 점수 순으로.
 * span 을 주면 조옮김을 허용한다. 0 이면 원조성만 본다. */
function rankCandidates(me, candidates, song, span){
  return candidates
    .map(function(c){
      var key = span ? bestKey([me, c], song, span) : null;
      var m = matchPair(me, c, key ? key.song : song);
      if (m) { m.semi = key ? key.semi : 0; m.original = song; }
      return m;
    })
    .filter(Boolean)
    .sort(function(a, b){ return b.score - a.score; });
}

return {
  noteName: noteName,
  overlap: overlap,
  marginScore: marginScore,
  partFit: partFit,
  arrangements: arrangements,
  bestAssign: bestAssign,
  verdictOf: verdictOf,
  transpose: transpose,
  bestKey: bestKey,
  matchPair: matchPair,
  rankCandidates: rankCandidates
};
});
