/* Couleurs des graphiques (Recharts n'accepte pas var(--x) de façon fiable sur les attributs SVG). */
const CLAIR = { serie: ["#2F5BEA", "#12A36B", "#F5A524", "#7C4DEB", "#8C9BC4", "#E5484D"], texte: "#6B7799", grille: "#E4E8F3", surface: "#FFFFFF" };
const SOMBRE = { serie: ["#6C8CFF", "#34C38F", "#F5A524", "#A08BFF", "#8C98BE", "#FF6B70"], texte: "#8C98BE", grille: "#222D54", surface: "#121A36" };
export const getPalette = (theme) => (theme === "dark" ? SOMBRE : CLAIR);
