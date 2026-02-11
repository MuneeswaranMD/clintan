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
      let user: UserType;
      if (isLogin) {
        user = await authService.signIn(email, password);
      } else {
        user = await authService.signUp(email, password, name);
      }

      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-lg overflow-hidden flex flex-col relative border border-gray-100 animate-fade-in">
        <div className="w-full p-10 md:p-14">
          <div className="mb-10 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                <Lock size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight uppercase">
              {isLogin ? 'Enterprise Access' : 'Node Onboarding'}
            </h1>
            <p className="text-gray-500 font-medium text-sm">
              {isLogin ? 'Enter your credentials to access the matrix' : 'Initialize your workspace in the Averqon  ecosystem'}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Identity</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="text"
                    className="w-full pl-14 pr-5 py-4.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 outline-none text-gray-900 transition-all font-bold text-sm placeholder:text-gray-300"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Control Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  type="email"
                  className="w-full pl-14 pr-5 py-4.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 outline-none text-gray-900 transition-all font-bold text-sm placeholder:text-gray-300"
                  placeholder="admin@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Secret Key</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter hover:underline">Forgot Key?</button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  type="password"
                  className="w-full pl-14 pr-5 py-4.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 outline-none text-gray-900 transition-all font-bold text-sm placeholder:text-gray-300"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 mt-10 shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="uppercase tracking-[0.2em] text-lg">
                {loading ? 'Processing...' : (isLogin ? 'Authorize Entry' : 'Register Node')}
              </span>
              {!loading && <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors group"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-indigo-600 group-hover:underline">Join the Matrix</span></>
              ) : (
                <>Already a member? <span className="text-indigo-600 group-hover:underline">Return to Access</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
        <span className="text-xs font-black uppercase tracking-[0.5em] text-gray-900">Powered by Averqon </span>
      </div>
    </div>
  );
};