import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  FileSearch,
  FileText,
  Flag,
  Gauge,
  Handshake,
  HelpCircle,
  Layers3,
  Lightbulb,
  Map,
  MapPin,
  MessageCircleQuestion,
  Milestone,
  Play,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

type PanelId =
  | "start"
  | "second-opinion"
  | "other-resources"
  | "pre-discovery"
  | "discovery"
  | "deeper-dive"
  | "strategy"
  | "commitment"
  | "deeper-analysis"
  | "not-fit"
  | "stop"
  | "not-ready"
  | "right-fit"
  | "essential"
  | "enhanced"
  | "elite";

type PanelDefinition = {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  accent: "navy" | "emerald" | "gold" | "slate";
  duration?: string;
  bullets: string[];
  video?: boolean;
  next?: PanelId;
  nextLabel?: string;
};

type QuestionOption = {
  label: string;
  detail: string;
  points: number;
};

type Question = {
  prompt: string;
  helper: string;
  options: QuestionOption[];
};

const panelDefinitions: Record<Exclude<PanelId, "start" | "commitment" | "deeper-analysis" | "not-ready" | "essential" | "enhanced" | "elite">, PanelDefinition> = {
  "second-opinion": {
    title: "Our Second Opinion Service",
    eyebrow: "A clear, pressure-free starting point",
    description:
      "Bring your current plan, questions, or uncertainty. We’ll help you identify what is working, what may be missing, and whether a deeper conversation would be useful.",
    icon: FileSearch,
    accent: "emerald",
    bullets: [
      "A fresh perspective on your current financial direction",
      "A concise review of priorities, gaps, and unanswered questions",
      "A clear recommendation for the most useful next step",
    ],
    video: true,
    next: "pre-discovery",
    nextLabel: "Explore the pre-discovery call",
  },
  "other-resources": {
    title: "Other Paths & Resources",
    eyebrow: "If collaboration is not the next step",
    description:
      "Not every situation needs a wealth-management engagement. This space can connect visitors with educational resources, referral partners, or a future check-in.",
    icon: Search,
    accent: "slate",
    bullets: [
      "Referral-partner directory placeholder",
      "Financial education and planning resources",
      "Option to revisit the roadmap when circumstances change",
    ],
    next: "not-fit",
    nextLabel: "See the not-a-fit outcome",
  },
  "pre-discovery": {
    title: "Pre-Discovery Call",
    eyebrow: "Mile 1",
    description:
      "A focused introductory conversation to understand what prompted your search and decide whether a full discovery meeting makes sense.",
    icon: MessageCircleQuestion,
    accent: "navy",
    duration: "20–30 minutes",
    bullets: [
      "What prompted you to reach out now",
      "Your top priorities, questions, and concerns",
      "Whether our process and capabilities align with your needs",
    ],
    video: true,
    next: "discovery",
    nextLabel: "Continue to Mile 2",
  },
  discovery: {
    title: "Discovery Meeting",
    eyebrow: "Mile 2",
    description:
      "A deeper conversation about your financial life, the people and priorities that matter, and the decisions ahead.",
    icon: Users,
    accent: "navy",
    duration: "60–90 minutes",
    bullets: [
      "Clarify goals, values, constraints, and tradeoffs",
      "Map the major areas of your financial life",
      "Identify information needed for strategy development",
    ],
    next: "strategy",
    nextLabel: "Continue to Mile 3",
  },
  "deeper-dive": {
    title: "Optional Deeper Dive",
    eyebrow: "Additional discovery when useful",
    description:
      "Some situations need more context before strategy work begins. This optional session creates room for family dynamics, business ownership, estate questions, or other complexity.",
    icon: Layers3,
    accent: "gold",
    duration: "60–90 minutes",
    bullets: [
      "Explore one complex planning area in greater detail",
      "Include a spouse, partner, or other decision-maker",
      "Resolve open questions before strategy development",
    ],
    video: true,
    next: "strategy",
    nextLabel: "Return to the main road",
  },
  strategy: {
    title: "Wealth Strategy Meeting",
    eyebrow: "Mile 3",
    description:
      "A working session to organize the opportunities, tradeoffs, and coordinated actions that could move your financial life forward.",
    icon: Compass,
    accent: "navy",
    duration: "60–90 minutes",
    bullets: [
      "Review the planning opportunities we identified",
      "Discuss priorities, sequencing, and key tradeoffs",
      "Clarify what implementation and ongoing guidance could involve",
    ],
    video: true,
    next: "commitment",
    nextLabel: "Continue to Mile 4",
  },
  "not-fit": {
    title: "Not a Good Fit — What Next?",
    eyebrow: "Outcome 5",
    description:
      "A respectful conclusion can still be valuable. We’ll summarize the direction that appears most appropriate and point to useful next resources when possible.",
    icon: Route,
    accent: "slate",
    bullets: [
      "Receive a concise explanation of the fit decision",
      "Explore educational or referral resources",
      "Keep the door open for a future second opinion",
    ],
    next: "other-resources",
    nextLabel: "View other resources",
  },
  stop: {
    title: "Stop Point — No Change Needed",
    eyebrow: "Outcome 4",
    description:
      "The current approach may already be serving you well. This outcome provides a clear stopping point without creating pressure to make an unnecessary change.",
    icon: ShieldCheck,
    accent: "slate",
    bullets: [
      "Confirm what appears to be working",
      "Document any items worth monitoring",
      "Return to the roadmap if needs or circumstances change",
    ],
  },
  "right-fit": {
    title: "Right Fit — Let’s Go!",
    eyebrow: "Mile 5 · Outcome 1",
    description:
      "You are ready to move forward. This prototype shows how a simple onboarding handoff could make the next steps clear and easy to complete.",
    icon: Flag,
    accent: "emerald",
    bullets: [
      "Choose the service experience that best matches your needs",
      "Schedule an onboarding conversation",
      "Receive a secure checklist for agreements and information gathering",
    ],
  },
};

