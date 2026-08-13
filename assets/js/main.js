/**
 * ZapPay - Main JavaScript
 */

// Flag JS early so reveal-on-scroll styles only apply when we can undo them.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initMobileNav();
  initNavbarScroll();
  initTypingAnimation();
  initReveal();
  initMarquee();
  initCounters();
  initPlanExplorer();
  initProviderFinder();
  initTestimonialCarousel();
  initRechargeSimulator();
  initBulkCalculator();
  initFormValidation();
  initPasswordToggles();
  initYear();
});

// --- Theme Toggle ---
function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle');
  const currentTheme = localStorage.getItem('zappay_theme') || 'light';

  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  syncThemeIcons();

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('zappay_theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('zappay_theme', 'dark');
      }
      syncThemeIcons();
    });
  });
}

// Swap the moon/sun glyph so the control reflects the active theme.
function syncThemeIcons() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.theme-toggle').forEach(toggle => {
    const icon = toggle.querySelector('[data-lucide], svg');
    if (!icon) return;
    const holder = document.createElement('i');
    holder.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    icon.replaceWith(holder);
  });
  if (window.lucide) lucide.createIcons();
}

// --- RTL Toggle ---
function initRTL() {
  const rtlToggles = document.querySelectorAll('.rtl-toggle');
  const currentDir = localStorage.getItem('zappay_dir') || 'ltr';

  document.documentElement.setAttribute('dir', currentDir);

  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      if (isRTL) {
        document.documentElement.setAttribute('dir', 'ltr');
        localStorage.setItem('zappay_dir', 'ltr');
      } else {
        document.documentElement.setAttribute('dir', 'rtl');
        localStorage.setItem('zappay_dir', 'rtl');
      }
    });
  });
}

// --- Mobile Navigation ---
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerClose = document.querySelector('.drawer-close');
  const overlay = document.querySelector('.drawer-overlay');

  if (!hamburger || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
}

// --- Elevated navbar once the page scrolls ---
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const update = () => navbar.classList.toggle('scrolled', window.scrollY > 12);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// --- Typing / Counter Animation (Hero) ---
function initTypingAnimation() {
  const heroAnimatedText = document.querySelector('.hero-animated-text');
  if (!heroAnimatedText) return;

  const phrases = (heroAnimatedText.dataset.phrases || '₹0 → Recharged in 2 seconds.')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);

  heroAnimatedText.innerHTML = '<span class="typed"></span><span class="cursor cursor-blink">|</span>';
  const typedSpan = heroAnimatedText.querySelector('.typed');

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];

    if (!deleting) {
      typedSpan.textContent = phrase.slice(0, ++charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(tick, phrases.length > 1 ? 2200 : 3000);
        return;
      }
      setTimeout(tick, 55);
    } else {
      typedSpan.textContent = phrase.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, 350);
        return;
      }
      setTimeout(tick, 28);
    }
  }

  setTimeout(tick, 500);
}

// --- Reveal on scroll ---
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach((el, i) => {
    // Stagger siblings so grids cascade instead of popping in together.
    if (!el.style.getPropertyValue('--reveal-delay')) {
      const siblingIndex = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--reveal-delay', `${Math.min(siblingIndex, 5) * 80}ms`);
    }
    observer.observe(el);
  });
}

// --- Seamless logo marquee (duplicate the track for a loop with no seam) ---
function initMarquee() {
  document.querySelectorAll('.marquee-track').forEach(track => {
    track.innerHTML += track.innerHTML;
  });
}

// --- Count-up numbers ---
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const run = (el) => {
    const raw = el.dataset.count;
    const target = parseFloat(raw);
    const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (target * eased).toFixed(decimals);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(run);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  counters.forEach(el => observer.observe(el));
}

// --- Plan Explorer (tabbed plan finder) ---
function initPlanExplorer() {
  document.querySelectorAll('[data-plan-explorer]').forEach(explorer => {
    const tabs = Array.from(explorer.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    const select = (tab, focus = true) => {
      tabs.forEach(t => {
        const active = t === tab;
        t.setAttribute('aria-selected', active ? 'true' : 'false');
        t.tabIndex = active ? 0 : -1;
        const panel = explorer.querySelector('#' + t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !active;
      });
      if (focus) tab.focus();
      // Re-draw the icons inside the panel that just became visible.
      if (window.lucide) lucide.createIcons();
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => select(tab, false));

      // Roving focus, per the WAI-ARIA tabs pattern.
      tab.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(tab);
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next);
      });
    });

    // Normalise the starting state from whichever tab is marked selected.
    select(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0], false);
  });
}

