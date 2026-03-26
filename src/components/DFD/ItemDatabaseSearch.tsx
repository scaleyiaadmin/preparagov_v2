import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Search,
    ArrowLeft,
    Filter,
    Building2,
    Calendar,
    FileText,
    MapPin,
    ShoppingCart,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { referenciaService, ReferenciaItem } from '@/services/referenciaService';
import { pncpApiService } from '@/services/pncpApiService';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import {
    Dialog,
    DialogContent,
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
    const debouncedSearch = useDebounce(searchTerm, 800);
    const [isSearching, setIsSearching] = useState(false);
    
    const [items, setItems] = useState<ReferenciaItem[]>([]);
    const [portalItems, setPortalItems] = useState<ReferenciaItem[]>([]);
    
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    
    const [showFilters, setShowFilters] = useState(false);

    // Filtros
    const [selectedSources, setSelectedSources] = useState<string[]>(['PNCP']);
    const [totalPortal, setTotalPortal] = useState(0);

    const sources = useMemo(() => [
        { id: 'PNCP', name: 'PNCP' },
        { id: 'NFE', name: 'BANCO DE NFE' },
        { id: 'BPS', name: 'BPS' },
        { id: 'CMED', name: 'CMED' },
        { id: 'SINAPI', name: 'SINAPI' },
        { id: 'CEASA', name: 'CEASA' },
        { id: 'SETOP', name: 'SETOP', status: 'EM BREVE' },
        { id: 'SIMPRO', name: 'SIMPRO', status: 'EM BREVE' },
        { id: 'SIGTAP', name: 'SIGTAP', status: 'EM BREVE' },
        { id: 'LICITACOES', name: 'LICITAÇÕES SIMILARES', status: 'EM BREVE' },
    ], []);

    const allItems = useMemo(() => {
        const combined = [...items, ...portalItems];
        // Remover duplicatas por codigo/descricao para nao encher a tela
        const seen = new Set();
        return combined.filter(item => {
            const key = `${item.codigo}-${item.fonte}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [items, portalItems]);

    useEffect(() => {
        const fetchItems = async () => {
            if (!debouncedSearch || debouncedSearch.length < 2) {
                setItems([]);
                setPortalItems([]);
                setTotalPortal(0);
                return;
            }

            try {
                setIsSearching(true);
                const activeSources = selectedSources.filter(s => !sources.find(src => src.id === s)?.status);

                // Fetch Supabase Background
                if (activeSources.length > 0) {
                    const dbResults = await Promise.all(
                        activeSources.map(source =>
                            referenciaService.searchAll(debouncedSearch, source).catch(() => [])
                        )
                    );
                    setItems(dbResults.flat());
                } else {
                    setItems([]);
                }

                // Fetch Public API (PNCP)
                if (selectedSources.includes('PNCP')) {
                    pncpApiService.search(debouncedSearch, 1)
                        .then(portalResult => {
                            setPortalItems(portalResult.items);
                            setTotalPortal(portalResult.total);
                        })
                        .catch(err => console.warn('PNCP falhou:', err));
                } else {
                    setPortalItems([]);
                    setTotalPortal(0);
                }

            } catch (error) {
                console.error('Erro buscar itens:', error);
            } finally {
                setIsSearching(false);
            }
        };

        if (open) {
            fetchItems();
        }
    }, [debouncedSearch, selectedSources, open, sources]);

    const toggleSource = (sourceId: string) => {
        if (sources.find(s => s.id === sourceId)?.status) return;
        setSelectedSources(prev =>
            prev.includes(sourceId)
                ? prev.filter(id => id !== sourceId)
                : [...prev, sourceId]
        );
    };

    const toggleSelection = (itemId: string) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === allItems.length && allItems.length > 0) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(allItems.map(i => i.id)));
        }
    };

    const toggleExpand = (itemId: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
    };

    const handleFinish = () => {
        if (selectedItems.size === 0) {
            toast({
                title: "Nenhum item selecionado",
                variant: "destructive"
            });
            return;
        }

        const itemsToAdd: DFDItem[] = Array.from(selectedItems).map(id => {
            const item = allItems.find(i => i.id === id);
            if (!item) return null;
            return {
                id: `selected-${Date.now()}-${item.codigo}`,
                codigo: item.codigo,
                descricao: item.descricao,
                unidade: item.unidade,
                quantidade: 1,
                valorReferencia: item.valor,
                tabelaReferencia: item.fonte
            };
        }).filter(Boolean) as DFDItem[];

        onAddItems(itemsToAdd);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            {/* FULL SCREEN DIALOG */}
            <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none p-0 flex flex-col bg-[#F9FAFB]">
                
                {/* HEADERS */}
                <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
                    <Button variant="ghost" className="text-gray-600 font-medium hover:bg-gray-100 px-3" onClick={onClose}>
                        <ArrowLeft className="mr-2" size={16} /> Voltar
                    </Button>
                    <Button onClick={handleFinish} variant="outline" className="border-gray-200 text-gray-700 bg-white shadow-sm font-medium h-10 px-6">
                        <ShoppingCart className="mr-2" size={16} /> Meu Orçamento
                        {selectedItems.size > 0 && (
                            <span className="ml-2 bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {selectedItems.size}
                            </span>
                        )}
                    </Button>
                </div>

                {/* SEARCH BAR & INFO */}
                <div className="bg-white border-b px-6 py-6 shrink-0">
                    <div className="max-w-7xl mx-auto space-y-4">
                        <div className="flex space-x-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <Input 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 text-gray-700 text-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg shadow-sm"
                                    placeholder="Pesquise um item: arroz, caneta, papel..."
                                />
                            </div>
                            <Button className="h-14 px-10 bg-[#D94F21] hover:bg-[#C24115] text-white font-bold text-lg rounded-lg shadow-sm">
                                Buscar
                            </Button>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Busque o item desejado. Após os resultados, use os filtros para refinar e selecione as fontes para compor a cesta de preços.
                        </p>
                    </div>
                </div>

                {/* SOURCES TOGGLE */}
                <div className="max-w-7xl mx-auto w-full px-6 pt-6 pb-2 shrink-0">
                    <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className={`h-10 w-12 border rounded-md shrink-0 flex items-center justify-center transition-colors ${showFilters ? 'bg-orange-50 text-[#D94F21] border-[#D94F21]' : 'border-gray-200 text-[#D94F21] bg-white'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} />
                        </Button>
                        
                        <div className="flex items-center space-x-2">
                            {sources.map(s => (
                                <div key={s.id} className="relative shrink-0">
                                    <Button
                                        variant="outline"
                                        onClick={() => toggleSource(s.id)}
                                        className={`h-10 px-5 font-semibold text-xs rounded-md border transition-all ${selectedSources.includes(s.id) ? 'border-gray-300 text-gray-800 bg-white shadow-sm' : 'border-gray-100 text-gray-400 bg-white'}`}
                                    >
                                        {s.name}
                                    </Button>
                                    {s.status && (
                                        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 bg-orange-400 text-white text-[9px] font-black rounded uppercase tracking-wider">
                                            {s.status}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RESULTS AREA */}
                <div className="max-w-7xl mx-auto w-full px-6 flex-1 overflow-hidden flex flex-col min-h-0 pt-2 pb-6">
                    
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h2 className="text-[#D94F21] font-bold text-lg">
                            {isSearching ? 'BUSCANDO...' : `${Math.max(allItems.length, totalPortal)} RESULTADO(S) ENCONTRADOS`}
                        </h2>
                        <button 
                            onClick={toggleSelectAll}
                            className="text-[#D94F21] hover:underline font-medium text-sm disabled:opacity-50"
                            disabled={allItems.length === 0}
                        >
                            {selectedItems.size === allItems.length && allItems.length > 0 ? "Desmarcar todos" : "Selecionar todos"}
                        </button>
                    </div>

                    <ScrollArea className="flex-1 -mx-2 px-2">
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-orange-500 h-10 w-10 mb-4" />
                                <p className="text-gray-500">Buscando na inteligência de dados...</p>
                            </div>
                        ) : allItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Search className="text-gray-300 h-12 w-12 mb-4" />
                                <p className="text-gray-400 font-medium">Nenhum item referenciado encontrado. Tente buscar por algo.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pb-10">
                                {allItems.map(item => {
                                    const isExpanded = expandedItems.has(item.id);
                                    const isSelected = selectedItems.has(item.id);

                                    return (
                                        <Card key={item.id} className={`border border-gray-200 shadow-sm transition-all ${isSelected ? 'border-orange-500 ring-1 ring-orange-500/20' : ''}`}>
                                            <CardContent className="p-0">
                                                {/* ROW PRIMARIA */}
                                                <div className="flex items-start p-6">
                                                    
                                                    <div className="pt-1 pr-6 shrink-0">
                                                        <Checkbox 
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleSelection(item.id)}
                                                            className="w-5 h-5 border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                                        />
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-12 gap-4 items-start">
                                                        {/* Lado Esquerdo do Card (Infos) */}
                                                        <div className="col-span-12 md:col-span-9 space-y-4">
                                                            
                                                            <div className="flex flex-col items-start gap-2">
                                                                <span className="bg-[#FFF1EB] text-[#D94F21] text-xs font-bold px-3 py-1 rounded">
                                                                    {item.fonte}
                                                                </span>
                                                                <h3 className="font-bold text-gray-900 text-lg uppercase leading-tight line-clamp-2">
                                                                    {item.descricao}
                                                                </h3>
                                                            </div>

                                                            {/* Mini colunas de atributos */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                                                        <Building2 size={12} className="mr-1" /> Órgão/Entidade
                                                                    </div>
                                                                    <p className="text-sm font-semibold text-gray-800 truncate" title={item.orgao}>{item.orgao || 'Não informado'}</p>
                                                                </div>
                                                                
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                                                        <Calendar size={12} className="mr-1" /> Data Publicação
                                                                    </div>
                                                                    <p className="text-sm font-semibold text-gray-800">{item.data || 'N/D'}</p>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <div className="flex items-center text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                                                        <FileText size={12} className="mr-1" /> Modalidade
                                                                    </div>
                                                                    <p className="text-sm font-semibold text-gray-800">{item.detalhes?.modalidadeNome || 'Pregão - Eletrônico'}</p>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <div className="flex items-center text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                                                        <MapPin size={12} className="mr-1" /> Localidade
                                                                    </div>
                                                                    <p className="text-sm font-semibold text-gray-800">{item.detalhes?.municipio || item.detalhes?.uf || 'N/D'}</p>
                                                                </div>
                                                            </div>

                                                            {/* Botão para Expandir Detalhes */}
                                                            <button 
                                                                onClick={() => toggleExpand(item.id)}
                                                                className="flex items-center text-gray-500 font-medium text-sm hover:text-gray-800 transition-colors pt-2"
                                                            >
                                                                {isExpanded ? <ChevronUp size={16} className="mr-1" /> : <ChevronDown size={16} className="mr-1" />}
                                                                {isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                                                            </button>
                                                        </div>

                                                        {/* Lado Direito do Card (Preço) */}
                                                        <div className="col-span-12 md:col-span-3 flex flex-col items-end justify-between h-full space-y-4">
                                                            <div className="text-right">
                                                                <div className="text-[#D94F21] font-black text-2xl tracking-tight">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                                                                </div>
                                                                <p className="text-xs text-gray-400 uppercase font-medium mt-1">
                                                                    Qtd: 1 {item.unidade}
                                                                </p>
                                                            </div>

                                                            {item.fonte === 'PNCP' && (
                                                                <Button className="w-full sm:w-auto bg-[#D94F21] hover:bg-[#C24115] text-white font-medium text-sm py-5 mt-auto">
                                                                    Ver no PNCP <ExternalLink size={16} className="ml-2" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                </div>

                                                {/* AREA EXPANDIDA DE DETALHES */}
                                                {isExpanded && (
                                                    <div className="px-6 pb-6 pt-2 bg-gray-50/50 border-t border-gray-100 ml-12">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8 py-4">
                                                            
                                                            <div className="space-y-1">
                                                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">CNPJ Órgão</div>
                                                                <p className="text-sm font-bold text-gray-900">{item.detalhes?.orgaoEntidade?.cnpj || item.detalhes?.cnpj || 'N/D'}</p>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Unid. Compradora</div>
                                                                <p className="text-sm font-bold text-gray-900 line-clamp-1" title={item.orgao}>{item.orgao || 'N/D'}</p>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Amparo Legal</div>
                                                                <p className="text-sm font-bold text-gray-900">{item.detalhes?.amparoLegal?.nome || 'Não informado'}</p>
                                                            </div>
                                                            
                                                            <div className="space-y-1">
                                                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Modo de Disputa</div>
                                                                <p className="text-sm font-bold text-gray-900">{item.detalhes?.modoDisputaNome || 'Pregão'}</p>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Situação</div>
                                                                <p className="text-sm font-bold text-gray-900">{item.detalhes?.situacaoCompraNome || 'Concluída/Encerrada'}</p>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Início Propostas</div>
                                                                <p className="text-sm font-bold text-gray-900">{item.detalhes?.dataAberturaProposta ? new Date(item.detalhes?.dataAberturaProposta).toLocaleString('pt-BR') : 'N/D'}</p>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Fim Propostas</div>
                                                                <p className="text-sm font-bold text-gray-900">{item.detalhes?.dataEncerramentoProposta ? new Date(item.detalhes?.dataEncerramentoProposta).toLocaleString('pt-BR') : 'Não informada'}</p>
                                                            </div>
                                                            
                                                            <div className="space-y-1">
                                                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Tipo Edital</div>
                                                                <p className="text-sm font-bold text-gray-900">{item.detalhes?.tipoInstrumentoConvocatorioNome || 'Não informado'}</p>
                                                            </div>

                                                        </div>
                                                        
                                                        <div className="mt-2 pt-4 border-t border-gray-200">
                                                            <p className="text-xs text-gray-500 font-medium">
                                                                Objeto: <span className="font-bold text-gray-900 uppercase">{item.descricao}</span>
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="mt-4 bg-gray-100 rounded text-xs px-3 py-2 text-gray-500 border border-gray-200">
                                                            Inf. Adicional: {item.fonte === 'PNCP' ? 'API Direta (Gov)' : 'Base de Dados Local'}
                                                        </div>
                                                    </div>
                                                )}

                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default ItemDatabaseSearch;
