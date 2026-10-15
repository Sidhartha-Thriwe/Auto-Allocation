import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Copy, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Users, 
  Car, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Check, 
  Sliders, 
  Building2, 
  Boxes,
  FileCode2,
  Trash2,
  AlertCircle,
  Play
} from 'lucide-react';
import { MODEL_LISTING_DATA } from '../data';
import { ModelListingItem, ModelState } from '../types';
import { CreateModelConfig } from './CreateModelConfig';
import { ModelDetailSection } from './ModelDetailSection';
import { ManualRunModal } from './ManualRunModal';

interface ModelListingProps {
  onBackToLeaderboard: () => void;
  onBackToDashboard: () => void;
  onOpenAddConfig?: () => void;
  items?: ModelListingItem[];
  onItemsChange?: (items: ModelListingItem[]) => void;
}

type TabType = 'All' | 'Published' | 'Draft';

const AVAILABLE_REGIONS = [
  'UAE',
  'KSA',
  'India',
  'London',
  'Australia'
];

const AVAILABLE_PARTNERS = [
  'Biztravex',
  'AB Transfer',
  'White whale',
  'KTC',
  'Truway',
  'Apex Limousine',
  'EcoFleet'
];

const AVAILABLE_BENEFITS = [
  'Airport Transfer'
];

