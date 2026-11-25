(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- boot ---------- */
  const bootLines = ['> initializing portfolio ...', '> ready.'];
  const boot = $('#boot'), bootText = $('#bootText');
  const seen = sessionStorage.getItem('booted');
  if (seen || reduced) {
    boot.classList.add('done');
  } else {
    let i = 0;
    const step = () => {
      if (i < bootLines.length) { bootText.textContent += bootLines[i++] + '\n'; setTimeout(step, 260); }
      else setTimeout(() => { boot.classList.add('done'); sessionStorage.setItem('booted', '1'); }, 350);
    };
    step();
    boot.addEventListener('click', () => boot.classList.add('done'));
  }

  /* ---------- toasts / confetti ---------- */
  const toast = (html) => {
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = html;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 3700);
  };
  const confetti = (n = 120) => {
    if (reduced) return;
    const colors = ['#c6ff3d', '#ff4d8d', '#ffffff', '#4dd8ff', '#ffb84d'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--dx', (Math.random() * 300 - 150) + 'px');
      c.style.setProperty('--r', (Math.random() * 1080) + 'deg');
      c.style.animationDuration = (2 + Math.random() * 2.2) + 's';
      c.style.animationDelay = Math.random() * .6 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5200);
    }
  };

  /* ---------- background: constellation of dots ---------- */
  const bg = $('#bg'), bx = bg.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = bg.width = innerWidth * dpr; H = bg.height = innerHeight * dpr;
    bx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor(innerWidth * innerHeight / 18000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25
    }));
  };
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  const drawBg = () => {
    bx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
      bx.fillStyle = 'rgba(198,255,61,.5)';
      bx.fillRect(p.x, p.y, 1.8, 1.8);
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) { bx.strokeStyle = `rgba(198,255,61,${(1 - d / 130) * .13})`; bx.beginPath(); bx.moveTo(a.x, a.y); bx.lineTo(b.x, b.y); bx.stroke(); }
    }
    for (const p of pts) {
      const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (d < 170) { bx.strokeStyle = `rgba(255,77,141,${(1 - d / 170) * .35})`; bx.beginPath(); bx.moveTo(p.x, p.y); bx.lineTo(mouse.x, mouse.y); bx.stroke(); }
    }
    requestAnimationFrame(drawBg);
  };
  if (!reduced) drawBg();

  /* ---------- cursor ---------- */
  if (fine) {
    const c = $('#cursor'), d = $('#cursorDot');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; d.style.transform = `translate(${tx}px,${ty}px)`; });
    (function loop() { cx += (tx - cx) * .18; cy += (ty - cy) * .18; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', e => { if (e.target.closest('a,button,.chip,.meme,.proj')) c.classList.add('big'); });
    document.addEventListener('pointerout', e => { if (e.target.closest('a,button,.chip,.meme,.proj')) c.classList.remove('big'); });
  }

  /* ---------- scroll: progress, reveal, counters ---------- */
  const prog = $('#progress');
  addEventListener('scroll', () => {
    const h = document.documentElement;
    prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  }, { passive: true });

  const count = el => {
    const target = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString() + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    const n = $('[data-count]', e.target); if (n) count(n);
    io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- typed role ---------- */
  const roles = ['Backend Engineer', 'AI Engineer', 'Spring Boot Microservices', 'LLM Evaluation (RLHF)', 'IEEE-published Researcher'];
  const typed = $('#typed');
  let ri = 0, ci = 0, del = false;
  (function type() {
    const s = roles[ri];
    typed.textContent = s.slice(0, ci);
    if (!del && ci === s.length) { del = true; return setTimeout(type, 1500); }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 28 : 60);
  })();

  /* ---------- spotlight + tilt on cards ---------- */
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));
  if (fine && !reduced) $$('[data-tilt]').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateZ(0)`;
    });
    c.addEventListener('pointerleave', () => c.style.transform = '');
  });

  /* ---------- draggable chips with springy return ---------- */
  const reactions = ['ow.', 'bonk!', 'i have a family', 'put me down', 'wheee', 'unit tested, I swear', 'skill issue (yours)'];
  $$('.chip').forEach(chip => {
    let sx, sy, drag = false;
    chip.style.position = 'relative';
    chip.addEventListener('pointerdown', e => {
      drag = true; sx = e.clientX; sy = e.clientY;
      chip.setPointerCapture(e.pointerId);
      chip.style.transition = 'none'; chip.style.zIndex = 70;
      chip.style.borderColor = 'var(--acc)';
    });
    chip.addEventListener('pointermove', e => {
      if (!drag) return;
      chip.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px) rotate(${(e.clientX - sx) / 20}deg)`;
    });
    const end = () => {
      if (!drag) return; drag = false;
      chip.style.transition = 'transform .7s cubic-bezier(.34,1.8,.5,1), border-color .2s, color .2s, box-shadow .2s';
      chip.style.transform = ''; chip.style.borderColor = '';
      setTimeout(() => chip.style.zIndex = '', 700);
    };
    chip.addEventListener('pointerup', end); chip.addEventListener('pointercancel', end);
  });

  /* ---------- memes ---------- */
  const memes = [
    { img: 'grumpy.jpg', pos: 'center 8%', c: [['I HAVE NO IDEA WHAT I\'M DOING', 'AND NEITHER DOES PRODUCTION'], ['LLM: "I\'M 100% SURE"', 'NO.'], ['I HAD A GOOD CODE REVIEW ONCE', 'IT WAS TERRIBLE']] },
    { img: 'keyboard.jpg', pos: 'center', c: [['SENIOR DEV: IT\'S AN EASY FIX', 'CAT ON KEYBOARD: 400 COMMITS LATER'], ['ME WRITING CODE', 'DEFINITELY NOT FROM STACKOVERFLOW'], ['FIXED ONE BUG', 'CAT WALKED ON KEYBOARD. 7 NEW ONES']] },
    { img: 'angry.jpg', pos: 'center', c: [['ME: PUSHES TO MAIN ON FRIDAY', 'THE TEAM:'], ['IT WORKS ON MY MACHINE', 'THEN WE\'LL SHIP YOUR MACHINE'], ['"JUST A SMALL CHANGE"', 'THE CODEBASE:']] },
    { img: 'shocked.jpg', pos: 'center', c: [['PROD IS DOWN', 'AND IT\'S MY DEPLOY'], ['HUH?', 'IT PASSED LOCALLY'], ['THEY WANT HOW MANY', 'REST APIS BY FRIDAY?']] },
    { img: 'cute.jpg', pos: 'center', c: [['BUILD PASSES FIRST TRY', 'I DON\'T TRUST IT'], ['ME AFTER CUTTING API', 'RESPONSE TIME BY 10%'], ['TESTS ALL GREEN', 'WHAT DID I BREAK?']] },
    { img: 'sleepy.jpg', pos: 'center', c: [['ME AT 3 AM', 'DEBUGGING WHAT I WROTE AT 3 PM'], ['REVIEWING MY 2001ST', 'LLM RESPONSE TODAY'], ['STANDUP IN 5 MINUTES', 'I HAVE NOT SLEPT']] }
  ];
  const state = memes.map(() => 0);
  const paint = (el, i, bump) => {
    const m = memes[i]; if (bump) state[i] = (state[i] + 1) % m.c.length;
    el.style.background = `linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.35)), url(assets/cats/${m.img}) ${m.pos}/cover`;
    el.innerHTML = `<div class="mt">${m.c[state[i]][0]}</div><div></div><div class="mb">${m.c[state[i]][1]}</div>`;
    if (bump) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  };
  $$('.meme').forEach(el => { const i = +el.dataset.i; paint(el, i); el.addEventListener('click', () => paint(el, i, true)); });
  /* ---------- cat popup ---------- */
  const catpop = $('#catpop');
  const catPop = (caps, idx) => {
    const m = memes[idx ?? Math.floor(Math.random() * memes.length)];
    $('#catImg').src = 'assets/cats/' + m.img;
    $('#catTop').textContent = caps[0]; $('#catBot').textContent = caps[1];
    catpop.hidden = false;
  };
  catpop.addEventListener('click', () => { catpop.hidden = true; });
  addEventListener('keydown', e => { if (e.key === 'Escape') catpop.hidden = true; });

  /* ---------- contact ---------- */
  const mail = $('#mail');
  mail.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(mail.dataset.mail); } catch { /* ignore */ }
    $('#mailHint').textContent = 'copied ✔'; confetti(60);
    setTimeout(() => $('#mailHint').textContent = 'click to copy', 2000);
  });
  $('#dont').addEventListener('click', () => {
    document.body.classList.add('shake'); confetti(160);
    catPop(['I SAID', 'DO NOT PRESS'], 3);
    toast('<b>Achievement unlocked:</b> Curious Engineer 🏅');
    setTimeout(() => document.body.classList.remove('shake'), 1300);
  });

  /* ---------- matrix ---------- */
  const mx = $('#matrix'), mc = mx.getContext('2d');
  let matrixOn = false, mTimer;
  const matrix = (on = !matrixOn) => {
    matrixOn = on; mx.classList.toggle('on', on);
    if (!on) { clearInterval(mTimer); return; }
    mx.width = innerWidth; mx.height = innerHeight;
    const cols = Math.floor(innerWidth / 16), drops = Array(cols).fill(1);
    mTimer = setInterval(() => {
      mc.fillStyle = 'rgba(0,0,0,.08)'; mc.fillRect(0, 0, mx.width, mx.height);
      mc.fillStyle = '#c6ff3d'; mc.font = '15px JetBrains Mono, monospace';
      drops.forEach((y, i) => {
        mc.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), i * 16, y * 16);
        if (y * 16 > mx.height && Math.random() > .975) drops[i] = 0;
        drops[i]++;
      });
    }, 45);
    toast('wake up, recruiter… <b>(type matrix to exit)</b>');
  };

  /* ---------- theme accent ---------- */
  const themes = { lime: ['#c6ff3d', '198,255,61'], pink: ['#ff4d8d', '255,77,141'], cyan: ['#4dd8ff', '77,216,255'], orange: ['#ffb84d', '255,184,77'], violet: ['#a78bfa', '167,139,250'] };
  const setTheme = n => {
    const t = themes[n]; if (!t) return false;
    document.documentElement.style.setProperty('--acc', t[0]);
    document.documentElement.style.setProperty('--acc-rgb', t[1]);
    localStorage.setItem('theme', n); return true;
  };
  setTheme(localStorage.getItem('theme') || 'lime');

  /* ---------- terminal ---------- */
  const tb = $('#termBody'), ti = $('#termInput');
  const hist = []; let hp = 0;
  const out = (t, cls = '') => { const d = document.createElement('div'); d.className = 'l ' + cls; d.innerHTML = t; tb.appendChild(d); tb.scrollTop = tb.scrollHeight; };
  const go = id => { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); };
  const cmds = {
    help: () => out(`commands:
  <span class="c">whoami</span>      who is this guy
  <span class="c">skills</span>      tech stack
  <span class="c">projects</span>    things I built
  <span class="c">exp</span>         work history
  <span class="c">contact</span>     how to reach me
  <span class="c">resume</span>      download my résumé
  <span class="c">theme</span> &lt;lime|pink|cyan|orange|violet&gt;
  <span class="c">memes</span> · <span class="c">matrix</span> · <span class="c">party</span> · <span class="c">flip</span> · <span class="c">coffee</span> · <span class="c">meow</span> · <span class="c">clear</span>
  <span class="d">…and a few secrets. Konami code works too.</span>`),
    whoami: () => out('Raghav Matta — Backend & AI Engineer.\nSystem Engineer @ TCS Innovations, ex-Scale AI, ex-Samsung PRISM.'),
    skills: () => out('<span class="c">lang</span>   Java · Python · JavaScript · C\n<span class="c">fw</span>     Spring Boot · Node · Express · Django · Flask · Angular · React · Next\n<span class="c">ai</span>     TensorFlow · LangChain · FAISS · RLHF\n<span class="c">data</span>   PostgreSQL · MySQL · Redis · MongoDB · Kafka\n<span class="c">cloud</span>  AWS · Azure · GCP'),
    projects: () => { out('1. Hawa           — India AQI from CPCB data\n2. DocuBot        — AI for legal/medical docs\n3. SwiftDrop      — realtime delivery, Kafka + Maps\n4. Dauth KYC      — Aadhaar/PAN → Verified NFT\n5. Sloww          — internet speed test'); setTimeout(() => go('work'), 500); },
    exp: () => { out('<span class="c">Jul 2025 → now</span>  System Engineer, TCS Innovations\n<span class="c">Dec 2024 → Jun 2025</span>  AI Engineer, Scale AI\n<span class="c">Oct 2023 → Apr 2024</span>  PRISM Intern, Samsung'); setTimeout(() => go('log'), 500); },
    contact: () => { out('mail     mattaraghav67@gmail.com\ngithub   github.com/Rxghavdev\nlinkedin linkedin.com/in/rxghavdev'); setTimeout(() => go('contact'), 500); },
    resume: () => { out('downloading résumé…', 'c'); const a = document.createElement('a'); a.href = 'Raghav_Matta_Resume.pdf'; a.download = ''; a.click(); },
    theme: a => out(setTheme(a) ? `accent → ${a} ✔` : 'usage: theme &lt;lime|pink|cyan|orange|violet&gt;', setTheme(a) ? 'c' : 'e'),
    matrix: () => { matrix(); out('there is no spoon.', 'c'); },
    party: () => { confetti(200); out('🎉 party mode: on', 'p'); },
    flip: () => { document.body.classList.toggle('flip'); out('(╯°□°)╯︵ ┻━┻', 'p'); },
    coffee: () => out('        ( (\n         ) )\n      .______.\n      |      |]\n      \\      /\n       `----\'\n  brewing… 99% caffeine, 1% regret.', 'p'),
    clear: () => { tb.innerHTML = ''; },
    memes: () => { const s = $('#memes'); s.hidden = false; $$('.reveal', s).forEach(el => el.classList.add('in')); out('secret section unlocked 🐱', 'p'); setTimeout(() => s.scrollIntoView({ behavior: 'smooth' }), 300); },
    meow: () => { out('=^..^=  meow.', 'p'); catPop(['MEOW', 'HIRE HIM']); },
    ls: () => out('about.md  career.log  projects/'),
    'cat secrets.txt': () => out('nice try. but try: <span class="c">sudo hire raghav</span>', 'p'),
    pwd: () => out('/home/raghav/portfolio'),
    date: () => out(new Date().toString()),
    'sudo hire raghav': () => { out('[sudo] password for recruiter: ********\npermission granted ✔\nsending offer letter…', 'c'); confetti(220); toast('<b>Offer accepted</b> (pending salary negotiation) 💸'); setTimeout(() => go('contact'), 900); },
    'sudo rm -rf /': () => out('nice try. this portfolio has trust issues and backups.', 'e'),
    'rm -rf /': () => out('permission denied. also, why.', 'e'),
    exit: () => out('you can check out any time you like, but you can never leave.', 'p'),
    vim: () => out('you are now trapped. (hint: :q! — just kidding, refresh the page)', 'e'),
    hello: () => out('hi! type <span class="c">help</span> 👋'),
    hi: () => out('hi! type <span class="c">help</span> 👋'),
    'git blame': () => out('everything is Raghav\'s fault. including this.', 'e'),
    'npm install raghav': () => out('+ raghav@1.0.0\nadded 1 engineer, 0 vulnerabilities, 2 hackathon trophies\nfound 0 bugs (lying)', 'c')
  };
  const run = raw => {
    const line = raw.trim(); if (!line) return;
    out(`<span class="c">raghav@web:~$</span> ${line.replace(/</g, '&lt;')}`);
    hist.push(line); hp = hist.length;
    const low = line.toLowerCase();
    if (cmds[low]) return cmds[low]();
    const [c, ...a] = low.split(/\s+/);
    if (cmds[c] && ['theme'].includes(c)) return cmds[c](a[0]);
    out(`command not found: ${line.replace(/</g, '&lt;')}. try <span class="c">help</span>`, 'e');
  };
  $('#termForm').addEventListener('submit', e => { e.preventDefault(); run(ti.value); ti.value = ''; });
  ti.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && hp > 0) { ti.value = hist[--hp]; e.preventDefault(); }
    if (e.key === 'ArrowDown') { ti.value = hist[++hp] || ''; if (hp > hist.length) hp = hist.length; e.preventDefault(); }
    if (e.key === 'Tab') { e.preventDefault(); const m = Object.keys(cmds).find(k => k.startsWith(ti.value.toLowerCase()) && ti.value); if (m) ti.value = m; }
  });
  $('#term').addEventListener('click', () => ti.focus({ preventScroll: true }));
  out('Welcome to <span class="c">raghav.os</span> — type <span class="c">help</span> to begin.\n<span class="d">tip: Tab autocompletes, ↑ recalls history.</span>');

  /* ---------- command palette ---------- */
  const pal = $('#palette'), pi = $('#palInput'), pl = $('#palList');
  const items = [
    ['Go to: About', 'section', () => go('about')], ['Go to: Career (git log)', 'section', () => go('log')],
    ['Go to: Projects', 'section', () => go('work')], ['Go to: Skills', 'section', () => go('skills')],
    ['Go to: Achievements', 'section', () => go('trophies')], 
    ['Go to: Contact', 'section', () => go('contact')],
    ['Download résumé', 'action', () => cmds.resume()], ['Copy email', 'action', () => mail.click()],
    ['Open GitHub', 'link', () => open('https://github.com/Rxghavdev', '_blank')],
    ['Open LinkedIn', 'link', () => open('https://linkedin.com/in/rxghavdev', '_blank')],
        ...Object.keys(themes).map(t => [`Theme: ${t}`, 'theme', () => setTheme(t)])
  ];
  let sel = 0, shown = [];
  const render = () => {
    const q = pi.value.toLowerCase();
    shown = items.filter(i => i[0].toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    pl.innerHTML = shown.map((i, k) => `<li class="${k === sel ? 'sel' : ''}" data-k="${k}">${i[0]}<small>${i[1]}</small></li>`).join('') || '<li>no results — try "party"</li>';
  };
  const openPal = () => { pal.hidden = false; pi.value = ''; sel = 0; render(); pi.focus(); };
  const closePal = () => { pal.hidden = true; };
  const exec = k => { const it = shown[k]; if (!it) return; closePal(); it[2](); };
  pi.addEventListener('input', () => { sel = 0; render(); });
  pl.addEventListener('click', e => { const li = e.target.closest('li[data-k]'); if (li) exec(+li.dataset.k); });
  pal.addEventListener('click', e => { if (e.target === pal) closePal(); });
  $('#openPalette').addEventListener('click', openPal);
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closePal(); return; }
    if (!pal.hidden) {
      if (e.key === 'Escape') closePal();
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % shown.length; render(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; render(); }
      if (e.key === 'Enter') exec(sel);
    }
  });

  /* ---------- konami ---------- */
  const kon = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let kp = 0;
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    kp = (e.key.length === 1 ? e.key.toLowerCase() : e.key) === kon[kp] ? kp + 1 : 0;
    if (kp === kon.length) { kp = 0; confetti(250); matrix(true); toast('<b>KONAMI!</b> +30 lives. Matrix engaged.'); setTimeout(() => matrix(false), 6000); }
  });

  /* ---------- logo easter egg + footer ---------- */
  let logoClicks = 0;
  $('#logo').addEventListener('click', () => {
    if (++logoClicks === 5) { logoClicks = 0; const keys = Object.keys(themes); setTheme(keys[Math.floor(Math.random() * keys.length)]); toast('accent shuffled 🎨'); }
  });
  $('#year').textContent = new Date().getFullYear();
  const t0 = Date.now();
  setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000), p = n => String(n).padStart(2, '0');
    $('#uptime').textContent = `you've been here ${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
  }, 1000);

  console.log('%cHey, fellow dev 👋', 'font:700 22px monospace;color:#c6ff3d');
  console.log('%cLike what you see? mattaraghav67@gmail.com', 'font:14px monospace');

  let idleToast = 0;
  addEventListener('keydown', () => clearTimeout(idleToast), { once: true });
})();
