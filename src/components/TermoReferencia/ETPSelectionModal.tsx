
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Search, 
  FileText, 
  Building, 
  Calendar, 
  DollarSign,
  Check
} from 'lucide-react';
import { ETPFinalizado, getETPs } from '@/utils/termoReferenciaData';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ETPSelectionModalProps {
  onClose: () => void;
  onSelect: (etp: ETPFinalizado) => void;
}

const ETPSelectionModal = ({ onClose, onSelect }: ETPSelectionModalProps) => {
  const [etps] = useState<ETPFinalizado[]>(getETPs());
  const [filteredETPs, setFilteredETPs] = useState<ETPFinalizado[]>(etps);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedETP, setSelectedETP] = useState<ETPFinalizado | null>(null);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredETPs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedETPs = filteredETPs.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = etps.filter(etp =>
      etp.numero.toLowerCase().includes(term.toLowerCase()) ||
      etp.titulo.toLowerCase().includes(term.toLowerCase()) ||
      etp.secretaria.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredETPs(filtered);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleSelectETP = (etp: ETPFinalizado) => {
    setSelectedETP(etp);
  };

  const handleConfirmSelection = () => {
    if (selectedETP) {
      onSelect(selectedETP);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Selecionar ETP</h2>
              <p className="text-gray-600">Escolha um ETP finalizado para criar o Termo de Referência</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar por número, título ou secretaria..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {paginatedETPs.length > 0 ? (
            <div className="space-y-4">
              {paginatedETPs.map((etp) => (
                <Card 
                  key={etp.id} 
                  className={`cursor-pointer border hover:shadow-md transition-all ${
                    selectedETP?.id === etp.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectETP(etp)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-900 mb-2 flex items-center">
                          {selectedETP?.id === etp.id && (
                            <Check size={20} className="text-blue-600 mr-2" />
                          )}
                          {etp.titulo}
                        </CardTitle>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                          <div className="flex items-center space-x-2">
                            <FileText size={14} className="text-gray-400" />
                            <span className="text-blue-600 font-medium">{etp.numero}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Building size={14} className="text-gray-400" />
                            <span className="text-gray-600">{etp.secretaria}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-600">{formatDate(etp.dataConclusao)}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <DollarSign size={14} className="text-gray-400" />
                            <span className="text-green-600 font-semibold">{etp.valor}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{etp.descricaoDemanda}</p>

                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            DFDs Vinculados ({etp.dfdsVinculados.length})
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {etp.dfdsVinculados.map((dfd) => (
                              <Badge key={dfd.id} variant="outline" className="text-xs">
                                {dfd.numero} - {dfd.nome} ({dfd.valor})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum ETP encontrado
              </h3>
              <p className="text-gray-600">
                Nenhum ETP finalizado foi encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t bg-gray-50 flex-shrink-0">
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
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className="p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedETP ? (
                <span className="text-blue-600 font-medium">
                  ETP selecionado: {selectedETP.numero}
                </span>
              ) : (
                <span>Selecione um ETP para continuar</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmSelection}
                disabled={!selectedETP}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETPSelectionModal;
