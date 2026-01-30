import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState, ModulePermissions, UserRole, defaultPermissionsByRole } from '@/types/auth';
import { mockUsers, mockCredentials, mockPrefeituras } from '@/data/mockAuthData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: keyof ModulePermissions) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isOperator: () => boolean;
  startImpersonation: (userId: string) => void;
  stopImpersonation: () => void;
  getCurrentUser: () => User | null;
  getUsersForPrefeitura: (prefeituraId: string) => User[];
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  getPrefeituraById: (prefeituraId: string) => typeof mockPrefeituras[0] | undefined;
  getAllPrefeituras: () => typeof mockPrefeituras;
  getSecretariasForPrefeitura: (prefeituraId: string) => any[];
  addSecretaria: (data: any) => void;
  switchToUser: (email: string) => void; // For testing different users
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [prefeituras, setPrefeituras] = useState<Prefeitura[]>([]);
  const [secretarias, setSecretarias] = useState<any[]>([]);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    impersonating: null,
  });

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('usuarios_acesso').select('*');
      if (error) throw error;

      const mappedUsers: User[] = (data || []).map(dbUser => ({
        id: dbUser.id.toString(),
        email: dbUser.email,
        nome: dbUser.nome || dbUser.email.split('@')[0],
        role: (dbUser.tipo_perfil as UserRole) || 'operator',
        prefeituraId: dbUser.prefeitura_id || null,
        secretariaId: dbUser.secretaria_id || null,
        permissions: (dbUser.modulos_acesso && Object.keys(dbUser.modulos_acesso).length > 0)
          ? dbUser.modulos_acesso
          : defaultPermissionsByRole[(dbUser.tipo_perfil as UserRole) || 'operator'],
        createdAt: dbUser.created_at || new Date().toISOString(),
        status: dbUser.status || 'ativo',
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchPrefeituras = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('prefeituras').select('*');
      if (error) throw error;
      setPrefeituras(data || []);
    } catch (error) {
      console.error('Error fetching prefeituras:', error);
    }
  }, []);

  const fetchSecretarias = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('secretarias').select('*');
      if (error) throw error;
      setSecretarias(data || []);
    } catch (error) {
      console.error('Error fetching secretarias:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchPrefeituras();
    fetchSecretarias();
  }, [fetchUsers, fetchPrefeituras, fetchSecretarias]);


  // Load saved auth state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('preparagov_user');
    const savedImpersonating = localStorage.getItem('preparagov_impersonating');

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        impersonating: savedImpersonating ? JSON.parse(savedImpersonating) : null,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      let dbUser = null;
      let isGlobalAdmin = false;

      // 1. Tentar login via Supabase na tabela usuarios_acesso
      const { data: accessUser, error: dbError, status } = await supabase
        .from('usuarios_acesso')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .maybeSingle();

      if (accessUser) {
        dbUser = accessUser;
      } else if (!dbError) {
        // 2. Tentar login via Supabase na tabela admin_users (Global Admins)
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();

        if (adminUser) {
          dbUser = adminUser;
          isGlobalAdmin = true;
        }
      }

      console.log('Login attempt:', { email, hasData: !!dbUser, error: dbError });

      if (dbError && !isGlobalAdmin) {
        console.error('Database connection error:', dbError);
        toast({
          title: "Erro de Conexão",
          description: status === 401
            ? "Falha na autenticação com o banco de dados. Verifique as chaves no arquivo .env."
            : "Não foi possível conectar ao banco de dados.",
          variant: "destructive"
        });
        return false;
      }

      if (dbUser) {
        const role = isGlobalAdmin ? 'super_admin' : (dbUser.tipo_perfil as UserRole) || 'operator';

        const user: User = {
          id: dbUser.id.toString(),
          email: dbUser.email,
          nome: dbUser.nome || dbUser.email.split('@')[0],
          role: role,
          prefeituraId: dbUser.prefeitura_id || null,
          secretariaId: dbUser.secretaria_id || null,
          permissions: isGlobalAdmin
            ? defaultPermissionsByRole.super_admin
            : (dbUser.modulos_acesso && Object.keys(dbUser.modulos_acesso).length > 0)
              ? dbUser.modulos_acesso
              : defaultPermissionsByRole[role],
          createdAt: dbUser.created_at || new Date().toISOString(),
          status: dbUser.status || 'ativo',
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          impersonating: null,
        });

        localStorage.setItem('preparagov_user', JSON.stringify(user));
        localStorage.removeItem('preparagov_impersonating');

        toast({
          title: "Login realizado",
          description: `Bem-vindo, ${user.nome}!`,
        });

        return true;
      }
    } catch (err) {
      console.error('Database connection error:', err);
    }

    // 2. Fallback para Mock (Desenvolvimento)
    const credential = mockCredentials.find(c => c.email === email && c.password === password);

    if (!credential) {
      toast({
        title: "Erro de autenticação",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
      return false;
    }

    const user = users.find(u => u.id === credential.userId);

    if (!user || user.status === 'inativo') {
      toast({
        title: "Acesso negado",
        description: "Usuário inativo ou não encontrado",
        variant: "destructive",
      });
      return false;
    }

    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      impersonating: null,
    });

    localStorage.setItem('preparagov_user', JSON.stringify(user));
    localStorage.removeItem('preparagov_impersonating');

    toast({
      title: "Login realizado",
      description: `Bem-vindo, ${user.nome}!`,
    });

    return true;
  }, [users, toast]);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      impersonating: null,
    });
    localStorage.removeItem('preparagov_user');
    localStorage.removeItem('preparagov_impersonating');

    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  }, [toast]);

  const getCurrentUser = useCallback((): User | null => {
    // Se está impersonando, retorna o usuário impersonado
    return authState.impersonating || authState.user;
  }, [authState]);

  const hasPermission = useCallback((module: keyof ModulePermissions): boolean => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    // Super Admin sempre tem acesso (exceto se estiver impersonando)
    if (authState.user?.role === 'super_admin' && !authState.impersonating) {
      return true;
    }

    return currentUser.permissions[module] === true;
  }, [authState, getCurrentUser]);

  const isSuperAdmin = useCallback((): boolean => {
    return authState.user?.role === 'super_admin' && !authState.impersonating;
  }, [authState]);

  const isAdmin = useCallback((): boolean => {
    const currentUser = getCurrentUser();
    return currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  }, [getCurrentUser]);

  const isOperator = useCallback((): boolean => {
    const currentUser = getCurrentUser();
    return currentUser?.role === 'operator';
  }, [getCurrentUser]);

  const startImpersonation = useCallback((userId: string) => {
    if (authState.user?.role !== 'super_admin') {
      toast({
        title: "Acesso negado",
        description: "Apenas Super Admin pode impersonar usuários",
        variant: "destructive",
      });
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    setAuthState(prev => ({
      ...prev,
      impersonating: targetUser,
    }));

    localStorage.setItem('preparagov_impersonating', JSON.stringify(targetUser));

    toast({
      title: "Modo Impersonação",
      description: `Você está visualizando como ${targetUser.nome}`,
    });
  }, [authState.user, users, toast]);

  const stopImpersonation = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      impersonating: null,
    }));

    localStorage.removeItem('preparagov_impersonating');

    toast({
      title: "Impersonação encerrada",
      description: "Você voltou ao seu perfil de Super Admin",
    });
  }, [toast]);

  const getUsersForPrefeitura = useCallback((prefeituraId: string): User[] => {
    return users.filter(u => u.prefeituraId === prefeituraId);
  }, [users]);

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>, password?: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios_acesso')
        .insert([{
          email: userData.email,
          senha: password || '123456', // Padrão se não informado
          nome: userData.nome,
          tipo_perfil: userData.role,
          prefeitura_id: userData.prefeituraId,
          secretaria_id: userData.secretariaId,
          modulos_acesso: userData.permissions,
          status: userData.status,
        }])
        .select()
        .single();

      if (error) throw error;

      const newUser: User = {
        id: data.id.toString(),
        email: data.email,
        nome: data.nome,
        role: (data.tipo_perfil as UserRole) || 'operator',
        prefeituraId: data.prefeitura_id,
        secretariaId: data.secretaria_id,
        permissions: data.modulos_acesso || defaultPermissionsByRole[data.tipo_perfil as UserRole],
        createdAt: data.created_at,
        status: data.status || 'ativo',
      };

      setUsers(prev => [...prev, newUser]);
      toast({ title: "Usuário criado", description: `${newUser.nome} foi cadastrado com sucesso` });
      return newUser;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({ title: "Erro ao criar usuário", description: error.message, variant: "destructive" });
      return null;
    }
  }, [toast]);


  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      const dbUpdates: any = {};
      if (updates.nome) dbUpdates.nome = updates.nome;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.role) dbUpdates.tipo_perfil = updates.role;
      if (updates.prefeituraId !== undefined) dbUpdates.prefeitura_id = updates.prefeituraId;
      if (updates.secretariaId !== undefined) dbUpdates.secretaria_id = updates.secretariaId;
      if (updates.permissions) dbUpdates.modulos_acesso = updates.permissions;
      if (updates.status) dbUpdates.status = updates.status;

      const { error } = await supabase
        .from('usuarios_acesso')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      toast({ title: "Usuário atualizado", description: "As alterações foram salvas com sucesso" });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    }
  }, [toast]);


  const deleteUser = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase.from('usuarios_acesso').delete().eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: "Usuário removido", description: "O usuário foi excluído com sucesso" });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    }
  }, [toast]);


  const getPrefeituraById = useCallback((prefeituraId: string) => {
    return prefeituras.find(p => p.id === prefeituraId);
  }, [prefeituras]);

  const getAllPrefeituras = useCallback(() => {
    return prefeituras;
  }, [prefeituras]);


  const getSecretariasForPrefeitura = useCallback((prefeituraId: string) => {
    return secretarias.filter(s => s.prefeitura_id === prefeituraId);
  }, [secretarias]);


  const addSecretaria = useCallback((data: any) => {
    setSecretarias(prev => [...prev, { ...data, id: `sec-${Date.now()}` }]);
  }, []);

  const switchToUser = useCallback((email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        impersonating: null,
      });
      localStorage.setItem('preparagov_user', JSON.stringify(user));
      localStorage.removeItem('preparagov_impersonating');
      toast({
        title: "Usuário alterado",
        description: `Logado como ${user.nome} (${user.role})`,
      });
    }
  }, [users, toast]);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        hasPermission,
        isSuperAdmin,
        isAdmin,
        isOperator,
        startImpersonation,
        stopImpersonation,
        getCurrentUser,
        getUsersForPrefeitura,
        createUser,
        updateUser,
        deleteUser,
        getPrefeituraById,
        getAllPrefeituras,
        getSecretariasForPrefeitura,
        addSecretaria,
        switchToUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