const questions: Question[] = [
  {
    prompt: "What brought you to this roadmap today?",
    helper: "Choose the statement that feels closest to your situation.",
    options: [
      { label: "I’m simply learning", detail: "No immediate decision or change", points: 0 },
      { label: "I have a few planning questions", detail: "I want clarity on a specific issue", points: 2 },
      { label: "My financial life feels increasingly complex", detail: "Several decisions need coordination", points: 3 },
    ],
  },
  {
    prompt: "How coordinated does your financial picture feel?",
    helper: "Think about investments, taxes, estate planning, insurance, and major goals.",
    options: [
      { label: "Well coordinated", detail: "The major pieces work together", points: 0 },
      { label: "Partly coordinated", detail: "Some pieces may be disconnected", points: 2 },
      { label: "Hard to see the whole picture", detail: "I’m unsure what may be missing", points: 3 },
    ],
  },
  {
    prompt: "Do you currently work with a financial advisor?",
    helper: "There is no wrong answer—this simply helps shape the next step.",
    options: [
      { label: "Yes, and I feel confident", detail: "I’m mainly looking for education", points: 0 },
      { label: "Yes, but I want a second opinion", detail: "I would value another perspective", points: 2 },
      { label: "No, or I’m not sure the relationship fits", detail: "I may need a new approach", points: 3 },
    ],
  },
  {
    prompt: "Are you approaching a meaningful transition?",
    helper: "Examples include retirement, a business transition, inheritance, relocation, or loss.",
    options: [
      { label: "Not right now", detail: "No major transition on the horizon", points: 0 },
      { label: "Possibly in the next few years", detail: "I want to prepare thoughtfully", points: 2 },
      { label: "Yes—soon or already underway", detail: "Decisions are becoming time-sensitive", points: 3 },
    ],
  },
  {
    prompt: "What kind of next step would feel most useful?",
    helper: "Your answer helps us suggest where to explore next.",
    options: [
      { label: "Educational resources", detail: "I’m not ready for a conversation", points: 0 },
      { label: "A brief introductory call", detail: "I want to test the fit", points: 2 },
      { label: "A deeper planning conversation", detail: "I’m ready to organize the full picture", points: 3 },
    ],
  },
];

