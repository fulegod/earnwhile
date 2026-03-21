import { Link } from 'react-router-dom'
import ConnectWallet from './ConnectWallet'

export default function TopNavBar({ active = 'markets' }: { active?: string }) {
  const links = [
    { id: 'markets', label: 'Mercados', href: '/' },
    { id: 'vaults', label: 'Vaults', href: '/app' },
    { id: 'governance', label: 'Gobernanza', href: '/app/agent' },
    { id: 'docs', label: 'Docs', href: '#' },
  ]

  return (
    <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-3xl">
      <nav className="flex justify-between items-center px-8 h-20 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-on-surface font-headline">
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
        <ConnectWallet />
      </nav>
    </header>
  )
}
