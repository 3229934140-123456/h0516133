import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Templates from "@/pages/Templates";
import TemplateDetail from "@/pages/TemplateDetail";
import ProjectDetail from "@/pages/ProjectDetail";
import Upload from "@/pages/Upload";
import Review from "@/pages/Review";
import Questions from "@/pages/Questions";
import Archive from "@/pages/Archive";
import Security from "@/pages/Security";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/:id" element={<TemplateDetail />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/upload" element={<Upload />} />
          <Route path="/project/:id/review" element={<Review />} />
          <Route path="/project/:id/questions" element={<Questions />} />
          <Route path="/project/:id/archive" element={<Archive />} />
          <Route path="/project/:id/security" element={<Security />} />
        </Route>
      </Routes>
    </Router>
  );
}
