import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Phone, Calendar, User, MapPin } from 'lucide-react';

interface BookingsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  projectName: string;
  type: 'completed' | 'cancelled' | 'complaints' | 'general';
  count: number;
}

export const BookingsDetailModal: React.FC<BookingsDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  projectName,
  type,
  count,
}) => {
  if (!isOpen) return null;

  // Sample booking records based on type
  const records = Array.from({ length: Math.min(count, 5) }).map((_, i) => ({
    id: `BK-DXB-${89230 + i}`,
    passengerName: ['Omar Al-Mansoor', 'Fatima Zahra', 'Rahul Sharma', 'Alexander Wright', 'Priya Patel'][i % 5],
    pickup: ['Terminal 3, Dubai Int Airport (DXB)', 'Downtown Dubai, Boulevard', 'Palm Jumeirah Resort', 'Abu Dhabi Int Airport', 'Dubai Marina'][i % 5],
    dropoff: ['Burj Al Arab Hotel', 'Dubai Mall Hotel', 'Emirates Hills Villa', 'DIFC Gate Towers', 'Jumeirah Beach Hotel'][i % 5],
    status: type === 'completed' ? 'Completed' : type === 'cancelled' ? 'Cancelled by User' : 'Complaint Raised: Driver Delay',
    time: ['Today, 14:30', 'Today, 11:15', 'Yesterday, 19:45', 'Yesterday, 08:20', '05 Oct, 16:00'][i % 5],
    vehicle: ['Mercedes E-Class', 'BMW 7 Series', 'Lexus ES 300h', 'Audi A6', 'Mercedes S-Class'][i % 5]
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 font-mono">
              {projectName} · {count} total records
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto text-xs">
          {records.map((rec) => (
            <div key={rec.id} className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{rec.id}</span>
                  <span className="text-slate-400 font-mono">· {rec.time}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                  type === 'completed' 
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700' 
                    : type === 'cancelled'
                    ? 'border-slate-300 bg-slate-100 text-slate-600'
                    : 'border-rose-300 bg-rose-50 text-rose-700'
                }`}>
                  {rec.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-800">{rec.passengerName}</span>
                </div>
                <div className="text-right text-slate-500 font-mono">
                  {rec.vehicle}
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                <div className="flex items-center gap-1 truncate max-w-[85%]">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{rec.pickup} → {rec.dropoff}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
