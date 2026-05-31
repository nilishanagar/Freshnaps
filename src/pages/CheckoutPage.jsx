import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, CreditCard, Truck, Check, ShieldCheck, Lock, RefreshCw, 
  Search, ArrowRight, Wallet, CheckCircle, AlertTriangle, AlertCircle, 
  HelpCircle, QrCode, Sparkles, Tag, Percent
} from 'lucide-react';
import { orderService } from '../services';
import { clearCart, selectCartItems, selectCartSubtotal } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const steps = ['Shipping Address', 'Payment & Review'];

// Bank list for Net Banking
const netBankingBanks = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank',
  'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank of India',
  'IndusInd Bank', 'IDBI Bank', 'Federal Bank', 'Yes Bank', 'Central Bank of India'
];

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const shippingCharge = subtotal >= 999 ? 0 : 99;

  // Step state
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(null);

  // General checkout state
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, loading, success, failed
  const [paymentProgressMsg, setPaymentProgressMsg] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Active payment category (accordion state)
  const [paymentType, setPaymentType] = useState('UPI'); // UPI, Card, NetBanking, Wallet, COD

  // UPI Specific state
  const [upiProvider, setUpiProvider] = useState('gpay'); // gpay, phonepe, paytm, bhim, other
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrTimer, setQrTimer] = useState(300); // 5 minutes in seconds

  // Card Specific state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [cardBrand, setCardBrand] = useState('generic'); // generic, visa, mastercard, rupay, amex
  const [selectedEmiPlan, setSelectedEmiPlan] = useState('none');

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState('');
  const [bankSearch, setBankSearch] = useState('');

  // Wallets state
  const [selectedWallet, setSelectedWallet] = useState('paytm'); // paytm, amazon, mobikwik, freecharge
  const [walletLinked, setWalletLinked] = useState(false);
  const [walletBalance, setWalletBalance] = useState(1500);

  // COD Specific state
  const [pincodeCheck, setPincodeCheck] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState('unchecked'); // unchecked, checking, eligible, ineligible

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, type }

  // React Hook Form for Address
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0 && paymentStatus !== 'success') {
      navigate('/cart');
    }
  }, [items, navigate, loading, paymentStatus]);

  // QR Code Timer countdown
  useEffect(() => {
    let interval = null;
    if (showQr && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => prev - 1);
      }, 1000);
    } else if (qrTimer === 0) {
      setShowQr(false);
      setQrTimer(300);
      toast.error('QR Code expired. Please generate a new one.');
    }
    return () => clearInterval(interval);
  }, [showQr, qrTimer]);

  // Format QR Timer helper
  const formatTimer = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Card brand detection based on prefix
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Auto spacing format: XXXX XXXX XXXX XXXX
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    setCardNumber(formatted.slice(0, 19));

    // Detect card brand
    const cleanNum = value;
    if (cleanNum.startsWith('4')) {
      setCardBrand('visa');
    } else if (/^(5[1-5]|2[2-7])/.test(cleanNum)) {
      setCardBrand('mastercard');
    } else if (/^6(0|5|8)/.test(cleanNum)) {
      setCardBrand('rupay');
    } else if (/^3(4|7)/.test(cleanNum)) {
      setCardBrand('amex');
    } else {
      setCardBrand('generic');
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardExpiry(value.substring(0, 5));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardCvv(value.substring(0, 4));
  };

  // Autofill helpers for easier testing
  const autofillCard = (brand) => {
    if (brand === 'visa') {
      setCardNumber('4111 2222 3333 4444');
      setCardBrand('visa');
    } else if (brand === 'mastercard') {
      setCardNumber('5234 5678 1234 5678');
      setCardBrand('mastercard');
    } else if (brand === 'amex') {
      setCardNumber('3782 822463 10005');
      setCardBrand('amex');
    }
    setCardName('Nilisha Nagar');
    setCardExpiry('12/28');
    setCardCvv('999');
    setSelectedEmiPlan('none');
    toast.success('Autofilled dummy credentials for testing!');
  };

  // UPI verification simulation
  const handleVerifyUpi = () => {
    if (!upiId.trim() || !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. user@okaxis)');
      return;
    }
    setVerifyingUpi(true);
    setTimeout(() => {
      setVerifyingUpi(false);
      setUpiVerified(true);
      toast.success('UPI ID verified successfully!');
    }, 1200);
  };

  // Pincode eligibility simulation for COD
  const handleCheckPincode = () => {
    if (!pincodeCheck || pincodeCheck.length !== 6 || !/^\d{6}$/.test(pincodeCheck)) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }
    setPincodeStatus('checking');
    setTimeout(() => {
      // Dummy check: even pincodes are eligible, odd are ineligible
      const isEligible = parseInt(pincodeCheck) % 2 === 0;
      setPincodeStatus(isEligible ? 'eligible' : 'ineligible');
      if (isEligible) {
        toast.success('Cash on Delivery is available for this pincode!');
      } else {
        toast.error('Sorry, COD is currently unavailable for this location.');
      }
    }, 1000);
  };

  // Coupon application logic
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a coupon code.');
      return;
    }
    if (code === 'FRESHNAPS10') {
      setAppliedCoupon({ code: 'FRESHNAPS10', discount: 10, type: 'percent' });
      toast.success('10% Coupon applied successfully!');
    } else if (code === 'SLEEPGOLD') {
      if (subtotal < 2000) {
        toast.error('Coupon SLEEPGOLD is applicable only on orders above ₹2,000.');
        return;
      }
      setAppliedCoupon({ code: 'SLEEPGOLD', discount: 500, type: 'fixed' });
      toast.success('Flat ₹500 discount coupon applied!');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', discount: shippingCharge, type: 'freeship' });
      toast.success('Free shipping coupon applied!');
    } else {
      toast.error('Invalid coupon code. Try FRESHNAPS10 or SLEEPGOLD');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed.');
  };

  // Calculate pricing values
  const getPricing = () => {
    let discountAmount = 0;
    let upiDiscount = 0;

    // Apply Coupon discount
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') {
        discountAmount = Math.round((subtotal * appliedCoupon.discount) / 100);
      } else if (appliedCoupon.type === 'fixed') {
        discountAmount = appliedCoupon.discount;
      } else if (appliedCoupon.type === 'freeship') {
        discountAmount = shippingCharge;
      }
    }

    // Dynamic instant flat ₹150 discount for UPI payment
    if (paymentType === 'UPI') {
      upiDiscount = 150;
    }

    // COD handling fee of ₹49 for COD under ₹2500
    const codCharge = (paymentType === 'COD' && subtotal < 2500) ? 49 : 0;

    const totalDiscount = discountAmount + upiDiscount;
    const finalShippingCharge = appliedCoupon?.type === 'freeship' ? 0 : shippingCharge;
    const finalAmount = Math.max(subtotal + finalShippingCharge + codCharge - totalDiscount, 0);

    return {
      discountAmount,
      upiDiscount,
      codCharge,
      totalDiscount,
      finalShippingCharge,
      finalAmount
    };
  };

  const pricing = getPricing();

  const handleAddressSubmit = (data) => {
    setAddress(data);
    setPincodeCheck(data.pincode);
    setStep(1);
    toast.success('Shipping address saved!');
  };

  // Place Order & Payment Simulation
  const handlePaymentAndCheckout = async () => {
    if (paymentType === 'Card') {
      if (selectedEmiPlan === 'none' && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
        toast.error('Please fill out all card payment details or autofill.');
        return;
      }
    }
    if (paymentType === 'UPI' && !showQr && !upiVerified) {
      toast.error('Please verify your UPI ID or generate a secure QR Code.');
      return;
    }
    if (paymentType === 'NetBanking' && !selectedBank) {
      toast.error('Please select your bank for Net Banking.');
      return;
    }
    if (paymentType === 'Wallet' && !walletLinked) {
      toast.error('Please link your wallet before paying.');
      return;
    }
    if (paymentType === 'COD' && pincodeStatus === 'ineligible') {
      toast.error('COD is not available for this pincode. Please select another payment method.');
      return;
    }

    // Begin secure authorization simulation
    setPaymentStatus('loading');
    setPaymentProgressMsg('Connecting to secure payment gateway...');

    // First create the order in the database in a placed state
    try {
      const orderItems = items.map(i => ({
        product: i.product._id,
        quantity: i.quantity,
        variant: i.variant,
      }));
      
      const res = await orderService.create({
        orderItems,
        shippingAddress: address,
        paymentMethod: paymentType === 'COD' ? 'COD' : 'Online',
        totalAmount: pricing.finalAmount,
        taxAmount: Math.round(pricing.finalAmount * 0.18),
        discountAmount: pricing.totalDiscount,
      });

      const createdOrder = res.data.order;

      // If COD, we do not require webhook payment capture, complete immediately
      if (paymentType === 'COD') {
        setTimeout(() => {
          setPaymentStatus('success');
          toast.success('Order placed successfully via Cash on Delivery!');
          dispatch(clearCart());
          setTimeout(() => {
            navigate(`/order-success/${createdOrder._id}`);
          }, 1500);
        }, 1500);
        return;
      }

      // Online Gateway Flow:
      // In Sandbox / Developer mode, we simulate the payment verification steps,
      // and then fire the server webhook to process inventory, invoicing, email, and admin chimes.
      setTimeout(() => {
        setPaymentProgressMsg('Verifying credentials & checking fraud controls...');
        setTimeout(() => {
          setPaymentProgressMsg('Authorizing sleep purchase with your bank...');
          setTimeout(async () => {
            if (simulateFailure) {
              setPaymentStatus('failed');
              toast.error('Transaction Declined. Simulated Payment Failed.');
              return;
            }

            try {
              // Trigger the backend Stripe webhook dynamically!
              const sessionId = `sandbox_stripe_ch_${Math.random().toString(36).substring(2, 10)}`;
              await orderService.confirmSandboxPayment(createdOrder._id, sessionId);

              setPaymentStatus('success');
              toast.success('Payment Authorized! Order confirmed.');
              dispatch(clearCart());
              
              setTimeout(() => {
                navigate(`/order-success/${createdOrder._id}`);
              }, 1500);
            } catch (webhookErr) {
              console.error('Webhook execution failed:', webhookErr);
              setPaymentStatus('failed');
              toast.error('Payment verification failed to synchronize with server.');
            }
          }, 1200);
        }, 1200);
      }, 1200);

    } catch (err) {
      console.error('Order checkout error:', err);
      setPaymentStatus('failed');
      toast.error(err.response?.data?.message || err.message || 'Failed to initialize order checkout');
    }
  };

  const filteredBanks = netBankingBanks.filter(b => 
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-50/20 dark:bg-surface-950 py-10 px-4 md:px-8 select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-200/60 dark:border-surface-900 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-surface-600 dark:text-primary-300 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary-500 animate-pulse" /> Secure Checkout
            </h1>
            <p className="text-xs md:text-sm text-gray-400 font-semibold mt-1">
              Primacy Sleep Premium System • 100% Encrypted Connection
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-3 bg-white dark:bg-surface-950 border border-surface-100 dark:border-surface-900 px-4 py-2 rounded-2xl w-fit shadow-sm">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${i <= step ? 'text-primary-500' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all font-mono ${
                    i < step ? 'bg-primary-500 text-white' : i === step ? 'bg-primary-500 text-white shadow-brand' : 'bg-gray-200 dark:bg-surface-900'
                  }`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-px transition-all ${i < step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-surface-900'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Outer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 0: Address Form */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-surface-950 rounded-3xl border border-surface-200 dark:border-surface-900 shadow-card p-6 md:p-8 space-y-6">
                <h2 className="font-display text-xl font-bold text-surface-600 dark:text-primary-300 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-500" /> Shipping Details
                </h2>
                
                <form onSubmit={handleSubmit(handleAddressSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">Full Name *</label>
                      <input 
                        {...register('name', { required: 'Name is required' })} 
                        placeholder="E.g. Nilisha Nagar" 
                        className="input" 
                      />
                      {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">Phone Number *</label>
                      <input 
                        {...register('phone', { 
                          required: 'Phone is required', 
                          pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid 10-digit phone number' } 
                        })} 
                        placeholder="10-digit mobile" 
                        className="input" 
                      />
                      {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">Street Address *</label>
                    <input 
                      {...register('street', { required: 'Street address is required' })} 
                      placeholder="Flat/House No, Apartment, Sector, Street Name" 
                      className="input" 
                    />
                    {errors.street && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.street.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">City *</label>
                      <input 
                        {...register('city', { required: 'City required' })} 
                        placeholder="Mumbai" 
                        className="input" 
                      />
                      {errors.city && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">State *</label>
                      <input 
                        {...register('state', { required: 'State required' })} 
                        placeholder="Maharashtra" 
                        className="input" 
                      />
                      {errors.state && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.state.message}</p>}
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">PIN Code *</label>
                      <input 
                        {...register('pincode', { 
                          required: 'Pincode required', 
                          pattern: { value: /^\d{6}$/, message: '6-digit code' } 
                        })} 
                        placeholder="400001" 
                        className="input" 
                      />
                      {errors.pincode && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.pincode.message}</p>}
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full py-4 mt-4 font-bold flex items-center justify-center gap-1.5">
                    Save Address & Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 1: Payment & Accordion Methods */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Back button */}
                <button 
                  onClick={() => setStep(0)} 
                  className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-surface-600 dark:hover:text-primary-400 transition-colors"
                >
                  ← Edit Shipping Address
                </button>

                {/* Delivery address mini panel */}
                {address && (
                  <div className="bg-surface-50/40 dark:bg-surface-950 rounded-2xl border border-surface-200/50 dark:border-surface-900/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold text-surface-600 dark:text-primary-300 uppercase tracking-wider">Shipping To</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{address.name} • {address.phone}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                    </div>
                    <button 
                      onClick={() => setStep(0)} 
                      className="px-3 py-1.5 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 text-xs font-bold text-surface-600 dark:text-gray-300 rounded-xl transition-all"
                    >
                      Change
                    </button>
                  </div>
                )}

                <div className="bg-white dark:bg-surface-950 rounded-3xl border border-surface-200 dark:border-surface-900 shadow-card p-6 md:p-8 space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-surface-600 dark:text-primary-300 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary-500" /> Select Payment Method
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold mt-1">Select one of our secure payment gateways below.</p>
                  </div>

                  {/* Accordion List */}
                  <div className="border border-surface-200 dark:border-surface-900 rounded-2xl overflow-hidden divide-y divide-surface-100 dark:divide-surface-900">
                    
                    {/* 1. UPI Payments */}
                    <div className={`transition-all ${paymentType === 'UPI' ? 'bg-surface-50/10 dark:bg-surface-950/20' : ''}`}>
                      <button
                        onClick={() => setPaymentType('UPI')}
                        className="w-full flex items-center justify-between p-5 text-left font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentType === 'UPI' ? 'border-primary-500' : 'border-gray-300 dark:border-surface-800'}`}>
                            {paymentType === 'UPI' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold text-surface-600 dark:text-gray-200 flex items-center gap-1.5">
                              UPI Payments
                              <span className="badge bg-green-100 text-green-700 text-[9px] uppercase font-bold py-0.5 px-1.5 rounded-md animate-pulse">Instant Payment</span>
                              <span className="badge bg-primary-500 text-white text-[9px] uppercase font-bold py-0.5 px-1.5 rounded-md">Recommended</span>
                            </span>
                            <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Google Pay, PhonePe, Paytm, QR Code</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-green-500 uppercase font-extrabold bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-lg">
                          <Sparkles className="w-3 h-3" /> Save ₹150
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {paymentType === 'UPI' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-6 pt-2 border-t border-surface-100 dark:border-surface-900 space-y-4">
                              
                              {/* Gpay / PhonePe Quick Select Cards */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                  { id: 'gpay', name: 'Google Pay', logo: 'GP' },
                                  { id: 'phonepe', name: 'PhonePe', logo: 'PP' },
                                  { id: 'paytm', name: 'Paytm', logo: 'PT' },
                                  { id: 'bhim', name: 'BHIM UPI', logo: 'BH' }
                                ].map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => { setUpiProvider(p.id); setShowQr(false); }}
                                    className={`p-3 border rounded-xl flex items-center justify-between text-left transition-all ${
                                      upiProvider === p.id && !showQr
                                        ? 'border-primary-500 bg-primary-50/10 dark:bg-surface-900'
                                        : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 hover:border-primary-300'
                                    }`}
                                  >
                                    <div>
                                      <p className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</p>
                                      <p className="text-[9px] text-gray-400 font-semibold">Instant Pay</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-surface-100 dark:bg-surface-900 flex items-center justify-center font-bold text-[10px] text-primary-600">
                                      {p.logo}
                                    </div>
                                  </button>
                                ))}
                              </div>

                              {/* UPI ID Input Option */}
                              <div className="bg-surface-50/30 dark:bg-surface-950 p-4 rounded-xl border border-surface-100/50 dark:border-surface-900/80">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Pay via UPI ID</label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={upiId}
                                      onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }}
                                      placeholder="username@bank"
                                      className="input pr-20"
                                      disabled={showQr}
                                    />
                                    {upiVerified && (
                                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-green-500 flex items-center gap-0.5">
                                        <CheckCircle className="w-3 h-3" /> VERIFIED
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleVerifyUpi}
                                    disabled={verifyingUpi || upiVerified || showQr}
                                    className="px-4 py-2.5 bg-surface-600 hover:bg-surface-700 dark:bg-surface-900 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1 disabled:opacity-50 select-none cursor-pointer"
                                  >
                                    {verifyingUpi ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Verify'}
                                  </button>
                                </div>
                              </div>

                              {/* OR Separator */}
                              <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-surface-200 dark:border-surface-900"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
                                <div className="flex-grow border-t border-surface-200 dark:border-surface-900"></div>
                              </div>

                              {/* QR Code trigger */}
                              <div className="flex flex-col items-center">
                                {!showQr ? (
                                  <button
                                    type="button"
                                    onClick={() => { setShowQr(true); setQrTimer(300); setUpiVerified(false); }}
                                    className="px-6 py-3 border border-dashed border-primary-300 bg-primary-50/5 hover:bg-primary-50/10 text-xs font-bold text-primary-600 dark:text-primary-400 rounded-2xl transition-all flex items-center gap-2 select-none cursor-pointer"
                                  >
                                    <QrCode className="w-4 h-4" />
                                    Generate Secure Payment QR Code
                                  </button>
                                ) : (
                                  <div className="flex flex-col items-center p-4 bg-surface-50/30 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-900 text-center space-y-3 max-w-[280px]">
                                    <div className="bg-white p-3 rounded-xl shadow-md border border-surface-200">
                                      {/* Mock premium QR Code representation */}
                                      <div className="w-36 h-36 bg-gray-900 flex items-center justify-center text-white relative">
                                        <QrCode className="w-24 h-24 text-gray-200" />
                                        <div className="absolute inset-0 border-4 border-primary-500 m-2 rounded animate-pulse opacity-40" />
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-bold text-gray-900 dark:text-white">Scan this QR Code using BHIM / GPay / Paytm</p>
                                      <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">
                                        QR Expires in: <span className="font-mono">{formatTimer(qrTimer)}</span>
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowQr(false)}
                                      className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors uppercase tracking-wider"
                                    >
                                      Cancel QR Payment
                                    </button>
                                  </div>
                                )}
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 2. Credit & Debit Cards */}
                    <div className={`transition-all ${paymentType === 'Card' ? 'bg-surface-50/10 dark:bg-surface-950/20' : ''}`}>
                      <button
                        onClick={() => setPaymentType('Card')}
                        className="w-full flex items-center justify-between p-5 text-left font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentType === 'Card' ? 'border-primary-500' : 'border-gray-300 dark:border-surface-800'}`}>
                            {paymentType === 'Card' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold text-surface-600 dark:text-gray-200 flex items-center gap-1.5">
                              Credit & Debit Cards
                              <span className="badge bg-primary-100 text-primary-700 dark:bg-surface-900 dark:text-primary-400 text-[9px] uppercase font-bold py-0.5 px-1.5 rounded-md">SSL Secured</span>
                            </span>
                            <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Visa, Mastercard, RuPay, Amex • EMI Options</span>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {paymentType === 'Card' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-6 pt-2 border-t border-surface-100 dark:border-surface-900 space-y-4">
                              
                              {/* Quick Autofill Tools */}
                              <div className="flex items-center gap-2 flex-wrap bg-surface-50/20 dark:bg-surface-950/60 p-3 rounded-xl border border-surface-100 dark:border-surface-900">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Quick Autofill (Demo):</span>
                                <button type="button" onClick={() => autofillCard('visa')} className="px-2.5 py-1 bg-white hover:bg-surface-100 dark:bg-surface-900 dark:hover:bg-surface-800 text-[10px] font-bold border border-surface-200 dark:border-surface-800 rounded-lg text-surface-600 dark:text-gray-300 cursor-pointer">Autofill Visa</button>
                                <button type="button" onClick={() => autofillCard('mastercard')} className="px-2.5 py-1 bg-white hover:bg-surface-100 dark:bg-surface-900 dark:hover:bg-surface-800 text-[10px] font-bold border border-surface-200 dark:border-surface-800 rounded-lg text-surface-600 dark:text-gray-300 cursor-pointer">Autofill Mastercard</button>
                                <button type="button" onClick={() => autofillCard('amex')} className="px-2.5 py-1 bg-white hover:bg-surface-100 dark:bg-surface-900 dark:hover:bg-surface-800 text-[10px] font-bold border border-surface-200 dark:border-surface-800 rounded-lg text-surface-600 dark:text-gray-300 cursor-pointer">Autofill Amex</button>
                              </div>

                              {/* Saved Cards Quick Picker */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Saved Cards</p>
                                <div className="p-3 border border-surface-200 dark:border-surface-900 bg-white dark:bg-surface-950 rounded-xl flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-7 bg-surface-50 dark:bg-surface-900 rounded flex items-center justify-center font-bold text-[8px] uppercase border border-surface-200 dark:border-surface-800 text-primary-500">
                                      VISA
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-900 dark:text-white">Nilisha Nagar (Visa Credit)</p>
                                      <p className="text-[9px] text-gray-400">•••• •••• •••• 4242 • Expires 12/28</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCardNumber('4242 4242 4242 4242');
                                      setCardBrand('visa');
                                      setCardName('Nilisha Nagar');
                                      setCardExpiry('12/28');
                                      setCardCvv('999');
                                      toast.success('Selected saved Visa card.');
                                    }}
                                    className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wide cursor-pointer"
                                  >
                                    Use Card
                                  </button>
                                </div>
                              </div>

                              {/* Card detail fields */}
                              <div className="space-y-3">
                                <div className="relative">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Card Number</label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={cardNumber}
                                      onChange={handleCardNumberChange}
                                      placeholder="4111 2222 3333 4444"
                                      className="input pl-10 uppercase font-mono"
                                      maxLength="19"
                                    />
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center">
                                      {cardBrand === 'visa' && <span className="font-extrabold text-[10px] text-blue-500 uppercase tracking-wider">VISA</span>}
                                      {cardBrand === 'mastercard' && <span className="font-extrabold text-[10px] text-red-500 uppercase tracking-wider">MC</span>}
                                      {cardBrand === 'rupay' && <span className="font-extrabold text-[10px] text-indigo-500 uppercase tracking-wider">RUPAY</span>}
                                      {cardBrand === 'amex' && <span className="font-extrabold text-[10px] text-teal-500 uppercase tracking-wider">AMEX</span>}
                                      {cardBrand === 'generic' && <CreditCard className="w-4 h-4 text-gray-400" />}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                  <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Card Holder Name</label>
                                    <input
                                      type="text"
                                      value={cardName}
                                      onChange={(e) => setCardName(e.target.value)}
                                      placeholder="Nilisha Nagar"
                                      className="input"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Expiry (MM/YY)</label>
                                    <input
                                      type="text"
                                      value={cardExpiry}
                                      onChange={handleExpiryChange}
                                      placeholder="12/28"
                                      className="input text-center font-mono"
                                      maxLength="5"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 items-end">
                                  <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CVV</label>
                                    <input
                                      type="password"
                                      value={cardCvv}
                                      onChange={handleCvvChange}
                                      placeholder="•••"
                                      className="input text-center font-mono"
                                      maxLength="4"
                                    />
                                  </div>
                                  <div className="col-span-2 flex items-center pb-2.5 pl-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={saveCard}
                                        onChange={(e) => setSaveCard(e.target.checked)}
                                        className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-surface-950 border-gray-300 dark:border-surface-800"
                                      />
                                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Save card for future checkouts</span>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* EMI Plans for higher conversion */}
                              <div className="space-y-2 pt-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">EMI Options Available</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {[
                                    { id: 'none', label: 'Pay Full Amount', rate: '0% Interest' },
                                    { id: '3m', label: '3 Months EMI', rate: '₹' + Math.round(pricing.finalAmount / 3).toLocaleString('en-IN') + '/mo @ 12%' },
                                    { id: '6m', label: '6 Months EMI', rate: '₹' + Math.round(pricing.finalAmount / 6).toLocaleString('en-IN') + '/mo @ 13%' }
                                  ].map(plan => (
                                    <button
                                      key={plan.id}
                                      type="button"
                                      onClick={() => setSelectedEmiPlan(plan.id)}
                                      className={`p-3 border rounded-xl text-left transition-all ${
                                        selectedEmiPlan === plan.id
                                          ? 'border-primary-500 bg-primary-50/5 dark:bg-surface-900'
                                          : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 hover:border-primary-300'
                                      }`}
                                    >
                                      <p className="text-xs font-bold text-gray-900 dark:text-white">{plan.label}</p>
                                      <p className="text-[9px] text-primary-600 dark:text-primary-400 font-extrabold mt-0.5">{plan.rate}</p>
                                    </button>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 3. Net Banking */}
                    <div className={`transition-all ${paymentType === 'NetBanking' ? 'bg-surface-50/10 dark:bg-surface-950/20' : ''}`}>
                      <button
                        onClick={() => setPaymentType('NetBanking')}
                        className="w-full flex items-center justify-between p-5 text-left font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentType === 'NetBanking' ? 'border-primary-500' : 'border-gray-300 dark:border-surface-800'}`}>
                            {paymentType === 'NetBanking' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold text-surface-600 dark:text-gray-200 flex items-center gap-1.5">
                              Net Banking
                            </span>
                            <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Select from popular Indian Banks</span>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {paymentType === 'NetBanking' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-6 pt-2 border-t border-surface-100 dark:border-surface-900 space-y-4">
                              
                              {/* Popular banks quick select grid */}
                              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {[
                                  { name: 'SBI', code: 'State Bank of India', logo: '🏦' },
                                  { name: 'HDFC', code: 'HDFC Bank', logo: '🏦' },
                                  { name: 'ICICI', code: 'ICICI Bank', logo: '🏦' },
                                  { name: 'Axis', code: 'Axis Bank', logo: '🏦' },
                                  { name: 'Kotak', code: 'Kotak Mahindra Bank', logo: '🏦' }
                                ].map(bank => (
                                  <button
                                    key={bank.code}
                                    type="button"
                                    onClick={() => setSelectedBank(bank.code)}
                                    className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                                      selectedBank === bank.code
                                        ? 'border-primary-500 bg-primary-50/10 dark:bg-surface-900'
                                        : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 hover:border-primary-300'
                                    }`}
                                  >
                                    <span className="text-xl mb-1">{bank.logo}</span>
                                    <span className="text-[10px] font-extrabold text-surface-600 dark:text-gray-300">{bank.name}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Search bank option */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Or Search Other Banks</label>
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    value={bankSearch}
                                    onChange={(e) => setBankSearch(e.target.value)}
                                    placeholder="Search your bank (e.g. Yes Bank...)"
                                    className="input pl-10"
                                  />
                                </div>

                                {bankSearch && (
                                  <div className="border border-surface-200 dark:border-surface-900 bg-white dark:bg-surface-950 rounded-xl divide-y divide-surface-100 dark:divide-surface-900 max-h-32 overflow-y-auto shadow-inner">
                                    {filteredBanks.map(b => (
                                      <button
                                        key={b}
                                        type="button"
                                        onClick={() => { setSelectedBank(b); setBankSearch(''); }}
                                        className="w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-surface-900 font-bold transition-all block"
                                      >
                                        {b}
                                      </button>
                                    ))}
                                    {filteredBanks.length === 0 && (
                                      <p className="p-3 text-xs text-gray-400 text-center font-bold">No banks match your search.</p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {selectedBank && (
                                <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> Selected Bank: <span className="font-extrabold uppercase">{selectedBank}</span>
                                </p>
                              )}

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 4. Wallets */}
                    <div className={`transition-all ${paymentType === 'Wallet' ? 'bg-surface-50/10 dark:bg-surface-950/20' : ''}`}>
                      <button
                        onClick={() => setPaymentType('Wallet')}
                        className="w-full flex items-center justify-between p-5 text-left font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentType === 'Wallet' ? 'border-primary-500' : 'border-gray-300 dark:border-surface-800'}`}>
                            {paymentType === 'Wallet' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold text-surface-600 dark:text-gray-200 flex items-center gap-1.5">
                              Mobile Wallets
                            </span>
                            <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Paytm, Amazon Pay, Mobikwik, Freecharge</span>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {paymentType === 'Wallet' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-6 pt-2 border-t border-surface-100 dark:border-surface-900 space-y-4">
                              
                              {/* Wallet Quick grid */}
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { id: 'paytm', name: 'Paytm Wallet', desc: 'Instant Pay', icon: '💵' },
                                  { id: 'amazon', name: 'Amazon Pay', desc: 'Secure Pay', icon: '💳' },
                                  { id: 'mobikwik', name: 'Mobikwik', desc: 'SuperCash eligible', icon: '⚡' },
                                  { id: 'freecharge', name: 'Freecharge', desc: 'Flat cashback', icon: '📱' }
                                ].map(wallet => (
                                  <button
                                    key={wallet.id}
                                    type="button"
                                    onClick={() => { setSelectedWallet(wallet.id); setWalletLinked(false); }}
                                    className={`p-3 border rounded-xl flex items-center gap-3 text-left transition-all ${
                                      selectedWallet === wallet.id
                                        ? 'border-primary-500 bg-primary-50/10 dark:bg-surface-900'
                                        : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 hover:border-primary-300'
                                    }`}
                                  >
                                    <span className="text-2xl">{wallet.icon}</span>
                                    <div>
                                      <p className="text-xs font-bold text-gray-900 dark:text-white">{wallet.name}</p>
                                      <p className="text-[9px] text-gray-400 font-semibold">{wallet.desc}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>

                              {/* Link wallet controls */}
                              <div className="p-4 bg-surface-50/30 dark:bg-surface-950 border border-surface-100 dark:border-surface-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <p className="text-xs font-extrabold text-surface-600 dark:text-gray-200 uppercase tracking-wider">Link Account</p>
                                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Link your mobile wallet securely to check balance and pay.</p>
                                  {walletLinked && (
                                    <p className="text-xs text-green-500 font-bold mt-1.5 flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" /> Wallet Linked! Balance: {formatPrice(walletBalance)}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWalletLinked(true);
                                    toast.success('Wallet linked successfully!');
                                  }}
                                  disabled={walletLinked}
                                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 select-none cursor-pointer"
                                >
                                  {walletLinked ? 'Linked' : 'Link Account'}
                                </button>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 5. Cash on Delivery (COD) */}
                    <div className={`transition-all ${paymentType === 'COD' ? 'bg-surface-50/10 dark:bg-surface-950/20' : ''}`}>
                      <button
                        onClick={() => setPaymentType('COD')}
                        className="w-full flex items-center justify-between p-5 text-left font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentType === 'COD' ? 'border-primary-500' : 'border-gray-300 dark:border-surface-800'}`}>
                            {paymentType === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold text-surface-600 dark:text-gray-200 flex items-center gap-1.5">
                              Cash on Delivery (COD)
                            </span>
                            <span className="block text-[10px] text-gray-400 font-semibold mt-0.5">Pay when you receive your sleep products</span>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {paymentType === 'COD' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-6 pt-2 border-t border-surface-100 dark:border-surface-900 space-y-4">
                              
                              {/* Verify Pincode Eligibility */}
                              <div className="bg-surface-50/30 dark:bg-surface-950 p-4 rounded-xl border border-surface-100/50 dark:border-surface-900/80 space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Verify Pincode Eligibility for COD</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={pincodeCheck}
                                    onChange={(e) => {
                                      setPincodeCheck(e.target.value.replace(/\D/g, ''));
                                      setPincodeStatus('unchecked');
                                    }}
                                    placeholder="E.g. 400001"
                                    className="input flex-1"
                                    maxLength="6"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleCheckPincode}
                                    disabled={pincodeStatus === 'checking'}
                                    className="px-4 py-2.5 bg-surface-600 hover:bg-surface-700 dark:bg-surface-900 text-xs font-bold text-white rounded-xl transition-all disabled:opacity-50 select-none cursor-pointer"
                                  >
                                    {pincodeStatus === 'checking' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Check'}
                                  </button>
                                </div>

                                {pincodeStatus === 'eligible' && (
                                  <p className="text-[11px] text-green-500 font-bold flex items-center gap-1 mt-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> This pincode is eligible for cash on delivery.
                                  </p>
                                )}

                                {pincodeStatus === 'ineligible' && (
                                  <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Sorry, COD is not supported at this pincode location.
                                  </p>
                                )}
                              </div>

                              {/* Handling fee notice */}
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-xl text-[10px] text-yellow-700 dark:text-yellow-400 font-semibold leading-relaxed flex gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-extrabold">COD Handling Policy:</span> An additional handling fee of ₹49 is applicable on COD orders under ₹2,500 to avoid mock checkouts. We recommend paying online or via UPI for instant free shipping!
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                  {/* Failure toggle switch for demo purposes */}
                  <div className="p-3 bg-surface-50/20 dark:bg-surface-900/40 rounded-xl border border-surface-200/40 dark:border-surface-900/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[9px] flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Demo Gateway Controls:
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={simulateFailure} 
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-rose-500 focus:ring-rose-500 bg-white dark:bg-surface-950 border-gray-300 dark:border-surface-800"
                      />
                      <span className="text-[10px] font-bold text-rose-500">Simulate Payment Failure</span>
                    </label>
                  </div>

                  {/* Checkout buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="px-6 py-4 rounded-xl border border-surface-200 text-gray-500 hover:bg-surface-50 dark:border-surface-800 dark:text-gray-300 dark:hover:bg-surface-900 font-bold text-xs transition-all tracking-wider uppercase select-none cursor-pointer"
                    >
                      ← Address Step
                    </button>
                    <button
                      type="button"
                      onClick={handlePaymentAndCheckout}
                      className="flex-1 py-4 bg-brand-gradient hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-brand flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Pay Securely — {formatPrice(pricing.finalAmount)}
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

          </div>

          {/* Sticky Sidebar (Order Summary & Conversion features) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Sticky summary wrapper */}
            <div className="bg-white dark:bg-surface-950 rounded-3xl border border-surface-200 dark:border-surface-900 shadow-card p-5 h-fit sticky top-24 space-y-5">
              <h3 className="font-display text-lg font-bold text-surface-600 dark:text-primary-300 border-b border-surface-100 dark:border-surface-900 pb-3 flex items-center justify-between">
                Order Summary
                <span className="badge bg-surface-50 dark:bg-surface-900 text-primary-600 dark:text-primary-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {items.length} Product{items.length > 1 ? 's' : ''}
                </span>
              </h3>

              {/* Order items lists */}
              <div className="divide-y divide-surface-50 dark:divide-surface-900 max-h-44 overflow-y-auto pr-1">
                {items.map(item => {
                  const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
                  return (
                    <div key={item.key} className="py-2.5 flex gap-3 text-xs">
                      <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=200&auto=format&fit=crop" alt={item.product.name} className="w-10 h-10 rounded-lg object-cover border border-surface-100 dark:border-surface-800 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.product.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Qty: {item.quantity} • {item.variant?.size || 'Standard'}</p>
                      </div>
                      <p className="font-extrabold text-surface-600 dark:text-gray-200">{formatPrice(price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Real-time Coupon Code input */}
              <div className="bg-surface-50/20 dark:bg-surface-950/20 p-3 rounded-2xl border border-surface-200/50 dark:border-surface-900 space-y-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Tag className="w-3 h-3 text-primary-500" /> Apply Coupon Code
                </p>
                
                {!appliedCoupon ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Try FRESHNAPS10"
                      className="input py-2 text-xs flex-1 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-2 bg-surface-600 hover:bg-surface-700 dark:bg-surface-900 text-xs font-bold text-white rounded-xl transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-primary-50/20 dark:bg-surface-950 border border-primary-300/40 p-2.5 rounded-xl text-xs font-bold">
                    <span className="text-primary-600 dark:text-primary-400 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" /> {appliedCoupon.code} Applied
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-rose-500 hover:text-rose-600 font-extrabold text-[10px] uppercase cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <span className="block text-[9px] text-gray-400 font-semibold leading-relaxed">
                  Use *FRESHNAPS10* for 10% off, or *SLEEPGOLD* for flat ₹500 discount (orders &gt; ₹2k).
                </span>
              </div>

              {/* Offers & Cashback section for high conversion */}
              <div className="bg-green-50/10 dark:bg-green-950/10 p-3 rounded-2xl border border-green-300/20 space-y-2">
                <p className="text-[10px] font-extrabold text-green-600 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-green-500" /> Active Offers & Cashback
                </p>
                <ul className="text-[10px] text-gray-500 dark:text-gray-400 space-y-1 font-semibold leading-relaxed">
                  <li className="flex items-start gap-1">
                    <span className="text-green-500">✔</span> Pay with UPI for instant flat ₹150 discount!
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-green-500">✔</span> Get 5% cashback on SBI Credit Cards.
                  </li>
                </ul>
              </div>

              {/* Final receipt block */}
              <div className="border-t border-surface-100 dark:border-surface-900 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-gray-400 font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-{formatPrice(pricing.discountAmount)}</span>
                  </div>
                )}

                {pricing.upiDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>UPI Instant Offer</span>
                    <span>-{formatPrice(pricing.upiDiscount)}</span>
                  </div>
                )}

                {pricing.codCharge > 0 && (
                  <div className="flex justify-between text-yellow-600 font-bold">
                    <span>COD Handling Fee</span>
                    <span>+{formatPrice(pricing.codCharge)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 dark:text-gray-400 font-semibold">
                  <span>Shipping Charges</span>
                  <span className={pricing.finalShippingCharge === 0 ? 'text-green-500 font-extrabold uppercase' : ''}>
                    {pricing.finalShippingCharge === 0 ? 'FREE' : formatPrice(pricing.finalShippingCharge)}
                  </span>
                </div>

                <div className="flex justify-between font-extrabold text-base text-surface-600 dark:text-primary-300 pt-3 border-t border-surface-100 dark:border-surface-900">
                  <span>Grand Total</span>
                  <span>{formatPrice(pricing.finalAmount)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-surface-50 dark:border-surface-900/80 pt-4 grid grid-cols-3 gap-2 text-center text-gray-400 font-semibold">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-primary-500 mb-1" />
                  <span className="text-[8px] uppercase tracking-wider leading-tight">100% Secure Payments</span>
                </div>
                <div className="flex flex-col items-center">
                  <Lock className="w-5 h-5 text-primary-500 mb-1 animate-pulse" />
                  <span className="text-[8px] uppercase tracking-wider leading-tight">SSL Secured Gateway</span>
                </div>
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-5 h-5 text-primary-500 mb-1" />
                  <span className="text-[8px] uppercase tracking-wider leading-tight">Easy 14d Refunds</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Full-Screen Secure Payment Gateway Simulator Overlay */}
      <AnimatePresence>
        {paymentStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-surface-950/90 backdrop-blur-md flex items-center justify-center p-4 text-white"
          >
            <div className="max-w-md w-full bg-surface-950 border border-surface-900 rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
              
              {/* Top lock decoration */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-gradient" />

              {/* Dynamic Status Rendering */}
              {paymentStatus === 'loading' && (
                <div className="space-y-6 py-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-surface-900" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin" />
                    <Lock className="w-7 h-7 text-primary-500 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold tracking-wide">Secure Authorization</h3>
                    <p className="text-sm text-gray-400 font-medium">Please do not refresh this page or click back.</p>
                  </div>

                  <div className="bg-surface-950/40 p-4 rounded-2xl border border-surface-900/80">
                    <p className="text-xs font-mono font-bold text-primary-500 animate-pulse">{paymentProgressMsg}</p>
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="space-y-6 py-4">
                  <div className="w-20 h-20 rounded-full bg-green-950/40 border border-green-500 flex items-center justify-center mx-auto text-green-500 shadow-lg shadow-green-950/20">
                    <Check className="w-10 h-10 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-bold tracking-wide text-green-400">Payment Authorized!</h3>
                    <p className="text-sm text-gray-400 font-medium">Your Sleepwell-grade premium order has been approved.</p>
                  </div>

                  <p className="text-xs font-bold text-primary-500 tracking-widest uppercase animate-pulse">Redirecting to order dashboard...</p>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="space-y-6 py-4">
                  <div className="w-20 h-20 rounded-full bg-rose-950/40 border border-rose-500 flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-950/20">
                    <AlertTriangle className="w-10 h-10 animate-pulse" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-display text-2xl font-bold tracking-wide text-rose-400">Transaction Declined</h3>
                    <p className="text-sm text-gray-400 font-medium">
                      The simulated bank declined authorization. This typically occurs during card credential validation failure or lack of funds.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentStatus('idle');
                        setSimulateFailure(false);
                      }}
                      className="flex-1 py-3 border border-surface-800 text-xs font-bold uppercase rounded-xl hover:bg-surface-900 transition-all cursor-pointer"
                    >
                      Change Method
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentStatus('idle');
                        setSimulateFailure(false);
                        handlePaymentAndCheckout();
                      }}
                      className="flex-1 py-3 bg-brand-gradient text-white text-xs font-extrabold uppercase rounded-xl transition-all shadow-brand cursor-pointer"
                    >
                      Retry Payment
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CheckoutPage;
