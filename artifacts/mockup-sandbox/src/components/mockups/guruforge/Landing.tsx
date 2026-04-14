import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, MessageSquare, Network, Shield, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-emerald-500" />
            <span className="text-xl font-bold tracking-tight">GuruForge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-slate-50 transition-colors">Marketplace</a>
            <a href="#" className="hover:text-slate-50 transition-colors">Intelligence Tier</a>
            <a href="#" className="hover:text-slate-50 transition-colors">For Creators</a>
            <a href="#" className="hover:text-slate-50 transition-colors">Royalties</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-slate-50 hover:bg-slate-900">Sign In</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">Connect Telegram</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950 z-10" />
          <img 
            src="/__mockup/images/guruforge-hero.png" 
            alt="Neural Network" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-6 px-4 py-1">
                The Bloomberg Terminal of Expert AI
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                Living Intelligence,<br /> Delivered on <span className="text-blue-400">Telegram</span>.
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Discover and subscribe to specialized AI Gurus. Powered by a 3-tier intelligence architecture that learns, adapts, and pays royalties to early pioneers.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-8 text-lg rounded-full">
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-900 h-14 px-8 text-lg rounded-full">
                  Build a Guru
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Intelligence Architecture Section */}
      <section className="py-24 bg-slate-900/50 border-y border-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">3-Tier Intelligence Architecture</h2>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                GuruForge agents aren't just wrappers. They are living systems that process intent, synthesize deep memory, and calibrate post-interaction.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Tier 1: Triage", desc: "Real-time intent classification and memory routing before a single token is generated.", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10" },
                  { title: "Tier 2: Conversation", desc: "Multi-source synthesis leveraging private, specialized knowledge bases and dynamic context.", icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { title: "Tier 3: Calibration", desc: "Post-response reflection loop that builds Collective Wisdom across all interactions.", icon: BrainCircuit, color: "text-emerald-400", bg: "bg-emerald-400/10" }
                ].map((tier, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-800/50 bg-slate-900/50 hover:border-slate-700 transition-colors">
                    <div className={`w-12 h-12 rounded-lg ${tier.bg} flex items-center justify-center shrink-0`}>
                      <tier.icon className={`w-6 h-6 ${tier.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-lg mb-1">{tier.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{tier.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-square lg:aspect-auto lg:h-[600px]"
            >
              <img 
                src="/__mockup/images/guruforge-network.png" 
                alt="Architecture" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Gurus */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Elite Intelligence, Available Now.</h2>
              <p className="text-slate-400">Subscribe to top-performing Gurus across specialized domains.</p>
            </div>
            <Button variant="link" className="text-emerald-400 hover:text-emerald-300 hidden sm:flex">
              View All Gurus <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "VC Scout Pro", cat: "Finance", subs: "4.2k", price: "$49", score: 94 },
              { name: "LegalEagle", cat: "Legal", subs: "1.6k", price: "$89", score: 98 },
              { name: "HealthOS", cat: "Wellness", subs: "3.2k", price: "$59", score: 91 }
            ].map((guru, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <BrainCircuit className="w-6 h-6 text-slate-400" />
                  </div>
                  <Badge variant="outline" className="text-slate-400 border-slate-700 bg-slate-950">{guru.cat}</Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-200 mb-2">{guru.name}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                  <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-500" /> {guru.score} Wisdom</span>
                  <span>•</span>
                  <span>{guru.subs} Active</span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-800/50">
                  <span className="text-xl font-bold text-slate-200">{guru.price}<span className="text-sm text-slate-500 font-normal">/mo</span></span>
                  <Button className="bg-slate-800 hover:bg-slate-700 text-slate-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    Subscribe
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <Network className="w-8 h-8 text-slate-700 mx-auto mb-6" />
          <p>© 2024 GuruForge. Premium Intelligence Infrastructure.</p>
        </div>
      </footer>
    </div>
  );
}
