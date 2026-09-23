const EMOTE = "jjamu.png";
['srvIcon','meAv','draftEmote','facEmote','resEmote'].forEach(id=>document.getElementById(id).src = EMOTE);

/* ── 쨔무 업그레이드 (환생 시 초기화) ─────────────── */
const UP = [
  { id:'thumb', grp:'손가락', name:'쨔무 굳은살', max:28, unlock:0,
    cost:n=>Math.ceil(6*Math.pow(1.55,n)),
    desc:'전송 쿨타임이 7%씩 줄어든다.',
    now:s=>'쿨타임 '+cooldown(s).toFixed(2)+'초' },

  { id:'amp', grp:'손가락', name:'쨔무 증폭기', max:999, unlock:0,
    cost:n=>Math.ceil(24*Math.pow(1.42,n)),
    desc:s=>'한 번 보낼 때 얻는 쨔무가 ' + ampStep(s) + ' 늘어난다.',
    now:s=>'전송당 '+fmt(perSend(s))+' 쨔무' },

  { id:'crit', grp:'손가락', name:'크리티컬 쨔무쨔무', max:40, unlock:2500,
    cost:n=>Math.ceil(500*Math.pow(1.75,n)),
    desc:s=>'1%p 확률로 더 큰 쨔무쨔무가 전송되어 획득량이 ' + fmt(critMul(s)) + '배가 된다.',
    now:s=>'확률 '+s.crit+'%' },

  { id:'react', grp:'손가락', name:'쨔무 리액션', max:40, unlock:30000,
    cost:n=>Math.ceil(2000*Math.pow(1.75,n)),
    desc:s=>'1%p 확률로 서버 주인이 내 쨔무쨔무에 반응해 획득량이 ' + fmt(ownMul(s)) + '배가 된다. ' +
      '크리티컬과 같이 터지면 ' + fmt(critMul(s)*ownMul(s)) + '배.',
    now:s=>'확률 '+s.react+'%' },

  { id:'cap', grp:'손가락', name:'쨔무 연타 근성', max:15, unlock:5000,
    cost:n=>Math.ceil(1500*Math.pow(2.2,n)),
    desc:'연타 콤보 상한이 10 올라간다.',
    now:s=>'콤보 상한 '+comboCap(s) },

  { id:'bot', grp:'자동화', name:'쨔무 자동완성 매크로', max:s=>botMax(s), unlock:90,
    cost:n=>Math.ceil(110*Math.pow(1.15,n)),
    desc:'5초마다 알아서 쨔무쨔무를 한 번 보낸다.',
    now:s=>'매크로 '+s.bot+'대' },

  { id:'over', grp:'자동화', name:'쨔무 오버클럭', max:15, unlock:900,
    cost:n=>Math.ceil(900*Math.pow(2.0,n)),
    desc:'모든 매크로가 20%씩 빨라진다.',
    now:s=>'속도 ×'+overMul(s).toFixed(2) },

  { id:'fan', grp:'서버', name:'쨔무 따라쟁이', max:40, unlock:350,
    cost:n=>Math.ceil(260*Math.pow(1.8,n)),
    desc:'따라 치는 사람이 늘어 모든 쨔무 획득량이 12% 늘어난다.',
    now:s=>'획득량 +'+(12*s.fan)+'%' },

  { id:'meme', grp:'서버', name:'쨔무 대유행', max:10, unlock:25000,
    cost:n=>Math.ceil(24000*Math.pow(8,n)),
    desc:'쨔무쨔무가 유행을 타 모든 쨔무 획득량이 2배가 된다.',
    now:s=>'유행 ×'+Math.pow(2,s.meme) },

  { id:'eboost', grp:'공장', name:'쨔무 에너지 부스트', max:Infinity, unlock:0, req:s=>s.reb >= 8,
    cost:n=>Math.ceil(10000*Math.pow(2,n)),
    desc:'손으로 보낼 때 얻는 쨔무 에너지가 10%p 늘어난다.',
    now:s=>'에너지 ×'+eboostMul(s).toFixed(1) },
];

/* ── 쨔무 공장 설비 (쨔무 에너지로 구매, 환생해도 유지) ── */
const EUP = [
  { id:'e_cool', grp:'전송 설비', name:'쨔무 냉각기', max:10,
    cost:n=>Math.ceil(30*Math.pow(2.6,n)),
    desc:'기본 전송 쿨타임이 8%씩 줄어든다.',
    now:s=>'기본 쿨타임 '+baseCd(s).toFixed(2)+'초' },

  { id:'e_combo', grp:'전송 설비', name:'쨔무 콤보 안정기', max:10,
    cost:n=>Math.ceil(50*Math.pow(2.7,n)),
    desc:'쿨타임이 끝난 뒤 콤보를 이어갈 수 있는 시간이 0.3초 늘어난다.',
    now:s=>'콤보 유지 '+(comboWin(s)/1000).toFixed(1)+'초' },

  { id:'e_amp', grp:'전송 설비', name:'쨔무 증폭기 증폭기', max:Infinity, req:s=>s.reb >= 6,
    cost:n=>Math.ceil(5000*Math.pow(1.4,n)),
    desc:'쨔무 증폭기 1레벨의 효과가 1 늘어난다.',
    now:s=>'증폭기 1레벨당 +'+ampStep(s) },

  { id:'sense', grp:'전송 설비', name:'쨔무 연타 감각', max:8, req:s=>s.reb >= 12,
    cost:n=>Math.ceil(1000000*Math.pow(2.5,n)),
    desc:'연타 콤보 1당 획득량이 1%p 더 늘어난다.',
    now:s=>'콤보 1당 +'+comboStep(s)+'%' },

  { id:'e_crit', grp:'강화 설비', name:'쨔무 크리티컬 강화', max:Infinity, req:s=>s.reb >= 8,
    cost:n=>Math.ceil(40000*Math.pow(1.5,n)),
    desc:'크리티컬 쨔무쨔무의 배율이 10 늘어난다.',
    now:s=>'크리티컬 ×'+fmt(critMul(s)) },

  { id:'e_react', grp:'강화 설비', name:'더 강한 쨔무 반응', max:Infinity, req:s=>s.reb >= 10,
    cost:n=>Math.ceil(150000*Math.pow(1.65,n)),
    desc:'주인장 반응의 배율이 10 늘어난다.',
    now:s=>'주인장 반응 ×'+fmt(ownMul(s)) },

  { id:'e_conv', grp:'생산 설비', name:'쨔무 컨베이어', max:40,
    cost:n=>Math.ceil(80*Math.pow(1.6,n)),
    desc:'매크로가 버는 쨔무가 25%씩 늘어난다.',
    now:s=>'매크로 수익 ×'+(1+0.25*s.e_conv).toFixed(2) },

  { id:'e_press', grp:'생산 설비', name:'쨔무 압축기', max:40,
    cost:n=>Math.ceil(100*Math.pow(1.7,n)),
    desc:'모든 쨔무 획득량이 25%씩 늘어난다.',
    now:s=>'획득량 ×'+(1+0.25*s.e_press).toFixed(2) },

  { id:'e_srv', grp:'생산 설비', name:'서버 확장', max:8, req:s=>s.reb >= 4,
    cost:n=>Math.ceil(1000*Math.pow(2.25,n)),
    desc:'쨔무 자동완성 매크로의 최대 보유 수가 5대 늘어난다.',
    now:s=>'매크로 최대 '+botMax(s)+'대' },

  { id:'e_fund', grp:'환생 설비', name:'쨔무 비상금', max:5,
    cost:n=>Math.ceil(200*Math.pow(5,n)),
    desc:'환생 직후 쨔무를 들고 시작한다. 레벨마다 10배.',
    now:s=>'시작 쨔무 '+fmt(fundBonus(s)) },
];

