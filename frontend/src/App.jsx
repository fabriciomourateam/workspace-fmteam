import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, Users, FileText, BarChart3, Clock, Filter, Settings, CalendarDays, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ThemeToggle from './components/ThemeToggle'
import NotificationContainer from './components/NotificationContainer'
import GlobalSearch from './components/GlobalSearch'
import Dashboard from './components/Dashboard'
import Cronograma from './components/Cronograma'
import Processos from './components/Processos'
import Relatorios from './components/Relatorios'
import Admin from './components/Admin'
import Calendario from './components/Calendario'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import agendaData from './data/agenda.json'
import './App.css'
import './styles/animations.css'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  
  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard', shortcut: '1' },
    { path: '/cronograma', icon: Calendar, label: 'Cronograma', shortcut: '2' },
    { path: '/calendario', icon: CalendarDays, label: 'Calendário', shortcut: '3' },
    { path: '/processos', icon: FileText, label: 'Processos', shortcut: '4' },
    { path: '/relatorios', icon: Users, label: 'Relatórios', shortcut: '5' },
    { path: '/admin', icon: Settings, label: 'Admin', shortcut: '6' }
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

  useKeyboardShortcuts(shortcuts)

  const handleSearchNavigate = (page, params = {}) => {
    navigate(`/${page}`, { state: params })
    setSearchOpen(false)
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 animate-fadeInLeft">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg flex items-center justify-center shadow-md hover-lift transition-all duration-200">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Workspace Visual
              </h1>
            </div>
            
            <div className="flex space-x-1 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center space-x-2 transition-all duration-200 hover-lift group relative ${
                        isActive 
                          ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-medium">{item.label}</span>
                      
                      {/* Shortcut indicator */}
                      <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded opacity-60 group-hover:opacity-100 transition-opacity">
                        {item.shortcut}
                      </kbd>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 animate-fadeInRight">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 hover-lift"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar</span>
              <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded">
                Ctrl+K
              </kbd>
            </button>

            <Badge 
              variant="outline" 
              className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20 hover-lift transition-all duration-200 font-medium"
            >
              {agendaData.funcionarios.length} Funcionários
            </Badge>
            <Badge 
              variant="outline" 
              className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 hover-lift transition-all duration-200 font-medium"
            >
              {agendaData.agenda.length} Tarefas Agendadas
            </Badge>
            
            <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Global Search */}
      <GlobalSearch 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleSearchNavigate}
      />
    </>
  )
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 py-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <div className="transition-all duration-300">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cronograma" element={<Cronograma />} />
              <Route path="/calendario" element={<Calendario />} />
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
    <ThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App

