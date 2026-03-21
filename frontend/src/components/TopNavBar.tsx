import { Link } from 'react-router-dom'
import ConnectWallet from './ConnectWallet'
import LangToggle from './LangToggle'
import { useLang } from '../i18n/LanguageContext'

export default function TopNavBar({ active = 'markets' }: { active?: string }) {
  const { t } = useLang()

  const links = [
    { id: 'vaults', label: t('nav_dashboard'), href: '/app' },
    { id: 'agent', label: t('nav_ai_agent'), href: '/app/agent' },
  ]

  return (
    <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-3xl">
      <nav className="flex justify-between items-center px-8 h-20 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-on-surface font-headline">
            <img src="/images/logo.png" alt="" className="w-7 h-7" />
            EarnWhile
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.id}
                to={link.href}
                className={
                  active === link.id
                    ? 'text-primary border-b-2 border-primary pb-1 font-headline tracking-tight font-medium'
                    : 'text-on-surface-variant hover:text-primary transition-colors duration-200 font-headline tracking-tight font-medium'
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LangToggle />
          <ConnectWallet />
        </div>
      </nav>
    </header>
  )
}
