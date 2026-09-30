"use client";

import type { CSSProperties, FormEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  defaultSiteContent,
  normalizeSiteContent,
  type HomepageSectionId,
  type SiteContent,
} from "@/lib/site-content";
import "./home/nexvora.css";
import {
  ArrowRight,
  ArrowUpRight,
  BrandMark,
  Chat,
  Check,
  Close,
  CountUp,
  DashboardScreen,
  DevicePair,
  FaqList,
  LinkedinIcon,
  Mail,
  Menu,
  Moon,
  PhoneAssistantScreen,
  Pin,
  Reveal,
  Send,
  ServiceIcon,
  Sparkle,
  Star,
  Sun,
  cx,
  getScroller,
  useInView,
} from "./home/parts";

type AssistantMessage = { id: number; role: "user" | "assistant"; content: string };
type Theme = "light" | "dark";
const THEME_KEY = "nexvora-theme-v2";

const mobileTabs = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
] as const;
type TabSection = "home" | "services" | "work" | "contact";
const sectionToTab: Record<string, TabSection> = {
  home: "home",
  services: "services",
  work: "work",
  process: "work",
  team: "work",
  reviews: "work",
  contact: "contact",
  faq: "contact",
};

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-nx-theme"] });
  return () => observer.disconnect();
}
const readTheme = (): Theme => (document.documentElement.getAttribute("data-nx-theme") === "dark" ? "dark" : "light");

function hasLink(url?: string) {
  return Boolean(url) && !url!.startsWith("#");
}

/** "Pharma CRM — Soul Pharma" → { name: "Pharma CRM", client: "Soul Pharma" } */
function splitProject(value: string) {
  const [name, ...rest] = value.split(/\s+[—–-]\s+/);
  return { name: name.trim(), client: rest.join(" — ").trim() };
}

