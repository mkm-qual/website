/* Qualitia site behaviour, shared by every page. Each part runs only if its elements exist. */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mega menu
  const menuBtn = document.getElementById('menu-btn'), mega = document.getElementById('mega');
  const setMega = open => { mega.hidden = !open; menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.addEventListener('click', e => { e.stopPropagation(); setMega(mega.hidden); });
  mega.addEventListener('click', e => { if (e.target.closest('a')) setMega(false); });

  // Floating nav: a circle with the Q that opens the menu below it
  const pill = document.getElementById('pill'), pillBtn = document.getElementById('pill-menu'), pillList = document.getElementById('pill-list');
  const setPill = open => { pillList.hidden = !open; pillBtn.setAttribute('aria-expanded', open); pillBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); };
  pillBtn.addEventListener('click', e => { e.stopPropagation(); setPill(pillList.hidden); });
  pillList.addEventListener('click', e => { if (e.target.closest('a')) setPill(false); });
  document.addEventListener('click', e => {
    if (!mega.contains(e.target)) setMega(false);
    if (!pill.contains(e.target)) setPill(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape'){ setMega(false); setPill(false); } });
  let pillShown = null;
  const onScroll = () => {
    const show = scrollY > 360;
    if (show === pillShown) return;          // only touch the DOM when the bar appears or hides
    pillShown = show;
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

  // Stories: on wide screens the section pins while vertical scroll slides the reel across
  (() => {
  const sec = document.querySelector('.stories'), reel = document.getElementById('reel');
  if (!sec || !reel || !sec.querySelector('.hs-pin') || reduce) return;
  const wide = matchMedia('(min-width: 900px) and (min-height: 640px)');
  let on = false, start = 0, dist = 0, last = -1, queued = false;
  const frame = () => {
    queued = false;
    const p = Math.min(1, Math.max(0, (scrollY - start) / dist));
    if (p === last) return;
    last = p;
    reel.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
    reel.style.setProperty('--rx', (p * dist).toFixed(1) + 'px');   // the card glow stays still while the cards slide
  };
  const queue = () => { if (on && !queued){ queued = true; requestAnimationFrame(frame); } };
  const measure = () => {
    sec.classList.remove('hs'); sec.style.height = ''; reel.style.transform = ''; reel.style.removeProperty('--rx'); last = -1;
    on = wide.matches;
    if (!on) return;
    reel.scrollLeft = 0;
    const end = reel.lastElementChild.getBoundingClientRect().right - reel.getBoundingClientRect().left;
    dist = Math.max(0, end + parseFloat(getComputedStyle(reel).paddingRight) - reel.clientWidth);
    if (!dist){ on = false; return; }
    sec.classList.add('hs');
    const pad = parseFloat(getComputedStyle(sec).paddingTop);
    sec.style.height = (pad + innerHeight + dist) + 'px';
    start = sec.getBoundingClientRect().top + scrollY + pad;
    frame();
  };
  // swiped (not pinned): the card glow follows the reel's own scroll the same way
  reel.addEventListener('scroll', () => { if (!on) reel.style.setProperty('--rx', reel.scrollLeft.toFixed(0) + 'px'); }, {passive: true});
  // Arrows step the page instead of the reel while it's pinned
  const nav = document.querySelector('[data-reel-nav="reel"]');
  if (nav) nav.addEventListener('click', e => {
    const b = e.target.closest('[data-dir]');
    if (!on || !b) return;
    e.stopImmediatePropagation();
    const step = reel.firstElementChild.offsetWidth + 16;
    scrollTo({top: scrollY + (+b.dataset.dir) * step, behavior: 'smooth'});
  }, true);
  let t;
  const remeasure = () => { clearTimeout(t); t = setTimeout(() => settle(), 120); };
  addEventListener('scroll', queue, {passive: true});
  addEventListener('resize', remeasure, {passive: true});
  addEventListener('load', () => settle());
  // Remeasure when content above changes height (images, fonts), but not for the height this sets itself
  const host = document.querySelector('main') || document.body;
  let seen = 0;
  const settle = () => { measure(); seen = Math.round(host.getBoundingClientRect().height); };
  new ResizeObserver(en => {
    const h = Math.round(en[0].borderBoxSize ? en[0].borderBoxSize[0].blockSize : host.getBoundingClientRect().height);
    if (Math.abs(h - seen) > 1){ clearTimeout(t); t = setTimeout(settle, 120); }
  }).observe(host);
  settle();
  })();

  // Console runs (illustrative), only on pages that have the console
  if (document.getElementById('c-body')) {
  const RUNS = {
    sf:{meta:'sprint 14 · UAT sandbox', release:['Sprint 14 · 37 changes','Instant Update · 412 tests'], lines:[
      ['Lead → Opportunity conversion','1.8s'],['Quote with CPQ discount approval','3.2s'],['Case escalation to Tier 2','2.1s'],
      ['Lightning page layout · Account','0.9s','healed · field moved'],['Experience Cloud partner login','1.4s'],['Order sync → ERP integration','4.6s'],['Agentforce case summary','2.7s']]},
    sn:{meta:'sprint 9 · test instance', release:['Sprint 9 · 22 changes','Instant Update · 268 tests'], lines:[
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
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) regionBtns.forEach(b => b.parentElement.addEventListener('mouseenter', () => closeRegions(b)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRegions(); });

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

/* Total Control: end-to-end walkthrough. One loan application travels through Salesforce, ServiceNow and an API, shown as miniature app screens.
   Auto-advances once it scrolls into view; clicking a step pauses it; Replay starts again. */
(function(){
  const root = document.getElementById('e2e-walk');
  if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEPS = [
    {sys:'Salesforce', step:'Customer requests a loan', c:'#7FB2FF', head:'#0b5cab'},
    {sys:'Salesforce', step:'Case created', c:'#7FB2FF', head:'#0b5cab'},
    {sys:'ServiceNow', step:'Incident raised', c:'#9FE0C8', head:'#2f4a3f'},
    {sys:'ServiceNow', step:'Incident closed', c:'#8FE3C0', head:'#2f4a3f'},
    {sys:'REST API', step:'Email service called', c:'#C9B4FF', head:'#3b2f73'},
    {sys:'Email', step:'Customer notified', c:'#FFD08A', head:'#1d3a5f'}
  ];
  const fld = (a, b) => `<div class="e2e-fld"><span>${a}</span><span>${b}</span></div>`;
  const chk = (...c) => `<div class="e2e-chk">${c.map(x => `<span>✓ ${x}</span>`).join('')}</div>`;
  const head = (i, title, sys) => `<div class="e2e-app-h" style="background:${STEPS[i].head}">${title}${sys ? `<small>${sys}</small>` : ''}</div>`;
  const SCREENS = [
    `<div class="e2e-phone"><div class="e2e-app">${head(0,'Apply for a loan','Experience Cloud')}<div class="e2e-app-b">${fld('Loan','LN-2041')}${fld('Amount','$25,000')}${fld('Term','36 months')}<div class="e2e-btn">Submit request</div>${chk('submitted')}</div></div></div>`,
    `<div class="e2e-app">${head(1,'Case 00012871','Salesforce')}<div class="e2e-app-b">${fld('Loan','LN-2041')}${fld('Amount','$25,000')}${fld('Status','New')}${fld('Owner','Lending queue')}${chk('loan ID matches','amount matches')}</div></div>`,
    `<div class="e2e-app">${head(2,'INC0021457','ServiceNow')}<div class="e2e-app-b">${fld('Short description','Credit check for LN-2041')}${fld('Priority','3 · Moderate')}${fld('Linked case','00012871')}${chk('case linked','loan ID matches')}</div></div>`,
    `<div class="e2e-app">${head(3,'INC0021457','ServiceNow')}<div class="e2e-app-b">${fld('State','Closed')}${fld('Resolution','Credit check passed')}${fld('Linked case','00012871')}${chk('incident closed','case updated')}</div></div>`,
    `<div class="e2e-json">POST /notifications/email<br>{<br>&nbsp;&nbsp;<span class="k">"loanId"</span>: <span class="s">"LN-2041"</span>,<br>&nbsp;&nbsp;<span class="k">"template"</span>: <span class="s">"loan-approved"</span>,<br>&nbsp;&nbsp;<span class="k">"amount"</span>: <span class="v">25000</span><br>}<br><span class="s">202 Accepted</span> · 142 ms</div><div class="e2e-under">${chk('status 202','payload matches')}</div>`,
    `<div class="e2e-pdf"><h5>Your loan is approved</h5><div style="color:#5b6573">To: customer · Loan LN-2041</div><div class="ln" style="width:90%"></div><div class="ln" style="width:70%"></div><div class="ln" style="width:80%"></div><div class="tot"><span>Amount</span><span>$25,000</span></div>${chk('email delivered','amount matches')}</div>`
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
      ? '<b>Journey passed</b> · loan LN-2041 checked at all 6 steps'
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

/* Total Control: CI/CD pipeline simulator (illustrative). Plays on its own once it scrolls into view: a clean run, then a run
   with an injected defect that Boson catches and the release gate blocks. The buttons replay it; reduced motion keeps it still. */
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
  let tool = 'ado', timers = [], running = false, onDone = null, autoTimer = null;
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
  function run(done){
    if (running) return;
    onDone = typeof done === 'function' ? done : null;
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
      if (onDone){ const f = onDone; onDone = null; f(); }
    });
  }
  const stopAuto = () => { clearTimeout(autoTimer); onDone = null; };
  tabs.forEach(b => b.addEventListener('click', () => { if (running) return; stopAuto(); setTool(b.dataset.tool); finalState(false); }));
  runBtn.addEventListener('click', () => { stopAuto(); run(); });
  defect.addEventListener('change', stopAuto);
  setTool('ado');
  finalState(false);              // complete at rest: the last run passed
  if (!reduce && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      defect.checked = false;
      run(() => { autoTimer = setTimeout(() => { defect.checked = true; run(); }, 1800); });
    }, {threshold: .35});
    io.observe(ci);
  }
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

/* Contact page: weekday date picker, local time slots, country code guess, validation and confirmation. */
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return;
  const $ = id => document.getElementById(id);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  // country code from the visitor's region
  const cc = /^Australia/.test(tz) ? '+61' : /Kolkata|Calcutta/.test(tz) ? '+91' : /^Europe\/London/.test(tz) ? '+44' : /Singapore/.test(tz) ? '+65' : /Dubai/.test(tz) ? '+971' : /^Pacific\/Auckland/.test(tz) ? '+64' : '+1';
  $('ct-cc').value = cc;
  $('ct-tz').textContent = 'Times shown in your time zone' + (tz ? ' (' + tz.replace(/_/g, ' ') + ')' : '');
  // earliest date: next weekday
  const d = new Date(); d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  const iso = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  const minISO = iso(d);
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 60);
  const maxISO = iso(maxDate);

  const rules = {
    'ct-name':    v => v.trim() ? '' : 'Enter your name.',
    'ct-company': v => v.trim() ? '' : 'Enter your company name.',
    'ct-email':   v => !v.trim() ? 'Enter your work email.' : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email, like you@company.com.'),
    'ct-phone':   v => !v.trim() || /^[0-9 ()-]{6,}$/.test(v.trim()) ? '' : 'Enter digits only, for example 212 555 0142.',
    'ct-date':    v => {
      if (!v) return 'Pick a date for your demo.';
      const day = new Date(v + 'T12:00:00').getDay();
      if (day === 0 || day === 6) return 'Pick a weekday; demos run Monday to Friday.';
      if (v < minISO || v > maxISO) return 'Pick a weekday within the next 60 days.';
      return '';
    }
  };
  function check(id){
    const el = $(id), wrap = el.closest('.ct-f'), msg = wrap.querySelector('.ct-msg');
    const m = rules[id](el.value);
    wrap.classList.toggle('err', !!m); msg.textContent = m;
    el.setAttribute('aria-invalid', !!m);
    if (id === 'ct-date') $('ct-date-btn').setAttribute('aria-invalid', !!m);
    return !m;
  }
  Object.keys(rules).forEach(id => $(id).addEventListener('blur', () => check(id)));

  // Date picker: a calendar card in the site's style, writing an ISO date into the hidden #ct-date
  const btn = $('ct-date-btn'), cal = $('ct-cal'), grid = $('ct-cal-grid'), monthEl = $('ct-cal-month'), label = $('ct-date-label');
  const todayISO = iso(new Date());
  let view = new Date(d.getFullYear(), d.getMonth(), 1), focusISO = minISO;
  const fromISO = v => new Date(v + 'T12:00:00');
  const allowed = v => v >= minISO && v <= maxISO && ![0, 6].includes(fromISO(v).getDay());
  function render(){
    monthEl.textContent = view.toLocaleDateString(undefined, {month: 'long', year: 'numeric'});
    const y = view.getFullYear(), m = view.getMonth(), days = new Date(y, m + 1, 0).getDate();
    const lead = (new Date(y, m, 1).getDay() + 6) % 7;            // Monday-first
    let html = '<span class="pad"></span>'.repeat(lead);
    for (let n = 1; n <= days; n++){
      const v = iso(new Date(y, m, n)), ok = allowed(v);
      const name = fromISO(v).toLocaleDateString(undefined, {weekday: 'long', day: 'numeric', month: 'long'});
      html += `<button type="button" data-v="${v}" class="${v === todayISO ? 'today' : ''}" aria-label="${name}" aria-pressed="${v === $('ct-date').value}" tabindex="${v === focusISO ? 0 : -1}"${ok ? '' : ' disabled'}>${n}</button>`;
    }
    grid.innerHTML = html;
    cal.querySelector('[data-step="-1"]').disabled = iso(new Date(y, m, 0)) < minISO;
    cal.querySelector('[data-step="1"]').disabled = iso(new Date(y, m + 1, 1)) > maxISO;
  }
  function moveFocus(v){
    let t = fromISO(v);
    if (iso(t) < minISO) t = fromISO(minISO);
    if (iso(t) > maxISO) t = fromISO(maxISO);
    focusISO = iso(t);
    if (t.getMonth() !== view.getMonth() || t.getFullYear() !== view.getFullYear()){ view = new Date(t.getFullYear(), t.getMonth(), 1); render(); }
    else grid.querySelectorAll('button').forEach(b => b.tabIndex = b.dataset.v === focusISO ? 0 : -1);
    const b = grid.querySelector(`[data-v="${focusISO}"]`); if (b) b.focus();
  }
  function open(){
    const cur = $('ct-date').value;
    focusISO = cur || minISO; const f = fromISO(focusISO); view = new Date(f.getFullYear(), f.getMonth(), 1);
    render(); cal.hidden = false; btn.setAttribute('aria-expanded', 'true');
    (grid.querySelector('[tabindex="0"]:not(:disabled)') || grid.querySelector('button:not(:disabled)'))?.focus();
  }
  function close(refocus){ cal.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); }
  function pick(v){
    $('ct-date').value = v;
    label.textContent = fromISO(v).toLocaleDateString(undefined, {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
    btn.classList.add('has-value');
    close(true); check('ct-date');
  }
  btn.addEventListener('click', () => cal.hidden ? open() : close(false));
  cal.querySelectorAll('.ct-cal-nav').forEach(n => n.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + (+n.dataset.step), 1); render(); }));
  grid.addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) pick(b.dataset.v); });
  grid.addEventListener('keydown', e => {
    const b = e.target.closest('button'); if (!b) return;
    const t = fromISO(b.dataset.v), step = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7}[e.key];
    if (step){ e.preventDefault(); t.setDate(t.getDate() + step); moveFocus(iso(t)); }
    else if (e.key === 'PageUp' || e.key === 'PageDown'){ e.preventDefault(); t.setMonth(t.getMonth() + (e.key === 'PageUp' ? -1 : 1)); moveFocus(iso(t)); }
    else if (e.key === 'Home' || e.key === 'End'){ e.preventDefault(); t.setDate(t.getDate() - (t.getDay() + 6) % 7 + (e.key === 'End' ? 6 : 0)); moveFocus(iso(t)); }
  });
  cal.addEventListener('keydown', e => { if (e.key === 'Escape'){ e.stopPropagation(); close(true); } });
  document.addEventListener('click', e => { if (!cal.hidden && !e.target.closest('.ct-date')) close(false); });
  Object.keys(rules).forEach(id => $(id).addEventListener('input', () => { if ($(id).closest('.ct-f').classList.contains('err')) check(id); }));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = Object.keys(rules).map(check).every(Boolean);
    const slot = form.querySelector('input[name=slot]:checked');
    const slotMsg = $('ct-slot-msg');
    slotMsg.textContent = slot ? '' : 'Pick a time.';
    if (!ok || !slot){
      const first = form.querySelector('.err .ct-in') || (!slot && form.querySelector('input[name=slot]'));
      if (first) first.focus();
      return;
    }
    const first = $('ct-name').value.trim().split(/\s+/)[0];
    const when = new Date($('ct-date').value + 'T12:00:00').toLocaleDateString(undefined, {weekday:'short', day:'numeric', month:'short'});
    const done = $('ct-done');
    done.querySelector('h2').textContent = 'Thanks, ' + first + '.';
    done.querySelector('p').textContent = `We'll confirm your demo on ${when} at ${slot.value} by email at ${$('ct-email').value.trim()}. A specialist will reply within one business day.`;
    form.hidden = true; $('ct-head').hidden = true; done.hidden = false;
    done.querySelector('h2').focus();
  });
})();

