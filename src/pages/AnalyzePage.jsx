import { useState } from "react";
import { ArrowLeft, ArrowRight, CircleAlert, Database, RotateCcw } from "lucide-react";
import AppBrand from "../components/AppBrand";
import AnalysisProgress from "../components/upload/AnalysisProgress";
import FilePreview from "../components/upload/FilePreview";
import UploadZone from "../components/upload/UploadZone";
import { sampleCsv } from "../data/mockData";
import { inspectCsv } from "../lib/csv";
import { analyzeFeedback, fetchSampleDataset, apiMode } from "../services/api";

export default function AnalyzePage({
  onHome,
  onComplete,
  onDashboard,
  missingAnalysis = false,
}) {
  const [file, setFile] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [phase, setPhase] = useState("upload");
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(
    missingAnalysis ? "Upload a dataset before opening the dashboard." : "",
  );
  const [result, setResult] = useState(null);

  async function selectFile(nextFile) {
    setError("");
    setInspection(null);

    const name = nextFile.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".tsv") && !name.endsWith(".txt")) {
      setFile(null);
      setError("Invalid file type. Choose a CSV file and try again.");
      return;
    }

    if (nextFile.size > 25 * 1024 * 1024) {
      setFile(null);
      setError("This file is larger than 25 MB. Choose a smaller CSV file.");
      return;
    }

    try {
      const nextInspection = await inspectCsv(nextFile);
      setFile(nextFile);
      setInspection(nextInspection);
    } catch (validationError) {
      setFile(null);
      setError(validationError.message);
    }
  }

  async function useSampleDataset() {
    try {
      const sampleResponse = await fetchSampleDataset();
      if (sampleResponse && sampleResponse.feedback && sampleResponse.feedback.length > 0) {
        setResult(sampleResponse);
        onComplete(sampleResponse);
        setPhase("complete");
        return;
      }
    } catch (e) {
      console.warn("Could not direct load sample dataset:", e);
    }
    const sample = new File([sampleCsv], "campus_feedback_demo.csv", { type: "text/csv" });
    selectFile(sample);
  }

  function removeFile() {
    setFile(null);
    setInspection(null);
    setError("");
  }

  async function startAnalysis() {
    if (!file || !inspection) return;
    setPhase("processing");
    setActiveStep(0);
    setError("");

    const progressTimer = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, 6));
    }, 700);

    try {
      const response = await analyzeFeedback(file, (step) => setActiveStep(step));
      window.clearInterval(progressTimer);
      setActiveStep(8);
      setResult(response);
      onComplete(response);
      window.setTimeout(() => setPhase("complete"), 350);
    } catch (analysisError) {
      window.clearInterval(progressTimer);
      setError(analysisError.message || "Analysis failed. Check the API and try again.");
      setPhase("error");
    }
  }

  return (
    <div className="analysis-page">
      <header className="workspace-header">
        <AppBrand onClick={onHome} />
        <button className="text-action" type="button" onClick={onHome}>
          <ArrowLeft size={15} /> Back to home
        </button>
      </header>

      <main className="analysis-main">
        {phase === "upload" && (
          <div className="upload-workspace">
            <div className="workspace-heading">
              <span className="section-label">Feedback analysis</span>
              <h1>Analyze your feedback</h1>
              <p>
                Upload your feedback dataset and turn thousands of responses into clear, visual
                intelligence.
              </p>
            </div>

            {error && (
              <div className="state-message error" role="alert">
                <CircleAlert size={18} />
                <div>
                  <strong>We could not use this dataset</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {!file ? (
              <>
                <UploadZone onFile={selectFile} />
                <div className="sample-row">
                  <span>Need a dataset for the demo?</span>
                  <button type="button" onClick={useSampleDataset}>
                    <Database size={15} /> Use sample dataset
                  </button>
                </div>
              </>
            ) : (
              <FilePreview file={file} inspection={inspection} onRemove={removeFile} />
            )}

            <div className="upload-footer">
              <div>
                <strong>Your file stays in this workflow</strong>
                <span>
                  {apiMode === "live"
                    ? "It will be sent to the configured analysis API."
                    : "Development mode uses a schema-compatible mock API response."}
                </span>
              </div>
              <button
                className="primary-button"
                type="button"
                disabled={!file || !inspection}
                onClick={startAnalysis}
              >
                Start analysis <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {phase === "processing" && <AnalysisProgress activeStep={activeStep} />}

        {phase === "complete" && result && (
          <div className="completion-state">
            <span className="completion-check">
              <span />
            </span>
            <span className="section-label">Analysis complete</span>
            <h1>{result.dataset.rows.toLocaleString()} feedback responses analyzed</h1>
            <p>
              The processed dataset is ready to explore. Every dashboard value is calculated from
              the returned feedback records.
            </p>
            <button className="primary-button" type="button" onClick={onDashboard}>
              View dashboard <ArrowRight size={16} />
            </button>
          </div>
        )}

        {phase === "error" && (
          <div className="completion-state error-state">
            <span className="error-icon">
              <CircleAlert size={26} />
            </span>
            <span className="section-label">Analysis interrupted</span>
            <h1>We could not complete this analysis</h1>
            <p>{error}</p>
            <button className="outline-button" type="button" onClick={() => setPhase("upload")}>
              <RotateCcw size={15} /> Try again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
