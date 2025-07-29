import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Users, FileText, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import agendaData from '../data/agenda.json';
import processosData from '../data/processos.json';

const GlobalSearch = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { isDark } = useTheme();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search functionality
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = [];
    const searchTerm = query.toLowerCase();

    // Search funcionários
    agendaData.funcionarios.forEach(funcionario => {
      if (funcionario.nome.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'funcionario',
          title: funcionario.nome,
          subtitle: `${funcionario.horarioInicio} - ${funcionario.horarioFim}`,
          icon: Users,
          action: () => onNavigate('cronograma', { funcionario: funcionario.id })
        });
      }
    });

    // Search tarefas
    agendaData.tarefas.forEach(tarefa => {
      if (tarefa.nome.toLowerCase().includes(searchTerm) || 
          tarefa.categoria.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'tarefa',
          title: tarefa.nome,
          subtitle: `${tarefa.categoria} • ${tarefa.tempoEstimado}min`,
          icon: Clock,
          action: () => onNavigate('processos', { tarefa: tarefa.id })
        });
      }
    });

    // Search processos
    Object.entries(processosData).forEach(([key, processo]) => {
      if (processo.titulo.toLowerCase().includes(searchTerm) ||
          processo.descricao.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          type: 'processo',
          title: processo.titulo,
          subtitle: processo.descricao,
          icon: FileText,
          action: () => onNavigate('processos', { processo: key })
        });
      }
    });

    // Search agendamentos
    agendaData.agenda.forEach(agendamento => {
      const funcionario = agendaData.funcionarios.find(f => f.id === agendamento.funcionario);
      const tarefa = agendaData.tarefas.find(t => t.id === agendamento.tarefa);
      
      if (funcionario && tarefa && 
          (funcionario.nome.toLowerCase().includes(searchTerm) ||
           tarefa.nome.toLowerCase().includes(searchTerm))) {
        searchResults.push({
          type: 'agendamento',
          title: `${tarefa.nome} - ${funcionario.nome}`,
          subtitle: `${agendamento.horario}`,
          icon: Calendar,
          action: () => onNavigate('calendario', { agendamento: agendamento })
        });
      }
    });

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(0);
  }, [query, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  const getTypeColor = (type) => {
    switch (type) {
      case 'funcionario':
        return 'text-blue-600 dark:text-blue-400';
      case 'tarefa':
        return 'text-green-600 dark:text-green-400';
      case 'processo':
        return 'text-purple-600 dark:text-purple-400';
      case 'agendamento':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'funcionario':
        return 'Funcionário';
      case 'tarefa':
        return 'Tarefa';
      case 'processo':
        return 'Processo';
      case 'agendamento':
        return 'Agendamento';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity modal-overlay"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="flex min-h-full items-start justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl modal-content">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 dark:border-gray-600 px-4 py-3">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar funcionários, tarefas, processos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
            <button
              onClick={onClose}
              className="ml-3 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 && query.trim() && (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum resultado encontrado</p>
                  <p className="text-sm mt-1">Tente usar termos diferentes</p>
                </div>
              </div>
            )}

            {results.length === 0 && !query.trim() && (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Busca Global</p>
                  <p className="text-sm mt-1">Digite para buscar funcionários, tarefas, processos e agendamentos</p>
                </div>
              </div>
            )}

            {results.map((result, index) => {
              const Icon = result.icon;
              const isSelected = index === selectedIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    result.action();
                    onClose();
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500' 
                      : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${getTypeColor(result.type)} bg-gray-100 dark:bg-gray-700`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(result.type)} bg-gray-100 dark:bg-gray-700`}>
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                        {result.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                    <span className="ml-2">Navegar</span>
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Enter</kbd>
                    <span className="ml-2">Selecionar</span>
                  </span>
                </div>
                <span className="flex items-center">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Esc</kbd>
                  <span className="ml-2">Fechar</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;

