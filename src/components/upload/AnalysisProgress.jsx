import { Check, Circle, LoaderCircle } from "lucide-react";

const steps = [
  "Dataset uploaded",
  "Dataset validated",
  "Feedback processed",
  "Sentiment analysis",
  "Topic extraction",
  "Keyword extraction",
  "Emotion analysis",
  "Aspect analysis",
];

export default function AnalysisProgress({ activeStep, error }) {
  return (
    <div className="analysis-progress">
      <div className="processing-visual" aria-hidden="true">
        <span className="processing-ring ring-one" />
        <span className="processing-ring ring-two" />
        <span className="processing-core">
          <LoaderCircle size={26} />
        </span>
      </div>
      <div className="progress-copy">
        <span className="section-label">Processing dataset</span>
        <h1>Analyzing every response</h1>
        <p>
          FeedSense is preparing the processed fields returned by the analysis service. Keep this
          page open while the dataset is processed.
        </p>
        <div className="processing-steps">
          {steps.map((step, index) => {
            const complete = index < activeStep;
            const active = index === activeStep && !error;
            return (
              <div className={active ? "active" : complete ? "complete" : ""} key={step}>
                <span>
                  {complete ? (
                    <Check size={15} />
                  ) : active ? (
                    <LoaderCircle className="spin" size={15} />
                  ) : (
                    <Circle size={13} />
                  )}
                </span>
                {step}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
