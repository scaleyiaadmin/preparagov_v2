import React from 'react';
import { NavLink } from 'react-router-dom';
import AITipCard from './AITipCard';
import {
  Home,
  FileText,
  Calendar,
  Search,
  Shield,
  BookOpen,
  Gavel,
  User,
  Menu,
  CalendarDays,
  Settings,
  Users,
  Building2,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ModulePermissions } from '@/types/auth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  permissionKey?: keyof ModulePermissions;
  requiresSuperAdmin?: boolean;
  requiresAdmin?: boolean;
}

const Sidebar = ({ isOpen, onToggle, isCollapsed }: SidebarProps) => {
  const { hasPermission, isSuperAdmin, isAdmin, getCurrentUser, impersonating } = useAuth();

  const allMenuItems: MenuItem[] = [
    { icon: Home, label: 'Dashboard', path: '/', permissionKey: 'dashboard' },
    { icon: FileText, label: 'DFD', path: '/dfd', permissionKey: 'dfd' },
    { icon: Calendar, label: 'PCA', path: '/pca', permissionKey: 'pca' },
    { icon: Search, label: 'ETP', path: '/etp', permissionKey: 'etp' },
    { icon: Shield, label: 'Mapa de Riscos', path: '/riscos', permissionKey: 'mapaRiscos' },
    { icon: CalendarDays, label: 'Cronograma de Licitações', path: '/cronograma', permissionKey: 'cronograma' },
    { icon: BookOpen, label: 'Termo de Referência', path: '/termo', permissionKey: 'termoReferencia' },
    { icon: Gavel, label: 'Edital', path: '/edital', permissionKey: 'edital' },
    { icon: Globe, label: 'Integrações', path: '/integracoes', requiresAdmin: true },
  ];

  // Filtra menu items baseado nas permissões
  const visibleMenuItems = allMenuItems.filter(item => {
    // Super Admin vê tudo (exceto quando impersonando)
    if (isSuperAdmin() && !impersonating) {
      return true;
    }

    // Item requer Super Admin
    if (item.requiresSuperAdmin) {
      return false;
    }

    // Item requer Admin
    if (item.requiresAdmin && !isAdmin()) {
      return false;
    }

    // Verifica permissão específica do módulo
    if (item.permissionKey) {
      if (item.permissionKey === 'pca') {
        return hasPermission('pca') || hasPermission('dfd');
      }
      return hasPermission(item.permissionKey);
    }

    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16 lg:translate-x-0" : "w-64 lg:translate-x-0",
        isOpen ? "translate-x-0" : (isCollapsed ? "lg:translate-x-0 -translate-x-full" : "-translate-x-full")
      )}>
        <div className={cn(
          "p-6 border-b border-gray-200",
          isCollapsed && "px-3 py-4"
        )}>
          <div className="flex items-center justify-between">
            {!isCollapsed && <h1 className="text-xl font-bold text-gray-900">PreparaGov</h1>}
            {isCollapsed && (
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">PG</span>
              </div>
            )}
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto pb-4">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center transition-all duration-200 group relative rounded-lg",
                  isCollapsed
                    ? "px-3 py-3 mx-2 my-1 justify-center"
                    : "px-4 py-2.5 mx-3 my-1",
                  "text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-orange-600 hover:-translate-y-0.5",
                  isActive && "bg-orange-50/80 text-orange-600 font-semibold shadow-sm",
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={18} className={cn(isCollapsed ? "" : "mr-3", "transition-transform group-hover:scale-110")} />
              {!isCollapsed && <span>{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="mt-auto bg-white pt-2 pb-4">
            <AITipCard />
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
