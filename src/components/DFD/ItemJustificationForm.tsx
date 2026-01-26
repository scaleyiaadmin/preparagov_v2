
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, FileText, Check, X } from 'lucide-react';

interface DFDItem {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorReferencia: number;
  tabelaReferencia: string;
}

interface ItemJustificationFormProps {
  items: DFDItem[];
  globalJustification: string;
  onGlobalJustificationChange: (justification: string) => void;
}

const ItemJustificationForm = ({ 
  items, 
  globalJustification, 
  onGlobalJustificationChange 
}: ItemJustificationFormProps) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const generateAISuggestion = async () => {
    setLoadingAI(true);
    
    // Simulate AI generation based on items
    setTimeout(() => {
      // Group items by category for better justification
      const itemsByCategory = items.reduce((acc, item) => {
        let category = 'Outros';
        if (item.descricao.toLowerCase().includes('arroz') || item.descricao.toLowerCase().includes('feijão')) {
          category = 'Alimentação';
        } else if (item.descricao.toLowerCase().includes('desinfetante') || item.descricao.toLowerCase().includes('limpeza')) {
          category = 'Material de Limpeza';
        } else if (item.descricao.toLowerCase().includes('papel') || item.descricao.toLowerCase().includes('higiênico')) {
          category = 'Material de Higiene';
        } else if (item.descricao.toLowerCase().includes('medicamento') || item.descricao.toLowerCase().includes('paracetamol')) {
          category = 'Medicamentos';
        } else if (item.descricao.toLowerCase().includes('seringa') || item.descricao.toLowerCase().includes('hospitalar')) {
          category = 'Material Hospitalar';
        }
        
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {} as Record<string, DFDItem[]>);

      let suggestion = 'As quantidades solicitadas neste DFD foram dimensionadas com base nos seguintes critérios técnicos e operacionais:\n\n';

      Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
        suggestion += `**${category}:**\n`;
        categoryItems.forEach(item => {
          const totalValue = item.quantidade * item.valorReferencia;
          suggestion += `- ${item.descricao}: ${item.quantidade} ${item.unidade} - Quantidade estimada para atendimento de 3 meses de demanda, considerando consumo médio histórico e necessidades operacionais da unidade solicitante (R$ ${totalValue.toFixed(2)}).\n`;
        });
        suggestion += '\n';
      });

      suggestion += 'O dimensionamento das quantidades atende aos princípios da economicidade, eficiência e continuidade do serviço público, garantindo o atendimento adequado às necessidades institucionais sem desperdícios ou excessos. As estimativas baseiam-se em dados históricos de consumo, capacidade de armazenamento e prazo de validade dos produtos, quando aplicável.\n\n';
      suggestion += 'A programação visa assegurar a regularidade do fornecimento e evitar descontinuidade dos serviços essenciais prestados à população.';

      setAiSuggestion(suggestion);
      setLoadingAI(false);
    }, 2000);
  };

  const handleAcceptSuggestion = () => {
    onGlobalJustificationChange(aiSuggestion);
    setShowAIModal(false);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText size={20} className="text-orange-500" />
            <span>Justificativa de Quantidade Global</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Justifique a necessidade das quantidades solicitadas neste DFD de forma global.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-900">Resumo dos Itens:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Item {index + 1}</Badge>
                    <span className="text-sm font-medium">{item.descricao}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-orange-600">{item.quantidade} {item.unidade}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">Total de itens:</span>
              <span className="font-semibold">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="global-justification">
                Justificativa da Quantidade *
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  generateAISuggestion();
                  setShowAIModal(true);
                }}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Sparkles size={14} className="mr-2" />
                Gerar sugestão com IA
              </Button>
            </div>
            <Textarea
              id="global-justification"
              value={globalJustification}
              onChange={(e) => onGlobalJustificationChange(e.target.value)}
              placeholder="Justifique a necessidade das quantidades solicitadas neste DFD..."
              rows={5}
              className={!globalJustification ? 'border-red-300' : ''}
            />
            {!globalJustification && (
              <p className="text-sm text-red-600">
                Este campo é obrigatório para finalização do DFD.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Sparkles size={20} className="text-orange-500" />
              <span>Sugestão de Justificativa Gerada por IA</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingAI ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
                <span>Analisando itens e gerando justificativa...</span>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Sugestão de Justificativa:
                  </Label>
                  <div className="bg-white p-3 rounded border max-h-60 overflow-y-auto whitespace-pre-line text-sm">
                    {aiSuggestion}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowAIModal(false)}>
                    <X size={16} className="mr-2" />
                    Descartar
                  </Button>
                  <Button 
                    onClick={handleAcceptSuggestion}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Check size={16} className="mr-2" />
                    Aceitar Sugestão
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemJustificationForm;
