/**
 * CineRD — paletas y motivos editoriales originales para el archivo público.
 * Cada ID tiene una identidad gráfica propia; no reproduce afiches oficiales.
 * Los cuatro motivos premium iniciales se conservan intactos.
 */
export const PREMIUM_ORIGINAL_VARIANTS = Object.freeze({
  4: "coast",
  5: "rhythm",
  16: "city",
  56: "bloom",
});

// No inferir el tema a partir de títulos traducidos ni de sinopsis no revisadas.
// La asociación se basa exclusivamente en los IDs del catálogo versionado.
export const EDITORIAL_COVER_THEMES = Object.freeze({
  6:  { variant: "threshold", accent: "#87dded", gold: "#e9b76f", back: "#132139" },
  9:  { variant: "fortune", accent: "#72e3b2", gold: "#f9d780", back: "#10332d" },
  10: { variant: "vault", accent: "#98baff", gold: "#f2a49f", back: "#1a234c" },
  11: { variant: "christmas", accent: "#9ee3ce", gold: "#ffd2a1", back: "#12342f" },
  12: { variant: "strings", accent: "#f3a6d3", gold: "#ffe199", back: "#30213b" },
  13: { variant: "secret", accent: "#b6a5f5", gold: "#c6e5ed", back: "#171732" },
  14: { variant: "fragments", accent: "#ff9eac", gold: "#ffd28a", back: "#3d1e31" },
  15: { variant: "plate", accent: "#e5ac77", gold: "#ffe6a5", back: "#3a2032" },
  17: { variant: "schoolbook", accent: "#85e5da", gold: "#f6dcb1", back: "#153b40" },
  18: { variant: "fortune-two", accent: "#8fe7a3", gold: "#f9db7a", back: "#1a3a36" },
  19: { variant: "neighborhood", accent: "#ffc184", gold: "#f49cb1", back: "#3b2135" },
  20: { variant: "duality", accent: "#adadff", gold: "#fbe5a1", back: "#241c46" },
  21: { variant: "sisters", accent: "#f2abd4", gold: "#ffe4ae", back: "#39213f" },
  23: { variant: "coast-two", accent: "#60dcd3", gold: "#ffd27d", back: "#063b4b" },
  24: { variant: "coast-three", accent: "#67ccef", gold: "#ffc58b", back: "#13354e" },
  25: { variant: "safari", accent: "#b4df84", gold: "#f7d48e", back: "#253a27" },
  26: { variant: "daynight", accent: "#82cce8", gold: "#f6ca92", back: "#27233c" },
  27: { variant: "flight", accent: "#a6e8ff", gold: "#f2e1b1", back: "#14314b" },
  28: { variant: "lesson", accent: "#9dc3e2", gold: "#ffe0a6", back: "#203344" },
  29: { variant: "tiledoor", accent: "#f39bdc", gold: "#9ceaf5", back: "#241c39" },
  30: { variant: "nightmare", accent: "#ed888f", gold: "#f7ca91", back: "#371927" },
  31: { variant: "memorial", accent: "#d0b7a6", gold: "#eecf84", back: "#302b33" },
  32: { variant: "space", accent: "#92dafa", gold: "#fd9cd3", back: "#111a45" },
  33: { variant: "stage", accent: "#fdb279", gold: "#d4c4fc", back: "#3a2242" },
  34: { variant: "heroic", accent: "#92e5e7", gold: "#f9d07b", back: "#152d49" },
  36: { variant: "justice", accent: "#8fc2f0", gold: "#e5cc97", back: "#19304c" },
  38: { variant: "milefive", accent: "#9ed2b5", gold: "#f0bd84", back: "#1f3236" },
  39: { variant: "coffee", accent: "#f1bf86", gold: "#fff0b4", back: "#3c2a29" },
  40: { variant: "coffee-two", accent: "#d5b7ff", gold: "#f4cb89", back: "#352739" },
  41: { variant: "parents", accent: "#e1a3a8", gold: "#f8d7a1", back: "#3b2434" },
  42: { variant: "haunting", accent: "#b7cbe7", gold: "#dbd7bd", back: "#1d2437" },
  44: { variant: "baseball", accent: "#8be9bb", gold: "#ffe19d", back: "#163a32" },
  45: { variant: "campus", accent: "#85c9f2", gold: "#f0c69a", back: "#1c2d46" },
  47: { variant: "warning", accent: "#ff9e8f", gold: "#ffd4a4", back: "#391c2a" },
  48: { variant: "clockwork", accent: "#b5c1e9", gold: "#f6dc8d", back: "#252f43" },
  49: { variant: "thoughts", accent: "#c1aaff", gold: "#93e1eb", back: "#282343" },
  50: { variant: "brothers", accent: "#b3d5ff", gold: "#ffb7a7", back: "#262a46" },
  51: { variant: "podium", accent: "#8bd9b9", gold: "#f4d098", back: "#20352d" },
  52: { variant: "badges", accent: "#86dded", gold: "#f7ca86", back: "#192944" },
  53: { variant: "melody", accent: "#f1a9e3", gold: "#f7d28e", back: "#342342" },
  54: { variant: "parachutes", accent: "#a1d7f8", gold: "#f6ce8c", back: "#163450" },
  55: { variant: "blueprint", accent: "#97bcef", gold: "#f9d793", back: "#1a2f46" },
});

export const POSTER_VARIANTS = Object.freeze({
  ...PREMIUM_ORIGINAL_VARIANTS,
  ...Object.fromEntries(Object.entries(EDITORIAL_COVER_THEMES).map(([id, theme]) => [id, theme.variant])),
});

export function getCoverTheme(peliculaId) {
  return EDITORIAL_COVER_THEMES[Number(peliculaId)] || null;
}
