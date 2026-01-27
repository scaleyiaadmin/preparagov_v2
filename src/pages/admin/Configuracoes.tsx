
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Globe, Bell, database, Save } from 'lucide-react';

const Configuracoes = () => {
    return (
        <div className="space-y-6 text-slate-900">
            <div>
                <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
                <p className="text-slate-500 mt-2">Ajustes globais do PreparaGov e controle de instâncias.</p>
            </div>

            <Tabs defaultValue="geral" className="w-full">
                <TabsList className="bg-slate-100 p-1 gap-2">
                    <TabsTrigger value="geral" className="gap-2"><Globe size={16} /> Geral</TabsTrigger>
                    <TabsTrigger value="seguranca" className="gap-2"><Shield size={16} /> Segurança</TabsTrigger>
                    <TabsTrigger value="banco" className="gap-2"><database size={16} /> Banco de Dados</TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="mt-6 space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Identidade do Sistema</CardTitle>
                            <CardDescription>Configure o nome e logos globais da plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sys-name">Nome da Plataforma</Label>
                                <Input id="sys-name" defaultValue="PreparaGov" />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div>
                                    <p className="font-medium">Manutenção Global</p>
                                    <p className="text-sm text-slate-500">Bloqueia o acesso de todos os usuários às prefeituras.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="seguranca" className="mt-6 space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Políticas de Acesso</CardTitle>
                            <CardDescription>Defina regras rígidas para administradores de prefeituras.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Autenticação de Dois Fatores (2FA) Obrigatória</p>
                                    <p className="text-sm text-slate-500">Exigir 2FA para todos os administradores municipais.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Duração da Sessão</p>
                                    <p className="text-sm text-slate-500">Tempo máximo de inatividade antes de deslogar (minutos).</p>
                                </div>
                                <Input type="number" className="w-24" defaultValue="60" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="banco" className="mt-6 space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Status da Conexão Supabase</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center justify-between text-green-800">
                                <div className="flex items-center gap-2 font-medium">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    Conexão Ativa
                                </div>
                                <span className="text-xs font-mono">ID: lqxwptqtpfrnchmoxmty</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-slate-500 italic">As credenciais reais estão protegidas via variávies de ambiente (.env).</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end">
                <Button className="gap-2 bg-primary hover:bg-primary/90 min-w-[150px]">
                    <Save size={18} /> Salvar Alterações
                </Button>
            </div>
        </div>
    );
};

export default Configuracoes;
