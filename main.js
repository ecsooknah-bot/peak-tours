/* ============================================================
   PEAK TOURS MAURITIUS — main.js v9
   Tabs · EN/FR Toggle · Mobile Menu · Lightbox
   Request Builder (Basket) · Scroll Reveal · Stat Counters
   ============================================================ */

'use strict';

const WA_NUMBER = '23052596260';

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initLangToggle();
  initTabs();
  initScrollReveal();
  initStatCounters();
  initGalleryLightbox();
  initActiveNav();
  initSmoothScroll();
  initRequestBuilder();
});

/* ── Header scroll shadow ─────────────────────────────────── */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile hamburger drawer ──────────────────────────────────────────── */
function initMobileNav() {
  const hamburger  = document.getElementById('hamburger');
  const drawer     = document.getElementById('mobDrawer');
  const overlay    = document.getElementById('mobOverlay');
  const closeBtn   = document.getElementById('mobDrawerClose');
  if (!hamburger || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = (window.innerWidth - document.documentElement.clientWidth) + 'px';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  hamburger.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  overlay.addEventListener('click', closeDrawer);

  // Close on any drawer link click (after a tiny delay so scroll can start)
  drawer.querySelectorAll('.mob-drawer__link').forEach(link => {
    link.addEventListener('click', () => setTimeout(closeDrawer, 80));
  });

  // Close on logo click inside drawer
  const drawerLogo = drawer.querySelector('.mob-drawer__logo');
  if (drawerLogo) drawerLogo.addEventListener('click', () => setTimeout(closeDrawer, 80));

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
}

/* ── EN / FR Language Toggle ──────────────────────────────────────────── */
function initLangToggle() {
  const langBtns = document.querySelectorAll('.lang-btn');
  if (!langBtns.length) return;

  let currentLang = document.documentElement.getAttribute('data-lang') || 'en';

  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-en], [data-fr]').forEach(el => {
      const text = el.getAttribute('data-' + lang);
      if (text !== null) {
        if (text.includes('<')) el.innerHTML = text;
        else el.textContent = text;
      }
    });

    langBtns.forEach(btn => {
      btn.classList.toggle('lang-btn--active', btn.getAttribute('data-lang') === lang);
    });

    // Update add-to-request button labels
    document.querySelectorAll('.btn-add-request').forEach(btn => {
      if (!btn.classList.contains('added')) {
        // Subtour option buttons use shorter label
        const isSubtour = btn.closest('.subtour-option');
        btn.querySelector('span').textContent = isSubtour
          ? (lang === 'fr' ? 'Ajouter' : 'Add')
          : (lang === 'fr' ? 'Ajouter à la demande' : 'Add to Request');
      }
    });

    try { localStorage.setItem('pt_lang', lang); } catch(e) {}
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (lang !== currentLang) applyLang(lang);
    });
  });

  try {
    const saved = localStorage.getItem('pt_lang');
    if (saved && saved !== currentLang) applyLang(saved);
  } catch(e) {}
}

/* ── Tour Tabs ────────────────────────────────────────────── */
function initTabs() {
  const tabBtns   = document.querySelectorAll('.tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabBtns.forEach(b => {
        b.classList.remove('tab--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('tab--active');
      btn.setAttribute('aria-selected', 'true');

      tabPanels.forEach(panel => {
        const isTarget = panel.id === 'tab-' + target;
        if (isTarget) {
          panel.hidden = false;
          requestAnimationFrame(() => {
            panel.classList.add('tab-panel--active');
          });
        } else {
          panel.classList.remove('tab-panel--active');
          panel.hidden = true;
        }
      });

      setTimeout(() => {
        const activePanel = document.getElementById('tab-' + target);
        if (activePanel && window._fadeObserver) {
          activePanel.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
            window._fadeObserver.observe(el);
          });
        }
      }, 50);
    });
  });
}

