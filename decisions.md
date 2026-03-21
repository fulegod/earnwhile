# Decisions — EarnWhile

## 2026-03-21 | Design System: Adaline Style from Stitch
**Context:** Necesitamos UI profesional para hackathon. Stitch generó 4 pantallas con estilo "Adaline" — editorial, clean, institucional.
**Decision:** Usar el design system de Stitch como base (primary #006c52, Manrope/Inter, light theme) pero adaptar contenido a español y rebrandear de "IdleYield" a "EarnWhile".
**Why:** UI impecable es criterio de evaluación. Los jueces ven 99 proyectos — el que se VE mejor tiene ventaja.
**Alternatives:** Dark theme (descartado — el diseño Stitch en light es más premium), custom design (descartado — no hay tiempo).

## 2026-03-21 | Monorepo Structure
**Context:** Proyecto tiene 3 componentes independientes: contracts, frontend, agent.
**Decision:** Monorepo simple con 3 carpetas raíz. Sin nx/turborepo.
**Why:** Hackathon de 39h. La simplicidad gana. Un repo, un README, fácil para jueces revisar.
**Alternatives:** 3 repos separados (descartado — más friction para jueces), monorepo con tooling (descartado — overhead innecesario).

## 2026-03-21 | Mock Yield Protocols
**Context:** No hay tiempo para integrar Aave/Compound reales en testnet.
**Decision:** Usar MockYieldProtocol.sol que simula APY basado en tiempo. El frontend muestra datos realistas.
**Why:** Los jueces evalúan el concepto y la ejecución técnica. Un mock bien hecho demuestra lo mismo que una integración real para un MVP.
**Alternatives:** Integrar Aave V3 en Fuji (descartado — debugging de integraciones consume demasiado tiempo).
