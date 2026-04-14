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
  Star,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingEphemeral() {
  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      
      {/* MINIMAL TOP BAR */}
      <header className="w-full flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Network className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-black tracking-tighter">GuruForge</span>
        </div>
        <div className="flex items-center gap-6 font-medium">
          <a href="#" className="hidden md:block hover:text-blue-600 transition-colors">Marketplace</a>
          <a href="#" className="hidden md:block hover:text-blue-600 transition-colors">Pricing</a>
          <Button variant="outline" className="rounded-full border-slate-300 font-bold hidden sm:flex">Login</Button>
          <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">Get Started</Button>
        </div>
      </header>

      {/* HERO SECTION - MASSIVE & BREATHING */}
      <section className="pt-24 pb-32 md:pt-40 md:pb-48 px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold mb-8 text-sm md:text-base">
          <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
          <span>Trusted by 12,000+ professionals</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter leading-[0.9] mb-8 text-slate-900 max-w-6xl mx-auto">
          AI GURUS FOR <br className="hidden md:block" /><span className="text-blue-600">EVERY DOMAIN</span>
        </h1>
        
        <p className="text-xl md:text-3xl font-medium text-slate-500 mb-16 max-w-4xl mx-auto">
          Discover and subscribe to specialized AI experts.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Button size="lg" className="h-16 px-10 rounded-full text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold w-full sm:w-auto">
            Explore Marketplace
          </Button>
          <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg border-2 border-slate-200 text-slate-800 hover:bg-slate-50 font-bold w-full sm:w-auto">
            Build a Guru
          </Button>
        </div>
      </section>

      {/* VALUE PROPS - FULL BLEED HORIZONTAL */}
      <section className="py-24 md:py-32 px-6 w-full bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 max-w-[100rem] mx-auto w-full">
          <div className="flex flex-col items-center text-center group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-500">
              <BrainCircuit className="w-16 h-16 md:w-20 md:h-20" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">Domain Specific</h3>
            <p className="text-xl text-slate-500 font-medium">Expert intelligence trained on exact verticals.</p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-500">
              <MessageSquare className="w-16 h-16 md:w-20 md:h-20" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">Instant Access</h3>
            <p className="text-xl text-slate-500 font-medium">Communicate via any channel instantly.</p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-slate-100 text-slate-800 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-500">
              <Shield className="w-16 h-16 md:w-20 md:h-20" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">Secure & Private</h3>
            <p className="text-xl text-slate-500 font-medium">Isolated memory states for total privacy.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - MINIMAL TEXT, GIANT NUMBERS */}
      <section className="py-32 md:py-48 px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-24">HOW IT WORKS</h2>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center flex-1">
            <div className="text-[8rem] font-black text-slate-100 leading-none mb-4">1</div>
            <h3 className="text-3xl font-bold mb-2">Find</h3>
            <p className="text-xl text-slate-500 font-medium">Search exact domain needs.</p>
          </div>

          <ArrowRight className="w-12 h-12 text-slate-300 hidden md:block shrink-0" />

          <div className="flex flex-col items-center text-center flex-1">
            <div className="text-[8rem] font-black text-slate-100 leading-none mb-4">2</div>
            <h3 className="text-3xl font-bold mb-2">Subscribe</h3>
            <p className="text-xl text-slate-500 font-medium">Simple monthly plan.</p>
          </div>

          <ArrowRight className="w-12 h-12 text-slate-300 hidden md:block shrink-0" />

          <div className="flex flex-col items-center text-center flex-1">
            <div className="text-[8rem] font-black text-slate-100 leading-none mb-4">3</div>
            <h3 className="text-3xl font-bold mb-2">Connect</h3>
            <p className="text-xl text-slate-500 font-medium">Chat immediately.</p>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE - HORIZONTAL PIPELINE FULL WIDTH */}
      <section className="py-32 md:py-48 px-6 bg-slate-50">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">ARCHITECTURE</h2>
          <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto">Fast, private, learning.</p>
        </div>

        <div className="max-w-[100rem] mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
          
          {/* Node 1 */}
          <div className="flex-1 w-full md:w-auto bg-white rounded-[3rem] p-12 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-shadow border border-slate-100">
            <Zap className="w-24 h-24 text-blue-600 mb-8" />
            <h4 className="text-3xl font-bold mb-4">Triage</h4>
            <p className="text-xl text-slate-500 font-medium">Intent routing.</p>
          </div>

          {/* Connector */}
          <div className="w-2 h-16 md:w-16 md:h-2 bg-slate-200 rounded-full shrink-0"></div>

          {/* Node 2 */}
          <div className="flex-1 w-full md:w-auto bg-slate-900 text-white rounded-[3rem] p-12 flex flex-col items-center text-center shadow-xl">
            <Lock className="w-24 h-24 text-blue-400 mb-8" />
            <h4 className="text-3xl font-bold mb-4">Private Memory</h4>
            <p className="text-xl text-slate-400 font-medium">Isolated context.</p>
          </div>

          {/* Connector */}
          <div className="w-2 h-16 md:w-16 md:h-2 bg-slate-200 rounded-full shrink-0"></div>

          {/* Node 3 */}
          <div className="flex-1 w-full md:w-auto bg-white rounded-[3rem] p-12 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-shadow border border-slate-100">
            <RefreshCw className="w-24 h-24 text-emerald-600 mb-8" />
            <h4 className="text-3xl font-bold mb-4">Collective Learning</h4>
            <p className="text-xl text-slate-500 font-medium">Anonymized calibration.</p>
          </div>

        </div>
      </section>

      {/* PRICING - MASSIVE CARDS */}
      <section className="py-32 md:py-48 px-6 w-full">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">SIMPLE PRICING</h2>
          <div className="flex items-center justify-center gap-2 text-xl text-slate-500 font-medium">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span>4.9/5 from 500+ reviews</span>
          </div>
        </div>

        <div className="max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="p-12 md:p-16 rounded-[3rem] bg-slate-50 flex flex-col">
            <h3 className="text-3xl font-bold mb-2">Starter</h3>
            <div className="text-6xl font-black mb-8 tracking-tighter">$19<span className="text-2xl text-slate-400 font-bold">/mo</span></div>
            <p className="text-xl text-slate-600 font-medium mb-12">Basic domain knowledge.</p>
            <Button size="lg" variant="outline" className="h-16 rounded-full text-lg border-2 border-slate-200 font-bold w-full mt-auto">Choose Starter</Button>
          </div>

          <div className="p-12 md:p-16 rounded-[3rem] bg-blue-600 text-white flex flex-col relative transform lg:-translate-y-8 shadow-2xl">
            <div className="absolute top-8 right-12 bg-white text-blue-600 font-black px-4 py-2 rounded-full text-sm uppercase tracking-widest">
              Most Popular
            </div>
            <h3 className="text-3xl font-bold mb-2">Pro</h3>
            <div className="text-6xl font-black mb-8 tracking-tighter">$49<span className="text-2xl text-blue-300 font-bold">/mo</span></div>
            <p className="text-xl text-blue-100 font-medium mb-12">Advanced intelligence + private memory.</p>
            
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4 text-lg font-medium">
                <CheckCircle2 className="w-6 h-6 text-blue-300" /> Priority response
              </li>
              <li className="flex items-center gap-4 text-lg font-medium">
                <CheckCircle2 className="w-6 h-6 text-blue-300" /> Private memory
              </li>
            </ul>

            <Button size="lg" className="h-16 rounded-full text-lg bg-white text-blue-600 hover:bg-slate-50 font-bold w-full mt-auto">Join Today</Button>
          </div>

          <div className="p-12 md:p-16 rounded-[3rem] bg-slate-50 flex flex-col">
            <h3 className="text-3xl font-bold mb-2">Enterprise</h3>
            <div className="text-6xl font-black mb-8 tracking-tighter">$199<span className="text-2xl text-slate-400 font-bold">/mo</span></div>
            <p className="text-xl text-slate-600 font-medium mb-12">Full team access & API.</p>
            <Button size="lg" variant="outline" className="h-16 rounded-full text-lg border-2 border-slate-200 font-bold w-full mt-auto">Contact Sales</Button>
          </div>

        </div>
      </section>

      {/* MASSIVE FOOTER CTA */}
      <footer className="bg-slate-900 text-white py-32 md:py-48 px-6 text-center rounded-t-[3rem] md:rounded-t-[5rem] mt-12">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-12">READY TO BUILD?</h2>
        <Button size="lg" className="h-20 px-16 rounded-full text-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold w-full sm:w-auto">
          Get Started Now
        </Button>
        <div className="mt-32 pt-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto font-medium text-slate-400">
          <div className="flex items-center gap-3">
            <Network className="w-6 h-6" />
            <span className="text-xl font-bold text-white tracking-tighter">GuruForge</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