/* Legal pages: highlight the table-of-contents entry for the section being read. */
(function(){
  const toc = document.querySelector('.lg-toc');
  if (!toc) return;
  const links = [...toc.querySelectorAll('a')];
  const heads = [...document.querySelectorAll('.lg-body h2[id], .cs-article h2[id]')];
  const update = () => {
    let cur = null;
    heads.forEach(h => { if (h.getBoundingClientRect().top <= 140) cur = h; });
    links.forEach(a => a.classList.toggle('on', !!cur && a.getAttribute('href') === '#' + cur.id));
    const on = toc.querySelector('a.on');
    if (on && toc.scrollHeight > toc.clientHeight) {
      const r = on.getBoundingClientRect(), box = toc.getBoundingClientRect();
      if (r.top < box.top) toc.scrollTop -= box.top - r.top + 8;
      else if (r.bottom > box.bottom) toc.scrollTop += r.bottom - box.bottom + 8;
    }
  };
  addEventListener('scroll', update, {passive: true});
  update();
})();

/* Scroll reveal: cards fade up once as they enter the viewport, staggered within their group. Skipped for reduced motion. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const els = [...document.querySelectorAll('.diff, .cmp, .sf-panel, .results-card, .secure-card, .pp-card, .kpi, .qt, .cs-card, .rs-card')]
    .filter(el => el.getBoundingClientRect().top > innerHeight);   // leave anything already on screen alone
  if (!els.length) return;
  els.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => els.includes(c));
    el.style.setProperty('--rv-i', Math.min(sibs.indexOf(el), 5));
    el.classList.add('rv');
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    const el = e.target, done = ev => { if (ev.target !== el) return; el.removeEventListener('transitionend', done); el.classList.remove('rv', 'in'); el.style.removeProperty('--rv-i'); };
    el.addEventListener('transitionend', done);
  }), {rootMargin: '0px 0px -8% 0px'});
  els.forEach(el => io.observe(el));
})();

/* Box glow: one light field per section, seen through its content boxes (site.css .bx). Each section gets a colour pair
   and a spot for its bright core; the halo sits opposite. Every box gets those spots in its own coordinates, so the
   tiles of a section show different parts of one light instead of repeating the same glow. The field drifts on its own
   (CSS) and slides against the scroll for parallax, per section. Positions are measured once per layout. */
