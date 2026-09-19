/* 이음 — 음색 엔진
 *
 * 화면을 전혀 건드리지 않는다. 소리를 넣으면 숫자가 나온다.
 * match.js 와 짝이다. match.js 가 "부를 수 있나"를 보고,
 * 이 파일이 "겹쳤을 때 어떻게 되나"를 본다.
 *
 * 들어가는 것: Float32Array (-1~1 파형) + 표본율(Hz)
 *
 * 재는 것 두 가지
 *  1) 가림(mask)  — 두 목소리의 에너지가 같은 주파수 자리에 몰려 있는가.
 *                   몰려 있으면 섞었을 때 서로를 덮어서 뭉개진다.
 *                   사람 귀가 주파수를 묶어 듣는 단위(임계대역, Bark)로 나눠서 잰다.
 *  2) 결(texture) — 기본음 대비 배음이 어떤 모양으로 깔리는가.
 *                   음 높이를 지워낸 뒤의 소리 성질이다.
 *
 * 가림은 물리다. 둘 다 들리느냐 아니냐라서 취향이 안 들어간다.
 * 결은 잰 값만 내놓는다. 어느 쪽이 좋은지는 곡이 정한다.
 */
(function (root, factory) {
  var T = factory();
  if (typeof module === 'object' && module.exports) module.exports = T;
  root.Timbre = T;
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

/* Zwicker 임계대역 경계 (Hz). 사람 귀가 소리를 묶어 듣는 단위다. */
var BARK = [20,100,200,300,400,510,630,770,920,1080,1270,1480,1720,2000,
            2320,2700,3150,3700,4400,5300,6400,7700,9500,12000,15500];
var NB = BARK.length - 1;   // 24 대역
var NH = 8;                 // 배음 8개까지 본다

/* 제자리 FFT (Cooley-Tukey). 길이는 2의 거듭제곱이어야 한다. */
function fft(re, im){
  var n = re.length, i, j, bit, len, ang, wr, wi, cr, ci, ur, ui, vr, vi, ncr, t;
  for (i = 1, j = 0; i < n; i++){
    for (bit = n >> 1; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j){ t = re[i]; re[i] = re[j]; re[j] = t;
                t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (len = 2; len <= n; len <<= 1){
    ang = -2 * Math.PI / len;
    wr = Math.cos(ang); wi = Math.sin(ang);
    for (i = 0; i < n; i += len){
      cr = 1; ci = 0;
      for (j = 0; j < len / 2; j++){
        ur = re[i+j];            ui = im[i+j];
        vr = re[i+j+len/2]*cr - im[i+j+len/2]*ci;
        vi = re[i+j+len/2]*ci + im[i+j+len/2]*cr;
        re[i+j] = ur + vr;       im[i+j] = ui + vi;
        re[i+j+len/2] = ur - vr; im[i+j+len/2] = ui - vi;
        ncr = cr*wr - ci*wi; ci = cr*wi + ci*wr; cr = ncr;
      }
    }
  }
}

/* 소리 한가운데를 잘라 크기 스펙트럼을 낸다 */
function spectrum(data, sr, N){
  N = N || 8192;
  var mid = Math.floor(data.length / 2);
  var s = Math.max(0, Math.min(data.length - N, mid - N / 2));
  var re = new Float64Array(N), im = new Float64Array(N), i, v;
  for (i = 0; i < N; i++){
    v = data[s + i] || 0;
    re[i] = v * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)));  // Hann 창
  }
  fft(re, im);
  var half = N / 2, mag = new Float64Array(half);
  for (i = 0; i < half; i++) mag[i] = Math.sqrt(re[i]*re[i] + im[i]*im[i]);
  return { mag: mag, binHz: sr / N };
}

/* 자기상관으로 기본음 높이 */
function pitchOf(data, sr){
  var N = 2048, mid = Math.floor(data.length / 2);
  var s = Math.max(0, Math.min(data.length - N, mid - N / 2));
  var buf = data.subarray ? data.subarray(s, s + N) : data.slice(s, s + N);
  var c = new Float64Array(N), i, j, a;
  for (i = 0; i < N; i++){ a = 0; for (j = 0; j < N - i; j++) a += buf[j] * buf[j+i]; c[i] = a; }
  var d = 0; while (d < N - 1 && c[d] > c[d+1]) d++;
  var mv = -1, mp = -1;
  for (i = d; i < N; i++) if (c[i] > mv){ mv = c[i]; mp = i; }
  if (mp <= 0) return 0;
  var x1 = c[mp-1], x2 = c[mp], x3 = c[mp+1];
  var aa = (x1 + x3 - 2*x2) / 2, bb = (x3 - x1) / 2, T = mp;
  if (aa) T = T - bb / (2 * aa);
  var f = sr / T;
  return (f > 50 && f < 1200) ? f : 0;
}

/* 소리 하나에서 음색 값 뽑기 */
function features(data, sr){
  var sp = spectrum(data, sr);
  var mag = sp.mag, binHz = sp.binHz, i, b, k;

  // 임계대역별 에너지 -> 합이 1 이 되게
  var bark = new Array(NB); for (i = 0; i < NB; i++) bark[i] = 0;
  for (i = 1; i < mag.length; i++){
    var f = i * binHz;
    if (f < BARK[0] || f >= BARK[NB]) continue;
    for (b = 0; b < NB; b++) if (f >= BARK[b] && f < BARK[b+1]){ bark[b] += mag[i] * mag[i]; break; }
  }
  var bsum = 0; for (i = 0; i < NB; i++) bsum += bark[i];
  if (bsum > 0) for (i = 0; i < NB; i++) bark[i] /= bsum;

  // 배음 모양 -> 음 높이를 지운 뒤의 소리 성질
  var f0 = pitchOf(data, sr);
  var harm = new Array(NH); for (k = 0; k < NH; k++) harm[k] = 0;
  if (f0 > 0){
    for (k = 1; k <= NH; k++){
      var c = Math.round(k * f0 / binHz), lo = Math.max(1, c - 2), hi = Math.min(mag.length - 1, c + 2), m = 0;
      for (i = lo; i <= hi; i++) if (mag[i] > m) m = mag[i];
      harm[k-1] = m;
    }
    var hsum = 0; for (k = 0; k < NH; k++) hsum += harm[k];
    if (hsum > 0) for (k = 0; k < NH; k++) harm[k] /= hsum;
  }

  // 밝기 = 스펙트럼 무게중심(Hz), 거칠기 = 고역 비율
  var num = 0, den = 0;
  for (i = 1; i < mag.length; i++){ var e = mag[i] * mag[i]; num += e * i * binHz; den += e; }
  var centroid = den > 0 ? num / den : 0;
  var hiE = 0; for (b = 16; b < NB; b++) hiE += bark[b];   // 3150Hz 위

  // SPR (Singing Power Ratio) — 2~4kHz 의 제일 큰 봉우리와
  // 0~2kHz 의 제일 큰 봉우리의 비를 dB 로. 목소리가 얼마나 뻗는가에 해당한다.
  // 듀엣 블렌드 연구가 쓴 네 값 중 하나다.
  var pLo = 0, pHi = 0;
  for (i = 1; i < mag.length; i++){
    var fz = i * binHz, e2 = mag[i] * mag[i];
    if (fz < 2000){ if (e2 > pLo) pLo = e2; }
    else if (fz < 4000){ if (e2 > pHi) pHi = e2; }
  }
  var spr = (pLo > 0 && pHi > 0) ? 10 * Math.log10(pHi / pLo) : -60;

  // 역할을 가르는 데 쓰는 값들
  var lowE = 0;  for (b = 0;  b < 6;  b++) lowE += bark[b];    // ~510Hz  두께
  var midE = 0;  for (b = 9;  b < 16; b++) midE += bark[b];    // 1080~3150Hz 중음
  var even = evenness(bark);                                   // 고르게 퍼져 있는가
  // 밀도 = 위쪽 배음이 얼마나 살아 있는가 (5~8배음 / 1~4배음)
  var h14 = harm[0]+harm[1]+harm[2]+harm[3];
  var h58 = harm[4]+harm[5]+harm[6]+harm[7];
  var density = (h14 + h58) > 0 ? h58 / (h14 + h58) : 0;

  var env = envelope(data, sr);

  return { f0: f0, bark: bark, harm: harm, centroid: centroid, rough: hiE, spr: spr,
           low: lowE, mid: midE, even: even, density: density,
           attack: env.attack, release: env.release, steady: env.steady, hold: env.hold };
}

/* ── 역할 ────────────────────────────────────
 * 사용자가 세운 가설이다. 목소리마다 어울리는 자리가 있고,
 * 그 자리의 조합이 궁합을 가른다는 생각이다.
 *
 *   받침     낮고 밀도 높은 소리
 *   윗화음   가볍고 호흡이 긴 소리
 *   중간화음 균형 잡힌 중음
 *   메인     선명한 중음
 *
 * -- 어느 값을 어떻게 섞어 역할을 매기는지는 **제가 짠 것이고 실측이 아닙니다.**
 *    사람이 매긴 역할 라벨이 한 건도 없어서 맞는지 확인할 방법이 아직 없습니다. */
var ROLES = ['메인', '받침', '윗화음', '중간화음'];

function roles(f){
  var light = 1 - f.low;
  var longBreath = Math.min(1, f.hold / 0.45);        // 길게 끄는가
  var raw = {
    '메인':     0.70 * f.mid  + 0.30 * (1 - f.rough),
    '받침':     0.60 * f.low  + 0.40 * f.density,
    '윗화음':   0.60 * light  + 0.40 * longBreath,
    '중간화음': 0.70 * f.even + 0.30 * f.steady
  };
  var s = 0, k;
  for (k in raw) s += raw[k];
  var out = {}, top = ROLES[0];
  for (k in raw){ out[k] = s > 0 ? raw[k] / s : 0; if (out[k] > out[top]) top = k; }
  return { share: out, top: top };
}

/* 역할 조합이 맞물리는가 (0~1).
 * 같은 자리를 둘이 차지하면 곡이 안 서고, 다른 자리면 채워진다.
 * -- 이 표의 숫자도 실측이 아니라 가설을 옮겨 적은 것입니다. */
var ROLE_PAIR = {
  '메인|받침':       1.00,
  '메인|윗화음':     0.90,
  '메인|중간화음':   0.85,
  '받침|윗화음':     0.60,
  '받침|중간화음':   0.55,
  '윗화음|중간화음': 0.50,
  '메인|메인':       0.25,
  '받침|받침':       0.30,
  '윗화음|윗화음':   0.35,
  '중간화음|중간화음': 0.40
};
function rolePair(ra, rb){
  var a = ra.top, b = rb.top;
  var k1 = a + '|' + b, k2 = b + '|' + a;
  var v = ROLE_PAIR[k1] != null ? ROLE_PAIR[k1] : ROLE_PAIR[k2];
  return {
    a: a, b: b,
    fit: v == null ? 0.5 : v,
    same: a === b,
    label: a === b ? ('둘 다 ' + a + ' 자리') : (a + ' + ' + b)
  };
}

/* 두 분포가 얼마나 같은 자리에 있는가 (0~1). 히스토그램 교집합. */
function intersect(a, b){
  var s = 0, i;
  for (i = 0; i < a.length; i++) s += Math.min(a[i], b[i]);
  return s;
}

/* ── 시간축 ───────────────────────────────────
 * 어택(소리가 서는 데 걸리는 시간), 잔향(꺼지는 데 걸리는 시간),
 * 유지(가운데 구간이 얼마나 고른가). 스펙트럼으로는 안 잡히는 값들이다. */
function envelope(data, sr){
  var N = data.length, i, W = Math.max(1, Math.round(sr * 0.005));   // 5ms 칸
  var env = [], s, k, a;
  for (i = 0; i + W <= N; i += W){
    s = 0; for (k = 0; k < W; k++){ a = data[i+k]; s += a * a; }
    env.push(Math.sqrt(s / W));
  }
  if (!env.length) return { attack: 0, release: 0, steady: 0, hold: 0 };
  var pk = 0; for (i = 0; i < env.length; i++) if (env[i] > pk) pk = env[i];
  if (pk <= 0) return { attack: 0, release: 0, steady: 0, hold: 0 };

  var half = pk * 0.5;
  var a1 = 0; while (a1 < env.length && env[a1] < half) a1++;          // 서는 지점
  var r1 = env.length - 1; while (r1 > 0 && env[r1] < half) r1--;      // 꺼지기 시작
  var attack  = a1 * W / sr * 1000;                                    // ms
  var release = (env.length - 1 - r1) * W / sr * 1000;                 // ms

  // 가운데 구간(소리가 서 있는 동안)의 고름. 변동이 작을수록 1 에 가깝다.
  var m = 0, n = 0;
  for (i = a1; i <= r1; i++){ m += env[i]; n++; }
  var steady = 0, hold = n * W / sr;
  if (n > 2){
    m /= n;
    var v = 0;
    for (i = a1; i <= r1; i++) v += (env[i] - m) * (env[i] - m);
    v = Math.sqrt(v / n);
    steady = m > 0 ? Math.max(0, 1 - v / m) : 0;
  }
  return { attack: attack, release: release, steady: steady, hold: hold };
}

/* 분포가 얼마나 고른가 (0~1). 한쪽에 몰려 있으면 0 에 가깝다. */
function evenness(p){
  var h = 0, i, n = 0;
  for (i = 0; i < p.length; i++) if (p[i] > 0){ h -= p[i] * Math.log(p[i]); n++; }
  return n > 1 ? h / Math.log(p.length) : 0;
}

/* 결 차이의 10분위 — 목소리 123개로 만든 쌍 7,503개에서 잰 값이다.
 * 점수를 0~100 으로 펴는 데 쓴다.
 * 이게 없으면 이론상 최대치(1.0)로 나누게 되는데,
 * 실제로는 0.56 을 넘지 않아서 아무도 높은 점수를 못 받는다. */
var TEX_DECILE = [0, 0.0344, 0.0754, 0.0907, 0.1460, 0.1651,
                  0.2216, 0.2668, 0.3070, 0.3805, 0.5576];
var TEX_N = 7503;

/* 결 차이 -> 전체 쌍 중 몇 %에 해당하는가 (0~1) */
function texPercentile(t){
  var d = TEX_DECILE, i;
  if (t <= d[0]) return 0;
  if (t >= d[10]) return 1;
  for (i = 1; i <= 10; i++)
    if (t <= d[i]) return ((i - 1) + (t - d[i-1]) / (d[i] - d[i-1] || 1)) / 10;
  return 1;
}

/* 두 목소리를 겹치면 어떻게 되는가
 *
 * 축이 둘인데 하는 일이 다르다. 실측으로 확인한 내용이다.
 *
 *   가림(mask)  음역과 음색을 못 가른다.
 *               실측: 1옥타브 차이 0.481 / 같은 높이에 결만 다름 0.480. 같은 값이다.
 *               줄 세우기에 쓰면 음높이로 줄 세우는 꼴이라, 여기서는
 *               "겹쳐 들으면 둘 다 들리나" 에만 쓴다.
 *
 *   결(texture) 음높이를 지운다.
 *               실측: 결은 같고 음높이만 다른 쌍 178개에서
 *                     중앙값 0.0304 · 95% 0.0377 · 최대 0.0902.
 *               줄 세우기는 이쪽으로 한다.
 *
 * mode
 *   'blend'    닮을수록 높다. (기본값)
 *              근거: 듀엣 보이스매칭 연구 — 가수 14명, 지휘자 평가자 48명.
 *              네 값(SPR·비브라토 속도·폭·감소)이 블렌드 인식의 79% 를 설명했고,
 *              닮은 목소리끼리가 더 잘 섞였다.
 *   'contrast' 갈릴수록 높다.
 *              근거 없음. 두 목소리가 구별돼야 한다는 기획 전제를 쓸 때만.
 */
function blend(a, b, mode){
  mode = mode || 'blend';
  var mask = intersect(a.bark, b.bark);                 // 0~1, 클수록 서로 덮는다
  var tex  = 0, k;
  for (k = 0; k < NH; k++) tex += Math.abs(a.harm[k] - b.harm[k]);
  tex = tex / 2;                                        // 0~1, 클수록 결이 다르다

  // 기본음을 못 잡았으면 결을 못 잰다. 조용하거나 잡음이 많은 녹음에서 생긴다.
  // 이때 harm 이 전부 0 이라 결 차이가 가짜로 0.5 가 나온다. 점수를 내면 안 된다.
  var ok = a.f0 > 0 && b.f0 > 0;
  var pct = texPercentile(tex);                         // 0 = 가장 닮음, 1 = 가장 다름
  var score = !ok ? null
            : Math.round((mode === 'contrast' ? pct : 1 - pct) * 100);

  return {
    mode: mode,
    ok: ok,
    mask: mask,
    texture: tex,
    percentile: pct,
    sprGap: Math.abs(a.spr - b.spr),
    centroidGap: Math.abs(a.centroid - b.centroid),
    score: score,
    // 겹쳐 들었을 때 둘 다 들리는가 — 가림은 여기에만 쓴다
    audible: mask <= 0.35 ? '둘 다 또렷함' : mask <= 0.55 ? '조금 겹침' : '서로 덮음',
    label: !ok ? '기본음을 못 잡아 잴 수 없음'
         : tex <= 0.075 ? '결이 거의 같음'
         : tex <= 0.166 ? '가까움'
         : tex <= 0.307 ? '조금 갈림'
         : '뚜렷하게 갈림'
  };
}

/* 소리 만들기 — 마이크 없이 검사하려고 둔다.
 * 같은 값을 넣으면 언제나 같은 파형이 나온다. */
function synth(opt){
  var sr   = opt.sr    || 22050;
  var dur  = opt.dur   || 0.6;
  var f0   = opt.f0    || 220;
  var roll = opt.roll  != null ? opt.roll : 0.7;   // 작을수록 배음이 빨리 죽는다 = 어두움
  var noise= opt.noise != null ? opt.noise : 0.0;  // 바람소리 = 거칠기
  var vib  = opt.vib   != null ? opt.vib : 0.0;    // 떨림 폭(반음)
  var atk  = opt.atk   != null ? opt.atk : 0.05;   // 소리가 서는 데 걸리는 시간(초)
  var rel  = opt.rel   != null ? opt.rel : 0.05;   // 꺼지는 데 걸리는 시간(초)
  var n = Math.floor(sr * dur), out = new Float32Array(n);
  var seed = opt.seed || 1;
  var rnd = function(){ seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };
  for (var i = 0; i < n; i++){
    var t = i / sr;
    var f = f0 * Math.pow(2, vib * Math.sin(2 * Math.PI * 5.5 * t) / 12);
    var v = 0, amp = 1;
    for (var k = 1; k <= 24; k++){
      if (k * f > sr / 2) break;
      v += amp * Math.sin(2 * Math.PI * k * f * t);
      amp *= roll;
    }
    var env = Math.min(1, t / atk) * Math.min(1, (dur - t) / rel);
    out[i] = (v * 0.25 + noise * rnd()) * Math.max(0, env);
  }
  // 최대치를 0.9 로 맞춘다
  var pk = 0; for (i = 0; i < n; i++) pk = Math.max(pk, Math.abs(out[i]));
  if (pk > 0) for (i = 0; i < n; i++) out[i] = out[i] / pk * 0.9;
  return { data: out, sr: sr };
}

return {
  BARK: BARK, NB: NB, NH: NH, ROLES: ROLES, ROLE_PAIR: ROLE_PAIR,
  TEX_DECILE: TEX_DECILE, TEX_N: TEX_N,
  fft: fft, spectrum: spectrum, pitchOf: pitchOf, texPercentile: texPercentile,
  envelope: envelope, evenness: evenness, roles: roles, rolePair: rolePair,
  features: features, intersect: intersect, blend: blend, synth: synth
};
});
