
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Building, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
    const { getAllPrefeituras } = useAuth();
    const prefeituras = getAllPrefeituras();

    // Stats
    const activePrefeituras = prefeituras.filter(p => p.status === 'ativa').length;
    const totalUsers = prefeituras.reduce((acc, p) => acc + (p.id ? 2 : 0), 0); // Mock data logic

    const stats = [
        { label: 'Prefeituras', value: prefeituras.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Prefeituras Ativas', value: activePrefeituras, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total de Usuários', value: 124, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Secretarias', value: 48, icon: Building, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Administrativo</h1>
                <p className="text-slate-500 mt-2">Visão geral do gerenciamento de instâncias do PreparaGov.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={stat.color} size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                                <TrendingUp size={14} className="mr-1" />
                                <span>+12% desde o mês passado</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Atividade Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Nova prefeitura cadastrada: Caratinga - MG</p>
                                        <p className="text-xs text-slate-500 mt-1">Há 2 horas atrás • Por Admin Master</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Alertas de Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100 mb-4">
                            <AlertCircle className="text-amber-600 shrink-0" size={20} />
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Assinatura Expirando</p>
                                <p className="text-xs text-amber-700 mt-1">A prefeitura de Salvador possui faturas pendentes há 5 dias.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <Activity className="text-blue-600 shrink-0" size={20} />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">Atualização de Sistema</p>
                                <p className="text-xs text-blue-700 mt-1">Versão 2.4.0 agendada para implantação em todos os nodos hoje às 23:00.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
