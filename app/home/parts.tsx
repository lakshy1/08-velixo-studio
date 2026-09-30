"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/site-content";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** The page scrolls inside ScrollShell's viewport, not the window. */
export function getScroller(): HTMLElement | null {
  const el = typeof document === "undefined" ? null : document.querySelector(".scroll-shell__viewport");
  return el instanceof HTMLElement ? el : null;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** True once the element has scrolled into view (never flips back). */
export function useInView<T extends HTMLElement>(margin = "0px 0px -12% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, margin]);
  return [ref, inView] as const;
}

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "article" }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <Tag ref={ref as never} className={cx("nx-reveal", inView && "is-in", className)} style={{ "--d": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}

/** Counts up to `target` once visible; shows the final value straight away under reduced motion. */
export function CountUp({ target, suffix = "", active }: { target: number; suffix?: string; active: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || reduced) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, target]);
  return (
    <span className="tabular-nums">
      {reduced && active ? target : value}
      {suffix}
    </span>
  );
}

// ── Icons (24px, 1.75 stroke) ────────────────────────────────────────────
type IconProps = { className?: string };
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function ArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" {...stroke} />
    </svg>
  );
}
export function ArrowUpRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" {...stroke} />
    </svg>
  );
}
export function Check({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} />
    </svg>
  );
}
export function Plus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" {...stroke} />
    </svg>
  );
}
export function Close({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" {...stroke} />
    </svg>
  );
}
export function Sun({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" {...stroke} />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" {...stroke} />
    </svg>
  );
}
export function Moon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" {...stroke} />
    </svg>
  );
}
export function Sparkle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" {...stroke} />
      <path d="M19 15.5c.25 1.6 1 2.35 2.5 2.5-1.5.25-2.25 1-2.5 2.5-.25-1.5-1-2.25-2.5-2.5 1.5-.15 2.25-.9 2.5-2.5Z" {...stroke} />
    </svg>
  );
}
export function Send({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 19V5M6 11l6-6 6 6" {...stroke} />
    </svg>
  );
}
export function Menu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 8h16M4 16h10" {...stroke} />
    </svg>
  );
}
export function Star({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" {...stroke} />
      <path d="M8 10.5V16M8 7.8v.05M11.5 16v-5.5M11.5 13.2c0-1.6 1-2.7 2.4-2.7s2.1.9 2.1 2.5V16" {...stroke} />
    </svg>
  );
}
export function Mail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" {...stroke} />
      <path d="m4 7 8 6 8-6" {...stroke} />
    </svg>
  );
}
export function Chat({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 12a8 8 0 1 1 3.3 6.5L4 19.5l1-3.2A7.9 7.9 0 0 1 4 12Z" {...stroke} />
    </svg>
  );
}
export function Pin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" {...stroke} />
      <circle cx="12" cy="10" r="2.3" {...stroke} />
    </svg>
  );
}

const SERVICE_PATHS = [
  "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 14.5v-8ZM9 20h6M12 17v3", // web
  "M8 3.5h8A1.5 1.5 0 0 1 17.5 5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5ZM11 17.5h2", // app
  "M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.5-1.9-.3-1.2.4-2.1 1.6-2.1h1.4a3.5 3.5 0 0 0 3.5-3.5A8.5 8.5 0 0 0 12 3.5ZM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01", // graphic
  "M4 7l8-3.5L20 7l-8 3.5L4 7ZM4 12l8 3.5 8-3.5M4 17l8 3.5 8-3.5", // saas
  "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11ZM10 9l5 3-5 3V9Z", // content
  "M9.5 3.5h5M10.5 3.5v6L5 18.5A1.3 1.3 0 0 0 6.2 20.5h11.6a1.3 1.3 0 0 0 1.2-2L13.5 9.5v-6M7.5 15h9", // testing
  "M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z", // ai
  "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 20.5 20.5", // seo
  "M7 18.5h10a4 4 0 0 0 .7-7.9A5.5 5.5 0 0 0 7.2 9.1 4.7 4.7 0 0 0 7 18.5Z", // cloud
];
export function ServiceIcon({ index, className }: { index: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={SERVICE_PATHS[index % SERVICE_PATHS.length]} {...stroke} />
    </svg>
  );
}

