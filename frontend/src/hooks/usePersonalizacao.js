import { useUserPreferences } from '../contexts/UserPreferencesContext'

export function usePersonalizacao() {
  const { 
    preferences, 
    tema, 
    densidade, 
    addFavorito, 
    removeFavorito, 
    isFavorito,
    addBookmark,
    removeBookmark
  } = useUserPreferences()

  // Função para aplicar classes CSS baseadas na densidade
  const getClassesDensidade = (tipo) => {
    switch (tipo) {
      case 'card':
        return `${densidade.cardHeight} ${densidade.padding}`
      case 'text':
        return densidade.fontSize
      case 'spacing':
        return densidade.spacing
      case 'gap':
        return densidade.gap
      default:
        return ''
    }
  }

  // Função para aplicar cores do tema
  const getCoresTema = (tipo) => {
    switch (tipo) {
      case 'primary':
        return {
          backgroundColor: tema.primary,
          color: 'white'
        }
      case 'primaryOutline':
        return {
          borderColor: tema.primary,
          color: tema.primary
        }
      case 'secondary':
        return {
          backgroundColor: tema.secondary,
          color: 'white'
        }
      case 'accent':
        return {
          backgroundColor: tema.accent,
          color: 'white'
        }
      case 'success':
        return {
          backgroundColor: tema.success,
          color: 'white'
        }
      case 'warning':
        return {
          backgroundColor: tema.warning,
          color: 'white'
        }
      case 'error':
        return {
          backgroundColor: tema.error,
          color: 'white'
        }
      default:
        return {}
    }
  }

  // Função para toggle de favorito
  const toggleFavorito = (item) => {
    if (isFavorito(item.id)) {
      removeFavorito(item.id)
      return false
    } else {
      addFavorito({
        id: item.id,
        nome: item.nome || item.titulo || item.title,
        tipo: item.tipo || 'item',
        data: new Date().toISOString()
      })
      return true
    }
  }

  // Função para salvar bookmark de filtro/página
  const salvarBookmark = (nome, pagina, filtros = {}) => {
    const bookmark = {
      id: `${pagina}-${Date.now()}`,
      nome,
      pagina,
      filtros,
      data: new Date().toISOString()
    }
    addBookmark(bookmark)
    return bookmark
  }

  // Função para aplicar tema CSS customizado
  const aplicarTemaCustomizado = (elemento) => {
    if (!elemento) return

    const style = elemento.style
    style.setProperty('--primary-color', tema.primary)
    style.setProperty('--primary-hover', tema.primaryHover)
    style.setProperty('--secondary-color', tema.secondary)
    style.setProperty('--accent-color', tema.accent)
    style.setProperty('--success-color', tema.success)
    style.setProperty('--warning-color', tema.warning)
    style.setProperty('--error-color', tema.error)
    style.setProperty('--background-color', tema.background)
    style.setProperty('--surface-color', tema.surface)
    style.setProperty('--text-color', tema.text)
  }

  return {
    preferences,
    tema,
    densidade,
    getClassesDensidade,
    getCoresTema,
    toggleFavorito,
    isFavorito,
    salvarBookmark,
    aplicarTemaCustomizado
  }
}