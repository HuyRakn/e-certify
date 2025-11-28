"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { CheckCircle, Play, TrendingUp, GraduationCap, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "Jan", hours: 24 },
  { month: "Feb", hours: 32 },
  { month: "Mar", hours: 28 },
  { month: "Apr", hours: 45 },
  { month: "May", hours: 38 },
  { month: "Jun", hours: 52 },
];

export function CurrentActivity() {
  return (
    <div className="space-y-4">
      {/* Monthly Progress Chart */}
      <Card className="shadow-soft-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-soft-text">
            Monthly Progress
          </CardTitle>
          <CardDescription className="text-sm text-soft-text-muted">
            This is the latest improvement
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4 pb-6">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(148,163,184,0.3)" 
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke="rgba(148,163,184,0.6)"
                tick={{ fill: "rgba(30,41,59,0.8)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(148,163,184,0.4)" }}
              />
              <YAxis 
                stroke="rgba(148,163,184,0.6)"
                tick={{ fill: "rgba(30,41,59,0.8)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(148,163,184,0.4)" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255,255,255,0.95)", 
                  border: "none",
                  borderRadius: "8px",
                  color: "#1e293b",
                  padding: "8px 12px",
                  fontSize: "12px"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="var(--brand-primary)" 
                strokeWidth={3}
                dot={{ fill: "var(--brand-primary)", r: 4 }}
                activeDot={{ r: 6, fill: "var(--brand-primary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}

const statsData = [
  {
    label: "Completed Courses",
    value: "45K+",
    icon: CheckCircle,
  },
  {
    label: "Video Courses",
    value: "20K+",
    icon: Play,
  },
  {
    label: "Students",
    value: "50,000+",
    icon: GraduationCap,
  },
  {
    label: "Expert Mentors",
    value: "500+",
    icon: Users,
  },
] as const;

export function ActivityStats() {
  return (
    <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="shadow-soft-sm overflow-hidden">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl soft-icon shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-black text-soft-text leading-tight">{stat.value}</p>
                  <p className="text-xs font-medium text-soft-text-muted truncate">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}