/** The brand mark: the configured letter on a violet-to-mint tile. */
export function BrandMark({ mark, className }: { mark: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("grid shrink-0 place-items-center rounded-[10px] font-bold text-white", className)}
      style={{ background: "linear-gradient(135deg, #5b3df5 0%, #7c5cff 45%, #2dd4bf 100%)" }}
    >
      {mark}
    </span>
  );
}

// ── Device frames ────────────────────────────────────────────────────────
// Screens are laid out at the glass's exact aspect ratio at a fixed design size,
// then scaled to whatever width the glass renders at.
const MAC_SCREEN = { w: 1160, h: 735 };
const PHONE_SCREEN = { w: 364, h: 838 };

function Fit({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / w);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [w]);
  return (
    <div ref={ref} className="absolute inset-0">
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: "0 0", visibility: scale ? "visible" : "hidden" }}>{children}</div>
    </div>
  );
}

export function DevicePair({ mac, phone, macAlt, phoneAlt }: { mac: ReactNode; phone: ReactNode; macAlt: string; phoneAlt: string }) {
  return (
    <div className="relative isolate w-full">
      <div aria-hidden="true" className="nx-device-shadow" />
      <div className="nx-device">
        <div className="nx-glass nx-glass-mac">
          <Fit {...MAC_SCREEN}>{mac}</Fit>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- static device art, sized by CSS */}
        <img src="/device-macbook.png" alt={macAlt} width={1536} height={1024} draggable={false} />
      </div>
      <div className="absolute" style={{ left: "-4%", top: "30%", width: "25%" }}>
        <div className="nx-device">
          <div className="nx-glass nx-glass-phone">
            <Fit {...PHONE_SCREEN}>{phone}</Fit>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- static device art, sized by CSS */}
          <img src="/device-iphone.png" alt={phoneAlt} width={876} height={1796} draggable={false} />
        </div>
      </div>
    </div>
  );
}

// ── Screen: the studio dashboard inside the MacBook ──────────────────────
const DASH_NAV = ["Overview", "Design", "Development", "AI & Automation", "Analytics", "Settings"];

