export type NavigationItem = {
  label: string;
  href: string;
};

export type ServiceItem = {
  title: string;
  description: string;
  points: string[];
  technologies: string[];
};

export type ReviewItem = {
  id: number;
  name: string;
  company: string;
  date: string;
  rating: number;
  text: string;
  initials: string;
};

export type TeamMember = {
  name: string;
  role: string;
  initials: string;
  skills: string[];
  bio: string;
  portfolioUrl: string;
  linkedinUrl: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type StatItem = {
  target: number;
  suffix: string;
  label: string;
};

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type SiteContent = {
  metadata: {
    title: string;
    description: string;
    canonical: string;
    ogTitle: string;
    ogDescription: string;
    siteName: string;
  };
  brand: {
    name: string;
    tagline: string;
    mark: string;
  };
  navigation: NavigationItem[];
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    badge: string;
    engineLabel: string;
    scrollHint: string;
  };
  stats: StatItem[];
  servicesSection: {
    kicker: string;
    title: string;
    lead: string;
  };
  services: ServiceItem[];
  showcaseSection: {
    kicker: string;
    title: string;
    lead: string;
    note: string;
  };
  clientNames: string[];
  projectNames: string[];
  processSection: {
    kicker: string;
    title: string;
    lead: string;
  };
  processSteps: ProcessStep[];
  teamSection: {
    kicker: string;
    title: string;
    lead: string;
  };
  team: TeamMember[];
  reviewsSection: {
    kicker: string;
    title: string;
    ctaButton: string;
    modalTitle: string;
    modalDescription: string;
  };
  reviews: ReviewItem[];
  faqSection: {
    kicker: string;
    title: string;
  };
  faqs: FaqItem[];
  contactSection: {
    kicker: string;
    title: string;
    lead: string;
    email: string;
    whatsapp: string;
    city: string;
    bookingTitle: string;
    bookingDescription: string;
    bookingButton: string;
  };
  assistant: {
    dockTitle: string;
    dockDescription: string;
    greeting: string;
    suggestions: string[];
  };
  footer: {
    description: string;
    copyright: string;
    serviceLinks: string[];
    companyLinks: string[];
  };
  offers: string[];
};