// --- Provider finder (live search + category filter) ---
function initProviderFinder() {
  const bar = document.querySelector('[data-provider-finder]');
  if (!bar) return;

  const search = bar.querySelector('[data-finder-search]');
  const clearBtn = bar.querySelector('[data-finder-clear]');
  const chips = Array.from(bar.querySelectorAll('[data-finder-chip]'));
  const status = bar.querySelector('[data-finder-status]');
  const empty = document.querySelector('[data-finder-empty]');
  const cards = Array.from(document.querySelectorAll('[data-provider]'));
  const groups = Array.from(document.querySelectorAll('[data-provider-group]'));

  // Stamp each chip with how many providers it covers.
  chips.forEach(chip => {
    const cat = chip.dataset.finderChip;
    const n = cat === 'all' ? cards.length : cards.filter(c => c.dataset.category === cat).length;
    const slot = chip.querySelector('.count');
    if (slot) slot.textContent = n;
  });

  function apply() {
    const q = search.value.trim().toLowerCase();
    const active = (chips.find(c => c.getAttribute('aria-pressed') === 'true') || chips[0]).dataset.finderChip;

    let shown = 0;
    cards.forEach(card => {
      const matchesText = !q || card.dataset.provider.toLowerCase().includes(q);
      const matchesCat = active === 'all' || card.dataset.category === active;
      const visible = matchesText && matchesCat;
      card.hidden = !visible;
      if (visible) shown++;
    });

    // Collapse a whole group once nothing in it survives the filter.
    groups.forEach(group => {
      const any = group.querySelector('[data-provider]:not([hidden])');
      group.hidden = !any;
    });

    clearBtn.hidden = !q;
    if (empty) empty.hidden = shown > 0;

    const label = chips.find(c => c.dataset.finderChip === active).dataset.label || 'providers';
    status.innerHTML = shown
      ? 'Showing <strong>' + shown + '</strong> of <strong>' + cards.length + '</strong> ' + label
      : 'No providers match that search.';
  }

  search.addEventListener('input', apply);

  clearBtn.addEventListener('click', () => {
    search.value = '';
    apply();
    search.focus();
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      apply();
    });
  });

  // Escape clears the field while typing in it.
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && search.value) {
      search.value = '';
      apply();
    }
  });

  const resetBtn = document.querySelector('[data-finder-reset]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      search.value = '';
      chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.finderChip === 'all')));
      apply();
      search.focus();
    });
  }

  apply();
}

// --- Testimonial carousel ---
function initTestimonialCarousel() {
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const track = root.querySelector('[data-carousel-track]');
    const slides = Array.from(root.querySelectorAll('[data-carousel-slide]'));
    const dotWrap = root.querySelector('[data-carousel-dots]');
    if (!track || slides.length < 2) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let timer = null;

    // Build one dot per slide.
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1) + ' of ' + slides.length);
      dot.addEventListener('click', () => { go(i); restart(); });
      dotWrap.appendChild(dot);
    });
    const dots = Array.from(dotWrap.children);

    function go(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      slides.forEach((s, i) => {
        // Keep offscreen quotes out of the tab order and off the a11y tree.
        s.setAttribute('aria-hidden', String(i !== index));
        s.querySelectorAll('a, button').forEach(el => { el.tabIndex = i === index ? 0 : -1; });
      });
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
    }

    function restart() {
      if (reduced) return;
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), 6500);
    }

    root.querySelector('[data-carousel-prev]').addEventListener('click', () => { go(index - 1); restart(); });
    root.querySelector('[data-carousel-next]').addEventListener('click', () => { go(index + 1); restart(); });

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { go(index - 1); restart(); }
      else if (e.key === 'ArrowRight') { go(index + 1); restart(); }
      else return;
      e.preventDefault();
    });

    // Pause while the reader is engaged with it.
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin', () => clearInterval(timer));
    root.addEventListener('focusout', (e) => {
      if (!root.contains(e.relatedTarget)) restart();
    });

    // Touch swipe.
    let startX = null;
    root.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) { go(index + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });

    go(0);
    restart();
  });
}

