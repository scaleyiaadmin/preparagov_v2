
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, ChevronLeft, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                isCollapsed={sidebarCollapsed}
            />

            <div className={cn(
                "flex-1 flex flex-col transition-all duration-300",
                sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
            )}>
                {/* Header Admin */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden"
                        >
                            <Menu size={20} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden lg:flex"
                        >
                            {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </Button>

                        <div className="hidden md:flex relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                placeholder="Pesquisar no sistema..."
                                className="pl-10 bg-slate-100 border-transparent focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell size={20} className="text-slate-600" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="pl-2 pr-4 py-2 flex items-center gap-3 hover:bg-slate-100">
                                    <Avatar className="h-8 w-8 border border-slate-200">
                                        <AvatarFallback className="bg-primary text-white text-xs">
                                            {user?.nome?.charAt(0) || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-semibold text-slate-900 leading-none">{user?.nome}</p>
                                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                                            {user?.role?.replace('_', ' ')}
                                        </p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-700">
                                    Sair do Sistema
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

// Utility function copied for completeness or imported
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

export default AdminLayout;
