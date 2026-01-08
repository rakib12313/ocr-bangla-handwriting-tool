import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScanText, LayoutDashboard, Plus, PenTool, Sun, Moon, ChevronDown, Cpu } from 'lucide-react';
import { ROUTES, AVAILABLE_MODELS } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useModel } from '../context/ModelContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { model, setModel, getModelName } = useModel();
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavLink = ({ to, icon: Icon, children }: { to: string, icon: any, children: React.ReactNode }) => (
    <Link
      to={to}
      className={`relative inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
        isActive(to)
          ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={16} className="mr-2" />
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ScanText size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
              SEBON
            </span>
          </Link>
          
          {/* Center Navigation (Desktop) */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to={ROUTES.DASHBOARD} icon={LayoutDashboard}>Library</NavLink>
            <NavLink to={ROUTES.NEW_OCR} icon={Plus}>New Scan</NavLink>
            <NavLink to={ROUTES.WHITEBOARD} icon={PenTool}>Whiteboard</NavLink>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Model Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
              >
                <Cpu size={14} className="text-brand-500" />
                <span className="max-w-[100px] truncate">{getModelName(model)}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isModelMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden py-1 animate-fade-in origin-top-right">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select AI Model
                  </div>
                  {AVAILABLE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setModel(m.id);
                        setIsModelMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        model === m.id ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${model === m.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {m.name}
                        </span>
                        {model === m.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {m.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
