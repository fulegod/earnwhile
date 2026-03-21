import { Link } from 'react-router-dom'
import TopNavBar from '../components/TopNavBar'
import { LogoCloud } from '@/components/ui/logo-cloud'
import { useLang } from '@/i18n/LanguageContext'

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
  const { t } = useLang()
  return (
    <div className="bg-background text-on-surface font-body">
      <TopNavBar active="markets" />

      <main className="relative">
        {/* Hero */}
        <section className="relative min-h-screen flex flex-col justify-center px-8 pt-32 pb-20 hero-gradient overflow-hidden">
          <div className="max-w-[1440px] mx-auto w-full editorial-grid">
            <div className="col-span-12 lg:col-span-8 lg:col-start-1">
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-semibold tracking-widest uppercase mb-8">
                {t('hero_badge')}
              </span>
              <h1 className="font-headline text-5xl md:text-7xl xl:text-[110px] leading-[0.95] font-extrabold tracking-tighter text-on-surface mb-12">
                {t('hero_title_1')}{' '}
                <br />
                <span className="text-primary italic">{t('hero_title_2')}</span>
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl leading-relaxed mb-12 font-body">
                {t('hero_desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  to="/app"
                  className="bg-primary text-on-primary px-10 py-5 rounded-lg text-lg font-headline font-bold hover:bg-on-primary-fixed-variant transition-all flex items-center gap-3"
                >
                  {t('hero_cta')}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a href="https://github.com/fulegod/earnwhile" target="_blank" rel="noreferrer" className="px-10 py-5 rounded-lg text-lg font-headline font-bold text-primary hover:bg-surface-container-low transition-all">
                  {t('hero_docs')}
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
                {t('trust_label')}
              </span>
              <LogoCloud logos={partnerLogos} />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-40 bg-white">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="text-center mb-24">
              <h2 className="font-headline text-5xl font-bold tracking-tight mb-6">{t('how_title')}</h2>
              <p className="text-on-surface-variant text-xl">{t('how_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Step 01 */}
              <div className="flex flex-col items-center px-6 relative">
                <span className="font-label text-sm uppercase tracking-[0.2em] text-primary font-bold mb-6">{t('step_01')}</span>
                <div className="w-40 h-40 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1, 'wght' 400" }}>account_balance_wallet</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4 text-center">{t('step_01_title')}</h3>
                <p className="text-on-surface-variant leading-relaxed text-justify">
                  {t('step_01_desc')}
                </p>
                {/* Connector arrow (desktop only) */}
                <div className="hidden md:block absolute top-[108px] -right-2 w-6 h-[2px] bg-outline-variant/30" />
                <div className="hidden md:block absolute top-[104px] -right-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-outline-variant/30" />
              </div>

              {/* Step 02 */}
              <div className="flex flex-col items-center px-6 relative mt-12 md:mt-0">
                <span className="font-label text-sm uppercase tracking-[0.2em] text-primary font-bold mb-6">{t('step_02')}</span>
                <div className="w-40 h-40 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1, 'wght' 400" }}>smart_toy</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4 text-center">{t('step_02_title')}</h3>
                <p className="text-on-surface-variant leading-relaxed text-justify">
                  {t('step_02_desc')}
                </p>
                {/* Connector arrow (desktop only) */}
                <div className="hidden md:block absolute top-[108px] -right-2 w-6 h-[2px] bg-outline-variant/30" />
                <div className="hidden md:block absolute top-[104px] -right-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-outline-variant/30" />
              </div>

              {/* Step 03 */}
              <div className="flex flex-col items-center px-6 mt-12 md:mt-0">
                <span className="font-label text-sm uppercase tracking-[0.2em] text-primary font-bold mb-6">{t('step_03')}</span>
                <div className="w-40 h-40 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1, 'wght' 400" }}>trending_up</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4 text-center">{t('step_03_title')}</h3>
                <p className="text-on-surface-variant leading-relaxed text-justify">
                  {t('step_03_desc')}
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
                {t('comp_title_1')} <br />{t('comp_title_2')}
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-12">
                {t('comp_desc')}
              </p>
              <div className="p-8 bg-surface-container-low rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>sync</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold">{t('comp_rebalance')}</h4>
                    <p className="text-sm text-on-surface-variant">{t('comp_rebalance_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7 relative">
              <div className="flex flex-col gap-12">
                {/* Old */}
                <div className="p-10 bg-surface-container-lowest border border-outline-variant/10 rounded-3xl relative">
                  <span className="absolute top-6 right-8 font-label text-[10px] text-outline uppercase tracking-widest">
                    {t('comp_legacy')}
                  </span>
                  <h3 className="font-headline text-2xl font-bold mb-6 text-on-surface/40">{t('comp_traditional')}</h3>
                  <div className="space-y-6">
                    <div className="h-1 bg-surface-container-high rounded-full w-full overflow-hidden">
                      <div className="bg-outline h-full w-[15%]" />
                    </div>
                    <div className="flex justify-between text-sm font-label text-on-surface-variant/50">
                      <span>{t('comp_utilization')}</span>
                      <span>{t('comp_legacy_pct')}</span>
                    </div>
                    <p className="text-sm italic text-on-surface-variant/40">
                      {t('comp_legacy_quote')}
                    </p>
                  </div>
                </div>
                {/* New */}
                <div className="p-10 bg-background rounded-3xl relative shadow-2xl shadow-primary/5 border border-primary/10 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <span className="absolute top-6 right-8 font-label text-[10px] text-primary uppercase tracking-widest font-bold">
                    {t('comp_advantage')}
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
                      <span>{t('comp_utilization')}</span>
                      <span>{t('comp_new_pct')}</span>
                    </div>
                    <p className="text-sm font-body text-on-surface-variant">
                      {t('comp_new_quote')}
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
              <h2 className="font-headline text-5xl font-bold tracking-tight mb-6">{t('feat_title')}</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                {t('feat_subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 p-12 bg-surface-container-lowest rounded-[2rem] flex flex-col justify-between h-[500px]">
                <div>
                  <span className="material-symbols-outlined text-4xl text-primary mb-6">verified_user</span>
                  <h3 className="font-headline text-3xl font-bold mb-4">{t('feat_vault_title')}</h3>
                  <p className="text-on-surface-variant text-lg max-w-md">
                    {t('feat_vault_desc')}
                  </p>
                </div>
                <div className="w-full h-48 bg-surface-container-low rounded-xl mt-8 overflow-hidden">
                  <img src="/images/feature1.jpg" alt="Multi-vault network" className="w-full h-full object-cover opacity-70" />
                </div>
              </div>

              <div className="p-12 bg-on-surface text-surface rounded-[2rem] flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-4xl text-primary-container mb-6">security</span>
                  <h3 className="font-headline text-2xl font-bold mb-4">{t('feat_risk_title')}</h3>
                  <p className="text-surface-variant/80">
                    {t('feat_risk_desc')}
                  </p>
                </div>
                <Link className="text-primary-container font-headline font-bold flex items-center gap-2 group" to="/app/agent">
                  {t('feat_risk_link')}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>

              <div className="p-12 bg-primary-container text-on-primary-container rounded-[2rem] flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-4xl mb-6">bolt</span>
                  <h3 className="font-headline text-2xl font-bold mb-4">{t('feat_zero_title')}</h3>
                  <p className="text-on-primary-container/70">
                    {t('feat_zero_desc')}
                  </p>
                </div>
                <div className="text-6xl font-headline font-extrabold opacity-20">0.00%</div>
              </div>

              <div className="md:col-span-2 p-12 bg-surface-container-lowest rounded-[2rem] flex items-center gap-12 min-h-[250px]">
                <div className="w-1/3 h-[200px] rounded-2xl overflow-hidden hidden md:block flex-shrink-0">
                  <img src="/images/feature2.jpg" alt="Blockchain security" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-headline text-3xl font-bold mb-4">{t('feat_dash_title')}</h3>
                  <p className="text-on-surface-variant text-lg mb-8">
                    {t('feat_dash_desc')}
                  </p>
                  <Link to="/app" className="bg-on-surface text-surface px-6 py-3 rounded font-headline font-bold inline-block">
                    {t('feat_demo')}
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
              {t('latam_title_1')}<span className="text-primary-container">{t('latam_title_2')}</span>
            </h2>
            <p className="text-surface-variant/80 text-lg md:text-xl leading-relaxed max-w-3xl mb-16">
              {t('latam_desc')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <span className="font-headline text-5xl md:text-6xl font-extrabold text-primary-container">25%+</span>
                <p className="text-surface-variant/60 text-sm mt-2 font-label uppercase tracking-widest">{t('latam_stat1')}</p>
              </div>
              <div>
                <span className="font-headline text-5xl md:text-6xl font-extrabold text-primary-container">$150B+</span>
                <p className="text-surface-variant/60 text-sm mt-2 font-label uppercase tracking-widest">{t('latam_stat2')}</p>
              </div>
              <div>
                <span className="font-headline text-5xl md:text-6xl font-extrabold text-primary-container">0%</span>
                <p className="text-surface-variant/60 text-sm mt-2 font-label uppercase tracking-widest">{t('latam_stat3')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="py-24 bg-surface">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="text-center mb-16">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-outline mb-4 block">{t('roadmap_label')}</span>
              <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">{t('roadmap_title')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-8 bg-primary text-on-primary rounded-2xl">
                <span className="text-xs font-label font-bold uppercase tracking-widest opacity-70">{t('roadmap_now')}</span>
                <h3 className="font-headline text-xl font-bold mt-3 mb-2">{t('roadmap_now_title')}</h3>
                <p className="text-sm opacity-80">{t('roadmap_now_desc')}</p>
              </div>
              <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">Q2 2026</span>
                <h3 className="font-headline text-xl font-bold mt-3 mb-2">{t('roadmap_q2_title')}</h3>
                <p className="text-sm text-on-surface-variant">{t('roadmap_q2_desc')}</p>
              </div>
              <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">Q3 2026</span>
                <h3 className="font-headline text-xl font-bold mt-3 mb-2">{t('roadmap_q3_title')}</h3>
                <p className="text-sm text-on-surface-variant">{t('roadmap_q3_desc')}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-[10px] font-bold uppercase tracking-widest">{t('roadmap_coming')}</span>
              </div>
              <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">Q4 2026</span>
                <h3 className="font-headline text-xl font-bold mt-3 mb-2">{t('roadmap_q4_title')}</h3>
                <p className="text-sm text-on-surface-variant">{t('roadmap_q4_desc')}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-[10px] font-bold uppercase tracking-widest">{t('roadmap_coming')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="bg-white py-32">
          <div className="max-w-[1440px] mx-auto px-8 flex flex-col items-center text-center">
            <h2 className="font-headline text-6xl md:text-7xl font-extrabold tracking-tighter mb-12">
              {t('footer_cta_1')} <br />
              <span className="text-primary">{t('footer_cta_2')}</span>
            </h2>
            <div className="flex gap-4 mb-24">
              <Link to="/app" className="bg-primary text-on-primary px-12 py-6 rounded-lg text-xl font-headline font-bold hover:shadow-xl transition-all">
                {t('hero_cta')}
              </Link>
            </div>
            <div className="w-full editorial-grid border-t border-outline-variant/15 pt-12">
              <div className="col-span-12 lg:col-span-4 text-left mb-12 lg:mb-0">
                <div className="text-2xl font-headline font-bold tracking-tighter mb-6 flex items-center gap-2">
                  <img src="/images/logo.png" alt="" className="w-8 h-8" />
                  EarnWhile
                </div>
                <p className="text-on-surface-variant text-sm max-w-xs">
                  {t('footer_desc')}
                </p>
              </div>
              <div className="col-span-6 lg:col-span-2 text-left">
                <h5 className="font-label text-[10px] uppercase tracking-widest text-outline mb-6">{t('footer_protocol')}</h5>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link className="hover:text-primary transition-colors" to="/app">Dashboard</Link></li>
                  <li><Link className="hover:text-primary transition-colors" to="/app/create">Crear Orden</Link></li>
                  <li><Link className="hover:text-primary transition-colors" to="/app/agent">AI Agent</Link></li>
                </ul>
              </div>
              <div className="col-span-6 lg:col-span-2 text-left">
                <h5 className="font-label text-[10px] uppercase tracking-widest text-outline mb-6">{t('footer_resources')}</h5>
                <ul className="space-y-4 text-sm font-medium">
                  <li><a className="hover:text-primary transition-colors" href="https://github.com/fulegod/earnwhile" target="_blank" rel="noreferrer">GitHub</a></li>
                  <li><a className="hover:text-primary transition-colors" href="https://testnet.snowtrace.io/address/0xaa7E2BAE9b702612985F19eEcc8765a28c74E453" target="_blank" rel="noreferrer">Contratos (Fuji)</a></li>
                  <li><a className="hover:text-primary transition-colors" href="https://studio.genlayer.com" target="_blank" rel="noreferrer">GenLayer Studio</a></li>
                </ul>
              </div>
              <div className="col-span-12 lg:col-span-4 text-left lg:text-right mt-12 lg:mt-0">
                <h5 className="font-label text-[10px] uppercase tracking-widest text-outline mb-6">{t('footer_system')}</h5>
                <div className="flex lg:justify-end items-center gap-2 text-sm text-primary font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {t('footer_status')}
                </div>
                <p className="text-[10px] text-on-surface-variant/40 mt-8">{t('footer_copy')}</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
