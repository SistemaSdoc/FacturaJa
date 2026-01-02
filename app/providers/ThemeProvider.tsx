'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type Theme = 'light' | 'dark'

interface ThemeContextProps {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [theme, setTheme] = useState<Theme>('light')

    // gera uma chave única por página
    const storageKey = `theme_${pathname.split('/')[1] || 'root'}`

    // Carregar preferido do localStorage
    useEffect(() => {
        const saved = localStorage.getItem(storageKey) as Theme | null
        if (saved) setTheme(saved)
    }, [storageKey])

    // Salvar sempre que mudar
    useEffect(() => {
        localStorage.setItem(storageKey, theme)
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [theme, storageKey])

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
    return ctx
}
