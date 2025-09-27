// src/components/ReplyPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ReplyPage() {
  const { id } = useParams(); // parent email id
  const [parent, setParent] = useState(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParent = async () => {
      try {
        const res = await api.get("emails/emails/");
        const list = res.data || [];
        const p = list.find(e => String(e.email_id) === String(id));
        setParent(p || null);
      } catch (err) {
        console.error("Failed to fetch parent email:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, [id]);

  const handleSend = async () => {
    if (!parent) return alert("Parent email not loaded.");
    try {
      await api.post("emails/reply/", { parent_id: id, body });
      alert("Reply sent!");
      // redirect to thread: find a root email id for this thread (we'll find earliest email for parent.thread_id)
      const res = await api.get("emails/emails/");
      const list = res.data || [];
      const sameThread = list.filter(e => String(e.thread_id) === String(parent.thread_id));
      // choose earliest created_at
      sameThread.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
      const rootEmail = sameThread[0];
      if (rootEmail) navigate(`/thread/${rootEmail.email_id}`);
      else navigate("/emails");
    } catch (err) {
      console.error("Reply error:", err);
      alert("Failed to send reply.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!parent) return <p>Parent email not found.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Reply to: {parent.subject}</h2>
      <div className="mb-2 text-sm text-gray-600">From: {parent.sender} • To: {parent.receiver}</div>
      <textarea className="w-full border p-2 mb-3" rows="6" value={body} onChange={e=>setBody(e.target.value)} />
      <div>
        <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded">Send Reply</button>
        <button onClick={() => navigate(-1)} className="ml-2 px-4 py-2 bg-gray-200 rounded">Cancel</button>
      </div>
    </div>
  );
}
