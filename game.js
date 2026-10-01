const EMOTE = "jjamu.png";
['srvIcon','meAv','draftEmote','facEmote','resEmote','chalEmote','bldEmote'].forEach(id=>document.getElementById(id).src = EMOTE);

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

  { id:'crit', grp:'손가락', name:'크리티컬 쨔무쨔무', max:s=>eventMax(s), unlock:2500,
    cost:n=>Math.ceil(500*Math.pow(1.75,n)),
    desc:s=>'1%p 확률로 더 큰 쨔무쨔무가 전송되어 획득량이 ' + fmt(critMul(s)) + '배가 된다.',
    now:s=>'확률 '+s.crit+'%' },

  { id:'react', grp:'손가락', name:'쨔무 리액션', max:s=>eventMax(s), unlock:30000,
    cost:n=>Math.ceil(2000*Math.pow(1.75,n)),
    desc:s=>'1%p 확률로 서버 주인이 내 쨔무쨔무에 반응해 획득량이 ' + fmt(ownMul(s)) + '배가 된다. ' +
      '크리티컬과 같이 터지면 ' + fmt(critMul(s)*ownMul(s)) + '배.',
    now:s=>'확률 '+s.react+'%' },

  { id:'cap', grp:'손가락', name:'쨔무 연타 근성', max:s=>capMax(s), unlock:5000,
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

  { id:'eboost', grp:'공장', name:'쨔무 에너지 부스트', max:s=>boostMax(s), unlock:0, req:s=>s.reb >= 8,
    cost:n=>boostCost(n),
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

  { id:'e_amp3', grp:'전송 설비', name:'쨔무 (증폭기)³', max:Infinity, req:s=>s.reb >= 20,
    cost:n=>Math.ceil(1e13*Math.pow(3,n)),
    desc:'쨔무 증폭기 증폭기 1레벨의 효과가 1 늘어난다.',
    now:s=>'증폭기 증폭기 1레벨당 +'+(1 + s.e_amp3) },

  { id:'e_capext', grp:'전송 설비', name:'쨔무 근성 확장', max:16, req:s=>s.reb >= 16,
    cost:n=>Math.ceil(1e10*Math.pow(3.5,n)),
    desc:'쨔무 연타 근성의 레벨 한도가 5 늘어난다.',
    now:s=>'근성 한도 '+capMax(s) },

  { id:'e_critcap', grp:'강화 설비', name:'슈퍼 크리티컬', max:6, req:s=>s.reb >= 18,
    cost:n=>Math.ceil(2.5e11*Math.pow(3,n)),
    desc:'크리티컬 쨔무쨔무와 쨔무 리액션의 최고 레벨이 각각 10 늘어난다.',
    now:s=>'최고 레벨 '+eventMax(s) },

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

  { id:'e_boostcap', grp:'생산 설비', name:'쨔무 부스트 확장', max:Infinity, req:s=>s.reb >= 14,
    cost:n=>Math.ceil(1e8*Math.pow(10,n)),
    desc:'쨔무 에너지 부스트를 살 수 있는 한도가 1 늘어난다.',
    now:s=>'부스트 한도 '+boostMax(s) },

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
  { id:'r_combodecay', rp:7, name:'콤보 여운', req:s=>s.sac >= 1,
    desc:'콤보 유지 시간이 지나도 콤보가 0으로 돌아가지 않고, 유지 시간마다 1씩만 줄어든다.' },
  { id:'r_botplain', rp:5, name:'매크로 보정', req:s=>s.sac >= 1,
    desc:'매크로가 보내는 쨔무쨔무마다 손 전송 기댓값(콤보와 크리티컬·주인장 반응 확률 포함)의 0.01%를 추가로 얻는다. 이 몫은 매크로 크리티컬로 다시 늘어나지 않는다.' },
  { id:'r_cost2', rp:5, name:'환생 절약 II', req:s=>s.sac >= 1,
    desc:'환생 요구량이 늘어나는 배수가 1배 더 줄어든다.' },
  { id:'r_sacmulti', rp:25, name:'연속 희생', req:s=>s.sac >= 1,
    desc:'환생 횟수가 넉넉하다면 쨔무 희생을 한 번에 여러 번 한다.' },
  { id:'r_multi', rp:5, name:'연속 환생',
    desc:'요구량을 10배 이상 넘겨 모았다면 한 번에 여러 번 환생한다.' },
  { id:'r_critenergy', rp:3, name:'크리티컬 충전',
    desc:'크리티컬이나 주인장 반응이 터진 전송은 쨔무 에너지를 2배로 준다. 둘 다 터지면 4배.' },
  { id:'r_runtime', rp:5, name:'장기 도배',
    desc:'이번 환생을 오래 유지할수록 모든 쨔무 획득량이 늘어난다. 6시간이면 2배가 된다.' },
  { id:'r_chalboost', rp:7, name:'쨔무 챌린지 부스트',
    desc:'챌린지를 진행하는 동안 모든 쨔무 획득량이 10배가 된다. 연구가 통하지 않는 챌린지에서는 이 연구도 통하지 않는다.' },
  { id:'r_chalenergy', rp:10, name:'챌린지 발전',
    desc:'챌린지 달성으로 얻은 쨔무 획득량 배율이 쨔무 에너지에도 그대로 적용된다.' },
];

/* ── 쨔무 챌린지 (연구와 함께 환생 10회에 열림) ── */
const CHAL_GOALS = [1e12, 1e16, 1e20];
const CHALLENGES = [
  { n:1, name:'매크로 정지', desc:'쨔무 자동완성 매크로의 효과가 사라진다.' },
  { n:2, name:'무반응 채팅', desc:'1번의 제약에 더해, 크리티컬과 주인장 반응이 일어나지 않는다.' },
  { n:3, name:'혼자만의 도배', desc:'2번의 제약에 더해, 쨔무 따라쟁이의 효과가 사라진다.' },
  { n:4, name:'연구 정전', desc:'3번의 제약에 더해, 모든 쨔무 연구의 효과가 사라진다.' },
  { n:5, name:'맨손 전송', desc:'4번의 제약에 더해, 모든 전송 설비(냉각기·콤보 안정기·증폭기 증폭기·연타 감각)의 효과가 사라진다.' },
  { n:6, name:'콤보 실종', desc:'5번의 제약에 더해, 연타 콤보의 획득량 증가가 사라진다.' },
  { n:7, name:'맨몸 도전', desc:'6번의 제약에 더해, 챌린지 달성 보너스(×1.5)가 적용되지 않는다.' },
  { n:8, name:'유행 종료', desc:'7번의 제약에 더해, 쨔무 대유행의 효과가 사라진다.' },
];

/* ── 공장 건설 (희생 10회에 열림) ──────────────── */
const GRID = 5;
const BUILDINGS = [                                              // col·row는 팔레트 배치
  { id:'G', label:'G', gen:1, base:1e16, mult:10, col:1, row:1,
    name:'쨔무 발전기', desc:'쨔무 점수를 1 늘린다.' },
  { id:'V', label:'V', base:1e20, mult:100, col:2, row:1,
    name:'수직 증폭탑', desc:'바로 위아래 칸 발전기의 쨔무 점수를 3배로 한다.' },
  { id:'R', label:'R', base:1e24, mult:1e4, col:3, row:1,
    name:'편향 송신기', desc:'오른쪽 칸 발전기의 쨔무 점수를 3배로 하지만, 왼쪽 칸 발전기의 점수는 절반이 된다.' },
  { id:'S', label:'S', base:1e32, mult:1e6, col:4, row:1,
    name:'시너지 코어', desc:'모든 발전기의 쨔무 점수를 +50% 한다. 여러 개 놓으면 합연산으로 커진다.' },
  { id:'M', label:'G₂', gen:5, base:1e40, mult:1e8, col:1, row:2,
    name:'쨔무 발전기 2', desc:'쨔무 발전기의 상위 빌딩. 쨔무 점수를 5 늘린다.' },
];
const MILESTONES = [
  { at:1,   desc:'쨔무와 쨔무 에너지 획득량이 √(쨔무 점수 + 1)배가 된다.' },
  { at:10,  desc:'1초마다 모든 쨔무 업그레이드를 한 번씩 자동으로 구매 시도한다.' },
  { at:100, desc:'쨔무 점수가 100에서 2배가 될 때마다 모든 쨔무 업그레이드의 레벨 한도가 1 늘어난다.' },
];
function bldOf(id){ return BUILDINGS.find(b=>b.id === id); }
function bldCount(id){ let n = 0; s.grid.forEach(c=>{ if(c === id) n++; }); return n; }
function bldCost(b){ return b.base * Math.pow(b.mult, bldCount(b.id)); }
function genBoost(){ return 1 + 0.5*bldCount('S'); }             // 시너지 코어: 발전기에만, 합연산
function cellAt(r, c){ return (r >= 0 && r < GRID && c >= 0 && c < GRID) ? s.grid[r*GRID + c] : 0; }
function cellMul(i){                                             // i번 칸 빌딩이 받는 점수 배율
  const r = Math.floor(i/GRID), c = i%GRID;
  let m = 1;
  if(cellAt(r-1, c) === 'V') m *= 3;
  if(cellAt(r+1, c) === 'V') m *= 3;
  if(cellAt(r, c-1) === 'R') m *= 3;                              // 왼쪽에 송신기 → 이 칸이 오른쪽
  if(cellAt(r, c+1) === 'R') m *= 0.5;                            // 오른쪽에 송신기 → 이 칸이 왼쪽
  return m;
}
function cellScore(i){                                           // 점수는 발전기 종류만 만든다
  const b = bldOf(s.grid[i]);
  if(!b || !b.gen) return 0;
  return b.gen * genBoost() * cellMul(i);
}
let scoreCache = null;
function bldScore(){
  if(scoreCache === null){
    let t = 0;
    for(let i = 0; i < GRID*GRID; i++) t += cellScore(i);
    scoreCache = t;
  }
  return scoreCache;
}
function scoreMul(){ const v = bldScore(); return v >= 1 ? Math.sqrt(v + 1) : 1; }
function autoBuyOn(){ return bldScore() >= 10; }
function capBonus(){ const v = bldScore(); return v >= 100 ? Math.floor(Math.log2(v/100)) + 1 : 0; }
function hasBuild(){ return s.sac >= 10 || s.grid.some(c=>!!c); }

const RANKS = [
  [0,'뉴비'],[150,'눈팅 탈출'],[1200,'채팅 참여러'],[9000,'이모티콘 애호가'],
  [70000,'도배 견습생'],[600000,'쨔무 장인'],[5e6,'쨔무 단골'],[2e7,'채팅방 지배자'],
  [1e8,'쨔무 큰손'],[5e8,'쨔무 중독자'],[3e9,'쨔무 광신도'],[2e10,'쨔무 재벌'],
  [1e11,'서버 최대 주주'],[5e11,'쨔무의 신'],[5e12,'쨔무 전설'],[1e14,'쨔무 그 자체'],
  // 뒤로 갈수록 간격이 커진다 (×100 → ×1000 → ×1만 …)
  [1e16,'쨔무 신화'],[1e19,'쨔무 특이점'],[1e23,'쨔무 성운'],[1e28,'쨔무 은하'],
  [1e34,'쨔무 우주'],[1e41,'쨔무 차원'],[1e49,'쨔무 무한'],[1e58,'쨔무 초월'],
  [1e68,'쨔무 그 너머']
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
  s.sac = Math.max(0, Math.floor(s.sac));
  if(!Array.isArray(s.grid)) s.grid = Array(GRID*GRID).fill(0);
  s.grid.length = GRID*GRID;
  for(let i = 0; i < s.grid.length; i++) if(!bldOf(s.grid[i])) s.grid[i] = 0;
  scoreCache = null;
  s.rpJamu = Math.max(0, Math.floor(s.rpJamu));
  s.rpEnergy = Math.max(0, Math.floor(s.rpEnergy));
  UP.concat(EUP).forEach(u=>{ s[u.id] = Math.max(0, Math.floor(s[u.id])); });
  RESEARCH.forEach(r=>{ s[r.id] = s[r.id] ? 1 : 0; });
  s.chal = Math.min(CHALLENGES.length, Math.max(0, Math.floor(s.chal)));
  CHALLENGES.forEach(c=>{ s['chal'+c.n] = Math.min(3, Math.max(0, Math.floor(s['chal'+c.n]))); });
}
function fresh(){
  const o = { jamu:0, total:0, sends:0, combo:0, shopOpen:innerWidth>880, seen:{},
              reb:0, energy:0, energyTotal:0, facSeen:0, botMute:false,
              rpJamu:0, rpEnergy:0, resSeen:0,
              chal:0, chalSeen:0, sac:0, bldSeen:0, grid:Array(25).fill(0),
              runStart:Date.now(), ts:Date.now() };
  UP.forEach(u=>o[u.id]=0);
  EUP.forEach(u=>o[u.id]=0);
  RESEARCH.forEach(r=>o[r.id]=0);
  CHALLENGES.forEach(c=>o['chal'+c.n]=0);
  return o;
}
function baseCd(st){ return 4*Math.pow(0.92, useGear(st,'e_cool')); }
function cdFloor(st){ return useRes(st,'r_floor') ? 0.25 : 0.35; }        // 쿨타임 한계 돌파 연구
function cooldown(st){ return Math.max(cdFloor(st), baseCd(st)*Math.pow(0.93, st.thumb)); }
function rebMul(st){                                             // 환생 배율: 선형 + (환생 가속 연구)
  return (1 + st.reb) * (useRes(st,'r_rebmul') ? Math.pow(1.2, Math.max(0, st.reb - 9)) : 1);
}
function goldMul(){ return goldUntil > performance.now() ? 10 : 1; }   // 황금 쨔무쨔무 버프
function gMul(st){
  return (1 + 0.12*(noFan() ? 0 : st.fan)) * Math.pow(2, noMeme() ? 0 : st.meme) * rebMul(st) *
         (1 + 0.25*st.e_press) * goldMul() * chalMul() * runMul(st) * chalBoost(st) * sacMul(st) * scoreMul();
}
function overMul(st){ return Math.pow(1.2, st.over); }
function ampStep(st){ return 1 + useGear(st,'e_amp') * (1 + st.e_amp3); }   // (증폭기)³로 1레벨당 효과가 커진다                     // 증폭기 1레벨당 효과
function perSend(st){ return (1 + st.amp * ampStep(st)) * gMul(st); }
function botSends(st){ return st.bot * overMul(st) / 5; }        // 매크로가 초당 보내는 횟수
function botEventMul(st){                                        // 매크로에 적용되는 크리티컬·반응 기대 배율
  if(!useRes(st,'r_botcrit')) return 1;
  return (1 + st.crit*0.01*(critMul(st)/10 - 1)) * (1 + st.react*0.01*(ownMul(st)/10 - 1));
}
function botRate(st){
  if(noMacro()) return 0;
  const base = botSends(st) * gMul(st) * (1 + 0.25*st.e_conv) * botEventMul(st);
  // 매크로 보정 연구: 손 전송 기댓값의 0.01%를 base와 별도로 더한다.
  // base에만 곱해지는 매크로 크리티컬(botEventMul)이 이 몫에는 두 번 적용되지 않는다.
  const plain = useRes(st,'r_botplain') ? botSends(st) * clickExp(st) * 0.0001 : 0;
  return base + plain;
}
function clickExp(st){                                           // 손 전송 한 번의 기댓값 (콤보·크리티컬·리액션 포함)
  const base = perSend(st) * comboMul();
  const pc = noCrit() ? 0 : st.crit*0.01;                        // 크리티컬 확률
  const po = noCrit() ? 0 : st.react*0.01;                       // 주인장 반응 확률
  const amp = useRes(st,'r_pillmul') ? 1 : 0;                    // 리액션 증폭 연구
  const eBig = amp ? 12.5 : 1;                                   // 크리티컬 리액션 3~22의 평균
  const q = st.fan > 0 ? Math.min(0.04 + st.fan*0.01, 0.3) : 0;  // 일반 리액션이 달릴 확률
  const ePlain = amp ? (1 - q) + q*(st.fan + 1)/2 : 1;           // 일반 리액션 1~따라쟁이의 평균
  // 크리티컬이 터지면 그 리액션(3~22)이, 아무것도 안 터지면 일반 리액션이 배율이 된다.
  // 주인장 반응만 터진 경우에는 숫자 리액션이 없어 배율이 붙지 않는다.
  return base * (
    pc*po*critMul(st)*ownMul(st)*eBig +
    pc*(1 - po)*critMul(st)*eBig +
    (1 - pc)*po*ownMul(st) +
    (1 - pc)*(1 - po)*ePlain
  );
}
function botEnergyRate(st){ return (useRes(st,'r_botenergy') && !noMacro()) ? botSends(st) * energyPer(st) * 0.00025 : 0; }
function capMax(st){ return 15 + 5*st.e_capext; }               // 쨔무 근성 확장으로 한도가 늘어난다
function comboCap(st){ return 50 + 10*st.cap; }
function eventMax(st){ return 40 + 10*st.e_critcap; }            // 슈퍼 크리티컬로 한도가 늘어난다
function critMul(st){ return 10 + 10*st.e_crit; }    // 크리티컬 배율: 강화 1회마다 +10
function ownMul(st){ return 10 + 10*st.e_react; }    // 주인장 반응 배율: 강화 1회마다 +10
function botMax(st){ return 10 + 5*st.e_srv; }
function comboWin(st){ return 1800 + 300*useGear(st,'e_combo'); }          // ms
function comboStep(st){ return 2 + useGear(st,'sense'); }                   // 콤보 1당 획득량 %
function comboMul(){ return noCombo() ? 1 : 1 + Math.min(s.combo, comboCap(s))*comboStep(s)/100; }
function rebStep(st){ return 10 - (useRes(st,'r_cost') ? 2 : 0) - (useRes(st,'r_cost2') ? 1 : 0); }               // 환생 절약 연구
function costAt(st, reb){ return 1e6 * Math.pow(rebStep(st), reb); }
function rebCost(st){ return costAt(st, st.reb); }               // 100만에서 시작               // 100만에서 시작
function rebTimes(){                                             // 한 번에 진행할 환생 횟수 (연속 환생 연구)
  if(!useRes(s,'r_multi')) return 1;
  let k = 0;
  while(k < 200 && s.jamu >= costAt(s, s.reb + k)) k++;
  return Math.max(1, k);
}
function boostMax(st){ return 10 + st.e_boostcap; }              // 쨔무 부스트 확장으로 한도가 늘어난다
function boostCost(n){                                           // 11번째 구매부터 다른 공식
  return n < 10 ? Math.ceil(10000*Math.pow(2, n)) : Math.ceil(1e16*Math.pow(125, n - 10));
}
function eboostMul(st){ return 1 + 0.1*st.eboost; }
function energyPer(st){
  if(st.reb <= 0) return 0;
  return Math.pow(3, st.reb - 1) * eboostMul(st) * (useRes(st, 'r_chalenergy') ? chalMul() : 1) * scoreMul();
}
function fundBonus(st){ return st.e_fund > 0 ? 1000*Math.pow(10, st.e_fund - 1) : 0; }
function sacMul(st){                                             // 희생 배율: 2배씩, 첫 희생은 추가로 5배
  const m = Math.pow(2, st.sac) * (st.sac >= 1 ? 5 : 1);
  return s.chal > 0 ? Math.sqrt(m) : m;                          // 챌린지 안에서는 ^0.5
}
function sacReq(st){ return 20 + st.sac; }                       // 희생마다 필요한 환생 횟수가 1회씩 늘어난다
function sacReady(){ return s.reb >= sacReq(s); }
function sacTimes(){                                             // 연속 희생 연구
  if(!useRes(s, 'r_sacmulti')) return 1;
  let k = 0;
  while(k < 200 && s.reb >= sacReq({sac: s.sac + k})) k++;
  return Math.max(1, k);
}
function chalBoost(st){                                          // 쨔무 챌린지 부스트 연구
  return (s.chal > 0 && useRes(st, 'r_chalboost')) ? 10 : 1;
}
function runTime(st){ return Math.max(0, Date.now() - st.runStart); }       // 이번 환생 경과 시간(ms)
function runMul(st){                                             // 장기 도배 연구: 6시간에 걸쳐 ×1 → ×2
  return useRes(st, 'r_runtime') ? 1 + Math.min(runTime(st)/(6*3600*1000), 1) : 1;
}
function rebVisible(){ return s.total >= 1e5 || s.reb > 0; }
// 챌린지: s.chal이 진행 중인 번호(0이면 아님). 번호가 클수록 제약이 쌓인다.
// 챌린지 번호 = 제약 단계. 번호가 클수록 앞 제약을 그대로 물려받는다.
function noMacro(){ return s.chal >= 1; }
function noCrit(){ return s.chal >= 2; }
function noFan(){ return s.chal >= 3; }
function noRes(){ return s.chal >= 4; }
function noGear(){ return s.chal >= 5; }
function noCombo(){ return s.chal >= 6; }
function noChalBonus(){ return s.chal >= 7; }
function noMeme(){ return s.chal >= 8; }
function useRes(st, id){ return noRes() ? 0 : st[id]; }          // 연구 효과
function useGear(st, id){ return noGear() ? 0 : st[id]; }        // 전송 설비 효과
function chalDone(n){ return s['chal'+n] | 0; }
function chalTotal(){ let t = 0; CHALLENGES.forEach(c=>t += chalDone(c.n)); return t; }
function chalMul(){ return noChalBonus() ? 1 : Math.pow(1.5, chalTotal()); }   // 달성 1회마다 ×1.5
function chalGoal(n){ return CHAL_GOALS[Math.min(chalDone(n), CHAL_GOALS.length - 1)]; }
function chalOpen(n){ return n === 1 || chalDone(n - 1) > 0; }
function hasChallenge(){ return s.reb >= 10 || chalTotal() > 0 || s.chal > 0; }
function rpJamuCost(st){ return 1e13 * Math.pow(1e3, st.rpJamu); }
function rpEnergyCost(st){ return 1e7 * Math.pow(1e2, st.rpEnergy); }
function rpEarned(st){ return st.rpJamu + st.rpEnergy + chalTotal() + st.sac; }   // 챌린지 달성·희생 1회당 1점
function rpSpent(st){ let n = 0; RESEARCH.forEach(r=>{ if(st[r.id]) n += r.rp; }); return n; }
function rpLeft(st){ return rpEarned(st) - rpSpent(st); }
function hasResearch(){ return s.reb >= 10 || rpEarned(s) > 0 || rpSpent(s) > 0; }
function freeUp(u){                                              // 무상 지원 연구가 적용된 분류
  return (u.grp === '손가락' && useRes(s,'r_finger')) || (u.grp === '서버' && useRes(s,'r_server')) ||
         (u.grp === '자동화' && useRes(s,'r_auto')) || (u.grp === '공장' && useRes(s,'r_factory'));
}
function keepUp(u){                                              // 환생해도 유지되는 분류
  return (u.grp === '자동화' && useRes(s,'r_auto')) || (u.grp === '공장' && useRes(s,'r_factory'));
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
function fmtMul(n){                                              // 배율 표시용 (소수 한 자리까지)
  if(!isFinite(n)) return fmt(n);
  if(n >= 10000) return fmt(n);
  const r = Math.round(n*10)/10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
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
  const big = !noCrit() && s.crit > 0 && Math.random() < s.crit*0.01;
  const own = !noCrit() && s.react > 0 && Math.random() < s.react*0.01;

  // 콤보 창은 [readyAt, readyAt + comboWin] — 화면 갱신 여부와 무관하게 판정
  const step = (big && useRes(s,'r_combo')) ? 10 : 1;                      // 크리티컬 콤보 연구
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
  const pillMul = (useRes(s,'r_pillmul') && pillN > 0) ? pillN : 1;

  const gain = perSend(s) * comboMul() * (big ? critMul(s) : 1) * (own ? ownMul(s) : 1) * pillMul;
  s.jamu += gain; s.total += gain; s.sends++;

  // 손으로 직접 보낼 때만 쨔무 에너지 생성: 2^(환생 - 1)
  // 크리티컬 충전 연구: 터진 전송은 에너지도 2배씩
  const egMul = useRes(s, 'r_critenergy') ? (big ? 2 : 1) * (own ? 2 : 1) : 1;
  const eg = energyPer(s) * egMul;
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
  btn.className = 'goldcatch'; btn.dataset.gold = '1';
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
      chMain = document.querySelector('.ch[data-ch="main"]'), goldTag = document.getElementById('goldTag'),
      topicChal = document.getElementById('topicChal'), challengeEl = document.getElementById('challenge'),
      chChallenge = document.getElementById('chChallenge'), chalNew = document.getElementById('chalNew'),
      chalTag = document.getElementById('chalTag'),
      chBuild = document.getElementById('chBuild'), bldNew = document.getElementById('bldNew'),
      topicBuild = document.getElementById('topicBuild'), buildEl = document.getElementById('build');
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
  if(v === 'challenge' && !hasChallenge()) v = 'main';
  if(v === 'build' && !hasBuild()) v = 'main';
  view = v;
  log.hidden = v !== 'main';
  factoryEl.hidden = v !== 'factory';
  researchEl.hidden = v !== 'research';
  challengeEl.hidden = v !== 'challenge';
  buildEl.hidden = v !== 'build';
  topicMain.hidden = v !== 'main';
  topicFac.hidden = v !== 'factory';
  topicRes.hidden = v !== 'research';
  topicChal.hidden = v !== 'challenge';
  topicBuild.hidden = v !== 'build';
  chName.textContent = v === 'main' ? '쨔무쨔무-도배'
    : v === 'factory' ? '쨔무-공장' : v === 'research' ? '쨔무-연구'
    : v === 'challenge' ? '쨔무-챌린지' : '공장-건설';
  document.querySelectorAll('.ch[data-ch]').forEach(b=>b.classList.toggle('on', b.dataset.ch === v));
  if(v === 'factory'){ s.facSeen = 1; paintFactory(); }
  else if(v === 'research'){ s.resSeen = 1; paintResearch(); }
  else if(v === 'challenge'){ s.chalSeen = 1; paintChallenge(); }
  else if(v === 'build'){ s.bldSeen = 1; paintBuild(); }
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
  const p3 = document.createElement('p');
  p3.innerHTML = '<span>일부 컨텐츠는 Grass Cutting Incremental 및 Antimatter Dimensions에서 아이디어를 얻음</span>';
  box.append(im, h, p1, p2, p3);
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
    if(k === 'main' || k === 'factory' || k === 'research' || k === 'challenge' || k === 'build'){ setView(k); return; }
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
  chChallenge.hidden = !hasChallenge();
  chalNew.hidden = !!s.chalSeen;
  chBuild.hidden = !hasBuild();
  bldNew.hidden = !!s.bldSeen;
  menuDot.classList.toggle('show', (hasFactory() && !s.facSeen) || (hasResearch() && !s.resSeen) ||
    (hasChallenge() && !s.chalSeen) || (hasBuild() && !s.bldSeen) || (!!goldLive && view !== 'main'));
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

function maxOf(u){
  const m = typeof u.max === 'function' ? u.max(s) : u.max;
  return UP.indexOf(u) >= 0 ? m + capBonus() : m;            // 마일스톤 100: 쨔무 업그레이드 한도 증가
}
function descOf(u){ return typeof u.desc === 'function' ? u.desc(s) : u.desc; }
function reqOk(u){ return !u.req || u.req(s); }
function visible(u){ return reqOk(u) && (s.total >= (u.unlock || 0) || s[u.id] > 0); }
function visibleE(u){ return reqOk(u) || s[u.id] > 0; }
function buy(u, silent){
  const lv = s[u.id];
  if(lv >= maxOf(u)) return;
  const c = u.cost(lv);
  if(s.jamu < c) return;                  // 요구량은 그대로 갖고 있어야 한다
  s.jamu -= spendOf(u, lv);               // 연구했으면 소모하지 않는다
  s[u.id] = lv + 1;
  paintWallet(); paintShop();
  if(!silent) sysMsg('<b>'+u.name+'</b> Lv.'+(lv+1)+' 구매 — '+u.now(s), true);
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
      rebNow = document.getElementById('rebNow'),
      sacBtn = document.getElementById('sacBtn'), sacCost = document.getElementById('sacCost'),
      sacDesc = document.getElementById('sacDesc'), sacLv = document.getElementById('sacLv'),
      sacBar = document.getElementById('sacBar'), sacNow = document.getElementById('sacNow');
let armAt = 0, armUntil = 0;

function paintRebirth(){
  const show = rebVisible();
  rebBox.hidden = !show;
  if(!show) return;
  const cost = rebCost(s), can = !s.chal && s.jamu >= cost, now = performance.now();
  if(!can) armUntil = 0;
  const armed = can && now < armUntil;
  rebCostEl.textContent = fmt(cost) + ' 쨔무';
  rebDesc.textContent = (s.chal ? '쨔무 챌린지 중에는 환생할 수 없다. 챌린지를 마치거나 나간 뒤에 가능하다. ' : '') +
    '보유 쨔무와 모든 쨔무 업그레이드를 초기화하고, 모든 쨔무 획득량 배율을 영구히 올린다. ' +
    (useRes(s,'r_multi') ? '요구량을 여러 번 넘겨 모았다면 한 번에 그만큼 환생한다.'
               : '요구량보다 많이 모아도 한 번에 1회만 환생한다.') +
    (s.reb === 0 ? ' 첫 환생 시 #쨔무-공장이 열린다.' : '');
  rebLv.textContent = s.reb + '회';
  rebBar.style.width = Math.min(s.jamu/cost*100, 100) + '%';
  const times = can ? rebTimes() : 1;
  rebNow.textContent = (times > 1 ? '한 번에 ' + times + '회 · ' : '') +
    '배율 ×' + fmtMul(rebMul(s)) + ' → ×' + fmtMul(rebMul(Object.assign({}, s, {reb: s.reb + times})));
  rebBtn.classList.toggle('can', can);
  rebBtn.classList.toggle('armed', armed);
  rebBtn.disabled = !can;
  paintSacrifice();
}

let sacAt = 0, sacUntil = 0;
function paintSacrifice(){
  const show = s.reb >= sacReq(s) || s.sac > 0;
  sacBtn.hidden = !show;
  if(!show) return;
  const ok = sacReady() && !s.chal, now = performance.now();
  if(!ok) sacUntil = 0;
  sacBtn.classList.toggle('armed', ok && now < sacUntil);
  sacCost.textContent = '환생 ' + sacReq(s) + '회';
  sacDesc.textContent = (s.chal ? '쨔무 챌린지 중에는 희생할 수 없다. ' : '') +
    '환생 횟수와 공장 설비를 포함해, 환생이 되돌리는 모든 것을 처음으로 되돌린다. ' +
    '쨔무 연구와 챌린지 기록은 남는다. 대신 희생 배율이 2배가 되고 연구 포인트를 1점 받는다. ' +
    '희생할 때마다 다음 희생에 필요한 환생 횟수가 1회씩 늘어난다.' +
    ' 챌린지 안에서는 희생 배율이 ^0.5로 줄어든다.' +
    (s.sac === 0 ? ' 첫 희생은 추가로 5배를 더 받는다.' : '');
  sacLv.textContent = s.sac + '회';
  sacBar.style.width = Math.min(s.reb/sacReq(s)*100, 100) + '%';
  const times = ok ? sacTimes() : 1;
  sacNow.textContent = (times > 1 ? '한 번에 ' + times + '회 · ' : '환생 ' + s.reb + '/' + sacReq(s) + '회 · ') +
    '배율 ×' + fmtMul(sacMul(s)) + ' → ×' + fmtMul(sacMul({sac: s.sac + times}));
  sacBtn.disabled = !ok;
}
sacBtn.addEventListener('click', ()=>{
  if(!sacReady() || s.chal) return;
  const now = performance.now();
  if(now < sacUntil && now - sacAt > 400){ sacUntil = 0; sacrifice(); }
  else if(!(now < sacUntil)){ sacAt = now; sacUntil = now + 3000; }
  paintRebirth();
});

function sacrifice(){
  if(!sacReady() || s.chal) return;
  const first = s.sac === 0;
  const times = sacTimes();
  s.sac += times;
  s.reb = 0;                                      // 환생 횟수도 처음으로
  EUP.forEach(u=>s[u.id] = 0);                    // 공장 설비 초기화
  s.energy = 0;
  wipeProgress();                                 // 환생이 되돌리는 것들
  facCache.sig = ''; resCache.sig = ''; chalCache.sig = '';
  clearGold();
  sysMsg('<b>쨔무 희생 ' + s.sac + '회</b>' + (times > 1 ? ' (한 번에 ' + times + '회)' : '') +
    ' — 환생 횟수와 공장을 모두 바치고 희생 배율 ×' + fmtMul(sacMul(s)) +
    (first ? ' (첫 희생 보너스 ×5 포함)' : '') + ', 연구 포인트 ' + times + '점을 얻었습니다.', true);
  sysMsg('다음 희생에는 <b>환생 ' + sacReq(s) + '회</b>가 필요합니다.', true);
  setView('main'); paintChannels(); paintWallet(); save();
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
  s.runStart = Date.now();                        // 환생·챌린지 정리마다 이번 환생 시간도 다시 센다
  s.jamu = fundBonus(s);
  s.combo = 0; readyAt = 0;
  shopCache.sig = ''; facCache.sig = ''; resCache.sig = '';
}
function rebirth(){
  if(s.chal) return;                       // 챌린지 중에는 환생할 수 없다
  if(s.jamu < rebCost(s)) return;
  const first = s.reb === 0, prev = s.reb;
  const times = rebTimes();                // 연속 환생 연구가 없으면 1
  s.reb += times;
  wipeProgress();
  sysMsg('<b>쨔무 환생 ' + s.reb + '회</b> 완료!' + (times > 1 ? ' (한 번에 ' + times + '회) ' : ' ') +
    '모든 쨔무 획득량 ×' + fmtMul(rebMul(s)) +
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
    '<div class="stat"><span>환생 배율</span><b>×' + fmtMul(rebMul(s)) + '</b></div>' +
    '<div class="stat"><span>희생 배율</span><b>×' + fmtMul(sacMul(s)) +
      '</b><small>챌린지 안에서는 ^0.5</small></div>' +
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

  const list = RESEARCH.filter(r=>!r.req || r.req(s) || s[r.id]);
  const sig = list.map(r=>r.id + (s[r.id] ? '1' : '0')).join('');
  if(sig !== resCache.sig){
    resCache.sig = sig; resList.innerHTML = '';
    list.forEach(r=>{
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

/* ── 쨔무 챌린지 ──────────────────────────────── */
const chalAmt = document.getElementById('chalAmt'), chalLbl = document.getElementById('chalLbl'),
      chalSub = document.getElementById('chalSub'), chalBar = document.getElementById('chalBar'),
      chalBarWrap = document.getElementById('chalBarWrap'), chalExit = document.getElementById('chalExit'),
      chalList = document.getElementById('chalList');
const chalCache = {sig:''};
let chalArmAt = 0, chalArmUntil = 0, chalArmN = 0, chalTimer = 0;

function disarmChal(){
  chalArmN = 0; chalArmUntil = 0; clearTimeout(chalTimer);
  chalExit.textContent = '챌린지 나가기'; chalExit.classList.remove('armed');
  chalCache.sig = '';
}
function enterChal(n){
  if(s.chal || !chalOpen(n) || chalDone(n) >= 3) return;
  wipeProgress(); clearGold();
  s.chal = n;
  setView('main');
  sysMsg('<b>쨔무 챌린지 ' + n + '</b>에 들어갔습니다. 목표 <b>' + fmt(chalGoal(n)) + ' 쨔무</b> · ' +
    CHALLENGES[n-1].desc, true);
  chalCache.sig = ''; paintChannels(); paintWallet(); save();
}
function leaveChal(done){
  const n = s.chal;
  if(!n) return;
  s.chal = 0;
  if(done) s['chal'+n] = Math.min(3, chalDone(n) + 1);
  wipeProgress(); clearGold();
  setView('main');
  if(done) sysMsg('<b>쨔무 챌린지 ' + n + ' 달성!</b> 모든 쨔무 획득량 ×1.5, 연구 포인트 1점을 받았습니다. ' +
    '(누적 ×' + chalMul().toFixed(2) + ')', true);
  else sysMsg('쨔무 챌린지 ' + n + '에서 나왔습니다. 제약이 모두 풀렸습니다.', true);
  chalCache.sig = ''; paintChannels(); paintWallet(); save();
}
chalExit.addEventListener('click', ()=>{
  if(!s.chal) return;
  const now = performance.now();
  if(chalArmN === -1 && now < chalArmUntil && now - chalArmAt > 400){ disarmChal(); leaveChal(false); return; }
  if(now < chalArmUntil && chalArmN === -1) return;
  chalArmN = -1; chalArmAt = now; chalArmUntil = now + 3000;
  chalExit.textContent = '한 번 더 누르면 나가기'; chalExit.classList.add('armed');
  clearTimeout(chalTimer); chalTimer = setTimeout(disarmChal, 3000);
});
function tapChal(n){
  if(s.chal || !chalOpen(n) || chalDone(n) >= 3) return;
  const now = performance.now();
  if(chalArmN === n && now < chalArmUntil && now - chalArmAt > 400){ disarmChal(); enterChal(n); return; }
  chalArmN = n; chalArmAt = now; chalArmUntil = now + 3000;
  chalCache.sig = ''; paintChallenge();
  clearTimeout(chalTimer); chalTimer = setTimeout(()=>{ disarmChal(); paintChallenge(); }, 3000);
}
function paintChallenge(){
  const inChal = s.chal > 0, now = performance.now();
  if(chalArmUntil && now > chalArmUntil) disarmChal();
  if(inChal){
    const goal = chalGoal(s.chal);
    chalLbl.textContent = '쨔무 챌린지 ' + s.chal + ' 진행 중 — ' + CHALLENGES[s.chal-1].name;
    chalAmt.textContent = fmt(s.jamu) + ' / ' + fmt(goal);
    chalSub.textContent = CHALLENGES[s.chal-1].desc + ' 목표를 달성하면 자동으로 끝납니다.';
    chalBarWrap.hidden = false;
    chalBar.style.width = Math.min(s.jamu/goal*100, 100) + '%';
  }else{
    chalLbl.textContent = '챌린지 보너스';
    chalAmt.textContent = '×' + chalMul().toFixed(2);
    chalSub.textContent = '총 ' + chalTotal() + '회 달성 · 연구 포인트 ' + chalTotal() + '점 획득';
    chalBarWrap.hidden = true;
  }
  chalExit.hidden = !inChal;

  const sig = CHALLENGES.map(c=>chalDone(c.n)).join('') + ':' + s.chal + ':' + chalArmN;
  if(sig !== chalCache.sig){
    chalCache.sig = sig; chalList.innerHTML = '';
    CHALLENGES.forEach(c=>{
      const done = chalDone(c.n), open = chalOpen(c.n), full = done >= 3, active = s.chal === c.n;
      const b = document.createElement('button');
      b.className = 'item chal' + (active ? ' active' : '') + (full ? ' done' : '');
      b.dataset.chal = c.n;
      b.innerHTML = '<span class="top"><span class="nm"></span><span class="cost"></span></span>' +
        '<p class="ds"></p><span class="bt"><span class="lv"></span>' +
        '<span class="track"><i></i></span><span class="now"></span></span>';
      b.querySelector('.nm').textContent = '챌린지 ' + c.n + ' · ' + c.name;
      b.querySelector('.ds').textContent = open ? c.desc : '앞 챌린지를 한 번 이상 달성하면 열립니다.';
      b.querySelector('.cost').textContent = !open ? '잠김' : full ? '완료' : '목표 ' + fmt(chalGoal(c.n));
      b.querySelector('.lv').textContent = '달성 ' + done + '/3';
      b.querySelector('.track i').style.width = (done/3*100) + '%';
      b.querySelector('.now').textContent = active ? '진행 중' : full ? '' :
        (chalArmN === c.n ? '한 번 더 누르면 진입' : (s.chal ? '다른 챌린지 진행 중' : '누르면 진입'));
      b.disabled = !open || full || !!s.chal;
      if(!b.disabled) b.addEventListener('click', ()=>tapChal(c.n));
      if(chalArmN === c.n) b.classList.add('can');
      chalList.appendChild(b);
    });
  }
}

/* ── 공장 건설 화면 ───────────────────────────── */
const bldAmt = document.getElementById('bldAmt'), bldSub = document.getElementById('bldSub'),
      bldGrid = document.getElementById('bldGrid'), bldPal = document.getElementById('bldPal'),
      bldInfo = document.getElementById('bldInfo'), bldMs = document.getElementById('bldMs');
let bldSel = 'G', bldHover = null, bldSig = '';

function placeBld(i, id){                                        // id가 ''이면 철거
  const cur = s.grid[i];
  if(cur === id){ bldHover = {id: cur, i}; bldDetail(cur, i); return; }   // 같은 칸을 다시 누르면 정보만 보여준다
  let back = 0;
  if(cur){                                                       // 철거는 지었던 값 그대로 환불
    s.grid[i] = 0; scoreCache = null;
    back = bldCost(bldOf(cur)); s.energy += back;
  }
  if(id){
    const b = bldOf(id), cost = bldCost(b);
    if(s.energy < cost){                                         // 모자라면 되돌린다
      if(cur){ s.energy -= back; s.grid[i] = cur; scoreCache = null; }
      return;
    }
    s.energy -= cost; s.grid[i] = id; scoreCache = null;
  }
  bldSig = ''; shopCache.sig = '';
  bldHover = {id: s.grid[i], i};                  // 터치에서도 방금 바꾼 칸의 정보가 보이게
  paintWallet(); paintBuild(); save();
}
function bldDetail(id, i){
  if(!id){
    bldInfo.innerHTML = '<h4>빈 칸</h4><p>아래에서 빌딩을 고른 뒤 칸을 누르면 지어집니다. ' +
      '이미 지어진 칸을 누르면 고른 빌딩으로 바뀌고, 철거를 고르면 비웁니다.</p>';
    return;
  }
  const b = bldOf(id);
  const mine = (typeof i === 'number' && s.grid[i] === id);
  bldInfo.innerHTML = '<h4>' + b.label + ' · ' + b.name + '</h4>' +
    '<div class="k">다음 건설 비용 ' + fmt(bldCost(b)) + ' 에너지 · 지어둔 수 ' + bldCount(b.id) + '개</div>' +
    '<p>' + b.desc + '</p>' +
    (mine ? '<div class="val">이 칸의 점수 ' + fmtMul(cellScore(i)) +
      ' (받는 배율 ×' + fmtMul(cellMul(i)) + ')</div>' : '');
}
function paintBuild(){
  const score = bldScore();
  bldAmt.textContent = fmtMul(score);
  bldSub.textContent = '쨔무·에너지 획득량 ×' + fmtMul(scoreMul()) +
    (autoBuyOn() ? ' · 자동 구매 작동 중' : '') +
    (capBonus() ? ' · 업그레이드 한도 +' + capBonus() : '');

  const sig = s.grid.join(',') + '|' + BUILDINGS.map(b=>s.energy >= bldCost(b) ? 1 : 0).join('') + '|' + bldSel;
  if(sig === bldSig) return;
  bldSig = sig;

  bldGrid.innerHTML = '';
  s.grid.forEach((id, i)=>{
    const cell = document.createElement('button');
    cell.className = 'cell' + (id ? ' on ' + id : '');
    cell.dataset.i = i;
    cell.innerHTML = id ? bldOf(id).label + '<small>' + (cellScore(i) ? fmtMul(cellScore(i)) : '') + '</small>' : '·';
    bldGrid.appendChild(cell);
  });

  bldPal.innerHTML = '';
  BUILDINGS.forEach(b=>{
    const el = document.createElement('button');
    el.className = 'pal' + (bldSel === b.id ? ' sel' : '') + (s.energy >= bldCost(b) ? '' : ' poor');
    el.dataset.b = b.id;
    el.innerHTML = '<b>' + b.label + '</b>' + fmt(bldCost(b));
    el.style.gridColumn = b.col; el.style.gridRow = b.row;
    bldPal.appendChild(el);
  });
  const del = document.createElement('button');
  del.className = 'pal' + (bldSel === '' ? ' sel' : '');
  del.dataset.b = ''; del.innerHTML = '<b>×</b>철거';
  del.style.gridColumn = 2; del.style.gridRow = 2;
  bldPal.appendChild(del);

  bldMs.innerHTML = '<h4>마일스톤</h4>' + MILESTONES.map(m=>
    '<div class="ms' + (score >= m.at ? ' done' : '') + '"><b>점수 ' + m.at + '</b><span>' + m.desc + '</span></div>'
  ).join('');

  bldDetail(bldHover ? bldHover.id : bldSel, bldHover ? bldHover.i : undefined);
}
bldGrid.addEventListener('click', e=>{
  const cell = e.target.closest('.cell');
  if(cell) placeBld(+cell.dataset.i, bldSel);
});
bldGrid.addEventListener('mouseover', e=>{
  const cell = e.target.closest('.cell');
  if(!cell) return;
  const i = +cell.dataset.i;
  bldHover = {id: s.grid[i], i};
  bldDetail(s.grid[i], i);
});
bldPal.addEventListener('click', e=>{
  const el = e.target.closest('.pal');
  if(!el) return;
  bldSel = el.dataset.b; bldHover = null; bldSig = '';
  paintBuild();
});
bldPal.addEventListener('mouseover', e=>{
  const el = e.target.closest('.pal');
  if(!el) return;
  bldHover = el.dataset.b ? {id: el.dataset.b} : null;
  bldDetail(el.dataset.b);
});
buildEl.addEventListener('mouseleave', ()=>{ bldHover = null; bldDetail(bldSel); });

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
  if(view === 'challenge' && !hasChallenge()){ setView('main'); return; }
  if(view === 'build' && !hasBuild()){ setView('main'); return; }
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
  let tag = s.reb > 0 ? ' · 환생 ' + s.reb + '회' : '';
  if(s.sac > 0) tag += ' · 희생 ' + s.sac + '회 (×' + fmtMul(sacMul(s)) + ')';
  if(useRes(s, 'r_runtime')){
    const m = Math.floor(runTime(s)/60000);
    tag += ' · 이번 환생 ' + (m >= 60 ? Math.floor(m/60) + '시간 ' + (m%60) + '분' : m + '분') +
           ' (×' + runMul(s).toFixed(2) + ')';
  }
  rebTag.textContent = tag;
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
  if(view === 'challenge') paintChallenge();
  if(view === 'build') paintBuild();
  chalTag.hidden = !s.chal;
  if(s.chal) chalTag.textContent = '챌린지 ' + s.chal + ' · 목표 ' + fmt(chalGoal(s.chal));
  dot.classList.toggle('show', !s.shopOpen && anyAffordable());
}

/* ── 루프 ─────────────────────────────────────── */
let last = performance.now(), acc = 0, botAcc = 0, chatAt = 0, tick = 0, typeSig = '', autoAcc = 0;

let comboDecayAt = 0;
function breakCombo(elapsed){
  if(useRes(s,'r_combodecay')){                    // 콤보 여운 연구: 0이 아니라 1씩 감소
    if(elapsed) s.combo = Math.max(0, s.combo - Math.floor(elapsed/comboWin(s)));
    return;
  }
  s.combo = 0;
}

function loop(now){
  normalize();
  const raw = now - last;
  const dt = Math.min(raw/1000, 0.5); last = now;
  if(raw > 2500) breakCombo(raw);   // 탭 전환 등으로 루프가 멈췄던 경우

  const br = botRate(s);
  if(br > 0){ s.jamu += br*dt; s.total += br*dt; }
  const ber = botEnergyRate(s);                                  // 매크로 발전 연구
  if(ber > 0){ s.energy += ber*dt; s.energyTotal += ber*dt; }

  if(s.chal && s.jamu >= chalGoal(s.chal)) leaveChal(true);      // 챌린지 목표 달성

  if(s.bot > 0 && !s.botMute && !noMacro()){
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
  if(useRes(s,'r_gold')){
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
  if(s.combo > 0 && now > readyAt + win){
    if(useRes(s,'r_combodecay')){
      if(!comboDecayAt) comboDecayAt = readyAt + win;
      while(s.combo > 0 && now >= comboDecayAt){ s.combo--; comboDecayAt += win; }
    }else s.combo = 0;
  }else comboDecayAt = 0;

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

  if(autoBuyOn()){                                               // 마일스톤 10: 자동 구매
    autoAcc += dt;
    if(autoAcc >= 1){ autoAcc = 0; UP.forEach(u=>buy(u, true)); }
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
addEventListener('visibilitychange', ()=>{ if(document.hidden){ breakCombo(0); save(); } });
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
