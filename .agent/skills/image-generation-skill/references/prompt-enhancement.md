# Prompt Enhancement Engine — Full Reference

## Table of Contents

1. [Style Categories](#style-categories)
2. [Enhancement Rules](#enhancement-rules)
3. [Prompt Assembly Template](#prompt-assembly-template)
4. [Enhancement Example](#enhancement-example)
5. [Prompt Engineering Best Practices](#prompt-engineering-best-practices)

---

## Style Categories

Detect the user's intended style and apply the corresponding prefix and quality suffix. If they don't specify, default to **Photorealistic**.

| Style | Prefix | Quality Suffix |
| --- | --- | --- |
| **Photorealistic** | "A photorealistic" | "Captured with professional camera equipment, natural lighting, sharp details, high dynamic range." |
| **Cinematic** | "A cinematic film still of" | "Dramatic lighting, shallow depth of field, anamorphic lens flare, color graded in teal and orange." |
| **Illustration** | "A beautiful illustration of" | "Digital art style, vibrant colors, clean lines, professional quality illustration." |
| **3D Render** | "A high-quality 3D render of" | "Studio lighting, PBR materials, octane render quality, smooth surfaces, ambient occlusion." |
| **Anime** | "An anime-style illustration of" | "Studio Ghibli inspired, soft colors, detailed backgrounds, expressive characters." |
| **Watercolor** | "A watercolor painting of" | "Soft washes of color, visible brush strokes, paper texture, artistic imperfections, dreamy quality." |
| **Product Shot** | "A professional product photography shot of" | "White or minimal background, studio lighting, sharp focus, commercial quality, clean composition." |
| **Logo Design** | "A modern, minimalist logo design for" | "Clean vectors, balanced composition, scalable design, professional branding quality." |
| **Oil Painting** | "An oil painting of" | "Rich impasto texture, visible brushwork, classical composition, museum-quality finish, chiaroscuro lighting." |
| **Pixel Art** | "Pixel art of" | "16-bit retro style, clean pixel edges, limited color palette, nostalgic video game aesthetic." |
| **Concept Art** | "Professional concept art of" | "Industry-standard quality, dynamic composition, atmospheric perspective, matte painting techniques." |
| **Fashion** | "A high-fashion editorial photograph of" | "Vogue-quality styling, dramatic editorial lighting, fashion-forward composition, haute couture aesthetic." |
| **Architecture** | "An architectural visualization of" | "Photorealistic rendering, accurate materials, environmental context, golden hour lighting, professional visualization quality." |
| **Abstract** | "An abstract composition of" | "Bold geometric forms, dynamic color relationships, textural contrast, gallery-quality contemporary art." |

---

## Enhancement Rules

Apply these in order to every prompt (unless the user opts out).

### Rule 1 — Smart Prefix Injection

Only prepend the style prefix if the user's prompt does NOT already start with "A ", "An ", or "The ". This avoids awkward double-starters like "A photorealistic A cat sitting…"

### Rule 2 — Quality Suffix

Always append the style's quality suffix after the user's core description. This gives the model concrete quality targets to aim for.

### Rule 3 — Aspect Ratio Context

Append `"Image should be in {ratio} aspect ratio format."` to help the model compose for the target frame. Without this, the model may compose for a square even when generating a widescreen image.

### Rule 4 — Specificity Boosters

Apply when the prompt is vague or under ~15 words. Short prompts leave too much to chance.

- **Lighting** → "golden hour lighting", "soft diffused light", "dramatic rim lighting", "studio three-point lighting"
- **Material / Texture** → "smooth glass surface", "rough linen texture", "brushed metal finish"
- **Composition** → "rule of thirds composition", "centered symmetrical framing", "leading lines"
- **Atmosphere / Mood** → "moody and atmospheric", "bright and cheerful", "dark and mysterious"

### Rule 5 — Negative Prompt Awareness

If the user mentions things to avoid, weave them naturally into the prompt as "without {thing}" rather than using a separate negative prompt field. Kie.ai handles negation inline.

### Rule 6 — Technical Quality Tags

Always include at least 2–3 of these. They act as quality floor-raisers that consistently improve output:

- "8K resolution", "ultra-detailed", "masterpiece quality"
- "professional photography", "award-winning"
- "highly detailed", "sharp focus", "intricate details"

---

## Prompt Assembly Template

```
{Style Prefix} {User's Core Description}. {Quality Suffix} {Specificity Boosters} {Aspect Ratio Context} {Technical Quality Tags}
```

---

## Enhancement Example

| | |
| --- | --- |
| **User says** | "a cat sitting on a windowsill" |
| **Detected style** | Photorealistic (default) |
| **Enhanced prompt** | "A photorealistic scene of a cat sitting on a windowsill, warm afternoon sunlight streaming through the glass casting soft shadows. Captured with professional camera equipment, natural lighting, sharp details, high dynamic range. Shallow depth of field, 85mm portrait lens quality, cozy interior atmosphere. Image should be in 1:1 aspect ratio format. Ultra-detailed, 8K resolution." |

---

## Prompt Engineering Best Practices

Share these techniques when helping users write better prompts.

### Specificity Over Vagueness

- **Weak**: "a warrior"
- **Strong**: "a battle-scarred female warrior in ornate elven plate armor, etched with silver leaf patterns, standing on a rain-soaked battlefield at dusk"

The model needs concrete visual details to latch onto. Vague prompts produce generic results because the model fills in the blanks with its most common associations.

### Camera & Photography Language

These terms map directly to visual qualities the model understands:

**Lens types** → "shot with 85mm f/1.4 lens", "wide-angle 24mm perspective", "macro close-up"

**Camera angles** → "bird's eye view", "low-angle hero shot", "Dutch angle", "eye-level portrait"

**Lighting** → "golden hour backlighting", "studio rim light", "Rembrandt lighting", "neon-lit"

**Depth of field** → "shallow depth of field with bokeh", "deep focus landscape", "tilt-shift miniature effect"

### Art Direction Language

**Art movements** → "Art Nouveau", "Bauhaus geometric", "Impressionist", "Surrealist"

**Color palettes** → "muted earth tones", "vibrant neon palette", "monochromatic blue", "warm autumn colors"

**Mood** → "ethereal and dreamlike", "gritty and urban", "serene and peaceful", "intense and dramatic"

### Material & Texture Cues

- "rough linen texture", "smooth glass surface", "weathered wooden planks"
- "brushed metal finish", "soft velvet fabric", "cracked dried earth"
- "translucent crystal", "matte ceramic", "polished marble"

### Composition Directives

- "rule of thirds placement", "golden ratio spiral", "centered symmetry"
- "negative space emphasis", "leading lines toward subject", "frame within a frame"
- "foreground-midground-background layering", "diagonal dynamic composition"
