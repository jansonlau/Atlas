"""FastAPI app demonstrating Exa search, similarity, and answer endpoints.

Routes:
- "/" serves the UI
- "/search" queries Exa with optional text and highlights
- "/similar" finds pages similar to a provided URL
- "/answer" uses Exa to answer a question with citations
- "/health" for readiness checks
"""

import os
import datetime
from typing import List, Optional

from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

# Exa SDK
from exa_py import Exa

load_dotenv()
# Read Exa API key from environment (.env supported)
EXA_API_KEY = os.getenv("EXA_API_KEY")

if not EXA_API_KEY:
    # Fail fast with a clear error when the API key isn't configured
    raise RuntimeError("Set EXA_API_KEY in your environment or .env file")

# Initialize the Exa client
exa = Exa(EXA_API_KEY)

# Create the FastAPI application
app = FastAPI(title="Exa Spotlight Demo", version="0.1.0")

# Serve static assets and configure Jinja2 templating
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


def _parse_csv(s: str) -> Optional[List[str]]:
    """Convert a comma-separated string to a list of non-empty, trimmed items.

    Returns None when `s` is empty or contains only commas/whitespace.
    """
    if not s:
        return None
    items = [x.strip() for x in s.split(",")]
    return [x for x in items if x] or None


def _recency_to_date(days: int) -> Optional[str]:
    """Translate a recency window (days) into an ISO date string (YYYY-MM-DD).

    Returns None when `days` is falsy or non-positive.
    """
    if not days or days <= 0:
        return None
    start = datetime.datetime.utcnow() - datetime.timedelta(days=int(days))
    # Exa wants ISO date string (YYYY-MM-DD) for published filter
    return start.date().isoformat()


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Render the main index page containing the search UI."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/search", response_class=HTMLResponse)
async def search(
    request: Request,
    q: str = Form(...),
    include_domains: str = Form(""),
    exclude_domains: str = Form(""),
    recency_days: int = Form(0),
    num_results: int = Form(10),
    highlights_per_url: int = Form(2),
    include_text: bool = Form(True),
):
    """Search Exa for `q`, with optional domain filters and recency window.

    - include_domains/exclude_domains: CSV of domains to include/exclude
    - recency_days: only include pages since now - recency_days
    - num_results: number of results to return
    - highlights_per_url: highlight snippets per URL
    - include_text: whether to fetch page body text
    """
    include = _parse_csv(include_domains)
    exclude = _parse_csv(exclude_domains)
    start_date = _recency_to_date(recency_days)

    # Build search options for Exa based on provided filters
    options = {
        "type": "auto",
        "num_results": num_results,
    }
    if include:
        options["include_domains"] = include
    if exclude:
        options["exclude_domains"] = exclude
    if start_date:
        options["start_published_date"] = start_date

    # Configure whether to fetch text and how to compute highlights
    text_opt = True if include_text else False
    highlights_opt = {
        "highlights_per_url": max(0, int(highlights_per_url)),
        "num_sentences": 2,
        "query": q,
    }

    try:
        # Perform the search and optionally fetch contents + highlights
        results = exa.search_and_contents(
            q,
            text=text_opt,
            highlights=highlights_opt,
            **options,
        )
    except Exception as e:
        # Show a human-friendly error if the Exa API call fails
        return templates.TemplateResponse(
            "partials/error.html",
            {"request": request, "error": str(e)},
            status_code=500,
        )

    # Normalize results (pydantic object or dict) to plain dicts for templating
    items = []
    for r in results.get("results", []) if isinstance(results, dict) else getattr(results, "results", []):
        item = {
            "url": r.get("url") if isinstance(r, dict) else getattr(r, "url", ""),
            "title": r.get("title") if isinstance(r, dict) else getattr(r, "title", ""),
            "author": r.get("author") if isinstance(r, dict) else getattr(r, "author", ""),
            "published_date": r.get("published_date") if isinstance(r, dict) else getattr(r, "published_date", ""),
            "domain": r.get("domain") if isinstance(r, dict) else getattr(r, "domain", ""),
            "score": r.get("score") if isinstance(r, dict) else getattr(r, "score", ""),
            "highlights": r.get("highlights") if isinstance(r, dict) else getattr(r, "highlights", None),
            "text": r.get("text") if isinstance(r, dict) else getattr(r, "text", None),
        }
        items.append(item)

    # Prepare payload for the results partial
    payload = {
        "request": request,
        "query": q,
        "results": items,
        "include_domains": include or [],
        "exclude_domains": exclude or [],
        "recency_days": recency_days,
    }
    return templates.TemplateResponse("partials/results.html", payload)


