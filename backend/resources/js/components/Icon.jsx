const paths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  list: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/></>,
  activity: <path d="M3 12h4l3-7 4 14 3-7h4"/>,
  refresh: <path d="M20 11a8 8 0 0 0-14-5L4 8M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2m0 4v-4h-4"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
  close: <path d="M5 5l14 14M19 5 5 19"/>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  alert: <><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5m0 3h.01"/></>,
  tool: <path d="M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 0-5-5"/>,
  check: <path d="m4 12 5 5L20 6"/>,
  chevron: <path d="m6 9 6 6 6-6"/>,
  chevronLeft: <path d="m15 6-6 6 6 6"/>,
  chevronRight: <path d="m9 6 6 6-6 6"/>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></>,
};

export default function Icon({ name, size = 18, className = '' }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