export const defaultSiteContent: SiteContent = {
  metadata: {
    title: "Nexvora - Web Design, App Development & AI Solutions Agency",
    description:
      "Nexvora is a full-service digital agency offering web design, app development, SaaS, AI integration, SEO, and cloud services.",
    canonical: "/",
    ogTitle: "Nexvora - Web Design, App Development & AI Solutions Agency",
    ogDescription:
      "Design. Development. AI. Cloud. A premium digital agency website built to convert.",
    siteName: "Nexvora",
  },
  brand: {
    name: "Nexvora",
    tagline: "Design. Build. Launch.",
    mark: "N",
  },
  navigation: [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Work", href: "#work" },
    { label: "Team", href: "#team" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    eyebrow: "Premium digital agency for design, development, AI, and cloud",
    title: "We Build Digital Products That Scale",
    description:
      "Design. Development. AI. Cloud. All under one roof, with the clarity of a product team and the polish of a luxury studio.",
    primaryCta: "Get a Free Quote",
    secondaryCta: "See Our Work",
    badge: "Nexvora Engine",
    engineLabel: "Percent",
    scrollHint: "Discover the full experience below",
  },
  stats: [
    { target: 50, suffix: "+", label: "Projects" },
    { target: 20, suffix: "+", label: "Clients" },
    { target: 5, suffix: "+", label: "Years of Experience" },
    { target: 100, suffix: "%", label: "Client Satisfaction" },
  ],
  servicesSection: {
    kicker: "Services",
    title: "A full stack of capabilities, designed to move as one.",
    lead:
      "Every service is structured to help a business launch faster, look stronger, and scale with less friction.",
  },
  services: [
    {
      title: "Web Design",
      description:
        "Conversion-focused websites built with rhythm, clarity, and performance at the center.",
      points: [
        "Brand-first layouts that make the story easy to scan.",
        "Responsive sections that stay elegant across breakpoints.",
        "Conversion-focused structure for stronger landing performance.",
      ],
      technologies: ["Next.js", "Framer Motion", "Tailwind CSS", "GSAP"],
    },
    {
      title: "App Design",
      description:
        "Intuitive mobile and desktop product experiences that feel polished from the first tap.",
      points: [
        "Clear user flows built for fast decision-making.",
        "Component systems that scale across product surfaces.",
        "High-fidelity prototypes for stakeholder alignment.",
      ],
      technologies: ["Figma", "React Native", "MUI", "Lottie"],
    },
    {
      title: "Graphic Design",
      description:
        "Brand systems, motion assets, and visual identities that stay consistent across every touchpoint.",
      points: [
        "Identity systems that stay consistent in every format.",
        "Motion-ready assets for social and presentation use.",
        "Visual language built to feel premium and memorable.",
      ],
      technologies: ["Adobe Illustrator", "After Effects", "Figma", "Canva"],
    },
    {
      title: "SaaS Solutions",
      description:
        "End-to-end SaaS design and development from MVP foundations to scale-ready product systems.",
      points: [
        "Modular product architecture for long-term growth.",
        "Dashboard and workflow design that reduces friction.",
        "Launch-ready systems with room to iterate quickly.",
      ],
      technologies: ["Next.js", "Node.js", "PostgreSQL", "Supabase"],
    },
    {
      title: "Content Creation",
      description:
        "Short-form video editing, branded content, motion graphics, and polished production workflows built to keep your story moving.",
      points: [
        "Short-form edits tailored for social-first attention spans.",
        "Branded motion treatments with consistent pacing.",
        "Production workflows for fast, repeatable content output.",
      ],
      technologies: ["Premiere Pro", "After Effects", "CapCut", "DaVinci Resolve"],
    },
    {
      title: "Product Testing",
      description:
        "Manual and automated QA, performance checks, and launch validation for confidence at delivery.",
      points: [
        "Coverage planning for critical user journeys.",
        "Regression checks that reduce release risk.",
        "Performance validation before launch windows.",
      ],
      technologies: ["Playwright", "Cypress", "Lighthouse", "Jest"],
    },
    {
      title: "AI Integration",
      description:
        "LLM workflows, automation, and intelligent assistants that reduce friction and unlock speed.",
      points: [
        "Workflow automation that removes manual overhead.",
        "Assistant-style experiences for faster user support.",
        "Integrated AI features that fit the product context.",
      ],
      technologies: ["OpenAI API", "LangChain", "Vercel AI SDK", "Pinecone"],
    },
    {
      title: "SEO Optimization",
      description:
        "Technical SEO, on-page strategy, and performance tuning that grow visibility with intent.",
      points: [
        "Technical fixes that help search bots understand the site.",
        "On-page structure for stronger ranking signals.",
        "Performance tuning that supports better discoverability.",
      ],
      technologies: ["Google Search Console", "Ahrefs", "Screaming Frog", "Schema.org"],
    },
    {
      title: "Cloud Services",
      description:
        "Cloud deployments, DevOps pipelines, and scalable infrastructure ready for growth spikes.",
      points: [
        "Deployment pipelines built for repeatable releases.",
        "Infrastructure planning that supports scaling needs.",
        "Observability and maintenance for operational confidence.",
      ],
      technologies: ["AWS", "Docker", "GitHub Actions", "Vercel"],
    },
  ],
  showcaseSection: {
    kicker: "Work",
    title: "Client logos and projects, moving in a smooth continuous loop.",
    lead:
      "This space is ideal for deep case studies, measurable results, and outcome-driven portfolio stories.",
    note:
      "Add 3 to 5 deep-dive case studies here to match top-tier agency expectations. This build is ready for them.",
  },
  clientNames: [
    "TechNova",
    "Finspire",
    "Cloudex",
    "RoamApp",
    "Medisync",
    "Buildify",
    "Launchly",
    "ZestPay",
  ],
  projectNames: [
    "Project Orion",
    "Dashboard X",
    "Shopify Migration",
    "AI Chatbot Suite",
    "Mobile Rebrand 2024",
    "Cloud Ops Revamp",
  ],
  processSection: {
    kicker: "Process",
    title: "A simple workflow with enough structure to keep momentum high.",
    lead:
      "The timeline stays transparent, so clients always know what is happening next and where the project stands.",
  },
  processSteps: [
    {
      step: "01",
      title: "Discovery & Strategy",
      description:
        "We unpack the problem, audience, market, and success metrics before any pixels move.",
    },
    {
      step: "02",
      title: "Design & Prototyping",
      description:
        "We shape the story, interface, and motion into something crisp, usable, and memorable.",
    },
    {
      step: "03",
      title: "Development & Build",
      description:
        "We translate the experience into clean, scalable code that stays fast and maintainable.",
    },
    {
      step: "04",
      title: "Testing & QA",
      description:
        "We verify behavior, polish details, and harden the release across devices and browsers.",
    },
    {
      step: "05",
      title: "Launch & Scale",
      description:
        "We deploy, measure, iterate, and keep the product ready for the next stage of growth.",
    },
  ],
  teamSection: {
    kicker: "Team",
    title: "Small team energy, senior-level execution.",
    lead:
      "These cards are ready for photos, LinkedIn links, and external portfolio URLs once your team assets are in place.",
  },
  team: [
    {
      name: "Lakshya Sehgal",
      role: "Full Stack AI Engineer",
      initials: "LS",
      skills: ["Web/Android Development", "AI-ML Integration", "DevOps"],
      bio:
        "Builds product systems, AI features, and deployment pipelines with a strong end-to-end delivery mindset.",
      portfolioUrl: "https://lakshyaps.netlify.app/",
      linkedinUrl: "https://www.linkedin.com/in/lakshyasehgal/",
    },
    {
      name: "Honey Jain",
      role: "Full Stack Developer",
      initials: "HJ",
      skills: ["MERN Stack", "Next.js", "Configurations", "Testing"],
      bio:
        "Delivers robust app experiences, clean integrations, and reliable front-to-back implementation.",
      portfolioUrl: "https://lakshyaps.netlify.app/",
      linkedinUrl: "https://www.linkedin.com/in/lakshyasehgal/",
    },
    {
      name: "Ovesh",
      role: "Content Admin",
      initials: "OV",
      skills: ["Audio Video Editing", "Graphic Designing", "Content Strategy"],
      bio:
        "Shapes content operations, sharpens visual output, and keeps media delivery organized across campaigns.",
      portfolioUrl: "https://lakshyaps.netlify.app/",
      linkedinUrl: "https://www.linkedin.com/in/lakshyasehgal/",
    },
  ],
  reviewsSection: {
    kicker: "Reviews",
    title: "Social proof that feels human.",
    ctaButton: "Add Your Review",
    modalTitle: "Tell us what working together felt like.",
    modalDescription: "A quick note about what made the experience memorable.",
  },
  reviews: [
    {
      id: 1,
      name: "Priya N.",
      company: "Finspire",
      date: "May 2026",
      rating: 5,
      text:
        "The team understood our product immediately. The design feels premium, and the launch process was very organized.",
      initials: "PN",
    },
    {
      id: 2,
      name: "Daniel K.",
      company: "Cloudex",
      date: "April 2026",
      rating: 5,
      text:
        "They cleaned up a messy experience into a clear product story. Our internal team now has a much easier time selling it.",
      initials: "DK",
    },
    {
      id: 3,
      name: "Maya R.",
      company: "RoamApp",
      date: "April 2026",
      rating: 5,
      text:
        "Sharp communication, thoughtful work, and genuinely fast delivery. They felt like an extension of our own team.",
      initials: "MR",
    },
  ],
  faqSection: {
    kicker: "FAQ",
    title: "Questions clients ask before they say yes.",
  },
  faqs: [
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
  ],
  contactSection: {
    kicker: "Contact",
    title: "Let's build something great.",
    lead:
      "The form is wired to a Next.js route so it works immediately. Add your provider later for email delivery or storage.",
    email: "hello@nexvora.com",
    whatsapp: "+1 000 000 0000",
    city: "Remote / Global",
    bookingTitle: "Book a discovery call when you are ready.",
    bookingDescription:
      "Add your Calendly link later to turn this panel into a direct booking flow for qualified leads.",
    bookingButton: "Book a Call",
  },
  assistant: {
    dockTitle: "Project chat",
    dockDescription: "Shape the brief, scope, and next steps in one place.",
    greeting:
      "Hi, I’m Studio AI. Tell me what you want to build and I’ll shape the brief, scope, and next steps.",
    suggestions: ["Luxury SaaS landing page", "AI lead qualification flow"],
  },
  footer: {
    description:
      "A modern digital agency website built to showcase services, trust, process, and AI-assisted growth.",
    copyright: "Copyright 2026 Nexvora. All rights reserved.",
    serviceLinks: ["Web Design", "App Design", "Graphic Design", "SaaS Solutions", "AI Integration"],
    companyLinks: ["About", "Team", "Careers", "Blog"],
  },
  offers: [
    "UI/UX Design & Product Experience",
    "AI Automation & Intelligent Integrations",
    "Custom SaaS Product Engineering",
    "Creative Production & Content Strategy",
    "Quality Assurance & Managed Support",
    "Cloud Infrastructure & DevOps",
  ],
};

export type SiteContentPatch = Partial<SiteContent>;

export function normalizeSiteContent(input?: Partial<SiteContent>): SiteContent {
  if (!input) {
    return defaultSiteContent;
  }

  return deepMerge(defaultSiteContent, input) as SiteContent;
}

export function buildInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function deepMerge<T>(base: T, patch: Partial<T>): T {
  if (Array.isArray(base) || Array.isArray(patch)) {
    return (patch ?? base) as T;
  }

  if (isPlainObject(base) && isPlainObject(patch)) {
    const result: Record<string, unknown> = { ...base };

    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) {
        continue;
      }

      const baseValue = (base as Record<string, unknown>)[key];
      if (isPlainObject(baseValue) && isPlainObject(value)) {
        result[key] = deepMerge(baseValue, value as never);
      } else {
        result[key] = value as unknown;
      }
    }

    return result as T;
  }

  return (patch ?? base) as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
