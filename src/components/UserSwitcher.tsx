import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/data/mockAuthData';
import { roleLabels } from '@/types/auth';
import { Users, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';

const UserSwitcher = () => {
  const { user, switchToUser, impersonating, stopImpersonation, isSuperAdmin } = useAuth();

  return (
    <Card className="border-dashed border-2 border-orange-300 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
          <Users size={16} />
          Painel de Teste - Trocar Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {impersonating && (
          <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-100 p-2 rounded">
            <AlertTriangle size={14} />
            <span>Impersonando: {impersonating.nome}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-6 text-xs"
              onClick={stopImpersonation}
            >
              <XCircle size={12} className="mr-1" />
              Parar
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Usuário atual:</p>
          <div className="flex items-center gap-2">
            <Badge variant={user?.role === 'super_admin' ? 'default' : 'secondary'}>
              {user?.role ? roleLabels[user.role] : 'N/A'}
            </Badge>
            <span className="font-medium text-sm">{user?.nome}</span>
          </div>
        </div>

        <Select 
          value={user?.email || ''} 
          onValueChange={switchToUser}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecionar usuário..." />
          </SelectTrigger>
          <SelectContent>
            {mockUsers.map((u) => (
              <SelectItem key={u.id} value={u.email}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1">
                    {roleLabels[u.role]}
                  </Badge>
                  <span>{u.nome}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Super Admin:</strong> ceo@scaleyia.com</p>
          <p><strong>Admin SP:</strong> admin@saopaulo.sp.gov.br</p>
          <p><strong>Operador:</strong> maria@saopaulo.sp.gov.br</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSwitcher;
