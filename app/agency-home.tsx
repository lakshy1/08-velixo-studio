"use client";

import type { FormEvent, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type CounterProps = {
  target: number;
  suffix?: string;
  active: boolean;
};

type Review = {
  id: number;
  name: string;
  company: string;
  date: string;
  rating: number;
  text: string;
  initials: string;
};

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Team", href: "#team" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

const services = [
  {
    title: "Web Design",
    description:
      "Conversion-focused websites built with rhythm, clarity, and performance at the center.",
  },
  {
    title: "App Design",
    description:
      "Intuitive mobile and desktop product experiences that feel polished from the first tap.",
  },
  {
    title: "Graphic Design",
    description:
      "Brand systems, motion assets, and visual identities that stay consistent across every touchpoint.",
  },
  {
    title: "SaaS Solutions",
    description:
      "End-to-end SaaS design and development from MVP foundations to scale-ready product systems.",
  },
  {
    title: "Custom Development",
    description:
      "Tailored full-stack web and mobile apps engineered around your exact goals and workflows.",
  },
  {
    title: "Product Testing",
    description:
      "Manual and automated QA, performance checks, and launch validation for confidence at delivery.",
  },
  {
    title: "AI Integration",
    description:
      "LLM workflows, automation, and intelligent assistants that reduce friction and unlock speed.",
  },
  {
    title: "SEO Optimization",
    description:
      "Technical SEO, on-page strategy, and performance tuning that grow visibility with intent.",
  },
  {
    title: "Cloud Services",
    description:
      "Cloud deployments, DevOps pipelines, and scalable infrastructure ready for growth spikes.",
  },
];

const clientNames = [
  "TechNova",
  "Finspire",
  "Cloudex",
  "RoamApp",
  "Medisync",
  "Buildify",
  "Launchly",
  "ZestPay",
];

const projectNames = [
  "Project Orion",
  "Dashboard X",
  "Shopify Migration",
  "AI Chatbot Suite",
  "Mobile Rebrand 2024",
  "Cloud Ops Revamp",
];

const stats = [
  { target: 120, suffix: "+", label: "Projects Delivered" },
  { target: 40, suffix: "+", label: "Happy Clients" },
  { target: 8, suffix: "+", label: "Years of Experience" },
  { target: 99, suffix: "%", label: "Client Satisfaction" },
];

const processSteps = [
  {
    step: "01",
    title: "Discovery & Strategy",
    description: "We unpack the problem, audience, market, and success metrics before any pixels move.",
  },
  {
    step: "02",
    title: "Design & Prototyping",
    description: "We shape the story, interface, and motion into something crisp, usable, and memorable.",
  },
  {
    step: "03",
    title: "Development & Build",
    description: "We translate the experience into clean, scalable code that stays fast and maintainable.",
  },
  {
    step: "04",
    title: "Testing & QA",
    description: "We verify behavior, polish details, and harden the release across devices and browsers.",
  },
  {
    step: "05",
    title: "Launch & Scale",
    description: "We deploy, measure, iterate, and keep the product ready for the next stage of growth.",
  },
];

const team = [
  {
    name: "Lakshya Sehgal",
    role: "Full Stack AI Engineer",
    initials: "LS",
    skills: ["Web/Android Development", "AI-ML Integration", "DevOps"],
    bio: "Builds product systems, AI features, and deployment pipelines with a strong end-to-end delivery mindset.",
  },
  {
    name: "Honey Jain",
    role: "Full Stack Developer",
    initials: "HJ",
    skills: ["MERN Stack", "Next.js", "Configurations", "Testing"],
    bio: "Delivers robust app experiences, clean integrations, and reliable front-to-back implementation.",
  },
];

const initialReviews: Review[] = [
  {
    id: 1,
    name: "Priya N.",
    company: "Finspire",
    date: "May 2026",
    rating: 5,
    text: "The team understood our product immediately. The design feels premium, and the launch process was very organized.",
    initials: "PN",
  },
  {
    id: 2,
    name: "Daniel K.",
    company: "Cloudex",
    date: "April 2026",
    rating: 5,
    text: "They cleaned up a messy experience into a clear product story. Our internal team now has a much easier time selling it.",
    initials: "DK",
  },
  {
    id: 3,
    name: "Maya R.",
    company: "RoamApp",
    date: "April 2026",
    rating: 5,
    text: "Sharp communication, thoughtful work, and genuinely fast delivery. They felt like an extension of our own team.",
    initials: "MR",
  },
];

const faqs = [
  {
    question: "How long does a project usually take?",
    answer:
      "Most landing pages ship in 2 to 4 weeks, while SaaS or custom product builds usually take 6 to 12 weeks depending on scope and integrations.",
  },
  {
    question: "What is your pricing model?",
    answer:
      "We use fixed-scope estimates for defined work and monthly retainers for ongoing design, development, and growth support.",
  },
  {
    question: "Do you work with startups?",
    answer:
      "Yes. We regularly help founders turn early ideas into crisp MVPs, investor-ready demos, and launch-ready websites.",
  },
  {
    question: "Can you maintain my project after launch?",
    answer:
      "Absolutely. We can stay on for optimization, bug fixes, new features, analytics, content updates, or infrastructure support.",
  },
  {
    question: "Do you offer white-label services?",
    answer:
      "Yes. We can work as a silent delivery partner for agencies, consultants, and internal product teams.",
  },
  {
    question: "Which technologies do you specialize in?",
    answer:
      "Next.js, React, Tailwind, Node, APIs, cloud platforms, analytics, and AI integrations built around modern product teams.",
  },
];

function scrollToSection(href: string) {
  if (!href.startsWith("#")) {
    return;
  }

  const target = document.querySelector(href);
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const headerOffset = 92;
  const targetY =
    window.scrollY + target.getBoundingClientRect().top - headerOffset;
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = 900;
  let start: number | null = null;

  const easeInOutCubic = (value: number) =>
    value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;

  const step = (time: number) => {
    if (start === null) {
      start = time;
    }

    const progress = Math.min((time - start) / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

function useCountUp({ target, suffix = "", active }: CounterProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    const start = performance.now();
    const duration = 1200;
    let raf = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  return `${value}${suffix}`;
}

function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, active] as const;
}

function ServiceIcon({ index }: { index: number }) {
  const label = String(index + 1).padStart(2, "0");

  return (
    <div className="chip flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-[var(--text)]">
      {label}
    </div>
  );
}

function DockIcon({
  variant,
}: {
  variant: "home" | "services" | "work" | "chat" | "contact";
}) {
  const common = "h-5 w-5 stroke-[1.8] fill-none";

  switch (variant) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M3 11.5 12 4l9 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 10.5V20h13V10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "services":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z" stroke="currentColor" strokeLinejoin="round" />
        </svg>
      );
    case "work":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M4.5 7.5h15v10h-15z" stroke="currentColor" strokeLinejoin="round" />
          <path d="M9 7.5V6a3 3 0 0 1 6 0v1.5" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M5 6.5h14v9H10l-4.5 4V15.5H5z" stroke="currentColor" strokeLinejoin="round" />
        </svg>
      );
    case "contact":
      return (
        <svg viewBox="0 0 24 24" className={common} aria-hidden="true">
          <path d="M7.5 4.5h9v15h-9z" stroke="currentColor" strokeLinejoin="round" />
          <path d="M9.5 8.5h5M9.5 12h5M9.5 15.5h3" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AgencyHome() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    return window.localStorage.getItem("nexvora-theme") === "light"
      ? "light"
      : "dark";
  });
  const [headerSolid, setHeaderSolid] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [assistantPrompt, setAssistantPrompt] = useState(
    "We need a premium agency site for a fintech launch with AI support and a short timeline.",
  );
  const [assistantReply, setAssistantReply] = useState(
    "Ask the AI concierge to shape a project brief, strategy angle, or launch plan.",
  );
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeTeamCard, setActiveTeamCard] = useState<string | null>(null);
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    company: "",
    text: "",
  });
  const [reviewNotice, setReviewNotice] = useState("");
  const [contactNotice, setContactNotice] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const [statsRef, statsVisible] = useInViewOnce<HTMLDivElement>();
  const [workRef, workVisible] = useInViewOnce<HTMLDivElement>();
  const teamPopupRef = useRef<HTMLDivElement | null>(null);

  const projectPills = useMemo(
    () => [...projectNames, ...projectNames],
    [],
  );

  const count120 = useCountUp({ target: stats[0].target, suffix: stats[0].suffix, active: statsVisible });
  const count40 = useCountUp({ target: stats[1].target, suffix: stats[1].suffix, active: statsVisible });
  const count8 = useCountUp({ target: stats[2].target, suffix: stats[2].suffix, active: statsVisible });
  const count99 = useCountUp({ target: stats[3].target, suffix: stats[3].suffix, active: statsVisible });

  function handleSmoothAnchor(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();
    scrollToSection(href);
    setMobileOpen(false);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("nexvora-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      setHeaderSolid(window.scrollY > 16);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!activeTeamCard) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (teamPopupRef.current && !teamPopupRef.current.contains(target)) {
        setActiveTeamCard(null);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [activeTeamCard, teamPopupRef]);

  async function handleAssistantSubmit() {
    setAssistantLoading(true);
    setAssistantReply("Thinking...");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: assistantPrompt }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      setAssistantReply(
        data.reply ||
          data.error ||
          "The assistant could not respond right now. Please try again.",
      );
    } catch {
      setAssistantReply(
        "The assistant is offline. Add GROQ_API_KEY to `.env.local` and try again.",
      );
    } finally {
      setAssistantLoading(false);
    }
  }

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reviewForm,
          rating: selectedRating,
        }),
      });

      if (!response.ok) {
        throw new Error("We could not save the review right now.");
      }

      const nextReview: Review = {
        id: Date.now(),
        name: reviewForm.name || "Anonymous",
        company: reviewForm.company || "Client",
        date: "Just now",
        rating: selectedRating,
        text: reviewForm.text || "Thank you for the kind feedback.",
        initials: (reviewForm.name || "A")
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
      };

      setReviews((current) => [nextReview, ...current]);
      setReviewForm({ name: "", company: "", text: "" });
      setSelectedRating(5);
      setReviewModalOpen(false);
      setReviewNotice("Review published successfully.");
    } catch (error) {
      setReviewNotice(
        error instanceof Error ? error.message : "We could not save the review right now.",
      );
    }
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactBusy(true);
    setContactNotice("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setContactSuccess(true);
      setContactNotice(data.message || "Your inquiry was received.");
      event.currentTarget.reset();
    } catch (error) {
      setContactSuccess(false);
      setContactNotice(
        error instanceof Error ? error.message : "We could not send your request.",
      );
    } finally {
      setContactBusy(false);
    }
  }

  return (
    <div id="home" className="agency-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] mesh opacity-85" />

      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          headerSolid ? "surface-panel-strong" : "bg-transparent border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#home"
            onClick={(event) => handleSmoothAnchor(event, "#home")}
            className="group flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-sm font-bold text-white shadow-lg shadow-black/25">
              N
            </span>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight text-[var(--text)]">
                Nexvora
              </div>
              <div className="text-xs text-[var(--text-soft)]">Design. Build. Launch.</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => handleSmoothAnchor(event, item.href)}
                className="text-sm text-[var(--text-soft)] transition-colors hover:text-[var(--text)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-[var(--text)] soft-border transition-colors hover:bg-white/5 md:flex"
              aria-label="Toggle theme"
            >
              <span className="dot" />
              {theme === "dark" ? "Dark" : "Light"}
            </button>
            <a
              href="#contact"
              onClick={(event) => handleSmoothAnchor(event, "#contact")}
              className="hidden rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Start a Project {"→"}
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full soft-border lg:hidden"
              aria-label="Open navigation menu"
            >
              <span className="flex flex-col gap-1.5">
                <span className="h-0.5 w-5 rounded-full bg-[var(--text)]" />
                <span className="h-0.5 w-3.5 rounded-full bg-[var(--text-soft)]" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 h-full w-[84vw] max-w-sm surface-panel-strong p-6">
            <div className="mb-10 flex items-center justify-between">
              <div className="text-sm font-semibold tracking-[0.2em] text-[var(--text-soft)] uppercase">
                Menu
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full soft-border"
                aria-label="Close navigation menu"
              >
                Ã—
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(event) => handleSmoothAnchor(event, item.href)}
                  className="flex items-center justify-between rounded-2xl surface-panel px-4 py-4 text-lg font-medium transition-colors hover:bg-white/5"
                >
                  <span>{item.label}</span>
                  <span className="text-[var(--text-soft)]">↘</span>
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
                className="mt-4 flex items-center justify-between rounded-2xl surface-panel px-4 py-4 text-left text-base font-medium"
              >
                <span>Theme</span>
                <span className="text-[var(--text-soft)]">{theme === "dark" ? "Dark" : "Light"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 pb-18 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full chip px-4 py-2 text-sm text-[var(--text-soft)] backdrop-blur">
                <span className="dot" />
                Premium digital agency for design, development, AI, and cloud
              </div>

              <div className="space-y-6">
                <h1 className="section-title max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-[var(--text)] sm:text-6xl lg:text-[5.3rem]">
                  We Build Digital Products That Scale
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[var(--text-soft)] sm:text-xl">
                  Design. Development. AI. Cloud. All under one roof, with the clarity of a product team and the polish of a luxury studio.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  onClick={(event) => handleSmoothAnchor(event, "#contact")}
                  className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5"
                >
                  Get a Free Quote
                </a>
                <a
                  href="#work"
                  onClick={(event) => handleSmoothAnchor(event, "#work")}
                  className="inline-flex items-center justify-center rounded-full chip px-7 py-4 text-base font-semibold text-[var(--text)] backdrop-blur transition-colors hover:bg-white/10"
                >
                  See Our Work ↓
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  "Conversion-first UX",
                  "AI-assisted workflows",
                  "Launch-ready infrastructure",
                ].map((item) => (
                  <div key={item} className="chip rounded-2xl px-4 py-4 text-sm text-[var(--text-soft)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(108,99,255,0.24),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(0,212,170,0.18),transparent_45%)] blur-3xl" />
              <div className="surface-panel-strong overflow-hidden rounded-[2rem] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[var(--text-soft)]">Live agency snapshot</div>
                    <div className="mt-1 text-xl font-semibold tracking-tight">Nexvora Launch System</div>
                  </div>
                  <div className="status-badge rounded-full px-3 py-1 text-xs font-semibold">
                    Available Now
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="surface-panel rounded-3xl p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">
                      Design Velocity
                    </div>
                    <div className="mt-3 text-4xl font-bold tracking-tight text-white">04x</div>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                      Faster decisions through strategy-led wireframes and modular design systems.
                    </p>
                  </div>
                  <div className="surface-panel rounded-3xl p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">
                      Delivery Stack
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["Next.js", "Tailwind", "Groq", "Cloud"].map((pill) => (
                        <span
                          key={pill}
                          className="chip px-3 py-1 text-xs text-[var(--text)]"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                      Built to move from concept to launch without losing quality or momentum.
                    </p>
                  </div>
                </div>

                <div className="progress-shell mt-4 rounded-3xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-soft)]">Client pulse</span>
                    <span className="status-copy text-xs font-semibold">98% retained clients</span>
                  </div>
                  <div className="progress-track mt-4 h-2 rounded-full">
                    <div className="progress-fill h-2 w-[82%] rounded-full" />
                  </div>
                  <div className="mt-3 text-sm text-[var(--text-soft)]">
                    We keep the team close, communicate clearly, and ship in visible milestones.
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {["Brand systems", "Product UX", "Cloud launch"].map((item) => (
                  <div key={item} className="surface-panel rounded-2xl px-4 py-3 text-sm text-[var(--text-soft)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3 text-sm text-[var(--text-soft)]">
            <span className="text-[var(--text)]">Scroll</span>
            <span className="dot" />
            <span>Discover the full experience below</span>
          </div>
        </section>

        <section ref={statsRef} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-[2rem] section-shell p-5 md:grid-cols-4">
            {[
              { value: count120, label: stats[0].label },
              { value: count40, label: stats[1].label },
              { value: count8, label: stats[2].label },
              { value: count99, label: stats[3].label },
            ].map((item) => (
              <div
                key={item.label}
                className="surface-panel rounded-[1.5rem] px-5 py-6 text-center"
              >
                <div className="counter text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {item.value}
                </div>
                <div className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                Services
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                A full stack of capabilities, designed to move as one.
              </h2>
            </div>
            <p className="section-lead">
              Every service is structured to help a business launch faster, look stronger, and scale with less friction.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="group hover-lift relative overflow-hidden rounded-[1.6rem] surface-panel-strong p-5"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(108,99,255,0.16),transparent_36%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex h-full min-h-[12.5rem] flex-col justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <ServiceIcon index={index} />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-[var(--text)]">{service.title}</h3>
                      <p className="max-w-[22rem] text-sm leading-6 text-[var(--text-soft)]">{service.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-2)]">
                    Learn More <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="work"
          ref={workRef}
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                Work
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                Client logos and projects, moving in a smooth continuous loop.
              </h2>
            </div>
            <p className="section-lead">
              This space is ideal for deep case studies, measurable results, and outcome-driven portfolio stories.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
            <div className="surface-panel-strong rounded-[2rem] p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-[var(--text-soft)]">Client logos</div>
                  <div className="text-xl font-semibold">Trusted by product teams</div>
                </div>
                <div className="chip px-3 py-1 text-xs text-[var(--text-soft)]">
                  Grayscale to color on hover
                </div>
              </div>
              <div className="marquee">
                <div className="marquee-track">
                  {[...clientNames, ...clientNames].map((name, index) => (
                    <div
                      key={`${name}-logo-${index}`}
                      className="surface-panel flex h-12 min-w-[11.5rem] items-center justify-center rounded-[1.25rem] px-5 text-base font-semibold text-[var(--text-soft)] transition-all hover:text-[var(--text)]"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel-strong rounded-[2rem] p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-[var(--text-soft)]">Project names</div>
                  <div className="text-xl font-semibold">Launches with visible momentum</div>
                </div>
                <div className="chip px-3 py-1 text-xs text-[var(--text-soft)]">
                  Smooth infinite scroll
                </div>
              </div>
              <div className="marquee">
                <div className="marquee-track reverse">
                  {projectPills.map((name, index) => (
                    <div
                      key={`${name}-pill-${index}`}
                      className="chip flex h-12 min-w-[12rem] items-center justify-center px-5 py-3 text-sm font-medium text-[var(--text)]"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Conversion lift: 3x",
                  "Load time improved: 42%",
                  "Organic visits: 100k+",
                  "Time to market: 2x faster",
                ].map((item) => (
                  <div key={item} className="surface-panel rounded-2xl px-4 py-3 text-sm text-[var(--text-soft)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {workVisible ? (
            <div className="mt-6 rounded-[2rem] surface-panel px-5 py-4 text-sm text-[var(--text-soft)]">
              Add 3 to 5 deep-dive case studies here to match top-tier agency expectations. This build is ready for them.
            </div>
          ) : null}
        </section>

        <section
          id="process"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                Process
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                A simple workflow with enough structure to keep momentum high.
              </h2>
            </div>
            <p className="section-lead">
              The timeline stays transparent, so clients always know what is happening next and where the project stands.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {processSteps.map((item) => (
              <article
                key={item.step}
                className="surface-panel-strong rounded-[1.5rem] p-5"
              >
                <div className="text-3xl font-bold tracking-tight text-[var(--text)]">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--text)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="team"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                Team
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                Small team energy, senior-level execution.
              </h2>
            </div>
            <p className="section-lead">
              These cards are ready for photos, LinkedIn links, and external portfolio URLs once your team assets are in place.
            </p>
          </div>

          <div ref={teamPopupRef} className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
            {team.map((member) => (
              <article key={member.name} className={`flip-card rounded-[1.6rem] ${activeTeamCard === member.name ? "is-flipped" : ""}`}>
                <div className="flip-inner relative h-full min-h-[24rem]">
                  <div className="flip-face absolute inset-0 rounded-[1.6rem] surface-panel-strong p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(108,99,255,0.2),rgba(0,212,170,0.18))] text-xl font-bold text-white">
                        {member.initials}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTeamCard((current) => (current === member.name ? null : member.name))}
                        className="chip flex h-10 w-10 items-center justify-center text-sm text-[var(--text-soft)] transition-colors hover:text-[var(--text)]"
                        aria-pressed={activeTeamCard === member.name}
                        aria-label="Flip card"
                      >
                        ↺
                      </button>
                    </div>
                    <div className="mt-6 space-y-3">
                      <h3 className="text-2xl font-semibold text-[var(--text)]">{member.name}</h3>
                      <div className="text-sm uppercase tracking-[0.2em] text-[var(--accent-2)]">
                        {member.role}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className="chip px-3 py-1 text-xs text-[var(--text-soft)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <a
                        href="#contact"
                        className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-3 text-sm font-semibold text-white"
                      >
                        View Portfolio →
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTeamCard((current) => (current === member.name ? null : member.name))}
                        className="chip flex h-10 w-10 items-center justify-center text-sm font-semibold text-[var(--text)]"
                        aria-label="Flip to bio"
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                  <div className="flip-face flip-back absolute inset-0 rounded-[1.6rem] surface-panel-strong p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-soft)]">
                        Bio
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTeamCard(null)}
                        className="chip flex h-10 w-10 items-center justify-center text-xs text-[var(--text-soft)] transition-colors hover:text-[var(--text)]"
                        aria-label="Close bio"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="mt-4 text-base leading-8 text-[var(--text)]">{member.bio}</p>
                    <div className="mt-8 rounded-2xl surface-panel p-4 text-sm text-[var(--text-soft)]">
                      This space can link to LinkedIn, external portfolio pages, or personal case study reels.
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="reviews" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                Reviews
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                Social proof that feels human.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-6 py-3 text-sm font-semibold text-white"
            >
              Add Your Review
            </button>
          </div>

          {reviewNotice ? (
            <div className="mb-4 rounded-2xl surface-panel px-4 py-3 text-sm text-[var(--text-soft)]">
              {reviewNotice}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.id} className="surface-panel-strong flex h-full min-h-[18rem] flex-col justify-between rounded-[1.6rem] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-1 text-amber-300">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span key={index} aria-hidden="true">
                        {index < review.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-[var(--text-soft)]">{review.date}</div>
                </div>
                <p className="mt-5 flex-1 text-sm leading-7 text-[var(--text)]">{review.text}</p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(108,99,255,0.22),rgba(0,212,170,0.18))] text-sm font-bold text-white">
                    {review.initials}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text)]">{review.name}</div>
                    <div className="text-sm text-[var(--text-soft)]">{review.company}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-panel-strong rounded-[2rem] p-6">
              <div className="section-kicker">
                AI Concierge
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)]">
                Let Groq shape a quick project brief in seconds.
              </h2>
              <p className="mt-3 max-w-xl text-[var(--text-soft)]">
                This is wired to your <code>GROQ_API_KEY</code> env variable and the Groq OpenAI-compatible endpoint.
              </p>
              <label className="mt-6 block text-sm font-medium text-[var(--text-soft)]">
                Prompt
              </label>
              <textarea
                value={assistantPrompt}
                onChange={(event) => setAssistantPrompt(event.target.value)}
                rows={6}
                className="field mt-2 resize-none"
                placeholder="Describe your project, audience, and goal..."
              />
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  "Luxury SaaS landing page",
                  "AI lead qualification flow",
                  "Agency rebrand strategy",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAssistantPrompt(item)}
                    className="chip px-4 py-2 text-sm text-[var(--text-soft)]"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAssistantSubmit}
                disabled={assistantLoading}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {assistantLoading ? "Generating..." : "Generate Brief"}
              </button>
            </div>

            <div className="surface-panel-strong rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-kicker">
                    Assistant Output
                  </div>
                  <div className="mt-2 text-xl font-semibold">Strategy answer</div>
                </div>
                <div className="chip px-3 py-1 text-xs text-[var(--text-soft)]">
                  Powered by Groq
                </div>
              </div>
              <div className="mt-5 rounded-[1.5rem] surface-panel p-5 text-sm leading-8 text-[var(--text)]">
                {assistantReply}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Project scope clarity",
                  "Launch timeline framing",
                  "Recommended services",
                  "Conversion ideas",
                ].map((item) => (
                  <div key={item} className="surface-panel rounded-2xl px-4 py-3 text-sm text-[var(--text-soft)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                Contact
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                Let&apos;s build something great.
              </h2>
            </div>
            <p className="max-w-2xl text-[var(--text-soft)]">
              The form is wired to a Next.js route so it works immediately. Add your provider later for email delivery or storage.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <form
              onSubmit={handleContactSubmit}
              className="surface-panel-strong rounded-[2rem] p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                    Full Name *
                  </label>
                  <input name="fullName" required className="field" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                    Email Address *
                  </label>
                  <input name="email" type="email" required className="field" placeholder="you@company.com" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                    Phone Number
                  </label>
                  <input name="phone" className="field" placeholder="+1 555 000 0000" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                    Inquiry Type
                  </label>
                  <div className="select-wrap">
                    <select name="inquiryType" className="field select-field">
                      <option>Requirement Discussion</option>
                      <option>Project Consultation</option>
                      <option>General Contact</option>
                      <option>Tips & Feedback</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                    Subject *
                  </label>
                  <input name="subject" required className="field" placeholder="Tell us what you want to build" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    className="field resize-none"
                    placeholder="Share your goals, timeline, and any reference links."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                    Attach File
                  </label>
                  <input
                    name="attachment"
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="field file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--text)]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={contactBusy}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {contactBusy ? "Submitting..." : "Submit Request"}
              </button>
              {contactNotice ? (
                <div
                  className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                    contactSuccess
                      ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                      : "surface-panel text-[var(--text-soft)]"
                  }`}
                >
                  {contactNotice}
                </div>
              ) : null}
            </form>

            <div className="space-y-6">
              <div className="surface-panel-strong rounded-[2rem] p-6">
                <div className="section-kicker">
                  Quick Contact
                </div>
                <div className="mt-4 space-y-4 text-sm text-[var(--text-soft)]">
                  <div className="flex items-center justify-between gap-4 rounded-2xl surface-panel px-4 py-4">
                    <span>Email</span>
                    <span className="text-[var(--text)]">hello@nexvora.com</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl surface-panel px-4 py-4">
                    <span>WhatsApp</span>
                    <span className="text-[var(--text)]">+1 000 000 0000</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl surface-panel px-4 py-4">
                    <span>City</span>
                    <span className="text-[var(--text)]">Remote / Global</span>
                  </div>
                </div>
              </div>

              <div className="surface-panel-strong rounded-[2rem] p-6">
                <div className="section-kicker">
                  Booking
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-[var(--text)]">
                  Book a discovery call when you are ready.
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                  Add your Calendly link later to turn this panel into a direct booking flow for qualified leads.
                </p>
                <a
                  href="#home"
                  onClick={(event) => handleSmoothAnchor(event, "#home")}
                  className="mt-5 inline-flex items-center justify-center rounded-full surface-panel px-6 py-3 text-sm font-semibold text-[var(--text)]"
                >
                  Book a Call
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="section-kicker">
                FAQ
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                Questions clients ask before they say yes.
              </h2>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 lg:auto-rows-min">
            {faqs.map((faq, index) => {
              const expanded = activeFaq === index;

              return (
                <button
                  key={faq.question}
                  type="button"
                  onClick={() => setActiveFaq(expanded ? null : index)}
                  className={`surface-panel-strong rounded-[1.6rem] p-5 text-left transition-all duration-300 ${
                    expanded ? "lg:col-span-2" : "lg:col-span-1"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-[var(--text)]">{faq.question}</h3>
                    <span className="text-2xl text-[var(--text-soft)]">{expanded ? "−" : "+"}</span>
                  </div>
                  <div
                    className={`grid transition-all duration-300 ${
                      expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">{faq.answer}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="surface-panel border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-5 pb-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white font-bold">
                    N
                  </span>
                  <div>
                    <div className="font-semibold text-[var(--text)]">Nexvora</div>
                    <div className="text-sm text-[var(--text-soft)]">Design. Build. Launch.</div>
                  </div>
                </div>
                <p className="max-w-sm text-sm leading-7 text-[var(--text-soft)]">
                  A modern digital agency website built to showcase services, trust, process, and AI-assisted growth.
                </p>
              </div>

              <div>
                <div className="section-kicker footer-kicker">
                  Services
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text-soft)]">
                  {services.slice(0, 5).map((service) => (
                    <a
                      key={service.title}
                      href="#services"
                      onClick={(event) => handleSmoothAnchor(event, "#services")}
                      className="transition-colors hover:text-[var(--text)]"
                    >
                      {service.title}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div className="section-kicker footer-kicker">
                  Company
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text-soft)]">
                  {["About", "Team", "Careers", "Blog"].map((item) => (
                    <a
                      key={item}
                      href="#home"
                      onClick={(event) => handleSmoothAnchor(event, "#home")}
                      className="transition-colors hover:text-[var(--text)]"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div className="section-kicker footer-kicker">
                  Contact
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text-soft)]">
                  <div>hello@nexvora.com</div>
                  <div>+1 000 000 0000</div>
                  <div>Remote / Global</div>
                  <form className="mt-4 flex gap-2">
                    <input className="field flex-1" placeholder="Newsletter email" />
                    <button
                      type="button"
                      className="rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-3 text-sm font-semibold text-white"
                    >
                      Join
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-[var(--text-soft)] md:flex-row md:items-center md:justify-between">
              <div>Copyright 2026 Nexvora. All rights reserved.</div>
              <div className="flex flex-wrap gap-5">
                <a href="#home" onClick={(event) => handleSmoothAnchor(event, "#home")}>Privacy Policy</a>
                <a href="#home" onClick={(event) => handleSmoothAnchor(event, "#home")}>Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <div className="dock-safe fixed inset-x-0 bottom-0 z-40 surface-panel border-t border-white/10 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1 px-3 py-2">
          {[
            { label: "Home", href: "#home", icon: "home" as const },
            { label: "Services", href: "#services", icon: "services" as const },
            { label: "Work", href: "#work", icon: "work" as const },
            { label: "Chat", href: "#contact", icon: "chat" as const },
            { label: "Contact", href: "#contact", icon: "contact" as const },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(event) => handleSmoothAnchor(event, item.href)}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] text-[var(--text-soft)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
            >
              <DockIcon variant={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {reviewModalOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] surface-panel-strong p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-[var(--accent-2)]">
                  Add Your Review
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                  Tell us what working together felt like.
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full soft-border"
                aria-label="Close review form"
              >
                Ã—
              </button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleReviewSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                    Name
                  </label>
                  <input
                    className="field"
                    value={reviewForm.name}
                    onChange={(event) =>
                      setReviewForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                    Company
                  </label>
                  <input
                    className="field"
                    value={reviewForm.company}
                    onChange={(event) =>
                      setReviewForm((current) => ({ ...current, company: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                  Rating
                </label>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const rating = index + 1;
                    const filled = rating <= selectedRating;
                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setSelectedRating(rating)}
                        className={`text-3xl transition-transform hover:scale-110 ${
                          filled ? "text-amber-300" : "text-white/25"
                        }`}
                        aria-label={`Set rating to ${rating}`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                  Your Review
                </label>
                <textarea
                  className="field min-h-32 resize-none"
                  value={reviewForm.text}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, text: event.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-full surface-panel px-5 py-3 text-sm font-semibold text-[var(--text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-5 py-3 text-sm font-semibold text-white"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}



