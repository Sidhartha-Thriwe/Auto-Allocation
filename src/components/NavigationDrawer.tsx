import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  SlidersHorizontal, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: 'dashboard' | 'admin_panel';
  onNavigate: (page: 'dashboard' | 'admin_panel') => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activePage,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col justify-between border-r border-slate-200 animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                T
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm tracking-tight">Auto Allocation</div>
                <div className="text-[11px] text-slate-400 font-mono">Operations Suite</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1.5 mt-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Core Navigation
            </div>

            {/* Dashboard Link */}
            <button
              onClick={() => {
                onNavigate('dashboard');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activePage === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${activePage === 'dashboard' ? 'text-slate-300' : 'text-slate-400'}`} />
            </button>

            {/* Admin Panel Link */}
            <button
              onClick={() => {
                onNavigate('admin_panel');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activePage === 'admin_panel'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Admin Panel</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${activePage === 'admin_panel' ? 'text-slate-300' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* Footer info in drawer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thriwe Enterprise Engine v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
