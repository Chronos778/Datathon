import { useCallback, useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import AnalyzePage from "./pages/AnalyzePage";
import DashboardPage from "./pages/DashboardPage";
import FloatingChatWidget from "./components/ui/FloatingChatWidget";
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
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(response));
    } catch (storageError) {
      console.warn("Could not persist full analysis to localStorage (quota exceeded):", storageError);
      try {
        const lightweight = {
          ...response,
          feedback: (response.feedback || []).slice(0, 300),
        };
        window.localStorage.setItem(storageKey, JSON.stringify(lightweight));
      } catch {
        // Keep in React memory
      }
    }
  }, []);

  if (path === "/analyze") {
    return (
      <>
        <AnalyzePage
          onHome={() => navigate("/")}
          onComplete={saveAnalysis}
          onDashboard={() => navigate("/dashboard")}
        />
        <FloatingChatWidget analysis={analysis} onNavigate={navigate} />
      </>
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
      <>
        <AnalyzePage
          onHome={() => navigate("/")}
          onComplete={saveAnalysis}
          onDashboard={() => navigate("/dashboard")}
          missingAnalysis
        />
        <FloatingChatWidget analysis={analysis} onNavigate={navigate} />
      </>
    );
  }

  return (
    <>
      <LandingPage onAnalyze={() => navigate("/analyze")} />
      <FloatingChatWidget analysis={analysis} onNavigate={navigate} />
    </>
  );
}

