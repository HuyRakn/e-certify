"use client";

import React from 'react';
import UnifiedHeader from './UnifiedHeader';
import UnifiedSidebar from './UnifiedSidebar';
import SearchPanel from './SearchPanel';

export default function Shell({ title, subtitle, headerRight, children, rightPanel }: { title: string; subtitle?: string; headerRight?: React.ReactNode; children: React.ReactNode; rightPanel?: React.ReactNode }) {
  return (
    <div className="p-6">
      {/* Sidebar is now fixed, so we need to account for its width + margin */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] items-start lg:ml-[280px]">
        <UnifiedSidebar />
        <div className="space-y-4">
          <div className="card">
            <UnifiedHeader title={title} subtitle={subtitle} right={headerRight} />
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </div>
        <div className="sticky top-4 h-fit space-y-4">
          <div className="card"><SearchPanel /></div>
          <div className="card">
            {rightPanel || (
              <div>
                <div className="font-semibold mb-2">Quick Stats</div>
                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="New Courses" value="19" />
                  <StatBox label="New Tutors" value="14" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#f3f4f6' }}>
      <div className="text-2xl font-bold" style={{ lineHeight: 1 }}>{value}</div>
      <div className="opacity-70 text-sm mt-1">{label}</div>
    </div>
  );
}


