// ─── Stopwords list for filtering common English words ───
const STOPWORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
  "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her",
  "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs",
  "themselves", "what", "which", "who", "whom", "this", "that", "these", "those",
  "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if",
  "or", "because", "as", "until", "while", "of", "at", "by", "for", "with",
  "about", "against", "between", "through", "during", "before", "after", "above",
  "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
  "again", "further", "then", "once", "here", "there", "when", "where", "why",
  "how", "all", "both", "each", "few", "more", "most", "other", "some", "such",
  "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s",
  "t", "can", "will", "just", "don", "should", "now", "d", "ll", "m", "o", "re",
  "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven",
  "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren",
  "won", "wouldn", "also", "get", "got", "like", "really", "would", "could",
  "much", "still", "even", "thing", "things", "way", "well", "back", "going",
  "want", "make", "know", "think", "go", "see", "come", "take", "give",
]);

// ─── Impact indicator words ───
const IMPACT_WORDS = new Set([
  "broken", "can't", "cant", "cannot", "error", "urgent", "need", "slow",
  "crash", "bug", "fail", "failing", "failed", "frustrating", "frustrated",
  "unusable", "terrible", "horrible", "awful", "worst", "critical", "blocking",
  "blocked", "impossible", "lost", "losing", "data", "loss", "downtime",
  "outage", "wrong", "incorrect", "missing", "disappeared", "stuck",
]);

// ─── Effort indicator words ───
const EFFORT_WORDS = new Set([
  "integration", "api", "enterprise", "security", "migration", "sso",
  "oauth", "saml", "compliance", "gdpr", "hipaa", "infrastructure",
  "architecture", "refactor", "redesign", "overhaul", "scalability",
  "performance", "database", "schema", "backend", "microservice",
  "deployment", "ci", "cd", "pipeline", "kubernetes", "docker",
]);

// ─── Sentiment word lists ───
const NEGATIVE_WORDS = new Set([
  "broken", "can't", "cant", "cannot", "error", "slow", "crash", "bug",
  "fail", "failing", "failed", "frustrating", "frustrated", "unusable",
  "terrible", "horrible", "awful", "worst", "critical", "blocking",
  "blocked", "impossible", "lost", "losing", "wrong", "incorrect",
  "missing", "disappeared", "stuck", "confusing", "complicated", "difficult",
  "annoying", "unreliable", "delayed", "cluttered", "hate", "bad", "poor",
  "ugly", "painful", "sucks", "useless", "inconsistent", "flaky",
]);

const POSITIVE_WORDS = new Set([
  "love", "great", "awesome", "excellent", "amazing", "good", "helpful",
  "nice", "perfect", "easy", "fast", "useful", "convenient", "smooth",
  "intuitive", "reliable", "efficient", "beautiful", "wonderful", "fantastic",
  "impressive", "solid", "clean", "simple", "elegant", "powerful",
]);

// ─── Category classification keywords ───
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Bug Report": [
    "broken", "bug", "crash", "error", "fail", "failing", "failed", "wrong",
    "incorrect", "doesn't work", "not working", "glitch", "issue",
  ],
  "Feature Request": [
    "need", "want", "wish", "would be nice", "add", "support", "integrate",
    "capability", "ability", "option", "feature", "enable", "allow",
  ],
  "UX / Usability": [
    "confusing", "hard to", "difficult", "cluttered", "navigate", "find",
    "ui", "ux", "design", "interface", "layout", "onboarding", "flow",
    "intuitive", "complicated", "overwhelming",
  ],
  "Performance": [
    "slow", "loading", "speed", "lag", "timeout", "latency", "fast",
    "performance", "takes forever", "hang", "hangs", "unresponsive", "delay",
  ],
  "Security / Compliance": [
    "sso", "saml", "oauth", "security", "compliance", "gdpr", "hipaa",
    "authentication", "password", "login", "permission", "access", "encrypt",
  ],
  "Data / Export": [
    "export", "csv", "data", "report", "import", "download", "sync",
    "backup", "columns", "fields", "missing data",
  ],
};

// ─── Source detection keywords ───
const SOURCE_KEYWORDS: Record<string, string[]> = {
  "Support Ticket": [
    "ticket", "support", "help desk", "zendesk", "intercom", "case",
  ],
  "Sales Call": [
    "call", "demo", "meeting", "prospect", "deal", "pipeline", "sales",
  ],
  "Slack": [
    "slack", "channel", "thread", "dm", "message",
  ],
  "Email": [
    "email", "inbox", "reply", "forwarded", "subject line",
  ],
  "Survey": [
    "survey", "nps", "csat", "rating", "score", "feedback form",
  ],
};

