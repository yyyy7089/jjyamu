const EMOTE = "jjamu.png";
['srvIcon','meAv','draftEmote','facEmote'].forEach(id=>document.getElementById(id).src = EMOTE);

/* ── 쨔무 업그레이드 (환생 시 초기화) ─────────────── */
const UP = [
  { id:'thumb', grp:'손가락', name:'쨔무 굳은살', max:28, unlock:0,
    cost:n=>Math.ceil(6*Math.pow(1.55,n)),
    desc:'전송 쿨타임이 7%씩 줄어든다.',
    now:s=>'쿨타임 '+cooldown(s).toFixed(2)+'초' },

  { id:'amp', grp:'손가락', name:'쨔무 증폭기', max:999, unlock:0,
    cost:n=>Math.ceil(24*Math.pow(1.42,n)),
    desc:'한 번 보낼 때 얻는 쨔무가 1 늘어난다.',
    now:s=>'전송당 '+fmt(perSend(s))+' 쨔무' },

  { id:'crit', grp:'손가락', name:'크리티컬 쨔무쨔무', max:40, unlock:2500,
    cost:n=>Math.ceil(500*Math.pow(1.75,n)),
    desc:'1%p 확률로 더 큰 쨔무쨔무가 전송되어 획득량이 10배가 된다.',
    now:s=>'확률 '+s.crit+'%' },

  { id:'react', grp:'손가락', name:'쨔무 리액션', max:40, unlock:30000,
    cost:n=>Math.ceil(2000*Math.pow(1.75,n)),
    desc:'1%p 확률로 서버 주인이 내 쨔무쨔무에 반응해 획득량이 10배가 된다. 크리티컬과 같이 터지면 100배.',
    now:s=>'확률 '+s.react+'%' },

  { id:'cap', grp:'손가락', name:'쨔무 연타 근성', max:15, unlock:5000,
    cost:n=>Math.ceil(1500*Math.pow(2.2,n)),
    desc:'연타 콤보 상한이 10 올라간다.',
    now:s=>'콤보 상한 '+comboCap(s) },

  { id:'bot', grp:'자동화', name:'쨔무 자동완성 매크로', max:10, unlock:90,
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

  { id:'e_conv', grp:'생산 설비', name:'쨔무 컨베이어', max:40,
    cost:n=>Math.ceil(80*Math.pow(1.6,n)),
    desc:'매크로가 버는 쨔무가 25%씩 늘어난다.',
    now:s=>'매크로 수익 ×'+(1+0.25*s.e_conv).toFixed(2) },

  { id:'e_press', grp:'생산 설비', name:'쨔무 압축기', max:40,
    cost:n=>Math.ceil(100*Math.pow(1.7,n)),
    desc:'모든 쨔무 획득량이 25%씩 늘어난다.',
    now:s=>'획득량 ×'+(1+0.25*s.e_press).toFixed(2) },

  { id:'e_fund', grp:'환생 설비', name:'쨔무 비상금', max:5,
    cost:n=>Math.ceil(200*Math.pow(5,n)),
    desc:'환생 직후 쨔무를 들고 시작한다. 레벨마다 10배.',
    now:s=>'시작 쨔무 '+fmt(fundBonus(s)) },
];

const RANKS = [
  [0,'뉴비'],[150,'눈팅 탈출'],[1200,'채팅 참여러'],[9000,'이모티콘 애호가'],
  [70000,'도배 견습생'],[600000,'쨔무 장인'],[2e7,'채팅방 지배자'],[5e8,'쨔무 중독자'],
  [2e10,'쨔무 재벌'],[5e11,'쨔무의 신'],[1e14,'쨔무 그 자체']
];

/* ── 상태 ─────────────────────────────────────── */
const KEY = 'jjamu-save-v1';
let s = fresh();
function fresh(){
  const o = { jamu:0, total:0, sends:0, combo:0, shopOpen:innerWidth>880, seen:{},
              reb:0, energy:0, energyTotal:0, facSeen:0, botMute:false, ts:Date.now() };
  UP.forEach(u=>o[u.id]=0);
  EUP.forEach(u=>o[u.id]=0);
  return o;
}
function baseCd(st){ return 4*Math.pow(0.92, st.e_cool); }
function cooldown(st){ return Math.max(0.35, baseCd(st)*Math.pow(0.93, st.thumb)); }
function rebMul(st){ return 1 + st.reb; }                       // 환생 배율: 선형 증가
function gMul(st){ return (1 + 0.12*st.fan) * Math.pow(2, st.meme) * rebMul(st) * (1 + 0.25*st.e_press); }
function overMul(st){ return Math.pow(1.2, st.over); }
function perSend(st){ return (1 + st.amp) * gMul(st); }
function botRate(st){ return st.bot * 0.2 * overMul(st) * gMul(st) * (1 + 0.25*st.e_conv); }
function comboCap(st){ return 50 + 10*st.cap; }
function comboWin(st){ return 1800 + 300*st.e_combo; }          // ms
function comboMul(){ return 1 + Math.min(s.combo, comboCap(s))*0.02; }
function rebCost(st){ return 1e6 * Math.pow(10, st.reb); }      // 100만 → ×10씩
function energyPer(st){ return st.reb > 0 ? Math.pow(2, st.reb - 1) : 0; }
function fundBonus(st){ return st.e_fund > 0 ? 1000*Math.pow(10, st.e_fund - 1) : 0; }
function rebVisible(){ return s.total >= 1e5 || s.reb > 0; }

function fmt(n){
  n = Math.floor(n);
  if(n < 10000) return n.toLocaleString('ko-KR');
  const u = [[1e20,'해'],[1e16,'경'],[1e12,'조'],[1e8,'억'],[1e4,'만']];
  for(const [v,name] of u){
    if(n >= v){ const q = n/v; return (q>=100 ? Math.floor(q).toLocaleString('ko-KR') : (Math.round(q*10)/10)) + name; }
  }
  return String(n);
}
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
function emoteRow(bd, gain, kind, anim, energy){
  kind = kind || '';
  const row = document.createElement('div');
  row.className = 'row' + (kind ? ' ' + kind : '') + (anim ? ' new' : '');
  const img = document.createElement('img');
  img.src = EMOTE; img.alt = '쨔무쨔무'; img.draggable = false;
  row.appendChild(img);
  if(gain){
    const g = document.createElement('span');
    g.className = 'gain';
    if(kind.indexOf('crit') >= 0) g.appendChild(badge('크리티컬 ×10', 'crit'));
    if(kind.indexOf('owner') >= 0) g.appendChild(badge('👑 주인장 반응 ×10', 'own'));
    g.appendChild(document.createTextNode('+' + fmt(gain) + ' 쨔무'));
    if(energy){
      const e = document.createElement('span');
      e.className = 'en'; e.textContent = '+' + fmt(energy) + ' 에너지';
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
});

/* ── 보내기 ───────────────────────────────────── */
const sendBtn = document.getElementById('send'), fill = document.getElementById('fill'),
      sendLbl = document.getElementById('sendLbl'), wallet = document.getElementById('wallet'),
      draftX = document.getElementById('draftX');
let readyAt = 0;

function send(){
  const now = performance.now();
  if(now < readyAt) return;
  // 콤보 창은 [readyAt, readyAt + comboWin] — 화면 갱신 여부와 무관하게 판정
  if(s.combo > 0 && now <= readyAt + comboWin(s)) s.combo = Math.min(s.combo + 1, comboCap(s));
  else s.combo = 1;

  const big = s.crit > 0 && Math.random() < s.crit*0.01;
  const own = s.react > 0 && Math.random() < s.react*0.01;
  const gain = perSend(s) * comboMul() * (big ? 10 : 1) * (own ? 10 : 1);
  s.jamu += gain; s.total += gain; s.sends++;

  // 손으로 직접 보낼 때만 쨔무 에너지 생성: 2^(환생 - 1)
  const eg = energyPer(s);
  if(eg){ s.energy += eg; s.energyTotal += eg; }

  const kind = ((big ? 'crit ' : '') + (own ? 'owner' : '')).trim();
  const row = emoteRow(body('me','나',null,0,true,false), gain, kind, true, eg);
  const pills = [];
  if(own) pills.push({own:true});
  if(big) pills.push({n: 3 + Math.floor(Math.random()*20)});
  if(!pills.length && s.fan > 0 && Math.random() < Math.min(0.04 + s.fan*0.01, 0.3))
    pills.push({n: 1 + Math.floor(Math.random()*s.fan)});
  if(pills.length) reactTo(row, pills);

  readyAt = now + cooldown(s)*1000;
  paintWallet(true); checkUnlocks();
  if(eg && view === 'factory') bumpEl(energyEl);
  if(s.sends === 3) sysMsg('오른쪽 위 <b>상점</b>에서 모은 쨔무를 업그레이드에 쓸 수 있습니다.');
}
sendBtn.addEventListener('click', send);
let keyHeld = false;
function isKey(e){ return e.key === 'Enter' || e.key === ' '; }
function otherBtn(e){
  const b = e.target.closest && e.target.closest('button');
  return b && b !== sendBtn;          // 상점 버튼 등은 기본 동작에 맡긴다
}
addEventListener('keydown', e=>{
  if(!isKey(e) || otherBtn(e)) return;
  e.preventDefault();                 // 스크롤·버튼 기본 동작 차단
  if(e.repeat || keyHeld) return;     // 누르고 있는 동안에는 한 번만
  keyHeld = true;
  send();
});
addEventListener('keyup', e=>{
  if(!isKey(e) || otherBtn(e)) return;
  e.preventDefault();
  keyHeld = false;
});
addEventListener('blur', ()=>{ keyHeld = false; });

/* ── 매크로 스위치 ────────────────────────────── */
const macroBtn = document.getElementById('macroBtn');
function paintMacroBtn(){
  macroBtn.hidden = s.bot < 1;
  macroBtn.classList.toggle('on', !s.botMute);
  macroBtn.setAttribute('aria-pressed', String(!s.botMute));
  macroBtn.title = s.botMute ? '매크로 메시지 보이기' : '매크로 메시지 숨기기';
  log.classList.toggle('mute-macro', !!s.botMute);
}
macroBtn.addEventListener('click', e=>{
  s.botMute = !s.botMute;
  botAcc = 0;
  sysMsg(s.botMute ? '매크로 메시지를 숨깁니다. 매크로는 계속 쨔무를 법니다.'
                   : '매크로 메시지를 다시 표시합니다.');
  paintWallet(); save();
  if(stick() || s.botMute) log.scrollTop = log.scrollHeight;
  if(e.detail > 0) macroBtn.blur();   // 마우스로 눌렀으면 포커스를 풀어 Enter가 전송으로 가게
});

/* ── 채널 · 화면 전환 ─────────────────────────── */
const side = document.getElementById('side'), menuBtn = document.getElementById('menuBtn'),
      menuDot = document.getElementById('menuDot'), scrim = document.getElementById('scrim'),
      chName = document.getElementById('chName'), chFactory = document.getElementById('chFactory'),
      facNew = document.getElementById('facNew'), topicMain = document.getElementById('topicMain'),
      topicFac = document.getElementById('topicFac'), factoryEl = document.getElementById('factory');
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
  if(v === 'factory' && s.reb < 1) v = 'main';
  view = v;
  log.hidden = v !== 'main';
  factoryEl.hidden = v !== 'factory';
  topicMain.hidden = v !== 'main';
  topicFac.hidden = v !== 'factory';
  chName.textContent = v === 'main' ? '쨔무쨔무-도배' : '쨔무-공장';
  document.querySelectorAll('.ch[data-ch]').forEach(b=>b.classList.toggle('on', b.dataset.ch === v));
  if(v === 'factory'){ s.facSeen = 1; paintFactory(); }
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
    if(k === 'main' || k === 'factory'){ setView(k); return; }
    setView('main');
    if(k === 'credit'){ credits(); return; }
    sysMsg(CH_MSG[k]);
    if(k === 'info') setShop(true);
  });
});
function paintChannels(){
  chFactory.hidden = s.reb < 1;
  facNew.hidden = !!s.facSeen;
  menuDot.classList.toggle('show', s.reb >= 1 && !s.facSeen);
}

