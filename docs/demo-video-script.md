# EarnWhile — Demo Video Script (3 min)

> Audio en ESPAÑOL | Subtítulos en INGLÉS | Grabar con OBS/Loom

---

## 0:00 - 0:30 → El Problema

**[Pantalla: Landing page de EarnWhile]**

*"Ahora mismo hay miles de millones de dólares completamente ociosos en DeFi. Cada vez que ponés una limit order en un DEX — comprar ETH a dos mil, vender AVAX a veinte — tus tokens quedan locked en un smart contract sin generar absolutamente nada. Solo en Uniswap, el 40 a 50% de toda la liquidez está fuera de rango y no genera fees. Son miles de millones de dólares debajo de un colchón digital."*

**[Scroll suave por la landing, mostrar la sección de comparación 15.2% vs 98.4%]**

---

## 0:30 - 1:00 → La Solución

**[Click en "Lanzar App" → Dashboard]**

*"Les presento EarnWhile — un yield layer para órdenes pendientes. Ponés tu limit order como siempre. Pero en vez de que tus USDC se queden parados, nuestro AI agent los despliega automáticamente al mejor protocolo de yield disponible."*

**[Mostrar el dashboard con stats reales: APY 5%, órdenes activas]**

*"El agente corre como un Intelligent Contract en GenLayer, usando Optimistic Democracy: múltiples validadores con LLMs diferentes debaten cuál es la mejor estrategia y llegan a consenso descentralizado."*

---

## 1:00 - 2:15 → Live Demo

**[Navegar a /app/create]**

*"Déjenme mostrarles cómo funciona."*

1. **[Mostrar wallet conectada]** *"Wallet conectada en Avalanche Fuji testnet"*
2. **[Mostrar balance USDC]** *"Tenemos USDC de prueba"*
3. **[Poner 1000 en amount, precio 2000]** *"Creamos una limit order: comprar WETH a $2,000 con 1,000 USDC"*
4. **[Click Ejecutar Intent → MetaMask confirma]** *"La orden se crea on-chain en Avalanche"*
5. **[Ir al Dashboard → mostrar la orden en la tabla]** *"La orden aparece en nuestro dashboard con estado Activa"*

**[Navegar a /app/agent]**

6. **[Mostrar los logs animados apareciendo]** *"Acá vemos al AI agent en acción — calcula la distancia al precio objetivo, determina el tier de estrategia, y despliega el capital"*
7. **[Señalar la asignación]** *"El agente decidió: BENQI 40%, Aave V3 35%, Compound V3 25% — consenso de 5 validadores via Optimistic Democracy"*

**[Cambiar a pestaña de GenLayer Studio]**

8. **[Mostrar el contrato deployado + la transacción ACCEPTED]** *"Esto es el Intelligent Contract real corriendo en GenLayer — 5 validadores con Mistral, Grok, Gemini, GPT y Kimi evaluaron la estrategia"*

---

## 2:15 - 2:30 → Modelo de Negocio

**[Volver a la app, mostrar "Fee del Protocolo: 10% del yield"]**

*"¿Cómo monetizamos? EarnWhile cobra el 10% del yield generado. El usuario sigue ganando el 90% de algo — versus el cero por ciento sin nosotros. Es un modelo win-win."*

---

## 2:30 - 3:00 → Visión y Roadmap

**[Mostrar la landing page, sección de partners]**

*"Hoy EarnWhile funciona con limit orders en Avalanche. Pero la visión es mucho más grande. Cualquier capital que está esperando — bids en NFTs, ofertas en real estate tokenizado, incluso remesas esperando ser cobradas en Latinoamérica — puede ser productivo."*

*"En una región donde la inflación hace que el capital ocioso pierda valor cada día, EarnWhile es especialmente relevante."*

*"Construido en Avalanche por su velocidad y bajo costo. Potenciado por GenLayer AI para decisiones inteligentes y verificables on-chain. EarnWhile — tu capital trabaja mientras espera. Gracias."*

---

## Tips de Grabación

- Usar OBS o Loom para grabar pantalla
- Resolución: 1920x1080 mínimo
- Cerrar MetaMask sidebar antes de grabar
- Tener el dashboard cargado con wallet conectada
- Tener GenLayer Studio abierto en otra pestaña
- Audio: grabar vos mismo o usar ElevenLabs para voz profesional
- Subtítulos: agregar con CapCut o Descript después

## URLs para el Demo

- Frontend: http://localhost:5173 o https://frontend-puce-rho-23.vercel.app
- GenLayer Studio: https://studio.genlayer.com
- SnowTrace: https://testnet.snowtrace.io/address/0xaa7E2BAE9b702612985F19eEcc8765a28c74E453
- GitHub: https://github.com/fulegod/earnwhile