/* ── 쨔무 연구 (연구 포인트로 진행, 환생 10회에 열림) ── */
const RESEARCH = [
  { id:'r_botcrit', rp:1, name:'매크로 크리티컬',
    desc:'매크로가 보낸 쨔무쨔무에도 크리티컬과 주인장 반응이 적용된다. 배율은 각각 1/10이 된다.' },
  { id:'r_combo', rp:1, name:'크리티컬 콤보',
    desc:'크리티컬이 터지면 연타 콤보가 1 대신 10 오른다.' },
  { id:'r_pillmul', rp:1, name:'리액션 증폭',
    desc:'내 쨔무쨔무에 리액션이 달리면, 달린 개수만큼 그 전송의 획득량에 배율이 붙는다.' },
  { id:'r_floor', rp:2, name:'쿨타임 한계 돌파',
    desc:'전송 쿨타임의 하한이 0.35초에서 0.25초로 내려간다.' },
  { id:'r_away', rp:2, name:'자리 비움 연장',
    desc:'자리를 비운 동안 매크로가 버는 시간의 상한이 8시간에서 24시간으로 늘어난다.' },
  { id:'r_gold', rp:3, name:'황금 쨔무쨔무',
    desc:'5~15분마다 채팅창에 황금 쨔무쨔무가 나타난다. 누르면 30초 동안 모든 쨔무 획득량이 10배가 된다.' },
  { id:'r_botenergy', rp:2, name:'매크로 발전',
    desc:'매크로가 보낸 쨔무쨔무도 손으로 보낼 때의 0.025%만큼 쨔무 에너지를 만든다.' },
  { id:'r_finger', rp:2, name:'손가락 무상 지원',
    desc:"'손가락' 분류 업그레이드를 살 때 쨔무가 줄지 않는다. 요구량만큼 들고 있어야 하는 것은 같다." },
  { id:'r_server', rp:2, name:'서버 무상 지원',
    desc:"'서버' 분류 업그레이드를 살 때 쨔무가 줄지 않는다. 요구량만큼 들고 있어야 하는 것은 같다." },
  { id:'r_auto', rp:3, name:'자동화 영구 계약',
    desc:"'자동화' 분류 업그레이드를 살 때 쨔무가 줄지 않고, 환생해도 유지된다. 요구량은 그대로 필요하다." },
  { id:'r_factory', rp:3, name:'공장 영구 계약',
    desc:"'공장' 분류 업그레이드를 살 때 쨔무가 줄지 않고, 환생해도 유지된다. 요구량은 그대로 필요하다." },
  { id:'r_rebmul', rp:3, name:'환생 가속',
    desc:'10회째 환생부터, 환생할 때마다 환생 배율이 추가로 ×1.2 된다.' },
  { id:'r_cost', rp:3, name:'환생 절약',
    desc:'환생 요구량이 늘어나는 배수가 10배에서 8배로 줄어든다.' },
  { id:'r_multi', rp:5, name:'연속 환생',
    desc:'요구량을 10배 이상 넘겨 모았다면 한 번에 여러 번 환생한다.' },
];

const RANKS = [
  [0,'뉴비'],[150,'눈팅 탈출'],[1200,'채팅 참여러'],[9000,'이모티콘 애호가'],
  [70000,'도배 견습생'],[600000,'쨔무 장인'],[2e7,'채팅방 지배자'],[5e8,'쨔무 중독자'],
  [2e10,'쨔무 재벌'],[5e11,'쨔무의 신'],[1e14,'쨔무 그 자체']
];

/* ── 상태 ─────────────────────────────────────── */
const KEY = 'jjamu-save-v1';
let s = fresh();
// 콘솔 조작 등으로 빠지거나 깨진 값(undefined, NaN, 잘못된 타입)을 기본값으로 되돌린다
function normalize(){
  const base = fresh();
  if(!s || typeof s !== 'object') s = base;
  for(const k in base){
    const d = base[k], v = s[k];
    if(typeof d === 'number'){
      if(v === Infinity) s[k] = Number.MAX_VALUE;                 // 넘친 값은 최대값으로
      else if(typeof v !== 'number' || !isFinite(v)) s[k] = d;
    }
    else if(typeof d === 'boolean'){ if(typeof v !== 'boolean') s[k] = d; }
    else if(d && typeof d === 'object'){ if(!v || typeof v !== 'object') s[k] = d; }
  }
  s.reb = Math.max(0, Math.floor(s.reb));
  s.rpJamu = Math.max(0, Math.floor(s.rpJamu));
  s.rpEnergy = Math.max(0, Math.floor(s.rpEnergy));
  UP.concat(EUP).forEach(u=>{ s[u.id] = Math.max(0, Math.floor(s[u.id])); });
  RESEARCH.forEach(r=>{ s[r.id] = s[r.id] ? 1 : 0; });
}
function fresh(){
  const o = { jamu:0, total:0, sends:0, combo:0, shopOpen:innerWidth>880, seen:{},
              reb:0, energy:0, energyTotal:0, facSeen:0, botMute:false,
              rpJamu:0, rpEnergy:0, resSeen:0, ts:Date.now() };
  UP.forEach(u=>o[u.id]=0);
  EUP.forEach(u=>o[u.id]=0);
  RESEARCH.forEach(r=>o[r.id]=0);
  return o;
}
function baseCd(st){ return 4*Math.pow(0.92, st.e_cool); }
function cdFloor(st){ return st.r_floor ? 0.25 : 0.35; }        // 쿨타임 한계 돌파 연구
function cooldown(st){ return Math.max(cdFloor(st), baseCd(st)*Math.pow(0.93, st.thumb)); }
function rebMul(st){                                             // 환생 배율: 선형 + (환생 가속 연구)
  return (1 + st.reb) * (st.r_rebmul ? Math.pow(1.2, Math.max(0, st.reb - 9)) : 1);
}
function goldMul(){ return goldUntil > performance.now() ? 10 : 1; }   // 황금 쨔무쨔무 버프
function gMul(st){ return (1 + 0.12*st.fan) * Math.pow(2, st.meme) * rebMul(st) * (1 + 0.25*st.e_press) * goldMul(); }
function overMul(st){ return Math.pow(1.2, st.over); }
function ampStep(st){ return 1 + st.e_amp; }                     // 증폭기 1레벨당 효과
function perSend(st){ return (1 + st.amp * ampStep(st)) * gMul(st); }
function botSends(st){ return st.bot * overMul(st) / 5; }        // 매크로가 초당 보내는 횟수
function botEventMul(st){                                        // 매크로에 적용되는 크리티컬·반응 기대 배율
  if(!st.r_botcrit) return 1;
  return (1 + st.crit*0.01*(critMul(st)/10 - 1)) * (1 + st.react*0.01*(ownMul(st)/10 - 1));
}
function botRate(st){ return botSends(st) * gMul(st) * (1 + 0.25*st.e_conv) * botEventMul(st); }
function botEnergyRate(st){ return st.r_botenergy ? botSends(st) * energyPer(st) * 0.00025 : 0; }
function comboCap(st){ return 50 + 10*st.cap; }
function critMul(st){ return 10 + 10*st.e_crit; }    // 크리티컬 배율: 강화 1회마다 +10
function ownMul(st){ return 10 + 10*st.e_react; }    // 주인장 반응 배율: 강화 1회마다 +10
function botMax(st){ return 10 + 5*st.e_srv; }
function comboWin(st){ return 1800 + 300*st.e_combo; }          // ms
function comboStep(st){ return 2 + st.sense; }                   // 콤보 1당 획득량 %
function comboMul(){ return 1 + Math.min(s.combo, comboCap(s))*comboStep(s)/100; }
function rebStep(st){ return st.r_cost ? 8 : 10; }               // 환생 절약 연구
function costAt(st, reb){ return 1e6 * Math.pow(rebStep(st), reb); }
function rebCost(st){ return costAt(st, st.reb); }               // 100만에서 시작
function rebTimes(){                                             // 한 번에 진행할 환생 횟수 (연속 환생 연구)
  if(!s.r_multi) return 1;
  let k = 0;
  while(k < 200 && s.jamu >= costAt(s, s.reb + k)) k++;
  return Math.max(1, k);
}
function eboostMul(st){ return 1 + 0.1*st.eboost; }
function energyPer(st){ return st.reb > 0 ? Math.pow(3, st.reb - 1) * eboostMul(st) : 0; }
function fundBonus(st){ return st.e_fund > 0 ? 1000*Math.pow(10, st.e_fund - 1) : 0; }
function rebVisible(){ return s.total >= 1e5 || s.reb > 0; }
function rpJamuCost(st){ return 1e13 * Math.pow(1e3, st.rpJamu); }
function rpEnergyCost(st){ return 1e7 * Math.pow(1e2, st.rpEnergy); }
function rpEarned(st){ return st.rpJamu + st.rpEnergy; }
function rpSpent(st){ let n = 0; RESEARCH.forEach(r=>{ if(st[r.id]) n += r.rp; }); return n; }
function rpLeft(st){ return rpEarned(st) - rpSpent(st); }
function hasResearch(){ return s.reb >= 10 || rpEarned(s) > 0 || rpSpent(s) > 0; }
function freeUp(u){                                              // 무상 지원 연구가 적용된 분류
  return (u.grp === '손가락' && s.r_finger) || (u.grp === '서버' && s.r_server) ||
         (u.grp === '자동화' && s.r_auto) || (u.grp === '공장' && s.r_factory);
}
function keepUp(u){                                              // 환생해도 유지되는 분류
  return (u.grp === '자동화' && s.r_auto) || (u.grp === '공장' && s.r_factory);
}
function spendOf(u, lv){ return freeUp(u) ? 0 : u.cost(lv); }   // 요구량은 그대로, 차감만 면제
function hasFactory(){ return s.reb >= 1; }