(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const BOX = '.media,.overview,.cmp,.diff,.sf-panel,.secure-card,.story:not(.dark),.quote,.tile:not(.tile-cta),.kpi,.qt,.pp-card,.tc-e2e,.cs-feat,.cs-chart,.bl-card:not(.hi),.ind-panel';
  // [core, halo, core x, core y] with x and y as fractions of the section
  const P = [
    ['rgba(122,92,255,.30)', 'rgba(0,149,235,.22)',  .22, .35],
    ['rgba(0,212,232,.30)',  'rgba(0,149,235,.22)',  .78, .4],
    ['rgba(255,92,157,.24)', 'rgba(122,92,255,.22)', .3,  .45],
    ['rgba(255,168,74,.32)', 'rgba(0,149,235,.24)',  .5,  .55],   // charts: centred, so the light sweeps through all four
    ['rgba(0,149,235,.30)',  'rgba(122,92,255,.20)', .72, .3],
    ['rgba(0,212,232,.30)',  'rgba(0,149,235,.22)',  .28, .4],
    ['rgba(52,195,143,.27)', 'rgba(0,149,235,.20)',  .74, .45],
    ['rgba(255,168,74,.35)', 'rgba(255,92,157,.20)', .4,  .4]
  ];
  const secs = [];
  let n = 0;
  [...main.children].forEach(sec => {
    if (sec.matches('.sh, .logos')) return;
    const boxes = sec.matches(BOX) ? [sec] : [...sec.querySelectorAll(BOX)];   // a box can be a section of its own
    if (!boxes.length) return;
    const p = P[n++ % P.length];
    sec.style.setProperty('--ga', p[0]); sec.style.setProperty('--gb', p[1]);
    boxes.forEach(b => b.classList.add('bx'));
    secs.push({sec, boxes, x: p[2], y: p[3], c: 0, py: null});
  });
  if (!secs.length) return;
  const measure = () => {
    secs.forEach(S => {
      const s = (S.sec.querySelector('.hs-pin') || S.sec).getBoundingClientRect();   // a pinned section: light the pinned panel
      S.c = s.top + scrollY + s.height / 2;
      // the core at (x, y) of the section, the halo opposite and lower; in each box's layer coordinates (layer = box + one box size each side)
      const cx = s.left + s.width * S.x, cy = s.top + s.height * S.y, hx = s.left + s.width * (1 - S.x), hy = s.top + s.height * .75;
      S.boxes.forEach(b => {
        // in the sideways reel, measure each card at rest: add back how far the reel has slid (--rx)
        const rx = parseFloat(getComputedStyle(b).getPropertyValue('--rx')) || 0;
        const r = b.getBoundingClientRect(), ox = r.left + rx - r.width, oy = r.top - r.height;   // the layer reaches one box size past each edge
        b.style.setProperty('--cx', (cx - ox).toFixed(0) + 'px'); b.style.setProperty('--cy', (cy - oy).toFixed(0) + 'px');
        b.style.setProperty('--hx', (hx - ox).toFixed(0) + 'px'); b.style.setProperty('--hy', (hy - oy).toFixed(0) + 'px');
      });
      S.py = null;
    });
    queue();
  };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let queued = false;
  const frame = () => {
    queued = false;
    const mid = scrollY + innerHeight / 2;
    secs.forEach(S => {
      const py = Math.max(-80, Math.min(80, (S.c - mid) * .09));
      if (Math.abs(S.c - mid) > innerHeight * 1.5) return;                 // off screen: leave it
      if (S.py === null || Math.abs(py - S.py) > .5){ S.py = py; S.sec.style.setProperty('--py', py.toFixed(1) + 'px'); }
    });
  };
  const queue = () => { if (!still && !queued){ queued = true; requestAnimationFrame(frame); } };
  let t;
  const remeasure = () => { clearTimeout(t); t = setTimeout(measure, 150); };
  addEventListener('scroll', queue, {passive: true});
  addEventListener('resize', remeasure, {passive: true});
  addEventListener('load', measure);
  new ResizeObserver(remeasure).observe(main);
  measure();
})();

