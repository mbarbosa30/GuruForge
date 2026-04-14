import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateGuru, useListCategories, useUpdateTelegramBotToken } from "@workspace/api-client-react";
import type { Category, CreateGuruInput } from "@workspace/api-client-react";
import Layout from "@/components/layout";

const STEPS = ["Identity", "Purpose", "Intelligence", "Memory", "Pricing", "Review"] as const;
type Step = (typeof STEPS)[number];

const PERSONALITY_OPTIONS = [
  { value: "professional", label: "Professional", desc: "Formal, precise, business-oriented" },
  { value: "friendly", label: "Friendly", desc: "Warm, approachable, conversational" },
  { value: "direct", label: "Direct", desc: "Concise, no-nonsense, action-oriented" },
  { value: "academic", label: "Academic", desc: "Thorough, research-focused, analytical" },
] as const;

const MODEL_TIERS = [
  { value: "gpt", label: "GPT", desc: "Versatile, reliable, ecosystem-rich", detail: "Powered by GPT-5.4 for conversations" },
  { value: "grok", label: "Grok", desc: "Fast, truthful, real-time wisdom", detail: "Powered by Grok-3 for conversations" },
] as const;

interface FormData {
  name: string;
  tagline: string;
  description: string;
  categoryId: number | null;
  avatarUrl: string;
  topics: string[];
  topicInput: string;
  targetUsers: string;
  notFor: string;
  languagePreference: string;
  personalityStyle: "professional" | "friendly" | "direct" | "academic";
  modelTier: "gpt" | "grok";
  memoryPersonal: boolean;
  memoryShared: boolean;
  introEnabled: boolean;
  priceCents: number;
  freeTrial: boolean;
}

const INITIAL: FormData = {
  name: "",
  tagline: "",
  description: "",
  categoryId: null,
  avatarUrl: "",
  topics: [],
  topicInput: "",
  targetUsers: "",
  notFor: "",
  languagePreference: "English",
  personalityStyle: "friendly",
  modelTier: "gpt",
  memoryPersonal: true,
  memoryShared: true,
  introEnabled: false,
  priceCents: 2900,
  freeTrial: false,
};

