import React from 'react';
import { Check, Truck, Package, Heart, ShoppingBag, MapPin, XCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const OrderStatusTimeline = ({ status = 'placed', statusHistory = [], layout = 'horizontal' }) => {
  const activeSteps = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
  const cancelSteps = ['placed', 'cancelled'];
  const returnSteps = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'refunded'];

  const getSteps = () => {
    const s = status.toLowerCase();
    if (s === 'cancelled') return cancelSteps;
    if (s === 'returned' || s === 'refunded' || statusHistory.some(h => ['returned', 'refunded'].includes(h.status))) {
      return returnSteps;
    }
    return activeSteps;
  };

  const steps = getSteps();
  const currentIndex = steps.indexOf(status.toLowerCase());

  const getStepIcon = (stepName) => {
    switch (stepName.toLowerCase()) {
      case 'placed':
        return <ShoppingBag className="w-4 h-4" />;
      case 'confirmed':
        return <Check className="w-4 h-4" />;
      case 'packed':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'out_for_delivery':
        return <MapPin className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'returned':
        return <RefreshCw className="w-4 h-4" />;
      case 'refunded':
        return <Heart className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  const getStepLabel = (stepName) => {
    const labels = {
      placed: 'Placed',
      confirmed: 'Confirmed',
      packed: 'Packed',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      refunded: 'Refunded',
    };
    return labels[stepName.toLowerCase()] || stepName;
  };

  const getStepColor = (index, stepName) => {
    const s = stepName.toLowerCase();
    const isCompleted = index < currentIndex;
    const isActive = index === currentIndex;

    if (s === 'cancelled') {
      return isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-500';
    }
    if (s === 'returned' || s === 'refunded') {
      return isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-500';
    }

    if (isCompleted) return 'bg-gold-500 text-white border-gold-500';
    if (isActive) return 'bg-navy-500 text-white border-navy-500 animate-pulse';
    return 'bg-gray-100 text-gray-400 border-gray-200';
  };

  const getStatusTime = (stepName) => {
    const match = statusHistory.find(h => h.status.toLowerCase() === stepName.toLowerCase());
    if (match) {
      return new Date(match.timestamp).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return null;
  };

  if (layout === 'horizontal') {
    return (
      <div className="w-full py-4 overflow-x-auto select-none">
        <div className="flex items-center min-w-[600px] justify-between relative px-6">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-gray-200 -translate-y-4 z-0">
            <div
              className="h-full bg-gold-gradient transition-all duration-500"
              style={{
                width: `${currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Steps */}
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            const time = getStatusTime(step);

            return (
              <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-medium ${getStepColor(
                    idx,
                    step
                  )} shadow-md`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : getStepIcon(step)}
                </div>
                <span
                  className={`text-[11px] mt-2 font-semibold text-center ${
                    isActive ? 'text-navy-500 dark:text-gold-300' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {getStepLabel(step)}
                </span>
                {time && (
                  <span className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap">
                    {time}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical layout (usually for Detail Page)
  return (
    <div className="relative pl-6 border-l-2 border-gray-100 dark:border-navy-800 ml-4 py-2 space-y-8 z-10">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        const time = getStatusTime(step);

        return (
          <div key={step} className="relative group">
            {/* Indicator Dot */}
            <div
              className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${getStepColor(
                idx,
                step
              )} shadow-sm`}
            >
              {isCompleted ? <Check className="w-3 h-3" /> : getStepIcon(step)}
            </div>

            {/* Step Details */}
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h4
                  className={`text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-navy-500 dark:text-gold-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {getStepLabel(step)}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isActive
                    ? `Your order is currently ${getStepLabel(step).toLowerCase()}.`
                    : isCompleted
                    ? `Successfully reached this milestone.`
                    : `Upcoming stage in lifecycle.`}
                </p>
              </div>
              {time && (
                <div className="text-xs text-navy-400 dark:text-gold-500/80 font-medium md:text-right mt-1 md:mt-0">
                  {time}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusTimeline;
