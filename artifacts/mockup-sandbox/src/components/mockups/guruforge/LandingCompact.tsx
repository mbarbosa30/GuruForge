import React from "react";
import { Network, BrainCircuit, MessageSquare, Shield, ArrowRight, Zap, Lock, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCompact() {
  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col selection:bg-blue-100">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-blue-600" />
          <span className="font-semibold tracking-tight text-sm">GuruForge</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium">AI Gurus for Every Domain</span>
        </div>
        <div className="flex items-center gap-5 text-xs font-medium text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-slate-100 hover:text-slate-900">Sign In</Button>
          <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-none rounded">Get Started</Button>
        </div>
      </header>

      {/* Grid Content */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-12 grid-rows-2 gap-4 md:gap-6 min-h-0 max-w-7xl mx-auto w-full">
        
        {/* Panel 1: Value Props */}
        <section className="col-span-12 lg:col-span-7 row-span-1 bg-white border border-slate-200 rounded-lg p-5 flex flex-col shadow-sm">
          <header className="mb-4 shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Core Value</h2>
          </header>
          <div className="flex-1 flex gap-4">
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-center">
              <div className="w-8 h-8 rounded-md bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-3 shadow-sm">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Domain Specific</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Specialized knowledge bases trained on specific verticals, from VC term sheets to compliance.</p>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-center">
              <div className="w-8 h-8 rounded-md bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-3 shadow-sm">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Instant Access</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Communicate naturally via your preferred channels with zero latency or complex setups.</p>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col justify-center">
              <div className="w-8 h-8 rounded-md bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-3 shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Secure & Private</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Enterprise-grade security with isolated memory states for your private queries.</p>
            </div>
          </div>
        </section>

        {/* Panel 2: How it Works */}
        <section className="col-span-12 lg:col-span-5 row-span-1 bg-white border border-slate-200 rounded-lg p-5 flex flex-col shadow-sm">
          <header className="mb-4 shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">How it Works</h2>
          </header>
          <div className="flex-1 flex items-center justify-between gap-2 px-2 bg-slate-50 border border-slate-100 rounded-lg p-4">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center text-xs font-bold mb-3 shadow-sm">1</div>
              <h3 className="text-sm font-semibold mb-1">Find</h3>
              <p className="text-xs text-slate-500">Search marketplace</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mb-6" />
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center text-xs font-bold mb-3 shadow-sm">2</div>
              <h3 className="text-sm font-semibold mb-1">Subscribe</h3>
              <p className="text-xs text-slate-500">Choose a plan</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mb-6" />
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center text-xs font-bold mb-3 shadow-sm">3</div>
              <h3 className="text-sm font-semibold mb-1">Connect</h3>
              <p className="text-xs text-slate-500">Chat instantly</p>
            </div>
          </div>
        </section>

        {/* Panel 3: Architecture */}
        <section className="col-span-12 lg:col-span-4 row-span-1 bg-white border border-slate-200 rounded-lg p-5 flex flex-col shadow-sm">
          <header className="mb-4 shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Architecture</h2>
          </header>
          <div className="flex-1 flex flex-col gap-2 justify-center">
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <Zap className="w-4 h-4 text-slate-600 shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-slate-900">1. Triage</h3>
                <p className="text-[11px] text-slate-500">Real-time intent routing & checks</p>
              </div>
            </div>
            <div className="flex justify-center -my-1.5 relative z-10">
              <div className="w-px h-4 bg-slate-200"></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <Lock className="w-4 h-4 text-slate-600 shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-slate-900">2. Private Memory</h3>
                <p className="text-[11px] text-slate-500">Isolated context window</p>
              </div>
            </div>
            <div className="flex justify-center -my-1.5 relative z-10">
              <div className="w-px h-4 bg-slate-200"></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-blue-900">3. Collective Learning</h3>
                <p className="text-[11px] text-blue-700/80">Anonymized calibration model</p>
              </div>
            </div>
          </div>
        </section>

        {/* Panel 4: Pricing */}
        <section className="col-span-12 lg:col-span-8 row-span-1 bg-white border border-slate-200 rounded-lg p-5 flex flex-col shadow-sm">
          <header className="mb-4 shrink-0 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing</h2>
            <span className="text-xs text-slate-500 hidden sm:inline-block">Subscribe directly to the expertise you need.</span>
          </header>
          <div className="flex-1 flex gap-4">
            
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col relative">
              <h3 className="font-semibold text-sm mb-1 text-slate-900">Starter Guru</h3>
              <div className="mb-4">
                <span className="text-xl font-bold text-slate-900">$19</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>
              <ul className="space-y-2 mb-4 flex-1">
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Standard response time</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Web chat interface</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Public knowledge base</span>
                </li>
              </ul>
              <Button size="sm" variant="outline" className="w-full h-8 text-xs rounded bg-white shadow-sm border-slate-200 text-slate-700 hover:bg-slate-50">Select Plan</Button>
            </div>

            <div className="flex-1 bg-white border-2 border-blue-600 rounded-lg p-4 flex flex-col relative shadow-sm">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Most Popular</div>
              <h3 className="font-semibold text-sm mb-1 text-slate-900">Pro Guru</h3>
              <div className="mb-4">
                <span className="text-xl font-bold text-slate-900">$49</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>
              <ul className="space-y-2 mb-4 flex-1">
                <li className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Priority response time</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Telegram integration</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Private memory retention</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Custom knowledge base</span>
                </li>
              </ul>
              <Button size="sm" className="w-full h-8 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white shadow-none">Select Plan</Button>
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col relative">
              <h3 className="font-semibold text-sm mb-1 text-slate-900">Enterprise</h3>
              <div className="mb-4">
                <span className="text-xl font-bold text-slate-900">$199</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>
              <ul className="space-y-2 mb-4 flex-1">
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Team workspaces</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <Button size="sm" variant="outline" className="w-full h-8 text-xs rounded bg-white shadow-sm border-slate-200 text-slate-700 hover:bg-slate-50">Select Plan</Button>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