const services = {
  essential: {
    label: "Essential",
    kicker: "Focused guidance",
    description: "For clients who want coordinated advice around a defined set of priorities and decisions.",
    color: "#0bbf80",
    features: ["Core planning priorities", "Investment coordination", "Regular progress conversations"],
  },
  enhanced: {
    label: "Enhanced",
    kicker: "Broader coordination",
    description: "For clients whose wealth, tax, estate, and family decisions benefit from a more integrated planning rhythm.",
    color: "#069c70",
    features: ["Integrated wealth strategy", "Expanded planning coordination", "More frequent proactive reviews"],
  },
  elite: {
    label: "Elite",
    kicker: "High-complexity stewardship",
    description: "For families, executives, and business owners navigating layered decisions and ongoing complexity.",
    color: "#087a58",
    features: ["Complex planning oversight", "Professional-team coordination", "High-touch decision support"],
  },
} as const;

const accentClasses = {
  navy: "panel-accent-navy",
  emerald: "panel-accent-emerald",
  gold: "panel-accent-gold",
  slate: "panel-accent-slate",
};

function VideoPlaceholder({ title }: { title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <button
      type="button"
      className={`video-placeholder ${playing ? "is-playing" : ""}`}
      onClick={() => {
        setPlaying(!playing);
        if (!playing) toast.success("Video placeholder activated", { description: "Replace this with your YouTube, Vimeo, or Wistia embed." });
      }}
      aria-label={`${playing ? "Pause" : "Play"} ${title} overview video placeholder`}
    >
      <div className="video-grid" aria-hidden="true" />
      <div className="video-content">
        <span className="video-play"><Play size={20} fill="currentColor" /></span>
        <span>
          <strong>{playing ? "Preview playing" : "Watch the overview"}</strong>
          <small>{playing ? "Video embed placeholder" : "2-minute video placeholder"}</small>
        </span>
      </div>
      {playing && <span className="video-progress" aria-hidden="true" />}
    </button>
  );
}

function ServiceButtons({ onOpen, compact = false }: { onOpen: (id: PanelId) => void; compact?: boolean }) {
  return (
    <div className={compact ? "tier-buttons compact" : "tier-buttons"} aria-label="Service levels">
      {(Object.keys(services) as Array<keyof typeof services>).map((key) => (
        <button
          type="button"
          key={key}
          onClick={() => onOpen(key)}
          className="tier-button"
          style={{ "--tier-color": services[key].color } as React.CSSProperties}
        >
          <span>{services[key].label}</span>
          <ChevronRight size={compact ? 14 : 16} />
        </button>
      ))}
    </div>
  );
}

function MilestoneButton({
  mile,
  title,
  duration,
  icon: Icon,
  onClick,
  active,
  visited,
  shape = "card",
}: {
  mile: number;
  title: string;
  duration?: string;
  icon: LucideIcon;
  onClick: () => void;
  active: boolean;
  visited: boolean;
  shape?: "card" | "stop";
}) {
  return (
    <div className="milestone-wrap">
      <span className="mile-marker">MILE <b>{mile}</b></span>
      <button
        type="button"
        onClick={onClick}
        className={`milestone-card ${shape === "stop" ? "stop-shape" : ""} ${active ? "is-active" : ""} ${visited ? "is-visited" : ""}`}
        aria-pressed={active}
      >
        <span className="milestone-icon"><Icon size={20} /></span>
        <span className="milestone-title">{title}</span>
        {duration && <span className="milestone-duration">{duration}</span>}
        <span className="milestone-arrow"><ArrowRight size={15} /></span>
      </button>
    </div>
  );
}

function BranchButton({
  label,
  outcome,
  tone,
  icon: Icon,
  onClick,
}: {
  label: string;
  outcome?: string;
  tone: "gold" | "slate" | "emerald";
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`branch-button branch-${tone}`} onClick={onClick}>
      <span className="branch-icon"><Icon size={17} /></span>
      <span>
        <strong>{label}</strong>
        {outcome && <small>{outcome}</small>}
      </span>
      <ChevronRight size={15} className="branch-chevron" />
    </button>
  );
}

