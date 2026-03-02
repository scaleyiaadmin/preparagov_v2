import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState, ModulePermissions, UserRole, defaultPermissionsByRole, Prefeitura } from '@/types/auth';
import { DbUser, DbPrefeitura, DbSecretaria } from '@/types/database';
import { mockUsers, mockCredentials, mockPrefeituras } from '@/data/mockAuthData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/utils/supabaseErrorHandler';

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
  createUser: (userData: Omit<User, 'id' | 'createdAt'>, password?: string) => Promise<User | null>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<void>;
  getPrefeituraById: (prefeituraId: string) => Prefeitura | undefined;
  getAllPrefeituras: () => Prefeitura[];
  getSecretariasForPrefeitura: (prefeituraId: string) => DbSecretaria[];
  addSecretaria: (data: Omit<DbSecretaria, 'id' | 'created_at'>) => void;
  switchToUser: (email: string) => void;
  createPrefeitura: (prefeituraData: Pick<DbPrefeitura, 'nome' | 'cnpj' | 'uf' | 'municipio'>) => Promise<boolean>;
  deletePrefeitura: (prefeituraId: string) => Promise<boolean>;
  getAllUsers: () => User[];
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

      // Cast data to DbUser[] to ensure type safety based on our schema definition
      const dbUsers = data as unknown as DbUser[];

      const mappedUsers: User[] = (dbUsers || []).map(dbUser => ({
        id: dbUser.id.toString(),
        email: dbUser.email,
        nome: dbUser.nome || dbUser.email.split('@')[0],
        role: dbUser.tipo_perfil || 'operator',
        prefeituraId: dbUser.prefeitura_id || null,
        secretariaId: dbUser.secretaria_id || null,
        permissions: (dbUser.modulos_acesso && Object.keys(dbUser.modulos_acesso).length > 0)
          ? dbUser.modulos_acesso
          : defaultPermissionsByRole[dbUser.tipo_perfil || 'operator'],
        createdAt: dbUser.created_at || new Date().toISOString(),
        status: dbUser.status || 'ativo',
      }));
      setUsers(mappedUsers);
    } catch (error) {
      handleSupabaseError(error, 'Fetching Users');
    }
  }, []);

  const fetchPrefeituras = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('prefeituras').select('*');
      if (error) throw error;

      const dbPrefeituras = data as unknown as DbPrefeitura[];

      const mappedPrefeituras: Prefeitura[] = (dbPrefeituras || []).map((dbPref) => ({
        id: dbPref.id,
        nome: dbPref.nome,
        cnpj: dbPref.cnpj,
        uf: dbPref.uf,
        municipio: dbPref.municipio,
        logoUrl: dbPref.logo_url || undefined,
        gestorPrincipal: dbPref.gestor_principal || undefined,
        email: dbPref.email || undefined,
        telefone: dbPref.telefone || undefined,
        cargo: dbPref.cargo || undefined,
        dataCadastro: dbPref.created_at || new Date().toISOString(),
        status: dbPref.status || 'inativa',
      }));
      setPrefeituras(mappedPrefeituras);
    } catch (error) {
      handleSupabaseError(error, 'Fetching Prefeituras');
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
      handleSupabaseError(err, 'Login');
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

    // Caso a permissão não exista no objeto (permissões novas do sistema), usa o padrão da role
    if (currentUser.permissions && currentUser.permissions[module] !== undefined) {
      return currentUser.permissions[module] === true;
    }

    return defaultPermissionsByRole[currentUser.role]?.[module] === true;
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
      const newUserPayload: Partial<DbUser> = {
        email: userData.email,
        senha: password || '123456', // Padrão se não informado
        nome: userData.nome,
        tipo_perfil: userData.role,
        prefeitura_id: userData.prefeituraId || null,
        secretaria_id: userData.secretariaId || null,
        modulos_acesso: userData.permissions,
        status: userData.status
      };

      const { data, error } = await supabase
        .from('usuarios_acesso')
        .insert([newUserPayload])
        .select()
        .single();

      if (error) throw error;

      // Cast response to DbUser
      const dbUser = data as unknown as DbUser;

      const newUser: User = {
        id: dbUser.id,
        email: dbUser.email,
        nome: dbUser.nome,
        role: dbUser.tipo_perfil || 'operator',
        prefeituraId: dbUser.prefeitura_id,
        secretariaId: dbUser.secretaria_id,
        permissions: dbUser.modulos_acesso || defaultPermissionsByRole[dbUser.tipo_perfil || 'operator'],
        createdAt: dbUser.created_at,
        status: dbUser.status || 'ativo',
      };

      setUsers(prev => [...prev, newUser]);
      toast({ title: "Usuário criado", description: `${newUser.nome} foi cadastrado com sucesso` });
      return newUser;
    } catch (error) {
      handleSupabaseError(error, 'Creating User');
      return null;
    }
  }, [toast]);


  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      const dbUpdates: Partial<DbUser> = {};
      if (updates.nome) dbUpdates.nome = updates.nome;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.role) dbUpdates.tipo_perfil = updates.role;
      if (updates.prefeituraId !== undefined) dbUpdates.prefeitura_id = updates.prefeituraId || null;
      if (updates.secretariaId !== undefined) dbUpdates.secretaria_id = updates.secretariaId || null;
      if (updates.permissions) dbUpdates.modulos_acesso = updates.permissions;
      if (updates.status) dbUpdates.status = updates.status;

      const { error } = await supabase
        .from('usuarios_acesso')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      toast({ title: "Usuário atualizado", description: "As alterações foram salvas com sucesso" });
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Updating User');
      return false;
    }
  }, [toast]);


  const deleteUser = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase.from('usuarios_acesso').delete().eq('id', userId);

      if (error) {
        // Erro de violação de chave estrangeira (violates foreign key constraint)
        if (error.code === '23503') {
          toast({
            title: "Usuário em Uso",
            description: "Este usuário possui documentos (DFDs, PCAs, etc) vinculados a ele e não pode ser excluído permanentemente. Recomendamos apenas desativar o usuário.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: "Usuário removido", description: "O usuário foi excluído com sucesso" });
    } catch (error) {
      handleSupabaseError(error, 'Deleting User');
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

  const getAllUsers = useCallback(() => {
    // Super Admin vê todos os usuários
    // Admin e Operator veem apenas usuários da sua prefeitura
    const currentUser = authState.user;
    if (currentUser?.role === 'super_admin') {
      return users;
    }
    if (currentUser?.prefeituraId) {
      return users.filter(u => u.prefeituraId === currentUser.prefeituraId);
    }
    return [];
  }, [users, authState.user]);


  const addSecretaria = useCallback((data: Omit<DbSecretaria, 'id' | 'created_at'>) => {
    setSecretarias(prev => [...prev, { ...data, id: `sec-${Date.now()}` }]);
  }, []);

  const createPrefeitura = useCallback(async (prefeituraData: Pick<DbPrefeitura, 'nome' | 'cnpj' | 'uf' | 'municipio'>): Promise<boolean> => {
    try {
      // 1. Verificar se a prefeitura já existe pelo CNPJ
      const { data: existingPref, error: searchError } = await supabase
        .from('prefeituras')
        .select('id')
        .eq('cnpj', prefeituraData.cnpj)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingPref) {
        toast({
          title: "Prefeitura já cadastrada",
          description: "Já existe uma prefeitura com este CNPJ no sistema.",
          variant: "destructive"
        });
        return false;
      }

      // 2. Inserir a prefeitura
      const newPrefeitura: Partial<DbPrefeitura> = {
        nome: prefeituraData.nome,
        cnpj: prefeituraData.cnpj,
        uf: prefeituraData.uf,
        municipio: prefeituraData.municipio,
        status: 'ativa'
      };

      const { error: prefError } = await supabase
        .from('prefeituras')
        .insert([newPrefeitura]);

      if (prefError) throw prefError;

      // Atualizar estado local
      fetchPrefeituras();

      toast({
        title: "Prefeitura criada",
        description: "Os dados da prefeitura foram salvos com sucesso."
      });
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Creating Prefeitura');
      return false;
    }
  }, [fetchPrefeituras, toast]);

  const deletePrefeitura = useCallback(async (prefeituraId: string): Promise<boolean> => {
    try {
      // Soft delete: Inativar usuários vinculados
      const { error: usersError } = await supabase
        .from('usuarios_acesso')
        .update({ status: 'inativo' })
        .eq('prefeitura_id', prefeituraId);

      if (usersError) throw usersError;

      // Soft delete: Inativar a prefeitura
      const { error } = await supabase
        .from('prefeituras')
        .update({ status: 'inativa' })
        .eq('id', prefeituraId);

      if (error) throw error;

      fetchPrefeituras();
      toast({
        title: "Prefeitura inativada",
        description: "A prefeitura e seus usuários foram inativados com sucesso."
      });
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Inactivating Prefeitura');
      return false;
    }
  }, [fetchPrefeituras, toast]);

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
        createPrefeitura,
        deletePrefeitura,
        getAllUsers,
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
