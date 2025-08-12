import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, Users, FileText, BarChart3, Clock, Filter, Settings, CalendarDays, Search, Menu, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
// import ThemeToggle from './components/ThemeToggle'
import NotificationContainer from './components/NotificationContainer'
// import GlobalSearch from './components/GlobalSearch'
import { UserPreferencesProvider } from './contexts/UserPreferencesContext'
import ConfiguracoesPessoais from './components/ConfiguracoesPessoais'
import Dashboard from './components/Dashboard'


import Cronograma from './components/Cronograma'
import Processos from './components/Processos'
import DemandasImportantes from './components/DemandasImportantes'
import Relatorios from './components/Relatorios'
import Admin from './components/Admin'
import CalendarioAgendamentos from './components/CalendarioAgendamentos'
// import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import { useFuncionarios, useAgenda, useTarefas } from './hooks/useApi'
import { ApiStatus } from './components/ApiStatus'
import './App.css'
import './styles/animations.css'
import './styles/themes.css'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

  // Carrega dados da API para os badges
  const { data: funcionarios } = useFuncionarios()
  const { data: agenda } = useAgenda()
  const { data: tarefas } = useTarefas()

  // Filtrar apenas tarefas que devem ser computadas
  const tarefasComputadas = agenda?.filter(item => {
    const tarefa = tarefas?.find(t => t.id === (item.tarefa || item.tarefa_id));
    return tarefa?.computar_horas !== false;
  }) || []

  // Itens principais (sempre visíveis)
  const mainNavItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard', shortcut: '1', compact: 'Dash' },
    { path: '/cronograma', icon: Calendar, label: 'Cronograma', shortcut: '2', compact: 'Crono' },
    { path: '/calendario', icon: CalendarDays, label: 'Calendário', shortcut: '3', compact: 'Cal' },
    { path: '/demandas', icon: AlertTriangle, label: 'Demandas', shortcut: '4', compact: 'Dem' }
  ]

  // Itens secundários (no menu dropdown)
  const secondaryNavItems = [

    { path: '/processos', icon: FileText, label: 'Processos', shortcut: '7' },
    { path: '/relatorios', icon: Users, label: 'Relatórios', shortcut: '8' },
    { path: '/admin', icon: Settings, label: 'Admin', shortcut: '9' }
  ]

  const allNavItems = [...mainNavItems, ...secondaryNavItems]

  // Keyboard shortcuts
  const shortcuts = [
    { key: 'ctrl+k', action: () => setSearchOpen(true) },
    { key: 'ctrl+/', action: () => setSearchOpen(true) },
    ...allNavItems.map(item => ({
      key: item.shortcut,
      action: () => navigate(item.path)
    }))
  ]

  // useKeyboardShortcuts(shortcuts)

  const handleSearchNavigate = (page, params = {}) => {
    navigate(`/${page}`, { state: params })
    setSearchOpen(false)
  }

  // Verificar se item está ativo (incluindo subitens)
  const isItemActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return location.pathname === path
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 transition-colors duration-300 shadow-sm">
        <div className="w-full flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
              Workspace Visual
            </h1>
          </div>

          {/* Navegação Principal - Desktop */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isItemActive(item.path)

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 px-3 py-2 transition-all duration-200 ${isActive
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Button>
                </Link>
              )
            })}

            {/* Menu Dropdown para itens secundários */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-4 h-4" />
                <span className="text-sm">Mais</span>
              </Button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = isItemActive(item.path)

                    return (
                      <Link key={item.path} to={item.path}>
                        <div className={`flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
                          }`}>
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Navegação Compacta - Tablet */}
          <div className="hidden md:flex lg:hidden items-center space-x-1 flex-1 justify-center">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isItemActive(item.path)

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex flex-col items-center px-2 py-2 transition-all duration-200 ${isActive
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs mt-1">{item.compact}</span>
                  </Button>
                </Link>
              )
            })}

            {/* Menu Mobile Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center px-2 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-4 h-4" />
              <span className="text-xs mt-1">Mais</span>
            </Button>
          </div>

          {/* Área Direita */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Badges - apenas desktop */}
            <div className="hidden xl:flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 text-xs px-2 py-1">
                {funcionarios?.length || 0} Funcionários
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 text-xs px-2 py-1">
                {tarefasComputadas.length} Tarefas
              </Badge>
            </div>

            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Buscar (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Configurações Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfigOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Configurações Pessoais"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Menu Mobile - apenas mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {/* Itens principais */}
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = isItemActive(item.path)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start space-x-3 py-2 ${isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Itens secundários */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500 px-3 py-1">Mais opções</div>
              {secondaryNavItems.map((item) => {
                const Icon = item.icon
                const isActive = isItemActive(item.path)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start space-x-3 py-2 ${isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Badges e info no menu mobile */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                {funcionarios?.length || 0} Funcionários
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
                {tarefasComputadas.length} Tarefas
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Global Search */}
      {/* <GlobalSearch 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleSearchNavigate}
      /> */}

      {/* Modal de Configurações */}
      <ConfiguracoesPessoais
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </>
  )
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation />

        <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <div className="transition-all duration-300">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route path="/cronograma" element={<Cronograma />} />
              <Route path="/calendario" element={<CalendarioAgendamentos />} />
              <Route path="/demandas" element={<DemandasImportantes />} />
              <Route path="/processos" element={<Processos />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </main>

        {/* Notification Container */}
        <NotificationContainer />
      </div>
    </Router>
  )
}

function App() {
  return (
    <NotificationProvider>
      <UserPreferencesProvider>
        <AppContent />
      </UserPreferencesProvider>
    </NotificationProvider>
  )
}

export default App

