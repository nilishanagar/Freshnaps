import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, CreditCard, MapPin, Edit, Plus, X, Trash2, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { orderService, userService } from '../services';
import { updateUser } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { indianStatesAndCities, statesList } from '../utils/indiaData';
import toast from 'react-hot-toast';
import SEOHead from '../components/common/SEOHead';

import { fetchOrders, cancelOrder, reorderItems } from '../store/slices/orderSlice';
import { addToCart } from '../store/slices/cartSlice';
import OrderCard from '../components/orders/OrderCard';
import CancelOrderModal from '../components/orders/CancelOrderModal';

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  const { orders, loading: loadingOrders, actionLoading } = useSelector(s => s.order);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});

  // Address Add State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressData, setAddressData] = useState({ label: '', street: '', city: '', state: '', pincode: '', isDefault: false });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});

  // Payment Add State
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [savedCards, setSavedCards] = useState([
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/28' }
  ]);
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      dispatch(fetchOrders());
    }
  }, [activeTab, dispatch]);

  // 1. Cancellation Flow
  const handleOpenCancelModal = (order) => {
    setSelectedOrderForCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async ({ reason }) => {
    if (!selectedOrderForCancel) return;

    try {
      toast.loading('Processing cancellation...', { id: 'cancel-toast' });
      const resultAction = await dispatch(
        cancelOrder({ id: selectedOrderForCancel._id, reason })
      );

      if (cancelOrder.fulfilled.match(resultAction)) {
        toast.success('Order successfully cancelled!', { id: 'cancel-toast' });
        setIsCancelModalOpen(false);
        setSelectedOrderForCancel(null);
        dispatch(fetchOrders());
      } else {
        toast.error(resultAction.payload || 'Failed to cancel order', { id: 'cancel-toast' });
      }
    } catch (err) {
      toast.error('Cancellation failed. Please try again.', { id: 'cancel-toast' });
    }
  };

  // 2. Reordering Flow
  const handleReorder = async (order) => {
    try {
      toast.loading('Adding previous items to cart...', { id: 'reorder-toast' });
      const resultAction = await dispatch(reorderItems(order._id));

      if (reorderItems.fulfilled.match(resultAction)) {
        const enrichedItems = resultAction.payload;
        
        for (const item of enrichedItems) {
          dispatch(
            addToCart({
              product: item.product,
              quantity: item.quantity,
              variant: item.variant,
            })
          );
        }

        toast.success('All items added to cart! Redirecting...', { id: 'reorder-toast' });
        navigate('/checkout');
      } else {
        toast.error(resultAction.payload || 'Failed to reorder items', { id: 'reorder-toast' });
      }
    } catch (err) {
      toast.error('Reorder failed. Please try again.', { id: 'reorder-toast' });
    }
  };

  // 3. Invoice Downloads (Streams Blob)
  const handleInvoiceDownload = async (order) => {
    try {
      toast.loading('Generating invoice PDF...', { id: 'invoice-down' });
      const response = await orderService.getInvoice(order._id);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${order.invoiceNumber || 'FN-invoice'}.pdf`);
      document.body.appendChild(link);
      
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully!', { id: 'invoice-down' });
    } catch (err) {
      console.error('Invoice download err:', err);
      toast.error('Failed to download invoice PDF.', { id: 'invoice-down' });
    }
  };

  const validateProfile = () => {
    let errs = {};
    if (profileData.name.trim().length < 3) errs.name = "Name must be at least 3 characters.";
    if (!/^[0-9]{10}$/.test(profileData.phone)) errs.phone = "Enter a valid 10-digit mobile number.";
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setSavingProfile(true);
    try {
      const res = await userService.updateProfile(profileData);
      dispatch(updateUser(res.data.user));
      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const validateAddress = () => {
    let errs = {};
    if (addressData.label.trim().length < 2) errs.label = "Label must be at least 2 characters.";
    if (addressData.street.trim().length < 10) errs.street = "Street address must be at least 10 characters.";
    if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(addressData.street)) errs.street = "Please enter a valid physical address, not an email.";
    if (!addressData.state) errs.state = "Please select a state.";
    if (!addressData.city) errs.city = "Please select a city.";
    if (!/^[0-9]{6}$/.test(addressData.pincode)) errs.pincode = "Enter a valid 6-digit PIN code.";
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!validateAddress()) return;
    setSavingAddress(true);
    try {
      const res = await userService.addAddress(addressData);
      dispatch(updateUser({ addresses: res.data.addresses }));
      toast.success('Address added successfully');
      setIsAddingAddress(false);
      setAddressData({ label: '', street: '', city: '', state: '', pincode: '', isDefault: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if(!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await userService.deleteAddress(id);
      dispatch(updateUser({ addresses: res.data.addresses }));
      toast.success('Address deleted');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleStateChange = (e) => {
    setAddressData({ ...addressData, state: e.target.value, city: '' });
    if(addressErrors.state) setAddressErrors({...addressErrors, state: null});
  };

  const validatePayment = () => {
    let errs = {};
    if (paymentData.cardName.trim().length < 3) errs.cardName = "Name on card is required.";
    const cleanedCardNumber = paymentData.cardNumber.replace(/\s/g, '');
    if (!/^[0-9]{16}$/.test(cleanedCardNumber)) errs.cardNumber = "Enter a valid 16-digit card number.";
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(paymentData.expiry)) errs.expiry = "Enter a valid expiry date (MM/YY).";
    if (!/^[0-9]{3,4}$/.test(paymentData.cvv)) errs.cvv = "Enter a valid 3 or 4 digit CVV.";
    setPaymentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!validatePayment()) return;
    setSavingPayment(true);
    setTimeout(() => {
      setSavedCards([...savedCards, { 
        id: Date.now().toString(), 
        last4: paymentData.cardNumber.slice(-4), 
        brand: paymentData.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard', 
        expiry: paymentData.expiry 
      }]);
      toast.success('Card added successfully!');
      setIsAddingPayment(false);
      setPaymentData({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
      setSavingPayment(false);
    }, 800);
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    setPaymentData({ ...paymentData, cardNumber: formattedValue });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setPaymentData({ ...paymentData, expiry: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950 py-10">
      <SEOHead title="My Profile" noindex />
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="card p-6 mb-6 flex items-center gap-5 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center text-white font-display font-bold text-2xl z-10">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="z-10">
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 mt-1 capitalize">{user?.role}</span>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === id ? 'bg-primary-500 text-white shadow-brand' : 'bg-white dark:bg-surface-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-800'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            
            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Account Details</h2>
                  {!isEditingProfile && (
                    <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:text-primary-700">
                      <Edit size={16} /> Edit
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileUpdate} noValidate className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <input type="text" value={profileData.name} onChange={e => { setProfileData({...profileData, name: e.target.value}); setProfileErrors({...profileErrors, name: null}); }} className={`input ${profileErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`} />
                      {profileErrors.name && <p className="text-red-500 text-xs mt-1.5">{profileErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                      <input type="tel" value={profileData.phone} onChange={e => { setProfileData({...profileData, phone: e.target.value}); setProfileErrors({...profileErrors, phone: null}); }} className={`input ${profileErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="10-digit mobile number" maxLength="10" />
                      {profileErrors.phone && <p className="text-red-500 text-xs mt-1.5">{profileErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Cannot be changed)</label>
                      <input type="email" value={user?.email} disabled className="input opacity-50 cursor-not-allowed bg-gray-50" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={savingProfile} className="btn-primary py-2 px-6">
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" onClick={() => {setIsEditingProfile(false); setProfileErrors({});}} className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-surface-700 dark:text-gray-300 dark:hover:bg-surface-800">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', value: user?.name },
                      { label: 'Email', value: user?.email },
                      { label: 'Phone', value: user?.phone || 'Not set' },
                      { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString() },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                        <p className="text-gray-900 dark:text-white font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="flex justify-center py-16"><LoadingSpinner size="xl" /></div>
                ) : orders.length === 0 ? (
                  <div className="card p-12 text-center bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-800/60 rounded-3xl">
                    <Package size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet. Start shopping!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                      <div>
                        <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">Showing your last 3 orders</p>
                      </div>
                      <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-surface-50 hover:bg-primary-500 hover:text-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-bold transition-all border border-surface-200 dark:border-surface-800 shadow-sm cursor-pointer"
                      >
                        View All Orders
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {orders.slice(0, 3).map(order => (
                        <OrderCard
                          key={order._id}
                          order={order}
                          onCancel={handleOpenCancelModal}
                          onReorder={handleReorder}
                          onInvoiceDownload={handleInvoiceDownload}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                  {!isAddingAddress && (
                    <button onClick={() => setIsAddingAddress(true)} className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:text-primary-700">
                      <Plus size={16} /> Add New
                    </button>
                  )}
                </div>

                {isAddingAddress ? (
                  <form onSubmit={handleAddAddress} noValidate className="space-y-4 max-w-lg mb-8 p-6 bg-gray-50 dark:bg-surface-950 rounded-2xl border border-gray-100 dark:border-surface-900">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-surface-800 pb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin size={18} className="text-primary-500" /> New Address
                      </h3>
                      <button type="button" onClick={() => {setIsAddingAddress(false); setAddressErrors({});}} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label (e.g. Home, Work)</label>
                      <input type="text" value={addressData.label} onChange={e => {setAddressData({...addressData, label: e.target.value}); setAddressErrors({...addressErrors, label: null});}} className={`input bg-white dark:bg-surface-900 ${addressErrors.label ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="Home" />
                      {addressErrors.label && <p className="text-red-500 text-xs mt-1.5">{addressErrors.label}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                      <textarea value={addressData.street} onChange={e => {setAddressData({...addressData, street: e.target.value}); setAddressErrors({...addressErrors, street: null});}} className={`input bg-white dark:bg-surface-900 ${addressErrors.street ? 'border-red-500 focus:ring-red-500' : ''}`} rows="2" placeholder="House/Flat No., Building, Area" />
                      {addressErrors.street && <p className="text-red-500 text-xs mt-1.5">{addressErrors.street}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                        <select value={addressData.state} onChange={handleStateChange} className={`input bg-white dark:bg-surface-900 appearance-none ${addressErrors.state ? 'border-red-500 focus:ring-red-500' : ''}`}>
                          <option value="">Select State</option>
                          {statesList.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        {addressErrors.state && <p className="text-red-500 text-xs mt-1.5">{addressErrors.state}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                        <select value={addressData.city} onChange={e => {setAddressData({...addressData, city: e.target.value}); setAddressErrors({...addressErrors, city: null});}} disabled={!addressData.state} className={`input bg-white dark:bg-surface-900 appearance-none ${addressErrors.city ? 'border-red-500 focus:ring-red-500' : ''} ${!addressData.state ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <option value="">Select City</option>
                          {addressData.state && indianStatesAndCities[addressData.state]?.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        {addressErrors.city && <p className="text-red-500 text-xs mt-1.5">{addressErrors.city}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                      <input type="text" value={addressData.pincode} onChange={e => {setAddressData({...addressData, pincode: e.target.value}); setAddressErrors({...addressErrors, pincode: null});}} className={`input bg-white dark:bg-surface-900 ${addressErrors.pincode ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="6-digit PIN" maxLength="6" />
                      {addressErrors.pincode && <p className="text-red-500 text-xs mt-1.5">{addressErrors.pincode}</p>}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input type="checkbox" checked={addressData.isDefault} onChange={e => setAddressData({...addressData, isDefault: e.target.checked})} className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 dark:bg-surface-900 border-gray-300 dark:border-surface-700" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Make this my default address</span>
                    </label>
                    <button type="submit" disabled={savingAddress} className="btn-primary w-full py-3 mt-2 text-base">
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </form>
                ) : null}

                {user?.addresses?.length === 0 && !isAddingAddress ? (
                  <div className="text-center py-10">
                    <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No saved addresses yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {user?.addresses?.map((addr, i) => (
                      <div key={addr._id || i} className={`p-5 border ${addr.isDefault ? 'border-primary-300 bg-primary-50/30 dark:bg-primary-900/10' : 'border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-900'} rounded-2xl relative group hover:border-primary-300 transition-colors`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {addr.label || `Address ${i + 1}`} 
                            {addr.isDefault && <span className="badge bg-primary-100 text-primary-700 text-[10px] px-2 py-0.5">Default</span>}
                          </p>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 bg-white dark:bg-surface-950 rounded-lg shadow-sm border border-gray-100 dark:border-surface-800">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-1">{addr.street}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Payment Methods</h2>
                  {!isAddingPayment && (
                    <button onClick={() => setIsAddingPayment(true)} className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:text-primary-700">
                      <Plus size={16} /> Add Card
                    </button>
                  )}
                </div>

                {isAddingPayment ? (
                  <form onSubmit={handleAddPayment} noValidate className="space-y-4 max-w-lg mb-8 p-6 bg-gray-50 dark:bg-surface-950 rounded-2xl border border-gray-100 dark:border-surface-900">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-surface-800 pb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Lock size={18} className="text-primary-500" /> Secure Add Card
                      </h3>
                      <button type="button" onClick={() => {setIsAddingPayment(false); setPaymentErrors({});}} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name on Card</label>
                      <input type="text" value={paymentData.cardName} onChange={e => {setPaymentData({...paymentData, cardName: e.target.value}); setPaymentErrors({...paymentErrors, cardName: null});}} className={`input bg-white dark:bg-surface-900 ${paymentErrors.cardName ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="John Doe" />
                      {paymentErrors.cardName && <p className="text-red-500 text-xs mt-1.5">{paymentErrors.cardName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                      <div className="relative">
                        <input type="text" value={paymentData.cardNumber} onChange={handleCardNumberChange} maxLength="19" className={`input bg-white dark:bg-surface-900 pl-10 ${paymentErrors.cardNumber ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="XXXX XXXX XXXX XXXX" />
                        <CreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                      {paymentErrors.cardNumber && <p className="text-red-500 text-xs mt-1.5">{paymentErrors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                        <input type="text" value={paymentData.expiry} onChange={handleExpiryChange} maxLength="5" className={`input bg-white dark:bg-surface-900 ${paymentErrors.expiry ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="MM/YY" />
                        {paymentErrors.expiry && <p className="text-red-500 text-xs mt-1.5">{paymentErrors.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                        <input type="password" value={paymentData.cvv} onChange={e => {setPaymentData({...paymentData, cvv: e.target.value.replace(/\D/g,'')}); setPaymentErrors({...paymentErrors, cvv: null});}} maxLength="4" className={`input bg-white dark:bg-surface-900 ${paymentErrors.cvv ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="•••" />
                        {paymentErrors.cvv && <p className="text-red-500 text-xs mt-1.5">{paymentErrors.cvv}</p>}
                      </div>
                    </div>
                    
                    <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
                      <ShieldCheck size={14} className="text-green-500" />
                      Your card details are encrypted and securely stored.
                    </div>

                    <button type="submit" disabled={savingPayment} className="btn-primary w-full py-3 mt-2 text-base">
                      {savingPayment ? 'Saving securely...' : 'Save Card'}
                    </button>
                  </form>
                ) : null}

                {savedCards.length === 0 && !isAddingPayment ? (
                  <div className="text-center py-10 card p-8 max-w-2xl mx-auto border-none shadow-none">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-5 text-primary-600">
                      <ShieldCheck size={32} />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">No Saved Cards</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Securely manage your saved cards for faster checkouts. Our platform uses state-of-the-art encryption to keep your financial data safe.
                    </p>
                    <button onClick={() => setIsAddingPayment(true)} className="btn-primary inline-flex gap-2 mx-auto">
                      <CreditCard size={18} /> Add Payment Method
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {savedCards.map((card) => (
                      <div key={card.id} className="p-5 border border-gray-200 dark:border-surface-800 rounded-2xl relative group bg-white dark:bg-surface-900 flex items-center gap-4">
                        <div className="w-12 h-8 bg-gray-100 dark:bg-surface-950 rounded flex items-center justify-center font-bold text-[10px] text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                          {card.brand}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">•••• {card.last4}</p>
                          <p className="text-xs text-gray-500">Expires {card.expiry}</p>
                        </div>
                        <button onClick={() => setSavedCards(savedCards.filter(c => c.id !== card.id))} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        loading={actionLoading}
      />
    </div>
  );
};

export default ProfilePage;
