/**
 * Button feel (phase 3):
 * - a click ripple on primary buttons (.btn-primary), from the point pressed
 * - a slight magnetic pull towards the pointer on [data-magnetic] buttons
 *   (the two hero CTAs only)
 * The pressed state (scale 0.97) is plain CSS in the btn utility.
 * Nothing here runs for reduced motion; the magnet needs a fine, hovering pointer.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

// Delegated, so it keeps working after ClientRouter page swaps.
document.addEventListener('pointerdown', (event) => {
  if (reduced.matches || event.button !== 0) return;
  const button = (event.target as Element | null)?.closest<HTMLElement>('.btn-primary');
  if (!button || button.matches(':disabled')) return;

  const box = button.getBoundingClientRect();
  // Big enough to cover the far corner from the press point.
  const size =
    2 * Math.hypot(Math.max(event.clientX - box.left, box.right - event.clientX), box.height);
  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  ripple.setAttribute('aria-hidden', 'true');
  Object.assign(ripple.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${event.clientX - box.left}px`,
    top: `${event.clientY - box.top}px`,
  });
  button.append(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
});

/** Up to MAX px towards the pointer, easing back on leave (the transition is in the btn utility). */
const MAX = 6;
function initMagnets() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      if (reduced.matches || !finePointer.matches) return;
      const box = el.getBoundingClientRect();
      const dx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
      const dy = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
      el.style.translate = `${(dx * MAX).toFixed(1)}px ${(dy * MAX * 0.6).toFixed(1)}px`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.translate = '';
    });
  });
}
document.addEventListener('astro:page-load', initMagnets);
