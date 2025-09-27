// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import EmailsPage from "./components/EmailsPage";
import SendEmailPage from "./components/SendEmailPage";
import ThreadPage from "./components/ThreadPage";
import ReplyPage from "./components/ReplyPage";
import ForwardPage from "./components/ForwardPage";
import ClustersPage from "./components/ClustersPage";

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/emails" replace />} />
            <Route path="/emails" element={<EmailsPage />} />
            <Route path="/send" element={<SendEmailPage />} />
            <Route path="/thread/:id" element={<ThreadPage />} />
            <Route path="/reply/:id" element={<ReplyPage />} />
            <Route path="/forward/:id" element={<ForwardPage />} />
            <Route path="/clusters" element={<ClustersPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
