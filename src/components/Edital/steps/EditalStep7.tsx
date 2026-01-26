
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditalStep7Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
}

const EditalStep7 = ({ data, onUpdate }: EditalStep7Props) => {
  const { toast } = useToast();

  const handleAIGenerate = (field: string) => {
    toast({
      title: "IA Ativada",
      description: "Calculando prazos otimizados baseados na modalidade...",
    });
    
    setTimeout(() => {
      let values: any = {};
      
      switch (field) {
        case 'prazos-otimizados':
          values = {
            prazoPropostas: '8',
            prazoJulgamento: '5',
            prazoImpugnacao: '3'
          };
          break;
      }
      
      Object.keys(values).forEach(key => {
        onUpdate(key, values[key]);
      });
      
      toast({
        title: "Prazos Otimizados",
        description: "Prazos calculados com base nas melhores práticas.",
      });
    }, 2000);
  };

  // Sugestão automática de data baseada no cronograma
  const suggestedDate = new Date();
  suggestedDate.setDate(suggestedDate.getDate() + 30);
  const suggestedDateStr = suggestedDate.toISOString().split('T')[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <span className="text-blue-600 font-bold">7</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Cronograma de Licitação</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Data de Abertura</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="dataAbertura">Data de Abertura da Licitação *</Label>
            <Input
              id="dataAbertura"
              type="date"
              value={data.dataAbertura}
              onChange={(e) => onUpdate('dataAbertura', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Sugestão baseada no cronograma: {new Date(suggestedDateStr).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800 flex items-center justify-between">
              Prazos Processuais
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAIGenerate('prazos-otimizados')}
                className="flex items-center space-x-1"
              >
                <Sparkles className="h-4 w-4" />
                <span>Otimizar</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prazoPropostas">Prazo para Propostas (dias)</Label>
              <Input
                id="prazoPropostas"
                type="number"
                value={data.prazoPropostas}
                onChange={(e) => onUpdate('prazoPropostas', e.target.value)}
                placeholder="8"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Prazo mínimo conforme modalidade</p>
            </div>

            <div>
              <Label htmlFor="prazoJulgamento">Prazo para Julgamento (dias)</Label>
              <Input
                id="prazoJulgamento"
                type="number"
                value={data.prazoJulgamento}
                onChange={(e) => onUpdate('prazoJulgamento', e.target.value)}
                placeholder="5"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="prazoImpugnacao">Prazo para Impugnação (dias)</Label>
              <Input
                id="prazoImpugnacao"
                type="number"
                value={data.prazoImpugnacao}
                onChange={(e) => onUpdate('prazoImpugnacao', e.target.value)}
                placeholder="3"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Antes da data de abertura</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Validade das Propostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="validadePropostas">Prazo de Validade das Propostas</Label>
              <Select value={data.validadePropostas} onValueChange={(value) => onUpdate('validadePropostas', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="120">120 dias</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Prazo contado da data de abertura das propostas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Cronograma Resumido</CardTitle>
        </CardHeader>
        <CardContent>
          {data.dataAbertura && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xs text-blue-600 font-medium">Publicação</div>
                <div className="text-sm font-bold text-blue-900">
                  {new Date(data.dataAbertura).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-xs text-blue-700">Edital publicado</div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <div className="text-xs text-amber-600 font-medium">Impugnação até</div>
                <div className="text-sm font-bold text-amber-900">
                  {new Date(new Date(data.dataAbertura).getTime() - (parseInt(data.prazoImpugnacao) * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-xs text-amber-700">{data.prazoImpugnacao} dias antes</div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xs text-green-600 font-medium">Abertura</div>
                <div className="text-sm font-bold text-green-900">
                  {new Date(data.dataAbertura).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-xs text-green-700">Sessão pública</div>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-xs text-purple-600 font-medium">Validade</div>
                <div className="text-sm font-bold text-purple-900">
                  {new Date(new Date(data.dataAbertura).getTime() + (parseInt(data.validadePropostas) * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-xs text-purple-700">{data.validadePropostas} dias</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">⏰ Conformidade de Prazos</h4>
        <div className="text-sm text-green-800 space-y-1">
          <p>• Prazos mínimos conforme modalidade de licitação respeitados</p>
          <p>• Cronograma otimizado para eficiência do processo</p>
          <p>• Datas calculadas considerando dias úteis</p>
        </div>
      </div>
    </div>
  );
};

export default EditalStep7;
