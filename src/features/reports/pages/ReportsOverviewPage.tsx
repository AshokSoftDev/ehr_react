import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService, type ReportCatalogItem } from '../service/reportService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Sparkles, ArrowRight, DollarSign, Activity, Calendar, Users, Sliders, Loader2, BarChart3, TrendingUp, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ReportsOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState<ReportCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // AI Conversational BI State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const res = await reportService.getCatalog();
        setCatalog(res?.data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load reports catalog');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) {
      toast.warn('Please ask an analytical question');
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await reportService.generateAiInsight(aiQuery);
      setAiResult(res?.data || res);
      toast.success('AI BI analysis synthesized successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error executing conversational BI query');
    } finally {
      setIsAiLoading(false);
    }
  };

  const getIconComponent = (id: string) => {
    switch (id) {
      case 'financial': return <DollarSign className="w-6 h-6 text-emerald-500" />;
      case 'clinical': return <Activity className="w-6 h-6 text-blue-500" />;
      case 'operational': return <Calendar className="w-6 h-6 text-amber-500" />;
      case 'demographics': return <Users className="w-6 h-6 text-purple-500" />;
      default: return <Sliders className="w-6 h-6 text-cyan-500" />;
    }
  };

  return (
    <div className="p-0 space-y-8 bg-background min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm tracking-wide uppercase mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Healthcare BI & Executive Decision Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Reports & Dynamic Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore operational performance, revenue cycles, and predictive clinical statistics in real time.
          </p>
        </div>

        <Button
          onClick={() => navigate('/main/reports/custom')}
          className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Sliders className="w-4 h-4" />
          Open Dynamic Data Explorer
        </Button>
      </div>

      {/* Futuristic AI Conversational BI Banner */}
      <div className="p-6 rounded-2xl border border-primary/30 bg-gradient-to-r from-card/90 via-primary/5 to-card/90 shadow-lg backdrop-blur-md relative overflow-hidden transition-all duration-300">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Conversational AI BI Copilot
          </div>

          <h2 className="text-xl font-bold text-foreground">
            Ask your clinical or operational question in plain English
          </h2>

          <form onSubmit={handleAiSearch} className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
              <Input
                placeholder="e.g., 'Summarize revenue trends and unpaid billing' or 'Who is our most active doctor?'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="h-10 pl-10 pr-4 bg-background/90 text-foreground text-sm shadow-inner"
              />
            </div>
            <Button type="submit" disabled={isAiLoading} className="btn-primary h-10 px-6 font-semibold shrink-0">
              {isAiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
              Generate Insights
            </Button>
          </form>

          {/* AI Output Box */}
          {aiResult && (
            <div className="mt-6 p-5 rounded-xl border border-border bg-card shadow-inner space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-semibold uppercase text-primary tracking-wide flex items-center gap-1.5">
                  <Bot className="w-4 h-4" /> AI Synthesized Answer
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/main/reports/${aiResult.recommendedCategory || 'financial'}`)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View full {aiResult.recommendedCategory || ''} dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-p:leading-relaxed prose-p:my-1.5 prose-strong:font-extrabold prose-strong:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiResult.aiResponse}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Suites Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Standard Report Suites & Presets
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-52 rounded-xl bg-muted/30 border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/main/reports/${item.id}`)}
                className="group p-6 rounded-xl border border-border bg-card hover:bg-muted/20 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-muted/30 group-hover:bg-primary/10 transition-colors">
                      {getIconComponent(item.id)}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {item.availableGroupings.map((g) => (
                      <span key={g} className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded uppercase font-mono">
                        {g}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsOverviewPage;
