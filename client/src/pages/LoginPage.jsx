import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Code2, 
  User, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

export default function LoginPage() {
  const { loginUser, setCurrentScreen } = useApp();

  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!userIdInput.trim() || !passwordInput.trim()) {
      setErrorMsg('Please enter both User ID and Password.');
      return;
    }

    setIsLoading(true);
    const result = await loginUser({
      id: userIdInput.trim(),
      password: passwordInput.trim()
    });
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.message || 'Invalid credentials.');
    }
  };

  // Quick fill helper for testing roles out of the box
  const handleQuickFill = (id, pass) => {
    setUserIdInput(id);
    setPasswordInput(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#18181B] flex flex-col justify-center items-center p-4 sm:p-6 sm:px-10 relative overflow-y-auto overflow-x-hidden font-sans">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-35 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[radial-gradient(circle,rgba(214,3,3,0.06)_0%,transparent_70%)] pointer-events-none animate-float-slow z-0" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(163,11,26,0.05)_0%,transparent_70%)] pointer-events-none animate-float-slow z-0" style={{ animationDelay: '3s' }} />

      {/* Back to Home Button */}
      <button
        onClick={() => setCurrentScreen('landing')}
        className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 font-semibold text-xs shadow-2xs transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive"
      >
        <ChevronLeft className="w-4 h-4 text-[#DC2626]" />
        <span>Back to Home</span>
      </button>

      {/* Split-Screen Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-zinc-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 animate-hero-entrance">
        
        {/* LEFT COLUMN: HERO BRANDING PANEL */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#A30B1A] via-[#D60303] to-[#C23D31] p-8 sm:p-10 text-[#EFEEEA] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Radial Circle in Hero */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute top-10 -left-10 w-40 h-40 rounded-full bg-black/10 pointer-events-none" />

          {/* Top Brand Logo Header */}
          <div className="relative z-10 space-y-4">
            <div 
              onClick={() => setCurrentScreen('landing')}
              className="inline-flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 overflow-hidden">
                <img src="/technova_icon.jpg" alt="Technova Logo Icon" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white leading-none">
                  TECH<span className="text-red-200">NOVA</span>
                </h2>
                <span className="text-[10px] font-mono text-red-100 font-semibold tracking-wider uppercase block mt-0.5">
                  FESTRONIX 2026
                </span>
              </div>
            </div>

            <div className="pt-8 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-mono font-bold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-red-200" />
                <span>SECURE PORTAL</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Start your journey with us.
              </h1>
              <p className="text-xs text-red-100/90 leading-relaxed font-normal pt-1">
                Embark on an elite competition platform engineered for competitive programming, debugging, and clue solving.
              </p>
            </div>
          </div>

          {/* Quote / Testimonial Box */}
          <div className="relative z-10 pt-8 mt-auto">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2 text-xs">
              <p className="text-red-50 leading-relaxed font-medium">
                "Code the Ideas • Build the Tomorrow. Automated score validation and physical lab coordinator verification."
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-white/15 text-[11px]">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-white font-mono text-[10px]">
                  CSE
                </div>
                <div>
                  <span className="font-bold text-white block">Dept. of CSE</span>
                  <span className="text-red-200 text-[10px]">K. Ramakrishnan College of Technology</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-4">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM PANEL */}
        <div className="md:col-span-7 p-8 sm:p-10 bg-white flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                Sign In to Portal
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 font-normal">
                Enter your assigned User ID and Password for server authentication.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2.5 font-semibold animate-slide-up shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User ID Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  User ID / Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="e.g. TN2026-001 or admin@technova.edu"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8F7F4] border border-zinc-300 rounded-xl text-xs text-zinc-900 font-mono font-medium outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#F8F7F4] border border-zinc-300 rounded-xl text-xs text-zinc-900 font-mono font-medium outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Rules Checklist */}
              <div className="space-y-1.5 pt-1 text-[11px] text-zinc-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${passwordInput.length >= 6 ? 'text-emerald-600' : 'text-zinc-300'}`} />
                  <span>Minimum 6 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${userIdInput.trim().length > 0 ? 'text-emerald-600' : 'text-zinc-300'}`} />
                  <span>Valid User ID or Email</span>
                </div>
              </div>

              {/* Primary Action Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-900/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer btn-interactive group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <span>{isLoading ? 'Authenticating with Server...' : 'SIGN IN TO PORTAL'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </form>
          </div>

          {/* Quick-Fill Test Accounts Strip */}
          <div className="pt-4 border-t border-zinc-100 space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              QUICK TEST CREDENTIALS (CLICK TO AUTO-FILL)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('TN2026-001', 'user123')}
                className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-left transition cursor-pointer btn-interactive"
              >
                <span className="block text-[10px] font-bold text-zinc-700">Participant</span>
                <span className="text-[9px] font-mono text-zinc-500">TN2026-001</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('COORD-01', 'coord123')}
                className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-left transition cursor-pointer btn-interactive"
              >
                <span className="block text-[10px] font-bold text-zinc-700">Coordinator</span>
                <span className="text-[9px] font-mono text-zinc-500">COORD-01</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN-01', 'admin123')}
                className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-left transition cursor-pointer btn-interactive"
              >
                <span className="block text-[10px] font-bold text-zinc-700">Admin</span>
                <span className="text-[9px] font-mono text-zinc-500">ADMIN-01</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
