import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaNetworkWired,
  FaEye,
  FaShieldAlt,
  FaCode,
  FaUsers,
  FaBolt,
  FaSkull,
  FaGhost,
  FaLock,
  FaFire
} from 'react-icons/fa';

const NetworkMap = ({ shadowProfile, onBack }) => {
  const [activeNodes, setActiveNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [scanMode, setScanMode] = useState('passive');
  const [traceTarget, setTraceTarget] = useState('');

  useEffect(() => {
    generateNetworkData();
    const interval = setInterval(generateNetworkData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const generateNetworkData = () => {
    // Generate mock network nodes
    const nodes = [
      {
        id: 'node_001',
        shadowId: 'PHANTOM_BLADE_777',
        zone: 'MASKED_ARENA',
        status: 'active',
        maskLevel: 5,
        position: { x: 20, y: 30 },
        connections: ['node_003', 'node_007'],
        activity: 'battling',
        threat: 'low'
      },
      {
        id: 'node_002',
        shadowId: 'CIPHER_MASTER_X',
        zone: 'CIPHER_BOARD',
        status: 'active',
        maskLevel: 8,
        position: { x: 60, y: 20 },
        connections: ['node_004', 'node_006'],
        activity: 'solving',
        threat: 'medium'
      },
      {
        id: 'node_003',
        shadowId: 'VOID_HUNTER_123',
        zone: 'WHISPER_NET',
        status: 'idle',
        maskLevel: 3,
        position: { x: 40, y: 60 },
        connections: ['node_001', 'node_005'],
        activity: 'listening',
        threat: 'low'
      },
      {
        id: 'node_004',
        shadowId: 'GHOST_PROTOCOL_7',
        zone: 'SQUAD_FORGE',
        status: 'hidden',
        maskLevel: 7,
        position: { x: 80, y: 50 },
        connections: ['node_002'],
        activity: 'recruiting',
        threat: 'high'
      },
      {
        id: 'node_005',
        shadowId: 'NEON_STORM_666',
        zone: 'NETWORK_MAP',
        status: 'scanning',
        maskLevel: 4,
        position: { x: 30, y: 80 },
        connections: ['node_003', 'node_006'],
        activity: 'mapping',
        threat: 'medium'
      },
      {
        id: 'node_006',
        shadowId: 'SHADOW_WEAVER_99',
        zone: 'VOID_CHAMBER',
        status: 'classified',
        maskLevel: 10,
        position: { x: 70, y: 70 },
        connections: ['node_002', 'node_005'],
        activity: 'unknown',
        threat: 'extreme'
      },
      {
        id: 'node_007',
        shadowId: shadowProfile?.shadowId || 'UNKNOWN',
        zone: 'NETWORK_MAP',
        status: 'active',
        maskLevel: shadowProfile?.maskLevel || 1,
        position: { x: 50, y: 40 },
        connections: ['node_001'],
        activity: 'observing',
        threat: 'none',
        isUser: true
      }
    ];

    setActiveNodes(nodes);
    
    // Generate connections
    const connectionLines = [];
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (target) {
          connectionLines.push({
            from: node.position,
            to: target.position,
            strength: Math.random() * 100,
            encrypted: Math.random() > 0.5
          });
        }
      });
    });
    
    setConnections(connectionLines);
  };

  const getNodeColor = (node) => {
    if (node.isUser) return 'text-cyan-400 border-cyan-400';
    
    switch (node.threat) {
      case 'extreme': return 'text-red-500 border-red-500';
      case 'high': return 'text-orange-400 border-orange-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return FaEye;
      case 'idle': return FaBolt;
      case 'hidden': return FaGhost;
      case 'scanning': return FaNetworkWired;
      case 'classified': return FaLock;
      default: return FaSkull;
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleTrace = () => {
    if (!traceTarget) return;
    
    const target = activeNodes.find(n => 
      n.shadowId.toLowerCase().includes(traceTarget.toLowerCase())
    );
    
    if (target) {
      setSelectedNode(target);
      setTraceTarget('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-green-400/30 bg-black/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-green-400 hover:text-cyan-400 transition-colors"
            >
              ← BACK
            </button>
            <div>
              <h1 className="text-2xl font-bold text-green-400 flex items-center">
                <FaNetworkWired className="mr-3" />
                SHADOW NETWORK MAP
              </h1>
              <p className="text-sm text-gray-400">Real-time shadow activity monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={scanMode}
              onChange={(e) => setScanMode(e.target.value)}
              className="bg-black border border-green-400/30 text-green-400 px-3 py-1 rounded"
            >
              <option value="passive">Passive Scan</option>
              <option value="active">Active Scan</option>
              <option value="deep">Deep Scan</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={traceTarget}
                onChange={(e) => setTraceTarget(e.target.value)}
                placeholder="Trace shadow..."
                className="bg-black border border-green-400/30 text-green-400 px-3 py-1 rounded text-sm"
              />
              <button
                onClick={handleTrace}
                className="bg-green-400/20 border border-green-400 text-green-400 px-3 py-1 rounded hover:bg-green-400/30 transition-colors"
              >
                TRACE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="relative flex-1 p-6">
        <div className="relative w-full h-full bg-black/30 rounded-lg border border-green-400/30 overflow-hidden">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full">
            {connections.map((conn, index) => (
              <motion.line
                key={index}
                x1={`${conn.from.x}%`}
                y1={`${conn.from.y}%`}
                x2={`${conn.to.x}%`}
                y2={`${conn.to.y}%`}
                stroke={conn.encrypted ? '#10B981' : '#6B7280'}
                strokeWidth="1"
                strokeDasharray={conn.encrypted ? "5,5" : "none"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: index * 0.1 }}
              />
            ))}
          </svg>

          {/* Network Nodes */}
          {activeNodes.map((node) => {
            const StatusIcon = getStatusIcon(node.status);
            return (
              <motion.div
                key={node.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${getNodeColor(node)}`}
                style={{
                  left: `${node.position.x}%`,
                  top: `${node.position.y}%`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.2 }}
                onClick={() => handleNodeClick(node)}
              >
                <div className={`w-12 h-12 rounded-full border-2 ${getNodeColor(node)} bg-black/80 flex items-center justify-center relative`}>
                  <StatusIcon className="text-lg" />
                  
                  {/* Pulse animation for active nodes */}
                  {node.status === 'active' && (
                    <div className={`absolute inset-0 rounded-full border-2 ${getNodeColor(node)} animate-ping`}></div>
                  )}
                  
                  {/* Mask level indicator */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-black border border-current rounded-full flex items-center justify-center text-xs">
                    {node.maskLevel}
                  </div>
                </div>
                
                <div className="text-xs text-center mt-2 max-w-20 truncate">
                  {node.shadowId}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Node Details Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute top-0 right-0 w-80 h-full bg-black/90 border-l border-green-400/30 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-green-400">NODE DETAILS</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-green-400 hover:text-red-400"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-gray-400">Shadow ID</div>
                  <div className="text-green-400 font-bold">{selectedNode.shadowId}</div>
                </div>

                <div>
                  <div className="text-gray-400">Current Zone</div>
                  <div className="text-cyan-400">{selectedNode.zone}</div>
                </div>

                <div>
                  <div className="text-gray-400">Status</div>
                  <div className={`${getNodeColor(selectedNode)} font-bold`}>
                    {selectedNode.status.toUpperCase()}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400">Activity</div>
                  <div className="text-green-400">{selectedNode.activity}</div>
                </div>

                <div>
                  <div className="text-gray-400">Mask Level</div>
                  <div className="text-yellow-400 font-bold">{selectedNode.maskLevel}</div>
                </div>

                <div>
                  <div className="text-gray-400">Threat Level</div>
                  <div className={`${getNodeColor(selectedNode)} font-bold`}>
                    {selectedNode.threat.toUpperCase()}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400">Connections</div>
                  <div className="text-green-400">{selectedNode.connections.length} active</div>
                </div>

                {selectedNode.isUser && (
                  <div className="mt-6 p-3 border border-cyan-400/30 rounded bg-cyan-400/10">
                    <div className="text-cyan-400 font-bold text-center">
                      🔍 THIS IS YOU
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="border-t border-green-400/30 bg-black/50 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div>Nodes: <span className="text-green-400 font-bold">{activeNodes.length}</span></div>
            <div>Connections: <span className="text-green-400 font-bold">{connections.length}</span></div>
            <div>Scan Mode: <span className="text-cyan-400 font-bold">{scanMode.toUpperCase()}</span></div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>LIVE</span>
            </div>
            <div className="text-gray-400">
              Last Update: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;
