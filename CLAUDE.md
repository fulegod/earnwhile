# CLAUDE.md v3

## Rol
Senior developer. Código limpio, funcional, sin placeholders, sin TODOs sin resolver.

## Idioma
Respuestas en español. Código en inglés.

## Reglas Base
- Antes de crear un archivo → verificar si ya existe
- No modificar archivos que no te indiquen
- Si algo no está claro → preguntar antes de asumir
- Nunca declarar "listo" sin evidencia (test output, curl, build log)

### Cuando presentes opciones al usuario
Siempre usa una tabla comparativa con pros y contras. Ejemplo:

| Opción | Pros | Contras | Recomendación |
|---|---|---|---|
| A | rápido, simple | no escala | ✅ Para este caso |
| B | flexible, potente | más setup | Para proyectos grandes |

Nunca listes opciones sin contexto. El usuario debe poder elegir rápido.

### Ejecución de tareas
No preguntes "¿lo hacemos juntos o con agentes en paralelo?". Decide tú:
- **Tareas independientes** (ej: crear 3 endpoints sin dependencia) → usa agentes en paralelo automáticamente
- **Tareas secuenciales** (ej: setup DB → luego API → luego frontend) → trabaja paso a paso
- **Tareas ambiguas** → trabaja paso a paso (es lo más seguro)

El usuario no necesita saber cómo se ejecuta internamente. Solo muestra progreso.

## Estructura de Respuestas
- Sé directo, sin explicaciones innecesarias
- Si creas múltiples archivos, lista primero lo que vas a hacer
- Usa bloques de código con el lenguaje especificado siempre

---

## Memoria del Proyecto

Al iniciar un proyecto, verificar si existen estos archivos. Si no → crearlos:

- `philosophy.md` — Visión, Principios, Qué NO es este proyecto
- `decisions.md` — Decisiones (fecha, contexto, decisión, por qué, alternativas descartadas)
- `task_plan.md` — Objetivo, Fases, Checklist actual
- `progress.md` — Última sesión, Errores encontrados, Próximos pasos

**Cada sesión:** leer los 4 al inicio. Actualizar `progress.md` al terminar tarea crítica. Registrar decisiones de arquitectura en `decisions.md`.

### Proyectos relacionados del mismo cliente

Si este proyecto es parte de un cliente que ya tiene otro proyecto (ej: ya tiene web y ahora necesita bot/contenido/embudo):
- Buscar el `client.md` del proyecto existente para mantener consistencia de marca (colores, tono, industria)
- Copiar datos relevantes al `philosophy.md` de este proyecto
- Referenciar el proyecto anterior en `decisions.md`

---

## Fases de Trabajo

### FASE 0 — Discovery (antes de escribir código)

Hacer estas 5 preguntas al usuario si no están respondidas:

1. **North Star** — ¿Cuál es el resultado singular deseado?
2. **Integraciones** — ¿Qué servicios externos necesitamos? ¿Las keys están listas?
3. **Source of Truth** — ¿Dónde vive la data principal?
4. **Delivery** — ¿Cómo y dónde se entrega el resultado final?
5. **Reglas de comportamiento** — ¿Cómo debe "actuar" el sistema? (tono, restricciones, "no hagas X")

**Data-First Rule:** Definir el JSON Schema (input/output shapes) antes de codear. No se escribe código hasta que la forma del payload esté confirmada por el usuario.

### FASE 1 — Setup
1. Leer archivos de contexto
2. Entender estructura actual antes de tocar nada
3. Verificar conexiones y credenciales (APIs, `.env`) antes de avanzar
4. Instalar dependencias si se requiere
5. Confirmar con el usuario antes de codear

### FASE 2 — Implementación
1. Un archivo a la vez, completo, sin cortar
2. Después de cada archivo crítico → verificar que no rompe lo existente

### FASE 3 — Verificación
1. Tests → correrlos
2. Build → verificar que compila
3. Deploy → confirmar que config de prod matchea los cambios
4. Mostrar la evidencia, no solo decir que funciona

---

## Arquitectura A.N.T. (para proyectos con automatización)

Cuando el proyecto involucra scripts, pipelines, o herramientas automatizadas, usar esta separación de capas:

```
architecture/    → SOPs en Markdown (el "cómo"). Si la lógica cambia, actualizar el SOP ANTES del código
tools/           → Scripts deterministas (Python). Atómicos y testeables. Tokens en .env
.tmp/            → Archivos intermedios (efímeros, se pueden borrar)
```

