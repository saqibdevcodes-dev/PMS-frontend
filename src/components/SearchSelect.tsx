import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { t, useLocale } from '../lib/i18n';

export type Option = { value: string; label: string; sublabel?: string; group?: string };
export function SearchSelect({
  id,
  value,
  options,
  onChange,
  search,
  onSearch,
  disabled,
  loading,
  error,
  onRetry,
  footer,
  placeholder = 'Select a record',
  searchLabel = 'Search records',
  selectedLabel,
  ariaLabel,
  invalid,
  describedBy,
  onBlur,
  ref: forwardedRef,
  className,
  triggerClassName,
  triggerContent,
  clearable = true,
}: {
  id?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  search: string;
  onSearch: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  footer?: ReactNode;
  placeholder?: string;
  searchLabel?: string;
  selectedLabel?: string;
  ariaLabel?: string;
  invalid?: boolean;
  describedBy?: string;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  triggerClassName?: string;
  triggerContent?: ReactNode;
  clearable?: boolean;
}) {
  useLocale();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState({
    up: false,
    height: 320,
    left: 0,
    top: 0,
    width: 200,
    inModal: false,
  });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  useImperativeHandle(forwardedRef, () => trigger.current!, []);
  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  function choose(option: Option) {
    onChange(option.value);
    close();
  }
  useEffect(() => {
    if (!open) return;
    input.current?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => {
      if (
        !root.current?.contains(event.target as Node) &&
        !popup.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  useLayoutEffect(() => {
    if (!open || !trigger.current) return;
    function position() {
      if (!trigger.current) return;
      const rect = trigger.current.getBoundingClientRect();
      const modalElement = trigger.current.closest<HTMLElement>('.modal');
      const modal = modalElement?.getBoundingClientRect();
      const below = Math.min(innerHeight, modal?.bottom ?? innerHeight) - rect.bottom - 12;
      const above = rect.top - Math.max(0, modal?.top ?? 0) - 12;
      const up = below < 230 && above > below;
      const width = Math.min(
        Math.max(180, rect.width),
        innerWidth - 24,
        modal ? modal.width - 24 : Infinity,
      );
      const rtl = document.documentElement.dir === 'rtl';
      const left = Math.max(
        12,
        Math.min(rtl ? rect.right - width : rect.left, innerWidth - width - 12),
      );
      setPlacement({
        up,
        width,
        height: Math.max(100, Math.min(320, up ? above : below)),
        left:
          left -
          (modal?.left ?? 0) +
          (modalElement?.scrollLeft ?? 0) -
          (modalElement?.clientLeft ?? 0),
        top:
          (up ? rect.top - 6 : rect.bottom + 6) -
          (modal?.top ?? 0) +
          (modalElement?.scrollTop ?? 0) -
          (modalElement?.clientTop ?? 0),
        inModal: Boolean(modalElement),
      });
    }
    position();
    const scroll = (event: Event) => {
      if (!popup.current?.contains(event.target as Node)) position();
    };
    window.addEventListener('resize', position);
    document.addEventListener('scroll', scroll, true);
    return () => {
      window.removeEventListener('resize', position);
      document.removeEventListener('scroll', scroll, true);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const option = document.getElementById(`${listId}-${active}`);
    const list = option?.closest<HTMLElement>('.select-options');
    if (!option || !list) return;
    // Scroll the options only; scrolling ancestors would move the form away from its field.
    const itemBounds = option.getBoundingClientRect(),
      listBounds = list.getBoundingClientRect();
    if (itemBounds.top < listBounds.top) list.scrollTop += itemBounds.top - listBounds.top;
    else if (itemBounds.bottom > listBounds.bottom)
      list.scrollTop += itemBounds.bottom - listBounds.bottom;
  }, [active, open, listId]);
  return (
    <div
      className={'search-select' + (className ? ' ' + className : '')}
      ref={root}
      onBlur={(event) => {
        if (
          !root.current?.contains(event.relatedTarget) &&
          !popup.current?.contains(event.relatedTarget)
        )
          onBlur?.();
      }}
    >
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        className={triggerClassName ?? 'select-trigger'}
        aria-label={ariaLabel}
        title={ariaLabel}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => {
          onSearch('');
          setActive(0);
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            onSearch('');
            setActive(0);
            setOpen(true);
          }
        }}
      >
        {triggerContent ?? (
          <span className={!value ? 'muted' : undefined}>
            {selected?.label ?? selectedLabel ?? t(placeholder)}
          </span>
        )}
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <div
            ref={popup}
            className="select-popover"
            data-placement={placement.up ? 'top' : 'bottom'}
            style={{
              position: placement.inModal ? 'absolute' : 'fixed',
              maxHeight: placement.height,
              left: placement.left,
              top: placement.top,
              width: placement.width,
              transform: placement.up ? 'translateY(-100%)' : undefined,
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                close();
              }
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((index) =>
                  Math.max(
                    0,
                    Math.min(options.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)),
                  ),
                );
              }
              if (event.key === 'Enter' && event.target === input.current) {
                event.preventDefault();
                if (!loading && !error && options[active]) choose(options[active]);
              }
              if (event.key === 'Tab') {
                setOpen(false);
                trigger.current?.focus({ preventScroll: true });
              }
            }}
          >
            <div className="select-search">
              <Search size={15} aria-hidden="true" />
              <input
                ref={input}
                type="search"
                role="combobox"
                aria-label={t(searchLabel)}
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={options[active] ? `${listId}-${active}` : undefined}
                value={search}
                placeholder={t(searchLabel)}
                autoComplete="off"
                onChange={(event) => {
                  onSearch(event.target.value);
                  setActive(0);
                }}
              />
            </div>
            <div className="select-options" id={listId} role="listbox" aria-busy={loading}>
              {loading ? (
                <p role="status">{t('Loading…')}</p>
              ) : error ? (
                <div className="select-message" role="alert">
                  <p>{t('Could not load records. Retry your search.')}</p>
                  <button type="button" onClick={onRetry}>
                    {t('Retry')}
                  </button>
                </div>
              ) : options.length ? (
                options.map((option, index) => (
                  <Fragment key={option.value}>
                    {option.group && option.group !== options[index - 1]?.group && (
                      <p className="select-group" role="presentation">
                        {option.group}
                      </p>
                    )}
                    <button
                      id={`${listId}-${index}`}
                      type="button"
                      role="option"
                      data-value={option.value}
                      aria-selected={option.value === value}
                      data-active={index === active}
                      onMouseMove={() => setActive(index)}
                      onClick={() => choose(option)}
                    >
                      <div className="select-option-content">
                        <span className="select-option-label">{option.label}</span>
                        {option.sublabel && (
                          <small className="select-option-sublabel">{option.sublabel}</small>
                        )}
                      </div>
                      {option.value === value && <Check size={15} style={{ flexShrink: 0, marginLeft: 8 }} />}
                    </button>
                  </Fragment>
                ))
              ) : (
                <p role="status">{t('No matching records')}</p>
              )}
            </div>
            <div className="select-footer">
              {clearable && value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    close();
                  }}
                >
                  {t('Clear selection')}
                </button>
              )}
              {footer}
            </div>
          </div>,
          trigger.current?.closest('.modal') ?? document.body,
        )}
    </div>
  );
}
