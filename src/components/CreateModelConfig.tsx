import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sliders, 
  Scale, 
  CheckCircle2, 
  Info, 
  Save, 
  Send, 
  Building2, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Activity, 
  Search, 
  Sparkles,
  Layers,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';
import { ModelListingItem, ModelState } from '../types';

interface CreateModelConfigProps {
  onBackToModelListing: () => void;
  onBackToDashboard: () => void;
  onSaveModel: (item: ModelListingItem, isApproval: boolean) => void;
  existingModels: ModelListingItem[];
}

export interface ChauffeurItem {
  id: string;
  name: string;
  partner: string;
  region: string;
  rating: number;
}

const AVAILABLE_REGIONS = ['UAE', 'KSA', 'India', 'London', 'Australia'];

const AVAILABLE_PARTNERS = [
  'Biztravex',
  'AB Transfer',
  'White whale',
  'KTC',
  'Truway',
  'Apex Limousine',
  'EcoFleet'
];

const ALL_CHAUFFEURS: ChauffeurItem[] = [
  { id: 'ch-1', name: 'Rashid Al-Maktoum', partner: 'Biztravex', region: 'UAE', rating: 4.9 },
  { id: 'ch-2', name: 'Mohammed Al-Fassi', partner: 'AB Transfer', region: 'UAE', rating: 4.8 },
  { id: 'ch-3', name: 'Tariq Mansoor', partner: 'White whale', region: 'UAE', rating: 4.95 },
  { id: 'ch-4', name: 'Ahmed Al-Sayed', partner: 'KTC', region: 'UAE', rating: 4.85 },
  { id: 'ch-5', name: 'Zaid Al-Nuaimi', partner: 'Truway', region: 'UAE', rating: 4.75 },
  { id: 'ch-6', name: 'Khalid Bilal', partner: 'Apex Limousine', region: 'UAE', rating: 4.9 },
  { id: 'ch-7', name: 'Youssef Haddad', partner: 'EcoFleet', region: 'UAE', rating: 4.8 },
  { id: 'ch-8', name: 'Sameer Khan', partner: 'KTC', region: 'UAE', rating: 4.92 },
  { id: 'ch-9', name: 'Faisal Al-Hassan', partner: 'Biztravex', region: 'UAE', rating: 4.88 },
  
  { id: 'ch-10', name: 'Rajesh Sharma', partner: 'Biztravex', region: 'India', rating: 4.94 },
  { id: 'ch-11', name: 'Vikram Malhotra', partner: 'White whale', region: 'India', rating: 4.96 },
  { id: 'ch-12', name: 'Avinash QA Test', partner: 'Truway', region: 'India', rating: 4.7 },
  { id: 'ch-13', name: 'Rajesh Verma', partner: 'White whale', region: 'India', rating: 4.98 },
  { id: 'ch-14', name: 'Arjun Kapoor', partner: 'AB Transfer', region: 'India', rating: 4.85 },
  { id: 'ch-15', name: 'Deepak Verma', partner: 'KTC', region: 'India', rating: 4.91 },
  { id: 'ch-16', name: 'Suresh Patel', partner: 'Apex Limousine', region: 'India', rating: 4.82 },
  { id: 'ch-17', name: 'Manoj Gupta', partner: 'EcoFleet', region: 'India', rating: 4.79 },
  { id: 'ch-18', name: 'Rohan Joshi', partner: 'Biztravex', region: 'India', rating: 4.89 },

  { id: 'ch-19', name: 'Fahad Al-Otaibi', partner: 'White whale', region: 'KSA', rating: 4.93 },
  { id: 'ch-20', name: 'Sultan Al-Ghamdi', partner: 'AB Transfer', region: 'KSA', rating: 4.87 },
  { id: 'ch-21', name: 'Abdullah Al-Shehri', partner: 'Biztravex', region: 'KSA', rating: 4.91 },
  { id: 'ch-22', name: 'Saud Al-Dossary', partner: 'Apex Limousine', region: 'KSA', rating: 4.86 },
  { id: 'ch-23', name: 'Omar Al-Harbi', partner: 'KTC', region: 'KSA', rating: 4.8 },
  { id: 'ch-24', name: 'Mansoor Al-Rashid', partner: 'Truway', region: 'KSA', rating: 4.78 },
  { id: 'ch-25', name: 'Hassan Al-Mutawa', partner: 'Biztravex', region: 'KSA', rating: 4.84 },

  { id: 'ch-26', name: 'James Sterling', partner: 'White whale', region: 'London', rating: 4.97 },
  { id: 'ch-27', name: 'Oliver Smith', partner: 'AB Transfer', region: 'London', rating: 4.92 },
  { id: 'ch-28', name: 'David Wilson', partner: 'Apex Limousine', region: 'London', rating: 4.89 },
  { id: 'ch-29', name: 'George Clarke', partner: 'EcoFleet', region: 'London', rating: 4.83 },
  { id: 'ch-30', name: 'Thomas Wright', partner: 'Biztravex', region: 'London', rating: 4.91 },
  { id: 'ch-31', name: 'Harry Evans', partner: 'Truway', region: 'London', rating: 4.87 },
  { id: 'ch-32', name: 'William Turner', partner: 'KTC', region: 'London', rating: 4.86 },

  { id: 'ch-33', name: 'Jack Thompson', partner: 'Biztravex', region: 'Australia', rating: 4.95 },
  { id: 'ch-34', name: 'Liam Davies', partner: 'AB Transfer', region: 'Australia', rating: 4.9 },
  { id: 'ch-35', name: 'Noah Wilson', partner: 'White whale', region: 'Australia', rating: 4.94 },
  { id: 'ch-36', name: 'Ethan Taylor', partner: 'EcoFleet', region: 'Australia', rating: 4.82 },
  { id: 'ch-37', name: 'Lucas Martin', partner: 'Apex Limousine', region: 'Australia', rating: 4.88 },
  { id: 'ch-38', name: 'Benjamin Scott', partner: 'KTC', region: 'Australia', rating: 4.85 },
  { id: 'ch-39', name: 'Alexander Lee', partner: 'Truway', region: 'Australia', rating: 4.81 },

  { id: 'ch-40', name: 'Bilal Farooq', partner: 'AB Transfer', region: 'UAE', rating: 4.89 },
  { id: 'ch-41', name: 'Kareem Mostafa', partner: 'White whale', region: 'UAE', rating: 4.92 },
  { id: 'ch-42', name: 'Harpreet Singh', partner: 'Biztravex', region: 'India', rating: 4.93 },
  { id: 'ch-43', name: 'Charles Edwards', partner: 'Apex Limousine', region: 'London', rating: 4.88 },
  { id: 'ch-44', name: 'Mason Clark', partner: 'EcoFleet', region: 'Australia', rating: 4.84 },
  { id: 'ch-45', name: 'Adnan Zafar', partner: 'KTC', region: 'KSA', rating: 4.87 },
];

