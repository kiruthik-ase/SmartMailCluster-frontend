// src/components/ThreadPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ThreadPage = () => {
  const { id } = useParams();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const res = await fetch(`http://localhost:8000/emails/thread/${id}/`);
        const data = await res.json();
        setEmails(data);
      } catch (err) {
        console.error("Error fetching thread:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [id]);

  const handleReply = async (emailId) => {
    const replyBody = prompt("Enter your reply:");
    if (!replyBody) return;

    try {
      await fetch("http://localhost:8000/emails/reply/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: emailId, body: replyBody }),
      });
      alert("Reply sent!");
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };

  const handleForward = async (emailId) => {
    const forwardTo = prompt("Enter recipient email:");
    if (!forwardTo) return;

    try {
      await fetch("http://localhost:8000/emails/forward/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_id: emailId, forward_to: forwardTo }),
      });
      alert("Email forwarded!");
    } catch (err) {
      console.error("Error forwarding email:", err);
    }
  };

  if (loading) return <p className="p-4">Loading thread...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📂 Thread #{id}</h1>
      {emails.map((email) => (
        <div
          key={email.email_id}
          className="mb-4 p-4 border rounded-lg shadow-sm"
        >
          <h2 className="font-semibold">{email.subject}</h2>
          <p className="text-sm text-gray-600">
            {email.sender} → {email.receiver}
          </p>
          <p className="mt-2">{email.body}</p>
          <div className="mt-3 space-x-2">
            <button
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => handleReply(email.email_id)}
            >
              Reply
            </button>
            <button
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => handleForward(email.email_id)}
            >
              Forward
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreadPage;
