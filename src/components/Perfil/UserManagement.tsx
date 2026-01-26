import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Key, AlertTriangle, Shield } from 'lucide-react';

interface User {
  id: string;
  nome: string;
  email: string;
  secretaria: string;
  permissions: UserPermissions;
}

interface UserPermissions {
  criarDFD: boolean;
  acessarPCA: boolean;
  criarETP: boolean;
  criarMapaRiscos: boolean;
  criarTR: boolean;
  criarEdital: boolean;
  editarDadosInstitucionais: boolean;
  visualizarRelatorios: boolean;
}

interface Secretaria {
  id: string;
  nome: string;
  responsavel: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      nome: 'Maria Silva',
      email: 'maria@gov.br',
      secretaria: 'Secretaria de Administração',
      permissions: {
        criarDFD: true,
        acessarPCA: false,
        criarETP: false,
        criarMapaRiscos: true,
        criarTR: true,
        criarEdital: false,
        editarDadosInstitucionais: false,
        visualizarRelatorios: true
      }
    },
    {
      id: '2',
      nome: 'João Santos',
      email: 'joao@gov.br',
      secretaria: 'Secretaria de Finanças',
      permissions: {
        criarDFD: false,
        acessarPCA: true,
        criarETP: true,
        criarMapaRiscos: false,
        criarTR: true,
        criarEdital: true,
        editarDadosInstitucionais: false,
        visualizarRelatorios: true
      }
    }
  ]);

  const [secretarias] = useState<Secretaria[]>([
    { id: '1', nome: 'Secretaria de Administração', responsavel: 'Ana Costa' },
    { id: '2', nome: 'Secretaria de Finanças', responsavel: 'Carlos Lima' }
  ]);

  const [newUser, setNewUser] = useState({
    nome: '',
    email: '',
    secretaria: '',
    permissions: {
      criarDFD: false,
      acessarPCA: false,
      criarETP: false,
      criarMapaRiscos: false,
      criarTR: false,
      criarEdital: false,
      editarDadosInstitucionais: false,
      visualizarRelatorios: false
    }
  });

  const validatePermissions = (permissions: UserPermissions): string[] => {
    const conflicts: string[] = [];
    
    if (permissions.criarDFD && permissions.acessarPCA) {
      conflicts.push('Usuário com acesso ao PCA não pode criar DFDs');
    }
    
    return conflicts;
  };

  const handlePermissionChange = (permission: keyof UserPermissions, checked: boolean) => {
    const newPermissions = { ...newUser.permissions, [permission]: checked };
    
    // Auto-resolve conflicts
    if (permission === 'criarDFD' && checked) {
      newPermissions.acessarPCA = false;
    } else if (permission === 'acessarPCA' && checked) {
      newPermissions.criarDFD = false;
    }
    
    setNewUser(prev => ({
      ...prev,
      permissions: newPermissions
    }));
  };

  const handleSaveUser = () => {
    const conflicts = validatePermissions(newUser.permissions);
    
    if (conflicts.length > 0) {
      toast({
        title: "Conflito de Permissões",
        description: conflicts.join(', '),
        variant: "destructive"
      });
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...editingUser, ...newUser, id: editingUser.id }
          : user
      ));
      toast({
        title: "Usuário Atualizado",
        description: "Dados do usuário foram atualizados com sucesso."
      });
    } else {
      const newUserData: User = {
        id: Date.now().toString(),
        ...newUser
      };
      setUsers(prev => [...prev, newUserData]);
      toast({
        title: "Usuário Cadastrado",
        description: "Novo usuário foi cadastrado com sucesso."
      });
    }

    setShowUserModal(false);
    setEditingUser(null);
    setNewUser({
      nome: '',
      email: '',
      secretaria: '',
      permissions: {
        criarDFD: false,
        acessarPCA: false,
        criarETP: false,
        criarMapaRiscos: false,
        criarTR: false,
        criarEdital: false,
        editarDadosInstitucionais: false,
        visualizarRelatorios: false
      }
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      nome: user.nome,
      email: user.email,
      secretaria: user.secretaria,
      permissions: { ...user.permissions }
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      title: "Usuário Removido",
      description: "Usuário foi removido com sucesso."
    });
  };

  const getPermissionsSummary = (permissions: UserPermissions): string[] => {
    const activePermissions: string[] = [];
    if (permissions.criarDFD) activePermissions.push('DFD');
    if (permissions.acessarPCA) activePermissions.push('PCA');
    if (permissions.criarETP) activePermissions.push('ETP');
    if (permissions.criarMapaRiscos) activePermissions.push('Mapa Riscos');
    if (permissions.criarTR) activePermissions.push('TR');
    if (permissions.criarEdital) activePermissions.push('Edital');
    if (permissions.editarDadosInstitucionais) activePermissions.push('Dados Inst.');
    if (permissions.visualizarRelatorios) activePermissions.push('Relatórios');
    return activePermissions;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Usuários Vinculados</h2>
          <p className="text-sm text-muted-foreground">Gerencie usuários e suas permissões</p>
        </div>
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              setNewUser({
                nome: '',
                email: '',
                secretaria: '',
                permissions: {
                  criarDFD: false,
                  acessarPCA: false,
                  criarETP: false,
                  criarMapaRiscos: false,
                  criarTR: false,
                  criarEdital: false,
                  editarDadosInstitucionais: false,
                  visualizarRelatorios: false
                }
              });
            }}>
              <Plus size={16} className="mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={newUser.nome}
                    onChange={(e) => setNewUser(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secretaria">Secretaria</Label>
                <Select 
                  value={newUser.secretaria} 
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, secretaria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a secretaria" />
                  </SelectTrigger>
                  <SelectContent>
                    {secretarias.map(secretaria => (
                      <SelectItem key={secretaria.id} value={secretaria.nome}>
                        {secretaria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Permissões</Label>
                <div className="mt-2 space-y-3">
                  <TooltipProvider>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="criarDFD"
                            checked={newUser.permissions.criarDFD}
                            onCheckedChange={(checked) => handlePermissionChange('criarDFD', checked as boolean)}
                          />
                          <Label htmlFor="criarDFD" className="text-sm">Criar DFD</Label>
                          {newUser.permissions.acessarPCA && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle size={14} className="text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Conflita com acesso ao PCA
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="acessarPCA"
                            checked={newUser.permissions.acessarPCA}
                            onCheckedChange={(checked) => handlePermissionChange('acessarPCA', checked as boolean)}
                          />
                          <Label htmlFor="acessarPCA" className="text-sm">Acessar e aprovar DFDs no PCA</Label>
                          {newUser.permissions.criarDFD && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle size={14} className="text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Conflita com criação de DFD
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="criarETP"
                            checked={newUser.permissions.criarETP}
                            onCheckedChange={(checked) => handlePermissionChange('criarETP', checked as boolean)}
                          />
                          <Label htmlFor="criarETP" className="text-sm">Criar ETP</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="criarMapaRiscos"
                            checked={newUser.permissions.criarMapaRiscos}
                            onCheckedChange={(checked) => handlePermissionChange('criarMapaRiscos', checked as boolean)}
                          />
                          <Label htmlFor="criarMapaRiscos" className="text-sm">Criar Mapa de Riscos</Label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="criarTR"
                            checked={newUser.permissions.criarTR}
                            onCheckedChange={(checked) => handlePermissionChange('criarTR', checked as boolean)}
                          />
                          <Label htmlFor="criarTR" className="text-sm">Criar Termo de Referência</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="criarEdital"
                            checked={newUser.permissions.criarEdital}
                            onCheckedChange={(checked) => handlePermissionChange('criarEdital', checked as boolean)}
                          />
                          <Label htmlFor="criarEdital" className="text-sm">Criar Edital</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="editarDadosInstitucionais"
                            checked={newUser.permissions.editarDadosInstitucionais}
                            onCheckedChange={(checked) => handlePermissionChange('editarDadosInstitucionais', checked as boolean)}
                          />
                          <Label htmlFor="editarDadosInstitucionais" className="text-sm">Editar dados institucionais</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="visualizarRelatorios"
                            checked={newUser.permissions.visualizarRelatorios}
                            onCheckedChange={(checked) => handlePermissionChange('visualizarRelatorios', checked as boolean)}
                          />
                          <Label htmlFor="visualizarRelatorios" className="text-sm">Visualizar relatórios</Label>
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowUserModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveUser}>
                  {editingUser ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Secretaria</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.secretaria}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getPermissionsSummary(user.permissions).map(permission => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Senha Redefinida",
                            description: "Nova senha enviada por e-mail para o usuário."
                          });
                        }}
                      >
                        <Key size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;