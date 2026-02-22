import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  FileText,
  Building,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2
} from 'lucide-react';
import { etpService } from '@/services/etpService';
import { useAuth } from '@/contexts/AuthContext';

interface ETP {
  id: string;
  titulo: string;
  numeroETP: string;
  secretaria: string;
  dataCriacao: string;
  valorTotal: string;
  descricaoDemanda: string;
  status: string;
}

interface ETPSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectETP: (etp: ETP) => void;
  selectedETP: ETP | null;
}

const ETPSelectionModal = ({ isOpen, onClose, onSelectETP, selectedETP }: ETPSelectionModalProps) => {
  const { user } = useAuth();
  const [etps, setEtps] = useState<ETP[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [secretariaFilter, setSecretariaFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    if (isOpen) {
      loadETPs();
    }
  }, [isOpen, user?.prefeituraId]);

  const loadETPs = async () => {
    try {
      setLoading(true);
      const data = await etpService.fetchConcluidos();
      setEtps(data);
    } catch (error) {
      console.error('Erro ao carregar ETPs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtros únicos para secretarias
  const secretarias = useMemo(() => {
    return [...new Set(etps.map(etp => etp.secretaria))];
  }, [etps]);

  // Aplicar filtros e busca
  const filteredETPs = useMemo(() => {
    return etps.filter(etp => {
      const matchesSearch = searchTerm === '' ||
        etp.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etp.numeroETP.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etp.secretaria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etp.descricaoDemanda.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSecretaria = secretariaFilter === 'all' || etp.secretaria === secretariaFilter;

      return matchesSearch && matchesSecretaria;
    }).sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.dataCriacao.localeCompare(b.dataCriacao);
      } else {
        return b.dataCriacao.localeCompare(a.dataCriacao);
      }
    });
  }, [etps, searchTerm, secretariaFilter, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(filteredETPs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedETPs = filteredETPs.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectETP = (etp: ETP) => {
    onSelectETP(etp);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSecretariaFilter('all');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, secretariaFilter, sortOrder]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Selecionar ETP</h2>
              <p className="text-gray-600">Escolha um ETP concluído para criar o mapa de riscos</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter size={16} />
                <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="p-6 border-b flex-shrink-0 bg-gray-50">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-md">Filtros e Busca</CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-xs">Busca Livre</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Nome, número, secretaria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secretaria" className="text-xs">Secretaria</Label>
                    <Select value={secretariaFilter} onValueChange={setSecretariaFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Todas as secretarias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as secretarias</SelectItem>
                        {secretarias.map(secretaria => (
                          <SelectItem key={secretaria} value={secretaria}>
                            {secretaria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort" className="text-xs">Ordenar por Data</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecionar ordem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Mais Recentes</SelectItem>
                        <SelectItem value="asc">Mais Antigos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" onClick={resetFilters} className="w-full h-9">
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content area with scroll */}
        <div className="flex-1 p-6 overflow-hidden bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : paginatedETPs.length > 0 ? (
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                {paginatedETPs.map((etp) => (
                  <div
                    key={etp.id}
                    className={`border rounded-lg p-5 cursor-pointer bg-white transition-all hover:border-orange-200 hover:shadow-sm ${selectedETP?.id === etp.id ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50/30' : 'border-gray-200'
                      }`}
                    onClick={() => handleSelectETP(etp)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{etp.titulo}</h3>
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">{etp.numeroETP}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center space-x-2">
                            <Building size={14} />
                            <span>{etp.secretaria}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} />
                            <span>Criado: {formatDate(etp.dataCriacao)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign size={14} className="text-green-600" />
                            <span className="font-semibold text-green-600">{etp.valorTotal}</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 line-clamp-2">
                          <span className="font-medium">Descrição:</span> {etp.descricaoDemanda}
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        {selectedETP?.id === etp.id ? (
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-200 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum ETP encontrado
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Não há estudos técnicos concluídos disponíveis para criar um mapa de riscos.
              </p>
            </div>
          )}
        </div>

        {/* Footer with pagination */}
        <div className="p-6 border-t bg-white flex-shrink-0">
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredETPs.length)} de {filteredETPs.length} ETPs
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm">
              {selectedETP ? (
                <span className="text-gray-900">Selecionado: <strong className="text-orange-600">{selectedETP.numeroETP}</strong></span>
              ) : (
                <span className="text-gray-400">Selecione um ETP da lista</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                Cancelar
              </Button>
              <Button
                onClick={() => selectedETP && onSelectETP(selectedETP)}
                disabled={!selectedETP}
                className="bg-orange-500 hover:bg-orange-600 text-white min-w-[120px] shadow-sm"
              >
                Avançar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETPSelectionModal;
