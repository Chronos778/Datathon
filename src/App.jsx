import { useCallback, useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import AnalyzePage from "./pages/AnalyzePage";
import DashboardPage from "./pages/DashboardPage";
import "./analysis.css";

const storageKey = "feedsense-analysis";

function currentPath() {
  return window.location.pathname === "/analyze" || window.location.pathname === "/dashboard"
    ? window.location.pathname
    : "/";
}

export default function App() {
  const [path, setPath] = useState(currentPath);
  const [analysis, setAnalysis] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey)) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handlePopState = () => setPath(currentPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const saveAnalysis = useCallback((response) => {
    setAnalysis(response);
    window.localStorage.setItem(storageKey, JSON.stringify(response));
  }, []);

  if (path === "/analyze") {
    return (
      <AnalyzePage
        onHome={() => navigate("/")}
        onComplete={saveAnalysis}
        onDashboard={() => navigate("/dashboard")}
      />
    );
  }

  if (path === "/dashboard") {
    return analysis ? (
      <DashboardPage
        analysis={analysis}
        onHome={() => navigate("/")}
        onUploadNew={() => navigate("/analyze")}
      />
    ) : (
      <AnalyzePage
        onHome={() => navigate("/")}
        onComplete={saveAnalysis}
        onDashboard={() => navigate("/dashboard")}
        missingAnalysis
      />
    );
  }

  return <LandingPage onAnalyze={() => navigate("/analyze")} />;
}
