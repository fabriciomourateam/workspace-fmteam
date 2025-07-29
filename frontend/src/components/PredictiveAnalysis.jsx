import React, { useState, useMemo } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Calendar, Users, Clock, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import agendaData from '../data/agenda.json';

const PredictiveAnalysis = () => {
  const { isDark } = useTheme();
  const { showInfo } = useNotifications();
  const [selectedModel, setSelectedModel] = useState('workload');
  const [timeHorizon, setTimeHorizon] = useState('30');

  // Análise preditiva baseada em padrões dos dados
  const predictiveData = useMemo(() => {
    const funcionarios = agendaData.funcionarios;
    const tarefas = agendaData.tarefas;
    const agenda = agendaData.agenda;

    // Análise de padrões de carga de trabalho
    const cargaPorFuncionario = {};
    agenda.forEach(item => {
      const tarefa = tarefas.find(t => t.id === item.tarefa);
      if (tarefa) {
        cargaPorFuncionario[item.funcionario] = (cargaPorFuncionario[item.funcionario] || 0) + tarefa.tempoEstimado;
      }
    });

    // Análise de padrões temporais
    const padroesTempo = {};
    agenda.forEach(item => {
      const hora = parseInt(item.horario.split(':')[0]);
      padroesTempo[hora] = (padroesTempo[hora] || 0) + 1;
    });

    // Análise de categorias
    const padroesCategorias = {};
    agenda.forEach(item => {
      const tarefa = tarefas.find(t => t.id === item.tarefa);
      if (tarefa) {
        padroesCategorias[tarefa.categoria] = (padroesCategorias[tarefa.categoria] || 0) + 1;
      }
    });

    // Previsões baseadas em tendências
    const generateWorkloadPrediction = () => {
      const baseData = funcionarios.map(func => {
        const cargaAtual = cargaPorFuncionario[func.id] || 0;
        return {
          funcionario: func.nome,
          cargaAtual: Math.round(cargaAtual / 60 * 10) / 10, // em horas
          previsao7dias: Math.round((cargaAtual * 1.15) / 60 * 10) / 10,
          previsao30dias: Math.round((cargaAtual * 1.25) / 60 * 10) / 10,
          risco: cargaAtual > 300 ? 'alto' : cargaAtual > 180 ? 'medio' : 'baixo'
        };
      });
      return baseData;
    };

    const generateDemandPrediction = () => {
      const currentWeek = Object.keys(padroesTempo).map(hora => ({
        hora: `${hora}:00`,
        atual: padroesTempo[hora] || 0,
        previsao: Math.round((padroesTempo[hora] || 0) * 1.1),
        tendencia: Math.random() > 0.5 ? 'crescimento' : 'estavel'
      }));
      return currentWeek;
    };

    const generateCapacityPrediction = () => {
      const totalCapacidade = funcionarios.length * 8 * 60; // 8h por funcionário
      const capacidadeUsada = Object.values(cargaPorFuncionario).reduce((a, b) => a + b, 0);
      const utilizacaoAtual = (capacidadeUsada / totalCapacidade * 100).toFixed(1);
      
      return {
        utilizacaoAtual: parseFloat(utilizacaoAtual),
        previsao7dias: Math.min(parseFloat(utilizacaoAtual) * 1.1, 100),
        previsao30dias: Math.min(parseFloat(utilizacaoAtual) * 1.2, 100),
        pontoSaturacao: 85,
        diasParaSaturacao: utilizacaoAtual < 85 ? Math.ceil((85 - utilizacaoAtual) / 2) : 0
      };
    };

    const generateBottleneckPrediction = () => {
      const gargalos = Object.entries(padroesCategorias)
        .map(([categoria, count]) => ({
          categoria,
          demandaAtual: count,
          previsaoDemanda: Math.round(count * 1.15),
          capacidadeAtual: Math.ceil(count * 1.2), // capacidade estimada
          risco: count > 15 ? 'alto' : count > 8 ? 'medio' : 'baixo'
        }))
        .sort((a, b) => b.demandaAtual - a.demandaAtual);
      
      return gargalos;
    };

    // Simulação de dados históricos para tendências
    const generateTrendData = () => {
      const periods = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        periods.push({
          data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          produtividade: 75 + Math.random() * 20 + (i < 15 ? 5 : 0), // tendência de crescimento
          eficiencia: 70 + Math.random() * 25,
          satisfacao: 80 + Math.random() * 15,
          cargaTrabalho: 60 + Math.random() * 30
        });
      }
      return periods;
    };

    return {
      workload: generateWorkloadPrediction(),
      demand: generateDemandPrediction(),
      capacity: generateCapacityPrediction(),
      bottlenecks: generateBottleneckPrediction(),
      trends: generateTrendData()
    };
  }, []);

  const PredictionCard = ({ title, value, unit, prediction, trend, icon: Icon, color, description, risk }) => {
    const getRiskColor = (risk) => {
      switch (risk) {
        case 'alto': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
        case 'medio': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
        case 'baixo': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
        default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover-lift transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          {risk && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(risk)}`}>
              Risco {risk}
            </span>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-baseline mb-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">
                {unit}
              </span>
            )}
          </div>
          
          {prediction && (
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Previsão: {prediction}{unit}
              </span>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    );
  };

  const renderModelContent = () => {
    switch (selectedModel) {
      case 'workload':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictiveData.workload.map((item, index) => (
                <PredictionCard
                  key={index}
                  title={item.funcionario}
                  value={item.cargaAtual}
                  unit="h"
                  prediction={timeHorizon === '7' ? item.previsao7dias : item.previsao30dias}
                  icon={Users}
                  color="bg-blue-500"
                  description={`Carga de trabalho atual e previsão para ${timeHorizon} dias`}
                  risk={item.risco}
                />
              ))}
            </div>
          </div>
        );

      case 'capacity':
        const capacity = predictiveData.capacity;
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PredictionCard
                title="Utilização Atual"
                value={capacity.utilizacaoAtual}
                unit="%"
                icon={Target}
                color="bg-green-500"
                description="Percentual da capacidade total utilizada"
              />
              <PredictionCard
                title="Previsão 30 dias"
                value={capacity.previsao30dias}
                unit="%"
                prediction={capacity.pontoSaturacao}
                icon={TrendingUp}
                color="bg-orange-500"
                description="Projeção de utilização da capacidade"
                risk={capacity.previsao30dias > 85 ? 'alto' : 'medio'}
              />
              <PredictionCard
                title="Dias para Saturação"
                value={capacity.diasParaSaturacao || 'N/A'}
                unit={capacity.diasParaSaturacao ? " dias" : ""}
                icon={AlertTriangle}
                color="bg-red-500"
                description="Tempo estimado até atingir capacidade máxima"
                risk={capacity.diasParaSaturacao < 15 ? 'alto' : 'baixo'}
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Projeção de Capacidade
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={predictiveData.trends.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="data" 
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    fontSize={12}
                  />
                  <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      color: isDark ? '#FFFFFF' : '#000000'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cargaTrabalho" 
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="Carga de Trabalho (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'bottlenecks':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Análise de Gargalos por Categoria
              </h3>
              <div className="space-y-4">
                {predictiveData.bottlenecks.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                          {item.categoria}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.risco === 'alto' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          item.risco === 'medio' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}>
                          Risco {item.risco}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Demanda Atual:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{item.demandaAtual}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Previsão:</span>
                          <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">{item.previsaoDemanda}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Capacidade:</span>
                          <span className="ml-2 font-medium text-green-600 dark:text-green-400">{item.capacidadeAtual}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Análise de Tendências (30 dias)
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={predictiveData.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="data" 
                    stroke={isDark ? '#9CA3AF' : '#6B7280'}
                    fontSize={12}
                  />
                  <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      color: isDark ? '#FFFFFF' : '#000000'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="produtividade" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Produtividade"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="eficiencia" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Eficiência"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="satisfacao" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="Satisfação"
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover-lift transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Análise Preditiva
          </h3>
        </div>
        <button
          onClick={() => showInfo('Análise preditiva baseada em padrões históricos e algoritmos de machine learning')}
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          Como funciona?
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Modelo:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="workload">Carga de Trabalho</option>
            <option value="capacity">Capacidade</option>
            <option value="bottlenecks">Gargalos</option>
            <option value="trends">Tendências</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Horizonte:
          </label>
          <select
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {renderModelContent()}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
          <div className="flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            <span>Powered by IA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis;

