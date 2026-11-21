import Link from "next/link";

export function Mark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="4" y="27" width="13" height="13" rx="3" transform="rotate(-45 10.5 33.5)" fill="#a63dff" />
      <rect x="15.5" y="15.5" width="15" height="15" rx="3.5" transform="rotate(-45 23 23)" fill="#1fb0ff" />
      <rect x="27" y="4" width="17" height="17" rx="4" transform="rotate(-45 35.5 12.5)" fill="#5b4dff" />
      <rect x="31" y="31" width="8" height="8" rx="2" transform="rotate(-45 35 35)" fill="#ff3d77" />
    </svg>
  );
}

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-2 text-[23px] font-bold tracking-[-0.03em] ${light ? "text-white" : "text-ink"}`}>
      <Mark />
      <span>
        postulia<span className="text-brand">.</span>
      </span>
    </Link>
  );
}
