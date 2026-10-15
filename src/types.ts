export interface PointsGainedBreakdown {
  bookingsFulfilledOnTime: { count: number; points: number };
  dsat: { count: number; points: number };
  warnings: { count: number; points: number };
  noShow: { count: number; points: number };
  happyRating: { count: number; points: number };
}

export interface ChauffeurDayRank {
  date: string;
  rank: string; // e.g. "Top 10" or "Top 20"
}

export interface PeriodDayInfo {
  key: string;
  dateStr: string;   // e.g. "Sep 28"
  fullDate: string;  // e.g. "Mon, Sep 28, 2026"
  dayName: string;   // e.g. "Mon"
  dayNum: string;    // e.g. "28"
  isoDate: string;   // e.g. "2026-09-28"
}

export interface ChauffeurDayMetric {
  date: string;
  dayName?: string;
  rank: 'Top 10' | 'Top 20' | 'Top 50';
  bookingsRecommended: number;
  bookingsFulfilled: number;
  fulfillmentDetail?: ChauffeurFulfillmentDetail;
}

export interface ChauffeurFulfillmentDetail {
  bookingsFulfilledOnTime: { count: number; suffix: string };
  dsat: { count: number; suffix: string };
  warnings: { count: number; suffix: string };
  noShow: { count: number; suffix: string };
  happyRating: { count: number; suffix: string };
}

export interface ChauffeurPeriodMetrics {
  rank: string; // e.g. "Top 20" or "Top 10" or "Top 50"
  dayWiseRanks?: ChauffeurDayRank[];
  dayWiseMetrics?: ChauffeurDayMetric[];
  bookingsRecommended: number;
  bookingsFulfilled: number;
  fulfillmentDetail?: ChauffeurFulfillmentDetail;
}

export interface DashboardItem {
  id: string;
  name: string;
  subTitle?: string;
  partnerName?: string;
  status: 'Active' | 'Paused' | 'Inactive';
  tag?: 'Top 10' | 'Top 20' | 'Top 50';
  pointsAtBeginning?: number;
  pointsGained?: number;
  pointsGainedBreakdown?: PointsGainedBreakdown;
  eligibleChauffeurs?: number;
  chauffeursExpected?: number;
  chauffeursBelowExpectation?: number;
  totalBookings: number;
  bookingsAllocated: number;
  bookingsAccepted: number;
  bookingFulfilled: number;
  bookingFulfilledOnTime: number;
  csat: number | string;
  complaints: number;
  isLink?: boolean;
  precedingPeriod?: ChauffeurPeriodMetrics;
  inFocusPeriod?: ChauffeurPeriodMetrics;
  upcomingPeriod?: ChauffeurPeriodMetrics;
}

export type DashboardTab = 'partners' | 'program' | 'chauffeurs';

export type FilterStatus = 'all' | 'high_performance' | 'needs_attention';

export type DateRangeOption = 'today' | 'this_week' | 'last_7_days' | 'this_month' | 'quarter_to_date' | 'custom';

export type DateFilterGranularity = 'day' | 'week' | 'month';

export interface DateFilterSelection {
  granularity: DateFilterGranularity;
  label: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  displayRange: string;
  precedingRange: string;
  inFocusRange: string;
  upcomingRange: string;
}

export type AppPage = 'dashboard' | 'admin_panel' | 'vendor_panel' | 'allocation_leaderboard' | 'model_listing' | 'add_model_config';

export type ModelState = 'Draft' | 'Pending for approval' | 'Published';

export interface ModelConfigDetails {
  dateOfRun: 'Booking Date' | 'Service Date';
  advanceDays: number;
  timeOfDayUTC: string;
  bookingBasePercent: number;
  avgDailyBookingsImpacted?: number;
  chauffeurCount?: number;
  selectedChauffeurNames?: string[];
  clonedFrom?: string;
}

export interface ModelWeightItem {
  measure: string;
  weight: number;
  shareOfS: string;
  definition: string;
}

export interface ModelParameterItem {
  name: string;
  symbol?: string;
  whatItControls: string;
  value: string;
}

export interface ModelAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  notes: string;
  statusBadge?: string;
}

export interface ModelListingItem {
  id: string;
  model: string; // 'Allocation'
  version: string; // 'v1.1', 'v2.1', 'v2.2'
  state: ModelState;
  benefit: string; // 'Airport Transfer'
  regions: string[]; // UAE, KSA, India, London, Australia
  partners: string[]; // 2 to 5 partners
  createdBy: string; // Name of the creator
  createdAt?: string;
  updatedAt?: string;
  // Detail and Configuration tabs metadata
  config?: ModelConfigDetails;
  weights?: ModelWeightItem[];
  parameters?: ModelParameterItem[];
  logs?: ModelAuditLog[];
}

export interface AllocationMatchItem {
  id: string;
  // Demand section
  bookingId: string;
  benefitGroup: string;
  program: string;
  cardVariant: string;
  revenue: number;
  tag: 'Normal' | 'VIP';
  margin: number;
  serviceDate: string;

  // Supply section
  rank: number;
  rankTier?: 'Top 10' | 'Top 25' | 'Top 50';
  chauffeurName: string;
  vendor: string;
  score: number;
  group: 'Preferred' | 'Excluded' | 'Standard';
  bookingCompleted: number;
  onTime: number;
  softWarning: number;
  criticalWarning: number;
  happyRatings: number;
  dsatRatings: number;
  fatalComplaints: number;
  noShow: number;
  cost: number;

  // Actual section
  actualMargin: number;
  actualCsat: number;
  scoreChanged?: number;
  hasComplaint: boolean;
  hasWarnings: boolean;
}