const UNITS = [[1e48,'극'],[1e44,'재'],[1e40,'정'],[1e36,'간'],[1e32,'구'],[1e28,'양'],[1e24,'자'],
  [1e20,'해'],[1e16,'경'],[1e12,'조'],[1e8,'억'],[1e4,'만']];
function fmt(n){
  n = Math.floor(n);
  if(n < 10000) return n.toLocaleString('ko-KR');
  if(n >= 1e52) return n.toExponential(2).replace('e+', 'e');   // 극(10^48)의 1만 배 이상
  const u = UNITS;
  for(const [v,name] of u){
    // 나눗셈 오차(149.9999…)로 1이 깎이지 않도록 아주 작은 보정을 더한다
    if(n >= v){ const q = n/v*(1 + 1e-12); return (q>=100 ? Math.floor(q).toLocaleString('ko-KR') : (Math.floor(q*10 + 0.5)/10)) + name; }
  }
  return String(n);
}
function fmtE(n){ return (n < 1000 && Math.abs(n - Math.round(n)) > 1e-9) ? String(Math.round(n*10)/10) : fmt(n); }
function clock(){ return new Date().toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'}); }
function bumpEl(el){ el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

/* ── 채팅 렌더 ────────────────────────────────── */
const log = document.getElementById('log');
const NICKS = ['도라지튀김','쨔무단속반','새벽세시','뚜벅이','말차라떼','키보드워리어','감자칩','빙수대장',
  '고양이발바닥','퇴근하고싶다','모니터앞사람','솜사탕','노란우산','지나가던행인','밤샘러','붕어빵두개'];
const COLORS = ['#ff9ec9','#9fe3f2','#ffd47e','#c4b0ff','#9ff2c0','#ffb3a7','#b6d4ff','#f9a8d4'];
const LINES = ['ㅋㅋㅋㅋㅋㅋㅋ','귀엽다 진짜','이모티콘 어디서 받음?','쿨타임 너무 긴 거 아님','도배 좀 그만',
  '방금 매크로 샀다','쨔무 몇 개 모았어요?','손가락 아파','오늘도 쨔무쨔무','와 저거 뭐야',
  '조용히 눈팅 중','저도 낄게요','채팅 속도 실화냐','쨔무 좀 나눠주세요','서버 주인 어디감'];

let lastKey = '', lastAt = 0, groupRows = 0, curBody = null;

function stick(){ return log.scrollHeight - log.scrollTop - log.clientHeight < 100; }
function trim(){ while(log.children.length > 45) log.removeChild(log.firstChild); }
function place(li){
  const keep = stick(); log.appendChild(li); trim();
  if(keep) log.scrollTop = log.scrollHeight;
}
function avatar(seed){
  const img = document.createElement('img');
  img.className = 'av'; img.src = EMOTE; img.alt = ''; img.draggable = false;
  if(seed) img.style.filter = 'hue-rotate('+(seed*47%360)+'deg) saturate(1.05)';
  return img;
}
function openGroup(nick, color, seed, mine, bot, macro){
  const li = document.createElement('li');
  if(macro) li.className = 'macro';
  const msg = document.createElement('div');
  msg.className = 'msg' + (mine ? ' mine' : '');
  const bd = document.createElement('div'); bd.className = 'bd';
  const hd = document.createElement('div'); hd.className = 'hd';
  const n = document.createElement('span');
  n.className = 'nick'; n.textContent = nick; n.style.color = mine ? '#ff9ec9' : color;
  hd.appendChild(n);
  if(bot){ const t = document.createElement('span'); t.className = 'tag'; t.textContent = 'BOT'; hd.appendChild(t); }
  const tm = document.createElement('span'); tm.className = 'tm'; tm.textContent = clock();
  hd.appendChild(tm);
  bd.appendChild(hd);
  msg.append(avatar(seed), bd);
  li.appendChild(msg); place(li);
  return bd;
}
function contGroup(macro){
  const li = document.createElement('li');
  if(macro) li.className = 'macro';
  const msg = document.createElement('div');
  msg.className = 'msg tight';
  const sp = document.createElement('span'); sp.className = 'av'; sp.style.visibility = 'hidden';
  const bd = document.createElement('div'); bd.className = 'bd';
  msg.append(sp, bd); li.appendChild(msg); place(li);
  return bd;
}
function body(key, nick, color, seed, mine, bot){
  const now = Date.now(), macro = key.indexOf('b:') === 0;
  if(key === lastKey && curBody && now - lastAt < 90000 && groupRows < 9){
    lastAt = now; groupRows++;
    return contGroup(macro);
  }
  lastKey = key; lastAt = now; groupRows = 0;
  curBody = openGroup(nick, color, seed, mine, bot, macro);
  return curBody;
}
function badge(text, cls){
  const b = document.createElement('span');
  b.className = 'badge ' + cls; b.textContent = text;
  return b;
}
function emoteRow(bd, gain, kind, anim, energy, pillMul){
  kind = kind || '';
  const row = document.createElement('div');
  row.className = 'row' + (kind ? ' ' + kind : '') + (anim ? ' new' : '');
  const img = document.createElement('img');
  img.src = EMOTE; img.alt = '쨔무쨔무'; img.draggable = false;
  row.appendChild(img);
  if(gain){
    const g = document.createElement('span');
    g.className = 'gain';
    if(kind.indexOf('crit') >= 0) g.appendChild(badge('크리티컬 ×' + fmt(critMul(s)), 'crit'));
    if(kind.indexOf('owner') >= 0) g.appendChild(badge('👑 주인장 반응 ×' + fmt(ownMul(s)), 'own'));
    if(pillMul) g.appendChild(badge('리액션 ×' + fmt(pillMul), 'pill'));
    g.appendChild(document.createTextNode('+' + fmt(gain) + ' 쨔무'));
    if(energy){
      const e = document.createElement('span');
      e.className = 'en'; e.textContent = '+' + fmtE(energy) + ' 에너지';
      g.appendChild(e);
    }
    row.appendChild(g);
  }
  bd.appendChild(row);
  if(stick()) log.scrollTop = log.scrollHeight;
  return row;
}
function reactTo(row, pills){
  const wrap = document.createElement('div'); wrap.className = 'reacts';
  pills.forEach(p=>{
    const r = document.createElement('span');
    r.className = 'react' + (p.own ? ' own' : '');
    if(p.own){
      const cr = document.createElement('span'); cr.className = 'crown'; cr.textContent = '👑';
      r.append(cr, document.createTextNode('1'));
      r.title = '서버 주인이 반응했습니다';
    }else{
      const im = document.createElement('img'); im.src = EMOTE; im.alt = '';
      r.append(im, document.createTextNode(String(p.n)));
    }
    wrap.appendChild(r);
  });
  row.after(wrap);
}
function sysMsg(html, gold){
  const li = document.createElement('li');
  const d = document.createElement('div');
  d.className = 'sys' + (gold ? ' gold' : '');
  d.innerHTML = '<span class="ic">#</span><span>' + html + '</span>';
  li.appendChild(d); place(li);
  lastKey = ''; curBody = null;
}
function textMsg(nick, color, seed, text){
  const bd = body('t:'+nick, nick, color, seed, false, false);
  const p = document.createElement('div');
  p.className = 'say'; p.textContent = text; bd.appendChild(p);
  if(stick()) log.scrollTop = log.scrollHeight;
}
function randNick(){
  const i = Math.floor(Math.random()*NICKS.length);
  return [NICKS[i], COLORS[i % COLORS.length], i+1];
}
// 채널 멘션 클릭 → 해당 채널로 이동
log.addEventListener('click', e=>{
  const a = e.target.closest('[data-goto]');
  if(a) setView(a.dataset.goto);
  if(e.target.closest('[data-gold]')) catchGold();
});

/* ── 보내기 ───────────────────────────────────── */
const sendBtn = document.getElementById('send'), fill = document.getElementById('fill'),
      sendLbl = document.getElementById('sendLbl'), wallet = document.getElementById('wallet'),
      draftX = document.getElementById('draftX');
let readyAt = 0;
let goldAt = 0, goldUntil = 0, goldLive = null, goldGone = 0;   // 황금 쨔무쨔무 (저장하지 않음)

function send(){
  const now = performance.now();
  if(now < readyAt) return;
  const big = s.crit > 0 && Math.random() < s.crit*0.01;
  const own = s.react > 0 && Math.random() < s.react*0.01;

  // 콤보 창은 [readyAt, readyAt + comboWin] — 화면 갱신 여부와 무관하게 판정
  const step = (big && s.r_combo) ? 10 : 1;                      // 크리티컬 콤보 연구
  if(s.combo > 0 && now <= readyAt + comboWin(s)) s.combo = Math.min(s.combo + step, comboCap(s));
  else s.combo = Math.min(step, comboCap(s));
  // 리액션을 먼저 정한다. 달리는 조건은 그대로 두고, 개수만 배율로 쓴다 (리액션 증폭 연구)
  const pills = [];
  if(own) pills.push({own:true});
  if(big) pills.push({n: 3 + Math.floor(Math.random()*20)});
  if(!pills.length && s.fan > 0 && Math.random() < Math.min(0.04 + s.fan*0.01, 0.3))
    pills.push({n: 1 + Math.floor(Math.random()*s.fan)});
  let pillN = 0;
  pills.forEach(p=>{ if(p.n) pillN += p.n; });
  const pillMul = (s.r_pillmul && pillN > 0) ? pillN : 1;

  const gain = perSend(s) * comboMul() * (big ? critMul(s) : 1) * (own ? ownMul(s) : 1) * pillMul;
  s.jamu += gain; s.total += gain; s.sends++;

  // 손으로 직접 보낼 때만 쨔무 에너지 생성: 2^(환생 - 1)
  const eg = energyPer(s);
  if(eg){ s.energy += eg; s.energyTotal += eg; }

  const kind = ((big ? 'crit ' : '') + (own ? 'owner' : '')).trim();
  const row = emoteRow(body('me','나',null,0,true,false), gain, kind, true, eg, pillMul > 1 ? pillMul : 0);
  if(pills.length) reactTo(row, pills);

  readyAt = now + cooldown(s)*1000;
  paintWallet(true); checkUnlocks();
  if(eg && view === 'factory') bumpEl(energyEl);
  if(s.sends === 3) sysMsg('오른쪽 위 <b>상점</b>에서 모은 쨔무를 업그레이드에 쓸 수 있습니다.');
}
sendBtn.addEventListener('click', send);
let keyHeld = false;
function isKey(e){ return e.key === 'Enter' || e.key === ' '; }
function typingIn(e){ return e.target.closest && e.target.closest('textarea, input, select, [contenteditable]'); }
function modalOpen(){ const m = document.getElementById('dataModal'); return !!m && !m.hidden; }
function otherBtn(e){
  const b = e.target.closest && e.target.closest('button');
  return b && b !== sendBtn;          // 상점 버튼 등은 기본 동작에 맡긴다
}
addEventListener('keydown', e=>{
  if(!isKey(e) || otherBtn(e) || typingIn(e) || modalOpen()) return;
  e.preventDefault();                 // 스크롤·버튼 기본 동작 차단
  if(e.repeat || keyHeld) return;     // 누르고 있는 동안에는 한 번만
  keyHeld = true;
  send();
});
addEventListener('keyup', e=>{
  if(!isKey(e) || otherBtn(e) || typingIn(e) || modalOpen()) return;
  e.preventDefault();
  keyHeld = false;
});
addEventListener('blur', ()=>{ keyHeld = false; });

// 마우스로 버튼을 누르면 포커스를 풀어 준다.
// 포커스가 남아 있으면 다음 Enter/Space가 전송이 아니라 그 버튼을 다시 누르게 된다.
// (e.detail > 0 이면 마우스 클릭. 키보드로 버튼을 활성화한 경우는 0이라 포커스를 유지한다)
addEventListener('click', e=>{
  const b = e.target.closest && e.target.closest('button');
  if(b && b !== sendBtn && e.detail > 0) b.blur();
});

/* ── 매크로 스위치 ────────────────────────────── */
const macroBtn = document.getElementById('macroBtn');
function paintMacroBtn(){
  macroBtn.hidden = s.bot < 1;
  macroBtn.classList.toggle('on', !s.botMute);
  macroBtn.setAttribute('aria-pressed', String(!s.botMute));
  macroBtn.title = s.botMute ? '매크로 메시지 보이기' : '매크로 메시지 숨기기';
  log.classList.toggle('mute-macro', !!s.botMute);
}
macroBtn.addEventListener('click', ()=>{
  s.botMute = !s.botMute;
  botAcc = 0;
  sysMsg(s.botMute ? '매크로 메시지를 숨깁니다. 매크로는 계속 쨔무를 법니다.'
                   : '매크로 메시지를 다시 표시합니다.');
  paintWallet(); save();
  if(stick() || s.botMute) log.scrollTop = log.scrollHeight;
});

/* ── 황금 쨔무쨔무 ────────────────────────────── */
function goldDelay(){ return (300 + Math.random()*600) * 1000; }   // 5~15분
function spawnGold(now){
  const li = document.createElement('li');
  li.className = 'goldwrap';
  const btn = document.createElement('button');
  btn.className = 'gold'; btn.dataset.gold = '1';
  const img = document.createElement('img'); img.src = EMOTE; img.alt = '';
  const txt = document.createElement('span');
  txt.innerHTML = '<b>황금 쨔무쨔무</b>가 지나갑니다! 누르면 30초 동안 모든 쨔무 획득량 ×10';
  btn.append(img, txt); li.appendChild(btn); place(li);
  lastKey = ''; curBody = null;
  goldLive = btn; goldGone = now + 20000;                          // 20초 안에 못 누르면 사라진다
}
function catchGold(){
  if(!goldLive) return;
  const now = performance.now();
  goldUntil = now + 30000;
  goldLive.classList.add('caught'); goldLive.disabled = true;
  goldLive.querySelector('span').innerHTML = '<b>황금 쨔무쨔무</b>를 잡았습니다! 30초 동안 모든 쨔무 획득량 ×10';
  goldLive = null; goldAt = now + goldDelay();
  paintWallet();
}
function expireGold(now){
  if(!goldLive) return;
  goldLive.classList.add('gone'); goldLive.disabled = true;
  goldLive.querySelector('span').innerHTML = '황금 쨔무쨔무가 그냥 지나가 버렸습니다.';
  goldLive = null; goldAt = now + goldDelay();
}
function clearGold(){ goldLive = null; goldUntil = 0; goldAt = 0; }

/* ── 채널 · 화면 전환 ─────────────────────────── */
const side = document.getElementById('side'), menuBtn = document.getElementById('menuBtn'),
      menuDot = document.getElementById('menuDot'), scrim = document.getElementById('scrim'),
      chName = document.getElementById('chName'), chFactory = document.getElementById('chFactory'),
      facNew = document.getElementById('facNew'), topicMain = document.getElementById('topicMain'),
      topicFac = document.getElementById('topicFac'), factoryEl = document.getElementById('factory'),
      topicRes = document.getElementById('topicRes'), researchEl = document.getElementById('research'),
      chResearch = document.getElementById('chResearch'), resNew = document.getElementById('resNew'),
      chMain = document.querySelector('.ch[data-ch="main"]'), goldTag = document.getElementById('goldTag');
let view = 'main', sideOpen = false;

function mobile(){ return innerWidth <= 880; }
function updateScrim(){ scrim.classList.toggle('on', mobile() && (s.shopOpen || sideOpen)); }
function setSide(open){
  sideOpen = open;
  side.classList.toggle('open', open);
  if(open && mobile() && s.shopOpen) setShop(false);
  updateScrim();
}
menuBtn.addEventListener('click', ()=>setSide(!sideOpen));

function setView(v){
  if(v === 'factory' && !hasFactory()) v = 'main';
  if(v === 'research' && !hasResearch()) v = 'main';
  view = v;
  log.hidden = v !== 'main';
  factoryEl.hidden = v !== 'factory';
  researchEl.hidden = v !== 'research';
  topicMain.hidden = v !== 'main';
  topicFac.hidden = v !== 'factory';
  topicRes.hidden = v !== 'research';
  chName.textContent = v === 'main' ? '쨔무쨔무-도배' : (v === 'factory' ? '쨔무-공장' : '쨔무-연구');
  document.querySelectorAll('.ch[data-ch]').forEach(b=>b.classList.toggle('on', b.dataset.ch === v));
  if(v === 'factory'){ s.facSeen = 1; paintFactory(); }
  else if(v === 'research'){ s.resSeen = 1; paintResearch(); }
  else log.scrollTop = log.scrollHeight;
  paintChannels();
  setSide(false);
}

function credits(){
  const bd = body('credit', '쨔무쨔무 시뮬레이터', '#ff9ec9', 0, false, true);
  const box = document.createElement('div');
  box.className = 'embed';
  const im = document.createElement('img'); im.src = EMOTE; im.alt = '';
  const h = document.createElement('h3'); h.textContent = '크레딧';
  const p1 = document.createElement('p'); p1.textContent = 'Claude AI를 이용해 제작됨';
  const p2 = document.createElement('p');
  p2.innerHTML = '<span>유시아 쨔무쨔무 이미지:</span> 윤건 님';
  box.append(im, h, p1, p2);
  bd.appendChild(box);
  lastKey = ''; curBody = null;
  if(stick()) log.scrollTop = log.scrollHeight;
}

const CH_MSG = {
  notice:'<b>#공지사항</b>은 읽기 전용 채널입니다.',
  free:'지금은 <b>#쨔무쨔무-도배</b>에 집중할 시간입니다.',
  info:'업그레이드 설명은 오른쪽 <b>상점</b>에서 볼 수 있습니다.',
  voice:'마이크가 없어 음성 채널에 들어갈 수 없습니다.'
};
document.querySelectorAll('.ch[data-ch]').forEach(b=>{
  b.addEventListener('click', ()=>{
    const k = b.dataset.ch;
    if(k === 'main' || k === 'factory' || k === 'research'){ setView(k); return; }
    setView('main');
    if(k === 'credit'){ credits(); return; }
    sysMsg(CH_MSG[k]);
    if(k === 'info') setShop(true);
  });
});
function paintChannels(){
  chMain.classList.toggle('alert', !!goldLive && view !== 'main');
  chFactory.hidden = !hasFactory();
  facNew.hidden = !!s.facSeen;
  chResearch.hidden = !hasResearch();
  resNew.hidden = !!s.resSeen;
  menuDot.classList.toggle('show', (hasFactory() && !s.facSeen) || (hasResearch() && !s.resSeen) ||
    (!!goldLive && view !== 'main'));
}

/* ── 업그레이드 목록 공통 렌더러 ─────────────────── */
function renderList(el, list, cache, have, unit, onBuy){
  const sig = list.map(u=>u.id+':'+s[u.id]+':'+maxOf(u)+':'+have.cost(u)).join('|');   // 최대치·가격이 바뀌어도 다시 그림
  if(sig !== cache.sig){
    cache.sig = sig; el.innerHTML = ''; let grp = '';
    list.forEach(u=>{
      if(u.grp !== grp){
        grp = u.grp;
        const h = document.createElement('div'); h.className = 'grp'; h.textContent = grp;
        el.appendChild(h);
      }
      const lv = s[u.id], mx = maxOf(u), maxed = lv >= mx;
      const b = document.createElement('button');
      b.className = 'item' + (maxed ? ' maxed' : ''); b.dataset.id = u.id;
      b.innerHTML = '<span class="top"><span class="nm"></span><span class="cost"></span></span>'+
        '<p class="ds"></p><span class="bt"><span class="lv"></span>'+
        '<span class="track"><i></i></span><span class="now"></span></span>';
      b.querySelector('.nm').textContent = u.name;
      b.querySelector('.cost').textContent = maxed ? '완료' : fmt(have.cost(u)) + ' ' + unit;
      b.querySelector('.lv').textContent = mx < 900 ? 'Lv.'+lv+'/'+mx : 'Lv.'+lv;
      b.querySelector('.track i').style.width = (mx < 900 ? Math.min(lv/mx*100, 100) : Math.min(lv*2,100)) + '%';
      b.disabled = maxed;
      if(!maxed) b.addEventListener('click', ()=>onBuy(u));
      el.appendChild(b);
    });
  }
  el.querySelectorAll('.item[data-id]').forEach(b=>{
    const u = list.find(x=>x.id === b.dataset.id);
    if(!u) return;
    b.querySelector('.now').textContent = u.now(s);
    b.querySelector('.ds').textContent = descOf(u);
    const lv = s[u.id];
    if(lv >= maxOf(u)) return;
    const can = have() >= have.cost(u);
    b.classList.toggle('can', can); b.disabled = !can;
    const nospend = !!(have.free && have.free(u));                  // 소모하지 않는 분류
    b.classList.toggle('nospend', nospend);
    b.title = nospend ? '연구 덕분에 ' + unit + '를 소모하지 않습니다. 요구량만 갖고 있으면 됩니다.' : '';
  });
}

/* ── 상점 ─────────────────────────────────────── */
const shop = document.getElementById('shop'), shopBtn = document.getElementById('shopBtn'),
      shopList = document.getElementById('shopList'), dot = document.getElementById('dot');
const shopCache = {sig:''};

function setShop(open){
  s.shopOpen = open;
  shop.classList.toggle('open', open);
  shopBtn.classList.toggle('on', open);
  shopBtn.setAttribute('aria-expanded', open);
  if(open && mobile() && sideOpen){ sideOpen = false; side.classList.remove('open'); }
  updateScrim();
  if(open) paintShop();
}
shopBtn.addEventListener('click', ()=>setShop(!s.shopOpen));
scrim.addEventListener('click', ()=>{ setShop(false); setSide(false); });

function maxOf(u){ return typeof u.max === 'function' ? u.max(s) : u.max; }
function descOf(u){ return typeof u.desc === 'function' ? u.desc(s) : u.desc; }
function reqOk(u){ return !u.req || u.req(s); }
function visible(u){ return reqOk(u) && (s.total >= (u.unlock || 0) || s[u.id] > 0); }
function visibleE(u){ return reqOk(u) || s[u.id] > 0; }
function buy(u){
  const lv = s[u.id];
  if(lv >= maxOf(u)) return;
  const c = u.cost(lv);
  if(s.jamu < c) return;                  // 요구량은 그대로 갖고 있어야 한다
  s.jamu -= spendOf(u, lv);               // 연구했으면 소모하지 않는다
  s[u.id] = lv + 1;
  paintWallet(); paintShop();
  sysMsg('<b>'+u.name+'</b> Lv.'+(lv+1)+' 구매 — '+u.now(s), true);
}
const jamuWallet = ()=>s.jamu;     jamuWallet.cost = u=>u.cost(s[u.id]); jamuWallet.free = freeUp;
const energyWallet = ()=>s.energy; energyWallet.cost = u=>u.cost(s[u.id]);
function paintShop(){
  renderList(shopList, UP.filter(visible), shopCache, jamuWallet, '쨔무', buy);
  paintRebirth();
}
function anyAffordable(){
  return UP.some(u=>visible(u) && s[u.id] < maxOf(u) && s.jamu >= u.cost(s[u.id])) ||
         (rebVisible() && s.jamu >= rebCost(s));
}
function checkUnlocks(){
  UP.forEach(u=>{
    if(u.unlock > 0 && !s.seen[u.id] && s.total >= u.unlock){
      s.seen[u.id] = 1; shopCache.sig = '';
      sysMsg('새 업그레이드 해금 — <b>'+u.name+'</b>', true);
    }
  });
  if(!s.seen.rebirth && rebVisible()){
    s.seen.rebirth = 1;
    sysMsg('상점에 <b>쨔무 환생</b>이 나타났습니다. ' + fmt(rebCost(s)) + ' 쨔무를 모으면 환생할 수 있습니다.', true);
  }
}

/* ── 쨔무 환생 ────────────────────────────────── */
const rebBox = document.getElementById('rebirthBox'), rebBtn = document.getElementById('rebBtn'),
      rebCostEl = document.getElementById('rebCost'), rebDesc = document.getElementById('rebDesc'),
      rebLv = document.getElementById('rebLv'), rebBar = document.getElementById('rebBar'),
      rebNow = document.getElementById('rebNow');
let armAt = 0, armUntil = 0;

function paintRebirth(){
  const show = rebVisible();
  rebBox.hidden = !show;
  if(!show) return;
  const cost = rebCost(s), can = s.jamu >= cost, now = performance.now();
  if(!can) armUntil = 0;
  const armed = can && now < armUntil;
  rebCostEl.textContent = fmt(cost) + ' 쨔무';
  rebDesc.textContent = '보유 쨔무와 모든 쨔무 업그레이드를 초기화하고, 모든 쨔무 획득량 배율을 영구히 올린다. ' +
    (s.r_multi ? '요구량을 여러 번 넘겨 모았다면 한 번에 그만큼 환생한다.'
               : '요구량보다 많이 모아도 한 번에 1회만 환생한다.') +
    (s.reb === 0 ? ' 첫 환생 시 #쨔무-공장이 열린다.' : '');
  rebLv.textContent = s.reb + '회';
  rebBar.style.width = Math.min(s.jamu/cost*100, 100) + '%';
  const times = can ? rebTimes() : 1;
  rebNow.textContent = (times > 1 ? '한 번에 ' + times + '회 · ' : '') +
    '배율 ×' + fmt(rebMul(s)) + ' → ×' + fmt(rebMul(Object.assign({}, s, {reb: s.reb + times})));
  rebBtn.classList.toggle('can', can);
  rebBtn.classList.toggle('armed', armed);
  rebBtn.disabled = !can;
}
rebBtn.addEventListener('click', ()=>{
  if(s.jamu < rebCost(s)) return;
  const now = performance.now();
  // 두 번 눌러 확인. 키를 꾹 눌러 연타되는 경우를 막으려고 0.4초 간격을 요구
  if(now < armUntil && now - armAt > 400){ armUntil = 0; rebirth(); }
  else if(!(now < armUntil)){ armAt = now; armUntil = now + 3000; }
  paintRebirth();
});

// 환생·연구 초기화에서 공통으로 쓰는 정리 (환생 횟수는 건드리지 않는다)
function wipeProgress(){
  UP.forEach(u=>{ if(!keepUp(u)) s[u.id] = 0; });
  s.jamu = fundBonus(s);
  s.combo = 0; readyAt = 0;
  shopCache.sig = ''; facCache.sig = ''; resCache.sig = '';
}
function rebirth(){
  if(s.jamu < rebCost(s)) return;
  const first = s.reb === 0, prev = s.reb;
  const times = rebTimes();                // 연속 환생 연구가 없으면 1
  s.reb += times;
  wipeProgress();
  sysMsg('<b>쨔무 환생 ' + s.reb + '회</b> 완료!' + (times > 1 ? ' (한 번에 ' + times + '회) ' : ' ') +
    '모든 쨔무 획득량 ×' + fmt(rebMul(s)) +
    (s.jamu > 0 ? ', 비상금 ' + fmt(s.jamu) + ' 쨔무로 시작합니다.' : '.'), true);
  // 이번 환생으로 새로 열린 업그레이드 알림
  const before = Object.assign({}, s, {reb: prev});
  EUP.forEach(u=>{ if(u.req && u.req(s) && !u.req(before)) sysMsg('새 공장 설비 해금 — <b>'+u.name+'</b>', true); });
  UP.forEach(u=>{ if(u.req && u.req(s) && !u.req(before)) sysMsg('새 업그레이드 해금 — <b>'+u.name+'</b>', true); });
  if(first){
    sysMsg('새 채널 <button class="mention" data-goto="factory">#쨔무-공장</button>이 생겼습니다. ' +
      '이제 손으로 직접 보낸 쨔무쨔무가 <b>쨔무 에너지</b>를 만듭니다.', true);
  }else{
    sysMsg('손으로 보낼 때마다 쨔무 에너지 <b>+' + fmtE(energyPer(s)) + '</b>', true);
  }
  if(prev < 10 && s.reb >= 10){
    sysMsg('새 채널 <button class="mention" data-goto="research">#쨔무-연구</button>가 생겼습니다. ' +
      '쨔무와 쨔무 에너지를 <b>연구 포인트</b>로 바꿔 영구적인 연구를 진행할 수 있습니다.', true);
  }
  paintChannels(); paintWallet(); save();
}

/* ── 쨔무 공장 ────────────────────────────────── */
const energyEl = document.getElementById('energy'), facSub = document.getElementById('facSub'),
      facStats = document.getElementById('facStats'), facList = document.getElementById('facList');
const facCache = {sig:''};

function buyE(u){
  const lv = s[u.id];
  if(lv >= maxOf(u)) return;
  const c = u.cost(lv);
  if(s.energy < c) return;
  s.energy -= c; s[u.id] = lv + 1;
  paintFactory(); paintWallet();
  sysMsg('<b>'+u.name+'</b> Lv.'+(lv+1)+' 설치 — '+u.now(s), true);
}
function paintFactory(){
  energyEl.textContent = fmt(s.energy);
  facSub.textContent = '손으로 보낼 때마다 +' + fmtE(energyPer(s)) + ' 에너지';
  facStats.innerHTML =
    '<div class="stat"><span>쨔무 환생</span><b>' + s.reb + '회</b></div>' +
    '<div class="stat"><span>환생 배율</span><b>×' + rebMul(s) + '</b></div>' +
    '<div class="stat"><span>전송당 에너지</span><b>' + fmtE(energyPer(s)) + '</b><small>3^(' + s.reb + '−1)' +
      (s.eboost > 0 ? ' ×' + eboostMul(s).toFixed(1) : '') + '</small></div>' +
    '<div class="stat"><span>다음 환생</span><b>' + fmt(rebCost(s)) + '</b><small>쨔무</small></div>';
  renderList(facList, EUP.filter(visibleE), facCache, energyWallet, '에너지', buyE);
}

/* ── 쨔무 연구 ────────────────────────────────── */
const rpAmt = document.getElementById('rpAmt'), rpSub = document.getElementById('rpSub'),
      convJamuCost = document.getElementById('convJamuCost'), convJamuBtn = document.getElementById('convJamu'),
      convEnergyCost = document.getElementById('convEnergyCost'), convEnergyBtn = document.getElementById('convEnergy'),
      resList = document.getElementById('resList'), resResetBtn = document.getElementById('resReset');
const resCache = {sig:''};

function convert(kind){
  if(kind === 'jamu'){
    const c = rpJamuCost(s);
    if(s.jamu < c) return;
    s.jamu -= c; s.rpJamu++;
    sysMsg('쨔무 ' + fmt(c) + '을(를) <b>연구 포인트 1점</b>으로 바꿨습니다.', true);
  }else{
    const c = rpEnergyCost(s);
    if(s.energy < c) return;
    s.energy -= c; s.rpEnergy++;
    sysMsg('쨔무 에너지 ' + fmt(c) + '을(를) <b>연구 포인트 1점</b>으로 바꿨습니다.', true);
  }
  paintWallet(); paintResearch(); save();
}
convJamuBtn.addEventListener('click', ()=>convert('jamu'));
convEnergyBtn.addEventListener('click', ()=>convert('energy'));

function research(r){
  if(s[r.id] || rpLeft(s) < r.rp) return;
  s[r.id] = 1; resCache.sig = ''; shopCache.sig = ''; facCache.sig = '';
  sysMsg('연구 완료 — <b>' + r.name + '</b>', true);
  paintWallet(); paintResearch(); save();
}
function paintResearch(){
  const left = rpLeft(s);
  rpAmt.textContent = fmt(left);
  rpSub.textContent = '총 ' + fmt(rpEarned(s)) + '점 획득 · 연구에 ' + fmt(rpSpent(s)) + '점 사용 중';
  const jc = rpJamuCost(s), ec = rpEnergyCost(s);
  convJamuCost.textContent = fmt(jc) + ' 쨔무';
  convEnergyCost.textContent = fmt(ec) + ' 에너지';
  convJamuBtn.disabled = s.jamu < jc;   convJamuBtn.classList.toggle('primary', s.jamu >= jc);
  convEnergyBtn.disabled = s.energy < ec; convEnergyBtn.classList.toggle('primary', s.energy >= ec);

  const sig = RESEARCH.map(r=>r.id + (s[r.id] ? '1' : '0')).join('');
  if(sig !== resCache.sig){
    resCache.sig = sig; resList.innerHTML = '';
    RESEARCH.forEach(r=>{
      const done = !!s[r.id];
      const b = document.createElement('button');
      b.className = 'item res' + (done ? ' done' : '');
      b.dataset.rid = r.id;
      b.innerHTML = '<span class="top"><span class="nm"></span><span class="cost"></span></span>' +
        '<p class="ds"></p><span class="bt"><span class="lv"></span></span>';
      b.querySelector('.nm').textContent = r.name;
      b.querySelector('.ds').textContent = r.desc;
      b.querySelector('.cost').textContent = done ? '연구 완료' : r.rp + ' 포인트';
      b.querySelector('.lv').textContent = done ? '적용 중' : '연구 포인트 ' + r.rp + '점 필요';
      if(!done) b.addEventListener('click', ()=>research(r));
      b.disabled = done;
      resList.appendChild(b);
    });
  }
  resList.querySelectorAll('.item[data-rid]').forEach(b=>{
    const r = RESEARCH.find(x=>x.id === b.dataset.rid);
    if(!r || s[r.id]) return;
    const can = left >= r.rp;
    b.classList.toggle('can', can); b.disabled = !can;
  });
}

// 연구 초기화: 포인트를 전부 돌려받고, 환생과 같은 정리가 일어난다 (환생 횟수는 그대로)
let resAt = 0, resUntil = 0, resTimer = 0;
resResetBtn.addEventListener('click', ()=>{
  const now = performance.now();
  if(now < resUntil && now - resAt > 400){
    clearTimeout(resTimer); disarmResReset();
    const back = rpSpent(s);
    RESEARCH.forEach(r=>s[r.id] = 0);
    wipeProgress();
    setView('main');
    sysMsg('연구를 모두 되돌리고 <b>연구 포인트 ' + fmt(back) + '점</b>을 돌려받았습니다. ' +
      '쨔무와 업그레이드는 환생과 같은 방식으로 정리되었습니다.', true);
    paintChannels(); paintWallet(); save();
    return;
  }
  if(now < resUntil) return;
  resAt = now; resUntil = now + 3000;
  resResetBtn.textContent = '한 번 더 누르면 초기화'; resResetBtn.classList.add('armed');
  clearTimeout(resTimer); resTimer = setTimeout(disarmResReset, 3000);
});
function disarmResReset(){
  resUntil = 0; resResetBtn.textContent = '연구 초기화'; resResetBtn.classList.remove('armed');
}

/* ── 화면 갱신 ────────────────────────────────── */
const amtEl = document.getElementById('amt'), rateEl = document.getElementById('rate'),
      rankEl = document.getElementById('rank'), viewEl = document.getElementById('viewers'),
      rebTag = document.getElementById('rebTag'),
      typingEl = document.getElementById('typing'), totalTxt = document.getElementById('totalTxt'),
      meJamu = document.getElementById('meJamu'), meEnergy = document.getElementById('meEnergy'),
      voiceCnt = document.getElementById('voiceCnt');
let lastRank = '';

function rankOf(t){ let r = RANKS[0][1]; for(const [v,n] of RANKS) if(t >= v) r = n; return r; }

function paintWallet(bump){
  paintChannels();
  if(view === 'factory' && !hasFactory()){ setView('main'); return; }
  if(view === 'research' && !hasResearch()){ setView('main'); return; }
  const txt = fmt(s.jamu);
  amtEl.textContent = txt; meJamu.textContent = txt;
  meEnergy.textContent = s.reb > 0 ? ' · ' + fmt(s.energy) + ' 에너지' : '';
  const br = botRate(s);
  rateEl.textContent = br > 0 ? '매크로 초당 ' + (br < 10 ? br.toFixed(1) : fmt(br)) + ' 쨔무' : '';
  paintMacroBtn();
  const r = rankOf(s.total);
  if(r !== lastRank){
    if(lastRank) sysMsg('내 등급이 <b>' + r + '</b>(으)로 올랐습니다.', true);
    lastRank = r; rankEl.textContent = r;
  }
  rebTag.textContent = s.reb > 0 ? ' · 환생 ' + s.reb + '회' : '';
  const v = 12 + Math.floor(Math.pow(s.total, 0.42));
  viewEl.textContent = fmt(v);
  voiceCnt.textContent = fmt(2 + Math.floor(v/9));
  totalTxt.textContent = '총 ' + fmt(s.total) + ' 쨔무 · 전송 ' + fmt(s.sends) + '회';
  draftX.textContent = '전송당 ' + fmt(perSend(s) * comboMul()) + ' 쨔무' +
    (s.reb > 0 ? ' · ' + fmtE(energyPer(s)) + ' 에너지' : '');
  if(bump) bumpEl(wallet);
  if(s.shopOpen) paintShop();
  if(view === 'factory') paintFactory();
  if(view === 'research') paintResearch();
  dot.classList.toggle('show', !s.shopOpen && anyAffordable());
}

/* ── 루프 ─────────────────────────────────────── */
let last = performance.now(), acc = 0, botAcc = 0, chatAt = 0, tick = 0, typeSig = '';

function breakCombo(){ s.combo = 0; }

function loop(now){
  normalize();
  const raw = now - last;
  const dt = Math.min(raw/1000, 0.5); last = now;
  if(raw > 2500) breakCombo();   // 탭 전환 등으로 루프가 멈췄던 경우

  const br = botRate(s);
  if(br > 0){ s.jamu += br*dt; s.total += br*dt; }
  const ber = botEnergyRate(s);                                  // 매크로 발전 연구
  if(ber > 0){ s.energy += ber*dt; s.energyTotal += ber*dt; }

  if(s.bot > 0 && !s.botMute){
    botAcc += dt * Math.min(s.bot * overMul(s) / 5, 3);
    if(botAcc >= 1 && now - chatAt > 280){
      botAcc = 0; chatAt = now;
      const [n,c,seed] = randNick();
      emoteRow(body('b:'+n, n+'의 매크로', c, seed, false, true), 0, '', false);
    }
  }

  if(now > tick + 60){
    tick = now;
    if(Math.random() < 0.012 + Math.min(s.total/4e6, 0.02)){
      const [n,c,seed] = randNick();
      if(Math.random() < 0.3) emoteRow(body('e:'+n, n, c, seed, false, false), 0, '', false);
      else textMsg(n, c, seed, LINES[Math.floor(Math.random()*LINES.length)]);
    }
  }

  // 황금 쨔무쨔무
  if(s.r_gold){
    if(!goldAt) goldAt = now + goldDelay();
    else if(!goldLive && now >= goldAt) spawnGold(now);
  }
  if(goldLive && now > goldGone) expireGold(now);
  const goldLeft = goldUntil - now;
  goldTag.hidden = goldLeft <= 0;
  if(goldLeft > 0) goldTag.textContent = '황금 ×10 · ' + Math.ceil(goldLeft/1000) + '초';

  const cd = cooldown(s)*1000, left = readyAt - now;
  if(left > 0){
    sendBtn.classList.remove('ready');
    fill.style.width = Math.max(0, 100 - left/cd*100) + '%';
    sendLbl.textContent = (left/1000).toFixed(1) + '초';
  }else{
    sendBtn.classList.add('ready');
    fill.style.width = '0%';
    sendLbl.textContent = '쨔무쨔무';
  }

  const win = comboWin(s);
  if(s.combo > 0 && now > readyAt + win) s.combo = 0;

  // 입력 중 / 콤보 표시
  if(s.combo > 0){
    const w = now < readyAt ? 1 : Math.max(0, (readyAt + win - now)/win);
    typingEl.innerHTML = '<span class="combo">연타 콤보 ×' + s.combo + '/' + comboCap(s) + ' · 획득량 +' +
      Math.round((comboMul()-1)*100) + '%<span class="win"><i style="transform:scaleX(' +
      w.toFixed(3) + ')"></i></span></span>';
    typeSig = 'combo';
  }else{
    const sig = s.bot > 0 ? (s.botMute ? 'mute' : 'on') + s.bot : 'none';
    if(sig !== typeSig){
      typeSig = sig;
      typingEl.innerHTML = s.bot === 0 ? ''
        : '<span class="bub"><i></i><i></i><i></i></span>매크로 ' + fmt(s.bot) + '대가 입력 중입니다' +
          (s.botMute ? ' · 메시지 숨김' : '');
    }
  }

  acc += dt;
  if(acc > 0.125){ acc = 0; paintWallet(false); }
  requestAnimationFrame(loop);
}

/* ── 저장 ─────────────────────────────────────── */
let savedOnce = false;
function writeSave(){ s.ts = Date.now(); localStorage.setItem(KEY, JSON.stringify(s)); savedOnce = true; }
function save(){
  try{
    // 이번 세션에 저장한 적이 있는데 세이브가 사라졌다 = 콘솔 등에서 지운 것.
    // 메모리 상태로 덮어쓰면 지운 세이브가 되살아나므로, 대신 게임을 초기화한다.
    if(savedOnce && localStorage.getItem(KEY) === null){ doReset(); return; }
    writeSave();
  }catch(e){}
}
const notices = [];
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return false;
    const o = JSON.parse(raw);
    if(!o || typeof o.jamu !== 'number') return false;
    s = Object.assign(fresh(), o); s.combo = 0;
    normalize();
    if('botOff' in s){ s.botMute = !!s.botOff; delete s.botOff; }   // 매크로 끄기 → 메시지 숨김으로 변경

    const away = Math.min((Date.now() - (o.ts||Date.now()))/1000, (s.r_away ? 24 : 8)*3600);
    const earned = botRate(s) * away;
    if(earned > 0 && away > 60){
      s.jamu += earned; s.total += earned;
      notices.push('자리를 비운 ' + Math.floor(away/60) + '분 동안 매크로가 <b>' + fmt(earned) + ' 쨔무</b>를 모았습니다.');
    }
    return true;
  }catch(e){ return false; }
}
setInterval(save, 5000);
addEventListener('visibilitychange', ()=>{ if(document.hidden){ breakCombo(); save(); } });
addEventListener('pagehide', save);
addEventListener('resize', updateScrim);

