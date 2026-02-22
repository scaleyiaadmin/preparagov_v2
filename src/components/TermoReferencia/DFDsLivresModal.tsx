import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Search,
  FileText,
  ArrowRight,
  X,
  Eye,
  Loader2
} from 'lucide-react';
import DFDViewModal from '../DFD/DFDViewModal';
import { dfdService } from '@/services/dfdService';
import { useAuth } from '@/contexts/AuthContext';
import { DbDFD } from '@/types/database';

interface DFDsLivresModalProps {
  open: boolean;
  onClose: () => void;
  onContinuar: (selectedDFDs: any[]) => void;
}

const DFDsLivresModal = ({ open, onClose, onContinuar }: DFDsLivresModalProps) => {
  const { user } = useAuth();
  const [dfds, setDfds] = useState<DbDFD[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    secretaria: 'todos',
    tipoDFD: 'todos',
    prioridade: 'todas',
    anoContratacao: 'todos',
    busca: ''
  });
  const [selectedDFDs, setSelectedDFDs] = useState<string[]>([]);
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
      // Buscamos apenas DFDs aprovados
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

      const matchesSecretaria = filtros.secretaria === 'todos' || dfd.area_requisitante === filtros.secretaria;
      const matchesTipo = filtros.tipoDFD === 'todos' || dfd.tipo_dfd === filtros.tipoDFD;
      const matchesPrioridade = filtros.prioridade === 'todas' || dfd.prioridade === filtros.prioridade;
      const matchesAno = filtros.anoContratacao === 'todos' || dfd.ano_contratacao?.toString() === filtros.anoContratacao;

      return matchesBusca && matchesSecretaria && matchesTipo && matchesPrioridade && matchesAno;
    });
  }, [dfds, filtros]);

  const handleSelectDFD = (dfdId: string) => {
    setSelectedDFDs(prev =>
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
    const selecionados = dfds.filter(dfd => selectedDFDs.includes(dfd.id));
    onContinuar(selecionados);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText size={20} className="mr-2 text-blue-600" />
                DFDs Livres - Seleção para TR
              </div>
              <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
                <X size={20} />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filtros */}
            <Card className="bg-gray-50/50 border-none shadow-none">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Busca</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        placeholder="Número, descrição ou área..."
                        value={filtros.busca}
                        onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                        className="pl-10 h-9 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Área</label>
                    <Select value={filtros.secretaria} onValueChange={(value) => setFiltros(prev => ({ ...prev, secretaria: value }))}>
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        {secretarias.map(s => <SelectItem key={s!} value={s!}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Tipo</label>
                    <Select value={filtros.tipoDFD} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipoDFD: value }))}>
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {tipos.map(t => <SelectItem key={t!} value={t!}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Prioridade</label>
                    <Select value={filtros.prioridade} onValueChange={(value) => setFiltros(prev => ({ ...prev, prioridade: value }))}>
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Ano</label>
                    <Select value={filtros.anoContratacao} onValueChange={(value) => setFiltros(prev => ({ ...prev, anoContratacao: value }))}>
                      <SelectTrigger className="h-9 bg-white">
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
              </CardContent>
            </Card>

            {/* Tabela de DFDs */}
            <div className="rounded-md border bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-bold">Número</TableHead>
                    <TableHead className="font-bold">Área Requisitante</TableHead>
                    <TableHead className="font-bold">Descrição</TableHead>
                    <TableHead className="font-bold">Tipo</TableHead>
                    <TableHead className="font-bold">Data Contratação</TableHead>
                    <TableHead className="font-bold">Prioridade</TableHead>
                    <TableHead className="font-bold">Valor Total</TableHead>
                    <TableHead className="font-bold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
                        <span className="text-gray-500">Buscando DFDs aprovados...</span>
                      </TableCell>
                    </TableRow>
                  ) : filteredDFDs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-gray-500">
                        Nenhum DFD aprovado encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDFDs.map((dfd) => (
                      <TableRow key={dfd.id} className={selectedDFDs.includes(dfd.id) ? 'bg-blue-50/50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedDFDs.includes(dfd.id)}
                            onCheckedChange={() => handleSelectDFD(dfd.id)}
                          />
                        </TableCell>
                        <TableCell className="font-bold text-blue-600">
                          {dfd.numero_dfd}
                        </TableCell>
                        <TableCell className="text-sm">{dfd.area_requisitante}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate">{dfd.descricao_sucinta}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{dfd.tipo_dfd}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {dfd.data_contratacao ? new Date(dfd.data_contratacao).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(dfd.prioridade)} text-[10px]`}>
                            {dfd.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-green-700">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dfd.valor_estimado_total || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDFD(dfd)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye size={16} className="text-gray-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Resumo e Ações */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-600 flex items-center space-x-4">
                <div className="bg-white px-3 py-1 rounded-full border shadow-sm">
                  <span className="font-bold text-blue-600">{selectedDFDs.length}</span> DFD(s) selecionado(s)
                </div>
                {selectedDFDs.length > 0 && (
                  <div className="bg-green-50 px-3 py-1 rounded-full border border-green-100 shadow-sm">
                    Total Estimado: <span className="font-bold text-green-700">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        dfds
                          .filter(dfd => selectedDFDs.includes(dfd.id))
                          .reduce((total, dfd) => total + (dfd.valor_estimado_total || 0), 0)
                      )}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={onClose} className="text-gray-500">
                  Cancelar
                </Button>
                <Button
                  onClick={handleContinuar}
                  disabled={selectedDFDs.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Avançar para TR
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
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

export default DFDsLivresModal;
