import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  FileText,
  Edit,
  CheckCircle,
  Eye,
  Download,
  Filter,
  Loader2,
  Calendar,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import TRCreationWizard from '../components/TermoReferencia/TRCreationWizard';
import TRSelectionModal from '../components/TermoReferencia/TRSelectionModal';
import { termoReferenciaService } from '@/services/termoReferenciaService';
import { useAuth } from '@/contexts/AuthContext';
import { DbTermoReferencia } from '@/types/database';

const TermoReferencia = () => {
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<'cronograma' | 'dfds-livres' | 'itens-especificos' | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [termosData, setTermosData] = useState<DbTermoReferencia[]>([]);
  const [counts, setCounts] = useState({ total: 0, elaboracao: 0, prontos: 0 });
  const [filters, setFilters] = useState({
    secretaria: 'all',
    status: 'all',
    ano: '2025'
  });
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const itemsPerPage = 5;

  useEffect(() => {
    loadData();
  }, [user?.prefeituraId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, stats] = await Promise.all([
        termoReferenciaService.fetchTermosReferencia(user?.prefeituraId || undefined),
        termoReferenciaService.getCountsByStatus(user?.prefeituraId || undefined)
      ]);
      setTermosData(list);
      setCounts(stats);
    } catch (error) {
      console.error('Erro ao carregar Termos de Referência:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os dados dos Termos de Referência.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const secretarias = [...new Set(termosData.map(termo => termo.secretaria_id || 'Não informada'))];

  const filteredTermos = termosData.filter(termo => {
    const matchesSecretaria = filters.secretaria === 'all' || (termo.secretaria_id === filters.secretaria);
    const matchesStatus = filters.status === 'all' || termo.status === filters.status;
    const matchesAno = filters.ano === 'all' || (termo.created_at && termo.created_at.startsWith(filters.ano));

    return matchesSecretaria && matchesStatus && matchesAno;
  });

  const statusFilteredTermos = filteredTermos.filter(termo => {
    switch (currentFilter) {
      case 'em-elaboracao':
        return termo.status === 'Em Elaboração' || termo.status === 'Rascunho';
      case 'prontos':
        return termo.status === 'Pronto' || termo.status === 'Concluído';
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(statusFilteredTermos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTermos = statusFilteredTermos.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Em Elaboração':
      case 'Rascunho':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Em Elaboração</Badge>;
      case 'Pronto':
      case 'Concluído':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Pronto</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  const handleViewTR = (tr: DbTermoReferencia) => {
    toast({
      title: "Visualizando TR",
      description: `Abrindo detalhes do TR: ${tr.objeto?.substring(0, 30)}...`,
    });
  };

  const handleEditTR = (tr: DbTermoReferencia) => {
    toast({
      title: "Editando TR",
      description: `Abrindo editor para: ${tr.objeto?.substring(0, 30)}...`,
    });
  };

  const handleDownloadTR = (tr: DbTermoReferencia) => {
    toast({
      title: "Download iniciado",
      description: `Baixando TR: ${tr.objeto?.substring(0, 30)}...`,
    });
  };

  const handleNovoTR = () => {
    setShowSelectionModal(true);
  };

  const handleOriginSelected = (origin: 'cronograma' | 'dfds-livres' | 'itens-especificos', data: any) => {
    setSelectedOrigin(origin);
    setSelectedData(data);
    setShowSelectionModal(false);
    setShowWizard(true);
  };

  const handleCloseSelectionModal = () => {
    setShowSelectionModal(false);
  };

  const handleCloseTRWizard = () => {
    setShowWizard(false);
    setSelectedOrigin(null);
    setSelectedData(null);
    loadData(); // Refresh list after closing wizard
  };

  const handleSaveTR = async (trData: any) => {
    try {
      // Logic for saving already inside wizard, here we just handle UI
      toast({
        title: "TR Salvo",
        description: "Termo de Referência foi salvo com sucesso.",
      });
      setShowWizard(false);
      setSelectedOrigin(null);
      setSelectedData(null);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar TR:', error);
    }
  };

  if (showWizard && selectedOrigin) {
    return (
      <TRCreationWizard
        origin={selectedOrigin}
        selectedData={selectedData}
        onClose={handleCloseTRWizard}
        onSave={handleSaveTR}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Termos de Referência</h1>
          <p className="text-gray-600">
            Gerencie os termos de referência para licitações
          </p>
        </div>
        <Button onClick={handleNovoTR} className="bg-orange-500 hover:bg-orange-600 shadow-md">
          <Plus size={16} className="mr-2" />
          Novo TR
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md border-b-4 ${currentFilter === 'all' ? 'border-b-blue-500 shadow-sm' : 'border-b-transparent hover:border-b-blue-200'
            }`}
          onClick={() => handleFilterChange('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total de TRs</p>
                <p className="text-xl font-bold text-gray-900">{counts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md border-b-4 ${currentFilter === 'em-elaboracao' ? 'border-b-yellow-500 shadow-sm' : 'border-b-transparent hover:border-b-yellow-200'
            }`}
          onClick={() => handleFilterChange('em-elaboracao')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Edit size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Em Elaboração</p>
                <p className="text-xl font-bold text-gray-900">{counts.elaboracao}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md border-b-4 ${currentFilter === 'prontos' ? 'border-b-green-500 shadow-sm' : 'border-b-transparent hover:border-b-green-200'
            }`}
          onClick={() => handleFilterChange('prontos')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Prontos</p>
                <p className="text-xl font-bold text-gray-900">{counts.prontos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Table */}
      <Card className="border-none shadow-sm bg-gray-50/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">
                Ano de Referência
              </label>
              <div className="flex items-center space-x-2">
                <Select value={filters.ano} onValueChange={(value) => updateFilter('ano', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => updateFilter('ano', 'all')} className="text-gray-400">
                  <X size={14} />
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">
                Filtrar por Status
              </label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Em Elaboração">Em Elaboração</SelectItem>
                  <SelectItem value="Rascunho">Rascunho</SelectItem>
                  <SelectItem value="Pronto">Pronto</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms List */}
      <Card className="shadow-sm border-gray-100 overflow-hidden">
        <CardHeader className="bg-white pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center space-x-2">
            <FileText size={20} className="text-orange-500" />
            <span>Documentos ({statusFilteredTermos.length})</span>
          </CardTitle>
          {loading && <Loader2 className="w-5 h-5 animate-spin text-orange-500" />}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-orange-500" />
              <p className="text-gray-500">Carregando termos de referência...</p>
            </div>
          ) : statusFilteredTermos.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/30">
              <FileText size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">
                Nenhum termo de referência encontrado.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleNovoTR}>
                Criar Primeiro TR
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-bold">Número / Objeto</TableHead>
                      <TableHead className="font-bold">Informações</TableHead>
                      <TableHead className="font-bold">Valor Estimado</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTermos.map((termo) => (
                      <TableRow key={termo.id} className="hover:bg-gray-50/50">
                        <TableCell className="max-w-md">
                          <div className="font-bold text-blue-600 text-sm mb-1">{termo.numero_tr || 'S/N'}</div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">{termo.objeto}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              <span>{formatDate(termo.created_at)}</span>
                            </div>
                            <div className="flex items-center uppercase font-bold text-[10px]">
                              {termo.tipo || 'TR COMUM'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-gray-900 border-l-4 border-green-500 pl-2 py-1">
                            {formatCurrency(termo.valor_estimado)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(termo.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTR(termo)}
                              className="h-8 w-8 p-0"
                              title="Visualizar"
                            >
                              <Eye size={16} className="text-gray-500" />
                            </Button>
                            {(termo.status === 'Em Elaboração' || termo.status === 'Rascunho') ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTR(termo)}
                                className="h-8 w-8 p-0"
                                title="Editar"
                              >
                                <Edit size={16} className="text-orange-600" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadTR(termo)}
                                className="h-8 w-8 p-0"
                                title="Download PDF"
                              >
                                <Download size={16} className="text-green-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="py-4 border-t px-6 flex items-center justify-between bg-white">
                  <p className="text-xs text-gray-500">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, statusFilteredTermos.length)} de {statusFilteredTermos.length} registros
                  </p>
                  <Pagination className="w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page} className="hidden md:block">
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de seleção de origem */}
      <TRSelectionModal
        open={showSelectionModal}
        onClose={handleCloseSelectionModal}
        onOriginSelected={handleOriginSelected}
      />
    </div>
  );
};

export default TermoReferencia;
