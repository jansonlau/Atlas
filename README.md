# 🔦 Exa Spotlight Demo

A minimal but *novel* FastAPI web app that showcases Exa’s unique retrieval:
- **Semantic search + contents extraction** with domain & recency filters
- **On-click “Find similar”** to branch into neighborhoods around any source
- **Ask Exa** — direct Q&A with citations via Exa’s `/answer`

No build step required. Runs locally with Python.

---

## 1) Setup

```bash
python3 -m venv .venv && source .venv/bin/activate 
pip install -r requirements.txt
cp .env.example .env
# paste your key into .env:
#   EXA_API_KEY=xxxxxxxxxxxxxxxx
```

> You can create an API key from your Exa dashboard: https://dashboard.exa.ai/  (Docs: https://docs.exa.ai/)

## 2) Run

```bash
uvicorn app:app --reload
```

Open http://127.0.0.1:8000 in your browser.

## 3) How it works

- **/search** → Calls `exa.search_and_contents(query, text=True, highlights=...)` and renders:
  - Clean extracted text (truncated)
  - Query-relevant highlights
  - Filters: `include_domains`, `exclude_domains`, and `start_published_date` for recency

- **Find similar** → For any result URL, hits `exa.find_similar_and_contents(url, text=True, exclude_source_domain=True)` to explore a *semantic neighborhood* of pages around that source.

- **/answer** → Calls `exa.answer(question, text=True)` and prints the generated answer with a **list of citations** (each links out to the source).

Under the hood we lean on Exa’s embeddings-based retrieval and its contents API to avoid brittle scraping. The Answer endpoint pairs Exa search + an LLM to return a synthesized answer with sources.

## 4) Why this is novel/useful

1. **Neighborhood-first discovery** — Clicking *Find similar* on any result behaves like “open the semantic cluster around this page,” which users quickly fall in love with for research and competitive intel.
2. **Faceted semantic search** — Domain & recency filters + highlights let users shape the slice of the web they care about (e.g., “last 7 days on official docs only”).
3. **Trust by default** — The Q&A view always shows clickable citations, making it safe to use in daily work.

## 5) Files

```
.
├── app.py                 # FastAPI app (all routes)
├── requirements.txt
├── .env.example
├── templates/
│   ├── index.html         # UI (Tailwind + HTMX)
│   └── partials/
│       ├── results.html   # results list
│       ├── similar.html   # similar links section
│       ├── answer.html    # answer + citations
│       └── error.html
└── static/
    └── style.css          # optional overrides
```

## 6) Customization ideas

- Add prebuilt **Websets** (curated domain lists) as dropdowns and pass them as `include_domains`.
- Toggle **recency** presets (24h / 7d / 30d).
- Add a **monitor** page that saves queries and re-runs them on-demand to check for fresh results.
- Turn on **streaming answers** with `exa.stream_answer(...)` for token-by-token updates.
- Experiment with **highlights**: change `highlights_per_url`, `num_sentences`, or the `query` used for highlighting.

## 7) References

- Python SDK & common calls: https://github.com/exa-labs/exa-py  (see examples)  
- Search & Contents: https://docs.exa.ai/reference/search  
- Find Similar: https://docs.exa.ai/reference/find-similar-links  
- Answer endpoint: https://docs.exa.ai/reference/answer
