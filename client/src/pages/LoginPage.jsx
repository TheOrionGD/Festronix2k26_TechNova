import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CinematicParticleCanvas from '../components/CinematicParticleCanvas';
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

  return (
    <div className="min-h-screen bg-transparent text-[#18181B] dark:text-[#f4f4f5] flex flex-col justify-center items-center p-4 sm:p-6 sm:px-10 relative font-sans transition-colors duration-300 w-full min-w-0 overflow-hidden">
      
      {/* 3. LAYER 3: BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/poster.png"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40 dark:opacity-30 transition-opacity duration-500"
      >
        <source src="/BG.mp4" type="video/mp4" />
      </video>

      {/* 2. LAYER 2: PARTICLE EFFECT */}
      <div className="fixed inset-0 z-5 pointer-events-none">
        <CinematicParticleCanvas />
      </div>

      {/* 1. LAYER 1: LOGIN SECTION */}
      <div className="relative z-20 w-full max-w-4xl flex flex-col items-center justify-center">
        
        {/* Back to Home Button */}
        <div className="w-full flex justify-start mb-4">
          <button
            onClick={() => setCurrentScreen('landing')}
            className="px-4 py-2 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] border border-red-500/80 text-white font-semibold text-xs shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Split-Screen Card Container */}
        <div className="w-full max-w-4xl bg-white/85 dark:bg-[#0a0a0d]/90 backdrop-blur-xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 animate-hero-entrance tech-container glass-card">
          
          {/* LEFT COLUMN: HERO BRANDING PANEL */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#A30B1A]/90 via-[#D60303]/90 to-[#C23D31]/90 backdrop-blur-md p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Ambient Radial Circle in Hero */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute top-10 -left-10 w-40 h-40 rounded-full bg-black/10 pointer-events-none" />

            {/* Top Brand Logo Header */}
            <div className="relative z-10 space-y-4">
              <div 
                onClick={() => setCurrentScreen('landing')}
                className="inline-flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 overflow-hidden border border-red-500/50">
                  <img src="/technova_icon.jpg" alt="Technova Logo Icon" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white leading-none font-mono">
                    TECH<span className="text-red-200">NOVA</span>
                  </h2>
                  <span className="text-[10px] font-mono text-red-100 font-semibold tracking-wider uppercase block mt-0.5">
                    FESTRONIX 2026
                  </span>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <div className="status-pill-ready">
                  <span className="dot" />
                  <span>SYSTEM READY</span>
                </div>
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
            </div>
          </div>

          {/* RIGHT COLUMN: LOGIN FORM PANEL */}
          <div className="md:col-span-7 p-8 sm:p-10 bg-white/40 dark:bg-transparent backdrop-blur-md flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Sign In to Portal
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#a1a1aa] font-normal">
                  Enter your assigned User ID and Password for server authentication.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 dark:bg-[#991B1B]/20 border border-red-500 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2.5 font-semibold animate-slide-up shadow-2xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#D60303]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* User ID Input */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-[#a1a1aa] mb-1.5 font-mono">
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
                      className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-red-500/50 rounded-xl text-xs text-zinc-900 dark:text-white font-mono font-medium outline-none focus:border-[#D60303] focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-[#a1a1aa] mb-1.5 font-mono">
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
                      className="w-full pl-10 pr-10 py-3 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-red-500/50 rounded-xl text-xs text-zinc-900 dark:text-white font-mono font-medium outline-none focus:border-[#D60303] focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn-transparent absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Rules Checklist */}
                <div className="space-y-1.5 pt-1 text-[11px] text-zinc-500 dark:text-[#71717a] font-medium font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passwordInput.length >= 6 ? 'text-emerald-600 dark:text-[#22c55e]' : 'text-zinc-300 dark:text-zinc-700'}`} />
                    <span>Minimum 6 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${userIdInput.trim().length > 0 ? 'text-emerald-600 dark:text-[#22c55e]' : 'text-zinc-300 dark:text-zinc-[#22c55e]'}`} />
                    <span>Valid User ID or Email</span>
                  </div>
                </div>

                {/* Primary Action Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-white border border-red-500/80 font-bold text-xs sm:text-sm font-mono shadow-md shadow-red-950/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer btn-interactive group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <span>{isLoading ? 'Authenticating with Server...' : 'SIGN IN TO PORTAL'}</span>
                  <ArrowRight className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
