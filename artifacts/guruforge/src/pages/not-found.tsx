import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Network, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 font-sans flex flex-col selection:bg-blue-100">
      <header className="w-full flex items-center justify-between p-6 md:p-8">
        <Link href="/" className="flex items-center gap-3 group" data-testid="link-logo">
          <Network className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black tracking-tighter">GuruForge</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center mb-8">
            <AlertCircle className="w-16 h-16 md:w-20 md:h-20" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6 text-slate-900">
            404
          </h1>
          
          <p className="text-xl md:text-3xl font-medium text-slate-500 mb-12 max-w-2xl mx-auto">
            The Guru you are looking for has retreated to their private memory state.
          </p>
          
          <Link href="/">
            <Button size="lg" className="h-16 px-10 rounded-full text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all hover:shadow-xl hover:-translate-y-1" data-testid="button-home">
              Return Home
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
