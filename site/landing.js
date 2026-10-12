// The Letter — landing page: drifting embers, solid top bar on scroll, reveal-on-scroll and the screenshot viewer.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // top bar turns solid once you scroll
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // sections fade in as they come into view
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  }
  // safety net: never leave anything hidden (fast scrolling, jumping to a link, old browsers)
  const showAll = () => reveals.forEach(el => el.classList.add('in'));
  setTimeout(showAll, 2500); addEventListener('hashchange', showAll);

  // embers drifting up through the hero, like the fire twenty years ago
  const cv = document.getElementById('embers');
  if (cv && !reduce){
    const g = cv.getContext('2d'); let W=0, H=0; const P=[];
    const size = () => { W = cv.width = Math.ceil(cv.clientWidth/3); H = cv.height = Math.ceil(cv.clientHeight/3); };
    size(); addEventListener('resize', size);
    for (let i=0;i<70;i++) P.push({ x:Math.random()*W, y:Math.random()*H, v:6+Math.random()*14, p:Math.random()*6.3, s:Math.random()<.2?2:1 });
    let last=performance.now();
    const tick = now => {
      const dt=Math.min(.05,(now-last)/1000); last=now; g.clearRect(0,0,W,H);
      for (const e of P){ e.y-=e.v*dt; e.p+=dt*1.6; e.x+=Math.sin(e.p)*6*dt; if (e.y<-4){ e.y=H+4; e.x=Math.random()*W; }
        const a=.35+.45*Math.sin(e.p*2.3); g.fillStyle=`rgba(255,${150+Math.floor(60*a)},90,${a})`; g.fillRect(Math.round(e.x),Math.round(e.y),e.s,e.s); }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // screenshot viewer
  const lb=document.getElementById('lightbox'), lbImg=lb.querySelector('img'), lbCap=lb.querySelector('.lb-cap');
  let lastBtn=null;
  document.querySelectorAll('.shot').forEach(b => b.addEventListener('click', () => { lastBtn=b; lbImg.src=b.dataset.src; lbImg.alt=b.dataset.cap; lbCap.textContent=b.dataset.cap; lb.hidden=false; lb.querySelector('.lb-close').focus(); }));
  const close = () => { lb.hidden=true; if (lastBtn) lastBtn.focus(); };
  lb.addEventListener('click', e => { if (e.target===lb || e.target.classList.contains('lb-close')) close(); });
  addEventListener('keydown', e => { if (e.key==='Escape' && !lb.hidden) close(); });
})();
