"use client";

import type { ReactNode, MouseEvent, FormEvent } from "react";
import { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";

const SECTION_IDS = ["hero", "projects", "experience", "lab", "contact"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Intro",
  projects: "Projects",
  experience: "Experience",
  lab: "Lab",
  contact: "Contact",
};

const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "lab", label: "Lab" },
  { id: "contact", label: "Contact" },
];

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  // Cursor-following glow
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    cursorX.set(window.innerWidth / 2);
    cursorY.set(window.innerHeight / 2);
  }, [cursorX, cursorY]);

  // Section in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          const id = visible[0].target.id as SectionId;
          setActiveSection(id);
        }
      },
      { threshold: [0.25, 0.4, 0.6] }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Command palette shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const scrollTo = (id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 antialiased"
      onMouseMove={handleMouseMove}
    >
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400"
      />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0ea5e9_0,_transparent_55%),radial-gradient(circle_at_bottom,_#7c3aed_0,_transparent_55%)] opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(15,23,42,0.5)_60%,rgba(15,23,42,0.95)_100%)]" />
      </div>

      {/* Soft blobs */}
      <motion.div
        className="pointer-events-none fixed -top-40 -left-24 z-[-20] h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="pointer-events-none fixed -bottom-40 -right-24 z-[-20] h-80 w-80 rounded-full bg-violet-500/30 blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Cursor spotlight */}
      <motion.div
        style={{ x: cursorX, y: cursorY }}
        className="pointer-events-none fixed z-[-10] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.55),transparent_65%)] opacity-40 blur-3xl"
      />

      {/* Page container */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Header activeSection={activeSection} onNavClick={scrollTo} />
        <main className="mt-8 space-y-32">
          <Hero />
          <ValueProp />
          <Projects />
          <Experience />
          <Lab />
          <Contact />
        </main>
      </div>

      <SectionRail activeSection={activeSection} onNavClick={scrollTo} />
      <BottomDock onNavClick={scrollTo} />

      <AgentChat /> {/* Local RohitAI widget */}

      {/* Command palette trigger */}
      <button
        onClick={() => setIsCommandOpen(true)}
        className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full border border-cyan-400/60 bg-slate-950/80 px-3 py-2 text-xs text-cyan-100 shadow-lg shadow-cyan-500/40 backdrop-blur hover:bg-slate-900 md:flex"
>

      
        <span className="hidden sm:inline">Command menu</span>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">
          ⌘K / Ctrl+K
        </span>
      </button>

      <CommandPalette
        open={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavClick={(id) => {
          setIsCommandOpen(false);
          scrollTo(id);
        }}
      />
    </div>
  );
}

/* ---------- HEADER & NAV RAIL ---------- */

