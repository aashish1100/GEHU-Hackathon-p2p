const dgram = require("dgram");
const fs = require("fs");
const path = require("path");
const os = require("os");

const udpSocket = dgram.createSocket("udp4");
let UDP_PORT = 41234;
const BROADCAST_ADDR = "255.255.255.255";
const DISCOVERY_INTERVAL = 5000;

const userNodes = [];
const chunkOwnership = {};

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
      const exists = userNodes.some(n => n.address === senderAddress);
      
      if (!exists && senderAddress !== getLocalIP()) {
        console.log(`[Discovery] Found peer: ${senderAddress}`);
        userNodes.push({
          address: senderAddress,
          port: data.port || UDP_PORT,
          lastSeen: Date.now()
        });
        broadcastPeerList();
      } else if (exists) {
        const node = userNodes.find(n => n.address === senderAddress);
        if (node) node.lastSeen = Date.now();
      }
    }
  } catch (e) {
    console.log('[Discovery] Error parsing discovery message:', e.message);
  }
}

function sendMessageToPeer(address, message) {
  console.log(`[UDP] Sending message to ${address}: ${message.slice(0, 50)}...`);
  const buffer = Buffer.from(message);
  udpSocket.send(buffer, 0, buffer.length, UDP_PORT, address, (err) => {
    if (err) console.error(`[UDP] Error sending to ${address}:, err`);
  });
}

function broadcastMessage(message) {
  console.log(`[UDP] Broadcasting message to LAN`);
  const buffer = Buffer.from(message);
  udpSocket.setBroadcast(true);
  udpSocket.send(buffer, 0, buffer.length, UDP_PORT, BROADCAST_ADDR, (err) => {
    if (err) console.error("[UDP] Broadcast error:", err);
  });
}

function broadcastPeerList() {
  const peerList = {
    type: "peerList",
    peers: userNodes.map(n => n.address)
  };
  broadcastMessage(JSON.stringify(peerList));
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

  // Step 1: Send file metadata
  const fileInfo = {
    type: "fileInfo",
    fileId,
    fileName,
    totalChunks,
    fileSize: fs.statSync(filePath).size
  };
  sendMessageToPeer(address, JSON.stringify(fileInfo));

  // Step 2: Assign chunks based on round-robin
  chunks.forEach((chunk, index) => {
    const assignedTo = userNodes.findIndex(p => p.address === address);
    if ((index % userNodes.length) === assignedTo) {
      setTimeout(() => {
        const chunkMsg = {
          type: "fileChunk",
          fileId,
          chunkIndex: index,
          chunk: chunk.toString("base64"),
          totalChunks
        };
        sendMessageToPeer(address, JSON.stringify(chunkMsg));

        if (!chunkOwnership[fileId]) chunkOwnership[fileId] = {};
        if (!chunkOwnership[fileId][index]) chunkOwnership[fileId][index] = [];
        chunkOwnership[fileId][index].push(getLocalIP());
      }, index * 20);
    }
  });
}

const receivedFiles = {};

