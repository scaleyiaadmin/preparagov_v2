import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    Loader2,
    Info,
    Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';

// Importa a lógica agressiva de busca copiada do Media Fácil
import { searchAllSources } from '@/lib/searchAggregator';
import { PNCPItem } from '@/lib/pncp'; // Mesmo que ItemDisponivel no Media Facil
import { cn } from '@/lib/utils';
import { DFDItem } from './types';

interface ItemDatabaseSearchProps {
    open: boolean;
    onClose: () => void;
    onAddItems: (items: DFDItem[]) => void;
}

const fontesDisponiveis = [
    { id: "pncp", label: "PNCP" },
    { id: "nfe", label: "Banco de NFe" },
    { id: "bps", label: "BPS" },
    { id: "cmed", label: "CMED" },
    { id: "sinapi", label: "SINAPI" },
    { id: "ceasa", label: "CEASA" },
    { id: "setop", label: "SETOP", emBreve: true },
    { id: "simpro", label: "SIMPRO", emBreve: true },
    { id: "sigtap", label: "SIGTAP", emBreve: true },
    { id: "licitacoes_similares", label: "Licitações Similares", emBreve: true },
];

function fonteDoItem(fonte: string): string {
    if (!fonte) return "outro";
    const f = fonte.toUpperCase();
    if (f.includes("PNCP")) return "pncp";
    if (f.includes("NFE") || f.includes("NF-E") || f.includes("NF E") || f.includes("NOTA")) return "nfe";
    if (f.includes("BPS")) return "bps";
    if (f.includes("CMED")) return "cmed";
    if (f.includes("SINAPI")) return "sinapi";
    if (f.includes("SETOP")) return "setop";
    if (f.includes("SIMPRO")) return "simpro";
    if (f.includes("SIGTAP")) return "sigtap";
    if (f.includes("CEASA")) return "ceasa";
    if (f.includes("LICITA") || f.includes("SIMILAR")) return "licitacoes_similares";
    return "outro";
}