**Regla de oro:** Si la lógica cambia, actualizar el SOP en `architecture/` ANTES de actualizar el código en `tools/`.

---

## Self-Annealing (Repair Loop)

Cuando un script falla o un error ocurre:

1. **Analizar** — Leer el stack trace y error message. No adivinar.
2. **Parchear** — Arreglar el script en `tools/`
3. **Testear** — Verificar que el fix funciona
4. **Actualizar docs** — Actualizar el `.md` correspondiente en `architecture/` con el aprendizaje (ej: "API requiere header X", "Rate limit es 5 calls/sec") para que el error no se repita

---

## Terminal
- Timeouts largos para scrapers, builds, instalaciones
- No lanzar procesos duplicados → verificar si ya hay uno corriendo
- `&&` para encadenar comandos relacionados
- Si falla → mostrar error completo antes de intentar fix
- Verificar qué corre en un puerto antes de asumir → `lsof -i :PORT`
- Con venv → binarios en `.venv/bin/`, no en PATH global

---

## Trampas de Deploy

### Variables de Entorno
```bash
# CLIs pueden agregar \n invisible al final de env vars
# "admin@app.com\n" !== "admin@app.com" → fallo silencioso

# MAL
vercel env add VAR production <<< "valor"

# BIEN
echo -n 'valor' | vercel env add VAR production
```
- Siempre `.trim()` al leer env vars en código
- `.env.local` = solo desarrollo local, nunca para producción
- `$PORT` puede no interpolar fuera de `sh -c` → verificar expansión

### Monorepos
- Plataformas necesitan saber el subdirectorio (root directory)
- Build falla sin razón obvia → verificar root directory primero

### Multi-servicio (API + Worker + DB)
- Un solo archivo de config para N servicios = se pisan entre sí
- Preferir config per-service (via API o archivos separados)
- `startCommand` de la plataforma overridea `CMD` del Dockerfile
- Migraciones → moverlas al lifespan/startup de la app, no al CMD

---

## Trampas de Base de Datos

### SQLite (dev) ≠ PostgreSQL (prod)
| Operación | SQLite | PostgreSQL |
|---|---|---|
| `ADD COLUMN ... REFERENCES` | ✅ | ❌ |
| Boolean default `0`/`1` | ✅ | ❌ usa `false`/`true` |
| `create_all()` sin migrator | ✅ | ❌ rompe migraciones |
| Tipos de dato flexibles | ✅ | ❌ estricto |

**Regla:** testear migraciones contra PostgreSQL antes de deployar.

### SQLAlchemy
- Reutilizar objeto ORM de otra sesión → "detached instance" → usar `db.merge(obj)`

---

## Trampas de Frontend

### Builds y Hot Reload
- Build de producción NO tiene hot reload (aplica a Next.js, Vite, etc.)
- Cambios no se ven → rebuild + kill proceso + restart
- Siempre verificar que el build es posterior al último cambio
- Vanilla HTML + CDN → no necesita build, pero sí cache-busting (`?v=${Date.now()}`)

### Dependencias
- Librería A v1.7 + Librería B v5.0 pueden ser incompatibles silenciosamente
- No asumir "instalado = funciona" → verificar compatibilidad de versiones

---

## Trampas de Auth

### Loop infinito
Token malo en localStorage → validación falla → retry con mismo token → loop.
**Fix:** limpiar estado guardado al detectar error de auth, ANTES de reintentar.

### IDs inconsistentes
Crear devuelve `int`, leer espera `str` → frontend rompe.
**Fix:** usar siempre `string` para IDs entre frontend y backend.

---

## Trampas de Workers

### OOM
Celery/Bull/etc usan 1 proceso por CPU core por default. En plans baratos → OOM.
**Fix:** limitar concurrency explícitamente (`--concurrency=2`).

### Tasks no encontradas
Worker arranca pero no procesa nada.
**Fix:** verificar `include=[...]` o `autodiscover` apunten a los módulos correctos.

---

## Trampas de Testing (Python)

- Mock paths rotos tras refactor de imports → actualizar paths en tests
- SQLite in-memory con TestClient → necesita `StaticPool` para compartir conexión

---

## Checklists

### "No funciona"
1. ¿El proceso correcto está corriendo? (`lsof -i :PORT`)
2. ¿Las env vars tienen el valor correcto? (sin `\n`, sin typos, environment correcto)
3. ¿El build es reciente?
4. ¿Dev y prod usan la misma DB engine?
5. ¿El puerto no está ocupado por otro proyecto?

