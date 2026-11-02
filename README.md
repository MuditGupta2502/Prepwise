# Prepwise

An interview-preparation learning platform for self-paced study, practice questions, quizzes, and study guides. It does not run mock interviews or video lessons. The backend is Python + FastAPI + LangGraph; Node.js is not required to run the app.

## Run locally on Windows

Requirements: Python 3.11 or newer.

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Add your Gemini key to `.env`, then start FastAPI:

```powershell
python -m uvicorn server:app --reload --port 8001
```

Open <http://localhost:8001>. Stop the server with **Ctrl+C**. You can also start it using `python server.py`.

## AI provider

Set `GEMINI_API_KEY` in `.env` to use Gemini Flash. The default provider is Gemini when a key is present. You can set `AI_PROVIDER=gemini`, `AI_PROVIDER=openai`, `AI_PROVIDER=ollama`, or `AI_PROVIDER=demo` to choose a provider. For Ollama, install and run a local model, then set `OLLAMA_MODEL` and keep the Ollama service running.

The tutor answers questions across the software interview-preparation domains, including DSA, competitive programming, low-level and high-level design, computer science fundamentals, and AI engineering. Course notes support answers but do not restrict the tutor to exact lesson titles. Unrelated subjects are declined.

## Optional vector search

Set `DATABASE_URL` and a Gemini or OpenAI API key in `.env`. Start PostgreSQL with pgvector:

```powershell
docker compose up -d
python scripts/ingest.py
```

The tutor combines keyword and vector retrieval. If PostgreSQL is unavailable, it continues using keyword retrieval over the curriculum. Re-run `python scripts/ingest.py` after changing course content. Re-embed the complete corpus when changing embedding providers because vector spaces are not interchangeable.

## Free hosting: Netlify UI + Koyeb FastAPI

Netlify deploys the static UI from `netlify.toml`; Koyeb runs the Python FastAPI/LangGraph backend from the root `Dockerfile`. Netlify Functions do not provide a Python FastAPI runtime, so the API runs as a separate service. Koyeb documents one free web service per organization (512 MB RAM, 0.1 vCPU, 2 GB SSD); it says the free service will not incur charges. Netlify Free currently includes 300 monthly credits and automatically pauses sites at the hard limit instead of charging overages. Keep both services on their free plans.

1. In Koyeb, create a service from this public GitHub repository using the Dockerfile. Choose the **Free** instance, set `GEMINI_API_KEY` as a secret, and set `AI_PROVIDER=gemini`. Do not add a database; keyword retrieval is the fallback. Copy the resulting public service URL.
2. In Netlify, import the same GitHub repository. It reads `netlify.toml` for the build and publish settings. Set the environment variable `PREPWISE_API_BASE` to the Koyeb URL (for example, `https://your-api.koyeb.app`) and deploy.
3. After setting or changing `PREPWISE_API_BASE`, trigger a new Netlify deploy so `api-config.js` is generated with the API URL.

The Koyeb free instance is small and intended for hobby/testing workloads; performance can be limited. Netlify's free plan pauses projects after its monthly credits are exhausted. See the providers' current limits before increasing traffic.

## Project content

- `content/curriculum.json` is the source of truth for 37 lessons across five tracks.
- `content/corpus.py` builds the tutor and vector-index documents from those lessons.
- `ai/tutor.py` contains the LangGraph retrieval and answer workflow.
- `server.py` provides the FastAPI endpoints and serves the frontend.
- `vendor/` contains browser-side Markdown, sanitization, and math-rendering libraries; these do not require Node.js at runtime.

## Prototype boundaries

Progress and quiz results are stored in browser local storage and are not synced between devices. Authentication, multi-user storage, code execution, production rate limiting, and reviewed/licensed external question banks are not included. The coding exercise is guided practice and does not run submitted code.
