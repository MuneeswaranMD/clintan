import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';
import { Facebook, Apple, Mail, Lock, User, Check, AlertCircle } from 'lucide-react';

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
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);

  const SUPER_ADMIN_EMAILS = ['muneeswaran@averqon.in', 'clintan@averqon.in'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !agreeTerms) {
      setError('You must agree to the Terms and Conditions');
      return;
    }

    setLoading(true);

    try {
      if (!email || !password || (!isLogin && !name)) {
        setError('Please fill in all fields');
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

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('');
    setLoading(true);
    try {
      let user: UserType;
      if (provider === 'google') {
        user = await authService.signInWithGoogle();
      } else if (provider === 'facebook') {
        user = await authService.signInWithFacebook();
      } else {
        throw new Error('Apple login not implemented');
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || `${provider} login failed`);
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative font-sans flex flex-col ${isSuperAdminMode ? 'bg-[#0a0a0c]' : 'bg-[#f8f9fe]'}`}>
      {/* Background Section */}
      <div className={`absolute top-0 left-0 right-0 h-[50vh] transition-all duration-700 overflow-hidden ${isSuperAdminMode ? 'brightness-50' : ''}`}>
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
          alt="Background"
          className="w-full h-full object-cover transform scale-110 motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-900/40"></div>
      </div>

      {/* Header Navigation */}
      <nav className="relative z-20 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
            <span className="text-white font-black text-xl italic">T</span>
          </div>
          <span className="text-white font-black text-lg tracking-tighter uppercase">Averqon Dashboard</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-white/80 text-sm font-bold uppercase tracking-widest">
          {['Pages', 'Authentication', 'Applications', 'Ecommerce', 'Docs'].map(link => (
            <button key={link} className="hover:text-white transition-colors">{link}</button>
          ))}
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
          Buy Now
        </button>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-white text-5xl font-black tracking-tight mb-2">
            {isLogin ? 'Welcome back!' : 'Create an account'}
          </h1>
          <p className="text-white/80 text-lg max-w-md mx-auto font-medium">
            {isLogin
              ? 'Use these awesome forms to login or create new account in your project for free.'
              : 'Use these awesome forms to login or create new account in your project for free.'}
          </p>
        </div>

        <div className={`w-full max-w-md bg-white rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-500 ${isSuperAdminMode ? 'ring-2 ring-cyan-500/50' : ''}`}>
          <div className="p-8 md:p-10 space-y-8">
            <div className="text-center space-y-6">
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                {isLogin ? 'Sign in with' : 'Register with'}
              </p>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-14 h-14 rounded-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group"
                >
                  <Facebook className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                </button>
                <button
                  onClick={() => handleSocialLogin('apple')}
                  className="w-14 h-14 rounded-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group"
                >
                  <Apple className="text-slate-900 group-hover:scale-110 transition-transform" size={24} />
                </button>
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="w-14 h-14 rounded-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3 animate-shake">
                <AlertCircle className="text-red-500" size={18} />
                <p className="text-red-600 text-sm font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (SUPER_ADMIN_EMAILS.includes(e.target.value.toLowerCase().trim())) {
                        setIsSuperAdminMode(true);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLogin ? (
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                    </div>
                    <span className="text-sm font-bold text-slate-500">Remember me</span>
                  </label>
                ) : (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-md border-slate-200 text-blue-600 focus:ring-blue-500/20"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-slate-500">I agree the <span className="text-slate-900 underline">Terms and Conditions</span></span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-sm"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="text-blue-600 ml-1">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-blue-600 ml-1">Sign In</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-slate-400 font-bold text-xs uppercase tracking-widest mb-8">
            {['Company', 'About Us', 'Team', 'Products', 'Blog', 'Pricing'].map(link => (
              <button key={link} className="hover:text-slate-600 transition-colors">{link}</button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 text-slate-300 mb-8">
            <Facebook size={18} className="hover:text-slate-600 cursor-pointer transition-colors" />
            <Apple size={18} className="hover:text-slate-600 cursor-pointer transition-colors" />
            <svg className="w-[18px] h-[18px] fill-current hover:text-slate-600 cursor-pointer transition-colors" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            <svg className="w-[18px] h-[18px] fill-current hover:text-slate-600 cursor-pointer transition-colors" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.819-.26.819-.578 0-.284-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
            </svg>
          </div>
          <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
            Copyright © 2026 Material by Creative Tim.
          </p>
        </div>
      </footer>
    </div>
  );
};

