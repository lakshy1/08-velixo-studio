"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, ServiceItem, TeamMember, ReviewItem } from "@/lib/site-content";

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
  { id: "overview", label: "Overview", description: "Brand and metadata" },
  { id: "hero", label: "Hero", description: "Headline and CTA" },
  { id: "services", label: "Services", description: "Offer cards" },
  { id: "showcase", label: "Showcase", description: "Work loop" },
  { id: "process", label: "Process", description: "Delivery flow" },
  { id: "team", label: "Team", description: "People cards" },
  { id: "reviews", label: "Reviews", description: "Social proof" },
  { id: "faqs", label: "FAQs", description: "Questions" },
  { id: "contact", label: "Contact", description: "Inquiry details" },
  { id: "assistant", label: "Assistant", description: "AI dock" },
  { id: "footer", label: "Footer", description: "Closing copy" },
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

function CardFrame({
  title,
  kicker,
  children,
  action,
}: {
  title: string;
  kicker: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="surface-panel-strong rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.32em] text-[var(--accent-2)]">
            {kicker}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">{title}</h3>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
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
  const [status, setStatus] = useState<string>("Draft loaded");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [localSubmissions, setLocalSubmissions] = useState(submissions);
  const [liveMode, setLiveMode] = useState<"draft" | "published">("draft");

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(published),
    [draft, published],
  );

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

  function updateService(index: number, updater: (service: ServiceItem) => ServiceItem) {
    setDraft((current) => ({
      ...current,
      services: current.services.map((service, serviceIndex) =>
        serviceIndex === index ? updater(service) : service,
      ),
    }));
  }

  function updateTeam(index: number, updater: (member: TeamMember) => TeamMember) {
    setDraft((current) => ({
      ...current,
      team: current.team.map((member, memberIndex) =>
        memberIndex === index ? updater(member) : member,
      ),
    }));
  }

  function updateReview(index: number, updater: (review: ReviewItem) => ReviewItem) {
    setDraft((current) => ({
      ...current,
      reviews: current.reviews.map((review, reviewIndex) =>
        reviewIndex === index ? updater(review) : review,
      ),
    }));
  }

  function updateFaq(index: number, updater: (faq: SiteContent["faqs"][number]) => SiteContent["faqs"][number]) {
    setDraft((current) => ({
      ...current,
      faqs: current.faqs.map((faq, faqIndex) => (faqIndex === index ? updater(faq) : faq)),
    }));
  }

  function updateProcessStep(
    index: number,
    updater: (step: SiteContent["processSteps"][number]) => SiteContent["processSteps"][number],
  ) {
    setDraft((current) => ({
      ...current,
      processSteps: current.processSteps.map((step, stepIndex) =>
        stepIndex === index ? updater(step) : step,
      ),
    }));
  }

  const previewService = draft.services[0];
  const previewReview = draft.reviews[0];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(143,131,255,0.18),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(53,227,177,0.12),transparent_22%),linear-gradient(180deg,var(--bg),color-mix(in srgb,var(--bg)_82%,#060913))] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen max-w-[1800px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 flex-col gap-5 lg:flex">
          <div className="surface-panel-strong rounded-[2rem] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-lg font-bold text-white">
                N
              </div>
              <div>
                <div className="font-semibold">Nexvora Studio</div>
                <div className="text-sm text-[var(--text-soft)]">SaaS style admin panel</div>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-2xl surface-panel px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  Content Mode
                </div>
                <div className="mt-1 font-medium">{liveMode === "draft" ? "Draft workspace" : "Published snapshot"}</div>
              </div>
              <div className="rounded-2xl surface-panel px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  Sync Status
                </div>
                <div className="mt-1 font-medium">{status}</div>
              </div>
            </div>
          </div>

          <div className="surface-panel-strong rounded-[2rem] p-3">
            {sectionTabs.map((tab) => {
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`mb-1 flex w-full items-center justify-between rounded-[1.25rem] px-4 py-3 text-left transition-colors ${
                    active
                      ? "bg-white/10 text-[var(--text)]"
                      : "text-[var(--text-soft)] hover:bg-white/5 hover:text-[var(--text)]"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-medium">{tab.label}</span>
                    <span className="block text-[11px] opacity-70">{tab.description}</span>
                  </span>
                  <span className="text-xs">↗</span>
                </button>
              );
            })}
          </div>

          <div className="surface-panel-strong rounded-[2rem] p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-soft)]">Quick Actions</div>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => void persist("save")}
                disabled={saving || publishing}
                className="w-full rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => void persist("publish")}
                disabled={saving || publishing}
                className="w-full rounded-full surface-panel px-4 py-3 text-sm font-semibold text-[var(--text)] disabled:opacity-60"
              >
                Publish Live
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full rounded-full surface-panel px-4 py-3 text-sm font-semibold text-[var(--text-soft)]"
              >
                Log Out
              </button>
            </div>
          </div>
        </aside>

        <main className="grid min-w-0 flex-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <section className="space-y-6">
            {offlineMessage ? (
              <div className="rounded-[1.6rem] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
                {offlineMessage}
              </div>
            ) : null}
            <div className="surface-panel-strong rounded-[2rem] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--accent-2)]">
                    Content Command Center
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Modern content studio</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-soft)]">
                    Edit the homepage like a premium SaaS product. Draft changes, preview live sections, and publish once the copy feels right.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl surface-panel px-4 py-3">
                    <div className="text-xs text-[var(--text-soft)]">Reviews</div>
                    <div className="mt-1 text-2xl font-semibold">{metrics.reviews}</div>
                  </div>
                  <div className="rounded-2xl surface-panel px-4 py-3">
                    <div className="text-xs text-[var(--text-soft)]">Leads</div>
                    <div className="mt-1 text-2xl font-semibold">{metrics.contacts}</div>
                  </div>
                  <div className="rounded-2xl surface-panel px-4 py-3">
                    <div className="text-xs text-[var(--text-soft)]">Updated</div>
                    <div className="mt-1 text-sm font-medium">{new Date(metrics.lastUpdated).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {activeSection === "overview" ? (
              <CardFrame kicker="Brand System" title="Global identity and metadata">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Brand Name"
                    value={draft.brand.name}
                    onChange={(value) => setDraft((current) => ({ ...current, brand: { ...current.brand, name: value } }))}
                  />
                  <Field
                    label="Brand Mark"
                    value={draft.brand.mark}
                    onChange={(value) => setDraft((current) => ({ ...current, brand: { ...current.brand, mark: value } }))}
                  />
                  <Field
                    label="Brand Tagline"
                    value={draft.brand.tagline}
                    onChange={(value) => setDraft((current) => ({ ...current, brand: { ...current.brand, tagline: value } }))}
                  />
                  <Field
                    label="Metadata Title"
                    value={draft.metadata.title}
                    onChange={(value) => setDraft((current) => ({ ...current, metadata: { ...current.metadata, title: value } }))}
                  />
                  <TextAreaField
                    label="Metadata Description"
                    value={draft.metadata.description}
                    onChange={(value) => setDraft((current) => ({ ...current, metadata: { ...current.metadata, description: value } }))}
                    rows={3}
                  />
                  <Field
                    label="Canonical URL"
                    value={draft.metadata.canonical}
                    onChange={(value) => setDraft((current) => ({ ...current, metadata: { ...current.metadata, canonical: value } }))}
                  />
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "hero" ? (
              <CardFrame kicker="Hero Copy" title="Above-the-fold story">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Hero Eyebrow"
                    value={draft.hero.eyebrow}
                    onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, eyebrow: value } }))}
                  />
                  <Field
                    label="Badge"
                    value={draft.hero.badge}
                    onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, badge: value } }))}
                  />
                  <Field
                    label="Primary CTA"
                    value={draft.hero.primaryCta}
                    onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, primaryCta: value } }))}
                  />
                  <Field
                    label="Secondary CTA"
                    value={draft.hero.secondaryCta}
                    onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, secondaryCta: value } }))}
                  />
                  <TextAreaField
                    label="Hero Title"
                    value={draft.hero.title}
                    onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, title: value } }))}
                    rows={3}
                  />
                  <TextAreaField
                    label="Hero Description"
                    value={draft.hero.description}
                    onChange={(value) => setDraft((current) => ({ ...current, hero: { ...current.hero, description: value } }))}
                    rows={3}
                  />
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "services" ? (
              <CardFrame kicker="Service Matrix" title="Editable offer cards">
                <div className="space-y-4">
                  {draft.services.map((service, index) => (
                    <div key={service.title + index} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-semibold text-[var(--text)]">{service.title}</div>
                        <button
                          type="button"
                          className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              services: current.services.filter((_, serviceIndex) => serviceIndex !== index),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-4 grid gap-4">
                        <Field
                          label="Title"
                          value={service.title}
                          onChange={(value) => updateService(index, (current) => ({ ...current, title: value }))}
                        />
                        <TextAreaField
                          label="Description"
                          value={service.description}
                          onChange={(value) => updateService(index, (current) => ({ ...current, description: value }))}
                        />
                        <TextAreaField
                          label="Points"
                          value={joinLines(service.points)}
                          onChange={(value) =>
                            updateService(index, (current) => ({ ...current, points: splitLines(value) }))
                          }
                          rows={3}
                        />
                        <TextAreaField
                          label="Technologies"
                          value={joinLines(service.technologies)}
                          onChange={(value) =>
                            updateService(index, (current) => ({
                              ...current,
                              technologies: splitLines(value),
                            }))
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        services: [
                          ...current.services,
                          {
                            title: "New Service",
                            description: "Describe the offer.",
                            points: ["First value"],
                            technologies: ["Tech"],
                          },
                        ],
                      }))
                    }
                    className="rounded-full surface-panel px-5 py-3 text-sm font-semibold text-[var(--text)]"
                  >
                    Add Service
                  </button>
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "showcase" ? (
              <CardFrame kicker="Showcase" title="Work and brand loops">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextAreaField
                    label="Project Names"
                    value={joinLines(draft.projectNames)}
                    onChange={(value) => setDraft((current) => ({ ...current, projectNames: splitLines(value) }))}
                    rows={4}
                  />
                  <TextAreaField
                    label="Client Names"
                    value={joinLines(draft.clientNames)}
                    onChange={(value) => setDraft((current) => ({ ...current, clientNames: splitLines(value) }))}
                    rows={4}
                  />
                  <TextAreaField
                    label="Offer Items"
                    value={joinLines(draft.offers)}
                    onChange={(value) => setDraft((current) => ({ ...current, offers: splitLines(value) }))}
                    rows={4}
                  />
                  <div className="rounded-[1.4rem] surface-panel p-4 text-sm leading-7 text-[var(--text-soft)]">
                    The live page will read these arrays for the marquee chips and rotating offer list.
                  </div>
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "process" ? (
              <CardFrame kicker="Delivery Flow" title="Five-step service roadmap">
                <div className="grid gap-4">
                  <TextAreaField
                    label="Section Lead"
                    value={draft.processSection.lead}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        processSection: { ...current.processSection, lead: value },
                      }))
                    }
                    rows={3}
                  />
                  {draft.processSteps.map((step, index) => (
                    <div key={step.step} className="rounded-[1.4rem] surface-panel p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <Field
                          label="Step"
                          value={step.step}
                          onChange={(value) => updateProcessStep(index, (current) => ({ ...current, step: value }))}
                        />
                        <Field
                          label="Title"
                          value={step.title}
                          onChange={(value) => updateProcessStep(index, (current) => ({ ...current, title: value }))}
                        />
                        <TextAreaField
                          label="Description"
                          value={step.description}
                          onChange={(value) => updateProcessStep(index, (current) => ({ ...current, description: value }))}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "team" ? (
              <CardFrame kicker="Team Cards" title="People and proof">
                <div className="space-y-4">
                  {draft.team.map((member, index) => (
                    <div key={member.name + index} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field
                          label="Name"
                          value={member.name}
                          onChange={(value) => updateTeam(index, (current) => ({ ...current, name: value }))}
                        />
                        <Field
                          label="Role"
                          value={member.role}
                          onChange={(value) => updateTeam(index, (current) => ({ ...current, role: value }))}
                        />
                        <Field
                          label="Initials"
                          value={member.initials}
                          onChange={(value) => updateTeam(index, (current) => ({ ...current, initials: value }))}
                        />
                        <Field
                          label="Portfolio"
                          value={member.portfolioUrl}
                          onChange={(value) => updateTeam(index, (current) => ({ ...current, portfolioUrl: value }))}
                        />
                        <Field
                          label="LinkedIn"
                          value={member.linkedinUrl}
                          onChange={(value) => updateTeam(index, (current) => ({ ...current, linkedinUrl: value }))}
                        />
                        <TextAreaField
                          label="Bio"
                          value={member.bio}
                          onChange={(value) => updateTeam(index, (current) => ({ ...current, bio: value }))}
                          rows={3}
                        />
                        <TextAreaField
                          label="Skills"
                          value={joinLines(member.skills)}
                          onChange={(value) =>
                            updateTeam(index, (current) => ({ ...current, skills: splitLines(value) }))
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "reviews" ? (
              <CardFrame kicker="Testimonials" title="Reviews and social proof">
                <div className="space-y-4">
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
                  <TextAreaField
                    label="Review Section Title"
                    value={draft.reviewsSection.title}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        reviewsSection: { ...current.reviewsSection, title: value },
                      }))
                    }
                    rows={2}
                  />
                  <TextAreaField
                    label="Modal Description"
                    value={draft.reviewsSection.modalDescription}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        reviewsSection: { ...current.reviewsSection, modalDescription: value },
                      }))
                    }
                    rows={2}
                  />
                  {draft.reviews.map((review, index) => (
                    <div key={review.id} className="rounded-[1.5rem] surface-panel p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field
                          label="Name"
                          value={review.name}
                          onChange={(value) => updateReview(index, (current) => ({ ...current, name: value }))}
                        />
                        <Field
                          label="Company"
                          value={review.company}
                          onChange={(value) => updateReview(index, (current) => ({ ...current, company: value }))}
                        />
                        <Field
                          label="Date"
                          value={review.date}
                          onChange={(value) => updateReview(index, (current) => ({ ...current, date: value }))}
                        />
                        <Field
                          label="Rating"
                          value={String(review.rating)}
                          onChange={(value) =>
                            updateReview(index, (current) => ({
                              ...current,
                              rating: Math.min(Math.max(Number(value) || 1, 1), 5),
                            }))
                          }
                        />
                        <Field
                          label="Initials"
                          value={review.initials}
                          onChange={(value) => updateReview(index, (current) => ({ ...current, initials: value }))}
                        />
                        <TextAreaField
                          label="Review Copy"
                          value={review.text}
                          onChange={(value) => updateReview(index, (current) => ({ ...current, text: value }))}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "faqs" ? (
              <CardFrame kicker="Questions" title="Expandable FAQ bank">
                <div className="space-y-4">
                  {draft.faqs.map((faq, index) => (
                    <div key={faq.question + index} className="rounded-[1.5rem] surface-panel p-4">
                      <Field
                        label="Question"
                        value={faq.question}
                        onChange={(value) => updateFaq(index, (current) => ({ ...current, question: value }))}
                      />
                      <div className="mt-4">
                        <TextAreaField
                          label="Answer"
                          value={faq.answer}
                          onChange={(value) => updateFaq(index, (current) => ({ ...current, answer: value }))}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "contact" ? (
              <CardFrame kicker="Inbound" title="Contact and booking details">
                <div className="grid gap-4 md:grid-cols-2">
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
                    label="Contact Lead"
                    value={draft.contactSection.lead}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        contactSection: { ...current.contactSection, lead: value },
                      }))
                    }
                    rows={3}
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
                    rows={3}
                  />
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "assistant" ? (
              <CardFrame kicker="AI Dock" title="Studio assistant copy">
                <div className="grid gap-4 md:grid-cols-2">
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
                  <Field
                    label="Suggestions"
                    value={joinLines(draft.assistant.suggestions)}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        assistant: { ...current.assistant, suggestions: splitLines(value) },
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
                    rows={3}
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
                    rows={3}
                  />
                </div>
              </CardFrame>
            ) : null}

            {activeSection === "footer" ? (
              <CardFrame kicker="Footer" title="Closing copy and link set">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextAreaField
                    label="Description"
                    value={draft.footer.description}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        footer: { ...current.footer, description: value },
                      }))
                    }
                    rows={3}
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
                  <TextAreaField
                    label="Service Links"
                    value={joinLines(draft.footer.serviceLinks)}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        footer: { ...current.footer, serviceLinks: splitLines(value) },
                      }))
                    }
                    rows={3}
                  />
                  <TextAreaField
                    label="Company Links"
                    value={joinLines(draft.footer.companyLinks)}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        footer: { ...current.footer, companyLinks: splitLines(value) },
                      }))
                    }
                    rows={3}
                  />
                </div>
              </CardFrame>
            ) : null}
          </section>

          <aside className="space-y-6">
            <div className="surface-panel-strong rounded-[2rem] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[var(--text-soft)]">Draft State</div>
                  <div className="mt-1 text-xl font-semibold">{hasChanges ? "Unsaved changes" : "Clean snapshot"}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveMode((current) => (current === "draft" ? "published" : "draft"))}
                  className="rounded-full surface-panel px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                >
                  {liveMode === "draft" ? "Preview Published" : "Preview Draft"}
                </button>
              </div>

              <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--accent-2)]">
                  Hero Preview
                </div>
                <h3 className="mt-3 text-2xl font-semibold leading-tight">
                  {(liveMode === "draft" ? draft : published).hero.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                  {(liveMode === "draft" ? draft : published).hero.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(liveMode === "draft" ? draft : published).services.slice(0, 3).map((service) => (
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

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => void persist("save")}
                  disabled={saving || publishing}
                  className="flex-1 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={() => void persist("publish")}
                  disabled={saving || publishing}
                  className="flex-1 rounded-full surface-panel px-4 py-3 text-sm font-semibold text-[var(--text)] disabled:opacity-60"
                >
                  {publishing ? "Publishing..." : "Publish"}
                </button>
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
                      <div>
                        <div className="font-medium">{submission.full_name}</div>
                        <div className="text-sm text-[var(--text-soft)]">{submission.email}</div>
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