// 처음부터: 첫 클릭에 경고 alert → 3초 안에 한 번 더 누르면 초기화
// (alert가 막힌 환경에서도 두 번 눌러 확인하는 절차는 그대로 동작)
const RESET_WARNING =
  '⚠️ 게임 초기화 경고\n\n' +
  "'처음부터'는 게임을 완전히 초기화하며 되돌릴 수 없습니다.\n\n" +
  "정말 초기화하려면 확인을 누른 뒤 3초 안에 '처음부터'를 한 번 더 누르세요.";
const resetBtn = document.getElementById('reset');
let resetAt = 0, resetUntil = 0, resetTimer = 0;
resetBtn.addEventListener('click', ()=>{
  const now = performance.now();
  if(now < resetUntil && now - resetAt > 400){ clearTimeout(resetTimer); disarmReset(); doReset(); return; }
  if(now < resetUntil) return;
  alert(RESET_WARNING);
  // alert를 닫은 시점부터 3초를 센다 (경고를 읽는 동안 시간이 지나가지 않도록)
  resetAt = performance.now(); resetUntil = resetAt + 3000;
  resetBtn.textContent = '한 번 더 누르면 초기화'; resetBtn.classList.add('armed');
  clearTimeout(resetTimer);
  resetTimer = setTimeout(disarmReset, 3000);
});
function disarmReset(){ resetUntil = 0; resetBtn.textContent = '처음부터'; resetBtn.classList.remove('armed'); }
function doReset(){
  try{ localStorage.removeItem(KEY); }catch(e){}
  s = fresh(); shopCache.sig = ''; facCache.sig = ''; resCache.sig = ''; lastRank = ''; readyAt = 0;
  lastKey = ''; curBody = null; armUntil = 0; clearGold();
  log.innerHTML = ''; intro(); setView('main'); setShop(s.shopOpen); paintWallet();
  try{ writeSave(); }catch(e){}
}

