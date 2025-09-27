// src/components/EmailsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get("emails/emails/");
      setEmails(res.data || []);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  // Group by thread_id
  const threadsMap = emails.reduce((acc, e) => {
    const tid = e.thread_id ?? "none";
    acc[tid] = acc[tid] || [];
    acc[tid].push(e);
    return acc;
  }, {});

  // For each thread, choose root email ID as earliest created_at
  const threadEntries = Object.entries(threadsMap).map(([threadId, arr]) => {
    const root = arr.reduce((a, b) => {
      if (!a.created_at) return b;
      if (!b.created_at) return a;
      return new Date(a.created_at) <= new Date(b.created_at) ? a : b;
    }, arr[0]);
    // show latest subject preview
    const latest = arr.reduce((a,b) => (new Date(a.created_at) >= new Date(b.created_at) ? a : b), arr[0]);
    return { threadId, rootEmailId: root?.email_id, count: arr.length, preview: latest?.subject || "(no subject)" };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Emails</h2>
        <div>
          <button onClick={fetchEmails} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
          <button onClick={() => navigate("/send")} className="ml-2 px-3 py-1 bg-green-600 text-white rounded">Compose</button>
        </div>
      </div>

      {loading ? (
        <p>Loading emails...</p>
      ) : threadEntries.length === 0 ? (
        <p>No emails yet.</p>
      ) : (
        <div className="space-y-4">
          {threadEntries.map(t => (
            <div key={t.threadId} className="p-4 bg-white border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-medium">{t.preview}</div>
                  <div className="text-sm text-gray-500">Thread #{t.threadId} • {t.count} messages</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => navigate(`/thread/${t.rootEmailId}`)} className="px-3 py-1 bg-purple-600 text-white rounded">View Thread</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
