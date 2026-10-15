/* Qualitia site behaviour, shared by every page. Each part runs only if its elements exist. */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mega menu
  const menuBtn = document.getElementById('menu-btn'), mega = document.getElementById('mega');
  const setMega = open => { mega.hidden = !open; menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.addEventListener('click', e => { e.stopPropagation(); setMega(mega.hidden); });
  mega.addEventListener('click', e => { if (e.target.closest('a')) setMega(false); });

  // Floating pill nav
  const pill = document.getElementById('pill'), pillBtn = document.getElementById('pill-menu'), pillList = document.getElementById('pill-list');
  const setPill = open => { pillList.hidden = !open; pillBtn.setAttribute('aria-expanded', open); };
  pillBtn.addEventListener('click', e => { e.stopPropagation(); setPill(pillList.hidden); });
  pillList.addEventListener('click', e => { if (e.target.closest('a')) setPill(false); });
  document.addEventListener('click', e => {
    if (!mega.contains(e.target)) setMega(false);
    if (!pill.contains(e.target)) setPill(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape'){ setMega(false); setPill(false); } });
  const onScroll = () => {
    const show = scrollY > 360;
    pill.classList.toggle('show', show);
    if (show) setMega(false); else setPill(false);
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Logo track loop
  const track = document.getElementById('track');
  if (track) {
    const n = track.children.length;
    track.innerHTML += track.innerHTML;
    [...track.children].forEach((s,i) => { if (i >= n){ s.alt=''; s.setAttribute('aria-hidden','true'); } });
  }

  // Stories reel arrows
  document.querySelectorAll('[data-reel]').forEach(reel => {
    const card = () => reel.firstElementChild;
    const stepReel = dir => reel.scrollBy({left: dir * (card().offsetWidth + 16), behavior: reduce ? 'auto' : 'smooth'});
    const nav = document.querySelector('[data-reel-nav="' + reel.id + '"]');
    if (!nav) return;
    nav.querySelector('[data-dir="-1"]').addEventListener('click', () => stepReel(-1));
    nav.querySelector('[data-dir="1"]').addEventListener('click', () => stepReel(1));
  });

  // Hero particle field: static first frame, gentle drift
  const cv = document.getElementById('field');
  if (cv) {
  const ctx = cv.getContext('2d');
  let W=0,H=0,pts=[];
  const dpr=Math.min(devicePixelRatio||1,2);
  function size(){
    const r = cv.getBoundingClientRect(); W=r.width; H=r.height;
    cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.round(Math.min(140, W*H/9000));
    pts = Array.from({length:count}, (_,i) => ({x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25, r:Math.random()*1.4+.6, hot:i%17===0}));
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    for (let i=0;i<pts.length;i++){
      const a=pts[i];
      for (let j=i+1;j<pts.length;j++){
        const b=pts[j], dx=a.x-b.x, dy=a.y-b.y, d=dx*dx+dy*dy;
        if (d<12000){ ctx.strokeStyle='rgba(180,198,255,'+(0.16*(1-d/12000))+')'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
      }
    }
    for (const p of pts){
      ctx.fillStyle = p.hot ? 'rgba(52,195,143,.95)' : 'rgba(220,230,255,.7)';
      ctx.beginPath(); ctx.arc(p.x,p.y,p.hot?p.r+1.2:p.r,0,Math.PI*2); ctx.fill();
    }
  }
  function frame(){
    for (const p of pts){ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1; }
    draw(); requestAnimationFrame(frame);
  }
  size(); draw();
  if (!reduce) requestAnimationFrame(frame);
  addEventListener('resize', () => { size(); draw(); });
  }

  // Console runs (illustrative), only on pages that have the console
  if (document.getElementById('c-body')) {
  const RUNS = {
    sf:{meta:'sprint 14 · UAT sandbox', release:['Sprint 14 · 37 changes','1-Click · 412 tests updated'], lines:[
      ['Lead → Opportunity conversion','1.8s'],['Quote with CPQ discount approval','3.2s'],['Case escalation to Tier 2','2.1s'],
      ['Lightning page layout · Account','0.9s','healed · field moved'],['Experience Cloud partner login','1.4s'],['Order sync → ERP integration','4.6s'],['Agentforce case summary','2.7s']]},
    sn:{meta:'sprint 9 · test instance', release:['Sprint 9 · 22 changes','1-Click · 268 tests updated'], lines:[
      ['Incident P1 → major incident','2.3s'],['Change request CAB approval','3.0s'],['Service Catalog · laptop request','1.6s'],
      ['HR case onboarding journey','2.9s','healed · form updated'],['CMDB CI relationship check','1.2s'],['Salesforce case → ServiceNow incident','4.1s'],['Service Operations Workspace','1.7s']]}
  };
  const body=document.getElementById('c-body'), bar=document.getElementById('c-bar'), count=document.getElementById('c-count'), time=document.getElementById('c-time'), meta=document.getElementById('c-meta');
  let timer=null;
  function render(key, done){
    const r=RUNS[key], n=r.lines.length;
    meta.textContent=r.meta; body.setAttribute('aria-labelledby','tab-'+key);
    body.innerHTML='<div class="c-release"><span>⚡ '+r.release[0]+'</span><span>'+r.release[1]+'</span></div>'+r.lines.map((l,i)=>{
      const cls=i<done?'':(i===done?'running':'pending'), st=i<done?'✓':(i===done?'●':'○'), tm=i<done?l[1]:(i===done?'running':'');
      const nm=l[0]+(l[2]&&i<done?' <span class="heal">· '+l[2]+'</span>':'');
      return '<div class="c-line '+cls+'"><span class="st">'+st+'</span><span class="nm">'+nm+'</span><span class="tm">'+tm+'</span></div>';
    }).join('');
    bar.style.width=(Math.min(done,n)/n*100)+'%';
    count.innerHTML=done>=n?'<b>'+n+' passed</b> · 0 failed':done+' / '+n+' complete';
    time.textContent=r.lines.slice(0,done).reduce((a,l)=>a+parseFloat(l[1]),0).toFixed(1)+'s';
  }
  function selectTab(key){ document.querySelectorAll('.c-tab').forEach(t=>t.setAttribute('aria-selected', t.dataset.run===key)); }
  function run(key){
    clearTimeout(timer); selectTab(key);
    const n=RUNS[key].lines.length;
    if (reduce){ render(key,n); return; }
    let i=0;
    const s=()=>{ render(key,i); if(i<n){ i++; timer=setTimeout(s,650); } else timer=setTimeout(()=>run(key==='sf'?'sn':'sf'),4200); };
    s();
  }
  document.querySelectorAll('.c-tab').forEach(t=>t.addEventListener('click',()=>run(t.dataset.run)));
  render('sf', RUNS.sf.lines.length);
  if (!reduce) timer=setTimeout(()=>run('sf'),2200);
  }

  // Footer office pop-overs
  const regionBtns = [...document.querySelectorAll('.regions button')];
  const closeRegions = except => regionBtns.forEach(b => { if (b !== except){ b.setAttribute('aria-expanded','false'); document.getElementById(b.getAttribute('aria-controls')).hidden = true; } });
  regionBtns.forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const pop = document.getElementById(b.getAttribute('aria-controls')), open = pop.hidden;
    closeRegions(b); pop.hidden = !open; b.setAttribute('aria-expanded', open);
  }));
  document.addEventListener('click', e => { if (!e.target.closest('.regions')) closeRegions(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRegions(); });

  // Demo form
  const demoForm = document.getElementById('demo-form');
  if (demoForm) demoForm.addEventListener('submit', e => {
    e.preventDefault();
    const email=document.getElementById('email'), note=document.getElementById('form-note');
    if (!email.value || !email.checkValidity()){ note.textContent='Enter a work email address, like you@company.com.'; email.focus(); return; }
    note.textContent='Thanks. A specialist will email '+email.value+' within one business day.';
    email.value='';
  });
})();

/* Product page panels: rows tick through once when the panel scrolls into view, and again when its button is pressed.
   Markup: [data-anim] with data-running, data-progress ("… {n} of {total}") and data-done; [data-anim-btn]; [data-anim-status]. */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-anim]').forEach(mock => {
    const rows = [...mock.querySelectorAll('.mock-r')];
    const status = mock.querySelector('[data-anim-status]');
    const btn = mock.querySelector('[data-anim-btn]');
    const label = r => r.children[1];
    const finalText = rows.map(r => label(r).textContent);
    const total = rows.length;
    let t = null;
    function show(done){
      rows.forEach((r,i) => {
        const s = label(r);
        r.classList.toggle('pending', i > done);
        s.className = i === done ? 'run' : 'ok';
        s.textContent = i < done ? finalText[i] : (i === done ? mock.dataset.running : '—');
      });
      if (status) status.textContent = done >= total ? mock.dataset.done : mock.dataset.progress.replace('{n}', Math.min(done+1,total)).replace('{total}', total);
    }
    function play(){
      clearTimeout(t);
      if (reduce){ show(total); return; }
      let i = 0;
      const step = () => { show(i); if (i < total){ i++; t = setTimeout(step, 700); } };
      step();
    }
    show(total);                                   // complete at rest
    if (btn) btn.addEventListener('click', play);
    if (!reduce && 'IntersectionObserver' in window){
      const io = new IntersectionObserver(es => { if (es[0].isIntersecting){ io.disconnect(); setTimeout(play, 400); } }, {threshold:.5});
      io.observe(mock);
    }
  });
})();

