import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { referenciaService, ReferenciaItem } from '@/services/referenciaService';

import { Loader2, Sparkles, CheckCircle2, Edit, X } from 'lucide-react';

import { DFDItem } from './types';

interface AISuggestionsModalProps {
  open: boolean;
  onClose: () => void;
  objeto: string;
  descricaoDemanda?: string;
  justificativa?: string;
  tipoDFD?: string;
  descricaoSucinta?: string;
  onAddItems: (items: DFDItem[]) => void;
}

const AISuggestionsModal = ({ open, onClose, objeto, descricaoDemanda, justificativa, tipoDFD, descricaoSucinta, onAddItems }: AISuggestionsModalProps) => {
  const [suggestedItems, setSuggestedItems] = useState<DFDItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantities, setTempQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!open || !objeto) return;

      try {
        setLoading(true);
        const results = await referenciaService.searchMultisource({
          objeto,
          descricaoDemanda,
          justificativa,
          tipoDFD,
          descricaoSucinta
        });

        const mappedResults: DFDItem[] = results.map(item => ({
          id: item.id,
          codigo: item.codigo,
          descricao: item.descricao,
          unidade: item.unidade || 'UN',
          quantidade: 1, // Padrão inicial
          valorReferencia: item.valor,
          tabelaReferencia: item.fonte || 'CATMAT'
        }));

        setSuggestedItems(mappedResults);
        // Selecionar todos por padrão se houver poucos
        if (mappedResults.length <= 5) {
          setSelectedItems(mappedResults.map(i => i.codigo));
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [open, objeto, descricaoDemanda, justificativa, tipoDFD, descricaoSucinta]);



  const handleItemToggle = (itemCodigo: string) => {
    setSelectedItems(prev =>
      prev.includes(itemCodigo)
        ? prev.filter(id => id !== itemCodigo)
        : [...prev, itemCodigo]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === suggestedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(suggestedItems.map(item => item.codigo));
    }
  };

  const handleEditQuantity = (itemCodigo: string, currentQuantity: number) => {
    setEditingQuantity(itemCodigo);
    setTempQuantities(prev => ({ ...prev, [itemCodigo]: currentQuantity }));
  };

  const handleSaveQuantity = (itemCodigo: string) => {
    setEditingQuantity(null);
  };

  const handleCancelEditQuantity = () => {
    setEditingQuantity(null);
    setTempQuantities({});
  };

  const getItemQuantity = (item: DFDItem) => {
    return tempQuantities[item.codigo] || item.quantidade;
  };

  const handleAddSelected = () => {
    const itemsToAdd = suggestedItems
      .filter(item => selectedItems.includes(item.codigo))
      .map(item => ({
        ...item,
        quantidade: getItemQuantity(item),
        id: Date.now().toString() + Math.random()
      }));

    onAddItems(itemsToAdd);
    setSelectedItems([]);
    setTempQuantities({});
    onClose();
  };

  const getTotalValue = () => {
    return suggestedItems
      .filter(item => selectedItems.includes(item.codigo))
      .reduce((total, item) => total + (getItemQuantity(item) * item.valorReferencia), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="text-orange-500" size={20} />
            <span>Itens Sugeridos pela IA</span>
          </DialogTitle>
        </DialogHeader>

        {/* Informações contextuais */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 flex-shrink-0">
          <p className="text-sm text-blue-800">
            📌 <strong>Estes itens foram sugeridos com base no objeto selecionado:</strong> {objeto}
          </p>
          <p className="text-sm text-blue-700">
            🧠 Você pode ajustar as quantidades ou recusar os itens e inserir manualmente.
          </p>
        </div>

        {/* Conteúdo principal com scroll */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Controles de seleção */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedItems.length === suggestedItems.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="font-medium">Selecionar todos os itens</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                🔢 {selectedItems.length} itens selecionados de {suggestedItems.length}
              </span>
              <Badge className="bg-orange-100 text-orange-800">
                {suggestedItems.length} itens sugeridos
              </Badge>
            </div>
          </div>

          {/* Lista de itens - Lista única sem abas */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
              <p className="text-gray-500 font-medium">Analisando objeto e buscando itens nas tabelas de referência...</p>
            </div>
          ) : suggestedItems.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed rounded-xl">
              <X size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum item encontrado para o objeto "{objeto}"</p>
              <p className="text-sm text-gray-400">Tente ajustar a descrição do objeto no DFD.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedItems.map((item) => (
                <div
                  key={item.codigo}
                  className={`border rounded-lg p-4 transition-colors ${selectedItems.includes(item.codigo)
                    ? 'border-orange-300 bg-orange-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedItems.includes(item.codigo)}
                      onCheckedChange={() => handleItemToggle(item.codigo)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs bg-white">{item.codigo}</Badge>
                          <Badge className={`text-xs ${
                            item.tabelaReferencia === 'PNCP' ? 'bg-blue-100 text-blue-800' :
                            item.tabelaReferencia === 'BPS' ? 'bg-purple-100 text-purple-800' :
                            item.tabelaReferencia === 'CMED' ? 'bg-green-100 text-green-800' :
                            item.tabelaReferencia === 'SINAPI' ? 'bg-yellow-100 text-yellow-800' :
                            item.tabelaReferencia === 'NFE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.tabelaReferencia === 'NFE' ? 'Banco de NFe' : item.tabelaReferencia}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-700">
                            R$ {item.valorReferencia.toFixed(2)} / {item.unidade}
                          </p>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-3 text-sm leading-relaxed">{item.descricao}</h4>

                      {/* Seção de quantidade editável */}
                      <div className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 font-medium">Qtd:</span>
                          {editingQuantity === item.codigo ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="1"
                                value={tempQuantities[item.codigo] || item.quantidade}
                                onChange={(e) => setTempQuantities(prev => ({
                                  ...prev,
                                  [item.codigo]: parseInt(e.target.value) || item.quantidade
                                }))}
                                className="w-20 h-8 text-sm"
                              />
                              <span className="text-sm text-gray-500 font-medium">{item.unidade}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveQuantity(item.codigo)}
                                className="h-7 w-7 p-0 hover:bg-green-50"
                              >
                                <CheckCircle2 size={16} className="text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEditQuantity}
                                className="h-7 w-7 p-0 hover:bg-red-50"
                              >
                                <X size={16} className="text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 group">
                              <span className="font-bold text-orange-600">
                                {getItemQuantity(item)}
                                <span className="text-sm font-medium ml-1">{item.unidade}</span>
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditQuantity(item.codigo, getItemQuantity(item))}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit size={14} className="text-gray-400 hover:text-orange-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total do Item</span>
                          <span className="font-bold text-gray-900">
                            R$ {(getItemQuantity(item) * item.valorReferencia).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resumo de seleção */}
          {selectedItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={20} className="text-green-600" />
                    <span className="font-medium text-green-800">
                      {selectedItems.length} itens selecionados
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-800">
                      Total Estimado: R$ {getTotalValue().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botões de ação fixos */}
        <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X size={16} className="mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleAddSelected}
            disabled={selectedItems.length === 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <CheckCircle2 size={16} className="mr-2" />
            Inserir {selectedItems.length} Itens Selecionados no DFD
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISuggestionsModal;
