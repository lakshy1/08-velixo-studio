"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type {
  FaqItem,
  HomepageSectionId,
  NavigationItem,
  ProcessStep,
  ReviewItem,
  ServiceItem,
  SiteContent,
  StatItem,
  TeamMember,
} from "@/lib/site-content";
import { buildInitials } from "@/lib/site-content";

export type ContactSubmission = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  inquiry_type: string | null;
  subject: string;
  message: string;
  attachment_name: string | null;
  status: string;
  created_at: string;
};

type AdminStudioProps = {
  initialDraft: SiteContent;
  published: SiteContent;
  metrics: {
    reviews: number;
    contacts: number;
    lastUpdated: string;
  };
  submissions: ContactSubmission[];
  offlineMessage?: string;
};

type SectionId =
  | "overview"
  | "hero"
  | "services"
  | "showcase"
  | "process"
  | "team"
  | "reviews"
  | "faqs"
  | "contact"
  | "assistant"
  | "footer";

const sectionTabs: Array<{ id: SectionId; label: string; description: string }> = [
  { id: "overview", label: "Overview", description: "Brand, metadata, stats" },
  { id: "hero", label: "Hero", description: "Headline and call to action" },
  { id: "services", label: "Services", description: "Offer cards and details" },
  { id: "showcase", label: "Showcase", description: "Work loop and chip lists" },
  { id: "process", label: "Process", description: "Delivery roadmap" },
  { id: "team", label: "Team", description: "People cards" },
  { id: "reviews", label: "Reviews", description: "Testimonials" },
  { id: "faqs", label: "FAQs", description: "Questions and answers" },
  { id: "contact", label: "Contact", description: "Inquiry and booking details" },
  { id: "assistant", label: "Assistant", description: "AI dock copy" },
  { id: "footer", label: "Footer", description: "Closing copy and links" },
];

const homepageSectionIds: HomepageSectionId[] = [
  "hero",
  "stats",
  "services",
  "showcase",
  "process",
  "team",
  "reviews",
  "contact",
  "faqs",
  "footer",
];

