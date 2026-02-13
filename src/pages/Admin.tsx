import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Eye,
  Edit,
  XCircle,
  Building,
  Users,
  Settings,
  ArrowLeft,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Prefeitura } from '@/types/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prefeituraSchema, PrefeituraFormData } from '@/schemas/auth';

const Admin = () => {
  const { toast } = useToast();
  const { getAllPrefeituras, createPrefeitura, deletePrefeitura } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [ufFilter, setUfFilter] = useState<string>('todos');
  const [managingPrefeitura, setManagingPrefeitura] = useState<Prefeitura | null>(null);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrefeitura, setSelectedPrefeitura] = useState<Prefeitura | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | 'create'>('create');
  const [isLoading, setIsLoading] = useState(false);

  // Lista dinâmica de prefeituras do banco de dados
  const prefeituras = getAllPrefeituras();

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<PrefeituraFormData>({
    resolver: zodResolver(prefeituraSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      uf: '',
      municipio: ''
    }
  });

  // Verificar se há uma prefeitura sendo gerenciada no localStorage
  useEffect(() => {
    const savedManagingPrefeitura = localStorage.getItem('managingPrefeitura');
    if (savedManagingPrefeitura) {
      setManagingPrefeitura(JSON.parse(savedManagingPrefeitura));
    }
  }, []);

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const filteredPrefeituras = prefeituras.filter((prefeitura: Prefeitura) => {
    const matchesSearch =
      prefeitura.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prefeitura.cnpj.includes(searchTerm);

    const matchesStatus = statusFilter === 'todos' || prefeitura.status === statusFilter;
    const matchesUf = ufFilter === 'todos' || prefeitura.uf === ufFilter;

    return matchesSearch && matchesStatus && matchesUf;
  });

  const onSubmit = async (data: PrefeituraFormData) => {
    setIsLoading(true);

    try {
      if (viewMode === 'create') {
        const success = await createPrefeitura({
          nome: data.nome,
          cnpj: data.cnpj,
          uf: data.uf,
          municipio: data.municipio
        });

        if (success) {
          setIsModalOpen(false);
          resetForm();
        }
      } else if (viewMode === 'edit' && selectedPrefeitura) {
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "A atualização de dados via Admin global está sendo migrada.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    reset({
      nome: '',
      cnpj: '',
      uf: '',
      municipio: ''
    });
    setSelectedPrefeitura(null);
    setViewMode('create');
  };

  const openModal = (mode: 'view' | 'edit' | 'create', prefeitura?: Prefeitura) => {
    setViewMode(mode);
    if (prefeitura) {
      setSelectedPrefeitura(prefeitura);
      reset({
        nome: prefeitura.nome,
        cnpj: prefeitura.cnpj,
        uf: prefeitura.uf,
        municipio: prefeitura.municipio
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const toggleStatus = (id: string) => {
    toast({
      title: "Alteração de Status",
      description: "Esta funcionalidade agora deve ser gerenciada via Perfil da Prefeitura.",
    });
  };

  const startManaging = (prefeitura: Prefeitura) => {
    setManagingPrefeitura(prefeitura);
    localStorage.setItem('managingPrefeitura', JSON.stringify(prefeitura));

    const logEntry = `Administrador acessou a prefeitura ${prefeitura.nome} em ${new Date().toLocaleString('pt-BR')}`;
    const newLogs = [...auditLogs, logEntry];
    setAuditLogs(newLogs);
    localStorage.setItem('auditLogs', JSON.stringify(newLogs));

    toast({
      title: "Modo de Gestão Ativado",
      description: `Você está agora gerenciando ${prefeitura.nome}`,
    });
  };

  const stopManaging = () => {
    setManagingPrefeitura(null);
    localStorage.removeItem('managingPrefeitura');

    toast({
      title: "Retornado ao Painel de Administração",
      description: "Modo de gestão encerrado",
    });
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    // setFormData({ ...formData, senha: password }); // Removed as senha is not in schema yet
    toast({
      title: "Senha gerada",
      description: `Senha temporária: ${password}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Alerta de Gestão Temporária */}
      {managingPrefeitura && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-orange-800">
              Você está acessando como gestor da prefeitura de <strong>{managingPrefeitura.nome}</strong>
            </span>
            <Button
              onClick={stopManaging}
              variant="outline"
              size="sm"
              className="ml-4 gap-2 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <ArrowLeft size={16} />
              Retornar ao Painel de Administração
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {managingPrefeitura ? `Gestão - ${managingPrefeitura.nome}` : 'Administração do Sistema'}
          </h1>
          <p className="text-gray-600 mt-2">
            {managingPrefeitura
              ? `Gerenciando como: ${managingPrefeitura.gestorPrincipal}`
              : 'Gerenciamento de prefeituras e usuários gestores'
            }
          </p>
        </div>
        {!managingPrefeitura && (
          <Button onClick={() => openModal('create')} className="gap-2">
            <Plus size={20} />
            Nova Prefeitura
          </Button>
        )}
      </div>

      {/* Content Based on Mode */}
      {managingPrefeitura ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Modo de Gestão Ativo
              </h3>
              <p className="text-gray-600 mb-6">
                Você está gerenciando a {managingPrefeitura.nome} como {managingPrefeitura.gestorPrincipal}
              </p>
              <p className="text-sm text-gray-500">
                Aqui você teria acesso a todas as funcionalidades do sistema como se fosse o gestor principal desta prefeitura.
                <br />
                Dashboard, DFDs, PCAs, ETPs, etc. seriam carregados com os dados específicos desta prefeitura.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'todos' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
              onClick={() => setStatusFilter('todos')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{prefeituras.length}</p>
                    <p className="text-gray-600">Total de Prefeituras</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'ativa' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
              onClick={() => setStatusFilter('ativa')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{prefeituras.filter(p => p.status === 'ativa').length}</p>
                    <p className="text-gray-600">Prefeituras Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'inativa' ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
              onClick={() => setStatusFilter('inativa')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{prefeituras.filter(p => p.status === 'inativa').length}</p>
                    <p className="text-gray-600">Prefeituras Inativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      placeholder="Buscar por nome ou CNPJ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativa">Ativas</SelectItem>
                    <SelectItem value="inativa">Inativas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ufFilter} onValueChange={setUfFilter}>
                  <SelectTrigger className="w-full md:w-20">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {ufs.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prefeituras Cadastradas ({filteredPrefeituras.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prefeitura / Órgão</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrefeituras.map((prefeitura: Prefeitura) => (
                      <TableRow key={prefeitura.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prefeitura.nome}</p>
                            <p className="text-sm text-gray-500">{prefeitura.municipio} - {prefeitura.uf}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{prefeitura.cnpj}</TableCell>
                        <TableCell>
                          <Badge
                            variant={prefeitura.status === 'ativa' ? 'default' : 'secondary'}
                            className={prefeitura.status === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {prefeitura.status === 'ativa' ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal('view', prefeitura)}
                              title="Visualizar"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal('edit', prefeitura)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </Button>
                            {prefeitura.status === 'ativa' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startManaging(prefeitura)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Acessar sistema da prefeitura"
                              >
                                <Settings size={16} />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleStatus(prefeitura.id)}
                              className={prefeitura.status === 'ativa' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                              title={prefeitura.status === 'ativa' ? 'Desativar' : 'Ativar'}
                            >
                              {prefeitura.status === 'ativa' ? <XCircle size={16} /> : <Users size={16} />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === 'create' && 'Nova Prefeitura'}
              {viewMode === 'edit' && 'Editar Prefeitura'}
              {viewMode === 'view' && 'Detalhes da Prefeitura'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados da Prefeitura</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Prefeitura / Órgão</Label>
                  <Input
                    id="nome"
                    {...register('nome')}
                    disabled={viewMode === 'view'}
                  />
                  {errors.nome && <span className="text-sm text-red-500">{errors.nome.message}</span>}
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    {...register('cnpj')}
                    placeholder="00.000.000/0001-00"
                    disabled={viewMode === 'view'}
                  />
                  {errors.cnpj && <span className="text-sm text-red-500">{errors.cnpj.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="uf">UF</Label>
                  <Controller
                    name="uf"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={viewMode === 'view'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {ufs.map(uf => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.uf && <span className="text-sm text-red-500">{errors.uf.message}</span>}
                </div>
                <div>
                  <Label htmlFor="municipio">Município</Label>
                  <Input
                    id="municipio"
                    {...register('municipio')}
                    disabled={viewMode === 'view'}
                  />
                  {errors.municipio && <span className="text-sm text-red-500">{errors.municipio.message}</span>}
                </div>
              </div>
            </div>


            {viewMode !== 'view' && (
              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Cadastrando...' : (viewMode === 'create' ? 'Cadastrar' : 'Atualizar')}
                </Button>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;