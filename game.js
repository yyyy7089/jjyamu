const EMOTE = "jjamu.png";
['srvIcon','meAv','draftEmote'].forEach(id=>document.getElementById(id).src = EMOTE);

/* ── 업그레이드 정의 ───────────────────────────── */
const UP = [
  { id:'thumb', grp:'손가락', name:'엄지 굳은살', max:28, unlock:0,
    cost:n=>Math.ceil(6*Math.pow(1.55,n)),
    desc:'전송 쿨타임이 7%씩 줄어든다.',
    now:s=>'쿨타임 '+cooldown(s).toFixed(2)+'초' },

  { id:'amp', grp:'손가락', name:'쨔무 증폭기', max:999, unlock:0,
    cost:n=>Math.ceil(24*Math.pow(1.42,n)),
    desc:'한 번 보낼 때 얻는 쨔무가 1 늘어난다.',
    now:s=>'전송당 '+fmt(perSend(s))+' 쨔무' },

  { id:'crit', grp:'손가락', name:'서버 주인 반응', max:20, unlock:2500,
    cost:n=>Math.ceil(700*Math.pow(2.3,n)),
    desc:'4% 확률로 서버 주인이 반응해 쨔무를 10배로 받는다.',
    now:s=>'확률 '+(s.crit*4)+'%' },

  { id:'bot', grp:'자동화', name:'자동 완성 매크로', max:999, unlock:90,
    cost:n=>Math.ceil(110*Math.pow(1.15,n)),
    desc:'5초마다 알아서 쨔무쨔무를 한 번 보낸다.',
    now:s=>'매크로 '+s.bot+'대' },

  { id:'over', grp:'자동화', name:'오버클럭', max:15, unlock:900,
    cost:n=>Math.ceil(900*Math.pow(2.0,n)),
    desc:'모든 매크로가 20%씩 빨라진다.',
    now:s=>'속도 ×'+overMul(s).toFixed(2) },

  { id:'fan', grp:'서버', name:'따라치는 서버원', max:40, unlock:350,
    cost:n=>Math.ceil(260*Math.pow(1.8,n)),
    desc:'따라 치는 사람이 늘어 모든 쨔무 획득량이 12% 늘어난다.',
    now:s=>'획득량 ×'+gMul(s).toFixed(2) },

  { id:'meme', grp:'서버', name:'밈 유행', max:10, unlock:25000,
    cost:n=>Math.ceil(24000*Math.pow(8,n)),
    desc:'쨔무쨔무가 유행을 타 모든 쨔무 획득량이 2배가 된다.',
    now:s=>'유행 ×'+Math.pow(2,s.meme) },
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
  const o = { jamu:0, total:0, sends:0, combo:0, shopOpen:innerWidth>880, seen:{}, ts:Date.now() };
  UP.forEach(u=>o[u.id]=0);
  return o;
}
function cooldown(st){ return Math.max(0.35, 4*Math.pow(0.93, st.thumb)); }
function gMul(st){ return (1 + 0.12*st.fan) * Math.pow(2, st.meme); }
function overMul(st){ return Math.pow(1.2, st.over); }
function perSend(st){ return (1 + st.amp) * gMul(st); }
function botRate(st){ return st.bot * 0.2 * overMul(st) * gMul(st); }
function comboMul(){ return 1 + Math.min(s.combo,50)*0.02; }

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
function openGroup(nick, color, seed, mine, bot){
  const li = document.createElement('li');
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
function contGroup(){
  const li = document.createElement('li');
  const msg = document.createElement('div');
  msg.className = 'msg tight';
  const sp = document.createElement('span'); sp.className = 'av'; sp.style.visibility = 'hidden';
  const bd = document.createElement('div'); bd.className = 'bd';
  msg.append(sp, bd); li.appendChild(msg); place(li);
  return bd;
}
function body(key, nick, color, seed, mine, bot){
  const now = Date.now();
  if(key === lastKey && curBody && now - lastAt < 90000 && groupRows < 9){
    lastAt = now; groupRows++;
    return contGroup();
  }
  lastKey = key; lastAt = now; groupRows = 0;
  curBody = openGroup(nick, color, seed, mine, bot);
  return curBody;
}
function emoteRow(bd, gain, crit, anim){
  const row = document.createElement('div');
  row.className = 'row' + (crit ? ' crit' : '') + (anim ? ' new' : '');
  const img = document.createElement('img');
  img.src = EMOTE; img.alt = '쨔무쨔무'; img.draggable = false;
  row.appendChild(img);
  if(gain){
    const g = document.createElement('span');
    g.className = 'gain'; g.textContent = (crit ? '크리티컬! +' : '+') + fmt(gain) + ' 쨔무';
    row.appendChild(g);
  }
  bd.appendChild(row);
  if(stick()) log.scrollTop = log.scrollHeight;
  return row;
}
function reactTo(row, n){
  const wrap = document.createElement('div'); wrap.className = 'reacts';
  const r = document.createElement('span'); r.className = 'react';
  const im = document.createElement('img'); im.src = EMOTE; im.alt = '';
  r.append(im, document.createTextNode(String(n)));
  wrap.appendChild(r); row.after(wrap);
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

/* ── 보내기 ───────────────────────────────────── */
const sendBtn = document.getElementById('send'), fill = document.getElementById('fill'),
      sendLbl = document.getElementById('sendLbl'), wallet = document.getElementById('wallet'),
      draftX = document.getElementById('draftX');
let readyAt = 0, comboUntil = 0;

function send(){
  const now = performance.now();
  if(now < readyAt) return;
  if(now < comboUntil) s.combo = Math.min(s.combo + 1, 50); else s.combo = 1;
  comboUntil = 0;

  const crit = s.crit > 0 && Math.random() < s.crit*0.04;
  const gain = perSend(s) * comboMul() * (crit ? 10 : 1);
  s.jamu += gain; s.total += gain; s.sends++;

  const row = emoteRow(body('me','나',null,0,true,false), gain, crit, true);
  if(crit) reactTo(row, 3 + Math.floor(Math.random()*20));
  else if(s.fan > 0 && Math.random() < Math.min(0.04 + s.fan*0.01, 0.3)) reactTo(row, 1 + Math.floor(Math.random()*s.fan));

  readyAt = now + cooldown(s)*1000;
  paintWallet(true); checkUnlocks();
  if(s.sends === 3) sysMsg('오른쪽 위 <b>상점</b>에서 모은 쨔무를 업그레이드에 쓸 수 있습니다.');
}
sendBtn.addEventListener('click', send);
addEventListener('keydown', e=>{
  if(e.target.closest && e.target.closest('button')) return;
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); send(); }
});

