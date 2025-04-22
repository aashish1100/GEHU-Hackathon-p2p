const dgram = require("dgram");
const fs = require("fs");
const path = require("path");
const os = require("os");

const udpSocket = dgram.createSocket("udp4");
let UDP_PORT = 41234;
const BROADCAST_ADDR = "255.255.255.255";
const DISCOVERY_INTERVAL = 5000;
const NODE_TIMEOUT = 30000; // 30 seconds timeout

const userNodes = [];

function getBestInterface() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && 
          !iface.internal && 
          !name.startsWith('docker') && 
          !name.startsWith('vmnet') &&
          !name.startsWith('veth')) {
        return iface;
      }
    }
  }
  return null;
}

function getLocalIP() {
  const iface = getBestInterface();
  return iface ? iface.address : '127.0.0.1';
}

function discoverPeers() {
  const discoveryMsg = {
    type: 'discovery',
    action: 'hello',
    address: getLocalIP(),
    port: UDP_PORT,
    timestamp: Date.now()
  };
  broadcastMessage(JSON.stringify(discoveryMsg));
}

function handleDiscoveryMessage(msg, rinfo) {
  try {
    const data = JSON.parse(msg.toString());
    if (data.type === 'discovery' && data.action === 'hello') {
      const senderAddress = rinfo.address;
      const existingNode = userNodes.find(n => n.address === senderAddress);
      
      if (senderAddress === getLocalIP()) return;

      if (!existingNode) {
        console.log(`[Discovery] New peer: ${senderAddress}`);
        userNodes.push({
          address: senderAddress,
          port: data.port || UDP_PORT,
          lastSeen: Date.now()
        });
        broadcastPeerList();
      } else {
        existingNode.lastSeen = Date.now();
      }
    }
  } catch (e) {
    console.log('[Discovery] Error parsing message:', e.message);
  }
}

function updateUserNodes(nodes) {
  userNodes.length = 0;
  userNodes.push(...nodes);
}

function sendMessageToPeer(address, message) {
  const buffer = Buffer.from(message);
  udpSocket.send(buffer, 0, buffer.length, UDP_PORT, address, (err) => {
    if (err) console.error(`[UDP] Send error to ${address}:`, err);
  });
}

function broadcastMessage(message) {
  const buffer = Buffer.from(message);
  udpSocket.setBroadcast(true);
  udpSocket.send(buffer, 0, buffer.length, UDP_PORT, BROADCAST_ADDR);
}

function broadcastPeerList() {
  const peerList = {
    type: "peerList",
    peers: getUserNodes().map(n => n.address)
  };
  broadcastMessage(JSON.stringify(peerList));
}

function handlePeerListMessage(peers) {
  const now = Date.now();
  peers.forEach(address => {
    const existingNode = userNodes.find(n => n.address === address);
    if (!existingNode && address !== getLocalIP()) {
      userNodes.push({
        address: address,
        port: UDP_PORT,
        lastSeen: now
      });
    } else if (existingNode) {
      existingNode.lastSeen = now;
    }
  });
}

function getUserNodes() {
  const now = Date.now();
  const activeNodes = userNodes.filter(n => now - n.lastSeen < NODE_TIMEOUT);
  
  if (activeNodes.length !== userNodes.length) {
    console.log(`[Cleanup] Removed ${userNodes.length - activeNodes.length} stale nodes`);
    updateUserNodes(activeNodes);
  }
  
  return activeNodes;
}

// File transfer functions remain the same
function splitFile(filePath) { /* ... */ }
function sendFile(filePath, fileId, address) { /* ... */ }
const receivedFiles = {};
function reconstructFile(fileId) { /* ... */ }

// Message handling
let textMessageHandler = null;
function onTextMessage(callback) {
  textMessageHandler = callback;
}

function startListening() {
  return new Promise((resolve, reject) => {
    udpSocket.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[UDP] Port ${UDP_PORT} in use, trying ${UDP_PORT + 1}`);
        udpSocket.close();
        UDP_PORT += 1;
        startListening().then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });

    udpSocket.on('message', (msg, rinfo) => {
      try {
        const data = JSON.parse(msg.toString());
        
        if (data.type === 'discovery') {
          handleDiscoveryMessage(msg, rinfo);
          return;
        }
        
        switch (data.type) {
          case "peerList":
            handlePeerListMessage(data.peers);
            break;
          case "fileInfo":
            // Handle file info
            break;
          case "fileChunk":
            // Handle file chunks
            break;
          default:
            if (textMessageHandler) {
              textMessageHandler(msg.toString(), rinfo);
            }
        }
      } catch (e) {
        if (textMessageHandler) {
          textMessageHandler(msg.toString(), rinfo);
        }
      }
    });

    udpSocket.bind(UDP_PORT, () => {
      console.log(`[UDP] Listening on port ${UDP_PORT}`);
      udpSocket.setBroadcast(true);
      setInterval(discoverPeers, DISCOVERY_INTERVAL);
      discoverPeers();
      resolve();
    });
  });
}

module.exports = {
  startListening,
  sendMessageToPeer,
  broadcastMessage,
  sendFile,
  getUserNodes,
  updateUserNodes,
  onTextMessage,
  UDP_PORT,
  getLocalIP
};