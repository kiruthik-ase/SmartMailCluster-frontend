// src/components/EmailsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmailsPage = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch("http://localhost:8000/emails/emails/");
        const data = await res.json();
        setEmails(data);
      } catch (err) {
        console.error("Error fetching emails:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []);

  if (loading) return <p className="p-4">Loading emails...</p>;

  // Group emails by thread_id
  const threads = {};
  emails.forEach((email) => {
    if (!threads[email.thread_id]) {
      threads[email.thread_id] = [];
    }
    threads[email.thread_id].push(email);
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📧 Email Clusters</h1>

      {Object.keys(threads).map((threadId) => (
        <div key={threadId} className="mb-6 p-4 border rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">
            Thread #{threadId} ({threads[threadId].length} emails)
          </h2>
          <ul className="space-y-2">
            {threads[threadId].map((email) => (
              <li
                key={email.email_id}
                className="p-2 border-b last:border-none"
              >
                <p className="font-medium">{email.subject}</p>
                <p className="text-sm text-gray-600">
                  {email.sender} → {email.receiver}
                </p>
              </li>
            ))}
          </ul>
          <button
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate(`/thread/${threadId}`)}
          >
            View Thread
          </button>
        </div>
      ))}
    </div>
  );
};

export default EmailsPage;
