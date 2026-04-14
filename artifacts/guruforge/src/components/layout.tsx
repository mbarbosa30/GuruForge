import { Link, useLocation } from "wouter";
import { Show, UserButton } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const linkClass = (path: string) => {
    const active = location === path;
    return `text-[11px] font-medium tracking-[0.06em] uppercase no-underline pb-0.5 transition-colors ${
      active
        ? "text-[#111] border-b border-[#111]"
        : "text-[#777] border-b border-transparent hover:text-[#444] hover:border-[#bbb]"
    }`;
  };

  return (
    <div className="min-h-[100dvh] bg-white text-[#111] font-sans text-[15px] leading-relaxed selection:bg-neutral-200 flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-[#e0e0e0]">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.08em] uppercase text-[#111] no-underline"
            data-testid="link-logo"
          >
            GuruForge
          </Link>
          <nav className="hidden sm:flex items-center gap-5">
            <Link href="/marketplace" className={linkClass("/marketplace")} data-testid="link-marketplace">
              Marketplace
            </Link>
            <Show when="signed-in">
              <Link href="/create" className={linkClass("/create")} data-testid="link-create">
                Create a Guru
              </Link>
              <Link href="/dashboard" className={linkClass("/dashboard")} data-testid="link-dashboard">
                Dashboard
              </Link>
            </Show>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#777] no-underline border-b border-[#bbb] pb-0.5 hover:text-[#444] hover:border-[#888] transition-colors"
              data-testid="link-sign-in"
            >
              Sign in
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7",
                },
              }}
            />
          </Show>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="px-6 md:px-10 py-6 border-t border-[#e0e0e0] flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="text-[11px] text-[#999] tracking-[0.02em]">
          Built on the 3-tier intelligence system from selfclaw.ai & teli.gent
        </span>
        <span className="text-[11px] text-[#aaa]">guruforge.ai</span>
      </footer>
    </div>
  );
}
