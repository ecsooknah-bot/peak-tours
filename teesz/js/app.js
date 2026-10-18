/* =========================================================
   TEESZ — interactions
   ========================================================= */
(() => {
  const C = window.TEESZ_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const isMobile = () => innerWidth < 900;
  const product = (id) => C.products.find((p) => p.id === id);
  const money = (n) => (n ? `${C.currency} ${n.toLocaleString('en')}` : 'Price coming soon');
  const pad = (n) => String(n).padStart(2, '0');

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  const toast = (() => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
    let t;
    return (msg) => {
      el.textContent = msg;
      el.classList.add('is-on');
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove('is-on'), 2800);
    };
  })();

  /* Send a message to the brand: WhatsApp → email → Instagram DM (copied to clipboard). */
  function sendToBrand(text) {
    if (C.whatsapp) {
      window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      return 'Opening WhatsApp — just hit send.';
    }
    if (C.email) {
      location.href = `mailto:${C.email}?subject=${encodeURIComponent('TEESZ')}&body=${encodeURIComponent(text)}`;
      return 'Opening your email app — just hit send.';
    }
    navigator.clipboard?.writeText(text).catch(() => {});
    window.open(`https://ig.me/m/${C.instagram}`, '_blank', 'noopener');
    return 'Message copied — paste it in the Instagram DM and send.';
  }

  /* ---------------- static bits ---------------- */
  $('#year').textContent = new Date().getFullYear();
  $$('#igLink, #menuIg').forEach((a) => (a.href = `https://instagram.com/${C.instagram}`));

  const sections = $$('main > .sec');
  const themed = $$('main > .sec, .footer');

  /* fit giant words to their box */
  function fit(el) {
    el.style.fontSize = '100px';
    const r = document.createRange();
    r.selectNodeContents(el);
    const w = r.getBoundingClientRect().width;
    const cs = getComputedStyle(el);
    const box = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (!w || !box) return;
    const size = (100 * box) / w;
    const maxH = el.classList.contains('footer__word') ? innerHeight * 0.62 : Infinity;
    el.style.fontSize = `${Math.min(size, maxH / 0.8)}px`;
  }
  const fitAll = () => $$('.fit').forEach(fit);


  /* marquees */
  const logoSvg = '<svg viewBox="0 0 300 240"><use href="#logo"/></svg>';
  function fillMarquee(track, phrase) {
    const unit = `<span>${phrase}<i></i>${logoSvg}<i></i></span>`;
    track.innerHTML = unit.repeat(6) + unit.repeat(6);
  }
  fillMarquee($('.marquee--footer .marquee__track'), 'Not made to blend in — Juice or cash');

  /* dots + menu */
  const dotsEl = $('.dots');
  const menuList = $('.menu__list');
  sections.forEach((s, i) => {
    const b = document.createElement('button');
    b.innerHTML = `<span>${s.dataset.label}</span>`;
    b.setAttribute('aria-label', s.dataset.label);
    b.addEventListener('click', () => scrollToEl(s));
    dotsEl.appendChild(b);
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${s.id}" style="transition-delay:${0.05 * i + 0.15}s"><small>${pad(i + 1)}</small><span class="w">${s.dataset.label}</span></a>`;
    menuList.appendChild(li);
  });
  const dots = $$('button', dotsEl);

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    if (gsap && ST) {
      lenis.on('scroll', ST.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    lenis.stop();
  }
  function scrollToEl(el, offset = 0) {
    const y = el.getBoundingClientRect().top + scrollY + offset;
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }
  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    if (document.body.classList.contains('menu-open')) toggleMenu(false);
    scrollToEl(t);
  });

  /* ---------------- theme + active section ---------------- */
  let currentTheme = 'pink';
  let currentSection = sections[0];
  function setTheme(theme) {
    if (theme === currentTheme) return;
    currentTheme = theme;
    document.body.dataset.theme = theme;
    document.body.style.removeProperty('--bg');
    if (theme === 'pink') applySlideBg();
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#000';
  }
  function updateActive() {
    const mid = innerHeight * 0.5;
    const hit = themed.find((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    if (!hit) return;
    setTheme(hit.dataset.theme);
    const idx = sections.indexOf(hit);
    if (idx > -1) currentSection = hit;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }

  /* ---------------- cursor ---------------- */
  const cursor = $('.cursor');
  if (fine && !reduced) {
    document.body.classList.add('has-cursor');
    const dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', (e) => {
      const interactive = e.target.closest('a, button, input, label, [data-open]');
      const labelled = e.target.closest('[data-cursor]');
      const showLabel = labelled && (!interactive || interactive.contains(labelled) || interactive === labelled);
      cursor.classList.toggle('has-label', !!showLabel);
      cursor.classList.toggle('is-hover', !!interactive && !showLabel);
      label.textContent = showLabel ? labelled.dataset.cursor : '';
    });
    document.addEventListener('pointerleave', () => { mx = my = -100; });
  } else {
    cursor.remove();
  }

  /* magnetic buttons */
  if (fine && !reduced) {
    $$('.magnetic').forEach((el) => {
      el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), background .35s, color .35s, border-color .35s';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => (el.style.transform = ''));
    });
  }

  /* ---------------- 01 carousel ---------------- */
  const SLIDES = [
    { id: 'offscript', face: 'front', label: 'Black / Pink', bg: '#f0287f' },
    { id: 'moneymaker', face: 'front', label: 'Cream / Burgundy', bg: '#e01d6b' },
    { id: 'moneymaker', face: 'back', label: 'Moneymaker — Back', bg: '#ff4f9e' },
  ];
  const carousel = $('#carousel');
  carousel.innerHTML = SLIDES.map((s) => {
    const p = product(s.id);
    return `<div class="slide"><div class="shadow"></div><div class="slide__float"><div class="slide__tilt"><img src="${p[s.face]}" alt="${p.name}, ${s.face}" draggable="false"></div></div></div>`;
  }).join('');
  const slideEls = $$('.slide', carousel);
  let cur = 0, dragging = false, startX = 0, dragX = 0, moved = false;
  const spread = () => (isMobile() ? 62 : 36);

  function offsetOf(i) {
    const n = SLIDES.length;
    let o = (((i - cur) % n) + n) % n;
    if (o > n / 2) o -= n;
    return o;
  }
  function layout(drag = 0) {
    slideEls.forEach((el, i) => {
      const d = offsetOf(i) + drag;
      const ad = Math.min(Math.abs(d), 1.6);
      el.style.transition = dragging ? 'none' : 'transform 1.1s cubic-bezier(.16,1,.3,1)';
      el.style.transform = `translate3d(${d * spread()}vw, ${ad * 5}vh, 0) scale(${1 - ad * 0.42}) rotate(${d * 9}deg)`;
      el.style.zIndex = String(10 - Math.round(ad * 4));
    });
  }
  function applySlideBg() {
    if (currentTheme === 'pink') document.body.style.setProperty('--bg', SLIDES[cur].bg);
  }
  function go(i) {
    cur = (i + SLIDES.length) % SLIDES.length;
    layout();
    applySlideBg();
    const lab = $('#slideLabel');
    const text = `${pad(cur + 1)} — ${SLIDES[cur].label}`;
    if (gsap && !reduced) {
      gsap.timeline()
        .to(lab, { yPercent: -120, opacity: 0, duration: 0.25, ease: 'power2.in' })
        .add(() => { lab.textContent = text; })
        .fromTo(lab, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'expo.out' });
    } else lab.textContent = text;
  }
  carousel.addEventListener('pointerdown', (e) => {
    dragging = true; moved = false; startX = e.clientX; dragX = 0;
    carousel.setPointerCapture(e.pointerId);
    cursor?.classList.add('is-down');
  });
  carousel.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dragX = e.clientX - startX;
    if (Math.abs(dragX) > 6) moved = true;
    layout(dragX / ((innerWidth * spread()) / 100));
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    cursor?.classList.remove('is-down');
    const frac = dragX / ((innerWidth * spread()) / 100);
    if (frac < -0.15) go(cur + 1);
    else if (frac > 0.15) go(cur - 1);
    else {
      layout();
      if (!moved && e.type === 'pointerup') {
        const el = e.target.closest?.('.slide') || document.elementsFromPoint(e.clientX, e.clientY).find((n) => n.classList?.contains('slide'));
        const i = slideEls.indexOf(el);
        if (i === cur) openProduct(SLIDES[cur].id, SLIDES[cur].face);
        else if (i > -1) go(i);
      }
    }
  };
  carousel.addEventListener('pointerup', endDrag);
  carousel.addEventListener('pointercancel', endDrag);
  $('#prevSlide').addEventListener('click', () => go(cur - 1));
  $('#nextSlide').addEventListener('click', () => go(cur + 1));
  $('#slideOpen').addEventListener('click', () => openProduct(SLIDES[cur].id, SLIDES[cur].face));
  addEventListener('keydown', (e) => {
    if (currentSection.id !== 'drop' || document.body.classList.contains('overlay-open')) return;
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });
  layout();

  /* pointer-driven tilt (carousel centre tee, after-hours tee) */
  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  });

  function setToggle(toggle, back) {
    toggle.classList.toggle('is-back', back);
    $$('button', toggle).forEach((b) => b.classList.toggle('is-active', (b.dataset.face === 'back') === back));
  }

  /* ---------------- 05 waitlist ---------------- */
  $('#waitlist').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#wlContact').value.trim();
    if (!v) return;
    const note = sendToBrand(`Hi TEESZ! Put me on the list for the women's line. Contact: ${v}`);
    $('#wlNote').textContent = note;
    store.set('teesz-waitlist', v);
  });

  /* ---------------- 06 shop grid ---------------- */
  $('#shopGrid').innerHTML = C.products.map((p) => `
    <button class="card card--${p.id}" data-open="${p.id}" data-cursor="View" data-reveal>
      <div class="card__media">
        <span class="big" aria-hidden="true">${p.name.split(' ')[0]}</span>
        <img src="${p.front}" alt="${p.name}, front" loading="lazy">
        <img src="${p.back}" alt="" loading="lazy">
      </div>
      <div class="card__row"><span class="card__name">${p.name}</span><span class="card__meta">${money(p.price)}</span></div>
      <div class="card__row" style="padding-top:6px"><span class="card__meta">${p.colorway}</span><span class="card__meta">${fine ? 'Hover to flip' : 'Tap to view'}</span></div>
    </button>`).join('');

  /* ---------------- overlays ---------------- */
  const scrim = $('#scrim');
  const pv = $('#pv');
  const bagEl = $('#bag');
  let lastFocus = null;
  function openOverlay(el) {
    lastFocus = document.activeElement;
    closeOverlays(true);
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    scrim.classList.add('is-on');
    document.body.classList.add('overlay-open');
    lenis?.stop();
    setTimeout(() => el.querySelector('button, input')?.focus({ preventScroll: true }), 300);
  }
  function closeOverlays(silent) {
    [pv, bagEl].forEach((el) => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); });
    if (silent) return;
    scrim.classList.remove('is-on');
    document.body.classList.remove('overlay-open');
    lenis?.start();
    lastFocus?.focus?.({ preventScroll: true });
  }
  scrim.addEventListener('click', () => closeOverlays());
  $$('[data-close]').forEach((b) => b.addEventListener('click', () => closeOverlays()));
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('menu-open')) toggleMenu(false);
    else closeOverlays();
  });

  /* product view */
  let pvProduct = null, pvSize = null;
  const pvFlip = $('#pvFlip');
  const pvToggle = $('.pv__toggle');
  function pvFace(face) {
    const back = face === 'back';
    if (gsap) gsap.to(pvFlip, { rotateY: back ? 180 : 0, duration: 1, ease: 'expo.out' });
    else pvFlip.style.transform = `rotateY(${back ? 180 : 0}deg)`;
    setToggle(pvToggle, back);
  }
  $$('button', pvToggle).forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); pvFace(b.dataset.face); }));
  $('.pv__media').addEventListener('click', () => pvFace(pvToggle.classList.contains('is-back') ? 'front' : 'back'));

  function openProduct(id, face = 'front') {
    const p = product(id);
    if (!p) return;
    pvProduct = p; pvSize = null;
    $('#pvFront').src = p.front; $('#pvFront').alt = `${p.name}, front`;
    $('#pvBack').src = p.back; $('#pvBack').alt = `${p.name}, back`;
    $('#pvName').textContent = p.name;
    $('#pvColor').textContent = p.colorway;
    $('#pvPrice').textContent = money(p.price);
    $('#pvDetails').innerHTML = p.details.map((d) => `<li>${d}</li>`).join('');
    $('#pvSizes').innerHTML = p.sizes.map((s) => `<button role="radio" aria-checked="false">${s}</button>`).join('');
    $('#pvNote').textContent = '';
    pv.style.setProperty('--pv-bg', id === 'offscript' ? '#f0287f' : '#e6dbc8');
    if (gsap) gsap.set(pvFlip, { rotateY: face === 'back' ? 180 : 0 });
    setToggle(pvToggle, face === 'back');
    openOverlay(pv);
  }
  $('#pvSizes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    pvSize = b.textContent;
    $$('#pvSizes button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    $('#pvNote').textContent = '';
  });
  $('#pvAdd').addEventListener('click', () => {
    if (!pvSize) {
      const s = $('#pvSizes');
      s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake');
      $('#pvNote').textContent = 'Pick your size first.';
      return;
    }
    addToBag(pvProduct.id, pvSize);
    toast(`${pvProduct.name} · ${pvSize} — added`);
    openOverlay(bagEl);
  });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open]');
    if (t && !t.closest('#carousel')) openProduct(t.dataset.open);
  });

  /* bag */
  let bag = store.get('teesz-bag', []).filter((l) => product(l.id));
  function addToBag(id, size) {
    const line = bag.find((l) => l.id === id && l.size === size);
    if (line) line.qty++;
    else bag.push({ id, size, qty: 1 });
    saveBag();
  }
  function saveBag() {
    store.set('teesz-bag', bag);
    renderBag();
  }
  function renderBag() {
    const count = bag.reduce((n, l) => n + l.qty, 0);
    $('#bagCount').textContent = count;
    $('#bagCount2').textContent = count;
    const btn = $('#bagBtn');
    btn.classList.add('bump');
    setTimeout(() => btn.classList.remove('bump'), 500);
    const items = $('#bagItems');
    if (!bag.length) {
      items.innerHTML = '<p class="bag__empty">Your bag is empty.<br>Go find something loud.</p>';
      $('#checkout').hidden = true;
      return;
    }
    $('#checkout').hidden = false;
    items.innerHTML = bag.map((l, i) => {
      const p = product(l.id);
      return `<div class="line-item"><img src="${p.front}" alt=""><div><b>${p.name}</b><small>${p.colorway} · Size ${l.size}</small><br><small>${money(p.price * l.qty)}</small></div>
        <div class="qty"><button data-q="-1" data-i="${i}" aria-label="Remove one">−</button><span>${l.qty}</span><button data-q="1" data-i="${i}" aria-label="Add one">+</button></div></div>`;
    }).join('');
    const total = bag.reduce((n, l) => n + product(l.id).price * l.qty, 0);
    $('#bagTotal').textContent = bag.every((l) => product(l.id).price) ? money(total) : 'Confirmed by DM';
  }
  $('#bagItems').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    const l = bag[+b.dataset.i];
    l.qty += +b.dataset.q;
    if (l.qty < 1) bag.splice(+b.dataset.i, 1);
    saveBag();
  });
  $('#bagBtn').addEventListener('click', () => openOverlay(bagEl));
  const co = $('#checkout');
  co.addEventListener('change', () => {
    const delivery = co.delivery.value === 'Delivery';
    co.address.hidden = !delivery;
    co.address.required = delivery;
  });
  co.addEventListener('submit', (e) => {
    e.preventDefault();
    const lines = bag.map((l) => { const p = product(l.id); return `• ${p.name} (${p.colorway}) — Size ${l.size} × ${l.qty}`; });
    const total = $('#bagTotal').textContent;
    const msg = [
      'Hi TEESZ! New order 🛍️', '', ...lines, '', `Total: ${total}`,
      `Name: ${co.name.value}`, `Phone: ${co.phone.value}`,
      `${co.delivery.value}${co.delivery.value === 'Delivery' ? `: ${co.address.value}` : ''}`,
      `Payment: ${co.payment.value}`,
    ].join('\n');
    $('#coNote').textContent = sendToBrand(msg);
  });
  renderBag();
  $('#bagBtn').classList.remove('bump');

  /* menu */
  function toggleMenu(open) {
    document.body.classList.toggle('menu-open', open);
    $('#menuBtn').setAttribute('aria-expanded', String(open));
    $('#menu').setAttribute('aria-hidden', String(!open));
    if (open) lenis?.stop(); else lenis?.start();
  }
  $('#menuBtn').addEventListener('click', () => toggleMenu(!document.body.classList.contains('menu-open')));

  /* ---------------- frame loop ---------------- */
  const mmTracks = $$('.marquee__track').map((el) => ({ el, x: 0 }));
  let lastY = scrollY, vel = 0;
  const tiltCenter = () => slideEls[cur]?.querySelector('.slide__tilt');
  function frame() {
    const dy = scrollY - lastY;
    lastY = scrollY;
    vel += (dy - vel) * 0.1;

    updateActive();

    // carousel tilt
    slideEls.forEach((el) => { const t = el.querySelector('.slide__tilt'); if (t !== tiltCenter()) t.style.transform = ''; });
    const t = tiltCenter();
    if (t && currentSection.id === 'drop') t.style.transform = `perspective(1200px) rotateY(${pointer.x * 16}deg) rotateX(${-pointer.y * 10}deg)`;

    // marquees react to scroll speed
    mmTracks.forEach((m) => {
      const half = m.el.scrollWidth / 2;
      m.x -= (reduced ? 0 : 0.6) + Math.abs(vel) * 0.35;
      if (half && m.x <= -half) m.x += half;
      m.el.style.transform = `translate3d(${m.x}px,0,0) skewX(${Math.max(-12, Math.min(12, -vel * 0.4))}deg)`;
    });
    requestAnimationFrame(frame);
  }

  /* ---------------- reveals (GSAP) ---------------- */
  function setupReveals() {
    if (!gsap || !ST || reduced) return;
    gsap.registerPlugin(ST);
    $$('.next__title .ln > span').forEach((el) => gsap.set(el, { yPercent: 105 }));
    [['#next', '.next__title .ln > span']].forEach(([trig, sel]) =>
      ST.create({ trigger: trig, start: 'top 60%', once: true,
        onEnter: () => gsap.to(sel, { yPercent: 0, duration: 1.3, stagger: 0.12, ease: 'expo.out' }) }));
    gsap.to('.play__bg', { scrollTrigger: { trigger: '#play', start: 'top bottom', end: 'bottom top', scrub: 1 }, xPercent: -14, ease: 'none' });
    gsap.from('.next__tee', { scrollTrigger: { trigger: '#next', start: 'top 80%', end: 'center center', scrub: 1 }, y: 160, rotate: -12, ease: 'none' });
    $$('[data-reveal]').forEach((el, i) => gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 88%', once: true }, y: 90, opacity: 0, duration: 1.2, delay: (i % 2) * 0.12, ease: 'expo.out' }));
    gsap.from('.shop__title, .shop__lede', { scrollTrigger: { trigger: '#shop', start: 'top 70%', once: true }, y: 60, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' });
    gsap.from('.footer__word', { scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: 1 }, yPercent: 60, ease: 'none' });
  }

  function intro() {
    document.body.classList.remove('is-loading');
    lenis?.start();
    const loader = $('#loader');
    if (!gsap || reduced) { loader.remove(); return; }
    const tl = gsap.timeline();
    tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' })
      .add(() => loader.remove())
      .from('.drop__title span', { yPercent: 60, opacity: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out' }, 0.55)
      .from(slideEls, { y: 300, opacity: 0, rotate: (i) => [8, -14, 14][i], duration: 1.4, stagger: 0.1, ease: 'expo.out' }, 0.6)
      .from('.nav > *, .drop__controls, .corner, .dots', { y: -20, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out' }, 0.9);
    window.dispatchEvent(new Event('teesz:intro'));
  }

  /* ---------------- boot ---------------- */
  function boot() {
    fitAll();
    setupReveals();
    requestAnimationFrame(frame);

    const countEl = $('#loaderCount');
    const minTime = reduced ? 0 : 2000;
    const t0 = performance.now();
    let loaded = document.readyState === 'complete';
    addEventListener('load', () => { loaded = true; });
    (function count(now) {
      const p = minTime ? Math.min(1, (now - t0) / minTime) : 1;
      const shown = Math.floor((loaded ? p : Math.min(p, 0.9)) * 100);
      countEl.textContent = String(shown).padStart(3, '0');
      if (shown >= 100) setTimeout(intro, 200);
      else requestAnimationFrame(count);
    })(t0);
    // never trap people behind the loader
    setTimeout(() => { if ($('#loader')) { loaded = true; } }, 6000);
  }
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { fitAll(); layout(); ST?.refresh(); }, 150);
  });
  (document.fonts?.ready || Promise.resolve()).then(boot);
})();
