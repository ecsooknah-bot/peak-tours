/* ==========================================================================
   Mauritius Paradise (Catamaran Mauricien Fiesta) | script.js
   Vanilla JS. GSAP, ScrollTrigger and Lenis are loaded from a CDN in index.html.
   Every feature below works without them (the page simply doesn't animate).

   Photos: all image files are listed in the IMAGE MAP comment at the top of
   index.html. Swap the files in /images to use the owner's real photos.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Settings ---------- */
  var WHATSAPP_NUMBER = '23059292199';            // +230 5929 2199, digits only for wa.me
  var PARTY_TRIP = 'Sunset Cruise with DJ';      // must match the <option> text in the form
  var PARTY_DAYS = [5, 6];                           // Friday & Saturday (0 = Sunday)

  var doc = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var header = document.getElementById('site-header');
  var lenis = null;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ==========================================================================
     1. Smooth scrolling (Lenis) + scroll animations (GSAP / ScrollTrigger)
     ========================================================================== */
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
      // Touch devices keep their native scrolling (Lenis default), which feels best on phones.
    });
    if (hasGsap) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var rafLoop = function (time) { lenis.raf(time); requestAnimationFrame(rafLoop); };
      requestAnimationFrame(rafLoop);
    }
  }

  if (!prefersReducedMotion && hasGsap) {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.config({ ignoreMobileResize: true });

    // Fade / slide-up reveals, batched so elements entering together stagger nicely.
    var showNow = function (el) {
      el.removeAttribute('data-reveal');
      gsap.set(el, { clearProps: 'opacity,transform' });
    };
    var reveal = function (batch) {
      batch = batch.filter(function (el) {
        if (!el.hasAttribute('data-reveal') || el._revealing) return false;
        // Already scrolled past (fast flick or deep link): just show it, no animation.
        if (el.getBoundingClientRect().bottom < 0) { showNow(el); return false; }
        return true;
      });
      if (!batch.length) return;
      batch.forEach(function (el) { el._revealing = true; });
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: Math.min(0.12, 0.6 / batch.length),
        overwrite: true,
        onComplete: function () {
          // Hand the elements back to CSS so hover effects work normally.
          batch.forEach(function (el) { el.removeAttribute('data-reveal'); });
          gsap.set(batch, { clearProps: 'opacity,transform' });
        }
      });
    };
    window.ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: reveal,
      onEnterBack: reveal
    });

    // Safety net for jumps (e.g. opening the page at /#faq or a fast flick):
    // reveal whatever is on screen, and show anything already scrolled past.
    var revealCheck = function () {
      var vh = window.innerHeight;
      var onScreen = [];
      $$('[data-reveal]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0) showNow(el);
        else if (r.top < vh * 0.9) onScreen.push(el);
      });
      reveal(onScreen);
    };

    // Gentle parallax inside the hero frame. The photo is scaled up slightly in CSS
    // so it can drift without showing an edge; the scale matches the CSS value.
    gsap.fromTo('.hero__media img',
      { yPercent: 0, scale: 1.06 },
      {
        yPercent: 3,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      }
    );

    window.__cfAnimReady = true;
    window.ScrollTrigger.addEventListener('scrollEnd', revealCheck);
    // Recalculate positions once lazy images and fonts have settled.
    var afterLoad = function () {
      window.ScrollTrigger.refresh();
      requestAnimationFrame(revealCheck);
    };
    if (document.readyState === 'complete') afterLoad(); else window.addEventListener('load', afterLoad);
  } else {
    // No animation libraries (or reduced motion): show everything immediately.
    doc.classList.remove('js-anim');
  }

  /* ==========================================================================
     2. Header: glass bar after scrolling + active section link
     ========================================================================== */
  var lastScrolled = null;
  function updateHeader() {
    var scrolled = (window.scrollY || window.pageYOffset) > 24;
    if (scrolled !== lastScrolled) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }
  var headerTicking = false;
  window.addEventListener('scroll', function () {
    if (headerTicking) return;
    headerTicking = true;
    requestAnimationFrame(function () { updateHeader(); headerTicking = false; });
  }, { passive: true });
  updateHeader();

  if ('IntersectionObserver' in window) {
    var navLinks = $$('.nav__links a');
    var linkFor = {};
    navLinks.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('is-active'); });
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ==========================================================================
     3. Mobile menu
     ========================================================================== */
  var burger = $('.burger');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-is-open', open);
    if (open) {
      menu.removeAttribute('inert');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    } else {
      menu.setAttribute('inert', '');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ==========================================================================
     4. In-page links: smooth scroll (Lenis when available)
     ========================================================================== */
  function scrollToTarget(target, done) {
    if (lenis) {
      // Absolute position from the live scroll value, so the target is always exact.
      // Sections have their own top padding; anything else is kept clear of the fixed header.
      var offset = typeof target === 'number' || target.tagName === 'SECTION' || target === document.body ? 0 : header.offsetHeight + 24;
      var y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY - offset;
      lenis.scrollTo(y, { duration: 1.4, onComplete: done });
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      if (done) setTimeout(done, prefersReducedMotion ? 0 : 700);
    } else {
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      if (done) setTimeout(done, prefersReducedMotion ? 0 : 700);
    }
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    var target = id === '#top' ? document.body : document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();

    var wasMenuOpen = menu.classList.contains('is-open');
    if (wasMenuOpen) setMenu(false);

    // "Book this trip" / "Reserve your spot": preselect the trip in the booking form.
    var trip = link.getAttribute('data-book-trip');
    if (trip) selectTrip(trip);

    // Hero links ("Northern Islands Cruise"): open that cruise's details once we arrive.
    var cruiseToOpen = link.hasAttribute('data-open-cruise') ? target : null;

    var go = function () {
      scrollToTarget(id === '#top' ? 0 : target, function () {
        if (trip) highlightForm();
        if (cruiseToOpen) openCruise(cruiseToOpen);
      });
      try { history.replaceState(null, '', id === '#top' ? location.pathname : id); } catch (err) { /* sandboxed previews */ }
    };
    // Let the menu fade out first so the scroll reads clearly.
    if (wasMenuOpen) setTimeout(go, 250); else go();
  });

  /* ==========================================================================
     5. Booking form → pre-filled WhatsApp message (no backend)
     ========================================================================== */
  var form = document.getElementById('book-form');
  var fName = document.getElementById('f-name');
  var fTrip = document.getElementById('f-trip');
  var fDate = document.getElementById('f-date');
  var fPeople = document.getElementById('f-people');
  var dateHint = document.getElementById('h-date');

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoToday() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function parseISO(value) {
    // Build the date in local time (new Date('2026-11-14') would be UTC and can shift a day).
    var p = value.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function prettyDate(value) {
    try {
      return parseISO(value).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (err) { return value; }
  }

  fDate.min = isoToday();

  function selectTrip(trip) {
    fTrip.value = trip;
    fTrip.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function highlightForm() {
    form.classList.add('is-highlighted');
    setTimeout(function () { form.classList.remove('is-highlighted'); }, 1600);
    // On desktop, put the cursor in the first empty field. On phones we don't,
    // so the keyboard doesn't pop up uninvited.
    if (finePointer) {
      var firstEmpty = [fName, fDate].filter(function (el) { return !el.value; })[0];
      if (firstEmpty) firstEmpty.focus({ preventScroll: true });
    }
  }

  function updateDateHint() {
    var show = fTrip.value === PARTY_TRIP && fDate.value && PARTY_DAYS.indexOf(parseISO(fDate.value).getDay()) === -1;
    dateHint.hidden = !show;
  }
  fTrip.addEventListener('change', function () { updateDateHint(); clearError(fTrip); });
  fDate.addEventListener('change', function () { updateDateHint(); clearError(fDate); });
  fName.addEventListener('input', function () { clearError(fName); });
  fPeople.addEventListener('input', function () { clearError(fPeople); });

  // People stepper (−/+)
  $$('.stepper__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = parseInt(fPeople.value, 10) || 0;
      var next = Math.max(1, current + parseInt(btn.getAttribute('data-step'), 10));
      fPeople.value = next;
      clearError(fPeople);
    });
  });

  function fieldOf(input) { return input.closest('.field'); }
  function setError(input) {
    fieldOf(input).classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
  }
  function clearError(input) {
    fieldOf(input).classList.remove('has-error');
    input.removeAttribute('aria-invalid');
  }

  function validate() {
    var invalid = [];
    if (!fName.value.trim()) invalid.push(fName);
    if (!fTrip.value) invalid.push(fTrip);
    if (!fDate.value || fDate.value < fDate.min) invalid.push(fDate);
    var people = parseInt(fPeople.value, 10);
    if (!people || people < 1) invalid.push(fPeople);
    [fName, fTrip, fDate, fPeople].forEach(clearError);
    invalid.forEach(setError);
    return invalid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = validate();
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    var people = parseInt(fPeople.value, 10);
    var message = [
      'Hello Mauritius Paradise! 👋',
      "I'd like to book a cruise:",
      '',
      '• Cruise: ' + fTrip.value,
      '• Date: ' + prettyDate(fDate.value),
      '• People: ' + people,
      '• Name: ' + fName.value.trim(),
      '',
      'Is this available? Thank you!'
    ].join('\n');

    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    var win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url; // pop-up blocked: open in the same tab instead
  });

  /* ==========================================================================
     6. FAQ accordion: smooth open/close, one answer open at a time
     ========================================================================== */
  var faqItems = $$('.faq__item');
  var EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  function closeFaq(item) {
    var answer = $('.faq__answer', item);
    if (prefersReducedMotion || !answer.animate) { item.open = false; return; }
    item.classList.add('is-closing');
    var anim = answer.animate(
      [{ height: answer.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: 380, easing: EASE }
    );
    item._anim = anim;
    anim.onfinish = function () {
      item.open = false;
      item.classList.remove('is-closing');
      item._anim = null;
    };
  }
  function openFaq(item) {
    var answer = $('.faq__answer', item);
    item.open = true;
    if (prefersReducedMotion || !answer.animate) return;
    var anim = answer.animate(
      [{ height: '0px', opacity: 0 }, { height: answer.offsetHeight + 'px', opacity: 1 }],
      { duration: 480, easing: EASE }
    );
    item._anim = anim;
    anim.onfinish = function () { item._anim = null; };
  }

  faqItems.forEach(function (item) {
    $('summary', item).addEventListener('click', function (e) {
      e.preventDefault();
      if (item._anim) return; // ignore clicks mid-animation
      if (item.open) {
        closeFaq(item);
      } else {
        faqItems.forEach(function (other) { if (other !== item && other.open) closeFaq(other); });
        openFaq(item);
      }
    });
  });

  /* ==========================================================================
     6b. Cruise rows: click a row (or its arrow) to show the details.
         Details are visible without JavaScript; JS folds them away at start.
     ========================================================================== */
  function refreshTriggers() {
    if (window.__cfAnimReady && window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  function setCruise(btn, open, animate) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.setAttribute('aria-expanded', String(open));
    if (!animate || prefersReducedMotion || !panel.animate) {
      panel.hidden = !open;
      refreshTriggers();
      return;
    }
    if (open) {
      panel.hidden = false;
      panel.animate(
        [{ height: '0px', opacity: 0 }, { height: panel.scrollHeight + 'px', opacity: 1 }],
        { duration: 520, easing: EASE }
      ).onfinish = refreshTriggers;
    } else {
      panel.animate(
        [{ height: panel.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
        { duration: 420, easing: EASE }
      ).onfinish = function () { panel.hidden = true; refreshTriggers(); };
    }
  }
  function openCruise(article) {
    var btn = $('.cruise__toggle', article);
    if (btn && btn.getAttribute('aria-expanded') !== 'true') setCruise(btn, true, true);
  }
  $$('.cruise__toggle').forEach(function (btn) {
    setCruise(btn, false, false);
    btn.addEventListener('click', function () {
      setCruise(btn, btn.getAttribute('aria-expanded') !== 'true', true);
    });
  });

  /* ==========================================================================
     7. Gallery lightbox (native <dialog>: focus trap + Esc for free)
     ========================================================================== */
  var lightbox = document.getElementById('lightbox');
  var galleryLinks = $$('.gallery__item');

  if (lightbox && typeof lightbox.showModal === 'function' && galleryLinks.length) {
    var lbImg = $('.lightbox__img', lightbox);
    var lbCaption = $('.lightbox__caption', lightbox);
    var lbCount = $('.lightbox__count', lightbox);
    var current = 0;
    var photos = galleryLinks.map(function (a) {
      var thumb = $('img', a);
      return { src: a.getAttribute('href'), alt: thumb.getAttribute('alt') || '' };
    });

    var preload = function (i) {
      var img = new Image();
      img.src = photos[(i + photos.length) % photos.length].src;
    };

    var show = function (index) {
      current = (index + photos.length) % photos.length;
      var photo = photos[current];
      lbImg.classList.remove('is-loaded');
      var reveal = function () {
        lbImg.src = photo.src;
        lbImg.alt = photo.alt;
        lbCaption.textContent = photo.alt;
        lbCount.textContent = (current + 1) + ' / ' + photos.length;
        var done = function () { requestAnimationFrame(function () { lbImg.classList.add('is-loaded'); }); };
        if (lbImg.complete && lbImg.naturalWidth) done(); else lbImg.onload = done;
      };
      // Short cross-fade between photos.
      if (lightbox.open && !prefersReducedMotion) setTimeout(reveal, 180); else reveal();
      preload(current + 1);
      preload(current - 1);
    };

    var openLightbox = function (index) {
      show(index);
      lightbox.showModal();
      if (lenis) lenis.stop();
      requestAnimationFrame(function () { lightbox.classList.add('is-visible'); });
    };

    var closeLightbox = function () {
      lightbox.classList.remove('is-visible');
      setTimeout(function () {
        if (lightbox.open) lightbox.close();
      }, prefersReducedMotion ? 0 : 380);
    };

    galleryLinks.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openLightbox(i);
      });
    });

    $('.lightbox__close', lightbox).addEventListener('click', closeLightbox);
    $('.lightbox__prev', lightbox).addEventListener('click', function () { show(current - 1); });
    $('.lightbox__next', lightbox).addEventListener('click', function () { show(current + 1); });

    lightbox.addEventListener('cancel', function (e) { e.preventDefault(); closeLightbox(); }); // Esc key
    lightbox.addEventListener('close', function () {
      lightbox.classList.remove('is-visible');
      if (lenis) lenis.start();
      galleryLinks[current].focus({ preventScroll: true });
    });
    lightbox.addEventListener('click', function (e) {
      // Click on the dark background (not the photo or a button) closes the viewer.
      if (e.target === lightbox || e.target.classList.contains('lightbox__figure')) closeLightbox();
    });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });

    // Swipe left/right on phones.
    var startX = 0;
    var startY = 0;
    lightbox.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ==========================================================================
     8. Floating WhatsApp button
        Appears once you scroll past the hero (which has its own big WhatsApp
        button) and steps aside over the booking form so it never covers it.
     ========================================================================== */
  var fab = $('.wa-fab');
  var hero = document.getElementById('top');
  var contact = document.getElementById('contact');
  if (fab && hero && contact && 'IntersectionObserver' in window) {
    var heroVisible = true;
    var contactVisible = false;
    var syncFab = function () { fab.classList.toggle('is-hidden', heroVisible || contactVisible); };
    syncFab();
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      syncFab();
    }, { rootMargin: '-50% 0px 0px 0px' }).observe(hero);   // hidden until the hero is half scrolled away
    new IntersectionObserver(function (entries) {
      contactVisible = entries[0].isIntersecting;
      syncFab();
    }, { rootMargin: '0px 0px -35% 0px' }).observe(contact);
  }
})();
