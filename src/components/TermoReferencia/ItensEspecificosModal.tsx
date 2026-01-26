
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  FileText, 
  Building, 
  Calendar, 
  DollarSign,
  ArrowRight,
  X,
  Eye,
  ChevronDown,
  ChevronRight,
  Package
} from 'lucide-react';
import DFDViewModal from '../DFD/DFDViewModal';

interface ItensEspecificosModalProps {
  open: boolean;
  onClose: () => void;
  onContinuar: (selectedItems: any[]) => void;
}

// Mock data para DFDs com itens
const mockDFDsComItens = [
  {
    id: '1',
    numero: 'DFD-001',
    secretaria: 'Secretaria de Educação',
    descricaoSucinta: 'Materiais de consumo para alimentação escolar',
    tipoDFD: 'Materiais de Consumo',
    dataContratacao: '2024-03-15',
    prioridade: 'Alta',
    valorTotal: 'R$ 25.000,00',
    status: 'Aprovado',
    itens: [
      {
        id: '1.1',
        nome: 'Arroz tipo 1',
        unidade: 'Kg',
        quantidade: 500,
        valorEstimado: 'R$ 2.500,00',
        utilizado: false,
        trVinculado: null
      },
      {
        id: '1.2',
        nome: 'Feijão carioca',
        unidade: 'Kg',
        quantidade: 200,
        valorEstimado: 'R$ 1.800,00',
        utilizado: true,
        trVinculado: 'TR-2024-001'
      },
      {
        id: '1.3',
        nome: 'Óleo de soja',
        unidade: 'L',
        quantidade: 100,
        valorEstimado: 'R$ 800,00',
        utilizado: false,
        trVinculado: null
      }
    ]
  },
  {
    id: '2',
    numero: 'DFD-002',
    secretaria: 'Secretaria de Saúde',
    descricaoSucinta: 'Equipamentos médicos básicos',
    tipoDFD: 'Materiais Permanentes',
    dataContratacao: '2024-04-10',
    prioridade: 'Média',
    valorTotal: 'R$ 45.000,00',
    status: 'Aprovado',
    itens: [
      {
        id: '2.1',
        nome: 'Estetoscópio',
        unidade: 'Un',
        quantidade: 10,
        valorEstimado: 'R$ 2.000,00',
        utilizado: false,
        trVinculado: null
      },
      {
        id: '2.2',
        nome: 'Termômetro digital',
        unidade: 'Un',
        quantidade: 20,
        valorEstimado: 'R$ 1.000,00',
        utilizado: false,
        trVinculado: null
      }
    ]
  }
];

