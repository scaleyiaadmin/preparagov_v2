
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ClipboardCheck, FileSignature, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Stats {
  totalDFDs: number;
  totalETPs: number;
  totalTRs: number;
  valorTotal: number;
  dfdTrend: number;
}

const StatsCards = () => {
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalDFDs: 0,
    totalETPs: 0,
    totalTRs: 0,
    valorTotal: 0,
    dfdTrend: 12, // Exemplo estático para estética, pode ser calculado depois
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const currentYear = new Date().getFullYear();
        let dfdQuery = supabase
          .from('dfd')
          .select('status, valor_estimado_total, ano_contratacao', { count: 'exact' });
          
        if (currentYear === 2026) {
          dfdQuery = dfdQuery.eq('ano_contratacao', currentYear);
        }

        let etpQuery = supabase.from('etp').select('*', { count: 'exact' });
        let trQuery = supabase.from('termos_referencia').select('*', { count: 'exact' });

        if (!isSuperAdmin() && user?.prefeituraId) {
          dfdQuery = dfdQuery.eq('prefeitura_id', user.prefeituraId);
          etpQuery = etpQuery.eq('prefeitura_id', user.prefeituraId);
          trQuery = trQuery.eq('prefeitura_id', user.prefeituraId);
        }

        const [dfdRes, etpRes, trRes] = await Promise.all([dfdQuery, etpQuery, trQuery]);

        if (dfdRes.data) {
          const approvedDfd = dfdRes.data.filter((item: any) => item.status === 'Aprovado');
          const valor = approvedDfd.reduce((acc: number, item: any) => acc + (item.valor_estimado_total || 0), 0);
          setStats(prev => ({
            ...prev,
            totalDFDs: dfdRes.count || 0,
            valorTotal: valor,
            totalETPs: etpRes.count || 0,
            totalTRs: trRes.count || 0,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
  }, [user, isSuperAdmin]);

  const cards = [
    {
      title: 'Total de DFDs',
      value: stats.totalDFDs,
      icon: <FileText className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-50',
      trend: stats.dfdTrend,
      description: 'Documentos registrados',
      path: '/dfd'
    },
    {
      title: 'ETPs Concluídos',
      value: stats.totalETPs,
      icon: <ClipboardCheck className="text-emerald-600" size={24} />,
      bgColor: 'bg-emerald-50',
      trend: 5,
      description: 'Estudos técnicos',
      path: '/etp'
    },
    {
      title: 'TRs Gerados',
      value: stats.totalTRs,
      icon: <FileSignature className="text-purple-600" size={24} />,
      bgColor: 'bg-purple-50',
      trend: 8,
      description: 'Termos de referência',
      path: '/termo'
    },
    {
      title: 'Valor Total do PCA',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.valorTotal),
      icon: <DollarSign className="text-green-600" size={24} />,
      bgColor: 'bg-green-50/50',
      description: '2026',
      path: '/pca'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer hover:translate-y-[-4px] overflow-hidden group"
          onClick={() => navigate(card.path)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor} transition-transform group-hover:scale-110`}>
                {card.icon}
              </div>
              {card.trend && (
                <div className={`flex items-center text-xs font-medium ${card.trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {card.trend > 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                  {Math.abs(card.trend)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </div>
          </CardContent>
          <div className={`h-1 w-full ${card.bgColor.replace('bg-', 'bg-')}`} style={{ filter: 'brightness(0.9)' }}></div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
