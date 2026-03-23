# Product Ops Triage

**Turn raw customer feedback into prioritized, actionable themes — entirely in your browser.**

Product teams and ops leads spend hours manually reading through support tickets, Slack messages, and survey responses trying to figure out what actually needs to be fixed or built next. This tool does that in seconds.

Paste in any volume of customer feedback, and Product Ops Triage automatically clusters, classifies, and scores it into structured themes — with zero setup, no API keys, and no data leaving your machine.

---

## Why I Built This

After working in operations and strategy consulting, one pattern showed up constantly: product teams were making roadmap decisions based on whoever talked the loudest, not the data. Feedback existed — it just wasn't structured. This tool is the bridge between raw signal and prioritized action.

---

## What It Does

| Capability | Description |
|---|---|
| **Clustering** | Groups similar feedback using cosine similarity |
| **Sentiment** | Classifies each item as positive, neutral, or negative |
| **Category tagging** | Tags themes as Bug, Feature Request, UX, Performance, Security, or Data/Export |
| **Severity scoring** | Scores themes as critical, high, medium, or low |
| **Source detection** | Identifies channels — Support Ticket, Sales Call, Slack, Email, Survey |
| **Priority ranking** | Ranks themes P0–P3 based on impact vs. effort |
| **Recommended actions** | Generates context-aware next steps per theme |
| **PRD ticket drafting** | Auto-drafts the top 3 product requirement tickets |

---

## Exports

- **CSV** — full themes table with all fields, ready for spreadsheets or data tools
- **JSON** — structured data for downstream tooling or API consumption
- **Notion markdown** — paste directly into a Notion doc, no reformatting needed

---

## Tech Stack

- **React + TypeScript** — component architecture and type safety
- **Vite** — fast build tooling
- **Tailwind CSS + shadcn/ui** — clean, accessible UI
- **100% client-side** — no backend, no API keys, no data ever leaves your browser

---

## Getting Started
```bash
git clone https://github.com/usmankhan30398-stack/product-ops-triage
cd product-ops-triage
npm install
npm run dev
```

Open `https://product-ops-triage.replit.app`, paste in your feedback (one item per line), and hit analyze.

---

## Use Cases

- Weekly product team triage meetings
- Quarterly roadmap prioritization
- Post-launch feedback synthesis
- Customer success → product feedback handoff

---

## Built By

[Usman Khan](https://github.com/usmankhan30398-stack) — Strategy & Operations professional building tools at the intersection of ops workflows and AI.
