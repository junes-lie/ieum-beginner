/* 이음 — 취향 맞춤 엔진
 *
 * 소리를 안 본다. 사람이 앱에 남긴 것만 본다.
 * 그래서 녹음이 없어도 계산된다. match.js · timbre.js 와 같은 모양이다.
 *
 * 사람
 *   {
 *     id, name,
 *     genres: { 'K-POP':0.4, '발라드':0.3, ... },   // 합이 1 이 되게
 *     liked:  ['s1','s2', ...],                     // 저장하거나 좋아한 곡
 *     sing:   ['s1','s5', ...],                     // 부를 수 있는 곡 (음역 통과)
 *     form:   'duet' | 'choir' | 'acappella',       // 원하는 편성
 *     role:   '메인' | '받침' | '윗화음' | '중간화음' // 맡고 싶은 자리
 *   }
 *
 * -- 아래 항목별 무게(장르 0.30 …)와 문구가 나오는 기준값은
 *    제가 정한 설계값입니다. 실제 반응 데이터가 없습니다.
 *    추천 문구의 말투는 기존 후보 데이터에 있던 것을 그대로 따랐습니다.
 */
(function (root, factory) {
  var T = factory();
  if (typeof module === 'object' && module.exports) module.exports = T;
  root.Taste = T;
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

var FORM_NAME = { duet:'듀엣', choir:'합창', acappella:'아카펠라' };

/* 두 역할이 맞물리는가. 같은 자리를 원하면 부딪힌다. */
var ROLE_WISH = {
  '메인|받침':1.00, '메인|윗화음':0.90, '메인|중간화음':0.85,
  '받침|윗화음':0.65, '받침|중간화음':0.60, '윗화음|중간화음':0.55,
  '메인|메인':0.20, '받침|받침':0.35, '윗화음|윗화음':0.40, '중간화음|중간화음':0.45
};

/* 목록 두 개가 얼마나 겹치는가 (0~1) */
function jaccard(a, b){
  if (!a || !b || !a.length || !b.length) return 0;
  var set = {}, i, hit = 0;
  for (i = 0; i < a.length; i++) set[a[i]] = 1;
  for (i = 0; i < b.length; i++) if (set[b[i]]) hit++;
  return hit / (a.length + b.length - hit);
}
function shared(a, b){
  if (!a || !b) return [];
  var set = {}, i, out = [];
  for (i = 0; i < a.length; i++) set[a[i]] = 1;
  for (i = 0; i < b.length; i++) if (set[b[i]]) out.push(b[i]);
  return out;
}

/* 장르 분포가 얼마나 닮았는가 (0~1). 코사인 유사도. */
function genreSim(ga, gb){
  if (!ga || !gb) return 0;
  var k, da = 0, db = 0, dot = 0;
  for (k in ga) da += ga[k] * ga[k];
  for (k in gb) db += gb[k] * gb[k];
  for (k in ga) if (gb[k]) dot += ga[k] * gb[k];
  return (da > 0 && db > 0) ? dot / Math.sqrt(da * db) : 0;
}

/* 둘 다 많이 듣는 장르를 센 순서로 */
function topShared(ga, gb, n){
  if (!ga || !gb) return [];
  var out = [], k;
  for (k in ga) if (gb[k]) out.push({ name:k, v: Math.min(ga[k], gb[k]) });
  out.sort(function(x, y){ return y.v - x.v; });
  return out.slice(0, n || 2);
}

/* 두 사람의 취향이 얼마나 맞는가 */
function tasteMatch(me, you){
  var g    = genreSim(me.genres, you.genres);
  var like = jaccard(me.liked, you.liked);
  var both = shared(me.sing, you.sing);
  var song = Math.min(1, both.length / 10);           // 10곡이면 꽉 찬 것으로 본다
  var form = me.form && you.form && me.form === you.form ? 1 : 0;

  var wish = 0.5;
  if (me.role && you.role){
    var k1 = me.role + '|' + you.role, k2 = you.role + '|' + me.role;
    wish = ROLE_WISH[k1] != null ? ROLE_WISH[k1]
         : ROLE_WISH[k2] != null ? ROLE_WISH[k2] : 0.5;
  }

  var score = Math.round((0.30 * g + 0.20 * like + 0.25 * song
                        + 0.10 * form + 0.15 * wish) * 100);

  return {
    score: score,
    genre: g, liked: like, songs: both, form: form === 1, wish: wish,
    topGenres: topShared(me.genres, you.genres, 2),
    reasons: reasonsOf(me, you, g, like, both, form, wish)
  };
}

/* 카드에 띄울 한 줄짜리 이유들.
 * 말투는 기존 후보 데이터에 있던 문구를 그대로 따랐습니다.
 * 나오는 기준값(0.6 · 0.25 · 3곡 …)은 제가 정한 것입니다. */
function reasonsOf(me, you, g, like, both, form, wish){
  var out = [], tg = topShared(me.genres, you.genres, 2);

  if (both.length >= 3)
    out.push('함께 부르기 좋은 곡이 ' + both.length + '개 있어요');
  if (g >= 0.75)
    out.push('자주 부르는 장르가 비슷해요');
  else if (g >= 0.55 && tg.length)
    out.push(tg[0].name + ' 취향이 비슷해요');
  else if (tg.length && tg[0].v >= 0.2)
    out.push(tg[0].name + ' 취향이 겹쳐요');
  if (like >= 0.25)
    out.push('저장해 둔 곡이 겹쳐요');
  if (form === 1 && me.form)
    out.push(FORM_NAME[me.form] + '을(를) 둘 다 원해요');
  if (wish >= 0.85 && me.role !== you.role)
    out.push('맡고 싶은 자리가 ' + me.role + ' 와(과) ' + you.role + ' 로 갈려요');
  else if (me.role && me.role === you.role)
    out.push('둘 다 ' + me.role + ' 을(를) 맡고 싶어 해요');

  return out;
}

/* 후보 여러 명 */
function rank(me, list){
  return list.map(function(c){
    var t = tasteMatch(me, c);
    t.you = c;
    return t;
  }).sort(function(a, b){ return b.score - a.score; });
}

return {
  FORM_NAME: FORM_NAME, ROLE_WISH: ROLE_WISH,
  jaccard: jaccard, shared: shared, genreSim: genreSim, topShared: topShared,
  tasteMatch: tasteMatch, rank: rank
};
});
