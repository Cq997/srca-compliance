import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ComprehensiveVisitForm from "./pages/forms/ComprehensiveVisitForm";
import EmergencyDeptForm from "./pages/forms/EmergencyDeptForm";
import BadgeProtectionForm from "./pages/forms/BadgeProtectionForm";
import UniformForm from "./pages/forms/UniformForm";
import SpotCheckForm from "./pages/forms/SpotCheckForm";
import VisitsList from "./pages/VisitsList";
import Correspondences from "./pages/Correspondences";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="forms/comprehensive" element={<ComprehensiveVisitForm />} />
        <Route path="forms/emergency" element={<EmergencyDeptForm />} />
        <Route path="forms/badge" element={<BadgeProtectionForm />} />
        <Route path="forms/uniform" element={<UniformForm />} />
        <Route path="forms/spotcheck" element={<SpotCheckForm />} />
        <Route path="visits" element={<VisitsList />} />
        <Route path="correspondences" element={<Correspondences />} />
      </Route>
    </Routes>
  );
}
