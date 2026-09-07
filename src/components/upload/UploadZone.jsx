import { FileSpreadsheet, UploadCloud } from "lucide-react";

export default function UploadZone({ onFile, disabled }) {
  function receiveFiles(files) {
    const [file] = files;
    if (file) onFile(file);
  }

  return (
    <label
      className={`upload-zone${disabled ? " disabled" : ""}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled) receiveFiles(event.dataTransfer.files);
      }}
    >
      <input
        type="file"
        accept=".csv,text/csv"
        disabled={disabled}
        onChange={(event) => receiveFiles(event.target.files)}
      />
      <span className="upload-icon">
        <UploadCloud size={28} />
      </span>
      <strong>Drop your CSV here, or browse</strong>
      <span>One file up to 10 MB</span>
      <small>
        <FileSpreadsheet size={14} /> CSV files only
      </small>
    </label>
  );
}
