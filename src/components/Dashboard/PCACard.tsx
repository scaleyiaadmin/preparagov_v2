
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PCACard = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();

  const [pcaStats, setPcaStats] = React.useState({
    valorTotal: 'R$ 0,00',
    ano: new Date().getFullYear().toString(),
    percentualAprovados: 0,
    totalDFDs: 0,
    dfdAprovados: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      const { supabase } = await import('@/lib/supabase');
      const currentYear = new Date().getFullYear();

      let query = supabase
        .from('dfd')
        .select('status, valor_estimado_total, ano_contratacao')
        .eq('ano_contratacao', currentYear);

      if (!isSuperAdmin() && user?.prefeituraId) {
        query = query.eq('prefeitura_id', user.prefeituraId);
      }

      const { data } = await query;

      if (data) {
        const totalDFDs = data.length;
        const approved = data.filter((d: any) => d.status === 'Aprovado');
        const approvedCount = approved.length;
        const totalValue = approved.reduce((acc: number, d: any) => acc + (d.valor_estimado_total || 0), 0);

        setPcaStats({
          valorTotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
          ano: currentYear.toString(),
          percentualAprovados: totalDFDs > 0 ? Math.round((approvedCount / totalDFDs) * 100) : 0,
          totalDFDs: totalDFDs,
          dfdAprovados: approvedCount
        });
      }
    };
    fetchStats();
  }, []);

  const handleClick = () => {
    navigate('/pca');
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-green-100">
              <Calendar size={20} className="text-green-600" />
            </div>
            <span>PCA {pcaStats.ano}</span>
          </div>
          <TrendingUp size={16} className="text-green-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-gray-900">{pcaStats.valorTotal}</div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ano de Vigência:</span>
            <span className="font-semibold text-gray-900">{pcaStats.ano}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">DFDs Aprovados:</span>
              <span className="font-semibold text-gray-900">
                {pcaStats.dfdAprovados}/{pcaStats.totalDFDs}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(pcaStats.dfdAprovados / pcaStats.totalDFDs) * 100}%` }}
              ></div>
            </div>

            <div className="text-center">
              <span className="text-2xl font-bold text-green-600">
                {Math.round((pcaStats.dfdAprovados / pcaStats.totalDFDs) * 100)}%
              </span>
              <p className="text-xs text-gray-500">de aprovação</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PCACard;
