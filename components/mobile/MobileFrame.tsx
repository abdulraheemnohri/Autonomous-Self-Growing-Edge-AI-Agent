'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Battery, BatteryCharging, Smartphone, Maximize2, Minimize2, Radio } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  frameMode: 'mobile_bezel' | 'responsive';
  onToggleFrameMode: () => void;
  isOffline: boolean;
  activeModelName: string;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  frameMode,
  onToggleFrameMode,
  isOffline,
  activeModelName
}) => {
  const [timeStr, setTimeStr] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 ${
      frameMode === 'mobile_bezel' ? 'bg-[#04060a] p-2 sm:p-6' : 'bg-[#070b12]'
    }`}>
      {/* Top Floating View Switcher Bar (Desktop/Tablet helper) */}
      <div className="w-full max-w-md mb-2 px-3 py-1 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-300 truncate max-w-[180px]">{activeModelName}</span>
        </div>
        <button
          onClick={onToggleFrameMode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          title="Toggle between phone bezel and responsive mobile app view"
        >
          {frameMode === 'mobile_bezel' ? (
            <>
              <Maximize2 className="w-3 h-3 text-cyan-400" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3 text-cyan-400" />
              <span>Mobile Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container / Mobile Device Wrapper */}
      <div className={`relative w-full flex flex-col overflow-hidden transition-all duration-300 ${
        frameMode === 'mobile_bezel'
          ? 'max-w-[430px] h-[900px] max-h-[96vh] rounded-[48px] border-[10px] border-[#1e293b]/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-cyan-500/20 bg-[#070b12]'
          : 'max-w-7xl h-screen min-h-[600px] rounded-none border-0 bg-[#070b12]'
      }`}>
        {/* Native Mobile Status Bar (Always visible in mobile app) */}
        <div className="w-full px-6 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-mono text-slate-300 select-none z-50 bg-[#080d18]/90 backdrop-blur-sm">
          {/* Clock */}
          <span className="font-semibold tracking-tight" suppressHydrationWarning>{timeStr}</span>

          {/* Dynamic Island / Notch Pill */}
          <div className="px-3 py-0.5 rounded-full bg-black/90 border border-slate-800 flex items-center gap-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] text-slate-400 font-sans tracking-tight">LiteRT Edge</span>
          </div>

          {/* Right Status Icons (Signal, Battery, Offline Mode) */}
          <div className="flex items-center gap-2 text-slate-400">
            {isOffline ? (
              <span className="flex items-center gap-0.5 text-emerald-400" title="Airplane / Offline Mode Active">
                <WifiOff className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-cyan-400" title="Connected">
                <Wifi className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="text-[10px]">5G</span>
            <div className="flex items-center gap-0.5 text-slate-300">
              <span className="text-[10px]">98%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Native Home Indicator Bar (for bezel mode) */}
        {frameMode === 'mobile_bezel' && (
          <div className="w-full py-1.5 flex items-center justify-center bg-[#080d18] select-none">
            <div className="w-32 h-1 rounded-full bg-slate-600/60" />
          </div>
        )}
      </div>
    </div>
  );
};
