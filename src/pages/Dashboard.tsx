import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { api } from "../lib/api";

const Dashboard: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metrics, setMetrics] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pipeline, setPipeline] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [schedule, setSchedule] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsRes, pipelineRes, scheduleRes, trendRes] = await Promise.all([
          api.get('/dashboard/metrics'),
          api.get('/dashboard/pipeline'),
          api.get('/dashboard/schedule?limit=5'),
          api.get('/dashboard/revenue-trend?days=7')
        ]);
        
        setMetrics(metricsRes.data.data);
        setPipeline(pipelineRes.data.data);
        setSchedule(scheduleRes.data.data);
        setRevenueTrend(trendRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    status = (status || '').toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants: Record<string, any> = {
      completed: { variant: "default", className: "bg-green-100 text-green-800" },
      "checked-out": { variant: "default", className: "bg-green-100 text-green-800" },
      "in-progress": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "with-doctor": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "checked-in": { variant: "default", className: "bg-purple-100 text-purple-800" },
      "waiting": { variant: "default", className: "bg-purple-100 text-purple-800" },
      scheduled: { variant: "default", className: "bg-gray-100 text-gray-800" },
      booked: { variant: "default", className: "bg-gray-100 text-gray-800" },
    };
    return variants[status] || variants.scheduled;
  };

  // Dynamic Metrics Cards based on API data
  const statsData = metrics ? [
    {
      title: "Today's Appointments",
      value: metrics.appointmentsCount.toString(),
      change: metrics.appointmentsTrend.startsWith('-') ? metrics.appointmentsTrend : `${metrics.appointmentsTrend} vs yesterday`,
      trend: metrics.appointmentsTrend.startsWith('-') ? "down" : (metrics.appointmentsTrend === '0%' ? "neutral" : "up"),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "New Patients Today",
      value: metrics.newPatientsToday.toString(),
      change: "Registered today",
      trend: "up",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Avg Wait Time",
      value: `${metrics.avgWaitTimeMinutes} min`,
      change: "Target < 20 min",
      trend: metrics.avgWaitTimeMinutes > 20 ? "down" : "up", // 'down' for bad, 'up' for good in this context
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(metrics.dailyRevenue),
      change: `Billed: ${formatCurrency(metrics.dailyBilled)}`,
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ] : [];

  const DashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px] mb-2" />
              <Skeleton className="h-3 w-[140px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-slate-100 dark:border-slate-800">
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm border-slate-100 dark:border-slate-800">
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col justify-center space-y-7 px-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-4 w-[40px]" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Row Skeleton */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-slate-100 dark:border-slate-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-9 w-[120px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Critical Alerts Skeleton */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-[180px]" />
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Clinic performance metrics, live schedule, and revenue tracking
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" && (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                )}
                {stat.trend === "down" && (
                  <TrendingUp className="mr-1 h-3 w-3 rotate-180 text-red-600" />
                )}
                <span
                  className={
                    stat.trend === "up"
                      ? "text-green-600"
                      : stat.trend === "down"
                      ? "text-red-600"
                      : ""
                  }
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Revenue Trends */}
        <Card className="col-span-4 shadow-sm border-slate-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Revenue Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis tickFormatter={(val) => `₹${val/1000}k`} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(value: any) => [formatCurrency(value), undefined]} labelFormatter={(val) => `Date: ${val}`} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    name="Collected (Receipts)"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCollected)"
                  />
                  <Area
                    type="monotone"
                    dataKey="billed"
                    name="Billed (Invoices)"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBilled)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline / Patient Flow */}
        <Card className="col-span-3 shadow-sm border-slate-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Today's Patient Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col justify-center space-y-6 px-4">
              {pipeline && [
                { label: "Booked", value: pipeline.booked, color: "bg-slate-200 text-slate-700" },
                { label: "Waiting / Checked-In", value: pipeline.checkedIn, color: "bg-purple-100 text-purple-700" },
                { label: "With Doctor", value: pipeline.withDoctor, color: "bg-blue-100 text-blue-700" },
                { label: "Payment Pending", value: pipeline.paymentPending, color: "bg-orange-100 text-orange-700" },
                { label: "Completed", value: pipeline.completed, color: "bg-green-100 text-green-700" },
              ].map((stage) => (
                <div key={stage.label} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${stage.color} z-10`}>
                    {stage.value}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-sm">{stage.label}</p>
                    <Progress value={Math.min((stage.value / Math.max(metrics?.appointmentsCount || 1, 1)) * 100, 100)} className="h-1.5 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Appointments */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Appointments</CardTitle>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No specific upcoming appointments found for today</TableCell>
                  </TableRow>
                ) : (
                  schedule.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {appointment.patientName} <span className="text-xs text-muted-foreground ml-1">({appointment.patientMrn})</span>
                      </TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>{new Date(appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>{appointment.type || 'Follow-up'}</TableCell>
                      <TableCell>
                        <Badge {...getStatusBadge(appointment.status)}>
                          {appointment.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Critical Alerts
              </CardTitle>
              <Badge variant="destructive">2</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2 rounded-lg border p-3 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">Payment Outstanding Summary</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">Review Required</Badge>
                    <span className="text-xs text-muted-foreground">{pipeline?.paymentPending || 0} bills pending</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 rounded-lg border p-3 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">Appointments Pipeline Alert</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Check Waiting Room</Badge>
                    <span className="text-xs text-muted-foreground">{pipeline?.checkedIn || 0} waiting</span>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
