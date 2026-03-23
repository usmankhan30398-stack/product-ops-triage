import type { Theme, AnalysisResult } from "./analysis";

// ─── Export themes table as CSV and trigger download ───
export function exportCsv(themes: Theme[]): void {
  const headers = [
    "Theme",
    "Category",
    "Summary",
    "Sentiment",
    "Severity",
    "Quote 1",
    "Quote 2",
    "Impact",
    "Effort",
    "Priority",
    "Cluster Size",
    "Frequency %",
    "Recommended Action",
  ];

  const escapeCell = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = themes.map((t) => [
    escapeCell(t.label),
    escapeCell(t.category),
    escapeCell(t.summary),
    t.sentiment,
    t.severity,
    escapeCell(t.quotes[0] || ""),
    escapeCell(t.quotes[1] || ""),
    String(t.impact),
    String(t.effort),
    t.priority,
    String(t.clusterSize),
    `${t.frequency}%`,
    escapeCell(t.recommendedAction),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "product-ops-triage.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Generate Notion-compatible markdown and copy to clipboard ───
export function copyNotionMarkdown(themes: Theme[]): Promise<void> {
  const header =
    "| Theme | Category | Sentiment | Severity | Impact | Effort | Priority | Action |";
  const divider =
    "|-------|----------|-----------|----------|--------|--------|----------|--------|";

  const rows = themes.map(
    (t) =>
      `| ${t.label} | ${t.category} | ${t.sentiment} | ${t.severity} | ${t.impact}/5 | ${t.effort}/5 | ${t.priority} | ${t.recommendedAction} |`
  );

  const markdown = [header, divider, ...rows].join("\n");

  return navigator.clipboard.writeText(markdown);
}

// ─── Export full analysis as JSON ───
export function exportJson(result: AnalysisResult): void {
  const data = {
    summary: result.summary,
    themes: result.themes.map((t) => ({
      theme: t.label,
      category: t.category,
      sentiment: t.sentiment,
      severity: t.severity,
      summary: t.summary,
      impact: t.impact,
      effort: t.effort,
      priority: t.priority,
      clusterSize: t.clusterSize,
      frequency: `${t.frequency}%`,
      quotes: t.quotes,
      recommendedAction: t.recommendedAction,
      keywords: t.topKeywords,
    })),
    tickets: result.tickets,
    feedbackItems: result.items,
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "product-ops-triage-full.json";
  link.click();
  URL.revokeObjectURL(url);
}
