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
    <div className="min-h-screen bg-[#1D2125] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#24282D] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative border border-gray-800">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8FFF00] via-emerald-500 to-[#1D2125]"></div>

        <div className="w-full p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Enter your details to access your workspace' : 'Start managing your invoices today'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 text-red-200 text-sm rounded-xl border border-red-500/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#8FFF00] transition-colors" size={20} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#1D2125] border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8FFF00] focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#8FFF00] transition-colors" size={20} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#1D2125] border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8FFF00] focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#8FFF00] transition-colors" size={20} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#1D2125] border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8FFF00] focus:border-transparent outline-none text-white transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8FFF00] hover:bg-[#76D100] text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-8 shadow-lg shadow-[#8FFF00]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(143,255,0,0.4)]"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-gray-500 hover:text-[#8FFF00] font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};