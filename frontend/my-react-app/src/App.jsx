import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EmailsPage from './pages/EmailsPage';
import SendEmailPage from './pages/SendEmailPage';
import ReplyPage from './pages/ReplyPage';
import ForwardPage from './pages/ForwardPage';
import ThreadPage from './pages/ThreadPage';
import ClustersPage from './pages/ClustersPage';
import GraphPage from './pages/GraphPage';

function App() {
  return (
    <Router>
      <div>
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">SmartMailCluster</h1>
          <nav className="mt-2 space-x-4">
            <Link to="/emails" className="hover:underline">Emails</Link>
            <Link to="/send" className="hover:underline">Send Email</Link>
            <Link to="/clusters" className="hover:underline">Clusters</Link>
            <Link to="/graph" className="hover:underline">Graph</Link>
          </nav>
        </header>
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<div><h2>Welcome to SmartMailCluster</h2><p>Click a nav link above to start.</p></div>} />
            <Route path="/emails" element={<EmailsPage />} />
            <Route path="/send" element={<SendEmailPage />} />
            <Route path="/reply/:id" element={<ReplyPage />} />
            <Route path="/forward/:id" element={<ForwardPage />} />
            <Route path="/thread/:id" element={<ThreadPage />} />
            <Route path="/clusters" element={<ClustersPage />} />
            <Route path="/graph" element={<GraphPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;