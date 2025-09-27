// src/components/ForwardPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ForwardPage() {
  const { id } = useParams(); // email to forward
  const [recipient, setRecipient] = useState("");
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParent = async () => {
      try {
        const res = await api.get("emails/emails/");
        const p = (res.data || []).find(e => String(e.email_id) === String(id));
        setParent(p || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, [id]);

  const handleForward = async () => {
    if (!recipient) return alert("Enter recipient email.");
    try {
      await api.post("emails/forward/", { email_id: id, forward_to: recipient });
      alert("Forward sent!");
      navigate("/emails");
    } catch (err) {
      console.error("Forward error:", err);
      alert("Failed to forward email.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!parent) return <p>Email not found.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Forward: {parent.subject}</h2>
      <div className="mb-3 text-sm text-gray-600">Original: {parent.sender} → {parent.receiver}</div>
      <input className="w-full border p-2 mb-3" placeholder="Recipient email" value={recipient} onChange={e=>setRecipient(e.target.value)} />
      <div>
        <button onClick={handleForward} className="px-4 py-2 bg-green-600 text-white rounded">Send Forward</button>
        <button onClick={() => navigate(-1)} className="ml-2 px-4 py-2 bg-gray-200 rounded">Cancel</button>
      </div>
    </div>
  );
}
