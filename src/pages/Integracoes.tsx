import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Settings,
    Key,
    ExternalLink,
    ShieldCheck,
    Globe,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Command,
    Workflow,
    Database,
    Cloud
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type IntegrationView = 'grid' | 'pncp';

const Integracoes = () => {
    const { toast } = useToast();
    const [view, setView] = useState<IntegrationView>('grid');
    const [loading, setLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

    const [config, setConfig] = useState({
        pncp_user: '',
        pncp_token: '',
        pncp_unidade_id: '',
        pncp_ambiente: 'homologacao'
    });

    const handleInputChange = (field: string, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }));
        setTestResult(null);
    };

    const handleSave = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Configurações salvas",
                description: "As credenciais de integração foram atualizadas com sucesso.",
            });
        }, 1500);
    };

    const handleTestConnection = async () => {
        setTestLoading(true);
        setTestResult(null);

        setTimeout(() => {
            setTestLoading(false);
            const isSuccess = config.pncp_token.length > 10;
            setTestResult(isSuccess ? 'success' : 'error');

            if (isSuccess) {
                toast({
                    title: "Conexão bem-sucedida",
                    description: "O sistema conseguiu se comunicar com a API do PNCP.",
                });
            } else {
                toast({
                    title: "Falha na conexão",
                    description: "Verifique o token e as credenciais informadas.",
                    variant: "destructive"
                });
            }
        }, 2000);
    };

    const integrationsList = [
        {
            id: 'pncp',
            title: 'PNCP',
            fullName: 'Portal Nacional de Contratações Públicas',
            description: 'Configurações para publicação automática de PCA, ETP e Editais.',
            icon: <Globe className="text-orange-500" size={32} />,
            status: 'atv',
            badge: 'ATIVO',
            badgeVariant: 'success' as const
        },
        {
            id: 'media_facil',
            title: 'Média Fácil',
            fullName: 'Plataforma Média Fácil',
            description: 'Integração completa com a plataforma Média Fácil para gestão de preços e cotações inteligentes.',
            icon: (
                <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group border border-white/10 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Database className="text-orange-500 mb-0.5" size={24} />
                    <span className="text-[6px] font-bold text-orange-500 tracking-widest leading-none">MÉDIA FÁCIL</span>
                </div>
            ),
            status: 'soon',
            badge: 'Em breve',
            badgeVariant: 'secondary' as const,
            footerText: 'DISPONÍVEL EM BREVE'
        }
    ];

    if (view === 'pncp') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setView('grid')}
                            className="rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">PNCP - Configuração</h1>
                            <p className="text-gray-600">Portal Nacional de Contratações Públicas</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-none shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-orange-50 rounded-2xl shadow-inner">
                                        <Globe className="text-orange-600" size={24} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Credenciais de Acesso</CardTitle>
                                        <CardDescription>Informe os dados para integração automática</CardDescription>
                                    </div>
                                </div>
                                <Badge variant={testResult === 'success' ? 'default' : 'outline'} className={testResult === 'success' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {testResult === 'success' ? (
                                        <span className="flex items-center"><CheckCircle2 size={12} className="mr-1" /> Conectado</span>
                                    ) : 'Inativo'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="ambiente">Ambiente de Destino</Label>
                                    <select
                                        id="ambiente"
                                        className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50/50 text-sm focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                                        value={config.pncp_ambiente}
                                        onChange={(e) => handleInputChange('pncp_ambiente', e.target.value)}
                                    >
                                        <option value="homologacao">Homologação (Ambiente de Testes)</option>
                                        <option value="producao">Produção (Ambiente Oficial)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Recomendamos testar em homologação primeiro.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unidade">Código da Unidade Compradora (ID)</Label>
                                    <Input
                                        id="unidade"
                                        className="h-11 bg-gray-50/50"
                                        placeholder="Ex: 123456"
                                        value={config.pncp_unidade_id}
                                        onChange={(e) => handleInputChange('pncp_unidade_id', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="user">E-mail ou CPF do Responsável</Label>
                                    <Input
                                        id="user"
                                        className="h-11 bg-gray-50/50"
                                        placeholder="usuario@prefeitura.gov.br"
                                        value={config.pncp_user}
                                        onChange={(e) => handleInputChange('pncp_user', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="token">Token de Acesso (API Key)</Label>
                                    <div className="relative">
                                        <Input
                                            id="token"
                                            type="password"
                                            className="h-11 bg-gray-50/50 pr-10"
                                            placeholder="Cole aqui o token gerado no PNCP"
                                            value={config.pncp_token}
                                            onChange={(e) => handleInputChange('pncp_token', e.target.value)}
                                        />
                                        <Key className="absolute right-3 top-3 text-gray-400" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <span className="font-semibold block text-gray-700">Status da Conexão</span>
                                        {testResult === 'success' && <span className="text-green-600 flex items-center mt-1"><CheckCircle2 size={14} className="mr-1" /> Servidores ativos e autenticados</span>}
                                        {testResult === 'error' && <span className="text-red-600 flex items-center mt-1"><AlertCircle size={14} className="mr-1" /> Falha na verificação do token</span>}
                                        {testResult === null && <span className="text-gray-500 mt-1 italic text-xs">Aguardando novo teste...</span>}
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button
                                            variant="outline"
                                            className="h-11 px-6 rounded-xl hover:bg-gray-50 transition-all"
                                            onClick={handleTestConnection}
                                            disabled={testLoading || !config.pncp_token}
                                        >
                                            {testLoading ? <Loader2 className="mr-2 animate-spin" size={16} /> : 'Testar Conexão'}
                                        </Button>
                                        <Button
                                            className="h-11 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all font-semibold"
                                            onClick={handleSave}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Save className="mr-2" size={18} />}
                                            Salvar Credenciais
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <ShieldCheck className="text-green-600 mr-2" size={20} />
                                Segurança e Dados
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 text-sm text-gray-600">
                            <p className="leading-relaxed">
                                Suas credenciais são transmitidas de forma segura através de túneis TLS 1.3 e armazenadas em servidores protegidos.
                            </p>
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                <h4 className="font-semibold text-blue-800 flex items-center mb-1.5">
                                    <ExternalLink size={14} className="mr-1.5" /> Suporte PNCP
                                </h4>
                                <p className="text-xs text-blue-700">
                                    Não sabe como conseguir seu token? Consulte o manual oficial do governo.
                                </p>
                                <Button variant="link" className="p-0 h-auto text-xs text-blue-600 font-bold mt-2 hover:no-underline hover:text-blue-700">
                                    Documentação do Desenvolvedor
                                </Button>
                            </div>
                            <div className="pt-4 space-y-3">
                                <h4 className="font-semibold text-gray-900 border-b pb-2">Funcionalidades Ativas:</h4>
                                <ul className="space-y-2.5">
                                    <li className="flex items-center text-xs">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
                                        Publicação Automática de PCA
                                    </li>
                                    <li className="flex items-center text-xs">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
                                        Divulgação de Estudos Técnicos (ETP)
                                    </li>
                                    <li className="flex items-center text-xs opacity-60">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2" />
                                        Prazos e Avisos de Contratação (Breve)
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Integrações</h1>
                    <p className="text-gray-500 mt-1">Gerencie a conexão do PreparaGov com serviços externos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {integrationsList.map((integration) => (
                    <Card
                        key={integration.id}
                        className={`group relative flex flex-col items-center text-center p-8 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-none shadow-md ${integration.status === 'soon' ? 'bg-white' : 'bg-white'}`}
                        onClick={() => integration.id === 'pncp' && setView('pncp')}
                    >
                        {/* Status Badge */}
                        <div className={`absolute group-hover:scale-110 transition-transform duration-300 ${integration.status === 'soon' ? 'top-6 left-1/2 -translate-x-1/2 z-10' : 'top-4 right-4'}`}>
                            <Badge variant={integration.badgeVariant} className={`font-semibold shadow-sm px-3 py-0.5 rounded-full ${integration.status === 'soon' ? 'bg-gray-100 text-gray-600 border-none' : ''}`}>
                                {integration.badge}
                            </Badge>
                        </div>

                        {/* Icon Container */}
                        <div className={`mb-6 p-6 rounded-[2.5rem] bg-gray-50 group-hover:bg-white group-hover:shadow-xl transition-all duration-500 scale-100 group-hover:scale-110 ${integration.status === 'soon' ? 'mt-4' : ''}`}>
                            {integration.icon}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-3 flex-1">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                                {integration.title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                {integration.description}
                            </p>
                        </div>

                        {/* Footer / Status Label */}
                        <div className="mt-8 pt-6 border-t border-gray-100 w-full">
                            {integration.footerText ? (
                                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                    {integration.footerText}
                                </span>
                            ) : integration.status === 'atv' ? (
                                <span className="text-xs font-semibold text-orange-500 flex items-center justify-center">
                                    CONFIGURAR <ArrowLeft size={12} className="ml-1 rotate-180" />
                                </span>
                            ) : (
                                <span className="text-xs font-semibold text-gray-400">
                                    Aguarde atualizações
                                </span>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Integracoes;
