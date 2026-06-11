import { IdentityId } from "./theme";

export interface Identity {
  id: IdentityId;
  label: string;
  emoji: string;
  desc: string;
  trait: string;
  accent: string;
  soft: string;
  bg: string;
}

export const IDENTITIES: Identity[] = [
  {
    id: "disciplined",
    label: "The Disciplined",
    emoji: "⚔️",
    desc: "You build before the world wakes up.",
    trait: "Focus · Consistency · Standards",
    accent: "#e94560",
    soft: "rgba(233,69,96,0.1)",
    bg: "#0e0e1a",
  },
  {
    id: "wealthy",
    label: "The Wealthy",
    emoji: "♟️",
    desc: "You make decisions like money is already yours.",
    trait: "Leverage · Patience · Vision",
    accent: "#f7c948",
    soft: "rgba(247,201,72,0.1)",
    bg: "#0f0f0a",
  },
  {
    id: "creative",
    label: "The Creative",
    emoji: "🎴",
    desc: "You see what others don't even look for.",
    trait: "Curiosity · Taste · Output",
    accent: "#b06aff",
    soft: "rgba(176,106,255,0.1)",
    bg: "#0d0a1a",
  },
  {
    id: "athletic",
    label: "The Athletic",
    emoji: "🔥",
    desc: "You are the machine. Every day.",
    trait: "Intensity · Recovery · Discipline",
    accent: "#39ff14",
    soft: "rgba(57,255,20,0.1)",
    bg: "#090f09",
  },
  {
    id: "serene",
    label: "The Serene",
    emoji: "🌙",
    desc: "You are unbothered by what cannot be controlled.",
    trait: "Stillness · Clarity · Detachment",
    accent: "#7ec8e3",
    soft: "rgba(126,200,227,0.1)",
    bg: "#09101a",
  },
];

export const getIdentity = (id: IdentityId): Identity =>
  IDENTITIES.find((i) => i.id === id) ?? IDENTITIES[0];
