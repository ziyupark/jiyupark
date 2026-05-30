export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  tags: string[];
  summary: string;
  description: string;
  role: string;
  tools: string[];
  color: string;
};

export const projects: Project[] = [
  {
    slug: "bloom-app",
    title: "Bloom",
    category: "Product Design",
    year: "2024",
    tags: ["Mobile", "UX/UI", "Branding"],
    summary: "A wellness app redesign focused on mental clarity and daily rituals.",
    description:
      "Bloom is a wellness mobile application that helps users build intentional daily habits. The redesign focused on reducing cognitive load, introducing a calm visual language, and improving the onboarding flow. User retention improved by 38% after launch.",
    role: "Lead Product Designer",
    tools: ["Figma", "Principle", "Maze"],
    color: "#f0dde2",
  },
  {
    slug: "nova-identity",
    title: "Nova Identity",
    category: "Brand Design",
    year: "2024",
    tags: ["Branding", "Visual Identity", "Motion"],
    summary: "Complete visual identity for a fintech startup entering the European market.",
    description:
      "Nova needed a brand that felt trustworthy yet forward-thinking. The identity system centers on a geometric mark that morphs across applications — from app icon to environmental signage. A restrained palette of navy and warm gold communicates stability and ambition.",
    role: "Brand Designer",
    tools: ["Figma", "Illustrator", "After Effects"],
    color: "#e8e8f5",
  },
  {
    slug: "grid-magazine",
    title: "Grid Magazine",
    category: "Editorial Design",
    year: "2023",
    tags: ["Print", "Editorial", "Typography"],
    summary: "Art direction and layout design for an independent design culture magazine.",
    description:
      "Grid is a quarterly print magazine exploring the intersection of design, culture, and technology. As art director, I established the typographic system, grid structure, and visual hierarchy that carries across each 120-page issue. Each edition features a unique cover concept.",
    role: "Art Director",
    tools: ["InDesign", "Illustrator", "Photoshop"],
    color: "#e8f0e8",
  },
  {
    slug: "lumio-dashboard",
    title: "Lumio Dashboard",
    category: "Product Design",
    year: "2023",
    tags: ["Web", "Data Viz", "UX/UI"],
    summary: "Analytics dashboard for a SaaS platform serving 50k+ users.",
    description:
      "Lumio's existing dashboard was data-dense but difficult to parse. The redesign introduced progressive disclosure, customizable widgets, and a dark mode that reduced eye strain for users working long sessions. Conducted 12 usability tests over 3 rounds of iteration.",
    role: "Senior Product Designer",
    tools: ["Figma", "Storybook", "Hotjar"],
    color: "#fdf3e7",
  },
  {
    slug: "type-specimen",
    title: "Type Specimen",
    category: "Typography",
    year: "2023",
    tags: ["Typography", "Print", "Concept"],
    summary: "A conceptual type specimen booklet exploring negative space in letterforms.",
    description:
      "A personal project examining how negative space defines character in type design. The booklet pairs 12 typefaces with original essays and experimental layouts, printed in two-color risograph.",
    role: "Designer",
    tools: ["InDesign", "Illustrator"],
    color: "#f5f0e8",
  },
  {
    slug: "ark-website",
    title: "Ark Website",
    category: "Web Design",
    year: "2022",
    tags: ["Web", "Creative Direction", "Motion"],
    summary: "Immersive website for an architecture studio in Seoul.",
    description:
      "Ark Studio needed a digital presence that matched the spatial quality of their physical work. The site uses scroll-driven transitions, large-format photography, and minimal text to guide visitors through the studio's portfolio. Built in close collaboration with a frontend developer.",
    role: "Web Designer",
    tools: ["Figma", "Framer", "After Effects"],
    color: "#e8edf0",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
