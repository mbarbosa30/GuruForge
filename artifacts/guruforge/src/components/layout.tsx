import { Link, useLocation } from "wouter";
import { usePrivy } from "@privy-io/react-auth";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { authenticated, login, logout, user } = usePrivy();

  const linkClass = (path: string) => {
    const active = location === path;
    return `text-[11px] font-medium tracking-[0.06em] uppercase no-underline pb-0.5 transition-colors ${
      active
        ? "text-[#111] border-b border-[#111]"
        : "text-[#777] border-b border-transparent hover:text-[#444] hover:border-[#bbb]"
    }`;
  };

  const displayName = user?.google?.name || user?.apple?.name || user?.twitter?.name || user?.discord?.name || user?.email?.address || null;
  const initials = displayName ? displayName.charAt(0).toUpperCase() : "?";

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
            {authenticated && (
              <>
                <Link href="/create" className={linkClass("/create")} data-testid="link-create">
                  Create a Guru
                </Link>
                <Link href="/dashboard" className={linkClass("/dashboard")} data-testid="link-dashboard">
                  Dashboard
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!authenticated ? (
            <button
              onClick={() => login()}
              className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#777] no-underline border-b border-[#bbb] pb-0.5 hover:text-[#444] hover:border-[#888] transition-colors cursor-pointer bg-transparent"
              data-testid="link-sign-in"
            >
              Sign in
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {displayName && (
                <span className="text-[12px] text-[#666] hidden sm:inline">{displayName}</span>
              )}
              <div className="w-7 h-7 bg-[#111] text-white flex items-center justify-center text-[11px] font-semibold">
                {initials}
              </div>
              <button
                onClick={() => logout()}
                className="text-[10px] font-medium tracking-[0.06em] uppercase text-[#999] hover:text-[#555] transition-colors cursor-pointer bg-transparent border-none"
                data-testid="button-sign-out"
              >
                Sign out
              </button>
            </div>
          )}
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
