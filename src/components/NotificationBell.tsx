import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: React.ElementType;
  color: string;
  actionUrl: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAprovador = user?.role === 'admin' || user?.role === 'super_admin';

  // Load dismissed IDs from localStorage
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`preparagov_dismissed_notifs_${user.id}`);
    if (saved) {
      try { setDismissedIds(JSON.parse(saved)); } catch { /**/ }
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allNew: NotificationItem[] = [];

      // 1. Aprovadores: DFDs Pendentes
      if (isAprovador) {
        const { data: pending } = await supabase
          .from('dfd')
          .select('id, objeto, created_at')
          .eq('status', 'Pendente')
          .order('created_at', { ascending: false })
          .limit(5);

        (pending || []).forEach(dfd => {
          allNew.push({
            id: `pendente-${dfd.id}`,
            title: 'DFD Pendente Aprovação',
            message: `O DFD "${dfd.objeto}" aguarda sua análise.`,
            time: formatDistanceToNow(new Date(dfd.created_at), { addSuffix: true, locale: ptBR }),
            icon: AlertTriangle,
            color: 'text-orange-600',
            actionUrl: '/pca'
          });
        });
      }

      // 2. Criadores: DFDs com status alterado
      const { data: myDfds } = await supabase
        .from('dfd')
        .select('id, objeto, status, created_at')
        .eq('created_by', user.id)
        .in('status', ['Pendente', 'Aprovado', 'Reprovado', 'Cancelado', 'Retirado'])
        .order('created_at', { ascending: false })
        .limit(5);

      (myDfds || []).forEach(dfd => {
        let icon: React.ElementType = FileText;
        let color = 'text-blue-600';
        let actionType = 'Enviado para Aprovação';
        let message = `Seu DFD "${dfd.objeto}" foi enviado para aprovação.`;

        if (dfd.status === 'Aprovado') {
          icon = CheckCircle2; color = 'text-green-600';
          actionType = 'Aprovado';
          message = `Seu DFD "${dfd.objeto}" foi aprovado.`;
        } else if (['Reprovado', 'Cancelado', 'Retirado'].includes(dfd.status)) {
          icon = XCircle; color = 'text-red-600';
          actionType = dfd.status;
          message = `Seu DFD "${dfd.objeto}" foi ${dfd.status.toLowerCase()}.`;
        }

        allNew.push({
          id: `status-${dfd.id}-${dfd.status}`,
          title: `DFD ${actionType}`,
          message,
          time: formatDistanceToNow(new Date(dfd.created_at), { addSuffix: true, locale: ptBR }),
          icon,
          color,
          actionUrl: '/dfd'
        });
      });

      // Filter dismissed
      const saved = localStorage.getItem(`preparagov_dismissed_notifs_${user.id}`);
      const dismissed: string[] = saved ? JSON.parse(saved) : [];
      setNotifications(allNew.filter(n => !dismissed.includes(n.id)));
    } catch (e) {
      console.error('Erro ao buscar notificações:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAprovador]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = () => {
    if (!user) return;
    const allIds = notifications.map(n => n.id);
    const newDismissed = [...dismissedIds, ...allIds];
    setDismissedIds(newDismissed);
    localStorage.setItem(`preparagov_dismissed_notifs_${user.id}`, JSON.stringify(newDismissed));
    setNotifications([]);
  };

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && !loading && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center p-0 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Notificações</h3>
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 size={14} className="animate-spin text-gray-400" />
            ) : (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                {unreadCount} novas
              </span>
            )}
            {unreadCount > 0 && !loading && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors hover:underline underline-offset-2"
              >
                Ler todas
              </button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 size={24} className="animate-spin mx-auto text-orange-500 mb-2" />
              <p className="text-sm">Buscando atualizações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm">Você não tem novas notificações.</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem
                  className="p-3 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 group transition-colors"
                  onSelect={(e) => { e.preventDefault(); navigate(notification.actionUrl); }}
                >
                  <div className={`mt-0.5 p-1.5 rounded-full bg-white shadow-sm border border-gray-100 group-hover:scale-110 transition-transform ${notification.color}`}>
                    <notification.icon size={16} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm text-gray-900 leading-tight">{notification.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                </DropdownMenuItem>
                {index < notifications.length - 1 && <DropdownMenuSeparator className="m-0" />}
              </div>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem
          className="text-center justify-center p-3 cursor-pointer bg-gray-50/50 hover:bg-gray-100/50"
          onSelect={() => navigate('/perfil')}
        >
          <span className="text-sm font-medium text-gray-600">Configurar Alertas</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
