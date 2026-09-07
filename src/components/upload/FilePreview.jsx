import { CheckCircle2, FileSpreadsheet, Trash2 } from "lucide-react";
import { formatFileSize } from "../../lib/csv";

function detectedName(header) {
  return header.trim().toLowerCase().replaceAll(" ", "_");
}

export default function FilePreview({ file, inspection, onRemove }) {
  return (
    <section className="file-preview" aria-label="Dataset preview">
      <div className="file-summary">
        <span className="file-summary-icon">
          <FileSpreadsheet size={22} />
        </span>
        <div>
          <strong>{file.name}</strong>
          <span>
            {formatFileSize(file.size)} · {inspection.rowCount.toLocaleString()} responses ·{" "}
            {inspection.headers.length} columns
          </span>
        </div>
        <span className="valid-file">
          <CheckCircle2 size={15} /> Ready
        </span>
        <button className="icon-control" type="button" onClick={onRemove} aria-label="Remove file">
          <Trash2 size={17} />
        </button>
      </div>

      <div className="detected-fields">
        <div>
          <span className="section-label">Detected fields</span>
          <p>FeedSense will send these columns to the analysis service.</p>
        </div>
        <div className="field-map">
          {inspection.headers.slice(0, 8).map((header) => (
            <span key={header}>
              {header} <strong>→ {detectedName(header)}</strong>
            </span>
          ))}
        </div>
      </div>

      <div className="preview-table-wrap">
        <table className="preview-table">
          <thead>
            <tr>
              {inspection.headers.slice(0, 5).map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inspection.previewRows.slice(0, 3).map((row, index) => (
              <tr key={`${file.name}-${index}`}>
                {inspection.headers.slice(0, 5).map((header) => (
                  <td key={header}>{row[header] || "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
