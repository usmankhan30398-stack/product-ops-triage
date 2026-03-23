import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Trash2, FileText, Download, Copy, ChevronRight,
  Target, Zap, AlertTriangle, BarChart3, CheckCircle2, Lightbulb,
  TrendingUp, Clock, Shield, FileJson, ThumbsDown, ThumbsUp, Minus,
  Activity, Layers, MessageSquare,
} from "lucide-react";
import {
  analyzeFeedback, EXAMPLE_FEEDBACK,
  type AnalysisResult, type Theme, type PrdTicket, type AnalysisSummary,
} from "@/lib/analysis";
import { exportCsv, copyNotionMarkdown, exportJson } from "@/lib/export";

// ─── Priority badge ───
function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    P0: "bg-destructive text-destructive-foreground",
    P1: "bg-chart-4/80 text-foreground",
    P2: "bg-chart-2/20 text-foreground",
    P3: "bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant="outline"
      className={`${variants[priority] || ""} font-mono text-xs`}
      data-testid={`badge-priority-${priority}`}
    >
      {priority}
    </Badge>
  );
}

// ─── Severity badge ───
function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, string> = {
    critical: "bg-destructive/90 text-destructive-foreground",
    high: "bg-chart-4/70 text-foreground",
    medium: "bg-chart-2/20 text-foreground",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant="outline"
      className={`${variants[severity] || ""} text-xs capitalize`}
      data-testid={`badge-severity-${severity}`}
    >
      {severity}
    </Badge>
  );
}

// ─── Sentiment indicator ───
function SentimentIndicator({ sentiment }: { sentiment: string }) {
  if (sentiment === "negative") {
    return (
      <div className="flex items-center gap-1.5 text-destructive" data-testid={`indicator-sentiment-${sentiment}`}>
        <ThumbsDown className="w-3.5 h-3.5" />
        <span className="text-xs font-medium capitalize">{sentiment}</span>
      </div>
    );
  }
  if (sentiment === "positive") {
    return (
      <div className="flex items-center gap-1.5 text-chart-5" data-testid={`indicator-sentiment-${sentiment}`}>
        <ThumbsUp className="w-3.5 h-3.5" />
        <span className="text-xs font-medium capitalize">{sentiment}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground" data-testid={`indicator-sentiment-${sentiment}`}>
      <Minus className="w-3.5 h-3.5" />
      <span className="text-xs font-medium capitalize">{sentiment}</span>
    </div>
  );
}

// ─── Score dots visualization (1-5) ───
function ScoreDots({ score, max = 5, color, label }: { score: number; max?: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-1" data-testid={`score-${label}`}>
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < score ? color : "bg-muted"}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{score}/{max}</span>
    </div>
  );
}

// ─── Sentiment mini-bar for breakdown ───
function SentimentBar({ breakdown }: { breakdown: { negative: number; neutral: number; positive: number } }) {
  const total = breakdown.negative + breakdown.neutral + breakdown.positive;
  if (total === 0) return null;
  const negPct = (breakdown.negative / total) * 100;
  const neuPct = (breakdown.neutral / total) * 100;
  const posPct = (breakdown.positive / total) * 100;

  return (
    <div className="flex items-center gap-2" data-testid="chart-sentiment-bar">
      <div className="flex h-2 w-24 rounded-full overflow-hidden bg-muted">
        {negPct > 0 && (
          <div className="bg-destructive/70 h-full" style={{ width: `${negPct}%` }} />
        )}
        {neuPct > 0 && (
          <div className="bg-muted-foreground/30 h-full" style={{ width: `${neuPct}%` }} />
        )}
        {posPct > 0 && (
          <div className="bg-chart-5/70 h-full" style={{ width: `${posPct}%` }} />
        )}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {breakdown.negative}N / {breakdown.neutral}M / {breakdown.positive}P
      </span>
    </div>
  );
}

