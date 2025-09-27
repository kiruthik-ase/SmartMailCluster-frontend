// src/components/ThreadPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ThreadPage() {
  const { id } = useParams(); // root email id
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThread = async () => {
      setLoading(true);
      try {
        const res = await api.get(`emails/thread/${id}/`);
        // backend may return either array directly or { emails: [...] }
        const data = res.data;
        const emails = Array.isArray(data) ? data : (data.emails ?? data);
        setMsgs(emails || []);
      } catch (err) {
        console.error("Thread fetch error:", err);
        setMsgs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [id]);

  if (loading) return <p>Loading thread...</p>;
  if (msgs.length === 0) return <p>No messages in this thread.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Thread</h2>
        <button onClick={() => navigate("/emails")} className="px-3 py-1 bg-gray-200 rounded">Back</button>
      </div>

      <div className="space-y-4">
        {msgs.map((m) => (
          <div key={m.email_id} className="p-4 bg-white border rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{m.subject || "(no subject)"}</div>
                <div className="text-sm text-gray-500">{m.sender} → {m.receiver} • {m.created_at ? new Date(m.created_at).toLocaleString() : ""}</div>
              </div>
              <div className="space-x-2">
                <button onClick={() => navigate(`/reply/${m.email_id}`)} className="px-3 py-1 bg-blue-600 text-white rounded">Reply</button>
                <button onClick={() => navigate(`/forward/${m.email_id}`)} className="px-3 py-1 bg-green-600 text-white rounded">Forward</button>
              </div>
            </div>
            <div className="mt-3 text-gray-800">{m.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