/* ── 저장 데이터: 내보내기 / 가져오기 ─────────────── */
const SAVE_PREFIX = 'JJAMU1:';
function b64enc(str){ let bin = ''; new TextEncoder().encode(str).forEach(b=>bin += String.fromCharCode(b)); return btoa(bin); }
function b64dec(b64){ const bin = atob(b64); return new TextDecoder().decode(Uint8Array.from(bin, c=>c.charCodeAt(0))); }
function encodeSave(){ s.ts = Date.now(); return SAVE_PREFIX + b64enc(JSON.stringify(s)); }
function decodeSave(text){
  text = String(text || '').trim();
  if(!text) return {err:'empty'};
  try{
    let json;
    if(text[0] === '{') json = text;                                  // JSON을 그대로 붙여넣은 경우
    else{
      if(text.indexOf(SAVE_PREFIX) === 0) text = text.slice(SAVE_PREFIX.length);
      json = b64dec(text.replace(/\s+/g, ''));
    }
    const o = JSON.parse(json);
    if(!o || typeof o !== 'object' || typeof o.jamu !== 'number' || !isFinite(o.jamu)) return {err:'invalid'};
    return {data:o};
  }catch(e){ return {err:'invalid'}; }
}
function applyImport(o){
  const keepShop = s.shopOpen, base = fresh(), clean = {};
  if('botOff' in o && !('botMute' in o)) o.botMute = !!o.botOff;     // 이전 버전 세이브
  for(const k in base) if(k in o) clean[k] = o[k];                    // 알 수 없는 항목은 버린다
  s = Object.assign(base, clean);
  normalize();
  s.shopOpen = keepShop; s.combo = 0;
  readyAt = 0; lastRank = ''; armUntil = 0; botAcc = 0; typeSig = ''; clearGold();
  shopCache.sig = ''; facCache.sig = ''; lastKey = ''; curBody = null;
  closeData();
  setView('main'); setShop(s.shopOpen);
  sysMsg('저장 데이터를 불러왔습니다.', true);
  checkUnlocks(); paintWallet();
  try{ writeSave(); }catch(e){}
}

