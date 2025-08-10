import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

export function ErrorMessage({ message = 'Ocorreu um erro', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Erro ao carregar dados
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}