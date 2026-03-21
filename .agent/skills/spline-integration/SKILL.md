---
name: spline-3d-integration
description: "Use when adding interactive 3D scenes from Spline.design to web projects. Default: Next.js. Covers embedding methods (Next.js, React, vanilla JS), the @splinetool/ runtime API for programmatic control (events, variables, animations, camera), performance optimization, mobile fallbacks, and common integration problems like scroll hijacking, layout shift, GPU fallbacks, and watermark removal."
---

# Spline 3D Integration Skill

Master guide for embedding interactive 3D scenes from [Spline.design](https://spline.design) into web projects.

**Default: Next.js.** Usar vanilla HTML solo para prototipos rápidos o tests de escena.

---

## Quick Reference

| Task | Guide |
|---|---|
| **Next.js / React embed (default)** | [guides/REACT_INTEGRATION.md](guides/REACT_INTEGRATION.md) |
| Performance & mobile optimization | [guides/PERFORMANCE.md](guides/PERFORMANCE.md) |
| Debugging & common problems | [guides/COMMON_PROBLEMS.md](guides/COMMON_PROBLEMS.md) |
| Vanilla HTML/JS (solo prototipos) | [guides/VANILLA_INTEGRATION.md](guides/VANILLA_INTEGRATION.md) |

## Working Examples

| File | What it shows |
|---|---|
| [examples/react-spline-wrapper.tsx](examples/react-spline-wrapper.tsx) | **Production-ready** lazy-loaded React/Next.js wrapper with fallback |
| [examples/interactive-scene.tsx](examples/interactive-scene.tsx) | Full interactive example: events, object control, camera |
| [examples/vanilla-embed.html](examples/vanilla-embed.html) | Minimal vanilla JS embed (solo prototipos) |

---

## What Is Spline?

Spline is a browser-based 3D design tool — think Figma, but for 3D. Designers create interactive 3D scenes (objects, materials, animations, physics, events) in the Spline editor, then export them for the web via a hosted `.splinecode` file URL.

---

## STEP 1 — Identify the Stack

Before writing any code, check the existing project files to determine the framework.

| Stack | Method | Recomendación |
|---|---|---|
| **Next.js** | `@splinetool/react-spline/next` | ✅ **Default — usar siempre que sea posible** |
| React / Vite | `@splinetool/react-spline` | ✅ Buena alternativa |
| Vue | `@splinetool/vue-spline` | Aceptable |
| Vanilla HTML/JS | `<spline-viewer>` web component OR `@splinetool/runtime` | ⚠️ Solo prototipos rápidos |
| iframe (Webflow, Notion, etc.) | Public URL iframe | Último recurso |

### ¿Por qué Next.js como default?

- **SSR/SSG** → SEO real desde el día 1
- **`@splinetool/react-spline/next`** → integración nativa con lazy loading y SSR
- **Routing, API routes, middleware** → el proyecto puede crecer sin reescribir
- **Deploy trivial** → Vercel con un push (ver skill `publish-github-vercel`)
- **Stack consistente** → alineado con el tech stack definido en brand-identity

### ¿Cuándo SÍ usar vanilla HTML?

- Test rápido de una escena Spline (< 5 min, sin deploy)
- Embed en plataforma que no soporta frameworks (Webflow, Notion)
- Microsite de 1 página sin SEO ni crecimiento previsto

---

## STEP 2 — Get the Scene URL

The user must go to their Spline editor → **Export** → **Code Export** → copy the `prod.spline.design` URL:

```
https://prod.spline.design/XXXXXXXXXXXXXXXX/scene.splinecode
```

**Before copying the URL, tell the user to check Play Settings:**
- ✅ Toggle **Hide Background** ON if the site has a dark or custom background
- ✅ Toggle **Hide Spline Logo** ON if they have a paid plan
- ✅ Set **Geometry Quality** to Performance for faster load
- ✅ Disable **Page Scroll**, **Zoom**, **Pan** if those aren't needed (reduces hijacking risk)
- ✅ Click **Generate Draft** or **Promote to Production** after any settings change — the URL does NOT auto-update

---

## STEP 3 — Read the Relevant Guide

Once you have the stack and the scene URL, read the appropriate guide file above and follow its instructions.

**Para Next.js (default):** lee `REACT_INTEGRATION.md` → sección "Next.js". Usa el import `/next` y `dynamic()` si hay errores de hidratación.

Always read COMMON_PROBLEMS.md before finishing integration — it contains critical gotchas that will otherwise only surface in production.