export const ModelListing: React.FC<ModelListingProps> = ({
  onBackToLeaderboard,
  onBackToDashboard,
  items: propItems,
  onItemsChange,
}) => {
  const [internalItems, setInternalItems] = useState<ModelListingItem[]>(MODEL_LISTING_DATA);
  const items = propItems || internalItems;
  const setItems = (action: React.SetStateAction<ModelListingItem[]>) => {
    if (typeof action === 'function') {
      const next = action(items);
      if (onItemsChange) onItemsChange(next);
      else setInternalItems(next);
    } else {
      if (onItemsChange) onItemsChange(action);
      else setInternalItems(action);
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 3 Step Form page state
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);

  // Modals state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isManualRunModalOpen, setIsManualRunModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Add/Update
  const [formVersion, setFormVersion] = useState('');
  const [formBenefit, setFormBenefit] = useState(AVAILABLE_BENEFITS[0]);
  const [formState, setFormState] = useState<ModelState>('Draft');
  const [formPartners, setFormPartners] = useState<string[]>(['Biztravex', 'White whale']);
  const [formCreatedBy, setFormCreatedBy] = useState('Sidhartha Rajput');
  const [formRegions, setFormRegions] = useState<string[]>(['UAE', 'KSA']);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Selected item object
  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  // Tab filtered items
  const tabFilteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === 'Published') return item.state === 'Published';
      if (activeTab === 'Draft') return item.state === 'Draft';
      return true; // 'All' tab includes Draft, Pending for approval, and Published
    });
  }, [items, activeTab]);

  // Search filtered items
  const displayItems = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredItems;
    const q = searchQuery.toLowerCase();
    return tabFilteredItems.filter((item) => {
      return (
        item.version.toLowerCase().includes(q) ||
        item.benefit.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        (item.createdBy && item.createdBy.toLowerCase().includes(q)) ||
        item.partners.some((p) => p.toLowerCase().includes(q)) ||
        (item.regions && item.regions.some((r) => r.toLowerCase().includes(q)))
      );
    });
  }, [tabFilteredItems, searchQuery]);

  // Handle clone action
  const handleClone = () => {
    if (!selectedItem) return;

    // Generate new version tag
    const versionMatch = selectedItem.version.match(/v(\d+)\.(\d+)/);
    let nextVersion = `${selectedItem.version}-copy`;
    if (versionMatch) {
      const major = versionMatch[1];
      const minor = parseInt(versionMatch[2], 10) + 1;
      nextVersion = `v${major}.${minor}`;
    }

    const clonedItem: ModelListingItem = {
      id: `model-${Date.now()}`,
      model: 'Allocation',
      version: nextVersion,
      state: 'Draft',
      benefit: selectedItem.benefit,
      regions: selectedItem.regions ? [...selectedItem.regions] : ['UAE', 'KSA'],
      partners: [...selectedItem.partners],
      createdBy: selectedItem.createdBy || 'Sidhartha Rajput',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      config: selectedItem.config ? { ...selectedItem.config, clonedFrom: selectedItem.version } : undefined,
      weights: selectedItem.weights ? [...selectedItem.weights] : undefined,
      parameters: selectedItem.parameters ? [...selectedItem.parameters] : undefined,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, 12:00 UTC`,
          actor: 'Sidhartha Rajput',
          action: 'Cloned Configuration',
          notes: `Cloned from ${selectedItem.version} into new draft working branch.`,
          statusBadge: 'Draft',
        },
        ...(selectedItem.logs || []),
      ],
    };

    setItems((prev) => [clonedItem, ...prev]);
    setSelectedId(clonedItem.id);
    showToast(`Configuration cloned as new Draft version (${nextVersion})`);
  };

  // Open Update Modal
  const handleOpenUpdate = () => {
    if (!selectedItem) return;
    setFormVersion(selectedItem.version);
    setFormBenefit(selectedItem.benefit);
    setFormState(selectedItem.state);
    setFormPartners([...selectedItem.partners]);
    setFormRegions(selectedItem.regions && selectedItem.regions.length > 0 ? [...selectedItem.regions] : ['UAE', 'KSA']);
    setFormCreatedBy(selectedItem.createdBy || 'Sidhartha Rajput');
    setIsUpdateModalOpen(true);
  };

  // Submit Update
  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (formPartners.length < 2 || formPartners.length > 5) {
      alert('Please select between 2 and 5 partners.');
      return;
    }

    if (formRegions.length === 0) {
      alert('Please select at least one region.');
      return;
    }

    const updated = items.map((item) => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          version: formVersion,
          benefit: formBenefit,
          state: formState,
          regions: [...formRegions],
          partners: [...formPartners],
          createdBy: formCreatedBy.trim() || item.createdBy || 'Sidhartha Rajput',
          updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
      }
      return item;
    });

    setItems(updated);
    setIsUpdateModalOpen(false);
    showToast(`Model configuration ${formVersion} successfully updated`);
  };

  // Open Manual Run Simulation
  const handleOpenManualRun = () => {
    if (!selectedItem) {
      if (displayItems.length > 0) {
        setSelectedId(displayItems[0].id);
      } else {
        return;
      }
    }
    setIsManualRunModalOpen(true);
  };

  // Handle Send for Approval from Manual Run Simulation
  const handleSendForApprovalFromManualRun = (
    modelId: string,
    details: { serviceDate: string; partners: string[]; chauffeurs: string[] }
  ) => {
    const target = items.find((i) => i.id === modelId) || selectedItem;
    if (!target) return;

    const updated = items.map((item) => {
      if (item.id === modelId) {
        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, 12:00 UTC`,
          actor: item.createdBy || 'Sidhartha Rajput',
          action: 'Submitted for Approval (Manual Run)',
          notes: `Manual simulation verified for ${details.serviceDate} with ${details.partners.length} partners (${details.partners.join(', ')}).`,
          statusBadge: 'Pending for approval' as const,
        };
        return {
          ...item,
          state: 'Pending for approval' as ModelState,
          updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          logs: [newLog, ...(item.logs || [])],
        };
      }
      return item;
    });

    setItems(updated);
    setIsManualRunModalOpen(false);
    showToast(`Model ${target.model} (${target.version}) manual run submitted for approval`);
  };

  // Open Add Page (3 Step form to add new model)
  const handleOpenAdd = () => {
    setIsCreatePageOpen(true);
  };

  const togglePartnerSelection = (p: string) => {
    if (formPartners.includes(p)) {
      if (formPartners.length <= 2) {
        alert('Minimum 2 partners required per configuration.');
        return;
      }
      setFormPartners(formPartners.filter((x) => x !== p));
    } else {
      if (formPartners.length >= 5) {
        alert('Maximum 5 partners allowed per configuration.');
        return;
      }
      setFormPartners([...formPartners, p]);
    }
  };

  if (isCreatePageOpen) {
    return (
      <CreateModelConfig
        onBackToModelListing={() => setIsCreatePageOpen(false)}
        onBackToDashboard={onBackToDashboard}
        existingModels={items}
        onSaveModel={(newItem, isApproval) => {
          setItems((prev) => [newItem, ...prev]);
          setSelectedId(newItem.id);
          setIsCreatePageOpen(false);
          showToast(
            isApproval
              ? `Configuration ${newItem.version} submitted for approval!`
              : `Configuration ${newItem.version} saved as Draft!`
          );
        }}
      />
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1720px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <button 
              onClick={onBackToDashboard} 
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <span>/</span>
            <button 
              onClick={onBackToLeaderboard} 
              className="text-blue-600 hover:text-blue-800 transition-colors font-medium cursor-pointer"
            >
              Allocation Leaderboard
            </button>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Model Listing</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Model Listing
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage allocation model configurations, version deployment lifecycles, and partner matrices.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions: CTA + Back button */}
        <div className="flex items-center gap-2.5">
          {/* CTA - Add new configuration */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add new configuration</span>
          </button>

          {/* Back to Leaderboard */}
          <button
            onClick={onBackToLeaderboard}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* 3 Cards on top */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total versions live Count 3 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Total versions live
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900">
            3
          </div>
        </div>

        {/* Card 2: Total partners live Count 5 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Total partners live
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900">
            5
          </div>
        </div>

        {/* Card 3: Total Chauffuers live Count 45 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Total Chauffuers live
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900">
            45
          </div>
        </div>
      </div>

      {/* Main Table Card with Tabs, Search, and Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header Bar with 3 Tabs / Slices (All, Published, Draft) & Search */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-3">
            {/* 3 Tabs / Slices: All, Published, Draft */}
            <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveTab('All');
                  setSelectedId(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'All'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('Published');
                  setSelectedId(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'Published'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Published</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'Published' ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'}`}>
                  {items.filter((i) => i.state === 'Published').length}
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('Draft');
                  setSelectedId(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'Draft'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Draft</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'Draft' ? 'bg-slate-800 text-white' : 'bg-slate-300 text-slate-700'}`}>
                  {items.filter((i) => i.state === 'Draft').length}
                </span>
              </button>
            </div>

            {/* Selection Status indicator */}
            {selectedItem && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Selected: {selectedItem.version}</span>
              </div>
            )}
          </div>

          {/* Right Side: CTAs visible on selecting any row (Manual Run, Update, Clone) + Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 3 CTAs visible ON SELECTING ANY ROW: Manual Run, Update, Clone */}
            {selectedItem && (
              <div className="flex items-center gap-2 animate-in fade-in duration-150">
                <button
                  onClick={handleOpenManualRun}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="Run manual simulation for selected model"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Manual Run</span>
                </button>

                <button
                  onClick={handleOpenUpdate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="Update selected configuration"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update</span>
                </button>

                <button
                  onClick={handleClone}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="Clone selected configuration into a new draft"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Clone</span>
                </button>
              </div>
            )}

            {/* Search filter */}
            <div className="relative min-w-[200px] sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter version, benefit, partner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 text-slate-800 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30"
              />
            </div>
          </div>
        </div>

        {/* Selected row notification banner if selected */}
        {selectedItem && (
          <div className="px-4 py-2 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Row selected: <strong className="font-bold">{selectedItem.model} ({selectedItem.version})</strong> &mdash; Choose an action above or click Update/Clone.
              </span>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer text-[11px]"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px] text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                {/* Selection column */}
                <th className="py-3 px-3.5 w-10 text-center"></th>
                
                {/* 1. Model - Allocation for all the Values */}
                <th className="py-3 px-4">Model</th>

                {/* 2. Version - v1.1, v2.1, v2.2 */}
                <th className="py-3 px-4">Version</th>

                {/* 3. State - Draft or Pending for approval or published (This column will only be there in All tab) */}
                {activeTab === 'All' && (
                  <th className="py-3 px-4 text-center">State</th>
                )}

                {/* 4. Benefit - Airport Transfer */}
                <th className="py-3 px-4">Benefit</th>

                {/* 5. Partners - AB Transfer, White whale etc. (Each row has names between 2-5) */}
                <th className="py-3 px-4">Partners</th>

                {/* Region | Placement before Created by */}
                <th className="py-3 px-4">Region</th>

                {/* 6. Created by (Name) */}
                <th className="py-3 px-4">Created by</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800 text-[12px]">
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'All' ? 8 : 7} className="py-12 text-center text-slate-400 text-xs">
                    No model configurations found for this slice.
                  </td>
                </tr>
              ) : (
                displayItems.map((row) => {
                  const isSelected = selectedId === row.id;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50/80 hover:bg-blue-50' 
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Radio / Selection checkbox indicator */}
                      <td className="py-3.5 px-3.5 text-center">
                        <input
                          type="radio"
                          name="selected_model"
                          checked={isSelected}
                          onChange={() => setSelectedId(row.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* 1. Model - Allocation for all the values */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                          <span className="font-bold">{row.model}</span>
                        </div>
                      </td>

                      {/* 2. Version - v1.1, v2.1, v2.2 */}
                      <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          {row.version}
                        </span>
                      </td>

                      {/* 3. State - Draft or Pending for approval or published (ONLY in All tab) */}
                      {activeTab === 'All' && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {row.state === 'Published' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Published</span>
                            </span>
                          )}
                          {row.state === 'Draft' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <FileCode2 className="w-3 h-3 text-slate-500" />
                              <span>Draft</span>
                            </span>
                          )}
                          {row.state === 'Pending for approval' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending for approval</span>
                            </span>
                          )}
                        </td>
                      )}

                      {/* 4. Benefit - Airport Transfer */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {row.benefit}
                      </td>

                      {/* 5. Partners - AB Transfer, White whale etc. (names between 2-5) */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
                          {row.partners.map((partner, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                            >
                              {partner}
                            </span>
                          ))}
                          <span className="text-[10px] text-slate-400 font-mono ml-1">
                            ({row.partners.length} partners)
                          </span>
                        </div>
                      </td>

                      {/* Region | Placement before Created by */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                          {(row.regions && row.regions.length > 0 ? row.regions : ['UAE', 'KSA']).map((reg, rIdx) => (
                            <span
                              key={rIdx}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/80"
                            >
                              {reg}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 6. Created by (Name) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {(row.createdBy || 'SR')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">{row.createdBy || 'Sidhartha Rajput'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-3.5 px-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono">
          <div>
            Showing <strong>{displayItems.length}</strong> of <strong>{tabFilteredItems.length}</strong> model configurations in {activeTab} slice
          </div>
          <div>
            Model: <strong className="text-slate-800">Allocation</strong> &bull; Total Configurations: <strong className="text-slate-800">{items.length}</strong>
          </div>
        </div>
      </div>

      {/* SECTION BELOW CURRENT TABLE: On selecting any row, open multi-tabs details, configuration, weights, parameters, logs */}
      {selectedItem && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <ModelDetailSection
            model={selectedItem}
            onClose={() => setSelectedId(null)}
            onUpdateClick={handleOpenUpdate}
            onCloneClick={handleClone}
            onManualRunClick={handleOpenManualRun}
          />
        </div>
      )}

      {/* MODAL: Manual Run Simulation & Results Modal */}
      {isManualRunModalOpen && selectedItem && (
        <ManualRunModal
          isOpen={isManualRunModalOpen}
          onClose={() => setIsManualRunModalOpen(false)}
          model={selectedItem}
          onSendForApproval={handleSendForApprovalFromManualRun}
        />
      )}

      {/* MODAL 2: Update Configuration Modal */}
      {isUpdateModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Update Configuration</h3>
                  <p className="text-xs text-slate-500">Modify {selectedItem.model} ({selectedItem.version})</p>
                </div>
              </div>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="mt-4 space-y-4">
              {/* Model */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  Model
                </label>
                <input
                  type="text"
                  value="Allocation"
                  disabled
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>

              {/* Version */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  Version
                </label>
                <input
                  type="text"
                  value={formVersion}
                  onChange={(e) => setFormVersion(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* Created by (Name) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  Created by (Name)
                </label>
                <input
                  type="text"
                  value={formCreatedBy}
                  onChange={(e) => setFormCreatedBy(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  State
                </label>
                <select
                  value={formState}
                  onChange={(e) => setFormState(e.target.value as ModelState)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending for approval">Pending for approval</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              {/* Benefit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  Benefit
                </label>
                <select
                  value={formBenefit}
                  onChange={(e) => setFormBenefit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                >
                  {AVAILABLE_BENEFITS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Regions Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Regions
                  </label>
                  <span className="text-[11px] font-mono font-semibold text-blue-600">
                    Selected: {formRegions.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {AVAILABLE_REGIONS.map((region) => {
                    const isChecked = formRegions.includes(region);
                    return (
                      <button
                        type="button"
                        key={region}
                        onClick={() => {
                          if (formRegions.includes(region)) {
                            if (formRegions.length <= 1) {
                              alert('Please keep at least one region.');
                              return;
                            }
                            setFormRegions(formRegions.filter((r) => r !== region));
                          } else {
                            setFormRegions([...formRegions, region]);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{region}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Partners Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Partners (2 - 5)
                  </label>
                  <span className="text-[11px] font-mono font-semibold text-blue-600">
                    Selected: {formPartners.length} / 5
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {AVAILABLE_PARTNERS.map((partner) => {
                    const isChecked = formPartners.includes(partner);
                    return (
                      <button
                        type="button"
                        key={partner}
                        onClick={() => togglePartnerSelection(partner)}
                        className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border text-left transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>{partner}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
