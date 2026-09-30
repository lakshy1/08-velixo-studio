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

export type HomepageSectionId =
  | "hero"
  | "stats"
  | "services"
  | "showcase"
  | "process"
  | "team"
  | "reviews"
  | "contact"
  | "faqs"
  | "footer";

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
    titleAccent: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    badge: string;
    engineLabel: string;
    scrollHint: string;
    highlights: string[];
    trustLabel: string;
    dashboard: {
      projectName: string;
      panelTitle: string;
      panelSubtitle: string;
      progressLabel: string;
      progressValue: number;
      teamLabel: string;
      teamCount: number;
      timelineLabel: string;
      timelineStatus: string;
      chartValues: number[];
      chartMonths: string[];
      activityLabel: string;
      activity: { label: string; time: string }[];
      uptimeValue: string;
      uptimeLabel: string;
      badgeTitle: string;
      badgeSubtitle: string;
    };
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
  homepageOrder: HomepageSectionId[];
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
    title: "We Build Digital",
    titleAccent: "Products That Scale",
    description:
      "Design. Development. AI. Cloud. All under one roof, with the clarity of a product team and the polish of a luxury studio.",
    primaryCta: "Get a Free Quote",
    secondaryCta: "See Our Work",
    badge: "Nexvora Engine",
    engineLabel: "Percent",
    scrollHint: "Discover the full experience below",
    highlights: ["Modern Tech Stack", "Scalable Architecture", "AI-Powered Solutions", "Cloud Native"],
    trustLabel: "Trusted by teams like yours",
    dashboard: {
      projectName: "Project Nexvora",
      panelTitle: "Product Development",
      panelSubtitle: "Building the next generation",
      progressLabel: "Progress",
      progressValue: 72,
      teamLabel: "Team",
      teamCount: 12,
      timelineLabel: "Timeline",
      timelineStatus: "On Track",
      chartValues: [30, 45, 38, 60, 72, 90],
      chartMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      activityLabel: "Recent Activity",
      activity: [
        { label: "UI/UX designs approved", time: "2h ago" },
        { label: "API integration completed", time: "5h ago" },
        { label: "Sprint review meeting", time: "1d ago" },
        { label: "Deployment to staging", time: "1d ago" },
      ],
      uptimeValue: "99.9%",
      uptimeLabel: "Uptime",
      badgeTitle: "AI-Powered Workflows",
      badgeSubtitle: "Smarter. Faster. Better.",
    },
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
    title: "Products we’ve designed, built and shipped.",
    lead:
      "From pharma CRMs to edtech platforms to cloud migration tooling, here is a look at the products we have shipped.",
    note:
      "A running list of client work, updated as new projects launch.",
  },
  clientNames: [
    "Aconic Technologies",
    "Kanthast",
    "Soul Pharma",
    "Learning Tree",
    "JD Group",
    "Cloud Duty",
    "EV Connect",
    "Vastra Villa",
    "Broomin",
    "JY RAM Auto",
    "Buzzroster",
  ],
  projectNames: [
    "EVConnect PWA",
    "Cloud Migration Tools — Aconic",
    "Kanthast Edtech Platform",
    "Pharma CRM — Soul Pharma",
    "Coaching Centre Digital Marketing & Web Design — Learning Tree",
    "Agri Export Web & SEO — JD Group",
    "Digital Transformation — JY RAM Auto",
    "Social Media Platform — Cloud Duty",
    "US Hiring App — Cloud Duty",
    "Social Media Influencer Management — Buzzroster",
    "Ecommerce Web App — Vastra Villa",
    "Digital Transformation — Broomin",
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
      "The people who scope, design and ship your product. You work with us directly, from the first call to launch day.",
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
      name: "Sharukh Pathan",
      role: "Full Stack Developer",
      initials: "SP",
      skills: ["MERN Stack", "Next.js", "Configurations", "Testing"],
      bio:
        "Delivers robust app experiences, clean integrations, and reliable front-to-back implementation.",
      portfolioUrl: "#contact",
      linkedinUrl: "https://www.linkedin.com/in/pathansharukh/",
    },
    {
      name: "Honey Jain",
      role: "UI/UX Designer",
      initials: "HJ",
      skills: ["MERN Stack", "Next.js", "Configurations", "Testing"],
      bio:
        "Delivers robust app experiences, clean integrations, and reliable front-to-back implementation.",
      portfolioUrl: "https://workstation-showcase.vercel.app",
      linkedinUrl: "#contact",
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
      name: "Jatin",
      company: "Soul Pharma",
      date: "March 2026",
      rating: 5,
      text:
        "Our pharma CRM needed to handle compliance-heavy workflows without slowing our field team down. The build was precise, and support after launch has been just as sharp.",
      initials: "J",
    },
    {
      id: 2,
      name: "Deepti",
      company: "Learning Tree",
      date: "February 2026",
      rating: 5,
      text:
        "They rebuilt our coaching centre's web presence and ran our digital marketing in the same breath. Enquiries picked up within weeks of launch.",
      initials: "D",
    },
    {
      id: 3,
      name: "Amit",
      company: "Aconic Technologies",
      date: "January 2026",
      rating: 5,
      text:
        "The cloud migration tooling they built saved our team hours of manual work every week. Clear communication through a fairly technical project.",
      initials: "A",
    },
    {
      id: 4,
      name: "Anup",
      company: "Vastra Villa",
      date: "December 2025",
      rating: 5,
      text:
        "Our ecommerce build came out fast, clean, and easy for our own team to manage. Exactly what we needed to start selling online properly.",
      initials: "A",
    },
    {
      id: 5,
      name: "Amit",
      company: "EV Connect",
      date: "November 2025",
      rating: 5,
      text:
        "The EVConnect PWA works smoothly across devices and feels like a native app without the App Store overhead. Great technical judgment throughout.",
      initials: "A",
    },
    {
      id: 6,
      name: "Harish",
      company: "JY RAM Auto",
      date: "November 2025",
      rating: 5,
      text:
        "They guided our full digital transformation, not just a website. Patient with our team while we adjusted to new systems.",
      initials: "H",
    },
    {
      id: 7,
      name: "Kunal",
      company: "Kanthast",
      date: "October 2025",
      rating: 5,
      text:
        "Our edtech platform needed to work for both instructors and students without friction. They nailed the balance and kept iterating after launch.",
      initials: "K",
    },
    {
      id: 8,
      name: "Jayesh",
      company: "Broomin",
      date: "October 2025",
      rating: 5,
      text:
        "Solid digital transformation work end to end. They took time to understand how we actually operate before proposing changes.",
      initials: "J",
    },
    {
      id: 9,
      name: "Pankaj Michael",
      company: "Cloud Duty",
      date: "September 2025",
      rating: 5,
      text:
        "Two very different builds for us — a social platform and a US hiring app — and both were handled with the same level of care and speed.",
      initials: "PM",
    },
    {
      id: 10,
      name: "Siddhesh",
      company: "JD Group",
      date: "September 2025",
      rating: 5,
      text:
        "Our agri export business needed real visibility online. The new site and SEO work brought in enquiries we simply weren't getting before.",
      initials: "S",
    },
    {
      id: 11,
      name: "Tanmay",
      company: "Buzzroster",
      date: "August 2025",
      rating: 5,
      text:
        "Managing influencer campaigns was chaos before this platform. Now our whole team works off one system, and it just works.",
      initials: "T",
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
      "Tell us what you’re building. We reply within one business day with next steps, a rough timeline and a budget range.",
    email: "hello@nexvora.com",
    whatsapp: "+91 92702 83086",
    city: "Remote / Global",
    bookingTitle: "Book a discovery call when you are ready.",
    bookingDescription:
      "Prefer to talk it through? Send a short note with the form and we’ll share a time for a 30-minute call.",
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
      "Design, development, AI and cloud for teams that want a product partner, not just a vendor.",
    copyright: "Copyright 2026 Nexvora. All rights reserved.",
    serviceLinks: ["Web Design", "App Design", "Graphic Design", "SaaS Solutions", "AI Integration"],
    companyLinks: ["Team"],
  },
  offers: [
    "UI/UX Design & Product Experience",
    "AI Automation & Intelligent Integrations",
    "Custom SaaS Product Engineering",
    "Creative Production & Content Strategy",
    "Quality Assurance & Managed Support",
    "Cloud Infrastructure & DevOps",
  ],
  homepageOrder: [
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
      if (value === undefined || value === null) {
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