const ItensEspecificosModal = ({ open, onClose, onContinuar }: ItensEspecificosModalProps) => {
  const [filtros, setFiltros] = useState({
    secretaria: 'todas',
    tipoDFD: 'todos',
    prioridade: 'todas',
    anoContratacao: 'todos',
    busca: ''
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedDFDs, setExpandedDFDs] = useState<string[]>([]);
  const [showDFDPreview, setShowDFDPreview] = useState(false);
  const [selectedDFDForPreview, setSelectedDFDForPreview] = useState<any>(null);

  const filteredDFDs = mockDFDsComItens.filter(dfd => {
    return (
      (filtros.secretaria === 'todas' || dfd.secretaria.includes(filtros.secretaria)) &&
      (filtros.tipoDFD === 'todos' || dfd.tipoDFD === filtros.tipoDFD) &&
      (filtros.prioridade === 'todas' || dfd.prioridade === filtros.prioridade) &&
      (filtros.anoContratacao === 'todos' || dfd.dataContratacao.includes(filtros.anoContratacao)) &&
      (!filtros.busca || 
        dfd.numero.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        dfd.descricaoSucinta.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        dfd.secretaria.toLowerCase().includes(filtros.busca.toLowerCase())
      )
    );
  });

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleToggleDFD = (dfdId: string) => {
    setExpandedDFDs(prev => 
      prev.includes(dfdId) 
        ? prev.filter(id => id !== dfdId)
        : [...prev, dfdId]
    );
  };

  const handleViewDFD = (dfd: any) => {
    setSelectedDFDForPreview(dfd);
    setShowDFDPreview(true);
  };

  const handleContinuar = () => {
    const itensSelecionados: any[] = [];
    
    mockDFDsComItens.forEach(dfd => {
      dfd.itens.forEach(item => {
        if (selectedItems.includes(item.id)) {
          itensSelecionados.push({
            ...item,
            dfdNumero: dfd.numero,
            dfdSecretaria: dfd.secretaria
          });
        }
      });
    });
    
    onContinuar(itensSelecionados);
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
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

  const totalSelecionados = selectedItems.length;
  const valorTotalSelecionado = mockDFDsComItens.reduce((total, dfd) => {
    return total + dfd.itens.reduce((dfdTotal, item) => {
      if (selectedItems.includes(item.id)) {
        const valor = parseFloat(item.valorEstimado.replace(/[^\d,]/g, '').replace(',', '.'));
        return dfdTotal + valor;
      }
      return dfdTotal;
    }, 0);
  }, 0);

  const dfdsSelecionados = new Set();
  mockDFDsComItens.forEach(dfd => {
    if (dfd.itens.some(item => selectedItems.includes(item.id))) {
      dfdsSelecionados.add(dfd.numero);
    }
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Package size={20} className="mr-2" />
                Itens Específicos - Seleção para TR
              </div>
              <Button variant="ghost" onClick={onClose}>
                <X size={20} />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        placeholder="Buscar por número, descrição ou secretaria..."
                        value={filtros.busca}
                        onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={filtros.secretaria} onValueChange={(value) => setFiltros(prev => ({ ...prev, secretaria: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Secretaria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="Educação">Secretaria de Educação</SelectItem>
                      <SelectItem value="Saúde">Secretaria de Saúde</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filtros.tipoDFD} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipoDFD: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de DFD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="Materiais de Consumo">Materiais de Consumo</SelectItem>
                      <SelectItem value="Materiais Permanentes">Materiais Permanentes</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filtros.prioridade} onValueChange={(value) => setFiltros(prev => ({ ...prev, prioridade: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filtros.anoContratacao} onValueChange={(value) => setFiltros(prev => ({ ...prev, anoContratacao: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de DFDs com Itens */}
            <div className="space-y-4">
              {filteredDFDs.map((dfd) => (
                <Card key={dfd.id}>
                  <Collapsible
                    open={expandedDFDs.includes(dfd.id)}
                    onOpenChange={() => handleToggleDFD(dfd.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {expandedDFDs.includes(dfd.id) ? 
                              <ChevronDown size={16} /> : 
                              <ChevronRight size={16} />
                            }
                            <div>
                              <CardTitle className="text-lg flex items-center space-x-3">
                                <span>{dfd.numero}</span>
                                <Badge className={getPriorityColor(dfd.prioridade)}>
                                  {dfd.prioridade}
                                </Badge>
                              </CardTitle>
                              <p className="text-sm text-gray-600">{dfd.descricaoSucinta}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{dfd.secretaria}</span>
                            <span>{dfd.valorTotal}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDFD(dfd);
                              }}
                            >
                              <Eye size={14} className="mr-1" />
                              Ver DFD
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Unidade</TableHead>
                                <TableHead>Quantidade</TableHead>
                                <TableHead>Valor Estimado</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dfd.itens.map((item) => (
                                <TableRow 
                                  key={item.id} 
                                  className={`${
                                    item.utilizado ? 'bg-red-50' : 
                                    selectedItems.includes(item.id) ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedItems.includes(item.id)}
                                      onCheckedChange={() => handleSelectItem(item.id)}
                                      disabled={item.utilizado}
                                    />
                                  </TableCell>
                                  <TableCell className={item.utilizado ? 'text-red-600' : ''}>
                                    {item.nome}
                                  </TableCell>
                                  <TableCell>{item.unidade}</TableCell>
                                  <TableCell>{item.quantidade}</TableCell>
                                  <TableCell className="font-semibold text-green-600">
                                    {item.valorEstimado}
                                  </TableCell>
                                  <TableCell>
                                    {item.utilizado ? (
                                      <Badge variant="destructive" className="text-xs">
                                        Já utilizado no {item.trVinculado}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">
                                        Disponível
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>

            {/* Resumo e Ações */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-6">
                  <span>
                    <span className="font-medium">{totalSelecionados}</span> item(s) selecionado(s)
                  </span>
                  <span>
                    <span className="font-medium">{dfdsSelecionados.size}</span> DFD(s) envolvido(s)
                  </span>
                  {totalSelecionados > 0 && (
                    <span>
                      Valor estimado: <span className="font-semibold text-green-600">
                        R$ {valorTotalSelecionado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleContinuar}
                  disabled={selectedItems.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Avançar para Geração do TR
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview do DFD */}
      <DFDViewModal
        open={showDFDPreview}
        onClose={() => setShowDFDPreview(false)}
        dfd={selectedDFDForPreview}
      />
    </>
  );
};

export default ItensEspecificosModal;
