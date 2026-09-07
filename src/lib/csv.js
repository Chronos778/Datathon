export function parseCsv(text, limit) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
      if (limit && rows.length >= limit) break;
    } else {
      value += character;
    }
  }

  if (value || row.length) {
    row.push(value.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  const [headers = [], ...body] = rows;
  return {
    headers,
    rows: body.map((cells) =>
      Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])),
    ),
  };
}

export async function inspectCsv(file) {
  const text = await file.text();
  const parsed = parseCsv(text);
  const normalizedHeaders = parsed.headers.map((header) =>
    header.trim().toLowerCase().replace(/[-_ ]+/g, "_")
  );

  if (!parsed.headers.length) throw new Error("The CSV does not contain a header row.");

  const feedbackKeywords = [
    "feedback", "review", "comment", "text", "content", "body",
    "response", "message", "complaint", "description", "opinion", "user_feedback"
  ];
  const hasFeedbackColumn = normalizedHeaders.some((header) =>
    feedbackKeywords.some((keyword) => header.includes(keyword))
  ) || parsed.headers.length >= 1;

  if (!hasFeedbackColumn) {
    throw new Error('Could not find a feedback or text column in this CSV.');
  }
  if (!parsed.rows.length) throw new Error("The CSV does not contain any feedback rows.");

  return {
    headers: parsed.headers,
    rows: parsed.rows,
    previewRows: parsed.rows.slice(0, 5),
    rowCount: parsed.rows.length,
  };
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
