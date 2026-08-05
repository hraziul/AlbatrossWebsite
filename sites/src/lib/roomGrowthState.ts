/**
 * Live 0→1 scroll-growth progress for the Renovation page's spatial
 * room study — written every scroll tick by useRoomGrowthScroll's GSAP
 * ScrollTrigger, read imperatively inside NicheShaderHero_Architecture's
 * useFrame loop. Same module-scoped mutable-object pattern as
 * scrollState (useLenis.ts): the WebGL scene lives in a different React
 * tree (GlobalCanvas, mounted at the app root) than the DOM section
 * driving it (inside RenovationPage), so a plain shared object is
 * simpler than threading state through context for a value that changes
 * every frame during scroll.
 */
export const roomGrowthState = { progress: 0 };