// --- Recharge simulator (3-step try-it-here wizard) ---
function initRechargeSimulator() {
  const sim = document.querySelector('[data-simulator]');
  if (!sim) return;

  const SERVICES = {
    mobile: {
      label: 'Mobile Recharge',
      field: 'Mobile number',
      hint: 'Any 10-digit number — nothing is actually charged.',
      operators: ['Jio', 'Airtel', 'Vi', 'BSNL'],
      validate: v => /^[6-9]\d{9}$/.test(v) || 'Enter a valid 10-digit mobile number.',
      plans: [
        { amount: 239, name: 'Daily Saver', detail: '1.5 GB/day · unlimited calls · 28 days' },
        { amount: 299, name: 'Everyday Plus', detail: '2 GB/day · unlimited calls · 28 days' },
        { amount: 666, name: 'Long Haul', detail: '1.5 GB/day · unlimited calls · 84 days' }
      ]
    },
    dth: {
      label: 'DTH Recharge',
      field: 'Subscriber ID',
      hint: 'Printed on your set-top box and every invoice.',
      operators: ['Tata Play', 'Airtel DTH', 'Dish TV', 'd2h'],
      validate: v => /^\d{8,12}$/.test(v) || 'Subscriber IDs are 8–12 digits.',
      plans: [
        { amount: 199, name: 'Starter Pack', detail: '120+ channels · 30 days' },
        { amount: 449, name: 'Family HD', detail: '250+ channels, 60 in HD · 30 days' },
        { amount: 4299, name: 'Annual Saver', detail: '250+ channels · 365 days' }
      ]
    },
    broadband: {
      label: 'Broadband Bill',
      field: 'Account number',
      hint: 'Found at the top of your monthly broadband bill.',
      operators: ['JioFiber', 'Airtel Xstream', 'BSNL Bharat Fibre', 'ACT Fibernet'],
      validate: v => v.trim().length >= 6 || 'Account numbers are at least 6 characters.',
      plans: [
        { amount: 499, name: 'Home Basic', detail: '50 Mbps unlimited · 1 month' },
        { amount: 799, name: 'Work From Home', detail: '150 Mbps unlimited · 1 month' },
        { amount: 1299, name: 'Fibre Max', detail: '300 Mbps unlimited · 1 month' }
      ]
    },
    datacard: {
      label: 'Data Card',
      field: 'Data card number',
      hint: 'The number printed on your dongle or hotspot.',
      operators: ['Jio', 'Airtel', 'Vi', 'BSNL'],
      validate: v => /^\d{10}$/.test(v) || 'Enter the 10-digit data card number.',
      plans: [
        { amount: 149, name: 'Light', detail: '20 GB · 28 days' },
        { amount: 401, name: 'Standard', detail: '50 GB · 28 days' },
        { amount: 999, name: 'Heavy', detail: '150 GB · 56 days' }
      ]
    }
  };

  const inr = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  });

  const panels = Array.from(sim.querySelectorAll('[data-sim-panel]'));
  const nodes = Array.from(sim.querySelectorAll('[data-sim-node]'));
  const bars = Array.from(sim.querySelectorAll('[data-sim-bar]'));
  const numberInput = sim.querySelector('[data-sim-number]');
  const numberLabel = sim.querySelector('[data-sim-field]');
  const numberHint = sim.querySelector('[data-sim-hint]');
  const operatorSelect = sim.querySelector('[data-sim-operator]');
  const feedback = sim.querySelector('[data-sim-error]');
  const planRows = sim.querySelector('[data-sim-plans]');

  const state = { service: null, number: '', operator: '', plan: null, step: 0 };

  function show(step) {
    state.step = step;
    panels.forEach((p, i) => { p.hidden = i !== step; });
    nodes.forEach((n, i) => {
      n.classList.toggle('is-current', i === step);
      n.classList.toggle('is-done', i < step);
    });
    // Each rail segment sits between two nodes; fill the ones already passed.
    bars.forEach((b, i) => { b.style.width = i < step ? '100%' : '0'; });
    if (window.lucide) lucide.createIcons();
  }

  // Step 1 — service tiles
  sim.querySelectorAll('[data-sim-service]').forEach(tile => {
    tile.addEventListener('click', () => {
      const key = tile.dataset.simService;
      state.service = key;
      sim.querySelectorAll('[data-sim-service]').forEach(t => {
        t.setAttribute('aria-pressed', String(t === tile));
      });

      const svc = SERVICES[key];
      numberLabel.textContent = svc.field;
      numberInput.placeholder = 'Enter your ' + svc.field.toLowerCase();
      numberInput.value = '';
      numberInput.classList.remove('is-invalid', 'is-valid');
      numberHint.textContent = svc.hint;
      feedback.textContent = '';
      operatorSelect.innerHTML = svc.operators
        .map(o => '<option value="' + o + '">' + o + '</option>')
        .join('');

      show(1);
      numberInput.focus();
    });
  });

  // Step 2 — identifier + operator
  sim.querySelector('[data-sim-continue]').addEventListener('click', () => {
    const svc = SERVICES[state.service];
    const result = svc.validate(numberInput.value.trim());

    if (result !== true) {
      numberInput.classList.add('is-invalid');
      numberInput.classList.remove('is-valid');
      feedback.textContent = result;
      numberInput.focus();
      return;
    }

    numberInput.classList.remove('is-invalid');
    numberInput.classList.add('is-valid');
    feedback.textContent = '';
    state.number = numberInput.value.trim();
    state.operator = operatorSelect.value;
    state.plan = null;

    planRows.innerHTML = svc.plans.map((p, i) => (
      '<button type="button" class="plan-row" data-sim-plan="' + i + '" aria-pressed="false">' +
        '<span>' + p.name + '<span class="detail">' + p.detail + '</span></span>' +
        '<span class="amount">' + inr.format(p.amount) + '</span>' +
      '</button>'
    )).join('');

    show(2);
  });

  // Step 3 — plan choice (delegated, since rows are rebuilt each time)
  planRows.addEventListener('click', (e) => {
    const row = e.target.closest('[data-sim-plan]');
    if (!row) return;
    state.plan = SERVICES[state.service].plans[parseInt(row.dataset.simPlan, 10)];
    planRows.querySelectorAll('[data-sim-plan]').forEach(r => {
      r.setAttribute('aria-pressed', String(r === row));
    });
    sim.querySelector('[data-sim-pay]').disabled = false;
    sim.querySelector('[data-sim-pay]').textContent = 'Pay ' + inr.format(state.plan.amount);
  });

  // Confirm — render the receipt
  sim.querySelector('[data-sim-pay]').addEventListener('click', () => {
    if (!state.plan) return;
    const svc = SERVICES[state.service];
    const masked = state.number.length > 4
      ? state.number.slice(0, -4).replace(/./g, '•') + state.number.slice(-4)
      : state.number;

    sim.querySelector('[data-receipt-service]').textContent = svc.label;
    sim.querySelector('[data-receipt-operator]').textContent = state.operator;
    sim.querySelector('[data-receipt-number]').textContent = masked;
    sim.querySelector('[data-receipt-plan]').textContent = state.plan.name;
    sim.querySelector('[data-receipt-amount]').textContent = inr.format(state.plan.amount);
    sim.querySelector('[data-receipt-ref]').textContent =
      'ZP' + Math.random().toString(36).slice(2, 10).toUpperCase();
    sim.querySelector('[data-receipt-time]').textContent =
      new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    show(3);
  });

  // Back / restart
  sim.querySelectorAll('[data-sim-back]').forEach(btn => {
    btn.addEventListener('click', () => show(state.step - 1));
  });

  sim.querySelector('[data-sim-restart]').addEventListener('click', () => {
    state.service = null;
    state.plan = null;
    sim.querySelectorAll('[data-sim-service]').forEach(t => t.setAttribute('aria-pressed', 'false'));
    sim.querySelector('[data-sim-pay]').disabled = true;
    sim.querySelector('[data-sim-pay]').textContent = 'Confirm payment';
    show(0);
  });

  show(0);
}

