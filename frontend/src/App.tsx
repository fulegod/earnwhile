import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import CreateOrder from './pages/CreateOrder'
import AgentFeed from './pages/AgentFeed'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<Dashboard />} />
      <Route path="/app/create" element={<CreateOrder />} />
      <Route path="/app/agent" element={<AgentFeed />} />
    </Routes>
  )
}
