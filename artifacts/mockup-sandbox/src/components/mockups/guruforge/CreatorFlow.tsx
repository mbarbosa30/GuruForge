import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Settings, BrainCircuit, Activity, Rocket, ArrowRight, Zap, Database, Lock, Eye, Network, Code, Globe, Calendar, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const STEPS = [
  { id: 1, title: "Setup", icon: Settings },
  { id: 2, title: "Intelligence", icon: BrainCircuit },
  { id: 3, title: "Capabilities", icon: Activity },
  { id: 4, title: "Launch", icon: Rocket },
];

const MODELS = [
  { id: "gpt4o", name: "GPT-4o", provider: "OpenAI", speed: "Fast", cost: "$$$", recommended: true },
  { id: "claude35", name: "Claude 3.5 Sonnet", provider: "Anthropic", speed: "Very Fast", cost: "$$", recommended: false },
  { id: "gemini15", name: "Gemini 1.5 Pro", provider: "Google", speed: "Medium", cost: "$$", recommended: false },
];

const TOOLS = [
  { id: "web", name: "Web Search", desc: "Allow Guru to browse the internet for real-time info", icon: Globe },
  { id: "calc", name: "Calculator", desc: "Precise mathematical operations and logic", icon: Terminal },
  { id: "cal", name: "Calendar API", desc: "Read/write access to user's scheduled events", icon: Calendar },
  { id: "code", name: "Code Interpreter", desc: "Sandboxed environment for executing Python", icon: Code },
];

export function CreatorFlow() {
  const [activeStep, setActiveStep] = useState(2);
  const [selectedModel, setSelectedModel] = useState("gpt4o");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 rounded-full h-8 w-8">
              <Check className="w-4 h-4" />
            </Button>
            <span className="font-semibold">Draft: VC Scout Pro</span>
            <Badge variant="outline" className="bg-slate-900 border-slate-700 text-slate-400 text-xs ml-2">Unsaved</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-400 hover:text-slate-100">Save Draft</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Publish Guru</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Form */}
        <div className="flex-1 max-w-3xl">
          
          {/* Stepper */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 z-0 transition-all" style={{ width: '33%' }}></div>
            
            {STEPS.map((step) => {
              const isActive = activeStep === step.id;
              const isPast = step.id < activeStep;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive ? 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 
                    isPast ? 'bg-emerald-500 border-emerald-500 text-white' : 
                    'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    {isPast ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium uppercase tracking-wider ${
                    isActive ? 'text-emerald-400' : isPast ? 'text-slate-300' : 'text-slate-600'
                  }`}>{step.title}</span>
                </div>
              );
            })}
          </div>

          {/* Step 2 Content: Intelligence Configuration */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Configure Intelligence</h2>
              <p className="text-slate-400">Define the core cognitive architecture and memory capabilities for your Guru.</p>
            </div>

            {/* Base Model */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Base Foundation Model</Label>
                <span className="text-xs text-slate-500 font-medium bg-slate-900 px-2 py-1 rounded">Tier 1 Runtime</span>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {MODELS.map((model) => (
                  <div 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedModel === model.id 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    {model.recommended && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                        Recommended
                      </span>
                    )}
                    <h4 className="font-semibold text-slate-200 mb-1">{model.name}</h4>
                    <p className="text-xs text-slate-500 mb-3">{model.provider}</p>
                    <div className="flex items-center justify-between text-xs mt-auto">
                      <span className="text-slate-400">{model.speed}</span>
                      <span className="text-emerald-400/80 font-medium">{model.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-3 p-5 rounded-xl border border-slate-800 bg-slate-900/30">
              <Label htmlFor="api-key" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                Provider API Key
              </Label>
              <Input 
                id="api-key" 
                type="password" 
                placeholder="sk-..." 
                className="bg-slate-950 border-slate-700 focus-visible:ring-emerald-500/50 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                Creator pays all inference costs. You keep 70% of subscription revenue. Keys are encrypted at rest.
              </p>
            </div>

            <hr className="border-slate-800" />

            {/* Memory Configuration */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Memory Architecture</Label>
                <span className="text-xs text-slate-500 font-medium bg-slate-900 px-2 py-1 rounded">Tier 2 & 3</span>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <h4 className="font-medium text-slate-200">Personal Memory (Tier 2)</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Allow the Guru to maintain continuous state across Telegram sessions for individual subscribers. Highly recommended for personalized advice.
                  </p>
                </div>
                <Switch id="t2-memory" defaultChecked className="data-[state=checked]:bg-blue-500 mt-1" />
              </div>

              <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl pointer-events-none rounded-full" />
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-medium text-emerald-100">Collective Wisdom (Tier 3)</h4>
                  </div>
                  <p className="text-sm text-emerald-100/60 leading-relaxed">
                    Opt-in to the global calibration loop. Anonymized insights are synthesized across all interactions to improve base intelligence. Earn <span className="text-emerald-400 font-medium">Wisdom Royalties</span> based on contribution.
                  </p>
                </div>
                <Switch id="t3-memory" defaultChecked className="data-[state=checked]:bg-emerald-500 mt-1 relative z-10" />
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Tool Integrations */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Active Integrations</Label>
              <div className="grid sm:grid-cols-2 gap-4">
                {TOOLS.map((tool) => (
                  <label key={tool.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/30 cursor-pointer hover:border-slate-700 transition-colors group">
                    <div className="pt-0.5">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <tool.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
                        <h4 className="font-medium text-slate-200 text-sm">{tool.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <Button variant="ghost" className="text-slate-400">Back</Button>
              <Button className="bg-slate-100 hover:bg-white text-slate-950 px-8">
                Continue to Capabilities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="h-12" /> {/* Bottom spacer */}
          </motion.div>
        </div>

        {/* Right Column: Preview */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Live Preview
            </h3>
            
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">VC Scout Pro</h4>
                  <p className="text-[10px] text-slate-400">bot</p>
                </div>
              </div>
              
              <div className="p-4 bg-[url('/__mockup/images/guruforge-hero.png')] bg-cover bg-center bg-no-repeat relative">
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
                
                <div className="relative z-10 space-y-3">
                  <div className="text-xs text-center text-slate-500 my-2">Today</div>
                  
                  <div className="bg-emerald-900/40 border border-emerald-500/20 text-emerald-100 rounded-2xl rounded-tl-sm p-3 text-sm max-w-[90%] shadow-lg">
                    Hey! I'm VC Scout Pro. I've initialized my Tier 1 memory with YC's latest cohort data. What sector are we analyzing today?
                  </div>
                  
                  <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tr-sm p-3 text-sm max-w-[90%] ml-auto shadow-lg">
                    Can you cross-reference B2B SaaS valuations from Q3 against our current portfolio?
                  </div>
                  
                  <div className="bg-slate-900/80 border border-slate-700/50 text-slate-300 rounded-2xl rounded-tl-sm p-3 text-sm max-w-[90%] shadow-lg">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                      <Activity className="w-3 h-3" /> Tier 2 Memory Access
                    </div>
                    Processing... I see 4 relevant SaaS companies in your Tier 2 portfolio memory. Synthesizing against public Q3 data now...
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-9 px-4 text-xs text-slate-500 flex items-center">
                  Message...
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/30">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Build Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Base Context</span>
                  <span className="text-slate-300 font-mono">128k tokens</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Est. Latency</span>
                  <span className="text-emerald-400 font-mono">~850ms</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tier 3 Ready</span>
                  <span className="text-slate-300 font-mono">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
      </div>
    </div>
  );
}