// --- Corporate / bulk recharge estimator ---
function initBulkCalculator() {
  const calc = document.querySelector('[data-bulk-calc]');
  if (!calc) return;

  // Volume slabs, cheapest tier last so find() returns the highest match.
  const TIERS = [
    { min: 500, rate: 0.12 },
    { min: 200, rate: 0.09 },
    { min: 50, rate: 0.06 },
    { min: 10, rate: 0.03 },
    { min: 0, rate: 0 }
  ];

  const countInput = calc.querySelector('[data-bulk-count]');
  const planSelect = calc.querySelector('[data-bulk-plan]');
  const cycleBtns = Array.from(calc.querySelectorAll('[data-cycles]'));
  const tiers = Array.from(calc.querySelectorAll('[data-tier-min]'));

  const out = {
    count: calc.querySelector('[data-out-count]'),
    total: calc.querySelector('[data-out-total]'),
    note: calc.querySelector('[data-out-note]'),
    list: calc.querySelector('[data-out-list]'),
    rate: calc.querySelector('[data-out-rate]'),
    save: calc.querySelector('[data-out-save]'),
    each: calc.querySelector('[data-out-each]')
  };

  const inr = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  });

  function render() {
    const count = parseInt(countInput.value, 10);
    const plan = parseInt(planSelect.value, 10);
    const activeCycle = cycleBtns.find(b => b.getAttribute('aria-pressed') === 'true') || cycleBtns[0];
    const cycles = parseInt(activeCycle.dataset.cycles, 10);
    const label = activeCycle.dataset.label || 'cycle';

    const list = count * plan * cycles;
    const tier = TIERS.find(t => count >= t.min);
    const discount = list * tier.rate;
    const payable = list - discount;

    // Keep the slider's filled portion in sync with its value.
    const pct = ((count - countInput.min) / (countInput.max - countInput.min)) * 100;
    countInput.style.setProperty('--range-fill', pct + '%');

    out.count.textContent = count;
    out.total.textContent = inr.format(payable);
    out.note.textContent = `${label} for ${count} connections`;
    out.list.textContent = inr.format(list);
    out.rate.textContent = Math.round(tier.rate * 100) + '%';
    out.save.textContent = '− ' + inr.format(discount);
    out.each.textContent = inr.format(payable / count);

    tiers.forEach(el => {
      el.classList.toggle('is-active', parseInt(el.dataset.tierMin, 10) === tier.min);
    });
  }

  countInput.addEventListener('input', render);
  planSelect.addEventListener('change', render);
  cycleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cycleBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      render();
    });
  });

  render();
}

