import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Settings, 
  Palette, 
  Layout, 
  Star, 
  Bookmark, 
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Check
} from 'lucide-react'
import { useUserPreferences, TEMAS_CORES, DENSIDADE_OPCOES } from '../contexts/UserPreferencesContext'

export default function ConfiguracoesPessoais({ isOpen, onClose }) {
  const { 
    preferences, 
    updatePreferences, 
    tema, 
    densidade 
  } = useUserPreferences()

  const [previewTema, setPreviewTema] = useState(preferences.tema)

  const handleSalvarConfiguracoes = () => {
    updatePreferences({ tema: previewTema })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações Pessoais
          </DialogTitle>
          <DialogDescription>
            Personalize sua experiência no sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Temas de Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5" />
                Tema de Cores
              </CardTitle>
              <CardDescription>
                Escolha o esquema de cores que mais combina com você
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(TEMAS_CORES).map(([key, temaInfo]) => (
                  <div
                    key={key}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      previewTema === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPreviewTema(key)}
                  >
                    {previewTema === key && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <h3 className="font-medium">{temaInfo.nome}</h3>
                      
                      {/* Preview das cores */}
                      <div className="flex gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: temaInfo.primary }}
                          title="Cor primária"
                        />
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: temaInfo.secondary }}
                          title="Cor secundária"
                        />
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: temaInfo.accent }}
                          title="Cor de destaque"
                        />
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: temaInfo.success }}
                          title="Cor de sucesso"
                        />
                      </div>
                      
                      {/* Preview de componentes */}
                      <div className="space-y-2">
                        <div 
                          className="px-3 py-1 rounded text-white text-xs font-medium"
                          style={{ backgroundColor: temaInfo.primary }}
                        >
                          Botão Primário
                        </div>
                        <div 
                          className="px-3 py-1 rounded border text-xs"
                          style={{ 
                            borderColor: temaInfo.primary,
                            color: temaInfo.primary
                          }}
                        >
                          Botão Secundário
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Densidade de Informação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layout className="w-5 h-5" />
                Densidade de Informação
              </CardTitle>
              <CardDescription>
                Ajuste a quantidade de informação exibida na tela
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(DENSIDADE_OPCOES).map(([key, densidadeInfo]) => (
                  <div
                    key={key}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      preferences.densidade === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updatePreferences({ densidade: key })}
                  >
                    {preferences.densidade === key && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <h3 className="font-medium">{densidadeInfo.nome}</h3>
                      
                      {/* Preview da densidade */}
                      <div className="space-y-1">
                        <div className={`bg-gray-200 rounded ${densidadeInfo.cardHeight} ${densidadeInfo.padding} flex items-center`}>
                          <div className={`${densidadeInfo.fontSize} text-gray-600`}>
                            Exemplo de card
                          </div>
                        </div>
                        <div className={`bg-gray-200 rounded ${densidadeInfo.cardHeight} ${densidadeInfo.padding} flex items-center`}>
                          <div className={`${densidadeInfo.fontSize} text-gray-600`}>
                            Outro exemplo
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {key === 'compacta' && 'Máxima informação, mínimo espaço'}
                        {key === 'normal' && 'Equilíbrio entre informação e conforto'}
                        {key === 'confortavel' && 'Mais espaço, melhor legibilidade'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Favoritos e Bookmarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5" />
                  Favoritos
                </CardTitle>
                <CardDescription>
                  Itens marcados como favoritos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {preferences.favoritos.length > 0 ? (
                  <div className="space-y-2">
                    {preferences.favoritos.slice(0, 5).map((favorito, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{favorito.nome}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {favorito.tipo}
                        </Badge>
                      </div>
                    ))}
                    {preferences.favoritos.length > 5 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{preferences.favoritos.length - 5} mais favoritos
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum favorito ainda</p>
                    <p className="text-xs">Clique na estrela dos itens para favoritar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bookmark className="w-5 h-5" />
                  Bookmarks
                </CardTitle>
                <CardDescription>
                  Páginas e filtros salvos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {preferences.bookmarks.length > 0 ? (
                  <div className="space-y-2">
                    {preferences.bookmarks.slice(0, 5).map((bookmark, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-blue-500 fill-current" />
                          <span className="text-sm">{bookmark.nome}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {bookmark.pagina}
                        </Badge>
                      </div>
                    ))}
                    {preferences.bookmarks.length > 5 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{preferences.bookmarks.length - 5} mais bookmarks
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum bookmark ainda</p>
                    <p className="text-xs">Salve filtros e páginas úteis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvarConfiguracoes}>
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}