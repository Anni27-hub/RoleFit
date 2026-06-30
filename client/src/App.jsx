import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Results from "./pages/Results.jsx";
import Auth from "./pages/Auth.jsx";
import History from "./pages/History.jsx";
import Premium from "./pages/Premium.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import CoverLetter from "./pages/CoverLetter.jsx";
import JobTracker from "./pages/JobTracker.jsx";
import InterviewPrep from "./pages/InterviewPrep.jsx";
import SkillRoadmap from "./pages/SkillRoadmap.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/cover-letter" element={<CoverLetter />} />
        <Route path="/job-tracker" element={<JobTracker />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/skill-roadmap" element={<SkillRoadmap />} />
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/premium"
          element={
            <ProtectedRoute>
              <Premium />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:id"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
