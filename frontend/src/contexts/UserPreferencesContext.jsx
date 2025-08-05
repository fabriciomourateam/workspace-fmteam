import { createContext, useContext, useState, useEffect } from 'react'

const UserPreferencesContext = createContext()

// Temas de cores disponíveis
export const TEMAS_CORES = {
  azul: {
    nome: 'Azul Profissional',
    primary: 'rgb(37, 99, 235)',
    primaryHover: 'rgb(29, 78, 216)',
    secondary: 'rgb(99, 102, 241)',
    accent: 'rgb(59, 130, 246)',
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(245, 158, 11)',
    error: 'rgb(239, 68, 68)',
    background: 'rgb(248, 250, 252)',
    surface: 'rgb(255, 255, 255)',
    text: 'rgb(15, 23, 42)'
  },
  verde: {
    nome: 'Verde Natureza',
    primary: 'rgb(34, 197, 94)',
    primaryHover: 'rgb(22, 163, 74)',
    secondary: 'rgb(16, 185, 129)',
    accent: 'rgb(52, 211, 153)',
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(245, 158, 11)',
    error: 'rgb(239, 68, 68)',
    background: 'rgb(240, 253, 244)',
    surface: 'rgb(255, 255, 255)',
    text: 'rgb(15, 23, 42)'
  },
  roxo: {
    nome: 'Roxo Criativo',
    primary: 'rgb(147, 51, 234)',
    primaryHover: 'rgb(126, 34, 206)',
    secondary: 'rgb(168, 85, 247)',
    accent: 'rgb(196, 181, 253)',
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(245, 158, 11)',
    error: 'rgb(239, 68, 68)',
    background: 'rgb(250, 245, 255)',
    surface: 'rgb(255, 255, 255)',
    text: 'rgb(15, 23, 42)'
  },
  laranja: {
    nome: 'Laranja Energético',
    primary: 'rgb(249, 115, 22)',
    primaryHover: 'rgb(234, 88, 12)',
    secondary: 'rgb(251, 146, 60)',
    accent: 'rgb(253, 186, 116)',
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(245, 158, 11)',
    error: 'rgb(239, 68, 68)',
    background: 'rgb(255, 251, 235)',
    surface: 'rgb(255, 255, 255)',
    text: 'rgb(15, 23, 42)'
  },
  escuro: {
    nome: 'Modo Escuro',
    primary: 'rgb(59, 130, 246)',
    primaryHover: 'rgb(37, 99, 235)',
    secondary: 'rgb(99, 102, 241)',
    accent: 'rgb(129, 140, 248)',
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(245, 158, 11)',
    error: 'rgb(239, 68, 68)',
    background: 'rgb(15, 23, 42)',
    surface: 'rgb(30, 41, 59)',
    text: 'rgb(248, 250, 252)'
  }
}

// Níveis de densidade
export const DENSIDADE_OPCOES = {
  compacta: {
    nome: 'Compacta',
    cardHeight: 'h-8',
    padding: 'p-1',
    fontSize: 'text-xs',
    spacing: 'space-y-1',
    gap: 'gap-1'
  },
  normal: {
    nome: 'Normal',
    cardHeight: 'h-10',
    padding: 'p-2',
    fontSize: 'text-sm',
    spacing: 'space-y-2',
    gap: 'gap-2'
  },
  confortavel: {
    nome: 'Confortável',
    cardHeight: 'h-12',
    padding: 'p-3',
    fontSize: 'text-base',
    spacing: 'space-y-3',
    gap: 'gap-3'
  }
}

export function UserPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    // Carregar preferências do localStorage
    const saved = localStorage.getItem('userPreferences')
    return saved ? JSON.parse(saved) : {
      tema: 'azul',
      densidade: 'normal',
      favoritos: [],
      bookmarks: []
    }
  })

  // Salvar preferências no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
    
    // Aplicar tema CSS
    const tema = TEMAS_CORES[preferences.tema]
    const root = document.documentElement
    
    Object.entries(tema).forEach(([key, value]) => {
      if (key !== 'nome') {
        root.style.setProperty(`--color-${key}`, value)
      }
    })
  }, [preferences])

  const updatePreferences = (updates) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const addFavorito = (item) => {
    setPreferences(prev => ({
      ...prev,
      favoritos: [...prev.favoritos.filter(f => f.id !== item.id), item]
    }))
  }

  const removeFavorito = (itemId) => {
    setPreferences(prev => ({
      ...prev,
      favoritos: prev.favoritos.filter(f => f.id !== itemId)
    }))
  }

  const isFavorito = (itemId) => {
    return preferences.favoritos.some(f => f.id === itemId)
  }

  const addBookmark = (bookmark) => {
    setPreferences(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks.filter(b => b.id !== bookmark.id), bookmark]
    }))
  }

  const removeBookmark = (bookmarkId) => {
    setPreferences(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== bookmarkId)
    }))
  }

  const value = {
    preferences,
    updatePreferences,
    addFavorito,
    removeFavorito,
    isFavorito,
    addBookmark,
    removeBookmark,
    tema: TEMAS_CORES[preferences.tema],
    densidade: DENSIDADE_OPCOES[preferences.densidade]
  }

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences deve ser usado dentro de UserPreferencesProvider')
  }
  return context
}