
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search, FileText, Calendar, Building } from 'lucide-react';
import { TermoReferencia } from '@/utils/termoReferenciaData';

interface TRSelectionModalProps {
  onClose: () => void;
  onSelect: (tr: TermoReferencia) => void;
}

const TRSelectionModal = ({ onClose, onSelect }: TRSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data de TRs disponíveis
  const mockTRs: TermoReferencia[] = [
    {
      id: '1',
      numero: 'TR-2024-001',
      objeto: 'Aquisição de Materiais Escolares',
      secretaria: 'Secretaria de Educação',
      responsavel: 'João Silva',
      status: 'Aprovado',
      dataCriacao: '2024-01-15',
      etpTitulo: 'ETP Materiais Escolares 2024',
      etpNumero: 'ETP-2024-001',
      modalidade: 'pregao-eletronico',
      criterioJulgamento: 'menor-preco',
      tipoExecucao: 'direta',
      registroPrecos: false,
      valorEstimado: 150000
    },
    {
      id: '2',
      numero: 'TR-2024-002',
      objeto: 'Contratação de Serviços de Limpeza',
      secretaria: 'Secretaria de Administração',
      responsavel: 'Maria Santos',
      status: 'Aprovado',
      dataCriacao: '2024-02-10',
      etpTitulo: 'ETP Serviços de Limpeza',
      etpNumero: 'ETP-2024-002',
      modalidade: 'pregao-eletronico',
      criterioJulgamento: 'menor-preco',
      tipoExecucao: 'indireta',
      registroPrecos: true,
      valorEstimado: 300000
    },
    {
      id: '3',
      numero: 'TR-2024-003',
      objeto: 'Aquisição de Equipamentos de Informática',
      secretaria: 'Secretaria de Tecnologia',
      responsavel: 'Carlos Oliveira',
      status: 'Aprovado',
      dataCriacao: '2024-02-20',
      etpTitulo: 'ETP Equipamentos TI',
      etpNumero: 'ETP-2024-003',
      modalidade: 'pregao-eletronico',
      criterioJulgamento: 'menor-preco',
      tipoExecucao: 'direta',
      registroPrecos: false,
      valorEstimado: 500000
    }
  ];

  const filteredTRs = mockTRs.filter(tr =>
    tr.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tr.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tr.secretaria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (tr: TermoReferencia) => {
    onSelect(tr);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Selecionar Termo de Referência</h2>
              <p className="text-sm text-gray-600">Escolha o TR base para criação do Edital</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por número, objeto ou secretaria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {filteredTRs.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum TR encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTRs.map((tr) => (
                <Card key={tr.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{tr.numero}</h3>
                          <Badge className="bg-green-100 text-green-800">
                            {tr.status}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{tr.objeto}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Building size={14} />
                            <span>{tr.secretaria}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{new Date(tr.dataCriacao).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText size={14} />
                            <span>ETP: {tr.etpNumero}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-green-600 font-medium">
                              R$ {tr.valorEstimado?.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          onClick={() => handleSelect(tr)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Selecionar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TRSelectionModal;
