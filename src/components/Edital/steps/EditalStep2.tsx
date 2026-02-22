
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Sparkles } from 'lucide-react';
import { DbTermoReferencia } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface EditalStep2Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
  selectedTR: DbTermoReferencia;
}

const EditalStep2 = ({ data, onUpdate, selectedTR }: EditalStep2Props) => {
  const { toast } = useToast();

  const handleAIGenerate = (field: string) => {
    toast({
      title: "IA Ativada",
      description: "Gerando conteúdo com base no TR e dados do sistema...",
    });

    setTimeout(() => {
      let aiContent = '';

      switch (field) {
        case 'justificativaCriterio':
          aiContent = `O critério de menor preço é adequado para este tipo de contratação, considerando que o objeto possui especificações técnicas padronizadas e bem definidas no Termo de Referência, não havendo necessidade de avaliação técnica diferenciada entre as propostas.`;
          break;
        case 'justificativaRegistroPrecos':
          aiContent = `A adoção do Sistema de Registro de Preços se justifica pela necessidade de aquisições de forma parcelada, conforme demanda da Administração, durante o período de vigência da Ata de Registro de Preços, proporcionando economia de recursos públicos e maior eficiência na gestão dos contratos.`;
          break;
      }

      onUpdate(field, aiContent);

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
          <span className="text-blue-600 font-bold">2</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Critérios e Julgamento</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Critérios de Julgamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="criterioJulgamento">Critério de Julgamento *</Label>
              <Select value={data.criterioJulgamento} onValueChange={(value) => onUpdate('criterioJulgamento', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o critério" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="menor-preco">Menor Preço</SelectItem>
                  <SelectItem value="melhor-tecnica">Melhor Técnica</SelectItem>
                  <SelectItem value="tecnica-preco">Técnica e Preço</SelectItem>
                  <SelectItem value="maior-lance">Maior Lance ou Oferta</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="justificativaCriterio">Justificativa do Critério</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate('justificativaCriterio')}
                  className="flex items-center space-x-1"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Gerar com IA</span>
                </Button>
              </div>
              <Textarea
                id="justificativaCriterio"
                value={data.justificativaCriterio}
                onChange={(e) => onUpdate('justificativaCriterio', e.target.value)}
                placeholder="Justifique a escolha do critério de julgamento..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Execução e Entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tipoExecucao">Tipo de Execução *</Label>
              <Select value={data.tipoExecucao} onValueChange={(value) => onUpdate('tipoExecucao', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direta">Execução Direta</SelectItem>
                  <SelectItem value="indireta">Execução Indireta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipoEntrega">Tipo de Entrega</Label>
              <Select value={data.tipoEntrega} onValueChange={(value) => onUpdate('tipoEntrega', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unica">Entrega Única</SelectItem>
                  <SelectItem value="parcelada">Entrega Parcelada</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>

            <div>
              <Label htmlFor="formaFornecimento">Forma de Fornecimento</Label>
              <Select value={data.formaFornecimento} onValueChange={(value) => onUpdate('formaFornecimento', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continuo">Fornecimento Contínuo</SelectItem>
                  <SelectItem value="sob-demanda">Sob Demanda</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Sistema de Registro de Preços</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="registroPrecos"
              checked={data.registroPrecos}
              onCheckedChange={(checked) => onUpdate('registroPrecos', checked)}
            />
            <Label htmlFor="registroPrecos">Adotar Sistema de Registro de Preços (SRP)</Label>
          </div>
          <p className="text-xs text-gray-500">Preenchido automaticamente do TR</p>

          {data.registroPrecos && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="justificativaRegistroPrecos">Justificativa para SRP *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate('justificativaRegistroPrecos')}
                  className="flex items-center space-x-1"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Gerar com IA</span>
                </Button>
              </div>
              <Textarea
                id="justificativaRegistroPrecos"
                value={data.justificativaRegistroPrecos}
                onChange={(e) => onUpdate('justificativaRegistroPrecos', e.target.value)}
                placeholder="Justifique a adoção do Sistema de Registro de Preços..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Informações Automáticas do TR</h4>
        <div className="text-sm text-green-800">
          <p>• Critério de julgamento baseado na natureza do objeto definida no TR</p>
          <p>• Formas de entrega e fornecimento conforme especificado no planejamento</p>
          <p>• Sistema de Registro de Preços conforme análise prévia da demanda</p>
        </div>
      </div>
    </div>
  );
};

export default EditalStep2;
