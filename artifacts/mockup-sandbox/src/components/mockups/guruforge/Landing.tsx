import React from "react";
import { ArrowRight, BrainCircuit, MessageSquare, Network, Shield, Zap, Search, Activity, Lock, RefreshCw, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
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
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 hidden sm:flex">Sign In</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 sm:pt-32 sm:pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900 leading-tight">
              AI Gurus for Every Domain
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover and subscribe to specialized AI experts. Built on a clean, scalable intelligence architecture. Connect directly on Telegram or web.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8">
                Explore Marketplace
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 px-8">
                Build a Guru
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid sm:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Domain Specific</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Specialized knowledge bases trained on specific verticals, from VC term sheets to compliance.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Instant Access</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Communicate naturally via your preferred channels with zero latency or complex setups.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Secure & Private</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Enterprise-grade security with isolated memory states for your private queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it Works</h2>
            <p className="text-slate-600">Get specialized intelligence in minutes.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Find your Guru", desc: "Search the marketplace for specialized AI agents that match your needs." },
              { num: "02", title: "Subscribe", desc: "Choose a simple monthly plan. No hidden usage fees or token counting." },
              { num: "03", title: "Connect", desc: "Start chatting immediately via Telegram or our secure web interface." }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 border border-slate-200 rounded-xl relative">
                <div className="text-4xl font-light text-slate-200 mb-4">{step.num}</div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6">3-Tier Intelligence Architecture</h2>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                Our scalable architecture ensures fast responses, private memory, and continuous learning across all interactions.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">1. Triage</h3>
                    <p className="text-slate-600 text-sm">Real-time intent routing and capability checking.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">2. Private Memory</h3>
                    <p className="text-slate-600 text-sm">Isolated context window for your personal interactions.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">3. Collective Learning</h3>
                    <p className="text-slate-600 text-sm">Anonymized calibration to improve base models.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="border border-slate-200 bg-slate-50 rounded-xl p-8 flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                  <Zap className="w-5 h-5 text-slate-400" />
                  <span className="font-medium text-sm">Query Received</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center gap-2 bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-sm text-center">Private Context</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                    <BarChart className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-sm text-center">Domain Knowledge</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                </div>
                <div className="flex items-center gap-4 bg-blue-50 p-4 border border-blue-100 rounded-lg text-blue-700">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium text-sm">Synthesized Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-slate-600">Subscribe directly to the expertise you need.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Starter Guru", price: "$19", desc: "Basic domain knowledge and chat access.", features: ["Standard response time", "Web chat interface", "Public knowledge base"] },
              { name: "Pro Guru", price: "$49", desc: "Advanced intelligence with private memory.", features: ["Priority response time", "Telegram integration", "Private memory retention", "Custom knowledge base"], popular: true },
              { name: "Enterprise", price: "$199", desc: "Full team access and API integrations.", features: ["API access", "Team workspaces", "Custom integrations", "Dedicated support"] }
            ].map((tier, i) => (
              <div key={i} className={`bg-white border rounded-xl p-8 flex flex-col ${tier.popular ? 'border-blue-600 shadow-sm relative' : 'border-slate-200'}`}>
                {tier.popular && <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>}
                <h3 className="font-semibold text-lg mb-2">{tier.name}</h3>
                <p className="text-slate-600 text-sm mb-6 h-10">{tier.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${tier.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}>
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Network className="w-5 h-5 text-slate-400" />
            <span className="font-medium text-slate-900">GuruForge</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
