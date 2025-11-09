export const theme = {
  colors: {
    background: "#0a0612",
    accentGlow: "#a855f7",
    highlight: "#00fff7",
    warning: "#ff006e",
    text: "#f5f5f5",
    shadow: "#1c1024",
  },
  fonts: {
    primary: "'Orbitron', 'Space Grotesk', sans-serif",
  },
  animations: {
    slow: "0.6s ease-in-out",
    medium: "0.3s ease-in-out",
    fast: "0.15s ease-in-out",
  },
} as const;

export type Theme = typeof theme;

