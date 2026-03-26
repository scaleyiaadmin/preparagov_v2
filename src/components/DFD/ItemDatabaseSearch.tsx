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
            <DialogContent className="max-w-6xl h-[85vh] overflow-hidden flex flex-col p-0 shadow-2xl">
                <DialogHeader className="px-4 py-2 border-b flex flex-row items-center justify-between space-y-0 bg-white z-10 shrink-0">
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" onClick={onClose} size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 rounded-full">
                            <ArrowLeft size={14} />
                        </Button>
                        <DialogTitle className="text-sm font-bold text-gray-800 leading-none tracking-tight">
                            Banco de Preços Inteligente
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-gray-50/30">
                    <div className="h-full max-w-full mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">

                        {/* LEFT COLUMN (Fontes + Busca + Resultados) */}
                        <div className="lg:col-span-8 flex flex-col space-y-3 h-full overflow-hidden">

                            {/* Fontes de Pesquisa - ULTRA COMPACT */}
                            <Card className="border-gray-200 shadow-none shrink-0 bg-white">
                                <CardHeader className="py-1.5 px-3 flex flex-row items-center justify-between space-y-0 border-b border-gray-50">
                                    <div className="flex items-center space-x-1.5">
                                        <Database className="text-orange-500/70" size={12} />
                                        <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Fontes</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] text-gray-400 font-normal px-1 h-3.5 border-none">
                                        {selectedSources.length} ativos
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-2">
                                    <div className="flex flex-wrap gap-1">
                                        {sources.map(source => (
                                            <div key={source.id} className="relative">
                                                <Button
                                                    variant={selectedSources.includes(source.id) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleSource(source.id)}
                                                    className={`h-6 px-2 text-[9px] transition-all border ${selectedSources.includes(source.id)
                                                        ? "bg-orange-600 border-orange-600 hover:bg-orange-700 text-white shadow-sm"
                                                        : source.status
                                                            ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 cursor-not-allowed opacity-90"
                                                            : "hover:border-orange-200 hover:bg-orange-50 text-gray-500 border-gray-100"
                                                        }`}
                                                >
                                                    {source.name}
                                                </Button>
                                                {source.status && (
                                                    <span className="absolute -top-1 -right-0.5 px-0.5 bg-amber-500 text-[6px] font-black text-white rounded-full border border-white">
                                                        {source.status}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Search and Filters Card - ULTRA COMPACT */}
                            <Card className="border-gray-200 shadow-none shrink-0 bg-white">
                                <CardContent className="p-3 space-y-3">
                                    <div className="flex space-x-2">
                                        <div className="relative flex-1">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Buscar itens..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="h-9 pl-9 pr-3 text-xs border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-md bg-white shadow-none"
                                            />
                                        </div>
                                        <Button
                                            onClick={() => setShowFilters(!showFilters)}
                                            size="icon"
                                            className={`h-9 w-9 rounded-md shadow-sm transition-all ${showFilters ? 'bg-orange-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                                        >
                                            <Filter size={16} />
                                        </Button>
                                    </div>

                                    {showFilters && (
                                        <div className="space-y-3 pt-3 border-t border-gray-50 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Unidade</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {units.map(unit => (
                                                            <Button
                                                                key={unit}
                                                                variant={selectedUnit === unit ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setSelectedUnit(selectedUnit === unit ? null : unit)}
                                                                className={`h-6 px-2 text-[8px] font-bold rounded transition-all border-gray-100 ${selectedUnit === unit
                                                                    ? "bg-gray-800 text-white border-gray-800"
                                                                    : "hover:bg-gray-50 text-gray-500 bg-white"
                                                                    }`}
                                                            >
                                                                {unit}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Preço</span>
                                                    <div className="flex items-center space-x-1.5">
                                                        <div className="relative flex-1">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[9px]">R$</span>
                                                            <Input
                                                                placeholder="Mín."
                                                                value={priceRange.min}
                                                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                                                className="pl-6 h-7 border-gray-200 rounded text-[10px] bg-white"
                                                            />
                                                        </div>
                                                        <span className="text-gray-300">-</span>
                                                        <div className="relative flex-1">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[9px]">R$</span>
                                                            <Input
                                                                placeholder="Máx."
                                                                value={priceRange.max}
                                                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                                                className="pl-6 h-7 border-gray-200 rounded text-[10px] bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Estados</span>
                                                    <Badge variant="outline" className="text-[8px] text-gray-400 font-normal h-3.5 border-none p-0">
                                                        {selectedStates.length} selecionados
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {states.map(state => (
                                                        <Button
                                                            key={state}
                                                            variant={selectedStates.includes(state) ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleState(state);
                                                            }}
                                                            className={`h-5 w-8 text-[8px] p-0 transition-all ${selectedStates.includes(state)
                                                                ? "bg-gray-800 hover:bg-gray-900 text-white shadow-sm"
                                                                : "hover:border-gray-300 text-gray-500 bg-white"
                                                                }`}
                                                        >
                                                            {state}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Results Area - SCROLLABLE */}
                            <div className="flex-1 flex flex-col space-y-2 overflow-hidden min-h-0">
                                <div className="flex items-center justify-between shrink-0 px-1">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                        {filteredItems.length} RESULTADOS
                                        {totalPortal > filteredItems.length && (
                                            <span className="ml-1 text-[8px] text-orange-500 font-normal normal-case">
                                                (de {totalPortal} no Portal)
                                            </span>
                                        )}
                                    </h4>
                                </div>

                                <ScrollArea className="flex-1 rounded-md border border-gray-200 bg-white shadow-none custom-scrollbar overflow-hidden">
                                    <div className="divide-y divide-gray-100 px-2.5">
                                        {loading ? (
                                            <div className="py-10 flex flex-col items-center justify-center space-y-2">
                                                <Loader2 className="animate-spin text-orange-600 h-6 w-6" />
                                                <p className="text-[10px] text-gray-400 font-medium">Buscando inteligência de preços...</p>
                                            </div>
                                        ) : filteredItems.length > 0 ? (
                                            filteredItems.map(item => (
                                                <div key={item.id} className="py-2.5 flex items-center justify-between group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0 -mx-2.5 px-2.5">
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <h5 className="font-bold text-gray-800 uppercase text-[11px] leading-tight mb-0.5 line-clamp-2">
                                                            {item.descricao}
                                                        </h5>
                                                        <div className="flex items-center space-x-1.5 text-[9px] font-normal text-gray-500">
                                                            <span className="font-black text-orange-600">{item.fonte.split(' ')[0]}</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="font-bold uppercase">{item.unidade}</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-gray-900 font-black">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                                                            </span>
                                                        </div>
                                                        <div className="text-[8px] text-gray-400 font-normal uppercase truncate max-w-[300px] mt-0.5">
                                                            {item.orgao} • {item.data}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => handleSelectItem(item)}
                                                        className="h-7 w-7 bg-orange-600 hover:bg-orange-700 text-white rounded shadow-sm shrink-0"
                                                        size="icon"
                                                    >
                                                        <Plus size={14} />
                                                    </Button>
                                                </div>
                                            ))
                                        ) : debouncedSearch ? (
                                            <div className="py-10 text-center space-y-2">
                                                <Search className="text-gray-200 mx-auto" size={20} />
                                                <h3 className="text-xs font-bold text-gray-800">Sem resultados</h3>
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center space-y-2">
                                                <Database className="text-orange-100 mx-auto" size={20} />
                                                <h3 className="text-xs font-bold text-gray-800">Inicie a busca</h3>
                                            </div>
                                        )}

                                        {totalPortal > portalItems.length && (
                                            <div className="p-2 flex justify-center border-t border-gray-50">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleLoadMorePortal}
                                                    disabled={loadingPortalMore}
                                                    className="h-6 text-[9px] text-orange-600 border-orange-200 hover:bg-orange-50 px-3"
                                                >
                                                    {loadingPortalMore ? (
                                                        <Loader2 className="animate-spin mr-1.5" size={10} />
                                                    ) : (
                                                        <Plus className="mr-1.5" size={10} />
                                                    )}
                                                    Ver mais ({totalPortal - portalItems.length})
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (Selecionados) - LOCAL SCROLL */}
                        <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">

                            {/* Selected Items Sidebar - ULTRA COMPACT */}
                            <Card className="flex flex-col h-full border-gray-200 shadow-none overflow-hidden bg-white">
                                <div className="p-2.5 border-b bg-white shrink-0">
                                    <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Selecionados ({selectedItems.length})</h3>
                                </div>

                                <ScrollArea className="flex-1 p-2 bg-gray-50/20">
                                    <div className="space-y-2">
                                        {selectedItems.length > 0 ? (
                                            selectedItems.map((item, index) => (
                                                <Card key={item.id} className="border-gray-100 bg-white shadow-none overflow-hidden animate-in slide-in-from-right-2 duration-300">
                                                    <CardContent className="p-2 flex items-start space-x-2">
                                                        <div className="h-5 w-5 bg-orange-50 rounded flex items-center justify-center text-orange-600 font-black text-[8px] shrink-0 border border-orange-100">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[9px] font-black text-gray-800 uppercase line-clamp-1 leading-tight">{item.descricao}</p>
                                                            <div className="flex items-center justify-between mt-0.5">
                                                                <span className="text-[8px] font-bold text-gray-400 uppercase">{item.unidade}</span>
                                                                <span className="text-[9px] font-black text-green-600">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorReferencia)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1 shrink-0">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-5 w-5 text-gray-400 border-gray-100 hover:bg-gray-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateItemQuantity(item.id, -1);
                                                                }}
                                                            >
                                                                <span className="text-[10px]">-</span>
                                                            </Button>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantidade}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 1;
                                                                    updateItemQuantity(item.id, val - item.quantidade);
                                                                }}
                                                                className="h-5 w-7 text-center text-[9px] p-0 hide-spin-button bg-white border-gray-100"
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-5 w-5 text-gray-400 border-gray-100 hover:bg-gray-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateItemQuantity(item.id, 1);
                                                                }}
                                                            >
                                                                <span className="text-[10px]">+</span>
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5 text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0"
                                                            onClick={() => removeSelectedItem(item.id)}
                                                        >
                                                            <X size={10} />
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center px-2">
                                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Vazio</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-3 bg-white border-t space-y-2 shrink-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">TOTAL</span>
                                        <span className="font-black text-gray-900 text-sm">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                selectedItems.reduce((acc, item) => acc + (item.valorReferencia * item.quantidade), 0)
                                            )}
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full h-8 bg-orange-600 hover:bg-orange-700 text-white font-black rounded shadow-sm text-[10px] uppercase tracking-wider"
                                        disabled={selectedItems.length === 0}
                                        onClick={handleFinish}
                                    >
                                        <Check size={12} className="mr-1.5" />
                                        <span>Fixar ({selectedItems.length})</span>
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ItemDatabaseSearch;