// ─── Tokenize a string into cleaned word tokens ───
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

// ─── Build a term-frequency vector from tokens ───
function buildTfVector(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

// ─── Compute cosine similarity between two TF vectors ───
function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>
): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  a.forEach((count, word) => {
    magA += count * count;
    if (b.has(word)) {
      dot += count * b.get(word)!;
    }
  });
  b.forEach((count) => {
    magB += count * count;
  });

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ─── Sentiment analysis for a single feedback line ───
export type Sentiment = "negative" | "neutral" | "positive";

function analyzeSentiment(text: string): Sentiment {
  const lower = text.toLowerCase();
  let negCount = 0;
  let posCount = 0;

  NEGATIVE_WORDS.forEach((w) => {
    if (lower.includes(w)) negCount++;
  });
  POSITIVE_WORDS.forEach((w) => {
    if (lower.includes(w)) posCount++;
  });

  if (negCount > posCount) return "negative";
  if (posCount > negCount) return "positive";
  return "neutral";
}

// ─── Classify a feedback line into a category ───
function classifyCategory(text: string): string {
  const lower = text.toLowerCase();
  let bestCategory = "General Feedback";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

// ─── Detect likely source channel ───
function detectSource(text: string): string {
  const lower = text.toLowerCase();
  for (const [source, keywords] of Object.entries(SOURCE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return source;
    }
  }
  return "Direct Feedback";
}

// ─── Compute severity (critical / high / medium / low) ───
const CRITICAL_WORDS = new Set([
  "crash", "outage", "data loss", "lost", "losing", "downtime", "unusable",
  "blocked", "critical", "urgent", "security", "breach",
]);
const HIGH_WORDS = new Set([
  "broken", "error", "fail", "failed", "can't", "cant", "cannot", "wrong",
  "impossible", "stuck",
]);

function computeSeverity(text: string): "critical" | "high" | "medium" | "low" {
  const lower = text.toLowerCase();
  for (const w of Array.from(CRITICAL_WORDS)) {
    if (lower.includes(w)) return "critical";
  }
  for (const w of Array.from(HIGH_WORDS)) {
    if (lower.includes(w)) return "high";
  }
  const negSentiment = analyzeSentiment(text);
  if (negSentiment === "negative") return "medium";
  return "low";
}

// ─── Types for the analysis output ───
export interface FeedbackItem {
  text: string;
  sentiment: Sentiment;
  category: string;
  source: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface Theme {
  id: number;
  label: string;
  summary: string;
  quotes: string[];
  impact: number;
  effort: number;
  priority: string;
  clusterSize: number;
  feedbackItems: string[];
  topKeywords: string[];
  sentiment: Sentiment;
  sentimentBreakdown: { negative: number; neutral: number; positive: number };
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  frequency: number;
  recommendedAction: string;
}

export interface PrdTicket {
  id: number;
  title: string;
  problem: string;
  userStory: string;
  proposedSolution: string;
  acceptanceCriteria: string[];
  metrics: string[];
}

export interface AnalysisSummary {
  totalFeedback: number;
  totalThemes: number;
  sentimentBreakdown: { negative: number; neutral: number; positive: number };
  severityBreakdown: { critical: number; high: number; medium: number; low: number };
  topCategory: string;
  categoryBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  avgImpact: number;
  avgEffort: number;
  p0Count: number;
  p1Count: number;
  estimatedTimeSaved: string;
}

export interface AnalysisResult {
  themes: Theme[];
  tickets: PrdTicket[];
  items: FeedbackItem[];
  summary: AnalysisSummary;
}

// ─── Greedy clustering with cosine similarity threshold ───
function clusterFeedback(
  lines: string[],
  threshold: number = 0.15
): { items: string[]; tokens: string[] }[] {
  const tokenized = lines.map((line) => ({
    text: line,
    tokens: tokenize(line),
    vector: buildTfVector(tokenize(line)),
    assigned: false,
  }));

  const clusters: { items: string[]; tokens: string[] }[] = [];

  for (let i = 0; i < tokenized.length; i++) {
    if (tokenized[i].assigned || tokenized[i].tokens.length === 0) continue;

    const cluster = {
      items: [tokenized[i].text],
      tokens: [...tokenized[i].tokens],
    };
    tokenized[i].assigned = true;

    for (let j = i + 1; j < tokenized.length; j++) {
      if (tokenized[j].assigned || tokenized[j].tokens.length === 0) continue;

      const sim = cosineSimilarity(tokenized[i].vector, tokenized[j].vector);
      if (sim >= threshold) {
        cluster.items.push(tokenized[j].text);
        cluster.tokens.push(...tokenized[j].tokens);
        tokenized[j].assigned = true;
      }
    }

    clusters.push(cluster);
  }

  for (const item of tokenized) {
    if (!item.assigned && item.tokens.length > 0) {
      clusters.push({ items: [item.text], tokens: item.tokens });
    }
  }

  return clusters;
}

// ─── Get top N keywords from a token list ───
function getTopKeywords(tokens: string[], n: number = 5): string[] {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word]) => word);
}

