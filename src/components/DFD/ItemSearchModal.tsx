
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Eye } from 'lucide-react';
import ItemDetailsModal from './ItemDetailsModal';

interface DFDItem {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorReferencia: number;
  tabelaReferencia: string;
}

interface ItemSearchModalProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: DFDItem) => void;
}

const ItemSearchModal = ({ open, onClose, onAddItem }: ItemSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('PNCP');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);

  const tabelas = [
    { id: 'PNCP', name: 'PNCP' },
    { id: 'BPS', name: 'BPS' },
    { id: 'CMED', name: 'CMED' },
    { id: 'SINAPI', name: 'SINAPI' },
    { id: 'SETOP', name: 'SETOP' },
    { id: 'SIMPRO', name: 'SIMPRO' },
    { id: 'CEASA', name: 'CEASA' },
    { id: 'SIGTAP', name: 'SIGTAP' },
    { id: 'LICITAR', name: 'LICITAR DIGITAL' },
    { id: 'OUTRAS', name: 'OUTRAS FONTES' }
  ];

  // Dados mockados mais extensos para cada tabela
  const itensMockados = {
    'BPS': [
      { codigo: 'BRP001', descricao: 'Arroz branco polido tipo 1, pacote 5kg', unidade: 'kg', valor: 4.50 },
      { codigo: 'BRP002', descricao: 'Feijão carioca tipo 1, pacote 1kg', unidade: 'kg', valor: 7.20 },
      { codigo: 'BRP003', descricao: 'Óleo de soja refinado, garrafa 900ml', unidade: 'litro', valor: 5.80 },
      { codigo: 'BRP004', descricao: 'Açúcar cristal especial, pacote 1kg', unidade: 'kg', valor: 3.20 },
      { codigo: 'BRP005', descricao: 'Sal refinado iodado, pacote 1kg', unidade: 'kg', valor: 2.10 },
    ],
    'CMED': [
      { codigo: 'MED001', descricao: 'Paracetamol 500mg, comprimido', unidade: 'comprimido', valor: 0.15 },
      { codigo: 'MED002', descricao: 'Ibuprofeno 600mg, comprimido', unidade: 'comprimido', valor: 0.35 },
      { codigo: 'MED003', descricao: 'Dipirona sódica 500mg, comprimido', unidade: 'comprimido', valor: 0.12 },
      { codigo: 'MED004', descricao: 'Omeprazol 20mg, cápsula', unidade: 'cápsula', valor: 0.25 },
      { codigo: 'MED005', descricao: 'Amoxicilina 500mg, cápsula', unidade: 'cápsula', valor: 0.18 },
    ],
    'SINAPI': [
      { codigo: 'SIN001', descricao: 'Cimento Portland CP II-E-32, saco 50kg', unidade: 'saco', valor: 22.50 },
      { codigo: 'SIN002', descricao: 'Areia média lavada para construção', unidade: 'm³', valor: 35.00 },
      { codigo: 'SIN003', descricao: 'Tijolo cerâmico furado 6 furos', unidade: 'milheiro', valor: 650.00 },
      { codigo: 'SIN004', descricao: 'Brita 1 (19 a 9,5mm)', unidade: 'm³', valor: 45.00 },
      { codigo: 'SIN005', descricao: 'Cal hidratada CH-I, saco 20kg', unidade: 'saco', valor: 8.50 },
    ],
    'PNCP': [
      { codigo: 'PCP001', descricao: 'Papel A4 75g/m², resma 500 folhas', unidade: 'resma', valor: 12.50 },
      { codigo: 'PCP002', descricao: 'Caneta esferográfica azul', unidade: 'unidade', valor: 1.20 },
      { codigo: 'PCP003', descricao: 'Grampeador médio até 25 folhas', unidade: 'unidade', valor: 25.00 },
      { codigo: 'PCP004', descricao: 'Toner para impressora HP LaserJet', unidade: 'unidade', valor: 85.00 },
      { codigo: 'PCP005', descricao: 'Pasta arquivo morto, pacote c/ 25', unidade: 'pacote', valor: 45.00 },
    ],
    'SETOP': [
      { codigo: 'SET001', descricao: 'Pavimentação asfáltica - CBUQ', unidade: 'm²', valor: 35.80 },
      { codigo: 'SET002', descricao: 'Meio-fio de concreto pré-moldado', unidade: 'm', valor: 18.50 },
      { codigo: 'SET003', descricao: 'Sinalização horizontal - tinta', unidade: 'm²', valor: 12.30 },
      { codigo: 'SET004', descricao: 'Placa de sinalização vertical', unidade: 'unidade', valor: 125.00 },
      { codigo: 'SET005', descricao: 'Bueiro simples tubular D=1,0m', unidade: 'm', valor: 280.00 },
    ],
    'SIMPRO': [
      { codigo: 'SIM001', descricao: 'Pedreiro com encargos sociais', unidade: 'hora', valor: 18.50 },
      { codigo: 'SIM002', descricao: 'Servente com encargos sociais', unidade: 'hora', valor: 15.20 },
      { codigo: 'SIM003', descricao: 'Eletricista com encargos sociais', unidade: 'hora', valor: 22.80 },
      { codigo: 'SIM004', descricao: 'Pintor com encargos sociais', unidade: 'hora', valor: 19.30 },
      { codigo: 'SIM005', descricao: 'Operador de máquinas', unidade: 'hora', valor: 25.60 },
    ],
    'CEASA': [
      { codigo: 'CES001', descricao: 'Banana prata primeira qualidade', unidade: 'kg', valor: 3.50 },
      { codigo: 'CES002', descricao: 'Tomate salada primeira qualidade', unidade: 'kg', valor: 6.80 },
      { codigo: 'CES003', descricao: 'Batata inglesa especial', unidade: 'kg', valor: 4.20 },
      { codigo: 'CES004', descricao: 'Cebola branca primeira qualidade', unidade: 'kg', valor: 3.80 },
      { codigo: 'CES005', descricao: 'Cenoura primeira qualidade', unidade: 'kg', valor: 3.60 },
    ],
    'SIGTAP': [
      { codigo: 'SIG001', descricao: 'Seringa descartável 10ml com agulha', unidade: 'unidade', valor: 0.85 },
      { codigo: 'SIG002', descricao: 'Luva de procedimento não cirúrgico', unidade: 'par', valor: 0.45 },
      { codigo: 'SIG003', descricao: 'Gaze estéril 7,5x7,5cm', unidade: 'pacote', valor: 3.20 },
      { codigo: 'SIG004', descricao: 'Cateter venoso periférico 20G', unidade: 'unidade', valor: 1.85 },
      { codigo: 'SIG005', descricao: 'Esparadrapo impermeável 2,5cm', unidade: 'rolo', valor: 4.50 },
    ],
    'LICITAR': [
      { codigo: 'LIC001', descricao: 'Notebook Intel i5, 8GB RAM, 256GB SSD', unidade: 'unidade', valor: 2800.00 },
      { codigo: 'LIC002', descricao: 'Monitor LED 24 polegadas Full HD', unidade: 'unidade', valor: 580.00 },
      { codigo: 'LIC003', descricao: 'Impressora multifuncional jato de tinta', unidade: 'unidade', valor: 450.00 },
      { codigo: 'LIC004', descricao: 'Mouse óptico USB com fio', unidade: 'unidade', valor: 25.00 },
      { codigo: 'LIC005', descricao: 'Teclado ABNT2 USB', unidade: 'unidade', valor: 35.00 },
    ],
    'OUTRAS': [
      { codigo: 'OUT001', descricao: 'Combustível gasolina comum', unidade: 'litro', valor: 5.85 },
      { codigo: 'OUT002', descricao: 'Combustível diesel S-10', unidade: 'litro', valor: 6.20 },
      { codigo: 'OUT003', descricao: 'Gás de cozinha botijão 13kg', unidade: 'unidade', valor: 85.00 },
      { codigo: 'OUT004', descricao: 'Energia elétrica - tarifa comercial', unidade: 'kWh', valor: 0.85 },
      { codigo: 'OUT005', descricao: 'Água e esgoto - tarifa comercial', unidade: 'm³', valor: 12.50 },
    ]
  };

  const getFilteredItems = () => {
    const items = itensMockados[activeTab as keyof typeof itensMockados] || [];
    
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem({
      ...item,
      tabelaReferencia: activeTab
    });
    setShowItemDetails(true);
  };

  const handleAddItemFromDetails = (itemWithQuantity: DFDItem) => {
    onAddItem(itemWithQuantity);
    setShowItemDetails(false);
    setSelectedItem(null);
    setSearchTerm('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Buscar Itens nas Tabelas de Referência</DialogTitle>
            <p className="text-sm text-gray-600">
              Selecione a fonte de dados e busque pelos itens necessários
            </p>
          </DialogHeader>
          
          <div className="space-y-4 overflow-hidden flex flex-col h-full">
            {/* Campo de busca global */}
            <div className="space-y-2">
              <Label>Buscar Item</Label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Digite para buscar em todos os itens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Abas das tabelas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
              <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full">
                {tabelas.map((tabela) => (
                  <TabsTrigger 
                    key={tabela.id} 
                    value={tabela.id}
                    className="text-xs px-2"
                  >
                    {tabela.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabelas.map((tabela) => (
                <TabsContent 
                  key={tabela.id} 
                  value={tabela.id} 
                  className="mt-4 flex-1 overflow-hidden"
                >
                  <div className="border rounded-lg h-full overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Itens disponíveis - {tabela.name}</h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          {getFilteredItems().length} itens
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto max-h-96">
                      {getFilteredItems().map((item) => (
                        <div
                          key={item.codigo}
                          className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleSelectItem(item)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">{item.codigo}</Badge>
                                <Badge className="bg-orange-100 text-orange-800">
                                  {tabela.name}
                                </Badge>
                              </div>
                              <p className="font-medium text-gray-900 mb-1">{item.descricao}</p>
                              <p className="text-sm text-gray-600">Unidade: {item.unidade}</p>
                            </div>
                            <div className="text-right flex items-center space-x-2">
                              <div>
                                <p className="font-semibold text-green-600">
                                  R$ {item.valor.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">por {item.unidade}</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {getFilteredItems().length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          <Search size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-lg mb-2">Nenhum item encontrado</p>
                          <p className="text-sm">Tente alterar os termos de busca</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ItemDetailsModal
        open={showItemDetails}
        onClose={() => {
          setShowItemDetails(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onAddItem={handleAddItemFromDetails}
      />
    </>
  );
};

export default ItemSearchModal;
