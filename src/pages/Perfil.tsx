import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Save,
  User,
  Bell,
  Shield,
  LogOut,
  UserCheck,
  CalendarDays,
  MenuSquare,
  FileText,
  Gavel,
  Camera,
  Loader2
} from 'lucide-react';

const Perfil = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [userData, setUserData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: '(11) 98765-4321',
    cargo: user?.role === 'super_admin' ? 'Super Administrador' : user?.role === 'admin' ? 'Administrador' : 'Operador',
    unidade: 'Secretaria de Administração',
    cpf: '123.456.789-00',
    matricula: '12345',
    isGestor: user?.role === 'super_admin' || user?.role === 'admin'
  });

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

  const [stats, setStats] = useState({ dfds: 0, etps: 0, editais: 0, loading: true });
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    // Load avatar from localStorage
    const savedAvatar = localStorage.getItem(`preparagov_avatar_${user.id}`);
    if (savedAvatar) {
      setAvatarBase64(savedAvatar);
    }

    const fetchStats = async () => {
      try {
        const [dfdRes, etpRes, editalRes] = await Promise.all([
          supabase.from('dfd').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
          supabase.from('etp').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
          supabase.from('editais').select('*', { count: 'exact', head: true }).eq('created_by', user.id)
        ]);

        setStats({
          dfds: dfdRes.count || 0,
          etps: etpRes.count || 0,
          editais: editalRes.count || 0,
          loading: false
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarBase64(base64String);
      if (user) {
        localStorage.setItem(`preparagov_avatar_${user.id}`, base64String);
        window.dispatchEvent(new Event('avatarUpdate'));
      }
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi alterada com sucesso."
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUserDataChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
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
      description: "Sua senha foi atualizada com sucesso.",
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  const getPermissionsSummary = (permissions: any): { name: string, icon: any }[] => {
    const activePermissions = [];
    if (permissions.criarDFD) activePermissions.push({ name: 'DFD', icon: FileText });
    if (permissions.acessarPCA) activePermissions.push({ name: 'PCA', icon: CalendarDays });
    if (permissions.criarETP) activePermissions.push({ name: 'ETP', icon: MenuSquare });
    if (permissions.criarMapaRiscos) activePermissions.push({ name: 'Mapa de Riscos', icon: Shield });
    if (permissions.criarTR) activePermissions.push({ name: 'TR', icon: FileText });
    if (permissions.criarEdital) activePermissions.push({ name: 'Edital', icon: FileText });
    return activePermissions;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Configurações da Conta</h1>
          <p className="text-gray-500 mt-1">Gerencie suas informações pessoais e preferências do sistema</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
          <LogOut size={16} className="mr-2" />
          Sair da Conta
        </Button>
      </div>

      <Tabs defaultValue="meus-dados" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 p-1.5 rounded-xl h-auto">
          <TabsTrigger value="meus-dados" className="flex items-center space-x-2 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium">
            <User size={16} />
            <span>Meus Dados</span>
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="flex items-center space-x-2 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium">
            <UserCheck size={16} />
            <span>Permissões</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center space-x-2 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium">
            <Bell size={16} />
            <span>Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center space-x-2 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm font-medium">
            <Shield size={16} />
            <span>Segurança</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          {/* ABA 1: MEUS DADOS */}
          <TabsContent value="meus-dados" className="m-0 border-none p-0 outline-none space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-none shadow-md bg-white">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                    <CardDescription>Detalhes do seu perfil principal</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Avatar className="h-24 w-24 ring-4 ring-orange-50 outline outline-1 outline-orange-100 shadow-sm transition-opacity group-hover:opacity-80">
                          <AvatarImage src={avatarBase64 || "/placeholder.svg"} alt={userData.nome} className="object-cover" />
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                            {userData.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                          <Camera size={24} className="text-white mb-1" />
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-900">{userData.nome}</h3>
                        <p className="text-gray-500 font-medium">{userData.cargo}</p>
                        <p className="text-sm text-gray-400">{userData.unidade}</p>
                        {userData.isGestor && (
                          <Badge variant="secondary" className="mt-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                            <UserCheck size={12} className="mr-1.5" />
                            Gestor do Sistema
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input id="nome" value={userData.nome} onChange={(e) => handleUserDataChange('nome', e.target.value)} className="bg-gray-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail Corporativo</Label>
                        <Input id="email" type="email" value={userData.email} onChange={(e) => handleUserDataChange('email', e.target.value)} className="bg-gray-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone / Ramal</Label>
                        <Input id="telefone" value={userData.telefone} onChange={(e) => handleUserDataChange('telefone', e.target.value)} className="bg-gray-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf">Documento (CPF)</Label>
                        <Input id="cpf" value={userData.cpf} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo / Função</Label>
                        <Input id="cargo" value={userData.cargo} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="matricula">Matrícula</Label>
                        <Input id="matricula" value={userData.matricula} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="unidade">Órgão / Unidade de Lotação</Label>
                        <Input id="unidade" value={userData.unidade} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                      <Button onClick={handleSaveProfile} className="bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 font-semibold px-6">
                        <Save size={16} className="mr-2" />
                        Salvar Alterações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-none shadow-md bg-white">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg">Atividade Recente</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <FileText size={16} className="mr-2 text-gray-400" /> DFDs Criados
                        </span>
                        <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100">
                          {stats.loading ? <Loader2 size={12} className="animate-spin inline" /> : stats.dfds}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <MenuSquare size={16} className="mr-2 text-gray-400" /> ETPs Elaborados
                        </span>
                        <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100">
                          {stats.loading ? <Loader2 size={12} className="animate-spin inline" /> : stats.etps}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <Gavel size={16} className="mr-2 text-gray-400" /> Editais Gerados
                        </span>
                        <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100">
                          {stats.loading ? <Loader2 size={12} className="animate-spin inline" /> : stats.editais}
                        </span>
                      </div>
                      <div className="flex justify-center pt-2">
                        <p className="text-xs text-gray-400 flex items-center">
                          <CalendarDays size={12} className="mr-1" /> Último acesso: Hoje, 09:41
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ABA 2: PERMISSÕES */}
          <TabsContent value="permissoes" className="m-0 border-none p-0 outline-none">
            <Card className="border-none shadow-md bg-white max-w-4xl">
              <CardHeader className="pb-4 border-b border-gray-100">
                <CardTitle className="text-lg flex items-center">
                  <UserCheck className="mr-2 text-blue-500" size={20} />
                  Módulos Autorizados
                </CardTitle>
                <CardDescription>
                  Estes são os módulos que seu administrador liberou para sua conta. Se precisar de mais acessos, contate a gestão.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {getPermissionsSummary(userPermissions).map((permission) => (
                    <div key={permission.name} className="flex items-center p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                        <permission.icon size={18} className="text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-gray-900">{permission.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 3: NOTIFICAÇÕES */}
          <TabsContent value="notificacoes" className="m-0 border-none p-0 outline-none">
            <Card className="border-none shadow-md bg-white max-w-3xl">
              <CardHeader className="pb-4 border-b border-gray-100">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="mr-2 text-orange-500" size={20} />
                  Preferências de Alertas
                </CardTitle>
                <CardDescription>Configure como e quando você deseja receber avisos do sistema</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-start justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="space-y-1 pr-6">
                    <p className="text-sm font-semibold text-gray-900">Notificações por E-mail</p>
                    <p className="text-sm text-gray-500">Receba resumos e alertas importantes diretamente na sua caixa de entrada (recomendado).</p>
                  </div>
                  <Switch checked={preferences.emailNotifications} onCheckedChange={(c) => handlePreferenceChange('emailNotifications', c)} />
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border-t border-gray-100">
                  <div className="space-y-1 pr-6">
                    <p className="text-sm font-semibold text-gray-900">Alertas no Navegador (Push)</p>
                    <p className="text-sm text-gray-500">Receba notificações instantâneas na tela mesmo quando não estiver com o PreparaGov aberto.</p>
                  </div>
                  <Switch checked={preferences.pushNotifications} onCheckedChange={(c) => handlePreferenceChange('pushNotifications', c)} />
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border-t border-gray-100">
                  <div className="space-y-1 pr-6">
                    <p className="text-sm font-semibold text-gray-900">Relatório Automático Semanal</p>
                    <p className="text-sm text-gray-500">Um resumo dos DFDs e ETPs finalizados na sua secretaria toda segunda-feira.</p>
                  </div>
                  <Switch checked={preferences.weeklyReport} onCheckedChange={(c) => handlePreferenceChange('weeklyReport', c)} />
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border-t border-gray-100">
                  <div className="space-y-1 pr-6">
                    <p className="text-sm font-semibold text-gray-900">Lembretes de Prazos</p>
                    <p className="text-sm text-gray-500">Avisos proativos sobre contratos que estão próximos do vencimento e licitações agendadas.</p>
                  </div>
                  <Switch checked={preferences.contractReminders} onCheckedChange={(c) => handlePreferenceChange('contractReminders', c)} />
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <Button onClick={handleSavePreferences} variant="outline" className="font-semibold px-6 hover:bg-gray-50">
                    <Save size={16} className="mr-2 text-gray-500" />
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 4: SEGURANÇA */}
          <TabsContent value="seguranca" className="m-0 border-none p-0 outline-none">
            <Card className="border-none shadow-md bg-white max-w-2xl">
              <CardHeader className="pb-4 border-b border-gray-100">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="mr-2 text-green-600" size={20} />
                  Acesso Restrito
                </CardTitle>
                <CardDescription>Mantenha sua conta segura alterando sua senha periodicamente</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Sua senha atual"
                    className="bg-gray-50/50"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Mínimo de 8 caracteres"
                    className="bg-gray-50/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Digite a nova senha novamente"
                    className="bg-gray-50/50"
                  />
                </div>

                <div className="flex justify-start pt-6">
                  <Button onClick={handleChangePassword} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6">
                    <Shield size={16} className="mr-2" />
                    Atualizar Senha
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Perfil;
