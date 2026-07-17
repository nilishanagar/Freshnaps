import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Smartphone, Lock, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import SEOHead from '../components/common/SEOHead';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(s => s.auth);
  const [showPw, setShowPw] = useState(false);

  // Email verification state
  const [verificationStep, setVerificationStep] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const password = watch('password');

  // Separate form for OTP verification
  const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm();

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

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const res = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined
      });

      if (res.data.requiresVerification) {
        // Switch to OTP verification step
        setRegisteredEmail(res.data.email);
        setVerificationStep(true);
        setOtpTimer(60);
        dispatch(loginFailure(null)); // clear loading without error
        toast.success(res.data.message || 'Verification OTP sent to your email!');
      } else {
        // Fallback: if server returns token directly (shouldn't happen with new flow)
        dispatch(loginSuccess(res.data));
        toast.success(`Welcome to Freshnaps, ${res.data.user.name}!`);
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  // Verify signup OTP
  const onVerifyOtp = async (data) => {
    setVerifyingOtp(true);
    try {
      const res = await authService.emailOtpVerify({ email: registeredEmail, otp: data.signupOtp });
      dispatch(loginSuccess(res.data));
      toast.success(`Welcome to Freshnaps, ${res.data.user.name || 'Valued Customer'}! Your email is verified.`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP';
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Resend signup verification OTP
  const handleResendOtp = async () => {
    try {
      const res = await authService.resendSignupOtp({ email: registeredEmail });
      setOtpTimer(60);
      toast.success(res.data.message || 'Verification OTP resent!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP';
      toast.error(msg);
    }
  };

  // Google SSO handler (Real OAuth)
  const googleSignUp = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      dispatch(loginStart());
      try {
        const res = await authService.googleLogin({
          token: tokenResponse.access_token,
        });
        dispatch(loginSuccess(res.data));
        toast.success(`Welcome to Freshnaps, ${res.data.user.name}!`);
        navigate('/');
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Google Auth Failed';
        dispatch(loginFailure(msg));
        toast.error(msg);
      }
    },
    onError: (error) => {
      console.error('Google SignUp Error:', error);
      toast.error('Google Sign-Up was cancelled or failed');
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50/20 dark:bg-surface-950 px-4 py-20 select-none">
      <SEOHead title="Create Account" noindex />
      <div className="w-full max-w-md space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-surface-950 border border-surface-200 dark:border-surface-900 shadow-card p-6 md:p-8 rounded-3xl"
        >
          {/* Header Brand */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
                <span className="text-white font-display font-bold text-sm">FN</span>
              </div>
              <span className="font-display font-bold text-xl text-surface-950 dark:text-primary-300">
                Fresh<span className="text-primary-500">naps</span>
              </span>
            </Link>
            <h1 className="font-display text-xl md:text-2xl font-extrabold text-surface-600 dark:text-white">
              {verificationStep ? 'Verify Your Email' : 'Create Account'}
            </h1>
            <p className="text-gray-400 text-xs font-semibold mt-0.5">
              {verificationStep ? 'One last step to activate your account' : 'Become a premium bedding member'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!verificationStep ? (
              /* Registration Form */
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  
                  {/* Input Name */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-1 block">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })} 
                        placeholder="Your full name" 
                        className="input pl-10" 
                        disabled={isLoading}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{errors.name.message}</p>}
                  </div>

                  {/* Input Email */}
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
                        placeholder="your@email.com" 
                        className="input pl-10" 
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{errors.email.message}</p>}
                  </div>

                  {/* Input Phone */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-1 block">Phone Number (Optional)</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        {...register('phone', {
                          pattern: { value: /^\+?[1-9]\d{6,14}$/, message: 'Must be in E.164 format (+91...)' }
                        })} 
                        placeholder="e.g. +919876543210" 
                        className="input pl-10" 
                        disabled={isLoading}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{errors.phone.message}</p>}
                  </div>

                  {/* Input Password */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-1 block">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} 
                        type={showPw ? 'text' : 'password'} 
                        placeholder="Min. 6 characters" 
                        className="input pl-10 pr-10" 
                        disabled={isLoading}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPw(!showPw)} 
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{errors.password.message}</p>}
                  </div>

                  {/* Input Confirm Password */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-1 block">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        {...register('confirm', { required: 'Please confirm password', validate: v => v === password || 'Passwords do not match' })} 
                        type="password" 
                        placeholder="Confirm password" 
                        className="input pl-10" 
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirm && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{errors.confirm.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="btn-primary w-full py-3.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-brand mt-2 select-none cursor-pointer"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Create Account
                      </>
                    )}
                  </button>
                </form>

                {/* SSO Separator */}
                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-surface-200/60 dark:border-surface-900"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">Or Register With</span>
                  <div className="flex-grow border-t border-surface-200/60 dark:border-surface-900"></div>
                </div>

                {/* Google SSO */}
                <button
                  type="button"
                  onClick={() => googleSignUp()}
                  className="w-full py-3.5 border border-surface-200 dark:border-surface-900 bg-white hover:bg-surface-50/50 dark:bg-surface-950 dark:hover:bg-surface-900 text-xs font-extrabold text-surface-600 dark:text-gray-300 rounded-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.85-2.22 2.27v2.54h3.58c2.1-1.9 3.69-4.7 3.69-6.64z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.9l-3.58-2.54c-.99.66-2.23 1.06-4.35 1.06-4.17 0-7.7-2.82-8.96-6.62H.99v2.76C3.01 20.08 7.15 24 12 24z"/>
                    <path fill="#FBBC05" d="M3.04 12.98a7.22 7.22 0 0 1 0-4.37V5.85H.99a11.96 11.96 0 0 0 0 10.9l2.05-2.76z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.15 0 3.01 3.92.99 7.76l2.05 2.76c1.26-3.8 4.79-6.62 8.96-6.62z"/>
                  </svg>
                  Sign Up with Google
                </button>
              </motion.div>
            ) : (
              /* Email Verification OTP Step */
              <motion.div
                key="verify-otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-4">
                  {/* Info Banner */}
                  <div className="p-3 bg-surface-50/20 dark:bg-surface-950 border border-surface-100 dark:border-surface-900 rounded-2xl text-[11px] leading-relaxed text-gray-500 flex gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <div>
                      We've sent a <span className="font-extrabold text-surface-600 dark:text-primary-400">6-digit verification code</span> to{' '}
                      <span className="font-extrabold text-surface-600 dark:text-primary-400">{registeredEmail}</span>. 
                      Check your inbox (and spam folder).
                    </div>
                  </div>

                  {/* OTP Input */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider mb-1 block">Enter 6-Digit Verification Code *</label>
                    <input
                      {...registerOtp('signupOtp', { 
                        required: 'Verification code is required', 
                        pattern: { value: /^\d{6}$/, message: 'Must be exactly 6 digits' } 
                      })}
                      type="text"
                      placeholder="••••••"
                      maxLength="6"
                      className="input text-center text-lg font-mono font-bold tracking-widest"
                      disabled={verifyingOtp}
                      autoFocus
                    />
                    {otpErrors.signupOtp && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{otpErrors.signupOtp.message}</p>}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => { setVerificationStep(false); setRegisteredEmail(''); }}
                      className="text-gray-400 font-extrabold hover:text-surface-600 uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1"
                      disabled={verifyingOtp}
                    >
                      <ArrowLeft size={12} />
                      Back
                    </button>

                    {otpTimer > 0 ? (
                      <span className="text-gray-400 font-bold">
                        Resend in <span className="font-mono text-primary-500 font-extrabold">{otpTimer}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-primary-600 hover:text-primary-700 font-extrabold uppercase tracking-wider text-[10px] cursor-pointer"
                        disabled={verifyingOtp}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Verify Button */}
                  <button 
                    type="submit" 
                    disabled={verifyingOtp} 
                    className="btn-primary w-full py-3.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-brand select-none cursor-pointer"
                  >
                    {verifyingOtp ? <LoadingSpinner size="sm" /> : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verify & Activate Account
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs font-semibold text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-extrabold hover:underline uppercase tracking-wide">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
