# Projects

Featured three are locked. Extra projects behind **More** are not locked until Marcell names them.
Landing-page copy is **1–3 sentences** (EN + ID). Full method, numbers, and how-to-run live in each repo `README.md` once Marcell pushes it.

GitHub buttons: only when a URL is confirmed. Toko Marcell: **no GitHub link yet**.

## Featured (always visible)

### P1 — Toko Marcell

| Field | Value |
|---|---|
| Status | In progress |
| Stack | Next.js, FastAPI, pgvector, Docker |
| GitHub | none yet |
| Demo | none |

**EN (draft):** Indonesian e-commerce with hybrid search (BM25 + embeddings), session recommendations, and a tool-using copilot in one stack. Still in progress — evaluation comes before any score on this page.

**ID (draft):** Toko daring dengan hybrid search (BM25 + embeddings), rekomendasi sesi, dan copilot yang memakai tools, dalam satu stack. Masih dikerjakan — angka eval tidak ditampilkan sebelum diukur.

### P2 — Credit-Risk Deep-Dive

| Field | Value |
|---|---|
| Status | Finished |
| Stack | Python, SQL, scikit-learn, SHAP, Kaggle |
| GitHub | TODO — Marcell will push a repo + README |
| Demo | none |

**EN (draft):** Credit scoring on a 50,000-row customer panel, from SQL through model, SHAP, and cost math. A random split leaked customers into both train and test; the write-up uses a grouped split and reports the honest drop. Method and numbers are in the GitHub README.

**ID (draft):** Credit scoring pada panel 50.000 baris: SQL, model, SHAP, dan cost math. Split acak bocor antar nasabah; tulisan memakai grouped split dan menampilkan penurunan yang jujur. Metode dan angka ada di README GitHub.

Reference numbers (README only, not on the card unless Marcell asks later): F1-macro 0.659 grouped vs 0.733 leaky; ~Rp 2.9 miliar estimated value per 9,921 test rows; SQL 19/19; SHAP top-3 Outstanding_Debt, Interest_Rate, Credit_Mix_Good.

### P3 — RAG Research Agent

| Field | Value |
|---|---|
| Status | Planned |
| Stack | FastAPI, pgvector, RAGAS, MCP SDK, Groq / OpenRouter |
| GitHub | none yet |
| Demo | none |

**EN (draft):** Planned research agent: query → plan → retrieve → cited answer, with retrieval eval and tools over MCP. On this page as direction, not as shipped work.

**ID (draft):** Agent riset (rencana): query → plan → retrieve → jawaban bersitasi, dengan eval retrieval dan tools lewat MCP. Ditampilkan sebagai arah, bukan kerja yang sudah jalan.

## More (hidden until click)

**v1: omit the More control.** Extra repos will be added later when READMEs exist. Do not ship an empty More button.

Public GitHub candidates for a later pass:

| Repo | Notes |
|---|---|
| [toko-marcell](https://github.com/marknshoot/toko-marcell) | Flagship code; featured card still has no link |
| [churn_endpoint](https://github.com/marknshoot/churn_endpoint) | Python API |
| [aws_endpoint](https://github.com/marknshoot/aws_endpoint) | Python API |
| [Placement-Salary-Prediction](https://github.com/marknshoot/Placement-Salary-Prediction) | Python |
| [Salary-Placement-Prediction](https://github.com/marknshoot/Salary-Placement-Prediction) | Likely duplicate of the above |
| [endpoint_uas](https://github.com/marknshoot/endpoint_uas) | Python |
| [uas_md](https://github.com/marknshoot/uas_md) | Python, large |
| [IrisPrediction](https://github.com/marknshoot/IrisPrediction) | Classic tutorial-shaped; weak as recruiter proof |
| [AI_TIC_TAC_TOE](https://github.com/marknshoot/AI_TIC_TAC_TOE) | HTML game; weak as AI Engineer proof |
| [market-report](https://github.com/marknshoot/market-report) | Empty / no language |

Default recommendation: put only **non-toy, non-duplicate** work under More (placement prediction, churn/aws endpoints, exam endpoints if they show real API/ML). Leave Iris and tic-tac-toe off unless Marcell wants them.