// ─── Summary dashboard ───
function Dashboard({ summary }: { summary: AnalysisSummary }) {
  const sentTotal =
    summary.sentimentBreakdown.negative +
    summary.sentimentBreakdown.neutral +
    summary.sentimentBreakdown.positive;

  const negPct = sentTotal > 0 ? Math.round((summary.sentimentBreakdown.negative / sentTotal) * 100) : 0;

  const sevTotal =
    summary.severityBreakdown.critical +
    summary.severityBreakdown.high +
    summary.severityBreakdown.medium +
    summary.severityBreakdown.low;

  const critPct = sevTotal > 0
    ? Math.round(
        ((summary.severityBreakdown.critical + summary.severityBreakdown.high) /
          sevTotal) *
          100
      )
    : 0;

  return (
    <div className="space-y-4" data-testid="section-dashboard">
      {/* Top stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback
            </div>
            <p className="text-2xl font-bold" data-testid="stat-total-feedback">
              {summary.totalFeedback}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Layers className="w-3.5 h-3.5" />
              Themes
            </div>
            <p className="text-2xl font-bold" data-testid="stat-total-themes">
              {summary.totalThemes}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <ThumbsDown className="w-3.5 h-3.5" />
              Negative
            </div>
            <p className="text-2xl font-bold" data-testid="stat-negative-pct">
              {negPct}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical/High
            </div>
            <p className="text-2xl font-bold" data-testid="stat-severity-pct">
              {critPct}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Shield className="w-3.5 h-3.5" />
              P0 / P1
            </div>
            <p className="text-2xl font-bold" data-testid="stat-priority-count">
              {summary.p0Count + summary.p1Count}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Clock className="w-3.5 h-3.5" />
              Time Saved
            </div>
            <p className="text-lg font-bold leading-tight" data-testid="stat-time-saved">
              {summary.estimatedTimeSaved}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Sentiment breakdown */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Sentiment Breakdown</p>
            <div className="space-y-2" data-testid="chart-sentiment-breakdown">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                  Negative
                </div>
                <span className="text-xs font-medium">{summary.sentimentBreakdown.negative}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  Neutral
                </div>
                <span className="text-xs font-medium">{summary.sentimentBreakdown.neutral}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-chart-5/70" />
                  Positive
                </div>
                <span className="text-xs font-medium">{summary.sentimentBreakdown.positive}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Categories</p>
            <div className="space-y-2" data-testid="chart-category-breakdown">
              {Object.entries(summary.categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between gap-2">
                    <span className="text-xs truncate">{cat}</span>
                    <Badge variant="secondary" className="text-xs font-normal shrink-0">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Severity breakdown */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Severity Distribution</p>
            <div className="space-y-2" data-testid="chart-severity-breakdown">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/90" />
                  Critical
                </div>
                <span className="text-xs font-medium">{summary.severityBreakdown.critical}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-chart-4/70" />
                  High
                </div>
                <span className="text-xs font-medium">{summary.severityBreakdown.high}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-chart-2/50" />
                  Medium
                </div>
                <span className="text-xs font-medium">{summary.severityBreakdown.medium}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  Low
                </div>
                <span className="text-xs font-medium">{summary.severityBreakdown.low}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Themes table component ───
function ThemesTable({ themes }: { themes: Theme[] }) {
  return (
    <div className="relative w-full overflow-auto" data-testid="section-themes-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Theme</TableHead>
            <TableHead className="min-w-[100px]">Category</TableHead>
            <TableHead className="min-w-[90px]">Sentiment</TableHead>
            <TableHead className="min-w-[80px]">Severity</TableHead>
            <TableHead className="min-w-[250px]">Example Quotes</TableHead>
            <TableHead className="min-w-[110px]">Impact</TableHead>
            <TableHead className="min-w-[110px]">Effort</TableHead>
            <TableHead className="min-w-[70px]">Priority</TableHead>
            <TableHead className="min-w-[60px]">Freq</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {themes.map((theme) => (
            <TableRow key={theme.id} data-testid={`row-theme-${theme.id}`}>
              <TableCell className="font-medium" data-testid={`cell-theme-label-${theme.id}`}>
                <div className="space-y-1">
                  <span data-testid={`text-theme-name-${theme.id}`}>{theme.label}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs font-normal" data-testid={`badge-cluster-size-${theme.id}`}>
                      {theme.clusterSize} items
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell data-testid={`cell-theme-category-${theme.id}`}>
                <span className="text-xs text-muted-foreground">{theme.category}</span>
              </TableCell>
              <TableCell data-testid={`cell-theme-sentiment-${theme.id}`}>
                <SentimentIndicator sentiment={theme.sentiment} />
              </TableCell>
              <TableCell data-testid={`cell-theme-severity-${theme.id}`}>
                <SeverityBadge severity={theme.severity} />
              </TableCell>
              <TableCell data-testid={`cell-theme-quotes-${theme.id}`}>
                <div className="space-y-2">
                  {theme.quotes.map((q, i) => (
                    <div
                      key={i}
                      className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2 italic"
                      data-testid={`text-quote-${theme.id}-${i}`}
                    >
                      "{q}"
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell data-testid={`cell-theme-impact-${theme.id}`}>
                <ScoreDots score={theme.impact} color="bg-destructive/70" label={`impact-${theme.id}`} />
              </TableCell>
              <TableCell data-testid={`cell-theme-effort-${theme.id}`}>
                <ScoreDots score={theme.effort} color="bg-chart-2/70" label={`effort-${theme.id}`} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={theme.priority} />
              </TableCell>
              <TableCell data-testid={`cell-theme-freq-${theme.id}`}>
                <span className="text-xs font-medium text-muted-foreground">{theme.frequency}%</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Recommended actions section ───
function RecommendedActions({ themes }: { themes: Theme[] }) {
  const actionableThemes = themes.filter((t) => t.priority === "P0" || t.priority === "P1");
  const displayThemes = actionableThemes.length > 0 ? actionableThemes : themes.slice(0, 3);

  return (
    <div className="space-y-3" data-testid="section-recommended-actions">
      {displayThemes.map((theme) => (
        <div
          key={theme.id}
          className="flex items-start gap-3 p-3 rounded-md bg-muted/40"
          data-testid={`action-item-${theme.id}`}
        >
          <div className="mt-0.5 shrink-0">
            <PriorityBadge priority={theme.priority} />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">{theme.label}</p>
            <p className="text-xs text-muted-foreground" data-testid={`text-action-${theme.id}`}>
              {theme.recommendedAction}
            </p>
          </div>
          <div className="shrink-0 ml-auto">
            <SeverityBadge severity={theme.severity} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Single PRD ticket card ───
function PrdTicketCard({ ticket }: { ticket: PrdTicket }) {
  return (
    <AccordionItem value={`ticket-${ticket.id}`} className="border-none">
      <Card className="overflow-visible">
        <AccordionTrigger
          className="px-6 py-4 hover:no-underline"
          data-testid={`button-expand-ticket-${ticket.id}`}
        >
          <div className="flex items-center gap-3 text-left flex-wrap">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary shrink-0">
              <span className="text-xs font-bold">{ticket.id}</span>
            </div>
            <span className="font-semibold">{ticket.title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <div className="space-y-5" data-testid={`content-ticket-${ticket.id}`}>
            <div className="space-y-1.5" data-testid={`section-problem-${ticket.id}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 text-destructive/70" />
                Problem
              </div>
              <p className="text-sm text-muted-foreground pl-6" data-testid={`text-problem-${ticket.id}`}>
                {ticket.problem}
              </p>
            </div>

            <div className="space-y-1.5" data-testid={`section-userstory-${ticket.id}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="w-4 h-4 text-chart-2" />
                User Story
              </div>
              <p className="text-sm text-muted-foreground pl-6 italic" data-testid={`text-userstory-${ticket.id}`}>
                {ticket.userStory}
              </p>
            </div>

            <div className="space-y-1.5" data-testid={`section-solution-${ticket.id}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4 text-chart-4" />
                Proposed Solution
              </div>
              <p className="text-sm text-muted-foreground pl-6" data-testid={`text-solution-${ticket.id}`}>
                {ticket.proposedSolution}
              </p>
            </div>

            <div className="space-y-1.5" data-testid={`section-criteria-${ticket.id}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-chart-5" />
                Acceptance Criteria
              </div>
              <ul className="space-y-1 pl-6" data-testid={`list-criteria-${ticket.id}`}>
                {ticket.acceptanceCriteria.map((ac, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                    data-testid={`item-criteria-${ticket.id}-${i}`}
                  >
                    <ChevronRight className="w-3 h-3 mt-1 shrink-0 text-muted-foreground/50" />
                    {ac}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5" data-testid={`section-metrics-${ticket.id}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="w-4 h-4 text-chart-3" />
                Metrics / Success Criteria
              </div>
              <ul className="space-y-1 pl-6" data-testid={`list-metrics-${ticket.id}`}>
                {ticket.metrics.map((m, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                    data-testid={`item-metric-${ticket.id}-${i}`}
                  >
                    <ChevronRight className="w-3 h-3 mt-1 shrink-0 text-muted-foreground/50" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}

// ─── Main page ───
export default function Home() {
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = useCallback(() => {
    if (!feedback.trim()) {
      toast({
        title: "No feedback to analyze",
        description: "Please paste some customer feedback first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const analysisResult = analyzeFeedback(feedback);
      setResult(analysisResult);
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete",
        description: `Found ${analysisResult.themes.length} themes across ${analysisResult.items.length} feedback items.`,
      });
    }, 600);
  }, [feedback, toast]);

  const handleClear = useCallback(() => {
    setFeedback("");
    setResult(null);
  }, []);

  const handleLoadExample = useCallback(() => {
    setFeedback(EXAMPLE_FEEDBACK);
    setResult(null);
  }, []);

  const handleExportCsv = useCallback(() => {
    if (!result) return;
    exportCsv(result.themes);
    toast({ title: "CSV exported", description: "File download started." });
  }, [result, toast]);

  const handleExportJson = useCallback(() => {
    if (!result) return;
    exportJson(result);
    toast({ title: "JSON exported", description: "Full analysis exported." });
  }, [result, toast]);

  const handleCopyMarkdown = useCallback(async () => {
    if (!result) return;
    try {
      await copyNotionMarkdown(result.themes);
      toast({
        title: "Copied to clipboard",
        description: "Notion-compatible markdown table copied.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not access clipboard. Try again.",
        variant: "destructive",
      });
    }
  }, [result, toast]);

  const lineCount = feedback.trim()
    ? feedback.split("\n").filter((l) => l.trim()).length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              data-testid="text-title"
            >
              Product Ops Triage
            </h1>
          </div>
          <p
            className="text-muted-foreground max-w-2xl"
            data-testid="text-description"
          >
            Paste raw customer feedback from calls, emails, Slack, or support tickets.
            Automatically classify, cluster, and prioritize into actionable themes with
            sentiment analysis and recommended actions.
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Feedback</CardTitle>
            <CardDescription>
              Paste feedback below, one item per line.
              {lineCount > 0 && (
                <span className="ml-2 text-foreground font-medium" data-testid="text-line-count">
                  {lineCount} line{lineCount !== 1 ? "s" : ""}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={"The search feature is broken and returns no results\nLoading times are terrible, pages take forever\nNeed SSO integration for our enterprise team\n..."}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={8}
              className="resize-y font-mono text-sm"
              data-testid="input-feedback"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                data-testid="button-analyze"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Analyze
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                data-testid="button-clear"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
              <Button
                variant="ghost"
                onClick={handleLoadExample}
                data-testid="button-load-example"
              >
                <FileText className="w-4 h-4" />
                Load Example
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && result.themes.length > 0 && (
          <div className="space-y-6">
            {/* Summary Dashboard */}
            <Dashboard summary={result.summary} />

            {/* Recommended Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Recommended Actions</CardTitle>
                </div>
                <CardDescription>
                  Prioritized next steps based on severity and impact analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecommendedActions themes={result.themes} />
              </CardContent>
            </Card>

            {/* Themes Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">
                        Themes ({result.themes.length})
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Clustered feedback with classification, sentiment, severity, and priority
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCsv}
                      data-testid="button-export-csv"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportJson}
                      data-testid="button-export-json"
                    >
                      <FileJson className="w-4 h-4" />
                      Export JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyMarkdown}
                      data-testid="button-copy-markdown"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Notion Markdown
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ThemesTable themes={result.themes} />
              </CardContent>
            </Card>

            {/* PRD Tickets */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Top 3 PRD Tickets</CardTitle>
                </div>
                <CardDescription>
                  Actionable product requirement documents based on the highest-priority themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-3">
                  {result.tickets.map((ticket) => (
                    <PrdTicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty state after analysis with no results */}
        {result && result.themes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center" data-testid="text-empty-state">
              <p className="text-muted-foreground">
                No themes could be identified. Try adding more feedback lines.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
