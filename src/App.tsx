import { Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/common';

// Pages
import DashboardPage from '@/pages/DashboardPage';
import OrganizationContextPage from '@/pages/OrganizationContextPage';
import IncidentDescriptionPage from '@/pages/IncidentDescriptionPage';
import ConnectorConfigPage from '@/pages/ConnectorConfigPage';
import InfrastructureValidationPage from '@/pages/InfrastructureValidationPage';
import TriageProcessPage from '@/pages/TriageProcessPage';
import TimelineViewPage from '@/pages/TimelineViewPage';
import VerificationWizardPage from '@/pages/VerificationWizardPage';
import ReportGenerationPage from '@/pages/ReportGenerationPage';

function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <Routes>
        {/* Dashboard / Home */}
        <Route path="/" element={<DashboardPage />} />

        {/* Workflow Steps */}
        <Route path="/context" element={<OrganizationContextPage />} />
        <Route path="/incident" element={<IncidentDescriptionPage />} />
        <Route path="/connectors" element={<ConnectorConfigPage />} />
        <Route path="/validation" element={<InfrastructureValidationPage />} />
        <Route path="/triage" element={<TriageProcessPage />} />
        <Route path="/timeline" element={<TimelineViewPage />} />
        <Route path="/verification" element={<VerificationWizardPage />} />
        <Route path="/report" element={<ReportGenerationPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TooltipProvider>
  );
}

export default App;
