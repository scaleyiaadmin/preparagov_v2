import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Eye, Loader2 } from 'lucide-react';
import ItemDetailsModal, { ItemDetailsModalProps } from './ItemDetailsModal';
import { DFDItem } from './types';
import { referenciaService, ReferenciaItem } from '@/services/referenciaService';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '../../hooks/use-debounce';

interface ItemSearchModalProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: DFDItem) => void;
}

const ItemSearchModal = ({ open, onClose, onAddItem }: ItemSearchModalProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [activeTab, setActiveTab] = useState('PNCP');
  const [items, setItems] = useState<ReferenciaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemDetailsModalProps['item']>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);

  const tabelas = [
    { id: 'PNCP', name: 'PNCP' },
    { id: 'BPS', name: 'BPS' },
    { id: 'CMED', name: 'CMED' },
    { id: 'SINAPI', name: 'SINAPI' },
    { id: 'NFE', name: 'Banco de NFe' },
    { id: 'CATMAT', name: 'CATMAT', commingSoon: true },
    { id: 'CATSER', name: 'CATSER', commingSoon: true },
  ];

  useEffect(() => {
    const fetchItems = async () => {
      // Só buscar se houver um termo de busca
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setItems([]);
        return;
      }

      try {
        setLoading(true);
        setItems([]); // Limpa itens anteriores para feedback visual melhor
        const results = await referenciaService.searchAll(debouncedSearch, activeTab);
        setItems(results || []);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
        toast({
          title: "Erro na busca",
          description: "Não foi possível conectar ao banco de referência.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchItems();
    }
  }, [debouncedSearch, activeTab, open, toast]);

  const handleSelectItem = (item: ReferenciaItem) => {
    setSelectedItem({
      codigo: item.codigo,
      descricao: item.descricao,
      unidade: item.unidade,
      valor: item.valor,
      tabelaReferencia: item.fonte
    });
    setShowItemDetails(true);
  };

  const handleAddItemFromDetails = (itemWithQuantity: DFDItem) => {
    onAddItem(itemWithQuantity);
    setShowItemDetails(false);
    setSelectedItem(null);
    setSearchTerm('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Buscar Itens nas Tabelas de Referência</DialogTitle>
            <p className="text-sm text-gray-600">
              Selecione a fonte de dados e busque pelos itens necessários
            </p>
          </DialogHeader>

          <div className="space-y-4 overflow-hidden flex flex-col flex-1">
            {/* Campo de busca global */}
            <div className="space-y-2">
              <Label>Buscar Item</Label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Digite para buscar em todos os itens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Abas das tabelas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full shrink-0">
                {tabelas.map((tabela) => (
                  <TabsTrigger
                    key={tabela.id}
                    value={tabela.id}
                    className="text-xs px-2 relative"
                  >
                    {tabela.name}
                    {tabela.commingSoon && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-hidden mt-4">
                {tabelas.map((tabela) => (
                  <TabsContent
                    key={tabela.id}
                    value={tabela.id}
                    className="h-full m-0 focus-visible:ring-0"
                  >
                    <div className="border rounded-lg h-full flex flex-col overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b shrink-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Itens disponíveis - {tabela.name}</h3>
                          {!loading && (
                            <Badge className="bg-blue-100 text-blue-800">
                              {items.length} itens encontrados
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto min-h-[400px]">
                        {tabela.commingSoon ? (
                          <div className="p-12 text-center text-gray-500">
                            <Loader2 size={48} className="mx-auto mb-4 text-orange-300 animate-spin" />
                            <p className="text-lg font-medium text-orange-600">Em Breve!</p>
                            <p className="text-sm">Esta fonte de dados está sendo integrada e estará disponível em breve para consultas reais.</p>
                          </div>
                        ) : !debouncedSearch ? (
                          <div className="p-12 text-center text-gray-500">
                            <Search size={48} className="mx-auto mb-4 text-gray-300 animate-pulse" />
                            <p className="text-lg font-medium text-gray-400">Aguardando sua pesquisa...</p>
                            <p className="text-sm">Digite no campo acima para localizar itens nas tabelas de referência</p>
                          </div>
                        ) : loading ? (
                          <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <p className="text-gray-500">Buscando na base {tabela.name}...</p>
                          </div>
                        ) : (
                          <>
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleSelectItem(item)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Badge variant="outline">{item.codigo}</Badge>
                                      <Badge className="bg-orange-100 text-orange-800">
                                        {item.fonte}
                                      </Badge>
                                    </div>
                                    <p className="font-medium text-gray-900 mb-1">{item.descricao}</p>
                                    <p className="text-sm text-gray-600">Unidade: {item.unidade}</p>
                                    {item.metadata && (
                                      <p className="text-[10px] text-gray-400 mt-1 uppercase italic">{item.metadata}</p>
                                    )}
                                    {item.orgao && (
                                      <p className="text-[10px] text-blue-400 mt-0.5">{item.orgao}</p>
                                    )}
                                  </div>
                                  <div className="text-right flex items-center space-x-2">
                                    <div>
                                      <p className="font-semibold text-green-600">
                                        {item.valor > 0 ? (
                                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)
                                        ) : (
                                          'Sob consulta'
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500">por {item.unidade}</p>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <Eye size={14} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {items.length === 0 && (
                              <div className="p-8 text-center text-gray-500">
                                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-lg mb-2">Nenhum item encontrado</p>
                                <p className="text-sm">Tente digitar o nome do item para pesquisar</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t shrink-0">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ItemDetailsModal
        open={showItemDetails}
        onClose={() => {
          setShowItemDetails(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onAddItem={handleAddItemFromDetails}
      />
    </>
  );
};

export default ItemSearchModal;
