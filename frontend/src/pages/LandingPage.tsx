import { Link } from 'react-router-dom'
import TopNavBar from '../components/TopNavBar'
import { LogoCloud } from '@/components/ui/logo-cloud'

const partnerLogos = [
  { src: '/tokens/avax.png', alt: 'Avalanche' },
  { src: '/tokens/genlayer.svg', alt: 'GenLayer' },
  { src: '/tokens/aave.png', alt: 'Aave' },
  { src: '/tokens/compound.png', alt: 'Compound' },
  { src: '/tokens/usdc.png', alt: 'USDC' },
  { src: '/tokens/eth.png', alt: 'Ethereum' },
  { src: '/tokens/avax.png', alt: 'Avalanche' },
  { src: '/tokens/genlayer.svg', alt: 'GenLayer' },
  { src: '/tokens/aave.png', alt: 'Aave' },
  { src: '/tokens/compound.png', alt: 'Compound' },
]

export default function LandingPage() {
  return (
    <div className="bg-background text-on-surface font-body">
      <TopNavBar active="markets" />

      <main className="relative">
        {/* Hero */}
        <section className="relative min-h-screen flex flex-col justify-center px-8 pt-32 pb-20 hero-gradient overflow-hidden">
          <div className="max-w-[1440px] mx-auto w-full editorial-grid">
            <div className="col-span-12 lg:col-span-8 lg:col-start-1">
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-semibold tracking-widest uppercase mb-8">
                Protocol v1.0.0 · Yield Autónomo
              </span>
              <h1 className="font-headline text-5xl md:text-7xl xl:text-[110px] leading-[0.95] font-extrabold tracking-tighter text-on-surface mb-12">
                Tu capital genera yield{' '}
                <br />
                <span className="text-primary italic">mientras espera.</span>
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl leading-relaxed mb-12 font-body">
                El primer protocolo de liquidez que gestiona activos ociosos con precisión institucional. Automatiza tus retornos sin el ruido de los préstamos tradicionales.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  to="/app"
                  className="bg-primary text-on-primary px-10 py-5 rounded-lg text-lg font-headline font-bold hover:bg-on-primary-fixed-variant transition-all flex items-center gap-3"
                >
                  Lanzar App
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a href="https://github.com/fulegod/earnwhile" target="_blank" rel="noreferrer" className="px-10 py-5 rounded-lg text-lg font-headline font-bold text-primary hover:bg-surface-container-low transition-all">
                  Ver Documentación
                </a>
              </div>
            </div>
          </div>

          {/* Hero Image - contained to right side */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 w-[320px] h-[320px] xl:w-[480px] xl:h-[480px] pointer-events-none hidden lg:block">
            <img src="/images/hero-4k.jpg" alt="" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
        </section>

        {/* Trust */}
        <section className="py-24 bg-surface">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex flex-col items-center">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-outline mb-12">
                Infraestructura de Grado Institucional
              </span>
              <LogoCloud logos={partnerLogos} />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-40 bg-white">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="text-center mb-24">
              <h2 className="font-headline text-5xl font-bold tracking-tight mb-6">Cómo Funciona</h2>
              <p className="text-on-surface-variant text-xl">Tres pasos. Cero fricción.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Step 01 */}
              <div className="flex flex-col items-center px-6 relative">
                <span className="font-label text-[11px] uppercase tracking-[0.2em] text-primary font-bold mb-6">Paso 01</span>
                <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-7xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>account_balance_wallet</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4 text-center">Creá tu Orden</h3>
                <p className="text-on-surface-variant leading-relaxed text-justify">
                  Configurá una limit order como siempre — comprar ETH a $2,000, vender AVAX a $20. Tu capital se deposita en el smart contract y queda listo para generar rendimiento.
                </p>
                {/* Connector arrow (desktop only) */}
                <div className="hidden md:block absolute top-[88px] -right-2 w-6 h-[2px] bg-outline-variant/30" />
                <div className="hidden md:block absolute top-[84px] -right-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-outline-variant/30" />
              </div>

              {/* Step 02 */}
              <div className="flex flex-col items-center px-6 relative mt-12 md:mt-0">
                <span className="font-label text-[11px] uppercase tracking-[0.2em] text-primary font-bold mb-6">Paso 02</span>
                <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-7xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>smart_toy</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4 text-center">El AI Agent Optimiza</h3>
                <p className="text-on-surface-variant leading-relaxed text-justify">
                  Nuestro agente en GenLayer evalúa 5+ protocolos de yield (Aave, BENQI, Compound) usando Optimistic Democracy con 5 validadores independientes. Despliega tu capital al mejor rendimiento disponible.
                </p>
                {/* Connector arrow (desktop only) */}
                <div className="hidden md:block absolute top-[88px] -right-2 w-6 h-[2px] bg-outline-variant/30" />
                <div className="hidden md:block absolute top-[84px] -right-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-outline-variant/30" />
              </div>

              {/* Step 03 */}
              <div className="flex flex-col items-center px-6 mt-12 md:mt-0">
                <span className="font-label text-[11px] uppercase tracking-[0.2em] text-primary font-bold mb-6">Paso 03</span>
                <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-7xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>trending_up</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4 text-center">Ganás Mientras Esperás</h3>
                <p className="text-on-surface-variant leading-relaxed text-justify">
                  Tu capital genera yield automáticamente mientras espera que se ejecute tu orden. Cuando el precio objetivo se alcanza, el agente retira los fondos del protocolo y ejecuta la compra o venta.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-40 bg-white overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-8 editorial-grid">
            <div className="col-span-12 lg:col-span-5 mb-20 lg:mb-0">
              <h2 className="font-headline text-5xl font-bold tracking-tight text-on-surface mb-8">
                El fin de <br />la espera pasiva.
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-12">
                Los protocolos de préstamo tradicionales obligan a tu capital a permanecer en pools estáticos, esperando un prestatario. EarnWhile mueve activamente tu posición a los vaults verificados de mayor rendimiento en tiempo real.
              </p>
              <div className="p-8 bg-surface-container-low rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>sync</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold">Rebalanceo Autónomo</h4>
                    <p className="text-sm text-on-surface-variant">Optimización de yield impulsada por IA en cada bloque.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7 relative">
              <div className="flex flex-col gap-12">
                {/* Old */}
                <div className="p-10 bg-surface-container-lowest border border-outline-variant/10 rounded-3xl relative">
                  <span className="absolute top-6 right-8 font-label text-[10px] text-outline uppercase tracking-widest">
                    Modelo Legacy
                  </span>
                  <h3 className="font-headline text-2xl font-bold mb-6 text-on-surface/40">Préstamo Tradicional</h3>
                  <div className="space-y-6">
                    <div className="h-1 bg-surface-container-high rounded-full w-full overflow-hidden">
                      <div className="bg-outline h-full w-[15%]" />
                    </div>
                    <div className="flex justify-between text-sm font-label text-on-surface-variant/50">
                      <span>Utilización de Capital</span>
                      <span>15.2% Activo</span>
                    </div>
                    <p className="text-sm italic text-on-surface-variant/40">
                      "Los activos permanecen dormidos esperando participantes del mercado."
                    </p>
                  </div>
                </div>
                {/* New */}
                <div className="p-10 bg-background rounded-3xl relative shadow-2xl shadow-primary/5 border border-primary/10 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <span className="absolute top-6 right-8 font-label text-[10px] text-primary uppercase tracking-widest font-bold">
                    La Ventaja EarnWhile
                  </span>
                  <h3 className="font-headline text-2xl font-bold mb-6 text-primary flex items-center gap-3">
                    <img src="/images/logo.png" alt="" className="w-7 h-7" />
                    EarnWhile
                  </h3>
                  <div className="space-y-6">
                    <div className="h-2 bg-primary-container/20 rounded-full w-full overflow-hidden">
                      <div className="bg-primary h-full w-[98%]" />
                    </div>
                    <div className="flex justify-between text-sm font-label text-primary font-bold">
                      <span>Utilización de Capital</span>
                      <span>98.4% Activo</span>
                    </div>
                    <p className="text-sm font-body text-on-surface-variant">
                      "Agentes autónomos enrutan capital ocioso instantáneamente a vaults verificados de yield en múltiples redes."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Features */}
        <section className="py-40 bg-surface">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="text-center mb-24">
              <h2 className="font-headline text-5xl font-bold tracking-tight mb-6">Diseñado para Eficiencia de Capital.</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                Sin dashboards complejos. Solo un punto de entrada para todo tu portafolio de liquidez.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 p-12 bg-surface-container-lowest rounded-[2rem] flex flex-col justify-between h-[500px]">
                <div>
                  <span className="material-symbols-outlined text-4xl text-primary mb-6">verified_user</span>
                  <h3 className="font-headline text-3xl font-bold mb-4">Agregación Multi-Vault</h3>
                  <p className="text-on-surface-variant text-lg max-w-md">
                    Escaneamos 400+ pools de liquidez por segundo para asegurar que tu capital nunca se quede quieto. Integración directa con Aave, Compound y BENQI.
                  </p>
                </div>
                <div className="w-full h-48 bg-surface-container-low rounded-xl mt-8 overflow-hidden">
                  <img src="/images/feature1.jpg" alt="Multi-vault network" className="w-full h-full object-cover opacity-70" />
                </div>
              </div>

              <div className="p-12 bg-on-surface text-surface rounded-[2rem] flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-4xl text-primary-container mb-6">security</span>
                  <h3 className="font-headline text-2xl font-bold mb-4">Exposición Ajustada al Riesgo</h3>
                  <p className="text-surface-variant/80">
                    Cada vault recibe un puntaje de riesgo en tiempo real basado en la salud del smart contract y la volatilidad del TVL.
                  </p>
                </div>
                <Link className="text-primary-container font-headline font-bold flex items-center gap-2 group" to="/app/agent">
                  Motor de Riesgo
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>

              <div className="p-12 bg-primary-container text-on-primary-container rounded-[2rem] flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-4xl mb-6">bolt</span>
                  <h3 className="font-headline text-2xl font-bold mb-4">Ruteo Zero Slippage</h3>
                  <p className="text-on-primary-container/70">
                    Solvers propietarios manejan el movimiento de capital con impacto de gas negligible y zero slippage.
                  </p>
                </div>
                <div className="text-6xl font-headline font-extrabold opacity-20">0.00%</div>
              </div>

              <div className="md:col-span-2 p-12 bg-surface-container-lowest rounded-[2rem] flex items-center gap-12 min-h-[250px]">
                <div className="w-1/3 h-[200px] rounded-2xl overflow-hidden hidden md:block flex-shrink-0">
                  <img src="/images/feature2.jpg" alt="Blockchain security" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-headline text-3xl font-bold mb-4">Dashboard Institucional</h3>
                  <p className="text-on-surface-variant text-lg mb-8">
                    Accede a reportes de grado profesional, exportaciones para impuestos y soporte multi-sig out of the box.
                  </p>
                  <Link to="/app" className="bg-on-surface text-surface px-6 py-3 rounded font-headline font-bold inline-block">
                    Ver Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LATAM Section */}
        <section className="py-24 bg-on-surface text-surface">
          <div className="max-w-[1440px] mx-auto px-8">
            <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-8">
              Especialmente relevante para <span className="text-primary-container">Latinoamérica.</span>
            </h2>
            <p className="text-surface-variant/80 text-lg md:text-xl leading-relaxed max-w-3xl mb-16">
              En una región donde la inflación promedio supera el 25% anual, cada minuto de capital ocioso es poder adquisitivo perdido. EarnWhile convierte la espera pasiva en rendimiento activo — especialmente crítico para remesas, pagos pendientes y liquidez en mercados emergentes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <span className="font-headline text-5xl md:text-6xl font-extrabold text-primary-container">25%+</span>
                <p className="text-surface-variant/60 text-sm mt-2 font-label uppercase tracking-widest">Inflación promedio LATAM</p>
              </div>
              <div>
                <span className="font-headline text-5xl md:text-6xl font-extrabold text-primary-container">$150B+</span>
                <p className="text-surface-variant/60 text-sm mt-2 font-label uppercase tracking-widest">Remesas anuales</p>
              </div>
              <div>
                <span className="font-headline text-5xl md:text-6xl font-extrabold text-primary-container">0%</span>
                <p className="text-surface-variant/60 text-sm mt-2 font-label uppercase tracking-widest">Yield en capital ocioso (hasta ahora)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="py-24 bg-surface">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="text-center mb-16">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-outline mb-4 block">Roadmap</span>
              <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Más allá de limit orders.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-8 bg-primary text-on-primary rounded-2xl">
                <span className="text-xs font-label font-bold uppercase tracking-widest opacity-70">Ahora</span>
                <h3 className="font-headline text-xl font-bold mt-3 mb-2">Limit Orders</h3>
                <p className="text-sm opacity-80">Yield automático para órdenes pendientes en DEXs de Avalanche.</p>
              </div>
              <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">Q2 2026</span>
                <h3 className="font-headline text-xl font-bold mt-3 mb-2">NFT Bids & Remesas</h3>
                <p className="text-sm text-on-surface-variant">Capital en ofertas de NFTs y remesas esperando ser cobradas generando yield.</p>
              </div>
              <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">Q3 2026</span>
                <h3 className="font-headline text-xl font-bold mt-3 mb-2">Real World Assets</h3>
                <p className="text-sm text-on-surface-variant">Depósitos en escrow de real estate tokenizado y comercio internacional.</p>
                <span className="inline-block mt-3 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-[10px] font-bold uppercase tracking-widest">Coming Soon</span>
              </div>
              <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">Q4 2026</span>
                <h3 className="font-headline text-xl font-bold mt-3 mb-2">Multi-Chain</h3>
                <p className="text-sm text-on-surface-variant">Expansión a Ethereum, Arbitrum y Solana. Un yield layer universal.</p>
                <span className="inline-block mt-3 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-[10px] font-bold uppercase tracking-widest">Coming Soon</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="bg-white py-32">
          <div className="max-w-[1440px] mx-auto px-8 flex flex-col items-center text-center">
            <h2 className="font-headline text-6xl md:text-7xl font-extrabold tracking-tighter mb-12">
              ¿Listo para el <br />
              <span className="text-primary">próximo ciclo de yield?</span>
            </h2>
            <div className="flex gap-4 mb-24">
              <Link to="/app" className="bg-primary text-on-primary px-12 py-6 rounded-lg text-xl font-headline font-bold hover:shadow-xl transition-all">
                Lanzar App
              </Link>
            </div>
            <div className="w-full editorial-grid border-t border-outline-variant/15 pt-12">
              <div className="col-span-12 lg:col-span-4 text-left mb-12 lg:mb-0">
                <div className="text-2xl font-headline font-bold tracking-tighter mb-6 flex items-center gap-2">
                  <img src="/images/logo.png" alt="" className="w-8 h-8" />
                  EarnWhile
                </div>
                <p className="text-on-surface-variant text-sm max-w-xs">
                  Un nuevo estándar en gestión autónoma de liquidez. Precisión editorial para activos digitales.
                </p>
              </div>
              <div className="col-span-6 lg:col-span-2 text-left">
                <h5 className="font-label text-[10px] uppercase tracking-widest text-outline mb-6">Protocolo</h5>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link className="hover:text-primary transition-colors" to="/app">Dashboard</Link></li>
                  <li><Link className="hover:text-primary transition-colors" to="/app/create">Crear Orden</Link></li>
                  <li><Link className="hover:text-primary transition-colors" to="/app/agent">AI Agent</Link></li>
                </ul>
              </div>
              <div className="col-span-6 lg:col-span-2 text-left">
                <h5 className="font-label text-[10px] uppercase tracking-widest text-outline mb-6">Recursos</h5>
                <ul className="space-y-4 text-sm font-medium">
                  <li><a className="hover:text-primary transition-colors" href="https://github.com/fulegod/earnwhile" target="_blank" rel="noreferrer">GitHub</a></li>
                  <li><a className="hover:text-primary transition-colors" href="https://testnet.snowtrace.io/address/0xaa7E2BAE9b702612985F19eEcc8765a28c74E453" target="_blank" rel="noreferrer">Contratos (Fuji)</a></li>
                  <li><a className="hover:text-primary transition-colors" href="https://studio.genlayer.com" target="_blank" rel="noreferrer">GenLayer Studio</a></li>
                </ul>
              </div>
              <div className="col-span-12 lg:col-span-4 text-left lg:text-right mt-12 lg:mt-0">
                <h5 className="font-label text-[10px] uppercase tracking-widest text-outline mb-6">Estado del Sistema</h5>
                <div className="flex lg:justify-end items-center gap-2 text-sm text-primary font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Operacional
                </div>
                <p className="text-[10px] text-on-surface-variant/40 mt-8">© 2026 EarnWhile Protocol. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
