import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

import { useNavigate } from 'react-router-dom';

const UserAvatar = () => {
  const { toast } = useToast();
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadAvatar = () => {
      const savedAvatar = localStorage.getItem(`preparagov_avatar_${user.id}`);
      if (savedAvatar) {
        setAvatarBase64(savedAvatar);
      }
    };

    // Load initial avatar
    loadAvatar();

    // Listen for custom event from Profile page
    window.addEventListener('avatarUpdate', loadAvatar);
    return () => window.removeEventListener('avatarUpdate', loadAvatar);
  }, [user]);

  const handleProfileClick = () => {
    navigate('/perfil');
  };

  const handleGestaoClick = () => {
    navigate('/gestao');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    // Forçar recarregamento para garantir que todos os estados sejam limpos
    window.location.reload();
  };

  if (!user) return null;

  const initials = user.nome
    ? user.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  const showGestao = isAdmin() || isSuperAdmin();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarBase64 || "/placeholder.svg"} alt={user.nome} className="object-cover" />
            <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.nome}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleProfileClick} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>

        {showGestao && (
          <DropdownMenuItem onSelect={handleGestaoClick} className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            <span>Gerenciar Sub</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="text-red-600 focus:text-red-700 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
