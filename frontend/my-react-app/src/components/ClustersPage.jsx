// src/components/ClustersPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function ClustersPage() {
  const [clusters, setClusters] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await api.get("emails/emailcluster/");
        // backend returns either { clusters: [...] } or a dict; handle both
        const data = res.data;
        if (data?.clusters) {
          setClusters(data.clusters);
        } else {
          setClusters(data);
        }
      } catch (err) {
        console.error("Cluster fetch error:", err);
        setClusters({});
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, []);

  if (loading) return <p>Loading clusters...</p>;
  const entries = Array.isArray(clusters) ? clusters : Object.entries(clusters);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Clusters</h2>
      {entries.length === 0 ? <p>No clusters found.</p> : (
        <div className="space-y-4">
          {entries.map(([root, members]) => (
            <div key={root} className="p-3 bg-white border rounded">
              <div className="text-sm text-gray-600 mb-2">Cluster root: {root}</div>
              <ul className="list-disc pl-6">
                {members.map((mid) => (
                  <li key={mid}>
                    <Link to={`/thread/${mid}`} className="text-blue-600">Email {mid}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
