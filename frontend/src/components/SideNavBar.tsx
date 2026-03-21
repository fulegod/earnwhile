import { Link, useLocation } from 'react-router-dom'
import LangToggle from './LangToggle'
import { useLang } from '../i18n/LanguageContext'

export default function SideNavBar() {
  const location = useLocation()
  const { t } = useLang()

  const navItems = [
    { icon: 'dashboard', label: t('nav_summary'), href: '/app' },
    { icon: 'add_circle', label: t('nav_create'), href: '/app/create' },
    { icon: 'smart_toy', label: t('nav_ai_agent'), href: '/app/agent' },
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-64 bg-[#f8f8f4] flex-col p-6 gap-y-2 border-r border-outline-variant/15 fixed left-0 top-0 z-40">
        <div className="mb-10 px-2 flex items-center gap-3">
          <img src="/images/logo.png" alt="EarnWhile" className="w-8 h-8 rounded-lg" />
          <Link to="/" className="font-headline font-bold text-xl tracking-tighter text-on-surface">EarnWhile</Link>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`${
                  isActive
                    ? 'bg-surface-container-low text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                } rounded-lg flex items-center gap-3 p-3 font-label text-sm tracking-wide uppercase font-semibold transition-all ease-out duration-200`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex justify-center">
            <LangToggle />
          </div>
          <div className="p-4 bg-surface-container-low rounded-xl">
            <p className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-[0.1em] mb-1">
              {t('nav_protocol_status')}
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-medium text-on-surface">{t('nav_operational')}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#f8f8f4] border-t border-outline-variant/15 flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-[10px] font-label font-semibold uppercase tracking-wider">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
