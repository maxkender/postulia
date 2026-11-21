import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-display text-xl font-semibold">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-base text-white">P</span>
      Postulia
    </Link>
  );
}
