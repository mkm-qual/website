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
    sf:{meta:'sprint 14 · UAT sandbox', release:['Sprint 14 · 37 changes','Instant update · 412 tests'], lines:[
      ['Lead → Opportunity conversion','1.8s'],['Quote with CPQ discount approval','3.2s'],['Case escalation to Tier 2','2.1s'],
      ['Lightning page layout · Account','0.9s','healed · field moved'],['Experience Cloud partner login','1.4s'],['Order sync → ERP integration','4.6s'],['Agentforce case summary','2.7s']]},
    sn:{meta:'sprint 9 · test instance', release:['Sprint 9 · 22 changes','Instant update · 268 tests'], lines:[
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

/* Total Control: end-to-end walkthrough. One claim travels through six systems, shown as miniature app screens.
   Auto-advances once it scrolls into view; clicking a step pauses it; Replay starts again. */
(function(){
  const root = document.getElementById('e2e-walk');
  if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEPS = [
    {sys:'Mobile app', step:'Customer files a claim', c:'#8FE3C0', head:'#1f8a68'},
    {sys:'Salesforce', step:'Case created', c:'#7FB2FF', head:'#0b5cab'},
    {sys:'ServiceNow', step:'Incident raised', c:'#9FE0C8', head:'#2f4a3f'},
    {sys:'REST API', step:'Order service called', c:'#C9B4FF', head:'#3b2f73'},
    {sys:'SAP ERP', step:'Order updated', c:'#FFD08A', head:'#1d3a5f'},
    {sys:'PDF', step:'Invoice generated', c:'#FFB4A8', head:'#6b2b24'}
  ];
  const fld = (a, b) => `<div class="e2e-fld"><span>${a}</span><span>${b}</span></div>`;
  const chk = (...c) => `<div class="e2e-chk">${c.map(x => `<span>✓ ${x}</span>`).join('')}</div>`;
  const head = (i, title, sys) => `<div class="e2e-app-h" style="background:${STEPS[i].head}">${title}${sys ? `<small>${sys}</small>` : ''}</div>`;
  const SCREENS = [
    `<div class="e2e-phone"><div class="e2e-app">${head(0,'File a claim')}<div class="e2e-app-b">${fld('Policy','HM-88310')}${fld('Claim','CLM-2041')}${fld('Amount','$1,240.00')}<div class="e2e-btn">Submit claim</div>${chk('submitted')}</div></div></div>`,
    `<div class="e2e-app">${head(1,'Case 00012871','Salesforce')}<div class="e2e-app-b">${fld('Claim','CLM-2041')}${fld('Amount','$1,240.00')}${fld('Status','New')}${fld('Owner','Claims queue')}${chk('claim ID matches','amount matches')}</div></div>`,
    `<div class="e2e-app">${head(2,'INC0021457','ServiceNow')}<div class="e2e-app-b">${fld('Short description','Claim CLM-2041 review')}${fld('Priority','3 · Moderate')}${fld('Linked case','00012871')}${chk('case linked','claim ID matches')}</div></div>`,
    `<div class="e2e-json">POST /orders/claims<br>{<br>&nbsp;&nbsp;<span class="k">"claimId"</span>: <span class="s">"CLM-2041"</span>,<br>&nbsp;&nbsp;<span class="k">"amount"</span>: <span class="v">1240.00</span>,<br>&nbsp;&nbsp;<span class="k">"currency"</span>: <span class="s">"USD"</span><br>}<br><span class="s">200 OK</span> · 184 ms</div><div class="e2e-under">${chk('status 200','payload matches')}</div>`,
    `<div class="e2e-app">${head(4,'Sales order 4500128','SAP ERP')}<div class="e2e-app-b">${fld('Reference','CLM-2041')}${fld('Net value','1,240.00 USD')}${fld('Status','Updated')}${chk('order updated','amount matches')}</div></div>`,
    `<div class="e2e-pdf"><h5>Invoice INV-77120</h5><div style="color:#5b6573">Claim CLM-2041</div><div class="ln" style="width:90%"></div><div class="ln" style="width:70%"></div><div class="ln" style="width:80%"></div><div class="tot"><span>Total</span><span>$1,240.00</span></div>${chk('PDF generated','total matches')}</div>`
  ];
  const stepsEl = root.querySelector('.e2e-steps'), prog = root.querySelector('.e2e-prog'), stage = root.querySelector('.e2e-stage');
  const caption = document.getElementById('e2e-caption'), replay = document.getElementById('e2e-replay');
  STEPS.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button"><span class="e2e-n" style="background:${s.c}">${i + 1}</span><span class="e2e-t"><small>${s.sys}</small><b>${s.step}</b></span><span class="e2e-d" aria-hidden="true"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/><path d="M5.8 10.4l2.8 2.8 5.6-6"/></svg></span></button>`;
    li.querySelector('button').addEventListener('click', () => go(i, true));
    stepsEl.appendChild(li);
    prog.insertAdjacentHTML('beforeend', '<i><b></b></i>');
    const scr = document.createElement('div'); scr.className = 'e2e-scr'; scr.setAttribute('aria-hidden', 'true'); scr.innerHTML = SCREENS[i]; stage.appendChild(scr);
  });
  const lis = [...stepsEl.children], bars = [...prog.children], screens = [...stage.children];
  let timer = null;
  const DWELL = 2600;
  function go(i, manual){
    clearTimeout(timer);
    screens.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('out', k < i); s.setAttribute('aria-hidden', k !== i); });
    lis.forEach((li, k) => { li.classList.toggle('done', k <= i); const b = li.querySelector('button'); if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    bars.forEach((b, k) => { const f = b.firstChild; f.style.transition = 'none'; f.style.width = k < i ? '100%' : '0'; });
    // keep the current step visible in the scrolling row on phones, without scrolling the page
    const btn = lis[i].querySelector('button');
    if (stepsEl.scrollWidth > stepsEl.clientWidth) stepsEl.scrollTo({left: btn.offsetLeft - stepsEl.clientWidth / 2 + btn.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth'});
    caption.innerHTML = i === STEPS.length - 1
      ? '<b>Journey passed</b> · claim CLM-2041 checked in all 6 systems'
      : `Step <b>${i + 1} of ${STEPS.length}</b> · ${STEPS[i].sys} · ${STEPS[i].step}`;
    const fill = bars[i].firstChild;
    if (manual || reduce || i === STEPS.length - 1){ fill.style.width = '100%'; return; }
    void fill.offsetWidth; fill.style.transition = `width ${DWELL}ms linear`; fill.style.width = '100%';
    timer = setTimeout(() => go(i + 1), DWELL + 100);
  }
  go(0, true);                                    // first screen visible at rest
  replay.addEventListener('click', () => go(0, reduce));
  if (!reduce && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting){ io.disconnect(); go(0); } }, {threshold: .4});
    io.observe(root);
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

/* Day / night switch. Follows the device setting until the visitor picks one; the choice is remembered on this device. */
(function(){
  const btns = [...document.querySelectorAll('[data-theme-toggle]')];
  if (!btns.length) return;
  const root = document.documentElement;
  const media = matchMedia('(prefers-color-scheme: dark)');
  const current = () => root.getAttribute('data-theme') || (media.matches ? 'dark' : 'light');
  function sync(){
    const mode = current();
    btns.forEach(b => {
      b.dataset.mode = mode;
      b.setAttribute('aria-label', mode === 'dark' ? 'Switch to day mode' : 'Switch to night mode');
      b.title = b.getAttribute('aria-label');
    });
  }
  btns.forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('q-theme', next); } catch(err){}
    sync();
  }));
  media.addEventListener('change', sync);   // device switched while no choice is saved
  sync();
})();