/* ── 채널 목록 ────────────────────────────────── */
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
    if(k === 'main') return;
    if(k === 'credit'){ credits(); return; }
    sysMsg(CH_MSG[k]);
    if(k === 'info') setShop(true);
  });
});

/* ── 상점 ─────────────────────────────────────── */
const shop = document.getElementById('shop'), shopBtn = document.getElementById('shopBtn'),
      shopBody = document.getElementById('shopBody'), scrim = document.getElementById('scrim'),
      dot = document.getElementById('dot');

function setShop(open){
  s.shopOpen = open;
  shop.classList.toggle('open', open);
  shopBtn.classList.toggle('on', open);
  shopBtn.setAttribute('aria-expanded', open);
  scrim.classList.toggle('on', open && innerWidth <= 880);
  if(open) paintShop();
}
shopBtn.addEventListener('click', ()=>setShop(!s.shopOpen));
scrim.addEventListener('click', ()=>setShop(false));

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

let shopSig = '';
function paintShop(){
  const list = UP.filter(visible);
  const sig = list.map(u=>u.id+s[u.id]).join('|');
  if(sig !== shopSig){
    shopSig = sig; shopBody.innerHTML = ''; let grp = '';
    list.forEach(u=>{
      if(u.grp !== grp){
        grp = u.grp;
        const h = document.createElement('div'); h.className = 'grp'; h.textContent = grp;
        shopBody.appendChild(h);
      }
      const lv = s[u.id], maxed = lv >= u.max;
      const b = document.createElement('button');
      b.className = 'item' + (maxed ? ' maxed' : ''); b.dataset.id = u.id;
      b.innerHTML = '<span class="top"><span class="nm"></span><span class="cost"></span></span>'+
        '<p class="ds"></p><span class="bt"><span class="lv"></span>'+
        '<span class="track"><i></i></span><span class="now"></span></span>';
      b.querySelector('.nm').textContent = u.name;
      b.querySelector('.ds').textContent = u.desc;
      b.querySelector('.cost').textContent = maxed ? '완료' : fmt(u.cost(lv)) + ' 쨔무';
      b.querySelector('.lv').textContent = u.max < 900 ? 'Lv.'+lv+'/'+u.max : 'Lv.'+lv;
      b.querySelector('.track i').style.width = (u.max < 900 ? lv/u.max*100 : Math.min(lv*2,100)) + '%';
      b.querySelector('.now').textContent = u.now(s);
      b.disabled = maxed;
      if(!maxed) b.addEventListener('click', ()=>buy(u));
      shopBody.appendChild(b);
    });
  }
  shopBody.querySelectorAll('.item').forEach(b=>{
    const u = UP.find(x=>x.id === b.dataset.id), lv = s[u.id];
    if(lv >= u.max) return;
    const can = s.jamu >= u.cost(lv);
    b.classList.toggle('can', can); b.disabled = !can;
  });
}
function anyAffordable(){
  return UP.some(u=>visible(u) && s[u.id] < u.max && s.jamu >= u.cost(s[u.id]));
}
function checkUnlocks(){
  UP.forEach(u=>{
    if(u.unlock > 0 && !s.seen[u.id] && s.total >= u.unlock){
      s.seen[u.id] = 1; shopSig = '';
      sysMsg('새 업그레이드 해금 — <b>'+u.name+'</b>', true);
    }
  });
}

