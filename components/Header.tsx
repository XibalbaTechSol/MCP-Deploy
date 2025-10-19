import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import CodeIcon from './icons/CodeIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ArrowRightOnRectangleIcon from './icons/ArrowRightOnRectangleIcon';

type Page = 'dashboard' | 'profile' | 'settings';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (page: Page) => {
    onNavigate(page);
    setDropdownOpen(false);
  };

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <CodeIcon className="w-8 h-8 text-cyan-400 mr-3" />
            <span className="text-xl font-bold">MCP Deploy</span>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 bg-slate-800/50 hover:bg-slate-700/50 p-1.5 rounded-full transition-colors"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
              <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User avatar" />
            </button>

            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 origin-top-right bg-slate-800 divide-y divide-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
              >
                <div className="px-1 py-1">
                  <div className="px-3 py-2">
                      <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                      <p className="text-sm text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="px-1 py-1">
                  <button onClick={() => handleNavigation('dashboard')} className="text-slate-300 hover:bg-slate-700 hover:text-white group flex w-full items-center rounded-md px-2 py-2 text-sm" role="menuitem">
                    <ChartBarIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-cyan-400" />
                    Dashboard
                  </button>
                  <button onClick={() => handleNavigation('profile')} className="text-slate-300 hover:bg-slate-700 hover:text-white group flex w-full items-center rounded-md px-2 py-2 text-sm" role="menuitem">
                    <UserCircleIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-cyan-400" />
                    Profile
                  </button>
                  <button onClick={() => handleNavigation('settings')} className="text-slate-300 hover:bg-slate-700 hover:text-white group flex w-full items-center rounded-md px-2 py-2 text-sm" role="menuitem">
                    <Cog6ToothIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-cyan-400" />
                    Settings
                  </button>
                </div>
                <div className="px-1 py-1">
                  <button onClick={onLogout} className="text-slate-300 hover:bg-slate-700 hover:text-white group flex w-full items-center rounded-md px-2 py-2 text-sm" role="menuitem">
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-400" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;