const dataModal = document.getElementById('dataModal'), dataBtn = document.getElementById('dataBtn'),
      exportCode = document.getElementById('exportCode'), exportMsg = document.getElementById('exportMsg'),
      exportCopy = document.getElementById('exportCopy'), exportFile = document.getElementById('exportFile'),
      importCode = document.getElementById('importCode'), importMsg = document.getElementById('importMsg'),
      importGo = document.getElementById('importGo'), importFile = document.getElementById('importFile'),
      importFileBtn = document.getElementById('importFileBtn');

// 아티팩트처럼 다른 페이지 안에 끼워진 경우엔 파일 저장이 막혀 있으므로 버튼을 숨긴다
let embedded = true;
try{ embedded = window.self !== window.top; }catch(e){}
exportFile.hidden = embedded;

function setMsg(el, text, kind){ el.textContent = text; el.className = 'dmsg' + (kind ? ' ' + kind : ''); }
function openData(){
  exportCode.value = encodeSave();
  importCode.value = '';
  setMsg(exportMsg, ''); setMsg(importMsg, ''); disarmImport();
  dataModal.hidden = false;
  exportCopy.focus();
}
function closeData(){
  if(dataModal.hidden) return;
  dataModal.hidden = true; disarmImport();
  if(document.activeElement) document.activeElement.blur();          // Enter가 다시 전송으로 가도록
}
dataBtn.addEventListener('click', openData);
dataModal.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click', closeData));
addEventListener('keydown', e=>{ if(e.key === 'Escape' && modalOpen()) closeData(); });

