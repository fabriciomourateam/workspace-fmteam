import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, Users, FileText, BarChart3, Clock, Filter, Settings, CalendarDays, Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { ThemeProvider } from './contexts/ThemeContext'
// import { NotificationProvider } from './contexts/NotificationContext'
// import ThemeToggle from './components/ThemeToggle'
// import NotificationContainer from './components/NotificationContainer'
// import GlobalSearch from './components/GlobalSearch'
import Dashboard from './components/DashboardNew'
import DashboardAvancado from './components/DashboardAvancado'
import MetasKPIs from './components/MetasKPIs'
import Cronograma from './components/Cronograma'
import Processos from './components/Processos'
import Relatorios from './components/Relatorios'
import Admin from './components/AdminFixed'
import Calendario from './components/Calendario'
// import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import { useFuncionarios, useAgenda } from './hooks/useApi'
import { ApiStatus } from './components/ApiStatus'
import './App.css'
import './styles/animations.css'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Carrega dados da API para os badges
  const { data: funcionarios } = useFuncionarios()
  const { data: agenda } = useAgenda()
  
  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard', shortcut: '1' },
    { path: '/dashboard-avancado', icon: Clock, label: 'Dashboard Avançado', shortcut: '2' },
    { path: '/metas', icon: Filter, label: 'Metas & KPIs', shortcut: '3' },
    { path: '/cronograma', icon: Calendar, label: 'Cronograma', shortcut: '4' },
    { path: '/calendario', icon: CalendarDays, label: 'Calendário', shortcut: '5' },
    { path: '/processos', icon: FileText, label: 'Processos', shortcut: '6' },
    { path: '/relatorios', icon: Users, label: 'Relatórios', shortcut: '7' },
    { path: '/admin', icon: Settings, label: 'Admin', shortcut: '8' }
  ]

  // Keyboard shortcuts
  const shortcuts = [
    { key: 'ctrl+k', action: () => setSearchOpen(true) },
    { key: 'ctrl+/', action: () => setSearchOpen(true) },
    ...navItems.map(item => ({
      key: item.shortcut,
      action: () => navigate(item.path)
    }))
  ]

  // useKeyboardShortcuts(shortcuts)

  const handleSearchNavigate = (page, params = {}) => {
    navigate(`/${page}`, { state: params })
    setSearchOpen(false)
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 transition-colors duration-300 shadow-sm">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 animate-fadeInLeft">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg flex items-center justify-center shadow-md hover-lift transition-all duration-200">
                <Clock className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                <span className="hidden sm:inline">Workspace Visual</span>
                <span className="sm:hidden">WV</span>
              </h1>
            </div>
            
            {/* Navegação - escondida em telas pequenas */}
            <div className="hidden lg:flex space-x-1 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`flex items-center space-x-2 transition-all duration-200 hover-lift group relative px-3 ${
                        isActive 
                          ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-medium text-sm">{item.label}</span>
                      
                      {/* Shortcut indicator */}
                      <kbd className="hidden xl:inline-block ml-2 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded opacity-60 group-hover:opacity-100 transition-opacity">
                        {item.shortcut}
                      </kbd>
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Navegação compacta para telas médias */}
            <div className="hidden md:flex lg:hidden space-x-0.5 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`flex items-center transition-all duration-200 hover-lift group relative px-2 ${
                        isActive 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={item.label}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 animate-fadeInRight flex-shrink-0">
            {/* Search Button - compacto */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center px-2 py-1.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
              title="Buscar (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline ml-2 text-sm">Buscar</span>
            </button>

            {/* Badges - apenas em telas grandes */}
            <div className="hidden xl:flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className="text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20 text-xs px-2 py-1"
              >
                {funcionarios?.length || 0} Funcionários
              </Badge>
              <Badge 
                variant="outline" 
                className="text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-xs px-2 py-1"
              >
                {agenda?.length || 0} Tarefas
              </Badge>
            </div>
            
            {/* Badges compactos para telas médias */}
            <div className="hidden md:flex xl:hidden items-center space-x-1">
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-1 py-0.5">
                {funcionarios?.length || 0}
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs px-1 py-0.5">
                {agenda?.length || 0}
              </Badge>
            </div>
            
            {/* <ThemeToggle /> */}
          </div>
        </div>

        {/* Menu Mobile - para telas menores que lg */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </nav>

      {/* Menu Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start space-x-3 py-2 ${
                      isActive 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
            
            {/* Badges e info no menu mobile */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
              <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                {funcionarios?.length || 0} Funcionários
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
                {agenda?.length || 0} Tarefas
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
              <Route path="/dashboard-avancado" element={<DashboardAvancado />} />
              <Route path="/metas" element={<MetasKPIs />} />
              <Route path="/cronograma" element={<Cronograma />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/processos" element={<Processos />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </main>

        {/* Notification Container */}
        {/* <NotificationContainer /> */}
      </div>
    </Router>
  )
}

function App() {
  return (
    <AppContent />
  )
}

export default App

