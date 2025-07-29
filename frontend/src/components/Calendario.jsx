import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Users, Filter } from 'lucide-react';

// Configurar localização em português
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const Calendario = () => {
  const [dados, setDados] = useState({ funcionarios: [], agenda: [], tarefas: [] });
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('todos');
  const [loading, setLoading] = useState(true);

  // Carregar dados da API
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Em desenvolvimento, usar dados locais
        const agendaData = await import('../data/agenda.json');
        const processosData = await import('../data/processos.json');
        
        setDados({
          funcionarios: agendaData.default.funcionarios,
          agenda: agendaData.default.agenda,
          tarefas: agendaData.default.tarefas
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Transformar agendamentos em eventos do calendário
  const eventos = useMemo(() => {
    if (!dados.agenda || !dados.funcionarios || !dados.tarefas) return [];

    return dados.agenda
      .filter(agendamento => {
        if (funcionarioSelecionado === 'todos') return true;
        return agendamento.funcionario === funcionarioSelecionado;
      })
      .map(agendamento => {
        const funcionario = dados.funcionarios.find(f => f.id === agendamento.funcionario);
        const tarefa = dados.tarefas.find(t => t.id === agendamento.tarefa);
        
        if (!funcionario || !tarefa) return null;

        // Criar data/hora do evento para hoje (como exemplo)
        const [hora, minuto] = agendamento.horario.split(':').map(Number);
        const dataEvento = new Date();
        dataEvento.setHours(hora, minuto, 0, 0);
        
        const dataFim = new Date(dataEvento);
        dataFim.setMinutes(dataFim.getMinutes() + tarefa.tempoEstimado);

        return {
          id: `${agendamento.funcionario}-${agendamento.horario}-${agendamento.tarefa}`,
          title: `${tarefa.nome}`,
          start: dataEvento,
          end: dataFim,
          resource: {
            funcionario: funcionario,
            tarefa: tarefa,
            agendamento: agendamento
          }
        };
      })
      .filter(Boolean);
  }, [dados, funcionarioSelecionado]);

  // Configuração de cores para eventos
  const eventStyleGetter = (event) => {
    const funcionario = event.resource.funcionario;
    const tarefa = event.resource.tarefa;
    
    return {
      style: {
        backgroundColor: funcionario.cor,
        borderColor: funcionario.cor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px'
      }
    };
  };

  // Componente customizado para eventos
  const EventComponent = ({ event }) => (
    <div className="text-xs font-medium">
      <div className="truncate font-semibold">{event.resource.tarefa.nome}</div>
      <div className="text-xs opacity-90">{event.resource.funcionario.nome}</div>
      <div className="text-xs opacity-75">{event.resource.tarefa.tempoEstimado}min</div>
    </div>
  );

  // Configuração de visualizações
  const views = {
    month: true,
    week: true,
    work_week: true,
    day: true,
    agenda: true
  };

  // Labels em português
  const messages = {
    allDay: 'Dia todo',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    work_week: 'Semana de Trabalho',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período.',
    showMore: total => `+ ${total} mais`
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
            <p className="text-gray-600">Visualização completa da agenda da equipe</p>
          </div>
        </div>

        {/* Filtro de funcionário */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={funcionarioSelecionado}
            onChange={(e) => setFuncionarioSelecionado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todos os funcionários</option>
            {dados.funcionarios.map(funcionario => (
              <option key={funcionario.id} value={funcionario.id}>
                {funcionario.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Funcionários Ativos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {funcionarioSelecionado === 'todos' ? dados.funcionarios.length : 1}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Eventos Hoje</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {eventos.filter(evento => {
              const hoje = new Date();
              return evento.start.toDateString() === hoje.toDateString();
            }).length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Total de Eventos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{eventos.length}</p>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            views={views}
            messages={messages}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent
            }}
            step={30}
            timeslots={2}
            min={new Date(2025, 0, 1, 7, 0, 0)}
            max={new Date(2025, 0, 1, 19, 0, 0)}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              agendaTimeFormat: 'HH:mm',
              agendaTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
            }}
            popup
            popupOffset={30}
          />
        </div>
      </div>

      {/* Legenda de cores */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legenda de Funcionários</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {dados.funcionarios.map(funcionario => (
            <div key={funcionario.id} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: funcionario.cor }}
              />
              <span className="text-sm text-gray-700">{funcionario.nome}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendario;