interface ParameterRow {
  name: string;
  symbol: string;
  whatItControls: string;
  value: string;
}

// Micro tooltip component for field labels (shows strictly on hover)
const LabelWithTooltip: React.FC<{
  label: string;
  required?: boolean;
  tooltip: string;
  badge?: string;
}> = ({ label, required, tooltip, badge }) => (
  <div className="flex items-center gap-1.5 mb-1.5">
    <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider font-mono">
      {label} {required && <span className="text-neutral-900">*</span>}
    </label>
    {badge && (
      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded font-semibold border border-neutral-200">
        {badge}
      </span>
    )}
    <div className="relative inline-flex items-center group cursor-help">
      <Info className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
      <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-50 w-64 p-2 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl text-[11px] font-normal leading-relaxed border border-neutral-700 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900"></div>
      </div>
    </div>
  </div>
);

export const CreateModelConfig: React.FC<CreateModelConfigProps> = ({
  onBackToModelListing,
  onBackToDashboard,
  onSaveModel,
  existingModels,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1 STATE
  const [selectedModel] = useState<'Allocation'>('Allocation');
  const [clonedVersionId, setClonedVersionId] = useState<string>('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['UAE', 'India', 'London']);
  const [selectedPartners, setSelectedPartners] = useState<string[]>(['Biztravex', 'AB Transfer', 'White whale', 'KTC']);
  const [selectedChauffeurIds, setSelectedChauffeurIds] = useState<string[]>(
    ALL_CHAUFFEURS.slice(0, 42).map((c) => c.id)
  );
  const [chauffeurSearch, setChauffeurSearch] = useState('');
  const [isChauffeurDrawerOpen, setIsChauffeurDrawerOpen] = useState(false);
  const [dateOfRun, setDateOfRun] = useState<'Booking Date' | 'Service Date'>('Service Date');
  const [advanceDays, setAdvanceDays] = useState<number>(2);
  const [timeOfDayUTC, setTimeOfDayUTC] = useState<string>('04:00');
  const [bookingBasePercent, setBookingBasePercent] = useState<number>(75);
  
  // Auto-computed version identifier (computed based on existing configurations or clone)
  const defaultNextVersion = useMemo(() => {
    let highestMajor = 2;
    let highestMinor = 0;
    existingModels.forEach((m) => {
      const match = m.version.match(/v(\d+)\.(\d+)/);
      if (match) {
        const maj = parseInt(match[1], 10);
        const min = parseInt(match[2], 10);
        if (maj > highestMajor || (maj === highestMajor && min > highestMinor)) {
          highestMajor = maj;
          highestMinor = min;
        }
      }
    });
    return `v${highestMajor}.${highestMinor + 1}`;
  }, [existingModels]);

  const [modelTargetVersion, setModelTargetVersion] = useState<string>('');
  const activeVersion = modelTargetVersion || defaultNextVersion;

  // STEP 2 STATE: Weights & Parameters
  const [weights, setWeights] = useState<{ [key: string]: number }>({
    'Issue-free': 3,
    'Guest rating': 2,
    'On-time': 1,
    'Completed trips': 1,
  });

  const weightDefinitions: { [key: string]: string } = {
    'Issue-free': 'Zero no-show, DSAT (rating ≤ 2), and complaint-free deliveries.',
    'Guest rating': 'Continuous customer score (rating out of 5).',
    'On-time': 'Arrival at pickup ≤ 10 min after schedule (back-to-back excused).',
    'Completed trips': 'Trip successfully started and completed without abort.',
  };

  const [parameters, setParameters] = useState<ParameterRow[]>([
    {
      name: 'k',
      symbol: 'k',
      whatItControls: 'Soft-floor parameter. Scales distance from worst-driver score so below-average drivers are deprioritised without hard exclusion.',
      value: '0.05',
    },
    {
      name: 'α',
      symbol: 'α',
      whatItControls: 'Power concentration parameter. Higher pushes more bookings to top drivers; lower distributes evenly.',
      value: '2.0',
    },
    {
      name: 'N_min',
      symbol: 'N_min',
      whatItControls: 'Minimum completed trips for scoring qualification. Drivers below this enter cold-start pool.',
      value: '10',
    },
    {
      name: 'Lookback window',
      symbol: 'T',
      whatItControls: 'Historical evaluation period (days) used to compute metric performance.',
      value: '90 days',
    },
    {
      name: 'Decay rate',
      symbol: 'λ',
      whatItControls: 'Exponential decay applied to historical trips. Recent performance carries higher priority.',
      value: '0.01 / day',
    },
    {
      name: 'Cold-start baseline score',
      symbol: 'S_0',
      whatItControls: 'Default score for drivers with fewer than N_min trips. Aligned with fleet median.',
      value: '0.50',
    },
    {
      name: 'Minimum allocation share',
      symbol: 'P_min',
      whatItControls: 'Hard minimum probability floor ensuring all qualified drivers have a non-zero chance of trip dispatch.',
      value: '0.02 (2%)',
    },
  ]);

  // Calculations
  const totalFleetDailyVolume = 190;
  const avgDailyBookingsImpacted = Math.round((totalFleetDailyVolume * bookingBasePercent) / 100);

  const totalWeight = useMemo(() => {
    return Object.values(weights).reduce((a, b) => a + b, 0);
  }, [weights]);

  const shareOfSMap = useMemo(() => {
    const items = ['Issue-free', 'Guest rating', 'On-time', 'Completed trips'];
    const res: { [key: string]: string } = {};
    if (weights['Issue-free'] === 3 && weights['Guest rating'] === 2 && weights['On-time'] === 1 && weights['Completed trips'] === 1) {
      res['Issue-free'] = '43%';
      res['Guest rating'] = '29%';
      res['On-time'] = '14%';
      res['Completed trips'] = '14%';
    } else {
      items.forEach((key) => {
        const val = weights[key] || 0;
        const pct = totalWeight > 0 ? Math.round((val / totalWeight) * 100) : 0;
        res[key] = `${pct}%`;
      });
    }
    return res;
  }, [weights, totalWeight]);

  // Clone from existing version dropdown handler
  const handleCloneSelect = (modelId: string) => {
    setClonedVersionId(modelId);
    if (!modelId) return;

    const source = existingModels.find((m) => m.id === modelId);
    if (source) {
      const match = source.version.match(/v(\d+)\.(\d+)/);
      if (match) {
        const major = match[1];
        const minor = parseInt(match[2], 10) + 1;
        setModelTargetVersion(`v${major}.${minor}`);
      } else {
        setModelTargetVersion(`${source.version}.1`);
      }

      if (source.partners && source.partners.length > 0) {
        setSelectedPartners(source.partners);
      }
      if (source.regions && source.regions.length > 0) {
        setSelectedRegions(source.regions);
      }
    }
  };

  const toggleRegion = (region: string) => {
    if (selectedRegions.includes(region)) {
      if (selectedRegions.length <= 1) return;
      setSelectedRegions(selectedRegions.filter((r) => r !== region));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  const togglePartner = (partner: string) => {
    if (selectedPartners.includes(partner)) {
      if (selectedPartners.length <= 1) return;
      setSelectedPartners(selectedPartners.filter((p) => p !== partner));
    } else {
      setSelectedPartners([...selectedPartners, partner]);
    }
  };

  const filteredChauffeurs = useMemo(() => {
    return ALL_CHAUFFEURS.filter((c) => {
      const matchSearch =
        chauffeurSearch.trim() === '' ||
        c.name.toLowerCase().includes(chauffeurSearch.toLowerCase()) ||
        c.partner.toLowerCase().includes(chauffeurSearch.toLowerCase()) ||
        c.region.toLowerCase().includes(chauffeurSearch.toLowerCase());
      const matchPartner = selectedPartners.length === 0 || selectedPartners.includes(c.partner);
      const matchRegion = selectedRegions.length === 0 || selectedRegions.includes(c.region);
      return matchSearch && matchPartner && matchRegion;
    });
  }, [chauffeurSearch, selectedPartners, selectedRegions]);

  const toggleChauffeur = (id: string) => {
    if (selectedChauffeurIds.includes(id)) {
      setSelectedChauffeurIds(selectedChauffeurIds.filter((cId) => cId !== id));
    } else {
      setSelectedChauffeurIds([...selectedChauffeurIds, id]);
    }
  };

  const handleSelectAllChauffeurs = () => {
    const ids = filteredChauffeurs.map((c) => c.id);
    setSelectedChauffeurIds(Array.from(new Set([...selectedChauffeurIds, ...ids])));
  };

  const handleDeselectAllChauffeurs = () => {
    const idsToRemove = new Set(filteredChauffeurs.map((c) => c.id));
    setSelectedChauffeurIds(selectedChauffeurIds.filter((id) => !idsToRemove.has(id)));
  };

  const validateStep1 = () => {
    if (selectedRegions.length === 0) {
      alert('Please select at least one Region.');
      return false;
    }
    if (selectedPartners.length === 0) {
      alert('Please select at least one Partner.');
      return false;
    }
    if (advanceDays < 0 || isNaN(advanceDays)) {
      alert('Advance days must be a whole number 0 or greater.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
    else onBackToModelListing();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (isApproval: boolean) => {
    if (!validateStep1()) {
      if (currentStep !== 1) setCurrentStep(1);
      return;
    }

    const state: ModelState = isApproval ? 'Pending for approval' : 'Draft';
    const versionLabel = activeVersion;

    const newConfigItem: ModelListingItem = {
      id: `model-${Date.now()}`,
      model: 'Allocation',
      version: versionLabel,
      state: state,
      benefit: 'Airport Transfer',
      regions: selectedRegions,
      partners: selectedPartners.slice(0, 5),
      createdBy: 'Sidhartha Rajput',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      config: {
        dateOfRun: dateOfRun,
        advanceDays: advanceDays,
        timeOfDayUTC: timeOfDayUTC,
        bookingBasePercent: bookingBasePercent,
        avgDailyBookingsImpacted: avgDailyBookingsImpacted,
        chauffeurCount: selectedChauffeurIds.length,
        clonedFrom: clonedVersionId ? existingModels.find((m) => m.id === clonedVersionId)?.version : undefined,
      },
      weights: [
        { measure: 'Issue-free', weight: weights['Issue-free'], shareOfS: shareOfSMap['Issue-free'], definition: weightDefinitions['Issue-free'] },
        { measure: 'Guest rating', weight: weights['Guest rating'], shareOfS: shareOfSMap['Guest rating'], definition: weightDefinitions['Guest rating'] },
        { measure: 'On-time', weight: weights['On-time'], shareOfS: shareOfSMap['On-time'], definition: weightDefinitions['On-time'] },
        { measure: 'Completed trips', weight: weights['Completed trips'], shareOfS: shareOfSMap['Completed trips'], definition: weightDefinitions['Completed trips'] },
      ],
      parameters: parameters.map((p) => ({
        name: p.name,
        symbol: p.symbol,
        whatItControls: p.whatItControls,
        value: p.value,
      })),
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${timeOfDayUTC} UTC`,
          actor: 'Sidhartha Rajput',
          action: isApproval ? 'Submitted for Approval' : 'Saved as Draft',
          notes: isApproval
            ? `Submitted ${versionLabel} for operational review across ${selectedRegions.join(', ')}.`
            : `Created draft configuration for ${versionLabel} with ${selectedPartners.length} partners and ${selectedChauffeurIds.length} chauffeurs.`,
          statusBadge: isApproval ? 'Pending' : 'Draft',
        },
      ],
    };

    onSaveModel(newConfigItem, isApproval);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header & Breadcrumbs - Monochrome Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 mb-1">
            <button onClick={onBackToDashboard} className="hover:text-neutral-800 transition-colors cursor-pointer">
              Dashboard
            </button>
            <span>/</span>
            <button onClick={onBackToModelListing} className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium cursor-pointer">
              Model Listing
            </button>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">New Configuration</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Add Configuration
            </h1>
          </div>
        </div>

        <button
          onClick={onBackToModelListing}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Stepper: Apple-style Monochrome Pill Bar */}
      <div className="bg-neutral-100 p-1 rounded-xl border border-neutral-200/80">
        <div className="grid grid-cols-3 gap-1">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/90'
                : currentStep > 1
                ? 'text-neutral-700 hover:bg-neutral-200/50'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
              currentStep === 1 ? 'bg-neutral-900 text-white font-bold' : currentStep > 1 ? 'bg-neutral-800 text-white font-bold' : 'bg-neutral-300 text-neutral-600'
            }`}>
              {currentStep > 1 ? <Check className="w-2.5 h-2.5" /> : '1'}
            </span>
            <span className="truncate">1. Model Details</span>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => { if (validateStep1()) setCurrentStep(2); }}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/90'
                : currentStep > 2
                ? 'text-neutral-700 hover:bg-neutral-200/50'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
              currentStep === 2 ? 'bg-neutral-900 text-white font-bold' : currentStep > 2 ? 'bg-neutral-800 text-white font-bold' : 'bg-neutral-300 text-neutral-600'
            }`}>
              {currentStep > 2 ? <Check className="w-2.5 h-2.5" /> : '2'}
            </span>
            <span className="truncate">2. Weights & Parameters</span>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => { if (validateStep1()) setCurrentStep(3); }}
            className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/90'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
              currentStep === 3 ? 'bg-neutral-900 text-white font-bold' : 'bg-neutral-300 text-neutral-600'
            }`}>
              3
            </span>
            <span className="truncate">3. Review</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: MODEL DETAILS (Monochrome Greyscale Minimal)           */}
      {/* ============================================================== */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {/* Card 1: Core Configuration */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-neutral-600" />
                <span>Core Configuration</span>
              </h2>
              <span className="text-[11px] font-mono text-neutral-400">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Model */}
              <div>
                <LabelWithTooltip
                  label="Model"
                  tooltip="Supply vs demand matching algorithm for optimal trip allocation."
                  badge="Fixed"
                />
                <input
                  type="text"
                  value="Allocation"
                  disabled
                  className="w-full px-3 py-2 text-xs font-semibold bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-500 cursor-not-allowed font-mono"
                />
              </div>

              {/* Clone Source */}
              <div>
                <LabelWithTooltip
                  label="Clone Source"
                  tooltip="Optional. Inherit parameters, weights, and partner selections from an existing version with a single click."
                />
                <select
                  value={clonedVersionId}
                  onChange={(e) => handleCloneSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:border-neutral-900 cursor-pointer"
                >
                  <option value="">Start from scratch</option>
                  {existingModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.version} ({m.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Regions, Partners & Chauffeur Pool */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                <span>Geographic & Fleet Scope</span>
              </h2>
              <span className="text-[11px] font-mono font-semibold text-neutral-600">
                {selectedRegions.length} Regions &bull; {selectedPartners.length} Partners
              </span>
            </div>

            {/* Regions Toggle Chips (Greyscale / Apple-like) */}
            <div>
              <LabelWithTooltip
                label="Regions"
                required
                tooltip="Select geographic deployment zones. Allocation will run exclusively across selected territories."
              />
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_REGIONS.map((region) => {
                  const isChecked = selectedRegions.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border font-medium transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-neutral-900 border-neutral-900 text-white shadow-2xs'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      <span>{region}</span>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Partners Toggle Chips (Greyscale) */}
            <div>
              <LabelWithTooltip
                label="Partners"
                required
                tooltip="Active supplier fleets included in the scoring run pool."
              />
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PARTNERS.map((partner) => {
                  const isChecked = selectedPartners.includes(partner);
                  return (
                    <button
                      key={partner}
                      type="button"
                      onClick={() => togglePartner(partner)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border font-medium transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-neutral-900 border-neutral-900 text-white shadow-2xs'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      <Building2 className={`w-3.5 h-3.5 ${isChecked ? 'text-neutral-300' : 'text-neutral-400'}`} />
                      <span>{partner}</span>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chauffeur Pool Summary */}
            <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-neutral-600" />
                <div className="text-xs">
                  <span className="font-semibold text-neutral-900">{selectedChauffeurIds.length} of {ALL_CHAUFFEURS.length} Chauffeurs</span>
                  <span className="text-neutral-500 ml-1">in qualified pool</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChauffeurDrawerOpen(!isChauffeurDrawerOpen)}
                className="text-xs text-neutral-700 hover:text-neutral-950 font-semibold underline cursor-pointer self-start sm:self-auto"
              >
                {isChauffeurDrawerOpen ? 'Hide Chauffeurs' : 'Filter Individual Chauffeurs'}
              </button>
            </div>

            {/* Expandable Chauffeur Drawer */}
            {isChauffeurDrawerOpen && (
              <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={chauffeurSearch}
                      onChange={(e) => setChauffeurSearch(e.target.value)}
                      placeholder="Search chauffeurs..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                    <button type="button" onClick={handleSelectAllChauffeurs} className="text-neutral-800 hover:underline cursor-pointer">
                      Select All
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button type="button" onClick={handleDeselectAllChauffeurs} className="text-neutral-500 hover:underline cursor-pointer">
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 p-1">
                  {filteredChauffeurs.map((ch) => {
                    const isChecked = selectedChauffeurIds.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChauffeur(ch.id)}
                        className={`p-2 rounded-md border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isChecked ? 'bg-white border-neutral-900 text-neutral-900 font-medium' : 'bg-neutral-100/70 border-neutral-200 text-neutral-500'
                        }`}
                      >
                        <span className="truncate">{ch.name} ({ch.region})</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Execution Cadence & Volume */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-600" />
                <span>Execution Cadence & Volume</span>
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                <Activity className="w-3.5 h-3.5 text-neutral-500" />
                <span>~{avgDailyBookingsImpacted} trips/day</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Date of Run */}
              <div>
                <LabelWithTooltip
                  label="Date of Run"
                  required
                  tooltip="Anchor date for batch dispatch execution: Service Date (ahead of trip) or Booking Date (at creation)."
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDateOfRun('Service Date')}
                    className={`py-2 px-2 text-xs rounded-lg font-semibold border transition-colors cursor-pointer text-center ${
                      dateOfRun === 'Service Date'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    Service Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateOfRun('Booking Date')}
                    className={`py-2 px-2 text-xs rounded-lg font-semibold border transition-colors cursor-pointer text-center ${
                      dateOfRun === 'Booking Date'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    Booking Date
                  </button>
                </div>
              </div>

              {/* Advance Days */}
              <div>
                <LabelWithTooltip
                  label="Advance Days"
                  required
                  tooltip="Number of days in advance of the service date that the algorithm triggers."
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={advanceDays}
                    onChange={(e) => setAdvanceDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2 text-xs font-semibold font-mono bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:border-neutral-900"
                  />
                  <span className="text-xs text-neutral-500 shrink-0 font-medium">days prior</span>
                </div>
              </div>

              {/* Run Time UTC */}
              <div>
                <LabelWithTooltip
                  label="Run Time (UTC)"
                  required
                  tooltip="Execution clock time in Universal Time Coordinated (00:00 - 23:59)."
                />
                <input
                  type="time"
                  value={timeOfDayUTC}
                  onChange={(e) => setTimeOfDayUTC(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold font-mono bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:border-neutral-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Booking Base % slider */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between">
                <LabelWithTooltip
                  label="Booking Base %"
                  tooltip="Proportion of total bookings routed through this automated scoring model versus manual fallback."
                />
                <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                  {bookingBasePercent}% (~{avgDailyBookingsImpacted} trips/day)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={bookingBasePercent}
                onChange={(e) => setBookingBasePercent(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>10% (Test)</span>
                <span>50%</span>
                <span>75% (Recommended)</span>
                <span>100% (Fleet-wide)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: WEIGHTS & PARAMETERS (Monochrome Greyscale Minimal)    */}
      {/* ============================================================== */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {/* Card 1: Performance Measures & Weights */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-neutral-600" />
                <span>Performance Scoring Weights</span>
              </h2>
              <span className="text-xs font-mono font-semibold bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded border border-neutral-200">
                Sum: {totalWeight} (100% Share of S)
              </span>
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="py-2.5 px-4">Performance Measure</th>
                    <th className="py-2.5 px-4 w-32">Weight</th>
                    <th className="py-2.5 px-4 w-40 text-right">Share of Score S</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {Object.entries(weights).map(([measure, wt]) => (
                    <tr key={measure} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-neutral-900">
                        <div className="flex items-center gap-1.5">
                          <span>{measure}</span>
                          <div className="relative inline-flex items-center group cursor-help">
                            <Info className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                            <div className="hidden group-hover:block absolute left-0 bottom-full mb-1 z-50 w-72 p-2 bg-neutral-900 text-white rounded-lg shadow-xl text-[11px] font-normal leading-relaxed border border-neutral-700 pointer-events-none">
                              {weightDefinitions[measure]}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={wt}
                          onChange={(e) =>
                            setWeights({
                              ...weights,
                              [measure]: Math.max(1, parseInt(e.target.value, 10) || 1),
                            })
                          }
                          className="w-16 px-2 py-1 text-xs font-bold font-mono bg-white border border-neutral-300 rounded text-neutral-900 text-center focus:outline-hidden focus:border-neutral-900"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="font-mono font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                          {shareOfSMap[measure]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Algorithm Parameters */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
                <span>Algorithm Parameters</span>
              </h2>
              <span className="text-[11px] font-mono text-neutral-400">7 system controls</span>
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="py-2.5 px-4">Parameter</th>
                    <th className="py-2.5 px-4 w-48 text-right">Configured Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {parameters.map((param, index) => (
                    <tr key={param.name} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-900">{param.name}</span>
                          <span className="font-serif italic text-neutral-400 text-xs font-medium">({param.symbol})</span>
                          <div className="relative inline-flex items-center group cursor-help ml-1">
                            <Info className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                            <div className="hidden group-hover:block absolute left-0 bottom-full mb-1 z-50 w-80 p-2.5 bg-neutral-900 text-white rounded-lg shadow-xl text-[11px] font-normal leading-relaxed border border-neutral-700 pointer-events-none">
                              <span className="font-bold text-neutral-200 block mb-0.5">Controls:</span>
                              {param.whatItControls}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => {
                            const updated = [...parameters];
                            updated[index].value = e.target.value;
                            setParameters(updated);
                          }}
                          className="w-36 px-2.5 py-1 text-xs font-bold font-mono bg-white border border-neutral-300 rounded text-neutral-900 text-right focus:outline-hidden focus:border-neutral-900"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Compact Equations Bar */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="text-neutral-700">
                <strong className="text-neutral-900">Scoring:</strong> S_i = (3·M_free + 2·M_rating + 1·M_ontime + 1·M_trips) / 7
              </div>
              <div className="text-neutral-700">
                <strong className="text-neutral-900">Softmax:</strong> P_i ∝ (S_i - min(S) + k)^α [P_i ≥ 2%]
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: REVIEW SCREEN (Apple-Style Monochrome Summary)         */}
      {/* ============================================================== */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider font-mono">Configuration Summary</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Review all parameters prior to saving or submitting for approval.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-full text-xs font-semibold font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                <span>Ready for submission</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Box 1: Core Details */}
              <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                  Core Details
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Model</span>
                    <span className="font-semibold text-neutral-900">Allocation</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Version</span>
                    <span className="font-mono font-bold text-neutral-900">{activeVersion}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Benefit</span>
                    <span className="font-medium text-neutral-900">Airport Transfer</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Author</span>
                    <span className="font-medium text-neutral-900">Sidhartha Rajput</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Scope & Chauffeurs */}
              <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                  Fleet & Territory
                </div>
                <div className="text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-neutral-500 text-[10px]">Regions:</span>
                    {selectedRegions.map((r) => (
                      <span key={r} className="px-1.5 py-0.2 bg-white border border-neutral-200 rounded text-[11px] font-medium text-neutral-800">
                        {r}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-neutral-500 text-[10px]">Partners:</span>
                    {selectedPartners.map((p) => (
                      <span key={p} className="px-1.5 py-0.2 bg-neutral-900 text-white rounded text-[11px] font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono pt-1">
                    {selectedChauffeurIds.length} Chauffeurs in qualified pool
                  </div>
                </div>
              </div>

              {/* Box 3: Execution Cadence */}
              <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                  Schedule & Volume
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Date of Run</span>
                    <span className="font-semibold text-neutral-900">{dateOfRun}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Advance Days</span>
                    <span className="font-mono font-semibold text-neutral-900">{advanceDays} days prior</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Run Time</span>
                    <span className="font-mono font-semibold text-neutral-900">{timeOfDayUTC} UTC</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Base Volume</span>
                    <span className="font-mono font-bold text-neutral-900">{bookingBasePercent}% (~{avgDailyBookingsImpacted}/day)</span>
                  </div>
                </div>
              </div>

              {/* Box 4: Weight Distribution */}
              <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                  Weight Distribution
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {Object.entries(weights).map(([measure, wt]) => (
                    <div key={measure} className="flex items-center justify-between p-1.5 bg-white border border-neutral-200 rounded">
                      <span className="text-neutral-700 truncate">{measure} (w={wt})</span>
                      <span className="font-mono font-bold text-neutral-900 ml-1">{shareOfSMap[measure]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Parameters Strip */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold block mb-1.5">
                Parameters:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs font-mono">
                {parameters.map((p) => (
                  <div key={p.name} className="bg-white border border-neutral-200 rounded p-1.5 text-center">
                    <span className="text-[10px] text-neutral-400 block truncate">{p.name}</span>
                    <span className="font-bold text-neutral-900">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BOTTOM ACTION BAR                                              */}
      {/* Rule: "Send for approval" ONLY appears on Step 3               */}
      {/* Step 1 & 2 have Cancel/Back, Next, and Save as Draft           */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-neutral-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20 shadow-md">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onBackToModelListing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              <span>Cancel</span>
            </button>
          )}

          {currentStep < 3 && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>{currentStep === 1 ? 'Next: Weights' : 'Next: Review'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons: Save as Draft on all steps; Send for Approval ONLY in Step 3 */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 hover:border-neutral-500 text-neutral-800 font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Save configuration as Draft without submitting"
          >
            <Save className="w-3.5 h-3.5 text-neutral-500" />
            <span>Save as Draft</span>
          </button>

          {/* "Send for approval" ONLY in Step 3 */}
          {currentStep === 3 && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Submit configuration for operational review and approval"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send for approval</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
