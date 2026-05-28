import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Smartphone, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(s => s.auth);
  
  // Tab state: 'otp' or 'password'
  const [activeTab, setActiveTab] = useState('otp');
  const [showPw, setShowPw] = useState(false);

  // OTP State Machine
  const [otpSent, setOtpSent] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const watchPhone = watch('phone');

  // Countdown timer for OTP resending
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Submit Password login
  const onPasswordSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const res = await authService.login({ email: data.email, password: data.password });
      dispatch(loginSuccess(res.data));
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  // Request OTP SMS/WhatsApp
  const onRequestOtp = async (data) => {
    dispatch(loginStart());
    try {
      const res = await authService.otpRequest({ phone: data.phone });
      setTargetPhone(data.phone);
      setOtpSent(true);
      setOtpTimer(60); // 60 seconds resend lock
      dispatch(loginSuccess({ user: null })); // clear loading state
      toast.success(res.data.message || 'Verification OTP code dispatched!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to dispatch OTP';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  // Verify OTP Code
  const onVerifyOtpSubmit = async (data) => {
    setVerifyingOtp(true);
    try {
      const res = await authService.otpVerify({ phone: targetPhone, otp: data.otpCode });
      dispatch(loginSuccess(res.data));
      toast.success(`Welcome back, ${res.data.user.name || 'Valued Customer'}!`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP';
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle Google Single Sign-on (Real OAuth)
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      dispatch(loginStart());
      try {
        const res = await authService.googleLogin({
          token: tokenResponse.access_token,
        });
        dispatch(loginSuccess(res.data));
        toast.success(`Welcome, ${res.data.user.name}!`);
        navigate('/');
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Google Auth Failed';
        dispatch(loginFailure(msg));
        toast.error(msg);
      }
    },
    onError: (error) => {
      console.error('Google Login Error:', error);
      toast.error('Google Sign-In was cancelled or failed');
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50/20 dark:bg-navy-950 px-4 py-20 select-none">
      <div className="w-full max-w-md space-y-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-card p-6 md:p-8 rounded-3xl"
        >
          {/* Logo Brand Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <span className="text-white font-display font-bold text-sm">FN</span>
              </div>
              <span className="font-display font-bold text-xl text-navy-900 dark:text-gold-300">
                Fresh<span className="text-gold-500">naps</span>
              </span>
            </Link>
            <h1 className="font-display text-xl md:text-2xl font-extrabold text-navy-500 dark:text-white">
              Secure Sign In
            </h1>
            <p className="text-gray-400 text-xs font-semibold mt-0.5">Experience premium sleep comfort</p>
          </div>

          {/* Premium Tab Selectors */}
          <div className="flex border border-cream-100 dark:border-navy-800 p-1 rounded-2xl bg-cream-50/30 dark:bg-navy-950 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('otp'); setOtpSent(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'otp'
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-navy-500 dark:text-gray-400 dark:hover:text-gold-400'
              }`}
            >
              <Smartphone size={14} />
              <span>Mobile OTP</span>
              <span className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-[8px] px-1 py-0.5 rounded font-extrabold uppercase animate-pulse">Fast</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-navy-500 dark:text-gray-400 dark:hover:text-gold-400'
              }`}
            >
              <Lock size={14} />
              <span>Password</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            
            {/* OTP Tab view */}
            {activeTab === 'otp' && (
              <motion.div
                key="otp-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {!otpSent ? (
                  /* Form: Send OTP */
                  <form onSubmit={handleSubmit(onRequestOtp)} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-1 block">Phone Number (with Country Code) *</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('phone', { 
                            required: 'Phone number is required', 
                            pattern: { value: /^\+?[1-9]\d{6,14}$/, message: 'Must be in international E.164 format (+91...)' }
                          })}
                          type="text"
                          placeholder="e.g. +919876543210"
                          className="input pl-10"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{errors.phone.message}</p>}
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="btn-primary w-full py-3.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold select-none cursor-pointer"
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Send Verification OTP
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Form: Verify OTP */
                  <form onSubmit={handleSubmit(onVerifyOtpSubmit)} className="space-y-4">
                    <div className="p-3 bg-cream-50/20 dark:bg-navy-950 border border-cream-100 dark:border-navy-850 rounded-2xl text-[11px] leading-relaxed text-gray-500 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                      <div>
                        OTP code dispatched to <span className="font-extrabold text-navy-500 dark:text-gold-400">{targetPhone}</span> via SMS and WhatsApp.
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-1 block">Enter 6-Digit OTP *</label>
                      <input
                        {...register('otpCode', { 
                          required: 'OTP code is required', 
                          pattern: { value: /^\d{6}$/, message: 'OTP must be exactly 6 digits' } 
                        })}
                        type="text"
                        placeholder="••••••"
                        maxLength="6"
                        className="input text-center text-lg font-mono font-bold tracking-widest"
                        disabled={verifyingOtp}
                      />
                      {errors.otpCode && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{errors.otpCode.message}</p>}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-gray-400 font-extrabold hover:text-navy-500 uppercase tracking-wider text-[10px] cursor-pointer"
                        disabled={verifyingOtp}
                      >
                        Change Phone
                      </button>

                      {otpTimer > 0 ? (
                        <span className="text-gray-400 font-bold">
                          Resend in <span className="font-mono text-gold-500 font-extrabold">{otpTimer}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRequestOtp({ phone: targetPhone })}
                          className="text-gold-600 hover:text-gold-700 font-extrabold uppercase tracking-wider text-[10px] cursor-pointer"
                          disabled={verifyingOtp}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={verifyingOtp} 
                      className="btn-primary w-full py-3.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold select-none cursor-pointer"
                    >
                      {verifyingOtp ? <LoadingSpinner size="sm" /> : 'Verify & Sign In'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* Password Tab view */}
            {activeTab === 'password' && (
              <motion.div
                key="pw-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-1 block">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('email', { 
                          required: 'Email is required', 
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' } 
                        })}
                        type="email"
                        placeholder="e.g. nilisha@gmail.com"
                        className="input pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-1 block">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('password', { required: 'Password is required' })}
                        type={showPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="input pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPw(!showPw)} 
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer"
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{errors.password.message}</p>}
                  </div>

                  <div className="flex justify-end text-xs font-bold text-gold-600 hover:text-gold-700 select-none cursor-pointer">
                    <Link to="/forgot-password">Forgot Password?</Link>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="btn-primary w-full py-3.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold select-none cursor-pointer"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

          {/* OR Separator */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-cream-200/60 dark:border-navy-800"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">Or Continue With</span>
            <div className="flex-grow border-t border-cream-200/60 dark:border-navy-800"></div>
          </div>

          {/* Google Sign-in SSO button */}
          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full py-3.5 border border-cream-200 dark:border-navy-800 bg-white hover:bg-cream-50/50 dark:bg-navy-950 dark:hover:bg-navy-850 text-xs font-extrabold text-navy-500 dark:text-gray-300 rounded-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
          >
            {/* Custom Google Vector Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.85-2.22 2.27v2.54h3.58c2.1-1.9 3.69-4.7 3.69-6.64z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.9l-3.58-2.54c-.99.66-2.23 1.06-4.35 1.06-4.17 0-7.7-2.82-8.96-6.62H.99v2.76C3.01 20.08 7.15 24 12 24z"/>
              <path fill="#FBBC05" d="M3.04 12.98a7.22 7.22 0 0 1 0-4.37V5.85H.99a11.96 11.96 0 0 0 0 10.9l2.05-2.76z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.15 0 3.01 3.92.99 7.76l2.05 2.76c1.26-3.8 4.79-6.62 8.96-6.62z"/>
            </svg>
            Sign In with Google
          </button>

          <p className="text-center text-xs font-semibold text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-600 font-extrabold hover:underline uppercase tracking-wide">Create one</Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
