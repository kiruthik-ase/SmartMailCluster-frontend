import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

function ThreadPage() {
  const { id } = useParams();
  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`thread/${id}/`)
      .then(res => {
        setThread(res.data.emails);
        setLoading(false);
      })
      .catch(() => {
        setThread([]);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading thread...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Thread for Email {id}</h2>
      {thread.length === 0 ? (
        <p>No emails in this thread.</p>
      ) : (
        thread.map(email => (
          <div key={email.email_id} className="p-4 bg-white rounded-lg shadow-md mb-4">
            <p><strong>Email ID:</strong> {email.email_id}</p>
            <p><strong>From:</strong> {email.from}</p>
            <p><strong>To:</strong> {email.to}</p>
            <p><strong>Subject:</strong> {email.subject}</p>
            <p><strong>Body:</strong> {email.body}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ThreadPage;