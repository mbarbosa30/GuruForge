import React from "react";
import { 
  Network, 
  BrainCircuit, 
  MessageSquare, 
  Shield, 
  Zap, 
  Lock, 
  RefreshCw, 
  ArrowDown,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingSplit() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 flex flex-col md:flex-row">
      
      {/* LEFT COLUMN - FIXED PANEL */}
      <div className="md:w-[35%] lg:w-[30%] bg-slate-50 border-r border-slate-200 md:fixed md:h-screen md:top-0 md:left-0 flex flex-col p-8 md:p-12 z-10">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-12">
            <Network className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold tracking-tight">GuruForge</span>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-slate-900 leading-tight">
              AI Gurus for Every Domain
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Discover and subscribe to specialized AI experts. Built on a clean, scalable intelligence architecture.
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-16">
            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-center">
              Explore Marketplace
            </Button>
            <Button size="lg" variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 justify-center">
              Build a Guru
            </Button>
          </div>

          <nav className="flex flex-col gap-4 text-sm font-medium text-slate-600 mt-auto">
            <a href="#" className="hover:text-blue-600 transition-colors py-2 border-b border-slate-200">Marketplace</a>
            <a href="#" className="hover:text-blue-600 transition-colors py-2 border-b border-slate-200">Intelligence</a>
            <a href="#" className="hover:text-blue-600 transition-colors py-2 border-b border-slate-200">For Creators</a>
            <a href="#" className="hover:text-blue-600 transition-colors py-2">Pricing</a>
          </nav>
        </div>
      </div>

      {/* RIGHT COLUMN - SCROLLING CONTENT */}
      <div className="md:w-[65%] lg:w-[70%] md:ml-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* VALUE PROPS - Horizontal Rows */}
          <section className="py-20 px-8 md:px-16 border-b border-slate-100">
            <div className="space-y-12">
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Domain Specific</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Specialized knowledge bases trained on specific verticals, from VC term sheets to compliance. We don't do generic chat—we do expert intelligence.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Instant Access</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Communicate naturally via your preferred channels with zero latency or complex setups. Whether on Telegram or web, your Guru is always ready.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Secure & Private</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Enterprise-grade security with isolated memory states for your private queries. Your proprietary context never trains the base model.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS - Vertical Timeline */}
          <section className="py-20 px-8 md:px-16 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-3xl font-bold mb-12">How it Works</h2>
            
            <div className="relative border-l border-slate-200 ml-6 pl-10 space-y-16">
              <div className="relative">
                <div className="absolute -left-[58px] top-0 w-8 h-8 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-sm font-bold text-blue-600">
                  1
                </div>
                <h3 className="font-semibold text-xl mb-3">Find your Guru</h3>
                <p className="text-slate-600">Search the marketplace for specialized AI agents that match your exact domain needs and use cases.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[58px] top-0 w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-sm font-bold text-slate-500">
                  2
                </div>
                <h3 className="font-semibold text-xl mb-3">Subscribe</h3>
                <p className="text-slate-600">Choose a simple monthly plan. No hidden usage fees, token counting, or complex infrastructure to manage.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[58px] top-0 w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-sm font-bold text-slate-500">
                  3
                </div>
                <h3 className="font-semibold text-xl mb-3">Connect</h3>
                <p className="text-slate-600">Start chatting immediately via Telegram or our secure web interface. Your Guru retains context across sessions.</p>
              </div>
            </div>
          </section>

          {/* ARCHITECTURE - Vertical Pipeline */}
          <section className="py-20 px-8 md:px-16 border-b border-slate-100">
            <h2 className="text-3xl font-bold mb-4">Architecture</h2>
            <p className="text-slate-600 mb-12 max-w-2xl">
              Our scalable architecture ensures fast responses, private memory, and continuous learning across all interactions.
            </p>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
              <div className="flex flex-col items-center gap-6">
                
                {/* Tier 1 */}
                <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">1. Triage Layer</h4>
                    <p className="text-sm text-slate-600">Real-time intent routing and capability checking.</p>
                  </div>
                </div>

                <ArrowDown className="w-6 h-6 text-slate-300" />

                {/* Tier 2 */}
                <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-6">
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">2. Private Memory State</h4>
                    <p className="text-sm text-slate-600">Isolated context window for your personal interactions.</p>
                  </div>
                </div>

                <ArrowDown className="w-6 h-6 text-slate-300" />

                {/* Tier 3 */}
                <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-6">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">3. Collective Learning</h4>
                    <p className="text-sm text-slate-600">Anonymized calibration to improve base models.</p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* PRICING - Stacked Comparison */}
          <section className="py-20 px-8 md:px-16 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-3xl font-bold mb-12">Pricing</h2>

            <div className="space-y-6">
              {/* Pro (Highlighted) */}
              <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-bl-xl">
                  MOST POPULAR
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Pro Guru</h3>
                    <p className="text-slate-600 mb-6">Advanced intelligence with private memory.</p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Priority response time
                      </li>
                      <li className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Telegram integration
                      </li>
                      <li className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Private memory retention
                      </li>
                      <li className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Custom knowledge base
                      </li>
                    </ul>
                  </div>
                  <div className="md:w-48 shrink-0 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-4xl font-bold mb-1">$49</div>
                    <div className="text-sm text-slate-500 mb-6">per month</div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Select Pro</Button>
                  </div>
                </div>
              </div>

              {/* Starter */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="md:w-1/3">
                      <h3 className="text-xl font-bold mb-1">Starter Guru</h3>
                      <p className="text-sm text-slate-500">Basic domain knowledge.</p>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-600 mb-2 font-medium">Includes:</div>
                      <div className="text-sm text-slate-600">Standard responses, Web chat, Public KB</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 md:w-48 shrink-0 justify-between md:justify-end">
                    <div className="text-xl font-bold">$19<span className="text-sm font-normal text-slate-500">/mo</span></div>
                    <Button variant="outline" className="border-slate-300">Select</Button>
                  </div>
                </div>
              </div>

              {/* Enterprise */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="md:w-1/3">
                      <h3 className="text-xl font-bold mb-1">Enterprise</h3>
                      <p className="text-sm text-slate-500">Full team access & API.</p>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-600 mb-2 font-medium">Includes:</div>
                      <div className="text-sm text-slate-600">API access, Team workspaces, Integrations</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 md:w-48 shrink-0 justify-between md:justify-end">
                    <div className="text-xl font-bold">$199<span className="text-sm font-normal text-slate-500">/mo</span></div>
                    <Button variant="outline" className="border-slate-300">Select</Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="py-12 px-8 md:px-16 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-slate-900">GuruForge</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-900">Terms</a>
              <a href="#" className="hover:text-slate-900">Privacy</a>
              <a href="#" className="hover:text-slate-900">Contact</a>
            </div>
          </footer>

        </div>
      </div>

    </div>
  );
}
