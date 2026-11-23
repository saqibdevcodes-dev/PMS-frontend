import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SearchSelect } from '../../src/components/SearchSelect';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('keeps an area unit menu inside the modal when its trigger is near the right edge', () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.classList.contains('modal'))
      return { left: 100, right: 850, top: 100, bottom: 750, width: 750, height: 650 } as DOMRect;
    if (this.getAttribute('role') === 'combobox')
      return { left: 700, right: 828, top: 300, bottom: 342, width: 128, height: 42 } as DOMRect;
    return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 } as DOMRect;
  });
  render(
    <div className="modal">
      <SearchSelect
        value=""
        onChange={() => {}}
        options={[{ value: 'marla', label: 'Marla' }]}
        search=""
        onSearch={() => {}}
        ariaLabel="Area unit"
      />
    </div>,
  );
  fireEvent.click(screen.getByRole('combobox', { name: 'Area unit' }));
  const popover = document.querySelector<HTMLElement>('.select-popover')!;
  expect(
    100 + parseFloat(popover.style.left) + parseFloat(popover.style.width),
  ).toBeLessThanOrEqual(838);
  expect(parseFloat(popover.style.left)).toBeGreaterThanOrEqual(12);
});
