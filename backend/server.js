const express = require("express");
const cors = require("cors");
const multer = require("multer");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const {
  sendMessageToPeer,
  startListening,
  sendFile,
  getUserNodes,
  updateUserNodes,
  onTextMessage,
  broadcastMessage,
  UDP_PORT,
  getLocalIP
} = require("./message");

const app = express();
const PORT = 3000;

// Configure multer for file uploads with original filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Keep original filename
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(cors({
  origin: "http://localhost:5173", // Frontend dev server
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
app.use(express.static("public"));
app.use("/received_files", express.static("received_files"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const wsClients = new Set();

wss.on("connection", (ws) => {
  console.log("[WebSocket] New client connected");
  wsClients.add(ws);

  // Set up ping interval for this connection
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on('message', (message) => {
    console.log(`[WebSocket] Received message: ${message}`);
    
    // Broadcast to other peers via UDP
    broadcastMessage(message.toString());
    
    // Immediately send back to sender with 'me' identifier
    const messageData = {
      type: 'message',
      content: message.toString(),
      sender: 'me',
      timestamp: Date.now()
    };
    ws.send(JSON.stringify(messageData));
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    clearInterval(pingInterval);
    console.log("[WebSocket] Client disconnected");
  });

  // Handle error
  ws.on('error', (error) => {
    console.log("[WebSocket] Error:", error);
    wsClients.delete(ws);
    clearInterval(pingInterval);
  });

  // Send initial peer list
  ws.send(JSON.stringify({
    type: "peerList",
    peers: getUserNodes().map(n => n.address),
    yourAddress: getLocalIP()
  }));
  
  // Send list of available files
  sendAvailableFiles(ws);
});

function sendAvailableFiles(ws) {
  try {
    const dirs = ["uploads", "received_files"];
    let files = [];
    
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        const items = fs.readdirSync(dir)
          .filter(file => !file.startsWith('.'))
          .map(file => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            return {
              name: file,
              path: filePath,
              size: stats.size,
              location: dir,
              type: path.extname(file).slice(1),
              lastModified: stats.mtime
            };
          });
        files = [...files, ...items];
      }
    }
    
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "fileList",
        files: files
      }));
    }
  } catch (err) {
    console.error("[Server] Error getting file list:", err);
  }
}

function broadcastFileList() {
  wsClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      sendAvailableFiles(ws);
    }
  });
}

// Handle incoming messages from the UDP network
onTextMessage((msg, rinfo) => {
  const localIP = getLocalIP();
  if (rinfo.address === localIP) {
    console.log(`[UDP] Ignoring self message: ${msg}`);
    return;
  }

  console.log(`[UDP] Forwarding message from ${rinfo.address}`);
  
  try {
    // Try to parse as JSON to detect file transfer completion
    const data = JSON.parse(msg);
    
    // If this was a file completion notification, update the file list
    if (data.type === "fileCompleted") {
      setTimeout(broadcastFileList, 500); // Give time for file to be saved
      
      // Also notify all WebSocket clients about the completed file
      wsClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'notification',
            content: `${data.fileName} was received from peer ${rinfo.address}`,
            level: 'success'
          }));
        }
      });
    }
  } catch (e) {
    // Not JSON or other error, treat as regular message
  }
  
  // Forward the message to all WebSocket clients
  const messageData = {
    type: 'message',
    content: msg.toString(),
    sender: rinfo.address,
    timestamp: Date.now()
  };
  
  wsClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(messageData));
    }
  });
});

async function initializeServer() {
  try {
    // Create required directories
    ["uploads", "received_files"].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    });
    
    // Start UDP networking
    await startListening();
    
    server.listen(PORT, () => {
      console.log(`[Server] HTTP server running at http://localhost:${PORT}`);
      console.log(`[Server] WebSocket server ready`);
      console.log(`[Server] UDP listening on port ${UDP_PORT}`);
      console.log(`[Server] Your IP address: ${getLocalIP()}`);
      
      // Set up periodic peer list updates
      setInterval(() => {
        const now = Date.now();
        const activeNodes = getUserNodes().filter(n => now - n.lastSeen < 30000);
        const currentNodes = getUserNodes();
        
        // Cleanup stale nodes
        if (activeNodes.length !== currentNodes.length) {
          console.log(`[Discovery] Removed ${currentNodes.length - activeNodes.length} stale nodes`);
          updateUserNodes(activeNodes);
        }

        // Broadcast updated peer list to all WebSocket clients
        const peerList = {
          type: "peerList",
          peers: activeNodes.map(n => n.address),
          yourAddress: getLocalIP()
        };
        
        wsClients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(peerList));
          }
        });
      }, 15000);
      
      // Periodically update file list
      setInterval(broadcastFileList, 60000);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Sends a file to all connected peers
function sendFileToPeers(filePath) {
  const fileId = Date.now().toString();
  const peers = getUserNodes();
  
  if (peers.length === 0) {
    console.log(`[File] No peers to send file to`);
    return { sent: false, reason: "No peers available" };
  }
  
  console.log(`[File] Sending file to ${peers.length} peers`);
  
  // Different distribution strategies:
  // 1. Send full file to all peers
  peers.forEach((peer) => {
    console.log(`[File] Sending to peer: ${peer.address}`);
    sendFile(filePath, fileId, peer.address);
  });
  
  return { 
    sent: true, 
    peers: peers.length,
    fileId: fileId
  };
}

// API endpoints
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    console.log("[File] No file received in upload");
    return res.status(400).send("No file uploaded");
  }
  console.log(`[File] Received file: ${req.file.originalname} (${req.file.size} bytes)`);
  
  const filePath = req.file.path;
  const result = sendFileToPeers(filePath);
  
  if (result.sent) {
    // Notify WebSocket clients about the new file
    wsClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        sendAvailableFiles(ws);
      }
    });
    
    res.json({ 
      message: "File uploaded successfully", 
      filePath: filePath,
      originalName: req.file.originalname,
      peers: result.peers,
      fileId: result.fileId
    });
  } else {
    res.json({
      message: "File uploaded but not shared",
      reason: result.reason,
      filePath: filePath
    });
  }
});

app.post("/broadcast", (req, res) => {
  const { message } = req.body;
  if (!message) {
    console.log("[Broadcast] No message provided");
    return res.status(400).send("Message is required");
  }

  console.log(`[Broadcast] Broadcasting message: "${message}"`);
  const peers = getUserNodes();
  console.log(`[Broadcast] Sending to ${peers.length} peers`);
  
  peers.forEach((node) => {
    console.log(`[Broadcast] Sending to peer: ${node.address}`);
    sendMessageToPeer(node.address, message);
  });

  res.json({
    message: "Message broadcasted",
    peers: peers.length
  });
});

app.get("/share/:filename", (req, res) => {
  const { filename } = req.params;
  const directories = ["uploads", "received_files"];
  
  // Find the file in available directories
  let filePath = null;
  for (const dir of directories) {
    const potentialPath = path.join(dir, filename);
    if (fs.existsSync(potentialPath)) {
      filePath = potentialPath;
      break;
    }
  }
  
  if (!filePath) {
    return res.status(404).send("File not found");
  }
  
  // Send the file to peers
  const result = sendFileToPeers(filePath);
  
  res.json({
    message: "File shared with peers",
    filename: filename,
    peers: result.peers,
    fileId: result.fileId
  });
});

// Initialize the server
initializeServer().catch(err => {
  console.error("Failed to initialize server:", err);
  process.exit(1);
});