/* ── 업그레이드 목록 공통 렌더러 ─────────────────── */
function renderList(el, list, cache, have, unit, onBuy){
  const sig = list.map(u=>u.id+':'+s[u.id]).join('|');
  if(sig !== cache.sig){
    cache.sig = sig; el.innerHTML = ''; let grp = '';
    list.forEach(u=>{
      if(u.grp !== grp){
        grp = u.grp;
        const h = document.createElement('div'); h.className = 'grp'; h.textContent = grp;
        el.appendChild(h);
      }
      const lv = s[u.id], maxed = lv >= u.max;
      const b = document.createElement('button');
      b.className = 'item' + (maxed ? ' maxed' : ''); b.dataset.id = u.id;
      b.innerHTML = '<span class="top"><span class="nm"></span><span class="cost"></span></span>'+
        '<p class="ds"></p><span class="bt"><span class="lv"></span>'+
        '<span class="track"><i></i></span><span class="now"></span></span>';
      b.querySelector('.nm').textContent = u.name;
      b.querySelector('.ds').textContent = u.desc;
      b.querySelector('.cost').textContent = maxed ? '완료' : fmt(u.cost(lv)) + ' ' + unit;
      b.querySelector('.lv').textContent = u.max < 900 ? 'Lv.'+lv+'/'+u.max : 'Lv.'+lv;
      b.querySelector('.track i').style.width = (u.max < 900 ? Math.min(lv/u.max*100, 100) : Math.min(lv*2,100)) + '%';
      b.disabled = maxed;
      if(!maxed) b.addEventListener('click', ()=>onBuy(u));
      el.appendChild(b);
    });
  }
  el.querySelectorAll('.item[data-id]').forEach(b=>{
    const u = list.find(x=>x.id === b.dataset.id);
    if(!u) return;
    b.querySelector('.now').textContent = u.now(s);
    const lv = s[u.id];
    if(lv >= u.max) return;
    const can = have() >= u.cost(lv);
    b.classList.toggle('can', can); b.disabled = !can;
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

function visible(u){ return s.total >= u.unlock || s[u.id] > 0; }
function buy(u){
  const lv = s[u.id];
  if(lv >= u.max) return;
  const c = u.cost(lv);
  if(s.jamu < c) return;
  s.jamu -= c; s[u.id] = lv + 1;
  paintWallet(); paintShop();
  sysMsg('<b>'+u.name+'</b> Lv.'+(lv+1)+' 구매 — '+u.now(s), true);
}
function paintShop(){
  renderList(shopList, UP.filter(visible), shopCache, ()=>s.jamu, '쨔무', buy);
  paintRebirth();
}
function anyAffordable(){
  return UP.some(u=>visible(u) && s[u.id] < u.max && s.jamu >= u.cost(s[u.id])) ||
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
    '요구량보다 많이 모아도 한 번에 1회만 환생한다.' +
    (s.reb === 0 ? ' 첫 환생 시 #쨔무-공장이 열린다.' : '');
  rebLv.textContent = s.reb + '회';
  rebBar.style.width = Math.min(s.jamu/cost*100, 100) + '%';
  rebNow.textContent = '배율 ×' + rebMul(s) + ' → ×' + (rebMul(s) + 1);
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

function rebirth(){
  if(s.jamu < rebCost(s)) return;          // 한 번 호출에 정확히 1회만
  const first = s.reb === 0;
  s.reb += 1;
  UP.forEach(u=>s[u.id] = 0);
  s.jamu = fundBonus(s);
  s.combo = 0; readyAt = 0;
  shopCache.sig = ''; facCache.sig = '';
  sysMsg('<b>쨔무 환생 ' + s.reb + '회</b> 완료! 모든 쨔무 획득량 ×' + rebMul(s) +
    (s.jamu > 0 ? ', 비상금 ' + fmt(s.jamu) + ' 쨔무로 시작합니다.' : '.'), true);
  if(first){
    sysMsg('새 채널 <button class="mention" data-goto="factory">#쨔무-공장</button>이 생겼습니다. ' +
      '이제 손으로 직접 보낸 쨔무쨔무가 <b>쨔무 에너지</b>를 만듭니다.', true);
  }else{
    sysMsg('손으로 보낼 때마다 쨔무 에너지 <b>+' + fmt(energyPer(s)) + '</b>', true);
  }
  paintChannels(); paintWallet(); save();
}

/* ── 쨔무 공장 ────────────────────────────────── */
const energyEl = document.getElementById('energy'), facSub = document.getElementById('facSub'),
      facStats = document.getElementById('facStats'), facList = document.getElementById('facList');
const facCache = {sig:''};

function buyE(u){
  const lv = s[u.id];
  if(lv >= u.max) return;
  const c = u.cost(lv);
  if(s.energy < c) return;
  s.energy -= c; s[u.id] = lv + 1;
  paintFactory(); paintWallet();
  sysMsg('<b>'+u.name+'</b> Lv.'+(lv+1)+' 설치 — '+u.now(s), true);
}
function paintFactory(){
  energyEl.textContent = fmt(s.energy);
  facSub.textContent = '손으로 보낼 때마다 +' + fmt(energyPer(s)) + ' 에너지';
  facStats.innerHTML =
    '<div class="stat"><span>쨔무 환생</span><b>' + s.reb + '회</b></div>' +
    '<div class="stat"><span>환생 배율</span><b>×' + rebMul(s) + '</b></div>' +
    '<div class="stat"><span>전송당 에너지</span><b>' + fmt(energyPer(s)) + '</b><small>2^(' + s.reb + '−1)</small></div>' +
    '<div class="stat"><span>다음 환생</span><b>' + fmt(rebCost(s)) + '</b><small>쨔무</small></div>';
  renderList(facList, EUP, facCache, ()=>s.energy, '에너지', buyE);
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
    (s.reb > 0 ? ' · ' + fmt(energyPer(s)) + ' 에너지' : '');
  if(bump) bumpEl(wallet);
  if(s.shopOpen) paintShop();
  if(view === 'factory') paintFactory();
  dot.classList.toggle('show', !s.shopOpen && anyAffordable());
}

/* ── 루프 ─────────────────────────────────────── */
let last = performance.now(), acc = 0, botAcc = 0, chatAt = 0, tick = 0, typeSig = '';

function breakCombo(){ s.combo = 0; }

function loop(now){
  const raw = now - last;
  const dt = Math.min(raw/1000, 0.5); last = now;
  if(raw > 2500) breakCombo();   // 탭 전환 등으로 루프가 멈췄던 경우

  const br = botRate(s);
  if(br > 0){ s.jamu += br*dt; s.total += br*dt; }

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
function save(){ try{ s.ts = Date.now(); localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }
const notices = [];
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return false;
    const o = JSON.parse(raw);
    if(!o || typeof o.jamu !== 'number') return false;
    s = Object.assign(fresh(), o); s.combo = 0;
    if('botOff' in s){ s.botMute = !!s.botOff; delete s.botOff; }   // 매크로 끄기 → 메시지 숨김으로 변경

    const away = Math.min((Date.now() - (o.ts||Date.now()))/1000, 8*3600);
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

// 처음부터: 두 번 눌러 확인 (브라우저 확인창은 일부 환경에서 막혀 있어 쓰지 않음)
const resetBtn = document.getElementById('reset');
let resetAt = 0, resetUntil = 0, resetTimer = 0;
resetBtn.addEventListener('click', ()=>{
  const now = performance.now();
  if(now < resetUntil && now - resetAt > 400){ clearTimeout(resetTimer); disarmReset(); doReset(); return; }
  if(now < resetUntil) return;
  resetAt = now; resetUntil = now + 3000;
  resetBtn.textContent = '한 번 더 누르면 초기화'; resetBtn.classList.add('armed');
  resetTimer = setTimeout(disarmReset, 3000);
});
function disarmReset(){ resetUntil = 0; resetBtn.textContent = '처음부터'; resetBtn.classList.remove('armed'); }
function doReset(){
  try{ localStorage.removeItem(KEY); }catch(e){}
  s = fresh(); shopCache.sig = ''; facCache.sig = ''; lastRank = ''; readyAt = 0;
  lastKey = ''; curBody = null; armUntil = 0;
  log.innerHTML = ''; intro(); setView('main'); setShop(s.shopOpen); paintWallet();
}

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
