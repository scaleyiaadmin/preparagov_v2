import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Plus,
  Eye,
  Calendar,
  Download,
  Edit
} from 'lucide-react';
import ETPViewModal from './ETPViewModal';

interface ETP {
  id: string;
  titulo: string;
  numeroETP: string;
  status: 'Concluído' | 'Em elaboração';
  dataCriacao: string;
  dataUltimaEdicao: string;
  totalDFDs: number;
  valorTotal: string;
  responsavel: string;
  currentStep?: number; // Para ETPs em andamento
}

interface ETPDashboardProps {
  onCreateNew: () => void;
  onViewETP: (etp: ETP) => void;
  onViewCompleted: () => void;
  onViewInProgress: () => void;
  onContinueETP: (etp: ETP) => void;
  onGeneratePDF: (etp: ETP) => void;
}

const ETPDashboard = ({ 
  onCreateNew, 
  onViewETP, 
  onViewCompleted, 
  onViewInProgress,
  onContinueETP,
  onGeneratePDF 
}: ETPDashboardProps) => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedETPForView, setSelectedETPForView] = useState<ETP | null>(null);

  // Mock data for ETPs
  const mockETPs: ETP[] = [
    {
      id: '1',
      titulo: 'ETP Modernização Tecnológica',
      numeroETP: 'ETP-2024-001',
      status: 'Concluído',
      dataCriacao: '2024-01-15',
      dataUltimaEdicao: '2024-02-10',
      totalDFDs: 3,
      valorTotal: 'R$ 2.950.000,00',
      responsavel: 'João Silva'
    },
    {
      id: '2',
      titulo: 'ETP Infraestrutura Escolar',
      numeroETP: 'ETP-2024-002',
      status: 'Em elaboração',
      dataCriacao: '2024-06-20',
      dataUltimaEdicao: '2024-07-01',
      totalDFDs: 2,
      valorTotal: 'R$ 1.800.000,00',
      responsavel: 'Maria Santos',
      currentStep: 5
    },
    {
      id: '3',
      titulo: 'ETP Equipamentos de Saúde',
      numeroETP: 'ETP-2024-003',
      status: 'Concluído',
      dataCriacao: '2024-03-10',
      dataUltimaEdicao: '2024-04-05',
      totalDFDs: 4,
      valorTotal: 'R$ 3.200.000,00',
      responsavel: 'Carlos Pereira'
    },
    {
      id: '4',
      titulo: 'ETP Serviços Administrativos',
      numeroETP: 'ETP-2024-004',
      status: 'Em elaboração',
      dataCriacao: '2024-06-28',
      dataUltimaEdicao: '2024-07-03',
      totalDFDs: 1,
      valorTotal: 'R$ 450.000,00',
      responsavel: 'Ana Costa',
      currentStep: 3
    }
  ];

  const completedETPs = mockETPs.filter(etp => etp.status === 'Concluído');
  const inProgressETPs = mockETPs.filter(etp => etp.status === 'Em elaboração');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    return status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const recentETPs = mockETPs
    .sort((a, b) => new Date(b.dataUltimaEdicao).getTime() - new Date(a.dataUltimaEdicao).getTime())
    .slice(0, 3);

  const handleViewETP = (etp: ETP) => {
    setSelectedETPForView(etp);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedETPForView(null);
  };

  const renderETPList = (etps: ETP[], showCompletedActions: boolean) => (
    <div className="space-y-4">
      {etps.map((etp) => (
        <div
          key={etp.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-gray-900">{etp.titulo}</h3>
                <Badge className={getStatusColor(etp.status)}>
                  {etp.status}
                </Badge>
              </div>
              <p className="text-sm text-blue-600 font-medium">{etp.numeroETP}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{etp.totalDFDs} DFD(s) vinculado(s)</span>
                <span>•</span>
                <span className="font-semibold">{etp.valorTotal}</span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>Última edição: {formatDate(etp.dataUltimaEdicao)}</span>
                </div>
                <span>•</span>
                <span>Por: {etp.responsavel}</span>
                {!showCompletedActions && etp.currentStep && (
                  <>
                    <span>•</span>
                    <span>Etapa: {etp.currentStep + 1}/13</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {showCompletedActions ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewETP(etp)}
                  >
                    <Eye size={14} className="mr-1" />
                    Visualizar Documento
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGeneratePDF(etp)}
                  >
                    <Download size={14} className="mr-1" />
                    Gerar PDF
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onContinueETP(etp)}
                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  <Edit size={14} className="mr-1" />
                  Continuar Preenchimento
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estudos Técnicos Preliminares (ETP)</h1>
          <p className="text-gray-600">Gerencie e acompanhe seus estudos técnicos</p>
        </div>
        <Button onClick={onCreateNew} className="bg-orange-500 hover:bg-orange-600">
          <Plus size={16} className="mr-2" />
          Novo ETP
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={onViewCompleted}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETPs Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedETPs.length}</div>
            <p className="text-xs text-muted-foreground">
              Estudos finalizados e aprovados
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={onViewInProgress}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETPs em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inProgressETPs.length}</div>
            <p className="text-xs text-muted-foreground">
              Estudos em fase de elaboração
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent ETPs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText size={20} />
            <span>ETPs Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentETPs.map((etp) => (
              <div
                key={etp.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">{etp.titulo}</h3>
                      <Badge className={getStatusColor(etp.status)}>
                        {etp.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-600 font-medium">{etp.numeroETP}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{etp.totalDFDs} DFD(s) vinculado(s)</span>
                      <span>•</span>
                      <span className="font-semibold">{etp.valorTotal}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>Última edição: {formatDate(etp.dataUltimaEdicao)}</span>
                      </div>
                      <span>•</span>
                      <span>Por: {etp.responsavel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => etp.status === 'Concluído' ? handleViewETP(etp) : onContinueETP(etp)}
                  >
                    {etp.status === 'Concluído' ? (
                      <>
                        <Eye size={14} className="mr-1" />
                        Ver
                      </>
                    ) : (
                      <>
                        <Edit size={14} className="mr-1" />
                        Continuar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {recentETPs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhum ETP encontrado</p>
              <p className="text-sm">Clique em "Novo ETP" para começar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ETP View Modal */}
      <ETPViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        etp={selectedETPForView}
        onGeneratePDF={onGeneratePDF}
      />
    </div>
  );
};

export default ETPDashboard;
