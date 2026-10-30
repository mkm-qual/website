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

/* Homepage features: one value block in focus at a time. The block nearest the middle of the screen is at full strength;
   the others fade back, and the focus moves on as you scroll. Reduced motion shows every block at full strength. */
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
    feats.forEach(f => {
      const r = f.getBoundingClientRect();
      const d = r.top > mid ? r.top - mid : r.bottom < mid ? mid - r.bottom : 0;   // 0 when the block spans the middle
      if (d < dist){ dist = d; best = f; }
    });
    if (best !== current){ feats.forEach(f => f.classList.toggle('is-focus', f === best)); current = best; }
  };
  const queue = () => { if (!queued){ queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, {passive: true});
  addEventListener('resize', queue, {passive: true});
  update();
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
   rounded pixels whose size shrinks from ~84px to fine over the final stretch of scroll. Static fine grid for reduced motion. */
(() => {
  const wrap = document.querySelector('.px-reveal'), qsym = document.getElementById('q-symbol');
  if (!wrap) return;
  const cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d');
  // the logo is negative space: a dense navy pixel field around it, empty cells where the logo is
  const BG = '#001630', FG = '#10305a', DENSITY = 0.85, COARSE = 84;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const toImg = (sym, vb) => { const i = new Image(); i.onload = () => { mask = null; queue(); };
    i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '">' + sym.innerHTML.replace(/currentColor|#0095EB/gi, '#fff') + '</svg>'); return i; };
  const wordmark = new Image(); wordmark.onload = () => { mask = null; queue(); };
  wordmark.src = 'assets/brand/qualitia-logo-white.svg';
  const symbol = qsym ? toImg(qsym, '0 0 35 36') : null;
  let mask = null, W = 0, H = 0, queued = false;
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
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
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
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.fillStyle = FG;
    for (let y = 0; y < H; y += v) for (let x = 0; x < W; x += v){
      const cx = Math.min(W - 1, x + (v >> 1)), cy = Math.min(H - 1, y + (v >> 1));
      const inLogo = mask && mask[(cx + cy * W) * 4 + 3] > 128;
      if (inLogo || hash(x / v | 0, y / v | 0) >= DENSITY) continue;
      if (ctx.roundRect){ ctx.beginPath(); ctx.roundRect(x, y, v - gap, v - gap, rad); ctx.fill(); } else ctx.fillRect(x, y, v - gap, v - gap);
    }
  }
  function queue(){ if (!queued){ queued = true; requestAnimationFrame(draw); } }
  const onScroll = () => { const max = document.documentElement.scrollHeight - innerHeight; if (scrollY >= max - H - 240) queue(); };
  addEventListener('scroll', onScroll, {passive: true});
  addEventListener('resize', queue, {passive: true});
  reduce.addEventListener('change', queue);
  queue();
})();
