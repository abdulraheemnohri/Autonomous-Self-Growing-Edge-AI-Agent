'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MissionSuccessChartsProps {
  data: Array<{ goal: string; successRate: number; avgSteps: number }>;
}

export const MissionSuccessCharts: React.FC<MissionSuccessChartsProps> = ({ data }) => {
  const [mounted] = useState(true);

  const complexitySuccessData = [
    { complexity: 'Simple (L1)', completed: 48, failed: 3 },
    { complexity: 'Moderate (L2)', completed: 38, failed: 6 },
    { complexity: 'Complex (L3)', completed: 29, failed: 9 },
    { complexity: 'Extreme (L4)', completed: 21, failed: 7 },
  ];

  if (!mounted) {
    return <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Chart 0: ReAct Mission Success: Completed vs Failed by Complexity Level */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
            ReAct Mission Success: Completed vs Failed by Complexity Level
          </h4>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed</span>
            <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500"></span> Failed</span>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complexitySuccessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="complexity" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: '11px', borderRadius: '8px' }}
              />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed Goals" />
              <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed Attempts" />
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
