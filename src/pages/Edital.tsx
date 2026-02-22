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
  Globe,
  Eye,
  Download,
  Filter,
  Loader2,
  Calendar
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
import TRSelectionModal from '../components/Edital/TRSelectionModal';
import EditalWizard from '../components/Edital/EditalWizard';
import { editalService } from '@/services/editalService';
import { useAuth } from '@/contexts/AuthContext';
import { DbEdital, DbTermoReferencia } from '@/types/database';

const Edital = () => {
  const { user } = useAuth();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedTR, setSelectedTR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editaisData, setEditaisData] = useState<DbEdital[]>([]);
  const [counts, setCounts] = useState({ total: 0, elaboracao: 0, concluidos: 0, publicados: 0 });
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
        editalService.fetchEditais(user?.prefeituraId || undefined),
        editalService.getCountsByStatus(user?.prefeituraId || undefined)
      ]);
      setEditaisData(list);
      setCounts(stats);
    } catch (error) {
      console.error('Erro ao carregar Editais:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os dados dos Editais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const secretarias = [...new Set(editaisData.map(e => e.secretaria_id || 'Não informada'))];

  const filteredEditais = editaisData.filter(edital => {
    const matchesSecretaria = filters.secretaria === 'all' || edital.secretaria_id === filters.secretaria;
    const matchesStatus = filters.status === 'all' || edital.status === filters.status;
    const matchesAno = filters.ano === 'all' || (edital.created_at && edital.created_at.startsWith(filters.ano));

    return matchesSecretaria && matchesStatus && matchesAno;
  });

  const statusFilteredEditais = filteredEditais.filter(edital => {
    switch (currentFilter) {
      case 'em-elaboracao':
        return edital.status === 'Em Elaboração' || edital.status === 'Rascunho';
      case 'concluidos':
        return edital.status === 'Concluído';
      case 'publicados':
        return edital.status === 'Publicado';
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(statusFilteredEditais.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEditais = statusFilteredEditais.slice(startIndex, startIndex + itemsPerPage);

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
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm">Em Elaboração</Badge>;
      case 'Concluído':
        return <Badge className="bg-green-100 text-green-800 border-green-200 shadow-sm">Concluído</Badge>;
      case 'Publicado':
      case 'Publicado no PNCP':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 shadow-sm">Publicado</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  const handleViewEdital = (edital: DbEdital) => {
    toast({
      title: "Visualizando Edital",
      description: `Abrindo detalhes do edital: ${edital.numero_edital}`,
    });
  };

  const handleEditEdital = (edital: DbEdital) => {
    toast({
      title: "Editando Edital",
      description: `Abrindo editor para: ${edital.numero_edital}`,
    });
  };

  const handleDownloadEdital = (edital: DbEdital) => {
    toast({
      title: "Download iniciado",
      description: `Baixando edital: ${edital.numero_edital}`,
    });
  };

  const handlePublishEdital = async (edital: DbEdital) => {
    try {
      setLoading(true);
      await editalService.publishEdital(edital.id);
      toast({
        title: "Publicado no PNCP",
        description: `Edital ${edital.numero_edital} publicado com sucesso.`,
      });
      loadData();
    } catch (error) {
      console.error('Erro ao publicar edital:', error);
      toast({
        title: "Erro na publicação",
        description: "Não foi possível publicar o edital no PNCP.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTRSelect = (tr: any) => {
    setSelectedTR(tr);
    setShowSelectionModal(false);
    setShowWizard(true);
  };

  const handleCloseSelectionModal = () => {
    setShowSelectionModal(false);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setSelectedTR(null);
    loadData();
  };

  const handleSaveEdital = (editalData: any) => {
    toast({
      title: "Edital Salvo",
      description: "Edital foi salvo com sucesso.",
    });
    setShowWizard(false);
    setSelectedTR(null);
    loadData();
  };

  if (showWizard && selectedTR) {
    return <EditalWizard selectedTR={selectedTR} onClose={handleCloseWizard} onSave={handleSaveEdital} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editais</h1>
          <p className="text-gray-600 font-medium">
            Gerencie os editais de licitação da prefeitura
          </p>
        </div>
        <Button onClick={() => setShowSelectionModal(true)} className="bg-orange-500 hover:bg-orange-600 shadow-md">
          <Plus size={16} className="mr-2" />
          Novo Edital
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-xs text-gray-500 font-bold uppercase">Total</p>
                <p className="text-xl font-black text-gray-900">{counts.total}</p>
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
                <p className="text-xs text-gray-500 font-bold uppercase">Em Elaboração</p>
                <p className="text-xl font-black text-gray-900">{counts.elaboracao}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md border-b-4 ${currentFilter === 'concluidos' ? 'border-b-green-500 shadow-sm' : 'border-b-transparent hover:border-b-green-200'
            }`}
          onClick={() => handleFilterChange('concluidos')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Concluídos</p>
                <p className="text-xl font-black text-gray-900">{counts.concluidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md border-b-4 ${currentFilter === 'publicados' ? 'border-b-purple-500 shadow-sm' : 'border-b-transparent hover:border-b-purple-200'
            }`}
          onClick={() => handleFilterChange('publicados')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Globe size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Publicados</p>
                <p className="text-xl font-black text-gray-900">{counts.publicados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-50/50 border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">
                Ano de Referência
              </label>
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
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">
                Filtrar por Status
              </label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Em Elaboração">Em Elaboração</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setFilters({ secretaria: 'all', status: 'all', ano: '2025' }); setCurrentFilter('all'); }} className="w-full bg-white">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editais List */}
      <Card className="shadow-sm border-gray-100 overflow-hidden">
        <CardHeader className="bg-white pb-2 flex flex-row items-center justify-between border-b">
          <CardTitle className="text-lg font-bold flex items-center space-x-2">
            <FileText size={20} className="text-orange-500" />
            <span>Documentos ({statusFilteredEditais.length})</span>
          </CardTitle>
          {loading && <Loader2 className="w-5 h-5 animate-spin text-orange-500" />}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-orange-500" />
              <p className="text-gray-500">Buscando editais...</p>
            </div>
          ) : statusFilteredEditais.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/20">
              <FileText size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium font-bold">
                Nenhum edital encontrado.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowSelectionModal(true)}>
                Criar Novo Edital
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-bold">Número / Data</TableHead>
                      <TableHead className="font-bold">Objeto / Modalidade</TableHead>
                      <TableHead className="font-bold text-center">Valor Estimado</TableHead>
                      <TableHead className="font-bold text-center">Status</TableHead>
                      <TableHead className="font-bold text-right">AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEditais.map((edital) => (
                      <TableRow key={edital.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="font-black text-blue-600 text-sm">{edital.numero_edital || 'S/N'}</div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase flex items-center mt-1">
                            <Calendar size={10} className="mr-1" />
                            {formatDate(edital.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="font-bold text-gray-900 text-sm line-clamp-1">{edital.objeto}</div>
                          <div className="text-[10px] text-gray-400 font-black uppercase mt-1">{edital.modalidade}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-black text-gray-900 border-l-4 border-l-green-500 pl-2 inline-block">
                            {formatCurrency(edital.valor_estimado)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(edital.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEdital(edital)}
                              className="h-8 w-8 p-0"
                              title="Ver"
                            >
                              <Eye size={16} className="text-gray-400" />
                            </Button>

                            {(edital.status === 'Em Elaboração' || edital.status === 'Rascunho') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEdital(edital)}
                                className="h-8 w-8 p-0"
                                title="Editar"
                              >
                                <Edit size={16} className="text-orange-500" />
                              </Button>
                            )}

                            {edital.status === 'Concluído' && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadEdital(edital)}
                                  className="h-8 w-8 p-0"
                                  title="Baixar PDF"
                                >
                                  <Download size={16} className="text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePublishEdital(edital)}
                                  className="h-8 w-8 p-0 text-purple-600"
                                  title="Publicar no PNCP"
                                >
                                  <Globe size={16} />
                                </Button>
                              </div>
                            )}

                            {(edital.status === 'Publicado' || edital.status === 'Publicado no PNCP') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadEdital(edital)}
                                className="h-8 w-8 p-0"
                                title="Baixar PDF"
                              >
                                <Download size={16} className="text-blue-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="py-4 border-t px-6 flex items-center justify-between bg-white">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, statusFilteredEditais.length)} de {statusFilteredEditais.length}
                  </p>
                  <Pagination className="w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50 text-[10px]' : 'cursor-pointer text-[10px]'}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page} className="hidden md:block">
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer h-8 w-8 text-xs"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50 text-[10px]' : 'cursor-pointer text-[10px]'}
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

      {showSelectionModal && (
        <TRSelectionModal
          onClose={handleCloseSelectionModal}
          onSelect={handleTRSelect}
        />
      )}
    </div>
  );
};

export default Edital;
