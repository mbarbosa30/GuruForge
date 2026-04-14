import React, { useState } from "react";
import { Settings, BrainCircuit, Activity, Rocket, ArrowRight, Database, Globe, Code, Calendar, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const STEPS = [
  { id: 1, title: "General" },
  { id: 2, title: "Intelligence" },
  { id: 3, title: "Tools" },
  { id: 4, title: "Review" },
];

const MODELS = [
  { id: "gpt4o", name: "GPT-4o", provider: "OpenAI", speed: "Fast", cost: "$$$", recommended: true },
  { id: "claude35", name: "Claude 3.5 Sonnet", provider: "Anthropic", speed: "Very Fast", cost: "$$", recommended: false },
  { id: "gemini15", name: "Gemini 1.5 Pro", provider: "Google", speed: "Medium", cost: "$$", recommended: false },
];

export function CreatorFlow() {
  const [activeStep, setActiveStep] = useState(2);
  const [selectedModel, setSelectedModel] = useState("gpt4o");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">New Guru Configuration</span>
            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">Draft</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-slate-600">Cancel</Button>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">Save Draft</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-10 max-w-5xl flex flex-col lg:flex-row gap-12">
        
        {/* Form Column */}
        <div className="flex-1 max-w-2xl">
          
          {/* Text Stepper */}
          <div className="flex items-center gap-2 mb-10 text-sm font-medium">
            {STEPS.map((step, index) => {
              const isActive = activeStep === step.id;
              const isPast = step.id < activeStep;
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center gap-2 ${isActive ? 'text-blue-600' : isPast ? 'text-slate-900' : 'text-slate-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${isActive ? 'border-blue-600 bg-blue-50' : isPast ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50'}`}>
                      {step.id}
                    </span>
                    <span className="hidden sm:inline">{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200 mx-2"></div>}
                </React.Fragment>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-2">Intelligence Core</h2>
              <p className="text-slate-600 text-sm">Select the foundation model and memory architecture.</p>
            </div>

            <section className="space-y-5">
              <Label className="text-base font-semibold">Foundation Model</Label>
              <div className="grid sm:grid-cols-3 gap-4">
                {MODELS.map((model) => (
                  <div 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`relative p-4 rounded-lg border cursor-pointer transition-all bg-white ${
                      selectedModel === model.id 
                        ? 'border-blue-600 ring-1 ring-blue-600/20' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {model.recommended && (
                      <span className="absolute -top-2.5 right-3 bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                        Recommended
                      </span>
                    )}
                    <h4 className="font-medium text-slate-900 mb-1">{model.name}</h4>
                    <p className="text-xs text-slate-500 mb-4">{model.provider}</p>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                      <span className="text-slate-500">{model.speed}</span>
                      <span className="font-medium text-slate-700">{model.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <Label htmlFor="api-key" className="text-base font-semibold">Provider API Key</Label>
              <Input 
                id="api-key" 
                type="password" 
                placeholder="sk-..." 
                className="bg-white border-slate-200 font-mono text-sm max-w-md"
              />
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Keys are encrypted at rest. You keep 100% of revenue minus platform fees, but are responsible for your own inference costs.
              </p>
            </section>

            <hr className="border-slate-200" />

            <section className="space-y-6">
              <Label className="text-base font-semibold">Memory Settings</Label>

              <div className="p-5 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-900 text-sm">Subscriber State (Tier 2)</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Maintain continuous context windows for individual users across sessions.
                  </p>
                </div>
                <Switch id="t2-memory" defaultChecked />
              </div>

              <div className="p-5 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="font-medium text-slate-900 text-sm">Collective Learning (Tier 3)</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Contribute anonymized insights to the global calibration loop to earn royalties.
                  </p>
                </div>
                <Switch id="t3-memory" defaultChecked />
              </div>
            </section>

            <div className="pt-6 flex justify-between">
              <Button variant="outline" className="border-slate-200">Back</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Next: Tools
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="h-8" />
          </div>
        </div>

        {/* Sidebar Preview */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Configuration Summary</h3>
            
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded border border-slate-200 bg-white flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-900">Untitled Guru</h4>
                  <p className="text-xs text-slate-500">Draft</p>
                </div>
              </div>
              
              <div className="p-4 space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Model</span>
                  <span className="font-medium text-slate-900">GPT-4o</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Tier 2 Memory</span>
                  <span className="font-medium text-slate-900">Enabled</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Tier 3 Learning</span>
                  <span className="font-medium text-slate-900">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Latency</span>
                  <span className="font-medium text-slate-900">~600ms</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
      </div>
    </div>
  );
}
