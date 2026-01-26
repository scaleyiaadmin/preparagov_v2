
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import UserManagement from '@/components/Perfil/UserManagement';
import SecretariaManagement from '@/components/Perfil/SecretariaManagement';
import { 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Bell,
  Shield,
  Settings,
  LogOut,
  Users,
  Building,
  UserCheck
} from 'lucide-react';

const Perfil = () => {
  const [userData, setUserData] = useState({
    nome: 'João Silva Santos',
    email: 'joao.silva@gov.br',
    telefone: '(11) 98765-4321',
    cargo: 'Gestor do Sistema',
    unidade: 'Secretaria de Administração',
    cpf: '123.456.789-00',
    matricula: '12345',
    isGestor: true // Simula usuário gestor/master
  });

  // Simula permissões do usuário atual
  const [userPermissions] = useState({
    criarDFD: true,
    acessarPCA: false,
    criarETP: true,
    criarMapaRiscos: true,
    criarTR: true,
    criarEdital: true,
    editarDadosInstitucionais: true,
    visualizarRelatorios: true
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    contractReminders: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { toast } = useToast();

  const handleUserDataChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    toast({
      title: "Perfil Atualizado",
      description: "Dados do perfil salvos com sucesso.",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferências Salvas",
      description: "Configurações atualizadas com sucesso.",
    });
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Senha Alterada",
      description: "Senha alterada com sucesso.",
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logout Realizado",
      description: "Você foi desconectado com sucesso.",
    });
    // Simular logout
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const getPermissionsSummary = (permissions: any): string[] => {
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
          <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="meus-dados" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meus-dados" className="flex items-center space-x-2">
            <User size={16} />
            <span>Meus Dados</span>
          </TabsTrigger>
          {userData.isGestor && (
            <>
              <TabsTrigger value="usuarios" className="flex items-center space-x-2">
                <Users size={16} />
                <span>Gerenciar Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="secretarias" className="flex items-center space-x-2">
                <Building size={16} />
                <span>Secretarias e Setores</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="meus-dados" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User size={20} />
                    <span>Informações Pessoais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg" alt="Avatar" />
                      <AvatarFallback className="text-lg">JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{userData.nome}</h3>
                      <p className="text-muted-foreground">{userData.cargo}</p>
                      <p className="text-sm text-muted-foreground">{userData.unidade}</p>
                      {userData.isGestor && (
                        <Badge variant="secondary" className="mt-2">
                          <UserCheck size={12} className="mr-1" />
                          Gestor do Sistema
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={userData.nome}
                        onChange={(e) => handleUserDataChange('nome', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => handleUserDataChange('email', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={userData.telefone}
                        onChange={(e) => handleUserDataChange('telefone', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={userData.cpf}
                        onChange={(e) => handleUserDataChange('cpf', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        value={userData.cargo}
                        onChange={(e) => handleUserDataChange('cargo', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="matricula">Matrícula</Label>
                      <Input
                        id="matricula"
                        value={userData.matricula}
                        onChange={(e) => handleUserDataChange('matricula', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="unidade">Unidade</Label>
                      <Input
                        id="unidade"
                        value={userData.unidade}
                        onChange={(e) => handleUserDataChange('unidade', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSaveProfile}>
                      <Save size={16} className="mr-2" />
                      Salvar Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield size={20} />
                    <span>Segurança</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="Digite sua nova senha"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="Confirme sua nova senha"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleChangePassword} variant="outline">
                      <Shield size={16} className="mr-2" />
                      Alterar Senha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Permissões do usuário */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck size={20} />
                    <span>Minhas Permissões</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-3">Permissões concedidas ao seu usuário:</p>
                    <div className="flex flex-wrap gap-2">
                      {getPermissionsSummary(userPermissions).map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notificações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell size={20} />
                    <span>Notificações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">E-mail</p>
                      <p className="text-xs text-muted-foreground">Receber notificações por e-mail</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Push</p>
                      <p className="text-xs text-muted-foreground">Notificações no navegador</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Relatório Semanal</p>
                      <p className="text-xs text-muted-foreground">Resumo semanal das atividades</p>
                    </div>
                    <Switch
                      checked={preferences.weeklyReport}
                      onCheckedChange={(checked) => handlePreferenceChange('weeklyReport', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Lembretes de Contrato</p>
                      <p className="text-xs text-muted-foreground">Avisos de prazos e vencimentos</p>
                    </div>
                    <Switch
                      checked={preferences.contractReminders}
                      onCheckedChange={(checked) => handlePreferenceChange('contractReminders', checked)}
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSavePreferences} variant="outline">
                      <Settings size={16} className="mr-2" />
                      Salvar Preferências
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">DFDs Criados</span>
                      <span className="font-semibold">23</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ETPs Elaborados</span>
                      <span className="font-semibold">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Editais Gerados</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Último Acesso</span>
                      <span className="font-semibold">Hoje</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {userData.isGestor && (
          <>
            <TabsContent value="usuarios">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="secretarias">
              <SecretariaManagement />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Perfil;