function StepIndicator({ current, maxCompleted, onJump }: { current: number; maxCompleted: number; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const isReachable = i <= maxCompleted;
        return (
          <button
            key={step}
            onClick={() => isReachable && i !== current && onJump(i)}
            disabled={!isReachable}
            className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] uppercase transition-colors whitespace-nowrap ${
              i === current
                ? "text-[#111] border-b-2 border-[#111]"
                : isReachable
                  ? "text-[#555] border-b-2 border-[#ccc] cursor-pointer hover:text-[#111]"
                  : "text-[#bbb] border-b-2 border-transparent cursor-default"
            }`}
            data-testid={`step-${i}`}
          >
            <span className="text-[10px] font-semibold">{String(i + 1).padStart(2, "0")}</span>
            <span className="hidden sm:inline">{step}</span>
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] block mb-2"
    >
      {children}
    </label>
  );
}

function TextInput({
  id, value, onChange, placeholder, required, maxLength,
}: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; maxLength?: number;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      className="w-full h-10 px-4 border border-[#ddd] bg-white text-sm text-[#111] placeholder:text-[#bbb] outline-none focus:border-[#999] transition-colors"
      data-testid={`input-${id}`}
    />
  );
}

function TextArea({
  id, value, onChange, placeholder, rows = 3,
}: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 border border-[#ddd] bg-white text-sm text-[#111] placeholder:text-[#bbb] outline-none focus:border-[#999] transition-colors resize-none"
      data-testid={`input-${id}`}
    />
  );
}

function StepIdentity({
  data, onChange, categories,
}: {
  data: FormData; onChange: (d: Partial<FormData>) => void; categories: Category[];
}) {
  return (
    <div className="space-y-6 max-w-[560px]">
      <div>
        <FieldLabel htmlFor="name">Name *</FieldLabel>
        <TextInput id="name" value={data.name} onChange={(v) => onChange({ name: v })} placeholder="e.g. DeFi Strategist" required />
      </div>
      <div>
        <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
        <TextInput id="tagline" value={data.tagline} onChange={(v) => onChange({ tagline: v })} placeholder="A short hook for your Guru" maxLength={120} />
      </div>
      <div>
        <FieldLabel htmlFor="category">Category</FieldLabel>
        <select
          id="category"
          value={data.categoryId ?? ""}
          onChange={(e) => onChange({ categoryId: e.target.value ? Number(e.target.value) : null })}
          className="w-full h-10 px-3 border border-[#ddd] bg-white text-sm text-[#555] outline-none focus:border-[#999] cursor-pointer"
          data-testid="input-category"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <TextArea id="description" value={data.description} onChange={(v) => onChange({ description: v })} placeholder="What does your Guru do? What makes it unique?" rows={4} />
      </div>
      <div>
        <FieldLabel htmlFor="avatarUrl">Avatar URL (optional)</FieldLabel>
        <TextInput id="avatarUrl" value={data.avatarUrl} onChange={(v) => onChange({ avatarUrl: v })} placeholder="https://example.com/avatar.png" />
      </div>
    </div>
  );
}

function StepPurpose({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const addTopic = () => {
    const t = data.topicInput.trim();
    if (t && !data.topics.includes(t)) {
      onChange({ topics: [...data.topics, t], topicInput: "" });
    }
  };

  const removeTopic = (topic: string) => {
    onChange({ topics: data.topics.filter((t) => t !== topic) });
  };

  return (
    <div className="space-y-6 max-w-[560px]">
      <div>
        <FieldLabel>Core topics</FieldLabel>
        <p className="text-[13px] text-[#777] mb-3 leading-[1.6]">
          Add the key topics your Guru specializes in. These help users discover your Guru.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={data.topicInput}
            onChange={(e) => onChange({ topicInput: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTopic(); } }}
            placeholder="Type a topic and press Enter"
            className="flex-1 h-10 px-4 border border-[#ddd] bg-white text-sm text-[#111] placeholder:text-[#bbb] outline-none focus:border-[#999] transition-colors"
            data-testid="input-topic"
          />
          <button
            type="button"
            onClick={addTopic}
            className="h-10 px-4 border border-[#ddd] text-[11px] font-medium tracking-[0.04em] uppercase text-[#555] hover:border-[#999] transition-colors cursor-pointer"
            data-testid="button-add-topic"
          >
            Add
          </button>
        </div>
        {data.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.topics.map((topic) => (
              <span key={topic} className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.04em] uppercase px-3 py-1 border border-[#e0e0e0] text-[#555]">
                {topic}
                <button
                  type="button"
                  onClick={() => removeTopic(topic)}
                  className="text-[#aaa] hover:text-[#555] cursor-pointer text-[14px] leading-none"
                  aria-label={`Remove ${topic}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <FieldLabel htmlFor="targetUsers">Target users</FieldLabel>
        <TextArea id="targetUsers" value={data.targetUsers} onChange={(v) => onChange({ targetUsers: v })} placeholder="Who is this Guru for? What kind of users benefit most?" />
      </div>
      <div>
        <FieldLabel htmlFor="notFor">What it's NOT for</FieldLabel>
        <TextArea id="notFor" value={data.notFor} onChange={(v) => onChange({ notFor: v })} placeholder="What should users NOT expect from this Guru?" />
      </div>
    </div>
  );
}

function OptionCard({
  selected, onClick, label, desc, detail, testId,
}: {
  selected: boolean; onClick: () => void; label: string; desc: string; detail?: string; testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 border transition-colors cursor-pointer w-full ${
        selected ? "border-[#111] bg-[#fafafa]" : "border-[#e0e0e0] bg-white hover:border-[#999]"
      }`}
      data-testid={testId}
    >
      <span className={`text-[13px] font-semibold block mb-1 ${selected ? "text-[#111]" : "text-[#555]"}`}>{label}</span>
      <span className="text-[12px] text-[#888] leading-[1.4] block">{desc}</span>
      {detail && <span className="text-[11px] text-[#aaa] leading-[1.4] block mt-1">{detail}</span>}
    </button>
  );
}

function StepIntelligence({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-8 max-w-[560px]">
      <div>
        <FieldLabel>Model tier</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e0e0e0]">
          {MODEL_TIERS.map((tier) => (
            <OptionCard
              key={tier.value}
              selected={data.modelTier === tier.value}
              onClick={() => onChange({ modelTier: tier.value })}
              label={tier.label}
              desc={tier.desc}
              detail={tier.detail}
              testId={`option-tier-${tier.value}`}
            />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Personality style</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e0e0e0]">
          {PERSONALITY_OPTIONS.map((style) => (
            <OptionCard
              key={style.value}
              selected={data.personalityStyle === style.value}
              onClick={() => onChange({ personalityStyle: style.value })}
              label={style.label}
              desc={style.desc}
              testId={`option-style-${style.value}`}
            />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="languagePreference">Language preference</FieldLabel>
        <TextInput
          id="languagePreference"
          value={data.languagePreference}
          onChange={(v) => onChange({ languagePreference: v })}
          placeholder="e.g. English, Spanish, Multilingual"
        />
        <p className="text-[12px] text-[#888] mt-2">Primary language your Guru communicates in.</p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, desc, testId }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; desc: string; testId: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start gap-4 p-4 border border-[#e0e0e0] w-full text-left cursor-pointer hover:border-[#999] transition-colors"
      data-testid={testId}
    >
      <div className={`w-10 h-5 flex-shrink-0 mt-0.5 border transition-colors relative ${
        checked ? "bg-[#111] border-[#111]" : "bg-[#eee] border-[#ddd]"
      }`}>
        <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white transition-all ${checked ? "left-[calc(100%-18px)]" : "left-0.5"}`} />
      </div>
      <div>
        <span className="text-[13px] font-semibold text-[#111] block mb-0.5">{label}</span>
        <span className="text-[12px] text-[#888] leading-[1.4] block">{desc}</span>
      </div>
    </button>
  );
}

