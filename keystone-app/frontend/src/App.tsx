import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { PolicyPage } from './pages/PolicyPage'
import { FinancePage } from './pages/FinancePage'
import { O2CPage } from './pages/O2CPage'
import { P2PPage } from './pages/P2PPage'
import { InventoryPage } from './pages/InventoryPage'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { AgentPage } from './pages/AgentPage'
import { PipelinePage } from './pages/PipelinePage'
import { DbtWizardPage } from './pages/DbtWizardPage'
import { DpoScenarioPage } from './pages/DpoScenarioPage'
import { WizardLivePage } from './pages/WizardLivePage'
import { DpoOutcomePage } from './pages/DpoOutcomePage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/o2c" element={<O2CPage />} />
        <Route path="/p2p" element={<P2PPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/dbt-wizard" element={<DbtWizardPage />} />
        <Route path="/dbt-wizard/scenario" element={<DpoScenarioPage />} />
        <Route path="/dbt-wizard/live" element={<WizardLivePage />} />
        <Route path="/dbt-wizard/outcome" element={<DpoOutcomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
