
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditalStep4Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
}

const EditalStep4 = ({ data, onUpdate }: EditalStep4Props) => {
  const { toast } = useToast();

  const handleAIGenerate = (field: string) => {
    toast({
      title: "IA Ativada",
      description: "Gerando conteúdo com base nas melhores práticas legais...",
    });
    
    setTimeout(() => {
      let aiContent = '';
      
      switch (field) {
        case 'procedimentosRecursos':
          aiContent = `Os recursos deverão ser interpostos no prazo de 3 (três) dias úteis, contados da intimação do ato ou da lavratura da ata, conforme art. 164 da Lei 14.133/2021. O recurso deverá ser dirigido à autoridade superior, por intermédio da que praticou o ato recorrido, sendo protocolado na Comissão de Licitação durante o horário de expediente.`;
          break;
        case 'penalidadesPrevistas':
          aiContent = `Pelo descumprimento das obrigações contratuais, o contratado ficará sujeito às seguintes penalidades: a) Advertência; b) Multa de mora de 0,5% ao dia sobre o valor do contrato; c) Multa de 10% sobre o valor do contrato; d) Suspensão temporária do direito de licitar; e) Declaração de inidoneidade, conforme arts. 155 a 163 da Lei 14.133/2021.`;
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
          <span className="text-blue-600 font-bold">4</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Recursos e Penalidades</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Procedimentos para Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="procedimentosRecursos">Procedimentos para Apresentação de Recursos *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAIGenerate('procedimentosRecursos')}
              className="flex items-center space-x-1"
            >
              <Sparkles className="h-4 w-4" />
              <span>Gerar com IA</span>
            </Button>
          </div>
          <Textarea
            id="procedimentosRecursos"
            value={data.procedimentosRecursos}
            onChange={(e) => onUpdate('procedimentosRecursos', e.target.value)}
            placeholder="Descreva os procedimentos para apresentação de recursos..."
            rows={6}
          />
          <p className="text-xs text-gray-500 mt-1">
            Defina os prazos e procedimentos conforme Lei 14.133/2021
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Penalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="penalidadesPrevistas">Penalidades Previstas</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAIGenerate('penalidadesPrevistas')}
              className="flex items-center space-x-1"
            >
              <Sparkles className="h-4 w-4" />
              <span>Gerar com IA</span>
            </Button>
          </div>
          <Textarea
            id="penalidadesPrevistas"
            value={data.penalidadesPrevistas}
            onChange={(e) => onUpdate('penalidadesPrevistas', e.target.value)}
            placeholder="Descreva as penalidades aplicáveis conforme Lei 14.133/2021..."
            rows={6}
          />
          <p className="text-xs text-gray-500 mt-1">
            Inclua multas, suspensão e outras penalidades previstas em lei
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Responsável pelo Julgamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="responsavelJulgamento">Nome do Responsável pelo Julgamento dos Recursos</Label>
            <Input
              id="responsavelJulgamento"
              value={data.responsavelJulgamento}
              onChange={(e) => onUpdate('responsavelJulgamento', e.target.value)}
              placeholder="Nome e cargo da autoridade superior"
            />
            <p className="text-xs text-gray-500 mt-1">
              Autoridade competente para julgar os recursos interpostos
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-900 mb-2">⚖️ Conformidade Legal</h4>
        <div className="text-sm text-amber-800">
          <p>• Prazos de recursos conforme art. 164 da Lei 14.133/2021</p>
          <p>• Penalidades baseadas nos arts. 155 a 163 da Lei 14.133/2021</p>
          <p>• Competência para julgamento conforme hierarquia administrativa</p>
        </div>
      </div>
    </div>
  );
};

export default EditalStep4;
