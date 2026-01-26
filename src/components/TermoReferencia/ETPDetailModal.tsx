
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  FileText, 
  Building, 
  Calendar, 
  DollarSign,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';
import { ETPFinalizado } from '@/utils/termoReferenciaData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ETPDetailModalProps {
  etp: ETPFinalizado;
  onClose: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

const ETPDetailModal = ({ etp, onClose, onSelect, isSelected }: ETPDetailModalProps) => {
  const [expandedDFDs, setExpandedDFDs] = useState<string[]>([]);

  const toggleDFD = (dfdId: string) => {
    setExpandedDFDs(prev => 
      prev.includes(dfdId) 
        ? prev.filter(id => id !== dfdId)
        : [...prev, dfdId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Mock items data - in real scenario, this would come from the DFD data
  const mockItems = [
    { id: '1', nome: 'Computador Desktop', quantidade: 50, unidade: 'UN', valorTotal: 'R$ 150.000,00' },
    { id: '2', nome: 'Monitor LED 24"', quantidade: 50, unidade: 'UN', valorTotal: 'R$ 75.000,00' },
    { id: '3', nome: 'Teclado e Mouse', quantidade: 50, unidade: 'KIT', valorTotal: 'R$ 25.000,00' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detalhes do ETP</h2>
              <p className="text-gray-600">Visualização completa do ETP e DFDs vinculados</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {/* ETP Header Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 mb-2">
                {etp.titulo}
              </CardTitle>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
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
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Descrição da Demanda</h4>
                <p className="text-sm text-gray-600">{etp.descricaoDemanda}</p>
              </div>
            </CardContent>
          </Card>

          {/* DFDs Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info size={18} />
                <span>DFDs Vinculados ({etp.dfdsVinculados.length})</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {etp.dfdsVinculados.map((dfd) => (
                <Collapsible key={dfd.id}>
                  <CollapsibleTrigger 
                    onClick={() => toggleDFD(dfd.id)}
                    className="w-full"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {expandedDFDs.includes(dfd.id) ? (
                              <ChevronDown size={16} className="text-gray-400" />
                            ) : (
                              <ChevronRight size={16} className="text-gray-400" />
                            )}
                            
                            <div className="text-left">
                              <div className="font-medium text-gray-900">
                                {dfd.numero} - {dfd.nome}
                              </div>
                              <div className="text-sm text-gray-600">
                                Secretaria responsável • {dfd.valor}
                              </div>
                            </div>
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            Ver itens
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="mt-3 ml-6 border-l-2 border-gray-200 pl-4">
                      <h5 className="font-medium text-gray-900 mb-3">
                        Itens do DFD {dfd.numero}
                      </h5>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Unidade</TableHead>
                            <TableHead>Valor Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.nome}</TableCell>
                              <TableCell>{item.quantidade}</TableCell>
                              <TableCell>{item.unidade}</TableCell>
                              <TableCell className="text-green-600 font-medium">
                                {item.valorTotal}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Valor Total: {etp.valor}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button 
                onClick={onSelect}
                variant={isSelected ? "secondary" : "default"}
              >
                {isSelected ? 'ETP Selecionado' : 'Selecionar este ETP'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETPDetailModal;
