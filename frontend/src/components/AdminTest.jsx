import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'

function AdminTest() {
  const [teste, setTeste] = useState('Componente carregado!')
  
  // Carrega dados da API
  const { data: funcionarios, loading: loadingFuncionarios } = useFuncionarios()
  const { data: tarefas, loading: loadingTarefas } = useTarefas()
  const { data: agenda, loading: loadingAgenda } = useAgenda()

  const handleClick = () => {
    alert('Botão funcionando!')
    setTeste('Botão clicado!')
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin - Teste</h1>
      
      <div className="mb-6 p-4 bg-blue-100 rounded">
        <h2 className="font-bold">Status:</h2>
        <p>{teste}</p>
        <p>Funcionários: {funcionarios?.length || 0} (Loading: {loadingFuncionarios ? 'Sim' : 'Não'})</p>
        <p>Tarefas: {tarefas?.length || 0} (Loading: {loadingTarefas ? 'Sim' : 'Não'})</p>
        <p>Agenda: {agenda?.length || 0} (Loading: {loadingAgenda ? 'Sim' : 'Não'})</p>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Teste - Adicionar Funcionário
        </Button>

        <Button 
          onClick={() => alert('Botão tarefa!')}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 ml-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Teste - Adicionar Tarefa
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Funcionários ({funcionarios?.length || 0})</h3>
        <div className="grid gap-4">
          {funcionarios?.map(funcionario => (
            <div key={funcionario.id} className="p-4 border rounded bg-gray-50">
              <h4 className="font-bold">{funcionario.nome}</h4>
              <p>ID: {funcionario.id}</p>
              <p>Horário: {funcionario.horario_inicio} - {funcionario.horario_fim}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Tarefas ({tarefas?.length || 0})</h3>
        <div className="grid gap-4">
          {tarefas?.map(tarefa => (
            <div key={tarefa.id} className="p-4 border rounded bg-gray-50">
              <h4 className="font-bold">{tarefa.nome}</h4>
              <p>ID: {tarefa.id}</p>
              <p>Categoria: {tarefa.categoria}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminTest