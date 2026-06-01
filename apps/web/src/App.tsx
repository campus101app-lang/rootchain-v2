import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/Landing";
import { SignupInvestorPage } from "./pages/SignupInvestor";
import { SignupFarmerPage } from "./pages/SignupFarmer";
import { LoginPage } from "./pages/Login";
import { WalletSetupPage } from "./pages/WalletSetup";
import { DashboardPage } from "./pages/Dashboard";
import { MarketplacePage } from "./pages/Marketplace";
import { ProjectDetailPage } from "./pages/ProjectDetail";
import { CreateProjectPage } from "./pages/CreateProject";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/signup/investor" element={<SignupInvestorPage />} />
      <Route path="/signup/farmer" element={<SignupFarmerPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/wallet/setup" element={<WalletSetupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/farmer/projects/new" element={<CreateProjectPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