/* Light motion inside sections, once each as it scrolls in: headings fade up, list items and tiles rise in turn,
   the effort chart wipes across the year, security icons draw their outlines and the CTA mascot waves. Skipped for reduced motion. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const GROUPS = [
    ['.sec-title, .turn-head, .ov-text > h2, .ov-text > .lede', 'rv'],
    ['.ov-types li, .pillars li, .sf-tiles li, .sf-chain li, .sec-items > div, .ba-r:not(.ba-h), .proof-foot', 'rv-s'],
    ['.effort', 'rv-wipe'],
    ['.sec-ico', 'rv-draw'],
    ['.cta-mascot', 'rv-wave']
  ];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el); el.classList.add('in');
    const cls = el.dataset.rv;
    if (cls === 'rv-draw') return;                                 // the outline stays drawn; nothing to undo
    const done = ev => {
      if (ev.target !== el) return;
      el.removeEventListener(cls === 'rv-wave' ? 'animationend' : 'transitionend', done);
      el.classList.remove(cls, 'in'); el.style.removeProperty('--rv-i'); delete el.dataset.rv;
    };
    el.addEventListener(cls === 'rv-wave' ? 'animationend' : 'transitionend', done);
  }), {rootMargin: '0px 0px -8% 0px'});
  GROUPS.forEach(([sel, cls]) => {
    const els = [...document.querySelectorAll(sel)].filter(el => !el.classList.contains('rv') && el.getBoundingClientRect().top > innerHeight);
    els.forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => els.includes(c));
      el.style.setProperty('--rv-i', Math.min(sibs.indexOf(el), 8));
      if (cls === 'rv-draw') el.querySelectorAll('path, circle, rect').forEach(n => n.setAttribute('pathLength', '1'));
      el.dataset.rv = cls; el.classList.add(cls);
      io.observe(el);
    });
  });
})();

/* ROI charts on hover: one tooltip follows the pointer over any [data-tip] row; the effort chart gets a crosshair
   that reads both curves (sampled once from the SVG paths) and marks the avoided upkeep between them. */
(() => {
  const rows = document.querySelectorAll('.turn [data-tip]'), eff = document.querySelector('.effort');
  if (!rows.length && !eff) return;
  const tip = document.createElement('div'); tip.className = 'chart-tip'; tip.setAttribute('aria-hidden', 'true'); document.body.append(tip);
  const show = (html, e) => {
    tip.innerHTML = html; tip.classList.add('on');
    const w = tip.offsetWidth, x = Math.min(innerWidth - w - 12, e.clientX + 14), y = e.clientY - tip.offsetHeight - 14;
    tip.style.transform = 'translate(' + Math.max(12, x) + 'px,' + (y < 8 ? e.clientY + 18 : y) + 'px)';
  };
  const hide = () => tip.classList.remove('on');
  rows.forEach(r => {
    const [head, rest] = r.dataset.tip.split(' · ');
    r.addEventListener('pointermove', e => show('<b>' + head + '</b><br>' + rest, e));
    r.addEventListener('pointerleave', hide);
  });
  if (!eff) return;
  const svg = eff.querySelector('svg'), them = svg.querySelector('.ef-them'), us = svg.querySelector('.ef-us');
  const x = eff.querySelector('.ef-x'), dThem = x.querySelector('.them'), dUs = x.querySelector('.us'), gap = x.querySelector('.ef-gap');
  // top edge of each area: the highest point at every x across the 400-wide viewBox
  const edge = path => { const top = new Float32Array(401).fill(180), n = 600, L = path.getTotalLength();
    for (let i = 0; i <= n; i++){ const p = path.getPointAtLength(L * i / n), k = Math.round(p.x); if (k >= 0 && k <= 400 && p.y < top[k]) top[k] = p.y; }
    for (let k = 1; k <= 400; k++) if (top[k] >= 180 && top[k - 1] < 180) top[k] = top[k - 1];
    return top; };
  let eThem, eUs;
  eff.addEventListener('pointermove', e => {
    if (!eThem){ eThem = edge(them); eUs = edge(us); }
    const r = svg.getBoundingClientRect(), fx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), k = Math.round(fx * 400);
    const yT = eThem[k] / 180 * r.height, yU = eUs[k] / 180 * r.height, top = r.top - eff.getBoundingClientRect().top;
    x.style.left = (fx * r.width) + 'px'; x.style.top = top + 'px'; x.style.height = r.height + 'px';
    dThem.style.top = yT + 'px'; dUs.style.top = yU + 'px';
    gap.style.top = yT + 'px'; gap.style.height = Math.max(0, yU - yT) + 'px';
    show('<b>Sprint ' + (1 + Math.round(fx * 25)) + '</b><br>Highlighted: the upkeep script-based suites need and Boson avoids', e);
  });
  eff.addEventListener('pointerleave', hide);
})();

