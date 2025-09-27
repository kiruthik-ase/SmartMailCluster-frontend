// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const selected = (path) => (location.pathname.startsWith(path) ? "bg-blue-700 text-white" : "hover:bg-gray-100");

  return (
    <aside className="w-56 bg-white border-r p-4">
      <h1 className="text-xl font-bold mb-6">📧 SmartMailCluster</h1>
      <nav className="flex flex-col gap-2">
        <Link to="/emails" className={`p-2 rounded ${selected("/emails")}`}>Emails</Link>
        <Link to="/send" className={`p-2 rounded ${selected("/send")}`}>Send Email</Link>
        <Link to="/clusters" className={`p-2 rounded ${selected("/clusters")}`}>Clusters</Link>
      </nav>
    </aside>
  );
}
