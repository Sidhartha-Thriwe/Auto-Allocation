import React, { useState } from 'react';
import { 
  ModelListingItem, 
  ModelWeightItem, 
  ModelParameterItem, 
  ModelAuditLog 
} from '../types';
import { 
  Layers, 
  Sliders, 
  Scale, 
  Cpu, 
  History, 
  HelpCircle, 
  Calendar, 
  Clock, 
  Users, 
  Globe, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCode2,
  Activity,
  Award,
  AlertTriangle,
  Info,
  Building2,
  Percent,
  Play
} from 'lucide-react';

interface ModelDetailSectionProps {
  model: ModelListingItem;
  onClose?: () => void;
  onUpdateClick?: () => void;
  onCloneClick?: () => void;
  onManualRunClick?: () => void;
}

type SectionTab = 'details' | 'configuration' | 'weights' | 'parameters' | 'logs';

export const ModelDetailSection: React.FC<ModelDetailSectionProps> = ({
  model,
  onClose,
  onUpdateClick,
  onCloneClick,
  onManualRunClick,
}) => {
  const [activeTab, setActiveTab] = useState<SectionTab>('details');
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  // Default fallback weights if not specifically populated
  const defaultWeights: ModelWeightItem[] = [
    { measure: 'Issue-free', weight: 3, shareOfS: '43%', definition: 'no-show, rating ≤ 2 (DSAT), fatal or normal complaint' },
    { measure: 'Guest rating', weight: 2, shareOfS: '29%', definition: '(continuous: rating / 5)' },
    { measure: 'On-time', weight: 1, shareOfS: '14%', definition: 'driver reached pickup > 10 min after schedule (back-to-back excused)' },
    { measure: 'Completed trips', weight: 1, shareOfS: '14%', definition: 'ride started but not completed' },
  ];

  const weightsToDisplay = model.weights && model.weights.length > 0 ? model.weights : defaultWeights;

  // Default fallback parameters if not populated
  const defaultParameters: ModelParameterItem[] = [
    {
      name: 'k',
      symbol: 'k',
      whatItControls: 'Soft-floor parameter. Scales distance from the worst-driver score so that below-average drivers are deprioritised without being hard-excluded. Higher value = flatter floor (more forgiving).',
      value: '0.05',
    },
    {
      name: 'α',
      symbol: 'α',
      whatItControls: 'Concentration / power parameter. Higher value pushes more bookings to top-scoring drivers; lower value spreads bookings more evenly across qualified drivers.',
      value: '2.0',
    },
    {
      name: 'N_min',
      symbol: 'N_min',
      whatItControls: 'Minimum completed trips required for a driver to receive a score. Drivers below this threshold are placed in the cold-start pool and bypass the scoring formula.',
      value: '10',
    },
    {
      name: 'Lookback window',
      symbol: 'T',
      whatItControls: 'Historical evaluation period for computing driver score metrics (days). Trips completed within this window feed into the 4 sub-score calculations.',
      value: '90 days',
    },
    {
      name: 'Decay rate',
      symbol: 'λ',
      whatItControls: 'Exponential decay applied to historical trips. More recent performance carries higher weight than older performance within the lookback window.',
      value: '0.01 / day',
    },
    {
      name: 'Cold-start baseline score',
      symbol: 'S_0',
      whatItControls: 'Default score assigned to drivers with fewer than N_min trips. Set to the fleet median so new drivers are treated fairly while confidence builds.',
      value: '0.50',
    },
    {
      name: 'Minimum allocation share',
      symbol: 'P_min',
      whatItControls: 'Hard minimum probability floor applied to any qualified driver, guaranteeing that all eligible drivers retain some non-zero chance of receiving a trip.',
      value: '0.02 (2%)',
    },
  ];

  const parametersToDisplay = model.parameters && model.parameters.length > 0 ? model.parameters : defaultParameters;

  // Default fallback logs if not populated
  const defaultLogs: ModelAuditLog[] = [
    {
      id: 'log-1',
      timestamp: `${model.updatedAt || '09 Oct 2026'}, 14:30 UTC`,
      actor: model.createdBy || 'Sidhartha Rajput',
      action: model.state === 'Published' ? 'Promoted to Production' : model.state === 'Pending for approval' ? 'Submitted for Approval' : 'Draft Saved',
      notes: `Configuration version ${model.version} for ${model.benefit} registered with ${model.partners.length} partners.`,
      statusBadge: model.state === 'Published' ? 'Live' : model.state,
    },
    {
      id: 'log-2',
      timestamp: `${model.createdAt || '01 Oct 2026'}, 09:15 UTC`,
      actor: model.createdBy || 'Sidhartha Rajput',
      action: 'Initial Specification Created',
      notes: `Baseline parameter calibration configured for regions ${(model.regions || ['UAE', 'KSA']).join(', ')}.`,
      statusBadge: 'Created',
    },
  ];

  const logsToDisplay = model.logs && model.logs.length > 0 ? model.logs : defaultLogs;

  // Helper dictionary of hover definitions for fields across tabs
  const FIELD_DEFINITIONS: Record<string, string> = {
    'Model Name': 'Core mathematical algorithm family responsible for automated booking distribution.',
    'Model Version': 'Semantic version tag tracking successive parameter iterations and weights revisions.',
    'Lifecycle State': 'Current operational state: Draft (in editing), Pending for approval (under review), or Published (serving production bookings).',
    'Benefit Scope': 'Target customer entitlement category handled by this allocation instance.',
    'Operating Regions': 'Geographic jurisdictions and airport corridors governed by this configuration.',
    'Assigned Partners': 'Transportation vendor networks whose driver supply is evaluated and routed by this model.',
    'Created By': 'Author and owner responsible for calibrating and submitting this model configuration.',
    'Created On': 'Initial creation date and timestamp in audit registry.',
    'Last Updated': 'Most recent revision or status transition timestamp.',
    'Date of Run': 'Evaluation trigger timing: runs against the booking confirmation timestamp or the physical passenger service date.',
    'Advance Days': 'Number of lead-time days ahead of flight/service arrival that allocation calculation triggers.',
    'Time of Day (UTC)': 'Scheduled hour and minute in coordinated universal time when batch optimization runs.',
    'Booking Base %': 'Percentage quota of total eligible airport bookings assigned via this algorithm.',
    'Avg Daily Impact': 'Estimated count of passengers & rides dispatched under this configuration daily.',
    'Chauffeur Fleet Size': 'Total count of vetted chauffeurs active within this model pool.',
    'Clone Ancestry': 'Parent model configuration version from which these initial hyperparameters were derived.',
  };

  const renderTooltip = (fieldName: string) => {
    const text = FIELD_DEFINITIONS[fieldName];
    if (!text) return null;
    return (
      <div className="relative inline-flex items-center ml-1 group">
        <HelpCircle 
          className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 cursor-help transition-colors" 
          onMouseEnter={() => setHoveredField(fieldName)}
          onMouseLeave={() => setHoveredField(null)}
        />
        {hoveredField === fieldName && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 p-2 bg-slate-900 text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none text-left leading-relaxed animate-in fade-in zoom-in-95 duration-150">
            <div className="font-semibold text-slate-200 mb-0.5 border-b border-slate-700 pb-0.5">{fieldName}</div>
            <p className="text-slate-300">{text}</p>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner with Model Version & Quick Summary */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black font-mono text-sm shadow-xs">
            {model.version}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {model.model} Configuration Specification
              </h3>
              {model.state === 'Published' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Published</span>
                </span>
              )}
              {model.state === 'Draft' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <FileCode2 className="w-3 h-3 text-slate-500" />
                  <span>Draft</span>
                </span>
              )}
              {model.state === 'Pending for approval' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Pending for approval</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Benefit: <strong className="text-slate-700 font-semibold">{model.benefit}</strong> &bull; Regions:{' '}
              <span className="font-semibold text-slate-700">{(model.regions || ['UAE', 'KSA']).join(', ')}</span> &bull; Author:{' '}
              <span className="text-slate-700 font-semibold">{model.createdBy || 'Sidhartha Rajput'}</span>
            </p>
          </div>
        </div>

        {/* Quick action controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onManualRunClick && (
            <button
              onClick={onManualRunClick}
              className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              title="Run manual simulation with this model"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Manual Run</span>
            </button>
          )}
          {onUpdateClick && (
            <button
              onClick={onUpdateClick}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Update
            </button>
          )}
          {onCloneClick && (
            <button
              onClick={onCloneClick}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Clone
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Collapse inspector"
            >
              Close &times;
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-4 sm:px-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'details'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          <button
            onClick={() => setActiveTab('configuration')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'configuration'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab('weights')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'weights'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Weights ({weightsToDisplay.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parameters')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'parameters'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Parameters ({parametersToDisplay.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs ({logsToDisplay.length})</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="p-5 sm:p-6 bg-slate-50/40 min-h-[280px]">
        {/* ========================================================= */}
        {/* TAB 1: DETAILS */}
        {/* ========================================================= */}
        {activeTab === 'details' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Grid of Key Properties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Field 1: Model Name */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <div className="flex items-center text-xs font-semibold">
                    <span>Model Name</span>
                    {renderTooltip('Model Name')}
                  </div>
                  <Sparkles className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm font-bold text-slate-900">{model.model}</div>
                <div className="text-[11px] text-slate-400 mt-1">Multi-factor Chauffeur Engine</div>
              </div>

              {/* Field 2: Version */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <div className="flex items-center text-xs font-semibold">
                    <span>Model Version</span>
                    {renderTooltip('Model Version')}
                  </div>
                  <FileCode2 className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm font-bold font-mono text-slate-900">{model.version}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {model.config?.clonedFrom ? `Derived from ${model.config.clonedFrom}` : 'Base configuration'}
                </div>
              </div>

              {/* Field 3: Lifecycle State */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <div className="flex items-center text-xs font-semibold">
                    <span>Lifecycle State</span>
                    {renderTooltip('Lifecycle State')}
                  </div>
                  <Activity className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm font-bold text-slate-900">{model.state}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {model.state === 'Published' ? 'Serving live airport bookings' : 'Staged in sandbox registry'}
                </div>
              </div>

              {/* Field 4: Benefit */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <div className="flex items-center text-xs font-semibold">
                    <span>Benefit Scope</span>
                    {renderTooltip('Benefit Scope')}
                  </div>
                  <Award className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm font-bold text-slate-900">{model.benefit}</div>
                <div className="text-[11px] text-slate-400 mt-1">Fixed premium entitlement</div>
              </div>
            </div>

            {/* Geographic & Fleet Scope Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Operating Regions */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-xs font-bold text-slate-700">
                    <Globe className="w-4 h-4 text-blue-600 mr-2" />
                    <span>Operating Regions</span>
                    {renderTooltip('Operating Regions')}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {(model.regions || ['UAE', 'KSA']).length} active zones
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(model.regions && model.regions.length > 0 ? model.regions : ['UAE', 'KSA']).map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80"
                    >
                      <Globe className="w-3 h-3 text-blue-600 mr-1.5" />
                      {r}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  Only trip bookings and chauffeur partners located within these approved jurisdictions are eligible for auto-allocation via this model.
                </p>
              </div>

              {/* Assigned Partners */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-xs font-bold text-slate-700">
                    <Building2 className="w-4 h-4 text-purple-600 mr-2" />
                    <span>Assigned Partners</span>
                    {renderTooltip('Assigned Partners')}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {model.partners.length} vendor partners
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {model.partners.map((p, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      <Building2 className="w-3 h-3 text-slate-500 mr-1.5" />
                      {p}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  Chauffeurs affiliated with these authorized suppliers are ranked continuously using the algorithm's weighted measures.
                </p>
              </div>
            </div>

            {/* Author & Audit Timestamps */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                  {(model.createdBy || 'SR')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center text-xs font-bold text-slate-900">
                    <span>Created by: {model.createdBy || 'Sidhartha Rajput'}</span>
                    {renderTooltip('Created By')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Senior Allocation Engineer &bull; Operations Technology</div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider font-semibold">Created On</span>
                  <span className="font-semibold text-slate-800">{model.createdAt || '01 Oct 2026'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider font-semibold">Last Updated</span>
                  <span className="font-semibold text-slate-800">{model.updatedAt || '09 Oct 2026'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CONFIGURATION */}
        {/* ========================================================= */}
        {activeTab === 'configuration' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cadence: Date of run */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <div className="flex items-center text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                    <span>Date of run</span>
                    {renderTooltip('Date of Run')}
                  </div>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {model.config?.dateOfRun || 'Service Date'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Triggers evaluation relative to customer flight arrival date.
                </p>
              </div>

              {/* Advance Days */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <div className="flex items-center text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                    <span>Advance days</span>
                    {renderTooltip('Advance Days')}
                  </div>
                </div>
                <div className="text-base font-bold text-slate-900 font-mono">
                  {model.config?.advanceDays ?? 2} days
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lead time in whole days prior to ride execution.
                </p>
              </div>

              {/* Time of Day (UTC) */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <div className="flex items-center text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                    <span>Time of day (UTC)</span>
                    {renderTooltip('Time of Day (UTC)')}
                  </div>
                </div>
                <div className="text-base font-bold text-slate-900 font-mono">
                  {model.config?.timeOfDayUTC || '04:00 UTC'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Daily batch computation window in UTC.
                </p>
              </div>

              {/* Booking Base % */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <div className="flex items-center text-xs font-semibold">
                    <Percent className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                    <span>Booking Base %</span>
                    {renderTooltip('Booking Base %')}
                  </div>
                </div>
                <div className="text-base font-bold text-slate-900 font-mono">
                  {model.config?.bookingBasePercent ?? 80}%
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Portion of eligible demand dispatched via this algorithm.
                </p>
              </div>
            </div>

            {/* Impact & Fleet Pool Calculation Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center">
                    <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                    Daily Volume & Fleet Coverage
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Operational impact metrics calculated from current airport reservation pipeline
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center justify-end text-xs text-slate-500 font-semibold">
                      <span>Avg daily bookings impacted</span>
                      {renderTooltip('Avg Daily Impact')}
                    </div>
                    <div className="text-xl font-black font-mono text-blue-600">
                      ~{model.config?.avgDailyBookingsImpacted ?? 152} rides/day
                    </div>
                  </div>

                  <div className="text-right border-l border-slate-200 pl-6">
                    <div className="flex items-center justify-end text-xs text-slate-500 font-semibold">
                      <span>Target chauffeur fleet</span>
                      {renderTooltip('Chauffeur Fleet Size')}
                    </div>
                    <div className="text-xl font-black font-mono text-purple-600">
                      {model.config?.chauffeurCount ?? 38} drivers
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress visualizer for booking base */}
              <div className="mt-4 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span>Fleet Allocation Quota Share</span>
                  <span className="font-mono text-slate-900 font-bold">{model.config?.bookingBasePercent ?? 80}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${model.config?.bookingBasePercent ?? 80}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>0% (Manual dispatch)</span>
                  <span>50%</span>
                  <span>100% (Full automated allocation)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: WEIGHTS */}
        {/* ========================================================= */}
        {activeTab === 'weights' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Performance Scoring Measures & Weights
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sub-score components used to calculate composite driver quality index $S_i$. Hover over any measure for definition.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
                  Total Weight: {weightsToDisplay.reduce((acc, w) => acc + w.weight, 0)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Measure (Hover for Definition)</th>
                      <th className="py-3 px-4 text-center">Weight</th>
                      <th className="py-3 px-4 text-center">Share of S</th>
                      <th className="py-3 px-4">Formula Definition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {weightsToDisplay.map((w, index) => (
                      <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 font-semibold">{index + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="relative inline-flex items-center group cursor-help">
                            <span className="underline decoration-dotted decoration-slate-400 underline-offset-4">
                              {w.measure}
                            </span>
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 ml-1.5 transition-colors" />
                            {/* Hover tooltip */}
                            <div className="absolute left-0 bottom-full mb-2 z-50 hidden group-hover:block w-72 p-2.5 bg-slate-900 text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none leading-relaxed animate-in fade-in zoom-in-95 duration-150">
                              <div className="font-bold text-amber-300 mb-1">{w.measure}</div>
                              <p className="text-slate-200">{w.definition}</p>
                              <div className="absolute left-6 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-black text-slate-900">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 border border-slate-200">
                            {w.weight}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs">
                            {w.shareOfS}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                          {w.definition}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Composite Score Equation Card */}
            <div className="bg-white rounded-xl p-4.5 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Driver Composite Score Equation
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Equation 1</span>
              </div>
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs overflow-x-auto">
                <code className="text-emerald-400">
                  {`S_i = (3·M_{Issue-free} + 2·M_{Rating} + 1·M_{On-time} + 1·M_{Completed}) / (3 + 2 + 1 + 1)`}
                </code>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Calculated for drivers exceeding threshold N_min. Scores normalize to [0, 1] before exponential concentration.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PARAMETERS */}
        {/* ========================================================= */}
        {activeTab === 'parameters' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Algorithm Tuning Parameters
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mathematical constants controlling probability curvature, lookback windows, and cold-start baselines.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
                  {parametersToDisplay.length} Parameters
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">Parameter (Hover for Definition)</th>
                      <th className="py-3 px-4 text-center">Value</th>
                      <th className="py-3 px-4">Operational Definition & What It Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {parametersToDisplay.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="relative inline-flex items-center group cursor-help">
                            <span className="underline decoration-dotted decoration-slate-400 underline-offset-4">
                              {p.name}
                            </span>
                            {p.symbol && (
                              <span className="ml-1.5 font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                {p.symbol}
                              </span>
                            )}
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 ml-1.5 transition-colors" />
                            {/* Hover tooltip */}
                            <div className="absolute left-0 bottom-full mb-2 z-50 hidden group-hover:block w-80 p-2.5 bg-slate-900 text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none leading-relaxed animate-in fade-in zoom-in-95 duration-150">
                              <div className="font-bold text-blue-300 mb-1">{p.name} ({p.symbol || 'param'})</div>
                              <p className="text-slate-200">{p.whatItControls}</p>
                              <div className="absolute left-6 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs">
                            {p.value}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px] leading-relaxed max-w-xl">
                          {p.whatItControls}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complete Algorithm Probability Equation */}
            <div className="bg-white rounded-xl p-4.5 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Allocation Probability Equation
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Equation 2 (Softmax with soft floor & power)</span>
              </div>
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono text-xs overflow-x-auto">
                <code className="text-blue-400">
                  {`P_i = (1 - P_min · |D|) · [ (S_i - min(S) + k)^α / Σ (S_j - min(S) + k)^α ] + P_min`}
                </code>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Guarantees P_i ≥ P_min floor while distributing bulk booking probability strictly proportional to elevated driver satisfaction score.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: LOGS */}
        {/* ========================================================= */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Model Audit & Lifecycle Event Log
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable activity log tracking parameter submissions, author approvals, and live promotions.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
                  {logsToDisplay.length} Records
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {logsToDisplay.map((log) => (
                  <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        {log.statusBadge && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.statusBadge === 'Live' || log.statusBadge === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.statusBadge === 'Approved'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : log.statusBadge === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {log.statusBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[12px]">{log.notes}</p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                        <span>Actor: <strong className="text-slate-600 font-semibold">{log.actor}</strong></span>
                        <span>&bull;</span>
                        <span className="font-mono">{log.timestamp}</span>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <span className="text-[11px] font-mono text-slate-400">ID: {log.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
