(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     Configuración
     ------------------------------------------------------------------------ */
  const INDICATORS = [
    { key: 'status', label: 'Status' },
    { key: 'prestige', label: 'Prestigio' },
    { key: 'belonging', label: 'Pertenencia' },
    { key: 'exclusivity', label: 'Exclusividad' },
  ];
  const BASE_LEVEL = 1; // perfil de partida (sin objetos)
  const MAX_LEVEL = 5;

  const FINAL_PHRASES = {
    up: {
      status: 'Tu status social ha aumentado.',
      prestige: 'Tu prestigio ha aumentado.',
      exclusivity: 'Tu nivel de exclusividad ha aumentado.',
      belonging: 'Tu sentido de pertenencia ha aumentado.',
    },
    down: {
      status: 'Tu status social ha disminuido.',
      prestige: 'Tu prestigio ha disminuido.',
      exclusivity: 'Tu nivel de exclusividad ha disminuido.',
      belonging: 'Tu sentido de pertenencia ha disminuido.',
    },
    same: 'Tu perfil se mantiene igual.',
  };
  // Desempate cuando dos indicadores cambian lo mismo.
  const PHRASE_PRIORITY = ['status', 'prestige', 'exclusivity', 'belonging'];

  /* ------------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const pad = (n) => String(n).padStart(2, '0');
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const numberFormat = new Intl.NumberFormat('es-AR');
  const money = (n) => '$' + numberFormat.format(Math.round(n));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  let uidCounter = 0;
  function artSvg(product, decorative) {
    const a11y = decorative ? 'aria-hidden="true"' : `role="img" aria-label="${product.alt}"`;
    const draw = ART[product.art];
    return `<svg viewBox="0 0 400 400" ${a11y} focusable="false">${draw ? draw('u' + ++uidCounter) : ''}</svg>`;
  }

  // Foto real si existe; si el archivo falta, se reemplaza por la ilustración.
  function media(product, { decorative = false } = {}) {
    if (product.image && !product.imageMissing) {
      return `<img src="${product.image}" alt="${decorative ? '' : product.alt}" data-pid="${product.id}" data-decorative="${decorative}" decoding="async">`;
    }
    return artSvg(product, decorative);
  }

  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.pid) return;
    const product = byId(Number(img.dataset.pid));
    product.imageMissing = true;
    img.outerHTML = artSvg(product, img.dataset.decorative === 'true');
  }, true);

  function announce(text) {
    const live = $('#live');
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 50);
  }

  /* ------------------------------------------------------------------------
     Perfil social
     El perfil es el promedio de los objetos seleccionados, redondeado y
     limitado entre 1 y 5. Sin objetos, todos los indicadores valen 1.
     ------------------------------------------------------------------------ */
  function computeProfile(items) {
    const profile = {};
    INDICATORS.forEach(({ key }) => {
      if (!items.length) { profile[key] = BASE_LEVEL; return; }
      const sum = items.reduce((acc, p) => acc + p[key], 0);
      profile[key] = clamp(Math.round(sum / items.length), 1, MAX_LEVEL);
    });
    return profile;
  }

  const baseProfile = () => computeProfile([]);
  const emptyProfile = () => Object.fromEntries(INDICATORS.map(({ key }) => [key, 0]));
  const levelsOf = (p) => Object.fromEntries(INDICATORS.map(({ key }) => [key, p[key]]));
  const compare = (before, after) => Object.fromEntries(INDICATORS.map(({ key }) => [key, Math.sign(after[key] - before[key])]));

  // La frase final habla del indicador que más cambió (en cualquier dirección).
  // Ante un empate, gana la subida y después el orden de PHRASE_PRIORITY.
  function outcomePhrase(before, after) {
    const diffs = PHRASE_PRIORITY.map((key) => ({ key, d: after[key] - before[key] }));
    const biggest = Math.max(...diffs.map(({ d }) => Math.abs(d)));
    if (biggest === 0) return FINAL_PHRASES.same;
    const winner = diffs.find(({ d }) => d === biggest) || diffs.find(({ d }) => d === -biggest);
    return FINAL_PHRASES[winner.d > 0 ? 'up' : 'down'][winner.key];
  }

  /* ------------------------------------------------------------------------
     Componente: indicadores segmentados (+ sube / baja / igual)
     ------------------------------------------------------------------------ */
  const DELTA = {
    1: { cls: 'is-up', html: '<b>↑</b>Sube', sr: 'sube' },
    '-1': { cls: 'is-down', html: '<b>↓</b>Baja', sr: 'baja' },
    0: { cls: 'is-same', html: '<b>=</b>Igual', sr: 'se mantiene' },
  };

  function createIndicators(container, { deltas = true, numbers = false } = {}) {
    const list = document.createElement('dl');
    list.className = 'indicators' + (deltas ? '' : ' indicators--no-delta');
    const rows = {};

    INDICATORS.forEach(({ key, label }) => {
      const row = document.createElement('div');
      row.className = 'ind-row';
      row.innerHTML = `
        <dt class="ind-label">${label}</dt>
        <dd class="ind-value">
          <span class="segs" aria-hidden="true">${'<span class="seg"></span>'.repeat(MAX_LEVEL)}</span>
          ${numbers ? '<span class="ind-num" aria-hidden="true"></span>' : ''}
          <span class="ind-delta" aria-hidden="true"></span>
          <span class="sr-only"></span>
        </dd>`;
      rows[key] = {
        segs: [...row.querySelectorAll('.seg')],
        num: row.querySelector('.ind-num'),
        delta: row.querySelector('.ind-delta'),
        sr: row.querySelector('.sr-only'),
        value: 0,
      };
      list.appendChild(row);
    });

    container.innerHTML = '';
    container.appendChild(list);

    // changes: { key: 1 | 0 | -1 } o null para ocultar la columna de cambio
    function update(profile, { instant = false, changes = null } = {}) {
      list.classList.toggle('no-anim', instant);
      INDICATORS.forEach(({ key }) => {
        const r = rows[key];
        const next = profile[key];
        const from = Math.min(r.value, next);
        r.segs.forEach((seg, i) => {
          seg.style.setProperty('--d', `${Math.abs(i - from) * 80}ms`);
          seg.classList.toggle('is-on', i < next);
        });

        if (r.num) r.num.innerHTML = next ? `${next}<span>/${MAX_LEVEL}</span>` : '';

        const change = changes ? DELTA[changes[key]] : null;
        r.delta.className = 'ind-delta' + (change ? ` is-shown ${change.cls}` : '');
        r.delta.innerHTML = change ? change.html : '';
        r.sr.textContent = next ? `nivel ${next} de ${MAX_LEVEL}${change ? `, ${change.sr}` : ''}` : '';
        r.value = next;
      });
      if (instant) {
        void list.offsetWidth;
        list.classList.remove('no-anim');
      }
    }

    return { update };
  }

  /* ------------------------------------------------------------------------
     Capas: foco, Escape y bloqueo de scroll
     ------------------------------------------------------------------------ */
  const stack = [];
  const FOCUSABLE = 'a[href], button:not([disabled]):not([hidden]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const focusables = (el) => [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement);

  function syncScrollLock() {
    const locked = stack.length > 0;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = locked ? 'hidden' : '';
    document.body.style.paddingRight = locked && scrollbar > 0 ? `${scrollbar}px` : '';
  }

  function openLayer(el, { initialFocus, escapable = true } = {}) {
    clearTimeout(el._hideTimer);
    if (stack.some((s) => s.el === el)) return;
    stack.push({ el, prev: document.activeElement, escapable });
    el.hidden = false;
    syncScrollLock();
    void el.offsetWidth;
    el.classList.add('is-open');
    const target = initialFocus || focusables(el)[0];
    if (target) target.focus({ preventScroll: true });
  }

  function closeLayer(el, { restoreFocus = true } = {}) {
    const index = stack.findIndex((s) => s.el === el);
    if (index === -1) return Promise.resolve();
    const [{ prev }] = stack.splice(index, 1);
    el.classList.remove('is-open');
    if (restoreFocus && prev && document.contains(prev)) prev.focus({ preventScroll: true });
    return new Promise((resolve) => {
      el._hideTimer = setTimeout(() => {
        el.hidden = true;
        syncScrollLock();
        resolve();
      }, reducedMotion.matches ? 0 : 650);
    });
  }

  document.addEventListener('keydown', (e) => {
    const top = stack[stack.length - 1];
    if (!top) return;
    if (e.key === 'Escape' && top.escapable) {
      e.preventDefault();
      closeLayer(top.el);
    }
    if (e.key === 'Tab') {
      const items = focusables(top.el);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !top.el.contains(document.activeElement))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !top.el.contains(document.activeElement))) {
        e.preventDefault(); first.focus();
      }
    }
  });

  document.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-close]');
    if (!closer) return;
    const layer = closer.closest('.layer');
    if (layer) closeLayer(layer);
  });

  /* ------------------------------------------------------------------------
     Estado
     ------------------------------------------------------------------------ */
  const state = {
    cart: [], // ids en orden de selección
    profile: baseProfile(), // perfil que resulta de la selección actual
    owned: baseProfile(), // perfil actual del usuario (última compra confirmada)
    total: 0,
    operation: '',
  };
  const cartItems = () => state.cart.map(byId);
  const inCart = (id) => state.cart.includes(id);

  /* ------------------------------------------------------------------------
     1. Inicio
     ------------------------------------------------------------------------ */
  function buildHero() {
    const field = $('#hero-field');
    field.innerHTML = PRODUCTS.map((p, i) => {
      const h = p.hero || { x: 10 + i * 10, y: 20, w: 10, depth: 15, dur: 14, r: 0 };
      return `
        <div class="float-pos" style="--x:${h.x};--y:${h.y};--w:${h.w};--in:${400 + i * 160}ms">
          <div class="float-par" data-depth="${h.depth}">
            <div class="float-anim" style="--dur:${h.dur};--r:${h.r}">${media(p, { decorative: true })}</div>
          </div>
        </div>`;
    }).join('');

    $('#hero-count').textContent = pad(PRODUCTS.length);
    $('#piece-count').textContent = pad(PRODUCTS.length);

    // Parallax muy leve con el puntero
    const layers = [...field.querySelectorAll('.float-par')];
    let frame = null;
    window.addEventListener('pointermove', (e) => {
      if (reducedMotion.matches || e.pointerType !== 'mouse' || window.scrollY > window.innerHeight) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        layers.forEach((l) => {
          const d = Number(l.dataset.depth);
          l.style.transform = `translate3d(${(-x * d).toFixed(1)}px, ${(-y * d).toFixed(1)}px, 0)`;
        });
      });
    });

    $('#explore').addEventListener('click', () => {
      const target = $('#objetos');
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      target.focus({ preventScroll: true });
    });

    const header = $('#site-header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------------
     2. Exploración (ProductGrid / ProductCard)
     ------------------------------------------------------------------------ */
  function buildGrid() {
    const grid = $('#product-grid');
    grid.innerHTML = PRODUCTS.map((p, i) => `
      <li class="piece" data-id="${p.id}">
        <button class="piece-btn" type="button" aria-haspopup="dialog" aria-label="${p.name}, ${money(p.price)}. Ver ficha">
          <div class="piece-media stage">
            <span class="piece-index" aria-hidden="true">${pad(i + 1)}</span>
            <span class="piece-flag" aria-hidden="true">En tu selección</span>
            <div class="piece-art">${media(p, { decorative: true })}</div>
          </div>
          <div class="piece-meta" aria-hidden="true">
            <span class="piece-name">${p.name}</span>
            <span class="piece-price">${money(p.price)}</span>
          </div>
        </button>
      </li>`).join('');

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.piece-btn');
      if (btn) openDetail(Number(btn.closest('.piece').dataset.id));
    });

    // Aparición al hacer scroll
    const pieces = grid.querySelectorAll('.piece');
    if (!('IntersectionObserver' in window)) {
      pieces.forEach((p) => p.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    pieces.forEach((p) => io.observe(p));
  }

  function syncGridFlags() {
    document.querySelectorAll('.piece').forEach((el) => {
      const id = Number(el.dataset.id);
      const p = byId(id);
      el.classList.toggle('in-cart', inCart(id));
      el.querySelector('.piece-btn').setAttribute(
        'aria-label',
        `${p.name}, ${money(p.price)}${inCart(id) ? ', en tu selección' : ''}. Ver ficha`,
      );
    });
  }

  /* ------------------------------------------------------------------------
     3. Ficha ampliada (ProductDetail)
     Las barras muestran el valor exacto del objeto (1 a 5).
     ------------------------------------------------------------------------ */
  const detailEl = $('#detail');
  const detailIndicators = createIndicators($('#detail-indicators'), { deltas: false, numbers: true });
  let currentProduct = null;

  function openDetail(id) {
    const p = byId(id);
    currentProduct = p;
    const index = PRODUCTS.indexOf(p);
    $('#detail-media').innerHTML = media(p);
    $('#detail-index').textContent = `${pad(index + 1)} / ${pad(PRODUCTS.length)}`;
    $('#detail-name').textContent = p.name;
    $('#detail-price').textContent = money(p.price);
    $('#detail-utility').textContent = p.utility;
    detailIndicators.update(emptyProfile(), { instant: true });
    syncDetailButton();
    openLayer(detailEl, { initialFocus: $('#detail-close') });
    setTimeout(() => detailIndicators.update(levelsOf(p)), reducedMotion.matches ? 0 : 320);
  }

  function syncDetailButton() {
    if (!currentProduct) return;
    const added = inCart(currentProduct.id);
    const btn = $('#detail-add');
    btn.innerHTML = added ? 'Ver tu selección <span aria-hidden="true">→</span>' : 'Agregar';
    btn.classList.toggle('btn--accent', !added);
    btn.classList.toggle('btn--outline-accent', added);
    btn.setAttribute('aria-label', added ? `${currentProduct.name} está en tu selección. Ver tu selección` : `Agregar ${currentProduct.name} a tu selección`);
  }

  $('#detail-add').addEventListener('click', async () => {
    if (!currentProduct) return;
    if (!inCart(currentProduct.id)) {
      addToCart(currentProduct.id);
      syncDetailButton();
      return;
    }
    const trigger = stack.find((s) => s.el === detailEl)?.prev;
    await closeLayer(detailEl, { restoreFocus: false });
    openCart(trigger);
  });

  /* ------------------------------------------------------------------------
     4–6. Carrito (CartDrawer + SocialIndicators)
     ------------------------------------------------------------------------ */
  const cartEl = $('#cart');
  const cartIndicators = createIndicators($('#cart-indicators'));
  cartIndicators.update(state.profile, { instant: true });
  let lastAdded = null;

  function addToCart(id) {
    if (inCart(id)) return; // sin duplicados
    state.cart.push(id);
    lastAdded = id;
    renderCart();
    bumpCounter();
    announce(`${byId(id).name} agregado a tu selección.`);
  }

  function removeFromCart(id) {
    const row = $(`#cart-list [data-id="${id}"]`);
    const i = state.cart.indexOf(id);
    const nextFocusId = state.cart[i + 1] ?? state.cart[i - 1] ?? null;

    const commit = () => {
      state.cart = state.cart.filter((x) => x !== id);
      renderCart();
      bumpCounter();
      syncDetailButton();
      announce(`${byId(id).name} quitado de tu selección.`);
      const next = nextFocusId && $(`#cart-list [data-id="${nextFocusId}"] .cart-remove`);
      (next || $('#cart .drawer-head [data-close]')).focus();
    };

    if (row && !reducedMotion.matches) {
      row.classList.add('is-leaving');
      setTimeout(commit, 320);
    } else {
      commit();
    }
  }

  function renderCart() {
    const items = cartItems();
    const list = $('#cart-list');

    list.innerHTML = items.map((p) => `
      <li class="cart-item${p.id === lastAdded ? ' is-new' : ''}" data-id="${p.id}">
        <div class="cart-thumb stage">${media(p, { decorative: true })}</div>
        <div class="min-w-0">
          <p class="cart-name">${p.name}</p>
          <p class="cart-price">${money(p.price)}</p>
        </div>
        <button type="button" class="cart-remove" aria-label="Quitar ${p.name} de tu selección">Quitar</button>
      </li>`).join('');
    lastAdded = null;

    $('#cart-empty').hidden = items.length > 0;
    $('#cart-head-count').textContent = items.length ? pad(items.length) : '';

    const total = items.reduce((acc, p) => acc + p.price, 0);
    countTo($('#cart-total'), state.total, total);
    state.total = total;

    // Cada cambio muestra si el indicador subió, bajó o quedó igual respecto de antes.
    const before = state.profile;
    state.profile = computeProfile(items);
    cartIndicators.update(state.profile, { changes: items.length ? compare(before, state.profile) : null });

    $('#checkout-open').disabled = items.length === 0;

    syncGridFlags();
  }

  $('#cart-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-remove');
    if (btn) removeFromCart(Number(btn.closest('.cart-item').dataset.id));
  });

  function bumpCounter() {
    const count = $('#cart-count');
    const n = state.cart.length;
    count.textContent = n;
    count.classList.toggle('has-items', n > 0);
    $('#cart-toggle').setAttribute('aria-label', `Abrir tu selección, ${n} ${n === 1 ? 'objeto' : 'objetos'}`);
    count.classList.remove('bump');
    void count.offsetWidth;
    count.classList.add('bump');
  }

  function countTo(el, from, to) {
    if (reducedMotion.matches || from === to) { el.textContent = money(to); return; }
    const start = performance.now();
    const duration = 700;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = money(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function openCart(returnTo) {
    openLayer(cartEl, { initialFocus: $('#cart .drawer-head [data-close]') });
    if (returnTo) stack[stack.length - 1].prev = returnTo;
  }

  $('#cart-toggle').addEventListener('click', () => openCart());

  /* ------------------------------------------------------------------------
     7–8. Confirmación (CheckoutModal)
     Compara el perfil de la selección con el perfil actual del usuario.
     ------------------------------------------------------------------------ */
  const checkoutEl = $('#checkout');
  const checkoutIndicators = createIndicators($('#checkout-indicators'));

  $('#checkout-open').addEventListener('click', () => {
    if (!state.cart.length) return;
    state.operation = String(Math.floor(100000 + Math.random() * 900000));
    $('#checkout-ref').textContent = `Nº ${state.operation}`;
    $('#checkout-total').textContent = money(state.total);
    checkoutIndicators.update(state.owned, { instant: true });
    openLayer(checkoutEl, { initialFocus: $('#checkout-confirm') });
    setTimeout(
      () => checkoutIndicators.update(state.profile, { changes: compare(state.owned, state.profile) }),
      reducedMotion.matches ? 0 : 380,
    );
  });

  $('#checkout-confirm').addEventListener('click', () => {
    const snapshot = {
      items: cartItems(),
      before: { ...state.owned },
      profile: { ...state.profile },
      total: state.total,
      operation: state.operation,
    };
    state.owned = { ...state.profile };
    closeLayer(checkoutEl, { restoreFocus: false });
    closeLayer(cartEl, { restoreFocus: false });
    showFinal(snapshot);
  });

  /* ------------------------------------------------------------------------
     9. Compra confirmada (PurchaseConfirmation)
     ------------------------------------------------------------------------ */
  const finalEl = $('#final');
  const finalIndicators = createIndicators($('#final-indicators'));
  finalEl.querySelectorAll('[data-stagger]').forEach((el, i) => el.style.setProperty('--s', i));

  function showFinal({ items, before, profile, total, operation }) {
    $('#final-ref').textContent = `Nº ${operation}`;
    $('#final-phrase').textContent = outcomePhrase(before, profile);
    $('#final-total').textContent = money(total);
    $('#final-utility').innerHTML = `<span>Utilidad adquirida</span>${items.map((p) => p.utility).join(' ')}`;
    finalIndicators.update(before, { instant: true });

    openLayer(finalEl, { escapable: false, initialFocus: $('#final-title') });
    finalEl.scrollTop = 0;
    setTimeout(
      () => finalIndicators.update(profile, { changes: compare(before, profile) }),
      reducedMotion.matches ? 0 : 1500,
    );
    announce('Compra confirmada.');
  }

  $('#keep-improving').addEventListener('click', async () => {
    // Vacía la selección y vuelve a los objetos detrás de la pantalla final.
    // El perfil comprado queda como punto de partida de la próxima compra.
    state.cart = [];
    renderCart();
    bumpCounter();
    currentProduct = null;
    const target = $('#objetos');
    window.scrollTo({ top: target.offsetTop, behavior: 'instant' });
    await closeLayer(finalEl, { restoreFocus: false });
    target.focus({ preventScroll: true });
  });

  /* ------------------------------------------------------------------------
     Inicio
     ------------------------------------------------------------------------ */
  buildHero();
  buildGrid();
  renderCart();
})();
