import React from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  Heart, 
  Clock,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Stethoscope,
  Pill,
  BedDouble
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// EHR Static Data
const statsData = [
  {
    title: 'Total Patients',
    value: '2,847',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Appointments Today',
    value: '47',
    change: '+8 from yesterday',
    trend: 'up',
    icon: Calendar,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Active Prescriptions',
    value: '1,234',
    change: '-2.3%',
    trend: 'down',
    icon: Pill,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Bed Occupancy',
    value: '78%',
    change: 'Normal range',
    trend: 'neutral',
    icon: BedDouble,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

// Patient Visit Trends (Last 7 days)
const visitTrendsData = [
  { day: 'Mon', visits: 145, emergency: 23 },
  { day: 'Tue', visits: 132, emergency: 19 },
  { day: 'Wed', visits: 165, emergency: 28 },
  { day: 'Thu', visits: 152, emergency: 25 },
  { day: 'Fri', visits: 178, emergency: 31 },
  { day: 'Sat', visits: 110, emergency: 35 },
  { day: 'Sun', visits: 95, emergency: 42 },
];

// Department Distribution
const departmentData = [
  { name: 'General Medicine', value: 35, patients: 997 },
  { name: 'Pediatrics', value: 20, patients: 570 },
  { name: 'Cardiology', value: 15, patients: 428 },
  { name: 'Orthopedics', value: 12, patients: 342 },
  { name: 'Emergency', value: 10, patients: 285 },
  { name: 'Others', value: 8, patients: 225 },
];

// Recent Appointments
const recentAppointments = [
  {
    id: 'APT001',
    patient: 'John Doe',
    doctor: 'Dr. Sarah Wilson',
    time: '09:00 AM',
    type: 'Check-up',
    status: 'completed',
  },
  {
    id: 'APT002',
    patient: 'Jane Smith',
    doctor: 'Dr. Michael Brown',
    time: '10:30 AM',
    type: 'Follow-up',
    status: 'in-progress',
  },
  {
    id: 'APT003',
    patient: 'Robert Johnson',
    doctor: 'Dr. Emily Davis',
    time: '11:00 AM',
    type: 'Consultation',
    status: 'scheduled',
  },
  {
    id: 'APT004',
    patient: 'Maria Garcia',
    doctor: 'Dr. James Taylor',
    time: '02:00 PM',
    type: 'Emergency',
    status: 'scheduled',
  },
  {
    id: 'APT005',
    patient: 'David Lee',
    doctor: 'Dr. Sarah Wilson',
    time: '03:30 PM',
    type: 'Check-up',
    status: 'scheduled',
  },
];

// Critical Alerts
const criticalAlerts = [
  {
    id: 1,
    message: 'Low inventory: Insulin (Type 1) - 15 units remaining',
    severity: 'high',
    time: '5 mins ago',
  },
  {
    id: 2,
    message: 'ICU Bed availability: Only 2 beds available',
    severity: 'medium',
    time: '15 mins ago',
  },
  {
    id: 3,
    message: 'Lab results pending for 8 patients (>24 hours)',
    severity: 'medium',
    time: '1 hour ago',
  },
];

// Chart colors
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'];

const Dashboard: React.FC = () => {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { variant: 'default', className: 'bg-green-100 text-green-800' },
      'in-progress': { variant: 'default', className: 'bg-blue-100 text-blue-800' },
      scheduled: { variant: 'default', className: 'bg-gray-100 text-gray-800' },
    };
    return variants[status] || variants.scheduled;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      high: { variant: 'destructive' },
      medium: { variant: 'default', className: 'bg-yellow-100 text-yellow-800' },
      low: { variant: 'secondary' },
    };
    return variants[severity] || variants.low;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EHR Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your healthcare facility.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button size="sm">
            <Clock className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === 'up' && <TrendingUp className="mr-1 h-3 w-3 text-green-600" />}
                {stat.trend === 'down' && <TrendingUp className="mr-1 h-3 w-3 rotate-180 text-red-600" />}
                <span className={
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : ''
                }>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Patient Visit Trends */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Patient Visit Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Regular Visits"
                  />
                  <Area
                    type="monotone"
                    dataKey="emergency"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                    name="Emergency"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
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
                {recentAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.patient}</TableCell>
                    <TableCell>{appointment.doctor}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>
                      <Badge {...getStatusBadge(appointment.status)}>
                        {appointment.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
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
              <Badge variant="destructive">{criticalAlerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex flex-col space-y-2 rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm">{alert.message}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge {...getSeverityBadge(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <UserCheck className="h-6 w-6" />
              <span>Register Patient</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Calendar className="h-6 w-6" />
              <span>Schedule Appointment</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Stethoscope className="h-6 w-6" />
              <span>Start Consultation</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <FileText className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Doctor Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Dr. Sarah Wilson', patients: 45, rating: 4.9, specialty: 'Cardiologist' },
                { name: 'Dr. Michael Brown', patients: 42, rating: 4.8, specialty: 'Pediatrician' },
                { name: 'Dr. Emily Davis', patients: 38, rating: 4.7, specialty: 'General Medicine' },
                { name: 'Dr. James Taylor', patients: 35, rating: 4.9, specialty: 'Surgeon' },
              ].map((doctor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{doctor.patients} patients</p>
                    <p className="text-sm text-muted-foreground">⭐ {doctor.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { resource: 'Operating Rooms', used: 85, total: 100, unit: '%' },
                { resource: 'ICU Beds', used: 18, total: 20, unit: 'beds' },
                { resource: 'Ventilators', used: 12, total: 15, unit: 'units' },
                { resource: 'Ambulances', used: 7, total: 10, unit: 'vehicles' },
              ].map((item) => (
                <div key={item.resource} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.resource}</span>
                    <span className="text-muted-foreground">
                      {item.used}/{item.total} {item.unit}
                    </span>
                  </div>
                  <Progress value={(item.used / item.total) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
