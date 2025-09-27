import React, { useEffect, useState } from "react";
import api from "../api/api";

function EmailNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1 ? false : false); // collapsed by default
  return (
    <div style={{ marginLeft: depth * 16 + "px", borderLeft: depth ? "1px solid #e5e7eb" : "none", paddingLeft: depth ? "8px" : "0" }} className="py-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">
            <span className="text-gray-700">{node.subject || "(no subject)"}</span>
          </div>
          <div className="text-xs text-gray-500">
            From: {node.sender} • To: {node.receiver} • {node.created_at ? new Date(node.created_at).toLocaleString() : ""}
          </div>
          <div className="text-sm text-gray-800 mt-1">{node.body ? (node.body.length > 200 ? node.body.slice(0, 200) + "..." : node.body) : ""}</div>
        </div>
        {node.children && node.children.length > 0 && (
          <button onClick={() => setOpen(!open)} className="ml-4 px-2 py-1 text-sm border rounded">
            {open ? "Collapse" : `Replies (${node.children.length})`}
          </button>
        )}
      </div>

      {open && node.children && node.children.length > 0 && (
        <div className="mt-2">
          {node.children.map((child) => (
            <EmailNode key={child.email_id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClustersPage() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get("emails/emailcluster/") // matches backend route /emails/emailcluster/
      .then((res) => {
        // res.data expected shape: { clusters: [ { cluster_root: "...", threads: [ {...}, ... ] }, ... ] }
        setClusters(Array.isArray(res.data.clusters) ? res.data.clusters : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Cluster fetch error:", err);
        setError("Failed to load clusters: " + (err?.message || "unknown error"));
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading clusters...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Email Clusters / Threads</h1>
      {clusters.length === 0 ? (
        <p className="text-gray-500">No clusters found.</p>
      ) : (
        <div className="space-y-6">
          {clusters.map((cluster) => (
            <div key={cluster.cluster_root} className="bg-white shadow-sm p-4 rounded border">
              <div className="mb-2 text-sm text-gray-500">Cluster root: {cluster.cluster_root}</div>
              {cluster.threads.length === 0 ? (
                <p className="text-gray-500">No threads in this cluster.</p>
              ) : (
                cluster.threads.map((threadRoot) => (
                  <div key={threadRoot.email_id} className="mb-4">
                    <EmailNode node={threadRoot} depth={0} />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
