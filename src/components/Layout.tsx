
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserAvatar from './UserAvatar';
import NotificationBell from './NotificationBell';
import UserSwitcher from './UserSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, ChevronLeft, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import preparagovLogo from '@/assets/preparagov-logo.png';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        isCollapsed={sidebarCollapsed}
      />
      
      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-2"
              >
                <Menu size={20} />
              </Button>
              
              {/* Desktop sidebar collapse button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebarCollapse}
                className="hidden lg:flex mr-2"
              >
                {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
              </Button>
              
              {/* PreparaGov Logo */}
              <div className="flex items-center space-x-3">
                <img 
                  src={preparagovLogo} 
                  alt="PreparaGov" 
                  className="h-8 w-auto"
                />
              </div>
            </div>
            
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <UserAvatar />
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <Outlet />
            </div>
            <div className="xl:col-span-1">
              <UserSwitcher />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
