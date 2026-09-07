"""HTTP and Python entry points for the preprocessing foundation."""

from __future__ import annotations

import json
from pathlib import Path
from tempfile import NamedTemporaryFile
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.preprocessing import (
	export_cleaned_dataset as write_cleaned_dataset,
	export_preprocessing_report,
	export_rejected_dataset,
	DatasetInputError,
	clean_dataset,
)
from app.nlp import analyze_dataset, export_analyzed_dataset
from app.decision.graph import run_decision
from app.decision.schemas import AnalyzedFeedback, DecisionResponse
from app.insights.node import generate_dataset_insights
from app.insights.schemas import DatasetInsights

app = FastAPI(title="FeedbackIQ Preprocessing API", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


class InsightsRequest(BaseModel):
    records: list[dict] = Field(default_factory=list)
    domain: str | None = None


@app.get("/")
def root() -> dict[str, str]:
	return {
		"service": "feedbackiq-preprocessing",
		"status": "ok",
		"docs": "/docs",
		"health": "/health",
	}


@app.get("/health")
def health() -> dict[str, str]:
	return {"status": "ok", "service": "feedbackiq-preprocessing"}


@app.post("/api/preprocess")
async def preprocess(
	file: UploadFile = File(...),
	include_cleaned_data: bool = False,
	include_rejected_data: bool = False,
	export_cleaned_data: bool = False,
) -> dict:
	"""Clean a CSV/XLSX upload and optionally return its processed rows."""
	suffix = Path(file.filename or "").suffix.casefold()
	if suffix not in {".csv", ".xlsx", ".xlsm"}:
		raise HTTPException(status_code=400, detail="Only CSV, XLSX, and XLSM files are supported.")

	content = await file.read()
	temporary_file = NamedTemporaryFile(suffix=suffix, delete=False)
	temporary_path = Path(temporary_file.name)
	try:
		temporary_file.write(content)
		temporary_file.close()
		result = clean_dataset(temporary_path)
	except DatasetInputError as error:
		raise HTTPException(status_code=400, detail=str(error)) from error
	finally:
		temporary_path.unlink(missing_ok=True)

	response = {
		"file_name": file.filename,
		"report": result["report"],
		"column_mapping": result["column_mapping"],
	}
	if include_cleaned_data:
		response["cleaned_data"] = json.loads(
			result["clean_data"].to_json(orient="records", date_format="iso")
		)
	if include_rejected_data:
		response["rejected_data"] = json.loads(
			result["rejected_data"].to_json(orient="records", date_format="iso")
		)
	if export_cleaned_data:
		output_directory = Path("outputs")
		file_token = uuid4().hex
		cleaned_path = write_cleaned_dataset(
			result["clean_data"], output_directory / f"cleaned_dataset_{file_token}.csv"
		)
		rejected_path = export_rejected_dataset(
			result["rejected_data"], output_directory / f"rejected_dataset_{file_token}.csv"
		)
		report_path = export_preprocessing_report(
			result["report"], output_directory / f"preprocessing_report_{file_token}.json"
		)
		response["export"] = {
			"cleaned_file": cleaned_path.as_posix(),
			"rejected_file": rejected_path.as_posix(),
			"report_file": report_path.as_posix(),
		}
	return response


def _parse_record_json_fields(records: list[dict]) -> list[dict]:
	"""Ensure topics, keywords, and aspect_sentiments are native Python lists/dicts."""
	for r in records:
		for key in ("topics", "keywords", "aspect_sentiments"):
			val = r.get(key)
			if isinstance(val, str) and val.strip().startswith(("[", "{")):
				try:
					r[key] = json.loads(val)
				except Exception:
					pass
		# Ensure feedback field is present (aliasing cleaned_text or text)
		if "feedback" not in r and "cleaned_text" in r:
			r["feedback"] = r["cleaned_text"]
	return records


@app.post("/api/analyze")
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)) -> dict:
	"""Preprocess an upload and return domain-agnostic NLP enrichment."""
	suffix = Path(file.filename or "").suffix.casefold()
	if suffix not in {".csv", ".xlsx", ".xlsm"}:
		raise HTTPException(status_code=400, detail="Only CSV, XLSX, and XLSM files are supported.")
	content = await file.read()
	temporary_file = NamedTemporaryFile(suffix=suffix, delete=False)
	temporary_path = Path(temporary_file.name)
	try:
		temporary_file.write(content)
		temporary_file.close()
		result = clean_dataset(temporary_path)
		analyzed = analyze_dataset(result["clean_data"])
		file_token = uuid4().hex
		Path("outputs").mkdir(exist_ok=True)
		analyzed_path = export_analyzed_dataset(analyzed, f"outputs/analyzed_dataset_{file_token}.csv")
	except (DatasetInputError, ValueError) as error:
		raise HTTPException(status_code=400, detail=str(error)) from error
	finally:
		temporary_path.unlink(missing_ok=True)

	raw_records = json.loads(analyzed.to_json(orient="records", date_format="iso"))
	cleaned_records = _parse_record_json_fields(raw_records)

	# Calculate summary metrics
	pos = sum(1 for r in cleaned_records if str(r.get("sentiment")).lower() == "positive")
	neg = sum(1 for r in cleaned_records if str(r.get("sentiment")).lower() == "negative")
	mix = sum(1 for r in cleaned_records if str(r.get("sentiment")).lower() in ("mixed", "neutral"))
	total = len(cleaned_records)

	return {
		"file_name": file.filename,
		"rows_analyzed": total,
		"analyzed_file": analyzed_path,
		"data": cleaned_records,
		"feedback": cleaned_records,
		"dataset": {
			"name": file.filename,
			"rows": total,
		},
		"summary": {
			"total": total,
			"positive": pos,
			"negative": neg,
			"mixed": mix,
			"net_sentiment_score": round(((pos - neg) / total) * 100) if total else 0,
		},
	}