// ─── Generate a readable theme label from top keywords ───
function generateLabel(keywords: string[]): string {
  const label = keywords
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" & ");
  return label + " Issues";
}

// ─── Generate a summary sentence from the cluster ───
function generateSummary(items: string[], keywords: string[]): string {
  const count = items.length;
  const topWords = keywords.slice(0, 3).join(", ");
  return `${count} user${count > 1 ? "s" : ""} reported issues related to ${topWords}.`;
}

// ─── Compute impact score (1-5) based on cluster size and severity words ───
function computeImpact(items: string[], tokens: string[]): number {
  const sizeScore = Math.min(items.length / 3, 2);
  let severityCount = 0;
  for (const t of tokens) {
    if (IMPACT_WORDS.has(t)) severityCount++;
  }
  const severityScore = Math.min(severityCount / 2, 3);
  return Math.max(1, Math.min(5, Math.round(sizeScore + severityScore + 1)));
}

// ─── Compute effort score (1-5) based on complexity indicator words ───
function computeEffort(tokens: string[]): number {
  let effortCount = 0;
  for (const t of tokens) {
    if (EFFORT_WORDS.has(t)) effortCount++;
  }
  const base = Math.min(effortCount, 4);
  return Math.max(1, Math.min(5, base + 1));
}

// ─── Map impact and effort to priority (P0-P3) ───
function computePriority(
  impact: number,
  effort: number,
  clusterSize: number
): string {
  if (clusterSize === 1) return "P3";
  if (impact >= 4 && effort <= 3) return "P0";
  if ((impact >= 4 && effort > 3) || (impact === 3 && effort <= 3)) return "P1";
  return "P2";
}

// ─── Aggregate sentiment for a cluster ───
function aggregateSentiment(items: string[]): {
  dominant: Sentiment;
  breakdown: { negative: number; neutral: number; positive: number };
} {
  const breakdown = { negative: 0, neutral: 0, positive: 0 };
  for (const item of items) {
    breakdown[analyzeSentiment(item)]++;
  }
  if (breakdown.negative >= breakdown.positive && breakdown.negative >= breakdown.neutral) {
    return { dominant: "negative", breakdown };
  }
  if (breakdown.positive >= breakdown.negative && breakdown.positive >= breakdown.neutral) {
    return { dominant: "positive", breakdown };
  }
  return { dominant: "neutral", breakdown };
}

// ─── Aggregate severity for a cluster ───
function aggregateSeverity(items: string[]): "critical" | "high" | "medium" | "low" {
  const severities = items.map((item) => computeSeverity(item));
  if (severities.includes("critical")) return "critical";
  if (severities.includes("high")) return "high";
  if (severities.includes("medium")) return "medium";
  return "low";
}

// ─── Generate recommended action for a theme ───
function generateRecommendedAction(theme: {
  topKeywords: string[];
  category: string;
  severity: string;
  clusterSize: number;
  priority: string;
}): string {
  const cat = theme.category;
  const kw = theme.topKeywords[0] || "this area";

  if (theme.severity === "critical") {
    return `Immediately assign engineering resources to investigate and resolve ${kw}-related failures. Set up monitoring and create an incident response plan.`;
  }

  if (cat === "Bug Report") {
    return `File a bug ticket to fix ${kw} issues. Reproduce the error, identify root cause, and deploy a hotfix within the current sprint.`;
  }
  if (cat === "Feature Request") {
    return `Add ${kw} to the product roadmap. Validate demand with user interviews, then spec and prioritize for an upcoming sprint.`;
  }
  if (cat === "UX / Usability") {
    return `Conduct usability audit of ${kw} flows. Create wireframes for an improved experience and schedule user testing sessions.`;
  }
  if (cat === "Performance") {
    return `Profile ${kw} performance bottlenecks. Implement caching, optimize queries, and establish performance budgets with automated alerts.`;
  }
  if (cat === "Security / Compliance") {
    return `Engage security team to evaluate ${kw} requirements. Create a compliance roadmap and begin implementation with proper audit trails.`;
  }
  if (cat === "Data / Export") {
    return `Audit ${kw} functionality for completeness. Add missing fields/formats and validate output accuracy with sample datasets.`;
  }

  return `Investigate ${kw} feedback, identify root causes, and create actionable tickets for the next planning cycle.`;
}

