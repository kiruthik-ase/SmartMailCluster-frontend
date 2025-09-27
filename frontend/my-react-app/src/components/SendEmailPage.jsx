// src/components/SendEmailPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function SendEmailPage() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!sender || !receiver) {
      alert("Please fill sender and receiver.");
      return;
    }
    try {
      await api.post("emails/send/", { sender, receiver, subject, body });
      alert("Email sent!");
      navigate("/emails");
    } catch (err) {
      console.error("Send error:", err);
      alert("Failed to send email: " + (err?.message || ""));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Send New Email</h2>
      <div className="space-y-3 max-w-xl">
        <input className="w-full border p-2" placeholder="Sender (email)" value={sender} onChange={e=>setSender(e.target.value)} />
        <input className="w-full border p-2" placeholder="Receiver (email)" value={receiver} onChange={e=>setReceiver(e.target.value)} />
        <input className="w-full border p-2" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
        <textarea className="w-full border p-2" rows="6" placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} />
        <div>
          <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
