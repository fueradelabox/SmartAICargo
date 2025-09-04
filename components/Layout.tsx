
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Use Outlet to render child routes
  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 ${isHomePage ? 'bg-transparent' : ''}`}>
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;
