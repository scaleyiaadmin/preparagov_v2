
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar } from 'lucide-react';

const NewsSection = () => {
  const news = [
    {
      id: 1,
      title: 'TCU aprova novo entendimento sobre contratação de TI',
      source: 'TCU',
      date: '2024-07-02',
      summary: 'Tribunal de Contas da União estabelece diretrizes para contratação de serviços de tecnologia da informação seguindo a Lei 14.133/2021.',
      type: 'Jurisprudência',
      link: '#'
    },
    {
      id: 2,
      title: 'Acórdão 1.234/2024: Planejamento adequado evita irregularidades',
      source: 'TCE-SP',
      date: '2024-06-28',
      summary: 'Tribunal destaca importância do planejamento adequado das contratações para evitar prejuízos ao erário público.',
      type: 'Acórdão',
      link: '#'
    },
    {
      id: 3,
      title: 'Nova interpretação sobre sustentabilidade em licitações',
      source: 'JOTA',
      date: '2024-06-25',
      summary: 'Especialistas analisam como implementar critérios de sustentabilidade nas contratações públicas de forma eficiente.',
      type: 'Análise',
      link: '#'
    },
    {
      id: 4,
      title: 'Prazo para adequação ao PCA: o que observar',
      source: 'Portal da Transparência',
      date: '2024-06-20',
      summary: 'Orientações práticas sobre prazos e procedimentos para elaboração e aprovação do Plano de Contratações Anual.',
      type: 'Orientação',
      link: '#'
    }
  ];

  const getTypeColor = (type: string) => {
    const colors = {
      'Jurisprudência': 'bg-blue-100 text-blue-800',
      'Acórdão': 'bg-red-100 text-red-800',
      'Análise': 'bg-green-100 text-green-800',
      'Orientação': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar size={20} className="text-orange-600" />
          <span>Notícias sobre Planejamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                    <span className="text-sm text-gray-500">{item.source}</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{formatDate(item.date)}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {item.summary}
                  </p>
                </div>
                <button className="ml-4 p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <ExternalLink size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Ver mais notícias
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsSection;
