import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AdminDashboard from './pages/Admin';
import Dashboard from './pages/Dashboard';
import AgentConsole from './pages/Agent';
import { Toaster } from '@/components/ui/sonner';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agent" element={<AgentConsole />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
