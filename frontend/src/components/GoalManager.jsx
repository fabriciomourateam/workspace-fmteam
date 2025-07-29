import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit3, Trash2, Calendar, TrendingUp, Award, Users, CheckCircle, Clock } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import agendaData from '../data/agenda.json';
import 'react-circular-progressbar/dist/styles.css';

const GoalManager = () => {
  const { isDark } = useTheme();
  const { showSuccess, showError } = useNotifications();
  const [goals, setGoals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Carregar metas do localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('workspace-goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Metas padrão baseadas nos desafios do usuário
      const defaultGoals = [
        {
          id: 1,
          titulo: 'Autonomia da Equipe',
          descricao: 'Reduzir dependência do gestor em 50% através de treinamento e processos',
          tipo: 'autonomia',
          funcionarios: agendaData.funcionarios.map(f => f.id),
          metaValor: 80,
          valorAtual: 45,
          unidade: '%',
          prazo: '2024-12-31',
          status: 'em_andamento',
          prioridade: 'alta',
          criadoEm: new Date().toISOString()
        },
        {
          id: 2,
          titulo: 'Eficiência de Processos',
          descricao: 'Aumentar eficiência operacional para escalar o negócio',
          tipo: 'eficiencia',
          funcionarios: agendaData.funcionarios.slice(0, 3).map(f => f.id),
          metaValor: 90,
          valorAtual: 72,
          unidade: '%',
          prazo: '2024-10-31',
          status: 'em_andamento',
          prioridade: 'alta',
          criadoEm: new Date().toISOString()
        },
        {
          id: 3,
          titulo: 'Retenção de Talentos',
          descricao: 'Manter 95% da equipe através de cultura organizacional forte',
          tipo: 'retencao',
          funcionarios: agendaData.funcionarios.map(f => f.id),
          metaValor: 95,
          valorAtual: 88,
          unidade: '%',
          prazo: '2024-12-31',
          status: 'em_andamento',
          prioridade: 'media',
          criadoEm: new Date().toISOString()
        }
      ];
      setGoals(defaultGoals);
      localStorage.setItem('workspace-goals', JSON.stringify(defaultGoals));
    }
  }, []);

  // Salvar metas no localStorage
  const saveGoals = (newGoals) => {
    setGoals(newGoals);
    localStorage.setItem('workspace-goals', JSON.stringify(newGoals));
  };

  const GoalForm = ({ goal = null, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      titulo: goal?.titulo || '',
      descricao: goal?.descricao || '',
      tipo: goal?.tipo || 'produtividade',
      funcionarios: goal?.funcionarios || [],
      metaValor: goal?.metaValor || 100,
      valorAtual: goal?.valorAtual || 0,
      unidade: goal?.unidade || '%',
      prazo: goal?.prazo || '',
      prioridade: goal?.prioridade || 'media'
    });

    const tiposMeta = [
      { id: 'produtividade', label: 'Produtividade', icon: TrendingUp },
      { id: 'autonomia', label: 'Autonomia da Equipe', icon: Users },
      { id: 'eficiencia', label: 'Eficiência', icon: Target },
      { id: 'retencao', label: 'Retenção de Talentos', icon: Award },
      { id: 'treinamento', label: 'Treinamento', icon: CheckCircle },
      { id: 'qualidade', label: 'Qualidade', icon: Award }
    ];

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!formData.titulo || !formData.prazo || formData.funcionarios.length === 0) {
        showError('Preencha todos os campos obrigatórios');
        return;
      }

      const newGoal = {
        id: goal?.id || Date.now(),
        ...formData,
        status: goal?.status || 'em_andamento',
        criadoEm: goal?.criadoEm || new Date().toISOString()
      };

      onSave(newGoal);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity modal-overlay" onClick={onCancel} />
        
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {goal ? 'Editar Meta' : 'Nova Meta'}
              </h3>
              <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título da Meta *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ex: Aumentar produtividade da equipe"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Descreva os objetivos e como medir o sucesso..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Meta
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  >
                    {tiposMeta.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor da Meta
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={formData.metaValor}
                      onChange={(e) => setFormData({ ...formData, metaValor: parseInt(e.target.value) })}
                      className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      required
                    />
                    <select
                      value={formData.unidade}
                      onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                      className="rounded-r-md border-l-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="%">%</option>
                      <option value="horas">horas</option>
                      <option value="tarefas">tarefas</option>
                      <option value="pontos">pontos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor Atual
                  </label>
                  <input
                    type="number"
                    value={formData.valorAtual}
                    onChange={(e) => setFormData({ ...formData, valorAtual: parseInt(e.target.value) })}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    min="0"
                    max={formData.metaValor}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Funcionários Envolvidos *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {agendaData.funcionarios.map(func => (
                      <label key={func.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.funcionarios.includes(func.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                funcionarios: [...formData.funcionarios, func.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                funcionarios: formData.funcionarios.filter(id => id !== func.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {func.nome}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prazo *
                  </label>
                  <input
                    type="date"
                    value={formData.prazo}
                    onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  {goal ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const handleAddGoal = (newGoal) => {
    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);
    setShowAddForm(false);
    showSuccess('Meta criada com sucesso');
  };

  const handleEditGoal = (updatedGoal) => {
    const updatedGoals = goals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    );
    saveGoals(updatedGoals);
    setEditingGoal(null);
    showSuccess('Meta atualizada com sucesso');
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      const updatedGoals = goals.filter(goal => goal.id !== id);
      saveGoals(updatedGoals);
      showSuccess('Meta excluída com sucesso');
    }
  };

  const updateGoalProgress = (id, newValue) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id ? { ...goal, valorAtual: newValue } : goal
    );
    saveGoals(updatedGoals);
    showSuccess('Progresso atualizado');
  };

  const getTipoInfo = (tipo) => {
    const tipos = {
      produtividade: { label: 'Produtividade', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: TrendingUp },
      autonomia: { label: 'Autonomia', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', icon: Users },
      eficiencia: { label: 'Eficiência', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: Target },
      retencao: { label: 'Retenção', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Award },
      treinamento: { label: 'Treinamento', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300', icon: CheckCircle },
      qualidade: { label: 'Qualidade', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300', icon: Award }
    };
    return tipos[tipo] || { label: tipo, color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300', icon: Target };
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'media': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'baixa': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (prazo) => {
    const today = new Date();
    const deadline = new Date(prazo);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover-lift transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestão de Metas
          </h3>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors hover-lift"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {goals.length}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Total de Metas</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {goals.filter(g => (g.valorAtual / g.metaValor) >= 1).length}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">Concluídas</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {goals.filter(g => (g.valorAtual / g.metaValor) >= 0.5 && (g.valorAtual / g.metaValor) < 1).length}
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">Em Progresso</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {goals.filter(g => getDaysRemaining(g.prazo) < 7).length}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">Próximas ao Prazo</div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nenhuma meta definida
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const tipoInfo = getTipoInfo(goal.tipo);
            const TipoIcon = tipoInfo.icon;
            const progresso = Math.round((goal.valorAtual / goal.metaValor) * 100);
            const diasRestantes = getDaysRemaining(goal.prazo);
            const funcionariosNomes = goal.funcionarios
              .map(id => agendaData.funcionarios.find(f => f.id === id)?.nome)
              .filter(Boolean)
              .join(', ');

            return (
              <div
                key={goal.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <TipoIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {goal.titulo}
                      </h4>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${tipoInfo.color}`}>
                        {tipoInfo.label}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPrioridadeColor(goal.prioridade)}`}>
                        {goal.prioridade.charAt(0).toUpperCase() + goal.prioridade.slice(1)}
                      </span>
                    </div>
                    
                    {goal.descricao && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {goal.descricao}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progresso */}
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 mr-4">
                    <CircularProgressbar
                      value={progresso}
                      text={`${progresso}%`}
                      styles={buildStyles({
                        textSize: '24px',
                        pathColor: progresso >= 100 ? '#10B981' : progresso >= 75 ? '#3B82F6' : progresso >= 50 ? '#F59E0B' : '#EF4444',
                        textColor: isDark ? '#FFFFFF' : '#000000',
                        trailColor: isDark ? '#374151' : '#E5E7EB'
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {goal.valorAtual} / {goal.metaValor} {goal.unidade}
                      </span>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencido'}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={goal.valorAtual}
                        onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                        min="0"
                        max={goal.metaValor}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {goal.unidade}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informações adicionais */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="truncate">{funcionariosNomes}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Prazo: {formatDate(goal.prazo)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Forms */}
      {showAddForm && (
        <GoalForm
          onSave={handleAddGoal}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingGoal && (
        <GoalForm
          goal={editingGoal}
          onSave={handleEditGoal}
          onCancel={() => setEditingGoal(null)}
        />
      )}
    </div>
  );
};

export default GoalManager;