@app.post("/similar", response_class=HTMLResponse)
async def similar(request: Request, url: str = Form(...), q: str = Form("")):
    """Find pages similar to `url` and render a partial with the results."""
    try:
        # Use Exa's similarity search and fetch short snippets/highlights
        sim = exa.find_similar_and_contents(
            url,
            text=True,
            highlights={"highlights_per_url": 2, "num_sentences": 2, "query": q or "similar"},
            num_results=10,
            exclude_source_domain=True,
        )
    except Exception as e:
        return templates.TemplateResponse(
            "partials/error.html",
            {"request": request, "error": str(e)},
            status_code=500,
        )

    # Normalize similar results for templating
    items = []
    iterable = sim.get("results", []) if isinstance(sim, dict) else getattr(sim, "results", [])
    for r in iterable:
        items.append({
            "url": r.get("url") if isinstance(r, dict) else getattr(r, "url", ""),
            "title": r.get("title") if isinstance(r, dict) else getattr(r, "title", ""),
            "domain": r.get("domain") if isinstance(r, dict) else getattr(r, "domain", ""),
            "highlights": r.get("highlights") if isinstance(r, dict) else getattr(r, "highlights", None),
        })

    return templates.TemplateResponse("partials/similar.html", {"request": request, "url": url, "similar": items})


@app.post("/answer", response_class=HTMLResponse)
async def answer(request: Request, question: str = Form(...)):
    """Use Exa to answer a natural language `question`, including citations."""
    try:
        resp = exa.answer(question, text=True)
    except Exception as e:
        return templates.TemplateResponse(
            "partials/error.html",
            {"request": request, "error": str(e)},
            status_code=500,
        )

    # The Python SDK returns an AnswerResponse with `.answer` and `.citations`
    answer_text = getattr(resp, "answer", None) or (resp.get("answer") if isinstance(resp, dict) else None)
    citations = getattr(resp, "citations", None) or (resp.get("citations") if isinstance(resp, dict) else [])
    # Normalize citations for templating
    norm_citations = []
    for c in citations or []:
        norm_citations.append({
            "url": c.get("url") if isinstance(c, dict) else getattr(c, "url", ""),
            "title": c.get("title") if isinstance(c, dict) else getattr(c, "title", ""),
        })

    return templates.TemplateResponse(
        "partials/answer.html",
        {"request": request, "question": question, "answer": answer_text, "citations": norm_citations},
    )


@app.get("/health", response_class=JSONResponse)
async def health():
    """Lightweight health endpoint for readiness checks."""
    return {"ok": True}


@app.post("/query", response_class=HTMLResponse)
async def query(request: Request, q: str = Form(...)):
    """Combined endpoint: returns an answer and a result list for a single query.

    This merges the capabilities of /answer and /search into one response to
    support a single-search-box experience.
    """
    # Default containers
    answer_text = None
    norm_citations = []
    items = []

    # Fetch an answer with citations
    try:
        resp = exa.answer(q, text=True)
        answer_text = getattr(resp, "answer", None) or (resp.get("answer") if isinstance(resp, dict) else None)
        citations = getattr(resp, "citations", None) or (resp.get("citations") if isinstance(resp, dict) else [])
        for c in citations or []:
            norm_citations.append({
                "url": c.get("url") if isinstance(c, dict) else getattr(c, "url", ""),
                "title": c.get("title") if isinstance(c, dict) else getattr(c, "title", ""),
            })
    except Exception as e:
        # Non-fatal; we can still show search results
        norm_citations = []

    # Fetch search results with text and highlights
    try:
        results = exa.search_and_contents(
            q,
            text=True,
            highlights={"highlights_per_url": 2, "num_sentences": 2, "query": q},
            type="auto",
            num_results=10,
        )
        for r in results.get("results", []) if isinstance(results, dict) else getattr(results, "results", []):
            item = {
                "url": r.get("url") if isinstance(r, dict) else getattr(r, "url", ""),
                "title": r.get("title") if isinstance(r, dict) else getattr(r, "title", ""),
                "author": r.get("author") if isinstance(r, dict) else getattr(r, "author", ""),
                "published_date": r.get("published_date") if isinstance(r, dict) else getattr(r, "published_date", ""),
                "domain": r.get("domain") if isinstance(r, dict) else getattr(r, "domain", ""),
                "score": r.get("score") if isinstance(r, dict) else getattr(r, "score", ""),
                "highlights": r.get("highlights") if isinstance(r, dict) else getattr(r, "highlights", None),
                "text": r.get("text") if isinstance(r, dict) else getattr(r, "text", None),
            }
            items.append(item)
    except Exception:
        items = []

    # Render combined partial that includes answer + results sections
    return templates.TemplateResponse(
        "partials/combined.html",
        {
            "request": request,
            "question": q,
            "answer": answer_text,
            "citations": norm_citations,
            "query": q,
            "results": items,
            "include_domains": [],
            "exclude_domains": [],
            "recency_days": 0,
        },
    )
