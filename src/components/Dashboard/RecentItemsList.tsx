
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RecentItemsList = () => {
  const [items, setItems] = useState<any[]>([]);
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecent = async () => {
      let query = supabase
        .from('dfd')
        .select('id, numero_dfd, objeto, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!isSuperAdmin() && user?.prefeituraId) {
        query = query.eq('prefeitura_id', user.prefeituraId);
      }

      const { data } = await query;
      if (data) setItems(data);
    };

    fetchRecent();
  }, [user, isSuperAdmin]);

  const getStatusVariant = (status: string) => {
    if (status.includes('Aprovado')) return 'outline';
    if (status.includes('Pendente')) return 'secondary';
    return 'default';
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Atividades Recentes</CardTitle>
        <Badge variant="outline" className="text-[10px] font-normal">
          Últimos 5 DFDs
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 pt-4">
          {items.length > 0 ? (
            items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => navigate('/dfd')}
              >
                <div className="flex items-center space-x-4 overflow-hidden">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.objeto || 'Sem objeto'}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">{item.numero_dfd}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), "dd 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="text-[10px] whitespace-nowrap" variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-center text-muted-foreground py-4">Nenhuma atividade recente encontrada.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentItemsList;
