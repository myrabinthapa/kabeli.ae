// Kabeli — the only client-side JS on the site.
// 1. Mobile navigation drawer (accessible, no library)
// 2. Header "scrolled" state for browsers without CSS scroll-timelines
// 3. Subtle hero parallax (pointer only; skipped under reduced motion)

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---------------------------------------------------------------- 1. menu
const btn = document.getElementById('menu-btn') as HTMLButtonElement | null;
const nav = document.getElementById('mobile-nav') as HTMLElement | null;

if (btn && nav) {
  const focusables = () =>
    Array.from(nav.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));

  const setOpen = (open: boolean, returnFocus = true) => {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      focusables()[0]?.focus();
    } else if (returnFocus) {
      btn.focus();
    }
  };

  btn.addEventListener('click', () => setOpen(nav.hidden));

  nav.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false, false);
  });

  document.addEventListener('keydown', (e) => {
    if (nav.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === 'Tab') {
      // keep focus inside the drawer (button + links)
      const items = [btn, ...focusables()];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // close if the viewport grows past the mobile breakpoint
  const mq = window.matchMedia('(min-width: 769px)');
  mq.addEventListener('change', (e) => {
    if (e.matches && !nav.hidden) setOpen(false, false);
  });
}

// -------------------------------------------------------------- 2. header
const header = document.querySelector<HTMLElement>('.hdr');
if (header && !CSS.supports('animation-timeline: scroll()')) {
  const update = () => header.classList.toggle('scrolled', window.scrollY > 24);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// ------------------------------------------------------------ 3. parallax
const visual = document.getElementById('hero-visual');
if (visual && !reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
  const layers = Array.from(visual.querySelectorAll<HTMLElement>('[data-depth]'));
  let raf = 0;
  let mx = 0;
  let my = 0;

  const paint = () => {
    raf = 0;
    for (const layer of layers) {
      const k = Number(layer.dataset.depth || 0);
      layer.style.transform = `translate(${(-mx * k).toFixed(1)}px, ${(-my * k).toFixed(1)}px)`;
    }
  };

  visual.addEventListener('pointermove', (e) => {
    const r = visual.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5;
    my = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(paint);
  });

  visual.addEventListener('pointerleave', () => {
    mx = 0;
    my = 0;
    if (!raf) raf = requestAnimationFrame(paint);
  });
}
