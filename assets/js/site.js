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
