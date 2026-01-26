
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Clock, FileText } from 'lucide-react';

const NotificationBell = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'DFD Pendente Aprovação',
      message: 'Aquisição de Computadores aguarda aprovação há 3 dias',
      time: '2h atrás',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      id: 2,
      type: 'deadline',
      title: 'Prazo Próximo',
      message: 'ETP da Reforma do Prédio vence em 2 dias',
      time: '4h atrás',
      icon: Clock,
      color: 'text-red-600'
    },
    {
      id: 3,
      type: 'document',
      title: 'Documento Atualizado',
      message: 'Termo de Referência foi enviado para revisão',
      time: '1d atrás',
      icon: FileText,
      color: 'text-blue-600'
    }
  ]);

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="p-2">
          <h3 className="font-semibold">Notificações</h3>
          <p className="text-sm text-gray-500">{unreadCount} não lidas</p>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <DropdownMenuItem className="p-3 flex items-start space-x-3">
                <notification.icon size={16} className={notification.color} />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-400">{notification.time}</p>
                </div>
              </DropdownMenuItem>
              {index < notifications.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center justify-center">
          <span className="text-sm text-orange-600">Ver todas as notificações</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
