import { useState } from 'react';
import api from '../api/api';

function ClustersPage() {
  const [clusters, setClusters] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchClusters = () => {
    setLoading(true);
    api.get('emails/emailcluster/')
      .then(res => {
        setClusters(res.data.clusters);
        setLoading(false);
      })
      .catch(() => {
        setClusters({});
        setLoading(false);
      });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Email Clusters</h2>
      <button onClick={fetchClusters} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={loading}>
        {loading ? 'Loading...' : 'Load Clusters'}
      </button>
      {Object.keys(clusters).length === 0 ? (
        <p>No clusters loaded or available.</p>
      ) : (
        Object.entries(clusters).map(([root, members]) => (
          <div key={root} className="p-4 bg-white rounded-lg shadow-md mb-4">
            <h3 className="font-semibold">Cluster Root: {root}</h3>
            <ul className="list-disc pl-4">
              {members.map(id => (
                <li key={id}>Email ID: {id}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default ClustersPage;