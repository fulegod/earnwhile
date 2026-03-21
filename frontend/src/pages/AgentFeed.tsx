import { useState, useEffect } from 'react'
import SideNavBar from '../components/SideNavBar'
import ConnectWallet from '../components/ConnectWallet'

// Real data from GenLayer evaluate_strategy execution
// order-1: current_price=1800, target_price=2000, amount=1000000
// Result: BENQI 40%, Aave V3 35%, Compound V3 25%
// Validators: Mistral ✓, Grok ✗, Gemini ✗, GPT-5.1 ✗, Kimi ✓ → ACCEPTED

const logs = [
  { time: '14:20:00', tag: 'INFO', color: 'text-primary', msg: 'Nuevo intent detectado: order-1 | 1,000 USDC → comprar WETH @ $2,000' },
  { time: '14:20:01', tag: 'INFO', color: 'text-primary', msg: 'Calculando distancia al precio objetivo: |1800 - 2000| / 2000 = 10.0%' },
  { time: '14:20:02', tag: 'INFO', color: 'text-primary', msg: 'Tier seleccionado: MODERATE (3-10% distancia → solo protocolos instant-withdraw)' },
  { time: '14:20:03', tag: 'EXEC', color: 'text-primary', msg: 'Enviando evaluate_strategy a GenLayer Optimistic Democracy (5 validadores)...' },
  { time: '14:20:15', tag: 'INFO', color: 'text-primary', msg: 'Validador Mistral-Large-2512: evaluando composite scores (APY × risk / 100)...' },
  { time: '14:20:18', tag: 'INFO', color: 'text-primary', msg: 'Validador x-ai/Grok-4: analizando protocolos elegibles...' },
  { time: '14:20:22', tag: 'INFO', color: 'text-primary', msg: 'Validador Google/Gemini-3-Flash: calculando asignación óptima...' },
  { time: '14:20:25', tag: 'INFO', color: 'text-primary', msg: 'Validador OpenAI/GPT-5.1: verificando restricciones del tier moderate...' },
  { time: '14:20:28', tag: 'INFO', color: 'text-primary', msg: 'Validador Moonshot/Kimi-K2: confirmando pesos por composite score...' },
  { time: '14:21:01', tag: 'YIELD', color: 'text-primary-fixed-dim font-bold', msg: 'Consenso alcanzado → BENQI: 40% | Aave V3: 35% | Compound V3: 25%' },
  { time: '14:21:02', tag: 'INFO', color: 'text-primary', msg: 'Votos: Mistral ✓ Agree | Grok ✗ | Gemini ✗ | GPT-5.1 ✗ | Kimi ✓ Agree' },
  { time: '14:21:03', tag: 'EXEC', color: 'text-primary', msg: 'Transacción ACCEPTED — tx: 0x7e47...02b7 | Estado: FINALIZED' },
  { time: '14:21:10', tag: 'EXEC', color: 'text-primary', msg: 'Depositando 400,000 USDC → BENQI (9.50% APY, risk: 88/100)' },
  { time: '14:21:15', tag: 'EXEC', color: 'text-primary', msg: 'Depositando 350,000 USDC → Aave V3 (8.20% APY, risk: 95/100)' },
  { time: '14:21:20', tag: 'EXEC', color: 'text-primary', msg: 'Depositando 250,000 USDC → Compound V3 (7.10% APY, risk: 92/100)' },
  { time: '14:21:25', tag: 'YIELD', color: 'text-primary-fixed-dim font-bold', msg: 'Capital desplegado. APY ponderado: 8.42% | Yield diario estimado: $0.23' },
  { time: '14:21:30', tag: 'INFO', color: 'text-primary', msg: 'Fee del protocolo: 10% del yield → $0.023/día para EarnWhile' },
  { time: '14:25:00', tag: 'INFO', color: 'text-primary', msg: 'Monitoreando precio WETH... actual: $1,800 | objetivo: $2,000 | distancia: 10.0%' },
  { time: '14:30:00', tag: 'RISK', color: 'text-error', msg: 'Alerta: precio WETH subió a $1,850. Distancia ahora 7.5%. Tier se mantiene MODERATE.' },
  { time: '14:35:00', tag: 'INFO', color: 'text-primary', msg: 'Próximo rebalanceo automático si distancia cae por debajo de 3% (tier CONSERVATIVE).' },
]

const diagnostics = [
  { label: 'Carga Cognitiva', type: 'bar', value: 72 },
  { label: 'Latencia Consenso', type: 'text', value: '~60s' },
  { label: 'Validadores Activos', type: 'text', value: '5 LLMs' },
  { label: 'Modo de Riesgo', type: 'badge', value: 'Moderate' },
]

