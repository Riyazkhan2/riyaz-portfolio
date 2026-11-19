(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- Loader ---------- */
  const loader = $('#loader'), pct = $('#loaderPct');
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + Math.ceil(Math.random() * 14));
    pct.textContent = ' ' + p;
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => { loader.classList.add('done'); document.body.classList.add('ready'); }, 250);
    }
  }, 90);

  /* ---------- Split hero name into letters ---------- */
  $$('.split').forEach(el => {
    const text = el.textContent.trim();
    el.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', i);
      s.textContent = c;
      el.appendChild(s);
    });
  });

  /* ---------- Typed role swap ---------- */
  const words = ['3D Animator', '3D Modeler', 'Graphic Designer', 'Visual Storyteller'];
  const swap = $('#swap');
  let wi = 0, ci = words[0].length, deleting = false;
  function type() {
    const w = words[wi];
    swap.textContent = w.slice(0, ci);
    if (!deleting && ci === w.length) { deleting = true; return setTimeout(type, 1700); }
    if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    ci += deleting ? -1 : 1;
    setTimeout(type, deleting ? 40 : 85);
  }
  if (!reduced) setTimeout(type, 3200);

  /* ---------- Nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks'), bar = $('#progress');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    links.classList.toggle('open');
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open'); links.classList.remove('open');
  }));

  const tl = $('.timeline');
  function onScroll() {
    const h = document.documentElement;
    const y = h.scrollTop || document.body.scrollTop;
    bar.style.width = (y / (h.scrollHeight - h.clientHeight) * 100) + '%';
    nav.classList.toggle('scrolled', y > 40);
    if (tl) {
      const r = tl.getBoundingClientRect();
      const v = (innerHeight * .65 - r.top) / r.height;
      tl.style.setProperty('--tl', Math.max(0, Math.min(1, v)) * 100 + '%');
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Custom cursor + magnetic ---------- */
  const cursor = $('#cursor');
  if (finePointer && !reduced) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cursor.classList.add('on'); });
    (function loop() {
      cx += (tx - cx) * .18; cy += (ty - cy) * .18;
      cursor.style.transform = `translate(${cx - cursor.offsetWidth / 2}px,${cy - cursor.offsetHeight / 2}px)`;
      requestAnimationFrame(loop);
    })();
    $$('a,button,.card,.tile,.interests li').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * .25}px,${y * .35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Card tilt + glow ---------- */
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
      if (!reduced) card.style.transform = `rotateY(${(px - .5) * 10}deg) rotateX(${(.5 - py) * 10}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- Portrait 3D tilt ---------- */
  const portrait = $('#tilt');
  if (portrait && finePointer && !reduced) {
    const hero = $('.hero');
    hero.addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
      portrait.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 12}deg)`;
    });
    hero.addEventListener('mouseleave', () => { portrait.style.transform = ''; });
  }

  /* ---------- Copy email ---------- */
  const toast = $('#toast');
  $('#copyMail').addEventListener('click', async () => {
    const mail = 'riyaz2452007@gmail.com';
    try { await navigator.clipboard.writeText(mail); }
    catch (_) {
      const t = document.createElement('textarea'); t.value = mail; document.body.appendChild(t);
      t.select(); document.execCommand('copy'); t.remove();
    }
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  });

  $('#year').textContent = new Date().getFullYear();

  /* ---------- 3D wireframe mesh (hero background) ---------- */
  const cv = $('#mesh'), ctx = cv.getContext('2d');
  let W, H, dpr, mx = 0, my = 0, smx = 0, smy = 0, t = 0, running = true;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize);
  resize();
  addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });

  // Torus knot-ish wireframe: grid of (u,v) points
  const U = 64, V = 14;
  const pts = [];
  for (let i = 0; i < U; i++) {
    for (let j = 0; j < V; j++) {
      const v = j / V * Math.PI * 2;
      // parametric trefoil-like centre line
      const k = i / U * Math.PI * 2;
      const c = [
        (2 + Math.cos(3 * k)) * Math.cos(2 * k),
        (2 + Math.cos(3 * k)) * Math.sin(2 * k),
        Math.sin(3 * k)
      ];
      // tube cross-section (approximate frame using centre line derivatives)
      const e = 0.001;
      const k2 = k + e;
      const c2 = [
        (2 + Math.cos(3 * k2)) * Math.cos(2 * k2),
        (2 + Math.cos(3 * k2)) * Math.sin(2 * k2),
        Math.sin(3 * k2)
      ];
      let T = [c2[0] - c[0], c2[1] - c[1], c2[2] - c[2]];
      const tl_ = Math.hypot(...T); T = T.map(a => a / tl_);
      let N = [0, 0, 1];
      let B = [T[1] * N[2] - T[2] * N[1], T[2] * N[0] - T[0] * N[2], T[0] * N[1] - T[1] * N[0]];
      const bl = Math.hypot(...B); B = B.map(a => a / bl);
      N = [B[1] * T[2] - B[2] * T[1], B[2] * T[0] - B[0] * T[2], B[0] * T[1] - B[1] * T[0]];
      const rad = 0.55;
      pts.push([
        c[0] + rad * (Math.cos(v) * N[0] + Math.sin(v) * B[0]),
        c[1] + rad * (Math.cos(v) * N[1] + Math.sin(v) * B[1]),
        c[2] + rad * (Math.cos(v) * N[2] + Math.sin(v) * B[2])
      ]);
    }
  }

  function draw() {
    if (!running) return;
    t += reduced ? 0 : .006;
    smx += (mx - smx) * .05; smy += (my - smy) * .05;
    ctx.clearRect(0, 0, W, H);

    const ay = t + smx * 1.4, ax = .5 + smy * 1.0 + Math.sin(t * .5) * .15;
    const cosY = Math.cos(ay), sinY = Math.sin(ay), cosX = Math.cos(ax), sinX = Math.sin(ax);
    const scale = Math.min(W, H) * (W < 760 ? .14 : .115);
    const ox = W < 980 ? W * .5 : W * .66, oy = H * (W < 980 ? .3 : .52);

    const proj = pts.map(([x, y, z]) => {
      let x1 = x * cosY + z * sinY, z1 = -x * sinY + z * cosY;
      let y1 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
      const f = 9 / (9 + z2);
      return [ox + x1 * scale * f, oy + y1 * scale * f, z2];
    });

    ctx.lineWidth = 1;
    for (let i = 0; i < U; i++) {
      const ni = (i + 1) % U;
      for (let j = 0; j < V; j++) {
        const nj = (j + 1) % V;
        const a = proj[i * V + j], b = proj[i * V + nj], c = proj[ni * V + j];
        const depth = (a[2] + 4) / 8;          // 0..1
        const alpha = .08 + (1 - Math.min(1, Math.max(0, depth))) * .28;
        const hot = (i + Math.floor(t * 14)) % 22 === 0;
        ctx.strokeStyle = hot ? `rgba(255,77,28,${alpha + .35})` : `rgba(20,19,26,${alpha})`;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  new IntersectionObserver(([e]) => {
    const was = running; running = e.isIntersecting;
    if (running && !was) requestAnimationFrame(draw);
  }).observe(cv);
  draw();
})();
