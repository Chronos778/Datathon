# FeedSense backend

The API accepts a CSV upload, validates the required `feedback` column, and returns the schema used
by the dashboard. Existing transformed fields are preserved. Missing classifications are filled by
a lightweight local demo analyzer so the full application runs without external credentials.

This analyzer is suitable for local demos and integration development. Replace `app/analyzer.py`
with the production ML pipeline when it is available.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Windows PowerShell activation:

```powershell
.venv\Scripts\Activate.ps1
```

API documentation is available at `http://localhost:8000/docs`.

## Test

```bash
python -m unittest discover -s tests
```
