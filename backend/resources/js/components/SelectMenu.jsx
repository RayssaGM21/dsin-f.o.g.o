import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

/* A single-choice listbox. The trigger keeps focus while arrows move the active option. */
export default function SelectMenu({ label, value, options, onChange, className = '', required = false }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const labelId = useId();
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));

  useEffect(() => {
    if (!open) return;
    const closeOutside = event => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = rootRef.current?.querySelector('.select-trigger');
    const scrollArea = rootRef.current?.closest('.dialog-content');
    const rect = trigger?.getBoundingClientRect();
    if (!rect) return;
    const visibleBottom = scrollArea ? scrollArea.getBoundingClientRect().bottom : window.innerHeight;
    const visibleTop = scrollArea ? scrollArea.getBoundingClientRect().top : 0;
    const menuHeight = Math.min(options.length * 38 + 10, 210);
    setDropUp(visibleBottom - rect.bottom < menuHeight && rect.top - visibleTop > visibleBottom - rect.bottom);
  }, [open, options.length]);

  function toggle() {
    setActiveIndex(selectedIndex);
    setOpen(previous => !previous);
  }

  function choose(index) {
    onChange(options[index].value);
    setOpen(false);
    rootRef.current?.querySelector('.select-trigger')?.focus();
  }

  function onKeyDown(event) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      if (!open) { setActiveIndex(selectedIndex); setOpen(true); return; }
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 :
        (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      setActiveIndex(next);
      rootRef.current?.querySelectorAll('[role="option"]')[next]?.scrollIntoView({ block: 'nearest' });
    }
    if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      choose(activeIndex);
    }
  }

  return <div ref={rootRef} className={`select-menu ${className} ${open ? 'is-open' : ''} ${dropUp ? 'drop-up' : ''}`} onKeyDown={onKeyDown}>
    {label && <span className="select-label" id={labelId}>{label}</span>}
    <button type="button" className="select-trigger" role="combobox" aria-label={label || undefined} aria-labelledby={label ? labelId : undefined} aria-required={required} aria-haspopup="listbox" aria-controls={listId} aria-expanded={open} aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined} onClick={toggle}>
      <span>{options[selectedIndex]?.label || label}</span><Icon name="chevron" size={16} />
    </button>
    {open && <ul id={listId} className="select-options" role="listbox" aria-label={label || 'Opções'}>{options.map((option, index) => <li key={option.value} id={`${listId}-${index}`} role="option" aria-selected={value === option.value} className={`select-option ${activeIndex === index ? 'is-active' : ''}`} onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}><span>{option.label}</span>{value === option.value && <Icon name="check" size={16} />}</li>)}</ul>}
  </div>;
}
