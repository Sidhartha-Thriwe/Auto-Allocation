import React, { useState } from 'react';
import { X, Download, Copy, Check, FileSpreadsheet, Share2 } from 'lucide-react';
import { DashboardItem } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DashboardItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    const headers = [
      'Name',
      'Segment / Route',
      'Status',
      'Total Bookings',
      'Bookings Allocated',
      'Bookings Accepted',
      'Booking Fulfilled',
      'Booking Fulfilled On Time',
      'CSAT',
      'Complaints'
    ];

    const rows = items.map((c) => [
      `"${c.name}"`,
      `"${c.subTitle || ''}"`,
      c.status,
      c.totalBookings,
      c.bookingsAllocated,
      c.bookingsAccepted,
      c.bookingFulfilled,
      c.bookingFulfilledOnTime,
      c.csat,
      c.complaints
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Performance_Dashboard_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const handleCopySummary = () => {
    const text = items
      .map(
        (c) =>
          `${c.name} | Total: ${c.totalBookings} | Allocated: ${c.bookingsAllocated} | Fulfilled: ${c.bookingFulfilled} | CSAT: ${c.csat} | Complaints: ${c.complaints}`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Export & Share Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3 text-xs">
          <p className="text-slate-600 mb-4">
            Download the current performance breakdown or copy the executive summary directly.
          </p>

          <button
            onClick={handleDownloadCsv}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Export as CSV</div>
                <div className="text-[11px] text-slate-500">Includes all allocation, fulfillment & CSAT stats</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={handleCopySummary}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Copy className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Copy Summary to Clipboard</div>
                <div className="text-[11px] text-slate-500">Formatted plain-text executive summary</div>
              </div>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Check className="w-4 h-4" />
                Copied
              </span>
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
