import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../service/reportService';
import { ReportDrilldownSheet } from '../components/ReportDrilldownSheet';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ArrowLeft, RefreshCw, Filter, FileSpreadsheet, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { toast } from 'react-toastify';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const DynamicReportViewer: React.FC = () => {
  const { reportType = 'financial' } = useParams<{ reportType: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>(null);
  const [datePreset, setDatePreset] = useState<string>(reportType === 'custom' ? 'all' : '30d');
  const [customSource, setCustomSource] = useState<'invoices' | 'appointments' | 'visits' | 'patients' | 'receipts'>('invoices');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Sheet drilldown state
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const dateFrom = new Date();
      if (datePreset === '7d') dateFrom.setDate(now.getDate() - 7);
      if (datePreset === '30d') dateFrom.setDate(now.getDate() - 30);
      if (datePreset === '90d') dateFrom.setDate(now.getDate() - 90);
      if (datePreset === 'ytd') dateFrom.setMonth(0, 1);

      const params = {
        dateFrom: datePreset !== 'all' ? dateFrom.toISOString() : undefined,
        dateTo: datePreset !== 'all' ? now.toISOString() : undefined,
      };

      let res;
      if (reportType === 'financial') res = await reportService.getFinancialReport(params);
      else if (reportType === 'clinical') res = await reportService.getClinicalReport(params);
      else if (reportType === 'operational') res = await reportService.getOperationalReport(params);
      else if (reportType === 'demographics') res = await reportService.getDemographicsReport(params);
      else if (reportType === 'custom') {
        res = await reportService.getCustomReport({
          dataSource: customSource,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          page: 1,
          limit: 100,
          sortBy: customSource === 'visits' ? 'visit_date' : customSource === 'receipts' ? 'payment_date' : customSource === 'invoices' ? 'invoice_date' : 'createdAt',
          sortOrder: 'desc',
        });
      }

      setReportData(res?.data || res || null);
    } catch (error: any) {
      toast.error(error.message || 'Error fetching dynamic report analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchReport();
  }, [reportType, datePreset, customSource]);

  const handleRowClick = (row: any) => {
    setSelectedRecord(row);
    setIsSheetOpen(true);
  };

  const exportCsv = (dataRows: any[], filename: string) => {
    if (!dataRows || !dataRows.length) {
      toast.info('No data available to export');
      return;
    }
    const headers = Object.keys(dataRows[0]).join(',');
    const rows = dataRows.map((item) =>
      Object.values(item)
        .map((val) => `"${val ?? ''}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV export initiated!');
  };

  const renderTitle = () => {
    switch (reportType) {
      case 'financial': return 'Financial & Revenue Cycle (RCM)';
      case 'clinical': return 'Clinical Outcomes & Epidemiology';
      case 'operational': return 'Practice Operations & Schedule Utilization';
      case 'demographics': return 'Patient Demographics & Population Growth';
      case 'custom': return 'Dynamic Data Explorer & Custom Reporter';
      default: return 'EHR Analytical Workspace';
    }
  };

  // Build table columns from dynamic dataset
  const getTableConfig = () => {
    if (!reportData) return { columns: [], rows: [] };
    let rows: any[] = [];
    if (reportType === 'financial') rows = reportData.recentTransactions || [];
    else if (reportType === 'clinical') rows = reportData.topDrugs || [];
    else if (reportType === 'operational') rows = reportData.doctorUtilization || [];
    else if (reportType === 'demographics') rows = reportData.topCities || [];
    else if (reportType === 'custom') rows = reportData.data || [];

    if (searchTerm) {
      rows = rows.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (!rows || rows.length === 0) return { columns: [], rows: [] };
    const firstItem = rows[0];
    const columns = Object.keys(firstItem)
      .filter((key) => {
        const kLower = key.toLowerCase();
        // Exclude system audit timestamps and user tracking fields
        if (
          kLower.includes('createdat') || kLower.includes('updatedat') || kLower.includes('deletedat') ||
          kLower.includes('createdby') || kLower.includes('updatedby') || kLower.includes('deletedby') ||
          kLower.includes('created_at') || kLower.includes('updated_at') || kLower.includes('deleted_at') ||
          kLower.includes('created_by') || kLower.includes('updated_by') || kLower.includes('deleted_by')
        ) {
          return false;
        }
        // Exclude DB primary keys and foreign IDs (e.g., invoice_id, patient_id, visit_id, doctor_id)
        if (kLower === 'id' || kLower === '_id' || kLower.endsWith('_id') || (key !== 'id' && key.endsWith('Id') && !key.endsWith('Paid'))) {
          return false;
        }
        // Exclude relational objects (e.g., patient details JSON) so raw JSON never clutters table cells
        const val = firstItem[key];
        if (val && typeof val === 'object' && !(val instanceof Date)) {
          return false;
        }
        return true;
      })
      .map((key) => ({
        accessorKey: key,
        header: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toUpperCase().trim(),
        cell: ({ row }: any) => {
          const v = row.getValue(key);
          if (v === null || v === undefined) return <span className="text-muted-foreground">-</span>;
          if (typeof v === 'boolean') return <span>{v ? 'Yes' : 'No'}</span>;
          // Format ISO date strings into readable timestamps
          if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
            const d = new Date(v);
            return <span>{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
          }
          if (typeof v === 'object') return <span>{JSON.stringify(v)}</span>;
          return <span className="text-foreground font-medium">{String(v)}</span>;
        },
      }));

    return { columns, rows };
  };

  const { columns, rows } = getTableConfig();
  const paginatedRows = rows.slice((page - 1) * limit, page * limit);

  return (
    <div className="p-0 space-y-6 bg-background min-h-screen">
      {/* Top Bar Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/main/reports')}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {renderTitle()}
            </h1>
            <p className="text-xs text-muted-foreground">Real-time analytical aggregations & drill-down capabilities</p>
          </div>
        </div>

        {/* Filter Controls (h-10 standards) */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {reportType === 'custom' && (
            <Select value={customSource} onValueChange={(val: any) => setCustomSource(val)}>
              <SelectTrigger className="h-10 w-[160px] bg-card text-foreground">
                <SelectValue placeholder="Data Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoices">Invoices Ledger</SelectItem>
                <SelectItem value="receipts">Collections / Receipts</SelectItem>
                <SelectItem value="appointments">Appointments Register</SelectItem>
                <SelectItem value="patients">Patients Database</SelectItem>
                <SelectItem value="visits">Clinical Visits</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={datePreset} onValueChange={(val: string) => setDatePreset(val)}>
            <SelectTrigger className="h-10 w-[150px] bg-card text-foreground">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Time Horizon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days (Qtr)</SelectItem>
              <SelectItem value="ytd">Year-to-Date</SelectItem>
              <SelectItem value="all">All-Time History</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchReport} className="h-10 w-10">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="outline"
            onClick={() => exportCsv(rows, reportType)}
            className="h-10 px-3 bg-card hover:bg-muted"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading && !reportData ? (
        <div className="h-96 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Synthesizing analytical warehouse datasets...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* KPI Cards Showcase */}
          {reportData.kpi && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(reportData.kpi).map(([key, val], i) => (
                <div
                  key={key}
                  className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {i === 0 ? <DollarSign className="w-4 h-4 text-emerald-500" /> :
                      i === 1 ? <TrendingUp className="w-4 h-4 text-blue-500" /> :
                        i === 2 ? <Activity className="w-4 h-4 text-amber-500" /> : <Users className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    {typeof val === 'number' && key.toLowerCase().includes('rate') ? `${val}%` :
                      typeof val === 'number' && (key.toLowerCase().includes('total') || key.toLowerCase().includes('amount')) && !key.toLowerCase().includes('count') ? `$${val.toLocaleString()}` : String(val)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Futuristic Recharts Visualization Grid */}
          {reportType !== 'custom' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Trend Chart */}
              <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  {reportType === 'financial' ? 'Revenue Trend (Billed vs Collected)' :
                    reportType === 'clinical' ? 'Clinical Encounter Trend' :
                      reportType === 'operational' ? 'Appointment Funnel Distribution' : 'Patient Registration Growth'}
                </h3>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    {reportType === 'financial' && reportData.revenueTrend ? (
                      <AreaChart data={reportData.revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                        <XAxis dataKey="date" stroke="#64748b" textAnchor="end" height={40} fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }} />
                        <Legend />
                        <Area type="monotone" dataKey="billed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBilled)" name="Billed ($)" />
                        <Area type="monotone" dataKey="collected" stroke="#10b981" fillOpacity={1} fill="url(#colorCollected)" name="Collected ($)" />
                      </AreaChart>
                    ) : reportType === 'operational' && reportData.funnel ? (
                      <BarChart data={reportData.funnel} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                        <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Encounters Count" />
                      </BarChart>
                    ) : (
                      <BarChart data={reportData.visitTrend || reportData.patientGrowth || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }} />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Volume Count" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Secondary Breakdown Donut / Pie Chart */}
              <div className="p-5 rounded-xl border border-border bg-card/80 shadow-sm space-y-4 flex flex-col">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {reportType === 'financial' ? 'Payment Modes Split' :
                    reportType === 'clinical' ? 'Visit Types Split' :
                      reportType === 'operational' ? 'Doctor Workload' : 'Gender Split'}
                </h3>
                <div className="w-full h-72 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.paymentMethods || reportData.visitTypes || reportData.doctorUtilization || reportData.genderSplit || []}
                        dataKey={reportData.doctorUtilization ? 'total' : 'value'}
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        label
                      >
                        {(reportData.paymentMethods || reportData.visitTypes || reportData.doctorUtilization || reportData.genderSplit || []).map((_: any, i: number) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* AdvancedDataTable Ledger with Drilldown Hook */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {reportType === 'custom' ? `Custom Dataset: ${customSource.toUpperCase()}` : 'Detailed Record Ledger & Analytics'}
              </h3>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Quick filter rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-[240px] bg-card text-foreground"
                />
              </div>
            </div>

            <AdvancedDataTable
              columns={columns}
              data={paginatedRows}
              isLoading={isLoading}
              onRowClick={handleRowClick}
              page={page}
              limit={limit}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              total={rows.length}
              hideRowsPerPage={false}
            />
          </div>
        </div>
      ) : null}

      {/* Drill-down Side Sheet Modal */}
      <ReportDrilldownSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        data={selectedRecord}
        title="Analytical Item Drilldown"
      />
    </div>
  );
};

export default DynamicReportViewer;
