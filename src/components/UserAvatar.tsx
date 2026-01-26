
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserAvatar = () => {
  const { toast } = useToast();

  const handleProfileClick = () => {
    toast({
      title: "Perfil",
      description: "Redirecionando para o perfil do usuário.",
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Alterar Senha",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="João Silva" />
            <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
              JS
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">João Silva</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              joao.silva@prefeitura.gov.br
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePasswordChange}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Alterar Senha</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