/* Total Control: end-to-end journey illustration.
   Drawn from data so it can lay out horizontally on wide screens and vertically on phones. */
(function(){
  const stage = document.getElementById('e2e-stage');
  if (!stage) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const caption = document.getElementById('e2e-caption');
  const replay = document.getElementById('e2e-replay');
  const STEPS = [
    {sys:'Mobile app', step:'Customer files a claim', c:'#8FE3C0'},
    {sys:'Salesforce', step:'Case created', c:'#7FB2FF'},
    {sys:'ServiceNow', step:'Incident raised', c:'#9FE0C8'},
    {sys:'REST API', step:'Order service called', c:'#C9B4FF'},
    {sys:'SAP ERP', step:'Order updated', c:'#FFD08A'},
    {sys:'PDF', step:'Invoice generated', c:'#FFB4A8'}
  ];
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  let raf = null, built = null, layoutKey = '';

  function build(){
    const horizontal = stage.clientWidth >= 760;
    const key = horizontal ? 'h' : 'v';
    if (key === layoutKey && built) return;
    layoutKey = key;
    stage.innerHTML = '';
    const W = horizontal ? 1200 : 360, NW = horizontal ? 180 : 220, NH = 92;
    const pts = STEPS.map((_, i) => horizontal
      ? {x: 112 + i * 195, y: i % 2 ? 300 : 110}
      : {x: i % 2 ? 210 : 150, y: 70 + i * 128});
    const hub = horizontal ? {x: 600, y: 470, w: 240, h: 64} : {x: 180, y: 70 + 6 * 128 + 10, w: 260, h: 64};
    const H = hub.y + hub.h / 2 + 16;
    const svg = el('svg', {viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true'}, stage);
    // orchestration lines from the hub to every system
    STEPS.forEach((_, i) => el('line', {x1: hub.x, y1: hub.y - hub.h / 2, x2: pts[i].x, y2: pts[i].y + NH / 2, class: 'tc-orch'}, svg));
    // the journey path, one segment per hop so we know where each system sits along it
    let d = `M${pts[0].x} ${pts[0].y}`;
    const segs = [];
    for (let i = 1; i < pts.length; i++){
      const a = pts[i - 1], b = pts[i];
      const c = horizontal ? `C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}` : `C${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}`;
      segs.push(el('path', {d: `M${a.x} ${a.y} ${c}`, fill: 'none', stroke: 'none'}, svg));
      d += ' ' + c;
    }
    el('path', {d, class: 'tc-path'}, svg);
    const done = el('path', {d, class: 'tc-path-done'}, svg);
    const total = done.getTotalLength();
    const at = [0]; segs.reduce((acc, s) => { acc += s.getTotalLength(); at.push(acc); return acc; }, 0);
    done.style.strokeDasharray = total; done.style.strokeDashoffset = 0;
    // the marker sits under the system boxes, so it slides into each box rather than covering its label
    const packet = el('circle', {class: 'tc-packet', r: 7, cx: pts[0].x, cy: pts[0].y, style: 'opacity:0'}, svg);
    // systems
    const nodes = STEPS.map((s, i) => {
      const g = el('g', {class: 'tc-node on', transform: `translate(${pts[i].x - NW / 2} ${pts[i].y - NH / 2})`}, svg);
      el('rect', {class: 'box', width: NW, height: NH, rx: 14}, g);
      el('circle', {cx: 26, cy: NH / 2, r: 13, fill: s.c}, g);
      el('text', {class: 'num', x: 26, y: NH / 2 + 4, 'text-anchor': 'middle'}, g).textContent = i + 1;
      const sys = el('text', {class: 'sys', x: 50}, g); sys.textContent = s.sys;
      const step = el('text', {class: 'step', x: 50}, g);
      const lines = fitText(step, s.step, NW - 50 - 14);
      // centre the label block vertically in the box
      const block = 14 + 6 + lines * 18, top = (NH - block) / 2;
      sys.setAttribute('y', top + 11);
      [...step.children].forEach((t, k) => t.setAttribute('y', top + 14 + 6 + 13 + k * 18));
      const tick = el('g', {class: 'tick', transform: `translate(${NW - 14} -6)`}, g);
      el('circle', {r: 11}, tick); el('path', {d: 'M-4.5 0.5l3 3 6-6'}, tick);
      return g;
    });
    // hub
    const hg = el('g', {class: 'tc-hub', transform: `translate(${hub.x - hub.w / 2} ${hub.y - hub.h / 2})`}, svg);
    el('rect', {width: hub.w, height: hub.h, rx: 16}, hg);
    const sym = el('svg', {x: 16, y: 14, width: 34, height: 36, viewBox: '0 0 35 36', style: 'color:#fff'}, hg);
    el('use', {href: '#q-symbol'}, sym);
    el('text', {class: 't1', x: 60, y: 29}, hg).textContent = 'Qualitia Boson';
    el('text', {class: 't2', x: 60, y: 47}, hg).textContent = 'orchestrates every step';
    built = {done, total, at, nodes, packet};
    setCaption(STEPS.length);
  }
  // Wrap a label into at most two lines that fit maxW; shrink the type only if a single word is too wide.
  function fitText(textEl, str, maxW){
    for (let size = 15; size >= 11; size--){
      textEl.style.fontSize = size + 'px';
      textEl.textContent = '';
      const words = str.split(' '), lines = [];
      let cur = '';
      const probe = el('tspan', {x: textEl.getAttribute('x')}, textEl);
      let ok = true;
      for (const w of words){
        const test = cur ? cur + ' ' + w : w;
        probe.textContent = test;
        if (probe.getComputedTextLength() <= maxW) cur = test;
        else { if (!cur){ ok = false; break; } lines.push(cur); cur = w; probe.textContent = w; if (probe.getComputedTextLength() > maxW){ ok = false; break; } }
      }
      probe.remove();
      if (cur) lines.push(cur);
      if (ok && lines.length <= 2){
        lines.forEach(line => { const t = el('tspan', {x: textEl.getAttribute('x')}, textEl); t.textContent = line; });
        return lines.length;
      }
    }
    textEl.textContent = '';
    const t = el('tspan', {x: textEl.getAttribute('x')}, textEl); t.textContent = str;
    return 1;
  }
  function setCaption(n){
    caption.innerHTML = n >= STEPS.length
      ? '<b>Journey passed</b> · 6 systems validated end to end in one test'
      : `Step <b>${n + 1} of ${STEPS.length}</b> · ${STEPS[n].sys} · ${STEPS[n].step}`;
  }
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;   // ease-in-out cubic
  function play(){
    build();
    cancelAnimationFrame(raf);
    const {done, total, at, nodes, packet} = built;
    if (reduce){ nodes.forEach(n => n.classList.add('on')); packet.style.opacity = 0; setCaption(STEPS.length); return; }
    nodes.forEach((n, i) => n.classList.toggle('on', i === 0));
    // timeline: short dwell on the first system, then for each hop an eased move followed by a dwell
    const MOVE = 1000, DWELL = 420, hops = at.length - 1;
    const T = DWELL + hops * (MOVE + DWELL);
    const lenAt = ms => {
      if (ms <= DWELL) return 0;
      const k = ms - DWELL, hop = Math.min(hops - 1, Math.floor(k / (MOVE + DWELL)));
      const local = k - hop * (MOVE + DWELL);
      const f = local >= MOVE ? 1 : ease(local / MOVE);
      return at[hop] + (at[hop + 1] - at[hop]) * f;
    };
    packet.style.transition = 'none'; packet.style.opacity = 1;
    const start = performance.now();
    const frame = now => {
      const ms = Math.min(T, now - start), len = lenAt(ms);
      const pt = done.getPointAtLength(len);
      packet.setAttribute('cx', pt.x); packet.setAttribute('cy', pt.y);
      done.style.strokeDashoffset = total - len;
      let reached = 0;
      at.forEach((l, i) => { const on = len >= l - 0.5; nodes[i].classList.toggle('on', on); if (on) reached = i; });
      if (ms < T){ setCaption(reached); raf = requestAnimationFrame(frame); }
      else { setCaption(STEPS.length); packet.style.transition = 'opacity .7s ease'; packet.style.opacity = 0; }
    };
    done.style.strokeDashoffset = total;
    raf = requestAnimationFrame(frame);
  }
  build();
  replay.addEventListener('click', play);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const k = stage.clientWidth >= 760 ? 'h' : 'v'; if (k !== layoutKey){ cancelAnimationFrame(raf); built = null; build(); } }, 150); });
  if (!reduce && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting){ io.disconnect(); setTimeout(play, 300); } }, {threshold: .4});
    io.observe(stage);
  }
})();

