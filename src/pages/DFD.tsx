import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Clock, CheckCircle, Building } from 'lucide-react';
import DFDForm from '../components/DFD/DFDForm';
import DFDList from '../components/DFD/DFDList';
import ActionConfirmModal from '../components/DFD/ActionConfirmModal';
import DFDViewModal from '../components/DFD/DFDViewModal';
import { dfdService } from '@/services/dfdService';

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

  // State for DFDs
  const [dfds, setDfds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch DFDs
  const fetchDFDs = async () => {
    try {
      setLoading(true);
      const data = await dfdService.getAll();
      if (data) {
        // Map DB to Frontend Model
        const mappedData = data.map((d: any) => ({
          id: d.id,
          objeto: d.objeto,
          tipoDFD: d.tipo_dfd,
          valor: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor_estimado_total || 0),
          status: d.status,
          data: new Date(d.created_at).toLocaleDateString(),
          prioridade: d.prioridade,
          anoContratacao: d.ano_contratacao?.toString(),
          descricaoDemanda: d.descricao_demanda,
          justificativa: d.justificativa,
          dataPrevista: d.data_prevista_contratacao,
          justificativaPrioridade: d.justificativa_prioridade,
          descricaoSucinta: d.descricao_sucinta,
          // Map Items
          itens: d.dfd_items?.map((i: any) => ({
            id: i.id,
            codigo: i.codigo_item,
            descricao: i.descricao_item,
            unidade: i.unidade,
            quantidade: Number(i.quantidade),
            valorReferencia: Number(i.valor_unitario),
            tabelaReferencia: i.tabela_referencia
          })) || []
        }));
        setDfds(mappedData);
      }
    } catch (error) {
      console.error('Error fetching DFDs:', error);
      toast({
        title: "Erro ao carregar DFDs",
        description: "Não foi possível carregar as demandas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDFDs();
  }, []);

  // Filter logic applied to fetched data
  const allDFDs = dfds; // Remapping to keep existing logic working with minimal changes

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

  const confirmAction = async () => {
    if (!selectedDFD) return;

    try {
      console.log('confirmAction called:', actionType);

      if (actionType === 'delete') {
        await dfdService.delete(selectedDFD.id);
      } else if (actionType === 'cancel') {
        await dfdService.cancel(selectedDFD.id, actionJustification);
      } else if (actionType === 'remove-pca') {
        await dfdService.requestCancellation(selectedDFD.id, actionJustification);
      }

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
      fetchDFDs(); // Refresh list
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      toast({
        title: "Erro ao realizar ação",
        description: "Ocorreu um erro no servidor. Tente novamente.",
        variant: "destructive"
      });
    }
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
          className={`cursor-pointer transition-all hover:shadow-md ${currentFilter === 'all' ? 'ring-2 ring-blue-500' : ''
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
          className={`cursor-pointer transition-all hover:shadow-md ${currentFilter === 'em-elaboracao' ? 'ring-2 ring-yellow-500' : ''
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
          className={`cursor-pointer transition-all hover:shadow-md ${currentFilter === 'aprovados' ? 'ring-2 ring-green-500' : ''
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
          className={`cursor-pointer transition-all hover:shadow-md ${currentFilter === 'pendentes' ? 'ring-2 ring-orange-500' : ''
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
        dfds={allDFDs}
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
