import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import apiService from '../services/api'

export function ApiStatus() {
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    error: null,
    lastCheck: null
  })

  const checkApiStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Testa conectividade usando endpoint de funcionários
      const result = await apiService.getFuncionarios()
      
      if (!result || !Array.isArray(result)) {
        throw new Error('Resposta inválida da API')
      }
      
      setStatus({
        connected: true,
        loading: false,
        error: null,
        lastCheck: new Date()
      })
    } catch (error) {
      setStatus({
        connected: false,
        loading: false,
        error: error.message,
        lastCheck: new Date()
      })
    }
  }

  useEffect(() => {
    checkApiStatus()
    
    // Verifica status a cada 30 segundos
    const interval = setInterval(checkApiStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (status.loading) return 'bg-yellow-500'
    if (status.connected) return 'bg-green-500'
    return 'bg-red-500'
  }

  const getStatusIcon = () => {
    if (status.loading) return <RefreshCw className="h-3 w-3 animate-spin" />
    if (status.connected) return <CheckCircle className="h-3 w-3" />
    return <XCircle className="h-3 w-3" />
  }

  const getStatusText = () => {
    if (status.loading) return 'Verificando...'
    if (status.connected) return 'API Online'
    return 'API Offline'
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant="outline" 
        className={`${getStatusColor()} text-white border-transparent`}
      >
        <div className="flex items-center space-x-1">
          {getStatusIcon()}
          <span className="text-xs">{getStatusText()}</span>
        </div>
      </Badge>
      
      {!status.connected && !status.loading && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={checkApiStatus}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}

export function ApiStatusCard() {
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    error: null,
    lastCheck: null
  })

  const checkApiStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await apiService.checkHealth()
      setStatus({
        connected: true,
        loading: false,
        error: null,
        lastCheck: new Date(),
        data: result
      })
    } catch (error) {
      setStatus({
        connected: false,
        loading: false,
        error: error.message,
        lastCheck: new Date()
      })
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {status.loading ? (
            <RefreshCw className="h-5 w-5 animate-spin text-yellow-500" />
          ) : status.connected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span>Status da API</span>
        </CardTitle>
        <CardDescription>
          Conexão com o backend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge variant={status.connected ? "default" : "destructive"}>
              {status.loading ? 'Verificando...' : status.connected ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          {status.lastCheck && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Última verificação:</span>
              <span className="text-sm">{status.lastCheck.toLocaleTimeString()}</span>
            </div>
          )}
          
          {status.error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {status.error}
            </div>
          )}
          
          <Button 
            onClick={checkApiStatus} 
            disabled={status.loading}
            className="w-full mt-4"
            size="sm"
          >
            {status.loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}