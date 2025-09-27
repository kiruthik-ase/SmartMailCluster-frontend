import { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../api/api';

function GraphPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('graph/')
      .then(res => {
        const { adjList, threadGraph } = res.data;
        const graphNodes = [];
        const graphEdges = [];
        let nodeId = 0;
        const addedNodes = new Set();

        // Process adjList (sender -> receiver)
        for (const from in adjList) {
          if (!addedNodes.has(from)) {
            graphNodes.push({ id: from, data: { label: from }, position: { x: Math.random() * 600, y: Math.random() * 400 } });
            addedNodes.add(from);
          }
          adjList[from].forEach(edge => {
            if (!addedNodes.has(edge.to)) {
              graphNodes.push({ id: edge.to, data: { label: edge.to }, position: { x: Math.random() * 600, y: Math.random() * 400 } });
              addedNodes.add(edge.to);
            }
            graphEdges.push({ id: `e${nodeId++}`, source: from, target: edge.to, label: `Weight: ${edge.weight}, Thread: ${edge.thread_id}`, type: 'simplebezier' });
          });
        }

        setNodes(graphNodes);
        setEdges(graphEdges);
        setLoading(false);
      })
      .catch(err => {
        console.error('Graph endpoint error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading graph...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Email Graph Visualization</h2>
      <div style={{ height: '500px', width: '100%' }}>
        <ReactFlow nodes={nodes} edges={edges}>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default GraphPage;