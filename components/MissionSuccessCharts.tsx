'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MissionSuccessChartsProps {
  data: Array<{ goal: string; successRate: number; avgSteps: number }>;
}

export const MissionSuccessCharts: React.FC<MissionSuccessChartsProps> = ({ data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Chart 1: Historical Mission Completion Rates */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 font-mono uppercase tracking-wider">
          Historical Mission Completion Rates (%)
        </h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="goal" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }}
              />
              <Bar dataKey="successRate" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Average Reasoning Steps per Goal */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 mb-3 font-mono uppercase tracking-wider">
          Average Reasoning Steps per Goal
        </h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="goal" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" domain={[0, 10]} fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="avgSteps" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
