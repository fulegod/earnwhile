---
name: scroll-driven-frame-animation
description: Build Apple-style scroll-driven product animations using video-to-frame sequences on canvas. Use when building premium landing pages with scroll-based 3D/product animations, "exploded view" transitions, or cinematic scroll experiences.
---

# Scroll-Driven Frame Animation

Build premium scroll-driven product animations (like Apple's AirPods/MacBook/iPhone pages) using an image sequence rendered on canvas.

## When to Use

- Client wants Apple-style scroll animations
- Product pages with "exploded view" or "X-ray" transitions
- Landing pages that need cinematic scroll experiences
- Any scroll-driven animation that goes beyond CSS transforms

## The Pipeline

```
1. Generate images (Kie.ai) → image A (start) + image B (end)
2. Generate video (Kie.ai / Kling 3.0) → smooth transition A→B
3. Extract frames (ffmpeg) → WebP image sequence
4. Build scroll animation (canvas + scroll logic)
```

Estimated cost per animation: ~$0.62
- 2 images via Nano Banana 2: $0.12
- 1 video via Kling 3.0 (5 seg): $0.50
- ffmpeg + code: free

---

## Step 1: Generate Images with Kie.ai

Use the `image-generation-skill` to generate:
- **Image A:** Product in its normal state
- **Image B:** Product transformed (deconstructed, X-ray, exploded, etc.)

**Critical:** Both images MUST have the same background color as the website. Specify this in the prompt.

Example prompts:
```
Image A: "Product photo of wireless earbuds on pure black background, studio lighting, centered"
Image B: "Exploded view of wireless earbuds showing internal components on pure black background, same angle"
```

---

## Step 2: Generate Transition Video

Use Kie.ai with Kling 3.0 (image-to-video) to create a smooth transition from Image A to Image B.

**Keep the prompt simple.** Complex prompts = messy animations.

Example: "Smooth transition, the product slowly deconstructs revealing internal components"

---

## Step 3: Extract Frames with ffmpeg

```bash
# Create output directory
mkdir -p public/frames

# Extract frames as WebP (recommended: 120-200 frames)
ffmpeg -i animation.mp4 -vf "fps=30" -quality 80 public/frames/frame-%04d.webp
```

### Guidelines
| Parameter | Recommendation |
|---|---|
| Frame count | 120–200 (sweet spot) |
| Format | WebP (25-35% smaller than JPG) |
| Quality | 80 (good balance) |
| Too many frames | 500+ = too heavy to preload |
| Too few frames | <60 = choppy animation |

Example: 160 frames at 1928x1076 = ~19MB (~119KB per frame)

---

## Step 4: Build the Scroll Animation

### HTML Structure

```html
<section class="scroll-container" id="product-animation">
  <div class="sticky-wrapper">
    <canvas id="frame-canvas"></canvas>
    <!-- Content overlays -->
    <div id="phase-1" class="overlay-card">Feature description 1</div>
    <div id="phase-2" class="overlay-card">Feature description 2</div>
    <div id="phase-3" class="overlay-card">Feature description 3</div>
  </div>
</section>
```

### CSS Layout

```css
.scroll-container {
  height: 400vh; /* scroll runway — adjust for pacing */
}

.sticky-wrapper {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

#frame-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* Optional: soft-edge mask */
  mask-image: radial-gradient(ellipse 65% 60% at 52% 50%, black 40%, transparent 75%);
}

/* Content overlay cards */
.overlay-card {
  position: absolute;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.overlay-card.visible {
  opacity: 1;
  pointer-events: auto;
}
```

### JavaScript — Preload Frames (Batched)

```js
const TOTAL_FRAMES = 160;
const BATCH_SIZE = 20;
const frames = [];

async function loadFrame(index) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { frames[index] = img; resolve(); };
    img.onerror = reject;
    img.src = `/frames/frame-${String(index + 1).padStart(4, '0')}.webp`;
  });
}

async function preloadAllFrames(onProgress) {
  for (let i = 0; i < TOTAL_FRAMES; i += BATCH_SIZE) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL_FRAMES); j++) {
      batch.push(loadFrame(j));
    }
    await Promise.all(batch);
    if (onProgress) onProgress(Math.min(i + BATCH_SIZE, TOTAL_FRAMES), TOTAL_FRAMES);
  }
}
```

### JavaScript — Scroll + Render (SEPARATED)

```js
const canvas = document.getElementById('frame-canvas');
const ctx = canvas.getContext('2d');
let currentFrame = 0;
let drawnFrame = -1;

// Set canvas dimensions to match frames
canvas.width = frames[0].naturalWidth;
canvas.height = frames[0].naturalHeight;

// SCROLL HANDLER — only calculates frame index, never draws
function getScrollProgress() {
  const container = document.querySelector('.scroll-container');
  const rect = container.getBoundingClientRect();
  return Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
}

window.addEventListener('scroll', () => {
  const progress = getScrollProgress();
  currentFrame = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1);
}, { passive: true });

// RENDER LOOP — only draws when frame changes
function tick() {
  if (currentFrame !== drawnFrame && frames[currentFrame]) {
    ctx.drawImage(frames[currentFrame], 0, 0, canvas.width, canvas.height);
    drawnFrame = currentFrame;
  }
  requestAnimationFrame(tick);
}
tick();
```

### JavaScript — Content Overlays

```js
const phases = [
  { el: document.getElementById('phase-1'), start: 0.08, end: 0.24 },
  { el: document.getElementById('phase-2'), start: 0.28, end: 0.46 },
  { el: document.getElementById('phase-3'), start: 0.50, end: 0.68 },
];

// Inside scroll handler, add:
window.addEventListener('scroll', () => {
  const progress = getScrollProgress();

  for (const phase of phases) {
    if (progress >= phase.start && progress <= phase.end) {
      phase.el.classList.add('visible');
    } else {
      phase.el.classList.remove('visible');
    }
  }
}, { passive: true });
```

---

## Critical Rules

| Decision | Do This | NOT This |
|---|---|---|
| Image format | WebP | JPG/PNG |
| Playback element | `<canvas>` | `<video>` (can't scrub accurately) |
| Frame loading | Batched preload, all upfront | Lazy load on scroll |
| Scroll handling | `{ passive: true }`, set state only | Draw inside scroll handler |
| Rendering | Separate `requestAnimationFrame` loop | Draw in scroll event |
| Layout | `position: sticky` + tall container | JS-driven positioning |
| Content timing | Scroll-position ranges | setTimeout / CSS animations |
| Frame count | 120–200 frames | 500+ (too heavy) or <60 (choppy) |
| Background | Match website background color | Transparent or mismatched |

---

## Polish Details

**Subtle rotation on scroll** — adds 3D feel to 2D sequence:
```js
const rotation = -4 + progress * 12; // sweeps -4deg to +8deg
canvas.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
```

**Scroll progress bar:**
```css
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--accent-color);
  z-index: 100;
  transition: width 0.1s linear;
}
```

**Glassmorphic overlay cards:**
```css
.overlay-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}
```

---

## Loading Screen

Always show a loading screen while frames preload:

```js
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-progress');

await preloadAllFrames((loaded, total) => {
  const pct = Math.round((loaded / total) * 100);
  loaderText.textContent = `${pct}%`;
});

// Draw first frame and remove loader
ctx.drawImage(frames[0], 0, 0, canvas.width, canvas.height);
drawnFrame = 0;
loader.style.opacity = '0';
setTimeout(() => loader.remove(), 500);
```

---

## Pacing Guide

| Container height | Feel | Use for |
|---|---|---|
| 300vh | Fast, punchy | Short product reveals |
| 400vh | Balanced | Standard product animations |
| 500vh+ | Slow, cinematic | Detailed storytelling with many overlay cards |

Adjust `height` of `.scroll-container` to control how fast the animation plays relative to scroll distance.
