import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { secretariaService } from '@/services/secretariaService';
import { DbSecretaria } from '@/types/database';
import { Plus, Edit, Trash2, Building, Loader2 } from 'lucide-react';

const SecretariaManagement = () => {
  const { toast } = useToast();
  const { getCurrentUser, refreshSecretarias } = useAuth();
  const currentUser = getCurrentUser();

  const [secretarias, setSecretarias] = useState<DbSecretaria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecretariaModal, setShowSecretariaModal] = useState(false);
  const [editingSecretaria, setEditingSecretaria] = useState<DbSecretaria | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    responsavel: '',
    cargo: '',
    email: '',
    telefone: ''
  });

  const prefeituraId = currentUser?.prefeituraId;

  // Carrega secretarias do Supabase (banco real)
  const loadSecretarias = useCallback(async () => {
    if (!prefeituraId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await secretariaService.fetchSecretarias(prefeituraId);
      setSecretarias(data as DbSecretaria[]);
    } catch (error) {
      console.error('Erro ao carregar secretarias:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os setores. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [prefeituraId, toast]);

  useEffect(() => {
    loadSecretarias();
  }, [loadSecretarias]);

  const resetForm = () => {
    setFormData({ nome: '', responsavel: '', cargo: '', email: '', telefone: '' });
    setEditingSecretaria(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowSecretariaModal(true);
  };

  const handleOpenEdit = (secretaria: DbSecretaria) => {
    setEditingSecretaria(secretaria);
    setFormData({
      nome: secretaria.nome || '',
      responsavel: secretaria.responsavel || '',
      cargo: secretaria.cargo || '',
      email: secretaria.email || '',
      telefone: secretaria.telefone || ''
    });
    setShowSecretariaModal(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.responsavel || !formData.cargo || !formData.email) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    if (!prefeituraId) {
      toast({
        title: 'Erro',
        description: 'Usuário sem prefeitura vinculada.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingSecretaria) {
        // Atualiza no Supabase
        await secretariaService.updateSecretaria(editingSecretaria.id, {
          nome: formData.nome,
          responsavel: formData.responsavel,
          cargo: formData.cargo,
          email: formData.email,
          telefone: formData.telefone
        });
        toast({ title: 'Setor Atualizado', description: 'Dados atualizados com sucesso.' });
      } else {
        // Cria no Supabase
        await secretariaService.createSecretaria({
          nome: formData.nome,
          responsavel: formData.responsavel,
          cargo: formData.cargo,
          email: formData.email,
          telefone: formData.telefone,
          prefeitura_id: prefeituraId,
          status: 'ativa'
        });
        toast({ title: 'Setor Cadastrado', description: 'Novo setor criado com sucesso.' });
      }

      // Recarrega a lista atualizada do banco e sincroniza o contexto global
      await loadSecretarias();
      await refreshSecretarias();
      setShowSecretariaModal(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar secretaria:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o setor. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Remove do Supabase
      await secretariaService.deleteSecretaria(id);
      toast({ title: 'Setor Removido', description: 'Setor excluído com sucesso.' });
      // Recarrega a lista atualizada do banco e sincroniza o contexto global
      await loadSecretarias();
      await refreshSecretarias();
    } catch (error) {
      console.error('Erro ao excluir secretaria:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o setor. Verifique se há usuários vinculados.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Secretarias e Setores</h2>
          <p className="text-sm text-muted-foreground">Gerencie os setores e seus responsáveis</p>
        </div>
        <Dialog open={showSecretariaModal} onOpenChange={(open) => {
          setShowSecretariaModal(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus size={16} className="mr-2" />
              Nova Secretaria/Setor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSecretaria ? 'Editar Setor' : 'Nova Secretaria/Setor'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sec-nome">Nome da Secretaria/Setor *</Label>
                <Input
                  id="sec-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Setor de Licitações"
                />
              </div>
              <div>
                <Label htmlFor="sec-responsavel">Responsável *</Label>
                <Input
                  id="sec-responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                  placeholder="Nome completo do responsável"
                />
              </div>
              <div>
                <Label htmlFor="sec-cargo">Cargo *</Label>
                <Input
                  id="sec-cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                  placeholder="Ex: Pregoeiro"
                />
              </div>
              <div>
                <Label htmlFor="sec-email">E-mail *</Label>
                <Input
                  id="sec-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@gov.br"
                />
              </div>
              <div>
                <Label htmlFor="sec-telefone">Telefone</Label>
                <Input
                  id="sec-telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 3333-4444"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => { setShowSecretariaModal(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                  {editingSecretaria ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 size={24} className="animate-spin mr-2" />
              Carregando setores...
            </div>
          ) : secretarias.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhum setor cadastrado ainda.</p>
              <Button variant="link" onClick={handleOpenCreate}>
                Cadastrar primeiro setor
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Secretaria/Setor</TableHead>
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
                          onClick={() => handleOpenEdit(secretaria)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(secretaria.id)}
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Os setores cadastrados ficam disponíveis para seleção no cadastro de usuários</p>
          <p>• Os dados do setor são utilizados automaticamente em DFDs, ETPs, TRs e demais documentos</p>
          <p>• Ao editar um setor, as alterações refletem em todos os documentos futuros</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecretariaManagement;