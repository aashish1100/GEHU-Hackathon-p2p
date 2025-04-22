const express = require("express");
const cors = require("cors");
const multer = require("multer");
const {
  sendMessageToPeer,
  startListening,
  sendFile,
  getUserNodes
} = require("./message");

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

startListening();

function sendFileToPeers(filePath) {
  const fileId = Date.now().toString();
  const peers = getUserNodes();
  peers.forEach((peer) => {
    sendFile(filePath, fileId, peer.address);
  });
}

app.post("/upload", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  sendFileToPeers(filePath);
  res.json({ message: "File uploaded successfully", filePath: filePath });
});

app.post("/broadcast", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).send("Message is required");

  console.log("Broadcasting message:", message);
  const peers = getUserNodes();
  peers.forEach((node) => {
    console.log("Sending to ->", node.address);
    sendMessageToPeer(node.address, message);
  });

  res.send("Message sent to all peers");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});