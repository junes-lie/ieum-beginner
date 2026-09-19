/* 이음 — MIDI 엔진 (읽기 · 쓰기 · 가사)
 *
 * 화면을 전혀 건드리지 않는다. 값을 넣으면 바이트가 나오고, 바이트를 넣으면 값이 나온다.
 *
 * MIDI 에는 음표 말고 글자를 넣는 자리가 따로 있다. 가사는 0xFF 0x05 다.
 * 음표마다 글자를 하나씩 붙여 두면 노래방처럼 흐르게 만들 수 있다.
 *
 * 한글은 UTF-8 로 넣는다. 규격 문서는 ASCII 를 말하지만 요즘 프로그램은
 * UTF-8 을 읽는다. 읽기도 UTF-8 로 되돌리므로 이 엔진 안에서는 왕복이 맞는다.
 *
 * 곡 모양
 *   { ppq, bpm, tracks: [ { name, channel,
 *                           notes:  [{ midi, tick, dur, vel }],
 *                           lyrics: [{ tick, text }] } ] }
 */
(function (root, factory) {
  var M = factory();
  if (typeof module === 'object' && module.exports) module.exports = M;
  root.Midi = M;
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

/* ── 쓰기 ─────────────────────────────────── */

/* 가변 길이 수 — MIDI 가 시간 간격을 적는 방식.
   7비트씩 끊어 담고, 마지막 바이트만 최상위 비트가 0 이다. */
function vlq(n){
  var out = [n & 0x7F];
  n >>= 7;
  while (n > 0){ out.unshift((n & 0x7F) | 0x80); n >>= 7; }
  return out;
}

function str2utf8(s){
  var out = [], i, c;
  for (i = 0; i < s.length; i++){
    c = s.codePointAt(i);
    if (c > 0xFFFF) i++;                       // 서로게이트 쌍은 두 칸을 쓴다
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xC0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 63),
                  0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}
function utf82str(b, s, len){
  var out = '', i = s, end = s + len, c;
  while (i < end){
    c = b[i];
    if (c < 0x80){ out += String.fromCharCode(c); i += 1; }
    else if ((c & 0xE0) === 0xC0){ out += String.fromCharCode(((c & 31) << 6) | (b[i+1] & 63)); i += 2; }
    else if ((c & 0xF0) === 0xE0){
      out += String.fromCharCode(((c & 15) << 12) | ((b[i+1] & 63) << 6) | (b[i+2] & 63)); i += 3; }
    else {
      var cp = ((c & 7) << 18) | ((b[i+1] & 63) << 12) | ((b[i+2] & 63) << 6) | (b[i+3] & 63);
      out += String.fromCodePoint(cp); i += 4;
    }
  }
  return out;
}

function chunk(tag, body){
  var out = [], i;
  for (i = 0; i < 4; i++) out.push(tag.charCodeAt(i));
  out.push((body.length >> 24) & 255, (body.length >> 16) & 255,
           (body.length >> 8) & 255, body.length & 255);
  return out.concat(body);
}

function write(song){
  var ppq = song.ppq || 480;
  var bpm = song.bpm || 90;
  var tracks = song.tracks || [];

  // 0번 트랙은 빠르기와 박자만 담는다. 그래야 프로그램마다 똑같이 읽는다.
  var head = [];
  var uspq = Math.round(60000000 / bpm);       // 4분음표 하나가 몇 마이크로초인가
  head = head.concat(vlq(0), [0xFF, 0x51, 0x03,
    (uspq >> 16) & 255, (uspq >> 8) & 255, uspq & 255]);
  head = head.concat(vlq(0), [0xFF, 0x58, 0x04, 4, 2, 24, 8]);   // 4/4
  if (song.title){
    var tb = str2utf8(song.title);
    head = head.concat(vlq(0), [0xFF, 0x03], vlq(tb.length), tb);
  }
  head = head.concat(vlq(0), [0xFF, 0x2F, 0x00]);

  var out = chunk('MThd', [0, 1, 0, 0, (tracks.length + 1) >> 8, (tracks.length + 1) & 255,
                           (ppq >> 8) & 255, ppq & 255]);
  // 트랙 수를 방금 넣었으니 division 자리를 맞춘다
  out[10] = (tracks.length + 1) >> 8; out[11] = (tracks.length + 1) & 255;
  out[12] = (ppq >> 8) & 255; out[13] = ppq & 255;
  out.length = 14;
  out = out.concat(chunk('MTrk', head));

  tracks.forEach(function(tr, ti){
    var ch = tr.channel != null ? tr.channel : ti;
    var ev = [];                                // {tick, order, bytes}
    if (tr.name){
      var nb = str2utf8(tr.name);
      ev.push({ tick: 0, order: 0, bytes: [0xFF, 0x03].concat(vlq(nb.length), nb) });
    }
    (tr.lyrics || []).forEach(function(l){
      var lb = str2utf8(l.text);
      // 가사는 같은 자리의 음표보다 먼저 적는다. 읽는 쪽이 글자를 먼저 집는다.
      ev.push({ tick: l.tick, order: 1, bytes: [0xFF, 0x05].concat(vlq(lb.length), lb) });
    });
    (tr.notes || []).forEach(function(n){
      ev.push({ tick: n.tick, order: 2,
                bytes: [0x90 | ch, n.midi & 127, (n.vel || 80) & 127] });
      ev.push({ tick: n.tick + n.dur, order: 0,
                bytes: [0x80 | ch, n.midi & 127, 0] });
    });
    ev.sort(function(a, b){ return a.tick - b.tick || a.order - b.order; });

    var body = [], last = 0;
    ev.forEach(function(e){
      body = body.concat(vlq(e.tick - last), e.bytes);
      last = e.tick;
    });
    body = body.concat(vlq(0), [0xFF, 0x2F, 0x00]);
    out = out.concat(chunk('MTrk', body));
  });
  return new Uint8Array(out);
}

/* ── 읽기 ─────────────────────────────────── */

function read(bytes){
  var b = bytes, p = 0;
  function u32(){ var v = (b[p]<<24)|(b[p+1]<<16)|(b[p+2]<<8)|b[p+3]; p += 4; return v >>> 0; }
  function u16(){ var v = (b[p]<<8)|b[p+1]; p += 2; return v; }
  function tag(){ var s = ''; for (var i = 0; i < 4; i++) s += String.fromCharCode(b[p+i]); p += 4; return s; }
  function vl(){ var v = 0, c; do { c = b[p++]; v = (v << 7) | (c & 0x7F); } while (c & 0x80); return v; }

  if (tag() !== 'MThd') throw new Error('MIDI 파일이 아닙니다');
  u32(); u16();
  var ntrk = u16(), ppq = u16();
  var bpm = 120, title = '', tracks = [];

  for (var t = 0; t < ntrk; t++){
    if (tag() !== 'MTrk') break;
    var len = u32(), end = p + len, tick = 0, status = 0;
    var notes = [], lyrics = [], on = {}, name = '';

    while (p < end){
      tick += vl();
      var byte = b[p];
      if (byte & 0x80){ status = byte; p++; }     // 아니면 앞 상태를 이어 쓴다(running status)
      var type = status & 0xF0;

      if (status === 0xFF){
        var meta = b[p++], ml = vl();
        if (meta === 0x51) bpm = 60000000 / ((b[p]<<16)|(b[p+1]<<8)|b[p+2]);
        else if (meta === 0x03){ var nm = utf82str(b, p, ml); if (t === 0) title = nm; else name = nm; }
        else if (meta === 0x05) lyrics.push({ tick: tick, text: utf82str(b, p, ml) });
        p += ml;
      }
      else if (status === 0xF0 || status === 0xF7){ var sl = vl(); p += sl; }
      else if (type === 0x90 || type === 0x80){
        var note = b[p], vel = b[p+1]; p += 2;
        if (type === 0x90 && vel > 0) (on[note] = on[note] || []).push({ tick: tick, vel: vel });
        else {
          var q = on[note];
          if (q && q.length){
            var s = q.shift();
            notes.push({ midi: note, tick: s.tick, dur: tick - s.tick, vel: s.vel });
          }
        }
      }
      else if (type === 0xC0 || type === 0xD0) p += 1;
      else p += 2;
    }
    p = end;
    notes.sort(function(x, y){ return x.tick - y.tick || x.midi - y.midi; });
    if (notes.length || lyrics.length || name) tracks.push({ name: name, notes: notes, lyrics: lyrics });
  }
  return { ppq: ppq, bpm: Math.round(bpm * 100) / 100, title: title, tracks: tracks };
}

/* 가사 글자를 음표에 붙여 "언제 어느 글자" 목록으로. 노래방 화면이 쓴다. */
function syncLyrics(track, ppq, bpm){
  var secPerTick = 60 / (bpm * ppq);
  return (track.lyrics || []).map(function(l, i, arr){
    var next = arr[i+1] ? arr[i+1].tick : null;
    var n = null, j;
    for (j = 0; j < track.notes.length; j++)
      if (track.notes[j].tick === l.tick){ n = track.notes[j]; break; }
    return {
      text: l.text,
      tick: l.tick,
      time: l.tick * secPerTick,
      end: (next != null ? next : (n ? l.tick + n.dur : l.tick)) * secPerTick,
      midi: n ? n.midi : null
    };
  });
}

return { write: write, read: read, vlq: vlq, syncLyrics: syncLyrics,
         str2utf8: str2utf8, utf82str: utf82str };
});