function splitLines(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(input: string[]) {
  return input.join("\n");
}

function normalizeText(input: string) {
  return input.trim().toLowerCase();
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to) {
    return items;
  }

  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function shiftSelectedIndex(selectedIndex: number | null, from: number, to: number) {
  if (selectedIndex === null) {
    return null;
  }

  if (selectedIndex === from) {
    return to;
  }

  if (from < to && selectedIndex > from && selectedIndex <= to) {
    return selectedIndex - 1;
  }

  if (from > to && selectedIndex >= to && selectedIndex < from) {
    return selectedIndex + 1;
  }

  return selectedIndex;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">
        {label}
      </span>
      <input
        className="field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">
        {label}
      </span>
      <textarea
        className="field resize-none"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Panel({
  kicker,
  title,
  description,
  children,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="surface-panel-strong rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.32em] text-[var(--accent-2)]">{kicker}</div>
          <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">{title}</h3>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-soft)]">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SimpleListEditor({
  label,
  description,
  items,
  onChange,
  emptyLabel,
  addLabel,
  placeholder,
}: {
  label: string;
  description: string;
  items: string[];
  onChange: (items: string[]) => void;
  emptyLabel: string;
  addLabel: string;
  placeholder: string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold text-[var(--text)]">{label}</div>
        <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${label}-${index}`}
            className={`rounded-[1.35rem] surface-panel p-4 transition-colors ${
              dragIndex === index ? "ring-1 ring-[color-mix(in_srgb,var(--accent)_60%,transparent)]" : ""
            }`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) {
                setDragIndex(null);
                return;
              }

              onChange(moveItem(items, dragIndex, index));
              setDragIndex(null);
            }}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <button
                type="button"
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                aria-label={`Drag ${label} item`}
                className="cursor-grab rounded-full border border-white/10 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] active:cursor-grabbing lg:shrink-0"
              >
                Drag
              </button>
              <input
                className="field min-w-0 flex-1"
                value={item}
                placeholder={placeholder}
                onChange={(event) => {
                  const next = items.slice();
                  next[index] = event.target.value;
                  onChange(next);
                }}
              />
              <div className="flex flex-wrap gap-2 lg:shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onChange([...items.slice(0, index + 1), `${item} copy`, ...items.slice(index + 1)])
                  }
                  className="rounded-full border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] transition-colors hover:bg-white/5"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                  className="rounded-full border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] transition-colors hover:bg-white/5"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {!items.length ? (
          <div className="rounded-[1.35rem] surface-panel p-4 text-sm text-[var(--text-soft)]">{emptyLabel}</div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, "New item"])}
        className="rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-3 text-sm font-semibold text-white"
      >
        {addLabel}
      </button>
    </div>
  );
}

function ObjectList({
  items,
  selectedIndex,
  getTitle,
  getMeta,
  onSelect,
  onReorder,
  onDuplicate,
  onDelete,
  addLabel,
  onAdd,
  emptyLabel,
}: {
  items: Array<Record<string, unknown>>;
  selectedIndex: number | null;
  getTitle: (item: Record<string, unknown>, index: number) => string;
  getMeta?: (item: Record<string, unknown>, index: number) => string;
  onSelect: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
  onDuplicate?: (index: number) => void;
  onDelete: (index: number) => void;
  addLabel: string;
  onAdd: () => void;
  emptyLabel: string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const active = selectedIndex === index;

        return (
          <div
            key={`${getTitle(item, index)}-${index}`}
            className={`rounded-[1.45rem] border p-4 transition-colors ${
              active
                ? "border-[color-mix(in_srgb,var(--accent)_55%,transparent)] bg-white/5"
                : "border-white/10 surface-panel"
            }`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) {
                setDragIndex(null);
                return;
              }

              onReorder?.(dragIndex, index);
              setDragIndex(null);
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <button
                type="button"
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                aria-label={`Drag ${getTitle(item, index)}`}
                className="mt-1 cursor-grab rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] active:cursor-grabbing"
              >
                Drag
              </button>
              <button
                type="button"
                onClick={() => onSelect(index)}
                className="min-w-0 text-left"
              >
                <div className="text-sm font-semibold text-[var(--text)]">{getTitle(item, index)}</div>
                {getMeta ? (
                  <div className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--text-soft)]">
                    {getMeta(item, index)}
                  </div>
                ) : null}
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDuplicate?.(index)}
                  className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] transition-colors hover:bg-white/5"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(index)}
                  className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] transition-colors hover:bg-white/5"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {!items.length ? <div className="rounded-[1.35rem] surface-panel p-4 text-sm text-[var(--text-soft)]">{emptyLabel}</div> : null}

      <button
        type="button"
        onClick={onAdd}
        className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-white/5"
      >
        {addLabel}
      </button>
    </div>
  );
}

function createNavigationItem(): NavigationItem {
  return { label: "New link", href: "#" };
}

function createStatItem(): StatItem {
  return { target: 0, suffix: "+", label: "New stat" };
}

function createServiceItem(): ServiceItem {
  return {
    title: "New service",
    description: "Describe the outcome this service should deliver.",
    points: ["Point one", "Point two", "Point three"],
    technologies: ["Technology"],
  };
}

function createProcessStep(index: number): ProcessStep {
  return {
    step: String(index + 1).padStart(2, "0"),
    title: "New step",
    description: "Describe the stage and outcome.",
  };
}

function createTeamMember(): TeamMember {
  return {
    name: "New team member",
    role: "Role",
    initials: "NM",
    skills: ["Skill one", "Skill two"],
    bio: "Write a short bio for this person.",
    portfolioUrl: "",
    linkedinUrl: "",
  };
}

function createReviewItem(): ReviewItem {
  return {
    id: Date.now(),
    name: "New review",
    company: "Client",
    date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    rating: 5,
    text: "Write the review here.",
    initials: buildInitials("New review"),
  };
}

function createFaqItem(): FaqItem {
  return {
    question: "New question?",
    answer: "Write the answer here.",
  };
}

function duplicateNavigationItem(item: NavigationItem) {
  return {
    label: `${item.label} copy`,
    href: item.href,
  };
}

function duplicateStatItem(item: StatItem) {
  return {
    target: item.target,
    suffix: item.suffix,
    label: `${item.label} copy`,
  };
}

function duplicateServiceItem(item: ServiceItem) {
  return {
    ...item,
    title: `${item.title} copy`,
    points: [...item.points],
    technologies: [...item.technologies],
  };
}

function duplicateProcessStep(item: ProcessStep) {
  return {
    ...item,
    step: `${item.step} copy`,
    title: `${item.title} copy`,
  };
}

function duplicateTeamMember(item: TeamMember) {
  return {
    ...item,
    name: `${item.name} copy`,
    initials: buildInitials(`${item.name} copy`),
    skills: [...item.skills],
  };
}

function duplicateReviewItem(item: ReviewItem) {
  return {
    ...item,
    id: Date.now(),
    name: `${item.name} copy`,
    initials: buildInitials(`${item.name} copy`),
  };
}

function duplicateFaqItem(item: FaqItem) {
  return {
    ...item,
    question: `${item.question} copy`,
  };
}

function updateAt<T>(items: T[], index: number, updater: (item: T) => T) {
  return items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));
}

type SearchResult = {
  id: string;
  section: SectionId;
  index: number | null;
  title: string;
  detail: string;
};

function isMatch(query: string, ...values: string[]) {
  if (!query) {
    return false;
  }

  return values.some((value) => normalizeText(value).includes(query));
}

function toHomepageOrder(order: SectionId[]): HomepageSectionId[] {
  return order.filter((sectionId) =>
    homepageSectionIds.includes(sectionId as HomepageSectionId),
  ) as HomepageSectionId[];
}

export default function AdminStudio({
  initialDraft,
  published,
  metrics,
  submissions,
  offlineMessage,
}: AdminStudioProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<SiteContent>(initialDraft);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("Draft loaded");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [localSubmissions, setLocalSubmissions] = useState(submissions);
  const [liveMode, setLiveMode] = useState<"draft" | "published">("draft");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(
    (initialDraft.homepageOrder as SectionId[] | undefined) ?? sectionTabs.map((section) => section.id),
  );
  const [dragSection, setDragSection] = useState<SectionId | null>(null);
  const [dragCollection, setDragCollection] = useState<"navigation" | "stats" | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(published), [draft, published]);
  const currentView = liveMode === "draft" ? draft : published;
  const normalizedQuery = normalizeText(searchQuery);
  const sectionLookup = useMemo(
    () => new Map(sectionTabs.map((section) => [section.id, section] as const)),
    [],
  );

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!normalizedQuery) {
      return [];
    }

    const results: SearchResult[] = [];
    const addResult = (result: SearchResult) => {
      if (!results.some((existing) => existing.id === result.id)) {
        results.push(result);
      }
    };

    sectionTabs.forEach((section) => {
      if (isMatch(normalizedQuery, section.label, section.description)) {
        addResult({
          id: `section:${section.id}`,
          section: section.id,
          index: null,
          title: section.label,
          detail: section.description,
        });
      }
    });

    draft.navigation.forEach((item, index) => {
      if (isMatch(normalizedQuery, item.label, item.href)) {
        addResult({
          id: `navigation:${index}`,
          section: "overview",
          index: null,
          title: item.label,
          detail: item.href,
        });
      }
    });

    draft.stats.forEach((item, index) => {
      if (isMatch(normalizedQuery, item.label, String(item.target), item.suffix)) {
        addResult({
          id: `stats:${index}`,
          section: "overview",
          index: null,
          title: item.label,
          detail: `${item.target}${item.suffix}`,
        });
      }
    });

    draft.services.forEach((item, index) => {
      if (isMatch(normalizedQuery, item.title, item.description, ...item.points, ...item.technologies)) {
        addResult({
          id: `services:${index}`,
          section: "services",
          index,
          title: item.title,
          detail: item.description,
        });
      }
    });

    draft.clientNames.forEach((item, index) => {
      if (isMatch(normalizedQuery, item)) {
        addResult({
          id: `client:${index}`,
          section: "showcase",
          index: null,
          title: item,
          detail: "Client name",
        });
      }
    });

    draft.projectNames.forEach((item, index) => {
      if (isMatch(normalizedQuery, item)) {
        addResult({
          id: `project:${index}`,
          section: "showcase",
          index: null,
          title: item,
          detail: "Project name",
        });
      }
    });

    draft.processSteps.forEach((item, index) => {
      if (isMatch(normalizedQuery, item.step, item.title, item.description)) {
        addResult({
          id: `process:${index}`,
          section: "process",
          index,
          title: `${item.step} ${item.title}`,
          detail: item.description,
        });
      }
    });

    draft.team.forEach((item, index) => {
      if (isMatch(normalizedQuery, item.name, item.role, item.bio, ...item.skills)) {
        addResult({
          id: `team:${index}`,
          section: "team",
          index,
          title: item.name,
          detail: item.role,
        });
      }
    });

    draft.reviews.forEach((item, index) => {
      if (isMatch(normalizedQuery, item.name, item.company, item.date, item.text, item.initials)) {
        addResult({
          id: `reviews:${index}`,
          section: "reviews",
          index,
          title: item.name,
          detail: item.text,
        });
      }
    });

    draft.faqs.forEach((item, index) => {
      if (isMatch(normalizedQuery, item.question, item.answer)) {
        addResult({
          id: `faqs:${index}`,
          section: "faqs",
          index,
          title: item.question,
          detail: item.answer,
        });
      }
    });

    if (isMatch(normalizedQuery, draft.contactSection.email, draft.contactSection.whatsapp, draft.contactSection.city, draft.contactSection.bookingTitle, draft.contactSection.bookingDescription)) {
      addResult({
        id: "contact:details",
        section: "contact",
        index: null,
        title: "Contact details",
        detail: draft.contactSection.email,
      });
    }

    if (isMatch(normalizedQuery, draft.assistant.dockTitle, draft.assistant.dockDescription, draft.assistant.greeting, ...draft.assistant.suggestions)) {
      addResult({
        id: "assistant:dock",
        section: "assistant",
        index: null,
        title: draft.assistant.dockTitle,
        detail: draft.assistant.dockDescription,
      });
    }

    if (isMatch(normalizedQuery, draft.footer.description, draft.footer.copyright, ...draft.footer.serviceLinks, ...draft.footer.companyLinks)) {
      addResult({
        id: "footer:copy",
        section: "footer",
        index: null,
        title: "Footer",
        detail: draft.footer.description,
      });
    }

    return results.slice(0, 20);
  }, [draft, normalizedQuery]);

  const previewService = currentView.services[0] ?? createServiceItem();
  const previewReview = currentView.reviews[0] ?? createReviewItem();

  async function persist(action: "save" | "publish") {
    setStatus(action === "save" ? "Saving..." : "Publishing...");
    if (action === "save") {
      setSaving(true);
    } else {
      setPublishing(true);
    }

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content: draft,
        }),
      });

      const data = (await response.json()) as { error?: string; content?: SiteContent };

      if (!response.ok) {
        throw new Error(data.error || "Could not update content.");
      }

      if (data.content) {
        setDraft(data.content);
        setSectionOrder(
          (data.content.homepageOrder as SectionId[] | undefined) ?? sectionTabs.map((section) => section.id),
        );
      }

      setStatus(action === "save" ? "Draft saved" : "Published live");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update content.");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  function selectSection(section: SectionId, index: number | null = null) {
    setActiveSection(section);
    setSelectedIndex(index);
  }

  function confirmDelete(label: string) {
    return window.confirm(`Delete ${label}? This cannot be undone until you save a fresh copy.`);
  }

  function updateNavigation(index: number, updater: (item: NavigationItem) => NavigationItem) {
    setDraft((current) => ({
      ...current,
      navigation: updateAt(current.navigation, index, updater),
    }));
  }

  function updateStat(index: number, updater: (item: StatItem) => StatItem) {
    setDraft((current) => ({
      ...current,
      stats: updateAt(current.stats, index, updater),
    }));
  }

  function updateService(index: number, updater: (item: ServiceItem) => ServiceItem) {
    setDraft((current) => ({
      ...current,
      services: updateAt(current.services, index, updater),
    }));
  }

  function updateProcessStep(index: number, updater: (item: ProcessStep) => ProcessStep) {
    setDraft((current) => ({
      ...current,
      processSteps: updateAt(current.processSteps, index, updater),
    }));
  }

  function updateTeam(index: number, updater: (item: TeamMember) => TeamMember) {
    setDraft((current) => ({
      ...current,
      team: updateAt(current.team, index, updater),
    }));
  }

  function updateReview(index: number, updater: (item: ReviewItem) => ReviewItem) {
    setDraft((current) => ({
      ...current,
      reviews: updateAt(current.reviews, index, updater),
    }));
  }

  function updateFaq(index: number, updater: (item: FaqItem) => FaqItem) {
    setDraft((current) => ({
      ...current,
      faqs: updateAt(current.faqs, index, updater),
    }));
  }

  function renderOverview() {
    return (
      <div className="space-y-6">
        <Panel
          kicker="Overview"
          title="Page identity"
          description="These controls set the global brand, metadata, and navigation that the whole site reads."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="grid gap-4">
              <Field
                label="Site Title"
                value={draft.metadata.title}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    metadata: { ...current.metadata, title: value },
                  }))
                }
              />
              <Field
                label="Canonical"
                value={draft.metadata.canonical}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    metadata: { ...current.metadata, canonical: value },
                  }))
                }
              />
              <TextAreaField
                label="Meta Description"
                value={draft.metadata.description}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    metadata: { ...current.metadata, description: value },
                  }))
                }
                rows={3}
              />
            </div>

            <div className="grid gap-4">
              <Field
                label="Open Graph Title"
                value={draft.metadata.ogTitle}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    metadata: { ...current.metadata, ogTitle: value },
                  }))
                }
              />
              <TextAreaField
                label="Open Graph Description"
                value={draft.metadata.ogDescription}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    metadata: { ...current.metadata, ogDescription: value },
                  }))
                }
                rows={3}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Site Name"
                  value={draft.metadata.siteName}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      metadata: { ...current.metadata, siteName: value },
                    }))
                  }
                />
                <Field
                  label="Brand Mark"
                  value={draft.brand.mark}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      brand: { ...current.brand, mark: value },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          kicker="Brand"
          title="Tone and navigation"
          description="A short brand line keeps the top of the page feeling crisp, while the nav stays easy to scan."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="grid gap-4">
              <Field
                label="Brand Name"
                value={draft.brand.name}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    brand: { ...current.brand, name: value },
                  }))
                }
              />
              <Field
                label="Tagline"
                value={draft.brand.tagline}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    brand: { ...current.brand, tagline: value },
                  }))
                }
              />
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-semibold text-[var(--text)]">Navigation</div>
                <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
                  Edit the primary menu items directly. Remove any link you do not need.
                </p>
              </div>

              {draft.navigation.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className={`grid gap-3 rounded-[1.35rem] surface-panel p-4 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] ${
                    dragCollection === "navigation" && dragIndex === index
                      ? "ring-1 ring-[color-mix(in_srgb,var(--accent)_60%,transparent)]"
                      : ""
                  }`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragCollection !== "navigation" || dragIndex === null || dragIndex === index) {
                      setDragCollection(null);
                      setDragIndex(null);
                      return;
                    }

                    setDraft((current) => ({
                      ...current,
                      navigation: moveItem(current.navigation, dragIndex, index),
                    }));
                    setDragCollection(null);
                    setDragIndex(null);
                  }}
                >
                  <button
                    type="button"
                    draggable
                    onDragStart={() => {
                      setDragCollection("navigation");
                      setDragIndex(index);
                    }}
                    onDragEnd={() => {
                      setDragCollection(null);
                      setDragIndex(null);
                    }}
                    aria-label={`Drag ${item.label}`}
                    className="cursor-grab rounded-full border border-white/10 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] active:cursor-grabbing"
                  >
                    Drag
                  </button>
                  <input
                    className="field"
                    value={item.label}
                    placeholder="Label"
                    onChange={(event) =>
                      updateNavigation(index, (current) => ({
                        ...current,
                        label: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="field"
                    value={item.href}
                    placeholder="#section"
                    onChange={(event) =>
                      updateNavigation(index, (current) => ({
                        ...current,
                        href: event.target.value,
                      }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          navigation: [
                            ...current.navigation.slice(0, index + 1),
                            duplicateNavigationItem(item),
                            ...current.navigation.slice(index + 1),
                          ],
                        }))
                      }
                      className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] transition-colors hover:bg-white/5"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirmDelete(item.label)) {
                          return;
                        }
                        setDraft((current) => ({
                          ...current,
                          navigation: current.navigation.filter((_, navIndex) => navIndex !== index),
                        }));
                      }}
                      className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] transition-colors hover:bg-white/5"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {!draft.navigation.length ? (
                <div className="rounded-[1.35rem] surface-panel p-4 text-sm text-[var(--text-soft)]">
                  Add at least one navigation item.
                </div>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    navigation: [...current.navigation, createNavigationItem()],
                  }))
                }
                className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-white/5"
              >
                Add Link
              </button>
            </div>
          </div>
        </Panel>

        <Panel
          kicker="Numbers"
          title="Stats and capabilities"
          description="These chips and counts are used throughout the homepage as proof points."
        >
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-[var(--text)]">Stats</div>
              <div className="space-y-3">
                {draft.stats.map((stat, index) => (
                  <div
                    key={`${stat.label}-${index}`}
                    className={`rounded-[1.35rem] surface-panel p-4 ${
                      dragCollection === "stats" && dragIndex === index
                        ? "ring-1 ring-[color-mix(in_srgb,var(--accent)_60%,transparent)]"
                        : ""
                    }`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragCollection !== "stats" || dragIndex === null || dragIndex === index) {
                        setDragCollection(null);
                        setDragIndex(null);
                        return;
                      }

                      setDraft((current) => ({
                        ...current,
                        stats: moveItem(current.stats, dragIndex, index),
                      }));
                      setDragCollection(null);
                      setDragIndex(null);
                    }}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <button
                          type="button"
                          draggable
                          onDragStart={() => {
                            setDragCollection("stats");
                            setDragIndex(index);
                          }}
                          onDragEnd={() => {
                            setDragCollection(null);
                            setDragIndex(null);
                          }}
                          aria-label={`Drag ${stat.label}`}
                          className="cursor-grab rounded-full border border-white/10 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] active:cursor-grabbing lg:shrink-0"
                        >
                          Drag
                        </button>
                        <input
                          className="field min-w-0 flex-1"
                          type="number"
                          value={stat.target}
                          onChange={(event) =>
                            updateStat(index, (current) => ({
                              ...current,
                              target: Number(event.target.value) || 0,
                            }))
                          }
                        />
                        <input
                          className="field min-w-0 flex-1"
                          value={stat.label}
                          onChange={(event) =>
                            updateStat(index, (current) => ({
                              ...current,
                              label: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <input
                          className="field min-w-0 flex-1"
                          value={stat.suffix}
                          onChange={(event) =>
                            updateStat(index, (current) => ({
                              ...current,
                              suffix: event.target.value,
                            }))
                          }
                        />
                        <div className="flex flex-wrap gap-2 lg:shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                stats: [
                                  ...current.stats.slice(0, index + 1),
                                  duplicateStatItem(stat),
                                  ...current.stats.slice(index + 1),
                                ],
                              }))
                            }
                            className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] transition-colors hover:bg-white/5"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const label = stat.label || "stat";
                              if (!confirmDelete(label)) {
                                return;
                              }
                              setDraft((current) => ({
                                ...current,
                                stats: current.stats.filter((_, statIndex) => statIndex !== index),
                              }));
                            }}
                            className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] transition-colors hover:bg-white/5"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    stats: [...current.stats, createStatItem()],
                  }))
                }
                className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-white/5"
              >
                Add Stat
              </button>
            </div>

            <SimpleListEditor
              label="Capabilities"
              description="These items drive the offer chips on the site."
              items={draft.offers}
              onChange={(items) =>
                setDraft((current) => ({
                  ...current,
                  offers: items,
                }))
              }
              emptyLabel="Add a capability item."
              addLabel="Add Capability"
              placeholder="Capability"
            />
          </div>
        </Panel>
      </div>
    );
  }

  function renderHero() {
    return (
      <Panel
        kicker="Hero"
        title="Top section copy"
        description="This is the first thing visitors see, so the line breaks and call to action should stay sharp."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="grid gap-4">
            <Field
              label="Eyebrow"
              value={draft.hero.eyebrow}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  hero: { ...current.hero, eyebrow: value },
                }))
              }
            />
            <TextAreaField
              label="Headline"
              value={draft.hero.title}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  hero: { ...current.hero, title: value },
                }))
              }
              rows={3}
            />
            <TextAreaField
              label="Description"
              value={draft.hero.description}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  hero: { ...current.hero, description: value },
                }))
              }
              rows={4}
            />
          </div>

          <div className="grid gap-4">
            <Field
              label="Primary CTA"
              value={draft.hero.primaryCta}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  hero: { ...current.hero, primaryCta: value },
                }))
              }
            />
            <Field
              label="Secondary CTA"
              value={draft.hero.secondaryCta}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  hero: { ...current.hero, secondaryCta: value },
                }))
              }
            />
            <Field
              label="Badge"
              value={draft.hero.badge}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  hero: { ...current.hero, badge: value },
                }))
              }
            />
            <Field
              label="Engine Label"
              value={draft.hero.engineLabel}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  hero: { ...current.hero, engineLabel: value },
                }))
              }
            />
            <Field
              label="Scroll Hint"
              value={draft.hero.scrollHint}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  hero: { ...current.hero, scrollHint: value },
                }))
              }
            />
          </div>
        </div>
      </Panel>
    );
  }

  function renderServices() {
    const selectedService = selectedIndex !== null ? draft.services[selectedIndex] : null;

    return (
      <div className="space-y-6">
        <Panel
          kicker="Services"
          title="Offer cards"
          description="Click a card to expand it. Delete removes the service from the homepage list."
        >
          <ObjectList
            items={draft.services}
            selectedIndex={selectedIndex}
            getTitle={(item) => (item as ServiceItem).title}
            getMeta={(item) => (item as ServiceItem).description}
            onSelect={(index) => setSelectedIndex(index)}
            onReorder={(from, to) => {
              setDraft((current) => ({
                ...current,
                services: moveItem(current.services, from, to),
              }));
              setSelectedIndex((current) => shiftSelectedIndex(current, from, to));
            }}
            onDuplicate={(index) =>
              setDraft((current) => ({
                ...current,
                services: [
                  ...current.services.slice(0, index + 1),
                  duplicateServiceItem(current.services[index]),
                  ...current.services.slice(index + 1),
                ],
              }))
            }
            onDelete={(index) => {
              const item = draft.services[index];
              if (!confirmDelete(item.title)) {
                return;
              }
              setDraft((current) => ({
                ...current,
                services: current.services.filter((_, serviceIndex) => serviceIndex !== index),
              }));
              setSelectedIndex(null);
            }}
            addLabel="Add Service"
            onAdd={() => {
              setDraft((current) => ({
                ...current,
                services: [...current.services, createServiceItem()],
              }));
              setSelectedIndex(draft.services.length);
            }}
            emptyLabel="No services yet. Add the first service card."
          />
        </Panel>

        {selectedService ? (
          <Panel
            kicker="Editor"
            title={`Editing ${selectedService.title}`}
            description="All changes save into the draft state immediately."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="grid gap-4">
                <Field
                  label="Title"
                  value={selectedService.title}
                  onChange={(value) => updateService(selectedIndex as number, (current) => ({ ...current, title: value }))}
                />
                <TextAreaField
                  label="Description"
                  value={selectedService.description}
                  onChange={(value) =>
                    updateService(selectedIndex as number, (current) => ({
                      ...current,
                      description: value,
                    }))
                  }
                  rows={4}
                />
              </div>

              <div className="grid gap-4">
                <TextAreaField
                  label="Points"
                  value={joinLines(selectedService.points)}
                  onChange={(value) =>
                    updateService(selectedIndex as number, (current) => ({
                      ...current,
                      points: splitLines(value),
                    }))
                  }
                  rows={5}
                />
                <TextAreaField
                  label="Technologies"
                  value={joinLines(selectedService.technologies)}
                  onChange={(value) =>
                    updateService(selectedIndex as number, (current) => ({
                      ...current,
                      technologies: splitLines(value),
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </Panel>
        ) : null}
      </div>
    );
  }

  function renderShowcase() {
    return (
      <div className="space-y-6">
        <Panel
          kicker="Showcase"
          title="Work and portfolio copy"
          description="This section controls the client and project marquee plus the supporting copy."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="grid gap-4">
              <Field
                label="Kicker"
                value={draft.showcaseSection.kicker}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    showcaseSection: { ...current.showcaseSection, kicker: value },
                  }))
                }
              />
              <TextAreaField
                label="Title"
                value={draft.showcaseSection.title}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    showcaseSection: { ...current.showcaseSection, title: value },
                  }))
                }
                rows={3}
              />
              <TextAreaField
                label="Lead"
                value={draft.showcaseSection.lead}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    showcaseSection: { ...current.showcaseSection, lead: value },
                  }))
                }
                rows={4}
              />
            </div>

            <div className="grid gap-4">
              <TextAreaField
                label="Note"
                value={draft.showcaseSection.note}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    showcaseSection: { ...current.showcaseSection, note: value },
                  }))
                }
                rows={4}
              />
              <SimpleListEditor
                label="Client names"
                description="These names loop as small chips in the showcase strip."
                items={draft.clientNames}
                onChange={(items) =>
                  setDraft((current) => ({
                    ...current,
                    clientNames: items,
                  }))
                }
                emptyLabel="Add a client name."
                addLabel="Add Client"
                placeholder="Client name"
              />
            </div>
          </div>

          <div className="mt-6">
            <SimpleListEditor
              label="Project names"
              description="These are used for the project marquee."
              items={draft.projectNames}
              onChange={(items) =>
                setDraft((current) => ({
                  ...current,
                  projectNames: items,
                }))
              }
              emptyLabel="Add a project name."
              addLabel="Add Project"
              placeholder="Project name"
            />
          </div>
        </Panel>
      </div>
    );
  }

  function renderProcess() {
    const selectedStep = selectedIndex !== null ? draft.processSteps[selectedIndex] : null;

    return (
      <div className="space-y-6">
        <Panel
          kicker="Process"
          title="Delivery roadmap"
          description="This is the step-by-step timeline shown to clients."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="grid gap-4">
              <Field
                label="Kicker"
                value={draft.processSection.kicker}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    processSection: { ...current.processSection, kicker: value },
                  }))
                }
              />
              <TextAreaField
                label="Title"
                value={draft.processSection.title}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    processSection: { ...current.processSection, title: value },
                  }))
                }
                rows={2}
              />
              <TextAreaField
                label="Lead"
                value={draft.processSection.lead}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    processSection: { ...current.processSection, lead: value },
                  }))
                }
                rows={4}
              />
            </div>

          <ObjectList
            items={draft.processSteps}
            selectedIndex={selectedIndex}
            getTitle={(item) => `${(item as ProcessStep).step}  ${ (item as ProcessStep).title }`}
            getMeta={(item) => (item as ProcessStep).description}
            onSelect={(index) => setSelectedIndex(index)}
            onReorder={(from, to) => {
              setDraft((current) => ({
                ...current,
                processSteps: moveItem(current.processSteps, from, to),
              }));
              setSelectedIndex((current) => shiftSelectedIndex(current, from, to));
            }}
            onDuplicate={(index) =>
              setDraft((current) => ({
                ...current,
                processSteps: [
                  ...current.processSteps.slice(0, index + 1),
                  duplicateProcessStep(current.processSteps[index]),
                  ...current.processSteps.slice(index + 1),
                ],
              }))
            }
            onDelete={(index) => {
              const step = draft.processSteps[index];
              if (!confirmDelete(`step ${step.step}`)) {
                return;
              }
                setDraft((current) => ({
                  ...current,
                  processSteps: current.processSteps.filter((_, stepIndex) => stepIndex !== index),
                }));
                setSelectedIndex(null);
              }}
              addLabel="Add Step"
              onAdd={() => {
                setDraft((current) => ({
                  ...current,
                  processSteps: [...current.processSteps, createProcessStep(current.processSteps.length)],
                }));
                setSelectedIndex(draft.processSteps.length);
              }}
              emptyLabel="Add the first process step."
            />
          </div>
        </Panel>

        {selectedStep ? (
          <Panel
            kicker="Editor"
            title={`Editing step ${selectedStep.step}`}
            description="Update the step label, title, and explanation."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              <Field
                label="Step"
                value={selectedStep.step}
                onChange={(value) =>
                  updateProcessStep(selectedIndex as number, (current) => ({
                    ...current,
                    step: value,
                  }))
                }
              />
              <Field
                label="Title"
                value={selectedStep.title}
                onChange={(value) =>
                  updateProcessStep(selectedIndex as number, (current) => ({
                    ...current,
                    title: value,
                  }))
                }
              />
              <TextAreaField
                label="Description"
                value={selectedStep.description}
                onChange={(value) =>
                  updateProcessStep(selectedIndex as number, (current) => ({
                    ...current,
                    description: value,
                  }))
                }
                rows={4}
              />
            </div>
          </Panel>
        ) : null}
      </div>
    );
  }

  function renderTeam() {
    const selectedMember = selectedIndex !== null ? draft.team[selectedIndex] : null;

    return (
      <div className="space-y-6">
        <Panel
          kicker="Team"
          title="People cards"
          description="Use the list to choose a person, then edit the expanded card below."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="grid gap-4">
              <Field
                label="Kicker"
                value={draft.teamSection.kicker}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    teamSection: { ...current.teamSection, kicker: value },
                  }))
                }
              />
              <TextAreaField
                label="Title"
                value={draft.teamSection.title}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    teamSection: { ...current.teamSection, title: value },
                  }))
                }
                rows={2}
              />
              <TextAreaField
                label="Lead"
                value={draft.teamSection.lead}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    teamSection: { ...current.teamSection, lead: value },
                  }))
                }
                rows={4}
              />
            </div>

          <ObjectList
            items={draft.team}
            selectedIndex={selectedIndex}
            getTitle={(item) => (item as TeamMember).name}
            getMeta={(item) => (item as TeamMember).role}
            onSelect={(index) => setSelectedIndex(index)}
            onReorder={(from, to) => {
              setDraft((current) => ({
                ...current,
                team: moveItem(current.team, from, to),
              }));
              setSelectedIndex((current) => shiftSelectedIndex(current, from, to));
            }}
            onDuplicate={(index) =>
              setDraft((current) => ({
                ...current,
                team: [
                  ...current.team.slice(0, index + 1),
                  duplicateTeamMember(current.team[index]),
                  ...current.team.slice(index + 1),
                ],
              }))
            }
            onDelete={(index) => {
              const member = draft.team[index];
              if (!confirmDelete(member.name)) {
                return;
              }
                setDraft((current) => ({
                  ...current,
                  team: current.team.filter((_, memberIndex) => memberIndex !== index),
                }));
                setSelectedIndex(null);
              }}
              addLabel="Add Member"
              onAdd={() => {
                setDraft((current) => ({
                  ...current,
                  team: [...current.team, createTeamMember()],
                }));
                setSelectedIndex(draft.team.length);
              }}
              emptyLabel="Add the first team member."
            />
          </div>
        </Panel>

        {selectedMember ? (
          <Panel
            kicker="Editor"
            title={`Editing ${selectedMember.name}`}
            description="Change the role, links, bio, and skills in one place."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="grid gap-4">
                <Field
                  label="Name"
                  value={selectedMember.name}
                  onChange={(value) =>
                    updateTeam(selectedIndex as number, (current) => ({
                      ...current,
                      name: value,
                    }))
                  }
                />
                <Field
                  label="Role"
                  value={selectedMember.role}
                  onChange={(value) =>
                    updateTeam(selectedIndex as number, (current) => ({
                      ...current,
                      role: value,
                    }))
                  }
                />
                <Field
                  label="Initials"
                  value={selectedMember.initials}
                  onChange={(value) =>
                    updateTeam(selectedIndex as number, (current) => ({
                      ...current,
                      initials: value,
                    }))
                  }
                />
                <TextAreaField
                  label="Bio"
                  value={selectedMember.bio}
                  onChange={(value) =>
                    updateTeam(selectedIndex as number, (current) => ({
                      ...current,
                      bio: value,
                    }))
                  }
                  rows={4}
                />
              </div>

              <div className="grid gap-4">
                <Field
                  label="Portfolio"
                  value={selectedMember.portfolioUrl}
                  onChange={(value) =>
                    updateTeam(selectedIndex as number, (current) => ({
                      ...current,
                      portfolioUrl: value,
                    }))
                  }
                />
                <Field
                  label="LinkedIn"
                  value={selectedMember.linkedinUrl}
                  onChange={(value) =>
                    updateTeam(selectedIndex as number, (current) => ({
                      ...current,
                      linkedinUrl: value,
                    }))
                  }
                />
                <TextAreaField
                  label="Skills"
                  value={joinLines(selectedMember.skills)}
                  onChange={(value) =>
                    updateTeam(selectedIndex as number, (current) => ({
                      ...current,
                      skills: splitLines(value),
                    }))
                  }
                  rows={5}
                />
              </div>
            </div>
          </Panel>
        ) : null}
      </div>
    );
  }

  function renderReviews() {
    const selectedReview = selectedIndex !== null ? draft.reviews[selectedIndex] : null;

    return (
      <div className="space-y-6">
        <Panel
          kicker="Reviews"
          title="Testimonials"
          description="Short, credible reviews work best here. You can edit them quickly from the list."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="grid gap-4">
              <Field
                label="Kicker"
                value={draft.reviewsSection.kicker}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    reviewsSection: { ...current.reviewsSection, kicker: value },
                  }))
                }
              />
              <TextAreaField
                label="Title"
                value={draft.reviewsSection.title}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    reviewsSection: { ...current.reviewsSection, title: value },
                  }))
                }
                rows={2}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="CTA Button"
                  value={draft.reviewsSection.ctaButton}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      reviewsSection: { ...current.reviewsSection, ctaButton: value },
                    }))
                  }
                />
                <Field
                  label="Modal Title"
                  value={draft.reviewsSection.modalTitle}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      reviewsSection: { ...current.reviewsSection, modalTitle: value },
                    }))
                  }
                />
              </div>
            </div>

          <ObjectList
            items={draft.reviews}
            selectedIndex={selectedIndex}
            getTitle={(item) => `${(item as ReviewItem).name}  ${"".padStart((item as ReviewItem).rating, "★")}`}
            getMeta={(item) => (item as ReviewItem).text}
            onSelect={(index) => setSelectedIndex(index)}
            onReorder={(from, to) => {
              setDraft((current) => ({
                ...current,
                reviews: moveItem(current.reviews, from, to),
              }));
              setSelectedIndex((current) => shiftSelectedIndex(current, from, to));
            }}
            onDuplicate={(index) =>
              setDraft((current) => ({
                ...current,
                reviews: [
                  ...current.reviews.slice(0, index + 1),
                  duplicateReviewItem(current.reviews[index]),
                  ...current.reviews.slice(index + 1),
                ],
              }))
            }
            onDelete={(index) => {
              const review = draft.reviews[index];
              if (!confirmDelete(review.name)) {
                return;
              }
                setDraft((current) => ({
                  ...current,
                  reviews: current.reviews.filter((_, reviewIndex) => reviewIndex !== index),
                }));
                setSelectedIndex(null);
              }}
              addLabel="Add Review"
              onAdd={() => {
                setDraft((current) => ({
                  ...current,
                  reviews: [...current.reviews, createReviewItem()],
                }));
                setSelectedIndex(draft.reviews.length);
              }}
              emptyLabel="Add the first testimonial."
            />
          </div>
        </Panel>

        {selectedReview ? (
          <Panel
            kicker="Editor"
            title={`Editing ${selectedReview.name}`}
            description="Update the testimonial copy and metadata."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="grid gap-4">
                <Field
                  label="Name"
                  value={selectedReview.name}
                  onChange={(value) =>
                    updateReview(selectedIndex as number, (current) => ({
                      ...current,
                      name: value,
                    }))
                  }
                />
                <Field
                  label="Company"
                  value={selectedReview.company}
                  onChange={(value) =>
                    updateReview(selectedIndex as number, (current) => ({
                      ...current,
                      company: value,
                    }))
                  }
                />
                <Field
                  label="Date"
                  value={selectedReview.date}
                  onChange={(value) =>
                    updateReview(selectedIndex as number, (current) => ({
                      ...current,
                      date: value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-4">
                <Field
                  label="Rating"
                  value={String(selectedReview.rating)}
                  onChange={(value) =>
                    updateReview(selectedIndex as number, (current) => ({
                      ...current,
                      rating: Math.min(Math.max(Number(value) || 1, 1), 5),
                    }))
                  }
                />
                <Field
                  label="Initials"
                  value={selectedReview.initials}
                  onChange={(value) =>
                    updateReview(selectedIndex as number, (current) => ({
                      ...current,
                      initials: value,
                    }))
                  }
                />
                <TextAreaField
                  label="Review Copy"
                  value={selectedReview.text}
                  onChange={(value) =>
                    updateReview(selectedIndex as number, (current) => ({
                      ...current,
                      text: value,
                    }))
                  }
                  rows={5}
                />
              </div>
            </div>
          </Panel>
        ) : null}
      </div>
    );
  }

  function renderFaqs() {
    const selectedFaq = selectedIndex !== null ? draft.faqs[selectedIndex] : null;

    return (
      <div className="space-y-6">
        <Panel
          kicker="FAQs"
          title="Question bank"
          description="Keep the questions simple and the answers short enough to scan quickly."
        >
          <ObjectList
            items={draft.faqs}
            selectedIndex={selectedIndex}
            getTitle={(item) => (item as FaqItem).question}
            getMeta={(item) => (item as FaqItem).answer}
            onSelect={(index) => setSelectedIndex(index)}
            onReorder={(from, to) => {
              setDraft((current) => ({
                ...current,
                faqs: moveItem(current.faqs, from, to),
              }));
              setSelectedIndex((current) => shiftSelectedIndex(current, from, to));
            }}
            onDuplicate={(index) =>
              setDraft((current) => ({
                ...current,
                faqs: [
                  ...current.faqs.slice(0, index + 1),
                  duplicateFaqItem(current.faqs[index]),
                  ...current.faqs.slice(index + 1),
                ],
              }))
            }
            onDelete={(index) => {
              const faq = draft.faqs[index];
              if (!confirmDelete(faq.question)) {
                return;
              }
              setDraft((current) => ({
                ...current,
                faqs: current.faqs.filter((_, faqIndex) => faqIndex !== index),
              }));
              setSelectedIndex(null);
            }}
            addLabel="Add FAQ"
            onAdd={() => {
              setDraft((current) => ({
                ...current,
                faqs: [...current.faqs, createFaqItem()],
              }));
              setSelectedIndex(draft.faqs.length);
            }}
            emptyLabel="Add the first FAQ item."
          />
        </Panel>

        {selectedFaq ? (
          <Panel
            kicker="Editor"
            title="Editing FAQ"
            description="Change the question and answer without leaving this page."
          >
            <div className="grid gap-4">
              <Field
                label="Question"
                value={selectedFaq.question}
                onChange={(value) =>
                  updateFaq(selectedIndex as number, (current) => ({
                    ...current,
                    question: value,
                  }))
                }
              />
              <TextAreaField
                label="Answer"
                value={selectedFaq.answer}
                onChange={(value) =>
                  updateFaq(selectedIndex as number, (current) => ({
                    ...current,
                    answer: value,
                  }))
                }
                rows={5}
              />
            </div>
          </Panel>
        ) : null}
      </div>
    );
  }

  function renderContact() {
    return (
      <Panel
        kicker="Contact"
        title="Lead capture details"
        description="These values appear on the contact section and booking area."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="grid gap-4">
            <Field
              label="Email"
              value={draft.contactSection.email}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  contactSection: { ...current.contactSection, email: value },
                }))
              }
            />
            <Field
              label="WhatsApp"
              value={draft.contactSection.whatsapp}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  contactSection: { ...current.contactSection, whatsapp: value },
                }))
              }
            />
            <Field
              label="City"
              value={draft.contactSection.city}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  contactSection: { ...current.contactSection, city: value },
                }))
              }
            />
          </div>

          <div className="grid gap-4">
            <Field
              label="Booking Button"
              value={draft.contactSection.bookingButton}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  contactSection: { ...current.contactSection, bookingButton: value },
                }))
              }
            />
            <TextAreaField
              label="Lead"
              value={draft.contactSection.lead}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  contactSection: { ...current.contactSection, lead: value },
                }))
              }
              rows={4}
            />
            <TextAreaField
              label="Booking Description"
              value={draft.contactSection.bookingDescription}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  contactSection: { ...current.contactSection, bookingDescription: value },
                }))
              }
              rows={4}
            />
          </div>
        </div>
      </Panel>
    );
  }

  function renderAssistant() {
    return (
      <Panel
        kicker="Assistant"
        title="AI dock copy"
        description="Keep the language concise so the assistant feels useful instead of noisy."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="grid gap-4">
            <Field
              label="Dock Title"
              value={draft.assistant.dockTitle}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  assistant: { ...current.assistant, dockTitle: value },
                }))
              }
            />
            <TextAreaField
              label="Dock Description"
              value={draft.assistant.dockDescription}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  assistant: { ...current.assistant, dockDescription: value },
                }))
              }
              rows={4}
            />
            <TextAreaField
              label="Greeting"
              value={draft.assistant.greeting}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  assistant: { ...current.assistant, greeting: value },
                }))
              }
              rows={4}
            />
          </div>

          <SimpleListEditor
            label="Suggestions"
            description="These quick prompts help visitors start a chat."
            items={draft.assistant.suggestions}
            onChange={(items) =>
              setDraft((current) => ({
                ...current,
                assistant: { ...current.assistant, suggestions: items },
              }))
            }
            emptyLabel="Add the first suggestion."
            addLabel="Add Suggestion"
            placeholder="Suggestion"
          />
        </div>
      </Panel>
    );
  }

  function renderFooter() {
    return (
      <Panel
        kicker="Footer"
        title="Closing copy and links"
        description="This is where the final trust signals and link groups live."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="grid gap-4">
            <TextAreaField
              label="Description"
              value={draft.footer.description}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  footer: { ...current.footer, description: value },
                }))
              }
              rows={4}
            />
            <Field
              label="Copyright"
              value={draft.footer.copyright}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  footer: { ...current.footer, copyright: value },
                }))
              }
            />
          </div>

          <div className="grid gap-4">
            <SimpleListEditor
              label="Service Links"
              description="These appear in the footer service column."
              items={draft.footer.serviceLinks}
              onChange={(items) =>
                setDraft((current) => ({
                  ...current,
                  footer: { ...current.footer, serviceLinks: items },
                }))
              }
              emptyLabel="Add a service link."
              addLabel="Add Service Link"
              placeholder="Service link"
            />
            <SimpleListEditor
              label="Company Links"
              description="These appear in the footer company column."
              items={draft.footer.companyLinks}
              onChange={(items) =>
                setDraft((current) => ({
                  ...current,
                  footer: { ...current.footer, companyLinks: items },
                }))
              }
              emptyLabel="Add a company link."
              addLabel="Add Company Link"
              placeholder="Company link"
            />
          </div>
        </div>
      </Panel>
    );
  }

  function renderSection() {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "hero":
        return renderHero();
      case "services":
        return renderServices();
      case "showcase":
        return renderShowcase();
      case "process":
        return renderProcess();
      case "team":
        return renderTeam();
      case "reviews":
        return renderReviews();
      case "faqs":
        return renderFaqs();
      case "contact":
        return renderContact();
      case "assistant":
        return renderAssistant();
      case "footer":
        return renderFooter();
      default:
        return null;
    }
  }

  return (
    <div className="agency-shell min-h-screen">
      <div className="mx-auto max-w-[1800px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="surface-panel-strong rounded-[2rem] p-5 shadow-[var(--shadow)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="status-badge rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em]">
                  Content Studio
                </div>
                <div className="text-sm text-[var(--text-soft)]">Last update {formatDateTime(metrics.lastUpdated)}</div>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
                Website-style admin with clear edit, delete, and publish actions.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-soft)]">
                Keep the layout simple: pick a section, click an item to edit it, remove what you do not need, then save or publish when the draft feels right.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[24rem]">
              <div className="rounded-[1.35rem] surface-panel p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-soft)]">Reviews</div>
                <div className="mt-2 text-2xl font-semibold">{metrics.reviews}</div>
              </div>
              <div className="rounded-[1.35rem] surface-panel p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-soft)]">Inbox</div>
                <div className="mt-2 text-2xl font-semibold">{metrics.contacts}</div>
              </div>
              <div className="rounded-[1.35rem] surface-panel p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-soft)]">Status</div>
                <div className="mt-2 text-sm font-semibold leading-6">{hasChanges ? "Unsaved changes" : "Up to date"}</div>
              </div>
            </div>
          </div>

          {offlineMessage ? (
            <div className="mt-5 rounded-[1.35rem] border border-[color-mix(in_srgb,var(--accent-3)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent-3)_10%,transparent)] p-4 text-sm leading-6 text-[var(--text)]">
              {offlineMessage}
            </div>
          ) : null}
        </header>

        <main className="mt-6 grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_360px]">
          <aside className="space-y-3 xl:sticky xl:top-6 xl:h-[calc(100dvh-3rem)] xl:overflow-auto">
            <div className="surface-panel-strong rounded-[2rem] p-4">
              <div className="text-xs uppercase tracking-[0.26em] text-[var(--text-soft)]">Find blocks</div>
              <input
                className="field mt-4"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search sections, cards, or copy..."
              />

              {normalizedQuery ? (
                <div className="mt-4 space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-soft)]">Matches</div>
                  {searchResults.length ? (
                    searchResults.map((result) => {
                      const section = sectionLookup.get(result.section);
                      return (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => {
                            selectSection(result.section, result.index);
                          }}
                          className="w-full rounded-[1.15rem] border border-white/10 surface-panel px-3 py-3 text-left transition-colors hover:bg-white/5"
                        >
                          <div className="text-sm font-semibold text-[var(--text)]">{result.title}</div>
                          <div className="mt-1 text-xs leading-5 text-[var(--text-soft)]">
                            {section?.label} {result.detail ? `• ${result.detail}` : ""}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-[1.15rem] surface-panel p-3 text-sm text-[var(--text-soft)]">
                      No matches found.
                    </div>
                  )}
                </div>
              ) : null}

              <div className="mt-5 text-xs uppercase tracking-[0.26em] text-[var(--text-soft)]">Sections</div>
              <div className="mt-4 space-y-2">
                {sectionOrder.map((sectionId) => {
                  const section = sectionLookup.get(sectionId);
                  if (!section) {
                    return null;
                  }

                  const active = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      draggable
                      onDragStart={() => setDragSection(section.id)}
                      onDragEnd={() => setDragSection(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (!dragSection || dragSection === section.id) {
                          setDragSection(null);
                          return;
                        }

                        setSectionOrder((current) => {
                          const from = current.indexOf(dragSection);
                          const to = current.indexOf(section.id);

                          if (from < 0 || to < 0) {
                            return current;
                          }

                          const nextOrder = moveItem(current, from, to);
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            homepageOrder: toHomepageOrder(nextOrder),
                          }));
                          return nextOrder;
                        });
                        setDragSection(null);
                      }}
                      onClick={() => selectSection(section.id)}
                      className={`w-full rounded-[1.25rem] border px-4 py-3 text-left transition-colors ${
                        active
                          ? "border-[color-mix(in_srgb,var(--accent)_56%,transparent)] bg-white/5"
                          : "border-white/10 surface-panel hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[var(--text)]">{section.label}</div>
                          <div className="mt-1 text-xs leading-5 text-[var(--text-soft)]">{section.description}</div>
                        </div>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                          Drag
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="surface-panel-strong rounded-[2rem] p-4">
              <div className="text-xs uppercase tracking-[0.26em] text-[var(--text-soft)]">Actions</div>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => void persist("save")}
                  disabled={saving || publishing}
                  className="w-full rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => void persist("publish")}
                  disabled={saving || publishing}
                  className="w-full rounded-full surface-panel px-4 py-3 text-sm font-semibold text-[var(--text)] disabled:opacity-60"
                >
                  {publishing ? "Publishing..." : "Publish Live"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="w-full rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:bg-white/5"
                >
                  Logout
                </button>
                <div className="rounded-[1.25rem] surface-panel p-4 text-sm leading-6 text-[var(--text-soft)]">
                  {status}
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6">{renderSection()}</section>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:h-[calc(100dvh-3rem)] xl:overflow-auto">
            <div className="surface-panel-strong rounded-[2rem] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[var(--text-soft)]">Preview</div>
                  <h3 className="mt-2 text-xl font-semibold">Draft / Live view</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveMode((current) => (current === "draft" ? "published" : "draft"))}
                  className="rounded-full surface-panel px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                >
                  {liveMode === "draft" ? "Show Live" : "Show Draft"}
                </button>
              </div>

              <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--accent-2)]">Hero Snapshot</div>
                <h3 className="mt-3 text-2xl font-semibold leading-tight">{currentView.hero.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{currentView.hero.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentView.services.slice(0, 3).map((service) => (
                    <span key={service.title} className="chip px-3 py-2 text-xs">
                      {service.title}
                    </span>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--text-soft)]">
                  Spotlight service: <span className="font-medium text-[var(--text)]">{previewService.title}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl surface-panel p-4">
                  <div className="text-xs text-[var(--text-soft)]">Top Review</div>
                  <div className="mt-1 text-sm font-medium">{previewReview.name}</div>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-soft)]">{previewReview.text}</p>
                </div>
                <div className="rounded-2xl surface-panel p-4">
                  <div className="text-xs text-[var(--text-soft)]">Inbox</div>
                  <div className="mt-1 text-sm font-medium">{localSubmissions.length} leads</div>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-soft)]">
                    Latest: {localSubmissions[0]?.subject || "No submissions yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-panel-strong rounded-[2rem] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[var(--text-soft)]">Inbox</div>
                  <h3 className="mt-2 text-xl font-semibold">Recent inquiries</h3>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const response = await fetch("/api/admin/submissions");
                    if (!response.ok) {
                      return;
                    }
                    const data = (await response.json()) as { submissions?: ContactSubmission[] };
                    setLocalSubmissions(data.submissions || []);
                  }}
                  className="rounded-full surface-panel px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {localSubmissions.slice(0, 4).map((submission) => (
                  <article key={submission.id} className="rounded-[1.4rem] surface-panel p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium">{submission.full_name}</div>
                        <div className="truncate text-sm text-[var(--text-soft)]">{submission.email}</div>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                        {submission.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{submission.subject}</p>
                  </article>
                ))}
                {!localSubmissions.length ? (
                  <div className="rounded-[1.4rem] surface-panel p-4 text-sm text-[var(--text-soft)]">
                    No inbound inquiries yet. New submissions will appear here automatically.
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
