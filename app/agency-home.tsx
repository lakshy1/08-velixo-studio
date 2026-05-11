"use client";

import type { CSSProperties, FormEvent, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  defaultSiteContent,
  normalizeSiteContent,
  type HomepageSectionId,
  type SiteContent,
} from "@/lib/site-content";

type CounterProps = {
  target: number;
  suffix?: string;
  active: boolean;
  delayMs?: number;
};

type AssistantMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M9 7h8v8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 7 7 17"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 7H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M6.75 9.25V18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M6.75 6.75v.05"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M10.5 9.25V18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M14.25 18v-4.2c0-1.95 1.14-3.3 2.85-3.3 1.66 0 2.4 1.05 2.4 2.8V18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.25 12.15V18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}

const mobileDockItems = [
  { label: "Home", href: "#home", icon: "home" as const },
  { label: "Services", href: "#services", icon: "services" as const },
  { label: "Work", href: "#work", icon: "work" as const },
  { label: "Contact", href: "#contact", icon: "contact" as const },
];

const dockSectionOrder = ["home", "services", "work", "contact"] as const;
type DockSection = (typeof dockSectionOrder)[number];

function scrollToSection(href: string) {
  if (!href.startsWith("#")) {
    return;
  }

  const target = document.querySelector(href);
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const viewport = document.querySelector(".scroll-shell__viewport");
  const scrollContainer = viewport instanceof HTMLElement ? viewport : null;

  if (href === "#home") {
    (scrollContainer ?? window).scrollTo({
      top: 0,
      behavior: "smooth",
    });
    return;
  }

  const header = document.querySelector("header");
  const headerOffset = header instanceof HTMLElement ? header.offsetHeight : 92;
  const overshoot = window.innerWidth < 768 ? 56 : 40;
  const containerTop = scrollContainer?.getBoundingClientRect().top ?? 0;
  const currentScrollTop = scrollContainer?.scrollTop ?? window.scrollY;
  const targetY =
    currentScrollTop + target.getBoundingClientRect().top - containerTop - headerOffset + overshoot;

  (scrollContainer ?? window).scrollTo({
    top: Math.max(targetY, 0),
    behavior: "smooth",
  });
}

function useCountUp({ target, suffix = "", active, delayMs = 0 }: CounterProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    const start = performance.now() + delayMs;
    const duration = 1600;
    let raf = 0;

    const tick = (time: number) => {
      if (time < start) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min((time - start) / duration, 1);
      const eased =
        progress < 0.8
          ? 1 - Math.pow(1 - progress / 0.8, 3) * 0.2
          : 0.8 + (1 - Math.pow(1 - (progress - 0.8) / 0.2, 2)) * 0.2;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, delayMs, target]);

  return `${value}${suffix}`;
}

