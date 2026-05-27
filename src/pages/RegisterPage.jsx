import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { authService } from '../services';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Smartphone, Lock, Sparkles } from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(s => s.auth);
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const res = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined
      });
      dispatch(loginSuccess(res.data));
      toast.success(`Welcome to Freshnaps, ${res.data.user.name}! Verification email sent.`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  // Google SSO mock handler
  const handleGoogleSignUp = async () => {
    dispatch(loginStart());
    try {
      const mockGoogleUser = {
        googleId: 'google_109823472093847',
        email: 'customer@freshnaps.com',
        name: 'Nilisha Nagar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'
      };
      
      const res = await authService.googleLogin(mockGoogleUser);
      dispatch(loginSuccess(res.data));
      toast.success(`Google SSO Activated! Welcome, ${res.data.user.name}`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google Auth Failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50/20 dark:bg-navy-950 px-4 py-20 select-none">
      <div className="w-full max-w-md space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-card p-6 md:p-8 rounded-3xl"
        >
          {/* Header Brand */}
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
              Create Account
            </h1>
            <p className="text-gray-400 text-xs font-semibold mt-0.5">Become a premium bedding member</p>
          </div>

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
              className="btn-primary w-full py-3.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold mt-2 select-none cursor-pointer"
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
            <div className="flex-grow border-t border-cream-200/60 dark:border-navy-800"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">Or Register With</span>
            <div className="flex-grow border-t border-cream-200/60 dark:border-navy-800"></div>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full py-3.5 border border-cream-200 dark:border-navy-800 bg-white hover:bg-cream-50/50 dark:bg-navy-950 dark:hover:bg-navy-850 text-xs font-extrabold text-navy-500 dark:text-gray-300 rounded-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.85-2.22 2.27v2.54h3.58c2.1-1.9 3.69-4.7 3.69-6.64z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.9l-3.58-2.54c-.99.66-2.23 1.06-4.35 1.06-4.17 0-7.7-2.82-8.96-6.62H.99v2.76C3.01 20.08 7.15 24 12 24z"/>
              <path fill="#FBBC05" d="M3.04 12.98a7.22 7.22 0 0 1 0-4.37V5.85H.99a11.96 11.96 0 0 0 0 10.9l2.05-2.76z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.15 0 3.01 3.92.99 7.76l2.05 2.76c1.26-3.8 4.79-6.62 8.96-6.62z"/>
            </svg>
            Sign Up with Google
          </button>

          <p className="text-center text-xs font-semibold text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-600 font-extrabold hover:underline uppercase tracking-wide">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
