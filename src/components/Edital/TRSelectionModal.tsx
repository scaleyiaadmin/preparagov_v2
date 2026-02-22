import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search, FileText, Calendar, Building, Loader2 } from 'lucide-react';
import { termoReferenciaService } from '@/services/termoReferenciaService';
import { useAuth } from '@/contexts/AuthContext';
import { DbTermoReferencia } from '@/types/database';

interface TRSelectionModalProps {
  onClose: () => void;
  onSelect: (tr: DbTermoReferencia) => void;
}

const TRSelectionModal = ({ onClose, onSelect }: TRSelectionModalProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [trs, setTrs] = useState<DbTermoReferencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTRs();
  }, [user?.prefeituraId]);

  const loadTRs = async () => {
    try {
      setLoading(true);
      // Buscamos apenas TRs concluídos/aprovados para virar edital
      const data = await termoReferenciaService.fetchCompletedTermosReferencia(user?.prefeituraId || undefined);
      setTrs(data || []);
    } catch (error) {
      console.error('Erro ao carregar TRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTRs = trs.filter(tr =>
    (tr.objeto?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tr.numero_tr?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (tr: DbTermoReferencia) => {
    onSelect(tr);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Selecionar Termo de Referência</h2>
              <p className="text-sm text-gray-500 font-medium">Escolha um TR concluído para iniciar o processo de Edital</p>
            </div>
            <Button variant="ghost" onClick={onClose} className="hover:bg-red-50 hover:text-red-500 transition-colors">
              <X size={20} />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por número ou objeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all rounded-lg"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-white">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500 mb-4" />
              <p className="text-gray-500 font-medium font-bold uppercase text-xs tracking-widest">Carregando termos de referência...</p>
            </div>
          ) : filteredTRs.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-100">
              <FileText size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-bold">Nenhum TR concluído encontrado</p>
              <p className="text-sm text-gray-400 mt-1">Certifique-se de que o TR foi finalizado no módulo anterior.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTRs.map((tr) => (
                <Card
                  key={tr.id}
                  className="hover:shadow-lg transition-all border-l-4 border-l-green-500 cursor-pointer group"
                  onClick={() => handleSelect(tr)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-black text-blue-600 text-sm tracking-tight">{tr.numero_tr || 'SEM NÚMERO'}</h3>
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] font-bold uppercase py-0.5">
                            {tr.status}
                          </Badge>
                        </div>
                        <p className="text-gray-900 font-bold mb-3 line-clamp-2 leading-snug">{tr.objeto}</p>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] text-gray-500 font-bold uppercase">
                          <div className="flex items-center space-x-1.5">
                            <Building size={14} className="text-gray-400" />
                            <span>Secretaria ID: {tr.secretaria_id || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Calendar size={14} className="text-gray-400" />
                            <span>{new Date(tr.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-green-600">
                            <span className="font-black">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tr.valor_estimado)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 shadow-md transition-all group-hover:scale-105"
                        >
                          Selecionar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TRSelectionModal;
