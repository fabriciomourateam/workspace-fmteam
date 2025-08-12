import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, Users, Clock, AlertTriangle, CheckCircle, BarChart3, PieChart, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import agendaData from '../data/agenda.json';

const ExecutiveKPIs = () => {
  const { isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Análise de KPIs
  const kpiData = useMemo(() => {
    const funcionarios = agendaData.funcionarios;
    const tarefas = agendaData.tarefas;
    const agenda = agendaData.agenda;

    // Cálculo de produtividade por funcionário
    const produtividadePorFuncionario = {};
    agenda.forEach(item => {
      const tarefa = tarefas.find(t => t.id === item.tarefa);
      if (tarefa) {
        if (!produtividadePorFuncionario[item.funcionario]) {
          produtividadePorFuncionario[item.funcionario] = {
            totalTarefas: 0,
            tempoTotal: 0,
            categorias: {}
          };
        }
        produtividadePorFuncionario[item.funcionario].totalTarefas++;
        produtividadePorFuncionario[item.funcionario].tempoTotal += tarefa.tempoEstimado;
        
        const categoria = tarefa.categoria;
        if (!produtividadePorFuncionario[item.funcionario].categorias[categoria]) {
          produtividadePorFuncionario[item.funcionario].categorias[categoria] = 0;
        }
        produtividadePorFuncionario[item.funcionario].categorias[categoria]++;
      }
    });

    // KPIs principais - apenas tarefas computadas
    const totalTarefas = agenda.filter(item => {
      const tarefa = tarefas.find(t => t.id === item.tarefa);
      return tarefa?.computar_horas !== false;
    }).length;
    const tempoTotalEstimado = agenda.reduce((total, item) => {
      const tarefa = tarefas.find(t => t.id === item.tarefa);
      return total + (tarefa ? tarefa.tempoEstimado : 0);
    }, 0);

    const mediaTarefasPorFuncionario = totalTarefas / funcionarios.length;
    const mediaTemposPorFuncionario = tempoTotalEstimado / funcionarios.length;

    // Eficiência da equipe (baseada na distribuição de carga)
    const cargas = Object.values(produtividadePorFuncionario).map(p => p.tempoTotal);
    const maxCarga = Math.max(...cargas);
    const minCarga = Math.min(...cargas);
    const eficienciaDistribuicao = ((1 - (maxCarga - minCarga) / maxCarga) * 100).toFixed(1);

    // Taxa de utilização por categoria
    const utilizacaoCategorias = {};
    tarefas.forEach(tarefa => {
      const count = agenda.filter(item => item.tarefa === tarefa.id).length;
      if (!utilizacaoCategorias[tarefa.categoria]) {
        utilizacaoCategorias[tarefa.categoria] = 0;
      }
      utilizacaoCategorias[tarefa.categoria] += count;
    });

    // Dados para gráficos
    const produtividadeChart = funcionarios.map(func => {
      const prod = produtividadePorFuncionario[func.id] || { totalTarefas: 0, tempoTotal: 0 };
      return {
        nome: func.nome,
        tarefas: prod.totalTarefas,
        tempo: Math.round(prod.tempoTotal / 60 * 10) / 10, // em horas
        eficiencia: prod.totalTarefas > 0 ? Math.round((prod.totalTarefas / (prod.tempoTotal / 60)) * 10) / 10 : 0
      };
    });

    const categoriasChart = Object.entries(utilizacaoCategorias).map(([categoria, count]) => ({
      categoria,
      tarefas: count,
      percentual: ((count / totalTarefas) * 100).toFixed(1)
    }));

    // Tendências simuladas (em um cenário real, viriam de dados históricos)
    const tendenciasChart = [
      { periodo: 'Jan', produtividade: 85, eficiencia: 78, satisfacao: 82 },
      { periodo: 'Fev', produtividade: 88, eficiencia: 81, satisfacao: 85 },
      { periodo: 'Mar', produtividade: 92, eficiencia: 85, satisfacao: 88 },
      { periodo: 'Abr', produtividade: 89, eficiencia: 83, satisfacao: 86 },
      { periodo: 'Mai', produtividade: 94, eficiencia: 87, satisfacao: 90 },
      { periodo: 'Jun', produtividade: 96, eficiencia: 89, satisfacao: 92 }
    ];

    return {
      kpis: {
        totalTarefas,
        tempoTotalEstimado: Math.round(tempoTotalEstimado / 60 * 10) / 10, // em horas
        mediaTarefasPorFuncionario: Math.round(mediaTarefasPorFuncionario * 10) / 10,
        mediaTemposPorFuncionario: Math.round(mediaTemposPorFuncionario / 60 * 10) / 10, // em horas
        eficienciaDistribuicao: parseFloat(eficienciaDistribuicao),
        utilizacaoEquipe: Math.round((totalTarefas / (funcionarios.length * 10)) * 100), // assumindo 10 tarefas como capacidade máxima
        categoriaTop: Object.keys(utilizacaoCategorias).reduce((a, b) => utilizacaoCategorias[a] > utilizacaoCategorias[b] ? a : b)
      },
      charts: {
        produtividade: produtividadeChart,
        categorias: categoriasChart,
        tendencias: tendenciasChart
      }
    };
  }, []);

  const KPICard = ({ title, value, unit, trend, trendValue, icon: Icon, color, description }) => {
    const isPositiveTrend = trend === 'up';
    const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover-lift transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          {trendValue && (
            <div className={`flex items-center text-sm font-medium ${
              isPositiveTrend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <TrendIcon className="h-4 w-4 mr-1" />
              {trendValue}%
            </div>
          )}
        </div>
        
        <div className="mb-2">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">
                {unit}
              </span>
            )}
          </div>
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

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            KPIs Executivos
          </h2>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="quarter">Último Trimestre</option>
          <option value="year">Último Ano</option>
        </select>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Tarefas"
          value={kpiData.kpis.totalTarefas}
          trend="up"
          trendValue="12"
          icon={Target}
          color="bg-blue-500"
          description="Tarefas agendadas no período"
        />
        
        <KPICard
          title="Tempo Total"
          value={kpiData.kpis.tempoTotalEstimado}
          unit="h"
          trend="up"
          trendValue="8"
          icon={Clock}
          color="bg-green-500"
          description="Horas de trabalho estimadas"
        />
        
        <KPICard
          title="Eficiência da Distribuição"
          value={kpiData.kpis.eficienciaDistribuicao}
          unit="%"
          trend={kpiData.kpis.eficienciaDistribuicao > 75 ? "up" : "down"}
          trendValue="5"
          icon={Activity}
          color="bg-purple-500"
          description="Balanceamento de carga da equipe"
        />
        
        <KPICard
          title="Utilização da Equipe"
          value={kpiData.kpis.utilizacaoEquipe}
          unit="%"
          trend="up"
          trendValue="3"
          icon={Users}
          color="bg-orange-500"
          description="Capacidade utilizada da equipe"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtividade por Funcionário */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Produtividade por Funcionário
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData.charts.produtividade}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="nome" 
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
              <Bar dataKey="tarefas" fill="#3B82F6" name="Tarefas" />
              <Bar dataKey="tempo" fill="#10B981" name="Tempo (h)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Categoria */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={kpiData.charts.categorias}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="tarefas"
                label={({ categoria, percentual }) => `${categoria}: ${percentual}%`}
              >
                {kpiData.charts.categorias.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: isDark ? '#FFFFFF' : '#000000'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendências */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tendências de Performance
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={kpiData.charts.tendencias}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
            <XAxis 
              dataKey="periodo" 
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
              strokeWidth={3}
              name="Produtividade (%)"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="eficiencia" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Eficiência (%)"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="satisfacao" 
              stroke="#F59E0B" 
              strokeWidth={3}
              name="Satisfação (%)"
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Executivos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Insights Executivos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Pontos Fortes</span>
            </div>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Distribuição equilibrada de tarefas</li>
              <li>• Alta utilização da equipe ({kpiData.kpis.utilizacaoEquipe}%)</li>
              <li>• Categoria "{kpiData.kpis.categoriaTop}" bem estruturada</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="font-medium text-yellow-900 dark:text-yellow-100">Atenção</span>
            </div>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Monitorar sobrecarga individual</li>
              <li>• Avaliar eficiência por categoria</li>
              <li>• Considerar redistribuição de tarefas</li>
            </ul>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="font-medium text-green-900 dark:text-green-100">Oportunidades</span>
            </div>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• Automatizar tarefas repetitivas</li>
              <li>• Especializar funcionários</li>
              <li>• Otimizar horários de pico</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveKPIs;