/* Total Control: CI/CD pipeline simulator (illustrative). */
(function(){
  const ci = document.getElementById('ci');
  if (!ci) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOOLS = {
    ado: {name: 'Azure DevOps', report: 'Azure Test Plans', tracker: 'Azure Boards', bug: 'Bug 4821'},
    gh:  {name: 'GitHub Actions', report: 'GitHub checks', tracker: 'Jira', bug: 'QA-1287'},
    jk:  {name: 'Jenkins', report: 'Jenkins test report', tracker: 'Jira', bug: 'QA-1287'}
  };
  const LANES = [{n: 'Chrome', t: 142}, {n: 'Edge', t: 138}, {n: 'Mobile · Android', t: 64}];
  const stages = [...ci.querySelectorAll('.tc-stages li')];
  const lanes = [...ci.querySelectorAll('.tc-lane')];
  const log = ci.querySelector('.tc-log');
  const gate = ci.querySelector('.tc-gate b');
  const runBtn = ci.querySelector('#ci-run');
  const defect = ci.querySelector('#ci-defect');
  const tabs = [...ci.querySelectorAll('.tc-tools button')];
  let tool = 'ado', timers = [], running = false;
  const fill = (k, v) => ci.querySelectorAll(`[data-fill="${k}"]`).forEach(e => e.textContent = v);
  function setTool(k){
    tool = k;
    tabs.forEach(b => b.setAttribute('aria-selected', b.dataset.tool === k));
    fill('tool', TOOLS[k].name); fill('report', TOOLS[k].report); fill('tracker', TOOLS[k].tracker);
  }
  const stageState = (i, s, time) => { stages[i].dataset.state = s; stages[i].querySelector('.tm').textContent = time || (s === 'waiting' ? 'queued' : s === 'running' ? 'running' : ''); };
  const line = (cls, mark, text) => { const li = document.createElement('li'); li.innerHTML = `<span class="${cls}">${mark}</span><span></span>`; li.lastChild.textContent = text; log.appendChild(li); };
  const lane = (i, done, fail) => { const l = LANES[i]; lanes[i].querySelector('i').style.width = (done / l.t * 100) + '%'; lanes[i].querySelector('.cnt').textContent = fail ? `${done - 1} passed · 1 failed` : `${done} / ${l.t}`; lanes[i].classList.toggle('has-fail', !!fail); };
  function finalState(withDefect){
    const T = TOOLS[tool];
    ['0:04','1:12','2:31', withDefect ? '6:12' : '6:12','0:09','0:01'].forEach((t, i) => stageState(i, 'pass', t));
    LANES.forEach((l, i) => lane(i, l.t, withDefect && i === 0));
    log.innerHTML = '';
    line('info', '›', `${T.name}: deploy to UAT finished, regression triggered`);
    line('ok', '✓', 'Boson: 344 tests across 3 parallel lanes on BrowserStack');
    if (withDefect){
      stageState(3, 'fail', '6:12'); stageState(5, 'fail', 'blocked');
      line('bad', '✕', 'Failed: Quote with CPQ discount approval (Chrome)');
      line('ok', '✓', `JUnit XML published to ${T.report}`);
      line('bad', '!', `${T.tracker}: ${T.bug} created with screenshots and steps`);
      line('bad', '✕', 'Release gate: blocked until the defect is fixed');
      gate.textContent = 'Blocked'; gate.className = 'blocked';
    } else {
      line('ok', '✓', '344 passed · 0 failed · 6m 12s');
      line('ok', '✓', `JUnit XML published to ${T.report}`);
      line('ok', '✓', 'Release gate: promoted to production');
      gate.textContent = 'Promoted'; gate.className = '';
    }
  }
  function run(){
    if (running) return;
    timers.forEach(clearTimeout); timers = [];
    const withDefect = defect.checked, T = TOOLS[tool];
    if (reduce){ finalState(withDefect); return; }
    running = true; runBtn.disabled = true;
    stages.forEach((_, i) => stageState(i, 'waiting'));
    LANES.forEach((_, i) => lane(i, 0));
    log.innerHTML = ''; gate.textContent = 'Waiting'; gate.className = '';
    let t = 0;
    const at = (ms, fn) => { t += ms; timers.push(setTimeout(fn, t)); };
    at(100, () => { stageState(0, 'running'); line('info', '›', `${T.name}: commit pushed to release/sprint-14`); });
    at(700, () => { stageState(0, 'pass', '0:04'); stageState(1, 'running'); });
    at(800, () => { stageState(1, 'pass', '1:12'); stageState(2, 'running'); line('info', '›', 'Deploying build 14.2 to the UAT sandbox'); });
    at(800, () => { stageState(2, 'pass', '2:31'); stageState(3, 'running'); line('info', '›', 'Boson: 344 tests started on 3 parallel lanes'); });
    const STEPS = 12;
    for (let s = 1; s <= STEPS; s++) at(200, () => LANES.forEach((l, i) => lane(i, Math.round(l.t * s / STEPS), withDefect && i === 0 && s === STEPS)));
    at(200, () => {
      if (withDefect){ stageState(3, 'fail', '6:12'); line('bad', '✕', 'Failed: Quote with CPQ discount approval (Chrome)'); }
      else { stageState(3, 'pass', '6:12'); line('ok', '✓', '344 passed · 0 failed · 6m 12s'); }
      stageState(4, 'running');
    });
    at(700, () => {
      stageState(4, 'pass', '0:09'); line('ok', '✓', `JUnit XML published to ${T.report}`);
      if (withDefect) line('bad', '!', `${T.tracker}: ${T.bug} created with screenshots and steps`);
      stageState(5, 'running');
    });
    at(700, () => {
      if (withDefect){ stageState(5, 'fail', 'blocked'); line('bad', '✕', 'Release gate: blocked until the defect is fixed'); gate.textContent = 'Blocked'; gate.className = 'blocked'; }
      else { stageState(5, 'pass', '0:01'); line('ok', '✓', 'Release gate: promoted to production'); gate.textContent = 'Promoted'; gate.className = ''; }
      running = false; runBtn.disabled = false;
    });
  }
  tabs.forEach(b => b.addEventListener('click', () => { if (running) return; setTool(b.dataset.tool); finalState(defect.checked && false); }));
  runBtn.addEventListener('click', run);
  setTool('ado');
  finalState(false);              // complete at rest: the last run passed
})();