function StepMemory({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-6 max-w-[560px]">
      <div>
        <FieldLabel>Memory & privacy settings</FieldLabel>
        <p className="text-[13px] text-[#777] mb-4 leading-[1.6]">
          Control how your Guru remembers and learns. Personal memory stores individual user context. Shared pattern learning aggregates anonymous insights across all users.
        </p>
        <div className="space-y-3">
          <Toggle
            checked={data.memoryPersonal}
            onChange={(v) => onChange({ memoryPersonal: v })}
            label="Personal memory"
            desc="Remember each user's context, preferences, and history privately."
            testId="toggle-memory-personal"
          />
          <Toggle
            checked={data.memoryShared}
            onChange={(v) => onChange({ memoryShared: v })}
            label="Shared pattern learning"
            desc="Learn aggregated, anonymous patterns from all users to improve advice."
            testId="toggle-memory-shared"
          />
          <Toggle
            checked={data.introEnabled}
            onChange={(v) => onChange({ introEnabled: v })}
            label="Intro suggestions"
            desc="Suggest warm introductions between users when relevant (consent-based)."
            testId="toggle-intro"
          />
        </div>
      </div>
    </div>
  );
}

function StepPricing({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const dollars = (data.priceCents / 100).toFixed(2);

  const handlePriceChange = (raw: string) => {
    const parsed = parseFloat(raw);
    if (raw === "" || isNaN(parsed) || parsed < 0) {
      onChange({ priceCents: 0 });
      return;
    }
    onChange({ priceCents: Math.round(parsed * 100) });
  };

  return (
    <div className="space-y-6 max-w-[560px]">
      <div>
        <FieldLabel htmlFor="price">Monthly price (USD)</FieldLabel>
        <div className="flex items-center gap-2">
          <span className="text-[15px] text-[#555]">$</span>
          <input
            id="price"
            type="number"
            min="0"
            step="1"
            value={dollars}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="w-32 h-10 px-4 border border-[#ddd] bg-white text-sm text-[#111] outline-none focus:border-[#999] transition-colors"
            data-testid="input-price"
          />
          <span className="text-[13px] text-[#888]">/ month</span>
        </div>
        {data.priceCents === 0 && (
          <p className="text-[12px] text-[#888] mt-2">Free Gurus are available to all users at no cost.</p>
        )}
      </div>
      {data.priceCents > 0 && (
        <Toggle
          checked={data.freeTrial}
          onChange={(v) => onChange({ freeTrial: v })}
          label="Free trial"
          desc="Let new users try your Guru before committing to a subscription."
          testId="toggle-free-trial"
        />
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-[#f0f0f0] last:border-0">
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] min-w-[120px]">{label}</span>
      <span className="text-[13px] text-[#333] text-right">{value || <span className="text-[#ccc]">Not set</span>}</span>
    </div>
  );
}

function StepReview({ data, categories }: { data: FormData; categories: Category[] }) {
  const catName = categories.find((c) => c.id === data.categoryId)?.name;
  return (
    <div className="max-w-[560px]">
      <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">Review your Guru</p>
      <p className="text-[13px] text-[#777] mb-6 leading-[1.6]">
        Double-check everything below. Once published, your Guru will appear on the marketplace.
      </p>
      <div className="border border-[#e0e0e0] p-5">
        <ReviewRow label="Name" value={data.name} />
        <ReviewRow label="Tagline" value={data.tagline} />
        <ReviewRow label="Category" value={catName} />
        <ReviewRow label="Description" value={data.description ? <span className="line-clamp-3">{data.description}</span> : null} />
        <ReviewRow label="Target users" value={data.targetUsers} />
        <ReviewRow label="Not for" value={data.notFor} />
        <ReviewRow label="Topics" value={data.topics.length > 0 ? data.topics.join(", ") : null} />
        <ReviewRow label="AI model" value={<span>Powered by {data.modelTier === "gpt" ? "GPT" : "Grok"}</span>} />
        <ReviewRow label="Personality" value={<span className="capitalize">{data.personalityStyle}</span>} />
        <ReviewRow label="Language" value={data.languagePreference} />
        <ReviewRow label="Personal memory" value={data.memoryPersonal ? "On" : "Off"} />
        <ReviewRow label="Shared learning" value={data.memoryShared ? "On" : "Off"} />
        <ReviewRow label="Introductions" value={data.introEnabled ? "Enabled" : "Disabled"} />
        <ReviewRow label="Price" value={data.priceCents === 0 ? "Free" : `$${(data.priceCents / 100).toFixed(2)}/month`} />
        {data.priceCents > 0 && <ReviewRow label="Free trial" value={data.freeTrial ? "Enabled" : "Disabled"} />}
      </div>
    </div>
  );
}

function buildMemoryPolicy(data: FormData): string {
  return JSON.stringify({
    personalMemory: data.memoryPersonal,
    sharedLearning: data.memoryShared,
    language: data.languagePreference.trim() || undefined,
  });
}

function buildDescription(data: FormData): string {
  const parts: string[] = [];
  if (data.description.trim()) parts.push(data.description.trim());
  if (data.targetUsers.trim()) parts.push(`Target users: ${data.targetUsers.trim()}`);
  if (data.notFor.trim()) parts.push(`Not for: ${data.notFor.trim()}`);
  if (data.freeTrial && data.priceCents > 0) parts.push("Free trial available.");
  return parts.join("\n\n");
}

function validateStep(step: number, data: FormData): string | null {
  switch (step) {
    case 0:
      if (!data.name.trim()) return "Name is required.";
      if (data.name.trim().length < 2) return "Name must be at least 2 characters.";
      return null;
    case 1:
      if (data.topics.length === 0) return "Add at least one topic.";
      return null;
    case 2:
      if (!data.languagePreference.trim()) return "Language preference is required.";
      return null;
    case 3:
      return null;
    case 4:
      if (isNaN(data.priceCents) || data.priceCents < 0) return "Enter a valid price.";
      return null;
    case 5:
      if (!data.name.trim()) return "Name is required.";
      if (data.topics.length === 0) return "At least one topic is required.";
      if (isNaN(data.priceCents) || data.priceCents < 0) return "Enter a valid price.";
      return null;
    default:
      return null;
  }
}

export default function CreateGuru() {
  const { authenticated, ready, login } = usePrivy();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  if (!authenticated) {
    return (
      <Layout>
        <div className="px-6 md:px-10 py-16 text-center max-w-[500px] mx-auto">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">Sign in required</p>
          <h1 className="text-[32px] font-light tracking-[-0.03em] text-[#111] mb-3">Create a Guru</h1>
          <p className="text-[15px] text-[#777] mb-8">You need to sign in to create a Guru.</p>
          <button
            onClick={() => login()}
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors cursor-pointer border-none"
          >
            Sign In
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <CreateGuruWizard />
    </Layout>
  );
}

function CreateGuruWizard() {
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [error, setError] = useState<string | null>(null);

  const { data: categories = [] } = useListCategories();
  const createMutation = useCreateGuru();

  const update = (partial: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setError(null);
  };

  const next = () => {
    const err = validateStep(step, data);
    if (err) { setError(err); return; }
    const nextStep = Math.min(step + 1, STEPS.length - 1);
    setStep(nextStep);
    setMaxStep((m) => Math.max(m, nextStep));
    setError(null);
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    setError(null);
  };

  const publish = () => {
    const err = validateStep(5, data);
    if (err) { setError(err); return; }

    const body: CreateGuruInput = {
      name: data.name.trim(),
      tagline: data.tagline.trim() || undefined,
      description: buildDescription(data) || undefined,
      categoryId: data.categoryId ?? undefined,
      avatarUrl: data.avatarUrl.trim() || undefined,
      priceCents: data.priceCents,
      priceInterval: "monthly",
      topics: data.topics.length > 0 ? data.topics : undefined,
      personalityStyle: data.personalityStyle,
      modelTier: data.modelTier,
      memoryPolicy: buildMemoryPolicy(data),
      introEnabled: data.introEnabled,
    };

    createMutation.mutate({ data: body });
  };

  if (createMutation.isSuccess) {
    const guru = createMutation.data;
    return <PostPublishPage guru={guru} />;
  }

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-[700px] mx-auto">
      <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">Forge your Guru</p>
      <h1 className="text-[32px] md:text-[40px] font-light tracking-[-0.03em] leading-[1.1] text-[#111] mb-8">
        {STEPS[step]}
      </h1>

      <StepIndicator current={step} maxCompleted={maxStep} onJump={(i) => { setStep(i); setError(null); }} />

      {step === 0 && <StepIdentity data={data} onChange={update} categories={categories} />}
      {step === 1 && <StepPurpose data={data} onChange={update} />}
      {step === 2 && <StepIntelligence data={data} onChange={update} />}
      {step === 3 && <StepMemory data={data} onChange={update} />}
      {step === 4 && <StepPricing data={data} onChange={update} />}
      {step === 5 && <StepReview data={data} categories={categories} />}

      {error && (
        <p className="text-[13px] text-red-600 mt-4" data-testid="form-error">{error}</p>
      )}

      {createMutation.isError && (
        <p className="text-[13px] text-red-600 mt-4" data-testid="api-error">
          Failed to publish your Guru. Please try again.
        </p>
      )}

      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#e0e0e0]">
        {step > 0 && (
          <button
            type="button"
            onClick={prev}
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-[#555] bg-white px-7 py-3 border border-[#ddd] hover:border-[#999] hover:text-[#333] transition-colors cursor-pointer"
            data-testid="button-back"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button
            type="button"
            onClick={next}
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 border border-[#111] hover:bg-[#333] transition-colors cursor-pointer"
            data-testid="button-next"
          >
            Next
          </button>
        )}
        {step === STEPS.length - 1 && (
          <button
            type="button"
            onClick={publish}
            disabled={createMutation.isPending}
            className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 border border-[#111] hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
            data-testid="button-publish"
          >
            {createMutation.isPending ? "Publishing..." : "Publish Guru"}
          </button>
        )}
      </div>
    </div>
  );
}

function PostPublishPage({ guru }: { guru: { id: number; name: string; slug: string } }) {
  const [botToken, setBotToken] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const tokenMutation = useUpdateTelegramBotToken();

  const handleSaveToken = async () => {
    if (!botToken.trim()) return;
    setTokenError(null);
    try {
      const result = await tokenMutation.mutateAsync({
        guruId: guru.id,
        data: { botToken: botToken.trim() },
      });
      if (result.success) {
        setTokenSaved(true);
        setBotUsername(result.botUsername ?? null);
      }
    } catch {
      setTokenError("Invalid bot token. Please check the token from BotFather.");
    }
  };

  return (
    <div className="px-6 md:px-10 py-16 max-w-[560px] mx-auto">
      <div className="text-center mb-10">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-3">Published</p>
        <h2 className="text-[32px] font-light tracking-[-0.03em] text-[#111] mb-3">{guru.name} is live</h2>
        <p className="text-[15px] text-[#777] mb-6">Your Guru is now on the marketplace.</p>
        <Link
          href={`/guru/${guru.slug}`}
          className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
          data-testid="link-view-guru"
        >
          View Guru Profile
        </Link>
      </div>

      <div className="border-t border-[#e0e0e0] pt-8">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2">Connect Telegram</p>
        <p className="text-[15px] text-[#777] mb-6 leading-[1.6]">
          To enable conversations, connect a Telegram bot. Create one via{" "}
          <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[#111] underline">
            @BotFather
          </a>{" "}
          on Telegram and paste the token below.
        </p>

        {tokenSaved ? (
          <div className="border border-[#c8e0c8] bg-[#f0f8f0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#2a7a2a] text-[16px]">&#10003;</span>
              <span className="text-[13px] font-medium text-[#2a7a2a]">Bot connected</span>
            </div>
            {botUsername && (
              <p className="text-[13px] text-[#555]">
                @{botUsername} is ready to receive messages.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] block mb-1.5">
                Bot Token
              </label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456:ABC-DEF1234..."
                className="w-full h-10 px-4 border border-[#ddd] bg-white text-sm text-[#111] font-mono outline-none focus:border-[#999] transition-colors"
                data-testid="input-bot-token"
              />
            </div>
            {tokenError && (
              <p className="text-[12px] text-[#c44]">{tokenError}</p>
            )}
            <button
              onClick={handleSaveToken}
              disabled={!botToken.trim() || tokenMutation.isPending}
              className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 border border-[#111] hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50"
              data-testid="button-save-token"
            >
              {tokenMutation.isPending ? "Verifying..." : "Connect Bot"}
            </button>
            <p className="text-[11px] text-[#bbb]">
              You can also configure this later from your Guru's settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
