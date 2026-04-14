import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF7] text-[#1a1a1a] font-sans flex flex-col selection:bg-teal-100">
      <header className="w-full flex items-center px-6 md:px-12 py-6">
        <Link href="/" className="text-lg font-semibold tracking-tight" data-testid="link-logo">
          GuruForge
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <p className="text-6xl md:text-8xl font-bold tracking-tight text-[#ddd] mb-6">404</p>
          <p className="text-lg text-[#888] mb-10 max-w-md">
            This page doesn't exist yet. We're still forging.
          </p>
          <Link href="/">
            <Button className="bg-[#1a1a1a] hover:bg-[#333] text-white font-medium px-8 h-12 rounded-full text-base transition-colors" data-testid="button-home">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
