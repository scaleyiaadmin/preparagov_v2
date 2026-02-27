import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Search, Filter, X } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface DFD {
  id: string;
  objeto: string;
  valorEstimado: string;
  tipoDFD: string;
  secretaria?: string;
  prioridade: string;
  dataContratacao?: string;
  numeroDFD?: string;
  status?: string;
  usedInETP?: boolean;
  secretario?: string;
  responsavelDemanda?: string;
}

interface DFDSelectionStepProps {
  availableDFDs: DFD[];
  selectedDFDs: DFD[];
  onSelectDFDs: (dfds: DFD[]) => void;
}

interface Filters {
  dataContratacao: string;
  prioridade: string;
  numeroDFD: string;
  secretaria: string;
  searchTerm: string;
}

const DFDSelectionStep = ({ availableDFDs, selectedDFDs, onSelectDFDs }: DFDSelectionStepProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    dataContratacao: 'none',
    prioridade: 'all',
    numeroDFD: 'none',
    secretaria: 'all',
    searchTerm: ''
  });

  const itemsPerPage = 5;

  // Get unique values for filter options
  const secretarias = useMemo(() =>
    [...new Set(availableDFDs.map(dfd => dfd.secretaria).filter(Boolean))],
    [availableDFDs]
  );

  const prioridades = useMemo(() =>
    [...new Set(availableDFDs.map(dfd => dfd.prioridade))],
    [availableDFDs]
  );

  // Filter and sort DFDs
  const filteredDFDs = useMemo(() => {
    const filtered = availableDFDs.filter(dfd => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          dfd.objeto.toLowerCase().includes(searchLower) ||
          dfd.secretaria?.toLowerCase().includes(searchLower) ||
          dfd.numeroDFD?.toLowerCase().includes(searchLower) ||
          dfd.tipoDFD.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Other filters
      if (filters.prioridade && filters.prioridade !== 'all' && dfd.prioridade !== filters.prioridade) return false;
      if (filters.secretaria && filters.secretaria !== 'all' && dfd.secretaria !== filters.secretaria) return false;

      return true;
    });

    // Sort by selected criteria
    if (filters.dataContratacao === 'asc') {
      filtered.sort((a, b) => (a.dataContratacao || '').localeCompare(b.dataContratacao || ''));
    } else if (filters.numeroDFD === 'asc') {
      filtered.sort((a, b) => (a.numeroDFD || '').localeCompare(b.numeroDFD || ''));
    }

    return filtered;
  }, [availableDFDs, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredDFDs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDFDs = filteredDFDs.slice(startIndex, startIndex + itemsPerPage);

  const handleDFDToggle = (dfd: DFD, checked: boolean) => {
    if (checked) {
      onSelectDFDs([...selectedDFDs, dfd]);
    } else {
      onSelectDFDs(selectedDFDs.filter(selected => selected.id !== dfd.id));
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      dataContratacao: 'none',
      prioridade: 'all',
      numeroDFD: 'none',
      secretaria: 'all',
      searchTerm: ''
    });
    setCurrentPage(1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const hasActiveFilters = filters.searchTerm !== '' ||
    filters.dataContratacao !== 'none' ||
    filters.prioridade !== 'all' ||
    filters.numeroDFD !== 'none' ||
    filters.secretaria !== 'all';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Seleção de DFDs</span>
          {selectedDFDs.length > 0 && (
            <CheckCircle size={20} className="text-green-500" />
          )}
        </CardTitle>
        <p className="text-gray-600">
          Selecione um ou mais DFDs aprovados para vincular ao ETP
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar por nome, secretaria, número do DFD ou palavra-chave..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Data de Contratação</Label>
              <Select value={filters.dataContratacao} onValueChange={(value) => handleFilterChange('dataContratacao', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem ordenação</SelectItem>
                  <SelectItem value="asc">Mais próxima primeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={filters.prioridade} onValueChange={(value) => handleFilterChange('prioridade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {prioridades.map((prioridade) => (
                    <SelectItem key={prioridade} value={prioridade}>
                      {prioridade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número do DFD</Label>
              <Select value={filters.numeroDFD} onValueChange={(value) => handleFilterChange('numeroDFD', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por número" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem ordenação</SelectItem>
                  <SelectItem value="asc">Crescente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Secretaria</Label>
              <Select value={filters.secretaria} onValueChange={(value) => handleFilterChange('secretaria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as secretarias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {secretarias.map((secretaria) => (
                    <SelectItem key={secretaria} value={secretaria}>
                      {secretaria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X size={16} className="mr-2" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {paginatedDFDs.length} de {filteredDFDs.length} DFDs
          </span>
          {selectedDFDs.length > 0 && (
            <span className="text-green-600 font-medium">
              {selectedDFDs.length} selecionado(s)
            </span>
          )}
        </div>

        {/* DFD List */}
        <div className="space-y-4">
          {paginatedDFDs.map((dfd) => (
            <div
              key={dfd.id}
              className={`border rounded-lg p-4 transition-colors ${selectedDFDs.some(selected => selected.id === dfd.id)
                ? 'border-orange-500 bg-orange-50'
                : dfd.usedInETP
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedDFDs.some(selected => selected.id === dfd.id)}
                  onCheckedChange={(checked) => handleDFDToggle(dfd, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">{dfd.objeto}</h3>
                      {dfd.numeroDFD && (
                        <p className="text-sm text-blue-600 font-medium">DFD nº {dfd.numeroDFD}</p>
                      )}
                    </div>
                    {dfd.usedInETP && (
                      <Badge variant="secondary" className="text-xs">
                        Já utilizado
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline">{dfd.tipoDFD}</Badge>
                    <Badge className={getPriorityColor(dfd.prioridade)}>
                      {dfd.prioridade}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {dfd.valorEstimado}
                    </p>
                    {dfd.secretaria && (
                      <p className="text-sm text-gray-600">{dfd.secretaria}</p>
                    )}
                    {dfd.secretario && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Secretário:</span> {dfd.secretario}
                      </p>
                    )}
                    {dfd.responsavelDemanda && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Responsável:</span> {dfd.responsavelDemanda}
                      </p>
                    )}
                    {dfd.dataContratacao && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Previsão:</span> {dfd.dataContratacao}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {paginatedDFDs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Filter size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum DFD encontrado com os filtros aplicados</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && (
                <PaginationItem>
                  <span className="px-4 py-2">...</span>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Selected DFDs Summary */}
        {selectedDFDs.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">
              DFDs Selecionados ({selectedDFDs.length})
            </h4>
            <div className="space-y-2">
              {selectedDFDs.map((dfd) => (
                <div key={dfd.id} className="text-sm text-green-700">
                  • {dfd.objeto} - {dfd.valorEstimado}
                  {dfd.secretaria && ` (${dfd.secretaria})`}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DFDSelectionStep;