// --- Current year in footers ---
function initYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = year; });
}

// --- Password Reveal Toggles (auth pages) ---
function initPasswordToggles() {
  document.querySelectorAll('[data-pw-toggle]').forEach(btn => {
    const input = document.getElementById(btn.dataset.pwToggle);
    if (!input) return;

    btn.addEventListener('click', () => {
      const revealed = input.type === 'text';
      input.type = revealed ? 'password' : 'text';
      btn.setAttribute('aria-pressed', String(!revealed));
      btn.setAttribute('aria-label', revealed ? 'Show password' : 'Hide password');

      // Rebuild the glyph from scratch so no attributes carry over between states.
      btn.innerHTML = '<i data-lucide="' + (revealed ? 'eye' : 'eye-off') + '"></i>';
      if (window.lucide) lucide.createIcons();
    });
  });
}

// --- Form Validation ---
function initFormValidation() {
  const forms = document.querySelectorAll('.validate-form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      const inputs = form.querySelectorAll('.form-control[required], input[type="checkbox"][required]');

      inputs.forEach(input => {
        // Reset classes
        input.classList.remove('is-invalid', 'is-valid');

        // Simple validation
        if (input.type === 'checkbox') {
          if (!input.checked) {
            input.classList.add('is-invalid');
            isValid = false;
          } else {
            input.classList.add('is-valid');
          }
        } else if (!input.value.trim()) {
          input.classList.add('is-invalid');
          isValid = false;
        } else if (input.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value)) {
            input.classList.add('is-invalid');
            isValid = false;
          } else {
            input.classList.add('is-valid');
          }
        } else if (input.type === 'tel') {
          // Allows flexibility but enforces numbers
          if (input.value.replace(/\D/g, '').length < 7) {
            input.classList.add('is-invalid');
            isValid = false;
          } else {
            input.classList.add('is-valid');
          }
        } else if (input.dataset.match) {
          // Confirm-password style fields must equal the field they point at.
          const source = form.querySelector('#' + input.dataset.match);
          if (source && source.value !== input.value) {
            input.classList.add('is-invalid');
            isValid = false;
          } else {
            input.classList.add('is-valid');
          }
        } else {
          input.classList.add('is-valid');
        }
      });

      if (isValid) {
        // Show success message, hide form inputs (simulated submission)
        const successMsg = form.querySelector('.form-success-msg');
        const formInner = form.querySelector('.form-inner');

        if (successMsg) successMsg.style.display = 'block';
        if (formInner) formInner.style.display = 'none';

        // Normally, you would submit to Formspree here.
        // Uncomment to allow actual submission if action is set:
        // form.submit();
      }
    });
  });
}
