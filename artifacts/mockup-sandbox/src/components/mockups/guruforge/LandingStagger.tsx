import React from "react";
import { ArrowRight, BrainCircuit, MessageSquare, Network, Shield, Zap, Lock, RefreshCw, BarChart, Check, Users, Star, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingStagger() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold tracking-tight">GuruForge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-colors">Marketplace</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Intelligence</a>
            <a href="#" className="hover:text-slate-900 transition-colors">For Creators</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 hidden sm:flex">Sign In</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Left-aligned */}
      <section className="pt-24 pb-20 sm:pt-32 sm:pb-24 border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
            <div className="md:w-3/5 text-left">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 leading-tight">
                AI Gurus for Every Domain
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                Discover and subscribe to specialized AI experts. Built on a clean, scalable intelligence architecture. Connect directly on Telegram or web.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Explore Marketplace
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50 px-8">
                  Build a Guru
                </Button>
              </div>
            </div>
            
            <div className="md:w-2/5 w-full flex flex-col gap-4 mt-8 md:mt-0">
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">12,000+</div>
                  <div className="text-sm font-medium text-slate-500">Active Subscribers</div>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl flex items-center gap-4 md:translate-x-8">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">94 / 100</div>
                  <div className="text-sm font-medium text-slate-500">Avg Wisdom Score</div>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">200+</div>
                  <div className="text-sm font-medium text-slate-500">Specialized Gurus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props - Offset 2+1 Layout */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why specialized intelligence?</h2>
          </div>
          
          <div className="flex flex-col gap-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">Domain Specific</h3>
                <p className="text-slate-600 leading-relaxed">
                  Specialized knowledge bases trained on specific verticals, from VC term sheets to compliance. Never generic.
                </p>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">Instant Access</h3>
                <p className="text-slate-600 leading-relaxed">
                  Communicate naturally via your preferred channels with zero latency or complex setups. Always on.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="sm:w-[60%] bg-blue-50 p-8 rounded-xl border border-blue-100">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-6">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-blue-900">Secure & Private</h3>
                <p className="text-blue-800/80 leading-relaxed">
                  Enterprise-grade security with isolated memory states for your private queries. Your data never trains the base model.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Full bleed horizontal timeline */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="pl-6 md:pl-24 mb-16 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold">How it Works</h2>
          <p className="text-slate-400 mt-2">Get specialized intelligence in minutes.</p>
        </div>
        
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-slate-800 -translate-y-1/2 hidden md:block"></div>
          <div className="flex flex-col md:flex-row gap-12 md:gap-0 w-full px-6 md:px-0 md:pl-24 overflow-x-auto pb-8 hide-scrollbar">
            {[
              { num: "01", title: "Find your Guru", desc: "Search the marketplace for specialized AI agents that match your exact needs." },
              { num: "02", title: "Subscribe", desc: "Choose a simple monthly plan. No hidden usage fees or token counting to worry about." },
              { num: "03", title: "Connect", desc: "Start chatting immediately via Telegram or our secure web interface seamlessly." }
            ].map((step, i) => (
              <div key={i} className="relative shrink-0 md:w-[400px] flex flex-col md:pr-12 group">
                <div className="hidden md:flex absolute top-1/2 left-0 w-full h-px bg-blue-600/0 group-hover:bg-blue-600/50 transition-colors -translate-y-1/2 z-0"></div>
                <div className="w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-900 text-blue-400 flex items-center justify-center text-xl font-bold mb-8 relative z-10">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">{step.desc}</p>
                </div>
              </div>
            ))}
            <div className="shrink-0 w-12 md:w-24"></div> {/* Spacer */}
          </div>
        </div>
      </section>

      {/* Architecture - Right Aligned Text, Left Diagram */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 w-full">
              <div className="border border-slate-100 bg-slate-50 rounded-2xl p-8 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="flex items-center gap-4 bg-white p-5 border border-slate-200 rounded-xl shadow-sm relative z-10">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Query Received</span>
                    <span className="block text-xs text-slate-500">Triage & routing</span>
                  </div>
                </div>
                
                <div className="flex justify-center py-2 relative z-10">
                  <div className="w-px h-8 bg-slate-300"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="flex flex-col items-center gap-3 bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-slate-900">Private Context</span>
                      <span className="block text-xs text-slate-500">Isolated memory</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <BarChart className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-slate-900">Domain Knowledge</span>
                      <span className="block text-xs text-slate-500">Vertical expertise</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center py-2 relative z-10">
                  <div className="w-px h-8 bg-slate-300"></div>
                </div>
                
                <div className="flex items-center gap-4 bg-blue-600 p-5 rounded-xl shadow-md text-white relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="block font-bold">Synthesized Response</span>
                    <span className="block text-xs text-blue-200">Delivered instantly</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6 text-slate-900">3-Tier Intelligence Architecture</h2>
              <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                Our scalable architecture ensures fast responses, private memory, and continuous learning across all interactions, built for enterprise reliability.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm text-slate-700">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-slate-900">Triage</h3>
                    <p className="text-slate-600">Real-time intent routing and capability checking to ensure queries hit the right specialized models immediately.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm text-slate-700">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-slate-900">Private Memory</h3>
                    <p className="text-slate-600">Isolated context window for your personal interactions. We separate facts from flow to maintain absolute privacy.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-sm text-slate-700">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-slate-900">Collective Learning</h3>
                    <p className="text-slate-600">Anonymized, abstracted calibration to improve base models without ever leaking individual user data or prompts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Featured Left, Supporting Stacked Right */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Simple Pricing</h2>
            <p className="text-xl text-slate-600">Subscribe directly to the expertise you need.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            {/* Featured Pro Plan (Left, ~60%) */}
            <div className="lg:w-[60%] bg-blue-600 text-white rounded-2xl p-10 flex flex-col shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="w-48 h-48" />
              </div>
              
              <div className="relative z-10">
                <div className="inline-block bg-blue-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                  Recommended
                </div>
                <h3 className="font-bold text-3xl mb-2">Pro Guru</h3>
                <p className="text-blue-100 mb-8 text-lg max-w-sm">Advanced intelligence with private memory and custom integrations.</p>
                
                <div className="mb-10">
                  <span className="text-6xl font-extrabold">$49</span>
                  <span className="text-blue-200 text-xl">/mo</span>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {["Priority response time", "Telegram & Web integration", "Private memory retention", "Custom knowledge base uploads", "Team sharing (up to 5 users)"].map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-blue-700 text-lg py-6 px-10 shadow-sm">
                  Start Pro Trial
                </Button>
              </div>
            </div>
            
            {/* Supporting Plans Stack (Right, ~40%) */}
            <div className="lg:w-[40%] flex flex-col gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 flex-1 flex flex-col shadow-sm">
                <h3 className="font-bold text-xl mb-1 text-slate-900">Starter</h3>
                <p className="text-slate-500 text-sm mb-4">Basic domain knowledge.</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-slate-900">$19</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {["Standard response time", "Web chat interface", "Public knowledge base"].map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full border-slate-200">Get Starter</Button>
              </div>
              
              <div className="bg-slate-900 text-white rounded-2xl p-8 flex-1 flex flex-col shadow-sm">
                <h3 className="font-bold text-xl mb-1">Enterprise</h3>
                <p className="text-slate-400 text-sm mb-4">Full team access.</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">$199</span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {["API access", "Unlimited workspaces", "Custom integrations"].map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white">Contact Sales</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-900">GuruForge</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-blue-600 transition-colors font-medium">Marketplace</a>
            <a href="#" className="hover:text-blue-600 transition-colors font-medium">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors font-medium">Privacy</a>
          </div>
          <div>
            &copy; {new Date().getFullYear()} GuruForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