/* ── 화면 갱신 ────────────────────────────────── */
const amtEl = document.getElementById('amt'), rateEl = document.getElementById('rate'),
      rankEl = document.getElementById('rank'), viewEl = document.getElementById('viewers'),
      typingEl = document.getElementById('typing'), totalTxt = document.getElementById('totalTxt'),
      meJamu = document.getElementById('meJamu'), voiceCnt = document.getElementById('voiceCnt');
let lastRank = '';

function rankOf(t){ let r = RANKS[0][1]; for(const [v,n] of RANKS) if(t >= v) r = n; return r; }

function paintWallet(bump){
  const txt = fmt(s.jamu);
  amtEl.textContent = txt; meJamu.textContent = txt;
  const br = botRate(s);
  rateEl.textContent = br > 0 ? '매크로 초당 ' + (br < 10 ? br.toFixed(1) : fmt(br)) + ' 쨔무' : '';
  const r = rankOf(s.total);
  if(r !== lastRank){
    if(lastRank) sysMsg('내 등급이 <b>' + r + '</b>(으)로 올랐습니다.', true);
    lastRank = r; rankEl.textContent = r;
  }
  const v = 12 + Math.floor(Math.pow(s.total, 0.42));
  viewEl.textContent = fmt(v);
  voiceCnt.textContent = fmt(2 + Math.floor(v/9));
  totalTxt.textContent = '총 ' + fmt(s.total) + ' 쨔무 · 전송 ' + fmt(s.sends) + '회';
  draftX.textContent = '전송당 ' + fmt(perSend(s) * comboMul()) + ' 쨔무';
  if(bump){ wallet.classList.remove('bump'); void wallet.offsetWidth; wallet.classList.add('bump'); }
  if(s.shopOpen) paintShop();
  dot.classList.toggle('show', !s.shopOpen && anyAffordable());
}

/* ── 루프 ─────────────────────────────────────── */
let last = performance.now(), acc = 0, botAcc = 0, chatAt = 0, tick = 0, typeSig = '';

