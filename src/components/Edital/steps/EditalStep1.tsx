
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { DbTermoReferencia } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface EditalStep1Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
  selectedTR: DbTermoReferencia;
}

const EditalStep1 = ({ data, onUpdate, selectedTR }: EditalStep1Props) => {
  const { toast } = useToast();

  const handleAIGenerate = (field: string) => {
    toast({
      title: "IA Ativada",
      description: "Gerando conteúdo com base no TR e dados do sistema...",
    });

    // Simulação de geração por IA
    setTimeout(() => {
      if (field === 'objetoLicitacao') {
        const aiContent = `${selectedTR.objeto} - conforme especificações técnicas detalhadas no Termo de Referência ${selectedTR.numero_tr}, visando atender às necessidades da secretaria solicitante.`;
        onUpdate(field, aiContent);
      }

      toast({
        title: "Conteúdo Gerado",
        description: "Texto gerado com sucesso. Você pode editá-lo se necessário.",
      });
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <span className="text-blue-600 font-bold">1</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Identificação e Objeto</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Dados da Licitação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="numeroEdital">Número do Edital *</Label>
              <Input
                id="numeroEdital"
                value={data.numeroEdital}
                onChange={(e) => onUpdate('numeroEdital', e.target.value)}
                placeholder="Ex: ED-0001/2024"
              />
              <p className="text-xs text-gray-500 mt-1">Gerado automaticamente</p>
            </div>

            <div>
              <Label htmlFor="orgaoResponsavel">Órgão Responsável *</Label>
              <Input
                id="orgaoResponsavel"
                value={data.orgaoResponsavel}
                onChange={(e) => onUpdate('orgaoResponsavel', e.target.value)}
                placeholder="Nome da prefeitura/órgão"
              />
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>

            <div>
              <Label htmlFor="unidadeGestora">Unidade Gestora *</Label>
              <Input
                id="unidadeGestora"
                value={data.unidadeGestora}
                onChange={(e) => onUpdate('unidadeGestora', e.target.value)}
                placeholder="Secretaria responsável"
              />
            </div>

            <div>
              <Label htmlFor="modalidadeLicitacao">Modalidade da Licitação *</Label>
              <Select value={data.modalidadeLicitacao} onValueChange={(value) => onUpdate('modalidadeLicitacao', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pregao-eletronico">Pregão Eletrônico</SelectItem>
                  <SelectItem value="pregao-presencial">Pregão Presencial</SelectItem>
                  <SelectItem value="concorrencia">Concorrência</SelectItem>
                  <SelectItem value="tomada-precos">Tomada de Preços</SelectItem>
                  <SelectItem value="convite">Convite</SelectItem>
                  <SelectItem value="dispensa">Dispensa de Licitação</SelectItem>
                  <SelectItem value="inexigibilidade">Inexigibilidade</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Responsável Técnico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="responsavelTecnico">Nome do Responsável *</Label>
              <Input
                id="responsavelTecnico"
                value={data.responsavelTecnico}
                onChange={(e) => onUpdate('responsavelTecnico', e.target.value)}
                placeholder="Nome completo"
              />
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>

            <div>
              <Label htmlFor="cargoResponsavel">Cargo/Função</Label>
              <Input
                id="cargoResponsavel"
                value={data.cargoResponsavel}
                onChange={(e) => onUpdate('cargoResponsavel', e.target.value)}
                placeholder="Ex: Responsável Técnico, Secretário"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Objeto da Licitação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="objetoLicitacao">Descrição do Objeto *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAIGenerate('objetoLicitacao')}
                className="flex items-center space-x-1"
              >
                <Sparkles className="h-4 w-4" />
                <span>Gerar com IA</span>
              </Button>
            </div>
            <Textarea
              id="objetoLicitacao"
              value={data.objetoLicitacao}
              onChange={(e) => onUpdate('objetoLicitacao', e.target.value)}
              placeholder="Descreva detalhadamente o objeto da licitação..."
              rows={4}
            />
            <p className="text-xs text-gray-500">
              Preenchido automaticamente do TR. Você pode editar ou usar a IA para aprimorar.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Informações do TR Vinculado</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">TR:</span> {selectedTR.numero_tr}
          </div>
          <div>
            <span className="text-blue-700 font-medium">Data:</span> {new Date(selectedTR.created_at || '').toLocaleDateString('pt-BR')}
          </div>
          <div>
            <span className="text-blue-700 font-medium">Secretaria:</span> {selectedTR.secretaria_id || 'Não informada'}
          </div>
          <div>
            <span className="text-blue-700 font-medium">Valor Estimado:</span> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedTR.valor_estimado)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditalStep1;