export function DashboardScreen({ brand, dashboard }: { brand: SiteContent["brand"]; dashboard: SiteContent["hero"]["dashboard"] }) {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min((now - start) / 1800, 1);
      setProgress(Math.round(dashboard.progressValue * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [dashboard.progressValue, reduced]);

  // Activity feed: every few seconds the next item slides in at the top.
  useEffect(() => {
    if (reduced || dashboard.activity.length < 2) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 3200);
    return () => window.clearInterval(id);
  }, [dashboard.activity.length, reduced]);

  const activity = dashboard.activity.length
    ? Array.from({ length: Math.min(4, dashboard.activity.length) }, (_, i) => dashboard.activity[(tick + i) % dashboard.activity.length])
    : [];

  const values = dashboard.chartValues.length > 1 ? dashboard.chartValues : [30, 60];
  const max = Math.max(100, ...values);
  const points = values.map((v, i) => ({ x: (i / (values.length - 1)) * 640, y: 196 - (v / max) * 170 }));
  const line = points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const area = `${line} L640,210 L0,210 Z`;
  const circumference = 2 * Math.PI * 30;
  const shownProgress = reduced ? dashboard.progressValue : progress;

  return (
    <div className="flex h-full w-full bg-[var(--nx-bg)] text-[var(--nx-ink)]" style={{ fontSize: 15 }}>
      <aside className="flex w-[228px] shrink-0 flex-col gap-1 border-r border-[var(--nx-line)] bg-[var(--nx-bg-deep)] p-4">
        <div className="mb-5 flex items-center gap-2.5 px-2 pt-1">
          <BrandMark mark={brand.mark} className="size-8 text-sm" />
          <span className="text-[17px] font-semibold tracking-tight">{brand.name}</span>
        </div>
        {DASH_NAV.map((label, i) => (
          <div
            key={label}
            className={cx(
              "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 font-medium",
              i === 0 ? "bg-[var(--nx-card)] text-[var(--nx-violet)] shadow-[var(--nx-shadow)]" : "text-[var(--nx-muted)]",
            )}
          >
            <span className={cx("size-2 rounded-full", i === 0 ? "bg-[var(--nx-violet)]" : "bg-[var(--nx-line-strong)]")} />
            {label}
          </div>
        ))}
        <div className="mt-auto rounded-[14px] border border-[var(--nx-line)] bg-[var(--nx-card)] p-3.5">
          <div className="text-[13px] font-semibold">{dashboard.badgeTitle}</div>
          <div className="mt-0.5 text-[12px] text-[var(--nx-muted)]">{dashboard.badgeSubtitle}</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[var(--nx-line)] px-7">
          <div className="text-[14px] text-[var(--nx-muted)]">
            Projects <span className="mx-1.5 text-[var(--nx-line-strong)]">/</span>
            <span className="font-medium text-[var(--nx-ink)]">{dashboard.projectName}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--nx-line)] bg-[var(--nx-card)] px-3 py-1.5 text-[13px]">
            <span className="nx-pulse size-2 rounded-full bg-emerald-500" />
            {dashboard.uptimeValue} {dashboard.uptimeLabel.toLowerCase()}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-[1.45fr_1fr] gap-5 p-7">
          <div className="flex min-w-0 flex-col gap-5">
            <div>
              <div className="nx-display text-[30px]">{dashboard.panelTitle}</div>
              <div className="mt-1 text-[var(--nx-muted)]">{dashboard.panelSubtitle}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 rounded-[16px] border border-[var(--nx-line)] bg-[var(--nx-card)] p-4">
                <svg viewBox="0 0 72 72" className="size-[58px] -rotate-90">
                  <circle cx="36" cy="36" r="30" fill="none" strokeWidth="7" stroke="var(--nx-violet-soft)" />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    strokeWidth="7"
                    strokeLinecap="round"
                    stroke="var(--nx-violet)"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - shownProgress / 100)}
                  />
                </svg>
                <div>
                  <div className="nx-display text-[26px] tabular-nums">{shownProgress}%</div>
                  <div className="text-[13px] text-[var(--nx-muted)]">{dashboard.progressLabel}</div>
                </div>
              </div>
              <div className="rounded-[16px] border border-[var(--nx-line)] bg-[var(--nx-card)] p-4">
                <div className="nx-display text-[26px] tabular-nums">{dashboard.teamCount}</div>
                <div className="text-[13px] text-[var(--nx-muted)]">{dashboard.teamLabel}</div>
                <div className="mt-2 flex -space-x-2">
                  {["#5b3df5", "#2dd4bf", "#f59e0b", "#ec4899"].map((c) => (
                    <span key={c} className="size-6 rounded-full border-2 border-[var(--nx-card)]" style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="rounded-[16px] border border-[var(--nx-line)] bg-[var(--nx-card)] p-4">
                <span className="inline-flex rounded-full bg-emerald-500/12 px-2.5 py-1 text-[13px] font-semibold text-emerald-600">{dashboard.timelineStatus}</span>
                <div className="mt-2 text-[13px] text-[var(--nx-muted)]">{dashboard.timelineLabel}</div>
              </div>
            </div>
            <div className="flex-1 rounded-[16px] border border-[var(--nx-line)] bg-[var(--nx-card)] p-5">
              <svg viewBox="0 0 640 210" className="h-[200px] w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="nx-dash-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--nx-violet)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--nx-violet)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[50, 100, 150].map((y) => (
                  <line key={y} x1="0" x2="640" y1={y} y2={y} stroke="var(--nx-line)" strokeDasharray="4 6" />
                ))}
                <path d={area} fill="url(#nx-dash-fill)" className="nx-fade-in" />
                <path d={line} pathLength={1} fill="none" stroke="var(--nx-violet)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="nx-draw" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="5" fill="var(--nx-card)" stroke="var(--nx-violet)" strokeWidth="3" className="nx-fade-in" />
                ))}
              </svg>
              <div className="mt-2 flex justify-between text-[13px] text-[var(--nx-muted)]">
                {dashboard.chartMonths.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col rounded-[16px] border border-[var(--nx-line)] bg-[var(--nx-card)] p-5">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--nx-muted)]">{dashboard.activityLabel}</div>
            <div className="mt-4 space-y-3">
              {activity.map((item, i) => (
                <div key={`${item.label}-${tick + i}`} className={cx("flex items-center gap-3 rounded-[12px] border border-[var(--nx-line)] p-3", i === 0 && "nx-rise bg-[var(--nx-violet-soft)]")}>
                  <span className={cx("grid size-8 shrink-0 place-items-center rounded-full text-white", i === 0 ? "bg-[var(--nx-violet)]" : "bg-[var(--nx-line-strong)]")}>
                    <Check className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{item.label}</div>
                    <div className="text-[13px] text-[var(--nx-muted)]">{i === 0 ? "just now" : item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen: the studio assistant on the phone ────────────────────────────
export function PhoneAssistantScreen({ title, greeting, question, answer }: { title: string; greeting: string; question: string; answer: string }) {
  const reduced = usePrefersReducedMotion();
  // 0 greeting · 1 question · 2 typing · 3 answer; loops.
  const [loopStage, setStage] = useState(0);
  const stage = reduced ? 3 : loopStage;
  useEffect(() => {
    if (reduced) return;
    const durations = [1400, 1300, 1600, 5200];
    let current = 0;
    let timer = window.setTimeout(function next() {
      current = (current + 1) % durations.length;
      setStage(current);
      timer = window.setTimeout(next, durations[current]);
    }, durations[0]);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return (
    <div className="flex h-full w-full flex-col bg-[var(--nx-bg)] text-[var(--nx-ink)]" style={{ fontSize: 14 }}>
      <div className="flex h-[54px] shrink-0 items-end justify-between px-7 pb-1.5 text-[13px] font-semibold">
        <span>9:41</span>
        <span className="flex gap-1">
          <span className="h-2.5 w-4 rounded-sm bg-[var(--nx-ink)]" />
        </span>
      </div>
      <div className="flex items-center gap-2.5 border-b border-[var(--nx-line)] px-4 py-3">
        <span className="grid size-9 place-items-center rounded-full bg-[var(--nx-violet)] text-white">
          <Sparkle className="size-4.5" />
        </span>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--nx-muted)]">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Online
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden p-4">
        <div className="nx-bubble-bot nx-rise max-w-[88%] px-3.5 py-2.5 leading-snug">{greeting}</div>
        {stage >= 1 && <div className="nx-bubble-user nx-rise ml-auto max-w-[85%] px-3.5 py-2.5 leading-snug">{question}</div>}
        {stage === 2 && (
          <div className="nx-bubble-bot flex w-fit gap-1 px-4 py-3.5">
            {[0, 150, 300].map((d) => (
              <span key={d} className="nx-typing-dot size-1.5 rounded-full bg-[var(--nx-muted)]" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        )}
        {stage >= 3 && <div className="nx-bubble-bot nx-rise max-w-[88%] px-3.5 py-2.5 leading-snug">{answer}</div>}
      </div>
      <div className="px-3 pb-7">
        <div className="flex items-center gap-2 rounded-full border border-[var(--nx-line)] bg-[var(--nx-card)] py-1.5 pl-4 pr-1.5 text-[var(--nx-muted)]">
          <span className="flex-1 truncate text-[13px]">Ask about your project…</span>
          <span className="grid size-8 place-items-center rounded-full bg-[var(--nx-violet)] text-white">
            <Send className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

/** FAQ list: one answer open at a time; the list reserves room for its tallest answer,
 *  so opening a question moves only the rows below it, never the sections after it. */
export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<number[]>([]);
  const reserve = Math.max(0, ...heights);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => setHeights([...el.children].map((child) => (child as HTMLElement).offsetHeight));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="relative" style={{ paddingBottom: reserve - (open === null ? 0 : (heights[open] ?? 0)) }}>
      <div className="divide-y divide-[var(--nx-line)] border-y border-[var(--nx-line)]">
        {items.map((item, i) => {
          const isOpen = open === i;
          const panelId = `nx-faq-${i}`;
          return (
            <div key={item.question}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-lg font-semibold"
                >
                  {item.question}
                  <span
                    aria-hidden="true"
                    className={cx(
                      "grid size-8 shrink-0 place-items-center rounded-full border transition-transform duration-150 ease-out",
                      isOpen ? "rotate-45 border-[var(--nx-violet)] text-[var(--nx-violet)]" : "border-[var(--nx-line)] text-[var(--nx-muted)]",
                    )}
                  >
                    <Plus className="size-4" />
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-hidden={!isOpen} className="grid transition-[grid-template-rows] duration-150 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <p className="nx-lead pb-6 pr-12">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={measureRef} aria-hidden="true" className="pointer-events-none invisible absolute inset-x-0 top-0">
        {items.map((item) => (
          <p key={item.question} className="nx-lead pb-6 pr-12">
            {item.answer}
          </p>
        ))}
      </div>
    </div>
  );
}
