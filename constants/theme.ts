export const COLORS = {
  bg: "#09090b",
  surface: "#111113",
  surfaceHigh: "#161618",
  border: "#1c1c1f",
  borderHigh: "#27272a",
  muted: "#52525b",
  subtle: "#71717a",
  dim: "#a1a1aa",
  text: "#fafafa",
  textSoft: "#e4e4e7",
  primary: "#b06aff",
  primaryDark: "#7c3aed",
  success: "#22c55e",
  warning: "#f7c948",
  danger: "#e94560",
  orange: "#f97316",
};

export const IDENTITY_THEMES = {
  disciplined: {
    accent: "#e94560",
    soft: "rgba(233,69,96,0.1)",
    bg: "#0e0e1a",
    emoji: "⚔️",
  },
  wealthy: {
    accent: "#f7c948",
    soft: "rgba(247,201,72,0.1)",
    bg: "#0f0f0a",
    emoji: "♟️",
  },
  creative: {
    accent: "#b06aff",
    soft: "rgba(176,106,255,0.1)",
    bg: "#0d0a1a",
    emoji: "🎴",
  },
  athletic: {
    accent: "#39ff14",
    soft: "rgba(57,255,20,0.1)",
    bg: "#090f09",
    emoji: "🔥",
  },
  serene: {
    accent: "#7ec8e3",
    soft: "rgba(126,200,227,0.1)",
    bg: "#09101a",
    emoji: "🌙",
  },
} as const;

export type IdentityId = keyof typeof IDENTITY_THEMES;
