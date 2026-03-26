import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Search,
    ArrowLeft,
    MapPin,
    Database,
    Filter,
    Plus,
    Check,
    X,
    Loader2,
    Trash2
} from 'lucide-react';
import { referenciaService, ReferenciaItem } from '@/services/referenciaService';
import { pncpApiService } from '@/services/pncpApiService';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { DFDItem } from './types';

interface ItemDatabaseSearchProps {
    open: boolean;
    onClose: () => void;
    onAddItems: (items: DFDItem[]) => void;
}

const ItemDatabaseSearch = ({ open, onClose, onAddItems }: ItemDatabaseSearchProps) => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ReferenciaItem[]>([]);
    const [portalItems, setPortalItems] = useState<ReferenciaItem[]>([]);
    const [totalPortal, setTotalPortal] = useState(0);
    const [portalPage, setPortalPage] = useState(1);
    const [loadingPortalMore, setLoadingPortalMore] = useState(false);
    const [selectedItems, setSelectedItems] = useState<DFDItem[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Filtros
    const [selectedSources, setSelectedSources] = useState<string[]>(['PNCP']);
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    // Lógica de Filtro Real
    const allItems = useMemo(() => {
        // Combina itens do cache e do portal, removendo duplicatas por código se necessário
        const combined = [...items, ...portalItems];
        const seen = new Set();
        return combined.filter(item => {
            if (seen.has(item.codigo)) return false;
            seen.add(item.codigo);
            return true;
        });
    }, [items, portalItems]);

    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            // Filtro de Unidade
            const matchUnit = !selectedUnit ||
                item.unidade.toUpperCase() === selectedUnit.toUpperCase() ||
                item.unidade.toUpperCase().includes(selectedUnit.toUpperCase());

            // Filtro de Preço
            const min = priceRange.min ? parseFloat(priceRange.min) : 0;
            const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            const matchPrice = item.valor >= min && item.valor <= max;

            // Filtro de Estado (Para itens do Banco de Dados que possuem UF no metadado ou órgão)
            const matchesState = selectedStates.length === 0 ||
                (item.orgao && selectedStates.some(uf => item.orgao?.includes(uf))) ||
                (item.detalhes?.uf && selectedStates.includes(item.detalhes.uf));

            return matchUnit && matchPrice && matchesState;
        });
    }, [allItems, selectedUnit, priceRange, selectedStates]);

    const sources = useMemo(() => [
        { id: 'PNCP', name: 'PNCP' },
        { id: 'BPS', name: 'BPS' },
        { id: 'CMED', name: 'CMED' },
        { id: 'SINAPI', name: 'SINAPI' },
        { id: 'CATMAT', name: 'CATMAT', status: 'EM BREVE' },
        { id: 'SETOP', name: 'SETOP', status: 'EM BREVE' },
        { id: 'NFE', name: 'BANCO DE NFe' },
        { id: 'SIMPRO', name: 'SIMPRO', status: 'EM BREVE' },
        { id: 'SIGTAP', name: 'SIGTAP', status: 'EM BREVE' },
        { id: 'CEASA', name: 'CEASA' },
        { id: 'LICITACOES', name: 'LICITAÇÕES SIMILARES', status: 'EM BREVE' },
    ], []);

    const states = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
        'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    const units = ['UNIDADE', 'CAIXA', 'QUILO', 'PACOTE', 'SERVIÇO', 'HORA', 'MÊS', 'DIÁRIA', 'LOCAÇÃO', 'METRO'];

    useEffect(() => {
        const fetchItems = async () => {
            if (!debouncedSearch || debouncedSearch.length < 2) {
                setItems([]);
                setPortalItems([]);
                setTotalPortal(0);
                return;
            }

            try {
                setLoading(true);

                // Todas as fontes ativas sem status "EM BREVE"
                const activeSources = selectedSources.filter(s => !sources.find(src => src.id === s)?.status);

                // Busca em TODAS as fontes ativas em paralelo (inclui cache PNCP)
                if (activeSources.length > 0) {
                    const dbResults = await Promise.all(
                        activeSources.map(source =>
                            referenciaService.searchAll(debouncedSearch, source).catch(() => [])
                        )
                    );
                    const combined = dbResults.flat();
                    // Deduplica por código
                    const seen = new Set<string>();
                    setItems(combined.filter(item => {
                        if (seen.has(item.codigo)) return false;
                        seen.add(item.codigo);
                        return true;
                    }));
                } else {
                    setItems([]);
                }

                // Busca na API pública do PNCP (resultados de processos, complementar ao cache)
                if (selectedSources.includes('PNCP')) {
                    const ufFilter = selectedStates.length === 1 ? selectedStates[0] : undefined;
                    // Executa a requisição separadamente (sem travar) 
                    pncpApiService.search(debouncedSearch, 1, ufFilter)
                        .then(portalResult => {
                            setPortalItems(portalResult.items);
                            setTotalPortal(portalResult.total);
                        })
                        .catch(err => console.warn('Falha silenciosa api PNCP:', err));
                    setPortalPage(1);
                } else {
                    setPortalItems([]);
                    setTotalPortal(0);
                    setPortalPage(1);
                }



            } catch (error) {
                console.error('Erro ao buscar itens:', error);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchItems();
        }
    }, [debouncedSearch, selectedSources, selectedStates, open, sources]);

    const toggleSource = (sourceId: string) => {
        if (sources.find(s => s.id === sourceId)?.status) return;

        setSelectedSources(prev =>
            prev.includes(sourceId)
                ? prev.filter(id => id !== sourceId)
                : [...prev, sourceId]
        );
    };

    const toggleState = (state: string) => {
        setSelectedStates(prev =>
            prev.includes(state)
                ? prev.filter(s => s !== state)
                : [...prev, state]
        );
    };

    const handleSelectItem = (item: ReferenciaItem) => {
        const isAlreadySelected = selectedItems.find(i => i.codigo === item.codigo);
        if (isAlreadySelected) {
            toast({
                title: "Item já selecionado",
                description: "Este item já está na sua lista lateral.",
                variant: "destructive"
            });
            return;
        }

        const newItem: DFDItem = {
            id: `selected-${Date.now()}-${item.codigo}`,
            codigo: item.codigo,
            descricao: item.descricao,
            unidade: item.unidade,
            quantidade: 1,
            valorReferencia: item.valor,
            tabelaReferencia: item.fonte
        };

        setSelectedItems(prev => [...prev, newItem]);
    };

    const removeSelectedItem = (id: string) => {
        setSelectedItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItemQuantity = (id: string, change: number) => {
        setSelectedItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQuantity = Math.max(1, item.quantidade + change);
                    return { ...item, quantidade: newQuantity };
                }
                return item;
            })
        );
    };

    const handleLoadMorePortal = async () => {
        if (loadingPortalMore || portalItems.length >= totalPortal) return;

        try {
            setLoadingPortalMore(true);
            const nextPage = portalPage + 1;
            const ufFilter = selectedStates.length === 1 ? selectedStates[0] : undefined;
            const portalResult = await pncpApiService.search(debouncedSearch, nextPage, ufFilter);

            setPortalItems(prev => [...prev, ...portalResult.items]);
            setPortalPage(nextPage);
        } catch (error) {
            console.error('Erro ao carregar mais itens do portal:', error);
        } finally {
            setLoadingPortalMore(false);
        }
    };

    const handleFinish = () => {
        if (selectedItems.length === 0) {
            toast({
                title: "Nenhum item selecionado",
                description: "Selecione pelo menos um item para adicionar ao DFD.",
                variant: "destructive"
            });
            return;
        }
        onAddItems(selectedItems);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] h-[800px] overflow-hidden flex flex-col p-0 shadow-xl border-gray-100 sm:rounded-2xl bg-white">
                {/* Header Clean */}
                <DialogHeader className="px-5 py-4 border-b border-gray-100 flex flex-row items-center justify-between bg-white shrink-0">
                    <div className="flex items-center space-x-3">
                        <Button variant="ghost" onClick={onClose} size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={16} />
                        </Button>
                        <DialogTitle className="text-base font-semibold text-gray-900 tracking-tight">
                            Banco de Preços Inteligente
                        </DialogTitle>
                    </div>
                    {/* Buscador Integrado ao Header para economizar espaço */}
                    <div className="relative w-64 md:w-80">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Pesquisar itens..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 pl-9 pr-10 text-sm border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-full bg-gray-50/50 shadow-sm transition-all"
                        />
                        <Button
                            onClick={() => setShowFilters(!showFilters)}
                            variant="ghost"
                            size="icon"
                            className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full transition-colors ${showFilters ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                            <Filter size={14} />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden bg-gray-50/30">
                    {/* Corpo Principal: Dividido em 2 colunas proporcionais num popup menor (2/3 Busca, 1/3 Seleção) */}
                    <div className="w-full h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 overflow-hidden">
                        
                        {/* COLUNA ESQUERDA: Fontes, Filtros e Resultados */}
                        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
                            
                            {/* Bloco de Fontes de Pesquisa */}
                            <div className="p-4 border-b border-gray-100 shrink-0">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5"><Database size={12} className="text-orange-500"/> Fontes de Dados</span>
                                    <span className="text-xs text-gray-400">{selectedSources.length} ativas</span>
                                </div>
                                <ScrollArea className="w-full whitespace-nowrap pb-1">
                                    <div className="flex w-max space-x-2">
                                        {sources.map(source => (
                                            <div key={source.id} className="relative inline-block">
                                                <Button
                                                    variant={selectedSources.includes(source.id) ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={!!source.status}
                                                    onClick={() => toggleSource(source.id)}
                                                    className={`h-7 px-3 text-xs rounded-full transition-colors border ${selectedSources.includes(source.id)
                                                        ? "bg-orange-600 border-orange-600 hover:bg-orange-700 text-white shadow-sm"
                                                        : source.status
                                                            ? "bg-gray-50 border-gray-200 text-gray-400 opacity-80"
                                                            : "hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 text-gray-600 border-gray-200 bg-white"
                                                        }`}
                                                >
                                                    {source.name}
                                                </Button>
                                                {source.status && (
                                                    <span className="absolute -top-1.5 -right-1 px-1 bg-amber-500 text-[8px] font-bold text-white rounded-md shadow-sm">
                                                        {source.status}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Bloco de Filtros Expandíveis */}
                            {showFilters && (
                                <div className="p-4 bg-gray-50/50 border-b border-gray-100 shrink-0 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500">Unidade</label>
                                            <ScrollArea className="w-full whitespace-nowrap">
                                                <div className="flex space-x-1.5 pb-1">
                                                    {units.map(unit => (
                                                        <Button
                                                            key={unit}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedUnit(selectedUnit === unit ? null : unit)}
                                                            className={`h-6 px-2.5 text-[11px] rounded transition-colors ${selectedUnit === unit
                                                                ? "bg-gray-800 text-white border-gray-800 hover:bg-gray-900 hover:text-white"
                                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                                                                }`}
                                                        >
                                                            {unit}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500">Faixa de Preço (R$)</label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    placeholder="Mín"
                                                    value={priceRange.min}
                                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                                    className="h-7 text-xs bg-white border-gray-200"
                                                />
                                                <span className="text-gray-300">-</span>
                                                <Input
                                                    placeholder="Máx"
                                                    value={priceRange.max}
                                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                                    className="h-7 text-xs bg-white border-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lista de Resultados */}
                            <div className="flex-1 flex flex-col min-h-0 bg-white">
                                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center shrink-0 bg-white/80 backdrop-blur-sm z-10 shadow-sm">
                                    <h4 className="text-xs font-semibold text-gray-700">
                                        {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'} encontrados
                                    </h4>
                                </div>
                                
                                <ScrollArea className="flex-1 custom-scrollbar">
                                    <div className="p-2 space-y-1.5">
                                        {loading ? (
                                            <div className="py-16 flex flex-col items-center justify-center space-y-3">
                                                <Loader2 className="animate-spin text-orange-600 h-8 w-8" />
                                                <p className="text-sm text-gray-400">Buscando na base de dados...</p>
                                            </div>
                                        ) : filteredItems.length > 0 ? (
                                            filteredItems.map(item => (
                                                <div key={item.id} className="p-3 bg-white rounded-lg border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group flex items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-semibold text-sm text-gray-800 leading-snug mb-1 drop-shadow-sm group-hover:text-orange-900 transition-colors">
                                                            {item.descricao}
                                                        </h5>
                                                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 text-[10px] px-1.5 py-0 border-none font-medium">{item.fonte.split(' ')[0]}</Badge>
                                                            <span className="text-[11px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{item.unidade}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-medium truncate flex items-center gap-1">
                                                            <MapPin size={10} className="text-gray-400"/> {item.orgao} <span className="text-gray-300">•</span> {item.data}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                                        <span className="font-bold text-base text-gray-900">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                                                        </span>
                                                        <Button
                                                            onClick={() => handleSelectItem(item)}
                                                            className="h-8 w-8 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white rounded-full transition-colors shrink-0"
                                                            size="icon"
                                                            title="Adicionar item"
                                                        >
                                                            <Plus size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : debouncedSearch ? (
                                            <div className="py-16 text-center space-y-3">
                                                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                                    <Search className="text-gray-300 h-6 w-6" />
                                                </div>
                                                <h3 className="text-sm font-medium text-gray-600">Sem resultados encontrados</h3>
                                                <p className="text-xs text-gray-400">Tente ajustar seus termos de busca ou remover filtros.</p>
                                            </div>
                                        ) : (
                                            <div className="py-16 text-center space-y-3">
                                                <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                                                    <Database className="text-orange-300 h-6 w-6" />
                                                </div>
                                                <h3 className="text-sm font-medium text-gray-600">Pronto para buscar</h3>
                                                <p className="text-xs text-gray-400">Digite no campo lá em cima para encontrar os preços.</p>
                                            </div>
                                        )}

                                        {totalPortal > portalItems.length && (
                                            <div className="py-4 flex justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleLoadMorePortal}
                                                    disabled={loadingPortalMore}
                                                    className="rounded-full px-6 border-gray-200 text-gray-600 hover:text-orange-600 hover:border-orange-200"
                                                >
                                                    {loadingPortalMore ? (
                                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                    ) : (
                                                        <Plus className="mr-2 h-4 w-4 text-orange-500" />
                                                    )}
                                                    Mostrar mais resultados do portal
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>

                        {/* COLUNA DIREITA: Itens Selecionados (Carrinho) */}
                        <div className="w-full md:w-80 flex flex-col bg-gray-50/50 shrink-0 h-full overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                                <h3 className="font-semibold text-sm text-gray-800">Cesta de Itens</h3>
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 font-bold border-none rounded-full px-2">
                                    {selectedItems.length}
                                </Badge>
                            </div>

                            <ScrollArea className="flex-1 custom-scrollbar">
                                <div className="p-4 space-y-3">
                                    {selectedItems.length > 0 ? (
                                        selectedItems.map((item) => (
                                            <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative group animate-in slide-in-from-right-4 duration-300">
                                                <div className="pr-6">
                                                    <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-2">
                                                        {item.descricao}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                            {item.unidade}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-900">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorReferencia)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                    <span className="text-[10px] font-medium text-gray-400 uppercase">Qtd.</span>
                                                    <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 rounded-md hover:bg-white text-gray-500 shadow-none border-none"
                                                            onClick={() => updateItemQuantity(item.id, -1)}
                                                        >
                                                            <span className="text-sm font-medium">-</span>
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantidade}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 1;
                                                                updateItemQuantity(item.id, val - item.quantidade);
                                                            }}
                                                            className="h-6 w-10 text-center text-xs p-0 font-medium bg-transparent border-none focus-visible:ring-0 px-1 hide-spin-button"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 rounded-md hover:bg-white text-gray-500 shadow-none border-none"
                                                            onClick={() => updateItemQuantity(item.id, 1)}
                                                        >
                                                            <span className="text-sm font-medium">+</span>
                                                        </Button>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeSelectedItem(item.id)}
                                                    title="Remover item"
                                                >
                                                    <Trash2 size={12} />
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center flex flex-col items-center opacity-60">
                                            <div className="h-10 w-10 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-3">
                                                <Check size={16} className="text-gray-300" />
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">Cesta vazia</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Adicione itens clicando no +</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Footer do Carrinho (Resumo e Botão Fixar) */}
                            <div className="p-5 bg-white border-t border-gray-100 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Valor Estimado</span>
                                    <span className="font-black text-orange-600 text-lg">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                            selectedItems.reduce((acc, item) => acc + (item.valorReferencia * item.quantidade), 0)
                                        )}
                                    </span>
                                </div>
                                <Button
                                    className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-md transition-all font-semibold text-sm flex items-center justify-center gap-2"
                                    disabled={selectedItems.length === 0}
                                    onClick={handleFinish}
                                >
                                    <Check size={16} />
                                    Exportar para DFD
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ItemDatabaseSearch;