function Header({
  activeSection,
  onNavClick,
}: {
  activeSection: SectionId;
  onNavClick: (id: SectionId) => void;
}) {
  return (
    <header className="sticky top-3 z-50">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-lg shadow-black/40 backdrop-blur-xl">
        <button
          onClick={() => onNavClick("hero")}
          className="flex items-center gap-2"
        >
          <div className="relative h-8 w-8 rounded-2xl border border-cyan-400/60 bg-black/60 shadow-lg shadow-cyan-500/30">
            <div className="absolute inset-[6px] rounded-xl bg-gradient-to-br from-cyan-400/70 via-sky-400/70 to-violet-500/70 opacity-70" />
          </div>
          <div className="text-left">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/90">
  Rohit Sharma
</p>
<p className="text-xs text-slate-400 sm:text-sm">
  Machine Learning · Systems · Product
</p>


          </div>
        </button>

        <nav className="hidden items-center gap-4 text-xs text-slate-300 sm:flex md:gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                className={[
                  "relative rounded-full px-3 py-1 transition",
                  isActive
                    ? "text-cyan-300"
                    : "text-slate-300 hover:text-cyan-200",
                ].join(" ")}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-cyan-500/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function SectionRail({
  activeSection,
  onNavClick,
}: {
  activeSection: SectionId;
  onNavClick: (id: SectionId) => void;
}) {
  return (
    <nav className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex">
      {SECTION_IDS.map((id) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => onNavClick(id)}
            className="group relative flex h-3 w-3 items-center justify-center"
          >
            <span className="sr-only">{SECTION_LABELS[id]}</span>
            <span
              className={[
                "h-2 w-2 rounded-full border transition",
                isActive
                  ? "scale-125 border-cyan-300 bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.9)]"
                  : "border-slate-500 bg-slate-800 group-hover:border-cyan-300 group-hover:bg-cyan-300",
              ].join(" ")}
            />
            <span className="pointer-events-none absolute left-[-0.5rem] translate-x-[-100%] rounded-full bg-slate-900/90 px-2 py-1 text-[10px] text-slate-100 opacity-0 shadow-lg shadow-black/40 backdrop-blur transition group-hover:opacity-100">
              {SECTION_LABELS[id]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- BOTTOM DOCK ---------- */

function BottomDock({ onNavClick }: { onNavClick: (id: SectionId) => void }) {
  const items: { id: SectionId; label: string; icon: string }[] = [
    { id: "hero", label: "Home", icon: "🏠" },
    { id: "projects", label: "Projects", icon: "🛰️" },
    { id: "experience", label: "Experience", icon: "📡" },
    { id: "lab", label: "Lab", icon: "🧪" },
    { id: "contact", label: "Contact", icon: "📬" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 shadow-[0_12px_40px_rgba(15,23,42,0.9)] backdrop-blur md:hidden">
      <div className="flex items-end gap-2">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onNavClick(item.id)}
            whileHover={{ scale: 1.25, y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center px-2 pt-1 text-[9px] text-slate-300"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="mt-0.5">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}


/* ---------- HERO (Apple / Colab notebook) ---------- */

function Hero() {
  
  const roles = [
    "Applied ML Engineer",
    "End-to-end Systems Builder",
    "Experiment-driven Researcher",
    "Product-minded Engineer",
  ];
  
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setRoleIndex((prev) => (prev + 1) % roles.length),
      2500
    );
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <section id="hero" className="pt-10">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-5"
      >
        {/* Inner glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),transparent_65%)] opacity-80" />

        {/* Status bar */}
        <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-950/90 px-3 py-2 text-[10px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-cyan-300">
              ROHITOS
            </span>
            <span className="text-slate-400">
              Build 2025 · ML Control Deck
            </span>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              GPU OK
            </span>
            <span className="text-slate-400">
              Notebook kernel • Python 3 (GPU)
            </span>
          </div>
        </div>

        {/* Main: left copy + notebook */}
        <div className="relative grid gap-6 md:grid-cols-[1.7fr,2fr] md:gap-8">
          {/* Left text */}
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-black/40 px-3 py-1 text-[11px] font-medium text-cyan-200 shadow-lg shadow-cyan-500/30 backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              Open to ML / CV internships · 2026
            </p>

            <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-[2.6rem]">
  Deploying machine learning{" "}
  <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
    at every altitude.
  </span>
  <br />
  <span className="text-xl text-gray-400">
  From messy data to reliable decisions.
  </span>
</h1>

              <p className="max-w-xl text-sm text-slate-300 sm:text-[0.95rem] mt-3">
  I&apos;m Rohit Sharma, a Master&apos;s student in Computer &amp; Information Science at the University of Pennsylvania.
  I like problems where a notebook demo isn&apos;t enough: taking noisy data, many stakeholders, and hard constraints
  and turning them into ML systems that people rely on from drone and Jetson pipelines, to zoning and geospatial
  indices, to campus-scale LLM platforms and lunar computer-vision tools. I care about clear metrics, honest trade-offs,
  and whether the thing actually holds up outside the lab.
</p>

            </div>

            {/* Rotating role line */}
            <div className="mt-1 text-sm text-slate-400 sm:text-base">
              <span className="text-slate-500">Currently operating as </span>
              <span className="inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={roles[roleIndex]}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="font-medium text-cyan-200"
                  >
                    {roles[roleIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Tag>Machine Learning</Tag>
              <Tag>Computer Vision</Tag>
              <Tag>Geospatial AI</Tag>
              <Tag>Startups</Tag>
            </div>

            <HeroTelemetry />

            {/* CTAs */}
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-4">
                <a
                  href="#projects"
                  className="rounded-xl bg-cyan-400/90 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:bg-cyan-300"
                >
                  See 30-second impact view
                </a>
                <a
                  href="/Rohit_Sharma_CV.pdf"
                  target="_blank"
                  rel="noreferrer"
>
                  Download CV
                  </a>

              </div>
              <p className="text-[10px] text-slate-500 sm:text-[11px]">
                Designed for busy reviewers: impact first, buzzwords second. The
                projects section is your TL;DR if you only have half a minute.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 sm:text-xs">
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400 sm:text-xs">
  <Badge>Penn CIS · ML</Badge>
  <Badge>11x Patent Holder</Badge>
  <Badge>2× Best Paper Award</Badge>

</div>

            </div>

            <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400 sm:text-xs">
              <span className="h-[1px] w-10 bg-slate-600" />
              <span>
                Hover the notebook on the right: each cell is one world I work
                in.
              </span>
            </div>
          </div>

          {/* Right: Apple-style notebook window */}
          <NotebookWindow />
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- NOTEBOOK WINDOW (Apple + Colab) ---------- */

function NotebookWindow() {
  const pages = [
    {
      id: "fields",
      label: "Fields.ipynb",
      badge: "Krishikalyan · precision agri",
      gradient: "from-emerald-300/30 via-emerald-500/25 to-cyan-300/30",
      codeLines: [
        "import torch, torchvision as tv",
        "from vision.models import CropHealthNet",
        "",
        "images = drone_stream(region=\"Madhya Pradesh\")",
        "y_pred = CropHealthNet().infer(images)",
        "sprayer_plan = optimize_chemicals(y_pred, target='-40% usage')",
      ],
      resultTitle: "Run [1] • farm_2025.pilot",
      metrics: [
        { label: "Chemicals saved", value: "-40%" },
        { label: "Yield lift", value: "+15%" },
        { label: "Acres mapped", value: "1,800+" },
      ],
    },
    {
      id: "cities",
      label: "Cities.ipynb",
      badge: "National Zoning Atlas",
      gradient: "from-sky-400/35 via-cyan-400/20 to-violet-400/30",
      codeLines: [
        "from zoning_llm import parse_ordinance",
        "from gis import parcels, join, compute_restrictive_index",
        "",
        "pdf = load_pdf('Section_14-506_RM-2.pdf')",
        "rules = parse_ordinance(pdf, model='gpt-4o')",
        "zri = compute_restrictive_index(rules, parcels)",
      ],
      resultTitle: "Run [24] • restrictive_index_map",
      metrics: [
        { label: "Municipalities", value: "1,200+" },
        { label: "Rows normalized", value: "85M+" },
        { label: "Parsing boost", value: "~40% ↑" },
      ],
    },
    {
      id: "orbit",
      label: "Orbit.ipynb",
      badge: "ISRO · Chandrayaan-2",
      gradient: "from-amber-300/35 via-rose-400/25 to-violet-500/35",
      codeLines: [
        "from moonvision import CraterDetector, Captioner",
        "",
        "img = load_lro_tile('ch2_orbit_17342.png')",
        "craters = CraterDetector(backbone='yolov9-vit').infer(img)",
        "captions = Captioner().describe(img, craters)",
      ],
      resultTitle: "Run [7] • crater_catalogue",
      metrics: [
        { label: "Analyst time", value: "-25%" },
        { label: "Research projects", value: "3+" },
        { label: "Domain", value: "Lunar CV 🌕" },
      ],
    },
  ];

  const [index, setIndex] = useState(0);
  const active = pages[index];

  // auto-rotate pages
  useEffect(() => {
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % pages.length),
      7000
    );
    return () => clearInterval(id);
  }, [pages.length]);

  // tilt
  const baseX = useMotionValue(0);
  const baseY = useMotionValue(0);
  const smoothX = useSpring(baseX, {
    stiffness: 160,
    damping: 20,
    mass: 0.3,
  });
  const smoothY = useSpring(baseY, {
    stiffness: 160,
    damping: 20,
    mass: 0.3,
  });
  const rotateX = useTransform(smoothY, (v) => v * -8);
  const rotateY = useTransform(smoothX, (v) => v * 8);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
    const yNorm = (e.clientY - rect.top) / rect.height - 0.5;
    baseX.set(xNorm);
    baseY.set(yNorm);
  };

  const handleLeave = () => {
    baseX.set(0);
    baseY.set(0);
  };

  return (
    <motion.div
      className="relative flex w-full flex-col gap-3 md:gap-4"
      style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* Main window */}
      <div
        className="relative mx-auto w-full max-w-md rounded-[26px] border border-white/12 bg-slate-950/90 shadow-[0_30px_90px_rgba(15,23,42,0.95)] backdrop-blur-xl md:max-w-none"
        style={{ transform: "translateZ(30px)" }}
      >
        {/* Apple traffic lights */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-[11px] text-slate-300">
              RohitNotebook • {active.label}
            </span>
          </div>
          <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-400">
            Python 3 • GPU
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 px-3 py-2 text-[11px]">
          {pages.map((p, i) => {
            const isActive = i === index;
            return (
              <button
                key={p.id}
                onClick={() => setIndex(i)}
                className={[
                  "rounded-full px-3 py-1 transition",
                  isActive
                    ? "bg-slate-900 text-cyan-200"
                    : "text-slate-400 hover:text-cyan-100",
                ].join(" ")}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="relative overflow-hidden rounded-b-[26px]"
          >
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${active.gradient}`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.7),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),transparent_60%)]" />

            <div className="relative grid gap-3 px-4 py-3 text-[11px] text-slate-50 md:px-5 md:py-4 md:grid-cols-[1.1fr,1fr]">
              {/* Left: code cell */}
              <div className="rounded-2xl bg-slate-950/75 p-3 shadow-inner shadow-black/50">
                <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono text-emerald-300">In [ ]:</span>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] text-slate-400">
                    {active.badge}
                  </span>
                </div>
                <div className="mt-1 flex">
                  <div className="mr-3 mt-0.5 flex flex-col items-end text-[10px] text-slate-500">
                    {active.codeLines.map((_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>
                  <div className="flex-1 space-y-0.5 font-mono text-[10px] leading-relaxed">
                    {active.codeLines.map((line, i) => (
                      <div key={i} className="relative">
                        {i === 3 && (
                          <motion.div
                            layoutId="highlight-line"
                            className="absolute inset-0 rounded-md bg-cyan-500/10"
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                            }}
                          />
                        )}
                        <span className="relative z-10">
                          {line === "" ? "\u00A0" : line}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: output / metrics */}
              <div className="flex flex-col gap-2">
                <div className="rounded-2xl bg-slate-950/75 p-3 shadow-inner shadow-black/50">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-sky-300">
                      Out [✓]: {active.resultTitle}
                    </span>
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] text-emerald-300">
                      kernel • idle
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                    {active.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl border border-white/25 bg-slate-900/80 px-2 py-1.5"
                      >
                        <p className="text-[9px] text-slate-400">{m.label}</p>
                        <p className="mt-0.5 text-xs font-semibold">
                          {m.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/20 bg-black/30 px-3 py-2 text-[10px] text-slate-200">
                  This is how I think about ML work: as notebooks that directly
                  manipulate reality in{" "}
                  <span className="text-cyan-200">fields</span>,{" "}
                  <span className="text-cyan-200">cities</span>, and{" "}
                  <span className="text-cyan-200">orbit</span>.
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom legend */}
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{ transform: "translateZ(10px)" }}
      >
        <div className="flex flex-wrap gap-2 text-[10px]">
          {pages.map((p, i) => {
            const isActive = i === index;
            return (
              <button
                key={p.id}
                onClick={() => setIndex(i)}
                className={[
                  "rounded-full border px-3 py-1.5 transition",
                  isActive
                    ? "border-cyan-300 bg-cyan-400/90 text-slate-950 shadow-lg shadow-cyan-500/40"
                    : "border-slate-700/80 bg-slate-950/80 text-slate-100 hover:border-cyan-300/70 hover:text-cyan-100",
                ].join(" ")}
              >
                {p.id === "fields" && "Fields · crops"}
                {p.id === "cities" && "Cities · zoning"}
                {p.id === "orbit" && "Orbit · lunar"}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="hidden sm:inline">Auto-cycling notebook</span>
          <div className="flex items-center gap-1">
            {pages.map((_, i) => {
              const isActive = i === index;
              return (
                <span
                  key={i}
                  className={[
                    "h-1.5 w-6 rounded-full bg-slate-700/70",
                    isActive ? "bg-cyan-400" : "",
                  ].join(" ")}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- SMALL UI HELPERS ---------- */

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-xs text-slate-200">
      {children}
    </span>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-slate-700/60 bg-slate-950/70 px-2.5 py-1">
      {children}
    </span>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
        {label}
      </p>
      <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

/* ---------- HERO TELEMETRY ---------- */

function HeroTelemetry() {
  const items = [
    {
      label: "Models shipped",
      value: "6+",
      hint: "Across agri, zoning & space",
    },
    {
      label: "Flights / month",
      value: "90+",
      hint: "Drone ops for Krishikalyan",
    },
    {
      label: "Cities analyzed",
      value: "1,200+",
      hint: "Municipalities in zoning work",
    },
  ];

  return (
    <div className="mt-3 grid gap-2 text-[11px] text-slate-200 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-700/70 bg-slate-950/80 px-3 py-2 shadow-inner shadow-black/40"
        >
          <p className="text-[10px] text-slate-400">{item.label}</p>
          <p className="text-sm font-semibold text-cyan-200">{item.value}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- VALUE PROP ---------- */

function ValueProp() {
  const items = [
    {
      title: "ML that survives the real world",
      body: "From lunar craters to crop disease, I design models with careful evaluation, ablations, and monitoring—so they work beyond the benchmark page.",
    },
    {
      title: "Geospatial + zoning expertise",
      body: "I build pipelines that connect messy zoning PDFs, GIS data, and statistical models to answer real housing-policy questions.",
    },
    {
      title: "End-to-end product mindset",
      body: "Founder experience means I care about latency, UX, deployment, and whether the solution actually helps the person using it.",
    },
  ];

  return (
    <section className="space-y-6">
      <SectionHeader
        label="What I do"
        title="Where I bring the most leverage"
      />
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-black/40 backdrop-blur-sm"
          >
            <h3 className="text-sm font-semibold text-slate-50">
              {item.title}
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {item.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- PROJECTS (MISSION LOG) ---------- */

function Projects() {
  // ---------- Flagship (Krishikalyan only, not in slider) ----------
  const flagshipMission = {
    name: "Case Study · Krishikalyan field pilots",
    role: "Turning drone ML into something farmers actually trust",
    period: "Jul 2024 – Jul 2025 · Jaipur, India",
    summary:
      "We weren’t just trying to detect disease; we needed farmers to believe the system enough to change how they spray. That shaped almost every technical and product decision.",
    impact: [
      "Started with a lab-perfect model that farmers didn’t trust due to a few bad predictions; switched to running pilots side-by-side with their existing process and reviewing errors together in the field.",
      "Designed the on-device pipeline on NVIDIA Jetson around what operators actually see: clear “spray / don’t spray” cues, offline-first behavior, and explainable map overlays rather than raw confidence scores.",
      "Agreed with partners on a simple success metric (chemicals -40%, labor -50%, yield +15%) and iterated until we hit it, while keeping ~120 ms p95 latency and 99.9% SLO for 90+ flights/month.",
    ],
    tags: ["Stakeholder alignment", "On-field iteration", "Edge constraints", "Simple success metrics"],
    metrics: [
      { label: "Acres mapped", value: "1,800+" },
      { label: "Chemicals", value: "-40%" },
      { label: "Yield", value: "+15%" },
    ],
  };

  // ---------- Slider missions (no Krishikalyan here) ----------
  const missions = [
    {
      name: "Case Study · Index of Local Zoning",
      role: "Turning messy ordinances into one queryable system",
      period: "Aug 2025 – May 2027 · Wharton Real Estate",
      summary:
        "Housing researchers didn’t need another model; they needed to ask clear questions like “where can we actually build housing?” and get defensible answers from data.",
      impact: [
        "Started by interviewing researchers and policy collaborators to define the real questions (density, use, FAR, setbacks) and designed the zoning index backwards from those queries.",
        "Unified 1,200+ local sources (~12 TB) into AWS/PostGIS while keeping a clear audit trail so every number in the index could be traced back to a section, page, and ordinance snippet.",
        "Used LLMs for zoning PDFs but paired them with topology/CRS checks and manual review loops, trading raw automation for a ~40% accuracy boost and trust from domain experts.",
      ],
      stack: ["User interviews", "Data modeling", "LLM + human review", "Auditability"],
      metricLabelLeft: "Sources unified",
      metricLeft: "1,200+",
      metricLabelRight: "Preprocessing",
      metricRight: "~65% faster",
    },
    {
      name: "Case Study · MUJGPT reliability & safety",
      role: "Making an LLM platform feel instant and safe for a campus",
      period: "Jun 2024 – Jul 2025 · Manipal University Jaipur",
      summary:
        "Students don’t care which model you use; they care if it feels instant, doesn’t break, and won’t leak their data. MUJGPT was about engineering around those expectations.",
      impact: [
        "Instrumented the whole stack with latency, error, and safety metrics before “optimizing”, so changes were driven by dashboards instead of guesses.",
        "Cut p95 latency by 180 ms and token usage by 30% using RAG + CoT, Redis caching, and parallel API calls, while keeping ~220 ms latency and 99.5% uptime at ~25K queries/month.",
        "Implemented PII/toxicity guardrails, role-based access, and audit logs so faculty and IT were comfortable rolling it out to 2,100+ students and using it in real coursework.",
      ],
      stack: ["Reliability", "Observability", "Safety & guardrails", "A/B testing"],
      metricLabelLeft: "Queries / month",
      metricLeft: "~25K",
      metricLabelRight: "Uptime",
      metricRight: "99.5%",
    },
    {
      name: "Case Study · Lunar CV & 3D tools",
      role: "Making computer vision usable for ISRO analysts",
      period: "Aug 2023 – May 2024 · ISRO, Ahmedabad",
      summary:
        "For lunar and Earth observation work, the bar wasn’t just accuracy—it was throughput, reliability, and tools that analysts actually wanted to use.",
      impact: [
        "Led an 11-member effort to operationalize lunar crater detection (YOLOv9 + ViT) at 94% accuracy on 540k images and ~180 images/s, reducing analyst review time by ~25%.",
        "Optimized Cartosat captioning with TorchScript and batching, achieving 3.2× throughput and +4% accuracy (≈91%).",
        "Built a 5 m ResourceSat-2 LISS-IV road dataset and benchmarked ResUNet vs SOTA CNNs, reaching 97.76% accuracy and shipping the first CNN-based road extraction pipeline.",
        "Delivered 3D geospatial tools in Java using Hexagon Luciad with tile caching, adopted in 3 national-level projects.",
      ],
      stack: ["YOLOv9 + ViT", "TorchScript", "LuciadLightspeed", "Dataset design"],
      metricLabelLeft: "Crater accuracy",
      metricLeft: "94%",
      metricLabelRight: "Analyst time",
      metricRight: "-25%",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const card = container.children[index] as HTMLElement | undefined;
    if (!card) return;
    const offset = card.offsetLeft - container.offsetLeft;
    container.scrollTo({ left: offset, behavior: "smooth" });
    setActiveIndex(index);
  };

  const handleArrow = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (activeIndex === 0) return;
      scrollToIndex(activeIndex - 1);
    } else {
      if (activeIndex === missions.length - 1) return;
      scrollToIndex(activeIndex + 1);
    }
  };

  const spotlight = flagshipMission;

  return (
    <section id="projects" className="space-y-6">
      <SectionHeader
        label="Featured work"
        title="Mission log: systems I’ve shipped"
      />
      <p className="text-[11px] text-slate-400 sm:text-xs">
        Each card is a mission: scroll horizontally or use the arrows to swipe
        through the briefings.
      </p>

      {/* ---------- Flagship mission (Krishikalyan only) ---------- */}
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-cyan-400/40 bg-slate-950/80 p-5 shadow-[0_0_45px_rgba(34,211,238,0.45)] backdrop-blur"
      >
        <div className="absolute inset-x-10 -top-24 h-40 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.65),transparent_70%)] opacity-50 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-200">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
              Flagship mission
            </p>
            <h3 className="text-lg font-semibold text-slate-50 sm:text-xl">
              {spotlight.name}
            </h3>
            <p className="text-xs font-medium text-cyan-200">{spotlight.role}</p>
            <p className="text-[11px] text-slate-400">{spotlight.period}</p>
            <p className="mt-2 text-xs text-slate-200 leading-relaxed">
              {spotlight.summary}
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
              {spotlight.impact.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[6px] h-[3px] w-[3px] rounded-full bg-cyan-300" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {spotlight.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Clean real-world impact card */}
          <div className="mt-4 w-full rounded-2xl border border-cyan-400/40 bg-slate-950/80 p-4 text-xs text-slate-100 shadow-lg shadow-cyan-500/30 md:mt-0 md:w-64">
            <p className="text-[11px] font-medium text-cyan-200">
              Real-world impact
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {spotlight.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl bg-slate-900/90 px-2 py-1.5 text-center"
                >
                  <p className="text-[10px] text-slate-400">{m.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-emerald-300">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-slate-500">
              Designed, deployed, and iterated with real farmers in the loop,
              not just in simulation.
            </p>
          </div>
        </div>
      </motion.article>

      {/* ---------- Slider missions (Wharton, MUJGPT, ISRO) ---------- */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 sm:text-xs">
            Mission briefs · {activeIndex + 1} / {missions.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleArrow("prev")}
              className="rounded-full border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-xs text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
              disabled={activeIndex === 0}
            >
              ←
            </button>
            <button
              onClick={() => handleArrow("next")}
              className="rounded-full border border-slate-600/70 bg-slate-900/80 px-2 py-1 text-xs text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
              disabled={activeIndex === missions.length - 1}
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-700/70 scrollbar-track-transparent"
        >
          {missions.map((project, idx) => (
            <motion.article
              key={project.name}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={[
                "relative min-w-[85%] snap-start rounded-2xl border bg-slate-900/80 p-4 shadow-lg shadow-black/40 backdrop-blur-sm sm:min-w-[70%] md:min-w-[55%]",
                idx === activeIndex
                  ? "border-cyan-400/60"
                  : "border-white/10",
              ].join(" ")}
              onClick={() => scrollToIndex(idx)}
            >
              <div className="absolute inset-x-8 -top-16 h-20 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.6),transparent_70%)] opacity-40 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-50">
                    {project.name}
                  </h3>
                  <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] text-slate-300">
                    {project.period}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-cyan-200">
                  {project.role}
                </p>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {project.summary}
                </p>
                <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300">
                  {project.impact.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-[6px] h-[3px] w-[3px] rounded-full bg-cyan-300" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] text-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="flex justify-center gap-2 pt-1">
          {missions.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                className="relative h-2 w-6 rounded-full bg-slate-800/80"
              >
                {isActive && (
                  <motion.span
                    layoutId="mission-dot"
                    className="absolute inset-[1px] rounded-full bg-cyan-400"
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- EXPERIENCE ---------- */

function Experience() {
  const roles = [
    {
      org: "The Wharton School, University of Pennsylvania",
      title: "Research Assistant · Real Estate Department",
      period: "Aug 2025 – May 2027 (expected)",
      detail:
        "Building the Index of Local Zoning and LLM + geospatial pipelines for large-scale housing and land-use research.",
      bullets: [
        "Engineered the Index of Local Zoning on AWS/PostGIS, unifying 1,200+ local sources (~12 TB) into a consistent dataset.",
        "Cut data preprocessing time by ~65% through better ETL design and spatial indexing.",
        "Built an LLM-based zoning PDF pipeline with topology/CRS checks that improved extraction accuracy by ~40%.",
      ],
    },
    {
      org: "Krishikalyan – The Farmer’s Friend",
      title: "Founding Machine Learning Engineer",
      period: "Jul 2024 – Jul 2025",
      detail:
        "End-to-end ownership of ML, edge deployment, and field operations for a precision agriculture startup.",
      bullets: [
        "Launched drone disease detection that mapped 1,800+ acres with 90+ flights/month and generated prescription maps for targeted spraying.",
        "Implemented the smart sprayer’s on-device vision pipeline on NVIDIA Jetson (camera → CNN → thresholded actuation) under tight compute and power budgets.",
        "Delivered INR 5M (~$60K) worth of pilots and measurable impact: chemicals -40%, labor -50%, and yield +15% with 120 ms p95 latency and 99.9% SLO over 90 days.",
      ],
    },
    {
      org: "Manipal University Jaipur",
      title: "Machine Learning Engineer · MUJGPT",
      period: "Jun 2024 – Jul 2025",
      detail:
        "Designed and operated MUJGPT, an LLM platform for students and faculty with strong latency and safety guarantees.",
      bullets: [
        "Served ~25K queries/month at ~220 ms latency and 99.5% uptime.",
        "Reduced p95 latency by 180 ms and token usage by 30% using RAG + Chain-of-Thought, Redis caching, and parallel API calls.",
        "Implemented PII and toxicity guardrails with role-based access and audit logs, adopted by 2,100+ students, with dashboards and A/B tests for UX improvements.",
      ],
    },
    {
      org: "Indian Space Research Organization (ISRO)",
      title: "Machine Learning Engineer Intern · Signal & Image Processing",
      period: "Aug 2023 – May 2024",
      detail:
        "Lunar computer vision and geospatial tooling for Chandrayaan and Earth observation missions.",
      bullets: [
        "Led an 11-member effort to operationalize lunar crater detection (YOLOv9 + ViT) at 94% accuracy on 540k images and ~180 images/s, reducing analyst review time by ~25%.",
        "Optimized Cartosat captioning with TorchScript and batching, achieving 3.2× throughput and +4% accuracy (≈91%).",
        "Created a 5 m ResourceSat-2 LISS-IV road dataset and benchmarked ResUNet vs SOTA CNNs, reaching 97.76% accuracy and establishing the first CNN-based road extraction pipeline.",
        "Shipped 3D geospatial tools in Java using Hexagon Luciad with tile caching, adopted in 3 national-level projects.",
      ],
    },
  ];
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = roles[selectedIndex];

  return (
    <section id="experience" className="space-y-6">
      <SectionHeader
        label="Experience"
        title="Where I’ve been learning and building"
      />

      <div className="grid gap-6 md:grid-cols-[1.3fr_2fr]">
        {/* Timeline */}
        <div className="relative border-l border-slate-700/70 pl-5">
          <div className="absolute left-[-7px] top-0 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.9)]" />
          {roles.map((role, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={role.org}
                onClick={() => setSelectedIndex(idx)}
                className="group mb-4 flex w-full items-start gap-3 text-left last:mb-0"
              >
                <div className="mt-1 flex flex-col items-center">
                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full border transition",
                      isActive
                        ? "border-cyan-300 bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                        : "border-slate-500 bg-slate-900 group-hover:border-cyan-300 group-hover:bg-cyan-300",
                    ].join(" ")}
                  />
                  {idx !== roles.length - 1 && (
                    <span className="mt-1 h-8 w-px bg-slate-700/70" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={[
                        "text-sm font-semibold",
                        isActive ? "text-slate-50" : "text-slate-200",
                      ].join(" ")}
                    >
                      {role.org}
                    </p>
                    <p className="text-[11px] text-slate-400">{role.period}</p>
                  </div>
                  <p className="text-[11px] text-slate-400">{role.title}</p>
                  <p className="mt-1 text-[11px] text-slate-500 group-hover:text-slate-300">
                    {role.detail}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.org}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/40 backdrop-blur-sm"
          >
            <p className="text-xs font-medium text-cyan-200">
              {selected.period}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-slate-50">
              {selected.org}
            </h3>
            <p className="text-[11px] text-slate-300">{selected.title}</p>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {selected.detail}
            </p>
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
              {selected.bullets.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[6px] h-[3px] w-[3px] rounded-full bg-cyan-300" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] text-slate-500">
              Tap different points on the timeline to see how my responsibilities
              and focus evolved.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- LAB ---------- */

function Lab() {
  const topics = [
    {
      id: "agents",
      label: "Agentic AI",
      title: "Agentic AI that can actually run workflows",
      body:
        "I’m exploring how to move from single-shot prompts to agent systems that can plan, call tools, and coordinate multi-step work with humans in the loop.",
      bullets: [
        "Designing small experiments where an agent breaks down a task, chooses tools (code, search, APIs), and reports back with an auditable plan instead of just an answer.",
        "Thinking about evaluation beyond “did it look smart?”  e.g., success rates, tool-call correctness, and how recoverable the system is when it makes a bad step.",
        "Studying emerging frameworks for agent orchestration and memory to see what’s real vs hype, and where they could safely plug into real products.",
      ],
    },
    {
      id: "ondevice",
      label: "On-device LLMs",
      title: "On-device and privacy-preserving LLMs",
      body:
        "The world is moving toward smaller, faster models that can run locally on laptops, phones, and edge devices without sending everything to the cloud.",
      bullets: [
        "Experimenting with open-weight small LLMs and quantization techniques to keep latency low enough for interactive use on consumer hardware.",
        "Exploring hybrid designs where sensitive data stays local, and only anonymized or compressed signals ever leave the device.",
        "Reading up on new compiler/runtime work (GGUF, GPU/CPU mixing, speculative decoding) to understand what’s coming for real-time assistants.",
      ],
    },
    {
      id: "gen3d",
      label: "3D & world models",
      title: "3D generative models and learned world simulators",
      body:
        "I’m interested in how generative models can learn 3D structure and simple physics well enough to help with robotics, AR, and planning in complex environments.",
      bullets: [
        "Following progress in NeRF-style and Gaussian-splatting models that can build editable 3D scenes from a handful of views.",
        "Exploring how world models could be used to cheaply generate edge cases for testing perception and control systems before real-world deployment.",
        "Looking at ways to connect 3D generative models with language and action so agents can not only imagine worlds, but also reason about them.",
      ],
    },
  ];

  const [activeId, setActiveId] = useState<string>(topics[0].id);
  const activeTopic = topics.find((t) => t.id === activeId) ?? topics[0];

  return (
    <section id="lab" className="space-y-6">
      <SectionHeader label="Now" title="What I’m actively exploring next" />
      <div className="grid gap-6 md:grid-cols-[1.3fr_2fr]">
        <div className="flex flex-col gap-3">
          {topics.map((topic) => {
            const isActive = topic.id === activeId;
            return (
              <button
                key={topic.id}
                onClick={() => setActiveId(topic.id)}
                className={[
                  "rounded-xl border px-3 py-2 text-left text-xs sm:text-sm transition",
                  isActive
                    ? "border-cyan-400/70 bg-slate-900/80 text-slate-50 shadow-lg shadow-cyan-500/20"
                    : "border-slate-700/60 bg-slate-950/60 text-slate-300 hover:border-cyan-400/60 hover:text-slate-50",
                ].join(" ")}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
        <motion.div
          key={activeTopic.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/40 backdrop-blur-sm"
        >
          <h3 className="text-sm font-semibold text-slate-50">
            {activeTopic.title}
          </h3>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            {activeTopic.body}
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
            {activeTopic.bullets.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-[6px] h-[3px] w-[3px] rounded-full bg-cyan-300" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}


/* ---------- CONTACT ---------- */

function Contact() {
  return (
    <section id="contact" className="space-y-6">
      <SectionHeader
        label="Contact"
        title="Let’s work on something meaningful"
      />
      <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
        <div className="space-y-3 text-sm text-slate-300">
        <div className="space-y-3 text-sm text-slate-300">
        <p>
  I don&apos;t just train models; I ship them. I&apos;m currently open to Summer
  2026 roles in Machine Learning and Computer Vision. If your team cares as
  much about engineering rigor as it does about research novelty, let&apos;s
  talk.
</p>

  <p className="text-[11px] text-slate-500">
    Before sending the classic &ldquo;after careful consideration, we
    will not be moving forward with your application&rdquo; email,
    maybe give this profile one more scroll instead 😄
  </p>
</div>

        </div>
        <div className="flex flex-wrap gap-3 text-sm">
        <a
          href="mailto:rohitshr57@gmail.com" 
          className="rounded-xl bg-cyan-400/90 px-5 py-2.5 font-medium text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:bg-cyan-300"
          >
         Email me
          </a>

          <a
            href="https://www.linkedin.com/in/rohit57"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-600/70 bg-slate-900/60 px-5 py-2.5 font-medium text-slate-100 transition hover:border-cyan-400/60 hover:bg-slate-900/90"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/rohitshr57"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-600/70 bg-slate-900/60 px-5 py-2.5 font-medium text-slate-100 transition hover:border-cyan-400/60 hover:bg-slate-900/90"
          >
            GitHub
          </a>
          <a
            href="https://scholar.google.com/citations?user=E12Lt7sAAAAJ&hl=en"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-600/70 bg-slate-900/60 px-5 py-2.5 font-medium text-slate-100 transition hover:border-cyan-400/60 hover:bg-slate-900/90"
          >
            Google-Scholar
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- COMMAND PALETTE ---------- */

function CommandPalette({
  open,
  onClose,
  onNavClick,
}: {
  open: boolean;
  onClose: () => void;
  onNavClick: (id: SectionId) => void;
}) {
  const actions: { label: string; hint: string; onClick: () => void }[] = [
    {
      label: "Go to Projects",
      hint: "View my flagship work",
      onClick: () => onNavClick("projects"),
    },
    {
      label: "Go to Experience",
      hint: "See where I’ve worked",
      onClick: () => onNavClick("experience"),
    },
    {
      label: "Go to Lab",
      hint: "Current explorations",
      onClick: () => onNavClick("lab"),
    },
    {
      label: "Contact me",
      hint: "Open contact section",
      onClick: () => onNavClick("contact"),
    },
    {
      label: "Download CV",
      hint: "Open PDF in new tab",
      onClick: () => window.open("/Rohit_Sharma_CV.pdf", "_blank"),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="mx-auto mt-24 max-w-lg rounded-2xl border border-slate-700/80 bg-slate-950/95 p-4 shadow-2xl shadow-cyan-500/30"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 pb-2">
              <div>
                <p className="text-xs font-medium text-slate-100">
                  Quick command menu
                </p>
                <p className="text-[11px] text-slate-400">
                  Jump around or open things fast.
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">
                ⌘K / Ctrl+K
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-slate-100 hover:bg-slate-900"
                >
                  <span>{action.label}</span>
                  <span className="text-[10px] text-slate-400">
                    {action.hint}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

//* ---------- ROHITAI CHAT WIDGET (LOCAL, NO API) ---------- */

type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

function getLocalAnswer(rawMessage: string): string {
  const text = rawMessage.toLowerCase().trim();

  const asked = (...phrases: string[]) =>
    phrases.some((p) => text.includes(p));

  // --- About / intro ---
  if (
    asked(
      "who are you",
      "who is rohit",
      "about you",
      "tell me about rohit",
      "introduce yourself",
      "introduce rohit",
      "intro",
      "about him",
      "about yourself",
      "tell me about yourself"
    )
  ) {
    return (
      "I’m RohitAI, a small on-site agent that knows Rohit Sharma’s work.\n\n" +
      "Rohit is a Master’s student in Computer & Information Science at the University of Pennsylvania. " +
      "He designs and ships end-to-end machine learning systems: indexing large-scale zoning data at Wharton, " +
      "building a drone + Jetson precision-agriculture stack with Krishikalyan, operating MUJGPT for thousands of users, " +
      "and deploying lunar computer vision models at ISRO.\n\n" +
      "He’s strongest when the problem is messy: multiple stakeholders, real-world constraints (latency, trust, safety), " +
      "and a need to turn research ideas into something people actually use."
    );
  }

  // --- Why should we hire him / fit for role ---
  if (
    asked(
      "why should we hire",
      "why should i hire",
      "why hire him",
      "why hire you",
      "what makes him a good fit",
      "what makes you a good fit",
      "why is he a strong candidate",
      "why is he a good candidate"
    )
  ) {
    return (
      "Three reasons Rohit is a strong hire for applied ML / research engineer roles:\n\n" +
      "1) Proven ability to ship, not just prototype. He has taken systems from notebook to production in very different settings: " +
      "precision-agriculture pilots over 1,800+ acres, an LLM platform serving tens of thousands of queries per month, " +
      "a zoning index built over massive geospatial data, and lunar CV pipelines at ISRO.\n\n" +
      "2) Comfort with ambiguity and stakeholders. Rohit works well with non-technical partners — farmers, housing researchers, students, and analysts. " +
      "He’s used to extracting the real problem, defining simple success metrics, and explaining trade-offs in clear language.\n\n" +
      "3) Long-term learning mindset. Outside shipped work, he actively explores things like agentic AI, on-device LLMs, and 3D/world models. " +
      "He treats each project as a loop: instrument, experiment, measure, and feed those learnings into the next system."
    );
  }

  // --- Strengths ---
  if (
    asked(
      "strength",
      "strengths",
      "strongest",
      "superpower",
      "what is he good at",
      "what are his strengths"
    )
  ) {
    return (
      "Rohit’s main strengths are:\n\n" +
      "• Ownership: he stays with systems through data cleaning, modeling, deployment, and post-launch issues.\n" +
      "• Turning messy asks into clear plans: he listens to stakeholders and reframes vague goals into concrete metrics and milestones.\n" +
      "• Communication: he can explain models and trade-offs with short write-ups, diagrams, and dashboards instead of jargon.\n" +
      "• Working across domains: he has shipped ML in agriculture, zoning/housing policy, education, and space.\n" +
      "• Experiment-driven mindset: he prefers experiments and metrics over opinions when making decisions."
    );
  }

  // --- Weaknesses / growth areas ---
  if (
    asked(
      "weakness",
      "weaknesses",
      "areas of improvement",
      "areas for improvement",
      "growth areas",
      "what does he need to improve",
      "what do you need to improve"
    )
  ) {
    return (
      "Two honest growth areas Rohit is aware of:\n\n" +
      "• Saying yes to too many interesting things. Because he enjoys hard problems, he can over-commit if not careful. " +
      "Recently he has become more deliberate about scoping work, making trade-offs explicit, and pushing back when timelines don’t match the work.\n\n" +
      "• Delegating earlier. Coming from a founder / build-it-yourself background, his default is to take on end-to-end responsibility. " +
      "In larger teams he is learning to create clearer interfaces, document decisions, and hand off pieces without losing quality or context.\n\n" +
      "He treats these as ongoing experiments: try a new way of working on a project, see what actually improved, and keep what worked."
    );
  }

  // --- Teamwork / collaboration / work style ---
  if (
    asked(
      "team player",
      "teamwork",
      "collaborate",
      "collaboration",
      "work with others",
      "how does he work",
      "work style",
      "working style",
      "how is he in a team"
    )
  ) {
    return (
      "Rohit’s default style is collaborative and low-ego. He has worked in cross-functional groups with farmers and hardware vendors, " +
      "housing researchers, students and IT teams, and analysts at ISRO.\n\n" +
      "He tends to:\n" +
      "• Start by listening and summarizing what he heard back to the group to check alignment.\n" +
      "• Write short design docs or experiment plans so others can react early.\n" +
      "• Surface trade-offs (accuracy vs latency vs cost) and ask for preferences instead of guessing.\n\n" +
      "People who work with him usually see him as the person who will quietly own the unglamorous parts of a project so the whole thing actually ships."
    );
  }

  // --- Leadership / leading teams ---
  if (
    asked(
      "leadership",
      "leader",
      "lead a team",
      "managed a team",
      "manage people",
      "leading others"
    )
  ) {
    return (
      "Rohit has led both formal and informal teams.\n\n" +
      "For example, he led an 11-member effort at ISRO to operationalize lunar crater detection — coordinating data work, model training, evaluation, and integration with analyst tooling. " +
      "In startup work he has effectively played founding ML engineer and product lead, making technical decisions while aligning with users and partners.\n\n" +
      "His leadership style is hands-on, metric-driven, and calm under ambiguity."
    );
  }

  // --- Handling failure / feedback / conflict ---
  if (
    asked(
      "failure",
      "failed",
      "mistake",
      "how does he handle feedback",
      "how do you handle feedback",
      "conflict",
      "disagree",
      "disagreement"
    )
  ) {
    return (
      "Rohit tends to treat failures and disagreements as data, not as something personal.\n\n" +
      "A recurring pattern in his projects is running pilots or A/B tests, discovering that an idea doesn’t work as expected, and then using that to redesign the system. " +
      "In agriculture work, for instance, he started with a technically strong model that farmers didn’t trust — so he switched to side-by-side pilots, reviewed mistakes openly with them, and changed both the UX and model behavior.\n\n" +
      "In disagreements he usually restates the other view, suggests an experiment or measurable test, and documents the decision so everyone knows what was tried and learned."
    );
  }

  // --- Current interests / “Lab” topics ---
  if (
    asked(
      "what is he exploring now",
      "what is he working on now",
      "research interests",
      "what is he interested in",
      "lab section",
      "what next",
      "what's next",
      "now section"
    )
  ) {
    return (
      "Right now Rohit is exploring three broad themes in his personal “lab” work:\n\n" +
      "• Agentic AI – moving from single prompts to agents that can plan multi-step work, call tools, and produce auditable plans.\n" +
      "• On-device and privacy-preserving LLMs – understanding how far small open-weight models and quantization can go for real-time assistants on local hardware.\n" +
      "• 3D generative models and world simulators – following work on NeRF-style methods and world models that can generate realistic 3D scenes and edge cases for robotics or AR.\n\n" +
      "These are exploration areas rather than polished products, but they show where he’s aiming his next deep dives."
    );
  }

  // --- Roles / what he is looking for ---
  if (
    asked(
      "what roles is he looking for",
      "what role is he looking for",
      "what is he looking for",
      "what does he want to work on",
      "kinds of roles",
      "types of roles",
      "looking for",
      "internship",
      "job"
    )
  ) {
    return (
      "Rohit is primarily looking for applied machine learning, computer vision, and data-heavy engineering roles where models must actually be deployed.\n\n" +
      "He is especially interested in:\n" +
      "• ML systems that affect physical or policy outcomes (mapping, planning, logistics, climate, safety-critical systems).\n" +
      "• Products at the intersection of ML, tooling, and UX, where how people interact with the system matters as much as the model.\n" +
      "• Emerging areas such as agentic AI, on-device LLMs, or 3D/world models, provided there is a path to real users."
    );
  }

  // --- Specific project summaries ---

  if (asked("krishikalyan", "farmer’s friend", "farmer's friend")) {
    return (
      "Krishikalyan – The Farmer’s Friend – is a precision-agriculture startup where Rohit was the founding ML engineer. " +
      "He built the drone disease-detection and mapping stack plus the on-device vision pipeline for a smart sprayer running on NVIDIA Jetson.\n\n" +
      "Impact: mapped over 1,800 acres with dozens of flights per month, reduced chemical use significantly, and improved yields while staying within tight latency and reliability budgets."
    );
  }

  if (asked("zoning atlas", "index of local zoning", "nza", "wharton", "zoning")) {
    return (
      "At Wharton’s Real Estate Department, Rohit works on large-scale zoning and geospatial pipelines. " +
      "He has engineered infrastructure that unifies many local sources of zoning data into one queryable dataset and built LLM-assisted zoning PDF parsers with spatial checks.\n\n" +
      "This supports housing and land-use research by turning scattered ordinances into a consistent, auditable view of “what can be built where.”"
    );
  }

  if (asked("mujgpt")) {
    return (
      "MUJGPT is a campus-scale LLM platform Rohit helped design and operate. " +
      "It serves thousands of queries per month with tight latency and uptime targets.\n\n" +
      "He implemented retrieval-augmented generation, caching, and safety guardrails so the system is both fast and trustworthy for students and faculty."
    );
  }

  if (asked("isro", "lunar", "crater", "chandrayaan", "space")) {
    return (
      "At ISRO’s Signal & Image Processing group, Rohit worked on lunar computer vision and geospatial tools. " +
      "He helped operationalize crater detection models on Chandrayaan imagery, optimized captioning pipelines, built road-extraction datasets, and shipped 3D geospatial tools used in national-level projects."
    );
  }

  // --- Skills / tech stack ---
  if (
    asked(
      "skills",
      "tech stack",
      "technology",
      "tools",
      "languages",
      "what can he do",
      "what can rohit do"
    )
  ) {
    return (
      "Technically, Rohit is strongest in Python-based ML and data systems: PyTorch, scikit-learn, YOLO-style detectors, vision transformers, " +
      "and geospatial tools like QGIS and PostGIS. He also has experience with React, Node.js/TypeScript, microservices, Docker/Kubernetes, and cloud tooling from prior industry roles.\n\n" +
      "Beyond tools, his value comes from how he uses them: clear metrics, experiment design, and an end-to-end view of systems."
    );
  }

  // --- Resume / CV ---
  if (asked("resume", "cv", "curriculum", "linkedin", "github", "profile")) {
    return (
      "You can view Rohit’s one-page CV using the “Download 1-page CV (PDF)” button in the hero section of this site.\n\n" +
      "The Contact section also links to his LinkedIn and GitHub if you’d like a broader view of his research and engineering work."
    );
  }

  // --- Fallback ---
  return (
    "I might not have a scripted answer for that exact question, but here’s the quick picture:\n\n" +
    "Rohit is a Penn CIS Master’s student who has shipped ML systems in agriculture, zoning/housing policy, education, and space. " +
    "He tends to take end-to-end ownership, work closely with stakeholders, and use experiments and metrics to guide decisions.\n\n" +
    "You can ask things like:\n" +
    "• “Why should we hire him for an applied ML role?”\n" +
    "• “What are his main strengths and growth areas?”\n" +
    "• “How does he work in a team or handle failure?”\n" +
    "• “Summarize his work at Wharton / Krishikalyan / MUJGPT / ISRO in a few lines.”"
  );
}

function AgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m RohitAI ask me anything about Rohit’s fit, strengths, weaknesses, or how he works.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      // simulate thinking delay
      await new Promise((resolve) => setTimeout(resolve, 350));
      const reply = getLocalAnswer(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-full border border-cyan-400/60 bg-slate-950/90 px-3 py-2 text-xs text-cyan-100 shadow-lg shadow-cyan-500/40 backdrop-blur hover:bg-slate-900 sm:left-6 md:bottom-6"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/90 text-slate-950 text-base">
          🤖
        </span>
        <span className="hidden sm:inline">Ask RohitAI</span>
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed bottom-20 left-6 z-50 w-[320px] max-w-[90vw] rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-cyan-500/30 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-slate-100">
                  RohitAI
                </p>
                <p className="text-[10px] text-slate-400">
                  Ask about fit, strengths, weaknesses, and how he works.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] text-slate-300 hover:text-cyan-200"
              >
                ✕
              </button>
            </div>

            <div
              ref={scrollRef}
              className="max-h-72 space-y-2 overflow-y-auto px-3 py-2 text-[11px]"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={[
                      "max-w-[85%] rounded-2xl px-3 py-1.5 whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-cyan-500/90 text-slate-950"
                        : "bg-slate-900/90 text-slate-100 border border-slate-700/80",
                    ].join(" ")}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-900/90 px-3 py-1.5 text-[11px] text-slate-300 border border-slate-700/80">
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-slate-800/80 px-3 py-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Try: "Why should we hire him?"'
                className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950/90 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-cyan-400/90 px-3 py-1 text-xs font-medium text-slate-950 shadow-md shadow-cyan-500/40 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
