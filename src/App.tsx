import React, { useState } from 'react';
import { TopNavBar } from './components/TopNavBar';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TableSection } from './components/TableSection';
import { CampaignDetailModal } from './components/CampaignDetailModal';
import { ExportModal } from './components/ExportModal';
import { AdminProgramDashboard } from './components/AdminProgramDashboard';
import { VendorDashboard } from './components/VendorDashboard';
import { AllocationLeaderboard } from './components/AllocationLeaderboard';
import { ModelListing } from './components/ModelListing';
import { CreateModelConfig } from './components/CreateModelConfig';
import { MODEL_LISTING_DATA, PARTNER_DATA, PROGRAM_DATA, CHAUFFEUR_DATA } from './data';
import { DashboardItem, DateRangeOption, DashboardTab, AppPage, ModelListingItem, DateFilterSelection } from './types';
import { getDefaultSelection } from './utils/dateFilterUtils';

export default function App() {
  // Navigation State: 'dashboard' | 'admin_panel' | 'vendor_panel' | 'allocation_leaderboard'
  const [activePage, setActivePage] = useState<AppPage>('vendor_panel');
  
  // Sidebar visible by default from the starting
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Top Bar global states
  const [bookingType, setBookingType] = useState('Booking Type');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusActive, setStatusActive] = useState(true);

  // Model Listing shared state
  const [modelListingItems, setModelListingItems] = useState<ModelListingItem[]>(MODEL_LISTING_DATA);

  // Dashboard state with tabs: 'partners' | 'program' | 'chauffeurs'
  const [partnerData, setPartnerData] = useState<DashboardItem[]>(PARTNER_DATA);
  const [programData, setProgramData] = useState<DashboardItem[]>(PROGRAM_DATA);
  const [chauffeurData, setChauffeurData] = useState<DashboardItem[]>(CHAUFFEUR_DATA);
  const [currentTab, setCurrentTab] = useState<DashboardTab>('partners');
  const [dateRange, setDateRange] = useState<DateRangeOption>('this_week');
  const [dateSelection, setDateSelection] = useState<DateFilterSelection>(() => getDefaultSelection('week'));

  // Modals
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleToggleStatus = (id: string) => {
    const updater = (list: DashboardItem[]) =>
      list.map((c) =>
        c.id === id ? { ...c, status: (c.status === 'Active' ? 'Paused' : 'Active') as 'Active' | 'Paused' } : c
      );

    setPartnerData(updater);
    setProgramData(updater);
    setChauffeurData(updater);

    if (selectedItem && selectedItem.id === id) {
      setSelectedItem((prev) =>
        prev ? { ...prev, status: prev.status === 'Active' ? 'Paused' : 'Active' } : null
      );
    }
  };

  const getActiveList = () => {
    switch (currentTab) {
      case 'chauffeurs':
        return chauffeurData;
      case 'program':
        return programData;
      case 'partners':
      default:
        return partnerData;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white flex flex-col">
      {/* Sticky Universal Top Nav Bar with Hamburger Toggle */}
      <TopNavBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        searchBookingType={bookingType}
        onBookingTypeChange={setBookingType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusActive={statusActive}
        onToggleStatus={() => setStatusActive(!statusActive)}
        activePage={activePage}
      />

      {/* Main Body with Persistent Sidebar from starting */}
      <div className="flex flex-1 items-stretch">
        <Sidebar
          isOpen={isSidebarOpen}
          activePage={activePage}
          onNavigate={(page) => setActivePage(page)}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-x-hidden min-w-0">
          {activePage === 'vendor_panel' && <VendorDashboard />}
          {activePage === 'admin_panel' && (
            <AdminProgramDashboard onNavigateToDashboard={() => setActivePage('dashboard')} />
          )}
          {activePage === 'allocation_leaderboard' && (
            <AllocationLeaderboard 
              onBackToDashboard={() => setActivePage('dashboard')} 
              onOpenModelListing={() => setActivePage('model_listing')}
            />
          )}
          {activePage === 'model_listing' && (
            <ModelListing
              items={modelListingItems}
              onItemsChange={setModelListingItems}
              onBackToLeaderboard={() => setActivePage('allocation_leaderboard')}
              onBackToDashboard={() => setActivePage('dashboard')}
            />
          )}
          {activePage === 'add_model_config' && (
            <CreateModelConfig
              existingModels={modelListingItems}
              onBackToModelListing={() => setActivePage('model_listing')}
              onBackToDashboard={() => setActivePage('dashboard')}
              onSaveModel={(newItem) => {
                setModelListingItems((prev) => [newItem, ...prev]);
                setActivePage('model_listing');
              }}
            />
          )}
          {activePage === 'dashboard' && (
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1520px] mx-auto">
              {/* Top Header */}
              <Header
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                dateSelection={dateSelection}
                onDateSelectionChange={setDateSelection}
                onOpenExport={() => setIsExportOpen(true)}
                onOpenAllocationLeaderboard={() => setActivePage('allocation_leaderboard')}
              />

              {/* KPI Metric Summary Cards */}
              <MetricCards items={getActiveList()} />

              {/* Main Table Section with Tabs & Filters */}
              <TableSection
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                partnerData={partnerData}
                programData={programData}
                chauffeurData={chauffeurData}
                dateRange={dateRange}
                dateSelection={dateSelection}
                onSelectItem={setSelectedItem}
              />

              {/* Detail Modal */}
              <CampaignDetailModal
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                onToggleStatus={handleToggleStatus}
              />

              {/* Export Modal */}
              <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                items={getActiveList()}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
