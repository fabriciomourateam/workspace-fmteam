import { Loader2 } from 'lucide-react'

export function Loading({ message = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{message}</p>
    </div>
  )
}