function loop(now){
  const dt = Math.min((now - last)/1000, 0.5); last = now;

  const br = botRate(s);
  if(br > 0){ s.jamu += br*dt; s.total += br*dt; }

  if(s.bot > 0){
    botAcc += dt * Math.min(s.bot * overMul(s) / 5, 3);
    if(botAcc >= 1 && now - chatAt > 280){
      botAcc = 0; chatAt = now;
      const [n,c,seed] = randNick();
      emoteRow(body('b:'+n, n+'의 매크로', c, seed, false, true), 0, false, false);
    }
  }

  if(now > tick + 60){
    tick = now;
    if(Math.random() < 0.012 + Math.min(s.total/4e6, 0.02)){
      const [n,c,seed] = randNick();
      if(Math.random() < 0.3) emoteRow(body('e:'+n, n, c, seed, false, false), 0, false, false);
      else textMsg(n, c, seed, LINES[Math.floor(Math.random()*LINES.length)]);
    }
  }

  const cd = cooldown(s)*1000, left = readyAt - now;
  if(left > 0){
    sendBtn.classList.remove('ready');
    fill.style.width = (100 - left/cd*100) + '%';
    sendLbl.textContent = (left/1000).toFixed(1) + '초';
  }else{
    if(!sendBtn.classList.contains('ready')){ sendBtn.classList.add('ready'); comboUntil = now + 1800; }
    fill.style.width = '0%';
    sendLbl.textContent = '쨔무쨔무';
    if(s.combo > 0 && comboUntil && now > comboUntil) s.combo = 0;
  }

  // 입력 중 / 콤보 표시
  if(s.combo > 0){
    const w = comboUntil === 0 ? 1 : (comboUntil > now ? (comboUntil - now)/1800 : 0);
    typingEl.innerHTML = '<span class="combo">연타 콤보 ×' + s.combo + ' · 획득량 +' +
      Math.round((comboMul()-1)*100) + '%<span class="win"><i style="transform:scaleX(' +
      w.toFixed(3) + ')"></i></span></span>';
    typeSig = 'combo';
  }else{
    const sig = s.bot > 0 ? 'bot'+s.bot : 'none';
    if(sig !== typeSig){
      typeSig = sig;
      typingEl.innerHTML = s.bot > 0
        ? '<span class="bub"><i></i><i></i><i></i></span>매크로 ' + fmt(s.bot) + '대가 입력 중입니다'
        : '';
    }
  }

  acc += dt;
  if(acc > 0.125){ acc = 0; paintWallet(false); }
  requestAnimationFrame(loop);
}

/* ── 저장 ─────────────────────────────────────── */
function save(){ try{ s.ts = Date.now(); localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return false;
    const o = JSON.parse(raw);
    if(!o || typeof o.jamu !== 'number') return false;
    s = Object.assign(fresh(), o); s.combo = 0;
    const away = Math.min((Date.now() - (o.ts||Date.now()))/1000, 8*3600);
    const earned = botRate(s) * away;
    if(earned > 0 && away > 60){
      s.jamu += earned; s.total += earned;
      sysMsg('자리를 비운 ' + Math.floor(away/60) + '분 동안 매크로가 <b>' + fmt(earned) + ' 쨔무</b>를 모았습니다.', true);
    }
    return true;
  }catch(e){ return false; }
}
setInterval(save, 5000);
addEventListener('visibilitychange', ()=>{ if(document.hidden) save(); });
addEventListener('pagehide', save);
addEventListener('resize', ()=>scrim.classList.toggle('on', s.shopOpen && innerWidth <= 880));

document.getElementById('reset').addEventListener('click', ()=>{
  if(!confirm('모은 쨔무와 업그레이드가 모두 사라집니다. 처음부터 시작할까요?')) return;
  try{ localStorage.removeItem(KEY); }catch(e){}
  s = fresh(); shopSig = ''; lastRank = ''; readyAt = 0; lastKey = ''; curBody = null;
  log.innerHTML = ''; intro(); setShop(s.shopOpen); paintWallet();
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
checkUnlocks();
setShop(!!s.shopOpen);
paintWallet();
requestAnimationFrame(loop);