/* ── Scroll Reveal ────────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  window._fadeObserver = observer;
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ── Stat Counters ────────────────────────────────────────── */
function initStatCounters() {
  const stats = document.querySelectorAll('.stat__num[data-target]');
  if (!stats.length) return;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      animateCounter(el, target);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => counterObserver.observe(el));
}

function animateCounter(el, target) {
  const duration = 1800;
  const start    = performance.now();
  const update   = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ── Gallery Lightbox ─────────────────────────────────────── */
function initGalleryLightbox() {
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCap = document.getElementById('lightboxCaption');
  const closeBtn    = document.getElementById('lightboxClose');
  const prevBtn     = document.getElementById('lightboxPrev');
  const nextBtn     = document.getElementById('lightboxNext');
  if (!lightbox) return;

  const items = Array.from(document.querySelectorAll('.gallery__item'));
  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    const item = items[index];
    lightboxImg.src = item.getAttribute('data-src') || item.querySelector('img').src;
    lightboxImg.alt = item.querySelector('img').alt || '';
    if (lightboxCap) lightboxCap.textContent = item.getAttribute('data-caption') || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lightboxImg.src = '';
  };

  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn)  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    openLightbox(currentIndex);
  });
  if (nextBtn)  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % items.length;
    openLightbox(currentIndex);
  });

  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  { currentIndex = (currentIndex - 1 + items.length) % items.length; openLightbox(currentIndex); }
    if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % items.length; openLightbox(currentIndex); }
  });
}

