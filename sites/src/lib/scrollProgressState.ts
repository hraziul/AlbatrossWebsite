/**
 * Live 0→1 scroll offset for RenovationPage's ScrollControls, published
 * every frame by ScrollProgressPublisher (inside the Canvas) and read by
 * plain-DOM components outside the Canvas (e.g. the vertical progress
 * tracker) — mirrors the scrollState/roomGrowthState module pattern used
 * elsewhere: useScroll() itself only works inside the r3f render tree, so
 * a shared mutable object is the bridge for content that lives outside it.
 */
export const scrollProgressState = { offset: 0 };
