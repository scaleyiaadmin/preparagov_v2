
import React, { useState, useMemo } from 'react';
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
  Filter
} from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [secretariaFilter, setSecretariaFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 5;

  // Mock data - ETPs concluídos
  const etps: ETP[] = [
    {
      id: '1',
      titulo: 'ETP Modernização Tecnológica',
      numeroETP: 'ETP-2024-001',
      secretaria: 'Secretaria de Tecnologia',
      dataCriacao: '2024-06-15',
      valorTotal: 'R$ 2.850.000,00',
      descricaoDemanda: 'Modernização do parque tecnológico com aquisição de equipamentos de TI, software e licenças para melhorar a eficiência dos serviços públicos.',
      status: 'concluido'
    },
    {
      id: '2',
      titulo: 'ETP Equipamentos de Saúde',
      numeroETP: 'ETP-2024-003',
      secretaria: 'Secretaria de Saúde',
      dataCriacao: '2024-05-20',
      valorTotal: 'R$ 1.200.000,00',
      descricaoDemanda: 'Aquisição de equipamentos médicos para unidades básicas de saúde, incluindo aparelhos de diagnóstico e equipamentos hospitalares.',
      status: 'concluido'
    },
    {
      id: '3',
      titulo: 'ETP Infraestrutura Urbana',
      numeroETP: 'ETP-2024-005',
      secretaria: 'Secretaria de Obras',
      dataCriacao: '2024-04-10',
      valorTotal: 'R$ 5.500.000,00',
      descricaoDemanda: 'Projeto de melhoria da infraestrutura urbana incluindo pavimentação, drenagem e sinalização de vias públicas.',
      status: 'concluido'
    },
    {
      id: '4',
      titulo: 'ETP Veículos Municipais',
      numeroETP: 'ETP-2024-007',
      secretaria: 'Secretaria de Administração',
      dataCriacao: '2024-03-25',
      valorTotal: 'R$ 800.000,00',
      descricaoDemanda: 'Renovação da frota municipal com aquisição de veículos para diferentes secretarias e serviços públicos.',
      status: 'concluido'
    },
    {
      id: '5',
      titulo: 'ETP Material Escolar',
      numeroETP: 'ETP-2024-009',
      secretaria: 'Secretaria de Educação',
      dataCriacao: '2024-02-14',
      valorTotal: 'R$ 450.000,00',
      descricaoDemanda: 'Aquisição de material escolar e pedagógico para atender todas as unidades educacionais da rede municipal.',
      status: 'concluido'
    },
    {
      id: '6',
      titulo: 'ETP Equipamentos de Segurança',
      numeroETP: 'ETP-2024-011',
      secretaria: 'Secretaria de Segurança',
      dataCriacao: '2024-01-30',
      valorTotal: 'R$ 950.000,00',
      descricaoDemanda: 'Modernização dos equipamentos de segurança pública incluindo câmeras, rádios e viaturas.',
      status: 'concluido'
    },
    {
      id: '7',
      titulo: 'ETP Limpeza Urbana',
      numeroETP: 'ETP-2024-013',
      secretaria: 'Secretaria de Meio Ambiente',
      dataCriacao: '2024-01-15',
      valorTotal: 'R$ 1.100.000,00',
      descricaoDemanda: 'Contratação de serviços de limpeza urbana e aquisição de equipamentos para coleta seletiva.',
      status: 'concluido'
    }
  ];

  // Filtros únicos para secretarias
  const secretarias = [...new Set(etps.map(etp => etp.secretaria))];

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
        return a.numeroETP.localeCompare(b.numeroETP);
      } else {
        return b.numeroETP.localeCompare(a.numeroETP);
      }
    });
  }, [searchTerm, secretariaFilter, sortOrder]);

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
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, secretariaFilter, sortOrder]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              <CardHeader>
                <CardTitle className="text-lg">Filtros e Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Busca Livre</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Nome, número, secretaria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secretaria">Secretaria</Label>
                    <Select value={secretariaFilter} onValueChange={setSecretariaFilter}>
                      <SelectTrigger>
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
                    <Label htmlFor="sort">Ordenar por Número</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar ordem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Crescente</SelectItem>
                        <SelectItem value="desc">Decrescente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" onClick={resetFilters} className="w-full">
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content area with scroll */}
        <div className="flex-1 p-6 overflow-hidden">
          {paginatedETPs.length > 0 ? (
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                {paginatedETPs.map((etp) => (
                  <div
                    key={etp.id}
                    className={`border rounded-lg p-6 cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedETP?.id === etp.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelectETP(etp)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-lg text-gray-900">{etp.titulo}</h3>
                          <Badge variant="default" className="text-sm">{etp.numeroETP}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <Building size={16} />
                            <span>{etp.secretaria}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar size={16} />
                            <span>Criado: {formatDate(etp.dataCriacao)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign size={16} />
                            <span className="font-semibold text-green-600">{etp.valorTotal}</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Descrição:</span>
                          <p className="mt-2 leading-relaxed">{etp.descricaoDemanda}</p>
                        </div>
                      </div>

                      <div className="ml-4">
                        {selectedETP?.id === etp.id && (
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum ETP encontrado
                </h3>
                <p className="text-gray-600">
                  Não há ETPs que correspondam aos filtros aplicados.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with pagination */}
        <div className="p-6 border-t bg-gray-50 flex-shrink-0">
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredETPs.length)} de {filteredETPs.length} ETPs
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedETP ? (
                <span>ETP selecionado: <strong>{selectedETP.numeroETP}</strong></span>
              ) : (
                <span>Nenhum ETP selecionado</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => selectedETP && onSelectETP(selectedETP)}
                disabled={!selectedETP}
                className="bg-orange-500 hover:bg-orange-600"
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
