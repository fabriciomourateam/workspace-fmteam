import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export function ErrorMessage({ error, onRetry }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Erro ao carregar dados
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {error || 'Ocorreu um erro inesperado'}
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  );
}

export function ErrorCard({ error, onRetry, title = "Erro" }) {
  return (
    <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
            {title}
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {error}
          </p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm" 
              className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}