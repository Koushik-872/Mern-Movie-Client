import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;       // for mobile toggle
  onClose?: () => void;   // callback to close sidebar
}

const menuItems = [
  { path: '/', label: 'HOME' },
  { path: '/movies', label: 'MOVIES' },
  { path: '/latest', label: 'LATEST' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-[72px] bottom-0 left-0 z-50
          w-64 bg-black/90 backdrop-blur-sm border-r border-white/10
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <nav className="p-6">
          <ul className="space-y-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`block text-white uppercase text-sm font-medium py-2 px-4 transition-colors ${
                      isActive
                        ? 'text-red-600 border-l-4 border-red-600 pl-3'
                        : 'hover:text-white/80'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  onClick={onClose}
                  className={`block text-white uppercase text-sm font-medium py-2 px-4 transition-colors ${
                    location.pathname === '/admin'
                      ? 'text-red-600 border-l-4 border-red-600 pl-3'
                      : 'hover:text-white/80'
                  }`}
                >
                  ADMIN PANEL
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};
