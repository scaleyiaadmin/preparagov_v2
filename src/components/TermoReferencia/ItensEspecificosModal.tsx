import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Search,
  ArrowRight,
  X,
  Eye,
  ChevronDown,
  ChevronRight,
  Package,
  Loader2
} from 'lucide-react';
import DFDViewModal from '../DFD/DFDViewModal';
import { dfdService } from '@/services/dfdService';
import { useAuth } from '@/contexts/AuthContext';
import { DbDFD, DbDFDItem } from '@/types/database';

interface ItensEspecificosModalProps {
  open: boolean;
  onClose: () => void;
  onContinuar: (selectedItems: any[]) => void;
}

const ItensEspecificosModal = ({ open, onClose, onContinuar }: ItensEspecificosModalProps) => {
  const { user } = useAuth();
  const [dfds, setDfds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    secretaria: 'todas',
    tipoDFD: 'todos',
    prioridade: 'todas',
    anoContratacao: 'todos',
    busca: ''
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedDFDs, setExpandedDFDs] = useState<string[]>([]);
  const [showDFDPreview, setShowDFDPreview] = useState(false);
  const [selectedDFDForPreview, setSelectedDFDForPreview] = useState<any>(null);

  useEffect(() => {
    if (open) {
      loadDFDs();
    }
  }, [open, user?.prefeituraId]);

  const loadDFDs = async () => {
    try {
      setLoading(true);
      const data = await dfdService.getAll({ status: 'Aprovado' });
      setDfds(data || []);
    } catch (error) {
      console.error('Erro ao carregar DFDs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDFDs = useMemo(() => {
    return dfds.filter(dfd => {
      const matchesBusca = !filtros.busca ||
        dfd.numero_dfd?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        dfd.descricao_sucinta?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        dfd.area_requisitante?.toLowerCase().includes(filtros.busca.toLowerCase());

      const matchesSecretaria = filtros.secretaria === 'todas' || dfd.area_requisitante === filtros.secretaria;
      const matchesTipo = filtros.tipoDFD === 'todos' || dfd.tipo_dfd === filtros.tipoDFD;
      const matchesPrioridade = filtros.prioridade === 'todas' || dfd.prioridade === filtros.prioridade;
      const matchesAno = filtros.anoContratacao === 'todos' || dfd.ano_contratacao?.toString() === filtros.anoContratacao;

      return matchesBusca && matchesSecretaria && matchesTipo && matchesPrioridade && matchesAno;
    });
  }, [dfds, filtros]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleToggleDFD = (dfdId: string) => {
    setExpandedDFDs(prev =>
      prev.includes(dfdId)
        ? prev.filter(id => id !== dfdId)
        : [...prev, dfdId]
    );
  };

  const handleViewDFD = (dfd: any) => {
    setSelectedDFDForPreview(dfd);
    setShowDFDPreview(true);
  };

  const handleContinuar = () => {
    const itensSelecionados: any[] = [];

    dfds.forEach(dfd => {
      dfd.dfd_items?.forEach((item: any) => {
        if (selectedItems.includes(item.id)) {
          itensSelecionados.push({
            ...item,
            dfdNumero: dfd.numero_dfd,
            dfdSecretaria: dfd.area_requisitante
          });
        }
      });
    });

    onContinuar(itensSelecionados);
  };

  const getPriorityColor = (prioridade: string | null) => {
    switch (prioridade) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const secretarias = [...new Set(dfds.map(d => d.area_requisitante).filter(Boolean))];
  const tipos = [...new Set(dfds.map(d => d.tipo_dfd).filter(Boolean))];

  const totalSelecionados = selectedItems.length;
  const valorTotalSelecionado = dfds.reduce((total, dfd) => {
    return total + (dfd.dfd_items?.reduce((dfdTotal: number, item: any) => {
      if (selectedItems.includes(item.id)) {
        return dfdTotal + (item.valor_estimado || 0);
      }
      return dfdTotal;
    }, 0) || 0);
  }, 0);

  const dfdsComSelecaoCount = useMemo(() => {
    const idsMap = new Set();
    dfds.forEach(dfd => {
      if (dfd.dfd_items?.some((item: any) => selectedItems.includes(item.id))) {
        idsMap.add(dfd.id);
      }
    });
    return idsMap.size;
  }, [dfds, selectedItems]);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-white border-b p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center text-orange-600">
                  <Package size={20} className="mr-2" />
                  Itens Específicos - Seleção para TR
                </div>
                <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
                  <X size={20} />
                </Button>
              </DialogTitle>
            </DialogHeader>

            {/* Filtros */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Buscar DFD..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  className="pl-10 h-9"
                />
              </div>

              <Select value={filtros.secretaria} onValueChange={(value) => setFiltros(prev => ({ ...prev, secretaria: value }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Áreas</SelectItem>
                  {secretarias.map(s => <SelectItem key={s!} value={s!}>{s}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filtros.tipoDFD} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipoDFD: value }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  {tipos.map(t => <SelectItem key={t!} value={t!}>{t}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filtros.prioridade} onValueChange={(value) => setFiltros(prev => ({ ...prev, prioridade: value }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtros.anoContratacao} onValueChange={(value) => setFiltros(prev => ({ ...prev, anoContratacao: value }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-6 space-y-4 bg-gray-50/50">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500 mb-2" />
                <p className="text-gray-500">Buscando itens dos DFDs...</p>
              </div>
            ) : filteredDFDs.length === 0 ? (
              <div className="py-20 text-center bg-white border rounded-lg">
                <Package size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500">Nenhum item aprovado disponível.</p>
              </div>
            ) : (
              filteredDFDs.map((dfd) => (
                <Card key={dfd.id} className="overflow-hidden border-gray-100 shadow-sm">
                  <Collapsible
                    open={expandedDFDs.includes(dfd.id)}
                    onOpenChange={() => handleToggleDFD(dfd.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-1 rounded bg-gray-100 text-gray-500 transition-transform ${expandedDFDs.includes(dfd.id) ? 'rotate-90' : ''}`}>
                            <ChevronRight size={16} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-blue-600">{dfd.numero_dfd}</span>
                              <Badge className={`${getPriorityColor(dfd.prioridade)} text-[10px]`}>
                                {dfd.prioridade}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">{dfd.descricao_sucinta}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Área</p>
                            <p className="text-xs text-gray-600">{dfd.area_requisitante}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total DFD</p>
                            <p className="text-xs font-bold text-green-700">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dfd.valor_estimado_total || 0)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDFD(dfd);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye size={16} className="text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="p-0 bg-white border-t">
                        <Table>
                          <TableHeader className="bg-gray-50/50">
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead className="font-bold text-xs uppercase text-gray-400">Item / Especificação</TableHead>
                              <TableHead className="font-bold text-xs uppercase text-gray-400">Unidade</TableHead>
                              <TableHead className="font-bold text-xs uppercase text-gray-400">Qtd</TableHead>
                              <TableHead className="font-bold text-xs uppercase text-gray-400">Valor Unit.</TableHead>
                              <TableHead className="font-bold text-xs uppercase text-gray-400">Valor Total</TableHead>
                              <TableHead className="font-bold text-xs uppercase text-gray-400">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dfd.dfd_items?.map((item: any) => {
                              const isUtilizado = !!item.tr_id;
                              return (
                                <TableRow
                                  key={item.id}
                                  className={`${isUtilizado ? 'bg-red-50/30' :
                                      selectedItems.includes(item.id) ? 'bg-orange-50/30' : ''
                                    }`}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedItems.includes(item.id)}
                                      onCheckedChange={() => handleSelectItem(item.id)}
                                      disabled={isUtilizado}
                                    />
                                  </TableCell>
                                  <TableCell className="max-w-xs">
                                    <p className={`text-sm font-medium ${isUtilizado ? 'text-gray-400' : 'text-gray-900'}`}>{item.descricao}</p>
                                    {item.especificacao && <p className="text-[10px] text-gray-400 truncate">{item.especificacao}</p>}
                                  </TableCell>
                                  <TableCell className="text-xs">{item.unidade_medida}</TableCell>
                                  <TableCell className="text-xs">{item.quantidade}</TableCell>
                                  <TableCell className="text-xs">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_unitario || 0)}
                                  </TableCell>
                                  <TableCell className="text-sm font-bold text-green-700">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_total || 0)}
                                  </TableCell>
                                  <TableCell>
                                    {isUtilizado ? (
                                      <Badge variant="destructive" className="text-[9px] uppercase font-bold py-0">Ocupado</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[9px] uppercase font-bold text-green-600 border-green-200 py-0">Disponível</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            )}
          </div>

          <div className="sticky bottom-0 z-10 p-6 border-t bg-white flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-6">
              <div className="text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Itens Selecionados</p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-orange-600">{totalSelecionados}</span>
                  <p className="text-xs text-gray-500">em <span className="font-bold">{dfdsComSelecaoCount}</span> DFD(s)</p>
                </div>
              </div>
              <div className="text-left border-l pl-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Subtotal Estimado</p>
                <p className="text-lg font-bold text-green-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalSelecionado)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onClose} className="text-gray-500">
                Cancelar
              </Button>
              <Button
                onClick={handleContinuar}
                disabled={selectedItems.length === 0}
                className="bg-orange-500 hover:bg-orange-600 min-w-[150px] shadow-sm"
              >
                Avançar para TR
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview do DFD */}
      <DFDViewModal
        open={showDFDPreview}
        onClose={() => setShowDFDPreview(false)}
        dfd={selectedDFDForPreview}
      />
    </>
  );
};

export default ItensEspecificosModal;
