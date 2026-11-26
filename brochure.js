(() => {
  const trigger = document.querySelector('.brochure-trigger');
  const dialog = document.getElementById(trigger.getAttribute('aria-controls'));
  const book = dialog.querySelector('.brochure-book');
  const leaves = [...book.querySelectorAll('.brochure-leaf')];
  const pages = [...book.querySelectorAll('img')];
  const scroll = dialog.querySelector('.brochure-scroll');
  const mat = dialog.querySelector('.brochure-mat');
  const prev = dialog.querySelector('.brochure-prev');
  const next = dialog.querySelector('.brochure-next');
  const zoomOut = dialog.querySelector('[data-zoom="-1"]');
  const zoomReset = dialog.querySelector('[data-zoom="0"]');
  const zoomIn = dialog.querySelector('[data-zoom="1"]');
  const status = dialog.querySelector('.brochure-status');
  const closeButton = dialog.querySelector('.brochure-close');
  const background = document.querySelector('.ortho-shell, .exo-shell');
  const pageRoot = document.documentElement;
  const nativeDialog = typeof dialog.showModal === 'function' && typeof dialog.close === 'function';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const zoomLevels = [0.75, 1, 1.5, 2, 3];
  const labels = ['Page 1 of 4', 'Pages 2–3 of 4', 'Page 4 of 4'];
  const visiblePages = [[1], [2, 3], [4]];
  let spread = 0;
  let zoom = 1;
  let turning = false;

  function updateNavigation() {
    prev.disabled = spread === 0;
    next.disabled = spread === leaves.length;
    status.textContent = labels[spread];
    for (const page of pages) {
      page.setAttribute('aria-hidden', String(!visiblePages[spread].includes(Number(page.dataset.page))));
    }
  }

  async function turn(direction) {
    const target = spread + direction;
    if (turning || target < 0 || target > leaves.length) return;
    turning = true;
    const leaf = leaves[Math.min(spread, target)];
    leaf.classList.add('is-turning');
    leaf.classList.toggle('is-turned', direction === 1);
    spread = target;
    book.dataset.spread = spread;
    updateNavigation();
    if (!reduceMotion.matches && typeof leaf.getAnimations === 'function') {
      await Promise.allSettled(leaf.getAnimations().map(animation => animation.finished));
    }
    leaf.classList.remove('is-turning');
    turning = false;
  }

  function setZoom(index) {
    zoom = Math.max(0, Math.min(zoomLevels.length - 1, index));
    mat.style.setProperty('--zoom', zoomLevels[zoom]);
    zoomReset.textContent = Math.round(zoomLevels[zoom] * 100) + '%';
    zoomOut.disabled = zoom === 0;
    zoomIn.disabled = zoom === zoomLevels.length - 1;
    scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) / 2;
    scroll.scrollTop = 0;
  }

  function afterClose() {
    pageRoot.classList.remove('brochure-open');
    if (!nativeDialog) {
      background?.removeAttribute('inert');
      background?.removeAttribute('aria-hidden');
    }
    trigger.focus();
  }

  trigger.addEventListener('click', () => {
    if (dialog.hasAttribute('open')) return;
    for (const page of pages) {
      if (!page.hasAttribute('src')) {
        page.src = `${dialog.dataset.pageDirectory}/page-${page.dataset.page}.jpg`;
      }
    }
    spread = 0;
    book.dataset.spread = '0';
    for (const leaf of leaves) {
      leaf.classList.remove('is-turned', 'is-turning');
    }
    updateNavigation();
    if (nativeDialog) {
      dialog.showModal();
    } else {
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('open', '');
      closeButton.focus();
      background?.setAttribute('inert', '');
      background?.setAttribute('aria-hidden', 'true');
    }
    pageRoot.classList.add('brochure-open');
    setZoom(1);
  });
  closeButton.addEventListener('click', () => {
    if (nativeDialog) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      afterClose();
    }
  });
  dialog.addEventListener('close', afterClose);
  prev.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));
  zoomOut.addEventListener('click', () => setZoom(zoom - 1));
  zoomReset.addEventListener('click', () => setZoom(1));
  zoomIn.addEventListener('click', () => setZoom(zoom + 1));
  dialog.addEventListener('keydown', event => {
    if (!nativeDialog && event.key === 'Escape') {
      event.preventDefault();
      closeButton.click();
      return;
    }
    if (!nativeDialog && event.key === 'Tab') {
      const focusable = dialog.querySelectorAll('button:not(:disabled), [tabindex="0"]');
      const start = focusable[0];
      const end = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === start) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && document.activeElement === end) {
        event.preventDefault();
        start.focus();
      }
      return;
    }
    if (event.target === scroll && zoomLevels[zoom] > 1) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    turn(event.key === 'ArrowRight' ? 1 : -1);
  });
})();
