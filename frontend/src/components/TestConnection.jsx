import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'

export default function TestConnection() {
  const { data: funcionarios, loading: loadingF, error: errorF } = useFuncionarios()
  const { data: tarefas, loading: loadingT, error: errorT } = useTarefas()
  const { data: agenda, loading: loadingA, error: errorA } = useAgenda()

  const isLoading = loadingF || loadingT || loadingA
  const hasError = errorF || errorT || errorA
  const error = errorF || errorT || errorA

  if (isLoading) {
    return <Loading message="Testando conexão com API..." />
  }

  if (hasError) {
    return <ErrorMessage error={error} />
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🎉 Conexão com API funcionando!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800">Funcionários</h3>
          <p className="text-green-600">{funcionarios?.length || 0} carregados</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-green-700">Ver dados</summary>
            <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(funcionarios?.slice(0, 2), null, 2)}
            </pre>
          </details>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Tarefas</h3>
          <p className="text-blue-600">{tarefas?.length || 0} carregadas</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-blue-700">Ver dados</summary>
            <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(tarefas?.slice(0, 2), null, 2)}
            </pre>
          </details>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-800">Agenda</h3>
          <p className="text-purple-600">{agenda?.length || 0} agendamentos</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-purple-700">Ver dados</summary>
            <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(agenda?.slice(0, 3), null, 2)}
            </pre>
          </details>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Status da Conexão:</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ Backend rodando em http://localhost:5000</li>
          <li>✅ CORS configurado corretamente</li>
          <li>✅ Dados carregados via API</li>
          <li>✅ Frontend conectado com sucesso</li>
        </ul>
      </div>
    </div>
  )
}