### Pre-deploy
1. ¿Migraciones corren contra DB de prod?
2. ¿Root directory configurado?
3. ¿Env vars de prod limpias?
4. ¿startCommand no pisa Dockerfile?
5. ¿CORS permite el dominio del frontend?

### Pre-"listo"
1. Tests pasan
2. Build compila
3. Endpoint responde
4. Sin loops de auth
5. Datos persisten (no solo en memoria)

---

## Multi-Agente

**Subagentes** → tareas paralelas independientes, cada una con input/output claro.

**Agent Teams** → tareas que necesitan comunicarse entre sí (frontend + backend + tests). Consume 3-5x más tokens. Activar con `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

**Nunca multi-agente** → tareas secuenciales, mismo archivo desde múltiples agentes, proyecto simple.

---

## Skills

Estos skills se cargan automáticamente al inicio de sesión. No inventar skills que no existen.

- @.agent/skills/error-handling-patterns/SKILL.md — patrones de resiliencia Python y TypeScript
- @.agent/skills/brand-identity/SKILL.md — design tokens, stack técnico, voz y tono
- @.agent/skills/db-migrations/SKILL.md — Alembic workflow, trampas SQLite vs PostgreSQL
- @.agent/skills/image-generation-skill/SKILL.md — genera imágenes via Kie.ai API. Requiere `KIE_API_KEY`
- @.agent/skills/api-design-patterns/SKILL.md — patrones REST: paginación, filtros, cache, drill-down, comparación
- @.agent/skills/publish-github-vercel/SKILL.md — deploy workflow completo a GitHub + Vercel
- @.agent/skills/scroll-animation/SKILL.md — scroll-driven frame animation estilo Apple
- @.agent/skills/spline-integration/SKILL.md — integración de escenas 3D de Spline.design

---

## MCP Servers

MCP = herramientas extra para el agente (acceso a Supabase, Vercel, GitHub, etc).

### Cada herramienta tiene su propia config — NO se comparten

| Herramienta | Archivo de config |
|---|---|
| Claude Code | `~/.claude/settings.json` → `mcpServers` |
| Gemini / Antigravity | `.gemini/antigravity/mcp_config.json` |
| Cursor | `.cursor/mcp.json` |
| VS Code Copilot | `.vscode/mcp.json` |

Un MCP en Gemini **no existe** para Claude Code (y viceversa). Para tenerlo en ambos → configurarlo en ambos archivos.

### Niveles de config en Claude Code
- `~/.claude/settings.json` → global (todos los proyectos)
- `.claude/settings.local.json` → por proyecto (no se commitea)

### Formato
```json
{
  "mcpServers": {
    "nombre": {
      "command": "npx",
      "args": ["-y", "@paquete/mcp-server"],
      "env": { "API_KEY": "xxx" }
    }
  }
}
```

### MCPs recomendados
| MCP | Para qué | Auth |
|---|---|---|
| `@supabase/mcp-server-supabase` | DB queries, auth, storage | access token |
| `mcp-remote` → Vercel | Deploy, env vars, dominios | OAuth via browser |
| `@github/mcp-server` | PRs, issues, repos, actions | GitHub PAT |
| `@upstash/context7-mcp` | Docs actualizadas de librerías | sin auth |
| Stitch (Google) | Diseño UI, generación de pantallas | API key |
| `@21st-dev/magic` | Componentes React/Tailwind/shadcn listos para usar | API key |

---

## Lo que NUNCA hacer
- Inventar funciones que no existen en el proyecto
- Asumir que una librería está instalada sin verificar
- Cortar un archivo a la mitad por longitud
- Lanzar servidor/app sin que el usuario lo pida
- Crear Agent Teams sin confirmar con el usuario
- Declarar "listo" sin evidencia
- Asumir que dev y prod se comportan igual
- Reintentar auth con credenciales fallidas sin limpiar estado
- Modificar env vars de producción sin confirmar

---

## Contexto del Proyecto
<!-- Personalizar por proyecto -->
- Backend: [Python (FastAPI/scripts) / Node.js / otro]
- Frontend: [Next.js / React+Vite / Vanilla HTML+Tailwind / otro]
- BD local: [SQLite / otro]
- BD producción: [Supabase / otro]
- Deploy: [Vercel / Railway / otro]
- Prioridad: que funcione primero, optimizar después