/* Resources page: filter chips (also driven by #case-studies, #blogs, #podcasts, #videos and the old #caseStudy, #blog, #podcast, #video links)
   and a click-to-play video that only loads YouTube when asked. */
(function(){
  const grid = document.getElementById('rs-grid');
  if (grid){
    const chips = [...document.querySelectorAll('.rs-filters button')];
    const cards = [...grid.querySelectorAll('.rs-card')];
    const empty = document.getElementById('rs-empty');
    const ALIAS = {casestudy:'case', 'case-studies':'case', 'case-study':'case', blog:'blog', blogs:'blog', podcast:'podcast', podcasts:'podcast', video:'video', videos:'video', all:'all'};
    const HASH = {all:'', case:'case-studies', blog:'blogs', podcast:'podcasts', video:'videos'};
    chips.forEach(c => { const n = c.dataset.filter === 'all' ? cards.length : cards.filter(k => k.dataset.type === c.dataset.filter).length; c.querySelector('span').textContent = n; });
    function apply(f, updateHash){
      chips.forEach(c => c.setAttribute('aria-pressed', c.dataset.filter === f));
      let shown = 0;
      cards.forEach(k => { const on = f === 'all' || k.dataset.type === f; k.hidden = !on; if (on) shown++; });
      empty.hidden = shown > 0;
      if (updateHash) history.replaceState(null, '', HASH[f] ? '#' + HASH[f] : location.pathname);
    }
    chips.forEach(c => c.addEventListener('click', () => apply(c.dataset.filter, true)));
    const fromHash = () => ALIAS[(location.hash || '').slice(1).toLowerCase()] || 'all';
    apply(fromHash(), false);
    addEventListener('hashchange', () => apply(fromHash(), false));
  }
  document.querySelectorAll('[data-yt]').forEach(box => {
    const btn = box.querySelector('button');
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0`;
      f.title = btn.getAttribute('aria-label');
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      box.innerHTML = ''; box.appendChild(f);
    });
  });
})();