// ─── Determine most common category in cluster ───
function aggregateCategory(items: string[]): string {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const cat = classifyCategory(item);
    counts[cat] = (counts[cat] || 0) + 1;
  }
  let best = "General Feedback";
  let bestCount = 0;
  for (const [cat, count] of Object.entries(counts)) {
    if (count > bestCount) {
      bestCount = count;
      best = cat;
    }
  }
  return best;
}

// ─── Generate PRD tickets from top themes ───
function generateTickets(themes: Theme[]): PrdTicket[] {
  const topThemes = themes.slice(0, 3);

  return topThemes.map((theme, i) => {
    const keywordsStr = theme.topKeywords.slice(0, 3).join(", ");

    return {
      id: i + 1,
      title: `Improve ${theme.label}`,
      problem: `Users are experiencing issues with ${keywordsStr}. ${theme.summary}`,
      userStory: `As a user, I want ${keywordsStr} to work reliably so that I can complete my tasks without friction or errors.`,
      proposedSolution: generateSolution(theme),
      acceptanceCriteria: generateAcceptanceCriteria(theme),
      metrics: generateMetrics(theme),
    };
  });
}

// ─── Generate a proposed solution based on theme context ───
function generateSolution(theme: Theme): string {
  const keywords = theme.topKeywords;
  const hasPerf = keywords.some((k) =>
    ["slow", "loading", "performance", "speed", "lag"].includes(k)
  );
  const hasError = keywords.some((k) =>
    ["error", "bug", "crash", "broken", "fail"].includes(k)
  );
  const hasUx = keywords.some((k) =>
    ["ui", "ux", "design", "confusing", "difficult", "interface"].includes(k)
  );

  if (hasPerf) {
    return `Optimize ${keywords[0]} performance by implementing caching, lazy loading, and reducing unnecessary re-renders. Profile critical paths and establish performance budgets.`;
  }
  if (hasError) {
    return `Implement comprehensive error handling and recovery flows for ${keywords[0]}. Add monitoring and alerting to detect issues proactively. Create user-friendly error messages with recovery actions.`;
  }
  if (hasUx) {
    return `Redesign the ${keywords[0]} experience with improved information architecture, clearer visual hierarchy, and guided workflows. Conduct usability testing to validate improvements.`;
  }
  return `Address ${keywords.slice(0, 2).join(" and ")} concerns by auditing the current implementation, identifying root causes, and implementing targeted fixes with proper testing coverage.`;
}

// ─── Generate acceptance criteria bullets ───
function generateAcceptanceCriteria(theme: Theme): string[] {
  const keyword = theme.topKeywords[0];
  return [
    `Users can complete ${keyword}-related tasks without encountering errors`,
    `System provides clear feedback during ${keyword} operations`,
    `Edge cases and error states are handled gracefully`,
    `Changes are covered by automated tests with >80% coverage`,
    `Performance regression tests pass within acceptable thresholds`,
  ];
}

// ─── Generate metrics/success criteria ───
function generateMetrics(theme: Theme): string[] {
  const keyword = theme.topKeywords[0];
  return [
    `Reduce ${keyword}-related support tickets by 40% within 30 days`,
    `Achieve user satisfaction score of 4+ out of 5 for ${keyword} experience`,
    `Zero critical ${keyword} bugs in production for 2 consecutive sprints`,
    `Task completion rate for ${keyword} flows improves by 25%`,
  ];
}

