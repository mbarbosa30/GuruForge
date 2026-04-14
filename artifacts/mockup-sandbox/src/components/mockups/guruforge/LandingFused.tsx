import React from "react";
import { 
  Network, 
  BrainCircuit, 
  MessageSquare, 
  Shield, 
  Zap, 
  Lock, 
  RefreshCw, 
  ArrowRight,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingFused() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 flex flex-col items-center">
      
      {/* MINIMAL HERO */}
      <header className="w-full max-w-5xl px-6 pt-24 pb-16 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-8">
          <Network className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold tracking-tight">GuruForge</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 max-w-3xl leading-tight">
          AI Gurus for Every Domain
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Discover specialized AI experts built on a clean, scalable intelligence architecture.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full">
            Explore Marketplace
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-100 px-8 rounded-full">
            Build a Guru
          </Button>
        </div>
        <a href="#fused-content" className="mt-16 text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 group">
          See how it comes together <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </header>

      {/* FUSED CONTENT BLOCKS */}
      <main id="fused-content" className="w-full max-w-6xl px-6 py-12 flex flex-col gap-8 md:gap-12">
        
        {/* Block 1 */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-12 lg:gap-8 items-stretch relative overflow-hidden group">
          <div className="lg:w-1/3 flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-2xl mb-3 group-hover:text-blue-600 transition-colors">Domain Specific</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Specialized knowledge bases trained on specific verticals, from VC term sheets to compliance. We don't do generic chat—we do expert intelligence.
            </p>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-auto flex items-center gap-1">
              Browse domain experts <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="hidden lg:flex w-px bg-slate-100 my-4" />
          <div className="lg:hidden h-px w-full bg-slate-100" />
          
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 h-full flex flex-col justify-center relative">
              <div className="absolute top-4 right-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Architecture</div>
              <Zap className="w-6 h-6 text-slate-400 mb-4" />
              <h4 className="font-semibold text-lg mb-2">Triage Layer</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Real-time intent routing and capability checking connects you to the right domain expert instantly.
              </p>
            </div>
          </div>
          
          <div className="hidden lg:flex w-px bg-slate-100 my-4" />
          <div className="lg:hidden h-px w-full bg-slate-100" />
          
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="flex flex-col h-full justify-center">
              <div className="mb-2 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                Unlock with
              </div>
              <h4 className="text-xl font-bold mb-1">Starter Guru</h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold">$19</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" /> Standard responses
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" /> Web chat
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-auto rounded-xl">Select Starter</Button>
            </div>
          </div>
        </div>

        {/* Block 2 */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-md border-2 border-blue-600 flex flex-col lg:flex-row gap-12 lg:gap-8 items-stretch relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10">
            RECOMMENDED
          </div>
          
          <div className="lg:w-1/3 flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-2xl mb-3 group-hover:text-indigo-600 transition-colors">Instant Access</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Communicate naturally via your preferred channels with zero latency or complex setups. Whether on Telegram or web, your Guru is always ready.
            </p>
            <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-auto flex items-center gap-1">
              See integrations <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="hidden lg:flex w-px bg-slate-100 my-4" />
          <div className="lg:hidden h-px w-full bg-slate-100" />
          
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 h-full flex flex-col justify-center relative">
              <div className="absolute top-4 right-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Architecture</div>
              <Lock className="w-6 h-6 text-slate-400 mb-4" />
              <h4 className="font-semibold text-lg mb-2">Private Memory</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Isolated context window for your personal interactions ensures your instant chats remain contextual and private.
              </p>
            </div>
          </div>
          
          <div className="hidden lg:flex w-px bg-slate-100 my-4" />
          <div className="lg:hidden h-px w-full bg-slate-100" />
          
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="flex flex-col h-full justify-center">
              <div className="mb-2 inline-flex items-center text-xs font-bold uppercase tracking-wider text-blue-600">
                Unlock with
              </div>
              <h4 className="text-xl font-bold mb-1">Pro Guru</h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold">$49</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Priority response time
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Telegram integration
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Private memory retention
                </li>
              </ul>
              <Button className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Select Pro</Button>
            </div>
          </div>
        </div>

        {/* Block 3 */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-12 lg:gap-8 items-stretch relative overflow-hidden group">
          <div className="lg:w-1/3 flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-2xl mb-3 group-hover:text-emerald-600 transition-colors">Secure & Private</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Enterprise-grade security. Your proprietary context never trains the base model.
            </p>
            <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 mt-auto flex items-center gap-1">
              Read security whitepaper <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="hidden lg:flex w-px bg-slate-100 my-4" />
          <div className="lg:hidden h-px w-full bg-slate-100" />
          
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 h-full flex flex-col justify-center relative">
              <div className="absolute top-4 right-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Architecture</div>
              <RefreshCw className="w-6 h-6 text-slate-400 mb-4" />
              <h4 className="font-semibold text-lg mb-2">Collective Learning</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Anonymized calibration to improve base models without exposing your private data to the broader network.
              </p>
            </div>
          </div>
          
          <div className="hidden lg:flex w-px bg-slate-100 my-4" />
          <div className="lg:hidden h-px w-full bg-slate-100" />
          
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="flex flex-col h-full justify-center">
              <div className="mb-2 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                Unlock with
              </div>
              <h4 className="text-xl font-bold mb-1">Enterprise</h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold">$199</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" /> API access
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" /> Team workspaces
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" /> Custom integrations
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-auto rounded-xl">Contact Sales</Button>
            </div>
          </div>
        </div>

      </main>

      {/* MINIMAL FOOTER */}
      <footer className="w-full max-w-5xl px-6 py-16 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-slate-400" />
          <span className="font-semibold text-slate-900">GuruForge</span>
          <span className="text-slate-500 text-sm ml-2">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors">Marketplace</a>
          <a href="#" className="hover:text-slate-900 transition-colors">For Creators</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
        </div>
      </footer>

    </div>
  );
}