/* ── Active Nav on Scroll ─────────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const activateNav = () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', activateNav, { passive: true });
  activateNav();
}

/* ── Smooth Scroll with header offset ────────────────── */
function initSmoothScroll() {
  // Service tab IDs that are now tab panels inside the tours section
  const SERVICE_TAB_MAP = { transfers: 'transfers', payment: 'payment', accommodation: 'accommodation' };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const hash = id.replace('#', '');

      // If the link targets a service tab, scroll to tours section and activate that tab
      if (SERVICE_TAB_MAP[hash]) {
        e.preventDefault();
        const tabBtn = document.querySelector(`.tab[data-tab="${SERVICE_TAB_MAP[hash]}"]`);
        if (tabBtn) {
          tabBtn.click();
          const toursSection = document.getElementById('tours');
          if (toursSection) {
            const headerH = document.getElementById('header')?.offsetHeight || 70;
            const top = toursSection.getBoundingClientRect().top + window.scrollY - headerH;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
        return;
      }

      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const headerH = document.getElementById('header')?.offsetHeight || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   REQUEST BUILDER — WhatsApp Basket System
══════════════════════════════════════════════════════════ */
function initRequestBuilder() {
  const builder   = document.getElementById('requestBuilder');
  const fab       = document.getElementById('requestBuilderFab');
  const closeBtn  = document.getElementById('requestBuilderClose');
  const list      = document.getElementById('requestList');
  const countEl   = document.getElementById('requestCount');
  const fabBadge  = document.getElementById('fabBadge');
  const sendBtn   = document.getElementById('requestSendBtn');
  const clearBtn  = document.getElementById('requestClearBtn');
  const addBtns   = document.querySelectorAll('.btn-add-request');

  if (!builder || !list) return;

  let items = [];

  const currentLang = () => {
    try { return localStorage.getItem('pt_lang') || 'en'; } catch(e) { return 'en'; }
  };

  const buildWAMessage = () => {
    if (!items.length) {
      return `https://wa.me/${WA_NUMBER}?text=Hello%20Peak%20Tours!%20I%20would%20like%20to%20enquire%20about%20your%20services.`;
    }
    const lang = currentLang();
    const intro = lang === 'fr'
      ? 'Bonjour%20Peak%20Tours!%20Je%20souhaite%20faire%20une%20demande%20pour%20%3A%0A%0A'
      : 'Hello%20Peak%20Tours!%20I%20would%20like%20to%20enquire%20about%20the%20following%3A%0A%0A';
    const itemList = items.map((item, i) => `${i + 1}.%20${encodeURIComponent(item)}`).join('%0A');
    const outro = lang === 'fr'
      ? '%0A%0APourriez-vous%20me%20donner%20plus%20de%20d%C3%A9tails%20et%20les%20disponibilit%C3%A9s%3F%20Merci!'
      : '%0A%0ACould%20you%20please%20share%20details%20and%20availability%3F%20Thank%20you!';
    return `https://wa.me/${WA_NUMBER}?text=${intro}${itemList}${outro}`;
  };

  const updateUI = () => {
    const count = items.length;

    // Update count badges
    if (countEl) countEl.textContent = count;
    if (fabBadge) {
      fabBadge.textContent = count;
      fabBadge.hidden = count === 0;
    }

    // Show/hide FAB
    if (fab) fab.hidden = count === 0 || !builder.hidden === false;

    // Render list items
    list.innerHTML = '';
    if (count === 0) {
      list.innerHTML = '<li class="request-empty">No services added yet.</li>';
    } else {
      items.forEach((item, i) => {
        const li = document.createElement('li');
        li.className = 'request-item';
        li.innerHTML = `
          <span class="request-item__name">${item}</span>
          <button class="request-item__remove" aria-label="Remove ${item}" data-index="${i}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        `;
        li.querySelector('.request-item__remove').addEventListener('click', () => {
          const removedItem = items[i];
          items.splice(i, 1);

          // Re-enable the corresponding add button
          addBtns.forEach(btn => {
            const btnItem = currentLang() === 'fr' && btn.dataset.itemFr
              ? btn.dataset.itemFr : btn.dataset.item;
            if (btnItem === removedItem) {
              btn.classList.remove('added');
              const lang = currentLang();
              const isSubtour = !!btn.closest('.subtour-option');
              btn.querySelector('span').textContent = isSubtour
                ? (lang === 'fr' ? 'Ajouter' : 'Add')
                : (lang === 'fr' ? 'Ajouter à la demande' : 'Add to Request');
            }
          });

          updateUI();
        });
        list.appendChild(li);
      });
    }

    // Update send button
    if (sendBtn) sendBtn.href = buildWAMessage();
  };

  /* Add to request — handles both regular and subtour buttons */
  function handleAddBtn(btn) {
    const lang = currentLang();
    const itemName = (lang === 'fr' && btn.dataset.itemFr)
      ? btn.dataset.itemFr
      : btn.dataset.item;

    if (!itemName) return;

    const isSubtour = !!btn.closest('.subtour-option');

    if (items.includes(itemName)) {
      // Already added — flash button
      btn.classList.add('added');
      btn.querySelector('span').textContent = lang === 'fr' ? 'Déjà ajouté ✓' : 'Already added ✓';
      return;
    }

    items.push(itemName);
    btn.classList.add('added');
    btn.querySelector('span').textContent = isSubtour
      ? (lang === 'fr' ? 'Ajouté ✓' : 'Added ✓')
      : (lang === 'fr' ? 'Ajouté ✓' : 'Added ✓');

    // Open builder panel
    builder.hidden = false;
    if (fab) fab.hidden = true;

    updateUI();
  }

  addBtns.forEach(btn => {
    btn.addEventListener('click', () => handleAddBtn(btn));
  });

  /* Toggle builder from FAB */
  if (fab) {
    fab.addEventListener('click', () => {
      builder.hidden = false;
      fab.hidden = true;
    });
  }

  /* Close builder */
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      builder.hidden = true;
      if (items.length > 0 && fab) fab.hidden = false;
    });
  }

  /* Clear all */
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      items = [];
      const lang = currentLang();
      addBtns.forEach(btn => {
        btn.classList.remove('added');
        const isSubtour = !!btn.closest('.subtour-option');
        btn.querySelector('span').textContent = isSubtour
          ? (lang === 'fr' ? 'Ajouter' : 'Add')
          : (lang === 'fr' ? 'Ajouter à la demande' : 'Add to Request');
      });
      builder.hidden = true;
      if (fab) fab.hidden = true;
      updateUI();
    });
  }

  updateUI();
}
