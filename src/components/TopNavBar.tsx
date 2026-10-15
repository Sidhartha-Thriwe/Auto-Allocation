import React from 'react';
import { 
  Menu, 
  Search, 
  ChevronDown, 
  Headphones, 
  Bell, 
  Check, 
  Settings, 
  ShieldAlert,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

import { AppPage } from '../types';

interface TopNavBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchBookingType: string;
  onBookingTypeChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusActive: boolean;
  onToggleStatus: () => void;
  activePage: AppPage;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  searchBookingType,
  onBookingTypeChange,
  searchQuery,
  onSearchChange,
  statusActive,
  onToggleStatus,
  activePage,
}) => {
  const [bookingTypeOpen, setBookingTypeOpen] = React.useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const bookingTypes = ['Airport Transfer', 'Golf Concierge', 'Dining & Lounge', 'Medical Concierge', 'All Types'];

  const isVendorPage = activePage === 'vendor_panel';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle + Combined Search */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden"
            aria-label="Toggle Navigation Sidebar"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? (
              <Menu className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[2.2]" />
            )}
          </button>

          {/* Search Box with Booking Type selector (shown on admin/dashboard) */}
          {!isVendorPage ? (
            <div className="flex items-center bg-[#f8fafc] border border-slate-200/90 rounded-lg overflow-hidden w-full max-w-md shadow-2xs focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300">
              <div className="relative border-r border-slate-200">
                <button
                  type="button"
                  onClick={() => setBookingTypeOpen(!bookingTypeOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 font-medium whitespace-nowrap hover:bg-slate-100 transition-colors"
                >
                  <span>{searchBookingType}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {bookingTypeOpen && (
                  <div className="absolute left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-xs">
                    {bookingTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          onBookingTypeChange(type);
                          setBookingTypeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${
                          searchBookingType === type ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-600'
                        }`}
                      >
                        {type}
                        {searchBookingType === type && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center flex-1 px-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search By Booking ID, Name, Email, Mobile No"
                  className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent border-none outline-hidden py-1.5"
                />
              </div>
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-500 font-mono hidden sm:block">
              Vendor Operations Console
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Badge Dropdown (for non-vendor pages) */}
          {!isVendorPage && (
            <div className="relative">
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${statusActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{statusActive ? 'Active' : 'Offline'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {statusMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      if (!statusActive) onToggleStatus();
                      setStatusMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active
                  </button>
                  <button
                    onClick={() => {
                      if (statusActive) onToggleStatus();
                      setStatusMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Offline
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Headphones Support icon */}
          <button 
            title="Help & Concierge Support"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Headphones className="w-4 h-4 stroke-[1.9]" />
          </button>

          {/* Bell icon (shown prominently on vendor page) */}
          <button 
            title="Notifications"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-4 h-4 stroke-[1.9]" />
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full absolute top-1.5 right-1.5" />
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {isVendorPage ? 'T' : 'S'}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {isVendorPage ? 'Thriwe' : 'Sidhartha'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-900">
                    {isVendorPage ? 'Thriwe Operations' : 'Sidhartha Rajput'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {isVendorPage ? 'ops@thriwe.com' : 'sidhartha.rajput@thriwe.com'}
                  </div>
                </div>
                <button 
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Account Settings
                </button>
                <button 
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  Role & Permissions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
