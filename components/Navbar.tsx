import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScanText, LayoutDashboard, Plus, PenTool, Sun, Moon } from 'lucide-react';
import { ROUTES } from '../constants';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to={ROUTES.HOME} className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                <ScanText size={20} />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SEBON</span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                to={ROUTES.DASHBOARD}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive(ROUTES.DASHBOARD)
                    ? 'border-brand-500 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to={ROUTES.NEW_OCR}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive(ROUTES.NEW_OCR)
                    ? 'border-brand-500 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Scan
              </Link>
              <Link
                to={ROUTES.WHITEBOARD}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive(ROUTES.WHITEBOARD)
                    ? 'border-red-500 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-red-300 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                 <div className="flex items-center gap-2 border border-red-500 rounded-md px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <PenTool className="w-4 h-4" />
                    <span className="font-bold">Whiteboard</span>
                 </div>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
