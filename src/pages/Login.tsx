
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Mail, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import preparagovLogo from '@/assets/preparagov-logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro no servidor",
                description: "Não foi possível realizar o login. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-6">
                        <img src={preparagovLogo} alt="PreparaGov" className="h-12 w-auto" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                        Bem-vindo de volta
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Insira suas credenciais para acessar sua conta
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seuemail@exemplo.com"
                                    className="pl-10 h-11 border-slate-200 focus:border-orange-500 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Button variant="link" className="px-0 font-normal text-xs text-orange-600 hover:text-orange-700">
                                    Esqueceu a senha?
                                </Button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 border-slate-200 focus:border-orange-500 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold bg-orange-600 hover:bg-orange-700 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Autenticando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <LogIn size={18} />
                                    Entrar
                                </span>
                            )}
                        </Button>
                        <p className="text-center text-xs text-slate-500">
                            Acesso restrito a servidores autorizados.
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login;