// ResultItem renderiza cada Card como o Média Fácil
const ResultItem = React.memo(({
    item,
    isChecked,
    onToggle
}: {
    item: PNCPItem;
    isChecked: boolean;
    onToggle: (id: string) => void;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    let badgeStyle = "bg-[#fef2f2] text-[#b91c1c]"; // Default warm
    const f = (item.fonte || "").toUpperCase();
    if (f.includes("PNCP")) badgeStyle = "bg-[#fff7ed] text-[#c2410c]";
    if (f.includes("NFE") || f.includes("NF-E")) badgeStyle = "bg-[#f4f4f5] text-[#3f3f46]";

    return (
        <div
            className={cn(
                "flex items-start gap-4 px-6 py-4 transition-all border-b border-border/40 hover:bg-muted/5",
                isChecked && "bg-primary/[0.03]"
            )}
        >
            <div className="pt-1.5 cursor-pointer shrink-0">
                <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onToggle(item.id)}
                    className={cn(
                        "h-5 w-5 rounded border-muted-foreground/30",
                        isChecked && "data-[state=checked]:bg-[#c2410c] data-[state=checked]:border-[#c2410c]"
                    )}
                />
            </div>

            <div className="flex-1 min-w-0 space-y-3">
                {/* Linha 1: Badge e Preço */}
                <div className="flex items-center justify-between">
                    <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider", badgeStyle)}>
                        {f.includes('NFE') ? 'BANCO DE NFE' : (item.fonte?.split(' ')[0] || 'FONTE')}
                    </span>
                    <div className="flex items-center gap-3">
                        <p className="text-lg font-black text-[#bc4216]">
                            R$ {(item.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Linha 2: Título */}
                <div className="flex items-start justify-between gap-4">
                    <h5 className="text-sm font-black text-[#1a1a1a] leading-tight flex-1">
                        {item.nome}
                    </h5>
                </div>

                {/* Linha 3: 4 Informações Principais */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 mt-3 pt-3 border-t border-border/40">
                    {item.orgao && (
                        <div className="flex items-start gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Órgão / Entidade</p>
                                <p className="text-xs font-bold text-foreground leading-tight truncate" title={item.orgao}>{item.orgao}</p>
                            </div>
                        </div>
                    )}
                    {item.data && (
                        <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Data de Publicação</p>
                                <p className="text-xs font-bold text-foreground leading-tight">{item.data}</p>
                            </div>
                        </div>
                    )}
                    {item.modalidade && (
                        <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Modalidade</p>
                                <p className="text-xs font-bold text-foreground leading-tight truncate" title={item.modalidade}>{item.modalidade}</p>
                            </div>
                        </div>
                    )}
                    {(item.cidadeUf || item.ufOrigem) && (
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Localidade</p>
                                <p className="text-xs font-bold text-foreground leading-tight">{item.cidadeUf || item.ufOrigem}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Linha 4: Informações Detalhadas (Expansível) */}
                <div className="flex justify-start mt-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-[10px] font-bold text-muted-foreground hover:text-[#c2410c] px-2 py-0 gap-1 rounded-md bg-muted/20 hover:bg-orange-50"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {isExpanded ? "Ocultar Detalhes" : "Ver Detalhes"}
                    </Button>
                </div>

                {isExpanded && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-4 mt-3 pt-3 border-t border-border/20">
                            {item.cnpj && (
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">CNPJ Órgão</p>
                                        <p className="text-xs font-bold text-foreground leading-tight">{item.cnpj}</p>
                                    </div>
                                </div>
                            )}
                            {item.nomeFornecedor && (
                                <div className="flex items-start gap-2">
                                    <Tag className="h-4 w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Fornecedor Vencedor</p>
                                        <p className="text-xs font-bold text-foreground leading-tight truncate" title={item.nomeFornecedor}>{item.nomeFornecedor}</p>
                                    </div>
                                </div>
                            )}
                            {f.includes("PNCP") && (
                                <>
                                    <div className="flex items-start gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Unid. Compradora</p>
                                            <p className="text-[10px] font-bold text-foreground leading-tight truncate" title={item.unidadeCompradora || "Não informada"}>{item.unidadeCompradora || "Não informada"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Amparo Legal</p>
                                            <p className="text-[10px] font-bold text-foreground leading-tight truncate" title={item.amparoLegal || "Não informado"}>{item.amparoLegal || "Não informado"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Tag className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Modo de Disputa</p>
                                            <p className="text-[10px] font-bold text-foreground leading-tight truncate" title={item.modoDisputa || "Não informado"}>{item.modoDisputa || "Não informado"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Situação</p>
                                            <p className="text-[10px] font-bold text-foreground leading-tight">{item.situacaoCompra || "Não informada"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Início Propostas</p>
                                            <p className="text-[10px] font-bold text-foreground leading-tight">{item.dataInicioPropostas || "Não informada"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Fim Propostas</p>
                                            <p className="text-[10px] font-bold text-foreground leading-tight">{item.dataFimPropostas || "Não informada"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Tipo Edital</p>
                                            <p className="text-[10px] font-bold text-foreground leading-tight truncate" title={item.tipoEdital || "Não informado"}>{item.tipoEdital || "Não informado"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Fonte Orçamentária</p>
                                            <p className="text-[10px] font-bold text-foreground leading-tight truncate" title={item.fonteOrcamentaria || "Não informada"}>{item.fonteOrcamentaria || "Não informada"}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Adiciona o objeto da compra se existir para PNCP */}
                        {f.includes("PNCP") && (
                            <div className="mt-2 text-[10px] text-muted-foreground/80 leading-snug border-l-2 border-[#bc4216]/40 pl-2">
                                <span className="font-bold text-foreground/80">Objeto: </span>
                                {item.objetoCompra || item.nome}
                            </div>
                        )}

                        {item.metadata && (
                            <p className="text-[10px] text-muted-foreground/70 italic mt-2 font-medium bg-muted/20 p-2 rounded-md border border-border/50">
                                Inf. Adicional: {item.metadata}
                            </p>
                        )}
                    </div>
                )}

                {/* Rodapé com botão Ver no PNCP */}
                {f.includes("PNCP") && item.link && (
                    <div className="flex justify-end w-full mt-3 pt-2">
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-4 text-[11px] font-bold gap-1.5 shrink-0 bg-[#bc4216] hover:bg-[#a03813] text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.link, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            Ver no PNCP
                            <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
});


const ItemDatabaseSearch = ({ open, onClose, onAddItems }: ItemDatabaseSearchProps) => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTermAtivo, setSearchTermAtivo] = useState("");
    const [itensOnline, setItensOnline] = useState<PNCPItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Filtros de Fonte (Interface Media Fácil style)
    const [selecionadasFontes, setSelecionadasFontes] = useState<Set<string>>(new Set(["pncp", "nfe"]));

    // Seleção via checkbox
    const [idsSelecionadosTemp, setIdsSelecionadosTemp] = useState<Set<string>>(new Set());

    const executarBusca = useCallback(async () => {
        const termo = searchTerm.trim();
        if (termo.length < 3) return;
        
        setIsSearching(true);
        setSearchTermAtivo(termo);
        setIdsSelecionadosTemp(new Set()); // zera selaçao atual

        try {
            // Usa as configs importadas do Media Fácil (searchAllSources que traz as camadas ricas)
            const result = await searchAllSources(termo, {
                includePNCP: true,
                includeBPS: true,
                includeCMED: true,
                includeSINAPI: true,
                includeCATSER: false,
                includeSETOP: false,
                includeSIMPRO: false,
                includeSIGTAP: false,
                includeNFe: true,
                includeCeasa: true,
                limitPerSource: 1000 // Traz o máximo possível
            });
            
            setItensOnline(result);
            if (result.length === 0) {
                toast({ title: 'Nenhum resultado encontrado para este item.', variant: 'default' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro ao buscar no banco.', variant: 'destructive' });
        } finally {
            setIsSearching(false);
        }
    }, [searchTerm, toast]);

    // Buscador automático com Debounce manual (idêntico ao Media Fácil)
    useEffect(() => {
        if (!open) return;
        const termo = searchTerm.trim();
        if (termo.length >= 3 && termo !== searchTermAtivo) {
            const handler = setTimeout(() => {
                executarBusca();
            }, 800);
            return () => clearTimeout(handler);
        }
    }, [searchTerm, searchTermAtivo, executarBusca, open]);

    // Resultados que passam no filtro de "Fontes"
    const resultadosFiltrados = useMemo(() => {
        return itensOnline.filter(item => selecionadasFontes.has(fonteDoItem(item.fonte)));
    }, [itensOnline, selecionadasFontes]);

    const toggleSelecionadasFontes = (id: string) => {
        setSelecionadasFontes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelecao = (id: string) => {
        setIdsSelecionadosTemp(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selecionarTodos = () => {
        if (idsSelecionadosTemp.size === resultadosFiltrados.length && resultadosFiltrados.length > 0) {
            setIdsSelecionadosTemp(new Set());
        } else {
            setIdsSelecionadosTemp(new Set(resultadosFiltrados.map(i => i.id)));
        }
    };

    const handleFinish = () => {
        if (idsSelecionadosTemp.size === 0) {
            toast({ title: "Nenhum item selecionado", variant: "destructive" });
            return;
        }

        const itemsToAdd: DFDItem[] = Array.from(idsSelecionadosTemp).map(id => {
            const item = itensOnline.find(i => i.id === id);
            if (!item) return null;
            return {
                id: `selected-${Date.now()}-${item.id}`,
                codigo: item.id.substring(0, 10), // Fallback se tiver string mto longa
                descricao: item.nome,
                unidade: item.unidade || 'UN',
                quantidade: 1, // Default 1
                valorReferencia: item.preco,
                tabelaReferencia: item.fonte
            };
        }).filter(Boolean) as DFDItem[];

        onAddItems(itemsToAdd);
        onClose();
        // Reseta o estado local depois de enviar
        setTimeout(() => {
            setSearchTerm('');
            setSearchTermAtivo('');
            setIdsSelecionadosTemp(new Set());
            setItensOnline([]);
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if(!val) onClose(); }}>
            <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none p-0 flex flex-col bg-[#F9FAFB]">
                
                {/* HEADERS (Media Fácil Navbar) */}
                <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                    <Button variant="ghost" className="text-gray-600 font-medium hover:bg-gray-100 px-3 transition-colors" onClick={onClose}>
                        <ArrowLeft className="mr-2" size={16} /> Voltar
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button onClick={handleFinish} className="bg-[#bc4216] hover:bg-[#a03813] text-white shadow-sm font-medium h-10 px-6 transition-all">
                            Adicionar e Continuar 
                            <ShoppingCart className="ml-2 mt-0.5" size={16} />
                            {idsSelecionadosTemp.size > 0 && (
                                <span className="ml-2 bg-white/20 text-white rounded-full px-2 py-0.5 text-xs">
                                    {idsSelecionadosTemp.size}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* SEARCH BAR & INFO */}
                <div className="bg-white border-b px-6 py-6 shrink-0 z-0 relative">
                    <div className="max-w-7xl mx-auto space-y-4">
                        <div className="flex space-x-3">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#bc4216] transition-colors" size={20} />
                                <Input 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 text-gray-800 text-lg border-gray-200 focus:border-[#bc4216] focus:ring-[#bc4216] rounded-lg shadow-sm"
                                    placeholder="Pesquise um item: arroz, caneta, papel..."
                                />
                            </div>
                            <Button className="h-14 px-10 bg-[#bc4216] hover:bg-[#a03813] text-white font-bold text-lg rounded-lg shadow-sm transition-all">
                                Buscar
                            </Button>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">
                            Busque o item desejado. Após os resultados, selecione as fontes para compor a cesta de preços de seu projeto DFD.
                        </p>
                    </div>
                </div>

                {/* SOURCES TOGGLE */}
                <div className="max-w-7xl mx-auto w-full px-6 pt-6 pb-2 shrink-0">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 border rounded shrink-0 flex items-center justify-center transition-colors border-gray-200 text-gray-500 bg-white"
                        >
                            <Filter size={16} />
                        </Button>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            {fontesDisponiveis.map(s => {
                                const isSelected = selecionadasFontes.has(s.id);
                                return (
                                    <div key={s.id} className="relative shrink-0 mb-2">
                                        <Button
                                            disabled={!!s.emBreve}
                                            variant="outline"
                                            onClick={() => toggleSelecionadasFontes(s.id)}
                                            className={cn(
                                                "h-10 px-5 font-semibold text-xs rounded border transition-all disabled:opacity-50",
                                                isSelected 
                                                    ? "border-[#c2410c] text-[#c2410c] bg-orange-50 shadow-sm"
                                                    : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
                                            )}
                                        >
                                            {s.label}
                                        </Button>
                                        {s.emBreve && (
                                            <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-gray-400 text-white text-[9px] font-black rounded uppercase tracking-wider">
                                                EM BREVE
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RESULTS AREA */}
                <div className="max-w-7xl mx-auto w-full flex-1 overflow-hidden flex flex-col min-h-0 pt-2 pb-6 px-6">
                    
                    <div className="flex justify-between items-center mb-4 shrink-0 bg-white p-4 rounded-t-lg border-b border-gray-100 shadow-sm">
                        <h2 className="text-[#1a1a1a] font-bold text-base uppercase tracking-tight">
                            {isSearching ? (
                                <span className="flex items-center text-[#bc4216]"><Loader2 className="animate-spin h-5 w-5 mr-2" /> BUSCANDO COM IA...</span>
                            ) : (
                                <span className="text-[#bc4216]">{resultadosFiltrados.length} RESULTADO(S) ENCONTRADOS</span>
                            )}
                        </h2>
                        <button 
                            onClick={selecionarTodos}
                            className="text-[#bc4216] hover:underline font-bold text-xs uppercase disabled:opacity-50 tracking-wider"
                            disabled={resultadosFiltrados.length === 0}
                        >
                            {idsSelecionadosTemp.size === resultadosFiltrados.length && resultadosFiltrados.length > 0 ? "DESMARCAR TODOS" : "SELECIONAR TODOS"}
                        </button>
                    </div>

                    <ScrollArea className="flex-1 rounded-b-lg border border-gray-100 bg-white shadow-sm -mx-2 px-2 overflow-y-auto w-full">
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in duration-500">
                                <Search className="text-[#bc4216]/50 h-10 w-10 mb-4 animate-pulse" />
                                <p className="text-gray-500 font-medium">Nossa Inteligência Artificial está analisando dezenas de bases do Governo e NFE ao mesmo tempo. Isso pode levar alguns segundos.</p>
                            </div>
                        ) : resultadosFiltrados.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <ShoppingCart className="text-gray-200 h-12 w-12 mb-4" />
                                <p className="text-gray-400 font-medium">Nenhum item referenciado encontrado. Tente buscar por algo ou alterar as Fontes selecionadas.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col pb-10">
                                {resultadosFiltrados.map(item => (
                                    <ResultItem 
                                        key={item.id}
                                        item={item}
                                        isChecked={idsSelecionadosTemp.has(item.id)}
                                        onToggle={toggleSelecao}
                                    />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default ItemDatabaseSearch;
