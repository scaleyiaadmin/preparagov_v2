import React, { useState, useEffect } from 'react';
import { Lightbulb, ExternalLink, ChevronLeft, ChevronRight, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Tip {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  icon: React.ElementType;
}

const AITipCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tips, setTips] = useState<Tip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAprovador = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    const fetchTips = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const generatedTips: Tip[] = [];

        // Tip 1: Approvers - Pending DFDs
        if (isAprovador) {
          const { count } = await supabase
            .from('dfd')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Pendente');
          
          if (count && count > 0) {
            generatedTips.push({
              id: 'tip-approver',
              badge: 'Atenção Necessária',
              badgeColor: 'text-orange-600 bg-orange-50',
              title: `Há ${count} DFD(s) pendentes`,
              description: 'Existem Demandas aguardando a sua análise para prosseguir no fluxo.',
              linkText: 'Ver PCA',
              linkUrl: '/pca',
              icon: AlertTriangle
            });
          }
        }

        // Tip 2: Creators - Pending/Approved DFDs
        const { data: myDfds } = await supabase
          .from('dfd')
          .select('id, objeto, status')
          .eq('created_by', user.id)
          .in('status', ['Aprovado', 'Em Elaboração'])
          .order('created_at', { ascending: false })
          .limit(2);

        if (myDfds && myDfds.length > 0) {
          myDfds.forEach((dfd, idx) => {
            if (dfd.status === 'Aprovado') {
              generatedTips.push({
                id: `tip-approved-${dfd.id}`,
                badge: 'Progresso',
                badgeColor: 'text-green-600 bg-green-50',
                title: 'DFD Aprovado!',
                description: `O DFD "${dfd.objeto}" foi aprovado e agora pode seguir para o ETP.`,
                linkText: 'Acessar ETP',
                linkUrl: '/etp',
                icon: CheckCircle2
              });
            } else if (dfd.status === 'Em Elaboração') {
              generatedTips.push({
                id: `tip-draft-${dfd.id}`,
                badge: 'Rascunho',
                badgeColor: 'text-blue-600 bg-blue-50',
                title: 'DFD em elaboração',
                description: `Você tem demandas como "${dfd.objeto}" incompletas. Finalize-as para não atrasar o PCA.`,
                linkText: 'Continuar edição',
                linkUrl: '/dfd',
                icon: FileText
              });
            }
          });
        }

        // Fallback generic tip if no data-driven tip
        if (generatedTips.length === 0) {
          generatedTips.push({
            id: 'tip-generic-1',
            badge: 'Boas Práticas',
            badgeColor: 'text-purple-600 bg-purple-50',
            title: 'Planejamento é essencial',
            description: 'Mantenha seus DFDs organizados para garantir uma eficiência maior na montagem do PCA.',
            linkText: 'Ir para Dashboard',
            linkUrl: '/',
            icon: Lightbulb
          });
        }

        setTips(generatedTips);
      } catch (err) {
        console.error('Erro ao gerar dicas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [user, isAprovador]);

  // Carousel logic
  useEffect(() => {
    if (tips.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, 6000); // Change tip every 6 seconds
    return () => clearInterval(interval);
  }, [tips.length]);

  if (loading || tips.length === 0) return null;

  const currentTip = tips[currentIndex];

  return (
    <div className="bg-white border border-gray-100/80 rounded-[14px] p-3 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] relative overflow-hidden mx-2 mb-2 transition-all hover:shadow-[0_4px_12px_-2px_rgba(6,81,237,0.12)]">
      {/* Header */}
      <div className="flex items-center space-x-1.5 mb-2">
         <Lightbulb size={12} className="text-slate-400" />
         <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Dicas da IA</span>
      </div>

      {/* Badge */}
      <div className="mb-1.5">
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${currentTip.badgeColor} bg-opacity-50`}>
          {currentTip.badge}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-1 mb-2.5 mt-2">
        <h4 className="text-[12px] font-semibold text-gray-800 leading-tight truncate">{currentTip.title}</h4>
        <p className="text-[10px] text-gray-500 leading-snug font-medium line-clamp-2">{currentTip.description}</p>
      </div>

      {/* Action Link & Indicators */}
      <div className="flex items-center justify-between mt-1 pt-1.5">
         <button 
           onClick={() => navigate(currentTip.linkUrl)}
           className="text-orange-600 hover:text-orange-700 text-[10px] font-semibold flex items-center transition-colors group"
         >
           <ExternalLink size={10} className="mr-1 group-hover:-translate-y-px transition-transform" />
           {currentTip.linkText}
         </button>

         {/* Carousel Indicators */}
         {tips.length > 1 && (
           <div className="flex space-x-1 items-center">
             {tips.map((_, idx) => (
               <div 
                 key={idx}
                 className={`h-1 rounded-full transition-all duration-300 ${
                   idx === currentIndex ? 'w-3 bg-orange-500' : 'w-1 bg-gray-200'
                 }`}
               />
             ))}
           </div>
         )}
      </div>
    </div>
  );
};

export default AITipCard;
