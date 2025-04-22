const express = require("express");
const multer = require("multer");
const { sendMessageToPeer, startListening, sendFile } = require("./message");
const Discover = require("node-discover");

const app = express();
const PORT = 3000;
const upload = multer({ dest: "uploads/" });
app.use(express.json());
app.use(express.static("public"));

const userNodes = [];
const d = new Discover();
startListening();

d.on("added", (node) => {
  const exists = userNodes.some((n) => n.address === node.address && n.port === node.port);
  if (!exists){
    console.log("added",node.address);
    userNodes.push(node);}
});



function sendFileToPeers(filePath) {
  const fileId = Date.now().toString();
  userNodes.forEach((peer) => {
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
  console.log(message)  
  userNodes.forEach((node) => {
    console.log("sending->" ,node.address)
    sendMessageToPeer(node.address, message);
  });
  res.send("Message sent to all peers");
});

sendMessageToPeer("172.21.8.92","asdf");

app.listen(PORT, () => {
  console.log(`erver running at http://localhost:${PORT}`);
});