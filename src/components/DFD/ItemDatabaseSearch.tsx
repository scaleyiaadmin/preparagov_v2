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
    const [selectedItems, setSelectedItems] = useState<DFDItem[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Filtros
    const [selectedSources, setSelectedSources] = useState<string[]>(['PNCP']);
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    // Lógica de Filtro Real
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Filtro de Unidade
            const matchUnit = !selectedUnit ||
                item.unidade.toUpperCase() === selectedUnit.toUpperCase() ||
                item.unidade.toUpperCase().includes(selectedUnit.toUpperCase());

            // Filtro de Preço
            const min = priceRange.min ? parseFloat(priceRange.min) : 0;
            const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            const matchPrice = item.valor >= min && item.valor <= max;

            return matchUnit && matchPrice;
        });
    }, [items, selectedUnit, priceRange]);

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
        { id: 'CEASA', name: 'CEASA', status: 'EM BREVE' },
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
                return;
            }

            try {
                setLoading(true);
                const activeSource = selectedSources.find(s => !sources.find(src => src.id === s)?.status);
                if (activeSource) {
                    const results = await referenciaService.searchAll(debouncedSearch, activeSource);
                    setItems(results || []);
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
            <DialogContent className="max-w-[1400px] h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0 bg-white z-10">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={onClose} size="sm" className="h-8 px-2 text-gray-500">
                            <ArrowLeft size={16} className="mr-2" />
                            Voltar
                        </Button>
                        <DialogTitle className="text-xl font-bold text-gray-900 leading-none">
                            Banco de Preços Inteligente
                        </DialogTitle>
                    </div>
                    <div className="flex items-center space-x-2 mr-6 text-gray-400">
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 font-bold">V 2.5 PREMIUM</Badge>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden bg-gray-50/50 p-6">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                        {/* LEFT COLUMN (Fontes + Busca + Resultados) */}
                        <div className="lg:col-span-7 flex flex-col space-y-6 overflow-y-auto pr-2 pb-6 custom-scrollbar">

                            {/* Fontes de Pesquisa */}
                            <Card className="border-gray-200 shadow-sm shrink-0 bg-white">
                                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center space-x-2">
                                        <Database className="text-orange-600" size={18} />
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-700">Fontes de Pesquisa</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] text-gray-400 font-normal">
                                        {selectedSources.length} selecionadas
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {sources.map(source => (
                                            <div key={source.id} className="relative">
                                                <Button
                                                    variant={selectedSources.includes(source.id) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleSource(source.id)}
                                                    className={`h-9 text-xs transition-all duration-200 border-2 ${selectedSources.includes(source.id)
                                                        ? "bg-orange-600 border-orange-600 hover:bg-orange-700 text-white shadow-md"
                                                        : source.status
                                                            ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 cursor-not-allowed opacity-90 shadow-sm"
                                                            : "hover:border-orange-200 hover:bg-orange-50 text-gray-600 border-gray-100"
                                                        }`}
                                                >
                                                    {source.name}
                                                </Button>
                                                {source.status && (
                                                    <span className="absolute -top-2 -right-2 px-1.5 bg-amber-500 text-[8px] font-black text-white rounded-full border-2 border-white shadow-sm ring-2 ring-amber-500/20 animate-pulse">
                                                        {source.status}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Search and Filters Card */}
                            <Card className="border-gray-200 shadow-sm shrink-0 bg-white">
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-gray-900">Buscar Itens</h3>
                                        <div className="flex space-x-3">
                                            <div className="relative flex-1">
                                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    placeholder="Caneta, Arroz, Medicamento..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="h-14 pl-12 pr-4 text-lg border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-xl bg-white shadow-sm"
                                                />
                                            </div>
                                            <Button
                                                onClick={() => setShowFilters(!showFilters)}
                                                size="icon"
                                                className={`h-14 w-14 rounded-xl shadow-lg transition-all duration-300 ${showFilters ? 'bg-orange-700' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'}`}
                                            >
                                                <Filter size={24} />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-1">
                                            Os resultados respeitam as fontes e regiões selecionadas
                                        </p>
                                    </div>

                                    {showFilters && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-4">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Unidade Padrão</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {units.map(unit => (
                                                        <Button
                                                            key={unit}
                                                            variant={selectedUnit === unit ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setSelectedUnit(selectedUnit === unit ? null : unit)}
                                                            className={`h-9 px-4 text-[10px] font-bold rounded-lg transition-all border-gray-200 ${selectedUnit === unit
                                                                ? "bg-gray-800 text-white shadow-sm border-gray-800"
                                                                : "hover:bg-gray-50 text-gray-600 bg-white"
                                                                }`}
                                                        >
                                                            {unit}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Filtrar por preço</span>
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                                                        <Input
                                                            placeholder="Mín."
                                                            value={priceRange.min}
                                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                                            className="pl-8 h-10 border-gray-200 rounded-lg text-sm bg-white"
                                                        />
                                                    </div>
                                                    <span className="text-gray-300">-</span>
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                                                        <Input
                                                            placeholder="Máx."
                                                            value={priceRange.max}
                                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                                            className="pl-8 h-10 border-gray-200 rounded-lg text-sm bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Results Area */}
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-gray-700">{filteredItems.length} itens encontrados</h4>
                                </div>

                                <div className="divide-y divide-gray-100 border-t border-gray-100 bg-white rounded-lg shadow-sm">
                                    {loading ? (
                                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                            <Loader2 className="animate-spin text-orange-600 h-10 w-10" />
                                            <p className="text-gray-500 font-medium">Buscando inteligência de preços...</p>
                                        </div>
                                    ) : filteredItems.length > 0 ? (
                                        filteredItems.map(item => (
                                            <div key={item.id} className="py-4 flex items-center justify-between group hover:bg-gray-50/50 px-4 transition-colors border-b border-gray-50 last:border-0">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h5 className="font-medium text-gray-900 uppercase text-[14px] leading-tight mb-1">
                                                        {item.descricao}
                                                    </h5>
                                                    <div className="flex items-center space-x-2 text-[12px] font-normal text-gray-600 mb-1">
                                                        <span className="uppercase font-medium">{item.unidade}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-gray-600 font-medium uppercase">{item.fonte}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-gray-900 font-bold">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-normal uppercase tracking-tight">
                                                        <span>{item.orgao}</span>
                                                        <span className="text-gray-200">•</span>
                                                        <span>{item.data}</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => handleSelectItem(item)}
                                                    className="h-10 w-10 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-sm shrink-0"
                                                    size="icon"
                                                >
                                                    <Plus size={20} />
                                                </Button>
                                            </div>
                                        ))
                                    ) : debouncedSearch ? (
                                        <div className="py-20 text-center space-y-3">
                                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                <Search className="text-gray-300" size={32} />
                                            </div>
                                            <h5 className="font-bold text-gray-700">Poxa, não encontramos nada.</h5>
                                            <p className="text-sm text-gray-500 max-w-xs mx-auto">Tente usar palavras-chave mais genéricas ou verifique se as fontes selecionadas possuem este tipo de item.</p>
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center space-y-3">
                                            <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                                <Search className="text-orange-300" size={32} />
                                            </div>
                                            <h5 className="font-bold text-gray-700">O que você deseja buscar hoje?</h5>
                                            <p className="text-sm text-gray-500 max-w-xs mx-auto">Use o campo de busca acima e aplique filtros para encontrar os melhores preços de referência.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (Abrangência + Selecionados) */}
                        <div className="lg:col-span-5 flex flex-col space-y-6 overflow-hidden h-full pb-6">

                            {/* Abrangência Regional */}
                            <Card className="border-gray-200 shadow-sm shrink-0 bg-white">
                                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="text-orange-600" size={18} />
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-700">Abrangência Regional</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] text-gray-400 font-normal">
                                        {selectedStates.length} estados
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-1.5">
                                        {states.map(state => (
                                            <Button
                                                key={state}
                                                variant={selectedStates.includes(state) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleState(state)}
                                                className={`h-8 w-10 text-[10px] p-0 transition-all ${selectedStates.includes(state)
                                                    ? "bg-gray-800 hover:bg-gray-900 text-white shadow-sm"
                                                    : "hover:border-gray-300 text-gray-600 bg-white"
                                                    }`}
                                            >
                                                {state}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Selected Items Sidebar (now a Card) */}
                            <Card className="flex-1 border-gray-200 shadow-sm overflow-hidden flex flex-col bg-white">
                                <div className="p-4 border-b bg-white shrink-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-lg text-gray-900">Itens Selecionados ({selectedItems.length})</h3>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 p-4 bg-gray-50/30">
                                    <div className="space-y-3">
                                        {selectedItems.length > 0 ? (
                                            selectedItems.map((item, index) => (
                                                <Card key={item.id} className="border-gray-200 bg-white shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                                    <CardContent className="p-3 flex items-start space-x-3">
                                                        <div className="h-7 w-7 bg-orange-100 rounded flex items-center justify-center text-orange-600 font-bold text-[10px] shrink-0">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-gray-900 uppercase line-clamp-2 leading-tight">{item.descricao}</p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.unidade} • {item.tabelaReferencia}</span>
                                                                <span className="text-xs font-bold text-green-600">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorReferencia)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1 ml-2 shrink-0">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-500 rounded-md"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateItemQuantity(item.id, -1);
                                                                }}
                                                            >
                                                                -
                                                            </Button>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantidade}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 1;
                                                                    updateItemQuantity(item.id, val - item.quantidade);
                                                                }}
                                                                className="h-8 w-12 text-center text-xs p-0 hide-spin-button bg-white"
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-500 rounded-md"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateItemQuantity(item.id, 1);
                                                                }}
                                                            >
                                                                +
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0 ml-1"
                                                            onClick={() => removeSelectedItem(item.id)}
                                                        >
                                                            <X size={14} />
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center px-6">
                                                <div className="h-14 w-14 bg-white rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-4">
                                                    <Plus className="text-gray-200" size={20} />
                                                </div>
                                                <p className="text-sm font-medium text-gray-400">Nenhum item selecionado ainda</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-4 bg-white border-t space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Investimento Estimado</span>
                                        <span className="font-bold text-gray-900 text-lg">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                selectedItems.reduce((acc, item) => acc + (item.valorReferencia * item.quantidade), 0)
                                            )}
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-100 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        disabled={selectedItems.length === 0}
                                        onClick={handleFinish}
                                    >
                                        <Check size={20} />
                                        <span>Fixar Demanda ({selectedItems.length})</span>
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