export default function Home() {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [visited, setVisited] = useState<Set<PanelId>>(new Set());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [questionnaireDone, setQuestionnaireDone] = useState(false);
  const [serviceContext, setServiceContext] = useState("Exploring the roadmap");

  const openPanel = (id: PanelId, context?: string) => {
    if (context) setServiceContext(context);
    setActivePanel(id);
    setVisited((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  const closePanel = () => setActivePanel(null);

  const resetQuestionnaire = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setQuestionnaireDone(false);
  };

  const answerQuestion = (points: number) => {
    const nextAnswers = [...answers.slice(0, questionIndex), points];
    setAnswers(nextAnswers);
    if (questionIndex === questions.length - 1) {
      setQuestionnaireDone(true);
    } else {
      setQuestionIndex((current) => current + 1);
    }
  };

  const questionnaireResult = useMemo(() => {
    const total = answers.reduce((sum, value) => sum + value, 0);
    if (total <= 3) {
      return {
        label: "Start with education",
        copy: "Your answers suggest that resources and a future check-in may be the most useful next step.",
        destination: "other-resources" as PanelId,
        cta: "Explore resources",
        icon: Lightbulb,
      };
    }
    if (total <= 9) {
      return {
        label: "Consider a pre-discovery call",
        copy: "A brief, low-pressure conversation could help clarify your questions and whether deeper planning would be useful.",
        destination: "pre-discovery" as PanelId,
        cta: "Explore the call",
        icon: MessageCircleQuestion,
      };
    }
    return {
      label: "A deeper conversation may help",
      copy: "Your answers point to several connected decisions. Discovery may help organize the full picture before action is taken.",
      destination: "discovery" as PanelId,
      cta: "Explore discovery",
      icon: Compass,
    };
  }, [answers]);

  const activeDefinition = activePanel && !["start", "commitment", "deeper-analysis", "not-ready", "essential", "enhanced", "elite"].includes(activePanel)
    ? panelDefinitions[activePanel as keyof typeof panelDefinitions]
    : null;

  const service = activePanel && ["essential", "enhanced", "elite"].includes(activePanel)
    ? services[activePanel as keyof typeof services]
    : null;

  const milestoneIds: PanelId[] = ["pre-discovery", "discovery", "strategy", "commitment", "right-fit"];
  const progress = milestoneIds.filter((id) => visited.has(id)).length;

  const placeholderAction = (label: string) => {
    toast.success(`${label} is ready to connect`, {
      description: "This prototype button can be replaced with your live scheduler, form, or resource URL.",
    });
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <span aria-hidden="true" />
        <div className="header-meta">
          <span className="prototype-pill"><Sparkles size={13} /> Interactive prototype</span>
          <button type="button" className="reset-link" onClick={() => {
            setVisited(new Set());
            resetQuestionnaire();
            toast("Journey reset");
          }}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><Map size={15} /> MY LIFE ROADMAP · E3 METHOD</div>
            <h1>Right Fit <em>Roadmap</em></h1>
            <p className="hero-subtitle">Is it time to collaborate?</p>
            <p className="hero-intro">
              Explore each stop to understand the conversation, the possible outcomes, and the service experiences ahead.
            </p>
          </div>
          <div className="journey-status" aria-label={`Journey progress: ${progress} of 5 miles explored`}>
            <div className="status-topline">
              <span>Journey progress</span>
              <strong>{progress}/5 miles</strong>
            </div>
            <div className="progress-track"><span style={{ width: `${(progress / 5) * 100}%` }} /></div>
            <p>Click any roadmap stop. Your explored stops will be marked with a check.</p>
          </div>
        </section>

        <section className="kickoff-section" aria-labelledby="kickoff-title">
          <div className="start-gate">
            <div className="gate-post left" aria-hidden="true" />
            <button type="button" className="start-button" onClick={() => openPanel("start")}>
              <span className="start-icon"><Gauge size={22} /></span>
              <span>
                <small>YOUR STARTING POINT</small>
                <strong id="kickoff-title">Do I Need Wealth Management?</strong>
                <em>Take the 5-question check-in <ArrowRight size={15} /></em>
              </span>
            </button>
            <div className="gate-post right" aria-hidden="true" />
          </div>
          <div className="entry-paths">
            <span className="entry-label">Or explore another entry point</span>
            <div className="entry-buttons">
              <button type="button" onClick={() => openPanel("second-opinion")}>
                <FileSearch size={18} /><span><strong>Second Opinion</strong><small>A fresh perspective</small></span><ChevronRight size={16} />
              </button>
              <button type="button" onClick={() => openPanel("other-resources")}>
                <Search size={18} /><span><strong>Other Resources</strong><small>Referrals & education</small></span><ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="map-section" aria-labelledby="roadmap-heading">
          <div className="section-heading">
            <div>
              <span className="section-kicker">THE COLLABORATION JOURNEY</span>
              <h2 id="roadmap-heading">Follow the main road—or explore a branch.</h2>
            </div>
            <div className="legend" aria-label="Roadmap legend">
              <span><i className="dot main" /> Main road</span>
              <span><i className="dot branch" /> Decision point</span>
              <span><i className="dot outcome" /> Outcome</span>
            </div>
          </div>

          <div className="outcome-rail">
            <div className="outcome-rail-label"><Milestone size={16} /> Possible decision outcomes</div>
            <div className="outcome-grid">
              <BranchButton label="Not a Good Fit: What Next?" outcome="Outcome 5" tone="slate" icon={Route} onClick={() => openPanel("not-fit")} />
              <div className="analysis-cluster">
                <BranchButton label="Need Deeper Analysis" outcome="Outcome 3" tone="gold" icon={FileSearch} onClick={() => openPanel("deeper-analysis")} />
                <ServiceButtons compact onOpen={(id) => openPanel(id, "Following deeper analysis")} />
              </div>
              <BranchButton label="Stop Point: No Change Needed" outcome="Outcome 4" tone="slate" icon={ShieldCheck} onClick={() => openPanel("stop")} />
            </div>
          </div>

          <div className="roadmap-canvas">
            <div className="road-surface" aria-hidden="true"><span className="road-dashes" /></div>
            <div className="journey-grid">
              <MilestoneButton mile={1} title="Pre-Discovery Call" duration="20–30 minutes" icon={MessageCircleQuestion} onClick={() => openPanel("pre-discovery")} active={activePanel === "pre-discovery"} visited={visited.has("pre-discovery")} />
              <MilestoneButton mile={2} title="Discovery Meeting" duration="60–90 minutes" icon={Users} onClick={() => openPanel("discovery")} active={activePanel === "discovery"} visited={visited.has("discovery")} />
              <MilestoneButton mile={3} title="Wealth Strategy Meeting" duration="60–90 minutes" icon={Compass} onClick={() => openPanel("strategy")} active={activePanel === "strategy"} visited={visited.has("strategy")} />
              <MilestoneButton mile={4} title="Mutual Commitment Meeting" icon={Handshake} onClick={() => openPanel("commitment")} active={activePanel === "commitment"} visited={visited.has("commitment")} shape="stop" />
              <MilestoneButton mile={5} title="Right Fit — Let’s Go!" icon={Flag} onClick={() => openPanel("right-fit")} active={activePanel === "right-fit"} visited={visited.has("right-fit")} />
            </div>
          </div>

          <div className="lower-branches">
            <div className="lower-branch optional-branch">
              <span className="branch-route" aria-hidden="true" />
              <BranchButton label="Optional Deeper Dive" outcome="60–90 minutes" tone="gold" icon={Layers3} onClick={() => openPanel("deeper-dive")} />
            </div>
            <div className="lower-branch ready-branch">
              <span className="branch-route" aria-hidden="true" />
              <BranchButton label="Right Fit — Not Ready Yet" outcome="Outcome 2" tone="gold" icon={CalendarDays} onClick={() => openPanel("not-ready")} />
              <ServiceButtons compact onOpen={(id) => openPanel(id, "A right fit—not ready yet")} />
            </div>
            <div className="service-destination">
              <span className="service-label"><CheckCircle2 size={16} /> Outcome 1 · Choose your path</span>
              <ServiceButtons onOpen={(id) => openPanel(id, "Ready to move forward")} />
            </div>
          </div>
        </section>

        <section className="prototype-note">
          <div>
            <Sparkles size={20} />
            <span><strong>This is a clickable content prototype.</strong><small>Questionnaire logic, videos, scheduling, forms, and destination links can all be replaced with finalized content.</small></span>
          </div>
          <Button className="prototype-cta" onClick={() => openPanel("start")}>Start the check-in <ArrowRight size={16} /></Button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">Mossy Creek Wealth <span>·</span> Right Fit Roadmap</div>
        <p>Prototype content only. This experience does not provide investment, tax, or legal advice.</p>
      </footer>

      <Sheet open={activePanel !== null} onOpenChange={(open) => !open && closePanel()}>
        <SheetContent side="right" className="roadmap-sheet">
          <div className="sheet-scroll">
            {activePanel === "start" && (
              <>
                <SheetHeader className="sheet-header">
                  <div className="panel-icon panel-accent-emerald"><ClipboardCheck size={22} /></div>
                  <div>
                    <span className="panel-eyebrow">5-QUESTION CHECK-IN</span>
                    <SheetTitle>Do I Need Wealth Management?</SheetTitle>
                    <SheetDescription>This educational prototype suggests a place to explore. It is not financial advice or a qualification decision.</SheetDescription>
                  </div>
                </SheetHeader>

                {!questionnaireDone ? (
                  <div className="questionnaire">
                    <div className="question-progress">
                      <span>Question {questionIndex + 1} of {questions.length}</span>
                      <div>{questions.map((_, index) => <i key={index} className={index <= questionIndex ? "complete" : ""} />)}</div>
                    </div>
                    <div className="question-copy">
                      <h3>{questions[questionIndex].prompt}</h3>
                      <p>{questions[questionIndex].helper}</p>
                    </div>
                    <div className="answer-list">
                      {questions[questionIndex].options.map((option) => (
                        <button key={option.label} type="button" onClick={() => answerQuestion(option.points)}>
                          <span className="answer-radio" />
                          <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                          <ChevronRight size={17} />
                        </button>
                      ))}
                    </div>
                    {questionIndex > 0 && (
                      <button type="button" className="back-question" onClick={() => setQuestionIndex((current) => current - 1)}>
                        <ArrowLeft size={14} /> Previous question
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="question-result">
                    <div className="result-celebration"><questionnaireResult.icon size={28} /></div>
                    <span className="panel-eyebrow">SUGGESTED PLACE TO EXPLORE</span>
                    <h3>{questionnaireResult.label}</h3>
                    <p>{questionnaireResult.copy}</p>
                    <div className="result-disclaimer"><HelpCircle size={16} />This is a simple prototype recommendation based only on the five answers above.</div>
                    <Button className="sheet-primary" onClick={() => openPanel(questionnaireResult.destination)}>{questionnaireResult.cta} <ArrowRight size={16} /></Button>
                    <Button variant="outline" className="sheet-secondary" onClick={resetQuestionnaire}><RotateCcw size={15} /> Retake the check-in</Button>
                  </div>
                )}
              </>
            )}

            {activeDefinition && (
              <>
                <SheetHeader className="sheet-header">
                  <div className={`panel-icon ${accentClasses[activeDefinition.accent]}`}><activeDefinition.icon size={22} /></div>
                  <div>
                    <span className="panel-eyebrow">{activeDefinition.eyebrow}</span>
                    <SheetTitle>{activeDefinition.title}</SheetTitle>
                    <SheetDescription>{activeDefinition.description}</SheetDescription>
                  </div>
                </SheetHeader>
                {activeDefinition.duration && <div className="duration-card"><CalendarDays size={17} /><span><small>ESTIMATED TIME</small><strong>{activeDefinition.duration}</strong></span></div>}
                <div className="panel-section">
                  <h3>What this stop can cover</h3>
                  <ul className="check-list">
                    {activeDefinition.bullets.map((bullet) => <li key={bullet}><span><Check size={14} /></span>{bullet}</li>)}
                  </ul>
                </div>
                {activeDefinition.video && <VideoPlaceholder title={activeDefinition.title} />}
                {activePanel === "right-fit" && (
                  <div className="panel-section service-choice">
                    <h3>Explore a service experience</h3>
                    <p>These descriptions are placeholders for finalized service positioning.</p>
                    <ServiceButtons onOpen={(id) => openPanel(id, "Ready to move forward")} />
                  </div>
                )}
                <div className="sheet-actions">
                  {activePanel !== "not-fit" && activePanel !== "other-resources" && activePanel !== "stop" && (
                    <Button className="sheet-primary" onClick={() => placeholderAction(activePanel === "right-fit" ? "Onboarding" : "Scheduling")}>{activePanel === "right-fit" ? "Begin onboarding" : "Open scheduler"} <CalendarDays size={16} /></Button>
                  )}
                  {activeDefinition.next && (
                    <Button variant="outline" className="sheet-secondary" onClick={() => openPanel(activeDefinition.next!)}>{activeDefinition.nextLabel} <ArrowRight size={15} /></Button>
                  )}
                  {activePanel === "stop" && <Button className="sheet-primary" onClick={closePanel}>Return to the roadmap <MapPin size={16} /></Button>}
                </div>
              </>
            )}

            {activePanel === "commitment" && (
              <>
                <SheetHeader className="sheet-header">
                  <div className="panel-icon panel-accent-emerald"><Handshake size={22} /></div>
                  <div>
                    <span className="panel-eyebrow">MILE 4 · DECISION POINT</span>
                    <SheetTitle>Mutual Commitment Meeting</SheetTitle>
                    <SheetDescription>A clear conversation about fit, expectations, readiness, and the most appropriate next step.</SheetDescription>
                  </div>
                </SheetHeader>
                <div className="panel-section">
                  <h3>Choose a prototype outcome</h3>
                  <p className="section-explainer">Each choice below follows a different branch of the roadmap.</p>
                  <div className="decision-list">
                    <button type="button" onClick={() => openPanel("right-fit")}><span className="decision-icon green"><Flag size={18} /></span><span><strong>Ready to move forward</strong><small>Continue to Mile 5 and onboarding</small></span><ArrowRight size={17} /></button>
                    <button type="button" onClick={() => openPanel("not-ready")}><span className="decision-icon gold"><CalendarDays size={18} /></span><span><strong>Right fit—not ready yet</strong><small>Explore timing and a future reconnection</small></span><ArrowRight size={17} /></button>
                    <button type="button" onClick={() => openPanel("deeper-analysis")}><span className="decision-icon gold"><FileSearch size={18} /></span><span><strong>Need deeper analysis</strong><small>Gather more information before deciding</small></span><ArrowRight size={17} /></button>
                    <button type="button" onClick={() => openPanel("stop")}><span className="decision-icon slate"><ShieldCheck size={18} /></span><span><strong>No change needed</strong><small>Conclude with a clear stopping point</small></span><ArrowRight size={17} /></button>
                    <button type="button" onClick={() => openPanel("not-fit")}><span className="decision-icon slate"><Route size={18} /></span><span><strong>Not a good fit</strong><small>Explore other resources and next steps</small></span><ArrowRight size={17} /></button>
                  </div>
                </div>
              </>
            )}

            {activePanel === "deeper-analysis" && (
              <>
                <SheetHeader className="sheet-header">
                  <div className="panel-icon panel-accent-gold"><FileSearch size={22} /></div>
                  <div>
                    <span className="panel-eyebrow">OUTCOME 3</span>
                    <SheetTitle>Need Deeper Analysis</SheetTitle>
                    <SheetDescription>More information or focused analysis may be needed before either party can make a confident fit decision.</SheetDescription>
                  </div>
                </SheetHeader>
                <div className="panel-section">
                  <h3>A deeper look might include</h3>
                  <ul className="check-list">
                    <li><span><Check size={14} /></span>Additional financial documents or planning context</li>
                    <li><span><Check size={14} /></span>A focused analysis of one high-impact decision</li>
                    <li><span><Check size={14} /></span>Clarification of scope, timing, or service needs</li>
                  </ul>
                </div>
                <div className="panel-section service-choice">
                  <h3>Explore possible service levels</h3>
                  <ServiceButtons onOpen={(id) => openPanel(id, "Following deeper analysis")} />
                </div>
                <div className="sheet-actions">
                  <Button className="sheet-primary" onClick={() => placeholderAction("Deeper-analysis questionnaire")}>Open deeper questionnaire <FileText size={16} /></Button>
                  <Button variant="outline" className="sheet-secondary" onClick={() => openPanel("commitment")}>Return to the decision point <ArrowLeft size={15} /></Button>
                </div>
              </>
            )}

            {activePanel === "not-ready" && (
              <>
                <SheetHeader className="sheet-header">
                  <div className="panel-icon panel-accent-gold"><CalendarDays size={22} /></div>
                  <div>
                    <span className="panel-eyebrow">OUTCOME 2</span>
                    <SheetTitle>Right Fit — Not Ready Yet</SheetTitle>
                    <SheetDescription>The relationship appears promising, but timing, preparation, or another decision needs to come first.</SheetDescription>
                  </div>
                </SheetHeader>
                <div className="panel-section">
                  <h3>Create a thoughtful pause</h3>
                  <ul className="check-list">
                    <li><span><Check size={14} /></span>Summarize what makes the relationship a potential fit</li>
                    <li><span><Check size={14} /></span>Identify the event or date that should trigger a reconnection</li>
                    <li><span><Check size={14} /></span>Share the most relevant service-level information</li>
                  </ul>
                </div>
                <div className="panel-section service-choice">
                  <h3>Preview the future path</h3>
                  <ServiceButtons onOpen={(id) => openPanel(id, "A right fit—not ready yet")} />
                </div>
                <div className="sheet-actions">
                  <Button className="sheet-primary" onClick={() => placeholderAction("Follow-up reminder")}>Choose a reconnection date <CalendarDays size={16} /></Button>
                  <Button variant="outline" className="sheet-secondary" onClick={() => openPanel("commitment")}>Return to the decision point <ArrowLeft size={15} /></Button>
                </div>
              </>
            )}

            {service && (
              <>
                <SheetHeader className="sheet-header">
                  <div className="panel-icon" style={{ background: `${service.color}18`, color: service.color }}><Sparkles size={22} /></div>
                  <div>
                    <span className="panel-eyebrow">{serviceContext.toUpperCase()}</span>
                    <SheetTitle>{service.label}</SheetTitle>
                    <SheetDescription>{service.description}</SheetDescription>
                  </div>
                </SheetHeader>
                <div className="service-hero" style={{ "--service-color": service.color } as React.CSSProperties}>
                  <span>{service.kicker}</span>
                  <strong>{service.label}</strong>
                  <div className="service-orbit" aria-hidden="true"><i /><i /><i /></div>
                </div>
                <div className="panel-section">
                  <h3>Prototype highlights</h3>
                  <ul className="check-list">
                    {service.features.map((feature) => <li key={feature}><span><Check size={14} /></span>{feature}</li>)}
                  </ul>
                  <p className="service-disclaimer">Service names and descriptions are placeholder copy for experience testing and should be replaced with approved language.</p>
                </div>
                <VideoPlaceholder title={`${service.label} service`} />
                <div className="sheet-actions">
                  <Button className="sheet-primary" style={{ background: service.color }} onClick={() => placeholderAction(`${service.label} information request`)}>Request more information <ArrowRight size={16} /></Button>
                  <Button variant="outline" className="sheet-secondary" onClick={() => openPanel("right-fit")}>Return to Mile 5 <ArrowLeft size={15} /></Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
