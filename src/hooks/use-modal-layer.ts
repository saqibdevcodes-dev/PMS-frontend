import { useCallback, useRef } from 'react';

type Layer = { element: HTMLDivElement; depth: number; order: number };
const layers: Layer[] = [];
let nextOrder = 0;

// Dialogs can be React siblings (including the global discard prompt). Track the
// mounted portal layers instead of relying on component ancestry.
export function useModalLayer() {
  const overlay = useRef<HTMLDivElement | null>(null);
  const layer = useRef<Layer | undefined>(undefined);
  const cleanup = useRef<(() => void) | undefined>(undefined);
  const opener = useRef<HTMLElement | null>(null);
  const order = useRef(0);

  const overlayRef = useCallback((element: HTMLDivElement | null) => {
    overlay.current = element;
    if (element && layer.current) {
      element.style.setProperty('--modal-layer', String(layer.current.depth));
      element.dataset.nested = String(layer.current.depth > 0);
    }
  }, []);

  const contentRef = useCallback((element: HTMLDivElement | null) => {
    cleanup.current?.();
    cleanup.current = undefined;
    layer.current = undefined;
    if (!element) return;

    // Ignore dialogs already closing, e.g. Create menu -> Add customer.
    const parent = [...layers]
      .reverse()
      .find((item) => item.element.isConnected && item.element.dataset.state === 'open');
    const entry = { element, depth: parent ? parent.depth + 1 : 0, order: ++nextOrder };
    layer.current = entry;
    order.current = entry.order;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    layers.push(entry);
    element.dataset.modalDepth = String(entry.depth);
    element.style.setProperty('--modal-layer', String(entry.depth));
    overlay.current?.style.setProperty('--modal-layer', String(entry.depth));
    if (overlay.current) overlay.current.dataset.nested = String(entry.depth > 0);

    let observer: ResizeObserver | undefined;
    if (parent) {
      const resize = () => {
        // offsetWidth excludes the opening animation's transform.
        element.style.setProperty('--modal-parent-width', `${parent.element.offsetWidth}px`);
      };
      resize();
      observer = new ResizeObserver(resize);
      observer.observe(parent.element);
    }
    cleanup.current = () => {
      observer?.disconnect();
      const index = layers.indexOf(entry);
      if (index !== -1) layers.splice(index, 1);
    };
  }, []);

  const onCloseAutoFocus = useCallback((event: Event) => {
    // A replacement dialog may already be open. Do not steal its focus.
    if (
      layers.some((item) => item.order > order.current && item.element.dataset.state === 'open')
    ) {
      event.preventDefault();
      return;
    }
    const target = opener.current;
    if (
      target?.isConnected &&
      target !== document.body &&
      !target.closest('[data-state="closed"]')
    ) {
      event.preventDefault();
      target.focus({ preventScroll: true });
    }
  }, []);

  return { overlayRef, contentRef, onCloseAutoFocus };
}