@app.get("/api/sample")
def get_sample_dataset() -> dict:
	"""Return the pre-analyzed college dataset with decision metrics if available."""
	sample_csv = Path("outputs/decision_dataset.csv")
	if sample_csv.exists():
		import pandas as pd
		df = pd.read_csv(sample_csv)
		records = _parse_record_json_fields(json.loads(df.to_json(orient="records", date_format="iso")))
		pos = sum(1 for r in records if str(r.get("sentiment")).lower() == "positive")
		neg = sum(1 for r in records if str(r.get("sentiment")).lower() == "negative")
		mix = sum(1 for r in records if str(r.get("sentiment")).lower() in ("mixed", "neutral"))
		total = len(records)
		return {
			"file_name": "college_feedback_1200.csv",
			"rows_analyzed": total,
			"data": records,
			"feedback": records,
			"dataset": {
				"name": "College Campus Feedback (1,200 verified records)",
				"rows": total,
			},
			"summary": {
				"total": total,
				"positive": pos,
				"negative": neg,
				"mixed": mix,
				"net_sentiment_score": round(((pos - neg) / total) * 100) if total else 0,
			},
		}
	raise HTTPException(status_code=404, detail="Sample dataset not found.")


@app.post("/api/decision", response_model=DecisionResponse)
async def decision(record: AnalyzedFeedback) -> dict:
	"""Run the decision layer on one already-analyzed feedback record."""
	return run_decision(record.model_dump(exclude_none=True))


@app.post("/api/insights", response_model=DatasetInsights)
async def insights(request: InsightsRequest) -> DatasetInsights:
	"""Generate dataset-level insights from analyzed or decision-enriched records."""
	if not request.records:
		raise HTTPException(status_code=400, detail="At least one record is required.")
	return generate_dataset_insights(request.records, domain=request.domain)


__all__ = ["app", "clean_dataset"]
