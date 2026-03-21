import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Lang } from './translations'

type LanguageContextType = {
  lang: Lang
  toggle: () => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'es',
  toggle: () => {},
  t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es')

  const toggle = () => setLang((prev) => (prev === 'es' ? 'en' : 'es'))

  const t = (key: string) => translations[lang][key] || key

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
