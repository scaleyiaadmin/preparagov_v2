
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
import TRCreationWizard from '../components/TermoReferencia/TRCreationWizard';
import TRSelectionModal from '../components/TermoReferencia/TRSelectionModal';
import { getTermosReferencia, formatCurrency, formatDate, getStatusColor } from '../utils/termoReferenciaData';

const TermoReferencia = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<'cronograma' | 'dfds-livres' | 'itens-especificos' | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);
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

  const termosData = getTermosReferencia();
  
  const secretarias = Array.from(new Set(termosData.map(termo => termo.secretaria)));

  const filteredTermos = termosData.filter(termo => {
    const matchesSecretaria = filters.secretaria === 'all' || termo.secretaria === filters.secretaria;
    const matchesStatus = filters.status === 'all' || termo.status === filters.status;
    const matchesAno = filters.ano === 'all' || termo.ano === filters.ano;
    
    return matchesSecretaria && matchesStatus && matchesAno;
  });

  // Apply status filter based on currentFilter
  const statusFilteredTermos = filteredTermos.filter(termo => {
    switch (currentFilter) {
      case 'em-elaboracao':
        return termo.status === 'Em Elaboração';
      case 'prontos':
        return termo.status === 'Pronto';
      default:
        return true;
    }
  });

  // Pagination
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

  const handleViewTR = (tr: any) => {
    toast({
      title: "Visualizando TR",
      description: `Abrindo detalhes do TR: ${tr.objeto}`,
    });
  };

  const handleEditTR = (tr: any) => {
    toast({
      title: "Editando TR",
      description: `Abrindo editor para: ${tr.objeto}`,
    });
  };

  const handleDownloadTR = (tr: any) => {
    toast({
      title: "Download iniciado",
      description: `Baixando TR: ${tr.objeto}`,
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
  };

  const handleSaveTR = (trData: any) => {
    toast({
      title: "TR Salvo",
      description: "Termo de Referência foi salvo com sucesso.",
    });
    setShowWizard(false);
    setSelectedOrigin(null);
    setSelectedData(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Termos de Referência</h1>
          <p className="text-gray-600">
            Gerencie os termos de referência para licitações
          </p>
        </div>
        <Button onClick={handleNovoTR} className="bg-orange-500 hover:bg-orange-600">
          <Plus size={16} className="mr-2" />
          Novo TR
        </Button>
      </div>

      {/* Statistics Cards - Now clickable filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            currentFilter === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleFilterChange('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de TRs</p>
                <p className="text-xl font-bold text-gray-900">{filteredTermos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            currentFilter === 'em-elaboracao' ? 'ring-2 ring-yellow-500' : ''
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
                  {filteredTermos.filter(termo => termo.status === 'Em Elaboração').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            currentFilter === 'prontos' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => handleFilterChange('prontos')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prontos</p>
                <p className="text-xl font-bold text-gray-900">
                  {filteredTermos.filter(termo => termo.status === 'Pronto').length}
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
                  <SelectItem value="Pronto">Pronto</SelectItem>
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

      {/* Terms List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText size={20} className="mr-2" />
            Lista de Termos de Referência
            {currentFilter !== 'all' && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - {currentFilter === 'em-elaboracao' ? 'Em Elaboração' : 'Prontos'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusFilteredTermos.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {currentFilter === 'all' 
                  ? 'Nenhum termo de referência encontrado para os filtros selecionados.' 
                  : `Nenhum termo de referência ${currentFilter === 'em-elaboracao' ? 'em elaboração' : 'pronto'} encontrado.`}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Objeto</TableHead>
                      <TableHead>Secretaria</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTermos.map((termo) => (
                      <TableRow key={termo.id || Math.random()}>
                        <TableCell>
                          <div className="font-medium">{String(termo.objeto || '')}</div>
                          <div className="text-sm text-gray-500">{String(termo.tipoDFD || '')}</div>
                        </TableCell>
                        <TableCell>{String(termo.secretaria || '')}</TableCell>
                        <TableCell className="font-medium">
                          {termo.valorEstimado ? formatCurrency(termo.valorEstimado) : 'N/A'}
                        </TableCell>
                        <TableCell>{formatDate(termo.dataCriacao)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(termo.status)}>
                            {termo.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTR(termo)}
                            >
                              <Eye size={14} className="mr-1" />
                              Ver
                            </Button>
                            {termo.status === 'Em Elaboração' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTR(termo)}
                              >
                                <Edit size={14} className="mr-1" />
                                Editar
                              </Button>
                            )}
                            {termo.status === 'Pronto' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadTR(termo)}
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
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
