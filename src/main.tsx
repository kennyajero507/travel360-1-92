
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize system health monitoring
import { useSystemHealth } from "./hooks/useSystemHealth";

const AppWithInitialization = () => {
  const { initializeSystem } = useSystemHealth();

  React.useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  return <App />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithInitialization />
  </React.StrictMode>,
);
