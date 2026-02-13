
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, Search, Shield, BookOpen, Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DocumentsCard = () => {
  const navigate = useNavigate();

  const [counts, setCounts] = React.useState({
    dfd: 0,
    etp: 0,
    riscos: 0,
    termo: 0,
    edital: 0
  });

  React.useEffect(() => {
    const fetchCounts = async () => {
      const { supabase } = await import('@/lib/supabase');

      const { count: dfdCount } = await supabase
        .from('dfd')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Em Elaboração');

      const { count: etpCount } = await supabase
        .from('etp')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Em Elaboração');

      setCounts({
        dfd: dfdCount || 0,
        etp: etpCount || 0,
        riscos: 0,
        termo: 0,
        edital: 0
      });
    };
    fetchCounts();
  }, []);

  const documentsStats = {
    total: counts.dfd + counts.etp + counts.riscos + counts.termo + counts.edital,
    tipos: [
      {
        name: 'DFDs em elaboração',
        count: counts.dfd,
        icon: FileText,
        color: 'text-orange-600',
        route: '/dfd',
        filter: 'em-elaboracao'
      },
      {
        name: 'ETPs em elaboração',
        count: counts.etp,
        icon: Search,
        color: 'text-blue-600',
        route: '/etp',
        filter: 'em-elaboracao'
      },
      {
        name: 'Mapas de Risco em elaboração',
        count: counts.riscos,
        icon: Shield,
        color: 'text-red-600',
        route: '/riscos',
        filter: 'em-elaboracao'
      },
      {
        name: 'Termos de Referência em elaboração',
        count: counts.termo,
        icon: BookOpen,
        color: 'text-green-600',
        route: '/termo',
        filter: 'em-elaboracao'
      },
      {
        name: 'Editais em elaboração',
        count: counts.edital,
        icon: Gavel,
        color: 'text-purple-600',
        route: '/edital',
        filter: 'em-elaboracao'
      }
    ]
  };

  const handleItemClick = (route: string, filter: string) => {
    // Store the filter in sessionStorage so the target page can use it
    sessionStorage.setItem('documentFilter', filter);
    navigate(route);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 rounded-full bg-blue-100">
            <Clock size={20} className="text-blue-600" />
          </div>
          <span>Documentos em Elaboração</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-gray-900">{documentsStats.total}</div>

        <div className="space-y-3">
          {documentsStats.tipos.map((info) => (
            <div
              key={info.name}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => handleItemClick(info.route, info.filter)}
            >
              <div className="flex items-center space-x-2">
                <info.icon size={16} className={info.color} />
                <span className="text-sm text-gray-700 hover:text-gray-900">{info.name}</span>
              </div>
              <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                {info.count}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsCard;