function reconstructFile(fileId) {
  const file = receivedFiles[fileId];
  if (!file) return;

  const { fileName, chunks, totalChunks } = file;
  
  if (Object.keys(chunks).length === totalChunks) {
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
}

let textMessageHandler = null;

function onTextMessage(callback) {
  textMessageHandler = callback;
}

function redistributeChunks(fileId) {
  const file = receivedFiles[fileId];
  if (!file || !file.chunks) {
    console.log("No file or chunks found for redistribution");
    return;
  }

  const peers = getUserNodes();
  if (peers.length === 0) {
    console.log("No peers available for redistribution");
    return;
  }

  console.log(`Redistributing chunks of ${file.fileName} to ${peers.length} peers`);

  // Convert chunks object to array of {index, chunk} pairs
  const chunkEntries = Object.entries(file.chunks).map(([index, chunk]) => ({
    index: parseInt(index),
    chunk
  }));

  chunkEntries.forEach(({index, chunk}) => {
    // Select peer using round-robin
    const targetPeer = peers[index % peers.length];
    
    setTimeout(() => {
      const chunkMsg = {
        type: "fileChunk",
        fileId,
        chunkIndex: index,
        chunk: chunk.toString("base64"),
        totalChunks: file.totalChunks
      };
      
      console.log(`Redistributing chunk ${index} to ${targetPeer.address}`);
      sendMessageToPeer(targetPeer.address, JSON.stringify(chunkMsg));

      // Update ownership tracking
      if (!chunkOwnership[fileId]) chunkOwnership[fileId] = {};
      if (!chunkOwnership[fileId][index]) chunkOwnership[fileId][index] = [];
      
      // Add peer to ownership if not already present
      if (!chunkOwnership[fileId][index].includes(targetPeer.address)) {
        chunkOwnership[fileId][index].push(targetPeer.address);
      }
    }, index * 20); // Small delay between chunks
  });
}

function startListening() {
  return new Promise((resolve, reject) => {
    udpSocket.on('error', (err) => {
      console.error('[UDP] Socket error:', err);
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
          case "fileInfo":
            receivedFiles[data.fileId] = {
              fileName: data.fileName,
              totalChunks: data.totalChunks,
              chunks: {}
            };
            console.log(`[File] Receiving ${data.fileName} (${data.totalChunks} chunks)`);
            break;
            
            case "fileChunk":
              if (receivedFiles[data.fileId]) {
                const file = receivedFiles[data.fileId];
                // const receivedFiles = {}; // { fileId: { fileName, totalChunks, chunks: {index: buffer}, chunkOwners: {index: [peerAddresses]} } }
                // If chunk doesn't exist or is new from a different peer
                console.log("recived -> fileChunk",data.chunkIndex);
                if (!file.chunks[data.chunkIndex]) {
                   console.log("here 1");
                  // Store the chunk
                  file.chunks[data.chunkIndex] = Buffer.from(data.chunk, "base64");
                  
                  // Track which peers have this chunk
                  // if (!file.chunkOwners) file.chunkOwners = {};
                  // if (!file.chunkOwners[data.chunkIndex]) {
                  //   file.chunkOwners[data.chunkIndex] = [rinfo.address];
                  // } else if (!file.chunkOwners[data.chunkIndex].includes(rinfo.address)) {
                  //   file.chunkOwners[data.chunkIndex].push(rinfo.address);
                  // }
               
                  console.log("here 2");
                  redistributeChunks(data.fileId);
                  
                  const received = Object.keys(file.chunks).length;
                  console.log(`[File] Received chunk ${data.chunkIndex+1}/${data.totalChunks} of ${file.fileName}`);
                  
                  // If we have all chunks, redistribute them
                  if (received === data.totalChunks) {
                    reconstructFile(data.fileId);
                  }
                }
              }
              break;
            
          case "peerList":
            break;
            
          default:
            if (textMessageHandler) {
              textMessageHandler(msg.toString());
            }
        }
      } catch (e) {
        console.log(`[UDP] Raw message from ${rinfo.address}: ${msg.toString().slice(0, 50)}...`);
        if (textMessageHandler) {
          textMessageHandler(msg.toString());
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

function getUserNodes() {
  const now = Date.now();
  const activeNodes = userNodes.filter(n => now - n.lastSeen < 60000);
  if (activeNodes.length !== userNodes.length) {
    console.log(`[Discovery] Removed ${userNodes.length - activeNodes.length} stale nodes`);
    userNodes.length = 0;
    userNodes.push(...activeNodes);
  }
  return userNodes;
}

module.exports = {
  startListening,
  sendMessageToPeer,
  broadcastMessage,
  sendFile,
  getUserNodes,
  onTextMessage,
  UDP_PORT,
  getLocalIP
};