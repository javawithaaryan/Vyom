import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FraudDetection from "./pages/FraudDetection";
import ScamAnalyzer from "./pages/ScamAnalyzer";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/fraud-detection"
          element={<FraudDetection />}
        />

        <Route
          path="/scam-analyzer"
          element={<ScamAnalyzer />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </>
  );
}

export default App;