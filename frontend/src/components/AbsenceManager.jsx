import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Clock, User, AlertCircle, CheckCircle, Edit3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import agendaData from '../data/agenda.json';

const AbsenceManager = () => {
  const { isDark } = useTheme();
  const { showSuccess, showError } = useNotifications();
  const [absences, setAbsences] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null);

  // Carregar ausências do localStorage
  useEffect(() => {
    const savedAbsences = localStorage.getItem('workspace-absences');
    if (savedAbsences) {
      setAbsences(JSON.parse(savedAbsences));
    }
  }, []);

  // Salvar ausências no localStorage
  const saveAbsences = (newAbsences) => {
    setAbsences(newAbsences);
    localStorage.setItem('workspace-absences', JSON.stringify(newAbsences));
  };

  const AbsenceForm = ({ absence = null, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      funcionario: absence?.funcionario || '',
      tipo: absence?.tipo || 'ferias',
      dataInicio: absence?.dataInicio || '',
      dataFim: absence?.dataFim || '',
      motivo: absence?.motivo || '',
      status: absence?.status || 'pendente'
    });

    const tiposAusencia = [
      { id: 'ferias', label: 'Férias', color: 'bg-green-100 text-green-800' },
      { id: 'licenca', label: 'Licença Médica', color: 'bg-red-100 text-red-800' },
      { id: 'falta', label: 'Falta', color: 'bg-yellow-100 text-yellow-800' },
      { id: 'folga', label: 'Folga', color: 'bg-blue-100 text-blue-800' },
      { id: 'home_office', label: 'Home Office', color: 'bg-purple-100 text-purple-800' }
    ];

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!formData.funcionario || !formData.dataInicio || !formData.dataFim) {
        showError('Preencha todos os campos obrigatórios');
        return;
      }

      const newAbsence = {
        id: absence?.id || Date.now(),
        ...formData,
        criadoEm: absence?.criadoEm || new Date().toISOString()
      };

      onSave(newAbsence);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity modal-overlay" onClick={onCancel} />
        
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {absence ? 'Editar Ausência' : 'Nova Ausência'}
              </h3>
              <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Funcionário *
                </label>
                <select
                  value={formData.funcionario}
                  onChange={(e) => setFormData({ ...formData, funcionario: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um funcionário</option>
                  {agendaData.funcionarios.map(func => (
                    <option key={func.id} value={func.id}>
                      {func.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Ausência *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {tiposAusencia.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Fim *
                  </label>
                  <input
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo/Observações
                </label>
                <textarea
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Descreva o motivo da ausência..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
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
                  {absence ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const handleAddAbsence = (newAbsence) => {
    const updatedAbsences = [...absences, newAbsence];
    saveAbsences(updatedAbsences);
    setShowAddForm(false);
    showSuccess('Ausência criada com sucesso');
  };

  const handleEditAbsence = (updatedAbsence) => {
    const updatedAbsences = absences.map(abs => 
      abs.id === updatedAbsence.id ? updatedAbsence : abs
    );
    saveAbsences(updatedAbsences);
    setEditingAbsence(null);
    showSuccess('Ausência atualizada com sucesso');
  };

  const handleDeleteAbsence = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta ausência?')) {
      const updatedAbsences = absences.filter(abs => abs.id !== id);
      saveAbsences(updatedAbsences);
      showSuccess('Ausência excluída com sucesso');
    }
  };

  const getTipoInfo = (tipo) => {
    const tipos = {
      ferias: { label: 'Férias', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
      licenca: { label: 'Licença Médica', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' },
      falta: { label: 'Falta', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
      folga: { label: 'Folga', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
      home_office: { label: 'Home Office', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' }
    };
    return tipos[tipo] || { label: tipo, color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300' };
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pendente: { label: 'Pendente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Clock },
      aprovado: { label: 'Aprovado', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle },
      rejeitado: { label: 'Rejeitado', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: AlertCircle }
    };
    return statuses[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300', icon: Clock };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover-lift transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestão de Ausências
          </h3>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors hover-lift"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Ausência
        </button>
      </div>

      {absences.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Nenhuma ausência registrada
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Registrar primeira ausência
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {absences.map((absence) => {
            const funcionario = agendaData.funcionarios.find(f => f.id === absence.funcionario);
            const tipoInfo = getTipoInfo(absence.tipo);
            const statusInfo = getStatusInfo(absence.status);
            const StatusIcon = statusInfo.icon;
            const dias = calculateDays(absence.dataInicio, absence.dataFim);

            return (
              <div
                key={absence.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {funcionario?.nome || 'Funcionário não encontrado'}
                      </span>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${tipoInfo.color}`}>
                        {tipoInfo.label}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full flex items-center ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(absence.dataInicio)} até {formatDate(absence.dataFim)}
                      </span>
                      <span className="ml-2 text-gray-500">
                        ({dias} {dias === 1 ? 'dia' : 'dias'})
                      </span>
                    </div>

                    {absence.motivo && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {absence.motivo}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingAbsence(absence)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAbsence(absence.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Estatísticas rápidas */}
      {absences.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {absences.filter(a => a.status === 'pendente').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pendentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {absences.filter(a => a.status === 'aprovado').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Aprovadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {absences.reduce((total, a) => total + calculateDays(a.dataInicio, a.dataFim), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total de Dias</div>
            </div>
          </div>
        </div>
      )}

      {/* Forms */}
      {showAddForm && (
        <AbsenceForm
          onSave={handleAddAbsence}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingAbsence && (
        <AbsenceForm
          absence={editingAbsence}
          onSave={handleEditAbsence}
          onCancel={() => setEditingAbsence(null)}
        />
      )}
    </div>
  );
};

export default AbsenceManager;