/* Results: when the card comes into view the stats rise in turn and each figure counts up to its value. Reduced motion shows them as written. */
(() => {
  const card = document.querySelector('.results-card');
  if (!card || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const stats = [...card.querySelectorAll('.stat')];
  stats.forEach((st, i) => st.style.setProperty('--i', i));
  // the last whole number in each figure counts: from the low end of a range (5–7×), otherwise from 0
  const figs = [...card.querySelectorAll('.num:not(.sm)')].map(el => {
    const t = el.textContent, m = t.match(/(\d+)(?!.*\d)/);
    if (!m) return null;
    const lo = t.slice(0, m.index).match(/(\d+)\D*$/);
    return {el, t, at: m.index, len: m[1].length, to: +m[1], from: lo ? +lo[1] : 0, i: stats.indexOf(el.closest('.stat'))};
  }).filter(Boolean);
  const paint = (f, v) => { f.el.textContent = f.t.slice(0, f.at) + v + f.t.slice(f.at + f.len); };
  figs.forEach(f => { f.el.setAttribute('aria-label', f.t); paint(f, f.from); });
  card.classList.add('anim');
  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return;
    io.disconnect();
    card.classList.add('play');
    const t0 = performance.now();
    const tick = now => {
      let busy = false;
      figs.forEach(f => {
        const k = Math.min(1, Math.max(0, (now - t0 - 250 - f.i * 140) / 1400));
        paint(f, Math.round(f.from + (f.to - f.from) * (1 - Math.pow(1 - k, 3))));
        if (k < 1) busy = true;
      });
      if (busy) requestAnimationFrame(tick); else figs.forEach(f => { f.el.textContent = f.t; f.el.removeAttribute('aria-label'); });
    };
    requestAnimationFrame(tick);
  }, {threshold: .35});
  io.observe(card);
})();

/* Homepage features: one value block in focus at a time. The block nearest the middle of the screen is at full strength;
   the others fade back, and the focus moves on as you scroll. Above the section the first block leads, below it the last.
   This runs before the hero's frame (it is registered first), so it measures a clean layout and costs four cheap reads.
   Reduced motion shows every block at full strength. */
