import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // שינוי ברירת המחדל לסגור
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* תפריט צד */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'mr-16' : 'mr-80'}`}>
        <Header />
      </div>


      {/* תוכן ראשי */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'mr-16' : 'mr-80'}`}>
        {children}
      </main>

      {/* פוטר */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'mr-16' : 'mr-80'}`}>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;


