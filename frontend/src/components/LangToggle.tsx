import { useLang } from '../i18n/LanguageContext'

export default function LangToggle() {
  const { lang, toggle } = useLang()

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors text-xs font-label font-bold uppercase tracking-wider"
    >
      <span className={lang === 'es' ? 'text-primary' : 'text-on-surface-variant'}>ES</span>
      <span className="text-outline-variant">/</span>
      <span className={lang === 'en' ? 'text-primary' : 'text-on-surface-variant'}>EN</span>
    </button>
  )
}
