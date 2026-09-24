import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export default function ExtensionSecurityGuard({ 
  hasExtensions, 
  detectedExtensions, 
  isScanning, 
  rescan,
  _lastScanTime,
  _compact = false 
}) {
  const [activeTab, setActiveTab] = useState('chrome');
  const [showDetails, setShowDetails] = useState(true);

  return (
    <div className="w-full space-y-3">
      {hasExtensions ? (
        <div className="rounded-2xl bg-red-950/40 border-2 border-red-500/80 p-4 sm:p-5 text-zinc-100 shadow-xl backdrop-blur-xl animate-pulse-slow">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white uppercase tracking-wider">
                    Access Blocked
                  </span>
                  <span className="text-xs font-mono text-red-300">
                    {detectedExtensions.length} Extension{detectedExtensions.length > 1 ? 's' : ''} Detected
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                  Browser Extensions Detected
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => rescan()}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer disabled:opacity-50"
              title="Click to re-scan browser environment"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Re-Scan'}</span>
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-red-200/90 leading-relaxed mt-2.5">
            Competition integrity rules require all browser extensions (AI assistants, script runners, ad blockers, styling tools, auto-fillers) to be disabled before logging in. 
            <strong className="text-white font-semibold block mt-1">
              Login input fields are locked until all extensions are removed or disabled.
            </strong>
          </p>

          {/* Detected Extensions List */}
          <div className="mt-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-red-300 uppercase tracking-wider">
              <span>Detected Items ({detectedExtensions.length})</span>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-red-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>{showDetails ? 'Hide' : 'Show'} details</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showDetails && (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {detectedExtensions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-semibold text-white truncate">{item.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/60 text-red-200 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0 hidden sm:inline">
                      {item.source}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Step-by-Step Instructions */}
          <div className="mt-4 pt-3 border-t border-red-500/30">
            <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>How to Disable Extensions to Unlock:</span>
            </div>

            {/* Browser Tabs */}
            <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 text-[11px] font-mono">
              {[
                { id: 'chrome', label: 'Google Chrome' },
                { id: 'edge', label: 'MS Edge' },
                { id: 'brave', label: 'Brave' },
                { id: 'incognito', label: '🚀 Incognito Mode (Fastest)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-zinc-950 font-bold shadow'
                      : 'bg-red-900/40 text-red-200 hover:bg-red-900/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Instruction content based on active tab */}
            <div className="p-3 rounded-xl bg-black/40 border border-red-500/30 text-xs text-zinc-300 font-mono space-y-1.5">
              {activeTab === 'chrome' && (
                <>
                  <p>1. Open a new tab and paste: <code className="bg-red-950 px-1.5 py-0.5 rounded text-red-300 font-bold">chrome://extensions</code></p>
                  <p>2. Or click the 🧩 <strong>Puzzle Icon</strong> at top-right of your browser window.</p>
                  <p>3. Toggle <strong>OFF</strong> all active extensions.</p>
                  <p>4. Return here and click <strong className="text-white">"Re-Scan"</strong> (or refresh page).</p>
                </>
              )}
              {activeTab === 'edge' && (
                <>
                  <p>1. Open a new tab and paste: <code className="bg-red-950 px-1.5 py-0.5 rounded text-red-300 font-bold">edge://extensions</code></p>
                  <p>2. Toggle <strong>OFF</strong> all active extensions & add-ons.</p>
                  <p>3. Return here and click <strong className="text-white">"Re-Scan"</strong>.</p>
                </>
              )}
              {activeTab === 'brave' && (
                <>
                  <p>1. Open a new tab and paste: <code className="bg-red-950 px-1.5 py-0.5 rounded text-red-300 font-bold">brave://extensions</code></p>
                  <p>2. Toggle <strong>OFF</strong> all active extensions.</p>
                  <p>3. Return here and click <strong className="text-white">"Re-Scan"</strong>.</p>
                </>
              )}
              {activeTab === 'incognito' && (
                <>
                  <p>1. Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-amber-300">Ctrl + Shift + N</kbd> (Windows) to open a fresh Incognito Window.</p>
                  <p>2. By default, incognito disables all extensions.</p>
                  <p>3. Open this website URL in the incognito window for clean access.</p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-2 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-200">
              Browser Integrity Verified • 0 Extensions Detected
            </span>
          </div>
          <button
            type="button"
            onClick={() => rescan()}
            disabled={isScanning}
            className="text-[11px] text-emerald-400 hover:text-emerald-200 flex items-center gap-1 font-bold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Verifying...' : 'Re-verify'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
