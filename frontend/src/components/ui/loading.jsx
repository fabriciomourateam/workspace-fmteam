import { Loader2 } from 'lucide-react';

export function Loading({ message = "Carregando..." }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 w-full"></div>
    </div>
  );
}

export function LoadingTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 flex-1"></div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-20"></div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-16"></div>
        </div>
      ))}
    </div>
  );
}