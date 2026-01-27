
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    LogOut,
    ShieldCheck,
    Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    isCollapsed: boolean;
}

const AdminSidebar = ({ isOpen, onToggle, isCollapsed }: AdminSidebarProps) => {
    const { logout, user } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard Admin', path: '/admin' },
        { icon: Building2, label: 'Prefeituras', path: '/admin/prefeituras' },
        { icon: Building, label: 'Secretarias', path: '/admin/secretarias' },
        { icon: Users, label: 'Usuários do Sistema', path: '/admin/usuarios' },
        { icon: Settings, label: 'Configurações', path: '/admin/settings' },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-50 transition-all duration-300 ease-in-out text-slate-300",
                isCollapsed ? "w-16 lg:translate-x-0" : "w-64 lg:translate-x-0",
                isOpen ? "translate-x-0" : (isCollapsed ? "lg:translate-x-0 -translate-x-full" : "-translate-x-full")
            )}>
                <div className={cn(
                    "p-6 border-b border-slate-800 flex items-center gap-3",
                    isCollapsed && "px-3 py-4 justify-center"
                )}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                    {!isCollapsed && <h1 className="text-xl font-bold text-white tracking-tight">AdminPanel</h1>}
                </div>

                <nav className="mt-6 flex-1 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center transition-all duration-200 group relative px-3 py-2.5 rounded-lg font-medium",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )
                            }
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon size={20} className={cn("shrink-0", !isCollapsed && "mr-3")} />
                            {!isCollapsed && <span>{item.label}</span>}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-slate-700">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto p-4 border-t border-slate-800">
                    <button
                        onClick={logout}
                        className={cn(
                            "flex items-center w-full px-3 py-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors font-medium",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <LogOut size={20} className={cn("shrink-0", !isCollapsed && "mr-3")} />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
