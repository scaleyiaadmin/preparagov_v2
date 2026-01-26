import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Search, 
  UserCog, 
  Eye, 
  Users, 
  LogIn, 
  XCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SuperAdminPage = () => {
  const { toast } = useToast();
  const { 
    getAllPrefeituras, 
    getUsersForPrefeitura, 
    startImpersonation, 
    stopImpersonation,
    impersonating,
    user
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrefeitura, setSelectedPrefeitura] = useState<string | null>(null);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const prefeituras = getAllPrefeituras();

  const filteredPrefeituras = prefeituras.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.uf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUsers = (prefeituraId: string) => {
    setSelectedPrefeitura(prefeituraId);
    setShowUsersModal(true);
  };

  const handleImpersonateAdmin = (prefeituraId: string) => {
    const users = getUsersForPrefeitura(prefeituraId);
    const admin = users.find(u => u.role === 'admin');
    
    if (admin) {
      startImpersonation(admin.id);
    } else {
      toast({
        title: "Admin não encontrado",
        description: "Esta prefeitura não possui um administrador cadastrado",
        variant: "destructive",
      });
    }
  };

  const selectedPrefeituraData = prefeituras.find(p => p.id === selectedPrefeitura);
  const usersOfSelectedPrefeitura = selectedPrefeitura ? getUsersForPrefeitura(selectedPrefeitura) : [];

  return (
    <div className="space-y-6">
      {/* Impersonation Banner */}
      {impersonating && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600" size={24} />
            <div>
              <p className="font-medium text-amber-800">
                Modo Impersonação Ativo
              </p>
              <p className="text-sm text-amber-600">
                Você está visualizando como: <strong>{impersonating.nome}</strong> ({impersonating.email})
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={stopImpersonation}
          >
            <XCircle size={16} className="mr-2" />
            Encerrar Impersonação
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="text-orange-500" />
            Gestão de Prefeituras
          </h1>
          <p className="text-muted-foreground">
            Visão geral de todas as organizações cadastradas no sistema
          </p>
        </div>
        <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
          Super Admin: {user?.nome}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Prefeituras</p>
                <p className="text-3xl font-bold">{prefeituras.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prefeituras Ativas</p>
                <p className="text-3xl font-bold text-green-600">
                  {prefeituras.filter(p => p.status === 'ativa').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prefeituras Inativas</p>
                <p className="text-3xl font-bold text-gray-400">
                  {prefeituras.filter(p => p.status === 'inativa').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-3xl font-bold text-blue-600">
                  {prefeituras.reduce((acc, p) => acc + getUsersForPrefeitura(p.id).length, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar por nome, município ou UF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Prefeituras Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prefeituras Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prefeitura</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Município/UF</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrefeituras.map((prefeitura) => {
                const userCount = getUsersForPrefeitura(prefeitura.id).length;
                const adminUser = getUsersForPrefeitura(prefeitura.id).find(u => u.role === 'admin');
                
                return (
                  <TableRow key={prefeitura.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{prefeitura.nome}</p>
                        {adminUser && (
                          <p className="text-xs text-muted-foreground">
                            Admin: {adminUser.nome}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{prefeitura.cnpj}</TableCell>
                    <TableCell>
                      {prefeitura.municipio} / {prefeitura.uf}
                    </TableCell>
                    <TableCell>{new Date(prefeitura.dataCadastro).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{userCount} usuário(s)</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={prefeitura.status === 'ativa' ? 'default' : 'secondary'}
                        className={cn(
                          prefeitura.status === 'ativa' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {prefeitura.status === 'ativa' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUsers(prefeitura.id)}
                          title="Ver usuários"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImpersonateAdmin(prefeitura.id)}
                          title="Acessar como Admin"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          disabled={!adminUser}
                        >
                          <LogIn size={16} className="mr-1" />
                          Acessar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Users Modal */}
      <Dialog open={showUsersModal} onOpenChange={setShowUsersModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={20} />
              Usuários - {selectedPrefeituraData?.nome}
            </DialogTitle>
          </DialogHeader>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersOfSelectedPrefeitura.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role === 'admin' ? 'Administrador' : 'Operador'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={u.status === 'ativo' ? 'text-green-600 border-green-300' : 'text-gray-500'}
                    >
                      {u.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        startImpersonation(u.id);
                        setShowUsersModal(false);
                      }}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <UserCog size={14} className="mr-1" />
                      Impersonar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminPage;
