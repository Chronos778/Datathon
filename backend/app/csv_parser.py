import csv
import io
from datetime import date

from fastapi import HTTPException, UploadFile

FEEDBACK_ALIASES = {
    "feedback",
    "feedback_text",
    "review",
    "reviews",
    "review_text",
    "comment",
    "comments",
    "text",
    "content",
    "body",
    "response",
    "message",
    "complaint",
    "description",
    "opinion",
    "user_feedback",
    "input",
    "statement",
}

DATE_ALIASES = {
    "date",
    "created_at",
    "timestamp",
    "time",
    "date_added",
    "datetime",
    "submitted_at",
    "entry_date",
}

SOURCE_ALIASES = {
    "source",
    "platform",
    "channel",
    "category",
    "department",
    "type",
    "origin",
    "domain",
}


def normalized_header(value: str) -> str:
    return "_".join(value.strip().lower().replace("-", "_").split())


async def read_feedback_csv(upload: UploadFile, max_bytes: int) -> list[dict[str, str]]:
    filename = upload.filename or "feedback.csv"
    if not (filename.lower().endswith(".csv") or filename.lower().endswith(".txt") or filename.lower().endswith(".tsv")):
        raise HTTPException(status_code=400, detail="Only CSV or TSV files are supported.")

    content = await upload.read(max_bytes + 1)
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail="The CSV exceeds the configured upload limit.")
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded CSV is empty.")

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text = content.decode("latin-1")
        except UnicodeDecodeError as error:
            raise HTTPException(status_code=400, detail="The CSV encoding is not supported.") from error

    try:
        dialect = csv.Sniffer().sniff(text[:4096], delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel

    reader = csv.DictReader(io.StringIO(text), dialect=dialect)
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="The CSV must include a header row.")

    normalized_map = {
        normalized_header(header): header
        for header in reader.fieldnames
        if header
    }

    # Find feedback column
    feedback_col = None
    for alias in FEEDBACK_ALIASES:
        if alias in normalized_map:
            feedback_col = normalized_map[alias]
            break

    # If not found by alias, check if any column contains "feed" or "review" or "comment" or "text"
    if not feedback_col:
        for norm, orig in normalized_map.items():
            if any(term in norm for term in ("feedback", "review", "comment", "text", "message", "desc")):
                feedback_col = orig
                break

    # Fallback to the longest text column or first non-date column
    if not feedback_col and reader.fieldnames:
        feedback_col = reader.fieldnames[0]

    date_col = next((normalized_map[alias] for alias in DATE_ALIASES if alias in normalized_map), None)
    source_col = next((normalized_map[alias] for alias in SOURCE_ALIASES if alias in normalized_map), None)

    records: list[dict[str, str]] = []
    today_str = date.today().isoformat()

    for raw_row in reader:
        feedback_val = (raw_row.get(feedback_col) or "").strip()
        if not feedback_val:
            continue

        row: dict[str, str] = {
            "feedback": feedback_val,
            "date": (raw_row.get(date_col) or "").strip() if date_col else today_str,
            "source": (raw_row.get(source_col) or "").strip() if source_col else "Uploaded Data",
        }

        # Preserve any pre-classified columns if they exist
        for key, value in raw_row.items():
            if not key:
                continue
            norm = normalized_header(key)
            if norm not in row and value is not None:
                row[norm] = str(value).strip()

        records.append(row)

    if not records:
        raise HTTPException(status_code=400, detail="The CSV contains no valid feedback rows.")
    return records