// ─── Build analysis summary dashboard data ───
function buildSummary(
  items: FeedbackItem[],
  themes: Theme[]
): AnalysisSummary {
  const sentimentBreakdown = { negative: 0, neutral: 0, positive: 0 };
  const severityBreakdown = { critical: 0, high: 0, medium: 0, low: 0 };
  const categoryBreakdown: Record<string, number> = {};
  const sourceBreakdown: Record<string, number> = {};

  for (const item of items) {
    sentimentBreakdown[item.sentiment]++;
    severityBreakdown[item.severity]++;
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    sourceBreakdown[item.source] = (sourceBreakdown[item.source] || 0) + 1;
  }

  let topCategory = "General Feedback";
  let topCatCount = 0;
  for (const [cat, count] of Object.entries(categoryBreakdown)) {
    if (count > topCatCount) {
      topCatCount = count;
      topCategory = cat;
    }
  }

  const avgImpact =
    themes.length > 0
      ? Math.round(
          (themes.reduce((sum, t) => sum + t.impact, 0) / themes.length) * 10
        ) / 10
      : 0;
  const avgEffort =
    themes.length > 0
      ? Math.round(
          (themes.reduce((sum, t) => sum + t.effort, 0) / themes.length) * 10
        ) / 10
      : 0;

  const p0Count = themes.filter((t) => t.priority === "P0").length;
  const p1Count = themes.filter((t) => t.priority === "P1").length;

  const manualMinutes = items.length * 3;
  const estimatedTimeSaved = manualMinutes >= 60
    ? `~${Math.round(manualMinutes / 60)}h saved vs. manual`
    : `~${manualMinutes}min saved vs. manual`;

  return {
    totalFeedback: items.length,
    totalThemes: themes.length,
    sentimentBreakdown,
    severityBreakdown,
    topCategory,
    categoryBreakdown,
    sourceBreakdown,
    avgImpact,
    avgEffort,
    p0Count,
    p1Count,
    estimatedTimeSaved,
  };
}

// ─── Main analysis function: takes raw text, returns themes + tickets + summary ───
export function analyzeFeedback(rawText: string): AnalysisResult {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      themes: [],
      tickets: [],
      items: [],
      summary: {
        totalFeedback: 0,
        totalThemes: 0,
        sentimentBreakdown: { negative: 0, neutral: 0, positive: 0 },
        severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
        topCategory: "",
        categoryBreakdown: {},
        sourceBreakdown: {},
        avgImpact: 0,
        avgEffort: 0,
        p0Count: 0,
        p1Count: 0,
        estimatedTimeSaved: "0min",
      },
    };
  }

  // Analyze each individual feedback item
  const items: FeedbackItem[] = lines.map((text) => ({
    text,
    sentiment: analyzeSentiment(text),
    category: classifyCategory(text),
    source: detectSource(text),
    severity: computeSeverity(text),
  }));

  // Cluster feedback lines by keyword similarity
  const clusters = clusterFeedback(lines);

  // Build themes from clusters
  const themes: Theme[] = clusters
    .map((cluster, i) => {
      const topKeywords = getTopKeywords(cluster.tokens, 5);
      const impact = computeImpact(cluster.items, cluster.tokens);
      const effort = computeEffort(cluster.tokens);
      const priority = computePriority(impact, effort, cluster.items.length);
      const { dominant: sentiment, breakdown: sentimentBreakdown } =
        aggregateSentiment(cluster.items);
      const category = aggregateCategory(cluster.items);
      const severity = aggregateSeverity(cluster.items);
      const frequency = Math.round((cluster.items.length / lines.length) * 100);

      const themeData = {
        id: i + 1,
        label: generateLabel(topKeywords),
        summary: generateSummary(cluster.items, topKeywords),
        quotes: cluster.items.slice(0, 2),
        impact,
        effort,
        priority,
        clusterSize: cluster.items.length,
        feedbackItems: cluster.items,
        topKeywords,
        sentiment,
        sentimentBreakdown,
        category,
        severity,
        frequency,
        recommendedAction: "",
      };

      themeData.recommendedAction = generateRecommendedAction(themeData);

      return themeData;
    })
    .sort((a, b) => {
      const prioOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
      const prioDiff =
        (prioOrder[a.priority] ?? 4) - (prioOrder[b.priority] ?? 4);
      if (prioDiff !== 0) return prioDiff;
      return b.clusterSize - a.clusterSize;
    });

  const tickets = generateTickets(themes);
  const summary = buildSummary(items, themes);

  return { themes, tickets, items, summary };
}

// ─── Example feedback data for the "Load Example" button ───
export const EXAMPLE_FEEDBACK = `The search feature is broken - can't find any results
Search results are slow and often return errors
Loading times are terrible, pages take forever
The app keeps crashing when I try to upload files
File upload fails with no error message
Can't upload large files, the system just hangs
The dashboard is confusing and hard to navigate
UI is cluttered and I can't find what I need
Navigation is really confusing for new users
Need SSO integration for our enterprise team
We need SAML authentication for compliance
API rate limiting is causing issues for our integration
The mobile experience is unusable
App doesn't work well on tablets
Responsive design is broken on smaller screens
Export feature doesn't include all data fields
CSV export is missing important columns
Need better notification system, I miss important updates
Email notifications are unreliable and delayed
The onboarding flow is too complicated
New users get lost during setup
Password reset flow is broken
Can't change my password, getting errors
Billing page shows wrong subscription details
Payment processing fails intermittently`;
