
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { DbTermoReferencia } from '@/types/database';

interface EditalStep5Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
  selectedTR: DbTermoReferencia;
}

const EditalStep5 = ({ data, onUpdate, selectedTR }: EditalStep5Props) => {
  const addGestor = () => {
    const newGestores = [...(data.gestores || []), ''];
    onUpdate('gestores', newGestores);
  };

  const removeGestor = (index: number) => {
    const newGestores = data.gestores.filter((_: any, i: number) => i !== index);
    onUpdate('gestores', newGestores);
  };

  const updateGestor = (index: number, value: string) => {
    const newGestores = [...data.gestores];
    newGestores[index] = value;
    onUpdate('gestores', newGestores);
  };

  const addFiscal = () => {
    const newFiscais = [...(data.fiscais || []), ''];
    onUpdate('fiscais', newFiscais);
  };

  const removeFiscal = (index: number) => {
    const newFiscais = data.fiscais.filter((_: any, i: number) => i !== index);
    onUpdate('fiscais', newFiscais);
  };

  const updateFiscal = (index: number, value: string) => {
    const newFiscais = [...data.fiscais];
    newFiscais[index] = value;
    onUpdate('fiscais', newFiscais);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <span className="text-blue-600 font-bold">5</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Execução Contratual</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
              <Select value={data.formaPagamento} onValueChange={(value) => onUpdate('formaPagamento', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a-vista">À Vista</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                  <SelectItem value="pos-entrega">Após Entrega</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>

            <div>
              <Label htmlFor="prazoPagamento">Prazo de Pagamento (dias)</Label>
              <Input
                id="prazoPagamento"
                type="number"
                value={data.prazoPagamento}
                onChange={(e) => onUpdate('prazoPagamento', e.target.value)}
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">Após emissão da Nota Fiscal eletrônica</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Prazos de Execução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prazosExecucao">Prazo de Execução (dias)</Label>
              <Input
                id="prazosExecucao"
                type="number"
                value={data.prazosExecucao}
                onChange={(e) => onUpdate('prazosExecucao', e.target.value)}
                placeholder="60"
              />
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>

            <div>
              <Label htmlFor="vigenciaContrato">Vigência do Contrato (meses)</Label>
              <Input
                id="vigenciaContrato"
                type="number"
                value={data.vigenciaContrato}
                onChange={(e) => onUpdate('vigenciaContrato', e.target.value)}
                placeholder="12"
              />
              <p className="text-xs text-gray-500 mt-1">Preenchido automaticamente do TR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Garantia Contratual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="garantiaContratual"
                checked={data.garantiaContratual}
                onCheckedChange={(checked) => onUpdate('garantiaContratual', checked)}
              />
              <Label htmlFor="garantiaContratual">Exigir Garantia Contratual</Label>
            </div>
            <p className="text-xs text-gray-500">Preenchido automaticamente do TR</p>

            {data.garantiaContratual && (
              <div>
                <Label htmlFor="especificacaoGarantia">Especificação da Garantia</Label>
                <Textarea
                  id="especificacaoGarantia"
                  value={data.especificacaoGarantia}
                  onChange={(e) => onUpdate('especificacaoGarantia', e.target.value)}
                  placeholder="Especifique o tipo e percentual da garantia..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800">Subcontratação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="subcontratacao"
                checked={data.subcontratacao}
                onCheckedChange={(checked) => onUpdate('subcontratacao', checked)}
              />
              <Label htmlFor="subcontratacao">Permitir Subcontratação</Label>
            </div>
            <p className="text-xs text-gray-500">Preenchido automaticamente do TR</p>

            {data.subcontratacao && (
              <div>
                <Label htmlFor="detalhesSubcontratacao">Detalhes da Subcontratação</Label>
                <Textarea
                  id="detalhesSubcontratacao"
                  value={data.detalhesSubcontratacao}
                  onChange={(e) => onUpdate('detalhesSubcontratacao', e.target.value)}
                  placeholder="Especifique as condições para subcontratação..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800 flex items-center justify-between">
              Gestores do Contrato
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGestor}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.gestores?.map((gestor: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={gestor}
                  onChange={(e) => updateGestor(index, e.target.value)}
                  placeholder="Nome do gestor"
                />
                {data.gestores.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGestor(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-xs text-gray-500">Preenchido automaticamente do TR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-gray-800 flex items-center justify-between">
              Fiscais do Contrato
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFiscal}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.fiscais?.length > 0 ? (
              data.fiscais.map((fiscal: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={fiscal}
                    onChange={(e) => updateFiscal(index, e.target.value)}
                    placeholder="Nome do fiscal"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFiscal(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum fiscal adicionado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditalStep5;
