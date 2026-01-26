import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Building } from 'lucide-react';

interface Secretaria {
  id: string;
  nome: string;
  responsavel: string;
  cargo: string;
  email: string;
  telefone?: string;
}

const SecretariaManagement = () => {
  const { toast } = useToast();
  const [showSecretariaModal, setShowSecretariaModal] = useState(false);
  const [editingSecretaria, setEditingSecretaria] = useState<Secretaria | null>(null);

  const [secretarias, setSecretarias] = useState<Secretaria[]>([
    {
      id: '1',
      nome: 'Secretaria de Administração',
      responsavel: 'Ana Costa Silva',
      cargo: 'Secretária de Administração',
      email: 'ana.costa@gov.br',
      telefone: '(11) 3333-4444'
    },
    {
      id: '2',
      nome: 'Secretaria de Finanças',
      responsavel: 'Carlos Lima Santos',
      cargo: 'Secretário de Finanças',
      email: 'carlos.lima@gov.br',
      telefone: '(11) 3333-5555'
    },
    {
      id: '3',
      nome: 'Secretaria de Obras',
      responsavel: 'Roberto Almeida',
      cargo: 'Secretário de Obras',
      email: 'roberto.almeida@gov.br',
      telefone: '(11) 3333-6666'
    }
  ]);

  const [newSecretaria, setNewSecretaria] = useState({
    nome: '',
    responsavel: '',
    cargo: '',
    email: '',
    telefone: ''
  });

  const handleSaveSecretaria = () => {
    if (!newSecretaria.nome || !newSecretaria.responsavel || !newSecretaria.cargo || !newSecretaria.email) {
      toast({
        title: "Campos Obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (editingSecretaria) {
      setSecretarias(prev => prev.map(secretaria => 
        secretaria.id === editingSecretaria.id 
          ? { ...editingSecretaria, ...newSecretaria, id: editingSecretaria.id }
          : secretaria
      ));
      toast({
        title: "Secretaria Atualizada",
        description: "Dados da secretaria foram atualizados com sucesso."
      });
    } else {
      const newSecretariaData: Secretaria = {
        id: Date.now().toString(),
        ...newSecretaria
      };
      setSecretarias(prev => [...prev, newSecretariaData]);
      toast({
        title: "Secretaria Cadastrada",
        description: "Nova secretaria foi cadastrada com sucesso."
      });
    }

    setShowSecretariaModal(false);
    setEditingSecretaria(null);
    setNewSecretaria({
      nome: '',
      responsavel: '',
      cargo: '',
      email: '',
      telefone: ''
    });
  };

  const handleEditSecretaria = (secretaria: Secretaria) => {
    setEditingSecretaria(secretaria);
    setNewSecretaria({
      nome: secretaria.nome,
      responsavel: secretaria.responsavel,
      cargo: secretaria.cargo,
      email: secretaria.email,
      telefone: secretaria.telefone || ''
    });
    setShowSecretariaModal(true);
  };

  const handleDeleteSecretaria = (secretariaId: string) => {
    setSecretarias(prev => prev.filter(secretaria => secretaria.id !== secretariaId));
    toast({
      title: "Secretaria Removida",
      description: "Secretaria foi removida com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Secretarias e Responsáveis</h2>
          <p className="text-sm text-muted-foreground">Gerencie as secretarias e seus responsáveis</p>
        </div>
        <Dialog open={showSecretariaModal} onOpenChange={setShowSecretariaModal}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSecretaria(null);
              setNewSecretaria({
                nome: '',
                responsavel: '',
                cargo: '',
                email: '',
                telefone: ''
              });
            }}>
              <Plus size={16} className="mr-2" />
              Nova Secretaria/Setor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSecretaria ? 'Editar Secretaria' : 'Nova Secretaria/Setor'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Secretaria/Setor *</Label>
                <Input
                  id="nome"
                  value={newSecretaria.nome}
                  onChange={(e) => setNewSecretaria(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Secretaria de Administração"
                />
              </div>

              <div>
                <Label htmlFor="responsavel">Responsável *</Label>
                <Input
                  id="responsavel"
                  value={newSecretaria.responsavel}
                  onChange={(e) => setNewSecretaria(prev => ({ ...prev, responsavel: e.target.value }))}
                  placeholder="Nome completo do responsável"
                />
              </div>

              <div>
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  value={newSecretaria.cargo}
                  onChange={(e) => setNewSecretaria(prev => ({ ...prev, cargo: e.target.value }))}
                  placeholder="Ex: Secretário de Administração"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSecretaria.email}
                  onChange={(e) => setNewSecretaria(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@gov.br"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={newSecretaria.telefone}
                  onChange={(e) => setNewSecretaria(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 3333-4444"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowSecretariaModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveSecretaria}>
                  {editingSecretaria ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Secretaria</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secretarias.map((secretaria) => (
                <TableRow key={secretaria.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building size={16} className="text-muted-foreground" />
                      <span className="font-medium">{secretaria.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{secretaria.responsavel}</div>
                      <div className="text-sm text-muted-foreground">{secretaria.cargo}</div>
                    </div>
                  </TableCell>
                  <TableCell>{secretaria.cargo}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{secretaria.email}</div>
                      {secretaria.telefone && (
                        <div className="text-sm text-muted-foreground">{secretaria.telefone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSecretaria(secretaria)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSecretaria(secretaria.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• As secretarias cadastradas ficam disponíveis para seleção no cadastro de usuários</p>
          <p>• Os dados da secretaria são utilizados automaticamente em DFDs, ETPs, TRs e demais documentos</p>
          <p>• Ao editar uma secretaria, as alterações refletem em todos os documentos futuros</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecretariaManagement;