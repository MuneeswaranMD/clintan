import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (newUser: UserType) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);

  const SUPER_ADMIN_EMAILS = ['muneeswaran@averqon.in', 'clintan@averqon.in'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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

      const trimmedEmail = email.trim();

      if (SUPER_ADMIN_EMAILS.includes(trimmedEmail.toLowerCase()) && !isSuperAdminMode) {
        setIsSuperAdminMode(true);
      }

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
    <div className={`min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-700 ${isSuperAdminMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      <div className={`hidden lg:flex lg:w-1/2 items-center justify-center p-20 relative overflow-hidden transition-colors duration-700 ${isSuperAdminMode ? 'bg-slate-900' : 'bg-[#EBF5FF]'}`}>
        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="mb-16 relative">
            <div className={`w-64 h-[450px] mx-auto rounded-[3rem] border-[8px] shadow-2xl relative overflow-hidden transition-all duration-700 ${isSuperAdminMode ? 'bg-black border-slate-800' : 'bg-slate-900 border-slate-800'}`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl"></div>
              <div className="p-6 pt-12 space-y-4">
                <div className={`h-32 rounded-2xl flex items-end p-4 transition-colors duration-700 ${isSuperAdminMode ? 'bg-cyan-500/20' : 'bg-indigo-500/20'}`}>
                  <div className="flex gap-2 items-end w-full">
                    <div className={`w-1/4 h-12 rounded-t-lg transition-colors duration-700 ${isSuperAdminMode ? 'bg-cyan-400' : 'bg-indigo-400'}`}></div>
                    <div className={`w-1/4 h-20 rounded-t-lg transition-colors duration-700 ${isSuperAdminMode ? 'bg-cyan-500' : 'bg-indigo-500'}`}></div>
                    <div className={`w-1/4 h-16 rounded-t-lg transition-colors duration-700 ${isSuperAdminMode ? 'bg-cyan-400' : 'bg-indigo-400'}`}></div>
                    <div className={`w-1/4 h-24 rounded-t-lg animate-pulse transition-colors duration-700 ${isSuperAdminMode ? 'bg-cyan-500' : 'bg-indigo-500'}`}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-4 rounded-full w-full transition-colors duration-700 ${isSuperAdminMode ? 'bg-slate-800' : 'bg-slate-700/50'}`}></div>
                  ))}
                  <div className={`h-4 rounded-full w-2/3 transition-colors duration-700 ${isSuperAdminMode ? 'bg-slate-800' : 'bg-slate-700/50'}`}></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className={`h-20 rounded-2xl transition-colors duration-700 ${isSuperAdminMode ? 'bg-cyan-500/30' : 'bg-blue-500/30'}`}></div>
                  <div className={`h-20 rounded-2xl transition-colors duration-700 ${isSuperAdminMode ? 'bg-blue-500/30' : 'bg-indigo-500/30'}`}></div>
                </div>
              </div>
            </div>
            <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl -z-10 transition-colors duration-700 ${isSuperAdminMode ? 'bg-cyan-500/10' : 'bg-blue-200/50'}`}></div>
            <div className={`absolute -bottom-10 -right-10 w-60 h-60 rounded-full blur-3xl -z-10 transition-colors duration-700 ${isSuperAdminMode ? 'bg-blue-500/10' : 'bg-indigo-200/50'}`}></div>
          </div>
          <h1 className={`text-4xl font-black mb-6 tracking-tight transition-colors duration-700 ${isSuperAdminMode ? 'text-white' : 'text-slate-900'}`}>{isSuperAdminMode ? 'Platform Control Tower' : 'Streamline Your Inventory'}</h1>
          <p className={`text-lg font-medium leading-relaxed max-w-sm mx-auto transition-colors duration-700 ${isSuperAdminMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {isSuperAdminMode ? 'Universal command center for SaaS operations, revenue tracking, and global node management.' : 'Efficiently manage, track, and identify your products with our intuitive system.'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 lg:p-20 relative">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center">
            <h2 className={`text-4xl font-black tracking-tight mb-2 transition-colors duration-700 ${isSuperAdminMode ? 'text-white' : 'text-slate-900'}`}>
              {isLogin ? (isSuperAdminMode ? 'Access Command' : 'Welcome Back') : 'Get Started'}
            </h2>
            <p className={`text-sm font-bold uppercase tracking-widest transition-colors duration-700 ${isSuperAdminMode ? 'text-cyan-400' : 'text-slate-400'}`}>
              {isSuperAdminMode ? 'Securing platform protocols...' : (isLogin ? 'Last login: February 11, 2026' : 'Join the precision inventory network')}
            </p>
          </div>

          {error && (
            <div className={`p-4 text-sm font-bold rounded-2xl border flex items-center gap-3 animate-shake ${isSuperAdminMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100'}`}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  className={`w-full px-6 py-5 border rounded-xl outline-none transition-all font-bold shadow-sm ${isSuperAdminMode ? 'bg-slate-900 border-slate-700 text-white focus:border-cyan-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'}`}
                  placeholder="Full Identity"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <input
                type="email"
                required
                className={`w-full px-6 py-5 border rounded-xl outline-none transition-all font-bold shadow-sm ${isSuperAdminMode ? 'bg-slate-900 border-slate-700 text-white focus:border-cyan-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'}`}
                placeholder="Username or Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (SUPER_ADMIN_EMAILS.includes(e.target.value.toLowerCase().trim())) {
                    setIsSuperAdminMode(true);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <input
                type="password"
                required
                className={`w-full px-6 py-5 border rounded-xl outline-none transition-all font-bold shadow-sm ${isSuperAdminMode ? 'bg-slate-900 border-slate-700 text-white focus:border-cyan-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
              <label className={`flex items-center gap-3 cursor-pointer group transition-colors duration-700 ${isSuperAdminMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <input type="checkbox" className={`w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500 ${isSuperAdminMode ? 'bg-slate-800' : ''}`} />
                <span>Remember me</span>
              </label>
              {isLogin && (
                <button type="button" className={`${isSuperAdminMode ? 'text-cyan-400' : 'text-blue-600'} hover:opacity-80 transition-colors`}>Forgot Password?</button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-black py-5 rounded-xl transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] ${isSuperAdminMode ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20' : 'bg-[#1A8CFF] hover:bg-blue-600 text-white shadow-blue-500/20'}`}
            >
              {loading ? 'Processing Protocol...' : (isLogin ? 'Access Account' : 'Establish Node')}
            </button>
          </form>

          <div className={`p-6 rounded-2xl border transition-colors duration-700 ${isSuperAdminMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F0F7FF] border-blue-50'}`}>
            <p className={`text-sm font-medium leading-relaxed transition-colors duration-700 ${isSuperAdminMode ? 'text-slate-300' : 'text-slate-800'}`}>
              <span className="font-black">{isSuperAdminMode ? 'Platform Notice:' : 'System Announcement:'}</span> {isSuperAdminMode ? 'Platform-wide security audit in progress. Ensure 2FA is active.' : 'Full automated synchronization scheduled for 2026-02-15 at 11:00 PM.'}
            </p>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className={`text-xs font-black uppercase tracking-widest transition-all ${isSuperAdminMode ? 'text-slate-500 hover:text-cyan-400' : 'text-slate-400 hover:text-blue-600'}`}
            >
              {isLogin ? (
                <>New to the network? <span className={isSuperAdminMode ? 'text-cyan-400 ml-1' : 'text-blue-600 ml-1'}>Establish Node</span></>
              ) : (
                <>Existing Operative? <span className={isSuperAdminMode ? 'text-cyan-400 ml-1' : 'text-blue-600 ml-1'}>Return to Access</span></>
              )}
            </button>

            <div className="pt-4 h-8">
              {!isSuperAdminMode ? (
                <button
                  onClick={() => setIsSuperAdminMode(true)}
                  className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-all opacity-0 hover:opacity-100"
                >
                  Admin Access Control
                </button>
              ) : (
                <button
                  onClick={() => setIsSuperAdminMode(false)}
                  className="text-[9px] font-black text-cyan-900 uppercase tracking-widest hover:text-cyan-400 transition-all"
                >
                  Exit Platform Control
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
