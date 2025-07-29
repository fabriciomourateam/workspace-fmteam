import React, { useState, useEffect, useMemo } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, Target, Lightbulb } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import agendaData from '../data/agenda.json';

const SmartInsights = () => {
  const { isDark } = useTheme();
  const { showInfo } = useNotifications();
  const [insights, setInsights] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Análise inteligente dos dados
  const analyzeData = useMemo(() => {
    const funcionarios = agendaData.funcionarios;
    const tarefas = agendaData.tarefas;
    const agenda = agendaData.agenda;

    // Análise de carga de trabalho
    const cargaPorFuncionario = {};
    agenda.forEach(item => {
      const tarefa = tarefas.find(t => t.id === item.tarefa);
      if (tarefa) {
        cargaPorFuncionario[item.funcionario] = (cargaPorFuncionario[item.funcionario] || 0) + tarefa.tempoEstimado;
      }
    });

    // Análise de categorias
    const categoriasCount = {};
    agenda.forEach(item => {
      const tarefa = tarefas.find(t => t.id === item.tarefa);
      if (tarefa) {
        categoriasCount[tarefa.categoria] = (categoriasCount[tarefa.categoria] || 0) + 1;
      }
    });

    // Análise de horários
    const horarios = agenda.map(item => parseInt(item.horario.split(':')[0]));
    const horariosCount = {};
    horarios.forEach(hora => {
      horariosCount[hora] = (horariosCount[hora] || 0) + 1;
    });

    const insights = [];

    // Insight 1: Sobrecarga de funcionários
    const maxCarga = Math.max(...Object.values(cargaPorFuncionario));
    const minCarga = Math.min(...Object.values(cargaPorFuncionario));
    const funcionarioSobrecarregado = Object.keys(cargaPorFuncionario).find(
      id => cargaPorFuncionario[id] === maxCarga
    );
    const funcionarioSubutilizado = Object.keys(cargaPorFuncionario).find(
      id => cargaPorFuncionario[id] === minCarga
    );

    if (maxCarga - minCarga > 120) { // Diferença maior que 2 horas
      const nomeMax = funcionarios.find(f => f.id === funcionarioSobrecarregado)?.nome;
      const nomeMin = funcionarios.find(f => f.id === funcionarioSubutilizado)?.nome;
      
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Desbalanceamento de Carga',
        description: `${nomeMax} tem ${Math.floor(maxCarga / 60)}h${maxCarga % 60}m de tarefas, enquanto ${nomeMin} tem apenas ${Math.floor(minCarga / 60)}h${minCarga % 60}m.`,
        suggestion: 'Considere redistribuir algumas tarefas para equilibrar a carga de trabalho.',
        priority: 'high',
        impact: 'Produtividade e bem-estar da equipe'
      });
    }

    // Insight 2: Categoria dominante
    const categoriaTop = Object.keys(categoriasCount).reduce((a, b) => 
      categoriasCount[a] > categoriasCount[b] ? a : b
    );
    const percentualTop = (categoriasCount[categoriaTop] / agenda.length * 100).toFixed(1);

    if (percentualTop > 40) {
      insights.push({
        type: 'info',
        icon: Target,
        title: 'Foco em Uma Categoria',
        description: `${percentualTop}% das tarefas são de "${categoriaTop}".`,
        suggestion: 'Considere especializar alguns funcionários nesta categoria ou diversificar as atividades.',
        priority: 'medium',
        impact: 'Especialização vs. Flexibilidade da equipe'
      });
    }

    // Insight 3: Horário de pico
    const horarioPico = Object.keys(horariosCount).reduce((a, b) => 
      horariosCount[a] > horariosCount[b] ? a : b
    );
    const tarefasNoPico = horariosCount[horarioPico];

    if (tarefasNoPico > agenda.length * 0.2) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Horário de Alta Produtividade',
        description: `${horarioPico}h é o horário com mais atividades (${tarefasNoPico} tarefas).`,
        suggestion: 'Aproveite este horário para tarefas mais complexas ou importantes.',
        priority: 'low',
        impact: 'Otimização de horários'
      });
    }

    // Insight 4: Oportunidade de automação
    const tarefasRepetitivas = {};
    agenda.forEach(item => {
      const tarefa = tarefas.find(t => t.id === item.tarefa);
      if (tarefa && tarefa.tempoEstimado <= 30) { // Tarefas rápidas
        tarefasRepetitivas[tarefa.nome] = (tarefasRepetitivas[tarefa.nome] || 0) + 1;
      }
    });

    const tarefaMaisRepetitiva = Object.keys(tarefasRepetitivas).reduce((a, b) => 
      tarefasRepetitivas[a] > tarefasRepetitivas[b] ? a : b, ''
    );

    if (tarefasRepetitivas[tarefaMaisRepetitiva] > 5) {
      insights.push({
        type: 'info',
        icon: Brain,
        title: 'Oportunidade de Automação',
        description: `"${tarefaMaisRepetitiva}" aparece ${tarefasRepetitivas[tarefaMaisRepetitiva]} vezes.`,
        suggestion: 'Considere automatizar ou criar templates para esta tarefa recorrente.',
        priority: 'medium',
        impact: 'Eficiência operacional'
      });
    }

    // Insight 5: Distribuição temporal
    const manhaTarefas = horarios.filter(h => h >= 8 && h < 12).length;
    const tardeTarefas = horarios.filter(h => h >= 12 && h < 18).length;
    const noiteTarefas = horarios.filter(h => h >= 18).length;

    const periodoMaisAtivo = manhaTarefas > tardeTarefas && manhaTarefas > noiteTarefas ? 'manhã' :
                            tardeTarefas > noiteTarefas ? 'tarde' : 'noite';

    insights.push({
      type: 'success',
      icon: Clock,
      title: `Equipe Mais Ativa na ${periodoMaisAtivo.charAt(0).toUpperCase() + periodoMaisAtivo.slice(1)}`,
      description: `${periodoMaisAtivo === 'manhã' ? manhaTarefas : periodoMaisAtivo === 'tarde' ? tardeTarefas : noiteTarefas} tarefas concentradas neste período.`,
      suggestion: `Aproveite a ${periodoMaisAtivo} para reuniões importantes e tarefas colaborativas.`,
      priority: 'low',
      impact: 'Planejamento estratégico'
    });

    // Insight 6: Eficiência da equipe
    const tempoMedioPorTarefa = Object.values(cargaPorFuncionario).reduce((a, b) => a + b, 0) / funcionarios.length;
    const eficienciaScore = tempoMedioPorTarefa > 300 ? 'baixa' : tempoMedioPorTarefa > 180 ? 'média' : 'alta';

    insights.push({
      type: eficienciaScore === 'alta' ? 'success' : eficienciaScore === 'média' ? 'info' : 'warning',
      icon: Users,
      title: `Eficiência da Equipe: ${eficienciaScore.charAt(0).toUpperCase() + eficienciaScore.slice(1)}`,
      description: `Tempo médio por funcionário: ${Math.floor(tempoMedioPorTarefa / 60)}h${Math.floor(tempoMedioPorTarefa % 60)}m.`,
      suggestion: eficienciaScore === 'baixa' 
        ? 'Considere otimizar processos ou redistribuir tarefas.'
        : eficienciaScore === 'média'
        ? 'Há espaço para pequenas otimizações nos processos.'
        : 'Excelente distribuição! Mantenha este padrão.',
      priority: eficienciaScore === 'baixa' ? 'high' : 'low',
      impact: 'Performance geral da equipe'
    });

    return insights;
  }, []);

  useEffect(() => {
    // Simular análise
    const timer = setTimeout(() => {
      setInsights(analyzeData);
      setIsAnalyzing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [analyzeData]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Analisando dados com IA...
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover-lift transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Insights Inteligentes
          </h3>
        </div>
        <button
          onClick={() => showInfo('Insights atualizados com base nos dados mais recentes')}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Atualizar
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`border-l-4 p-4 rounded-r-lg transition-all duration-200 hover:shadow-md ${getPriorityColor(insight.priority)}`}
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-lg mr-4 ${getTypeIcon(insight.type)} bg-white dark:bg-gray-700`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      insight.priority === 'high' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : insight.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}>
                      {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-3">
                    <div className="flex items-start">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Sugestão:</strong> {insight.suggestion}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Target className="h-3 w-3 mr-1" />
                    <span>Impacto: {insight.impact}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum insight disponível no momento.
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Insights gerados automaticamente com base nos dados da equipe • Última atualização: {new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
};

export default SmartInsights;

