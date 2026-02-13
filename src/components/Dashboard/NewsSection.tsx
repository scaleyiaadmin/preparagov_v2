
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar } from 'lucide-react';

const NewsSection = () => {
  const news: any[] = [];

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
          {news.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma notícia disponível no momento.</p>
          ) : (
            news.map((item) => (
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
            )))}
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
