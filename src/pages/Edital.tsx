import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  FileText,
  Edit,
  Clock,
  CheckCircle,
  Globe,
  Eye,
  Download,
  Filter
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
import { TermoReferencia } from '@/utils/termoReferenciaData';

const Edital = () => {
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedTR, setSelectedTR] = useState<TermoReferencia | null>(null);
  const [filters, setFilters] = useState({
    secretaria: 'all',
    status: 'all',
    ano: '2024'
  });
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const itemsPerPage = 5;

  // Check for filter from dashboard navigation
  useEffect(() => {
    const dashboardFilter = sessionStorage.getItem('documentFilter');
    if (dashboardFilter === 'em-elaboracao') {
      setCurrentFilter('em-elaboracao');
      sessionStorage.removeItem('documentFilter'); // Clean up
    }
  }, []);

  const editaisData: any[] = [];

  const secretarias = Array.from(new Set(editaisData.map(edital => edital.secretaria)));

  const filteredEditais = editaisData.filter(edital => {
    const matchesSecretaria = filters.secretaria === 'all' || edital.secretaria === filters.secretaria;
    const matchesStatus = filters.status === 'all' || edital.status === filters.status;
    const matchesAno = filters.ano === 'all' || edital.ano === filters.ano;

    return matchesSecretaria && matchesStatus && matchesAno;
  });

  // Apply status filter based on currentFilter
  const statusFilteredEditais = filteredEditais.filter(edital => {
    switch (currentFilter) {
      case 'em-elaboracao':
        return edital.status === 'Em Elaboração';
      case 'concluidos':
        return edital.status === 'Concluído';
      case 'publicados':
        return edital.status === 'Publicado no PNCP';
      default:
        return true;
    }
  });

  // Pagination
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Elaboração':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Concluído':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Publicado no PNCP':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewEdital = (edital: any) => {
    toast({
      title: "Visualizando Edital",
      description: `Abrindo detalhes do edital: ${edital.numero}`,
    });
  };

  const handleEditEdital = (edital: any) => {
    toast({
      title: "Editando Edital",
      description: `Abrindo editor para: ${edital.numero}`,
    });
  };

  const handleDownloadEdital = (edital: any) => {
    toast({
      title: "Download iniciado",
      description: `Baixando edital: ${edital.numero}`,
    });
  };

  const handlePublishEdital = (edital: any) => {
    toast({
      title: "Publicando no PNCP",
      description: `Iniciando publicação do edital: ${edital.numero}`,
    });
  };

  const handleTRSelect = (tr: TermoReferencia) => {
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
  };

  const handleSaveEdital = (editalData: any) => {
    toast({
      title: "Edital Salvo",
      description: "Edital foi salvo com sucesso.",
    });
    setShowWizard(false);
    setSelectedTR(null);
  };

  if (showWizard && selectedTR) {
    return <EditalWizard selectedTR={selectedTR} onClose={handleCloseWizard} onSave={handleSaveEdital} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editais</h1>
          <p className="text-gray-600">
            Gerencie os editais de licitação
          </p>
        </div>
        <Button onClick={() => setShowSelectionModal(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus size={16} className="mr-2" />
          Novo Edital
        </Button>
      </div>

      {/* Statistics Cards - Now clickable filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${currentFilter === 'all' ? 'ring-2 ring-blue-500' : ''
            }`}
          onClick={() => handleFilterChange('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Editais</p>
                <p className="text-xl font-bold text-gray-900">{filteredEditais.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${currentFilter === 'em-elaboracao' ? 'ring-2 ring-yellow-500' : ''
            }`}
          onClick={() => handleFilterChange('em-elaboracao')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Em Elaboração</p>
                <p className="text-xl font-bold text-gray-900">
                  {filteredEditais.filter(edital => edital.status === 'Em Elaboração').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${currentFilter === 'concluidos' ? 'ring-2 ring-green-500' : ''
            }`}
          onClick={() => handleFilterChange('concluidos')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-xl font-bold text-gray-900">
                  {filteredEditais.filter(edital => edital.status === 'Concluído').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${currentFilter === 'publicados' ? 'ring-2 ring-purple-500' : ''
            }`}
          onClick={() => handleFilterChange('publicados')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Publicados</p>
                <p className="text-xl font-bold text-gray-900">
                  {filteredEditais.filter(edital => edital.status === 'Publicado no PNCP').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter size={20} className="mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Secretaria
              </label>
              <Select value={filters.secretaria} onValueChange={(value) => updateFilter('secretaria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as secretarias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as secretarias</SelectItem>
                  {secretarias.map((secretaria) => (
                    <SelectItem key={secretaria} value={secretaria}>
                      {secretaria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Em Elaboração">Em Elaboração</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Publicado no PNCP">Publicado no PNCP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ano
              </label>
              <Select value={filters.ano} onValueChange={(value) => updateFilter('ano', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editais List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText size={20} className="mr-2" />
            Lista de Editais
            {currentFilter !== 'all' && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - {currentFilter === 'em-elaboracao' ? 'Em Elaboração' :
                  currentFilter === 'concluidos' ? 'Concluídos' :
                    'Publicados'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusFilteredEditais.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {currentFilter === 'all'
                  ? 'Nenhum edital encontrado para os filtros selecionados.'
                  : `Nenhum edital ${currentFilter === 'em-elaboracao' ? 'em elaboração' :
                    currentFilter === 'concluidos' ? 'concluído' :
                      'publicado'} encontrado.`}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Objeto</TableHead>
                      <TableHead>Secretaria</TableHead>
                      <TableHead>Modalidade</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEditais.map((edital) => (
                      <TableRow key={edital.id}>
                        <TableCell>
                          <div className="font-medium">{edital.numero}</div>
                          <div className="text-sm text-gray-500">
                            Criado em {formatDate(edital.dataCriacao)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{edital.objeto}</div>
                          <div className="text-sm text-gray-500">
                            Prazo: {edital.prazoEntrega}
                          </div>
                        </TableCell>
                        <TableCell>{edital.secretaria}</TableCell>
                        <TableCell>{edital.modalidade}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(edital.valorEstimado)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(edital.status)}>
                            {edital.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewEdital(edital)}
                            >
                              <Eye size={14} className="mr-1" />
                              Ver
                            </Button>
                            {edital.status === 'Em Elaboração' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEdital(edital)}
                              >
                                <Edit size={14} className="mr-1" />
                                Editar
                              </Button>
                            )}
                            {edital.status === 'Concluído' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadEdital(edital)}
                                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                >
                                  <Download size={14} className="mr-1" />
                                  Download
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePublishEdital(edital)}
                                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                >
                                  <Globe size={14} className="mr-1" />
                                  Publicar
                                </Button>
                              </>
                            )}
                            {edital.status === 'Publicado no PNCP' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadEdital(edital)}
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <Download size={14} className="mr-1" />
                                Download
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
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
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
