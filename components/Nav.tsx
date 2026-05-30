"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  // All pages include nav inside the hero layout
  if (pathname === "/" || pathname === "/about") return null;

  return (
    <header className="px-8 lg:px-16 pt-8">
      <nav className="flex flex-col gap-0.5">
        {links.map(({ href, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-xs leading-relaxed transition-colors ${
                active ? "text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
