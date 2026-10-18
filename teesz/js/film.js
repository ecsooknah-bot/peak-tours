/* =========================================================
   TEESZ — scroll film + play star
   The film is an image sequence (assets/film/d = landscape,
   assets/film/m = portrait crop for phones). Scroll position
   picks the frame; text chapters fade in on their own ranges.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- film ---------------- */
  const film = $('#film');
  const canvas = $('#filmCanvas');
  if (film && canvas) {
    const ctx = canvas.getContext('2d');
    const COUNT = 271; // frames per set (every 2nd frame of the 18 s source)
    const CUT = 220.5; // hard cut in the source sits between frames 220 and 221
    const DARK_UNTIL = 64; // frames before the scene turns light
    const portrait = matchMedia('(max-aspect-ratio: 1/1)').matches;
    const dir = portrait ? 'assets/film/m/' : 'assets/film/d/';
    const frames = new Array(COUNT);
    const loaded = new Uint8Array(COUNT);
    const flash = $('.film__flash');
    const bar = $('.film__bar i');
    const chapters = $$('.film__chapter');

    // load order: first frame, then coarse-to-fine so scrubbing works early
    const order = [];
    const seen = new Set();
    [32, 16, 8, 4, 2, 1].forEach((step) => {
      for (let i = 0; i < COUNT; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    });
    let next = 0, inflight = 0;
    function pump() {
      while (inflight < 6 && next < order.length) {
        const i = order[next++];
        const img = new Image();
        img.decoding = 'async';
        img.src = `${dir}${String(i + 1).padStart(3, '0')}.webp`;
        inflight++;
        img.onload = () => { frames[i] = img; loaded[i] = 1; inflight--; dirty = true; pump(); };
        img.onerror = () => { inflight--; pump(); };
      }
    }
    pump();

    function nearest(i) {
      if (loaded[i]) return i;
      for (let d = 1; d < COUNT; d++) {
        if (i - d >= 0 && loaded[i - d]) return i - d;
        if (i + d < COUNT && loaded[i + d]) return i + d;
      }
      return -1;
    }

    let cw = 0, ch = 0, dpr = 1;
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      cw = canvas.clientWidth; ch = canvas.clientHeight;
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      dirty = true;
    }
    addEventListener('resize', size);

    let cur = 0, dirty = true;
    function progress() {
      const top = film.getBoundingClientRect().top + scrollY;
      return clamp((scrollY - top) / (film.offsetHeight - innerHeight));
    }

    // camera "push-in" that disguises the cut: zoom towards the shirt
    // before it, overshoot + settle after it, with blur and a pink flash
    function camera(f) {
      let zoom = 1, k = 0;
      if (f > 196 && f <= CUT) zoom = 1 + 0.32 * ease(clamp((f - 196) / (CUT - 196)));
      if (f > CUT) zoom = 1 + 0.1 * (1 - ease(clamp((f - CUT) / 10)));
      k = Math.max(0, 1 - Math.abs(f - CUT) / 5);
      return { zoom, k };
    }

    function draw(f) {
      const idx = nearest(Math.round(f));
      if (idx < 0) return;
      const img = frames[idx];
      const { zoom, k } = camera(f);
      // focal point = where the shirt is in the frame
      const fx = portrait ? 0.5 : f < CUT ? 0.66 : 0.52;
      const fy = f < CUT ? 0.46 : 0.42;
      const s = Math.max(cw / img.width, ch / img.height) * zoom;
      const w = img.width * s, h = img.height * s;
      const x = (cw - w) * fx, y = (ch - h) * fy;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.filter = k > 0.02 ? `blur(${(k * 9).toFixed(1)}px)` : 'none';
      ctx.drawImage(img, x, y, w, h);
      ctx.filter = 'none';
      flash.style.opacity = (k * 0.9).toFixed(3);
    }

    function chaptersAt(p) {
      chapters.forEach((el) => {
        const a = +el.dataset.in, b = +el.dataset.out, fade = 0.035;
        const o = Math.min(clamp((p - a) / fade), clamp((b - p) / fade));
        const off = p < a + fade ? 1 - clamp((p - a) / fade) : -(1 - clamp((b - p) / fade));
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translateY(${(off * 40).toFixed(1)}px)`;
        el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
        el.classList.toggle('is-on', o > 0.5);
      });
    }

    function tick() {
      const p = progress();
      // short holds at both ends, film plays in between
      const target = clamp((p - 0.03) / 0.94) * (COUNT - 1);
      const prev = cur;
      cur += (target - cur) * (reduced ? 1 : 0.22);
      if (Math.abs(target - cur) < 0.01) cur = target;
      const rect = film.getBoundingClientRect();
      const onScreen = rect.bottom > 0 && rect.top < innerHeight;
      if (onScreen && (dirty || Math.abs(cur - prev) > 0.001)) {
        draw(cur);
        dirty = false;
      }
      if (onScreen) {
        chaptersAt(p);
        bar.style.transform = `scaleX(${p.toFixed(4)})`;
        const theme = cur < DARK_UNTIL ? 'night' : 'cream';
        if (film.dataset.theme !== theme) film.dataset.theme = theme;
      }
      requestAnimationFrame(tick);
    }
    size();
    requestAnimationFrame(tick);
  }

  /* ---------------- play star ---------------- */
  const play = $('#play');
  const star = $('#playStar');
  if (play && star) {
    // spring physics: drag throws the star, it wobbles back to rest
    const st = { rx: 0, ry: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    let drag = null, hover = { x: 0, y: 0 };
    play.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY };
      play.setPointerCapture(e.pointerId);
      star.classList.add('is-grab');
    });
    play.addEventListener('pointermove', (e) => {
      const r = play.getBoundingClientRect();
      hover.x = (e.clientX - r.left) / r.width - 0.5;
      hover.y = (e.clientY - r.top) / r.height - 0.5;
      if (!drag) return;
      st.vy += (e.clientX - drag.x) * 0.9;
      st.vx -= (e.clientY - drag.y) * 0.6;
      drag = { x: e.clientX, y: e.clientY };
    });
    const up = () => { drag = null; star.classList.remove('is-grab'); };
    play.addEventListener('pointerup', up);
    play.addEventListener('pointercancel', up);
    play.addEventListener('pointerleave', () => { hover = { x: 0, y: 0 }; });

    let last = performance.now();
    (function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      // rest pose follows the pointer a little and breathes slowly
      st.tx = hover.x * 28 + (reduced ? 0 : Math.sin(t * 0.8) * 6);
      st.ty = -hover.y * 18 + (reduced ? 0 : Math.cos(t * 0.6) * 4);
      const k = drag ? 4 : 60, damp = drag ? 3 : 7;
      st.vy += (st.tx - st.ry) * k * dt - st.vy * damp * dt;
      st.vx += (st.ty - st.rx) * k * dt - st.vx * damp * dt;
      st.ry = clamp(st.ry + st.vy * dt, -70, 70);
      st.rx = clamp(st.rx + st.vx * dt, -45, 45);
      star.style.transform = `rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg)`;
      star.style.setProperty('--shine', `${(50 + st.ry * 1.2).toFixed(1)}%`);
      requestAnimationFrame(loop);
    })(last);
  }
})();
