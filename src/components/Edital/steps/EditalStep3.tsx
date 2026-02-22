
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles } from 'lucide-react';
import { DbTermoReferencia } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface EditalStep3Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
  selectedTR: DbTermoReferencia;
}

const EditalStep3 = ({ data, onUpdate, selectedTR }: EditalStep3Props) => {
  const { toast } = useToast();

  const handleAIGenerate = (field: string) => {
    toast({
      title: "IA Ativada",
      description: "Gerando conteúdo com base no TR e dados do sistema...",
    });

    setTimeout(() => {
      let aiContent = '';

      switch (field) {
        case 'justificativaConsorcios':
          aiContent = `A não participação de consórcios se fundamenta na natureza e complexidade do objeto, que não exige conjugação de especialidades ou capacidades técnicas distintas, podendo ser executado por empresas individualmente, conforme art. 35 da Lei 14.133/2021.`;
          break;
        case 'justificativaVistoria':
          aiContent = `A vistoria é facultativa, considerando que as especificações técnicas estão suficientemente detalhadas no Termo de Referência, permitindo aos licitantes formularem suas propostas com base nas informações disponibilizadas.`;
          break;
        case 'criteriosDesempate':
          aiContent = `Em caso de empate, será aplicado o critério de desempate previsto no art. 60 da Lei 14.133/2021, com preferência para bens e serviços produzidos no País, seguindo-se os demais critérios legais estabelecidos.`;
          break;
      }

      onUpdate(field, aiContent);

      toast({
        title: "Conteúdo Gerado",
        description: "Texto gerado com sucesso. Você pode editá-lo se necessário.",
      });
    }, 2000);
  };

  const documentosHabilitacao = [
    'Habilitação Jurídica - Pessoa Física',
    'Habilitação Jurídica - Pessoa Jurídica',
    'Regularidade Fiscal Federal',
    'Regularidade com FGTS',
    'Regularidade Trabalhista',
    'Qualificação Econômico-Financeira',
    'Qualificação Técnica',
    'Declaração de Cumprimento de Requisitos'
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <span className="text-blue-600 font-bold">3</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Condições de Participação e Habilitação</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Participação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="permiteMEEPP"
                  checked={data.permiteMEEPP}
                  onCheckedChange={(checked) => onUpdate('permiteMEEPP', checked)}
                />
                <Label htmlFor="permiteMEEPP">Tratamento Diferenciado para ME/EPP</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="permiteConsorcios"
                  checked={data.permiteConsorcios}
                  onCheckedChange={(checked) => onUpdate('permiteConsorcios', checked)}
                />
                <Label htmlFor="permiteConsorcios">Participação de Consórcios</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="permiteCooperativas"
                  checked={data.permiteCooperativas}
                  onCheckedChange={(checked) => onUpdate('permiteCooperativas', checked)}
                />
                <Label htmlFor="permiteCooperativas">Participação de Cooperativas</Label>
              </div>
            </div>
            <p className="text-xs text-gray-500">Preenchido automaticamente do TR</p>

            {!data.permiteConsorcios && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="justificativaConsorcios">Justificativa (não consórcio)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAIGenerate('justificativaConsorcios')}
                    className="flex items-center space-x-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Gerar com IA</span>
                  </Button>
                </div>
                <Textarea
                  id="justificativaConsorcios"
                  value={data.justificativaConsorcios}
                  onChange={(e) => onUpdate('justificativaConsorcios', e.target.value)}
                  placeholder="Justifique por que não permite consórcios..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Vistoria Técnica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vistoriaTecnica">Tipo de Vistoria *</Label>
              <Select value={data.vistoriaTecnica} onValueChange={(value) => onUpdate('vistoriaTecnica', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="obrigatoria">Obrigatória</SelectItem>
                  <SelectItem value="facultativa">Facultativa</SelectItem>
                  <SelectItem value="nao-aplicavel">Não Aplicável</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>

            {data.vistoriaTecnica !== 'nao-aplicavel' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="justificativaVistoria">Justificativa da Vistoria</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAIGenerate('justificativaVistoria')}
                    className="flex items-center space-x-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Gerar com IA</span>
                  </Button>
                </div>
                <Textarea
                  id="justificativaVistoria"
                  value={data.justificativaVistoria}
                  onChange={(e) => onUpdate('justificativaVistoria', e.target.value)}
                  placeholder="Justifique a necessidade da vistoria..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Critérios de Desempate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="criteriosDesempate">Critérios de Desempate</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAIGenerate('criteriosDesempate')}
              className="flex items-center space-x-1"
            >
              <Sparkles className="h-4 w-4" />
              <span>Gerar com IA</span>
            </Button>
          </div>
          <Textarea
            id="criteriosDesempate"
            value={data.criteriosDesempate}
            onChange={(e) => onUpdate('criteriosDesempate', e.target.value)}
            placeholder="Defina os critérios de desempate conforme Lei 14.133/2021..."
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Documentação Exigida</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Documentos de habilitação conforme Lei 14.133/2021 (preenchido automaticamente do TR):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {documentosHabilitacao.map((doc, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`doc-${index}`}
                  checked={true}
                  disabled
                />
                <Label htmlFor={`doc-${index}`} className="text-sm">
                  {doc}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Lista completa preenchida automaticamente do TR
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditalStep3;
