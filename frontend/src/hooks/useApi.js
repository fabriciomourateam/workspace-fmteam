import { useState, useEffect } from 'react';
import apiService from '../services/api';

/**
 * Hook personalizado para fazer chamadas à API com loading e error states
 */
export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiCall();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error('API Error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

/**
 * Hooks específicos para cada endpoint
 */
export function useFuncionarios() {
  return useApi(() => apiService.getFuncionarios());
}

export function useTarefas() {
  return useApi(() => apiService.getTarefas());
}

export function useAgenda() {
  return useApi(() => apiService.getAgenda());
}

export function useFuncionario(id) {
  return useApi(() => apiService.getFuncionario(id), [id]);
}

export function useAgendaFuncionario(funcionarioId) {
  return useApi(() => apiService.getAgendaFuncionario(funcionarioId), [funcionarioId]);
}