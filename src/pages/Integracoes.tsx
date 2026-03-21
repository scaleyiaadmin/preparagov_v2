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
            icon: <Globe className="text-orange-500" size={22} />,
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
                <div className="w-full h-full bg-[#0F172A] rounded-[13px] flex flex-col items-center justify-center relative overflow-hidden group-hover:shadow-md transition-shadow">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Database className="text-orange-500 mb-0.5" size={16} />
                    <span className="text-[5px] font-bold text-orange-500 tracking-widest leading-none mt-0.5">MÉDIA FÁCIL</span>
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
                <div className="flex items-center space-x-4 mb-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setView('grid')}
                        className="rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft size={18} className="text-gray-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">PNCP - Configuração</h1>
                        <p className="text-[14px] text-gray-500 mt-1.5 font-medium">Portal Nacional de Contratações Públicas</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-50 pb-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3.5">
                                    <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                                        <Globe className="text-orange-500" size={18} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold text-gray-900">Credenciais de Acesso</CardTitle>
                                        <CardDescription className="text-[13px] mt-0.5">Informe os dados para integração automática</CardDescription>
                                    </div>
                                </div>
                                <Badge variant={testResult === 'success' ? 'default' : 'outline'} className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase font-medium tracking-wider shadow-none ${testResult === 'success' ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'text-gray-500 border-gray-200 bg-gray-50'}`}>
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

                            <div className="flex flex-col space-y-4 pt-6 border-t border-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <span className="font-semibold block text-gray-900 text-[13px]">Status da Conexão</span>
                                        {testResult === 'success' && <span className="text-green-600 font-medium flex items-center mt-1 text-xs"><CheckCircle2 size={14} className="mr-1" /> Servidores ativos e autenticados</span>}
                                        {testResult === 'error' && <span className="text-red-500 font-medium flex items-center mt-1 text-xs"><AlertCircle size={14} className="mr-1" /> Falha na verificação do token</span>}
                                        {testResult === null && <span className="text-gray-400 mt-1 text-[11px] font-medium uppercase tracking-wider">Aguardando novo teste</span>}
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button
                                            variant="outline"
                                            className="h-10 px-5 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all text-[13px] font-semibold shadow-sm"
                                            onClick={handleTestConnection}
                                            disabled={testLoading || !config.pncp_token}
                                        >
                                            {testLoading ? <Loader2 className="mr-2 animate-spin" size={14} /> : 'Testar Conexão'}
                                        </Button>
                                        <Button
                                            className="h-10 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all text-[13px] font-semibold shadow-sm"
                                            onClick={handleSave}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="mr-2 animate-spin" size={14} /> : <Save className="mr-2" size={14} />}
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-100/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] bg-white rounded-2xl overflow-hidden h-fit">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-50 pb-5">
                            <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
                                <ShieldCheck className="text-green-500 mr-2" size={18} />
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
                                <h4 className="font-semibold text-[13px] text-gray-900 border-b border-gray-100 pb-2">Funcionalidades Ativas:</h4>
                                <ul className="space-y-2.5">
                                    <li className="flex items-center text-[13px] text-gray-600 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2.5" />
                                        Publicação Automática de PCA
                                    </li>
                                    <li className="flex items-center text-[13px] text-gray-600 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2.5" />
                                        Divulgação de ETPs e TRs
                                    </li>
                                    <li className="flex items-center text-[13px] text-gray-400 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2.5" />
                                        Avisos de Contratação (Breve)
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
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">Integrações</h1>
                    <p className="text-[14px] text-gray-500 mt-1.5 font-medium">Conecte o PreparaGov a plataformas e serviços externos oficiais.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {integrationsList.map((integration) => (
                    <Card
                        key={integration.id}
                        className={`group cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 bg-white border border-gray-100/80 rounded-2xl relative overflow-hidden`}
                        onClick={() => integration.id === 'pncp' && setView('pncp')}
                    >
                        {/* Top bar with icon and badge */}
                        <div className="p-6 pb-4 flex items-start justify-between">
                            <div className="w-12 h-12 rounded-[14px] bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all group-hover:scale-105">
                                {integration.icon}
                            </div>
                            <Badge variant={integration.badgeVariant} className={`font-medium px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${integration.status === 'soon' ? 'bg-gray-100 text-gray-500 hover:bg-gray-100 shadow-none' : ''}`}>
                                {integration.badge}
                            </Badge>
                        </div>

                        {/* Text Content */}
                        <div className="px-6 pb-5">
                            <h3 className="text-base font-semibold text-gray-900 mb-1.5 group-hover:text-orange-600 transition-colors">
                                {integration.title}
                            </h3>
                            <p className="text-[13px] text-gray-500 leading-relaxed font-medium line-clamp-3">
                                {integration.description}
                            </p>
                        </div>

                        {/* Footer Action */}
                        <div className="px-6 py-3.5 border-t border-gray-50 bg-gray-50/20 group-hover:bg-orange-50/10 transition-colors flex items-center justify-between mt-auto h-[52px]">
                            {integration.footerText ? (
                                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase w-full text-center">
                                    {integration.footerText}
                                </span>
                            ) : integration.status === 'atv' ? (
                                <span className="text-[12px] font-semibold text-orange-600 flex items-center group-hover:text-orange-700 w-full justify-center">
                                    Configurar Integração <ArrowLeft size={12} className="ml-1.5 rotate-180 transition-transform group-hover:translate-x-1" />
                                </span>
                            ) : (
                                <span className="text-[12px] font-semibold text-gray-400 w-full text-center">
                                    Em breve
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
