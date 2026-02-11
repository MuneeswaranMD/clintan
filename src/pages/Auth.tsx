import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../services/authService';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password || (!isLogin && !name)) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Firebase Authentication
      const trimmedEmail = email.trim();
      let user: UserType;
      if (isLogin) {
        user = await authService.signIn(trimmedEmail, password);
      } else {
        user = await authService.signUp(trimmedEmail, password, name);
      }

      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      {/* Left Side: Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#EBF5FF] items-center justify-center p-20 relative overflow-hidden">
        <div className="relative z-10 w-full max-w-lg text-center">
          {/* Abstract CSS Illustration (Phone Mockup style) */}
          <div className="mb-16 relative">
            <div className="w-64 h-[450px] bg-slate-900 mx-auto rounded-[3rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl"></div>
              <div className="p-6 pt-12 space-y-4">
                <div className="h-32 bg-indigo-500/20 rounded-2xl flex items-end p-4">
                  <div className="flex gap-2 items-end w-full">
                    <div className="w-1/4 h-12 bg-indigo-400 rounded-t-lg"></div>
                    <div className="w-1/4 h-20 bg-indigo-500 rounded-t-lg"></div>
                    <div className="w-1/4 h-16 bg-indigo-400 rounded-t-lg"></div>
                    <div className="w-1/4 h-24 bg-indigo-500 rounded-t-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-4 bg-slate-700/50 rounded-full w-full"></div>
                  ))}
                  <div className="h-4 bg-slate-700/50 rounded-full w-2/3"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="h-20 bg-blue-500/30 rounded-2xl"></div>
                  <div className="h-20 bg-indigo-500/30 rounded-2xl"></div>
                </div>
              </div>
            </div>
            {/* Background blobs */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200/50 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-indigo-200/50 rounded-full blur-3xl -z-10"></div>
          </div>

          <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Streamline Your Inventory</h1>
          <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-sm mx-auto">
            Efficiently manage, track, and identify your products with our intuitive system.
          </p>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20 relative">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
              {isLogin ? 'Last login: February 11, 2026' : 'Join the precision inventory network'}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <div className="relative group">
                  <input
                    type="text"
                    required
                    className="w-full px-6 py-5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
                    placeholder="Full Identity"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative group">
                <input
                  type="email"
                  required
                  className="w-full px-6 py-5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
                  placeholder="Username or Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <input
                  type="password"
                  required
                  className="w-full px-6 py-5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
              <label className="flex items-center gap-3 text-slate-400 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
                <span className="group-hover:text-slate-600 transition-colors">Remember me</span>
              </label>
              {isLogin && (
                <button type="button" className="text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A8CFF] hover:bg-blue-600 text-white font-black py-5 rounded-xl transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed group uppercase tracking-[0.2em]"
            >
              {loading ? 'Processing Protocol...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          {/* Announcement Box from Reference Image */}
          <div className="p-6 bg-[#F0F7FF] rounded-2xl border border-blue-50">
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              <span className="font-black">System Announcement:</span> Full automated synchronization scheduled for 2026-02-15 at 11:00 PM.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-all"
            >
              {isLogin ? (
                <>New to the network? <span className="text-blue-600 ml-1">Establish Node</span></>
              ) : (
                <>Existing Operative? <span className="text-blue-600 ml-1">Return to Access</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
