import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, CreditCard, Truck, Check } from 'lucide-react';
import { orderService } from '../services';
import { clearCart, selectCartItems, selectCartSubtotal } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const steps = ['Address', 'Payment', 'Review'];

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shippingCharge;

  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onAddressSubmit = (data) => {
    setAddress(data);
    setStep(1);
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product: i.product._id,
        quantity: i.quantity,
        variant: i.variant,
      }));
      const res = await orderService.create({
        orderItems,
        shippingAddress: address,
        paymentMethod,
      });
      dispatch(clearCart());
      navigate(`/order-success/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 py-10">
      <div className="container-custom max-w-5xl">
        <h1 className="section-title mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? 'text-gold-500' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-gold-500 text-white' : i === step ? 'bg-gold-500 text-white' : 'bg-gray-200 dark:bg-navy-700'
                }`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 transition-all ${i < step ? 'bg-gold-500' : 'bg-gray-200 dark:bg-navy-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step content */}
          <div className="lg:col-span-2">
            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Truck size={20} className="text-gold-500" /> Shipping Address
                </h2>
                <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Full Name *</label>
                      <input {...register('name', { required: 'Name is required' })} placeholder="Your full name" className="input" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Phone *</label>
                      <input {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone' } })} placeholder="10-digit mobile" className="input" />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">Street Address *</label>
                    <input {...register('street', { required: 'Address is required' })} placeholder="House/Flat no., Street, Area" className="input" />
                    {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">City *</label>
                      <input {...register('city', { required: 'City required' })} placeholder="City" className="input" />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">State *</label>
                      <input {...register('state', { required: 'State required' })} placeholder="State" className="input" />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5 block">PIN Code *</label>
                      <input {...register('pincode', { required: 'Pincode required', pattern: { value: /^\d{6}$/, message: '6-digit PIN' } })} placeholder="6-digit PIN" className="input" />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-4">Continue to Payment</button>
                </form>
              </motion.div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-gold-500" /> Payment Method
                </h2>
                <div className="space-y-3 mb-6">
                  {[
                    { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
                    { value: 'Online', label: 'Online Payment', desc: 'UPI, Cards, Net Banking (Coming Soon)', icon: '💳', disabled: true },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        opt.disabled ? 'opacity-50 cursor-not-allowed' :
                        paymentMethod === opt.value ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-gray-200 dark:border-navy-600 hover:border-gold-300'
                      }`}
                    >
                      <input type="radio" className="sr-only" value={opt.value} checked={paymentMethod === opt.value} onChange={() => !opt.disabled && setPaymentMethod(opt.value)} />
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                        <p className="text-sm text-gray-500">{opt.desc}</p>
                      </div>
                      {paymentMethod === opt.value && <Check size={18} className="text-gold-500 ml-auto" />}
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3">Review Order</button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Package size={20} className="text-gold-500" /> Order Review
                </h2>

                {/* Delivery address */}
                {address && (
                  <div className="p-4 bg-cream-200 dark:bg-navy-800 rounded-xl mb-5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Delivering to:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{address.name} • {address.phone}</p>
                    <p className="text-sm text-gray-500">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3 mb-5">
                  {items.map(item => {
                    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
                    return (
                      <div key={item.key} className="flex gap-3">
                        <img src={item.product.images?.[0]} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-sm">{formatPrice(price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                  <button onClick={placeOrder} disabled={loading} className="btn-primary flex-1 py-3">
                    {loading ? <LoadingSpinner size="sm" /> : `Place Order — ${formatPrice(total)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order summary */}
          <div className="card p-5 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              {items.map(item => {
                const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
                return (
                  <div key={item.key} className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="truncate mr-2">{item.product.name.slice(0, 25)}... ×{item.quantity}</span>
                    <span className="font-medium">{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-100 dark:border-navy-700 pt-2 flex justify-between text-gray-600 dark:text-gray-300">
                <span>Shipping</span>
                <span className={shippingCharge === 0 ? 'text-green-500' : ''}>{shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-navy-700">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
