import React, { useState } from 'react';
import { X, Download, FileText, Image, Table, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';

const ExportModal = ({ isOpen, onClose, data, title = 'Relatório' }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [dateRange, setDateRange] = useState('current');
  const [isExporting, setIsExporting] = useState(false);
  const { isDark } = useTheme();
  const { showSuccess, showError } = useNotifications();

  if (!isOpen) return null;

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Documento portátil para impressão',
      icon: FileText,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Planilha para análise de dados',
      icon: Table,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'png',
      name: 'Imagem PNG',
      description: 'Imagem de alta qualidade',
      icon: Image,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Dados tabulares simples',
      icon: Table,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create and download file
      const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      
      // For demonstration, create a simple text file
      let content = '';
      if (exportFormat === 'csv') {
        content = generateCSV(data);
      } else if (exportFormat === 'json') {
        content = JSON.stringify(data, null, 2);
      } else {
        content = `Relatório: ${title}\nGerado em: ${new Date().toLocaleString('pt-BR')}\n\nDados exportados com sucesso!`;
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess(`Relatório exportado como ${exportFormat.toUpperCase()}`, {
        action: {
          label: 'Ver downloads',
          onClick: () => console.log('Opening downloads folder')
        }
      });
      
      onClose();
    } catch (error) {
      showError('Erro ao exportar relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (data) => {
    if (!data || !Array.isArray(data)) return '';
    
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity modal-overlay"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg modal-content">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Exportar Relatório
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Formato de Exportação
              </label>
              <div className="grid grid-cols-2 gap-3">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all hover-lift ${
                        exportFormat === format.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <Icon className={`h-5 w-5 mr-2 ${format.color}`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {format.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {format.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Opções de Exportação
              </label>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Incluir gráficos e visualizações
                  </span>
                </label>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Período dos dados
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="current">Dados atuais</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mês</option>
                    <option value="quarter">Último trimestre</option>
                    <option value="year">Último ano</option>
                  </select>
                </div>
              </div>
            </div>

            {/* File Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Nome do arquivo:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {title.toLowerCase().replace(/\s+/g, '_')}_{new Date().toISOString().split('T')[0]}.{exportFormat}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">Tamanho estimado:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {exportFormat === 'pdf' ? '~2.5 MB' : 
                   exportFormat === 'excel' ? '~1.2 MB' : 
                   exportFormat === 'png' ? '~800 KB' : '~150 KB'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;