(() => {
  const wrap = document.getElementById('features');
  if (!wrap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const feats = [...wrap.querySelectorAll('.feat')];
  if (feats.length < 2) return;
  wrap.classList.add('focus-mode');
  let current = null, queued = false;
  const update = () => {
    queued = false;
    const mid = innerHeight / 2;
    let best = feats[0], dist = Infinity;
    for (const f of feats){
      const r = f.getBoundingClientRect();
      const d = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0;   // 0 when the block spans the middle
      if (d < dist){ dist = d; best = f; }
    }
    if (best !== current){ feats.forEach(f => f.classList.toggle('is-focus', f === best)); current = best; }
  };
  const queue = () => { if (!queued){ queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, {passive: true});
  addEventListener('resize', queue, {passive: true});
  update();
})();

/* Hero art: two silk ribbons sweep up through the hero, Stripe style. Each ribbon folds and twists along its length
   (the visible width follows the twist), shades darker in the folds, catches a sheen, and carries fine fibres along it.
   Colours run Qualitia blue, violet, pink and amber. The ground is the hero's own background, so it works in light and dark.
   It leans a little toward the pointer, pauses off screen or in a background tab, and shows one still frame for reduced motion.
   Without WebGL the CSS colour blobs stay. */
(() => {
  const mesh = document.querySelector('.sh-mesh'), stick = mesh && mesh.closest('.sh-stick');
  if (!mesh) return;
  const cv = document.createElement('canvas');
  const gl = cv.getContext('webgl', {antialias: false, alpha: false, powerPreference: 'low-power'});
  if (!gl) return;
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `precision highp float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 bg;
vec3 grad(float k){vec3 a=vec3(0.,.584,.922),b=vec3(.478,.361,1.),c=vec3(1.,.36,.616),d=vec3(1.,.66,.29);
return k<.34?mix(a,b,k/.34):k<.68?mix(b,c,(k-.34)/.34):mix(c,d,(k-.68)/.32);}
// one ribbon flowing across the full width: a gentle S-curve that dips under the middle and lifts at both sides,
// twisting as it goes. The top edge is crisp, the lower edge melts away; colour runs across and along the band,
// with darker folds, a sheen and fine fibres along its length
vec4 ribbon(vec2 uv,float asp,float y0,float lift,float W,float ph,float tw,float T,float px){
float x=uv.x-.5;
float yc=y0+lift*x*x*4.+.045*sin(x*5.+T*.6+ph)+.02*sin(x*11.-T*.4+ph)+m.y*.03;
float sl=lift*x*8.+.225*cos(x*5.+T*.6+ph)+.22*cos(x*11.-T*.4+ph);
float d=(uv.y-yc)/sqrt(1.+sl*sl/(asp*asp));
float tws=cos(x*tw-T*.45+ph+m.x*.8);
float hw=W*(.2+.8*abs(tws));
float u=d/hw;
if(abs(u)>1.)return vec4(0.);
float a=u>0.?clamp((1.-u)*hw/px,0.,1.):smoothstep(-1.,-.25,u);
float face=tws<0.?-1.:1.;
float fold=smoothstep(0.,.8,abs(tws));
float k=clamp(.5+.3*u*face*smoothstep(0.,.45,abs(tws))+.5*x+.12*sin(T*.3+ph),0.,1.);
vec3 c=grad(k);
c*=.74+.26*fold;
c+=exp(-pow((u-.3*face)*2.4,2.))*.28*fold;
c*=1.+.045*sin(u*190.+sin(x*30.+ph)*2.)*sin(u*31.+x*12.);
c=mix(c,vec3(1.),.07-.07*face*smoothstep(0.,.45,abs(tws)));
return vec4(c,a);}
void main(){
vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;float T=t*.1;float px=1.5/r.y;
vec3 col=bg;
float wd=smoothstep(.6,1.3,asp);   // phones: a little lower and slimmer, under the app window
vec4 b=ribbon(uv,asp,mix(.2,.21,wd),mix(.1,.14,wd),.03,2.4,7.,T,px);
vec4 a=ribbon(uv,asp,mix(.18,.18,wd),mix(.12,.16,wd),mix(.08,.11,wd),0.,4.4,T,px);
float edge=smoothstep(.0,.1,uv.y);   // always fade out before the bottom of the hero, so the container never cuts it
col=mix(col,b.rgb,b.a*.8*edge);col=mix(col,a.rgb,a.a*edge);
gl_FragColor=vec4(col,1.);}`;
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm'), uB = gl.getUniformLocation(pr, 'bg');
  cv.className = 'sh-gl'; cv.setAttribute('aria-hidden', 'true');
  mesh.prepend(cv); mesh.classList.add('gl');

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SCALE = Math.min(devicePixelRatio || 1, 2);   // full device resolution (capped at 2x), so the ribbon edges and fibres stay sharp
  const size = () => {
    const w = Math.max(1, Math.round(mesh.clientWidth * SCALE)), h = Math.max(1, Math.round(mesh.clientHeight * SCALE));
    if (cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(uR, w, h); }
  };
  // the ribbons sit on the hero's own background colour, read again whenever the theme changes
  const ground = () => {
    const c = getComputedStyle(stick).backgroundColor.match(/[\d.]+/g) || [0, 22, 48];
    gl.uniform3f(uB, c[0] / 255, c[1] / 255, c[2] / 255);
  };
  const mx = {x: 0, y: 0, tx: 0, ty: 0};
  const draw = time => {
    mx.x += (mx.tx - mx.x) * .04; mx.y += (mx.ty - mx.y) * .04;
    gl.uniform1f(uT, time / 1000 + 30); gl.uniform2f(uM, mx.x, mx.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  size(); ground();
  const redrawStill = () => { if (still) draw(0); };
  addEventListener('resize', () => { size(); redrawStill(); }, {passive: true});
  new MutationObserver(() => { ground(); redrawStill(); }).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { ground(); redrawStill(); });
  if (still){ draw(0); return; }
  addEventListener('pointermove', e => { mx.tx = e.clientX / innerWidth - .5; mx.ty = .5 - e.clientY / innerHeight; }, {passive: true});
  let on = true, raf = 0;
  const loop = time => { raf = 0; draw(time); if (on && !document.hidden) raf = requestAnimationFrame(loop); };
  const wake = () => { if (on && !document.hidden && !raf) raf = requestAnimationFrame(loop); };
  new IntersectionObserver(es => { on = es[0].isIntersecting; wake(); }).observe(mesh);
  document.addEventListener('visibilitychange', wake);
  wake();
})();

/* Homepage hero: scroll story. One rAF loop reads how far the pinned hero has scrolled and writes CSS variables; site.css draws it.
   Reduced motion shows the finished state, unpinned. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  // write a CSS variable only when its value changes: most frames touch a handful of properties instead of forty
  const memo = new WeakMap();
  const set = (el, k, v) => {
    const val = typeof v === 'number' ? v.toFixed(3) : v;
    let m = memo.get(el); if (!m){ m = {}; memo.set(el, m); }
    if (m[k] !== val){ m[k] = val; el.style.setProperty(k, val); }
  };
  const text = (el, t) => { if (el.textContent !== String(t)) el.textContent = t; };
  const sh = document.getElementById('hero');
  const stick = sh && sh.querySelector('.sh-stick');
  const hero = sh && {
    lines: [...sh.querySelectorAll('.sh-line')],
    steps: [...sh.querySelectorAll('.sh-steps li')],
    side: [...sh.querySelectorAll('.sh-side span')],
    rows: [...sh.querySelectorAll('.sh-row')],
    app: sh.querySelector('.sh-app'),
    go: sh.querySelector('.sh-go'), goT: sh.querySelector('.sh-go-t'), ripple: sh.querySelector('.sh-ripple'),
    hand: sh.querySelector('.sh-hand'),
    end: sh.querySelector('.sh-end'), hint: sh.querySelector('.sh-hint'),
    tests: document.getElementById('sh-tests'), cov: document.getElementById('sh-cov'), time: document.getElementById('sh-time')
  };
  let lastRail = -1, lastLine = -1;
  // geometry read once per layout (load, resize): the hand's start and target, and where the scroll hint sits
  let geo = null;
  function measure(){
    const h = hero, a = h.app.style.getPropertyValue('--a'), z = stick.style.getPropertyValue('--z'), o = h.lines[0].style.getPropertyValue('--o');
    const sr = stick.getBoundingClientRect();
    h.app.style.setProperty('--a', '0'); stick.style.setProperty('--z', '0');           // the window as it sits when the hand arrives
    const br = h.go.getBoundingClientRect();
    h.app.style.setProperty('--a', '1'); h.lines[0].style.setProperty('--o', '1');     // the opening frame, for the hint
    const hint = (h.lines[0].getBoundingClientRect().bottom + h.app.getBoundingClientRect().top) / 2 - sr.top;
    h.app.style.setProperty('--a', a); stick.style.setProperty('--z', z); h.lines[0].style.setProperty('--o', o);
    const hw = h.hand.offsetWidth, hh = hw * 42 / 34;
    geo = {w: sr.width, hgt: sr.height, tx: br.left - sr.left + br.width * .62 - hw * .35, ty: br.top - sr.top + br.height * .55 - hh * .05};
    h.hint.style.setProperty('--hint-y', hint.toFixed(1) + 'px');
  }

  function drawHero(p){
    const h = hero;
    set(stick, '--p', p);
    // 1. the window rises and lays flat
    set(h.app, '--a', 1 - ease(seg(p, 0, .14)));
    // org metadata is read, one item at a time
    const sc = seg(p, .02, .2) * h.side.length;
    const si = Math.floor(sc);
    if (si !== h._si){ h._si = si; h.side.forEach((s, i) => { s.classList.toggle('scan', i === si && sc < h.side.length); s.classList.toggle('done', i < si); }); }

    // 2. the hand travels to Generate, 3. clicks
    if (!geo) measure();
    const {tx, ty} = geo, sx = geo.w * .92, sy = geo.hgt * 1.08;
    const m = ease(seg(p, .1, .3));
    const out = ease(seg(p, .4, .54));
    const hx = sx + (tx - sx) * m + out * 70, hy = sy + (ty - sy) * m - Math.sin(Math.PI * m) * geo.hgt * .12 + out * 90;
    const press = seg(p, .31, .36);
    set(h.hand, '--hx', hx.toFixed(1) + 'px'); set(h.hand, '--hy', hy.toFixed(1) + 'px');
    set(h.hand, '--hs', 1 - .2 * Math.sin(Math.PI * press));
    set(h.hand, '--hr', (8 * (1 - m)).toFixed(2) + 'deg');
    set(h.hand, '--ho', 1 - seg(p, .46, .56));
    const gs = (p > .26 && p < .31 ? 'hover' : '') + (press > .15 && press < .85 ? ' press' : '');
    if (gs !== h._gs){ h._gs = gs; h.go.classList.toggle('hover', gs.includes('hover')); h.go.classList.toggle('press', gs.includes('press')); }
    set(h.ripple, '--r', seg(p, .33, .44)); set(h.ripple, '--rv', p > .33 ? 1 : 0);

    // 4. journeys generate, one after another
    let total = 0;
    h.rows.forEach((r, i) => {
      const a = .38 + i * .045, f = ease(seg(p, a, a + .12));
      total += f;
      set(r, '--f', f); set(r, '--v', seg(p, a - .06, a));
      const st = f >= 1 ? 'ok' : f > 0 ? 'go' : '';
      if (r.dataset.st !== st){
        r.dataset.st = st; r.classList.toggle('ok', st === 'ok'); r.classList.toggle('go', st === 'go');
        if (st !== 'go') text(r.querySelector('.st'), st === 'ok' ? '✓ ' + r.dataset.steps + ' steps' : 'queued');
      }
      if (st === 'go') text(r.querySelector('.st'), 'building ' + Math.round(f * 100) + '%');
    });
    const g = total / h.rows.length;
    text(h.tests, Math.round(412 * g));
    text(h.cov, Math.round(72 * g) + '%');
    text(h.time, Math.round(38 * g) + 's');
    const state = g >= 1 ? 'done' : p > .36 ? 'run' : '';
    if (h.go.dataset.st !== state){
      h.go.dataset.st = state; h.go.classList.toggle('run', state === 'run');
      h.goT.textContent = state === 'done' ? '✓ 6 journeys ready' : state === 'run' ? 'Generating…' : 'Generate';
    }

    // 5. release: the window settles and the call to action arrives
    set(stick, '--z', ease(seg(p, .76, .9)));
    const e = ease(seg(p, .86, .95));
    set(h.end, '--e', e);
    if ((e > .5) !== h._live){ h._live = e > .5; h.end.classList.toggle('live', h._live); }

    // headline crossfade
    const o = [1 - seg(p, .33, .39), seg(p, .4, .46) * (1 - seg(p, .68, .74)), seg(p, .74, .8)];
    h.lines.forEach((l, i) => { set(l, '--o', o[i]); set(l, '--dir', (i === 0 || (i === 1 && p > .7)) ? -1 : 1); });
    const top = o.indexOf(Math.max(...o));
    if (top !== lastLine){ h.lines.forEach((l, i) => i === top ? l.removeAttribute('aria-hidden') : l.setAttribute('aria-hidden', 'true')); lastLine = top; }

    // step bar: each segment fills across its own stretch of the story
    const B = [0, .12, .3, .38, .74, 1];
    const stage = p < .12 ? 0 : p < .3 ? 1 : p < .38 ? 2 : p < .74 ? 3 : 4;
    h.steps.forEach((li, i) => set(li, '--sf', seg(p, B[i], B[i + 1])));
    if (stage !== lastRail){ h.steps.forEach((li, i) => { li.classList.toggle('on', i === stage); li.classList.toggle('done', i < stage); }); lastRail = stage; }
  }

  if (!sh) return;
  if (reduce){ drawHero(1); return; }
  let queued = false;
  const frame = () => {
    queued = false;
    const r = sh.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom > 0 && r.top < vh) drawHero(clamp(-r.top / (r.height - vh)));
  };
  const queue = () => { if (!queued){ queued = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', queue, {passive: true});
  const remeasure = () => { geo = null; queue(); };
  addEventListener('resize', remeasure, {passive: true});
  addEventListener('load', remeasure);
  if (document.fonts) document.fonts.ready.then(remeasure);
  frame();
})();

/* Draw-on-scroll charts */
(() => {
  const els = document.querySelectorAll('[data-draw]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold: .35});
  els.forEach(e => io.observe(e));
})();

/* Customers: industry tabs filter the logo grid (matches tint, others fade) and show that industry's panel.
   Arrow keys move between tabs; #industry-<key> in the URL preselects one. */
(() => {
  const list = document.querySelector('.ind-tabs');
  const grid = document.getElementById('customer-grid');
  if (!list || !grid) return;
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const tiles = [...grid.querySelectorAll('[data-ind]')];
  const panels = [...document.querySelectorAll('.ind-panel')];
  const select = (t, focus) => {
    const key = t.dataset.ind;
    tabs.forEach(b => { const on = b === t; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    panels.forEach(p => { p.hidden = p.id !== 'ind-' + key; });
    grid.classList.toggle('filtering', key !== 'all');
    tiles.forEach(el => el.classList.toggle('match', key !== 'all' && el.dataset.ind.split(' ').includes(key)));
    if (focus) t.focus();
    if (list.scrollWidth > list.clientWidth) list.scrollTo({left: t.offsetLeft - list.offsetLeft - 16, behavior: 'smooth'});
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const k = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });
  const fromHash = () => {
    const m = location.hash.match(/^#industry-([\w-]+)/);
    const t = m && tabs.find(t => t.dataset.ind === m[1]);
    if (t){ select(t); list.scrollIntoView({block: 'start'}); }
  };
  fromHash();
  addEventListener('hashchange', fromHash);     // Industries menu links while already on this page
})();

/* Integration flow: the marker loops down the track (CSS); each system lights up as the marker reaches its dot */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.flow.trk').forEach(fl => {
    const marker = fl.querySelector('.trk-marker'), items = [...fl.querySelectorAll('.trk-item')];
    if (reduce || !marker) { items.forEach(i => i.classList.add('hit')); return; }
    let timers = [];
    const cycle = () => {
      timers.forEach(clearTimeout); timers = [];
      items.forEach(i => i.classList.remove('hit'));
      const T = parseFloat(getComputedStyle(fl).getPropertyValue('--T')) * 1000;
      const box = fl.getBoundingClientRect();
      items.forEach(it => {
        const d = it.querySelector('.trk-dot').getBoundingClientRect();
        const f = (d.top + d.height / 2 - box.top) / box.height;
        timers.push(setTimeout(() => it.classList.add('hit'), f * T * 0.8));   // marker travels during the first 80% of the loop
      });
    };
    marker.addEventListener('animationstart', cycle);
    marker.addEventListener('animationiteration', cycle);
  });
})();

/* Hero video: load the right size, loop it, and blur it in/out over the first and last second of each loop.
   Reduced motion or data saver keeps the still poster. The pause button stops the motion. */
(() => {
  const v = document.getElementById('hero-video');
  if (!v) return;
  const btn = document.getElementById('hero-pause');
  const small = matchMedia('(max-width: 720px)').matches;
  if (small && v.dataset.posterSm) v.poster = v.dataset.posterSm;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || saveData) { if (btn) btn.hidden = true; return; }
  v.src = small ? v.dataset.srcSm : v.dataset.srcLg;
  const EDGE = 0.9, MAX = 14;   // seconds of blur at each end, peak blur in px
  const blurAt = t => {
    const d = v.duration || 0;
    if (!d) return MAX;
    if (t < EDGE) return MAX * (1 - t / EDGE);
    if (t > d - EDGE) return MAX * (1 - (d - t) / EDGE);
    return 0;
  };
  const paint = () => { v.style.filter = 'blur(' + blurAt(v.currentTime).toFixed(2) + 'px)'; };
  let pending = false;   // one frame loop at a time, even after pause/play
  const tick = () => {
    if (pending) return;
    pending = true;
    const next = () => { pending = false; paint(); if (!v.paused) tick(); };
    v.requestVideoFrameCallback ? v.requestVideoFrameCallback(next) : requestAnimationFrame(next);
  };
  v.style.filter = 'blur(' + MAX + 'px)';
  v.addEventListener('playing', () => { paint(); tick(); });
  v.play().catch(() => { v.style.filter = ''; });
  if (btn) btn.addEventListener('click', () => {
    const pause = !v.paused;
    if (pause) { v.pause(); v.style.filter = 'blur(' + blurAt(v.currentTime).toFixed(2) + 'px)'; } else v.play();
    btn.setAttribute('aria-pressed', pause);
    btn.setAttribute('aria-label', pause ? 'Play background video' : 'Pause background video');
  });
})();

/* Pixel reveal: draw the Qualitia wordmark (the Q symbol on narrow screens) as negative space in a dense field of
   crisp, slightly rounded pixels whose size shrinks from ~84px to fine over the final stretch of scroll. Each pixel
   gets the same treatment as the content boxes above: a white tile with a hairline edge, and one soft moving light
   (amber core, blue and violet haze) seen through all the tiles. The gaps stay plain, so the logo reads. The light
   drifts while the panel is on screen; reduced motion shows a still frame. */
(() => {
  const wrap = document.querySelector('.px-reveal'), qsym = document.getElementById('q-symbol');
  if (!wrap) return;
  const cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d');
  // the logo is negative space: a dense pixel field around it, empty cells where the logo is
  const DENSITY = 0.85, COARSE = 84;
  const dark = () => getComputedStyle(wrap).backgroundColor !== 'rgb(255, 255, 255)';   // the ground is site.css's: white, or navy in dark mode
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const toImg = (sym, vb) => { const i = new Image(); i.onload = () => { mask = null; queue(); };
    i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + sym.innerHTML.replace(/currentColor|#0095EB/gi, '#fff') + '</svg>'); return i; };
  const wordmark = new Image(); wordmark.onload = () => { mask = null; queue(); };
  wordmark.src = 'assets/brand/qualitia-logo-white.svg';
  const symbol = qsym ? toImg(qsym, '0 0 35 36') : null;
  let mask = null, W = 0, H = 0, queued = false;
  const tiles = document.createElement('canvas'); let tileKey = '';   // the tile layer, cached per size and theme
  let maxY = 0; const readMax = () => { maxY = document.documentElement.scrollHeight - innerHeight; };   // page height, read on load and resize only
  const narrow = () => W < 600 && symbol;
  const fine = () => (narrow() ? 5 : 6);
  const hash = (a, b) => { const n = 43758.5453123 * Math.sin(127.1 * a + 311.7 * b); return n - Math.floor(n); };
  function buildMask(){
    const img = narrow() ? symbol : wordmark;
    if (!img.complete || !img.naturalWidth) return;
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d');
    let lw, lh;
    if (narrow()){ lh = H * 0.72; lw = lh * 35 / 36; }
    else { lw = Math.min(W * 0.84, H * 0.62 * 141 / 36); lh = lw * 36 / 141; }
    o.drawImage(img, (W - lw) / 2, (H - lh) / 2, lw, lh);
    mask = o.getImageData(0, 0, W, H).data;
  }
  function cellSize(){
    const f = fine();
    if (reduce.matches) return f;
    const max = Math.max(0, maxY);
    if (max <= 0 || scrollY >= max - 1) return f;
    const t = Math.max(0, Math.min(1, (scrollY - (max - H)) / H));
    return Math.round(COARSE - (COARSE - f) * (t <= 0.35 ? 0 : (t - 0.35) / 0.65) ** 2);
  }
  function draw(){
    queued = false;
    const r = wrap.getBoundingClientRect(), w = Math.max(1, Math.floor(r.width)), h = Math.max(1, Math.floor(r.height));
    if (w !== W || h !== H){ W = w; H = h; const dpr = Math.min(devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); mask = null; }
    if (!mask) buildMask();
    const v = cellSize(), gap = v > 2 ? 1 : 0, rad = 1 + 3 * Math.max(0, Math.min(1, (v - fine()) / (COARSE - fine())));
    const dk = dark(), edge = v >= 10, dpr = Math.min(devicePixelRatio || 1, 2), key = [v, W, H, dk, !!mask].join();
    // 1. the tiles, like the boxes: a near-white (or surface) fill and a hairline edge; drawn once per size, then reused
    if (key !== tileKey){
      tileKey = key; tiles.width = W * dpr; tiles.height = H * dpr;
      const ctx = tiles.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.beginPath();
      for (let y = 0; y < H; y += v) for (let x = 0; x < W; x += v){
        const cx = Math.min(W - 1, x + (v >> 1)), cy = Math.min(H - 1, y + (v >> 1));
        const inLogo = mask && mask[(cx + cy * W) * 4 + 3] > 128;
        if (inLogo || hash(x / v | 0, y / v | 0) >= DENSITY) continue;
        if (ctx.roundRect) ctx.roundRect(x + .5, y + .5, v - gap - 1, v - gap - 1, rad); else ctx.rect(x + .5, y + .5, v - gap - 1, v - gap - 1);
      }
      ctx.fillStyle = dk ? '#13233A' : '#F1F4F9'; ctx.fill();   // solid, like the boxes, so the light shows at full strength
      ctx.strokeStyle = dk ? 'rgba(255,255,255,.1)' : (edge ? 'rgba(10,37,64,.1)' : 'rgba(10,37,64,.09)'); ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.clearRect(0, 0, W, H);                                   // the panel's own background shows between tiles
    ctx.drawImage(tiles, 0, 0, W, H);
    // 2. the moving light, painted only where tiles are (source-atop), like the section light behind the boxes
    const t = (reduce.matches ? 12 : performance.now() / 1000) * .25;
    const glow = (x, y, rx, ry, c) => { const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry)); g.addColorStop(0, c); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save(); ctx.translate(x, y); ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry)); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.fillRect(x - Math.max(rx, ry), y - Math.max(rx, ry), Math.max(rx, ry) * 2, Math.max(rx, ry) * 2); ctx.restore(); };
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = dk ? .6 : 1;
    glow(W * (.72 + .18 * Math.sin(t * .9)), H * (.6 + .25 * Math.cos(t * .7)), W * .5, H * 1.1, 'rgba(0,149,235,.5)');
    glow(W * (.22 + .16 * Math.cos(t * .6)), H * (.45 + .3 * Math.sin(t * .8)), W * .38, H * .9, 'rgba(122,92,255,.46)');
    glow(W * (.48 + .22 * Math.sin(t * .5 + 1)), H * (.5 + .22 * Math.sin(t * 1.1)), W * .3, H * .8, 'rgba(255,168,74,.56)');
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (live && !reduce.matches && !document.hidden) queue();   // keep the light moving while the panel is on screen
  }
  function queue(){ if (!queued){ queued = true; requestAnimationFrame(draw); } }
  readMax(); addEventListener('load', readMax);
  if ('ResizeObserver' in window) new ResizeObserver(readMax).observe(document.body);   // late images change the height
  let live = false;
  const onScroll = () => { live = scrollY >= maxY - H - 240; if (live) queue(); };
  document.addEventListener('visibilitychange', onScroll);
  addEventListener('scroll', onScroll, {passive: true});
  addEventListener('resize', () => { readMax(); queue(); }, {passive: true});
  reduce.addEventListener('change', queue);
  new MutationObserver(queue).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});   // ground follows the theme
  queue();
})();