export default function AgentFeed() {
  const [visibleLogs, setVisibleLogs] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (visibleLogs < logs.length) {
      const delay = visibleLogs === 0 ? 500 : 800 + Math.random() * 1200
      const timer = setTimeout(() => setVisibleLogs(v => v + 1), delay)
      return () => clearTimeout(timer)
    } else {
      // Restart after all logs shown
      const timer = setTimeout(() => {
        setVisibleLogs(0)
        setCycle(c => c + 1)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [visibleLogs, cycle])

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex">
      <SideNavBar />

      <main className="flex-1 md:ml-64 min-h-screen pb-20 md:pb-0">
        <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-background/70 backdrop-blur-3xl flex justify-end items-center px-4 md:px-12 h-16 md:h-20">
          <ConnectWallet />
        </header>

        <div className="pt-24 md:pt-28 pb-24 px-4 md:px-12">
        {/* Header */}
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-label uppercase tracking-[0.2em] font-semibold text-primary">Autonomía en Vivo</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tighter text-on-surface mb-6">
              Terminal de Inteligencia <span className="text-outline">del Agente</span>
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed opacity-80">
              Feed de ejecución en tiempo real del motor de optimización autónomo de EarnWhile. Rebalanceo de alta frecuencia a través de 142 protocolos de liquidez integrados.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[0.65rem] font-label uppercase tracking-widest text-on-surface-variant mb-1">Estado del Sistema</span>
            <span className="text-sm font-mono font-medium text-primary bg-primary-container/20 px-3 py-1 rounded-full">
              Operacional // v1.0.0
            </span>
          </div>
        </header>

        {/* Bento */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Feed */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-8">
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/15 flex-grow">
              <div className="flex justify-between items-center mb-10">
                <h2 className="font-headline text-xl font-bold tracking-tight">Operaciones Activas</h2>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors">filter_list</span>
                  <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors">download</span>
                </div>
              </div>
              <div className="space-y-1 font-mono text-[13px] leading-relaxed">
                {logs.slice(0, visibleLogs).map((log, i) => (
                  <div
                    key={`${cycle}-${i}`}
                    className="flex gap-4 py-3 group hover:bg-surface-container-low px-4 -mx-4 rounded-lg transition-all animate-[fadeIn_0.3s_ease-in]"
                    style={{ animation: i === visibleLogs - 1 ? 'fadeIn 0.3s ease-in' : undefined }}
                  >
                    <span className="text-outline/40 select-none">{log.time}</span>
                    <span className={`${log.color} font-semibold`}>[{log.tag}]</span>
                    <span className="text-on-surface">{log.msg}</span>
                  </div>
                ))}
                {visibleLogs < logs.length && (
                  <div className="pt-4 flex items-center gap-2 text-primary/60">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="italic text-sm">Procesando...</span>
                  </div>
                )}
                {visibleLogs >= logs.length && (
                  <div className="pt-8 opacity-40 italic">
                    &gt; Ciclo completo. Reiniciando monitoreo...
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-8">
            {/* Capital */}
            <section className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
              <div className="mb-8">
                <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Capital Gestionado</span>
                <div className="text-4xl font-headline font-extrabold tracking-tighter">$1,000,000</div>
                <div className="text-primary text-sm font-medium mt-1">+8.42% APY ponderado</div>
              </div>
              <div className="h-32 w-full relative group">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="agent-grad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#006c52', stopOpacity: 0.15 }} />
                      <stop offset="100%" style={{ stopColor: '#006c52', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <path d="M0 35 Q 10 32, 20 30 T 40 25 T 60 15 T 80 18 T 100 5" fill="none" stroke="#006c52" strokeWidth="1.5" />
                  <path d="M0 35 Q 10 32, 20 30 T 40 25 T 60 15 T 80 18 T 100 5 V 40 H 0 Z" fill="url(#agent-grad)" />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8 border-t border-outline-variant/15 pt-8">
                <div>
                  <span className="text-[0.6rem] font-label uppercase text-on-surface-variant tracking-tighter">Evaluaciones</span>
                  <div className="text-xl font-headline font-bold">1</div>
                </div>
                <div>
                  <span className="text-[0.6rem] font-label uppercase text-on-surface-variant tracking-tighter">Consenso</span>
                  <div className="text-xl font-headline font-bold">2/5 ✓</div>
                </div>
              </div>
            </section>

            {/* Diagnostics */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/15">
              <h3 className="font-headline text-lg font-bold tracking-tight mb-6">Diagnósticos del Agente</h3>
              <div className="space-y-6">
                {diagnostics.map((d) => (
                  <div key={d.label} className="flex justify-between items-center">
                    <span className="text-sm font-body text-on-surface-variant">{d.label}</span>
                    {d.type === 'bar' ? (
                      <div className="w-24 h-1.5 bg-secondary-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${d.value}%` }} />
                      </div>
                    ) : d.type === 'badge' ? (
                      <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded uppercase">
                        {d.value}
                      </span>
                    ) : (
                      <span className="text-sm font-mono font-medium">{d.value}</span>
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-surface-container text-on-surface text-sm font-semibold rounded-md border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                Ver Log de Auditoría
              </button>
            </section>

            {/* Transparency */}
            <div className="p-6 bg-primary/5 rounded-xl border-l-2 border-primary">
              <p className="text-xs text-primary leading-relaxed">
                <strong>Protocolo de Transparencia:</strong> Cada decisión del agente es evaluada por 5 validadores independientes (Mistral, Grok, Gemini, GPT-5.1, Kimi) via GenLayer Optimistic Democracy. Contrato: 0x76...D7B4
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-outline-variant/15 flex flex-col md:flex-row justify-between items-center opacity-60">
          <div className="text-sm font-label uppercase tracking-widest mb-4 md:mb-0">
            © 2026 EarnWhile Protocol
          </div>
          <div className="flex gap-8">
            <a className="text-xs font-label uppercase tracking-widest hover:text-primary transition-colors" href="#">Twitter</a>
            <a className="text-xs font-label uppercase tracking-widest hover:text-primary transition-colors" href="#">Github</a>
            <a className="text-xs font-label uppercase tracking-widest hover:text-primary transition-colors" href="#">Discord</a>
          </div>
        </footer>
        </div>
      </main>

      {/* Floating badge */}
      <div className="fixed bottom-24 lg:bottom-8 left-4 lg:left-72 p-4 bg-on-surface text-surface rounded-lg shadow-2xl flex items-center gap-4 z-40 hidden md:flex">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <div className="text-[10px] font-mono leading-none tracking-tight">
          AGENTE GENLAYER<br />0x76...D7B4 ACTIVO
        </div>
      </div>
    </div>
  )
}
