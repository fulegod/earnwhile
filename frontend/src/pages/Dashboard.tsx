import { Link } from 'react-router-dom'
import ConnectWallet from '../components/ConnectWallet'
import SideNavBar from '../components/SideNavBar'

const deposits = [
  { symbol: 'USDC', name: 'USDC StableVault', network: 'Avalanche Fuji', value: '$450,230.12', apy: '12.4%', strategy: 'Delta-Neutral Basis' },
  { symbol: 'ETH', name: 'Ether LST Multiplicador', network: 'Avalanche Fuji', value: '$892,110.45', apy: '6.1%', strategy: 'LST Re-staking' },
  { symbol: 'AVAX', name: 'AVAX Yield Max', network: 'Avalanche Fuji', value: '$124,500.00', apy: '18.2%', strategy: 'BENQI Liquid Staking' },
]

const events = [
  { time: 'HACE 12 MIN', text: 'Auto-rebalanceo completado para vault USDC-AVAX.', detail: 'Eficiencia de gas mejorada en 22%.', color: 'bg-primary' },
  { time: 'HACE 2 HORAS', text: 'Nuevo intent de yield detectado: BENQI restaking.', detail: 'Evaluación de riesgo pendiente...', color: 'bg-tertiary' },
  { time: 'AYER', text: 'Reporte mensual de yield (Marzo) disponible.', detail: 'Portafolio creció 1.2% sobre benchmark.', color: 'bg-outline-variant' },
]

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <SideNavBar />

      <main className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <header className="fixed top-0 right-0 left-64 z-30 bg-background/70 backdrop-blur-3xl flex justify-between items-center px-12 h-20">
          <nav className="hidden md:flex gap-8 items-center">
            {[
              { label: 'Mercados', active: true },
              { label: 'Vaults', active: false },
              { label: 'Gobernanza', active: false },
              { label: 'Docs', active: false },
            ].map((link) => (
              <a
                key={link.label}
                href="#"
                className={
                  link.active
                    ? 'text-primary border-b-2 border-primary pb-1 font-headline tracking-tight font-medium'
                    : 'text-on-surface-variant hover:text-primary transition-colors duration-200 font-headline tracking-tight font-medium'
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
              notifications
            </button>
            <ConnectWallet />
          </div>
        </header>

        <div className="pt-32 pb-24 px-12 max-w-7xl mx-auto">
          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            <div className="space-y-4">
              <span className="text-xs font-label font-bold text-outline uppercase tracking-[0.15em]">Total Depositado</span>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">$2,840,122</h2>
                <span className="text-primary text-sm font-bold font-label">+12.4%</span>
              </div>
              <p className="text-sm text-on-surface-variant max-w-[200px] leading-relaxed">Liquidez agregada en 14 intents del protocolo.</p>
            </div>
            <div className="space-y-4">
              <span className="text-xs font-label font-bold text-outline uppercase tracking-[0.15em]">APY Promedio</span>
              <h2 className="text-5xl font-headline font-extrabold tracking-tighter text-primary">8.42%</h2>
              <p className="text-sm text-on-surface-variant max-w-[200px] leading-relaxed">Rendimiento neto de fees del protocolo y optimización de gas.</p>
            </div>
            <div className="space-y-4">
              <span className="text-xs font-label font-bold text-outline uppercase tracking-[0.15em]">Órdenes Activas</span>
              <h2 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">14</h2>
              <p className="text-sm text-on-surface-variant max-w-[200px] leading-relaxed">Smart contracts rebalanceando activamente para yield óptimo.</p>
            </div>
          </section>

          <div className="grid grid-cols-12 gap-12 items-start">
            {/* Chart + Table */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-headline font-bold tracking-tight text-on-surface">Comparación de Yield</h3>
                  <p className="text-on-surface-variant text-sm mt-1">EarnWhile vs. Benchmarks del Mercado (30D)</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs font-medium">EarnWhile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary-container" />
                    <span className="text-xs font-medium">Promedio Mercado</span>
                  </div>
                </div>
              </div>

              <div className="relative h-80 w-full bg-surface-container-low rounded-xl overflow-hidden p-8 flex flex-col justify-end">
                <div className="absolute inset-0 flex items-end justify-between px-8 pb-12 opacity-20">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-px h-full bg-outline-variant" />
                  ))}
                </div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 320">
                  <defs>
                    <linearGradient id="chart-grad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#006c52', stopOpacity: 0.1 }} />
                      <stop offset="100%" style={{ stopColor: '#006c52', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <path d="M0,240 Q100,220 200,180 T400,140 T600,100 T800,60" fill="none" stroke="#006c52" strokeLinecap="round" strokeWidth="3" />
                  <path d="M0,260 Q100,250 200,230 T400,210 T600,190 T800,180" fill="none" stroke="#546160" strokeDasharray="4 4" strokeWidth="2" />
                  <path d="M0,240 Q100,220 200,180 T400,140 T600,100 T800,60 V320 H0 Z" fill="url(#chart-grad)" />
                </svg>
                <div className="flex justify-between w-full relative z-10">
                  {['MAR 01', 'MAR 08', 'MAR 15', 'MAR 21'].map((d) => (
                    <span key={d} className="text-[10px] font-label font-bold text-outline-variant">{d}</span>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="pt-12">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-headline font-bold tracking-tight text-on-surface">Depósitos Activos</h3>
                  <Link to="/app/create" className="text-primary font-label text-xs font-bold uppercase tracking-widest hover:underline underline-offset-4">
                    + Nueva Orden
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-label font-bold text-outline uppercase tracking-[0.2em] border-b border-outline-variant/20">
                        <th className="py-4">Activo / Vault</th>
                        <th className="py-4">Valor Actual</th>
                        <th className="py-4">Yield</th>
                        <th className="py-4">Estrategia</th>
                        <th className="py-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {deposits.map((d) => (
                        <tr key={d.symbol} className="group hover:bg-surface-container-low transition-colors">
                          <td className="py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary text-xs">
                                {d.symbol}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{d.name}</p>
                                <p className="text-xs text-on-surface-variant">{d.network}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 font-medium text-sm">{d.value}</td>
                          <td className="py-6">
                            <span className="bg-primary-container/30 text-primary px-2 py-1 rounded-full text-xs font-bold">
                              {d.apy} APY
                            </span>
                          </td>
                          <td className="py-6 text-sm text-on-surface-variant">{d.strategy}</td>
                          <td className="py-6 text-right">
                            <button className="text-on-surface-variant hover:text-primary transition-colors">
                              <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-12">
              {/* AI Insight */}
              <div className="bg-surface-container-low rounded-xl p-8 space-y-6 editorial-shadow">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                  <h4 className="font-headline font-bold text-lg tracking-tight">Insight de IA</h4>
                </div>
                <p className="text-sm text-on-surface leading-relaxed italic font-medium">
                  "El spread actual de stablecoins en Avalanche se está ampliando. Nuestros modelos sugieren migrar 15% de tu liquidez AVAX al nuevo mercado de BENQI podría incrementar el yield total del portafolio en +0.85% durante los próximos 14 días."
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <button className="w-full bg-on-surface text-surface py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors">
                    Ejecutar Migración
                  </button>
                  <Link to="/app/agent" className="w-full border border-outline-variant/30 text-on-surface-variant py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-white transition-all text-center block">
                    Ver Análisis Completo
                  </Link>
                </div>
              </div>

              {/* Events */}
              <div className="space-y-6">
                <h4 className="font-headline font-bold text-lg tracking-tight">Eventos del Sistema</h4>
                <div className="space-y-6">
                  {events.map((e, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={`w-1.5 h-1.5 rounded-full ${e.color} mt-2 flex-shrink-0`} />
                      <div>
                        <p className="text-xs font-label font-bold text-outline uppercase tracking-wider mb-1">{e.time}</p>
                        <p className="text-sm font-medium">{e.text}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{e.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/5] flex flex-col justify-end p-8 text-white group cursor-pointer bg-gradient-to-t from-on-surface via-on-surface/60 to-primary/20">
                <div className="relative z-10 space-y-2">
                  <p className="text-[10px] font-label font-bold uppercase tracking-[0.2em] opacity-80">Acceso Institucional</p>
                  <h5 className="text-2xl font-headline font-extrabold leading-tight">EarnWhile Prime ya está activo.</h5>
                  <p className="text-sm opacity-70">Parámetros de riesgo personalizados para cuentas de tesorería gestionadas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
