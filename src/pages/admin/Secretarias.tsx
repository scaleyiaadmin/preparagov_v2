
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building, Edit, Trash2, Users, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Secretaria {
    id: string;
    nome: string;
    prefeitura: string;
    responsavel: string;
    funcionarios: number;
    status: 'ativa' | 'inativa';
}

const Secretarias = () => {
    const { toast } = useToast();
    const { getAllPrefeituras } = useAuth();
    const prefeiturasDisponiveis = getAllPrefeituras().filter(p => p.status === 'ativa');

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSecretaria, setEditingSecretaria] = useState<Secretaria | null>(null);

    const [secretarias, setSecretarias] = useState<Secretaria[]>([
        { id: '1', nome: 'Secretaria de Saúde', prefeitura: 'Caratinga - MG', responsavel: 'Dr. Ricardo Abreu', funcionarios: 45, status: 'ativa' },
        { id: '2', nome: 'Secretaria de Educação', prefeitura: 'Caratinga - MG', responsavel: 'Prof. Ana Xavier', funcionarios: 120, status: 'ativa' },
        { id: '3', nome: 'Secretaria de Meio Ambiente', prefeitura: 'Belo Horizonte - MG', responsavel: 'Eng. Luiza Paes', funcionarios: 12, status: 'inativa' },
    ]);

    const [formData, setFormData] = useState<Omit<Secretaria, 'id'>>({
        nome: '',
        prefeitura: '',
        responsavel: '',
        funcionarios: 0,
        status: 'ativa'
    });

    const handleOpenModal = (secretaria?: Secretaria) => {
        if (secretaria) {
            setEditingSecretaria(secretaria);
            setFormData({
                nome: secretaria.nome,
                prefeitura: secretaria.prefeitura,
                responsavel: secretaria.responsavel,
                funcionarios: secretaria.funcionarios,
                status: secretaria.status
            });
        } else {
            setEditingSecretaria(null);
            setFormData({
                nome: '',
                prefeitura: '',
                responsavel: '',
                funcionarios: 0,
                status: 'ativa'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.nome || !formData.prefeitura) {
            toast({
                title: "Erro ao salvar",
                description: "Preencha pelo menos o nome e selecione uma prefeitura.",
                variant: "destructive"
            });
            return;
        }

        if (editingSecretaria) {
            setSecretarias(secretarias.map(s =>
                s.id === editingSecretaria.id ? { ...formData, id: s.id } : s
            ));
            toast({ title: "Sucesso!", description: "Secretaria atualizada com sucesso." });
        } else {
            const newSecretaria = {
                ...formData,
                id: Math.random().toString(36).substr(2, 9)
            };
            setSecretarias([...secretarias, newSecretaria]);
            toast({ title: "Sucesso!", description: "Nova secretaria cadastrada." });
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        setSecretarias(secretarias.filter(s => s.id !== id));
        toast({ title: "Removida", description: "Secretaria removida do sistema.", variant: "destructive" });
    };

    const filtered = secretarias.filter(s =>
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.prefeitura.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestão de Secretarias</h1>
                    <p className="text-slate-500 mt-2">Gerencie as divisões administrativas de cada prefeitura.</p>
                </div>
                <Button className="gap-2" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    Nova Secretaria
                </Button>
            </div>

            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Buscar por nome ou prefeitura..."
                            className="pl-10 text-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="rounded-md border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Secretaria / Órgão</TableHead>
                                    <TableHead>Prefeitura</TableHead>
                                    <TableHead>Responsável</TableHead>
                                    <TableHead>Funcionários</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((s) => (
                                    <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                    <Building size={18} />
                                                </div>
                                                <span className="font-semibold text-slate-900">{s.nome}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{s.prefeitura}</TableCell>
                                        <TableCell className="text-slate-600">{s.responsavel}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Users size={16} />
                                                {s.funcionarios}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={s.status === 'ativa' ? 'default' : 'secondary'} className={s.status === 'ativa' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                                {s.status === 'ativa' ? 'Ativa' : 'Inativa'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                                    onClick={() => handleOpenModal(s)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                    onClick={() => handleDelete(s.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingSecretaria ? 'Editar Secretaria' : 'Nova Secretaria'}</DialogTitle>
                        <DialogDescription>
                            Preencha os dados abaixo para {editingSecretaria ? 'atualizar' : 'cadastrar'} a secretaria.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nome">Nome da Secretaria</Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prefeitura">Prefeitura</Label>
                            <Select
                                value={formData.prefeitura}
                                onValueChange={(value) => setFormData({ ...formData, prefeitura: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a prefeitura" />
                                </SelectTrigger>
                                <SelectContent>
                                    {prefeiturasDisponiveis.map(p => (
                                        <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="responsavel">Responsável</Label>
                                <Input
                                    id="responsavel"
                                    value={formData.responsavel}
                                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="funcionarios">Nº Funcionários</Label>
                                <Input
                                    id="funcionarios"
                                    type="number"
                                    value={formData.funcionarios}
                                    onChange={(e) => setFormData({ ...formData, funcionarios: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: 'ativa' | 'inativa') => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativa">Ativa</SelectItem>
                                    <SelectItem value="inativa">Inativa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} className="gap-2">
                            <Save size={18} />
                            {editingSecretaria ? 'Salvar Alterações' : 'Cadastrar Secretaria'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Secretarias;