exportCopy.addEventListener('click', async ()=>{
  exportCode.focus(); exportCode.select();
  let ok = false;
  try{ await navigator.clipboard.writeText(exportCode.value); ok = true; }catch(e){}
  if(!ok){ try{ ok = document.execCommand('copy'); }catch(e){} }
  setMsg(exportMsg, ok ? '복사했습니다.' : '자동 복사가 막혀 있습니다. 선택된 코드를 직접 복사해 주세요.', ok ? 'ok' : 'err');
});
exportFile.addEventListener('click', ()=>{
  const pad = n=>String(n).padStart(2, '0'), t = new Date();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([exportCode.value], {type:'text/plain'}));
  a.download = 'jjamu-save-' + t.getFullYear() + pad(t.getMonth()+1) + pad(t.getDate()) + '-' + pad(t.getHours()) + pad(t.getMinutes()) + '.txt';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  setMsg(exportMsg, '파일로 저장했습니다.', 'ok');
});

// 가져오기: 코드를 확인해 요약을 보여주고, 한 번 더 누르면 덮어쓴다
let impData = null, impAt = 0, impUntil = 0, impTimer = 0;
function disarmImport(){
  impData = null; impUntil = 0; clearTimeout(impTimer);
  importGo.textContent = '불러오기'; importGo.classList.remove('armed');
}
function checkImport(){
  const r = decodeSave(importCode.value);
  if(r.err){
    setMsg(importMsg, r.err === 'empty' ? '저장 코드를 붙여넣거나 파일을 열어 주세요.'
                                        : '올바른 저장 코드가 아닙니다. 코드를 빠짐없이 붙여넣었는지 확인해 주세요.', 'err');
    return;
  }
  const o = r.data, num = v=>(typeof v === 'number' && isFinite(v)) ? v : 0;
  const parts = [];
  if(num(o.reb) > 0) parts.push('환생 ' + Math.floor(num(o.reb)) + '회');   // 환생 전 기록이면 언급하지 않음
  parts.push('보유 ' + fmt(num(o.jamu)) + ' 쨔무', '누적 ' + fmt(num(o.total)) + ' 쨔무');
  setMsg(importMsg, parts.join(' · ') + ' 기록입니다. 한 번 더 누르면 지금 진행 상황을 덮어씁니다.', 'ok');
  impData = o; impAt = performance.now(); impUntil = impAt + 5000;
  importGo.textContent = '한 번 더 누르면 덮어쓰기'; importGo.classList.add('armed');
  clearTimeout(impTimer);
  impTimer = setTimeout(()=>{ disarmImport(); setMsg(importMsg, ''); }, 5000);
}
importGo.addEventListener('click', ()=>{
  const now = performance.now();
  if(impData && now < impUntil){
    if(now - impAt < 400) return;                                     // 연타로 확인을 건너뛰지 않게
    const o = impData; disarmImport(); applyImport(o); return;
  }
  checkImport();
});
importCode.addEventListener('input', ()=>{ disarmImport(); setMsg(importMsg, ''); });
importFileBtn.addEventListener('click', ()=>importFile.click());
importFile.addEventListener('change', ()=>{
  const f = importFile.files && importFile.files[0];
  importFile.value = '';
  if(!f) return;
  const rd = new FileReader();
  rd.onload = ()=>{ importCode.value = String(rd.result).trim(); disarmImport(); checkImport(); };
  rd.onerror = ()=>setMsg(importMsg, '파일을 읽지 못했습니다.', 'err');
  rd.readAsText(f);
});

/* ── 시작 ─────────────────────────────────────── */
function intro(){
  sysMsg('<b>나</b>님이 서버에 참여했습니다. 환영합니다!');
  textMsg('뚜벅이', '#9fe3f2', 4, '오늘도 쨔무쨔무 도배하러 왔습니다');
  sysMsg('보내기 버튼(또는 Enter)으로 <b>:쨔무쨔무:</b>를 전송하세요. 한 번에 1 쨔무를 받습니다.');
}
const loaded = load();
intro();
if(loaded) sysMsg('이전 기록을 불러왔습니다.');
notices.forEach(n=>sysMsg(n, true));
checkUnlocks();
setView('main');
setShop(!!s.shopOpen);
paintWallet();
requestAnimationFrame(loop);
