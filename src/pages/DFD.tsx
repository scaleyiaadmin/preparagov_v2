import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Clock, CheckCircle, Building } from 'lucide-react';
import DFDForm from '../components/DFD/DFDForm';
import DFDList from '../components/DFD/DFDList';
import ActionConfirmModal from '../components/DFD/ActionConfirmModal';
import DFDViewModal from '../components/DFD/DFDViewModal';

const DFD = () => {
  console.log('DFD component rendering...');
  
  const [showForm, setShowForm] = useState(false);
  const [editingDFD, setEditingDFD] = useState<any>(null);
  const [filters, setFilters] = useState({
    tipoDFD: '',
    prioridade: '',
    anoContratacao: '',
    status: ''
  });
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'cancel' | 'delete' | 'remove-pca'>('cancel');
  const [selectedDFD, setSelectedDFD] = useState<any>(null);
  const [actionJustification, setActionJustification] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const { toast } = useToast();

  // Check for filter from dashboard navigation
  useEffect(() => {
    const dashboardFilter = sessionStorage.getItem('documentFilter');
    if (dashboardFilter === 'em-elaboracao') {
      setCurrentFilter('em-elaboracao');
      sessionStorage.removeItem('documentFilter'); // Clean up
    }
  }, []);

  console.log('DFD state:', { showForm, filters, currentPage });

  // Mock data para calcular estatísticas
  const allDFDs = [
    {
      id: 1,
      objeto: 'Aquisição de Gêneros Alimentícios',
      tipoDFD: 'MATERIAIS DE CONSUMO',
      valor: 'R$ 150.000,00',
      status: 'Pendente Aprovação',
      data: '2024-01-10',
      prioridade: 'Alto',
      anoContratacao: '2024'
    },
    {
      id: 2,
      objeto: 'Contratação de Consultoria em TI',
      tipoDFD: 'SERVIÇO NÃO CONTINUADO',
      valor: 'R$ 300.000,00',
      status: 'Em Elaboração',
      data: '2024-01-08',
      prioridade: 'Médio',
      anoContratacao: '2024'
    },
    {
      id: 3,
      objeto: 'Reforma do Prédio Administrativo',
      tipoDFD: 'SERVIÇO DE ENGENHARIA',
      valor: 'R$ 2.500.000,00',
      status: 'Aprovado',
      data: '2024-01-05',
      prioridade: 'Alto',
      anoContratacao: '2024'
    },
    {
      id: 4,
      objeto: 'Aquisição de Material de Limpeza',
      tipoDFD: 'MATERIAIS DE CONSUMO',
      valor: 'R$ 85.000,00',
      status: 'Cancelado',
      data: '2024-01-03',
      prioridade: 'Baixo',
      anoContratacao: '2024'
    },
    {
      id: 5,
      objeto: 'Contratação de Segurança Patrimonial',
      tipoDFD: 'SERVIÇO CONTINUADO',
      valor: 'R$ 450.000,00',
      status: 'Aprovado',
      data: '2023-12-20',
      prioridade: 'Alto',
      anoContratacao: '2024'
    },
    {
      id: 6,
      objeto: 'Aquisição de Computadores',
      tipoDFD: 'MATERIAIS PERMANENTES',
      valor: 'R$ 120.000,00',
      status: 'Em Elaboração',
      data: '2024-01-12',
      prioridade: 'Médio',
      anoContratacao: '2024'
    }
  ];

  const handleAction = (dfd: any, action: 'cancel' | 'delete' | 'remove-pca' | 'view' | 'edit') => {
    console.log('handleAction called:', dfd, action);
    
    switch (action) {
      case 'view':
        setSelectedDFD(dfd);
        setShowViewModal(true);
        break;
      case 'edit':
        setEditingDFD(dfd);
        setShowForm(true);
        break;
      case 'cancel':
      case 'delete':
      case 'remove-pca':
        setSelectedDFD(dfd);
        setActionType(action);
        setShowActionModal(true);
        break;
    }
  };

  const confirmAction = () => {
    console.log('confirmAction called:', actionType);
    const actionMessages = {
      'cancel': 'DFD cancelado com sucesso',
      'delete': 'DFD excluído permanentemente',
      'remove-pca': 'Solicitação de retirada do PCA enviada'
    };

    toast({
      title: "Ação realizada",
      description: actionMessages[actionType],
    });

    setShowActionModal(false);
    setActionJustification('');
    setSelectedDFD(null);
  };

  const handleFormBack = () => {
    setShowForm(false);
    setEditingDFD(null);
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setCurrentPage(1);
  };

  if (showForm) {
    console.log('Rendering DFDForm...');
    return <DFDForm onBack={handleFormBack} editingDFD={editingDFD} />;
  }

  console.log('Rendering main DFD page...');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DFD - Documentos de Formalização</h1>
          <p className="text-gray-600">Gerencie as demandas de contratação</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus size={16} className="mr-2" />
          Novo DFD
        </Button>
      </div>

      {/* Statistics Cards - Now clickable filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            currentFilter === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleFilterChange('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de DFDs</p>
                <p className="text-xl font-bold text-gray-900">{allDFDs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            currentFilter === 'em-elaboracao' ? 'ring-2 ring-yellow-500' : ''
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
                  {allDFDs.filter(dfd => dfd.status === 'Em Elaboração').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            currentFilter === 'aprovados' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => handleFilterChange('aprovados')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-xl font-bold text-gray-900">
                  {allDFDs.filter(dfd => dfd.status === 'Aprovado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            currentFilter === 'pendentes' ? 'ring-2 ring-orange-500' : ''
          }`}
          onClick={() => handleFilterChange('pendentes')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-bold text-gray-900">
                  {allDFDs.filter(dfd => dfd.status === 'Pendente Aprovação').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DFDList
        filters={filters}
        onFilterChange={setFilters}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onAction={handleAction}
        currentFilter={currentFilter}
      />

      <ActionConfirmModal
        open={showActionModal}
        onClose={() => setShowActionModal(false)}
        actionType={actionType}
        dfd={selectedDFD}
        justification={actionJustification}
        onJustificationChange={setActionJustification}
        onConfirm={confirmAction}
      />

      <DFDViewModal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        dfd={selectedDFD}
      />
    </div>
  );
};

export default DFD;
