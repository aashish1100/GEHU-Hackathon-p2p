const express = require("express");
const cors = require("cors");
const multer = require("multer");
const http = require("http");
const WebSocket = require("ws");
const {
  sendMessageToPeer,
  startListening,
  sendFile,
  getUserNodes,
  updateUserNodes,
  onTextMessage,
  broadcastMessage,
  UDP_PORT,
  getLocalIP,
  setPort,
} = require("./message");

const definedLab = {
  "Lab-1": 41234,
  "Lab-2": 60347,
  "Lab-3": 52718,
  "Lab-4": 49177,
  "Lab-5": 60000,
};

const app = express();
const PORT = 3000;
const upload = multer({ dest: "uploads/" });

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const wsClients = new Set();

wss.on("connection", (ws) => {
  console.log("[WebSocket] New client connected");
  wsClients.add(ws);

  ws.on('message', (message) => {
    console.log(`[WebSocket] Received message: ${message}`);
    
    // Broadcast to other peers via UDP
    broadcastMessage(message.toString());
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log("[WebSocket] Client disconnected");
  });

  // Send initial peer list
  ws.send(JSON.stringify({
    type: "peerList",
    peers: getUserNodes().map(n => n.address)
  }));
});

onTextMessage((msg, rinfo) => {
  const localIP = getLocalIP();
  if (rinfo.address === localIP) {
    console.log(`[UDP] Ignoring self message: ${msg}`);
    return;
  }

  console.log(`[UDP] Forwarding message from ${rinfo.address}: ${msg}`);
  const messageData = {
    type: 'message',
    content: msg,
    sender: rinfo.address
  };
  
  wsClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(messageData));
    }
  });
});

async function initializeServer() {
  try {
    await startListening();
    
    server.listen(PORT, () => {
      console.log(`[Server] HTTP server running at http://localhost:${PORT}`);
      console.log(`[Server] WebSocket server ready`);
      console.log(`[Server] UDP listening on port ${UDP_PORT}`);
      
      setInterval(() => {
        const now = Date.now();
        const activeNodes = getUserNodes().filter(n => now - n.lastSeen < 30000);
        const currentNodes = getUserNodes();
        
        // Cleanup stale nodes
        if (activeNodes.length !== currentNodes.length) {
          console.log(`[Discovery] Removed ${currentNodes.length - activeNodes.length} stale nodes`);
          // Update the nodes list in message.js module
          updateUserNodes(activeNodes);
        }

        // Broadcast updated peer list to all clients
        const peerList = {
          type: "peerList",
          peers: activeNodes.map(n => n.address)
        };
        wsClients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(peerList));
          }
        });
      }, 15000);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

function sendFileToPeers(filePath) {
  const fileId = Date.now().toString();
  const peers = getUserNodes();
  console.log(`[File] Sending file to ${peers.length} peers`);
  peers.forEach((peer) => {
    console.log(`[File] Sending to peer: ${peer.address}`);
    sendFile(filePath, fileId, peer.address);
  });
}

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    console.log("[File] No file received in upload");
    return res.status(400).send("No file uploaded");
  }
  console.log(`[File] Received file: ${req.file.originalname}`);
  const filePath = req.file.path;
  sendFileToPeers(filePath);
  res.json({ 
    message: "File uploaded successfully", 
    filePath: filePath,
    peers: getUserNodes().length
  });
});

app.post("/setPort",(req,res)=>
  {
    const {lab}=req.body;
    console.log(lab);
  
    setPort(definedLab[lab]);
    console.log(definedLab[lab])
  
    res.send("Port sended");
  
  })

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

initializeServer();