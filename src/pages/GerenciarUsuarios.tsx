import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { generateRandomPassword } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Edit,
  Key,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import {
  User,
  ModulePermissions,
  roleLabels,
  moduleLabels,
  defaultPermissionsByRole
} from '@/types/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, UserFormData } from '@/schemas/auth';


// Módulos que podem ser configurados para operadores
const configurableModules: (keyof ModulePermissions)[] = [
  'dfd',
  'pca',
  'etp',
  'mapaRiscos',
  'cronograma',
  'termoReferencia',
  'edital',
];

const GerenciarUsuarios = () => {
  const {
    toast
  } = useToast();
  const {
    getCurrentUser,
    getUsersForPrefeitura,
    createUser,
    updateUser,
    deleteUser,
    getPrefeituraById,
    getAllPrefeituras,
    getSecretariasForPrefeitura,
    isAdmin,
    isSuperAdmin,
    getAllUsers
  } = useAuth();

  const currentUser = getCurrentUser();
  const prefeituraId = currentUser?.prefeituraId;
  const prefeitura = prefeituraId ? getPrefeituraById(prefeituraId) : null;
  const prefeiturasDisponiveis = getAllPrefeituras().filter(p => p.status === 'ativa');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: '',
      email: '',
      password: '',
      role: 'operator',
      prefeituraId: '',
      secretariaId: '',
      permissions: { ...defaultPermissionsByRole.operator },
      status: 'ativo',
    }
  });

  const formData = watch(); // Para manter compatibilidade temporária com o resto do código que usa formData

  const secretariasDisponiveis = formData.prefeituraId
    ? getSecretariasForPrefeitura(formData.prefeituraId)
    : [];

  // Busca usuários
  const users = isSuperAdmin()
    ? getAllUsers().filter(u => u.id !== currentUser?.id)
    : (prefeituraId ? getUsersForPrefeitura(prefeituraId).filter(u => u.id !== currentUser?.id) : []);

  const filteredUsers = users.filter(u =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    reset({
      nome: '',
      email: '',
      password: '',
      role: 'operator',
      prefeituraId: currentUser?.prefeituraId || '',
      secretariaId: currentUser?.secretariaId || '',
      permissions: { ...defaultPermissionsByRole.operator },
      status: 'ativo',
    });
    setEditingUser(null);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      reset({
        nome: user.nome,
        email: user.email,
        password: '',
        role: user.role,
        prefeituraId: user.prefeituraId || '',
        secretariaId: user.secretariaId || '',
        permissions: { ...user.permissions },
        status: user.status,
      });
    } else {
      resetForm();
    }
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    resetForm();
  };

  const handleRoleChange = (role: 'admin' | 'operator') => {
    setValue('role', role);
    setValue('permissions', role === 'admin'
      ? { ...defaultPermissionsByRole.admin }
      : { ...defaultPermissionsByRole.operator }
    );
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setValue('password', newPassword);
    toast({
      title: "Senha Gerada",
      description: `A nova senha é: ${newPassword}`,
    });
  };

  const handlePermissionToggle = (module: keyof ModulePermissions) => {
    const currentPermissions = form.getValues('permissions');
    setValue(`permissions.${module}`, !currentPermissions[module]);
  };

  const form = { getValues: (key: any) => watch(key) }; // Mock para compatibilidade temporária


  const onSubmit = async (data: UserFormData) => {
    let success = false;
    if (editingUser) {
      success = await updateUser(editingUser.id, {
        nome: data.nome,
        email: data.email,
        role: data.role,
        prefeituraId: data.prefeituraId,
        secretariaId: data.secretariaId,
        permissions: data.permissions,
        status: data.status,
      });
    } else {
      const newUser = await createUser({
        nome: data.nome,
        email: data.email,
        role: data.role,
        prefeituraId: data.prefeituraId,
        secretariaId: data.secretariaId,
        permissions: data.permissions,
        status: data.status,
      }, data.password);
      success = !!newUser;
    }

    if (success) {
      handleCloseModal();
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
  };

  const handleResetPassword = (user: User) => {
    toast({
      title: "Senha redefinida",
      description: `Nova senha enviada para ${user.email}`,
    });
  };

  const getActivePermissionsCount = (permissions: ModulePermissions) => {
    if (!permissions) return 0;
    return configurableModules.filter(m => permissions[m]).length;
  };

  if (!isAdmin() && !isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-orange-500" />
            Gerenciar Usuários
          </h1>
          <p className="text-muted-foreground">
            {prefeitura ? prefeitura.nome : 'Gerencie os usuários da sua organização'}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <UserPlus size={16} className="mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-3xl font-bold text-blue-600">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operadores</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.role === 'operator').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto mb-4 text-gray-300" size={48} />
              <p>Nenhum usuário encontrado</p>
              <Button variant="link" onClick={() => handleOpenModal()}>
                Cadastrar primeiro usuário
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Módulos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.role === 'admin' ? (
                          <Badge variant="outline" className="text-xs">Acesso Total</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {getActivePermissionsCount(user.permissions)} módulo(s)
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          user.status === 'ativo'
                            ? 'text-green-600 border-green-300 bg-green-50'
                            : 'text-gray-500 border-gray-300 bg-gray-50'
                        )}
                      >
                        {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(user)}
                          title="Editar"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          title="Redefinir senha"
                        >
                          <Key size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Excluir"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingUser ? <Edit size={20} /> : <UserPlus size={20} />}
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    {...register('nome')}
                    placeholder="Ex: João da Silva"
                  />
                  {errors.nome && <span className="text-sm text-red-500">{errors.nome.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="Ex: joao@prefeitura.gov.br"
                  />
                  {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
                </div>
              </div>

              {/* Role & Status & Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Perfil de Acesso</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={(val) => {
                        field.onChange(val);
                        handleRoleChange(val as 'admin' | 'operator');
                      }} value={field.value}>
                        <SelectTrigger className="w-full text-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="operator">Operador</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && <span className="text-sm text-red-500">{errors.role.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full text-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {!editingUser && (
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha Temporária</Label>
                    <Input
                      id="password"
                      {...register('password')}
                      placeholder="Senha do usuário"
                    />
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGeneratePassword}
                    className="gap-2"
                  >
                    <Key size={16} />
                    Gerar Senha
                  </Button>
                </div>
              )}


              {/* Prefeitura & Secretaria Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prefeitura *</Label>
                  <Controller
                    name="prefeituraId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          setValue('secretariaId', ''); // Limpa secretaria ao mudar prefeitura
                        }}
                      >
                        <SelectTrigger className="w-full text-slate-900">
                          <SelectValue placeholder="Selecione uma prefeitura" />
                        </SelectTrigger>
                        <SelectContent>
                          {prefeiturasDisponiveis.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.prefeituraId && <span className="text-sm text-red-500">{errors.prefeituraId.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Secretaria *</Label>
                  <Controller
                    name="secretariaId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!watch('prefeituraId')}
                      >
                        <SelectTrigger className="w-full text-slate-900">
                          <SelectValue placeholder={watch('prefeituraId') ? "Selecione uma secretaria" : "Selecione a prefeitura primeiro"} />
                        </SelectTrigger>
                        <SelectContent>
                          {secretariasDisponiveis.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Permissions (only for operators) */}
              {watch('role') === 'operator' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Permissões de Módulos</Label>
                    <p className="text-sm text-muted-foreground">
                      Selecione quais módulos este usuário poderá acessar
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {configurableModules.map((module) => (
                      <div
                        key={module}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-colors",
                          watch(`permissions.${module}`)
                            ? "bg-orange-50 border-orange-200"
                            : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <Label
                          htmlFor={module}
                          className="cursor-pointer flex-1"
                        >
                          {moduleLabels[module]}
                        </Label>
                        <Switch
                          id={module}
                          checked={watch(`permissions.${module}`)}
                          onCheckedChange={() => handlePermissionToggle(module)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {watch('role') === 'admin' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Administradores</strong> têm acesso completo a todos os módulos do sistema,
                    incluindo a gestão de usuários da organização.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GerenciarUsuarios;
