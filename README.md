# FeedSense Feedback Intelligence

Complete local full-stack source for the FeedSense CSV upload and analytics experience.

- `src/`: React and Vite frontend
- `backend/`: FastAPI CSV analysis service
- `backend/tests/fixtures/sample.csv`: ready-to-upload example

The backend preserves transformed classification fields when they are present in the CSV. For a
raw CSV, its local demo analyzer fills the dashboard schema without external credentials. Replace
`backend/app/analyzer.py` with the production ML pipeline when available.

## Requirements

- Node.js 18 or newer
- Python 3.10 or newer

## 1. Start the backend

macOS or Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The health endpoint is `http://localhost:8000/health`; interactive API documentation is at
`http://localhost:8000/docs`.

## 2. Start the frontend

Open a second terminal in the project root:

macOS or Linux:

```bash
cp .env.example .env
npm install
npm run dev
```

Windows:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Open the URL printed by Vite, then upload a CSV containing a `feedback` column. `date` and `source`
are optional. Without `VITE_API_URL`, the frontend falls back to its built-in mock response.

## Quality checks

```bash
npm run lint
npm run build
cd backend
python -m unittest discover -s tests
```
