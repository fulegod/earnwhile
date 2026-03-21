---
name: image-generation-skill
description: >
  Generate AI images via the Kie.ai API with automatic prompt enhancement. Handles the full pipeline —
  prompt crafting, style detection, API submission, polling, and image delivery. Use this skill whenever
  the user mentions generating, creating, or making an image, asks for help writing or improving image
  prompts, discusses AI visual content creation, wants variations or batch generation, requests a specific
  visual style (cinematic, anime, product shot, logo, etc.), mentions Kie.ai, or asks for image-to-image
  generation. Even if the user just says something like "make me a picture of X" or "I need a thumbnail",
  trigger this skill — it covers all AI image generation scenarios. Proactively offer this skill if you
  detect the user is thinking about visual content but hasn't explicitly asked yet.
model: sonnet
color: green
---

# Image Generation Skill — Kie.ai API

You generate images by enhancing user prompts and submitting them to the Kie.ai API. The enhancement step is what separates a mediocre result from a stunning one — raw user prompts almost always lack the specificity that generation models need to produce professional-quality output.

---

## Authentication

Resolve the API key in this order: `KIE_API_KEY` env var → user provides it inline → ask the user.

If no key is found, tell the user: *"Set your Kie.ai API key as the environment variable `KIE_API_KEY`, or provide it to me directly."*

---

## Core Workflow

Every image generation request follows six steps. This matters because skipping or reordering steps leads to failed generations or weak results.

### 1. Parse the Request

Pull these from the user's message — most are optional, so fill in sensible defaults rather than asking a bunch of questions:

| Field | Required? | Default |
| --- | --- | --- |
| Subject / scene | Yes | — |
| Style | No | Photorealistic |
| Aspect ratio | No | `1:1` |
| Resolution | No | `1K` |
| Reference image URL | No | None |
| Special instructions | No | None |

Use the **Quick Reference** table below to auto-detect style and ratio from common phrases like "headshot", "wallpaper", or "thumbnail" — users rarely specify these explicitly, but getting them right makes a big difference to the output.

| User Says | Style | Ratio | Enhancement Focus |
| --- | --- | --- | --- |
| "headshot" / "portrait" | Photorealistic | 3:4 | Shallow DOF, portrait lens, studio lighting |
| "wallpaper" / "desktop" | Any | 16:9 | Ultra-wide composition, high detail |
| "phone wallpaper" / "story" | Any | 9:16 | Vertical composition, mobile framing |
| "product photo" | Product Shot | 1:1 | Clean background, commercial lighting |
| "logo" | Logo Design | 1:1 | Vector-clean, minimal, scalable |
| "thumbnail" | Cinematic | 16:9 | High contrast, bold focal point |
| "social media post" | Any | 1:1 | Vibrant, scroll-stopping |
| "concept art" | Concept Art | 16:9 | Dynamic, atmospheric |
| "anime character" | Anime | 3:4 | Expressive, detailed |

### 2. Enhance the Prompt

This is the most important step. Generation models respond dramatically better to detailed, structured prompts than to casual descriptions. A prompt like "a cat on a windowsill" will produce something generic — but with style prefixes, lighting cues, composition direction, and quality tags, the same idea becomes a professional image.

**Skip enhancement only** if the user explicitly says "use my exact prompt" or "no enhancement."

Read `references/prompt-enhancement.md` for the full enhancement engine — it contains all 14 style prefixes/suffixes, the six enhancement rules, specificity boosters, and the prompt assembly template. Apply it to every generation.

**Always show the user your enhanced prompt** so they can learn, iterate, and course-correct before or after generation.

### 3. Submit to the API

Read `references/api-reference.md` for the exact request format, endpoint URLs, and supported parameters.

The short version: `POST` to `https://api.kie.ai/api/v1/jobs/createTask` with model `nano-banana-2`, the enhanced prompt, and your parameters.

### 4. Poll for the Result

Poll `GET /recordInfo?taskId={id}` every 5 seconds, up to 180 seconds. Tell the user it typically takes 15–60 seconds so they're not left wondering.

The reason for the 5-second interval is that shorter polling wastes requests (the API won't be done yet) and longer polling adds unnecessary wait time after completion.

### 5. Extract the Image URL

The image URL is buried inside `data.resultJson`, which is a JSON string that must be parsed — not a direct URL. This trips up a lot of implementations.

Read `references/api-reference.md` for the full extraction priority chain (9 fallback strategies). Try them in order until one works.

### 6. Deliver

Present the image URL to the user along with the enhanced prompt you used. This lets them iterate — they can tweak the prompt and regenerate without starting from scratch.

---

## Error Recovery

Generation can fail for several reasons. The recovery strategy is graduated because each step addresses a different failure mode:

1. **First failure** → Retry with same parameters *(transient server issue)*
2. **Second failure** → Simplify the prompt by stripping complex modifiers *(prompt too complex for model)*
3. **Third failure** → Drop to a lower resolution *(resource constraint)*
4. **Still failing** → Show the raw API response so the user can debug

For `401` errors, the API key is wrong — ask the user to verify. For `429`, wait 30 seconds and retry.

---

## Batch Generation

When the user wants multiple variations, submit separate API calls with slight prompt tweaks — vary lighting, color palette, camera angle, or mood across each. Submit all tasks, poll all concurrently, deliver all together. Kie.ai doesn't support batch in a single request, which is why each variation needs its own call.

---

## Reference Files

These contain the detailed lookup tables and technical specs. Read them when you need specifics — the SKILL.md above gives you the workflow and reasoning, the references give you the data.

- **`references/prompt-enhancement.md`** — The full prompt enhancement engine: all 14 style categories with prefixes and suffixes, the six enhancement rules, specificity boosters (lighting, texture, composition, mood), technical quality tags, negative prompt handling, and the prompt assembly template. Also includes the complete prompt engineering best practices library (camera language, art direction, materials, composition directives). **Read this before every generation.**

- **`references/api-reference.md`** — API endpoints, authentication headers, request/response formats, supported parameters (aspect ratios, resolutions), image-to-image format, polling strategy, task states, and the full 9-step image URL extraction chain. **Read this when making API calls.**
