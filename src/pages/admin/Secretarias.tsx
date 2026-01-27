
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Secretarias = () => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const [secretarias, setSecretarias] = useState([
        { id: '1', nome: 'Secretaria de Saúde', prefeitura: 'Caratinga - MG', responsavel: 'Dr. Ricardo Abreu', funcionarios: 45, status: 'ativa' },
        { id: '2', nome: 'Secretaria de Educação', prefeitura: 'Caratinga - MG', responsavel: 'Prof. Ana Xavier', funcionarios: 120, status: 'ativa' },
        { id: '3', nome: 'Secretaria de Meio Ambiente', prefeitura: 'Belo Horizonte - MG', responsavel: 'Eng. Luiza Paes', funcionarios: 12, status: 'inativa' },
    ]);

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
                <Button className="gap-2">
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
                            className="pl-10"
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
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                                    <Edit size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
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
        </div>
    );
};

export default Secretarias;
