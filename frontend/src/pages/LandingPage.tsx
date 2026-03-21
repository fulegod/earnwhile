import { Link } from 'react-router-dom'
import TopNavBar from '../components/TopNavBar'

export default function LandingPage() {
  return (
    <div className="bg-background text-on-surface font-body">
      <TopNavBar active="markets" />

      <main className="relative">
        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-center px-8 pt-32 pb-20 hero-gradient">
          <div className="max-w-[1440px] mx-auto w-full editorial-grid">
            <div className="col-span-12 lg:col-span-8 lg:col-start-1">
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-semibold tracking-widest uppercase mb-8">
                Protocol v1.0.0 · Yield Autónomo
              </span>
              <h1 className="font-headline text-7xl md:text-8xl lg:text-[110px] leading-[0.95] font-extrabold tracking-tighter text-on-surface mb-12">
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
                <button className="px-10 py-5 rounded-lg text-lg font-headline font-bold text-primary hover:bg-surface-container-low transition-all">
                  Ver Documentación
                </button>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="absolute right-0 top-0 w-2/3 h-full pointer-events-none hidden lg:block">
            <img src="/images/hero.png" alt="" className="w-full h-full object-cover" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 30%)' }} />
          </div>
        </section>

        {/* Trust */}
        <section className="py-24 bg-surface">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex flex-col items-center">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-outline mb-12">
                Infraestructura de Grado Institucional
              </span>
              <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-50 grayscale contrast-125">
                <div className="flex items-center gap-3">
                  <img src="/tokens/avax.png" alt="Avalanche" className="w-8 h-8" />
                  <span className="font-headline font-extrabold text-xl">AVALANCHE</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-headline font-extrabold text-xl">GENLAYER</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src="/tokens/usdc.png" alt="USDC" className="w-8 h-8" />
                  <span className="font-headline font-extrabold text-xl">AAVE</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src="/tokens/compound.png" alt="Compound" className="w-8 h-8" />
                  <span className="font-headline font-extrabold text-xl">COMPOUND</span>
                </div>
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
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container">auto_awesome</span>
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
                  <h3 className="font-headline text-2xl font-bold mb-6 text-primary">EarnWhile</h3>
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
                  <img src="/images/feature1.png" alt="Multi-vault network" className="w-full h-full object-cover opacity-70" />
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
                <a className="text-primary-container font-headline font-bold flex items-center gap-2 group" href="#">
                  Motor de Riesgo
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
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

              <div className="md:col-span-2 p-12 bg-surface-container-lowest rounded-[2rem] flex items-center gap-12">
                <div className="w-1/3 h-full rounded-2xl overflow-hidden hidden md:block">
                  <img src="/images/feature2.png" alt="Blockchain security" className="w-full h-full object-cover" />
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
                <div className="text-2xl font-headline font-bold tracking-tighter mb-6">EarnWhile</div>
                <p className="text-on-surface-variant text-sm max-w-xs">
                  Un nuevo estándar en gestión autónoma de liquidez. Precisión editorial para activos digitales.
                </p>
              </div>
              <div className="col-span-6 lg:col-span-2 text-left">
                <h5 className="font-label text-[10px] uppercase tracking-widest text-outline mb-6">Protocolo</h5>
                <ul className="space-y-4 text-sm font-medium">
                  <li><a className="hover:text-primary transition-colors" href="#">Mercados</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Gobernanza</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Seguridad</a></li>
                </ul>
              </div>
              <div className="col-span-6 lg:col-span-2 text-left">
                <h5 className="font-label text-[10px] uppercase tracking-widest text-outline mb-6">Recursos</h5>
                <ul className="space-y-4 text-sm font-medium">
                  <li><a className="hover:text-primary transition-colors" href="#">Documentación</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Referencia API</a></li>
                  <li><a className="hover:text-primary transition-colors" href="#">Recursos de Marca</a></li>
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
