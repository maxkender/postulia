const paths: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.2-4.2" /></>,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17" /></>,
  doc: <><path d="M7 3.5h7l4 4V20.5H7z" /><path d="M14 3.5v4h4M10 12h5M10 16h5" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="M4 7.5l8 6 8-6" /></>,
  mic: <><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3" /></>,
  calc: <><rect x="5.5" y="3.5" width="13" height="17" rx="2.5" /><path d="M9 8h6M9 12.5h.01M12 12.5h.01M15 12.5h.01M9 16h.01M12 16h.01M15 16h.01" /></>,
  bolt: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
  chat: <path d="M4.5 6.5a2.5 2.5 0 012.5-2.5h10a2.5 2.5 0 012.5 2.5v7a2.5 2.5 0 01-2.5 2.5H11l-4.5 4v-4a2.5 2.5 0 01-2-2.5z" />,
  badge: <><rect x="4.5" y="4.5" width="15" height="15" rx="3" /><path d="M8.5 11v5M8.5 8v.01M12 16v-3a2 2 0 014 0v3M12 11v5" /></>,
  send: <path d="M20 4L3.5 10.5l6.5 3 3 6.5zM10 13.5L20 4" />,
  users: <><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19c.6-3 2.7-4.5 5.5-4.500s4.9 1.5 5.5 4.500M15.5 5.800a3 3 0 010 5.400M17.5 14.800c1.7.600 2.7 2 3 4.2" /></>,
  link: <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.700l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.700l1-1" />,
  board: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9.5 4.5v15M15 4.5v9" /></>,
};

export function ToolIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[name] ?? paths.spark}
    </svg>
  );
}
