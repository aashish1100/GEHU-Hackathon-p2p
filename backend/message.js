const dgram = require("dgram");
const fs = require("fs");
const path = require("path");
const os = require("os");

const udpSocket = dgram.createSocket("udp4");
let UDP_PORT = 41234;
const BROADCAST_ADDR = "255.255.255.255";
const DISCOVERY_INTERVAL = 5000;
const NODE_TIMEOUT = 30000;

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

function splitFile(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const chunkSize = 1024;
  const chunks = [];
  for (let i = 0; i < fileBuffer.length; i += chunkSize) {
    chunks.push(fileBuffer.slice(i, i + chunkSize));
  }
  console.log(`[File] Split ${path.basename(filePath)} into ${chunks.length} chunks`);
  return chunks;
}

function sendFile(filePath, fileId, address) {
  const chunks = splitFile(filePath);
  const totalChunks = chunks.length;
  const fileName = path.basename(filePath);

  console.log(`[File] Sending ${fileName} (${totalChunks} chunks) to ${address}`);

  const fileInfo = {
    type: "fileInfo",
    fileId,
    fileName,
    totalChunks,
    fileSize: fs.statSync(filePath).size
  };
  sendMessageToPeer(address, JSON.stringify(fileInfo));

  chunks.forEach((chunk, index) => {
    setTimeout(() => {
      const chunkMsg = {
        type: "fileChunk",
        fileId,
        chunkIndex: index,
        chunk: chunk.toString("base64"),
        totalChunks
      };
      sendMessageToPeer(address, JSON.stringify(chunkMsg));
    }, index * 20);  // Stagger sending to avoid network congestion
  });
}

const receivedFiles = {};

function handleFileInfo(data) {
  const { fileId, fileName, totalChunks } = data;
  console.log(`[File] Receiving ${fileName} (${totalChunks} chunks)`);
  
  receivedFiles[fileId] = {
    fileName,
    totalChunks,
    chunks: {}
  };
}

function handleFileChunk(data) {
  const { fileId, chunkIndex, chunk, totalChunks } = data;
  
  if (!receivedFiles[fileId]) {
    console.log(`[File] Received chunk for unknown file ${fileId}`);
    return;
  }
  
  receivedFiles[fileId].chunks[chunkIndex] = Buffer.from(chunk, "base64");
  const received = Object.keys(receivedFiles[fileId].chunks).length;
  console.log(`[File] Received chunk ${chunkIndex+1}/${totalChunks} of ${receivedFiles[fileId].fileName}`);
  
  if (received === totalChunks) {
    reconstructFile(fileId);
  }
}

function reconstructFile(fileId) {
  const file = receivedFiles[fileId];
  if (!file) return;

  const { fileName, chunks, totalChunks } = file;
  
  if (Object.keys(chunks).length !== totalChunks) {
    console.log(`[File] Cannot reconstruct ${fileName}, missing chunks`);
    return;
  }
  
  console.log(`[File] Reconstructing ${fileName} (${totalChunks} chunks)`);
  
  const chunkArray = [];
  for (let i = 0; i < totalChunks; i++) {
    chunkArray.push(chunks[i]);
  }
  const fileBuffer = Buffer.concat(chunkArray);
  
  if (!fs.existsSync("received_files")) {
    fs.mkdirSync("received_files");
  }
  
  const outputPath = path.join("received_files", fileName);
  fs.writeFileSync(outputPath, fileBuffer);
  console.log(`[File] Saved as ${outputPath}`);
  
  delete receivedFiles[fileId];
}

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
            handleFileInfo(data);
            break;
          case "fileChunk":
            handleFileChunk(data);
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