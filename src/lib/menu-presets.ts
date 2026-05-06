/**
 * Presets de design pour la carte client.
 * Chaque preset = combo cohérent {primary, accent, font, headerBg}.
 * `font` → slug qui mappe sur une CSS variable chargée par next/font dans le layout public.
 */

export type FontSlug = "modern" | "elegant" | "rustic" | "playful";

/** Map font slug → CSS variable chargée par next/font dans le root layout. */
export const FONT_CSS_VAR: Record<FontSlug, string> = {
  modern: "var(--font-menu-modern), system-ui, sans-serif",
  elegant: "var(--font-menu-elegant), Georgia, serif",
  rustic: "var(--font-menu-rustic), Georgia, serif",
  playful: "var(--font-menu-playful), Georgia, serif",
};

export type PresetSlug =
  | "elegant"
  | "bistrot"
  | "moderne"
  | "trattoria"
  | "minimal"
  | "vibrant"
  | "custom";

export type MenuPreset = {
  slug: PresetSlug;
  label: string;
  description: string;
  primary: string;
  accent: string;
  font: FontSlug;
  /** Style du header / background du menu client */
  headerStyle: "solid" | "gradient" | "soft" | "bordered";
  /** Couleur de fond global (sinon défaut crème) */
  bg?: string;
};

export const MENU_PRESETS: MenuPreset[] = [
  {
    slug: "bistrot",
    label: "Bistrot",
    description: "Vert forêt + orange brûlé. Chaleureux, traditionnel.",
    primary: "#3D5C44",
    accent: "#EE8033",
    font: "rustic",
    headerStyle: "gradient",
  },
  {
    slug: "elegant",
    label: "Élégant",
    description: "Noir profond + or. Pour la cuisine raffinée.",
    primary: "#1A1A18",
    accent: "#C9A55B",
    font: "elegant",
    headerStyle: "bordered",
    bg: "#FAF8F4",
  },
  {
    slug: "moderne",
    label: "Moderne",
    description: "Noir + vert électrique. Net, contemporain.",
    primary: "#0F0F0F",
    accent: "#00C176",
    font: "modern",
    headerStyle: "solid",
    bg: "#FFFFFF",
  },
  {
    slug: "trattoria",
    label: "Trattoria",
    description: "Rouge tomate + crème. Italie chaleureuse.",
    primary: "#B8392F",
    accent: "#E8A93C",
    font: "rustic",
    headerStyle: "soft",
    bg: "#FFF8EC",
  },
  {
    slug: "minimal",
    label: "Minimal",
    description: "Monochrome, beaucoup d'espace, sans-serif.",
    primary: "#2C2C2C",
    accent: "#9A9A9A",
    font: "modern",
    headerStyle: "solid",
    bg: "#FAFAFA",
  },
  {
    slug: "vibrant",
    label: "Vibrant",
    description: "Magenta + cyan. Pour cafés, brunchs créatifs.",
    primary: "#D6286B",
    accent: "#2BA8A0",
    font: "playful",
    headerStyle: "gradient",
  },
];

export const FONT_LABELS: Record<FontSlug, string> = {
  modern: "Moderne (Inter)",
  elegant: "Élégant (Playfair)",
  rustic: "Rustique (Lora)",
  playful: "Décontracté (DM Serif)",
};

export function getPresetBySlug(slug?: string): MenuPreset | null {
  if (!slug) return null;
  return MENU_PRESETS.find((p) => p.slug === slug) ?? null;
}