function useAnimatedNumber(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    const start = performance.now();
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
  }, [active, duration, target]);

  return value;
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
  className,
}: {
  variant: "home" | "services" | "work" | "chat" | "contact";
  className?: string;
}) {
  const common = `h-5 w-5 stroke-[1.8] fill-none ${className || ""}`;

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

type AgencyHomeProps = {
  initialContent?: Partial<SiteContent>;
};

export default function AgencyHome({ initialContent }: AgencyHomeProps) {
  const siteContent = useMemo(
    () => normalizeSiteContent(initialContent ?? defaultSiteContent),
    [initialContent],
  );
  const navItems = siteContent.navigation;
  const services = siteContent.services;
  const clientNames = siteContent.clientNames;
  const projectNames = siteContent.projectNames;
  const offerItems = siteContent.offers;
  const assistantSuggestions = siteContent.assistant.suggestions;
  const stats = siteContent.stats;
  const processSteps = siteContent.processSteps;
  const team = siteContent.team;
  const reviewSeed = siteContent.reviews;
  const faqs = siteContent.faqs;
  const hero = siteContent.hero;
  const brand = siteContent.brand;
  const servicesSection = siteContent.servicesSection;
  const showcaseSection = siteContent.showcaseSection;
  const processSection = siteContent.processSection;
  const teamSection = siteContent.teamSection;
  const reviewsSection = siteContent.reviewsSection;
  const faqSection = siteContent.faqSection;
  const contactSection = siteContent.contactSection;
  const assistantSection = siteContent.assistant;
  const footer = siteContent.footer;
  const homepageOrder = siteContent.homepageOrder;

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
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: assistantSection.greeting,
    },
  ]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantDockOpen, setAssistantDockOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeTeamCard, setActiveTeamCard] = useState<string | null>(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);
  const [reviews, setReviews] = useState(reviewSeed);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    company: "",
    text: "",
  });
  const [reviewNotice, setReviewNotice] = useState("");
  const [contactNotice, setContactNotice] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<DockSection>("home");
  const dockScrollLockRef = useRef<number | null>(null);

  const [statsRef, statsVisible] = useInViewOnce<HTMLDivElement>();
  const [workRef, workVisible] = useInViewOnce<HTMLDivElement>();
  const teamPopupRef = useRef<HTMLDivElement | null>(null);
  const assistantScrollRef = useRef<HTMLDivElement | null>(null);
  const showAssistantSuggestions = !assistantMessages.some((message) => message.role === "user");

  const projectPills = useMemo(
    () => [...projectNames, ...projectNames],
    [projectNames],
  );

  const count50 = useCountUp({ target: stats[0].target, suffix: stats[0].suffix, active: statsVisible, delayMs: 300 });
  const count20 = useCountUp({ target: stats[1].target, suffix: stats[1].suffix, active: statsVisible, delayMs: 600 });
  const count5 = useCountUp({ target: stats[2].target, suffix: stats[2].suffix, active: statsVisible, delayMs: 900 });
  const count100 = useCountUp({ target: stats[3].target, suffix: stats[3].suffix, active: statsVisible, delayMs: 1200 });
  const widgetProgress = useAnimatedNumber(100, true, 1800);
  const [offerIndex, setOfferIndex] = useState(0);
  const activeService = activeServiceIndex === null ? null : services[activeServiceIndex];
  const homepageOrderMap = useMemo(
    () => new Map(homepageOrder.map((sectionId, index) => [sectionId, index])),
    [homepageOrder],
  );

  function sectionOrderStyle(sectionId: HomepageSectionId) {
    return { order: homepageOrderMap.get(sectionId) ?? 999 } as CSSProperties;
  }

  function handleSmoothAnchor(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();
    if (dockScrollLockRef.current !== null) {
      window.clearTimeout(dockScrollLockRef.current);
    }
    scrollToSection(href);
    setMobileOpen(false);
    const nextSection = href.slice(1) as DockSection;
    setActiveSection(nextSection);
    dockScrollLockRef.current = window.setTimeout(() => {
      dockScrollLockRef.current = null;
    }, 900);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("nexvora-theme", theme);
  }, [theme]);

  useEffect(() => {
    const viewport = document.querySelector(".scroll-shell__viewport");

    if (!(viewport instanceof HTMLElement)) {
      return;
    }

    const onScroll = () => {
      setHeaderSolid(viewport.scrollTop > 16);
    };

    onScroll();
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
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
    const interval = window.setInterval(() => {
      setOfferIndex((current) => (current + 1) % offerItems.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [offerItems.length]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const viewport = document.querySelector(".scroll-shell__viewport");
    if (!(viewport instanceof HTMLElement)) {
      return;
    }

    let frame = 0;

    const updateActiveSection = () => {
      if (dockScrollLockRef.current !== null) {
        return;
      }

      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const header = document.querySelector("header");
        const headerOffset = header instanceof HTMLElement ? header.offsetHeight : 92;
        const dockOffset = window.innerWidth < 768 ? 96 : 0;
        const probeLine = viewport.scrollTop + headerOffset + dockOffset + (window.innerWidth < 768 ? 18 : 12);
        let nextSection: DockSection = "home";

        for (const id of dockSectionOrder) {
          const element = document.getElementById(id);
          if (!element) {
            continue;
          }

          const top = element.getBoundingClientRect().top + viewport.scrollTop - viewport.getBoundingClientRect().top;

          if (probeLine >= top) {
            nextSection = id;
          }
        }

        setActiveSection(nextSection);
      });
    };

    updateActiveSection();
    viewport.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      cancelAnimationFrame(frame);
      if (dockScrollLockRef.current !== null) {
        window.clearTimeout(dockScrollLockRef.current);
      }
      viewport.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

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

  useEffect(() => {
    if (activeServiceIndex === null && !reviewModalOpen && !assistantDockOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveServiceIndex(null);
        setReviewModalOpen(false);
        setAssistantDockOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeServiceIndex, reviewModalOpen, assistantDockOpen]);

  useEffect(() => {
    if (activeServiceIndex === null && !reviewModalOpen && !assistantDockOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeServiceIndex, reviewModalOpen, assistantDockOpen]);

  useEffect(() => {
    if (!assistantDockOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const dock = assistantScrollRef.current;
      if (!dock) {
        return;
      }

      dock.scrollTo({
        top: dock.scrollHeight,
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [assistantDockOpen, assistantMessages]);

  async function handleAssistantSubmit() {
    const prompt = assistantInput.trim();

    if (!prompt || assistantLoading) {
      return;
    }

    setAssistantLoading(true);
    setAssistantInput("");

    const userMessage: AssistantMessage = {
      id: Date.now(),
      role: "user",
      content: prompt,
    };
    const pendingMessageId = userMessage.id + 1;

    setAssistantMessages((current) => [
      ...current,
      userMessage,
      {
        id: pendingMessageId,
        role: "assistant",
        content: "Thinking...",
      },
    ]);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      const reply =
        data.reply ||
        data.error ||
        "The assistant could not respond right now. Please try again.";

      setAssistantMessages((current) =>
        current.map((message) =>
          message.id === pendingMessageId
            ? {
                ...message,
                content: reply,
              }
            : message,
        ),
      );
    } catch {
      setAssistantMessages((current) =>
        current.map((message) =>
          message.id === pendingMessageId
            ? {
                ...message,
                content:
                  "The assistant is offline. Check the API configuration and try again.",
              }
            : message,
        ),
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

      const nextReview: SiteContent["reviews"][number] = {
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
    <div className="agency-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] mesh opacity-85" />

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          headerSolid ? "border-[var(--line)]" : "bg-transparent border-transparent"
        }`}
        style={
          headerSolid
            ? {
                backgroundColor: "var(--bg-elevated)",
                boxShadow: "0 18px 40px rgba(0, 0, 0, 0.12)",
              }
            : undefined
        }
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#home"
            onClick={(event) => handleSmoothAnchor(event, "#home")}
            className="group flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-sm font-bold text-white shadow-lg shadow-black/25">
              {brand.mark}
            </span>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight text-[var(--text)]">
                {brand.name}
              </div>
              <div className="text-xs text-[var(--text-soft)]">{brand.tagline}</div>
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
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[84vw] max-w-sm surface-panel-strong p-6"
            onClick={(event) => event.stopPropagation()}
          >
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
                &times;
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

      <main className="relative flex flex-col pb-24 pt-[5rem] md:pb-0 md:pt-[5.25rem]">
        <section
          id="home"
          style={sectionOrderStyle("hero")}
          className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-7xl items-center justify-center px-4 py-0 sm:px-6 sm:py-12 lg:block lg:min-h-0 lg:px-8 lg:pt-16 lg:pb-0"
        >
          <div className="grid w-full justify-items-center gap-6 text-center lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:justify-items-stretch lg:gap-10 lg:text-left">
            <div className="mx-auto flex w-full max-w-[22rem] flex-col items-center space-y-5 sm:max-w-3xl lg:mx-0 lg:max-w-none lg:items-start lg:space-y-8">
              <div className="inline-flex w-fit items-center gap-3 rounded-full chip px-4 py-2 text-sm text-[var(--text-soft)] backdrop-blur">
                <span className="dot" />
                {hero.eyebrow}
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h1 className="section-title mx-auto max-w-4xl text-[2.75rem] font-bold leading-[0.96] tracking-tight text-[var(--text)] sm:text-6xl lg:mx-0 lg:text-[4.9rem]">
                  {hero.title}
                </h1>
                <p className="mx-auto max-w-2xl text-base leading-7 text-[var(--text-soft)] sm:text-xl lg:mx-0">
                  {hero.description}
                </p>
              </div>

              <div className="flex w-fit flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href="#contact"
                  onClick={(event) => handleSmoothAnchor(event, "#contact")}
                  className="inline-flex min-w-[15rem] items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5 sm:min-w-0"
                >
                  {hero.primaryCta}
                </a>
                <a
                  href="#work"
                  onClick={(event) => handleSmoothAnchor(event, "#work")}
                  className="inline-flex min-w-[15rem] items-center justify-center rounded-full chip px-7 py-3.5 text-base font-semibold text-[var(--text)] backdrop-blur transition-colors hover:bg-white/10 sm:min-w-0"
                >
                  {hero.secondaryCta} ↓
                </a>
              </div>
            </div>

            <div className="relative mt-1 w-full max-w-[22rem] sm:mt-4 sm:max-w-3xl lg:mt-0 lg:max-w-none">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(108,99,255,0.24),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(0,212,170,0.18),transparent_45%)] blur-3xl" />
              <div className="surface-panel-strong overflow-hidden rounded-[2rem] p-4 sm:p-6 xl:h-auto xl:min-h-0">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(108,99,255,0.18),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(53,227,177,0.1),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(255,208,106,0.08),transparent_26%)]" />
                <div className="flex justify-center">
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-center shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur">
                    <div className="text-[0.72rem] uppercase tracking-[0.34em] text-[var(--text-soft)]">
                      {hero.badge}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_1fr] xl:items-stretch">
                  <div
                    className={`widget-water-shell relative hidden h-full min-h-[19.5rem] flex-col overflow-hidden rounded-[1.8rem] border p-4 xl:flex ${
                      theme === "light"
                        ? "border-[rgba(170,136,66,0.10)] bg-[linear-gradient(180deg,rgba(253,248,236,0.99),rgba(246,232,205,0.94))]"
                        : "border-white/10 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg-elevated)_72%,transparent),color-mix(in_srgb,var(--bg)_92%,transparent))]"
                    }`}
                    style={{ "--fill": `${widgetProgress}%` } as CSSProperties}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 ${
                        theme === "light"
                          ? "bg-[radial-gradient(circle_at_50%_8%,rgba(235,199,101,0.26),transparent_24%),radial-gradient(circle_at_center,rgba(143,131,255,0.06),transparent_66%)]"
                          : "bg-[radial-gradient(circle_at_center,rgba(53,227,177,0.12),transparent_42%),radial-gradient(circle_at_center,rgba(143,131,255,0.08),transparent_66%)]"
                      }`}
                    />
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 h-28 ${
                        theme === "light"
                          ? "bg-[linear-gradient(180deg,rgba(236,201,103,0.30),rgba(252,245,230,0.16) 42%,transparent 100%)]"
                          : "bg-[linear-gradient(180deg,rgba(53,227,177,0.08),rgba(0,0,0,0))]"
                      }`}
                    />
                    <div className="relative hidden items-center justify-start gap-3 lg:flex">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${theme === "light" ? "border-[rgba(170,136,66,0.14)] bg-[rgba(252,245,232,0.72)] text-[#b6841c]" : "border-white/10 bg-[rgba(255,255,255,0.03)] text-[var(--accent-2)]"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${theme === "light" ? "bg-[#d8b35b] shadow-[0_0_12px_rgba(216,179,91,0.55)]" : "bg-[var(--accent-2)] shadow-[0_0_12px_color-mix(in_srgb,var(--accent-2)_55%,transparent)]"}`} />
                        Scanning
                      </span>
                    </div>

                    <div className="relative mt-4 flex min-h-[14.5rem] flex-1 items-center justify-center">
                      <div
                        className={`widget-water-tank absolute inset-x-[29%] top-[8%] bottom-[8%] overflow-hidden rounded-full border ${
                          theme === "light"
                            ? "border-[rgba(118,93,34,0.28)] bg-[linear-gradient(180deg,rgba(103,88,62,0.52),rgba(59,51,44,0.30))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_18px_34px_rgba(0,0,0,0.10)]"
                            : "border-white/18 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(9,14,28,0.7))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_18px_34px_rgba(0,0,0,0.16)]"
                        }`}
                      >
                        <div
                          className="widget-water-fill absolute inset-x-0 bottom-0"
                          style={{ height: `${widgetProgress}%` }}
                        >
                          <div className="widget-water-flow absolute inset-0" />
                          <div className="widget-water-surface absolute inset-x-0 top-0 h-10" />
                          <div className="widget-water-ripples absolute inset-x-0 top-0 h-14" />
                        </div>
                        <div className="widget-water-gloss absolute inset-0" />
                      </div>

                      <div className="absolute left-1/2 top-1/2 flex h-[5.8rem] w-[5.8rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/10 bg-[color-mix(in_srgb,var(--bg-elevated)_82%,transparent)] text-center shadow-[0_0_22px_rgba(0,0,0,0.18)] backdrop-blur">
                        <div className="text-[1.65rem] font-semibold tracking-tight text-[var(--text)]">
                          {widgetProgress}
                        </div>
                        <div className="mt-1 text-[0.5rem] uppercase tracking-[0.28em] text-[var(--text-soft)]">
                          {hero.engineLabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex h-full min-h-0 flex-col rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg-elevated)_72%,transparent),color-mix(in_srgb,var(--bg)_92%,transparent))] p-3 sm:p-4">
                    <div className="flex flex-1 flex-col justify-start gap-2 pb-2 pt-0.5 sm:pb-3 sm:pt-1">
                      {offerItems.map((item, index) => {
                        const active = index === offerIndex;
                        return (
                          <div
                            key={item}
                            className={`flex items-center rounded-[1.05rem] border px-4 py-[0.56rem] transition-all duration-500 ${
                              active
                                ? "border-white/14 bg-white/[0.06] shadow-[0_10px_26px_rgba(0,0,0,0.14)]"
                                : "border-white/8 bg-white/[0.025] opacity-65"
                            }`}
                            style={{
                              transform: active ? "translateX(0)" : "translateX(4px)",
                            }}
                          >
                          <div className="flex w-full items-center gap-3">
                              <span className={`h-2 w-2 rounded-full ${active ? "bg-[var(--accent-2)]" : "bg-white/20"}`} />
                              <div className="min-w-0">
                                <div className={`truncate text-[0.9rem] font-medium tracking-tight ${active ? "text-[var(--text)]" : "text-[var(--text-soft)]"}`}>
                                  {item}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 hidden items-center gap-3 text-sm text-[var(--text-soft)] sm:flex">
          <span className="text-[var(--text)]">Scroll</span>
          <span className="dot" />
          <span>{hero.scrollHint}</span>
        </div>
        </section>

        <section ref={statsRef} style={sectionOrderStyle("stats")} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-[2rem] section-shell p-5 md:grid-cols-4">
            {[
              { value: count50, label: stats[0].label },
              { value: count20, label: stats[1].label },
              { value: count5, label: stats[2].label },
              { value: count100, label: stats[3].label },
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

        <section id="services" style={sectionOrderStyle("services")} className="mx-auto max-w-7xl px-4 py-14 scroll-mt-36 sm:px-6 sm:scroll-mt-40 lg:px-8 lg:scroll-mt-44">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                {servicesSection.kicker}
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                {servicesSection.title}
              </h2>
            </div>
            <p className="section-lead">
              {servicesSection.lead}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="group relative overflow-hidden rounded-[1.25rem] surface-panel-strong p-3.5 sm:p-4"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(108,99,255,0.16),transparent_36%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <button
                  type="button"
                  onClick={() => setActiveServiceIndex(index)}
                  className="relative flex w-full flex-col gap-2.5 text-left"
                >
                  <div className="flex items-start gap-2.5">
                    <ServiceIcon index={index} />
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="text-[1.02rem] font-semibold text-[var(--text)] sm:text-[1.1rem]">
                        {service.title}
                      </h3>
                      <p className="max-w-[22rem] text-[0.82rem] leading-5 text-[var(--text-soft)] sm:text-sm">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 text-[0.82rem] font-medium text-[var(--accent-2)] sm:text-sm">
                    Learn More <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          id="work"
          ref={workRef}
          style={sectionOrderStyle("showcase")}
          className="mx-auto max-w-7xl px-4 py-14 scroll-mt-36 sm:px-6 sm:scroll-mt-40 lg:px-8 lg:scroll-mt-44"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                {showcaseSection.kicker}
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                {showcaseSection.title}
              </h2>
            </div>
            <p className="section-lead">
              {showcaseSection.lead}
            </p>
          </div>

          <div className="relative left-1/2 flex w-screen -translate-x-1/2 flex-col gap-6">
            <div className="surface-panel-strong ml-auto w-[calc(100%-1rem)] rounded-[2rem] rounded-r-none p-6 sm:w-[calc(100%-1.5rem)] lg:w-[calc(100%-2rem)]">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-[var(--text-soft)]">Project names</div>
                  <div className="text-xl font-semibold">Launches with visible momentum</div>
                </div>
              </div>
              <div className="marquee project-marquee">
                <div className="marquee-track reverse pl-6 sm:pl-8 lg:pl-10">
                  {projectPills.map((name, index) => (
                    <div
                      key={`${name}-pill-${index}`}
                      className="chip flex h-12 min-w-[7.5rem] items-center justify-center px-4 py-3 text-xs font-medium text-[var(--text)] sm:min-w-[10rem] sm:px-5 sm:text-sm lg:min-w-[12rem] lg:text-base"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel-strong mr-auto w-[calc(100%-1rem)] rounded-[2rem] rounded-l-none p-6 sm:w-[calc(100%-1.5rem)] lg:w-[calc(100%-2rem)]">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-[var(--text-soft)]">Client logos</div>
                  <div className="text-xl font-semibold">Trusted by product teams</div>
                </div>
              </div>
              <div className="marquee project-marquee">
                <div className="marquee-track pl-6 sm:pl-8 lg:pl-10">
                  {[...clientNames, ...clientNames].map((name, index) => (
                    <div
                      key={`${name}-logo-${index}`}
                      className="chip flex h-12 min-w-[9.5rem] items-center justify-center px-4 text-sm font-medium text-[var(--text)] sm:min-w-[11.5rem] sm:px-5 sm:text-base"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {workVisible ? (
            <div className="mt-6 rounded-[2rem] surface-panel px-5 py-4 text-sm text-[var(--text-soft)]">
              {showcaseSection.note}
            </div>
          ) : null}
        </section>

        <section
          id="process"
          style={sectionOrderStyle("process")}
          className="mx-auto max-w-7xl px-4 py-14 scroll-mt-36 sm:px-6 sm:scroll-mt-40 lg:px-8 lg:scroll-mt-44"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                {processSection.kicker}
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                {processSection.title}
              </h2>
            </div>
            <p className="section-lead">
              {processSection.lead}
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
          style={sectionOrderStyle("team")}
          className="mx-auto max-w-7xl px-4 py-14 scroll-mt-36 sm:px-6 sm:scroll-mt-40 lg:px-8 lg:scroll-mt-44"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                {teamSection.kicker}
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                {teamSection.title}
              </h2>
            </div>
            <p className="section-lead">
              {teamSection.lead}
            </p>
          </div>

          <div ref={teamPopupRef} className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <article key={member.name} className={`flip-card rounded-[1.6rem] ${activeTeamCard === member.name ? "is-flipped" : ""}`}>
                <div className="flip-inner relative h-full min-h-[18rem]">
                  <div className="flip-face absolute inset-0 rounded-[1.6rem] surface-panel-strong p-4 sm:p-5">
                    <div className="pointer-events-none absolute left-4 top-4 bottom-4 w-px rounded-full bg-[linear-gradient(180deg,rgba(53,227,177,0.08),rgba(53,227,177,0.55),rgba(143,131,255,0.06))] opacity-80" />
                    <div className="flex h-full flex-col pl-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(108,99,255,0.18),rgba(0,212,170,0.16))] text-lg font-bold text-white">
                          {member.initials}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTeamCard((current) => (current === member.name ? null : member.name))}
                          className="chip flex h-9 w-9 items-center justify-center text-sm text-[var(--text-soft)] transition-colors hover:text-[var(--text)]"
                          aria-pressed={activeTeamCard === member.name}
                          aria-label="Flip card"
                        >
                          ⟳
                        </button>
                      </div>

                      <div className="mt-4 space-y-1">
                        <h3 className="text-lg font-semibold text-[var(--text)]">{member.name}</h3>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent-2)]">
                          {member.role}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className="chip px-3 py-1 text-[11px] text-[var(--text-soft)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center justify-start gap-3 pt-4">
                        <a
                          href="https://lakshyaps.netlify.app/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          View Portfolio →
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flip-face flip-back absolute inset-0 rounded-[1.6rem] surface-panel-strong p-4 sm:p-5">
                    <div className="pointer-events-none absolute left-4 top-4 bottom-4 w-px rounded-full bg-[linear-gradient(180deg,rgba(53,227,177,0.08),rgba(53,227,177,0.55),rgba(143,131,255,0.06))] opacity-80" />
                    <div className="flex h-full flex-col pl-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-soft)]">
                          Bio
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTeamCard(null)}
                          className="chip flex h-9 w-9 items-center justify-center text-xs text-[var(--text-soft)] transition-colors hover:text-[var(--text)]"
                          aria-label="Close bio"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[var(--text)]">{member.bio}</p>
                      <div className="mt-auto flex items-center gap-3 pt-4">
                        <a
                          href={member.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(108,99,255,0.16),rgba(0,212,170,0.12))] px-4 text-sm font-medium text-[var(--text)] transition-transform hover:-translate-y-0.5"
                          aria-label={`${member.name} portfolio`}
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                          Portfolio
                        </a>
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(53,227,177,0.16),rgba(143,131,255,0.12))] px-4 text-sm font-medium text-[var(--text)] transition-transform hover:-translate-y-0.5"
                          aria-label={`${member.name} LinkedIn`}
                        >
                          <LinkedinIcon className="h-4 w-4" />
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="reviews" style={sectionOrderStyle("reviews")} className="mx-auto max-w-7xl px-4 py-14 scroll-mt-36 sm:px-6 sm:scroll-mt-40 lg:px-8 lg:scroll-mt-44">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                {reviewsSection.kicker}
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                {reviewsSection.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-6 py-3 text-sm font-semibold text-white"
            >
              {reviewsSection.ctaButton}
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

        {assistantDockOpen ? (
          <>
            <div
              className="fixed inset-0 z-[120] lg:hidden"
              onClick={() => setAssistantDockOpen(false)}
            >
              <div
                className={`absolute inset-0 ${
                  theme === "light"
                    ? "bg-[linear-gradient(180deg,rgba(252,246,233,0.98),rgba(244,234,213,0.98))]"
                    : "bg-[linear-gradient(180deg,rgba(4,8,20,0.98),rgba(8,13,25,0.99))]"
                } backdrop-blur-[12px]`}
                aria-hidden="true"
              />
              <section
                id="assistant-dock"
                className={`absolute inset-0 flex h-full w-full flex-col overflow-hidden border shadow-[0_30px_80px_rgba(0,0,0,0.42)] ${
                  theme === "light"
                    ? "border-[rgba(170,136,66,0.12)] bg-[linear-gradient(180deg,rgba(252,246,233,0.995),rgba(244,234,213,0.985))] text-[#181310]"
                    : "border-white/10 bg-[rgba(9,14,26,0.98)] text-[var(--text)]"
                }`}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="relative flex items-start justify-between gap-4 border-b border-white/5 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+0.9rem)] sm:px-5">
                  <div className="relative">
                    <div className={`text-[10px] uppercase tracking-[0.34em] ${theme === "light" ? "text-[#8f6416]" : "text-[var(--accent-2)]"}`}>
                      {assistantSection.dockTitle}
                    </div>
                    <div className={`mt-2 text-lg font-semibold ${theme === "light" ? "text-[#181310]" : "text-[var(--text)]"}`}>
                      {assistantSection.dockTitle}
                    </div>
                    <p className={`mt-1 text-xs leading-5 ${theme === "light" ? "text-[#7a6850]" : "text-white/56"}`}>
                      {assistantSection.dockDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssistantDockOpen(false)}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${
                      theme === "light"
                        ? "border-black/10 bg-white/70 text-[#181310] hover:bg-white"
                        : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                    }`}
                    aria-label={`Close ${assistantSection.dockTitle}`}
                  >
                    &times;
                  </button>
                </div>

                <div
                  ref={assistantScrollRef}
                  className="flex-1 overflow-y-auto px-4 py-4 sm:px-5"
                >
                  <div className="space-y-3">
                    {assistantMessages.map((message) => {
                      const isUser = message.role === "user";

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                              isUser
                                ? "bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white"
                                : theme === "light"
                                  ? "border border-black/5 bg-white/72 text-[#2a2118]"
                                  : "border border-white/8 bg-white/[0.04] text-white/88"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/5 bg-black/5 p-3 sm:p-4 dock-safe">
                  {showAssistantSuggestions ? (
                    <div className="-mx-1 mb-3 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1">
                      {assistantSuggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setAssistantInput(item)}
                          className="chip shrink-0 whitespace-nowrap px-3 py-1.5 text-[11px] text-[var(--text-soft)] shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleAssistantSubmit();
                    }}
                    className="relative"
                  >
                    <div className="flex items-center gap-2 rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
                      <input
                        value={assistantInput}
                        onChange={(event) => setAssistantInput(event.target.value)}
                        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-soft)]"
                        placeholder={`Message ${assistantSection.dockTitle}...`}
                        aria-label={`Message ${assistantSection.dockTitle}`}
                      />
                      <button
                        type="submit"
                        disabled={assistantLoading || !assistantInput.trim()}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Send message"
                      >
                        ↑
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>

            <div className="pointer-events-none fixed inset-0 z-[66] hidden lg:block">
              <section
                id="assistant-dock"
                className={`pointer-events-auto fixed bottom-4 right-4 flex flex-col overflow-hidden rounded-[1.75rem] border shadow-[0_30px_80px_rgba(0,0,0,0.42)] ${
                  theme === "light"
                    ? "border-[rgba(170,136,66,0.12)] bg-[linear-gradient(180deg,rgba(252,246,233,0.995),rgba(244,234,213,0.985))] text-[#181310]"
                    : "border-white/10 bg-[rgba(9,14,26,0.98)] text-[var(--text)]"
                }`}
                style={{
                  right: "1rem",
                  bottom: "1rem",
                  width: "min(26rem, calc(100vw - 2rem))",
                  height: "min(38rem, calc(100vh - 8.5rem))",
                  maxHeight: "calc(100vh - 8.5rem)",
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="relative flex items-start justify-between gap-4 border-b border-white/5 px-4 py-4 sm:px-5">
                  <div className="relative">
                    <div className={`text-[10px] uppercase tracking-[0.34em] ${theme === "light" ? "text-[#8f6416]" : "text-[var(--accent-2)]"}`}>
                      {assistantSection.dockTitle}
                    </div>
                    <div className={`mt-2 text-lg font-semibold ${theme === "light" ? "text-[#181310]" : "text-[var(--text)]"}`}>
                      {assistantSection.dockTitle}
                    </div>
                    <p className={`mt-1 text-xs leading-5 ${theme === "light" ? "text-[#7a6850]" : "text-white/56"}`}>
                      {assistantSection.dockDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssistantDockOpen(false)}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${
                      theme === "light"
                        ? "border-black/10 bg-white/70 text-[#181310] hover:bg-white"
                        : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                    }`}
                    aria-label={`Close ${assistantSection.dockTitle}`}
                  >
                    ×
                  </button>
                </div>

                <div
                  ref={assistantScrollRef}
                  className="flex-1 overflow-y-auto px-4 py-4 sm:px-5"
                >
                  <div className="space-y-3">
                    {assistantMessages.map((message) => {
                      const isUser = message.role === "user";

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                              isUser
                                ? "bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white"
                                : theme === "light"
                                  ? "border border-black/5 bg-white/72 text-[#2a2118]"
                                  : "border border-white/8 bg-white/[0.04] text-white/88"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/5 bg-black/5 p-3 sm:p-4 dock-safe">
                  {showAssistantSuggestions ? (
                    <div className="-mx-1 mb-3 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1">
                      {assistantSuggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setAssistantInput(item)}
                          className="chip shrink-0 whitespace-nowrap px-3 py-1.5 text-[11px] text-[var(--text-soft)] shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleAssistantSubmit();
                    }}
                    className="relative"
                  >
                    <div className="flex items-center gap-2 rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
                      <input
                        value={assistantInput}
                        onChange={(event) => setAssistantInput(event.target.value)}
                        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-soft)]"
                        placeholder={`Message ${assistantSection.dockTitle}...`}
                        aria-label={`Message ${assistantSection.dockTitle}`}
                      />
                      <button
                        type="submit"
                        disabled={assistantLoading || !assistantInput.trim()}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Send message"
                      >
                        ↑
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setAssistantDockOpen(true);
            }}
            className={`assistant-fab z-[90] inline-flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-xl transition-transform bottom-[5.75rem] sm:bottom-3 ${
              theme === "light"
                ? "border-[rgba(170,136,66,0.16)] bg-[linear-gradient(135deg,rgba(252,246,233,0.96),rgba(244,234,213,0.9))] text-[#181310]"
                : "border-white/10 bg-[linear-gradient(135deg,rgba(12,18,34,0.96),rgba(8,13,25,0.88))] text-[var(--text)]"
              }`}
            aria-expanded={assistantDockOpen}
            aria-controls="assistant-dock"
            aria-label="Open Studio AI"
            style={{
              position: "fixed",
              right: "1rem",
            }}
          >
            <span className="assistant-fab-glow" aria-hidden="true" />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-base text-white shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
              ✦
            </span>
          </button>
        )}

        <section
          id="contact"
          style={sectionOrderStyle("contact")}
          className="mx-auto max-w-7xl px-4 py-14 scroll-mt-36 sm:px-6 sm:scroll-mt-40 lg:px-8 lg:scroll-mt-44"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="section-kicker">
                {contactSection.kicker}
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                {contactSection.title}
              </h2>
            </div>
            <p className="max-w-2xl text-[var(--text-soft)]">
              {contactSection.lead}
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
                    <span className="text-[var(--text)]">{contactSection.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl surface-panel px-4 py-4">
                    <span>WhatsApp</span>
                    <span className="text-[var(--text)]">{contactSection.whatsapp}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl surface-panel px-4 py-4">
                    <span>City</span>
                    <span className="text-[var(--text)]">{contactSection.city}</span>
                  </div>
                </div>
              </div>

              <div className="surface-panel-strong rounded-[2rem] p-6">
                <div className="section-kicker">
                  Booking
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-[var(--text)]">
                  {contactSection.bookingTitle}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                  {contactSection.bookingDescription}
                </p>
                <a
                  href="#home"
                  onClick={(event) => handleSmoothAnchor(event, "#home")}
                  className="mt-5 inline-flex items-center justify-center rounded-full surface-panel px-6 py-3 text-sm font-semibold text-[var(--text)]"
                >
                  {contactSection.bookingButton}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section style={sectionOrderStyle("faqs")} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="section-kicker">
                {faqSection.kicker}
              </div>
              <h2 className="section-title mt-3 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                {faqSection.title}
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

        <footer style={sectionOrderStyle("footer")} className="surface-panel border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-5 pb-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white font-bold">
                    {brand.mark}
                  </span>
                  <div>
                    <div className="font-semibold text-[var(--text)]">{brand.name}</div>
                    <div className="text-sm text-[var(--text-soft)]">{brand.tagline}</div>
                  </div>
                </div>
                <p className="max-w-sm text-sm leading-7 text-[var(--text-soft)]">
                  {footer.description}
                </p>
              </div>

              <div>
                <div className="section-kicker footer-kicker">
                  Services
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text-soft)]">
                  {footer.serviceLinks.map((service) => (
                    <a
                      key={service}
                      href="#services"
                      onClick={(event) => handleSmoothAnchor(event, "#services")}
                      className="transition-colors hover:text-[var(--text)]"
                    >
                      {service}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div className="section-kicker footer-kicker">
                  Company
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text-soft)]">
                  {footer.companyLinks.map((item) => (
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
                  <div>{contactSection.email}</div>
                  <div>{contactSection.whatsapp}</div>
                  <div>{contactSection.city}</div>
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
              <div>{footer.copyright}</div>
              <div className="flex flex-wrap gap-5">
                <a href="#home" onClick={(event) => handleSmoothAnchor(event, "#home")}>Privacy Policy</a>
                <a href="#home" onClick={(event) => handleSmoothAnchor(event, "#home")}>Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <div className="dock-safe fixed inset-x-0 bottom-0 z-40 surface-panel border-t border-white/10 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1 px-3 py-2">
          {mobileDockItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);

            return (
            <a
              key={item.label}
              href={item.href}
              onClick={(event) => handleSmoothAnchor(event, item.href)}
              aria-current={isActive ? "page" : undefined}
              className={`bottom-dock-item relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition-all duration-300 ${
                isActive
                  ? "is-active bg-white/10 text-[var(--text)]"
                  : "text-[var(--text-soft)] hover:bg-white/5 hover:text-[var(--text)]"
              }`}
            >
              <DockIcon variant={item.icon} className={isActive ? "scale-110" : ""} />
              <span>{item.label}</span>
            </a>
            );
          })}
        </div>
      </div>

      {activeService ? (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-6 ${theme === "light" ? "bg-black/45" : "bg-black/70"}`}
          onClick={() => setActiveServiceIndex(null)}
        >
          <div
            className={`my-auto w-full max-w-[68rem] max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[2rem] border p-4 shadow-[0_30px_90px_rgba(0,0,0,0.48)] sm:p-6 lg:min-h-[32rem] ${
              theme === "light"
                ? "border-[rgba(170,136,66,0.12)] bg-[linear-gradient(180deg,rgba(252,246,233,0.99),rgba(244,234,213,0.98))] text-[#181310]"
                : "border-white/10 bg-[rgba(9,14,26,0.98)] text-[var(--text)]"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`flex items-start justify-between gap-4 border-b pb-4 ${theme === "light" ? "border-black/10" : "border-white/10"}`}>
              <div>
                <div
                  className={`text-sm uppercase tracking-[0.22em] ${
                    theme === "light" ? "text-[#8f6416]" : "text-[var(--accent-2)]"
                  }`}
                >
                  Service Deep Dive
                </div>
                <h3 className={`mt-2 text-[1.9rem] font-semibold leading-tight sm:text-[2.15rem] ${theme === "light" ? "text-[#181310]" : "text-[var(--text)]"}`}>
                  {activeService.title}
                </h3>
                <p className={`mt-2 max-w-2xl text-sm leading-6 ${theme === "light" ? "text-[#6f5d49]" : "text-white/68"}`}>
                  {activeService.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveServiceIndex(null)}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${
                  theme === "light"
                    ? "border-black/10 bg-black/[0.04] text-[#181310] hover:bg-black/[0.08]"
                    : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                }`}
                aria-label="Close service details"
              >
                &times;
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
              <div className={`rounded-[1.35rem] border p-4 sm:p-5 ${theme === "light" ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]"}`}>
                <div className={`text-sm uppercase tracking-[0.2em] ${theme === "light" ? "text-[#7a6850]" : "text-white/55"}`}>
                  What This Covers
                </div>
                <ul className={`mt-3 space-y-2.5 text-sm leading-6 ${theme === "light" ? "text-[#2a2118]" : "text-white/82"}`}>
                  {activeService.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-2)] shadow-[0_0_14px_rgba(53,227,177,0.35)]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`rounded-[1.35rem] border p-4 sm:p-5 ${theme === "light" ? "border-black/10 bg-black/[0.03]" : "border-white/10 bg-white/[0.03]"}`}>
                <div className={`text-sm uppercase tracking-[0.2em] ${theme === "light" ? "text-[#7a6850]" : "text-white/55"}`}>
                  Suggested Tools
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeService.technologies.map((technology) => (
                    <span
                      key={technology}
                      className={`rounded-full border px-3 py-2 text-xs font-medium ${
                        theme === "light"
                          ? "border-black/10 bg-white/70 text-[#181310]"
                          : "border-white/10 bg-white/[0.05] text-[var(--text)]"
                      }`}
                    >
                      {technology}
                    </span>
                  ))}
                </div>

                <div className={`mt-5 text-sm uppercase tracking-[0.2em] ${theme === "light" ? "text-[#7a6850]" : "text-white/55"}`}>
                  Delivery Flow
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 sm:gap-3">
                  {[
                    { phase: "Discover", detail: "Clarify the brief, scope, and outcome." },
                    { phase: "Build", detail: "Shape the work with clean structure and polish." },
                    { phase: "Launch", detail: "Deliver the final output ready for use." },
                  ].map((step, stepIndex) => (
                    <div
                      key={step.phase}
                      className={`flex items-start gap-3 rounded-2xl border p-3 ${
                        theme === "light" ? "border-black/10 bg-white/70" : "border-white/8 bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-xs font-semibold text-white">
                        {String(stepIndex + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${theme === "light" ? "text-[#181310]" : "text-[var(--text)]"}`}>{step.phase}</div>
                        <div className={`mt-1 text-xs leading-5 ${theme === "light" ? "text-[#6f5d49]" : "text-white/55"}`}>{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {reviewModalOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] surface-panel-strong p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-[var(--accent-2)]">
                  {reviewsSection.ctaButton}
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                  {reviewsSection.modalTitle}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                  {reviewsSection.modalDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full soft-border"
                aria-label="Close review form"
              >
                &times;
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



