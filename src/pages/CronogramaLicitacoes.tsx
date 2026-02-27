
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Eye,
  FileText,
  Filter,
  Calendar,
  Building,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CronogramaItemsModal from '../components/CronogramaLicitacoes/CronogramaItemsModal';
import { useCronogramaData, CronogramaItem } from '../hooks/useCronogramaData';
import { formatDate, getPriorityColor } from '../utils/pcaConsolidation';

const CronogramaLicitacoes = () => {
  const [filters, setFilters] = useState({
    ano: '2024',
    secretaria: 'all',
    prioridade: 'all',
    tipoDFD: 'all'
  });
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedLicitacao, setSelectedLicitacao] = useState<CronogramaItem | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 5;

  const {
    cronogramaData,
    secretarias,
    tiposDFD,
    filteredData
  } = useCronogramaData(filters);

  // Apply status filter
  const statusFilteredData = filteredData.filter(item => {
    switch (currentFilter) {
      case 'em-elaboracao':
        return item.status === 'Em Elaboração';
      case 'concluidos':
        return item.status === 'Concluído';
      case 'publicados':
        return item.status === 'Publicado';
      default:
        return true;
    }
  });

  // Pagination
  const totalPages = Math.ceil(statusFilteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = statusFilteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleViewItems = (licitacao: CronogramaItem) => {
    setSelectedLicitacao(licitacao);
    setShowItemsModal(true);
  };

  const handleCreateTR = (licitacao: CronogramaItem) => {
    toast({
      title: "Redirecionando para TR",
      description: `Criando Termo de Referência para: ${licitacao.tipoDFD}`,
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "Cronograma de licitações está sendo gerado em PDF.",
    });
  };

  const handleExportXLS = () => {
    toast({
      title: "Exportando Excel",
      description: "Cronograma de licitações está sendo gerado em Excel.",
    });
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cronograma de Licitações</h1>
            <p className="text-gray-600">
              Visualize e gerencie o cronograma de licitações baseado nos dados do PCA
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download size={16} className="mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExportXLS}>
              <Download size={16} className="mr-2" />
              Exportar Excel
            </Button>
          </div>
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
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Licitações</p>
                  <p className="text-xl font-bold text-gray-900">{filteredData.length}</p>
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
                  <Clock size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Em Elaboração</p>
                  <p className="text-xl font-bold text-gray-900">
                    {filteredData.filter(item => item.status === 'Em Elaboração').length}
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
                    {filteredData.filter(item => item.status === 'Concluído').length}
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
                  <Building size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Publicados</p>
                  <p className="text-xl font-bold text-gray-900">
                    {filteredData.filter(item => item.status === 'Publicado').length}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Ano de Contratação
                </label>
                <Select value={filters.ano} onValueChange={(value) => updateFilter('ano', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  Prioridade
                </label>
                <Select value={filters.prioridade} onValueChange={(value) => updateFilter('prioridade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipo de DFD
                </label>
                <Select value={filters.tipoDFD} onValueChange={(value) => updateFilter('tipoDFD', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {tiposDFD.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cronograma Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar size={20} className="mr-2" />
              Cronograma de Licitações - {filters.ano}
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
            {statusFilteredData.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {currentFilter === 'all'
                    ? 'Nenhuma licitação encontrada para os filtros selecionados.'
                    : `Nenhuma licitação ${currentFilter === 'em-elaboracao' ? 'em elaboração' :
                      currentFilter === 'concluidos' ? 'concluída' :
                        'publicada'} encontrada.`}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo de DFD</TableHead>
                        <TableHead>Data de Contratação</TableHead>
                        <TableHead>Data Sugerida de Abertura</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Secretarias Envolvidas</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((licitacao) => (
                        <TableRow key={licitacao.id}>
                          <TableCell>
                            <div className="font-medium">
                              {licitacao.tipoDFD}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(licitacao.dataContratacao)}</TableCell>
                          <TableCell>{formatDate(licitacao.dataSugeridaAbertura)}</TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(licitacao.prioridade)}>
                              {licitacao.prioridade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {licitacao.secretariasSiglas.slice(0, 3).map((sigla: string, index: number) => (
                                <Tooltip key={index}>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className="text-xs cursor-help">
                                      {sigla}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{licitacao.secretariasNomes[index]}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                              {licitacao.secretariasSiglas.length > 3 && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className="text-xs cursor-help">
                                      +{licitacao.secretariasSiglas.length - 3}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1">
                                      {licitacao.secretariasNomes.slice(3).map((nome: string, index: number) => (
                                        <p key={index}>{nome}</p>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {licitacao.valorTotal}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewItems(licitacao)}
                              >
                                <Eye size={14} className="mr-1" />
                                Ver Itens
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateTR(licitacao)}
                                className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                              >
                                <FileText size={14} className="mr-1" />
                                Criar TR
                              </Button>
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

        {/* Items Modal */}
        <CronogramaItemsModal
          isOpen={showItemsModal}
          onClose={() => setShowItemsModal(false)}
          licitacao={selectedLicitacao}
        />
      </div>
    </TooltipProvider>
  );
};

export default CronogramaLicitacoes;
