/** Clear Radix modal scroll-lock leftovers that can block clicks after dialogs/menus close. */
export function resetModalLock(): void {
  if (typeof document === 'undefined') return;

  document.body.style.removeProperty('pointer-events');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('padding-right');
  document.body.removeAttribute('data-scroll-locked');

  // Remove orphaned full-screen overlays left behind after Next.js route changes.
  const openDialogs = document.querySelectorAll('[role="dialog"][data-state="open"]');
  if (openDialogs.length > 0) return;

  document.querySelectorAll('[data-state="closed"]').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.classList.contains('fixed') && node.classList.contains('inset-0')) {
      node.remove();
    }
  });
}
