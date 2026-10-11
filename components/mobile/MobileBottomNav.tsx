'use client';

import React from 'react';
import { Mic, Terminal, Download, Volume2, Zap, Activity, Database, Settings } from 'lucide-react';

export type MobileTab =
  | 'chat'
  | 'learning'
  | 'models'
  | 'voice_hub'
  | 'autonomous'
  | 'performance'
  | 'vectordb'
  | 'settings';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab
}) => {
  const tabs = [
    { id: 'chat' as MobileTab, label: 'Voice/Chat', icon: Mic },
    { id: 'learning' as MobileTab, label: 'Learn', icon: Terminal },
    { id: 'models' as MobileTab, label: 'Models', icon: Download },
    { id: 'voice_hub' as MobileTab, label: 'Voices', icon: Volume2 },
    { id: 'autonomous' as MobileTab, label: 'Agent', icon: Zap },
    { id: 'performance' as MobileTab, label: 'Perf', icon: Activity },
    { id: 'vectordb' as MobileTab, label: 'Memory', icon: Database },
    { id: 'settings' as MobileTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="border-t border-slate-800/90 bg-[#080d18]/95 backdrop-blur-md px-1 py-1.5 flex items-center justify-between z-40 select-none overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 relative min-w-[44px] flex-1 ${
              isActive
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1.5 w-5 h-0.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
            <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-cyan-950/60 text-cyan-300 scale-105' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[9px] tracking-tight leading-none mt-0.5 font-sans whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
