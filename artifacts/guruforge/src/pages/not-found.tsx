import { Link } from "wouter";
import Layout from "@/components/layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-6">
          Page not found
        </p>
        <p className="text-[64px] md:text-[80px] font-light tracking-[-0.03em] text-[#ddd] mb-6 leading-none">
          404
        </p>
        <p className="text-base text-[#777] mb-10 max-w-md">
          This page doesn't exist yet. We're still forging.
        </p>
        <Link
          href="/"
          className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
          data-testid="button-home"
        >
          Back to Home
        </Link>
      </div>
    </Layout>
  );
}
