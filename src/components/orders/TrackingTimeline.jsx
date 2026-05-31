import React, { useState } from 'react';
import { Truck, Copy, Check, Clock, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const TrackingTimeline = ({ tracking }) => {
  const [copied, setCopied] = useState(false);

  if (!tracking || !tracking.trackingId) {
    return (
      <div className="bg-surface-50 dark:bg-surface-800/30 border border-surface-200 dark:border-surface-800/60 rounded-2xl p-6 text-center">
        <Truck className="w-8 h-8 mx-auto text-gray-300 mb-2 animate-bounce" />
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Shipment Details Pending</h4>
        <p className="text-xs text-gray-400 mt-1">Our warehouse is processing your package. Tracking ID will update shortly.</p>
      </div>
    );
  }

  const { trackingId, deliveryPartner, trackingHistory = [], estimatedDelivery, orderStatus } = tracking;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    toast.success('Tracking ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-800/60 rounded-2xl p-5 md:p-6 shadow-card transition-all duration-300">
      
      {/* Courier Partner Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-surface-200 dark:border-surface-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-surface-800 flex items-center justify-center border border-primary-200 dark:border-surface-700 text-primary-500">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {deliveryPartner || 'Fulfillment Courier'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-400">Tracking ID:</span>
              <span className="text-xs font-semibold text-surface-600 dark:text-primary-300">{trackingId}</span>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-all text-gray-400 hover:text-primary-500 cursor-pointer"
                title="Copy Tracking ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {estimatedDelivery && (
          <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-800 px-4 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-primary-500" />
            <div>
              <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Est. Delivery</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                {new Date(estimatedDelivery).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Shipment Milestones Logging */}
      <div className="relative pl-6 border-l-2 border-surface-200 dark:border-surface-800 ml-4 py-1 space-y-6">
        {trackingHistory.length === 0 ? (
          <div className="text-xs text-gray-400 pl-2">No shipment tracking history recorded yet.</div>
        ) : (
          trackingHistory.map((item, index) => {
            const isLatest = index === 0; // tracking history is sorted latest first usually, or reverse. Let's assume index 0 is first, or check order. Let's make index 0 the latest event by styling the top one. If it's sorted, let's treat index 0 as latest.
            
            return (
              <div key={item._id || index} className="relative">
                {/* Location Dot */}
                <div
                  className={`absolute -left-[35px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isLatest
                      ? 'bg-primary-500 text-white border-primary-500 ring-4 ring-primary-100 dark:ring-primary-900/40 animate-pulse'
                      : 'bg-surface-100 text-gray-400 border-surface-300 dark:bg-surface-800 dark:border-surface-700'
                  }`}
                >
                  {isLatest ? <Clock className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                </div>

                {/* Milestone Detail */}
                <div className="pl-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h5
                      className={`text-xs font-bold transition-all ${
                        isLatest ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.description}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(item.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400 dark:text-gray-500 font-semibold">
                    <MapPin className="w-3 h-3 text-primary-400" />
                    <span>{item.location || 'Transit Hub'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default TrackingTimeline;