function scrollToHash(href: string) {
  if (!href.startsWith("#")) return;
  const scroller = getScroller();
  if (href === "#home") {
    (scroller ?? window).scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const target = document.querySelector(href);
  if (!(target instanceof HTMLElement)) return;
  const containerTop = scroller?.getBoundingClientRect().top ?? 0;
  const current = scroller?.scrollTop ?? window.scrollY;
  const top = current + target.getBoundingClientRect().top - containerTop - 72;
  (scroller ?? window).scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

function trackSpotlight(event: ReactPointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  el.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

function SectionHeader({ kicker, title, lead, action }: { kicker: string; title: string; lead?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
      <Reveal>
        <div className="nx-kicker">{kicker}</div>
        <h2 className="nx-display nx-h2 mt-4 max-w-[18ch]">{title}</h2>
      </Reveal>
      {(lead || action) && (
        <Reveal delay={80} className="flex flex-col items-start gap-5 lg:pb-2">
          {lead && <p className="nx-lead text-lg">{lead}</p>}
          {action}
        </Reveal>
      )}
    </div>
  );
}

type AgencyHomeProps = { initialContent?: Partial<SiteContent> };

export default function AgencyHome({ initialContent }: AgencyHomeProps) {
  const site = useMemo(() => normalizeSiteContent(initialContent ?? defaultSiteContent), [initialContent]);
  const { brand, hero, stats, services, processSteps, team, faqs, footer, homepageOrder } = site;
  const contactSection = site.contactSection;
  const assistantSection = site.assistant;

  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light" as Theme);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabSection>("home");
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [reviews, setReviews] = useState(site.reviews);
  const [reviewForm, setReviewForm] = useState({ name: "", company: "", text: "" });
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewNotice, setReviewNotice] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  const [contactNotice, setContactNotice] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [newsletterNotice, setNewsletterNotice] = useState("");

  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    { id: 1, role: "assistant", content: assistantSection.greeting },
  ]);
  const assistantScrollRef = useRef<HTMLDivElement | null>(null);
  const tabLockRef = useRef<number | null>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [statsRef, statsVisible] = useInView<HTMLDivElement>("0px 0px -20% 0px");

  const orderMap = useMemo(() => new Map(homepageOrder.map((id, index) => [id, index])), [homepageOrder]);
  const orderStyle = (id: HomepageSectionId) => ({ order: orderMap.get(id) ?? 999 }) as CSSProperties;
  const activeService = activeServiceIndex === null ? null : services[activeServiceIndex];
  const anyOverlay = mobileOpen || activeServiceIndex !== null || reviewModalOpen || assistantOpen;
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 6);
  const projects = useMemo(() => site.projectNames.map(splitProject), [site.projectNames]);
  const phoneQuestion = faqs[0]?.question ?? assistantSection.suggestions[0] ?? "How long does a project take?";
  const phoneAnswer = faqs[0]?.answer ?? "Most projects ship in a few weeks, depending on scope.";

  // ── Theme: the boot script set <html data-nx-theme> before paint; mirror it here.
  // Leaving the homepage (e.g. to /admin) drops its theme so the admin keeps its own look.
  useEffect(() => () => document.documentElement.removeAttribute("data-nx-theme"), []);
  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-nx-theme", next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage unavailable */
    }
  };

  // ── Live reviews (keep the server snapshot if the fetch fails).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/reviews")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { reviews?: SiteContent["reviews"] } | null) => {
        if (!cancelled && data?.reviews?.length) setReviews(data.reviews);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Header frosts once the page scrolls.
  useEffect(() => {
    const scroller = getScroller();
    const target: HTMLElement | Window = scroller ?? window;
    const onScroll = () => setScrolled((scroller?.scrollTop ?? window.scrollY) > 12);
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  // ── Mobile tab bar follows the section in view.
  useEffect(() => {
    const ids = Object.keys(sectionToTab);
    const observer = new IntersectionObserver(
      (entries) => {
        if (tabLockRef.current !== null) return;
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActiveTab(sectionToTab[hit.target.id] ?? "home");
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // ── Process: the step crossing the middle of the screen is the active one.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveStep(Number((entry.target as HTMLElement).dataset.index ?? 0));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [processSteps.length]);

  // ── Overlays: Esc closes, the page behind stops scrolling.
  useEffect(() => {
    if (!anyOverlay) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      setActiveServiceIndex(null);
      setReviewModalOpen(false);
      setAssistantOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const scroller = getScroller();
    const previous = scroller?.style.overflow ?? "";
    if (scroller) scroller.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (scroller) scroller.style.overflow = previous;
    };
  }, [anyOverlay]);

  useEffect(() => {
    if (!assistantOpen) return;
    const frame = requestAnimationFrame(() => {
      const el = assistantScrollRef.current;
      el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [assistantOpen, assistantMessages]);

  const goTo = useCallback((event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    event.preventDefault();
    setMobileOpen(false);
    scrollToHash(href);
    const tab = sectionToTab[href.slice(1)];
    if (tab) {
      setActiveTab(tab);
      if (tabLockRef.current !== null) window.clearTimeout(tabLockRef.current);
      tabLockRef.current = window.setTimeout(() => {
        tabLockRef.current = null;
      }, 900);
    }
  }, []);

  // ── Assistant
  async function handleAssistantSubmit() {
    const prompt = assistantInput.trim();
    if (!prompt || assistantLoading) return;
    setAssistantLoading(true);
    setAssistantInput("");
    const userMessage: AssistantMessage = { id: Date.now(), role: "user", content: prompt };
    const pendingId = userMessage.id + 1;
    setAssistantMessages((current) => [...current, userMessage, { id: pendingId, role: "assistant", content: "…" }]);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      const reply = data.reply || data.error || "The assistant couldn’t respond right now. Please try again.";
      setAssistantMessages((current) => current.map((m) => (m.id === pendingId ? { ...m, content: reply } : m)));
    } catch {
      setAssistantMessages((current) =>
        current.map((m) => (m.id === pendingId ? { ...m, content: "The assistant is offline right now. Email us instead and we’ll reply within a day." } : m)),
      );
    } finally {
      setAssistantLoading(false);
    }
  }

  // ── Reviews
  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reviewBusy) return;
    setReviewBusy(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reviewForm, rating: selectedRating }),
      });
      if (!response.ok) throw new Error("We couldn’t save your review right now. Please try again.");
      const name = reviewForm.name || "Anonymous";
      setReviews((current) => [
        {
          id: Date.now(),
          name,
          company: reviewForm.company || "Client",
          date: "Just now",
          rating: selectedRating,
          text: reviewForm.text || "Thank you for the kind feedback.",
          initials: name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
        },
        ...current,
      ]);
      setReviewForm({ name: "", company: "", text: "" });
      setSelectedRating(5);
      setReviewModalOpen(false);
      setReviewNotice("Thank you. Your review is live.");
    } catch (error) {
      setReviewNotice(error instanceof Error ? error.message : "We couldn’t save your review right now.");
    } finally {
      setReviewBusy(false);
    }
  }

  // ── Contact
  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setContactBusy(true);
    setContactNotice("");
    try {
      const response = await fetch("/api/contact", { method: "POST", body: new FormData(form) });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "We couldn’t send your request.");
      setContactSuccess(true);
      setContactNotice(data.message || "Thanks. We’ll reply within one business day.");
      form.reset();
    } catch (error) {
      setContactSuccess(false);
      setContactNotice(error instanceof Error ? error.message : "We couldn’t send your request.");
    } finally {
      setContactBusy(false);
    }
  }

  // ── Newsletter: stored as an inquiry so it lands in the admin inbox.
  async function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") || "").trim();
    if (!email) return;
    const body = new FormData();
    body.set("fullName", "Newsletter subscriber");
    body.set("email", email);
    body.set("subject", "Newsletter signup");
    body.set("message", `Please add ${email} to the ${brand.name} newsletter.`);
    body.set("inquiryType", "Newsletter");
    try {
      const response = await fetch("/api/contact", { method: "POST", body });
      if (!response.ok) throw new Error();
      setNewsletterNotice("You’re on the list.");
      form.reset();
    } catch {
      setNewsletterNotice("That didn’t go through. Please try again.");
    }
  }

  const stepProgress = processSteps.length > 1 ? activeStep / (processSteps.length - 1) : 1;

  return (
    <div className="nx relative min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className={cx(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-200 ease-out",
          scrolled
            ? "border-[var(--nx-line)] bg-[color-mix(in_srgb,var(--nx-bg)_74%,transparent)] shadow-[0_8px_24px_-18px_rgba(20,18,40,0.4)] backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-transparent",
        )}
      >
        <header className={cx("nx-container grid h-16 grid-cols-[1fr_auto] items-center transition-colors duration-200 lg:grid-cols-[1fr_auto_1fr]", scrolled ? "text-[var(--nx-ink)]" : "text-white")}>
          <a href="#home" onClick={(e) => goTo(e, "#home")} className="flex items-center gap-2.5 justify-self-start" aria-label={`${brand.name} home`}>
            <BrandMark mark={brand.mark} className="size-9 text-[15px]" />
            <span className="leading-tight">
              <span className="block text-[17px] font-semibold tracking-tight">{brand.name}</span>
              <span className={cx("hidden text-xs sm:block", scrolled ? "text-[var(--nx-muted)]" : "text-white/75")}>{brand.tagline}</span>
            </span>
          </a>
          <nav aria-label="Main" className="hidden lg:block">
            <ul
              className={cx(
                "flex items-center gap-1 rounded-full border p-1 transition-colors duration-200",
                scrolled ? "border-[var(--nx-line)] bg-[var(--nx-card)]" : "border-white/25 bg-white/10 backdrop-blur-md",
              )}
            >
              {site.navigation.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => goTo(e, item.href)}
                    className={cx(
                      "block rounded-full px-4 py-1.5 text-[14px] font-medium transition-colors duration-150",
                      scrolled ? "text-[var(--nx-muted)] hover:bg-[var(--nx-bg-deep)] hover:text-[var(--nx-ink)]" : "text-white/85 hover:bg-white/15 hover:text-white",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2 justify-self-end">
            <button
              type="button"
              onClick={toggleTheme}
              className={cx("nx-icon-btn", !scrolled && "border-white/30 bg-white/10 text-white hover:text-white")}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
            <a href="#contact" onClick={(e) => goTo(e, "#contact")} className={cx("nx-btn hidden min-h-10 px-4 text-[14px] sm:inline-flex", scrolled ? "nx-btn-ink" : "nx-btn-white")}>
              Start a project
              <ArrowRight className="size-4" />
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={cx("nx-icon-btn lg:hidden", !scrolled && "border-white/30 bg-white/10 text-white hover:text-white")}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </header>
      </div>

      {mobileOpen && (
        <>
          <div className="nx-overlay" onClick={() => setMobileOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-y-0 right-0 z-[81] flex w-[86vw] max-w-sm flex-col bg-[var(--nx-card)] p-6 shadow-2xl" style={{ animation: "nx-sheet 240ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="mb-8 flex items-center justify-between">
              <span className="nx-kicker">Menu</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="nx-icon-btn" aria-label="Close menu" autoFocus>
                <Close className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col">
              {site.navigation.map((item) => (
                <a key={item.label} href={item.href} onClick={(e) => goTo(e, item.href)} className="nx-display flex items-center justify-between border-b border-[var(--nx-line)] py-4 text-2xl">
                  {item.label}
                  <ArrowUpRight className="size-5 text-[var(--nx-muted)]" />
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <a href="#contact" onClick={(e) => goTo(e, "#contact")} className="nx-btn nx-btn-ink">
                Start a project <ArrowRight className="size-4" />
              </a>
              <button type="button" onClick={toggleTheme} className="nx-btn nx-btn-ghost">
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === "dark" ? "Light theme" : "Dark theme"}
              </button>
            </div>
          </div>
        </>
      )}

      <main className="relative flex flex-col pb-20 md:pb-0">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section id="home" style={orderStyle("hero")} className="nx-wash-top relative overflow-hidden pt-32 sm:pt-36">
          <div className="nx-container flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[12px] font-medium text-white backdrop-blur-md sm:text-[13px]">
              <span className="size-1.5 rounded-full bg-[var(--nx-mint-bright)] shadow-[0_0_10px_#7ef7df]" />
              {hero.eyebrow}
            </div>
            <h1 className="nx-display nx-hero-title mt-7 text-white">
              {hero.title}
              <br />
              <span className="nx-accent-on-wash">{hero.titleAccent}</span>
            </h1>
            <p className="nx-hero-lead mt-6 text-white/85">{hero.description}</p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <a href="#contact" onClick={(e) => goTo(e, "#contact")} className="nx-btn nx-btn-white min-w-[13rem]">
                {hero.primaryCta}
                <ArrowRight className="size-4" />
              </a>
              <a href="#work" onClick={(e) => goTo(e, "#work")} className="nx-btn nx-btn-glass min-w-[13rem]">
                {hero.secondaryCta}
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] text-white/85">
              {hero.highlights.map((label) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Check className="size-4 text-[var(--nx-mint-bright)]" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="nx-container relative mt-14 sm:mt-20">
            <div aria-hidden="true" className="nx-aurora" style={{ inset: "-12% -10% -4%" }} />
            <div className="relative mx-auto max-w-[70rem] pl-[7%]">
              <DevicePair
                mac={<DashboardScreen brand={brand} dashboard={hero.dashboard} />}
                phone={<PhoneAssistantScreen title={assistantSection.dockTitle} greeting={assistantSection.greeting} question={phoneQuestion} answer={phoneAnswer} />}
                macAlt={`${brand.name} project dashboard: ${hero.dashboard.panelTitle}, ${hero.dashboard.progressValue}% complete.`}
                phoneAlt={`${assistantSection.dockTitle} answering “${phoneQuestion}” on a phone.`}
              />
              <div className="nx-float absolute right-[-2%] top-[10%] hidden items-center gap-3 rounded-2xl border border-[var(--nx-line)] bg-[var(--nx-card)] px-4 py-3 shadow-[var(--nx-shadow-lift)] lg:flex">
                <span className="nx-pulse size-2.5 rounded-full bg-emerald-500" />
                <span className="text-left">
                  <span className="nx-display block text-lg">{hero.dashboard.uptimeValue}</span>
                  <span className="block text-xs text-[var(--nx-muted)]">{hero.dashboard.uptimeLabel}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="nx-container relative pb-14 pt-16 text-center">
            <div className="text-[13px] font-medium text-[var(--nx-muted)]">{hero.trustLabel}</div>
            <div className="nx-marquee mt-5">
              <div className="nx-marquee-track">
                {[...site.clientNames, ...site.clientNames].map((name, i) => (
                  <span key={`${name}-${i}`} aria-hidden={i >= site.clientNames.length} className="nx-display whitespace-nowrap px-7 text-[20px] text-[var(--nx-subtle)] transition-colors hover:text-[var(--nx-ink)]">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <section style={orderStyle("stats")} aria-label="In numbers" className="nx-container py-10">
          <div ref={statsRef} className="grid grid-cols-2 border-y border-[var(--nx-line)] lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className={cx("px-4 py-8 text-center sm:py-10", i % 2 === 1 && "border-l border-[var(--nx-line)]", i >= 2 && "border-t border-[var(--nx-line)] lg:border-t-0", i === 2 && "lg:border-l")}>
                <div className="nx-display text-[clamp(2.6rem,5.5vw,4.25rem)] leading-none">
                  <CountUp target={stat.target} suffix={stat.suffix} active={statsVisible} />
                </div>
                <div className="mt-3 text-[14px] text-[var(--nx-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Services ───────────────────────────────────────────────────── */}
        <section id="services" style={orderStyle("services")} className="nx-section">
          <div className="nx-container">
            <SectionHeader kicker={site.servicesSection.kicker} title={site.servicesSection.title} lead={site.servicesSection.lead} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Reveal key={service.title} delay={(index % 3) * 70}>
                  <button
                    type="button"
                    onClick={() => setActiveServiceIndex(index)}
                    onPointerMove={trackSpotlight}
                    className="nx-card nx-spot group flex h-full w-full cursor-pointer flex-col p-6 text-left transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--nx-violet)_35%,var(--nx-line))] hover:shadow-[var(--nx-shadow-lift)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-[14px] bg-[var(--nx-violet-soft)] text-[var(--nx-violet)]">
                        <ServiceIcon index={index} className="size-[22px]" />
                      </span>
                      <span className="text-[13px] font-medium tabular-nums text-[var(--nx-subtle)]">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="nx-display mt-6 text-[22px]">{service.title}</h3>
                    <p className="nx-lead mt-2 text-[15px]">{service.description}</p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {service.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="nx-chip">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-[var(--nx-violet)]">
                      What’s included
                      <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Work ───────────────────────────────────────────────────────── */}
        <section id="work" style={orderStyle("showcase")} className="nx-section nx-band">
          <div className="nx-container">
            <SectionHeader kicker={site.showcaseSection.kicker} title={site.showcaseSection.title} lead={site.showcaseSection.lead} />
            <ol className="grid border-t border-[var(--nx-line)] lg:grid-cols-2 lg:gap-x-12">
              {projects.map((project, i) => (
                <Reveal as="li" key={`${project.name}-${i}`} delay={(i % 2) * 60}>
                  <div className="group relative flex items-center gap-5 border-b border-[var(--nx-line)] py-5">
                    <span className="w-8 shrink-0 text-[13px] tabular-nums text-[var(--nx-subtle)]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="nx-display block text-[21px] leading-snug transition-colors duration-150 group-hover:text-[var(--nx-violet)]">{project.name}</span>
                      {project.client && <span className="mt-0.5 block text-[14px] text-[var(--nx-muted)]">{project.client}</span>}
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 text-[var(--nx-subtle)] transition-[transform,color] duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--nx-violet)]" />
                  </div>
                </Reveal>
              ))}
            </ol>
            <p className="mt-8 text-[14px] text-[var(--nx-muted)]">{site.showcaseSection.note}</p>
          </div>
        </section>

        {/* ── Process: a timeline that follows the scroll ────────────────── */}
        <section id="process" style={orderStyle("process")} className="nx-section">
          <div className="nx-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <div className="nx-kicker">{site.processSection.kicker}</div>
                <h2 className="nx-display nx-h2 mt-4">{site.processSection.title}</h2>
                <p className="nx-lead mt-5 text-lg">{site.processSection.lead}</p>
              </Reveal>
              <div className="mt-10 hidden lg:block" aria-hidden="true">
                <div className="flex items-baseline gap-3">
                  <span className="nx-display text-[64px] leading-none text-[var(--nx-violet)] tabular-nums">{processSteps[activeStep]?.step ?? "01"}</span>
                  <span className="text-[var(--nx-muted)]">/ {String(processSteps.length).padStart(2, "0")}</span>
                </div>
                <div className="mt-4 h-1 w-full max-w-xs overflow-hidden rounded-full bg-[var(--nx-line)]">
                  <div className="h-full rounded-full bg-[var(--nx-violet)] transition-[width] duration-500 ease-out" style={{ width: `${Math.max(stepProgress, 0.04) * 100}%` }} />
                </div>
              </div>
            </div>
            <ol className="relative flex flex-col gap-4">
              <span aria-hidden="true" className="absolute bottom-8 left-[27px] top-8 w-px bg-[var(--nx-line)]" />
              <span aria-hidden="true" className="absolute left-[27px] top-8 w-px bg-[var(--nx-violet)] transition-[height] duration-500 ease-out" style={{ height: `calc((100% - 4rem) * ${stepProgress})` }} />
              {processSteps.map((item, i) => (
                <li
                  key={item.step}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  data-index={i}
                  data-active={i === activeStep}
                  className="nx-step nx-card relative flex gap-5 p-6"
                >
                  <span className={cx("relative z-10 grid size-14 shrink-0 place-items-center rounded-full border text-[15px] font-semibold tabular-nums transition-colors duration-300", i <= activeStep ? "border-[var(--nx-violet)] bg-[var(--nx-violet)] text-[var(--nx-on-violet)]" : "border-[var(--nx-line)] bg-[var(--nx-bg)] text-[var(--nx-muted)]")}>
                    {item.step}
                  </span>
                  <div className="pt-1">
                    <h3 className="nx-display text-[22px]">{item.title}</h3>
                    <p className="nx-lead mt-2 text-[15px]">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Team ───────────────────────────────────────────────────────── */}
        <section id="team" style={orderStyle("team")} className="nx-section nx-band">
          <div className="nx-container">
            <SectionHeader kicker={site.teamSection.kicker} title={site.teamSection.title} lead={site.teamSection.lead} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {team.map((member, i) => (
                <Reveal key={member.name} delay={i * 80}>
                  <article className="nx-card flex h-full flex-col p-6">
                    <div className="flex items-center gap-4">
                      <span className="nx-display grid size-16 shrink-0 place-items-center rounded-[18px] text-[22px] text-white" style={{ background: ["linear-gradient(135deg,#5b3df5,#8b6cff)", "linear-gradient(135deg,#0d9488,#2dd4bf)", "linear-gradient(135deg,#7c3aed,#ec4899)"][i % 3] }}>
                        {member.initials}
                      </span>
                      <div className="min-w-0">
                        <h3 className="nx-display text-[22px]">{member.name}</h3>
                        <div className="mt-0.5 text-[14px] font-medium text-[var(--nx-violet)]">{member.role}</div>
                      </div>
                    </div>
                    <p className="nx-lead mt-5 text-[15px]">{member.bio}</p>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {member.skills.map((skill) => (
                        <span key={skill} className="nx-chip">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex gap-2 pt-6">
                      {hasLink(member.linkedinUrl) && (
                        <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="nx-btn nx-btn-ghost min-h-10 px-4 text-[14px]" aria-label={`${member.name} on LinkedIn`}>
                          <LinkedinIcon className="size-4" /> LinkedIn
                        </a>
                      )}
                      {hasLink(member.portfolioUrl) && (
                        <a href={member.portfolioUrl} target="_blank" rel="noreferrer" className="nx-btn nx-btn-ghost min-h-10 px-4 text-[14px]" aria-label={`${member.name}’s portfolio`}>
                          Portfolio <ArrowUpRight className="size-4" />
                        </a>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews ────────────────────────────────────────────────────── */}
        <section id="reviews" style={orderStyle("reviews")} className="nx-section">
          <div className="nx-container">
            <SectionHeader
              kicker={site.reviewsSection.kicker}
              title={site.reviewsSection.title}
              action={
                <button type="button" onClick={() => setReviewModalOpen(true)} className="nx-btn nx-btn-ink">
                  {site.reviewsSection.ctaButton}
                </button>
              }
            />
            {reviewNotice && (
              <p role="status" className="mb-6 rounded-2xl border border-[var(--nx-line)] bg-[var(--nx-card)] px-4 py-3 text-[15px]">
                {reviewNotice}
              </p>
            )}
            <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
              {visibleReviews.map((review) => (
                <figure key={review.id} className="nx-card mb-4 break-inside-avoid p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5 text-[var(--nx-violet)]" aria-label={`${review.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} filled={i < review.rating} className="size-4" />
                      ))}
                    </div>
                    <span className="text-[13px] text-[var(--nx-subtle)]">{review.date}</span>
                  </div>
                  <blockquote className="mt-4 text-[16px] leading-relaxed">“{review.text}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-[var(--nx-violet-soft)] text-[14px] font-semibold text-[var(--nx-violet)]">{review.initials}</span>
                    <span>
                      <span className="block font-semibold">{review.name}</span>
                      <span className="block text-[14px] text-[var(--nx-muted)]">{review.company}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
            {reviews.length > 6 && (
              <div className="mt-6 flex justify-center">
                <button type="button" onClick={() => setShowAllReviews((v) => !v)} className="nx-btn nx-btn-ghost">
                  {showAllReviews ? "Show fewer" : `Show all ${reviews.length} reviews`}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Contact ────────────────────────────────────────────────────── */}
        <section id="contact" style={orderStyle("contact")} className="nx-section nx-band">
          <div className="nx-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <Reveal>
                <div className="nx-kicker">{contactSection.kicker}</div>
                <h2 className="nx-display nx-h2 mt-4">{contactSection.title}</h2>
                <p className="nx-lead mt-5 text-lg">{contactSection.lead}</p>
              </Reveal>
              <div className="mt-10 grid gap-3">
                <a href={`mailto:${contactSection.email}`} className="nx-card flex items-center gap-4 p-4 transition-colors hover:border-[color-mix(in_srgb,var(--nx-violet)_35%,var(--nx-line))]">
                  <span className="grid size-11 place-items-center rounded-full bg-[var(--nx-violet-soft)] text-[var(--nx-violet)]">
                    <Mail className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] text-[var(--nx-muted)]">Email</span>
                    <span className="block truncate font-semibold">{contactSection.email}</span>
                  </span>
                </a>
                <a href={`https://wa.me/${contactSection.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="nx-card flex items-center gap-4 p-4 transition-colors hover:border-[color-mix(in_srgb,var(--nx-violet)_35%,var(--nx-line))]">
                  <span className="grid size-11 place-items-center rounded-full bg-[var(--nx-violet-soft)] text-[var(--nx-violet)]">
                    <Chat className="size-5" />
                  </span>
                  <span>
                    <span className="block text-[13px] text-[var(--nx-muted)]">WhatsApp</span>
                    <span className="block font-semibold">{contactSection.whatsapp}</span>
                  </span>
                </a>
                <div className="nx-card flex items-center gap-4 p-4">
                  <span className="grid size-11 place-items-center rounded-full bg-[var(--nx-violet-soft)] text-[var(--nx-violet)]">
                    <Pin className="size-5" />
                  </span>
                  <span>
                    <span className="block text-[13px] text-[var(--nx-muted)]">Based in</span>
                    <span className="block font-semibold">{contactSection.city}</span>
                  </span>
                </div>
              </div>
              <div className="mt-6 rounded-[20px] bg-[var(--nx-ink)] p-6 text-[var(--nx-bg)]">
                <h3 className="nx-display text-[22px]">{contactSection.bookingTitle}</h3>
                <p className="mt-2 text-[15px] leading-relaxed opacity-75">{contactSection.bookingDescription}</p>
                <button
                  type="button"
                  onClick={() => {
                    const field = document.getElementById("contact-full-name");
                    field?.scrollIntoView({ behavior: "smooth", block: "center" });
                    (field as HTMLInputElement | null)?.focus({ preventScroll: true });
                  }}
                  className="nx-btn mt-5 bg-[var(--nx-bg)] text-[var(--nx-ink)] hover:-translate-y-px"
                >
                  {contactSection.bookingButton}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            <Reveal delay={80}>
              <form onSubmit={handleContactSubmit} className="nx-card p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-full-name" className="nx-label">
                      Full name <span className="text-[var(--nx-violet)]">*</span>
                    </label>
                    <input id="contact-full-name" name="fullName" required autoComplete="name" className="nx-field" placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="nx-label">
                      Work email <span className="text-[var(--nx-violet)]">*</span>
                    </label>
                    <input id="contact-email" name="email" type="email" required autoComplete="email" className="nx-field" placeholder="you@company.com" />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="nx-label">
                      Phone
                    </label>
                    <input id="contact-phone" name="phone" type="tel" autoComplete="tel" className="nx-field" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label htmlFor="contact-type" className="nx-label">
                      What’s this about?
                    </label>
                    <select id="contact-type" name="inquiryType" className="nx-field">
                      <option>Requirement Discussion</option>
                      <option>Project Consultation</option>
                      <option>General Contact</option>
                      <option>Tips & Feedback</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-subject" className="nx-label">
                      Subject <span className="text-[var(--nx-violet)]">*</span>
                    </label>
                    <input id="contact-subject" name="subject" required className="nx-field" placeholder="What do you want to build?" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-message" className="nx-label">
                      Message <span className="text-[var(--nx-violet)]">*</span>
                    </label>
                    <textarea id="contact-message" name="message" required rows={5} className="nx-field resize-none" placeholder="Goals, timeline, budget range and any reference links." />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-file" className="nx-label">
                      Attach a brief <span className="font-normal text-[var(--nx-muted)]">(optional)</span>
                    </label>
                    <input id="contact-file" name="attachment" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="nx-field" />
                  </div>
                </div>
                <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[14px] text-[var(--nx-muted)]">We reply within one business day.</p>
                  <button type="submit" disabled={contactBusy} className="nx-btn nx-btn-violet">
                    {contactBusy ? "Sending…" : "Send request"}
                    {!contactBusy && <Send className="size-4 rotate-90" />}
                  </button>
                </div>
                {contactNotice && (
                  <p role="status" className={cx("mt-5 rounded-xl px-4 py-3 text-[15px]", contactSuccess ? "nx-success" : "nx-error")}>
                    {contactNotice}
                  </p>
                )}
              </form>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <section id="faq" style={orderStyle("faqs")} className="nx-section">
          <div className="nx-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <div className="nx-kicker">{site.faqSection.kicker}</div>
              <h2 className="nx-display nx-h2 mt-4">{site.faqSection.title}</h2>
              <button type="button" onClick={() => setAssistantOpen(true)} className="nx-btn nx-btn-ghost mt-8">
                <Sparkle className="size-4" />
                Ask us in {assistantSection.dockTitle.toLowerCase()}
              </button>
            </Reveal>
            <FaqList items={faqs} />
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer style={orderStyle("footer")}>
          <div className="nx-wash-bottom">
            <div className="nx-container pb-20 pt-32 text-center">
              <h2 className="nx-display mx-auto max-w-[16ch] text-[clamp(2.4rem,6vw,5rem)] text-white">
                Have something in mind? <span className="nx-accent-on-wash">Let’s build it.</span>
              </h2>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#contact" onClick={(e) => goTo(e, "#contact")} className="nx-btn nx-btn-white min-w-[13rem]">
                  {hero.primaryCta} <ArrowRight className="size-4" />
                </a>
                <a href={`mailto:${contactSection.email}`} className="nx-btn nx-btn-glass min-w-[13rem]">
                  {contactSection.email}
                </a>
              </div>
            </div>
          </div>
          <div className="nx-footer">
            <div className="nx-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
              <div>
                <div className="flex items-center gap-2.5">
                  <BrandMark mark={brand.mark} className="size-9 text-[15px]" />
                  <span className="text-[17px] font-semibold">{brand.name}</span>
                </div>
                <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/75">{footer.description}</p>
              </div>
              <nav aria-label="Services">
                <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">Services</div>
                <ul className="mt-4 grid gap-2.5 text-[15px] text-white/85">
                  {footer.serviceLinks.map((item) => (
                    <li key={item}>
                      <a href="#services" onClick={(e) => goTo(e, "#services")} className="hover:text-white">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="Company">
                <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">Company</div>
                <ul className="mt-4 grid gap-2.5 text-[15px] text-white/85">
                  {footer.companyLinks.map((item) => (
                    <li key={item}>
                      <a href="#team" onClick={(e) => goTo(e, "#team")} className="hover:text-white">
                        {item}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href="#reviews" onClick={(e) => goTo(e, "#reviews")} className="hover:text-white">
                      Reviews
                    </a>
                  </li>
                </ul>
              </nav>
              <div>
                <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">Newsletter</div>
                <p className="mt-4 text-[15px] text-white/75">One short note when we ship something worth reading.</p>
                <form onSubmit={handleNewsletter} className="mt-4 flex gap-2">
                  <label htmlFor="nx-newsletter" className="sr-only">
                    Email address
                  </label>
                  <input id="nx-newsletter" name="email" type="email" required placeholder="you@company.com" className="min-h-11 min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-4 text-[15px] text-white placeholder:text-white/55 focus-visible:border-white focus-visible:outline-none" />
                  <button type="submit" className="nx-btn nx-btn-white min-h-11 px-5 text-[14px]">
                    Join
                  </button>
                </form>
                {newsletterNotice && (
                  <p role="status" className="mt-2 text-[14px] text-white/80">
                    {newsletterNotice}
                  </p>
                )}
              </div>
            </div>
            <div className="nx-container flex flex-col gap-3 border-t border-white/15 py-6 text-[14px] text-white/65 sm:flex-row sm:items-center sm:justify-between">
              <span>{footer.copyright}</span>
              <span>
                {contactSection.city} · <a href={`mailto:${contactSection.email}`} className="hover:text-white">{contactSection.email}</a>
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Mobile tab bar ─────────────────────────────────────────────── */}
      <nav aria-label="Sections" className="nx-tabbar fixed inset-x-0 bottom-0 z-40 md:hidden">
        <ul className="grid grid-cols-4 px-2 py-1.5">
          {mobileTabs.map((tab) => {
            const active = activeTab === tab.href.slice(1);
            return (
              <li key={tab.label}>
                <a href={tab.href} onClick={(e) => goTo(e, tab.href)} aria-current={active ? "page" : undefined} className={cx("flex min-h-11 flex-col items-center justify-center rounded-xl text-[12px] font-medium transition-colors", active ? "text-[var(--nx-violet)]" : "text-[var(--nx-muted)]")}>
                  <span className={cx("mb-1 h-1 w-5 rounded-full transition-colors", active ? "bg-[var(--nx-violet)]" : "bg-transparent")} />
                  {tab.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Assistant ──────────────────────────────────────────────────── */}
      {!assistantOpen && !mobileOpen && activeServiceIndex === null && !reviewModalOpen && (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[var(--nx-ink)] p-2 text-[14px] md:pr-4 font-semibold text-[var(--nx-bg)] shadow-[0_16px_36px_-12px_rgba(22,21,28,0.55)] transition-transform hover:-translate-y-0.5 md:bottom-6 md:right-6"
          aria-label={`Open ${assistantSection.dockTitle}`}
          aria-expanded={assistantOpen}
          aria-controls="nx-assistant"
        >
          <span className="grid size-8 place-items-center rounded-full" style={{ background: "linear-gradient(135deg,#5b3df5,#2dd4bf)" }}>
            <Sparkle className="size-4 text-white" />
          </span>
          <span className="hidden md:inline">{assistantSection.dockTitle}</span>
        </button>
      )}
      {assistantOpen && (
        <section id="nx-assistant" role="dialog" aria-modal="true" aria-label={assistantSection.dockTitle} className="nx-dock">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--nx-line)] px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full" style={{ background: "linear-gradient(135deg,#5b3df5,#2dd4bf)" }}>
                <Sparkle className="size-5 text-white" />
              </span>
              <div>
                <div className="font-semibold">{assistantSection.dockTitle}</div>
                <p className="text-[13px] text-[var(--nx-muted)]">{assistantSection.dockDescription}</p>
              </div>
            </div>
            <button type="button" onClick={() => setAssistantOpen(false)} className="nx-icon-btn size-9 shrink-0" aria-label={`Close ${assistantSection.dockTitle}`} autoFocus>
              <Close className="size-4" />
            </button>
          </div>
          <div ref={assistantScrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5" aria-live="polite">
            {assistantMessages.map((message) => (
              <div key={message.id} className={cx("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cx("max-w-[85%] whitespace-pre-wrap px-4 py-2.5 text-[15px] leading-relaxed", message.role === "user" ? "nx-bubble-user" : "nx-bubble-bot")}>
                  {message.content === "…" ? (
                    <span className="flex gap-1 py-1.5" aria-label="Thinking">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="nx-typing-dot size-1.5 rounded-full bg-[var(--nx-muted)]" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--nx-line)] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4">
            {!assistantMessages.some((m) => m.role === "user") && (
              <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
                {assistantSection.suggestions.map((item) => (
                  <button key={item} type="button" onClick={() => setAssistantInput(item)} className="nx-chip shrink-0 cursor-pointer whitespace-nowrap py-1.5 hover:border-[var(--nx-violet)] hover:text-[var(--nx-violet)]">
                    {item}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleAssistantSubmit();
              }}
              className="flex items-center gap-2 rounded-full border border-[var(--nx-line-strong)] bg-[var(--nx-bg)] p-1.5 pl-4 focus-within:border-[var(--nx-violet)]"
            >
              <input
                value={assistantInput}
                onChange={(event) => setAssistantInput(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--nx-muted)]"
                placeholder="Ask about timelines, pricing, stack…"
                aria-label={`Message ${assistantSection.dockTitle}`}
              />
              <button type="submit" disabled={assistantLoading || !assistantInput.trim()} className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--nx-violet)] text-[var(--nx-on-violet)] transition-opacity disabled:opacity-40" aria-label="Send message">
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ── Service details ────────────────────────────────────────────── */}
      {activeService && (
        <>
          <div className="nx-overlay" onClick={() => setActiveServiceIndex(null)} />
          <div role="dialog" aria-modal="true" aria-labelledby="nx-service-title" className="nx-dialog sm:max-w-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--nx-line)] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-[var(--nx-violet-soft)] text-[var(--nx-violet)]">
                  <ServiceIcon index={activeServiceIndex ?? 0} className="size-6" />
                </span>
                <div>
                  <h3 id="nx-service-title" className="nx-display text-[28px]">
                    {activeService.title}
                  </h3>
                  <p className="nx-lead mt-1.5 max-w-xl">{activeService.description}</p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveServiceIndex(null)} className="nx-icon-btn shrink-0" aria-label="Close service details" autoFocus>
                <Close className="size-5" />
              </button>
            </div>
            <div className="grid gap-8 p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8">
              <div>
                <div className="nx-kicker">What’s included</div>
                <ul className="mt-4 space-y-3">
                  {activeService.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[15px] leading-relaxed">
                      <Check className="mt-0.5 size-5 shrink-0 text-[var(--nx-violet)]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="nx-kicker">Tools we reach for</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeService.technologies.map((tech) => (
                    <span key={tech} className="nx-chip px-3 py-1.5 text-[13px]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-[var(--nx-line)] bg-[var(--nx-bg)] p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-[14px] text-[var(--nx-muted)]">Discover → build → launch, with a weekly demo along the way.</p>
              <a
                href="#contact"
                onClick={(e) => {
                  setActiveServiceIndex(null);
                  goTo(e, "#contact");
                }}
                className="nx-btn nx-btn-ink"
              >
                Talk about {activeService.title.toLowerCase()} <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </>
      )}

      {/* ── Add a review ───────────────────────────────────────────────── */}
      {reviewModalOpen && (
        <>
          <div className="nx-overlay" onClick={() => setReviewModalOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="nx-review-title" className="nx-dialog sm:max-w-xl">
            <form onSubmit={handleReviewSubmit}>
              <div className="flex items-start justify-between gap-4 p-6 sm:p-8">
                <div>
                  <h3 id="nx-review-title" className="nx-display text-[26px]">
                    {site.reviewsSection.modalTitle}
                  </h3>
                  <p className="nx-lead mt-1.5">{site.reviewsSection.modalDescription}</p>
                </div>
                <button type="button" onClick={() => setReviewModalOpen(false)} className="nx-icon-btn shrink-0" aria-label="Close review form" autoFocus>
                  <Close className="size-5" />
                </button>
              </div>
              <div className="grid gap-5 px-6 sm:px-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="review-name" className="nx-label">
                      Name
                    </label>
                    <input id="review-name" className="nx-field" value={reviewForm.name} onChange={(e) => setReviewForm((c) => ({ ...c, name: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="review-company" className="nx-label">
                      Company
                    </label>
                    <input id="review-company" className="nx-field" value={reviewForm.company} onChange={(e) => setReviewForm((c) => ({ ...c, company: e.target.value }))} />
                  </div>
                </div>
                <fieldset>
                  <legend className="nx-label">Rating</legend>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedRating(i + 1)}
                        aria-label={`${i + 1} star${i ? "s" : ""}`}
                        aria-pressed={selectedRating === i + 1}
                        className={cx("grid size-10 place-items-center rounded-full transition-transform hover:scale-110", i < selectedRating ? "text-[var(--nx-violet)]" : "text-[var(--nx-line-strong)]")}
                      >
                        <Star filled={i < selectedRating} className="size-7" />
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="review-text" className="nx-label">
                    Your review
                  </label>
                  <textarea id="review-text" rows={4} className="nx-field resize-none" value={reviewForm.text} onChange={(e) => setReviewForm((c) => ({ ...c, text: e.target.value }))} />
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--nx-line)] p-6 sm:flex-row sm:justify-end sm:px-8">
                <button type="button" onClick={() => setReviewModalOpen(false)} className="nx-btn nx-btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={reviewBusy} className="nx-btn nx-btn-violet">
                  {reviewBusy ? "Publishing…" : "Publish review"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
