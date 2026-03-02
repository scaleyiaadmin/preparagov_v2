import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagement from '@/components/Perfil/UserManagement';
import SecretariaManagement from '@/components/Perfil/SecretariaManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Building, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';

const GerenciarSub = () => {
    const { isSuperAdmin, isAdmin } = useAuth();

    if (!isAdmin() && !isSuperAdmin()) {
        return (
            <div className="flex items-center justify-center h-96">
                <Card className="p-8 text-center border-red-100 bg-red-50">
                    <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-semibold mb-2 text-red-700">Acesso Restrito</h2>
                    <p className="text-red-600/80">
                        Você não tem permissão para acessar o gerenciamento de subordinados.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gerenciar Sub</h1>
                    <p className="text-gray-500 mt-1">Gerencie os usuários, secretarias e setores da sua organização</p>
                </div>
            </div>

            <Tabs defaultValue="usuarios" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100/50 p-1 rounded-xl">
                    <TabsTrigger
                        value="usuarios"
                        className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                        <Users size={16} />
                        <span>Gerenciar Usuários</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="secretarias"
                        className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                        <Building size={16} />
                        <span>Secretarias e Setores</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="usuarios" className="m-0 border-none p-0 outline-none">
                        <UserManagement />
                    </TabsContent>

                    <TabsContent value="secretarias" className="m-0 border-none p-0 outline-none">
                        <SecretariaManagement />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default GerenciarSub;
