# FeedSense

**Turn feedback into clear, evidence-backed decisions.** FeedSense analyzes feedback from CSV files and presents sentiment, topics, trends, and searchable user comments in one dashboard. Ask questions about the uploaded dataset with the Gemini-powered Feedback Copilot.

## Features

- Upload and analyze CSV feedback files.
- Explore sentiment, emotions, topics, keywords, and representative comments.
- Filter and search feedback, then export the selected records.
- Ask natural-language questions with Gemini; answers are grounded in the analyzed dataset.
- Load the included college feedback sample to explore the dashboard.

## Project structure

```text
src/        React and Vite frontend
backend/    FastAPI analysis and Gemini chat API
public/     Static frontend assets and sample CSV
```

## Requirements

- Node.js 18 or newer
- Python 3.10 or newer

## Run locally

### 1. Configure environment

From the project root, copy the example environment file:

```bash
cp .env.example .env
```

In PowerShell:

```powershell
Copy-Item .env.example .env
```

Set `GEMINI_API_KEY` in `.env` to an active Google Gemini API key. The default model is `gemini-2.5-flash`. The backend also reads `backend/.env`; if both files define the key, `backend/.env` takes precedence.

### 2. Install and start the backend

In a terminal:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment, then install the dependencies and run FastAPI:

macOS or Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Install and start the frontend

In a second terminal, from the project root:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The frontend uses `http://localhost:8000` for the API by default; set `VITE_API_URL` in `.env` if your backend runs elsewhere.

## Use the dashboard

Upload a CSV with a `feedback` column. `date` and `source` columns are optional. The upload limit is 10 MB. You can also choose **Use sample dataset** to try the dashboard without preparing a file.

When the analysis API is unavailable, CSV analysis can run in the browser. **Chat answers require Gemini**: the Copilot will show an error if Gemini is unconfigured or unavailable; it does not substitute a local answer. Chat requests send the question, summary statistics, and up to the first 100 feedback records to the Gemini API for context.

## API endpoints

The backend provides interactive API documentation at `http://localhost:8000/docs`.

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Check backend health |
| `POST /api/preprocess` | Clean and validate an upload |
| `POST /api/analyze` | Analyze an uploaded feedback file |
| `GET /api/sample` | Load the bundled sample dataset |
| `POST /api/chat` | Answer a dataset question with Gemini |
| `POST /api/decision` | Evaluate one analyzed feedback record |
| `POST /api/insights` | Generate dataset-level insights |

## Deployment

The repository includes a Vercel configuration for the frontend and a Render configuration for the backend. Set `VITE_API_URL` to the deployed backend URL and configure `GEMINI_API_KEY` in the backend environment. See `vercel.json` and `render.yaml` for the deployment settings.
