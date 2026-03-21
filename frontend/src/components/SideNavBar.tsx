import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { icon: 'dashboard', label: 'Resumen', href: '/app' },
  { icon: 'account_balance_wallet', label: 'Portafolio', href: '/app/create' },
  { icon: 'history', label: 'Historial', href: '#' },
  { icon: 'settings', label: 'Configuración', href: '#' },
]

export default function SideNavBar() {
  const location = useLocation()

  return (
    <aside className="h-screen w-64 bg-[#f8f8f4] flex flex-col p-6 gap-y-2 border-r border-outline-variant/15 fixed left-0 top-0 z-40">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
        </div>
        <Link to="/" className="font-headline font-bold text-xl tracking-tighter text-on-surface">EarnWhile</Link>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.label}
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

      <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
        <p className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-[0.1em] mb-1">
          Estado del Protocolo
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-on-surface">v1.0.0 Operacional</span>
        </div>
      </div>
    </aside>
  )
}
