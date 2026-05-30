"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { shouldShowCoding } from "@/lib/degreeProfile";
import { PageFade } from "@/components/PageFade";

const NAV: { label: string; href: string }[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Practice", href: "/practice" },
  { label: "Report", href: "/analytics" },
  { label: "Learn", href: "/learn" },
  { label: "Quiz", href: "/quiz" },
];

function buildNav(degree: string | null, preparingFor: string | null) {
  const items = [...NAV];
  if (shouldShowCoding(degree, preparingFor)) {
    items.splice(4, 0, { label: "Coding", href: "/coding" });
  }
  return items;
}

export function AppShell({
  children,
  title,
  subtitle,
  wide,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  wide?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { degree, preparingFor, email, logout } = useUser();
  const nav = buildNav(degree, preparingFor);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 border-r border-zinc-800/60 flex-col shrink-0 bg-zinc-950/40">
        <div className="px-4 py-5 border-b border-zinc-800/60">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            Employ<span className="text-cyan-400">.</span>AI
          </Link>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-zinc-800/60 space-y-2 text-xs">
          {email && (
            <p className="text-zinc-400 truncate" title={email}>
              {email}
            </p>
          )}
          {degree && preparingFor && (
            <p className="text-zinc-600 truncate">
              {preparingFor} · {degree}
            </p>
          )}
          <Link href="/settings" className="block text-zinc-500 hover:text-zinc-300 py-1">
            Settings
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="block text-zinc-500 hover:text-zinc-300 py-1"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {(title || subtitle) && (
          <header className="border-b border-zinc-800/60 px-5 md:px-8 py-5 md:py-6">
            {title && (
              <h1 className="text-lg md:text-xl font-medium text-zinc-100 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
            )}
          </header>
        )}
        <div
          className={`flex-1 px-5 md:px-8 py-6 md:py-8 ${wide ? "" : "page-wrap"}`}
        >
          <PageFade key={pathname}>{children}</PageFade>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
        <div className="flex overflow-x-auto scrollbar-none py-2.5 px-1 gap-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors duration-150 ${
                isActive(item.href) ? "text-cyan-400 bg-cyan-500/10" : "text-zinc-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
