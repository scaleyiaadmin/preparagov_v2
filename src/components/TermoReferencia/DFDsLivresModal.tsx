
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  FileText, 
  Building, 
  Calendar, 
  DollarSign,
  ArrowRight,
  X,
  Eye
} from 'lucide-react';
import DFDViewModal from '../DFD/DFDViewModal';

interface DFDsLivresModalProps {
  open: boolean;
  onClose: () => void;
  onContinuar: (selectedDFDs: any[]) => void;
}

// Mock data para DFDs disponíveis
const mockDFDsLivres = [
  {
    id: '1',
    numero: 'DFD-001',
    secretaria: 'Secretaria de Educação',
    descricaoSucinta: 'Materiais de consumo para alimentação escolar',
    tipoDFD: 'Materiais de Consumo',
    dataContratacao: '2024-03-15',
    prioridade: 'Alta',
    valorTotal: 'R$ 25.000,00',
    status: 'Aprovado'
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
    status: 'Aprovado'
  },
  {
    id: '3',
    numero: 'DFD-003',
    secretaria: 'Secretaria de Administração',
    descricaoSucinta: 'Material de escritório e papelaria',
    tipoDFD: 'Materiais de Consumo',
    dataContratacao: '2024-02-20',
    prioridade: 'Baixa',
    valorTotal: 'R$ 15.000,00',
    status: 'Aprovado'
  }
];

const DFDsLivresModal = ({ open, onClose, onContinuar }: DFDsLivresModalProps) => {
  const [filtros, setFiltros] = useState({
    secretaria: 'todos',
    tipoDFD: 'todos',
    prioridade: 'todas',
    anoContratacao: 'todos',
    busca: ''
  });
  const [selectedDFDs, setSelectedDFDs] = useState<string[]>([]);
  const [showDFDPreview, setShowDFDPreview] = useState(false);
  const [selectedDFDForPreview, setSelectedDFDForPreview] = useState<any>(null);

  const filteredDFDs = mockDFDsLivres.filter(dfd => {
    return (
      (filtros.secretaria === 'todos' || dfd.secretaria.includes(filtros.secretaria)) &&
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

  const handleSelectDFD = (dfdId: string) => {
    setSelectedDFDs(prev => 
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
    const dfdsSelecionados = mockDFDsLivres.filter(dfd => selectedDFDs.includes(dfd.id));
    onContinuar(dfdsSelecionados);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText size={20} className="mr-2" />
                DFDs Livres - Seleção para TR
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
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="Educação">Secretaria de Educação</SelectItem>
                      <SelectItem value="Saúde">Secretaria de Saúde</SelectItem>
                      <SelectItem value="Administração">Secretaria de Administração</SelectItem>
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
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de DFDs */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Secretaria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Contratação</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDFDs.map((dfd) => (
                    <TableRow key={dfd.id} className={selectedDFDs.includes(dfd.id) ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDFDs.includes(dfd.id)}
                          onCheckedChange={() => handleSelectDFD(dfd.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          onClick={() => handleViewDFD(dfd)}
                          className="p-0 h-auto font-medium text-blue-600"
                        >
                          {dfd.numero}
                        </Button>
                      </TableCell>
                      <TableCell>{dfd.secretaria}</TableCell>
                      <TableCell>{dfd.descricaoSucinta}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dfd.tipoDFD}</Badge>
                      </TableCell>
                      <TableCell>{new Date(dfd.dataContratacao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(dfd.prioridade)}>
                          {dfd.prioridade}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">{dfd.valorTotal}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDFD(dfd)}
                        >
                          <Eye size={14} className="mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Resumo e Ações */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedDFDs.length}</span> DFD(s) selecionado(s)
                {selectedDFDs.length > 0 && (
                  <span className="ml-4">
                    Valor estimado: <span className="font-semibold text-green-600">
                      R$ {mockDFDsLivres
                        .filter(dfd => selectedDFDs.includes(dfd.id))
                        .reduce((total, dfd) => {
                          const valor = parseFloat(dfd.valorTotal.replace(/[^\d,]/g, '').replace(',', '.'));
                          return total + valor;
                        }, 0)
                        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleContinuar}
                  disabled={selectedDFDs.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
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

export default DFDsLivresModal;
