import React from 'react';
import { 
  LayoutDashboard, 
  SlidersHorizontal, 
  Store,
  ShieldCheck,
  ChevronRight,
  Trophy,
  Boxes
} from 'lucide-react';
import { AppPage } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activePage,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-53px)] sticky top-[53px] z-20 shadow-2xs">
      <div>
        {/* Workspace Brand / Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            T
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm tracking-tight">Auto Allocation</div>
            <div className="text-[11px] text-slate-400 font-mono">Operations Suite</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1.5 mt-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Navigation
          </div>

          {/* 1. Dashboard */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

          {/* 2. Allocation Leaderboard */}
          <button
            onClick={() => onNavigate('allocation_leaderboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activePage === 'allocation_leaderboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Allocation Leaderboard</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 ${activePage === 'allocation_leaderboard' ? 'text-slate-300' : 'text-slate-400'}`} />
          </button>

          {/* 3. Model Listing */}
          <button
            onClick={() => onNavigate('model_listing')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activePage === 'model_listing'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className="w-4 h-4 text-blue-500" />
              <span>Model Listing</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 ${activePage === 'model_listing' ? 'text-slate-300' : 'text-slate-400'}`} />
          </button>

          {/* 3. Admin Panel */}
          <button
            onClick={() => onNavigate('admin_panel')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

          {/* 4. Vendor Panel */}
          <button
            onClick={() => onNavigate('vendor_panel')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activePage === 'vendor_panel'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4" />
              <span>Vendor Panel</span>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 ${activePage === 'vendor_panel' ? 'text-slate-300' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Thriwe Enterprise Engine v2.4</span>
        </div>
      </div>
    </aside>
  );
};
